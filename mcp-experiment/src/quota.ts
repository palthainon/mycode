import { TableClient, RestError } from '@azure/data-tables';
import { DefaultAzureCredential } from '@azure/identity';
export interface Quota { take(key: string, limit: number): Promise<boolean>; }
export class MemoryQuota implements Quota {
  private counts = new Map<string, number>();
  async take(key: string, limit: number) {
    if (this.counts.size > 10000) this.counts.clear();
    const count = this.counts.get(key) || 0;
    if (count >= limit) return false;
    this.counts.set(key, count + 1); return true;
  }
}
export class AzureQuota implements Quota {
  private client: TableClient;
  constructor(endpoint: string) { this.client = new TableClient(endpoint, 'quotas', new DefaultAzureCredential(), { retryOptions: { maxRetries: 2 }, allowInsecureConnection: false }); }
  async take(key: string, limit: number) {
    for (let retry = 0; retry < 8; retry++) {
      try {
        let existing;
        try { existing = await this.client.getEntity<{ count: number }>('daily', key); }
        catch (e) { if ((e as RestError).statusCode !== 404) throw e; }
        if (!existing) await this.client.createEntity({ partitionKey: 'daily', rowKey: key, count: 1 });
        else {
          if (existing.count >= limit) return false;
          await this.client.updateEntity({ partitionKey: 'daily', rowKey: key, count: existing.count + 1 }, 'Replace', { etag: existing.etag });
        }
        return true;
      } catch (e) { if (![409, 412].includes((e as RestError).statusCode || 0)) throw e; }
    }
    throw new Error('quota_contention');
  }
}
export class RateLimits {
  private counts = new Map<string, { minute: number; http: number; tool: number }>();
  take(source: string, tool = false) {
    const minute = Math.floor(Date.now() / 60000);
    let entry = this.counts.get(source);
    if (!entry || entry.minute !== minute) {
      if (this.counts.size >= 10000) {
        for (const [key, value] of this.counts) if (value.minute !== minute) this.counts.delete(key);
        if (this.counts.size >= 10000) return false;
      }
      entry = { minute, http: 0, tool: 0 }; this.counts.set(source, entry);
    }
    if (this.counts.size > 10000) for (const [key, value] of this.counts) if (value.minute !== minute) this.counts.delete(key);
    if (this.counts.size > 10000) return false;
    if (tool) return ++entry.tool <= 10;
    return ++entry.http <= 60;
  }
}
