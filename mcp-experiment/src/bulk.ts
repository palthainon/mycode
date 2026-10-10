import { createRequire } from 'node:module';
import { logTimestamp, formats } from './logs.js';
import { parseSubnet, type Subnet } from './network.js';
const core = createRequire(import.meta.url)('../../system/logparser-core.js');
export class BulkFailure extends Error { constructor(public code: string) { super(code); } }
export const bulkLimits = { bytes: 128 * 1024 * 1024, records: 1_000_000, recordBytes: 262144, chunkBytes: 65536, cidrs: 100000, evidence: 20 } as const;
const severities = new Set(['emergency','alert','critical','error','warning','notice','info','debug','trace','verbose']);
const severityAliases: Record<string,string> = { warn: 'warning', information: 'info', fatal: 'critical' };
// This projection never retains arbitrary field names/values. Detection counts are advisory,
// not an assertion that the input has been anonymized or is safe to send to a model.
export function privacyCategories(text: string) {
  // Only advisory metadata: cap scan work. All free text is excluded regardless.
  text = text.slice(0,4096);
  const kinds = [];
  if (/(?:password|passwd|token|api[_-]?key|authorization|cookie|secret|connectionstring)\s*["']?\s*[:=]|-----BEGIN .*PRIVATE KEY-----/i.test(text)) kinds.push('credential');
  if (text.includes('@') && /[\w.+-]{1,64}@[\w.-]{1,253}\.[A-Za-z]{2,63}/.test(text)) kinds.push('email');
  if (/\b(?:\d{1,3}\.){3}\d{1,3}\b|\b[0-9a-f]{0,4}:[0-9a-f:]{1,40}:[0-9a-f]{0,4}\b/i.test(text)) kinds.push('address');
  return kinds;
}
class Framer {
  private pending = ''; private scan = 0; private quoted = false;
  constructor(private csv: boolean) {}
  *feed(text: string): Generator<string> {
    this.pending += text;
    for (; this.scan < this.pending.length; this.scan++) {
      const ch = this.pending[this.scan];
      if (this.csv && ch === '"') this.quoted = !this.quoted;
      if (ch === '\n' && (!this.csv || !this.quoted)) {
        const row = this.pending.slice(0, this.scan);
        if (Buffer.byteLength(row) > bulkLimits.recordBytes) throw new BulkFailure('record_too_large');
        this.pending = this.pending.slice(this.scan + 1); this.scan = -1;
        yield this.csv ? row : row.replace(/\r$/, '');
      }
    }
    if (Buffer.byteLength(this.pending) > bulkLimits.recordBytes) throw new BulkFailure('record_too_large');
  }
  *finish() { if (!this.csv || this.pending.trim()) yield this.pending; }
}
export async function summarizeBulkLogs(chunks: AsyncIterable<Uint8Array>, format = 'auto', deadline = Infinity) {
  if (!(formats as readonly string[]).includes(format)) throw new BulkFailure('unknown_format');
  const decoder = new TextDecoder('utf-8', { fatal: true });
  const counts = { parsed:0, unparsed:0, skipped:0, ambiguousTimestamps:0 };
  const formatCounts: Record<string,number> = Object.create(null), severityCounts: Record<string,number> = Object.create(null);
  const sensitiveRecordCounts: Record<string,number> = { credential:0, email:0, address:0 };
  const evidence: { recordIndex:number; format:string; severity:string }[] = [];
  let inputBytes=0, records=0, first=Infinity, last=-Infinity, detectedFormat: string|null = format === 'auto' ? null : format;
  let probe='', framer:Framer|undefined, peakRssBytes=process.memoryUsage().rss;
  function check() { if (Date.now() > deadline) throw new BulkFailure('deadline_exceeded'); }
  function accept(row:string) {
    check(); records++; if (records > bulkLimits.records + 1 || (records > bulkLimits.records && row.trim())) throw new BulkFailure('too_many_records');
    if (!row.trim()) { counts.skipped++; return; }
    for (const category of privacyCategories(row)) sensitiveRecordCounts[category]++;
    const id = format === 'auto' && detectedFormat !== 'windows-event' ? core.autoDetect([row]) : detectedFormat;
    let record; try { record=core.getParser(id)?.parse(row); } catch { record=null; }
    if (record?.skip) { counts.skipped++; return; }
    if (!record?.fields) { counts.unparsed++; return; }
    counts.parsed++; formatCounts[id]=(formatCounts[id]||0)+1;
    const fields=record.fields;
    const raw=String(fields.severity||fields.level||'').toLowerCase();
    const normalized=severityAliases[raw]||raw, severity=severities.has(normalized)?normalized:'unknown';
    severityCounts[severity]=(severityCounts[severity]||0)+1;
    const time=logTimestamp(String(fields.timestamp||fields.time||fields['@timestamp']||''));
    if (time===null) counts.ambiguousTimestamps++; else { first=Math.min(first,time); last=Math.max(last,time); }
    if (evidence.length < bulkLimits.evidence) evidence.push({recordIndex:records,format:id,severity});
    if (records % 1024 === 0) peakRssBytes=Math.max(peakRssBytes,process.memoryUsage().rss);
  }
  function feed(text:string, final=false) {
    if (!framer) {
      probe+=text;
      if (Buffer.byteLength(probe) > 10*bulkLimits.recordBytes+bulkLimits.chunkBytes) throw new BulkFailure('detection_sample_too_large');
      if (!final && probe.split('\n').length < 11) return;
      detectedFormat=format==='auto'?core.autoDetect(probe.split(/\r?\n/).slice(0,10)):format;
      framer=new Framer(detectedFormat==='windows-event'); text=probe; probe='';
    }
    for (const row of framer.feed(text)) accept(row);
    if (final) for (const row of framer.finish()) accept(row);
  }
  try {
    for await (const chunk of chunks) {
      check(); if (chunk.byteLength>bulkLimits.chunkBytes) throw new BulkFailure('chunk_too_large');
      inputBytes+=chunk.byteLength; if (inputBytes>bulkLimits.bytes) throw new BulkFailure('input_too_large');
      feed(decoder.decode(chunk,{stream:true}));
    }
    feed(decoder.decode(),true);
  } catch (error) { if (error instanceof BulkFailure) throw error; throw new BulkFailure('input_or_decode_failed'); }
  peakRssBytes=Math.max(peakRssBytes,process.memoryUsage().rss);
  const learningDigest={ schemaVersion:'bulk-learning-1', privacyVersion:'metadata-only-1', ...counts, formatCounts, severityCounts, sensitiveRecordCounts,
    privateFieldsExcluded:true, freeTextIncluded:false, timestampValuesIncluded:false };
  return {schemaVersion:'bulk-logs-1',parserVersion:'logparser-core-v1.1',detectedFormat,inputBytes,logicalRecords:records,...counts,
    formatCounts,severityCounts,timestampRange:Number.isFinite(first)?{first:new Date(first).toISOString(),last:new Date(last).toISOString()}:null,
    evidence,omittedEvidence:Math.max(0,counts.parsed-evidence.length),learningDigest,peakRssBytes,
    admin:{summary:`${counts.parsed} parsed; ${counts.unparsed} unparsed; ${counts.skipped} skipped.`,
      nextSteps:counts.unparsed?['Review unsupported formats locally; contribute only reviewed synthetic fixtures.']:['Use exact counts for reporting.'],
      limitations:['Evidence contains indices and fixed categories only. Detection counters are incomplete privacy heuristics. No input fields or free text are retained.','Timezone/year-ambiguous timestamps are excluded; CSV indices identify logical records.']}};
}
type Interval = Pick<Subnet,'version'|'start'|'end'> & { index:number };
// Sorted sweep + min-heap counts all active intervals without emitting every pair.
export function summarizeBulkOverlap(cidrs: Iterable<string>, deadline=Infinity) {
  const intervals:Interval[]=[]; let index=0;
  for (const cidr of cidrs) {
    if (Date.now()>deadline) throw new BulkFailure('deadline_exceeded');
    if (index>=bulkLimits.cidrs) throw new BulkFailure('too_many_cidrs');
    if (typeof cidr!=='string' || cidr.length>64) throw new BulkFailure('invalid_cidr');
    let subnet; try { subnet=parseSubnet(cidr); } catch { throw new BulkFailure('invalid_cidr'); }
    intervals.push({version:subnet.version,start:subnet.start,end:subnet.end,index:index++});
  }
  intervals.sort((a,b)=>a.version-b.version || (a.start<b.start?-1:a.start>b.start?1:0) || a.index-b.index);
  const heap:Interval[]=[], evidence:{firstIndex:number;secondIndex:number}[]=[];
  let overlaps=0n, family=0;
  function add(value:Interval) { heap.push(value); let i=heap.length-1; while(i>0) { const p=(i-1)>>1; if(heap[p].end<=heap[i].end) break; [heap[p],heap[i]]=[heap[i],heap[p]]; i=p; } }
  function pop() { const last=heap.pop()!; if(!heap.length) return; heap[0]=last; let i=0; while(true) { const left=i*2+1,right=left+1; if(left>=heap.length) break; const child=right<heap.length&&heap[right].end<heap[left].end?right:left; if(heap[i].end<=heap[child].end) break; [heap[i],heap[child]]=[heap[child],heap[i]]; i=child; } }
  for (const item of intervals) {
    if(Date.now()>deadline) throw new BulkFailure('deadline_exceeded');
    if(family!==item.version) { heap.length=0; family=item.version; }
    while(heap.length && heap[0].end<item.start) pop();
    overlaps+=BigInt(heap.length);
    for(let i=0;i<heap.length&&evidence.length<bulkLimits.evidence;i++) evidence.push({firstIndex:Math.min(item.index,heap[i].index),secondIndex:Math.max(item.index,heap[i].index)});
    add(item);
  }
  return {schemaVersion:'bulk-overlap-1',cidrCount:index,overlapCount:overlaps.toString(),hasOverlap:overlaps>0n,evidence,
    omittedOverlaps:(overlaps-BigInt(evidence.length)).toString(),truncated:overlaps>BigInt(evidence.length),
    learningDigest:{schemaVersion:'bulk-learning-1',privacyVersion:'metadata-only-1',cidrCount:index,overlapCount:overlaps.toString(),privateFieldsExcluded:true,freeTextIncluded:false},
    admin:{summary:`${index} CIDRs; ${overlaps} overlapping pairs.`,nextSteps:overlaps>0n?['Review overlapping source indices in the authorized local inventory.']:['Use this complete admitted inventory result for validation.'],limitations:['Exact decimal counts; evidence is capped at 20 index pairs. Input addresses and labels are excluded from this report.','A complete global inventory is sorted in memory; maximum 100,000 CIDRs.']}};
}
export function draftBulkLessons(logs:Awaited<ReturnType<typeof summarizeBulkLogs>>) {
  const drafts=[];
  if(logs.unparsed) drafts.push({lessonId:'unsupported-format',status:'draft',sampleCount:logs.unparsed,denominator:logs.parsed+logs.unparsed,
    evidenceId:'aggregate.unparsed',observation:'Some records were not parsed.',hypothesis:'A supported-format gap or malformed input may explain the count.',proposedChange:'Review locally and add a synthetic parser regression fixture.',uncertainty:'Raw inputs are excluded; cause is unknown.'});
  if(logs.ambiguousTimestamps) drafts.push({lessonId:'timestamp-uncertainty',status:'draft',sampleCount:logs.ambiguousTimestamps,denominator:logs.parsed,
    evidenceId:'aggregate.ambiguousTimestamps',observation:'Parsed records lacked an accepted explicit timestamp.',hypothesis:'Examples may need clearer year/timezone requirements.',proposedChange:'Evaluate an onboarding example with a held-out timestamp fixture.',uncertainty:'No date values or exact causes were retained.'});
  return {generator:'deterministic-rules-1',modelUsed:false,privacyVersion:'metadata-only-1',drafts,requiresReview:true};
}
