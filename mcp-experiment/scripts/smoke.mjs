import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
const base = process.env.MCP_BASE_URL || 'http://127.0.0.1:8080';
for (const [service, name, args, count] of [
  ['network', 'inspect_subnet', { cidr: '192.0.2.1/31' }, 3],
  ['logs', 'parse_logs', { text: '{"level":"INFO","message":"OLDWEB_PRIVATE_SMOKE_SENTINEL"}' }, 5],
  ['diagnostics', 'lookup_dns', { domain: 'example.com', type: 'A' }, 5]
]) {
  const client = new Client({ name: 'oldweb-internal-smoke', version: '1.0.0' });
  await client.connect(new StreamableHTTPClientTransport(new URL(`${base}/${service}/mcp`), { requestInit: { headers: { 'x-oldweb-test': process.env.TEST_SECRET || '' } } }));
  assert.equal((await client.listTools()).tools.length, count);
  const result = await client.callTool({ name, arguments: args });
  assert.notEqual(result.isError, true); assert.ok(result.structuredContent);
  console.log(`${service}: initialization, discovery and tool call passed`);
  await client.close();
}
