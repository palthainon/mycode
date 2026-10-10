import fs from 'node:fs';
import { z } from 'zod';
import { definitions } from '../dist/tools.js';
const services = Object.fromEntries(Object.entries(definitions).map(([service, tools]) => [service, {
  url: `https://mcp.oldweb.tech/${service}/mcp`, transport: 'streamable-http',
  tools: Object.entries(tools).map(([name, definition]) => ({ name, description: definition.description, inputSchema: z.toJSONSchema(definition.schema) }))
}]));
fs.writeFileSync(new URL('../../mcp-tools.json', import.meta.url), JSON.stringify({ version: '1.1.0', services }, null, 2) + '\n');
