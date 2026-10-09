import { createHmac } from 'node:crypto';
export type Event = {
  service: string; method: string; tool: string; outcome: string; phase: string;
  caller: string; internal: boolean; durationMs: number; inputBytes: number; outputBytes: number;
  clientName?: string; clientVersion?: string; count?: number;
};
export function callerId(ip: string, agent: string, secret: string) {
  return createHmac('sha256', secret).update(`${ip}\n${agent.toLowerCase().slice(0, 256)}`).digest('hex');
}
export function label(value: unknown) { return typeof value === 'string' ? value.replace(/[^a-zA-Z0-9 ._/-]/g, '').slice(0, 64) : ''; }
export class Telemetry {
  private queue: object[] = [];
  private probeCounts = new Map<string, number>();
  private connection: Record<string, string>;
  private timer: NodeJS.Timeout;
  private dropped = 0;
  constructor(connectionString = '', private sink?: (event: Event) => void) {
    this.connection = Object.fromEntries(connectionString.split(';').filter(Boolean).map(p => { const i = p.indexOf('='); return [p.slice(0, i), p.slice(i + 1)]; }));
    this.timer = setInterval(() => void this.flush(), 15000); this.timer.unref();
  }
  record(event: Event) {
    this.sink?.(event);
    if (!this.connection.InstrumentationKey) return;
    if (this.queue.length >= 2000) { this.dropped++; return; }
    this.queue.push({ name: 'Microsoft.ApplicationInsights.Event', time: new Date().toISOString(), iKey: this.connection.InstrumentationKey,
      tags: { 'ai.cloud.role': 'oldweb-mcp', 'ai.location.ip': '0.0.0.0' },
      data: { baseType: 'EventData', baseData: { ver: 2, name: 'mcp_activity', properties: {
        service: event.service, method: event.method, tool: event.tool, outcome: event.outcome, phase: event.phase,
        caller: event.caller, internal: String(event.internal), clientName: event.clientName || '', clientVersion: event.clientVersion || ''
      }, measurements: { durationMs: event.durationMs, inputBytes: event.inputBytes, outputBytes: event.outputBytes, count: event.count || 1 } } }
    });
  }
  probe(service: string, outcome: string, internal = false) { const key = `${service}:${outcome}:${internal}`; this.probeCounts.set(key, (this.probeCounts.get(key) || 0) + 1); }
  async flush() {
    for (const [key, count] of this.probeCounts) { const [service, outcome, internal] = key.split(':'); this.record({ service, outcome, count, method: 'probe', tool: '', phase: 'aggregate', caller: '', internal: internal === 'true', durationMs: 0, inputBytes: 0, outputBytes: 0 }); }
    this.probeCounts.clear();
    if (this.dropped) { const count = this.dropped; this.dropped = 0; this.record({ service: 'all', outcome: 'telemetry_gap', count, method: 'system', tool: '', phase: 'aggregate', caller: '', internal: false, durationMs: 0, inputBytes: 0, outputBytes: 0 }); }
    const events = this.queue.splice(0, 2000);
    if (!events.length) return;
    try {
      const response = await fetch(`${(this.connection.IngestionEndpoint || 'https://dc.services.visualstudio.com').replace(/\/$/, '')}/v2/track`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(events), signal: AbortSignal.timeout(5000) });
      if (!response.ok || response.status === 206) this.dropped += events.length;
    } catch { this.dropped += events.length; }
  }
  async close() { clearInterval(this.timer); await this.flush(); }
}
