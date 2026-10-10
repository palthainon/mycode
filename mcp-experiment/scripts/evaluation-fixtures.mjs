import { definitions } from '../dist/tools.js';
import { lookupDns, checkEmail, checkHttps, deploymentReadiness } from '../dist/diagnostics.js';
import { ToolFailure } from '../dist/errors.js';
export function installFixtures(cases) {
  const byDomain = new Map(cases.map(c => [c.args.domain, c.fixture]));
  function deps(name) {
    const f = byDomain.get(name) || {}; let requests = 0;
    const resolver = async (host, type) => {
      const status = f.status || 0;
      if (status || f.empty) return { Status: status, AD: f.ad, Answer: [] };
      const types = { A: 1, AAAA: 28, CNAME: 5, MX: 15, TXT: 16, NS: 2, SOA: 6, CAA: 257 };
      let values = [type === 'A' ? '8.8.8.8' : type === 'AAAA' ? '2001:4860:4860::8888' : 'fixture.example.com'];
      if (f.mailRecords !== undefined && ['MX', 'TXT'].includes(type)) values = Array.from({ length: f.mailRecords }, () => type === 'MX' ? '10 mx.example.com' : host.startsWith('_dmarc.') ? 'v=DMARC1; p=none' : 'v=spf1 -all');
      return { Status: status, AD: f.ad, Answer: values.map(data => ({ name: host, type: types[type], TTL: f.ttl || 60, data })) };
    };
    return { resolver, resolve: async () => f.mode === 'private' ? '127.0.0.1' : '8.8.8.8', request: async (url, _address, _signal, method) => {
      if (f.mode === 'tls') throw new ToolFailure('tls_validation_failed'); if (f.mode === 'timeout') throw new ToolFailure('diagnostic_timeout');
      if (f.mode === 'head405') return { status: method === 'GET' ? 200 : 405, certificate: { authorized: true } };
      const locations = { loop: url.href, privateRedirect: 'https://169.254.169.254/', downgrade: 'http://example.com/', credentials: 'https://user:pass@example.com/', port: 'https://example.com:8443/' };
      if (locations[f.mode]) return { status: 302, location: locations[f.mode], certificate: { authorized: true } };
      const redirect = requests++ < (f.redirects || 0);
      return { status: redirect ? f.redirectStatus || 302 : f.httpStatus || 200, location: redirect ? `https://hop${requests}.example.com/` : undefined, certificate: { authorized: true }, headers: f.headers ? { 'strict-transport-security': 'max-age=31536000', 'content-security-policy': "default-src 'self'", 'x-content-type-options': 'nosniff' } : {} };
    } };
  }
  definitions.diagnostics.lookup_dns.run = a => lookupDns(a.domain, a.type, deps(a.domain).resolver);
  definitions.diagnostics.check_email_dns.run = a => checkEmail(a.domain, deps(a.domain).resolver);
  definitions.diagnostics.check_https.run = a => checkHttps(a.domain, deps(a.domain));
  definitions.diagnostics.deployment_readiness.run = a => deploymentReadiness(a.domain, deps(a.domain));
}
