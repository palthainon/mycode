import { z } from 'zod';
import { lookupDns, checkEmail, checkHttps } from './diagnostics.js';
import { parseLogs, formats } from './logs.js';
import { inspectSubnet, planSubnets, checkOverlap } from './network.js';
export type Service = 'diagnostics' | 'logs' | 'network';
export type Definition = { description: string; schema: z.ZodObject<any>; run: (input: any) => unknown | Promise<unknown> };
const name = z.string().min(1).max(253).describe('Public domain name only; no URL, path, port or credentials.');
const cidr = z.string().min(3).max(64).describe('IPv4 or IPv6 CIDR, for example 192.0.2.0/24 or 2001:db8::/48.');
const logSchema = z.object({ text: z.string().min(1).max(262144).describe('Up to 256 KiB and 1,000 log lines; processed transiently.'), format: z.enum(formats).default('auto') }).strict();
export const definitions: Record<Service, Record<string, Definition>> = {
  diagnostics: {
    lookup_dns: { description: 'Look up current public DNS records through Google Public DNS. Returns DNS status, answers, TTLs, observation time and DNSSEC validation flag. Contacts an external resolver.', schema: z.object({ domain: name, type: z.enum(['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA', 'CAA']).default('A') }).strict(), run: a => lookupDns(a.domain, a.type) },
    check_email_dns: { description: 'Inspect a public domain’s MX, SPF and DMARC DNS records. Returns record observations and DNS status, not deliverability or full policy validation. Contacts Google Public DNS.', schema: z.object({ domain: name }).strict(), run: a => checkEmail(a.domain) },
    check_https: { description: 'Check a public domain’s HTTPS root, status, redirects and TLS certificate metadata. Contacts that site on port 443, follows at most three HTTPS redirects, and finishes within ten seconds. No page contents returned.', schema: z.object({ domain: name }).strict(), run: a => checkHttps(a.domain) }
  },
  logs: {
    parse_logs: { description: 'Parse supplied JSON, syslog, Apache/Nginx, Windows Event CSV or common PID logs. Returns up to 200 structured records, format counts and explicit truncation/unparsed counts; maximum 1,000 lines. Input is not retained.', schema: logSchema, run: a => parseLogs(a.text, a.format) },
    summarize_logs: { description: 'Count formats and severities and find unambiguous timestamp ranges in up to 1,000 supplied log lines. Deterministic summary, no AI interpretation; timezone/year-ambiguous timestamps excluded. Input is not retained.', schema: logSchema, run: a => parseLogs(a.text, a.format, true) }
  },
  network: {
    inspect_subnet: { description: 'Calculate IPv4/IPv6 CIDR boundaries and exact address counts, serialized as decimal strings. IPv4 includes mask and usable-host bounds, with /31 and /32 handling.', schema: z.object({ cidr }).strict(), run: a => inspectSubnet(a.cidr) },
    plan_subnets: { description: 'Allocate up to 100 labeled prefix requests within an IPv4/IPv6 parent. Largest blocks first; returns allocations, exact remaining addresses, and explicit insufficient-capacity results.', schema: z.object({ parent: cidr, requests: z.array(z.object({ label: z.string().max(80), prefix: z.number().int().min(0).max(128) }).strict()).min(1).max(100) }).strict(), run: a => planSubnets(a.parent, a.requests) },
    check_cidr_overlap: { description: 'Detect overlapping ranges among up to 100 IPv4/IPv6 CIDRs. Returns normalized subnets and overlapping input-index pairs; IPv4 and IPv6 are compared separately.', schema: z.object({ cidrs: z.array(cidr).min(1).max(100) }).strict(), run: a => checkOverlap(a.cidrs) }
  }
};
