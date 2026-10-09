const base = process.env.MCP_BASE_URL;
if (!base) throw new Error('MCP_BASE_URL required');
const deadline = Date.now() + 180000;
let ready = false;
while (Date.now() < deadline) {
  try {
    const response = await fetch(new URL('/healthz', base), { signal: AbortSignal.timeout(10000) });
    ready = response.ok && (await response.json()).status === 'ok';
  } catch { /* Routing propagation and cold starts are expected during deployment. */ }
  if (ready) break;
  await new Promise(resolve => setTimeout(resolve, 5000));
}
if (!ready) throw new Error('Candidate did not become ready within three minutes');
console.log('Candidate routing and health check ready');
