import { definitions } from '../dist/tools.js';
import { check } from './evaluate.mjs';
function canonical(value) { return JSON.stringify(value, (_, v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b))) : v); }
function normalized(c, args) {
  const parsed = definitions[c.service][c.tool].schema.safeParse(args); const value = parsed.success ? parsed.data : args;
  if (!value) return canonical(value);
  // Choosing a supported explicit parser is valid when the task did not
  // prescribe a format. A final line terminator is not a log record.
  const projected = Object.fromEntries(Object.keys(c.args).map(k => [k, value[k]]));
  if (['parse_logs', 'summarize_logs'].includes(c.tool) && typeof projected.text === 'string') { projected.text = projected.text.replace(/\r\n/g, '\n').replace(/\n$/, ''); const rows = projected.text.split('\n'); try { projected.text = rows.map(row => canonical(JSON.parse(row))).join('\n'); } catch {} }
  return canonical(projected);
}
export function score(batch, calls, answers) {
  const consumed = new Set();
  return batch.map(c => {
    // Codex may issue parallel calls; completion order is not scenario order.
    const index = calls.findIndex((call, i) => !consumed.has(i) && call.tool === c.tool && normalized(c, call.arguments) === normalized(c, c.args));
    if (index >= 0) consumed.add(index);
    const call = calls[index], answer = answers.find(a => a.id === c.id);
    let passed = true, failure, structuredPassed = false, answerPassed = false;
    try {
      if (!call) throw Error('No matching native MCP call with the supplied arguments.');
      const payload = call.result?.structured_content || call.result?.structuredContent;
      const content = call.result?.content || [];
      let error = call.error ? String(typeof call.error === 'string' ? call.error : JSON.stringify(call.error)) : call.status === 'failed' || call.result?.isError || call.result?.is_error ? content.find(c => c.type === 'text')?.text : undefined;
      if (c.expected.error === 'validation_error' && /invalid_tool_or_arguments/.test(error || '')) error = 'validation_error';
      check(c, payload, error); structuredPassed = true;
      if (!answer || typeof answer.summary !== 'string' || answer.summary.split(/\s+/).length > 50) throw Error('Missing or verbose admin answer.');
      if (!Object.hasOwn(answer, 'limitations') || !Object.hasOwn(answer, 'nextStep')) throw Error('Missing limitations or next step field.');
      if (c.expected.error) { if (!String(answer.fact).includes(c.expected.error) && !(c.expected.error === 'validation_error' && /invalid|validation|arguments|-32600|-32602/i.test(String(answer.fact)))) throw Error('Answer error mismatch.'); }
      else check(c, c.expected.path.split('.').reverse().reduce((v, k) => ({ [k]: v }), answer.fact), undefined);
      answerPassed = true;
    } catch (e) { passed = false; failure = String(e); }
    return { id: c.id, service: c.service, tool: c.tool, name: c.name, passed, matchedCall: index >= 0, structuredPassed, answerPassed, failure, answer, responseBytes: call ? Buffer.byteLength(JSON.stringify(call.result)) : 0, textChars: call?.result?.content?.find(c => c.type === 'text')?.text?.length || 0 };
  });
}
