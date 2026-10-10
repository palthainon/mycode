import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const out=process.env.BULK_EVAL_RUN||'reports/bulk-2026-10-10';
if(fs.existsSync(`${out}/summary.json`)) throw new Error('Use a fresh run directory; preserve previous evidence.');
fs.mkdirSync(out,{recursive:true});
const cases=[];
for(const records of [1000,10000,100000,1000000]) {
 const cidrs=Math.min(records,100000), file=`${out}/${records}.json`;
 const run=spawnSync(process.execPath,['--max-old-space-size=256','dist/bulk-worker.js','--synthetic','--records',String(records),'--cidrs',String(cidrs),'--output',file],{encoding:'utf8',timeout:180000,maxBuffer:100000});
 assert.equal(run.status,0,run.stderr);
 const report=JSON.parse(fs.readFileSync(file,'utf8'));
 assert.equal(report.logs.parsed,records*0.99);assert.equal(report.logs.unparsed,records*0.01);
 assert.equal(report.logs.logicalRecords,records+1);assert.equal(report.logs.skipped,1);
 const n=BigInt(cidrs/2);assert.equal(report.network.overlapCount,(n*(n-1n)).toString());
 assert.equal(report.logs.learningDigest.freeTextIncluded,false);
 assert.ok(!JSON.stringify(report).includes('SECRET_SENTINEL_20261010'));assert.ok(!JSON.stringify(report).includes('admin@example.invalid'));
 cases.push({records,cidrs,inputBytes:report.logs.inputBytes,parsed:report.logs.parsed,unparsed:report.logs.unparsed,overlapCount:report.network.overlapCount,...report.metrics,reportBytes:fs.statSync(file).size,passed:true});
 console.log(`${records} records / ${cidrs} CIDRs: exact totals passed (${report.metrics.durationMs}ms).`);
}
fs.writeFileSync(`${out}/summary.json`,JSON.stringify({at:new Date().toISOString(),environment:'local synthetic; Node heap capped at 256 MiB; RSS sampled',node:process.version,cases,modelUsed:false},null,2)+'\n');
