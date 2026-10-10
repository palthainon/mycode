import fs from 'node:fs';
import { parseArgs } from 'node:util';
import { performance } from 'node:perf_hooks';
import { BulkFailure, summarizeBulkLogs, summarizeBulkOverlap, draftBulkLessons } from './bulk.js';
import { reserveBulkRun } from './bulk-admission.js';
async function* synthetic(count:number) {
  let text='';
  for(let i=0;i<count;i++) {
    text+=i%100===99?'malformed private sentinel\n':JSON.stringify({level:i%10?'INFO':'ERROR',time:'2026-10-10T00:00:00Z',message:i%1000?'synthetic log':'BULK_PRIVATE_SENTINEL_20261010 user=admin@example.invalid token=SECRET_SENTINEL_20261010'})+'\n';
    if(text.length>32000) { yield Buffer.from(text); text=''; }
  }
  if(text) yield Buffer.from(text);
}
async function main() {
  const {values}=parseArgs({options:{synthetic:{type:'boolean'},input:{type:'string'},format:{type:'string',default:'auto'},records:{type:'string',default:'100000'},cidrs:{type:'string',default:'10000'},output:{type:'string'}}});
  const count=Number(values.records),cidrCount=Number(values.cidrs),cloud=process.env.BULK_CLOUD==='true';
  if(!Number.isInteger(count)||count<1||count>1_000_000||!Number.isInteger(cidrCount)||cidrCount<0||cidrCount>100000) throw new BulkFailure('invalid_workload_size');
  if(Boolean(values.synthetic)===Boolean(values.input)) throw new BulkFailure('select_synthetic_or_local_input');
  if(cloud && (!values.synthetic||values.input||values.output||count>100000||cidrCount>10000)) throw new BulkFailure('cloud_synthetic_only');
  let release:(()=>Promise<void>)|undefined;
  if(cloud) {
    const end=Date.parse(process.env.EXPERIMENT_END||'');
    if(!Number.isFinite(end)||Date.now()>=end) throw new BulkFailure('experiment_ended');
    if(!process.env.TABLE_ENDPOINT) throw new BulkFailure('bulk_admission_unavailable');
    release=await reserveBulkRun(process.env.TABLE_ENDPOINT);
  }
  const started=performance.now(),deadline=Date.now()+160000;
  try {
    const chunks=values.synthetic?synthetic(count):fs.createReadStream(values.input!,{highWaterMark:65536});
    const logs=await summarizeBulkLogs(chunks,values.format,deadline);
    const network=summarizeBulkOverlap((function*(){for(let i=0;i<cidrCount;i++) yield i%2?'2001:db8::/64':'192.0.2.0/24';})(),deadline);
    const report={at:new Date().toISOString(),synthetic:!!values.synthetic,cloud,logs,network,lessons:draftBulkLessons(logs),metrics:{durationMs:Math.round(performance.now()-started),peakRssBytes:Math.max(logs.peakRssBytes,process.memoryUsage().rss)},modelUsed:false};
    if(values.output) fs.writeFileSync(values.output,JSON.stringify(report,null,2)+'\n',{mode:0o600});
    console.log(JSON.stringify(report));
  } finally { if(release) await release(); }
}
main().catch(error=>{console.error(JSON.stringify({outcome:'failed',code:error instanceof BulkFailure?error.code:'bulk_worker_failed'}));process.exitCode=1;});
