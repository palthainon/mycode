import fs from 'node:fs';
import { score } from './score-model.mjs';
const run = process.argv[2] || 'full-v1';
const root = new URL(`../reports/model-${run}/`, import.meta.url);
const catalogue = JSON.parse(fs.readFileSync(new URL('catalogue.json', root)));
const results = []; const usage = {}; let calls = 0, elapsedMs = 0; const prohibitedActions = [];
for (const file of fs.readdirSync(root).filter(f => /--.*\.json$/.test(f))) {
  const report = JSON.parse(fs.readFileSync(new URL(file, root)));
  prohibitedActions.push(...(report.prohibitedActions || [])); const ids = report.results.map(r => r.id); const batch = catalogue.filter(c => ids.includes(c.id));
  const answers = report.results.flatMap(r => r.answer ? [r.answer] : []);
  results.push(...score(batch, report.calls, answers)); calls += report.calls.length; elapsedMs += report.elapsedMs;
  for (const [k, v] of Object.entries(report.usage || {})) usage[k] = (usage[k] || 0) + v;
}
const summary = { run, scoredAt: new Date().toISOString(), scoringVersion: 2, scoringCorrections: ['Match calls by normalized arguments, not parallel completion order.', 'Codex status=failed preserves SDK tool errors without isError.'], prohibitedActions, total: results.length, passed: results.filter(r => r.passed).length, calls, elapsedMs, usage, byService: Object.fromEntries(['diagnostics', 'logs', 'network'].map(s => [s, { total: results.filter(r => r.service === s).length, passed: results.filter(r => r.service === s && r.passed).length, matchedCalls: results.filter(r => r.service === s && r.matchedCall).length, structuredPassed: results.filter(r => r.service === s && r.structuredPassed).length, answerPassed: results.filter(r => r.service === s && r.answerPassed).length }])), failures: results.filter(r => !r.passed), results };
fs.writeFileSync(new URL('scored.json', root), JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ ...summary, results: undefined, failures: summary.failures.map(({ answer, ...r }) => r) }, null, 2));
