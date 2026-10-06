/*
 * Datacenter Quest - Cisco Realm: IOS / IOS-XE routing and switching, from the
 * first Router> prompt to a broadcast storm on the core. See QUEST-AUTHORING.md.
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('../questions.js'), require('../world.js'));
    else factory(root.QuestQuestions, root.QuestWorld);
})(typeof self !== 'undefined' ? self : this, function (Q, W) {
    'use strict';
    const { pick, randInt, shuffle, fromPool, ipToInt, intToIp, maskInt } = Q.util;

    const wildInt = p => (~maskInt(p)) >>> 0;
    const hex4 = rng => randInt(rng, 0, 0xffff).toString(16).padStart(4, '0');
    const randMac = rng => [hex4(rng), hex4(rng), hex4(rng)].join('.');

    function distinctMacs(rng, n) {
        const out = [];
        while (out.length < n) {
            const m = randMac(rng);
            if (!out.includes(m) && m !== 'ffff.ffff.ffff') out.push(m);
        }
        return out;
    }

    // ================= ACT 1: Access layer =================

    const MODES = [
        ['Your prompt reads Router>. Which IOS mode are you in?', 'user exec', ['privileged exec', 'global configuration', 'interface configuration', 'line configuration', 'rommon', 'setup mode'],
            'You can look, but you cannot touch much. One more command gets you the # sign.', 'text', ['user exec mode', 'user mode', 'user']],
        ['Your prompt reads Router#. Which IOS mode are you in?', 'privileged exec', ['user exec', 'global configuration', 'interface configuration', 'rommon', 'router configuration', 'line configuration'],
            'The # means you typed the magic word, but you are not configuring anything yet.', 'text', ['privileged exec mode', 'privileged', 'privileged mode', 'enable mode']],
        ['Which command takes you from Router> to Router#?', 'enable', ['configure terminal', 'login', 'su', 'disable', 'exit', 'enable secret'],
            'Its opposite also exists and drops you back down.', 'text', ['en', 'ena']],
        ['Which command takes you from Router# to Router(config)#?', 'configure terminal', ['enable', 'config', 'interface', 'setup', 'configure memory', 'end'],
            'You are configuring from the terminal you are sitting at, not from memory or the network.', 'text', ['conf t', 'config t', 'configure t', 'conf term', 'config terminal']],
        ['Your prompt reads Router(config-if)#. Which configuration mode are you in?', 'interface configuration', ['global configuration', 'line configuration', 'router configuration', 'privileged exec', 'vlan configuration', 'subinterface configuration'],
            'Read the two letters after "config-". They name what you just typed a command to enter.', 'text', ['interface configuration mode', 'interface config', 'interface', 'config-if']],
        ['Which single command drops you from any configuration submode straight back to privileged EXEC?', 'end', ['exit', 'disable', 'logout', 'quit', 'ctrl+c', 'ctrl+shift+6'],
            'exit only climbs one level. This one jumps all the way out, and Ctrl+Z does the same.', 'text', ['ctrl+z', 'ctrl-z', '^z']],
        ['Which command enters configuration for the first five virtual terminal lines, 0 through 4?', 'line vty 0 4', ['line console 0', 'line vty 0 15', 'line aux 0', 'interface vty 0 4', 'line tty 0 4', 'vty 0 4'],
            'Telnet and SSH sessions land on virtual lines. Count from zero.', 'text', ['line vty 0 4']],
        ['Which command drops you from privileged EXEC back to user EXEC without logging out?', 'disable', ['exit', 'end', 'logout', 'no enable', 'quit', 'enable 1'],
            'It is the opposite of the command that got you the # prompt.', 'text', ['disa']],
        ['Your console shows "rommon 1 >" after a power cycle. What mode is that?', 'rommon', ['user exec', 'setup mode', 'privileged exec', 'boot mode', 'bootloader', 'safe mode'],
            'The monitor that lives in read-only memory, below IOS itself.', 'text', ['rom monitor', 'rom monitor mode', 'rommon mode']]
    ];

    const SHOW = [
        ['Which command shows every interface on one line with its IP address, status and protocol?', 'show ip interface brief',
            ['show interfaces status', 'show ip route', 'show interfaces', 'show running-config', 'show ip interface', 'show interfaces summary'],
            'It is the "ip interface" view, but the short version. Everyone types it abbreviated.', 'text',
            ['sh ip int br', 'sh ip int brief', 'show ip int brief', 'show ip int br', 'sh ip interface brief', 'show ip interface br', 'sh ip int bri', 'show ip int bri']],
        ['Which command displays the IPv4 routing table?', 'show ip route', ['show route', 'show ip protocols', 'show ip cef', 'show ip bgp', 'show routing-table', 'show arp'],
            'Three words. The first is always "show" and the second is the protocol family.', 'text', ['sh ip route', 'sh ip ro', 'sh ip rou', 'show ip ro']],
        ['On a Catalyst switch running IOS-XE, which command shows which MAC address was learned on which port?', 'show mac address-table',
            ['show arp', 'show ip arp', 'show cam table', 'show interfaces status', 'show mac table', 'show vlan brief'],
            'ARP maps IPs to MACs. You want the layer 2 table that maps MACs to ports.', 'text',
            ['sh mac address-table', 'sh mac add', 'show mac add', 'sh mac address', 'show mac address', 'sh mac addr', 'show mac addr']],
        ['Which command lists the VLANs on a switch and the access ports assigned to each?', 'show vlan brief',
            ['show vlan trunk', 'show interfaces trunk', 'show vtp status', 'show vlans', 'show ip interface brief', 'show interfaces vlan 1'],
            'Same pattern as the interface summary: the feature name, then the short form.', 'text', ['sh vlan br', 'sh vlan brief', 'show vlan br', 'sh vl br', 'show vlan bri', 'sh vlan bri']],
        ['Which command summarizes trunk ports with their native VLAN and allowed VLAN lists?', 'show interfaces trunk',
            ['show vlan trunk', 'show trunk', 'show spanning-tree', 'show dtp', 'show vtp status', 'show etherchannel summary'],
            'Trunks are a property of interfaces, so start there.', 'text', ['sh int trunk', 'sh int tr', 'sh interfaces trunk', 'show int trunk', 'show interface trunk', 'sh interface trunk', 'show int tr']],
        ['Which command shows directly connected Cisco neighbors including their management IP and software version?', 'show cdp neighbors detail',
            ['show cdp neighbors', 'show lldp neighbors', 'show cdp', 'show neighbors', 'show cdp interface', 'show ip arp'],
            'The plain neighbors view leaves out the IP. Ask for more.', 'text', ['sh cdp nei det', 'sh cdp neighbors detail', 'show cdp nei detail', 'sh cdp nei detail', 'show cdp neighbor detail', 'sh cdp ne de']],
        ['Which command shows one line per port-channel with its member ports and their flags?', 'show etherchannel summary',
            ['show lacp neighbor', 'show port-channel', 'show interfaces port-channel 1', 'show etherchannel', 'show pagp neighbor', 'show lacp summary'],
            'Name the feature, not the protocol, then ask for the short version.', 'text', ['sh etherchannel summary', 'sh eth sum', 'sh etherch sum', 'show etherchannel sum', 'sh etherchannel sum']],
        ['Which command displays the configuration that will load on the next reload?', 'show startup-config',
            ['show running-config', 'show flash:', 'show boot', 'show version', 'show archive', 'dir nvram:'],
            'Not what is running now. What it will start with.', 'text', ['sh start', 'sh startup-config', 'show start', 'sh startup', 'show startup']],
        ['Which command shows the IOS version, uptime and configuration register value?', 'show version',
            ['show running-config', 'show inventory', 'show boot', 'show platform', 'show license', 'show clock'],
            'TAC asks for this one before anything else.', 'text', ['sh ver', 'sh version', 'show ver']]
    ];

    const VLAN = [
        ['Out of the box, which VLAN are all Catalyst switch ports in?', '1', ['0', '10', '99', '1002', '4094', '100'],
            'It is also the default native VLAN, which is why security guides tell you to stop using it.', 'int'],
        ['Which interface command makes a switch port a non-negotiating access port?', 'switchport mode access',
            ['switchport access', 'switchport mode trunk', 'switchport access vlan 10', 'switchport nonegotiate', 'no switchport', 'switchport mode dynamic auto'],
            'You are setting the port\'s mode, not its VLAN.', 'text', ['sw mode access', 'sw mo acc', 'switchport mode acc', 'sw mode acc', 'switchport mo acc']],
        ['Which interface command puts an access port in VLAN 20?', 'switchport access vlan 20',
            ['vlan 20', 'switchport vlan 20', 'switchport trunk allowed vlan 20', 'switchport mode access vlan 20', 'access vlan 20', 'encapsulation dot1q 20'],
            'The "switchport" family again, this time the access branch.', 'text', ['sw access vlan 20', 'sw acc vlan 20', 'switchport acc vlan 20', 'sw acc vl 20']],
        ['How many bytes does an 802.1Q tag add to an Ethernet frame?', '4', ['2', '8', '12', '16', '6', '32'],
            'Two bytes of TPID (0x8100) plus two bytes of tag control information.', 'int'],
        ['How many bits of an 802.1Q tag hold the VLAN ID?', '12', ['10', '16', '8', '4', '3', '24'],
            'The highest usable VLAN is 4094. Work out how many bits that needs.', 'int'],
        ['What is the last VLAN ID in the normal range?', '1005', ['1001', '1024', '4094', '4095', '1000', '999'],
            'The extended range starts right after it, at 1006.', 'int'],
        ['CDP is Cisco-proprietary. What is the IEEE standard neighbor discovery protocol?', 'LLDP',
            ['LACP', 'STP', 'DTP', 'VTP', 'UDLD', 'PAgP'],
            'IEEE 802.1AB. Four letters, two of them "L".', 'text', ['link layer discovery protocol', '802.1ab']],
        ['Which global configuration command turns LLDP on for the whole switch?', 'lldp run',
            ['cdp run', 'lldp enable', 'enable lldp', 'lldp transmit', 'lldp receive', 'feature lldp'],
            'It is the same verb CDP uses for its global switch. Transmit and receive are per-interface.', 'text'],
        ['By default, how often (in seconds) does a Cisco device send CDP advertisements?', '60', ['30', '90', '180', '10', '120', '5'],
            'The holdtime is 180 seconds, three times the advertisement interval.', 'int'],
        ['Which interface command makes a switch port a trunk unconditionally?', 'switchport mode trunk',
            ['switchport mode dynamic desirable', 'switchport trunk encapsulation dot1q', 'switchport mode dynamic auto', 'switchport trunk native vlan 1', 'switchport nonegotiate', 'channel-group 1 mode on'],
            'Dynamic modes negotiate with DTP. You want the one that just decides.', 'text', ['sw mode trunk', 'sw mo tr', 'sw mode tr', 'switchport mode tr']]
    ];

    const SAVE = [
        ['Which command saves the running configuration so it survives a reload?', 'copy running-config startup-config',
            ['copy startup-config running-config', 'copy start run', 'save', 'reload', 'write erase', 'commit'],
            'Source first, destination second. Or the old one-word shortcut everyone still uses.', 'text',
            ['copy run start', 'wr', 'write memory', 'wr mem', 'write', 'write mem', 'copy run st', 'copy run sta', 'copy run startup-config', 'copy running-config start']],
        ['On a classic IOS router, which memory holds the startup-config?', 'nvram', ['flash', 'ram', 'rom', 'bootflash', 'usbflash0', 'disk0'],
            'It has to survive power loss, but it is not where the IOS image lives.', 'text', ['nvram:']],
        ['Which command erases the startup configuration?', 'write erase',
            ['delete running-config', 'reload', 'no startup-config', 'clear config', 'erase flash:', 'copy run start'],
            'Two common forms work: one starts with "write", the other with "erase".', 'text', ['erase startup-config', 'wr erase', 'erase start', 'erase nvram:']],
        ['Which global command sets the enable password as a hash instead of reversible type 7?', 'enable secret',
            ['enable password', 'service password-encryption', 'password', 'username admin password', 'secret enable', 'enable encryption'],
            'The other enable command stores it in plain text unless something weakly obscures it.', 'text'],
        ['Which global command obscures plain-text passwords in the config with weak type 7 encoding?', 'service password-encryption',
            ['enable secret', 'password encryption aes', 'security passwords min-length 8', 'no service password-recovery', 'crypto key generate rsa', 'service encryption'],
            'It is a "service". It stops shoulder-surfing, not attackers.', 'text', ['service password-encryption']],
        ['Under line vty, which command allows SSH and refuses Telnet?', 'transport input ssh',
            ['transport input all', 'transport output ssh', 'ip ssh version 2', 'login local', 'transport input telnet ssh', 'ssh only'],
            'You are controlling which protocols may come in on the line.', 'text'],
        ['Under line vty, which command authenticates logins against usernames configured on the device?', 'login local',
            ['login', 'password', 'aaa new-model', 'username local', 'login authentication', 'local login'],
            'Plain "login" checks the line password. You want the device\'s own user database.', 'text'],
        ['Which global command creates the key pair that SSH needs before it will start?', 'crypto key generate rsa',
            ['ip ssh version 2', 'crypto pki enroll', 'ssh-keygen', 'crypto key zeroize rsa', 'ip domain-name', 'generate rsa key'],
            'It lives under the crypto family, and you will be asked for a modulus size.', 'text',
            ['cry key gen rsa', 'crypto key gen rsa', 'crypto key generate rsa modulus 2048', 'crypto key generate rsa modulus 4096']],
        ['Which command enters configuration for the physical console port?', 'line console 0',
            ['line vty 0', 'line aux 0', 'interface console 0', 'line tty 0', 'console 0', 'line con 1'],
            'It is a line, not an interface, and there is only one, numbered from zero.', 'text', ['line con 0', 'line cons 0']]
    ];

    // Generated: where does the switch send this frame?
    function genMacTable(rng) {
        const vlanA = pick(rng, [10, 20, 30, 100, 110]);
        const vlanB = pick(rng, [40, 50, 200, 210, 300]);
        const nums = shuffle(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]);
        const port = n => 'Gi1/0/' + n;
        const macs = distinctMacs(rng, 6);
        // four entries in vlanA, one in vlanB; nums[5] is the ingress port
        const table = [0, 1, 2, 3].map(i => ({ vlan: vlanA, mac: macs[i], port: port(nums[i]) }))
            .concat([{ vlan: vlanB, mac: macs[4], port: port(nums[4]) }]);
        const ingress = port(nums[5]);
        const shown = shuffle(rng, table);
        const lines = shown.map(e => `${String(e.vlan).padStart(4)}    ${e.mac}    DYNAMIC     ${e.port}`).join('\n');
        const scenario = pick(rng, ['known', 'known', 'known', 'unknown', 'broadcast', 'othervlan']);
        let dst, answer;
        if (scenario === 'known') {
            const e = table[randInt(rng, 0, 3)];
            dst = e.mac; answer = e.port;
        } else if (scenario === 'unknown') {
            dst = macs[5]; answer = 'flood';
        } else if (scenario === 'broadcast') {
            dst = 'ffff.ffff.ffff'; answer = 'flood';
        } else {
            dst = macs[4]; answer = 'flood';
        }
        const q = `SW1# show mac address-table\n Vlan    Mac Address       Type        Ports\n${lines}\n\n` +
            `A frame arrives on ${ingress} (access port, VLAN ${vlanA}) with destination ${dst}. ` +
            `Which port does it leave by? (Answer the port, or "flood".)`;
        const ports = table.map(e => e.port);
        let accept, distractors;
        if (answer === 'flood') {
            accept = ['flood', 'flooded', 'flood it', 'flooding', `flood vlan ${vlanA}`, `flood out all ports in vlan ${vlanA}`, 'flood out all ports in the vlan'];
            distractors = ports.concat(['drop', ingress, 'send it to the default gateway']);
        } else {
            const n = answer.split('/').pop();
            accept = [answer, 'GigabitEthernet1/0/' + n, 'gig1/0/' + n, 'g1/0/' + n, 'gi 1/0/' + n];
            distractors = ports.filter(p => p !== answer).concat(['flood', 'drop', ingress]);
        }
        const hint = scenario === 'othervlan'
            ? 'The table is searched per VLAN. Check the VLAN column, not just the MAC.'
            : scenario === 'broadcast'
                ? 'No port in the table owns that address. Nobody could.'
                : 'Look the destination up in the frame\'s own VLAN. A miss is not a drop.';
        return { q, answer, norm: 'text', accept, distractors, hint };
    }

    // ================= ACT 2: Distribution layer =================

    // Generated: wildcard masks
    function genWildcard(rng) {
        const p = randInt(rng, 8, 30);
        const base = ipToInt([pick(rng, [10, 172, 192]), randInt(rng, 0, 255), randInt(rng, 0, 255), randInt(rng, 0, 255)]);
        const net = (base & maskInt(p)) >>> 0;
        const wild = wildInt(p);
        const wc = q => intToIp(wildInt(Math.max(0, Math.min(32, q))));
        const variant = pick(rng, ['prefix', 'mask', 'range', 'count']);
        const distractors = [intToIp(maskInt(p)), wc(p + 1), wc(p - 1), wc(p + 2), wc(p - 2), '0.0.0.255', intToIp((wild + 1) >>> 0)];
        if (variant === 'count') {
            return {
                q: `How many addresses does "access-list 10 permit ${intToIp(net)} ${intToIp(wild)}" match?`,
                answer: String(2 ** (32 - p)), norm: 'int',
                distractors: [2 ** (32 - p) - 2, 2 ** (32 - p) - 1, 2 ** (33 - p), 2 ** (31 - p), 32 - p, 256].map(String),
                hint: 'Count the 1 bits in the wildcard: each one is a "don\'t care" bit that doubles the matches.'
            };
        }
        let q;
        if (variant === 'prefix') q = `Which wildcard mask matches the whole subnet ${intToIp(net)}/${p} in an ACL?`;
        else if (variant === 'mask') q = `A subnet uses mask ${intToIp(maskInt(p))}. Which wildcard mask matches the whole subnet in an ACL?`;
        else q = `Which wildcard mask, paired with ${intToIp(net)}, matches exactly ${intToIp(net)} through ${intToIp((net | wild) >>> 0)}?`;
        return {
            q, answer: intToIp(wild), norm: 'ipv4', distractors,
            hint: 'Subtract each octet of the subnet mask from 255. A wildcard is the mask flipped, not the mask itself.'
        };
    }

    // Generated: which line of an ACL matches first?
    function genAclMatch(rng) {
        const a = pick(rng, [10, 172]);
        const b = a === 10 ? randInt(rng, 1, 250) : randInt(rng, 16, 30);
        const thirds = shuffle(rng, Array.from({ length: 254 }, (_, i) => i + 1));
        const [c, d, e] = thirds;
        const s = 16 * randInt(rng, 1, 14);
        const host = [a, b, d, randInt(rng, 1, 254)].join('.');
        const variant = pick(rng, ['first', 'first', 'first', 'highest']);
        if (variant === 'highest') {
            const p = randInt(rng, 16, 29);
            const net = (ipToInt([a, b, c, randInt(rng, 0, 255)]) & maskInt(p)) >>> 0;
            const w = wildInt(p);
            const hi = (net | w) >>> 0;
            const up = (net & maskInt(p - 1)) | wildInt(p - 1);
            return {
                q: `What is the highest address matched by "permit ${intToIp(net)} ${intToIp(w)}"?`,
                answer: intToIp(hi), norm: 'ipv4',
                distractors: [intToIp(net), intToIp(hi - 1), intToIp(hi + 1), intToIp((net | wildInt(p + 1)) >>> 0), intToIp(up >>> 0), intToIp((net | 255) >>> 0), intToIp(net + w + 1 + w), intToIp(net + 1), intToIp((net | wildInt(p + 2)) >>> 0)],
                hint: 'Every 1 bit in the wildcard may be anything. Set them all to 1.'
            };
        }
        const acl = `ip access-list standard EDGE-IN\n 10 permit host ${host}\n 20 deny   ${a}.${b}.${c}.0 0.0.0.255\n` +
            ` 30 permit ${a}.${b}.${c}.${s} 0.0.0.15\n 40 permit ${a}.${b}.0.0 0.0.255.255`;
        const scenario = pick(rng, ['host', 'shadow', 'shadow', 'net', 'wide', 'out']);
        let src, answer;
        if (scenario === 'host') { src = host; answer = '10'; }
        else if (scenario === 'shadow') { src = `${a}.${b}.${c}.${s + randInt(rng, 0, 15)}`; answer = '20'; }
        else if (scenario === 'net') {
            let h = randInt(rng, 1, 254);
            if (h >= s && h < s + 16) h = (s + 16 + randInt(rng, 1, 60)) % 255 || 1;
            if (h >= s && h < s + 16) h = s - 1;
            src = `${a}.${b}.${c}.${h}`; answer = '20';
        } else if (scenario === 'wide') { src = `${a}.${b}.${e}.${randInt(rng, 1, 254)}`; answer = '40'; }
        else { src = `${a}.${b === 250 || b === 30 ? b - 1 : b + 1}.${c}.${randInt(rng, 1, 254)}`; answer = 'implicit deny'; }
        const all = ['10', '20', '30', '40', 'implicit deny'];
        return {
            q: `${acl}\n\nA packet from ${src} hits this ACL. Which sequence number matches it? (Or answer "implicit deny".)`,
            answer, norm: 'text',
            accept: answer === 'implicit deny' ? ['implicit deny', 'implicit deny any', 'the implicit deny', 'deny any'] : [answer, 'line ' + answer, 'seq ' + answer, 'sequence ' + answer],
            distractors: all.filter(x => x !== answer).concat(['permitted, no line matches', 'the most specific line', '50']),
            hint: scenario === 'shadow'
                ? 'ACLs are read top-down and stop at the first match. The most specific line does not win.'
                : 'Top-down, first match wins, and every ACL ends with something you cannot see.'
        };
    }

    const NATACL = [
        ['A standard IPv4 ACL can match on what?', 'source address', ['destination address', 'source and destination', 'protocol and port', 'destination port', 'mac address', 'source port'],
            'Standard ACLs see exactly one field, which is why their placement matters.', 'text', ['source', 'source ip', 'source ip address', 'the source address']],
        ['Where should you place a standard ACL?', 'close to the destination',
            ['close to the source', 'on the core switch', 'on every interface', 'outbound on the internet edge', 'on the default gateway of the source', 'inbound on the first hop'],
            'It cannot see where traffic is going, so put it where it will block only what you meant to block.', 'text',
            ['near the destination', 'closest to the destination', 'destination', 'as close to the destination as possible']],
        ['Where should you place an extended ACL?', 'close to the source',
            ['close to the destination', 'on the core switch', 'on every interface', 'outbound on the internet edge', 'on the destination server', 'in the middle of the path'],
            'It knows exactly which traffic it wants, so drop that traffic before it wastes any bandwidth.', 'text',
            ['near the source', 'closest to the source', 'source', 'as close to the source as possible']],
        ['Numbered standard IPv4 ACLs use 1-99 and which expanded range?', '1300-1999', ['100-199', '2000-2699', '1000-1099', '200-299', '700-799', '1-99'],
            'The extended ACLs got 100-199 and 2000-2699. The standard expansion comes just before the second of those.', 'text', ['1300 to 1999', '1300 - 1999', '1300-1999']],
        ['In NAT terms, what is the private address of an inside host, as seen from the inside?', 'inside local', ['inside global', 'outside local', 'outside global', 'private global', 'local inside', 'nat pool'],
            'The first word says which host. The second says from where it is seen.', 'text'],
        ['In NAT terms, what is the public address that represents an inside host to the outside world?', 'inside global', ['inside local', 'outside local', 'outside global', 'public local', 'global outside', 'nat pool'],
            'It is still the inside host, but seen from the global side.', 'text'],
        ['Complete the PAT command: "ip nat inside source list 1 interface Gi0/0 ____"', 'overload', ['pat', 'extendable', 'static', 'pool', 'reversible', 'many-to-one'],
            'Many inside hosts share one address. The keyword describes what you are doing to that address.', 'text'],
        ['Which command lists the active NAT translations?', 'show ip nat translations',
            ['show ip nat statistics', 'show nat', 'show ip nat', 'show xlate', 'show ip translations', 'debug ip nat'],
            'On an ASA it would be xlate. On IOS, spell it out.', 'text', ['sh ip nat trans', 'sh ip nat translations', 'show ip nat trans', 'sh ip nat tr', 'sh ip nat translation']],
        ['What invisible line ends every IOS ACL?', 'deny any', ['permit any', 'permit ip any any', 'log', 'remark', 'deny host 0.0.0.0', 'nothing, unmatched traffic passes'],
            'It is why an ACL with only deny lines blocks everything.', 'text', ['implicit deny', 'deny ip any any', 'implicit deny any', 'deny all']],
        ['Which interface command applies ACL 10 to inbound traffic?', 'ip access-group 10 in',
            ['access-class 10 in', 'ip access-list 10 in', 'access-group 10 in', 'ip access-group 10 out', 'ip filter 10 in', 'apply access-list 10 in'],
            'access-class is for vty lines, and the ASA drops the "ip". On an IOS interface, you want neither.', 'text', ['ip access-group 10 in']]
    ];

    const OSPF = [
        ['What OSPF neighbor state means the two routers have fully synchronized databases?', 'full', ['2-way', 'exstart', 'exchange', 'loading', 'established', 'init'],
            'Established is BGP\'s word. OSPF\'s is shorter.', 'text'],
        ['On an Ethernet segment, two DROTHER routers stay in which OSPF state with each other?', '2-way', ['full', 'init', 'exstart', 'down', 'attempt', 'loading'],
            'They see each other\'s hellos, but only form full adjacencies with the DR and BDR.', 'text', ['2way', 'two-way', 'two way', '2 way']],
        ['In which OSPF state do neighbors elect master and slave and agree on the starting DBD sequence number?', 'exstart', ['exchange', 'loading', '2-way', 'init', 'full', 'attempt'],
            'It comes just before the database descriptions are actually traded.', 'text', ['ex start', 'ex-start']],
        ['What is the default OSPF interface priority?', '1', ['0', '255', '100', '32768', '10', '128'],
            'Zero means "never be DR". The default is the next number up.', 'int'],
        ['Which OSPF interface priority makes a router ineligible to become DR or BDR?', '0', ['1', '255', '100', '-1', '256', '65535'],
            'Priority is 0-255 and higher wins. Pick the value that cannot win.', 'int'],
        ['Two routers on a segment have the same OSPF priority. What breaks the DR election tie?', 'highest router id',
            ['lowest router id', 'highest mac address', 'lowest ip address', 'highest interface bandwidth', 'lowest cost', 'first to boot'],
            'OSPF identifies routers by one 32-bit value, and higher is better.', 'text', ['router id', 'highest router-id', 'highest rid', 'router-id', 'higher router id']],
        ['To which multicast address do OSPF routers send updates meant for the DR and BDR?', '224.0.0.6', ['224.0.0.5', '224.0.0.9', '224.0.0.10', '224.0.0.2', '224.0.0.18', '224.0.0.102'],
            'All OSPF routers use one address. The DRs listen on the very next one.', 'ipv4'],
        ['To which multicast address are OSPF hellos sent on a broadcast network?', '224.0.0.5', ['224.0.0.6', '224.0.0.9', '224.0.0.10', '224.0.0.2', '224.0.0.18', '224.0.0.1'],
            'RIPv2 uses .9 and EIGRP uses .10. OSPF has the address just below its DR address.', 'ipv4'],
        ['What is the default OSPF dead interval, in seconds, on an Ethernet interface?', '40', ['10', '30', '120', '180', '4', '60'],
            'Four times the hello interval.', 'int'],
        ['With no router-id command and loopbacks configured, how does OSPF pick its router ID?', 'highest loopback ip',
            ['lowest loopback ip', 'highest physical interface ip', 'lowest physical interface ip', 'highest mac address', 'the management interface ip', 'the first interface configured'],
            'Loopbacks never go down, so they are preferred. Then, as in the DR tiebreak, higher wins.', 'text',
            ['highest loopback', 'highest loopback address', 'highest loopback ip address', 'highest ip on a loopback', 'the highest loopback ip']],
        ['What is the OSPF backbone area number?', '0', ['1', '255', '100', '10', '51', '65535'],
            'Every other area must connect to it. It also writes as 0.0.0.0.', 'int']
    ];

    // Generated: OSPF cost from reference bandwidth
    const SPEEDS = [[10, '10 Mbps'], [100, '100 Mbps'], [1000, '1 Gbps'], [10000, '10 Gbps'], [25000, '25 Gbps'], [40000, '40 Gbps'], [100000, '100 Gbps']];
    const REFS = [100, 1000, 10000, 100000];
    const cleanCost = (ref, s) => ref % s === 0 || ref < s;
    const cost = (ref, s) => Math.max(1, Math.floor(ref / s));
    const refText = ref => ref === 100 ? 'the default reference bandwidth (100 Mbps)' : `"auto-cost reference-bandwidth ${ref}"`;

    function genOspfCost(rng) {
        const ref = pick(rng, REFS);
        const ok = SPEEDS.filter(([s]) => cleanCost(ref, s));
        if (pick(rng, ['single', 'single', 'path']) === 'single') {
            const [s, label] = pick(rng, ok);
            const c = cost(ref, s);
            return {
                q: `With ${refText(ref)}, what OSPF cost does a ${label} interface get? (Interface bandwidth is left at its default.)`,
                answer: String(c), norm: 'int',
                distractors: [cost(100, s), c * 10, Math.floor(c / 10), Math.floor(s / ref), ref, 0, c + 1].map(String),
                hint: 'Cost is reference bandwidth divided by interface bandwidth, in the same units, and never less than 1.'
            };
        }
        const hops = [pick(rng, ok), pick(rng, ok), pick(rng, ok)];
        const costs = hops.map(([s]) => cost(ref, s));
        const total = costs.reduce((x, y) => x + y, 0);
        return {
            q: `With ${refText(ref)} on every router, a route leaves R1 on ${hops[0][1]}, R2 on ${hops[1][1]} and R3 on ${hops[2][1]} to reach the destination LAN. ` +
                'Ignoring the LAN interface itself, what is the total OSPF cost? (Interface bandwidths are at their defaults.)',
            answer: String(total), norm: 'int',
            distractors: [Math.max(...costs), Math.min(...costs), hops.map(([s]) => cost(100, s)).reduce((x, y) => x + y, 0), total * 10, 3, total + 1].map(String),
            hint: 'Work out each outgoing interface\'s cost on its own, then add them up.'
        };
    }

    // Generated: spanning-tree root election
    const SW_NAMES = ['CORE-1', 'CORE-2', 'DIST-1', 'DIST-2', 'ACC-1', 'ACC-2', 'ACC-3'];

    function genStpRoot(rng) {
        const names = shuffle(rng, SW_NAMES);
        const low = pick(rng, [4096, 8192, 24576, 28672, 32768]);
        const ties = randInt(rng, 2, 3);
        const macs = distinctMacs(rng, names.length);
        const sws = names.map((name, i) => ({
            name, mac: macs[i],
            pri: i < ties ? low : Math.min(61440, low + 4096 * randInt(rng, 1, 4))
        }));
        const root = sws.slice().sort((x, y) => x.pri - y.pri || (x.mac < y.mac ? -1 : 1))[0];
        const table = shuffle(rng, sws).map(s => `${s.name.padEnd(7)} priority ${String(s.pri).padStart(5)}  MAC ${s.mac}`).join('\n');
        if (pick(rng, ['root', 'root', 'priority']) === 'root') {
            return {
                q: `Seven switches run spanning tree for the same VLAN (configured priorities shown):\n${table}\n\nWhich switch becomes the root bridge?`,
                answer: root.name, norm: 'text',
                distractors: sws.filter(s => s !== root).map(s => s.name),
                hint: 'Lowest bridge ID wins: priority first, and only if that ties, the MAC address.'
            };
        }
        const other = pick(rng, sws.filter(s => s !== root));
        const ans = root.pri - 4096;
        return {
            q: `Seven switches run spanning tree for the same VLAN (configured priorities shown):\n${table}\n\n` +
                `What is the highest priority you can configure on ${other.name} that guarantees it becomes root, whatever its MAC?`,
            answer: String(ans), norm: 'int', noPad: true,
            distractors: [root.pri, root.pri - 1, root.pri - 8192, root.pri + 4096, root.pri + 8192, 0, other.pri - 4096, other.pri, 32768, 61440].filter(n => n >= 0).map(String),
            hint: 'Find the current root first. Priorities only come in steps of 4096, and a tie would fall back to the MAC.'
        };
    }

    const L2 = [
        ['In classic 802.1D STP, which port state learns MAC addresses but does not forward frames yet?', 'learning', ['listening', 'blocking', 'forwarding', 'disabled', 'discarding', 'alternate'],
            'The name says exactly what it is doing.', 'text'],
        ['Which RSTP port state replaces 802.1D\'s blocking and listening states?', 'discarding', ['blocking', 'listening', 'learning', 'alternate', 'backup', 'disabled'],
            'Alternate and backup are roles, not states. The state describes what happens to frames.', 'text'],
        ['What is the default 802.1D forward delay, in seconds?', '15', ['20', '2', '30', '50', '10', '6'],
            'Hello is 2 and max age is 20. A port spends this long in each of two states before forwarding.', 'int'],
        ['What is the default 802.1D max age timer, in seconds?', '20', ['15', '2', '30', '50', '10', '60'],
            'Ten hellos\' worth.', 'int'],
        ['How does an 802.1Q trunk send frames from the native VLAN?', 'untagged',
            ['tagged with vlan 1', 'double-tagged', 'tagged with the native vlan id', 'dropped', 'tagged with vlan 0', 'encapsulated in isl'],
            'That is the whole point of a native VLAN, and why a mismatch quietly merges two VLANs.', 'text', ['without a tag', 'no tag', 'untagged frames']],
        ['One side of a link has "channel-group 1 mode passive". Which mode on the other side forms an LACP bundle?', 'active', ['passive', 'auto', 'desirable', 'on', 'dynamic', 'lacp'],
            'Two passive sides wait for each other forever. Someone has to start talking LACP.', 'text', ['mode active', 'channel-group 1 mode active']],
        ['One side of a link has "channel-group 1 mode auto". Which mode on the other side forms a PAgP bundle?', 'desirable', ['auto', 'active', 'passive', 'on', 'dynamic desirable', 'trunk'],
            'Auto is PAgP\'s waiting mode. The other side must actively ask.', 'text', ['mode desirable', 'channel-group 1 mode desirable']],
        ['Which channel-group mode forces a bundle with no negotiation protocol at all?', 'on', ['active', 'passive', 'desirable', 'auto', 'static', 'force'],
            'No LACP, no PAgP. Both sides must use it, or you get a loop.', 'text', ['mode on', 'channel-group 1 mode on']],
        ['Which IEEE standard defines LACP?', '802.3ad', ['802.1Q', '802.1D', '802.1w', '802.1s', '802.3af', '802.1X'],
            'It started life in the 802.3 Ethernet family and later moved to 802.1AX.', 'text', ['802.1ax', 'ieee 802.3ad', 'ieee 802.1ax']],
        ['Which feature err-disables a PortFast access port the moment it receives a BPDU?', 'bpdu guard', ['root guard', 'bpdu filter', 'loop guard', 'portfast', 'storm control', 'udld'],
            'Filter ignores BPDUs. You want the one that guards against them.', 'text', ['bpduguard', 'bpdu-guard', 'spanning-tree bpduguard enable']],
        ['Which feature puts a port into root-inconsistent state if it receives a superior BPDU?', 'root guard', ['bpdu guard', 'loop guard', 'bpdu filter', 'portfast', 'udld', 'uplinkfast'],
            'It protects your choice of root bridge, not the port itself.', 'text', ['rootguard', 'root-guard', 'spanning-tree guard root']]
    ];

    // ================= ACT 3: Core =================

    const BGP = [
        ['Assuming the next hop is reachable, which attribute does Cisco BGP compare first when choosing a best path?', 'weight',
            ['local preference', 'as path length', 'med', 'origin', 'router id', 'next hop'],
            'It is Cisco-specific and never leaves the router.', 'text', ['highest weight']],
        ['Which BGP attribute is compared second, right after weight?', 'local preference',
            ['weight', 'as path length', 'med', 'origin', 'ebgp over ibgp', 'lowest router id'],
            'It is shared across your whole AS, and higher wins.', 'text', ['local pref', 'local_pref', 'local-preference', 'localpref', 'highest local preference']],
        ['After weight, local preference and locally originated routes, which BGP attribute is compared next?', 'as path length',
            ['origin', 'med', 'ebgp over ibgp', 'router id', 'igp metric to next hop', 'local preference'],
            'Fewer autonomous systems in the way is better.', 'text', ['as path', 'as-path', 'as_path', 'shortest as path', 'as-path length', 'shortest as-path']],
        ['Which BGP attribute is Cisco-proprietary and never advertised to any neighbor?', 'weight',
            ['local preference', 'med', 'community', 'as path', 'origin', 'atomic aggregate'],
            'It is the first thing Cisco checks, and it is local to one router.', 'text'],
        ['What is the default BGP local preference?', '100', ['0', '32768', '1', '200', '110', '20'],
            'A round number. Higher is preferred.', 'int'],
        ['What weight does Cisco BGP give to routes the router originates itself?', '32768', ['0', '100', '65535', '32767', '1', '200'],
            'Learned routes get 0. Local ones get half of 65536.', 'int'],
        ['When BGP compares MED, which value is preferred?', 'lower', ['higher', 'it is never compared', 'whichever arrived first', 'only zero', 'the one from the ebgp peer', 'the average'],
            'MED is a metric, and metrics behave like distance.', 'text', ['lowest', 'lower med', 'lowest med', 'the lower one', 'the lowest']],
        ['All earlier attributes tie between an eBGP-learned path and an iBGP-learned path. Which wins?', 'ebgp',
            ['ibgp', 'the one with lower router id', 'the newest path', 'neither, both are installed', 'the one with higher weight', 'the one with lower med'],
            'Prefer the path that leaves your AS directly.', 'text', ['the ebgp path', 'ebgp learned', 'external', 'ebgp path', 'the ebgp-learned path']],
        ['What is the default administrative distance of an eBGP route on IOS?', '20', ['200', '110', '90', '120', '1', '170'],
            'External BGP beats every IGP. Internal BGP is ten times worse.', 'int'],
        ['What is the default administrative distance of an iBGP route on IOS?', '200', ['20', '110', '170', '90', '115', '255'],
            'It loses to every IGP, so an IGP route to the same prefix wins.', 'int'],
        ['Which TCP port does BGP use?', '179', ['178', '197', '520', '89', '646', '1179'],
            'One hundred and something. LDP is 646 and OSPF is IP protocol 89, not a port at all.', 'int'],
        ['Which BGP neighbor state means the session is up and exchanging updates?', 'established', ['full', 'active', 'openconfirm', 'connect', 'idle', 'opensent'],
            'Active sounds healthy, but it means the router is still trying to connect.', 'text']
    ];

    const FHRP = [
        ['What is the default HSRP priority?', '100', ['0', '1', '255', '110', '50', '254'],
            'A round number, and higher wins.', 'int'],
        ['Which HSRP group 1 interface command lets a higher-priority router take back the active role?', 'standby 1 preempt',
            ['standby 1 priority 110', 'standby 1 track 1', 'vrrp 1 preempt', 'standby 1 active', 'hsrp 1 preempt', 'standby 1 force'],
            'HSRP does not do this by default. The verb is the same as in VRRP, but the family is "standby".', 'text', ['standby 1 pre']],
        ['Which Cisco-proprietary first-hop redundancy protocol load-balances across routers using several virtual MAC addresses?', 'glbp',
            ['hsrp', 'vrrp', 'carp', 'lacp', 'pagp', 'vtp'],
            'The "LB" in its name is the hint.', 'text', ['gateway load balancing protocol']],
        ['What virtual MAC address does HSRP version 1 use for group 10?', '0000.0c07.ac0a',
            ['0000.0c9f.f00a', '0000.5e00.010a', '0000.0c07.ac10', '0007.b400.0a01', '0100.5e00.0002', 'ffff.ffff.ffff'],
            'HSRPv1 MACs start 0000.0c07.ac, and the last byte is the group number in hex.', 'text', ['00:00:0c:07:ac:0a', '00-00-0c-07-ac-0a', '0000.0C07.AC0A']],
        ['What VRRP priority does the router that owns the virtual IP address use?', '255', ['100', '254', '0', '1', '110', '256'],
            'The owner always wins, so it takes the highest value possible.', 'int'],
        ['To which multicast address does HSRP version 2 send hellos?', '224.0.0.102', ['224.0.0.2', '224.0.0.18', '224.0.0.5', '224.0.0.10', '224.0.0.9', '224.0.0.1'],
            'Version 1 used the all-routers address. Version 2 moved to an address with a hundred added.', 'ipv4'],
        ['What is the default HSRP hold time, in seconds?', '10', ['3', '30', '40', '15', '1', '180'],
            'The hello is 3 seconds. The hold time is a bit over three hellos.', 'int'],
        ['What is the default VRRP priority on a router that does not own the virtual IP?', '100', ['255', '0', '1', '110', '254', '50'],
            'Same default as HSRP.', 'int']
    ];

    // Generated: DSCP values
    const DSCP = [{ name: 'EF', val: 46 }];
    for (let x = 1; x <= 4; x++) for (let y = 1; y <= 3; y++) DSCP.push({ name: `AF${x}${y}`, val: 8 * x + 2 * y, x, y });
    for (let n = 1; n <= 7; n++) DSCP.push({ name: `CS${n}`, val: 8 * n, cs: n });

    function dscpAccept(c) {
        const out = [c.name];
        if (c.name === 'EF') out.push('expedited forwarding');
        return out;
    }

    function genDscp(rng) {
        const c = pick(rng, DSCP);
        const variant = pick(rng, ['dec', 'dec', 'name', 'bin', 'tos', 'drop']);
        const near = DSCP.filter(d => d !== c).sort((a, b) => Math.abs(a.val - c.val) - Math.abs(b.val - c.val) || (a.name < b.name ? -1 : 1));
        if (variant === 'name') {
            return {
                q: `A packet is marked DSCP ${c.val}. What per-hop behavior name is that?`,
                answer: c.name, norm: 'text', accept: dscpAccept(c),
                distractors: near.slice(0, 7).map(d => d.name),
                hint: 'AFxy is 8x + 2y, CSn is 8n, and voice gets its own name.'
            };
        }
        if (variant === 'drop') {
            const x = randInt(rng, 1, 4);
            const high = pick(rng, [true, false]);
            const y = high ? 3 : 1;
            return {
                q: `Within assured forwarding class AF${x}x, which marking has the ${high ? 'highest' : 'lowest'} drop probability?`,
                answer: `AF${x}${y}`, norm: 'text',
                distractors: [`AF${x}${4 - y}`, `AF${x}2`, `AF${5 - x}${y}`, `AF${y}${x}`, `CS${x}`, 'EF', `AF4${y}`, `AF1${y}`, `AF${5 - x}${4 - y}`, `CS${5 - x}`],
                hint: 'The first digit is the class. The second digit is drop precedence, and a bigger number is dropped sooner.'
            };
        }
        const wrongVals = c.name === 'EF' ? [40, 48, 44, 5, 56, 34]
            : c.cs ? [c.cs, c.cs * 10, c.val + 2, 8 * (c.cs + 1), c.val - 2, 2 * c.cs]
                : [10 * c.x + c.y, 8 * c.x + c.y, 8 * c.y + 2 * c.x, 8 * c.x, c.val + 2, c.val - 2];
        if (variant === 'dec') {
            return {
                q: `What decimal DSCP value is ${c.name}?`,
                answer: String(c.val), norm: 'int', distractors: wrongVals.concat([c.val * 4]).map(String),
                hint: c.name === 'EF' ? 'Voice. Binary 101110.' : 'AFxy is 8x + 2y and CSn is 8n. Do not just read the digits off the name.'
            };
        }
        if (variant === 'tos') {
            return {
                q: `${c.name} (DSCP ${c.val}) is written into the 8-bit ToS byte. What decimal value does the whole byte hold, with the ECN bits at 0?`,
                answer: String(c.val * 4), norm: 'int', distractors: [c.val, c.val * 2, c.val * 8, c.val * 4 + 1, c.val + 4, c.val * 4 + 3].map(String),
                hint: 'DSCP is the top 6 bits of the byte, so shift it left past the 2 ECN bits.'
            };
        }
        const b6 = v => v.toString(2).padStart(6, '0');
        return {
            q: `Write ${c.name} (the 6-bit DSCP field) in binary.`,
            answer: b6(c.val), norm: 'bin8',
            distractors: [(c.val * 4).toString(2).padStart(8, '0')].concat(wrongVals.filter(v => v < 64).map(b6), [b6(c.val).split('').reverse().join(''), b6(c.val ^ 8)]),
            hint: 'Get the decimal value first: AFxy is 8x + 2y, CSn is 8n, EF is 46.'
        };
    }

    const REDIST = [
        ['You redistribute OSPF into EIGRP with no metric and no default-metric. What seed metric do the routes get?', 'infinity',
            ['0', '1', '20', 'the original ospf cost', '110', 'the interface bandwidth'],
            'EIGRP will not invent a metric for routes from another protocol. Without one, they are unusable.', 'text', ['infinite', 'unreachable', 'infinite metric', 'infinity, so they are not used']],
        ['You redistribute EIGRP into OSPF with no metric set. What default metric do the routes get?', '20', ['1', '0', '110', '10', '100', '64'],
            'BGP routes would get 1. Every other source gets the same small number.', 'int'],
        ['By default, redistributed routes appear in an OSPF router\'s table with which code?', 'E2', ['E1', 'O IA', 'N2', 'O', 'D EX', 'N1'],
            'External type 2 keeps the seed metric and does not add the internal cost.', 'text', ['o e2', 'external type 2', 'type 2', 'e 2']],
        ['With two-way redistribution at two routers, what do you set on routes as you redistribute them, so the other router can refuse to send them back?', 'route tag',
            ['administrative distance', 'metric', 'community', 'weight', 'med', 'next hop'],
            'It is just a number stamped on the route that route-maps can match on later.', 'text', ['tag', 'tags', 'route tags', 'a tag', 'a route tag']],
        ['What is the default administrative distance of an EIGRP external route?', '170', ['90', '110', '120', '200', '20', '115'],
            'Internal EIGRP is 90. External routes are trusted far less.', 'int'],
        ['Which keyword on a redistribute command lets you match and filter which routes get redistributed?', 'route-map',
            ['match', 'prefix-list', 'access-list', 'filter', 'tag', 'distribute-list'],
            'It can match prefixes, tags and more, and set metrics while it is at it.', 'text', ['route map']],
        ['Under router ospf, which command injects directly connected networks that no network statement covers?', 'redistribute connected',
            ['default-information originate', 'redistribute static', 'passive-interface default', 'import connected', 'summary-address', 'network connected'],
            'Connected routes are another source, so you bring them in the same way you bring in any other.', 'text', ['redistribute connected subnets', 'redis conn', 'redistribute conn', 'redist connected']],
        ['A static backup route should only be used if the OSPF route disappears. Its distance must be greater than what value?', '110', ['1', '90', '120', '20', '170', '255'],
            'A floating static has to lose to the route it backs up. What is OSPF\'s distance?', 'int']
    ];

    const AAA = [
        ['Which configuration register value makes an IOS router ignore the startup configuration on boot?', '0x2142', ['0x2102', '0x2100', '0x2141', '0x2120', '0x2042', '0x0142'],
            'The normal value is 0x2102. One hex digit changes so NVRAM is skipped.', 'text', ['2142']],
        ['Which configuration register value is the normal default on an IOS router?', '0x2102', ['0x2142', '0x2100', '0x2101', '0x2012', '0x0102', '0x2122'],
            'Restore this after password recovery, or the next reload will come up blank again.', 'text', ['2102']],
        ['At the rommon prompt during password recovery, which command sets the configuration register to bypass the startup config?', 'confreg 0x2142',
            ['config-register 0x2142', 'set confreg 0x2142', 'boot 0x2142', 'confreg 0x2102', 'reset 0x2142', 'write confreg 0x2142'],
            'config-register is the IOS global command. ROMMON uses a shorter name.', 'text', ['confreg 2142']],
        ['After booting with the startup config bypassed, which command loads the old config without wiping it?', 'copy startup-config running-config',
            ['copy running-config startup-config', 'copy run start', 'write memory', 'reload', 'write erase', 'show startup-config'],
            'Get it into running config, then change the password, then save. Getting the order backwards erases it.', 'text',
            ['copy start run', 'copy startup-config running', 'copy start running-config', 'configure memory', 'copy startup run']],
        ['On an ISR router console, which key sequence drops a booting router into ROMMON?', 'break',
            ['ctrl+c', 'ctrl+z', 'ctrl+shift+6', 'esc', 'f8', 'ctrl+alt+del'],
            'You have about 60 seconds after power-on. Your terminal emulator may need you to send it from a menu.', 'text', ['ctrl+break', 'send break', 'break key']],
        ['Which TCP port does TACACS+ use?', '49', ['1812', '1645', '1813', '389', '88', '4949'],
            'It is a small, old, two-digit port.', 'int'],
        ['TACACS+ or RADIUS: which one encrypts the entire packet body?', 'tacacs+', ['radius', 'ldap', 'kerberos', 'diameter', 'snmpv2c', 'neither'],
            'The other one only hides the password field.', 'text', ['tacacs', 'tacacs plus']],
        ['Which global command must come first before any other AAA commands work?', 'aaa new-model',
            ['aaa authentication login default group tacacs+ local', 'aaa enable', 'tacacs server ISE', 'login local', 'aaa authorization exec default local', 'service aaa'],
            'It switches the device from the old line-password model to the new one.', 'text'],
        ['Which part of AAA decides what commands a logged-in user may run?', 'authorization', ['authentication', 'accounting', 'auditing', 'administration', 'attestation', 'access control'],
            'The first A checks who you are. This one checks what you are allowed to do.', 'text'],
        ['Which part of AAA records what commands a user ran, for the audit trail?', 'accounting', ['authentication', 'authorization', 'auditing', 'archiving', 'logging', 'administration'],
            'Think billing records, not permissions.', 'text']
    ];

    const STORM = [
        ['Which interface feature drops broadcast traffic once it passes a configured threshold?', 'storm-control',
            ['bpdu guard', 'port-security', 'rate-limit', 'qos police', 'udld', 'loop guard'],
            'It is named after exactly what you are fighting.', 'text', ['storm control', 'storm-control broadcast level', 'storm-control broadcast']],
        ['What is the most common cause of a broadcast storm in a switched network?', 'layer 2 loop',
            ['duplex mismatch', 'dhcp exhaustion', 'arp poisoning', 'mtu mismatch', 'routing loop', 'native vlan mismatch'],
            'Spanning tree exists to prevent it. Someone patched a cable where they should not have.', 'text',
            ['loop', 'switching loop', 'bridging loop', 'a layer 2 loop', 'l2 loop', 'spanning tree loop', 'a loop', 'layer two loop']],
        ['Why does a looping broadcast frame circulate forever, when a looping IP packet eventually dies?', 'ethernet has no ttl',
            ['the switch rewrites it each hop', 'stp keeps refreshing it', 'the crc is recalculated', 'broadcasts have infinite priority', 'the mac table pins it', 'ttl is reset at each hop'],
            'IP decrements a counter at every hop. Look for that counter in an Ethernet header.', 'text',
            ['no ttl', 'ethernet frames have no ttl', 'there is no ttl', 'no ttl in ethernet', 'layer 2 has no ttl', 'frames have no ttl']],
        ['During a loop, the same MAC is learned on two ports, back and forth. What is that symptom called?', 'mac flapping',
            ['err-disable', 'duplex mismatch', 'native vlan mismatch', 'port security violation', 'bpdu guard', 'cdp flap'],
            'The syslog mnemonic is MACFLAP_NOTIF.', 'text', ['mac address flapping', 'mac flap', 'mac move', 'mac moves', 'flapping', 'mac flaps']],
        ['Which command lists only err-disabled ports, along with the reason each one was disabled?', 'show interfaces status err-disabled',
            ['show errdisable recovery', 'show interfaces status', 'show logging', 'show spanning-tree blockedports', 'show port-security', 'show ip interface brief'],
            'Start from the per-port status table and filter it.', 'text',
            ['sh int status err-disabled', 'show int status err-disabled', 'sh int status err', 'show interfaces status err', 'sh int stat err', 'sh interfaces status err-disabled']],
        ['Which global command makes ports err-disabled by BPDU guard come back on their own after a timer?', 'errdisable recovery cause bpduguard',
            ['errdisable detect cause bpduguard', 'spanning-tree bpduguard disable', 'errdisable recovery interval 300', 'no errdisable', 'clear errdisable', 'spanning-tree portfast'],
            'Detection is on by default. You are turning on recovery, for one specific cause.', 'text', ['errdisable recovery cause bpdu']],
        ['You have found the looping port. Which interface command stops the storm right now?', 'shutdown',
            ['no shutdown', 'spanning-tree portfast', 'clear mac address-table', 'storm-control broadcast level 100', 'switchport mode access', 'reload'],
            'The oldest fix in the book. Remember to undo it once the cable is gone.', 'text', ['shut']]
    ];

    // Answers that are IOS commands are graded with the "ios" matcher, which accepts any
    // keyword prefix of 2+ letters (sh ip int br), so players aren't limited to the
    // abbreviations listed in `accept`. (confreg is left out: it is a ROMMON command, and
    // ROMMON doesn't expand abbreviations.)
    const IOS_COMMAND = /^(show|copy|configure|write|switchport|lldp|cdp|service|crypto|transport|login|enable|line|ip|standby|vrrp|redistribute|aaa|errdisable|spanning-tree|channel-group|storm-control|no|interface \S*\d|router|network|auto-cost|clear|reload|vlan)\b/i;
    const commands = gen => rng => {
        const q = gen(rng);
        if (q.norm === 'text' && /\s/.test(q.answer) && IOS_COMMAND.test(q.answer)) q.norm = 'ios';
        return q;
    };

    Q.registerTopics({
        'cisco-modes': { label: 'IOS modes and prompts', gen: commands(fromPool(MODES, 'text')) },
        'cisco-show': { label: 'IOS show commands', gen: commands(fromPool(SHOW, 'text')) },
        'cisco-vlan': { label: 'VLANs, trunks and CDP/LLDP', gen: commands(fromPool(VLAN, 'text')) },
        'cisco-save': { label: 'Saving config and securing lines', gen: commands(fromPool(SAVE, 'text')) },
        'cisco-mac': { label: 'MAC address table forwarding', gen: genMacTable },
        'cisco-wildcard': { label: 'Wildcard masks', gen: genWildcard, tool: 'nettools/subnet-calculator.html' },
        'cisco-aclmatch': { label: 'ACL matching', gen: genAclMatch },
        'cisco-natacl': { label: 'ACL placement and NAT', gen: commands(fromPool(NATACL, 'text')) },
        'cisco-ospf': { label: 'OSPF neighbors and DR/BDR', gen: commands(fromPool(OSPF, 'text')) },
        'cisco-ospfcost': { label: 'OSPF cost', gen: genOspfCost },
        'cisco-stproot': { label: 'STP root election', gen: genStpRoot },
        'cisco-l2': { label: 'STP, trunks and EtherChannel', gen: commands(fromPool(L2, 'text')) },
        'cisco-bgp': { label: 'BGP path selection', gen: commands(fromPool(BGP, 'text')) },
        'cisco-fhrp': { label: 'HSRP, VRRP and GLBP', gen: commands(fromPool(FHRP, 'text')) },
        'cisco-dscp': { label: 'QoS DSCP markings', gen: genDscp },
        'cisco-redist': { label: 'Route redistribution', gen: commands(fromPool(REDIST, 'text')) },
        'cisco-aaa': { label: 'AAA and password recovery', gen: commands(fromPool(AAA, 'text')) },
        'cisco-storm': { label: 'Broadcast storm troubleshooting', gen: commands(fromPool(STORM, 'text')) }
    });

    // ================= World =================

    const ITEMS = {
        'energy-drink': {
            name: 'Energy Drink of Uptime', names: ['energy drink', 'drink', 'potion', 'can', 'energy drink of uptime'], kind: 'potion',
            desc: 'A dented can of something neon, warm from sitting on a switch stack. Drink it to restore a life, or trade it for a hint.'
        },
        'noc-thermos': {
            name: 'Thermos of NOC Coffee', names: ['thermos', 'coffee', 'potion', 'thermos of noc coffee'], kind: 'potion',
            desc: 'A steel thermos labelled "DO NOT TOUCH - NIGHT SHIFT". Drink it to restore a life, or trade it for a hint.'
        },
        'vending-cola': {
            name: 'Vending Machine Cola', names: ['cola', 'soda', 'potion', 'vending machine cola'], kind: 'potion',
            desc: 'The last can the machine will ever dispense. Drink it to restore a life, or trade it for a hint.'
        },
        'golden-config': {
            name: 'Golden Config Printout', names: ['printout', 'config', 'golden config', 'golden config printout', 'paper'], kind: 'key',
            desc: 'A stapled printout of the last known good running-config, dated and initialled. Ghosts of unsaved changes fear it.'
        },
        'bpdu-amulet': {
            name: 'BPDU Guard Amulet', names: ['amulet', 'bpdu amulet', 'bpdu guard amulet', 'guard'], kind: 'key',
            desc: 'A silver amulet stamped "spanning-tree bpduguard enable". Anything that loops back on itself recoils from it.'
        },
        'console-cable': {
            name: 'Console Cable', names: ['cable', 'console cable', 'rollover', 'rollover cable'], kind: 'key',
            desc: 'A light-blue rollover cable with an RJ-45 on one end and a USB-serial adapter on the other. It does not need the network to work.'
        },
        'gbic': {
            name: 'GBIC', names: ['gbic', 'transceiver'], kind: 'junk',
            desc: 'A GBIC the size of a candy bar, from a switch that went end-of-life before some of your colleagues were born.',
            use: 'Nothing in this realm has a slot big enough for it anymore.'
        },
        'serial-cable': {
            name: 'DB-60 serial cable', names: ['serial cable', 'db-60', 'db60', 'serial'], kind: 'junk',
            desc: 'A thick DB-60 cable for a T1 that was cancelled in 2011. Someone is still paying for the circuit.',
            use: 'You look for a WIC to plug it into. There has not been one here for years.'
        },
        'label-maker': {
            name: 'label maker', names: ['label maker', 'labeler', 'labeller'], kind: 'junk',
            desc: 'It has a fresh tape cartridge, which makes it the most valuable object in the building.',
            use: 'You label the label maker "label maker". It feels like progress.'
        }
    };

    const ACTS = [
        {
            n: 1, name: 'The Access Layer', start: 'closet', boss: 'reload-crypt', key: 'golden-config',
            intro: 'ACT I: THE ACCESS LAYER\nThe NOC calls at 2:12 AM: CORE-SW-01 is flapping, half the campus is dark, and nobody can log in to it. The change log for tonight is empty, which means someone made a change. You grab a console cable and head for the wiring closet.'
        },
        {
            n: 2, name: 'The Distribution Layer', start: 'dist-plaza', boss: 'loop-pit', key: 'bpdu-amulet',
            intro: 'ACT II: THE DISTRIBUTION LAYER\nPast the access switches, the uplinks thicken into port-channels and the routing gets opinions. Every link here is redundant, which means every link here is also a loop waiting for permission.'
        },
        {
            n: 3, name: 'The Core', start: 'core-antechamber', boss: 'core-cage', key: 'console-cable',
            intro: 'ACT III: THE CORE\nThe air in the core room is loud and dry. Every port LED on CORE-SW-01 blinks in perfect unison, which is never a good sign. Something made of broadcasts has taken up residence in its CPU.'
        }
    ];

    const ROOMS = {
        // ======================= ACT I =======================
        'closet': {
            act: 1, name: 'The Wiring Closet',
            text: 'A closet of blue patch cables, a humming access stack and a fan that sounds like it has opinions. A gate marked with prompts stands to the north, a narrow bridge runs east, and a cramped nook opens to the west. A cold stairwell leads south.',
            exits: { north: 'prompt-gate', east: 'cam-bridge', west: 'idf-nook', south: 'reload-crypt' },
            features: [
                { names: ['stack', 'switch', 'switches', 'access stack'], text: 'Every port on the stack is amber. The console port is empty. It is waiting for you.' },
                { names: ['stairwell', 'stairs', 'south', 'seals', 'seal', 'runes'], text: 'The stairwell door has five unlit status LEDs, one per guardian of this layer. From below comes a voice: "...I was configured... and then I reloaded..."' },
                { names: ['cables', 'patch cables'], text: 'Somebody labelled every cable "uplink". Every single one.' }
            ]
        },
        'idf-nook': {
            act: 1, name: 'The IDF Nook',
            text: 'A nook just big enough for one tired engineer and a rack of UPS batteries. A switch stack hums on a shelf above a dusty patch panel. The closet lies back east.',
            exits: { east: 'closet' },
            features: [
                { names: ['shelf', 'switch stack', 'stack', 'top'], text: 'On top of the warm switch stack, right over the exhaust vents, sits an unopened energy drink. Somebody was saving it for exactly tonight.', reveals: 'energy-drink' },
                { names: ['ups', 'batteries', 'battery'], text: 'The UPS reports 4 minutes of runtime. It has reported 4 minutes of runtime since 2019.' },
                { names: ['patch panel', 'panel'], text: 'Port 24 is labelled "DO NOT UNPLUG". Port 23 is labelled "SERIOUSLY". Neither one has a cable in it.' }
            ]
        },
        'prompt-gate': {
            act: 1, name: 'The Gate of Prompts',
            text: 'A stone arch carved with prompts: >, #, (config)#, (config-if)#. Each one glows a little brighter than the last. An archive lies north. The closet is back south.',
            exits: { south: 'closet', north: 'show-archive' },
            quiz: { topic: 'cisco-modes', guardian: 'the Prompt Warden', intro: 'A warden in a hooded cloak blocks the arch, a single blinking cursor where its face should be. "Where are you, and how did you get here?"', cleared: 'The cursor blinks twice, approvingly. "Privilege granted."' }
        },
        'show-archive': {
            act: 1, name: 'The Archive of Show Commands',
            text: 'Shelves of tractor-feed printouts, each one the output of a show command someone ran in 1998 and never read. A doorway east hums with tagged frames. The gate is back south.',
            exits: { south: 'prompt-gate', east: 'vlan-hall' },
            quiz: { topic: 'cisco-show', guardian: 'the Show Run Scribe', intro: 'A scribe with --More-- tattooed on both forearms looks up. "Nobody reads this far without the right command. Which one?"', cleared: 'The scribe presses the space bar and the shelves part for you.' }
        },
        'vlan-hall': {
            act: 1, name: 'The Hall of Tagged Frames',
            text: 'Frames stream overhead, each wearing a four-byte name tag. The ones with no tag at all slip by unnoticed. A beacon flashes to the east. The archive is back west.',
            exits: { west: 'show-archive', east: 'cdp-beacon' },
            quiz: { topic: 'cisco-vlan', guardian: 'the 802.1Q Tagger', intro: 'A clerk with a tagging gun blocks the hall. "No tag, no entry. Unless you\'re native, and nobody admits to being native."', cleared: 'The Tagger stamps a VLAN ID on your forehead. "Allowed on this trunk."' }
        },
        'cdp-beacon': {
            act: 1, name: 'The CDP Beacon',
            text: 'A lighthouse that announces itself to every neighbor every 60 seconds, whether they asked or not. On a lectern lies a stapled printout titled "GOLDEN CONFIG - DO NOT LOSE". Paths lead west to the hall and south to a graveyard.',
            exits: { west: 'vlan-hall', south: 'patch-graveyard' },
            items: ['golden-config'],
            features: [
                { names: ['beacon', 'light', 'lighthouse'], text: 'Device ID: CDP-BEACON. Platform: lighthouse. Capabilities: Router Switch IGMP Lighthouse. Holdtime: 180.' },
                { names: ['lectern'], text: 'Scratched into the wood: "write mem or it didn\'t happen".' }
            ]
        },
        'cam-bridge': {
            act: 1, name: 'The CAM Table Bridge',
            text: 'A wooden bridge whose planks are numbered like switch ports. Each one remembers who last stepped on it, for about five minutes. A yard opens to the east. The closet is back west.',
            exits: { west: 'closet', east: 'subnet-yard' },
            quiz: { topic: 'cisco-mac', guardian: 'the Forwarding Gnome', intro: 'A gnome with a clipboard of MAC addresses steps onto the bridge. "Every frame goes somewhere. Tell me where this one goes."', cleared: 'The gnome writes down your MAC and port. "Learned. Aging timer 300."' }
        },
        'subnet-yard': {
            act: 1, name: 'The Addressing Yard',
            text: 'Fenced pens of IP addresses, each sized by somebody who clearly never had to renumber anything. A path north runs toward a graveyard. The bridge is back west.',
            exits: { west: 'cam-bridge', north: 'patch-graveyard' },
            quiz: { topic: 'subnet', guardian: 'the IP Plan Auditor', intro: 'An auditor with a red pen blocks the gate. "Show me you can size a subnet before you touch my spreadsheet."', cleared: 'The auditor puts the red pen away. "Fine. No overlaps."' }
        },
        'patch-graveyard': {
            act: 1, name: 'The Patch Cable Graveyard',
            text: 'Coils of dead patch cables lie in neat graves, each with a little tag naming the port it once served. A GBIC rests on one like flowers. Paths lead north to the beacon and south to the yard.',
            exits: { south: 'subnet-yard', north: 'cdp-beacon' },
            items: ['gbic'],
            features: [
                { names: ['graves', 'grave', 'tags', 'tag', 'cables'], text: 'One tag reads: "Gi0/1 - uplink to old core. Unplugged during cleanup. Brought down the building. Reinstated, then unplugged again."' }
            ]
        },
        'reload-crypt': {
            act: 1, name: 'The Crypt of Unsaved Changes', boss: true,
            text: 'A crypt full of configuration that existed only in running memory. The Reload Revenant drifts among the tombs, wearing a whole night\'s work that vanished on the last power blip. Beyond it, a passage climbs to the distribution layer.',
            exits: { north: 'closet' },
            bossFight: {
                name: 'the Reload Revenant', topics: ['cisco-save', 'cisco-show'], key: 'golden-config',
                locked: 'The Revenant wails "%SYS-5-RELOAD" and your mind goes blank, like an unsaved config after a power cut. You need something written down.',
                intro: 'You hold up the Golden Config Printout. The Revenant recoils. "WRITTEN DOWN? SAVED? Then prove you know how it is done."',
                win: 'The Revenant sighs "Building configuration... [OK]" and fades into NVRAM. The passage to the distribution layer opens.'
            }
        },

        // ======================= ACT II =======================
        'dist-plaza': {
            act: 2, name: 'The Distribution Plaza',
            text: 'A plaza where a dozen port-channels braid together into one thick rope. A wildcard gate stands north, a market bustles east, and an inn leans to the west. To the south, the ground spins in a slow, sick circle.',
            exits: { north: 'wildcard-gate', east: 'nat-market', west: 'lacp-inn', south: 'loop-pit' },
            features: [
                { names: ['rope', 'port-channels', 'port-channel', 'channels'], text: 'Four 10-gig members, one logical link. One member is suspended because someone set it to "mode on" and the other side to "passive".' },
                { names: ['circle', 'south', 'ground', 'seals', 'seal', 'runes'], text: 'The spinning ground is ringed by five dark runes, one per guardian of this layer. Every few seconds the same broadcast goes past. Then again. Then again.' }
            ]
        },
        'lacp-inn': {
            act: 2, name: 'The Bundled Members Inn',
            text: 'An inn where links check in as a group and one of them always ends up suspended. A hatch behind the bar leads to a small cellar. The plaza is back east.',
            exits: { east: 'dist-plaza' },
            features: [
                { names: ['cellar', 'hatch', 'bar'], text: 'Down in the cellar, behind a crate of spare optics, sits a steel thermos marked "NIGHT SHIFT".', reveals: 'noc-thermos' },
                { names: ['guests', 'links', 'members'], text: 'Two guests argue. "I\'m active." "Well, I\'m passive." They are the only ones here getting along.' }
            ]
        },
        'wildcard-gate': {
            act: 2, name: 'The Inverted Gate',
            text: 'A gate built upside down: every lock is open where you expect it to be closed. A court lies north. The plaza is back south.',
            exits: { south: 'dist-plaza', north: 'acl-court' },
            quiz: { topic: 'cisco-wildcard', guardian: 'the Inverse Mask Sphinx', intro: 'A sphinx, painted in negative, unfolds above the gate. "I match what you do not care about. Show me you can think backwards."', cleared: 'The sphinx inverts itself back to normal and lets you through.' }
        },
        'acl-court': {
            act: 2, name: 'The Court of Access Lists',
            text: 'Judges read rules from a scroll, top to bottom, and stop at the first one that fits. A sanctum glows to the east. The gate is back south.',
            exits: { south: 'wildcard-gate', east: 'root-sanctum' },
            quiz: { topic: 'cisco-aclmatch', guardian: 'the Implicit Judge', intro: 'A judge nobody can see clears its throat. "I sit at the end of every list. Before you pass, tell me which line decides."', cleared: 'The invisible judge bangs a gavel. "Permitted. This time."' }
        },
        'root-sanctum': {
            act: 2, name: 'The Root Bridge Sanctum',
            text: 'A quiet sanctum where the lowest bridge ID sits on a throne, receiving BPDUs. A silver amulet hangs on a hook by the door. Passages lead west to the court and south to some ruins.',
            exits: { west: 'acl-court', south: 'blocked-ruins' },
            items: ['bpdu-amulet'],
            features: [
                { names: ['throne', 'root', 'bridge'], text: 'The throne is engraved "priority 24576". Somebody scratched out the "32768" underneath.' },
                { names: ['hook', 'door'], text: 'A note on the hook says: "For emergencies. Put it on every access port. Yes, every one."' }
            ]
        },
        'nat-market': {
            act: 2, name: 'The Translation Market',
            text: 'Merchants swap private addresses for public ones and keep tidy ledgers of who is who. A hall stands east. The plaza is back west.',
            exits: { west: 'dist-plaza', east: 'ospf-hall' },
            quiz: { topic: 'cisco-natacl', guardian: 'the PAT Broker', intro: 'A broker with one public IP and sixty thousand ports in his coat blocks the stall. "Inside, outside, local, global. Know the words, or no trade."', cleared: 'The broker hands you a port number. "Translation created. Don\'t idle too long."' }
        },
        'ospf-hall': {
            act: 2, name: 'The Hall of Adjacency',
            text: 'Routers sit at a long table, greeting each other every ten seconds and electing a chair. An observatory rises to the north. The market is back west.',
            exits: { west: 'nat-market', north: 'cost-observatory' },
            quiz: { topic: 'cisco-ospf', guardian: 'the Designated Router', intro: 'The router in the chair raises a gavel. "This segment has a DR, and it is me. State your business, neighbor."', cleared: 'The DR adds you to its neighbor table. "FULL. Welcome to the database."' }
        },
        'cost-observatory': {
            act: 2, name: 'The Cost Observatory',
            text: 'A brass telescope measures every link\'s bandwidth against a reference star that has not moved since Fast Ethernet. Ruins lie north. The hall is back south.',
            exits: { south: 'ospf-hall', north: 'blocked-ruins' },
            quiz: { topic: 'cisco-ospfcost', guardian: 'the Metric Astronomer', intro: 'An astronomer squints at you through the eyepiece. "Every 10-gig link up here thinks it costs 1, same as a gig link. Can you do better?"', cleared: 'The astronomer nods and adjusts the reference bandwidth. "Shortest path confirmed."' }
        },
        'blocked-ruins': {
            act: 2, name: 'The Ruins of the Blocked Port',
            text: 'A crumbling port stands in the middle of the ruins, link light on and forwarding nothing. A DB-60 cable lies coiled at its base. Paths lead north to the sanctum and south to the observatory.',
            exits: { south: 'cost-observatory', north: 'root-sanctum' },
            items: ['serial-cable'],
            features: [
                { names: ['port', 'blocked port'], text: 'A plaque reads: "Here stands the alternate port. It does nothing, and that is exactly its job. Please stop unblocking it."' }
            ]
        },
        'loop-pit': {
            act: 2, name: 'The Pit of the Endless Loop', boss: true,
            text: 'A circular pit where the same frame goes around and around and around. The Spanning Tree Loop Serpent coils at the bottom, eating its own tail at line rate. A ramp spirals down toward the core.',
            exits: { north: 'dist-plaza' },
            bossFight: {
                name: 'the Spanning Tree Loop Serpent', topics: ['cisco-stproot', 'cisco-l2'], key: 'bpdu-amulet',
                locked: 'The Serpent spins past you, again and again, and every lap is louder. Something unmanaged is plugged into its access port. You need a guard against it.',
                intro: 'You raise the BPDU Guard Amulet. The Serpent freezes mid-loop. "A GUARD? Then tell me who is root, and why I should block."',
                win: 'The Serpent\'s port goes err-disabled, and it unwinds into a tidy, loop-free tree. The ramp to the core is clear.'
            }
        },

        // ======================= ACT III =======================
        'core-antechamber': {
            act: 3, name: 'The Core Antechamber',
            text: 'A cold room in front of the core cage. A vending machine glows to the south. The routing embassy lies east, a chamber of change approvals waits to the west, and north is the cage that holds CORE-SW-01.',
            exits: { north: 'core-cage', east: 'bgp-embassy', south: 'vending-alcove', west: 'change-chamber' },
            features: [
                { names: ['cage', 'north', 'core', 'seals', 'seal', 'runes', 'leds'], text: 'The cage lock has five red LEDs, one per guardian of the core. Through the mesh, every LED on CORE-SW-01 blinks at once.' },
                { names: ['floor', 'tiles'], text: 'The raised floor tile at your feet has been lifted and put back upside down. Nobody will admit to it.' }
            ]
        },
        'vending-alcove': {
            act: 3, name: 'The Vending Alcove',
            text: 'A vending machine hums next to a whiteboard covered in topology diagrams nobody has updated since the merger. The antechamber is back north.',
            exits: { north: 'core-antechamber' },
            features: [
                { names: ['vending machine', 'machine', 'tray'], text: 'You thump the machine where everyone thumps it. One last can of cola rattles into the tray.', reveals: 'vending-cola' },
                { names: ['whiteboard', 'diagram', 'diagrams'], text: 'The diagram shows CORE-SW-01 connected to "the cloud", drawn as an actual cloud with a smiley face.' }
            ]
        },
        'change-chamber': {
            act: 3, name: 'The Change Window Chamber',
            text: 'A conference table, a speakerphone and a calendar with every Saturday at 2 AM circled. A label maker sits on the table. A crossroads lies west. The antechamber is back east.',
            exits: { east: 'core-antechamber', west: 'redist-crossroads' },
            items: ['label-maker'],
            features: [
                { names: ['speakerphone', 'phone'], text: 'It is still connected to a bridge call from last quarter. Someone on it says "Can everyone go on mute?" every forty minutes.' },
                { names: ['calendar'], text: 'Tonight is not circled. Tonight was never approved. Tonight is happening anyway.' }
            ]
        },
        'redist-crossroads': {
            act: 3, name: 'The Redistribution Crossroads',
            text: 'Two routing protocols meet here and swap routes in both directions, with nobody checking what comes back. An observation tower stands north. The chamber is back east.',
            exits: { east: 'change-chamber', north: 'fhrp-towers' },
            quiz: { topic: 'cisco-redist', guardian: 'the Feedback Loop Ferryman', intro: 'A ferryman rows the same route back and forth across the crossroads, forever. "Every route I carry comes home again," he says. "Tell me how to stop it."', cleared: 'The ferryman tags his cargo and stops rowing. "Ah. It doesn\'t come back now."' }
        },
        'fhrp-towers': {
            act: 3, name: 'The Twin Gateway Towers',
            text: 'Two identical towers share one virtual address. Only one answers, and the other waits for it to stop. A vault lies north. The crossroads is back south.',
            exits: { south: 'redist-crossroads', north: 'console-vault' },
            quiz: { topic: 'cisco-fhrp', guardian: 'the Standby Twin', intro: 'The waiting tower leans down. "My twin is active. I am standby. If you want to pass, explain how we decide."', cleared: 'The twins swap roles, purely to show off, and let you through.' }
        },
        'console-vault': {
            act: 3, name: 'The Out-of-Band Vault',
            text: 'A vault of terminal servers, each with a nest of light-blue cables hanging from it. One rollover cable hangs alone on a hook, coiled neatly. Doors lead south to the towers and east toward a tollbooth.',
            exits: { south: 'fhrp-towers', east: 'qos-toll' },
            items: ['console-cable'],
            features: [
                { names: ['terminal servers', 'servers', 'cables'], text: 'Every terminal server is reachable only over the production network. Somebody thought that was fine.' }
            ]
        },
        'bgp-embassy': {
            act: 3, name: 'The BGP Embassy',
            text: 'Diplomats from neighboring autonomous systems exchange paths over TCP and argue about whose is better. An office lies east. The antechamber is back west.',
            exits: { west: 'core-antechamber', east: 'rib-office' },
            quiz: { topic: 'cisco-bgp', guardian: 'the Path Selection Ambassador', intro: 'An ambassador with a thirteen-step checklist steps in front of you. "Many paths reach this embassy. Tell me which one I choose."', cleared: 'The ambassador marks your path with a ">". "Best."' }
        },
        'rib-office': {
            act: 3, name: 'The Routing Table Office',
            text: 'Clerks file routes into a great ledger, ranking them by distance and prefix. A tollbooth hums to the north. The embassy is back west.',
            exits: { west: 'bgp-embassy', north: 'qos-toll' },
            quiz: { topic: 'routing', guardian: 'the RIB Clerk', intro: 'A clerk peers over a stack of candidate routes. "Only one goes in the table. Convince me which."', cleared: 'The clerk installs your route. "Converged. Next."' }
        },
        'qos-toll': {
            act: 3, name: 'The QoS Tollbooth',
            text: 'Traffic queues at a tollbooth, sorted by the markings painted on each packet. Voice goes through first. Doors lead south to the office and west to the vault.',
            exits: { south: 'rib-office', west: 'console-vault' },
            quiz: { topic: 'cisco-dscp', guardian: 'the DSCP Toll Keeper', intro: 'A toll keeper studies the top six bits of your header. "Unmarked traffic waits with the best-effort crowd. What are you carrying?"', cleared: 'The keeper waves you into the priority queue. "Mind the policer."' }
        },
        'core-cage': {
            act: 3, name: 'The Core Cage', boss: true,
            text: 'Inside the cage, CORE-SW-01 runs at 100% CPU, every port flooding broadcasts at line rate. The Broadcast Storm Elemental howls around it, and it will not take a login from anyone.',
            exits: { south: 'core-antechamber' },
            bossFight: {
                name: 'the Broadcast Storm Elemental', topics: ['cisco-storm', 'cisco-aaa'], key: 'console-cable',
                locked: 'The Elemental shrieks. SSH times out, TACACS+ cannot be reached, and the management VLAN is drowning. You need a way in that does not touch the network.',
                intro: 'You plug the Console Cable into CORE-SW-01. The console is slow, but it answers. The Elemental turns to you. "So you came in the old way. Then calm me, and then prove you can get back in."',
                win: 'You shut the looping port, the CPU drops to 4%, and the Elemental falls apart into a single harmless ARP. CORE-SW-01 comes back, every LED green, every neighbor FULL.'
            }
        }
    };

    W.register({
        id: 'cisco',
        name: 'Cisco Realm',
        blurb: 'IOS and IOS-XE: prompts, VLANs, ACLs, OSPF, spanning tree, BGP and a broadcast storm on the core.',
        target: 'CORE-SW-01',
        epilogue: 'You type "write memory", set the config register back to 0x2102, and label the offending cable with the label maker. The post-incident review is scheduled for 8 AM.',
        items: ITEMS,
        acts: ACTS,
        rooms: ROOMS
    });
});
