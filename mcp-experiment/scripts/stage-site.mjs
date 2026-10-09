import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const destination = path.resolve(process.env.SITE_STAGE || '.site-dist');
if (destination === root || !destination.startsWith(root + path.sep)) throw new Error('Staging must be a child of the repository');
fs.mkdirSync(destination, { recursive: true });
const directories = ['certs', 'data', 'financials', 'fonts', 'games', 'img', 'logo', 'nettools', 'pdf', 'productivity', 'system'];
for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (entry.isFile() && /\.(html|css|js|xml|txt)$/.test(entry.name)) fs.copyFileSync(path.join(root, entry.name), path.join(destination, entry.name));
}
fs.copyFileSync(path.join(root, 'staticwebapp.config.json'), path.join(destination, 'staticwebapp.config.json'));
fs.copyFileSync(path.join(root, 'mcp-tools.json'), path.join(destination, 'mcp-tools.json'));
for (const directory of directories) fs.cpSync(path.join(root, directory), path.join(destination, directory), { recursive: true });
if (fs.existsSync(path.join(destination, 'mcp-experiment')) || fs.existsSync(path.join(destination, '.git'))) throw new Error('Unsafe static artifact');
console.log('Static website staged; backend and repository metadata excluded.');
