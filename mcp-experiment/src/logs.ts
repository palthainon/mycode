import { createRequire } from 'node:module';
import { ToolFailure } from './errors.js';
const core = createRequire(import.meta.url)('../../system/logparser-core.js');
export const formats = ['auto', 'json', 'rfc5424', 'rfc3164', 'apache-common', 'apache-combined', 'windows-event', 'common-pid'] as const;
type Fields = Record<string, string>;
// Never infer the current year or the server's timezone for ambiguous timestamps.
function timestamp(value: string): number | null {
  let text = value;
  const apache = value.match(/^(\d{2})\/([A-Za-z]{3})\/(\d{4}):(\d{2}:\d{2}:\d{2}) ([+-]\d{4})$/);
  if (apache) text = `${apache[1]} ${apache[2]} ${apache[3]} ${apache[4]} ${apache[5]}`;
  else if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
  const parsed = Date.parse(text);
  return Number.isFinite(parsed) ? parsed : null;
}
export function parseLogs(text: string, format: string = 'auto', summaryOnly = false) {
  if (Buffer.byteLength(text) > 262144) throw new ToolFailure('input_too_large');
  const physicalLines = text.replace(/\r?\n$/, '').split(/\r?\n/);
  if (physicalLines.length > 1000) throw new ToolFailure('too_many_lines');
  if (!(formats as readonly string[]).includes(format)) throw new ToolFailure('unknown_format');
  const detectedFormat = format === 'auto' ? core.autoDetect(text.split(/\r?\n/)) : format;
  const lines: string[] = detectedFormat === 'windows-event' ? core.splitCSVRecords(text) : text.split(/\r?\n/);
  const records: { line: number; format: string; fields: Fields }[] = [];
  const severityCounts: Record<string, number> = Object.create(null);
  const formatCounts: Record<string, number> = Object.create(null);
  let parsed = 0, unparsed = 0, skipped = 0, ambiguousTimestamps = 0;
  const times: number[] = [];
  lines.forEach((line, index) => {
    if (!line.trim()) { skipped++; return; }
    const id = format === 'auto' && detectedFormat !== 'windows-event' ? core.autoDetect([line]) : detectedFormat;
    const parser = id ? core.getParser(id) : null;
    let row;
    try { row = parser?.parse(line); } catch { row = null; }
    if (row?.skip) { skipped++; return; }
    if (!row?.fields) { unparsed++; return; }
    const fields = row.fields as Fields;
    parsed++;
    formatCounts[id] = (formatCounts[id] || 0) + 1;
    const rawSeverity = String(fields.severity || fields.level || '').toLowerCase();
    const severity = ({ warn: 'warning', information: 'info', fatal: 'critical' } as Record<string, string>)[rawSeverity] || rawSeverity;
    const key = ['emergency', 'alert', 'critical', 'error', 'warning', 'notice', 'info', 'debug', 'trace', 'verbose'].includes(severity) ? severity : 'unknown';
    severityCounts[key] = (severityCounts[key] || 0) + 1;
    const time = timestamp(String(fields.timestamp || fields.time || fields['@timestamp'] || ''));
    if (time === null) ambiguousTimestamps++; else times.push(time);
    if (!summaryOnly && records.length < 200) records.push({ line: index + 1, format: id, fields });
  });
  return { detectedFormat, parsed, unparsed, skipped, formatCounts, severityCounts, ambiguousTimestamps,
    timestampRange: times.length ? { first: new Date(Math.min(...times)).toISOString(), last: new Date(Math.max(...times)).toISOString() } : null,
    records, truncated: !summaryOnly && parsed > records.length, omittedRecords: summaryOnly ? parsed : parsed - records.length,
    note: 'Timezone/year-ambiguous timestamps are excluded from timestampRange; Windows CSV line numbers refer to logical records.' };
}
