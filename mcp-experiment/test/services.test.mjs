import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { inspectSubnet, planSubnets, checkOverlap } from '../dist/network.js';
import { parseLogs } from '../dist/logs.js';
import { domain, publicAddress, lookupDns, checkEmail, checkHttps, resolvePublic } from '../dist/diagnostics.js';
import { ToolFailure } from '../dist/errors.js';
const core = createRequire(import.meta.url)('../../nettools/subnet-core.js');

test('IPv4 edge cases, unsigned conversion, and browser/shared parity', () => {
  assert.equal(inspectSubnet('255.255.255.255/0').addressCount, '4294967296');
  assert.equal(inspectSubnet('192.0.2.1/31').usableHostCount, '2');
  assert.equal(inspectSubnet('192.0.2.1/32').firstUsable, '192.0.2.1');
  assert.equal(inspectSubnet('192.0.2.1/24').lastUsable, '192.0.2.254');
  for (const name of ['subnet-calculator', 'subnet-planner']) {
    const html = fs.readFileSync(new URL(`../../nettools/${name}.html`, import.meta.url), 'utf8');
    const functions = ['isValidIP', 'ipToInt', 'intToIP', 'cidrToMask'].map(fn => html.match(new RegExp(`function ${fn}\\([^)]*\\) \\{[\\s\\S]*?\\n        \\}`))[0]).join('\n');
    const context = vm.createContext({ SubnetCore: core }); vm.runInContext(functions, context);
    for (const ip of ['0.0.0.0', '128.1.2.3', '255.255.255.255']) assert.equal(context.intToIP(context.ipToInt(ip)), ip);
    assert.equal(context.cidrToMask(0), 0); assert.equal(context.isValidIP('01.2.3.4'), false);
  }
});
test('IPv6 exact serialization and allocation exhaustion', () => {
  assert.equal(inspectSubnet('::/0').addressCount, '340282366920938463463374607431768211456');
  assert.equal(inspectSubnet('2001:db8::1/128').lastAddress, '2001:db8::1');
  const plan = planSubnets('192.0.2.0/24', [{ label: 'small', prefix: 26 }, { label: 'large', prefix: 25 }, { label: 'overflow', prefix: 24 }]);
  assert.equal(plan.allocations[0].label, 'overflow'); assert.equal(plan.complete, false);
  const v6 = planSubnets('2001:db8::/48', [{ label: 'a', prefix: 64 }, { label: 'b', prefix: 64 }]);
  assert.equal(v6.allocations[1].cidr, '2001:db8:0:1::/64');
  assert.equal(checkOverlap(['192.0.2.0/24', '192.0.2.128/25', '2001:db8::/64']).overlaps.length, 1);
  assert.throws(() => inspectSubnet('999.0.0.1/24')); assert.throws(() => inspectSubnet('fe80::1%eth0/64'));
});
test('existing log fixtures and mixed inputs are counted without inferred dates', () => {
  for (const name of ['json.log', 'rfc5424.log', 'rfc3164.log', 'apache-common.log', 'apache-combined.log', 'windows-event.csv', 'common-pid.log']) {
    const result = parseLogs(fs.readFileSync(new URL(`../../system/samples/${name}`, import.meta.url), 'utf8'));
    assert.ok(result.parsed > 0, name);
  }
  const mixed = parseLogs('{"level":"ERROR","timestamp":"2026-10-09T10:00:00Z"}\nOct  9 10:00:00 router process: test\nmalformed');
  assert.equal(mixed.parsed, 2); assert.equal(mixed.unparsed, 1); assert.equal(mixed.ambiguousTimestamps, 1);
  assert.equal(mixed.timestampRange.first, '2026-10-09T10:00:00.000Z');
  const many = parseLogs(Array(201).fill('{"level":"INFO"}').join('\n'));
  assert.equal(many.records.length, 200); assert.equal(many.omittedRecords, 1);
  assert.equal(parseLogs('{"hasOwnProperty":"x"}').unparsed, 1);
  assert.throws(() => parseLogs('x'.repeat(262145)));
  assert.throws(() => parseLogs(Array(1002).fill('x').join('\n')));
  assert.throws(() => parseLogs(Array(1001).fill('x').join('\n')));
  assert.equal(parseLogs(Array(1000).fill('{"level":"INFO"}').join('\n') + '\n').parsed, 1000);
});
test('public target validation blocks private and alternative IP representations', () => {
  for (const value of ['127.0.0.1', '10.0.0.1', '169.254.169.254', '::1', 'fc00::1', 'fe80::1', '::ffff:8.8.8.8', '192.0.2.1']) assert.equal(publicAddress(value), false, value);
  assert.equal(publicAddress('8.8.8.8'), true);
  for (const value of ['https://example.com', 'user@example.com', '127.1', 'localhost', 'x.local', 'example.com:443', 'a..com']) assert.throws(() => domain(value), value);
  assert.equal(domain('Example.COM.'), 'example.com');
});
test('DNS errors and absent email records remain explicit', async () => {
  const missing = async () => ({ Status: 3 });
  assert.equal((await lookupDns('example.com', 'A', missing)).status, 3);
  assert.equal((await checkEmail('example.com', missing)).observations.every(o => o.records.length === 0 && o.status === 3), true);
  await assert.rejects(resolvePublic('example.com', missing), /dns_no_address/);
  await assert.rejects(resolvePublic('example.com', async () => ({ Status: 0, Answer: [{ type: 1, data: '169.254.169.254' }] })), /non_public_target/);
});
test('HTTPS redirect validation pins each hop and blocks rebinding', async () => {
  const seen = [];
  const result = await checkHttps('example.com', {
    resolve: async host => { seen.push(host); return '8.8.8.8'; },
    request: async (url, address) => { assert.equal(address, '8.8.8.8'); return { status: url.hostname === 'example.com' ? 302 : 200, location: 'https://www.example.com/', certificate: { authorized: true } }; }
  });
  assert.equal(result.hops.length, 2); assert.deepEqual(seen, ['example.com', 'www.example.com']);
  await assert.rejects(checkHttps('example.com', { resolve: async () => '127.0.0.1' }), /non_public_target/);
  await assert.rejects(checkHttps('example.com', { resolve: async () => '8.8.8.8', request: async () => ({ status: 302, location: 'https://example.com/', certificate: {} }) }), /redirect_loop/);
  await assert.rejects(checkHttps('example.com', { resolve: async () => '8.8.8.8', request: async () => ({ status: 302, location: 'https://169.254.169.254/', certificate: {} }) }), /invalid_public_domain/);
  await assert.rejects(checkHttps('example.com', { resolve: async () => '8.8.8.8', request: async url => ({ status: 302, location: 'https://' + (url.hostname === 'example.com' ? 'a' : 'a' + url.hostname.split('.')[0]) + '.example.com/', certificate: {} }) }), /too_many_redirects/);
  for (const code of ['tls_validation_failed', 'diagnostic_timeout']) await assert.rejects(checkHttps('example.com', { resolve: async () => '8.8.8.8', request: async () => { throw new ToolFailure(code); } }), new RegExp(code));
});
