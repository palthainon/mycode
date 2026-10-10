export type Admin = { summary: string; findings: string[]; nextSteps: string[]; limitations: string[] };
export function withAdmin<T extends Record<string, unknown>>(result: T, admin: Admin) { return { ...result, admin }; }
export function readable(name: string, result: Record<string, any>): string {
  const a: Admin = result.admin || describe(name, result);
  const lines = [a.summary, ...a.findings.map(s => `• ${s}`), ...a.nextSteps.map(s => `Next: ${s}`), ...a.limitations.map(s => `Limit: ${s}`)];
  const text = lines.join('\n');
  return text.length <= 1500 ? text : text.slice(0, 1420) + '\nDetails omitted here; complete evidence is in structuredContent.';
}
export function describe(name: string, r: Record<string, any>): Admin {
  const a: Admin = { summary: '', findings: [], nextSteps: [], limitations: [] };
  switch (name) {
    case 'lookup_dns': a.summary = `${r.domain}: ${r.type} lookup returned DNS status ${r.status} and ${r.answers.length} answers.`; a.findings = r.answers.slice(0, 5).map((x: any) => `${x.data} (TTL ${x.TTL}s)`); a.limitations = ['Observed DNS configuration; cached resolver answers can lag changes.']; break;
    case 'check_email_dns': a.summary = `${r.domain}: email DNS observations.`; a.findings = r.observations.map((x: any) => `${x.check}: ${x.records.length} records; DNS status ${x.status}.`); a.nextSteps = r.observations.filter((x: any) => x.records.length !== 1).map((x: any) => `Review ${x.check} configuration and intended mail role.`); a.limitations = [r.note]; break;
    case 'check_https': a.summary = `HTTPS finished at status ${r.hops.at(-1)?.status}; ${r.hops.length - 1} redirects.`; a.findings = r.hops.map((x: any) => `${x.url}: HTTP ${x.status}, TLS authorized ${x.certificate.authorized}.`); a.limitations = ['Root on port 443 only; no page content or full security audit.']; break;
    case 'parse_logs': case 'summarize_logs': a.summary = `${r.parsed} parsed, ${r.unparsed} unparsed, ${r.skipped} skipped log lines.`; a.findings = [`Formats: ${JSON.stringify(r.formatCounts)}.`, `Severities: ${JSON.stringify(r.severityCounts)}.`, `Timestamp range: ${r.timestampRange?.first || 'unknown'} to ${r.timestampRange?.last || 'unknown'}.`, `${r.omittedRecords} records omitted; ${r.ambiguousTimestamps} ambiguous timestamps.`]; a.nextSteps = r.unparsed ? ['Inspect unparsed source lines or supply the known format.'] : []; a.limitations = ['Counts are deterministic; ambiguous timestamps do not establish chronological order.']; break;
    case 'inspect_subnet': a.summary = `${r.cidr}: ${r.addressCount} addresses.`; a.findings = [`Range ${r.firstAddress} – ${r.lastAddress}.`, ...(r.version === 4 ? [`Usable ${r.firstUsable} – ${r.lastUsable} (${r.usableHostCount}); mask ${r.netmask}.`] : ['IPv6 has no broadcast.'])]; a.limitations = ['Capacity calculation does not account for provider-reserved addresses.']; break;
    case 'plan_subnets': a.summary = `${r.parent.cidr}: ${r.allocations.filter((x: any) => x.allocated).length}/${r.allocations.length} allocations; ${r.freeAddressCount} addresses remain.`; a.findings = r.allocations.slice(0, 10).map((x: any) => `${x.label || `Request ${x.index}`}: ${x.allocated ? x.cidr : x.error}.`); a.nextSteps = r.complete ? [] : ['Reduce requested block sizes or use a larger parent.']; a.limitations = ['Largest blocks allocated first; input indices preserve request identity.']; break;
    case 'check_cidr_overlap': a.summary = `${r.subnets.length} subnets: ${r.overlapCount} overlapping pairs; ${r.omittedOverlaps} pairs omitted.`; a.findings = r.overlaps.slice(0, 10).map((x: any) => `Inputs ${x.firstIndex} and ${x.secondIndex}: ${x.first} overlaps ${x.second}.`); a.nextSteps = r.hasOverlap ? ['Check whether the overlapping routes or allocations are intentional.'] : []; a.limitations = ['IPv4 and IPv6 ranges are compared separately.']; break;
    default: a.summary = name;
  }
  return a;
}
// Reduce accidental credential echo in excerpts; this is not a general secret scanner.
export function excerpt(value: string, limit = 220) {
  return value.replace(/\x1b\[[0-9;]*m/g, '').replace(/\b(authorization|password|passwd|token|api[_-]?key|secret)\s*[:=]\s*(?:Bearer\s+)?[^\s,;]+/gi, '$1=[REDACTED]').replace(/https?:\/\/[^\s]+/g, s => safeUrl(s)).slice(0, limit);
}
export function safeUrl(value: string) {
  try { const u = new URL(value); if (!['http:', 'https:'].includes(u.protocol)) return '[unsupported URL]'; return `${u.protocol}//${u.host}${u.pathname}${u.search ? '?[REDACTED]' : ''}`; } catch { return '[invalid URL]'; }
}
