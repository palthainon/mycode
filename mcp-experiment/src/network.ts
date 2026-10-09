import ipaddr from 'ipaddr.js';
import { createRequire } from 'node:module';
import { ToolFailure } from './errors.js';
const require = createRequire(import.meta.url);
const ipv4 = require('../../nettools/subnet-core.js');
type Subnet = { version: 4 | 6; bits: number; prefix: number; start: bigint; end: bigint; size: bigint };

function parse(cidr: string): Subnet {
  try {
    if (!/^[0-9a-fA-F:.]+\/(?:0|[1-9]\d{0,2})$/.test(cidr)) throw new Error();
    const [address, prefix] = ipaddr.parseCIDR(cidr);
    const version = address.kind() === 'ipv4' ? 4 : 6;
    if (version === 4 && !ipv4.isValidIP(cidr.split('/')[0])) throw new Error();
    const bits = version === 4 ? 32 : 128;
    const value = version === 4 ? BigInt(ipv4.ipToInt(cidr.split('/')[0])) : address.toByteArray().reduce((n, b) => (n << 8n) | BigInt(b), 0n);
    const size = 1n << BigInt(bits - prefix);
    const start = value / size * size;
    return { version, bits, prefix, start, size, end: start + size - 1n };
  } catch { throw new ToolFailure('invalid_cidr'); }
}
function format(value: bigint, version: 4 | 6) {
  if (version === 4) return ipv4.intToIP(Number(value));
  const bytes = Array.from({ length: 16 }, (_, i) => Number((value >> BigInt((15 - i) * 8)) & 255n));
  return ipaddr.fromByteArray(bytes).toString();
}
function describe(s: Subnet) {
  return {
    version: s.version, cidr: `${format(s.start, s.version)}/${s.prefix}`, prefix: s.prefix,
    firstAddress: format(s.start, s.version), lastAddress: format(s.end, s.version), addressCount: s.size.toString(),
    ...(s.version === 4 ? {
      netmask: ipv4.intToIP(ipv4.cidrToMask(s.prefix)),
      usableHostCount: (s.prefix < 31 ? s.size - 2n : s.size).toString(),
      firstUsable: format(s.prefix < 31 ? s.start + 1n : s.start, 4),
      lastUsable: format(s.prefix < 31 ? s.end - 1n : s.end, 4),
      broadcast: s.prefix < 31 ? format(s.end, 4) : null
    } : { note: 'IPv6 has no broadcast address; addressCount includes the complete prefix.' })
  };
}
export function inspectSubnet(cidr: string) { return describe(parse(cidr)); }
export function planSubnets(parent: string, requests: { label: string; prefix: number }[]) {
  const pool = parse(parent);
  if (requests.length > 100 || requests.some(r => !Number.isInteger(r.prefix) || r.prefix < pool.prefix || r.prefix > pool.bits)) throw new ToolFailure('invalid_allocation_prefix');
  let cursor = pool.start;
  const allocations = requests.map((r, index) => ({ ...r, index })).sort((a, b) => a.prefix - b.prefix || a.index - b.index).map(r => {
    const size = 1n << BigInt(pool.bits - r.prefix);
    const start = (cursor + size - 1n) / size * size;
    if (start + size - 1n > pool.end) return { ...r, allocated: false, error: 'insufficient_capacity' };
    cursor = start + size;
    return { ...r, allocated: true, ...describe({ ...pool, prefix: r.prefix, start, end: start + size - 1n, size }) };
  });
  return { parent: describe(pool), complete: allocations.every(a => a.allocated), allocations, freeAddressCount: (pool.end - cursor + 1n).toString() };
}
export function checkOverlap(cidrs: string[]) {
  if (cidrs.length > 100) throw new ToolFailure('too_many_cidrs');
  const subnets = cidrs.map(parse);
  const overlaps = [];
  for (let i = 0; i < subnets.length; i++) for (let j = i + 1; j < subnets.length; j++) {
    const a = subnets[i], b = subnets[j];
    if (a.version === b.version && a.start <= b.end && b.start <= a.end) overlaps.push({ firstIndex: i, secondIndex: j, first: describe(a).cidr, second: describe(b).cidr });
  }
  return { subnets: subnets.map(describe), overlaps, hasOverlap: overlaps.length > 0 };
}
