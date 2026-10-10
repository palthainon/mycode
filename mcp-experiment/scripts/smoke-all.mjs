import assert from 'node:assert/strict';
import fs from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
const base = process.env.MCP_BASE_URL || 'http://127.0.0.1:8080';
const checks = {
  network: [['inspect_subnet', { cidr: '192.0.2.1/31' }], ['plan_subnets', { parent: '2001:db8::/60', requests: [{ label: 'office', prefix: 64 }] }], ['check_cidr_overlap', { cidrs: ['192.0.2.0/24', '192.0.2.128/25'] }]],
  logs: [['parse_logs', { text: '{"level":"INFO","message":"OLDWEB_ADMIN_PRIVACY_SENTINEL_20261010"}', recordLimit: 1 }], ['summarize_logs', { text: '{"level":"ERROR"}' }], ['extract_ci_failures', { text: 'error TS2322: OLDWEB_ADMIN_PRIVACY_SENTINEL_20261010 token=OLDWEB_ADMIN_SECRET_SENTINEL_20261010' }], ['analyze_http_trace', { entries: [{ method: 'GET', url: 'https://example.com/a?token=OLDWEB_ADMIN_SECRET_SENTINEL_20261010', status: 429, responseHeaders: { 'Retry-After': '60', Authorization: 'OLDWEB_ADMIN_SECRET_SENTINEL_20261010' } }] }], ['validate_config', { text: '{"port":"OLDWEB_ADMIN_PRIVACY_SENTINEL_20261010"}', schema: { properties: { port: { type: 'integer' } } } }]],
  diagnostics: [['lookup_dns', { domain: 'example.com', type: 'A' }], ['check_email_dns', { domain: 'example.com' }], ['check_https', { domain: 'example.com' }], ['deployment_readiness', { domain: 'example.com' }], ['trace_email', { headers: 'Authentication-Results: mx.example.com; spf=pass\nReceived: from sender.example.com by mx.example.com; Fri, 09 Oct 2026 10:00:00 +0000\nSubject: OLDWEB_ADMIN_PRIVACY_SENTINEL_20261010', deliveryLog: '450 4.2.0 OLDWEB_ADMIN_PRIVACY_SENTINEL_20261010' }]]
};
let count = 0; const measurements = [];
for (const [service, tools] of Object.entries(checks)) {
  const client = new Client({ name: 'oldweb-internal-admin-smoke', version: '1.1.0' });
  await client.connect(new StreamableHTTPClientTransport(new URL(`${base}/${service}/mcp`), { requestInit: { headers: { 'x-oldweb-test': process.env.TEST_SECRET || '' } } }));
  const advertised = (await client.listTools()).tools;
  assert.equal(advertised.length, tools.length);
  for (const [name, args] of tools) {
    if (count) await delay(7000);
    let result; const began = performance.now();
    for (let attempt = 0; attempt < 3; attempt++) {
      try { result = await client.callTool({ name, arguments: args }); break; }
      catch (error) { if (!String(error).includes('429') || attempt === 2) throw error; console.log('Respecting rate limit; retry in 60 seconds.'); await delay(60000); }
    }
    assert.notEqual(result.isError, true); assert.ok(result.structuredContent?.admin?.summary); assert.ok(result.content[0].text.length <= 1500);
    if (name === 'trace_email') assert.equal(result.structuredContent.delivery[0].disposition, 'temporary_failure');
    if (name === 'extract_ci_failures') assert.ok(!JSON.stringify(result).includes('OLDWEB_ADMIN_SECRET_SENTINEL_20261010'));
    if (name === 'validate_config') assert.equal(result.structuredContent.valid, false);
    if (name === 'deployment_readiness') assert.equal(result.structuredContent.checks.length, 4);
    if (name === 'analyze_http_trace') assert.ok(!JSON.stringify(result).includes('OLDWEB_ADMIN_SECRET_SENTINEL_20261010'));
    measurements.push({ service, tool: name, durationMs: Math.round(performance.now() - began), outputBytes: Buffer.byteLength(JSON.stringify(result)), textChars: result.content[0].text.length, passed: true });
    console.log(`${service}/${name}: passed`); count++;
  }
  await client.close();
}
console.log(`${count}/13 live tool checks passed; all marked internal.`);
if (process.env.LIVE_REPORT_PATH) fs.writeFileSync(process.env.LIVE_REPORT_PATH, JSON.stringify({ at: new Date().toISOString(), environment: 'public hostname, official SDK, private internal test header', total: count, passed: count, measurements }, null, 2) + '\n');
