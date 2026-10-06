/*
 * Datacenter Quest - Palo Alto Realm: PAN-OS next-generation firewalls and Panorama.
 * Facts target PAN-OS 10.2 / 11.x at the PCNSA / PCNSE level.
 * See QUEST-AUTHORING.md for the shape every quest file follows.
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('../questions.js'), require('../world.js'));
    else factory(root.QuestQuestions, root.QuestWorld);
})(typeof self !== 'undefined' ? self : this, function (Q, W) {
    'use strict';
    const { pick, randInt, shuffle, fromPool } = Q.util;

    // ---------- shared helpers ----------

    // Every ordering of the letters in `s` except `s` itself, shuffled: wrong answers for sequence questions.
    function wrongOrders(rng, s, n) {
        const perms = [];
        const permute = (rest, acc) => rest.length
            ? rest.forEach((c, i) => permute(rest.slice(0, i).concat(rest.slice(i + 1)), acc + c))
            : perms.push(acc);
        permute(s.split(''), '');
        return shuffle(rng, perms.filter(p => p !== s)).slice(0, n);
    }

    // Pick `k` steps from an ordered list (keeping their order), show them shuffled with
    // letters, and return the letters in the correct order.
    function orderQuestion(rng, steps, k, lead, hint) {
        const chosen = shuffle(rng, steps.map((_, i) => i)).slice(0, k).sort((a, b) => a - b);
        const shown = shuffle(rng, chosen);
        const letters = 'ABCDEF';
        const lines = shown.map((idx, i) => `  ${letters[i]}) ${steps[idx]}`);
        const answer = chosen.map(idx => letters[shown.indexOf(idx)]).join('');
        return {
            q: lead + ' Answer with the letters, like DCBA.\n' + lines.join('\n'),
            answer, norm: 'sequence', distractors: wrongOrders(rng, answer, 8), hint
        };
    }

    const ipPlus = (ip, n) => {
        const p = ip.split('.').map(Number);
        p[3] = Math.min(254, Math.max(1, p[3] + n));
        return p.join('.');
    };

    // ================= ACT 1: firewall fundamentals =================

    const ZONES = [
        ['Which interface type puts the firewall inline between two devices with no IP addresses, no routing and no switching, just two ports bound together?', 'virtual wire',
            ['Layer 2', 'Layer 3', 'tap', 'aggregate ethernet', 'HA', 'decrypt mirror'], 'It behaves like a bump in the cable. Its zones are named after it.', 'text', ['vwire', 'v-wire', 'virtual-wire']],
        ['Which interface type passively receives traffic from a switch SPAN port, so the firewall can see traffic but never block it?', 'tap',
            ['virtual wire', 'Layer 2', 'Layer 3', 'decrypt mirror', 'HA', 'log card'], 'Three letters. You plug it into a mirror port.'],
        ['Which interface type do you need if the firewall must route between subnets, own an IP address, and do NAT on that interface?', 'Layer 3',
            ['Layer 2', 'virtual wire', 'tap', 'HA', 'decrypt mirror', 'log card'], 'Routing happens at a particular OSI layer.', 'text', ['l3', 'layer3', 'layer-3']],
        ['Which interface type bridges ports into one broadcast domain and learns MAC addresses, with no IP address on the ports themselves?', 'Layer 2',
            ['virtual wire', 'Layer 3', 'tap', 'HA', 'aggregate ethernet', 'tunnel'], 'Switching, not routing. Count down from the routing layer.', 'text', ['l2', 'layer2', 'layer-2']],
        ['How many security zones can a single interface (or subinterface) belong to at once?', '1',
            ['2', '3', '4', '8', '16', '0'], 'Zones are how the firewall decides "from where" and "to where". That only works if the answer is unambiguous.', 'int'],
        ['Which zone type connects virtual systems on the same firewall so traffic can pass between them?', 'external',
            ['tunnel', 'Layer 3', 'virtual wire', 'Layer 2', 'tap', 'shared'], 'It sits outside every individual vsys.'],
        ['Besides a security zone, what must a Layer 3 interface be attached to before it can forward traffic? (PAN-OS 10.2 legacy engine name)', 'virtual router',
            ['VLAN object', 'virtual wire object', 'interface management profile', 'zone protection profile', 'tunnel interface', 'QoS profile'], 'It holds the routing table. With the Advanced Routing Engine it is called a logical router.', 'text', ['vr', 'logical router', 'a virtual router']]
    ];

    const DEFAULT_RULES = [
        ['Traffic between two interfaces in the same zone matches none of your rules. Which predefined rule handles it?', 'intrazone-default',
            ['interzone-default', 'implicit-deny', 'any-any', 'cleanup', 'deny-all', 'rule1'], 'Intra means "within". Inter means "between".', 'text', ['intrazone default']],
        ['Traffic from trust to untrust matches none of your rules. Which predefined rule handles it?', 'interzone-default',
            ['intrazone-default', 'implicit-deny', 'any-any', 'cleanup', 'deny-all', 'rule1'], 'Two different zones. Intra means "within", inter means "between".', 'text', ['interzone default']],
        ['What is the default action of the predefined intrazone-default rule?', 'allow',
            ['deny', 'drop', 'reset-both', 'reset-client', 'reset-server', 'alert'], 'Same zone, same trust level. The firewall assumes neighbours may talk.'],
        ['What is the default action of the predefined interzone-default rule?', 'deny',
            ['allow', 'drop', 'reset-both', 'reset-client', 'reset-server', 'alert'], 'Crossing zones is exactly what a firewall is suspicious of.'],
        ['Predefined default rules cannot be edited directly. What do you do to a default rule to enable logging on it?', 'override',
            ['clone', 'delete', 'disable', 'move', 'tag', 'revert'], 'You lay your own settings on top of the factory ones. Revert undoes it.'],
        ['Where are the predefined default rules evaluated relative to the rules you write?', 'last',
            ['first', 'before NAT rules', 'in the middle', 'after the first deny rule', 'alphabetically', 'before any allow rules'], 'They catch whatever nothing else caught.', 'text', ['at the bottom', 'bottom', 'end', 'at the end', 'after all other rules']],
        ['A new security rule is created with no change to its rule type. What type is it?', 'universal',
            ['intrazone', 'interzone', 'default', 'local', 'shared', 'predefined'], 'It matches both within and between the listed zones.'],
        ['Which security rule action applies each application\'s own default deny behavior instead of one fixed behavior?', 'deny',
            ['drop', 'reset-both', 'reset-client', 'reset-server', 'block', 'allow'], 'Some apps prefer a silent drop, some a reset. One action defers to App-ID\'s opinion.']
    ];

    // Generated: a short top-down rulebase and a flow. Which rule matches first?
    const RB_ZONES = ['trust', 'untrust', 'dmz', 'guest'];
    const RB_HOSTS = {
        trust: ['10.1.10.5', '10.1.20.9'],
        untrust: ['198.51.100.7', '203.0.113.80'],
        dmz: ['172.16.1.10', '172.16.1.20'],
        guest: ['192.168.50.10', '192.168.50.11']
    };
    const RB_APPS = ['web-browsing', 'ssl', 'ssh', 'dns', 'smtp', 'ms-rdp'];
    const RB_NAMES = ['web-out', 'dmz-admin', 'guest-lockdown', 'dns-out', 'legacy-rdp', 'mail-relay', 'block-bad', 'temp-vendor', 'jump-box', 'cleanup-old'];

    function genRuleMatch(rng) {
        const names = shuffle(rng, RB_NAMES).slice(0, 5);
        const rules = names.map(name => {
            const from = rng() < 0.15 ? 'any' : pick(rng, RB_ZONES);
            let to = rng() < 0.15 ? 'any' : pick(rng, RB_ZONES.filter(z => z !== from));
            const dst = (to === 'any' || rng() < 0.5) ? 'any' : pick(rng, RB_HOSTS[to]);
            const app = rng() < 0.25 ? 'any' : pick(rng, RB_APPS);
            const action = pick(rng, ['allow', 'allow', 'deny', 'drop', 'reset-both']);
            return { name, from, to, dst, app, action };
        });

        // Usually build the flow from one rule (an earlier rule may still shadow it); sometimes from nothing.
        let flow;
        const t = randInt(rng, 0, 5);
        if (t < 5) {
            const r = rules[t];
            const from = r.from === 'any' ? pick(rng, RB_ZONES) : r.from;
            const to = r.to === 'any' ? pick(rng, RB_ZONES.filter(z => z !== from)) : r.to;
            flow = { from, to, dst: r.dst === 'any' ? pick(rng, RB_HOSTS[to]) : r.dst, app: r.app === 'any' ? pick(rng, RB_APPS) : r.app };
        } else {
            const from = pick(rng, RB_ZONES);
            const to = rng() < 0.5 ? from : pick(rng, RB_ZONES);
            flow = { from, to, dst: pick(rng, RB_HOSTS[to]), app: pick(rng, RB_APPS) };
        }

        const fits = (rv, fv) => rv === 'any' || rv === fv;
        const hit = rules.find(r => fits(r.from, flow.from) && fits(r.to, flow.to) && fits(r.dst, flow.dst) && fits(r.app, flow.app));
        const answer = hit ? hit.name : (flow.from === flow.to ? 'intrazone-default' : 'interzone-default');

        const lines = rules.map((r, i) =>
            `  ${i + 1}. ${r.name.padEnd(15)} ${r.from.padEnd(8)} -> ${r.to.padEnd(8)} dst ${r.dst.padEnd(14)} app ${r.app.padEnd(13)} ${r.action}`);
        return {
            q: 'The Gargoyle unrolls the rulebase of PA-EDGE-01, top to bottom (every rule uses service application-default):\n' +
                lines.join('\n') +
                `\nA new session arrives from zone ${flow.from} to zone ${flow.to}, destination ${flow.dst}, and App-ID identifies it as ${flow.app}. Which rule does it match? Type the rule name.`,
            answer, norm: 'text',
            distractors: names.concat(['intrazone-default', 'interzone-default']).filter(n => n !== answer),
            hint: 'Top down, first match wins, and a rule only matches when every column fits. If nothing fits, the predefined rule that catches it depends on whether the two zones are the same.'
        };
    }

    const COMMIT = [
        ['You changed a rule in the web UI but have not committed. Which configuration holds your change?', 'candidate',
            ['running', 'startup', 'saved', 'backup', 'snapshot', 'default'], 'It is a candidate for becoming real. Not yet.', 'text', ['candidate config', 'candidate configuration']],
        ['Which configuration is the one the firewall is actually enforcing right now?', 'running',
            ['candidate', 'startup', 'saved', 'staged', 'backup', 'factory'], 'It is the one that is up and running.', 'text', ['running config', 'running configuration']],
        ['Which operation activates the candidate configuration so it becomes the running configuration?', 'commit',
            ['save', 'write memory', 'copy run start', 'apply', 'validate', 'load config'], 'There is a big button for it in the top right of the web UI.'],
        ['Which operation checks the candidate configuration for errors without activating it?', 'validate',
            ['commit', 'preview changes', 'revert', 'save', 'test', 'diff'], 'It lives in the Commit dialog, next to Preview Changes. In the CLI it is followed by "full".', 'text', ['validate commit', 'validate full']],
        ['Which operation throws away uncommitted changes and copies the running config back into the candidate?', 'revert',
            ['commit', 'validate', 'rollback', 'load named configuration', 'export', 'delete candidate'], 'In PAN-OS 9.0 and later it is in the Config menu: "___ Changes".', 'text', ['revert changes', 'revert config', 'revert to running configuration']],
        ['Which plane runs the web UI, the CLI, logging, reporting and configuration management?', 'management plane',
            ['dataplane', 'forwarding plane', 'signature plane', 'security plane', 'session plane', 'packet plane'], 'It is where admins manage the box. It has its own CPU, separate from traffic.', 'text', ['management', 'mp', 'control plane']],
        ['Which plane handles signature matching, security processing and packet forwarding?', 'dataplane',
            ['management plane', 'control plane', 'mp', 'signature plane', 'session plane', 'log plane'], 'It is the plane the data goes through.', 'text', ['data plane', 'dp']],
        ['What is the default name of the file that holds the committed configuration the firewall loads at boot?', 'running-config.xml',
            ['candidate-config.xml', 'startup-config.xml', 'config.xml', 'boot.xml', 'saved-config.xml', 'default-config.xml'], 'PAN-OS keeps no separate startup config. The name matches what is running.', 'text', ['running-config']]
    ];

    const LOGS = [
        ['Which log shows session start or end, bytes sent and received, and which security rule allowed or denied the session?', 'traffic',
            ['threat', 'system', 'configuration', 'url filtering', 'unified', 'data filtering'], 'The most common log of all. Every session can write one.', 'text', ['traffic log']],
        ['Which log records an antivirus, anti-spyware or vulnerability signature match?', 'threat',
            ['traffic', 'wildfire submissions', 'url filtering', 'data filtering', 'system', 'configuration'], 'It is named for what the signatures detect.', 'text', ['threat log']],
        ['Which log shows that an admin changed a security rule, and who did it?', 'configuration',
            ['system', 'traffic', 'threat', 'authentication', 'user-id', 'url filtering'], 'It records changes to the config.', 'text', ['config', 'configuration log', 'config log']],
        ['Which log records an HA failover or a content update being installed?', 'system',
            ['configuration', 'traffic', 'threat', 'unified', 'hip match', 'authentication'], 'Events about the firewall itself, not the traffic through it.', 'text', ['system log']],
        ['Which Monitor > Logs page shows the category of each web request a user made?', 'url filtering',
            ['traffic', 'threat', 'data filtering', 'wildfire submissions', 'system', 'user-id'], 'Categories belong to URLs.', 'text', ['url', 'url filtering log']],
        ['Which log records the verdict (benign, grayware, malware or phishing) for a file sent to the cloud sandbox?', 'wildfire submissions',
            ['threat', 'traffic', 'data filtering', 'url filtering', 'system', 'configuration'], 'Named for the sandbox service, plus what you did with the file.', 'text', ['wildfire', 'wildfire submission']],
        ['By default, at what point does a new security rule write its traffic log entry?', 'session end',
            ['session start', 'session start and end', 'every packet', 'never', 'on deny only', 'every 60 seconds'], 'The log needs the byte count and the final App-ID, which you only know later.', 'text', ['at session end', 'end', 'log at session end']],
        ['Which log shows which user was mapped to which IP address, and by which mapping source?', 'user-id',
            ['authentication', 'system', 'traffic', 'hip match', 'configuration', 'globalprotect'], 'It is named after the feature that does the mapping.', 'text', ['userid', 'user id', 'user-id log']]
    ];

    // ================= ACT 2: admin =================

    const APPID = [
        ['Which service setting limits an allowed application to the ports App-ID says it normally uses?', 'application-default',
            ['any', 'service-http', 'service-https', 'tcp-any', 'udp-any', 'select'], 'It defers to the application\'s own default.', 'text', ['application default']],
        ['A TCP session completed its handshake but matched no App-ID signature. What application name appears in the logs?', 'unknown-tcp',
            ['incomplete', 'insufficient-data', 'not-applicable', 'unknown-udp', 'unknown-p2p', 'tcp-any'], 'App-ID does not know what it is, and it is TCP.', 'text', ['unknown tcp']],
        ['Which application name appears in the traffic log for a TCP session whose three-way handshake never completed?', 'incomplete',
            ['unknown-tcp', 'insufficient-data', 'not-applicable', 'unknown-udp', 'tcp-syn', 'half-open'], 'The handshake was never finished.'],
        ['A session was discarded because no rule allowed its port or service, so App-ID never ran. Which application name shows in the traffic log?', 'not-applicable',
            ['unknown-tcp', 'incomplete', 'insufficient-data', 'any', 'denied', 'unknown-udp'], 'Identifying it was never relevant.', 'text', ['not applicable']],
        ['Which object automatically includes every application matching attributes like category, subcategory or risk, and grows as new App-IDs ship?', 'application filter',
            ['application group', 'custom application', 'application override', 'tag', 'dynamic address group', 'URL category'], 'A group is a fixed list. You want a query.', 'text', ['app filter']],
        ['Which policy type labels traffic on a given port as a custom application and skips App-ID and threat inspection for it?', 'application override',
            ['policy based forwarding', 'decryption', 'application filter', 'QoS', 'NAT', 'tunnel inspection'], 'It overrides the identification step entirely. Use it sparingly.', 'text', ['app override', 'application override policy']],
        ['A commit warns that an application you allowed needs another application that your rules do not allow. What is that relationship called?', 'dependency',
            ['implicit use', 'application filter', 'application group', 'application override', 'shadowing', 'inheritance'], 'One app depends on the other to work.', 'text', ['dependencies', 'application dependency']],
        ['Which web UI tool shows the applications actually seen on port-based rules and helps convert them to App-ID based rules?', 'policy optimizer',
            ['ACC', 'App Scope', 'Expedition', 'config audit', 'test policy match', 'BPA'], 'It lives under Policies and optimizes them.']
    ];

    const PROFILES = [
        ['Which security profile blocks command-and-control traffic and can sinkhole DNS queries for known-bad domains?', 'anti-spyware',
            ['antivirus', 'vulnerability protection', 'url filtering', 'file blocking', 'wildfire analysis', 'data filtering'], 'Spyware phones home. This profile hangs up.', 'text', ['antispyware', 'anti spyware']],
        ['Which security profile stops exploit attempts against a vulnerable service, like a buffer overflow in a web app?', 'vulnerability protection',
            ['anti-spyware', 'antivirus', 'zone protection', 'url filtering', 'file blocking', 'dos protection'], 'It protects the vulnerable thing.', 'text', ['vulnerability']],
        ['Which security profile stops users uploading or downloading files by file type, such as .exe or .torrent?', 'file blocking',
            ['antivirus', 'wildfire analysis', 'data filtering', 'url filtering', 'anti-spyware', 'vulnerability protection'], 'It is not looking for malware at all. Just the type.'],
        ['Which security profile forwards unknown files to the cloud sandbox for analysis?', 'wildfire analysis',
            ['antivirus', 'file blocking', 'anti-spyware', 'data filtering', 'vulnerability protection', 'url filtering'], 'The sandbox has a fiery name.', 'text', ['wildfire']],
        ['Which object bundles several security profiles together so a rule can reference them all at once?', 'security profile group',
            ['application group', 'address group', 'service group', 'device group', 'tag', 'template'], 'A group of profiles.', 'text', ['profile group', 'security profile groups']],
        ['Which URL filtering action shows a warning page and lets the user proceed after clicking through?', 'continue',
            ['override', 'alert', 'allow', 'block', 'none', 'reset-client'], 'The button on the page says what to do next.'],
        ['Which URL filtering action allows the site and writes a log entry?', 'alert',
            ['allow', 'continue', 'override', 'block', 'none', 'log'], 'Plain allow does not log. This one raises a quiet flag.'],
        ['Security profiles are only applied to traffic matching rules with which action?', 'allow',
            ['deny', 'drop', 'reset-both', 'reset-client', 'reset-server', 'any action'], 'There is nothing to inspect in traffic that never gets through.']
    ];

    const USERID = [
        ['Which User-ID method reads Windows security event logs on domain controllers to map users to IP addresses?', 'server monitoring',
            ['authentication portal', 'globalprotect', 'syslog parsing', 'xml api', 'client probing', 'terminal server agent'], 'It monitors servers. Specifically, their logon events.', 'text', ['security log monitoring']],
        ['Which component maps many users sharing one IP, on a Citrix or RDS host, by giving each user their own source port range?', 'terminal server agent',
            ['user-id agent', 'server monitoring', 'authentication portal', 'client probing', 'globalprotect', 'xml api'], 'Named for the multi-user servers it runs on.', 'text', ['ts agent', 'terminal services agent', 'terminal server (ts) agent']],
        ['Which method shows unknown users a web login page when no other source can map them? (current name)', 'authentication portal',
            ['globalprotect portal', 'client probing', 'server monitoring', 'xml api', 'syslog parsing', 'terminal server agent'], 'It used to be called Captive Portal.', 'text', ['captive portal', 'auth portal']],
        ['Which User-ID method should stay disabled on untrusted zones because it reaches out to endpoints with WMI or NetBIOS and can leak credentials?', 'client probing',
            ['server monitoring', 'syslog parsing', 'xml api', 'authentication portal', 'globalprotect', 'terminal server agent'], 'The firewall probes the client directly.', 'text', ['wmi probing']],
        ['You must enable User Identification on which object before the firewall maps users for traffic sourced there?', 'zone',
            ['interface', 'virtual router', 'security rule', 'address object', 'server profile', 'VLAN'], 'The same object your security rules use for "from" and "to".', 'text', ['source zone', 'the zone', 'security zone']],
        ['Which feature reads directory groups so you can write rules like "allow group finance"?', 'group mapping',
            ['user mapping', 'authentication profile', 'server monitoring', 'dynamic user group', 'authentication portal', 'address group'], 'User mapping says who is where. This says who belongs to what.'],
        ['Which method lets an external system, like a NAC or a script, push user-to-IP mappings to the firewall over an API?', 'xml api',
            ['syslog parsing', 'server monitoring', 'client probing', 'authentication portal', 'terminal server agent', 'snmp'], 'The PAN-OS API is spoken in angle brackets.', 'text', ['api', 'the xml api']]
    ];

    const GLOBALPROTECT = [
        ['Which GlobalProtect component authenticates the app and hands it its configuration and the list of gateways?', 'portal',
            ['gateway', 'agent', 'satellite', 'clientless vpn', 'hip', 'lsvpn'], 'You knock on this first, then it tells you where to go.', 'text', ['globalprotect portal', 'the portal']],
        ['Which GlobalProtect component terminates the user\'s tunnel and enforces security policy on their traffic?', 'gateway',
            ['portal', 'agent', 'satellite', 'clientless vpn', 'hip', 'lsvpn'], 'Traffic passes through it to reach the network.', 'text', ['globalprotect gateway', 'external gateway', 'the gateway']],
        ['Which GlobalProtect feature collects endpoint posture such as patch level, antivirus status and disk encryption?', 'hip',
            ['split tunnel', 'clientless vpn', 'portal', 'pre-logon', 'satellite', 'mfa'], 'Three letters: host information profile.', 'text', ['host information profile', 'hip check', 'hip checks']],
        ['What do you call a gateway inside the corporate network that does not need a tunnel but still identifies users and collects HIP reports?', 'internal gateway',
            ['external gateway', 'portal', 'satellite', 'clientless vpn', 'manual gateway', 'lsvpn'], 'The opposite of an external one.', 'text', ['internal']],
        ['Which connect method brings the tunnel up automatically as soon as the user logs in to the endpoint?', 'user-logon',
            ['on-demand', 'pre-logon', 'manual', 'sso', 'split tunnel', 'cert-auth'], 'Also described as "always on". It triggers on a user event.', 'text', ['user-logon (always on)', 'user logon', 'always on']],
        ['Which connect method waits for the user to click Connect in the app?', 'on-demand',
            ['user-logon', 'pre-logon', 'always on', 'sso', 'split tunnel', 'scheduled'], 'It connects when demanded.', 'text', ['on demand', 'on-demand (manual user initiated connection)', 'manual']],
        ['Which feature sends only corporate subnets through the GlobalProtect tunnel while internet traffic goes out directly?', 'split tunnel',
            ['full tunnel', 'hip', 'internal gateway', 'clientless vpn', 'pre-logon', 'policy based forwarding'], 'The tunnel is divided between two paths.', 'text', ['split tunneling', 'split-tunnel', 'split tunnelling']]
    ];

    const ZONEPROT = [
        ['Which network profile, attached to a zone, protects that ingress zone from floods, reconnaissance scans and packet-based attacks?', 'zone protection profile',
            ['dos protection profile', 'vulnerability protection profile', 'anti-spyware profile', 'interface management profile', 'QoS profile', 'url filtering profile'], 'It is attached to a zone, and it protects one.', 'text', ['zone protection']],
        ['Which SYN flood action makes the firewall answer the handshake itself and only build sessions that complete it?', 'syn cookies',
            ['random early drop', 'tcp reset', 'drop', 'block ip', 'alert', 'rate limit'], 'A sweet name for a stateless trick.', 'text', ['syn cookie', 'syn-cookies', 'syncookies']],
        ['Which flood protection action drops packets at random once the activate rate is exceeded?', 'random early drop',
            ['syn cookies', 'tcp reset', 'block ip', 'tail drop', 'alert', 'rate limit'], 'Three words, abbreviated RED.', 'text', ['red']],
        ['In a zone protection flood setting, which threshold only triggers an alarm, before any packets are dropped?', 'alarm rate',
            ['activate rate', 'maximum rate', 'block rate', 'warning rate', 'trigger rate', 'threshold rate'], 'The first of three thresholds just makes noise.', 'text', ['alarm']],
        ['In a zone protection flood setting, which threshold is the point where the firewall drops all excess packets?', 'maximum rate',
            ['alarm rate', 'activate rate', 'block rate', 'warning rate', 'trigger rate', 'threshold rate'], 'The last of three thresholds. Nothing above it gets through.', 'text', ['maximum', 'max', 'max rate']],
        ['Which policy type can protect one critical server with per-IP flood thresholds, which a zone-wide profile cannot?', 'dos protection',
            ['zone protection', 'security', 'qos', 'policy based forwarding', 'application override', 'decryption'], 'Denial of service, aimed at specific targets.', 'text', ['dos protection policy', 'dos policy', 'dos']],
        ['Which network profile, applied to an interface, controls whether you can ping it or reach the web UI and SSH on it?', 'interface management profile',
            ['zone protection profile', 'dos protection profile', 'server profile', 'authentication profile', 'certificate profile', 'QoS profile'], 'It permits management services on an interface.', 'text', ['management profile']]
    ];

    // Generated: which zone / address does each policy use in a NAT scenario?
    const OUT_ZONES = ['untrust', 'internet', 'outside'];
    const SRV_ZONES = ['dmz', 'web-dmz', 'servers'];
    const IN_ZONES = ['trust', 'inside', 'users'];
    const ALL_ZONES = OUT_ZONES.concat(SRV_ZONES, IN_ZONES, ['any']);

    function genNat(rng) {
        const out = pick(rng, OUT_ZONES), srv = pick(rng, SRV_ZONES), inz = pick(rng, IN_ZONES);
        const pub = `203.0.113.${randInt(rng, 20, 240)}`;
        const fwIp = `203.0.113.${randInt(rng, 2, 9)}`;
        const priv = `172.16.${randInt(rng, 1, 30)}.${randInt(rng, 10, 240)}`;
        const client = `198.51.100.${randInt(rng, 10, 240)}`;
        const user = `10.${randInt(rng, 1, 50)}.${randInt(rng, 0, 255)}.${randInt(rng, 10, 240)}`;
        const zoneD = ans => ALL_ZONES.filter(z => z !== ans);
        const inbound = `A web server ${priv} lives in zone ${srv}. It is published to the internet as ${pub} with a destination NAT rule; ${pub} routes out ethernet1/1 in zone ${out}. A client at ${client} connects to ${pub}.`;
        const outbound = `Users in zone ${inz} reach the internet through source NAT (DIPP) to ${fwIp}, the IP of ethernet1/1 in zone ${out}. A user at ${user} browses to ${client}.`;
        const zoneHint = 'Security policy sees addresses as the packet arrived, but zones as where it will finally go.';
        const kind = randInt(rng, 0, 4);
        if (kind === 0) {
            return { q: `${inbound}\nIn the security rule that allows this, what is the destination zone?`, answer: srv, norm: 'text', distractors: zoneD(srv), hint: zoneHint };
        }
        if (kind === 1) {
            return {
                q: `${inbound}\nIn the NAT policy rule, what is the destination zone?`, answer: out, norm: 'text', distractors: zoneD(out),
                hint: 'NAT policy is looked up before anything is translated, so the firewall can only use the route to the original destination IP.'
            };
        }
        if (kind === 2) {
            return {
                q: `${inbound}\nIn the security rule that allows this, what destination address do you use?`, answer: pub, norm: 'ipv4',
                distractors: [priv, fwIp, client, ipPlus(pub, 1), ipPlus(pub, -1), ipPlus(priv, 1), '0.0.0.0'], hint: zoneHint
            };
        }
        if (kind === 3) {
            return {
                q: `${outbound}\nWhich source address does the security policy evaluate for this session?`, answer: user, norm: 'ipv4',
                distractors: [fwIp, client, ipPlus(user, 1), ipPlus(user, -1), ipPlus(fwIp, 1), pub, '0.0.0.0'],
                hint: 'Security policy is evaluated before the translation is applied to the packet.'
            };
        }
        return { q: `${outbound}\nIn the security rule that allows this, what is the destination zone?`, answer: out, norm: 'text', distractors: zoneD(out), hint: zoneHint };
    }

    const SNAT_TYPES = [
        ['Which source NAT type lets many internal hosts share one or a few public IPs by also translating source ports?', 'dynamic ip and port',
            ['dynamic ip', 'static ip', 'destination nat', 'u-turn nat', 'no-nat', 'nptv6'], 'The type that translates both the IP and the port.', 'text', ['dipp', 'dynamic ip and port (dipp)', 'dynamic-ip-and-port']],
        ['Which source NAT type hands out the next free address from a pool, keeps the original source port, and fails new sessions when the pool runs out?', 'dynamic ip',
            ['dynamic ip and port', 'static ip', 'destination nat', 'u-turn nat', 'no-nat', 'nptv6'], 'Like DIPP, minus the port part.', 'text', ['dynamic-ip']],
        ['Which source NAT type gives a fixed one-to-one mapping and has an option to make it bi-directional?', 'static ip',
            ['dynamic ip', 'dynamic ip and port', 'destination nat', 'u-turn nat', 'no-nat', 'nptv6'], 'The mapping never changes.', 'text', ['static', 'static-ip']],
        ['Dynamic IP NAT can fall back to another translation type when its pool is exhausted. Which type?', 'dynamic ip and port',
            ['static ip', 'destination nat', 'no-nat', 'u-turn nat', 'nptv6', 'policy based forwarding'], 'The fallback shares addresses by also translating ports.', 'text', ['dipp', 'dynamic-ip-and-port']],
        ['How many source ports does DIPP have available per translated IP, using ports 1024 through 65535?', '64512',
            ['65535', '65536', '64000', '64511', '63488', '32768'], 'Count from 1024 to 65535 inclusive.', 'int']
    ];

    // PAN KB "How to Check the NAT Buffer Pool": 65536 ports minus the reserved first 1024
    // leaves 64512 per DIPP IP; multiply by the oversubscription ratio (1x/2x/4x/8x)
    const PORTS_PER_IP = 64512;

    function genSnat(rng) {
        const kind = randInt(rng, 0, 4);
        if (kind <= 1) {
            const start = randInt(rng, 10, 200), n = randInt(rng, 2, 12), k = pick(rng, [1, 2, 4, 8]);
            const answer = n * PORTS_PER_IP * k;
            return {
                q: `The Doppelganger juggles a DIPP pool of 203.0.113.${start}-203.0.113.${start + n - 1}. Assume each translated IP offers ${PORTS_PER_IP.toLocaleString('en-US')} source ports (1024-65535) and DIPP oversubscription is ${k}x. How many concurrent translated sessions can the pool hold at most?`,
                answer: String(answer), norm: 'int',
                distractors: [n * 65535 * k, n * 65536 * k, (n - 1) * PORTS_PER_IP * k, (n + 1) * PORTS_PER_IP * k, n * 64000 * k, k === 1 ? n * PORTS_PER_IP * 2 : n * PORTS_PER_IP, n * 65535].map(String),
                hint: 'Count the addresses in the range (both ends included), then multiply by the ports per IP and by the oversubscription factor.'
            };
        }
        if (kind === 2) {
            const sessions = randInt(rng, 100, 1500) * 1000 + randInt(rng, 1, 999);
            const answer = Math.ceil(sessions / PORTS_PER_IP);
            return {
                q: `Peak load is ${sessions.toLocaleString('en-US')} concurrent outbound sessions. With DIPP, oversubscription at 1x and ${PORTS_PER_IP.toLocaleString('en-US')} usable source ports per translated IP, what is the fewest translated IPs the pool needs?`,
                answer: String(answer), norm: 'int',
                distractors: [answer - 1, answer + 1, Math.ceil(sessions / 65535) === answer ? answer + 2 : Math.ceil(sessions / 65535), Math.floor(sessions / 1000 / 64), answer * 2, Math.ceil(answer / 2)].map(String),
                hint: 'Divide sessions by ports per IP, and remember you cannot buy part of an IP address.'
            };
        }
        return fromPool(SNAT_TYPES, 'text')(rng);
    }

    // ================= ACT 3: senior =================

    const HA = [
        ['Which HA link carries hellos, heartbeats and HA state between the peers (the control link)?', 'ha1',
            ['ha2', 'ha3', 'ha4', 'ha2-backup', 'management', 'aux'], 'The first HA link is the control link.', 'text', ['ha-1', 'ha1 link']],
        ['Which HA link synchronizes sessions, forwarding tables, IPSec SAs and ARP tables?', 'ha2',
            ['ha1', 'ha3', 'ha4', 'ha1-backup', 'management', 'aux'], 'Control is the first link. Data sync is the next one.', 'text', ['ha-2', 'ha2 link']],
        ['Which HA link exists only in active/active mode, forwarding packets between peers for asymmetric sessions?', 'ha3',
            ['ha1', 'ha2', 'ha4', 'ha2-backup', 'management', 'aux'], 'Active/active needs one more link than active/passive.', 'text', ['ha-3', 'ha3 link']],
        ['In active/passive HA, what is the default passive link state of the passive firewall\'s dataplane interfaces?', 'shutdown',
            ['auto', 'enabled', 'standby', 'listening', 'blocking', 'forwarding'], 'The other option lets neighbours see link up early. The default does not.'],
        ['Which HA setting lets the higher-priority firewall take the active role back after it recovers?', 'preemptive',
            ['passive link state', 'heartbeat backup', 'link monitoring', 'path monitoring', 'session synchronization', 'hold time'], 'Without it, whoever is active stays active.', 'text', ['preemption', 'preempt']],
        ['Which HA state does a firewall enter when a monitored link or path fails, so it stops passing traffic?', 'non-functional',
            ['suspended', 'passive', 'tentative', 'initial', 'failed', 'active-secondary'], 'Suspended is what an admin does to it. This one is caused by a fault.', 'text', ['non functional', 'nonfunctional']],
        ['In active/active HA, which feature shares one virtual IP between both firewalls and splits hosts between them through ARP replies?', 'arp load-sharing',
            ['floating ip', 'route-based redundancy', 'ecmp', 'session owner', 'session setup', 'virtual mac'], 'Both firewalls answer ARP, each for a share of hosts.', 'text', ['arp load sharing']],
        ['The HA1 link fails and there is no HA1 backup or heartbeat backup. Both peers decide they are active. What is this called?', 'split brain',
            ['failover', 'preemption', 'flapping', 'tentative state', 'suspension', 'session desync'], 'One firewall, two minds.', 'text', ['split-brain', 'splitbrain']]
    ];

    const DECRYPT = [
        ['Which decryption mode inspects users\' outbound HTTPS by having the firewall sit in the middle and sign certificates with a forward trust CA?', 'ssl forward proxy',
            ['ssl inbound inspection', 'ssh proxy', 'decryption port mirror', 'decryption broker', 'no-decrypt', 'tls passthrough'], 'The firewall proxies outbound sessions, going forward.', 'text', ['forward proxy', 'ssl forward-proxy']],
        ['Which decryption mode inspects traffic to your own web server by loading that server\'s certificate and private key onto the firewall?', 'ssl inbound inspection',
            ['ssl forward proxy', 'ssh proxy', 'decryption port mirror', 'decryption broker', 'no-decrypt', 'tls passthrough'], 'The traffic is coming in, and you own the key.', 'text', ['inbound inspection']],
        ['In forward proxy, which certificate does the firewall present when the real server\'s certificate is NOT trusted, so the user sees a warning?', 'forward untrust',
            ['forward trust', 'root ca', 'inbound inspection', 'ssl/tls service profile', 'certificate profile', 'self-signed default'], 'There is a trust one and an un-trust one.', 'text', ['forward untrust certificate', 'forward-untrust']],
        ['Which certificate must client endpoints trust so SSL forward proxy does not throw browser warnings on good sites?', 'forward trust',
            ['forward untrust', 'server certificate', 'inbound inspection', 'ssl/tls service profile', 'certificate profile', 'web ui certificate'], 'Clients must trust the CA used to sign trusted sites.', 'text', ['forward trust certificate', 'forward-trust']],
        ['Sites that use certificate pinning or require client certificates break under forward proxy. What do you configure for them?', 'decryption exclusion',
            ['ssl inbound inspection', 'ssh proxy', 'decryption broker', 'decryption port mirror', 'forward untrust', 'application override'], 'You cannot decrypt them, so you stop trying, by policy or by list.', 'text', ['no-decrypt', 'no decrypt', 'exclude', 'exclude from decryption', 'ssl decryption exclusion']],
        ['Which decryption mode inspects and controls tunneled SSH traffic, such as port forwarding inside SSH?', 'ssh proxy',
            ['ssl forward proxy', 'ssl inbound inspection', 'decryption port mirror', 'decryption broker', 'no-decrypt', 'application override'], 'Named for the protocol it proxies.'],
        ['Which feature copies decrypted traffic out of a firewall interface to a DLP or IDS tool?', 'decryption port mirror',
            ['tap interface', 'decryption broker', 'ssl inbound inspection', 'packet capture', 'netflow', 'log forwarding'], 'It mirrors decrypted traffic to a port.', 'text', ['decryption mirror', 'decrypt mirror', 'decryption port mirroring']]
    ];

    const PANORAMA = [
        ['In Panorama, which construct holds network and device settings such as interfaces, zones and server profiles?', 'template',
            ['device group', 'shared', 'log collector group', 'security profile group', 'pre-rules', 'collector'], 'Devices and networks share a ___.', 'text', ['templates']],
        ['In Panorama, which construct holds policy and objects, such as security rules and address objects?', 'device group',
            ['template', 'template stack', 'log collector group', 'security profile group', 'vsys', 'shared template'], 'Policy belongs to groups of devices.', 'text', ['device groups']],
        ['Which Panorama construct layers several templates so firewalls get common settings plus site-specific overrides?', 'template stack',
            ['device group', 'device group hierarchy', 'template group', 'collector group', 'shared', 'variable'], 'Templates stacked on top of each other.', 'text', ['template stacks']],
        ['Panorama security rules that are evaluated before the firewall\'s local rules are called what?', 'pre-rules',
            ['post-rules', 'default rules', 'shared rules', 'local rules', 'override rules', 'template rules'], 'They come before.', 'text', ['pre rules', 'pre-rule', 'prerules']],
        ['Which Panorama rules are evaluated after the firewall\'s local rules but before the default rules?', 'post-rules',
            ['pre-rules', 'default rules', 'shared rules', 'local rules', 'override rules', 'template rules'], 'They come after.', 'text', ['post rules', 'post-rule', 'postrules']],
        ['You have committed on Panorama. Which operation sends the configuration on to the managed firewalls?', 'push to devices',
            ['commit', 'validate', 'revert', 'export', 'sync to peer', 'load config'], 'A commit to Panorama only changes Panorama.', 'text', ['push', 'commit and push']],
        ['Which location makes an address object visible to every device group in Panorama?', 'shared',
            ['template', 'template stack', 'global', 'all device groups', 'vsys1', 'default'], 'It is shared by all.']
    ];

    const PANORAMA_ORDER = [
        'Shared pre-rules', 'Device-group pre-rules', 'Firewall local rules', 'Device-group post-rules',
        'Shared post-rules', 'Default rules (intrazone-default, interzone-default)'
    ];

    function genPanOrder(rng) {
        return orderQuestion(rng, PANORAMA_ORDER, randInt(rng, 4, 5),
            'The Precedence Steward asks: "A firewall managed by Panorama evaluates security rules from several places. Put these in evaluation order, first to last."',
            'Panorama wraps the firewall\'s own rules like bread around a filling: the wider the scope, the further out it sits.');
    }

    // Order from the PAN-OS KB "Packet Flow Sequence in PAN-OS" (kA10g000000ClVHCA0):
    // slowpath does forwarding setup, NAT policy lookup, then security policy lookup;
    // the NAT translation itself is applied in the fast path, before App-ID and content inspection.
    const PACKET_FLOW = [
        'Ingress: the packet is parsed and the session lookup finds no existing session',
        'Forwarding setup: a route lookup determines the egress interface and zone',
        'NAT policy lookup matches a NAT rule (nothing is translated yet)',
        'Security policy lookup, using the original pre-NAT addresses',
        'Fast path: the NAT translation rewrites the L3/L4 headers',
        'App-ID identifies the application',
        'Content inspection by the security profiles',
        'Egress: the packet is forwarded out the egress interface'
    ];

    function genFlow(rng) {
        return orderQuestion(rng, PACKET_FLOW, 4,
            'The Twins speak in unison: "A new session\'s first packet arrives at PA-EDGE-01. Put these stages in order."',
            'Where it\'s going, then what it will become, then whether it\'s allowed. The headers change before anyone reads the payload.');
    }

    const CLI = [
        ['Which operational command asks the firewall which security rule a hypothetical flow would match?', 'test security-policy-match',
            ['show running security-policy', 'test nat-policy-match', 'show session all', 'debug dataplane packet-diag', 'show rule-hit-count', 'test policy-match'], 'You test whether a policy matches. Hyphens included.'],
        ['Which operational command tests which NAT rule a hypothetical flow would match?', 'test nat-policy-match',
            ['test security-policy-match', 'show running nat-policy', 'show session all', 'show nat-rule-hit', 'test nat-match', 'debug nat'], 'Same shape as the security policy test.'],
        ['Which operational command lists every session currently in the session table?', 'show session all',
            ['show session info', 'show running sessions', 'show sessions', 'show session table', 'show counter global', 'show conn'], 'Show the session... all of them.'],
        ['Which operational command shows management plane CPU, memory and top processes, much like Linux top?', 'show system resources',
            ['show running resource-monitor', 'show system info', 'show system statistics', 'show resources', 'show processes', 'top'], 'The system\'s resources.', 'text', ['show system resources follow']],
        ['Which operational command shows dataplane CPU utilization per core?', 'show running resource-monitor',
            ['show system resources', 'show system info', 'show dataplane cpu', 'show running cpu', 'show resource-monitor', 'show session info'], 'It is a monitor of resources while running.', 'text', ['show running resource-monitor minute', 'show running resource-monitor second']],
        ['Which command family sets capture filters and stages for dataplane packet captures and flow-basic debugging?', 'debug dataplane packet-diag',
            ['debug dataplane pcap', 'tcpdump', 'show counter global', 'debug flow basic', 'test packet-capture', 'debug packet-capture'], 'Debug the dataplane with packet diagnostics. (tcpdump only sees management traffic.)'],
        ['Which command shows the global dataplane counters, the first stop for "why was this packet dropped?"', 'show counter global',
            ['show session all', 'show system resources', 'show interface all', 'show running resource-monitor', 'show counters drops', 'show statistics'], 'Counters, globally.', 'text', ['show counter global filter delta yes', 'show counter global filter severity drop', 'show counter global filter delta yes severity drop']],
        ['Which command shows the local and peer HA state of the firewall?', 'show high-availability state',
            ['show ha', 'show ha status', 'show high-availability peer', 'show cluster', 'show redundancy', 'show failover'], 'Spell high-availability out in full.', 'text', ['show high-availability all']]
    ];

    Q.registerTopics({
        'paloalto-zones': { label: 'Zones and interface types', gen: fromPool(ZONES, 'text') },
        'paloalto-defaultrules': { label: 'Default security rules', gen: fromPool(DEFAULT_RULES, 'text') },
        'paloalto-rulematch': { label: 'Security rule matching', gen: genRuleMatch },
        'paloalto-commit': { label: 'Commit and planes', gen: fromPool(COMMIT, 'text') },
        'paloalto-logs': { label: 'PAN-OS log types', gen: fromPool(LOGS, 'text') },
        'paloalto-appid': { label: 'App-ID', gen: fromPool(APPID, 'text') },
        'paloalto-profiles': { label: 'Security profiles', gen: fromPool(PROFILES, 'text') },
        'paloalto-userid': { label: 'User-ID', gen: fromPool(USERID, 'text') },
        'paloalto-globalprotect': { label: 'GlobalProtect', gen: fromPool(GLOBALPROTECT, 'text') },
        'paloalto-zoneprot': { label: 'Zone and DoS protection', gen: fromPool(ZONEPROT, 'text') },
        'paloalto-nat': { label: 'NAT and security policy', gen: genNat },
        'paloalto-snat': { label: 'Source NAT and DIPP', gen: genSnat },
        'paloalto-ha': { label: 'High availability', gen: fromPool(HA, 'text') },
        'paloalto-decrypt': { label: 'Decryption', gen: fromPool(DECRYPT, 'text') },
        'paloalto-panorama': { label: 'Panorama', gen: fromPool(PANORAMA, 'text') },
        'paloalto-panorder': { label: 'Panorama rule order', gen: genPanOrder },
        'paloalto-flow': { label: 'Packet flow', gen: genFlow },
        'paloalto-cli': { label: 'PAN-OS CLI troubleshooting', gen: fromPool(CLI, 'text') }
    });

    // ================= world =================

    const ITEMS = {
        'energy-drink': {
            name: 'Lukewarm Energy Drink', names: ['energy drink', 'drink', 'potion', 'can', 'lukewarm energy drink'], kind: 'potion',
            desc: 'A dented can, half full, with a sticky ring around the bottom. Drink it to restore a life, or trade it for a hint.'
        },
        'content-tonic': {
            name: 'Content Update Tonic', names: ['tonic', 'potion', 'content tonic', 'content update tonic', 'vial'], kind: 'potion',
            desc: 'A vial labelled "apps+threats, latest". It smells faintly of new signatures. Drink it to restore a life, or trade it for a hint.'
        },
        'tac-coffee': {
            name: 'TAC Case Coffee', names: ['coffee', 'potion', 'mug', 'tac coffee', 'tac case coffee'], kind: 'potion',
            desc: 'Brewed while waiting on hold for a support engineer. Strong enough to survive a severity downgrade. Drink it to restore a life, or trade it for a hint.'
        },
        'hit-counter': {
            name: 'Rule Hit Counter', names: ['counter', 'hit counter', 'rule hit counter', 'clicker'], kind: 'key',
            desc: 'A brass tally clicker engraved with rule names. Point it at a rulebase and it shows which rule each session actually hit.'
        },
        'nat-ledger': {
            name: 'Translation Ledger', names: ['ledger', 'translation ledger', 'book'], kind: 'key',
            desc: 'A ledger with two columns: "pre-NAT" on the left, "post-NAT" on the right. Anything that changes its face has to answer to it.'
        },
        'ha1-backup': {
            name: 'HA1 Backup Cable', names: ['cable', 'ha1 backup cable', 'ha1 backup', 'backup cable'], kind: 'key',
            desc: 'A short patch cable tagged "HA1-BACKUP - DO NOT REMOVE". Someone removed it. It is the only thing that can get two firewalls talking again.'
        },
        'commit-sticker': {
            name: 'commit sticker', names: ['sticker', 'commit sticker'], kind: 'junk',
            desc: 'A laptop sticker reading "It\'s not a change until you commit."',
            use: 'You stick it on your laptop, next to the one that says "Have you tried any-any-allow?" You peel that one off.'
        },
        'loopback-plug': {
            name: 'loopback plug', names: ['plug', 'loopback plug', 'loopback'], kind: 'junk',
            desc: 'An RJ-45 loopback plug. Everything you send it comes straight back, much like a vendor escalation.'
        }
    };

    const ACTS = [
        {
            n: 1, name: 'The Zone Marches', start: 'noc', boss: 'gargoyle-hall', key: 'hit-counter',
            intro: 'ACT I: THE ZONE MARCHES\nAt 2:12 AM your pager lights up: nothing gets in or out of the company. Every alert points at PA-EDGE-01, the perimeter firewall, and its web UI shows a spinner that has outlived two coffees. Someone has to walk the realm and find out what it is denying, and to whom.'
        },
        {
            n: 2, name: 'The Translation Borderlands', start: 'crossing', boss: 'mirror-lair', key: 'nat-ledger',
            intro: 'ACT II: THE TRANSLATION BORDERLANDS\nPast the Gargoyle, the land changes: every traveller here wears two faces, one before translation and one after. Applications refuse to admit their names until they have said a few packets.'
        },
        {
            n: 3, name: 'The Panorama Spire', start: 'spire-foot', boss: 'twin-rack', key: 'ha1-backup',
            intro: 'ACT III: THE PANORAMA SPIRE\nA tower rises over the realm, pushing configuration to every firewall in sight. At its top sits the HA pair that guards PA-EDGE-01, and according to the logs both of them think they are in charge.'
        }
    ];

    const ROOMS = {
        // ======================= ACT I =======================
        'noc': {
            act: 1, name: 'The Network Operations Center',
            text: 'Wall screens glow red with "interzone-default: deny" in a scrolling font. Someone left a laptop sticker on the desk. A stone arch leads north, a cable bridge runs east, a vending alcove hums to the west, and a heavy door waits to the south.',
            exits: { north: 'zone-gate', east: 'vwire-bridge', west: 'vending', south: 'gargoyle-hall' },
            items: ['commit-sticker'],
            features: [
                { names: ['screens', 'wall', 'wall screens'], text: 'Every denied session in the company, one line each, in real time. The scroll bar is a single pixel tall.' },
                { names: ['door', 'south door', 'seals', 'seal', 'south', 'runes'], text: 'Five runes are carved into the door, one per guardian of this realm. Something behind it says "deny" in a gravelly voice, again and again.' }
            ]
        },
        'vending': {
            act: 1, name: 'The Vending Alcove',
            text: 'A vending machine stands in a nook, its display reading "SELECT ITEM (APP-ID: unknown-tcp)". A recycling bin overflows beside it. The NOC is back east.',
            exits: { east: 'noc' },
            features: [
                { names: ['machine', 'vending machine', 'display'], text: 'It accepts coins on application-default ports only. You put in a quarter. Nothing happens. It was denied.' },
                { names: ['bin', 'recycling bin', 'recycling'], text: 'Under the empties, one can is still half full and only slightly warm.', reveals: 'energy-drink' }
            ]
        },
        'zone-gate': {
            act: 1, name: 'The Gate of Zones',
            text: 'Four portcullises stand side by side, each painted a different colour: trust, untrust, dmz, guest. Every interface that passes is stamped with exactly one. A chapel lies north; the NOC is back south.',
            exits: { south: 'noc', north: 'default-chapel' },
            quiz: { topic: 'paloalto-zones', guardian: 'the Zone Warden', intro: 'A warden in a four-coloured tabard bars your way. "Nothing passes here without a zone. What are you, and what are you plugged into?"', cleared: 'The warden stamps your hand with a zone and raises the nearest portcullis.' }
        },
        'default-chapel': {
            act: 1, name: 'The Chapel of Default Rules',
            text: 'Two stone tablets sit at the bottom of a very long altar, below every other rule, greyed out and unmovable. A stair leads east; the gate is back south.',
            exits: { south: 'zone-gate', east: 'rulebase-stair' },
            quiz: { topic: 'paloalto-defaultrules', guardian: 'the Deacon of Defaults', intro: 'A deacon in grey robes rises from behind the tablets. "These rules were here before you, and they will be here after you. Tell me what they do."', cleared: 'The deacon nods. "Override us if you must. Never forget us." You may pass.' }
        },
        'rulebase-stair': {
            act: 1, name: 'The Rulebase Stair',
            text: 'A spiral staircase whose every step is a security rule, read from the top down. Some steps are worn smooth from hits; others have never been touched. A shack glows to the east; the chapel is back west.',
            exits: { west: 'default-chapel', east: 'mgmt-shack' },
            quiz: { topic: 'paloalto-rulematch', guardian: 'the Stair Sentinel', intro: 'A sentinel made of stacked rule rows blocks the stair. "Climb only if you know which step a session lands on. First match. No do-overs."', cleared: 'The sentinel increments a hit counter and steps aside.' }
        },
        'vwire-bridge': {
            act: 1, name: 'The Virtual Wire Bridge',
            text: 'A bridge of two cables bound together, carrying traffic straight across with no address of its own. A ghostly figure hovers at its middle, mouthing changes it never made real. An archive lies east; the NOC is back west.',
            exits: { west: 'noc', east: 'log-archive' },
            quiz: { topic: 'paloalto-commit', guardian: 'the Ghost of the Uncommitted Candidate', intro: 'The ghost of an admin who edited forty rules and went home without committing drifts into your path. "My changes," it moans. "Why aren\'t they working?"', cleared: 'The ghost finally clicks Commit. A progress bar crawls to 100% and the ghost fades away, at peace.' }
        },
        'log-archive': {
            act: 1, name: 'The Archive of Logs',
            text: 'Shelves sorted into Traffic, Threat, URL Filtering, System and Configuration stretch into the dark. The disks hum like they are nearly full. A narrow closet lies north; the bridge is back west.',
            exits: { west: 'vwire-bridge', north: 'tap-closet' },
            quiz: { topic: 'paloalto-logs', guardian: 'the Archivist', intro: 'An archivist with ink-stained hands blocks the aisle. "Everything that happens here is written down somewhere. Tell me where."', cleared: 'The archivist files you under "allowed" and goes back to the shelves.' }
        },
        'tap-closet': {
            act: 1, name: 'The Tap Closet',
            text: 'A cramped closet where a tap interface listens to a SPAN port, seeing everything and stopping nothing. A shack lies north; the archive is back south.',
            exits: { south: 'log-archive', north: 'mgmt-shack' },
            features: [
                { names: ['tap', 'tap interface', 'span', 'span port', 'port'], text: 'The tap has watched four breaches go by. It logged every one of them beautifully. It is not allowed to do anything else.' },
                { names: ['closet', 'walls', 'wall'], text: 'Someone has written on the wall: "Monitor mode is not a security control." Underneath, in different handwriting: "It is if nobody checks."' }
            ]
        },
        'mgmt-shack': {
            act: 1, name: 'The Management Shack',
            text: 'A shed on the management network, safe from the traffic outside. A brass clicker hangs from a nail above the desk, engraved with rule names. Paths lead west to the stair and south to the tap closet.',
            exits: { west: 'rulebase-stair', south: 'tap-closet' },
            items: ['hit-counter', 'loopback-plug'],
            features: [
                { names: ['desk', 'shed', 'shack'], text: 'A printout of the rulebase is taped to the desk. Someone has circled rule 1, "any-any-allow (TEMP)", and written "2019" next to it.' }
            ]
        },
        'gargoyle-hall': {
            act: 1, name: 'The Hall of the Implicit Deny Gargoyle', boss: true,
            text: 'A vaulted hall at the very bottom of the rulebase. The Implicit Deny Gargoyle crouches on a plinth, stone wings folded over everything nobody remembered to allow. Beyond it, a road leads into the Translation Borderlands.',
            exits: { north: 'noc' },
            bossFight: {
                name: 'the Implicit Deny Gargoyle', topics: ['paloalto-rulematch', 'paloalto-defaultrules'], key: 'hit-counter',
                locked: 'The Gargoyle swallows every session you throw at it and logs none of them. Without a way to see which rule a session actually hits, you are guessing in the dark.',
                intro: 'You raise the Rule Hit Counter. Its dial spins and settles on the Gargoyle\'s own name. "SO," it grinds. "YOU CAN SEE WHERE TRAFFIC LANDS. THEN READ MY RULEBASE."',
                win: 'The Gargoyle\'s wings unfold and its stone cracks into a single new allow rule, properly scoped, with logging on. The road to the Borderlands opens.'
            }
        },

        // ======================= ACT II =======================
        'crossing': {
            act: 2, name: 'The Translation Crossing',
            text: 'A crossroads where every traveller swaps one address for another at a toll booth. North is a library, east a fortified wall, west a tavern with a sinkhole for a cellar. A mirrored gate stands to the south.',
            exits: { north: 'appid-library', east: 'flood-wall', west: 'sinkhole-tavern', south: 'mirror-lair' },
            features: [
                { names: ['booth', 'toll booth', 'travellers', 'travelers'], text: 'A sign on the booth reads "Original packet on the left, translated packet on the right. Security policy: please consult both."' },
                { names: ['gate', 'mirrored gate', 'south', 'seals', 'seal', 'runes'], text: 'Five runes ring the mirrored gate, one per guardian of this realm. Your reflection in it has a different IP address.' }
            ]
        },
        'sinkhole-tavern': {
            act: 2, name: 'The Sinkhole Tavern',
            text: 'Malware that tried to phone home ends up drinking here, resolving every name to the same sinkhole address. A shelf of vials sits behind the bar. The crossing is back east.',
            exits: { east: 'crossing' },
            features: [
                { names: ['shelf', 'vials', 'bar'], text: 'Behind a bottle labelled "unknown-udp" sits a vial of fresh content update tonic.', reveals: 'content-tonic' },
                { names: ['patrons', 'malware', 'drinkers'], text: 'A botnet client keeps asking the bartender for its command server. The bartender keeps handing it the same glass of nothing.' }
            ]
        },
        'appid-library': {
            act: 2, name: 'The Library of App-ID',
            text: 'Thousands of application signatures line the shelves, and a new crate arrives every week. A few volumes are labelled only "unknown-tcp". An armory lies north; the crossing is back south.',
            exits: { south: 'crossing', north: 'profile-armory' },
            quiz: { topic: 'paloalto-appid', guardian: 'the Signature Librarian', intro: 'A librarian peers at you over a stack of decoders. "Port 443 tells me nothing. Tell me what you really are."', cleared: 'The librarian finds your entry, stamps it "identified", and waves you through.' }
        },
        'profile-armory': {
            act: 2, name: 'The Profile Armory',
            text: 'Racks of security profiles hang on the walls: antivirus, anti-spyware, vulnerability protection, URL filtering, file blocking, WildFire. They only fit rules that allow something. A tower rises east; the library is back south.',
            exits: { south: 'appid-library', east: 'directory-tower' },
            quiz: { topic: 'paloalto-profiles', guardian: 'the Quartermaster of Profiles', intro: 'A quartermaster with a clipboard blocks the racks. "Allowing traffic without profiles is just routing with extra steps. What do you need?"', cleared: 'The quartermaster fits you with a profile group and lets you pass.' }
        },
        'directory-tower': {
            act: 2, name: 'The Directory Tower',
            text: 'A tower whose windows each show a username next to an IP address, updating as people log in and out. A vault door lies east; the armory is back west.',
            exits: { west: 'profile-armory', east: 'pool-vault' },
            quiz: { topic: 'paloalto-userid', guardian: 'the Identity Clerk', intro: 'A clerk looks up from a domain controller event log. "An IP address isn\'t a person. Tell me how I learn who is behind it."', cleared: 'The clerk maps you to your IP and stamps it with a timeout.' }
        },
        'flood-wall': {
            act: 2, name: 'The Flood Wall',
            text: 'A high wall protects the ingress zone from waves of SYN packets crashing against it. Gauges along the top read alarm, activate and maximum. A portal glows north; the crossing is back west.',
            exits: { west: 'crossing', north: 'gp-portal' },
            quiz: { topic: 'paloalto-zoneprot', guardian: 'the Flood Warden', intro: 'A warden in waders watches the gauges. "Ten thousand SYNs a second and rising. Prove you know how to hold the wall."', cleared: 'The warden switches on SYN cookies and the waves calm. "Go on, then."' }
        },
        'gp-portal': {
            act: 2, name: 'The GlobalProtect Portal',
            text: 'A shimmering arch hands each traveller a list of gateways and wishes them luck. Some ruins lie north; the flood wall is back south.',
            exits: { south: 'flood-wall', north: 'unknown-ruins' },
            quiz: { topic: 'paloalto-globalprotect', guardian: 'the Remote Access Gatekeeper', intro: 'A gatekeeper with a laptop bag blocks the arch. "Working from a hotel again? Before you tunnel in, tell me how this works."', cleared: 'The gatekeeper checks your HIP report, frowns at your patch level, and lets you through anyway.' }
        },
        'unknown-ruins': {
            act: 2, name: 'The Ruins of Unknown-TCP',
            text: 'Broken sessions lie everywhere, their applications never identified. A custom app signature someone started writing in 2021 is half-carved into a stone. Paths lead north to a vault and south to the portal.',
            exits: { south: 'gp-portal', north: 'pool-vault' },
            features: [
                { names: ['stone', 'signature', 'custom app', 'carving'], text: 'It reads: "custom-app-legacy-erp: match port 8443 AND ..." and stops. The author left the company. The rule still allows it.' },
                { names: ['sessions', 'broken sessions'], text: 'One session is labelled "insufficient-data". It got as far as hello and then had nothing more to say.' }
            ]
        },
        'pool-vault': {
            act: 2, name: 'The Address Pool Vault',
            text: 'Public IP addresses are stacked like gold bars, each stamped with 64,512 tiny ports. A ledger lies open on a lectern. Doors lead west to the tower and south to the ruins.',
            exits: { west: 'directory-tower', south: 'unknown-ruins' },
            items: ['nat-ledger'],
            features: [
                { names: ['addresses', 'bars', 'gold bars', 'ips'], text: 'One bar is labelled "the interface IP, do not use for anything else". It has been used for everything else.' },
                { names: ['lectern'], text: 'A plain lectern. The ledger on it is the only thing in this room that agrees with itself.' }
            ]
        },
        'mirror-lair': {
            act: 2, name: 'The Lair of the NAT Doppelganger', boss: true,
            text: 'A hall of mirrors where every packet sees itself with someone else\'s address. The NAT Doppelganger flickers between a private face and a public one. A stair at the back climbs toward a distant spire.',
            exits: { north: 'crossing' },
            bossFight: {
                name: 'the NAT Doppelganger', topics: ['paloalto-nat', 'paloalto-snat'], key: 'nat-ledger',
                locked: 'The Doppelganger swaps faces faster than you can follow, and every rule you write matches the wrong one. You need a record of which face is which.',
                intro: 'You open the Translation Ledger. The Doppelganger freezes, caught between its pre-NAT and post-NAT faces. "Fine," it says, in two voices. "Tell me which face your policy sees."',
                win: 'The Doppelganger\'s faces line up, translation matches policy, and it dissolves into a clean NAT hit counter. The stair to the Panorama Spire stands open.'
            }
        },

        // ======================= ACT III =======================
        'spire-foot': {
            act: 3, name: 'The Foot of the Panorama Spire',
            text: 'A tower of templates and device groups rises into the clouds, pushing configuration down to every firewall in the realm. North is a catwalk, east a forge, west a break room. A rack room hums to the south.',
            exits: { north: 'ha1-catwalk', east: 'decrypt-forge', west: 'break-room', south: 'twin-rack' },
            features: [
                { names: ['spire', 'tower'], text: 'A plaque reads: "Commit to Panorama is not push to devices." Under it, someone has scratched a tally of how many times they forgot.' },
                { names: ['rack', 'rack room', 'south', 'seals', 'seal', 'runes'], text: 'Five runes glow over the rack room door, one per guardian of this realm. From inside come two voices, both insisting they are active.' }
            ]
        },
        'break-room': {
            act: 3, name: 'The Support Case Break Room',
            text: 'A speakerphone on the table plays hold music on a loop. A coffee machine sits by the sink. The spire is back east.',
            exits: { east: 'spire-foot' },
            features: [
                { names: ['coffee machine', 'machine', 'pot', 'coffee'], text: 'One mug is left in the pot, brewed during your last support case. You pour it.', reveals: 'tac-coffee' },
                { names: ['speakerphone', 'phone', 'hold music'], text: '"Your call is important to us. Please collect a tech support file and attach it to your case."' }
            ]
        },
        'ha1-catwalk': {
            act: 3, name: 'The HA Catwalk',
            text: 'A narrow catwalk strung with labelled cables: HA1, HA2 and, on the active/active side, HA3. One cable socket hangs empty. A loom room lies north; the spire is back south.',
            exits: { south: 'spire-foot', north: 'template-loom' },
            quiz: { topic: 'paloalto-ha', guardian: 'the Heartbeat Keeper', intro: 'A keeper with a stethoscope listens to the cables. "Steady pulse. For now. Before you cross, tell me how a pair stays a pair."', cleared: 'The keeper hears your heartbeat, marks you "peer up", and steps aside.' }
        },
        'template-loom': {
            act: 3, name: 'The Template Loom',
            text: 'Giant looms weave templates and device groups into configuration and send it down threads to every firewall. A staircase climbs east; the catwalk is back south.',
            exits: { south: 'ha1-catwalk', east: 'precedence-stair' },
            quiz: { topic: 'paloalto-panorama', guardian: 'the Weaver of Templates', intro: 'A weaver with a hundred arms keeps working the loom. "Interfaces go in one thread, policy in another. Mix them up and the whole realm unravels. Which goes where?"', cleared: 'The weaver ties off your thread and pushes it to devices.' }
        },
        'precedence-stair': {
            act: 3, name: 'The Precedence Stair',
            text: 'Stairs climb past layers of rules: some handed down from the spire, some written by the firewall itself. A storage closet lies east; the loom is back west.',
            exits: { west: 'template-loom', east: 'ha-closet' },
            quiz: { topic: 'paloalto-panorder', guardian: 'the Precedence Steward', intro: 'A steward with a clipboard of rule layers blocks the stair. "Every rule has its place. Show me you know the order."', cleared: 'The steward checks your order against the clipboard and nods you up the stairs.' }
        },
        'decrypt-forge': {
            act: 3, name: 'The Decryption Forge',
            text: 'Smiths split TLS sessions open on an anvil, inspect them and seal them again with a forward trust certificate. A terminal room glows north; the spire is back west.',
            exits: { west: 'spire-foot', north: 'cli-terminal' },
            quiz: { topic: 'paloalto-decrypt', guardian: 'the Certificate Smith', intro: 'A smith in a leather apron raises a hammer stamped "Forward Trust". "Ninety percent of what crosses this realm is encrypted. Prove you can see inside it."', cleared: 'The smith reseals the session and hands it back. "No browser warning. Good work."' }
        },
        'cli-terminal': {
            act: 3, name: 'The Terminal Chamber',
            text: 'A green-screen terminal sits on a stone desk, its prompt waiting: admin@PA-EDGE-01>. Some old licences are stacked in the corner. A graveyard lies north; the forge is back south.',
            exits: { south: 'decrypt-forge', north: 'license-graveyard' },
            quiz: { topic: 'paloalto-cli', guardian: 'the Operator of the Prompt', intro: 'The cursor blinks, and an operator in a hoodie materialises behind it. "The web UI is down. Again. What do you type?"', cleared: 'The operator presses Enter. The output scrolls by, and somewhere in it is your answer. "Carry on."' }
        },
        'license-graveyard': {
            act: 3, name: 'The Graveyard of Expired Licences',
            text: 'Headstones list subscriptions that lapsed: Threat Prevention, URL Filtering, WildFire. Each one was renewed three days late. A closet lies north; the terminal chamber is back south.',
            exits: { south: 'cli-terminal', north: 'ha-closet' },
            features: [
                { names: ['headstones', 'headstone', 'graves', 'grave'], text: 'One reads: "Threat Prevention. Expired on a Friday. Content updates stopped Saturday. Nobody noticed until Monday."' }
            ]
        },
        'ha-closet': {
            act: 3, name: 'The Cable Closet',
            text: 'Spare optics and patch cables hang on hooks. One short cable carries a tag: "HA1-BACKUP - DO NOT REMOVE". Doors lead west to the stair and south to the graveyard.',
            exits: { west: 'precedence-stair', south: 'license-graveyard' },
            items: ['ha1-backup'],
            features: [
                { names: ['optics', 'hooks', 'spares'], text: 'Twelve SFPs, none labelled, three of them the wrong speed for anything in the building.' }
            ]
        },
        'twin-rack': {
            act: 3, name: 'The Rack of the Split-Brain Twins', boss: true,
            text: 'PA-EDGE-01 and its HA peer sit in the rack, both status LEDs reading ACTIVE, both answering ARP for the same address. The Split-Brain Twins stand in front of them, arguing with each other.',
            exits: { north: 'spire-foot' },
            bossFight: {
                name: 'the Split-Brain Twins', topics: ['paloalto-flow', 'paloalto-ha'], key: 'ha1-backup',
                locked: 'Each Twin insists it is the active one and ignores the other entirely. With the control link down, nothing you say reaches both of them.',
                intro: 'You plug in the HA1 Backup Cable. Heartbeats start flowing again, and the Twins turn to face you at once. "We hear each other now," they say. "Prove you understand what passes between us."',
                win: 'The Twins compare priorities. One sighs, becomes passive, and shuts its links down. PA-EDGE-01 is active alone, sessions sync over HA2, and the traffic logs start scrolling with "allow".'
            }
        }
    };

    W.register({
        id: 'paloalto',
        name: 'Palo Alto Realm',
        blurb: 'PAN-OS firewalls and Panorama: zones, rule matching, NAT, App-ID, HA and decryption.',
        target: 'PA-EDGE-01',
        epilogue: 'You write up the incident, recommend an HA1 backup link, and file a change to remove "any-any-allow (TEMP)". It is denied by the Change Advisory Board for lacking a rollback plan.',
        items: ITEMS,
        acts: ACTS,
        rooms: ROOMS
    });
});
