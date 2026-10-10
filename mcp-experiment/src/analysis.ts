import { ToolFailure } from './errors.js';
import { excerpt, safeUrl, withAdmin } from './admin.js';
export function lines(text: string) {
  if (Buffer.byteLength(text) > 262144) throw new ToolFailure('input_too_large');
  const out = text.replace(/\r\n/g, '\n').split('\n'); if (out.at(-1) === '') out.pop();
  if (out.length > 1000) throw new ToolFailure('too_many_lines'); return out;
}
export function extractCi(text: string) {
  const input = lines(text); const failures: { line: number; category: string; evidence: string }[] = [];
  const counts: Record<string, number> = {}; let omitted = 0;
  for (let i = 0; i < input.length; i++) {
    const s = input[i].replace(/\x1b\[[0-9;]*m/g, '');
    const category = /\b(error TS\d+|syntaxerror|compilation failed|fatal error|error CS\d+)\b/i.test(s) ? 'compile' : /\b(FAIL(?:ED)?|AssertionError|test failed)\b/.test(s) ? 'test' : /\b(ERESOLVE|ENOTFOUND|ECONNREFUSED|Could not resolve|dependency.*failed)\b/i.test(s) ? 'dependency' : /\b(permission denied|EACCES|unauthorized|access denied)\b/i.test(s) ? 'permission' : /\b(error|fatal|exit(?:ed)? (?:code |with code )?[1-9]\d*)\b/i.test(s) ? 'other' : '';
    if (!category) continue; counts[category] = (counts[category] || 0) + 1;
    if (failures.length < 50) failures.push({ line: i + 1, category, evidence: excerpt(s) }); else omitted++;
  }
  const actions: Record<string, string> = { compile: 'Review the reported source location and compiler diagnostic.', test: 'Reproduce the first failing test and inspect its assertion output.', dependency: 'Check the dependency resolver, registry connectivity and lockfile.', permission: 'Check the runner identity and permissions for the rejected operation.', other: 'Inspect the earliest failure and surrounding source lines.' };
  return withAdmin({ lines: input.length, failureCount: Object.values(counts).reduce((a, b) => a + b, 0), categoryCounts: counts, failures, omittedFailures: omitted, truncated: omitted > 0 }, { summary: `${Object.values(counts).reduce((a, b) => a + b, 0)} failure-like lines in ${input.length} CI log lines.`, findings: failures.slice(0, 5).map(f => `Line ${f.line} (${f.category}): ${f.evidence}`), nextSteps: failures.length ? [...new Set(failures.slice(0, 5).map(f => actions[f.category]))] : ['No recognized failure pattern; inspect the runner exit status and remaining log.'], limitations: ['Pattern matching, not root-cause inference. Later errors may be consequences. Excerpts redact common credential assignments, not all possible secrets.'] });
}
export type HttpEntry = { method: string; url: string; status: number; durationMs?: number; responseHeaders?: Record<string, string> };
export function analyzeHttp(entries: HttpEntry[]) {
  if (entries.length > 100) throw new ToolFailure('too_many_requests');
  const statusCounts: Record<string, number> = {}; let totalDurationMs = 0;
  const requests = entries.map((e, index) => {
    statusCounts[e.status] = (statusCounts[e.status] || 0) + 1; totalDurationMs += e.durationMs || 0;
    const headers = Object.fromEntries(Object.entries(e.responseHeaders || {}).map(([k, v]) => [k.toLowerCase(), v]));
    const observations = [e.status === 0 ? 'No HTTP response captured; transport cause unknown.' : e.status === 429 ? 'Rate limited; respect Retry-After when retrying.' : e.status >= 500 ? 'Server error reported; inspect server logs.' : e.status === 401 || e.status === 403 ? 'Authentication or access policy rejected the request.' : e.status >= 400 ? 'Client error reported; check request inputs and route.' : e.status >= 300 && e.status < 400 ? 'Redirect captured; this tool does not follow it.' : 'Successful HTTP status captured.'];
    if ((e.durationMs || 0) > 5000) observations.push('Captured duration exceeds 5 seconds; no cause inferred.');
    let location: string | null = null;
    if (headers.location) { try { location = safeUrl(new URL(headers.location, e.url).href); } catch { location = '[invalid URL]'; } }
    return { index, method: e.method, url: safeUrl(e.url), status: e.status, durationMs: e.durationMs ?? null, location, retryAfter: headers['retry-after'] ? excerpt(headers['retry-after'], 80) : null, observations };
  });
  return withAdmin({ requestCount: entries.length, statusCounts, totalCapturedDurationMs: totalDurationMs, requests }, { summary: `${entries.length} captured requests; ${entries.filter(e => e.status === 0 || e.status >= 400).length} reported errors.`, findings: requests.filter(r => r.status === 0 || r.status >= 300 || (r.durationMs || 0) > 5000).slice(0, 5).map(r => `Request ${r.index}: ${r.method} HTTP ${r.status}. ${r.observations.join(' ')}`), nextSteps: ['Inspect the corresponding capture or server log using request indices.'], limitations: ['Offline metadata analysis; no URLs fetched. Query strings, userinfo and sensitive headers are omitted. Timing sum is not wall-clock elapsed time.'] });
}

const keywords = new Set(['type', 'properties', 'required', 'additionalProperties', 'items', 'enum', 'minimum', 'maximum', 'minLength', 'maxLength', 'minItems', 'maxItems', 'title', 'description']);
export function validateConfig(text: string, schema: unknown) {
  lines(text); let value: unknown; try { value = JSON.parse(text); } catch { throw new ToolFailure('invalid_config_json'); }
  let nodes = 0;
  function inspect(s: any, depth: number) {
    if (++nodes > 1000 || depth > 20) throw new ToolFailure('schema_too_complex');
    if (typeof s === 'boolean') return;
    if (!s || typeof s !== 'object' || Array.isArray(s) || Object.keys(s).some(k => !keywords.has(k))) throw new ToolFailure('unsupported_schema');
    if (s.type !== undefined && !['object', 'array', 'string', 'number', 'integer', 'boolean', 'null'].includes(s.type)) throw new ToolFailure('unsupported_schema');
    for (const k of ['minimum', 'maximum', 'minLength', 'maxLength', 'minItems', 'maxItems']) if (s[k] !== undefined && (!Number.isFinite(s[k]) || (k.startsWith('min') || k.startsWith('max')) && !['minimum', 'maximum'].includes(k) && (!Number.isInteger(s[k]) || s[k] < 0))) throw new ToolFailure('unsupported_schema');
    if (s.required !== undefined && (!Array.isArray(s.required) || s.required.some((v: any) => typeof v !== 'string'))) throw new ToolFailure('unsupported_schema');
    if (s.enum !== undefined) { if (!Array.isArray(s.enum) || !s.enum.length || s.enum.length > 100) throw new ToolFailure('unsupported_schema'); for (const item of s.enum) inspectEnum(item, depth + 1); }
    for (const k of ['title', 'description']) if (s[k] !== undefined && typeof s[k] !== 'string') throw new ToolFailure('unsupported_schema');
    if (s.properties !== undefined) { if (!s.properties || typeof s.properties !== 'object' || Array.isArray(s.properties)) throw new ToolFailure('unsupported_schema'); for (const child of Object.values(s.properties)) inspect(child, depth + 1); }
    if (s.items !== undefined) inspect(s.items, depth + 1);
    if (s.additionalProperties !== undefined) inspect(s.additionalProperties, depth + 1);
  }
  function inspectEnum(v: any, depth: number) { if (++nodes > 1000 || depth > 20) throw new ToolFailure('schema_too_complex'); if (v && typeof v === 'object') for (const child of Object.values(v)) inspectEnum(child, depth + 1); }
  inspect(schema, 0);
  const errors: { path: string; rule: string }[] = []; let errorCount = 0; nodes = 0;
  function error(path: string, rule: string) { errorCount++; if (errors.length < 50) errors.push({ path: path.slice(0, 200), rule }); }
  function visit(v: any, s: any, path: string, depth: number) {
    if (++nodes > 10000 || depth > 40) throw new ToolFailure('config_too_complex');
    if (s === true) return; if (s === false) return error(path, 'false_schema');
    const type = v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v;
    if (s.type && !(type === s.type || s.type === 'integer' && type === 'number' && Number.isInteger(v))) error(path, 'type');
    if (s.enum && !s.enum.some((e: unknown) => equal(v, e))) error(path, 'enum');
    if (type === 'number') { if (s.minimum !== undefined && v < s.minimum) error(path, 'minimum'); if (s.maximum !== undefined && v > s.maximum) error(path, 'maximum'); }
    if (type === 'string') { const length = [...v].length; if (s.minLength !== undefined && length < s.minLength) error(path, 'minLength'); if (s.maxLength !== undefined && length > s.maxLength) error(path, 'maxLength'); }
    if (type === 'array') { if (s.minItems !== undefined && v.length < s.minItems) error(path, 'minItems'); if (s.maxItems !== undefined && v.length > s.maxItems) error(path, 'maxItems'); if (s.items !== undefined) v.forEach((x: unknown, i: number) => visit(x, s.items, `${path}/${i}`, depth + 1)); }
    if (type === 'object') { for (const k of s.required || []) if (!Object.hasOwn(v, k)) error(path, 'required'); for (const [k, x] of Object.entries(v)) { const p = `${path}/${k.replace(/~/g, '~0').replace(/\//g, '~1')}`; if (s.properties && Object.hasOwn(s.properties, k)) visit(x, s.properties[k], p, depth + 1); else if (s.additionalProperties !== undefined) visit(x, s.additionalProperties, p, depth + 1); } }
  }
  visit(value, schema, '', 0);
  return withAdmin({ valid: errorCount === 0, errorCount, errors, omittedErrors: errorCount - errors.length, supportedKeywords: [...keywords] }, { summary: errorCount ? `Configuration has ${errorCount} schema violations.` : 'Configuration matches the supplied supported schema.', findings: errors.slice(0, 5).map(e => `${e.path || '/'}: ${e.rule}.`), nextSteps: errorCount ? ['Correct the reported paths and validate again.'] : [], limitations: ['Bounded JSON Schema subset; no remote references, regex, format checks or combinators. This does not validate application-specific semantics. Values are not echoed.'] });
}
function equal(a: any, b: any): boolean {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a), kb = Object.keys(b); return ka.length === kb.length && ka.every(k => Object.hasOwn(b, k) && equal(a[k], b[k]));
}
