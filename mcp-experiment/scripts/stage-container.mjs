import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../..', import.meta.url));
const destination = path.join(root, 'mcp-experiment', '.deploy', 'context');
for (const file of ['mcp-experiment/package.json', 'mcp-experiment/package-lock.json', 'mcp-experiment/tsconfig.json', 'mcp-experiment/Dockerfile', 'system/logparser-core.js', 'nettools/subnet-core.js']) {
  const target = path.join(destination, file); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.copyFileSync(path.join(root, file), target);
}
fs.cpSync(path.join(root, 'mcp-experiment/src'), path.join(destination, 'mcp-experiment/src'), { recursive: true });
console.log(destination);
