import { domainToASCII } from 'node:url';
import https from 'node:https';
import { TLSSocket } from 'node:tls';
import ipaddr from 'ipaddr.js';
import { ToolFailure } from './errors.js';
import { safeCode } from './errors.js';
import { withAdmin } from './admin.js';

export function domain(value: string): string {
  const name = domainToASCII(value.toLowerCase().replace(/\.$/, ''));
  if (!name || name.length > 253 || ipaddr.isValid(name) || name.split('.').length < 2 || !name.split('.').every(l => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(l)) || /\.(?:localhost|local|internal|test|invalid|onion)$/.test(name)) throw new ToolFailure('invalid_public_domain');
  return name;
}
export function publicAddress(address: string): boolean {
  try {
    const parsed = ipaddr.parse(address);
    if (parsed.kind() === 'ipv6' && (parsed as ipaddr.IPv6).isIPv4MappedAddress()) return false;
    return parsed.range() === 'unicast';
  } catch { return false; }
}
export type DnsAnswer = { name: string; type: number; TTL: number; data: string };
export type DnsResult = { Status: number; AD?: boolean; Answer?: DnsAnswer[] };
export async function dns(name: string, type: string, signal: AbortSignal): Promise<DnsResult> {
  const url = new URL('https://dns.google/resolve');
  url.searchParams.set('name', name); url.searchParams.set('type', type);
  url.searchParams.set('edns_client_subnet', '0.0.0.0/0');
  const response = await fetch(url, { signal, redirect: 'error' });
  if (!response.ok) throw new ToolFailure('dns_upstream_unavailable');
  const reader = response.body!.getReader();
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 65536) { await reader.cancel(); throw new ToolFailure('dns_response_too_large'); } chunks.push(value); }
  const result = JSON.parse(Buffer.concat(chunks).toString()) as DnsResult;
  if (!Number.isInteger(result.Status) || (result.Answer && !Array.isArray(result.Answer))) throw new ToolFailure('dns_invalid_response');
  return result;
}
export async function lookupDns(name: string, type: string, resolver = dns, signal = AbortSignal.timeout(10000)) {
  const result = await resolver(domain(name), type, signal);
  return { domain: domain(name), type, status: result.Status, dnssecValidated: !!result.AD, answers: result.Answer || [], observedAt: new Date().toISOString(), resolver: 'Google Public DNS' };
}
export async function checkEmail(name: string, resolver = dns, signal = AbortSignal.timeout(10000)) {
  const host = domain(name);
  const [mx, txt, dmarc] = await Promise.all([resolver(host, 'MX', signal), resolver(host, 'TXT', signal), resolver(`_dmarc.${host}`, 'TXT', signal)]);
  const observations = [
    { check: 'MX', status: mx.Status, records: (mx.Answer || []).filter(a => a.type === 15).map(a => a.data) },
    { check: 'SPF', status: txt.Status, records: (txt.Answer || []).filter(a => a.type === 16 && /^"?v=spf1(?:\s|$)/i.test(a.data)).map(a => a.data) },
    { check: 'DMARC', status: dmarc.Status, records: (dmarc.Answer || []).filter(a => a.type === 16 && /^"?v=DMARC1(?:;|\s|$)/i.test(a.data)).map(a => a.data) }
  ];
  return { domain: host, observations, observedAt: new Date().toISOString(), note: 'DNS observations only. No SPF include expansion, organizational-domain fallback, DKIM selector discovery, or deliverability guarantee.' };
}
export async function resolvePublic(host: string, resolver = dns, signal = AbortSignal.timeout(10000)) {
  const replies = await Promise.all([resolver(domain(host), 'A', signal), resolver(domain(host), 'AAAA', signal)]);
  if (replies.some(r => ![0, 3].includes(r.Status))) throw new ToolFailure('dns_resolution_failed');
  const addresses = replies.flatMap(r => r.Answer || []).filter(a => [1, 28].includes(a.type)).map(a => a.data);
  if (!addresses.length) throw new ToolFailure('dns_no_address');
  if (addresses.some(a => !publicAddress(a))) throw new ToolFailure('non_public_target');
  return addresses[0];
}
type Hop = { status: number; location?: string; certificate: Record<string, unknown>; headers?: Record<string, string> };
export function requestPinned(url: URL, address: string, signal: AbortSignal, method = 'HEAD'): Promise<Hop> {
  return new Promise((resolve, reject) => {
    const request = https.request(url, {
      method, signal, agent: false, rejectUnauthorized: true, servername: url.hostname,
      headers: { 'user-agent': 'OldWeb-MCP-Diagnostics/1.0', accept: '*/*' },
      maxHeaderSize: 16384,
      lookup: ((_name: string, options: { all?: boolean }, callback: (...args: unknown[]) => void) => {
        const family = ipaddr.parse(address).kind() === 'ipv4' ? 4 : 6;
        if (options.all) callback(null, [{ address, family }]); else callback(null, address, family);
      }) as any
    }, response => {
      const socket = response.socket as TLSSocket;
      const cert = socket.getPeerCertificate();
      const result: Hop = { status: response.statusCode || 0, location: response.headers.location,
        headers: Object.fromEntries(['strict-transport-security', 'content-security-policy', 'x-content-type-options', 'content-type'].flatMap(k => typeof response.headers[k] === 'string' ? [[k, (response.headers[k] as string).slice(0, 1000)]] : [])),
        certificate: { authorized: socket.authorized, subject: cert.subject?.CN, issuer: cert.issuer?.CN, validFrom: cert.valid_from, validTo: cert.valid_to, fingerprint256: cert.fingerprint256, protocol: socket.getProtocol() } };
      response.destroy(); resolve(result);
    });
    request.on('error', (error: NodeJS.ErrnoException) => {
      const code = /CERT|TLS|SSL/.test(error.code || '') ? 'tls_validation_failed' : signal.aborted ? 'diagnostic_timeout' : 'https_connection_failed';
      reject(new ToolFailure(code));
    });
    request.end();
  });
}
export async function checkHttps(name: string, dependencies: { resolve?: typeof resolvePublic; request?: typeof requestPinned } = {}, signal = AbortSignal.timeout(10000)) {
  let url = new URL(`https://${domain(name)}/`);
  const hops: Record<string, unknown>[] = [];
  const seen = new Set<string>();
  for (let index = 0; index <= 3; index++) {
    if (url.protocol !== 'https:' || (url.port && url.port !== '443') || url.username || url.password) throw new ToolFailure('unsupported_redirect');
    domain(url.hostname);
    if (seen.has(url.href)) throw new ToolFailure('redirect_loop');
    seen.add(url.href);
    const address = await (dependencies.resolve || resolvePublic)(url.hostname, dns, signal);
    if (!publicAddress(address)) throw new ToolFailure('non_public_target');
    let hop = await (dependencies.request || requestPinned)(url, address, signal);
    if (hop.status === 405) hop = await (dependencies.request || requestPinned)(url, address, signal, 'GET');
    hops.push({ url: url.href, status: hop.status, certificate: hop.certificate, headers: hop.headers || {} });
    if (![301, 302, 303, 307, 308].includes(hop.status) || !hop.location) return { hops, observedAt: new Date().toISOString() };
    if (index === 3) throw new ToolFailure('too_many_redirects');
    try { url = new URL(hop.location, url); } catch { throw new ToolFailure('invalid_redirect'); }
  }
  throw new ToolFailure('too_many_redirects');
}
export async function deploymentReadiness(name: string, dependencies: { resolver?: typeof dns; resolve?: typeof resolvePublic; request?: typeof requestPinned } = {}) {
  const host = domain(name), signal = AbortSignal.timeout(10000);
  const tasks = await Promise.allSettled([lookupDns(host, 'A', dependencies.resolver || dns, signal), lookupDns(host, 'AAAA', dependencies.resolver || dns, signal), checkEmail(host, dependencies.resolver || dns, signal), checkHttps(host, dependencies, signal)]);
  const checks = tasks.map((t, i) => ({ check: ['A', 'AAAA', 'email_dns', 'https'][i], outcome: t.status === 'fulfilled' ? 'observed' : 'unavailable', ...(t.status === 'fulfilled' ? { result: t.value } : { error: safeCode(t.reason) }) }));
  const httpsResult = tasks[3].status === 'fulfilled' ? tasks[3].value as Awaited<ReturnType<typeof checkHttps>> : null;
  const final = httpsResult?.hops.at(-1);
  const headers = (final?.headers || {}) as Record<string, string>;
  const findings = checks.flatMap(c => 'error' in c ? [`${c.check}: unavailable (${c.error}).`] : []);
  if (final) { findings.push(`HTTPS final status ${final.status}; ${httpsResult!.hops.length - 1} redirects.`); for (const key of ['strict-transport-security', 'content-security-policy', 'x-content-type-options']) findings.push(`${key}: ${headers[key] ? 'observed' : 'not observed at this root response'}.`); }
  return withAdmin({ domain: host, checks, securityHeaders: headers, observedAt: new Date().toISOString() }, { summary: `${host}: ${checks.filter(c => c.outcome === 'observed').length}/4 deployment checks observed.`, findings, nextSteps: ['Review unavailable checks, DNS intent, final HTTP status and missing headers before rollout.'], limitations: ['Point-in-time root checks, not a complete security or deliverability audit. Missing mail records may be intentional. HEAD responses can differ from browser responses.'] });
}
