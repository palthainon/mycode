import { TableClient, RestError } from '@azure/data-tables';
import { DefaultAzureCredential } from '@azure/identity';
import { randomUUID } from 'node:crypto';
import { BulkFailure } from './bulk.js';
export type BulkState={month:string;day:string;monthly:number;daily:number;leaseUntil:number;leaseOwner:string};
export function nextBulkAdmission(state:BulkState|undefined, now:number, owner:string):BulkState {
  if (!Number.isFinite(now) || !owner || (state && (!/^\d{4}-\d{2}$/.test(state.month) || !/^\d{4}-\d{2}-\d{2}$/.test(state.day) || !Number.isInteger(state.monthly) || state.monthly<0 || !Number.isInteger(state.daily) || state.daily<0 || !Number.isFinite(state.leaseUntil) || typeof state.leaseOwner!=='string'))) throw new BulkFailure('invalid_bulk_admission_state');
  const day=new Date(now).toISOString().slice(0,10), month=day.slice(0,7);
  if(state && state.leaseUntil>now) throw new BulkFailure('bulk_busy');
  const monthly=state?.month===month?state.monthly:0, daily=state?.day===day?state.daily:0;
  if(monthly>=120||daily>=4) throw new BulkFailure('bulk_quota_exhausted');
  return {month,day,monthly:monthly+1,daily:daily+1,leaseUntil:now+180000,leaseOwner:owner};
}
export async function reserveBulkRun(endpoint:string) {
  const client=new TableClient(endpoint,'quotas',new DefaultAzureCredential(),{retryOptions:{maxRetries:2},allowInsecureConnection:false});
  const owner=randomUUID();
  for(let attempt=0;attempt<5;attempt++) {
    try {
      let existing; try { existing=await client.getEntity<BulkState>('bulk','admission'); } catch(e) { if((e as RestError).statusCode!==404) throw e; }
      const next=nextBulkAdmission(existing,Date.now(),owner), entity={partitionKey:'bulk',rowKey:'admission',...next};
      if(existing) await client.updateEntity(entity,'Replace',{etag:existing.etag}); else await client.createEntity(entity);
      return async()=> { const current=await client.getEntity<BulkState>('bulk','admission'); if(current.leaseOwner===owner) await client.updateEntity({partitionKey:'bulk',rowKey:'admission',leaseUntil:0,leaseOwner:''},'Merge',{etag:current.etag}); };
    } catch(e) { if(e instanceof BulkFailure) throw e; if(![409,412].includes((e as RestError).statusCode||0)) throw new BulkFailure('bulk_admission_unavailable'); }
  }
  throw new BulkFailure('bulk_admission_contention');
}
