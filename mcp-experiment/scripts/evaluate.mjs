import fs from 'node:fs';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createApp } from '../dist/server.js';
import { MemoryQuota } from '../dist/quota.js';
import { Telemetry } from '../dist/telemetry.js';
import { cases } from '../test/cases.mjs';
import { definitions } from '../dist/tools.js';
import { installFixtures } from './evaluation-fixtures.mjs';
export function check(c, result, error) {
  if (c.expected.error) { assert.ok(error, 'expected rejection'); assert.ok(String(error).includes(c.expected.error), `expected ${c.expected.error}; got ${error}`); return; }
  assert.equal(error, undefined, error);
  const value = c.expected.path.split('.').reduce((v, key) => v?.[key], result);
  if (c.expected.atLeast !== undefined) assert.ok(value >= c.expected.atLeast); else assert.deepEqual(value, c.expected.value);
}
export async function serve(batch) {
  installFixtures(batch); const events = [];
  const telemetry = new Telemetry('', e => events.push({ ...e }));
  const config = { hosts: [], origins: ['https://oldweb.tech'], hmacSecret: 'evaluation-only', testSecret: 'evaluation-private', production: false, start: '', listedAt: '', end: '', disabled: false };
  const app = createApp(config, new MemoryQuota(), telemetry);
  await new Promise(r => app.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${app.address().port}`; config.hosts.push(new URL(base).host);
  return { base, events, close: async () => { app.closeAllConnections(); await new Promise(r => app.close(r)); await telemetry.close(); } };
}
export async function evaluate() {
  const output = [];
  for (let index = 0; index < cases.length; index += 10) {
    const batch = cases.slice(index, index + 10), server = await serve(batch);
    const client = new Client({ name: 'oldweb-matrix-sdk', version: '1.1.0' });
    await client.connect(new StreamableHTTPClientTransport(new URL(`${server.base}/${batch[0].service}/mcp`), { requestInit: { headers: { 'x-oldweb-test': 'evaluation-private' } } }));
    for (const c of batch) {
      const begin = performance.now(); let result, error, wire;
      try { const parsed = definitions[c.service][c.tool].schema.safeParse(c.args); if (!parsed.success) { error = 'validation_error'; } else { wire = await client.callTool({ name: c.tool, arguments: c.args }); if (wire.isError) error = wire.content[0].text; else result = wire.structuredContent; } }
      catch (e) { error = String(e); }
      let outcome = 'pass', failure;
      try { check(c, result, error); if (result) { assert.ok(result.admin.summary); assert.ok(wire.content[0].text.length <= 1500); assert.ok(!wire.content[0].text.startsWith('{')); } }
      catch (e) { outcome = 'fail'; failure = String(e); }
      output.push({ id: c.id, service: c.service, name: c.name, tool: c.tool, outcome, failure, error, durationMs: Math.round(performance.now() - begin), responseBytes: wire ? Buffer.byteLength(JSON.stringify(wire)) : 0, textChars: wire?.content[0]?.text?.length || 0 });
    }
    await client.close(); await server.close();
    assert.ok(!JSON.stringify(server.events).includes('synthetic admin fixture'));
  }
  const directory = new URL('../reports/', import.meta.url); fs.mkdirSync(directory, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const report = { at: new Date().toISOString(), version: '1.1.0', environment: 'local Streamable HTTP; fixture DNS/HTTPS, real offline tools; negative schema cases rejected by SDK gate', total: output.length, passed: output.filter(o => o.outcome === 'pass').length, results: output };
  fs.writeFileSync(new URL(`deterministic-${stamp}.json`, directory), JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(new URL('case-catalogue.json', directory), JSON.stringify(cases.map(({ fixture, ...c }) => c), null, 2) + '\n');
  console.log(JSON.stringify({ total: report.total, passed: report.passed, failures: output.filter(o => o.outcome === 'fail') }, null, 2));
  if (report.passed !== 300) process.exitCode = 1;
  return report;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await evaluate();
