import { test } from 'node:test';
import assert from 'node:assert/strict';
import { traceEmail } from '../dist/email.js';
import { extractCi, analyzeHttp, validateConfig } from '../dist/analysis.js';
import { readable, describe } from '../dist/admin.js';
import { checkOverlap } from '../dist/network.js';
import { definitions } from '../dist/tools.js';

test('email header trust, redaction, truncation and body exclusion', () => {
  const result = traceEmail('Authentication-Results: MX.Example; spf=pass; dkim=fail\nReceived: from sender by mx; Fri, 09 Oct 2026 10:00:00 +0000\n\nAuthentication-Results: forged; spf=pass', '550 5.1.1 password=EMAIL_PRIVATE_SECRET', ['mx.example']);
  assert.equal(result.authentication.length, 1);
  assert.equal(result.authentication[0].callerDesignatedTrusted, true);
  assert.equal(result.authentication[0].trust, 'reported_claim_not_verified');
  assert.equal(result.delivery[0].disposition, 'permanent_failure_at_reported_hop');
  assert.ok(!JSON.stringify(result).includes('EMAIL_PRIVATE_SECRET'));
  assert.ok(result.admin.limitations.join(' ').includes('does not prove inbox delivery'));
  assert.ok(result.admin.nextSteps.some(s => s.includes('avoid blind retries')));
  assert.equal(traceEmail(Array(21).fill('Authentication-Results: mx; spf=pass').join('\n')).omittedAuthentication, 1);
});
test('email trace bounds combined bytes and lines', () => {
  assert.throws(() => traceEmail('Subject: ' + 'é'.repeat(131073)), /input_too_large/);
  assert.throws(() => traceEmail(Array(600).fill('Subject: x').join('\n'), Array(401).fill('250 accepted').join('\n')), /too_many_lines/);
});
test('CI excerpts cap evidence, preserve lines and redact common credentials', () => {
  const result = extractCi('start\nerror Authorization: Bearer CI_SECRET\nerror https://user:pass@example.com/a?key=CI_QUERY_SECRET');
  assert.equal(result.failures[0].line, 2);
  assert.ok(!JSON.stringify(result).includes('CI_SECRET'));
  assert.ok(!JSON.stringify(result).includes('CI_QUERY_SECRET'));
  assert.ok(!JSON.stringify(result).includes('user:pass'));
  assert.equal(extractCi(Array(1000).fill('error ' + 'x'.repeat(230)).join('\n')).failures.length, 50);
});
test('HTTP metadata never echoes sensitive headers or URL credentials', () => {
  const r = analyzeHttp([{ method: 'GET', url: 'https://user:HTTP_SECRET@example.com/a?token=HTTP_QUERY_SECRET', status: 302, responseHeaders: { 'Set-Cookie': 'HTTP_COOKIE_SECRET', Authorization: 'HTTP_AUTH_SECRET', Location: 'https://bad url' } }]);
  assert.equal(r.requests[0].location, '[invalid URL]');
  assert.ok(!JSON.stringify(r).includes('HTTP_SECRET'));
  assert.ok(!JSON.stringify(r).includes('HTTP_QUERY_SECRET'));
  assert.ok(!JSON.stringify(r).includes('HTTP_COOKIE_SECRET'));
  assert.ok(!JSON.stringify(r).includes('HTTP_AUTH_SECRET'));
});
test('config validation rejects unsupported or malformed schema instead of ignoring it', () => {
  for (const schema of [{ format: 'email' }, { allOf: [] }, { type: ['string', 'null'] }, { required: [42] }, { properties: [] }, { minLength: -1 }, { items: 4 }, { enum: [] }]) assert.throws(() => validateConfig('{}', schema), /unsupported_schema/);
  assert.throws(() => validateConfig('{}', { enum: Array(101).fill(null) }), /unsupported_schema/);
  assert.throws(() => validateConfig('broken', { type: 'object' }), /invalid_config_json/);
  let schema = { type: 'object' }; for (let i = 0; i < 21; i++) schema = { properties: { nested: schema } };
  assert.throws(() => validateConfig('{}', schema), /schema_too_complex/);
});
test('configuration paths are escaped, values omitted and error totals exact', () => {
  const r = validateConfig('{"a/b~c":"CONFIG_PRIVATE_SECRET"}', { properties: { 'a/b~c': { type: 'integer' } } });
  assert.equal(r.errors[0].path, '/a~1b~0c'); assert.ok(!JSON.stringify(r).includes('CONFIG_PRIVATE_SECRET'));
  const many = validateConfig(JSON.stringify(Array(60).fill('x')), { items: { type: 'integer' } });
  assert.equal(many.errorCount, 60); assert.equal(many.errors.length, 50); assert.equal(many.omittedErrors, 10);
  assert.equal(validateConfig('{"__proto__":1}', { properties: {}, additionalProperties: false }).valid, false);
});
test('network overlap optimization retains exact totals and omission metadata', () => {
  const r = checkOverlap(Array(100).fill('192.0.2.0/24'));
  assert.equal(r.overlapCount, 4950); assert.equal(r.overlaps.length, 200); assert.equal(r.omittedOverlaps, 4750);
  assert.equal(r.truncated, true);
  const text = readable('check_cidr_overlap', { ...r, admin: describe('check_cidr_overlap', r) });
  assert.ok(text.includes('4950')); assert.ok(text.includes('4750')); assert.ok(text.length <= 1500);
});
test('offline tools advertise closed-world behavior and strict input schemas', () => {
  assert.equal(definitions.diagnostics.trace_email.openWorld, false);
  for (const tools of Object.values(definitions)) for (const d of Object.values(tools)) assert.equal(d.schema.safeParse({ unexpected: 'x' }).success, false);
});
test('readable summaries handle absent timestamp ranges and bound large evidence', () => {
  assert.ok(readable('summarize_logs', { parsed: 0, unparsed: 1, skipped: 0, formatCounts: {}, severityCounts: {}, timestampRange: null, omittedRecords: 0, ambiguousTimestamps: 0 }).includes('unknown'));
  const text = readable('test', { admin: { summary: 'x'.repeat(3000), findings: [], nextSteps: [], limitations: [] } });
  assert.ok(text.length <= 1500); assert.ok(text.includes('complete evidence'));
});
