import { ToolFailure } from './errors.js';
import { lines } from './analysis.js';
import { excerpt, withAdmin } from './admin.js';

export function traceEmail(headers: string, deliveryLog = '', trustedAuthservIds: string[] = []) {
  if (Buffer.byteLength(headers) + Buffer.byteLength(deliveryLog) > 262144) throw new ToolFailure('input_too_large');
  const input = lines(headers), log = deliveryLog ? lines(deliveryLog) : [];
  if (input.length + log.length > 1000) throw new ToolFailure('too_many_lines');
  const fields: { name: string; value: string; line: number }[] = []; let malformedLines = 0;
  for (let i = 0; i < input.length; i++) {
    const s = input[i]; if (!s.trim()) break;
    if (/^[ \t]/.test(s)) { if (fields.length) fields.at(-1)!.value += ' ' + s.trim(); else malformedLines++; continue; }
    const m = /^([!-9;-~]+):\s*(.*)$/.exec(s); if (m) fields.push({ name: m[1].toLowerCase(), value: m[2], line: i + 1 }); else malformedLines++;
  }
  const received = fields.filter(f => f.name === 'received');
  let previous: number | null = null;
  const hops = received.slice(0, 50).reverse().map((f, index) => {
    const split = f.value.lastIndexOf(';'); const timestampText = split < 0 ? '' : f.value.slice(split + 1).trim();
    // Do not infer a local timezone, year, or chronology from an incomplete date.
    const parsed = /\b\d{4}\b/.test(timestampText) && /(?:[+-]\d{4}|\b(?:UT|UTC|GMT))\s*(?:\([^)]*\))?$/.test(timestampText) ? Date.parse(timestampText) : NaN;
    const time = Number.isFinite(parsed) ? parsed : null; const delaySeconds = time !== null && previous !== null ? (time - previous) / 1000 : null;
    previous = time;
    const route = split < 0 ? f.value : f.value.slice(0, split);
    return { index, headerLine: f.line, from: excerpt(/\bfrom\s+(\S+)/i.exec(route)?.[1] || 'unknown', 100), by: excerpt(/\bby\s+(\S+)/i.exec(route)?.[1] || 'unknown', 100), timestamp: time === null ? null : new Date(time).toISOString(), delaySeconds, evidence: excerpt(f.value), trust: 'unverified_supplied_header' };
  });
  const authentication = fields.filter(f => f.name === 'authentication-results').slice(0, 20).map(f => {
    const authservId = f.value.split(';')[0].trim().split(/\s/)[0].toLowerCase();
    return { headerLine: f.line, authservId: excerpt(authservId, 100), callerDesignatedTrusted: trustedAuthservIds.map(s => s.toLowerCase()).includes(authservId), results: [...f.value.matchAll(/\b(spf|dkim|dmarc|arc)\s*=\s*([a-z]+)/gi)].map(m => ({ method: m[1].toLowerCase(), reportedResult: m[2].toLowerCase() })), trust: 'reported_claim_not_verified' };
  });
  const delivery: { line: number; smtpCode: number | null; enhancedStatus: string | null; disposition: string; evidence: string }[] = [];
  let omittedDelivery = 0;
  for (let i = 0; i < log.length; i++) {
    const code = /(?:^|[\s=:])(\d{3})(?=[\s-]|$)/.exec(log[i]);
    const enhanced = /\b([245]\.\d{1,3}\.\d{1,3})\b/.exec(log[i]);
    const numeric = code && /^[245]/.test(code[1]) ? Number(code[1]) : null;
    const group = numeric ? Math.floor(numeric / 100) : enhanced ? Number(enhanced[1][0]) : null;
    if (!group) continue;
    if (delivery.length >= 50) { omittedDelivery++; continue; }
    delivery.push({ line: i + 1, smtpCode: numeric, enhancedStatus: enhanced?.[1] || null, disposition: group === 2 ? 'accepted_at_reported_hop' : group === 4 ? 'temporary_failure' : 'permanent_failure_at_reported_hop', evidence: excerpt(log[i]) });
  }
  const anomalies = [ ...(malformedLines ? [`${malformedLines} malformed header lines.`] : []), ...(hops.some(h => h.timestamp === null) ? ['Some Received dates lack a usable explicit timezone/year.'] : []), ...(hops.some(h => (h.delaySeconds ?? 0) < 0) ? ['Received timestamps move backwards; clocks or header claims may be inconsistent.'] : []), ...(hops.some(h => (h.delaySeconds ?? 0) > 300) ? ['At least one reported hop gap exceeds five minutes; inspect that relay queue.'] : []), ...(!received.length ? ['No Received chain supplied.'] : []) ];
  const nextSteps = ['Correlate header lines and delivery statuses with the trusted receiving mail server’s queue logs.'];
  if (delivery.some(d => d.disposition === 'temporary_failure')) nextSteps.push('Inspect deferred queue age and retry policy before resending.');
  if (delivery.some(d => d.disposition === 'permanent_failure_at_reported_hop')) nextSteps.push('Review the rejecting relay’s diagnostic and recipient/policy configuration; avoid blind retries.');
  if (authentication.some(a => a.results.some(r => r.reportedResult === 'fail'))) nextSteps.push('Confirm authentication failures in trusted receiver logs before changing DNS or signing settings.');
  return withAdmin({ hopCount: received.length, hops, retainedHopSelection: 'newest_50_in_reported_chronological_order', omittedHops: Math.max(0, received.length - hops.length), authentication, omittedAuthentication: Math.max(0, fields.filter(f => f.name === 'authentication-results').length - authentication.length), delivery, omittedDelivery, malformedLines, anomalies }, { summary: `${received.length} reported email hops; ${delivery.length + omittedDelivery} delivery status lines.`, findings: [...anomalies, ...authentication.slice(0, 3).map(a => `${a.authservId}: ${a.results.map(r => `${r.method}=${r.reportedResult}`).join(', ') || 'no recognized results'} (unverified claim).`), ...delivery.slice(0, 3).map(d => `Log line ${d.line}: ${d.smtpCode || d.enhancedStatus}, ${d.disposition}.`)], nextSteps, limitations: ['Supplied headers can be forged. Caller-designated trust is not verified. No DKIM/SPF/DMARC cryptographic validation, mailbox access or DNS lookup. SMTP acceptance does not prove inbox delivery. Content after the first blank header line is ignored.'] });
}
