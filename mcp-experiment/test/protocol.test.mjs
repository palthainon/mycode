import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createApp, sourceIp } from '../dist/server.js';
import { MemoryQuota, RateLimits } from '../dist/quota.js';
import { Telemetry, callerId } from '../dist/telemetry.js';

async function fixture(t, quota = new MemoryQuota(), overrides = {}) {
  const events = [];
  const telemetry = new Telemetry('', e => events.push({ ...e }));
  const config = { hosts: [], origins: ['https://oldweb.tech'], hmacSecret: 'fixture-secret', testSecret: 'fixture-test', production: false, start: '2026-01-01', listedAt: '', end: '', disabled: false, ...overrides };
  const app = createApp(config, quota, telemetry);
  await new Promise(resolve => app.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${app.address().port}`;
  config.hosts.push(new URL(base).host);
  t.after(async () => { app.closeAllConnections(); await new Promise(resolve => app.close(resolve)); await telemetry.close(); });
  return { base, events, config, telemetry };
}
test('all endpoints initialize and discover tools; structured results and private telemetry', async t => {
  const { base, events, telemetry } = await fixture(t);
  for (const [service, count, name, args] of [
    ['network', 3, 'inspect_subnet', { cidr: '192.0.2.1/24' }],
    ['logs', 2, 'parse_logs', { text: '{"message":"PRIVACY_SENTINEL_90482"}' }],
    ['diagnostics', 3, null, {}]
  ]) {
    const client = new Client({ name: 'oldweb-test', version: '1.0' });
    const transport = new StreamableHTTPClientTransport(new URL(`${base}/${service}/mcp`), { requestInit: { headers: { 'x-oldweb-test': 'fixture-test' } } });
    await client.connect(transport);
    assert.equal((await client.listTools()).tools.length, count);
    if (name) { const result = await client.callTool({ name, arguments: args }); assert.ok(result.structuredContent); assert.notEqual(result.isError, true); }
    await client.close();
  }
  await telemetry.flush();
  assert.ok(events.some(e => e.method === 'probe' && e.internal));
  assert.ok(events.some(e => e.method === 'initialize' && e.clientName === 'oldweb-test'));
  assert.ok(events.some(e => e.outcome === 'tool_success'));
  assert.ok(events.every(e => e.internal));
  assert.ok(!JSON.stringify(events).includes('PRIVACY_SENTINEL'));
  assert.ok(!JSON.stringify(events).includes('192.0.2.1'));
  assert.ok(!JSON.stringify(events).includes('127.0.0.1'));
});
test('protocol, host, origin, and payload failures are bounded', async t => {
  const { base } = await fixture(t);
  const url = `${base}/network/mcp`;
  assert.equal((await fetch(url)).status, 405);
  assert.equal((await fetch(url, { method: 'POST', headers: { origin: 'https://evil.example', 'content-type': 'application/json' }, body: '{}' })).status, 403);
  const badHost = await new Promise(resolve => { const r = http.request(url, { method: 'POST', headers: { host: 'evil.example', 'content-type': 'application/json' } }, response => { response.resume(); resolve(response.statusCode); }); r.end('{}'); });
  assert.equal(badHost, 403);
  assert.equal((await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '[' })).status, 400);
  assert.equal((await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: 'x'.repeat(262145) })).status, 413);
  const headers = { 'content-type': 'application/json', accept: 'application/json, text/event-stream', 'mcp-protocol-version': '1900-01-01' };
  assert.equal((await fetch(url, { method: 'POST', headers, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }) })).status, 400);
});
test('global quota failure and experiment stop fail closed', async t => {
  const { base } = await fixture(t, { take: async () => false });
  const response = await fetch(`${base}/network/mcp`, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'inspect_subnet', arguments: { cidr: '192.0.2.0/24' } } }) });
  assert.equal(response.status, 429); assert.ok(response.headers.get('retry-after'));
  const stopped = await fixture(t, new MemoryQuota(), { disabled: true });
  assert.equal((await fetch(`${stopped.base}/network/mcp`, { method: 'POST' })).status, 503);
  const expired = await fixture(t, new MemoryQuota(), { end: '2000-01-01T00:00:00Z' });
  assert.equal((await fetch(`${expired.base}/network/mcp`, { method: 'POST' })).status, 503);
});
test('source addressing uses the proxy-appended value and fingerprints are keyed', () => {
  assert.equal(sourceIp({ headers: { 'x-forwarded-for': 'evil, 8.8.8.8' }, socket: {} }, true), '8.8.8.8');
  assert.notEqual(callerId('8.8.8.8', 'client', 'a'), callerId('8.8.8.8', 'client', 'b'));
  const limits = new RateLimits(); for (let i = 0; i < 10; i++) assert.equal(limits.take('a', true), true);
  assert.equal(limits.take('a', true), false);
});
