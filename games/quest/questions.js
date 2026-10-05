/*
 * Datacenter Quest - question bank.
 *
 * Every question works in both play modes:
 *   parser mode  - the typed answer is run through NORMALIZERS[norm] and compared
 *                  with each entry of `accept`
 *   choice mode  - `answer` plus three of the `distractors` are shown as buttons
 *
 * Generated topics compute their answer from random inputs, so the answer is
 * correct by construction. Pool topics pick from hand-written lists.
 * All randomness comes from the `rng` passed in, so a saved seed replays the
 * same questions.
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.QuestQuestions = factory();
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // ---------- seeded RNG ----------

    function hashString(str) {
        let h = 2166136261 >>> 0;
        for (let i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = Math.imul(h, 16777619) >>> 0;
        }
        return h >>> 0;
    }

    function makeRng(seed) {
        let a = (typeof seed === 'number' ? seed : hashString(String(seed))) >>> 0;
        return function mulberry32() {
            a = (a + 0x6D2B79F5) >>> 0;
            let t = a;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    const randInt = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
    const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

    function shuffle(rng, arr) {
        const out = arr.slice();
        for (let i = out.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [out[i], out[j]] = [out[j], out[i]];
        }
        return out;
    }

    // ---------- normalizers: input string -> canonical string, or null if unparseable ----------

    function cleanText(s) {
        return String(s).toLowerCase().trim()
            .replace(/[`'"]/g, '')
            .replace(/\s+/g, ' ')
            .replace(/[.!?]+$/, '');
    }

    function parseIpv4(s) {
        const m = String(s).trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
        if (!m) return null;
        const o = m.slice(1).map(Number);
        if (o.some(n => n > 255)) return null;
        return o;
    }

    const ipToInt = o => ((o[0] << 24) >>> 0) + (o[1] << 16) + (o[2] << 8) + o[3];
    const intToIp = n => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
    const maskInt = p => (p === 0 ? 0 : (0xFFFFFFFF << (32 - p)) >>> 0);

    function maskToPrefix(o) {
        const n = ipToInt(o);
        const inv = (~n) >>> 0;
        if ((inv & (inv + 1)) !== 0) return null; // not a contiguous mask
        let p = 0;
        for (let i = 31; i >= 0; i--) if ((n >>> i) & 1) p++;
        return p;
    }

    function permToOctal(s) {
        let v = String(s).trim().replace(/^-/, '');
        if (!/^[r-][w-][x-][r-][w-][x-][r-][w-][x-]$/.test(v)) return null;
        let out = '';
        for (let i = 0; i < 9; i += 3) {
            out += (v[i] === 'r' ? 4 : 0) + (v[i + 1] === 'w' ? 2 : 0) + (v[i + 2] === 'x' ? 1 : 0);
        }
        return out;
    }

    function octalToPerm(o) {
        return String(o).split('').map(d => {
            const n = Number(d);
            return (n & 4 ? 'r' : '-') + (n & 2 ? 'w' : '-') + (n & 1 ? 'x' : '-');
        }).join('');
    }

    function expandIpv6(s) {
        let v = String(s).trim().toLowerCase();
        if (!/^[0-9a-f:]+$/.test(v) || (v.match(/::/g) || []).length > 1) return null;
        let groups;
        if (v.includes('::')) {
            const [left, right] = v.split('::');
            const l = left ? left.split(':') : [];
            const r = right ? right.split(':') : [];
            const fill = 8 - l.length - r.length;
            if (fill < 1) return null;
            groups = l.concat(Array(fill).fill('0'), r);
        } else {
            groups = v.split(':');
        }
        if (groups.length !== 8 || groups.some(g => !/^[0-9a-f]{1,4}$/.test(g))) return null;
        return groups.map(g => g.padStart(4, '0'));
    }

    // RFC 5952: drop leading zeros, collapse the longest run (2+) of zero groups, leftmost on ties
    function compressIpv6(groups) {
        const g = groups.map(x => x.replace(/^0+(?=.)/, ''));
        let bestStart = -1, bestLen = 0;
        for (let i = 0; i < 8; i++) {
            if (g[i] !== '0') continue;
            let j = i;
            while (j < 8 && g[j] === '0') j++;
            if (j - i > bestLen) { bestStart = i; bestLen = j - i; }
            i = j;
        }
        if (bestLen < 2) return g.join(':');
        const left = g.slice(0, bestStart).join(':');
        const right = g.slice(bestStart + bestLen).join(':');
        return left + '::' + right;
    }

    const OSI_NAMES = {
        'physical': 1, 'data link': 2, 'datalink': 2, 'data-link': 2, 'network': 3,
        'transport': 4, 'session': 5, 'presentation': 6, 'application': 7
    };

    const NORMALIZERS = {
        text: s => cleanText(s) || null,
        int(s) {
            const m = String(s).replace(/,/g, '').trim().match(/^-?\d+/);
            return m ? String(Number(m[0])) : null;
        },
        num(s) {
            const m = String(s).replace(/,/g, '').trim().match(/^-?\d+(\.\d+)?/);
            return m ? String(Number(m[0])) : null;
        },
        ipv4(s) {
            const o = parseIpv4(s);
            return o ? o.join('.') : null;
        },
        // "/26", "26" or "255.255.255.192" -> "/26"
        cidr(s) {
            const v = String(s).trim();
            const m = v.match(/^\/?(\d{1,3})$/);
            if (m) return Number(m[1]) <= 128 ? '/' + Number(m[1]) : null;
            const o = parseIpv4(v);
            if (!o) return null;
            const p = maskToPrefix(o);
            return p === null ? null : '/' + p;
        },
        // "0x0A000001", "0a000001", "0a.00.00.01" -> "0a000001"
        hex(s) {
            const v = String(s).trim().toLowerCase().replace(/^0x/, '').replace(/[.:\s]/g, '');
            return /^[0-9a-f]{1,8}$/.test(v) ? v.padStart(8, '0') : null;
        },
        bin8(s) {
            const v = String(s).trim().replace(/\s/g, '');
            return /^[01]{1,8}$/.test(v) ? v.padStart(8, '0') : null;
        },
        octal(s) {
            const v = String(s).trim().replace(/^0(?=\d{3}$)/, '');
            return /^[0-7]{3}$/.test(v) ? v : null;
        },
        symbolic(s) {
            const o = permToOctal(s);
            return o === null ? null : octalToPerm(o);
        },
        osi(s) {
            const v = cleanText(s).replace(/^layer\s*/, '').replace(/^l(?=\d)/, '').replace(/\s*layer$/, '');
            if (/^[1-7]$/.test(v)) return v;
            const name = v.replace(/\s*\(.*\)$/, '');
            if (OSI_NAMES[name]) return String(OSI_NAMES[name]);
            const m = v.match(/^([1-7])\b/);
            return m ? m[1] : null;
        },
        // "14:30", "2:30 pm" -> "14:30"
        time(s) {
            const m = cleanText(s).match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/);
            if (!m) return null;
            let h = Number(m[1]);
            const min = Number(m[2]);
            if (m[3] === 'pm' && h < 12) h += 12;
            if (m[3] === 'am' && h === 12) h = 0;
            if (h > 23 || min > 59) return null;
            return String(h).padStart(2, '0') + ':' + String(min).padStart(2, '0');
        },
        ipv6full(s) {
            // only an already-expanded address counts as an answer to "expand this"
            if (String(s).includes('::')) return null;
            const g = expandIpv6(s);
            return g ? g.join(':') : null;
        },
        ipv6short(s) {
            const g = expandIpv6(s);
            if (!g) return null;
            // must already be in shortest form, not just an equivalent address
            return compressIpv6(g) === String(s).trim().toLowerCase() ? compressIpv6(g) : null;
        },
        sequence(s) {
            const v = String(s).toUpperCase().replace(/[^A-Z]/g, '');
            return v || null;
        }
    };

    function isCorrect(question, input) {
        const norm = NORMALIZERS[question.norm];
        const got = norm(input);
        if (got === null) return false;
        if (question.norm === 'num' && typeof question.tol === 'number') {
            return Math.abs(Number(got) - Number(norm(question.answer))) <= question.tol;
        }
        return (question.accept || [question.answer]).some(a => norm(a) === got);
    }

    // Drop distractors that are duplicated or equivalent to the answer. A distractor the
    // normalizer can't parse is kept: "wrong form" is a legitimate wrong option.
    function cleanDistractors(question, list) {
        const norm = NORMALIZERS[question.norm];
        const keyOf = s => norm(s) ?? 'raw:' + cleanText(s);
        const seen = new Set([keyOf(question.answer)]);
        (question.accept || []).forEach(a => seen.add(keyOf(a)));
        const out = [];
        for (const d of list) {
            const key = keyOf(String(d));
            if (key === 'raw:' || seen.has(key)) continue;
            if (question.norm === 'num' && typeof question.tol === 'number' &&
                Math.abs(Number(key) - Number(norm(question.answer))) <= question.tol) continue;
            seen.add(key);
            out.push(String(d));
        }
        return out;
    }

    // ---------- pool helper ----------

    // Pool entries: [question, answer, [distractors], hint, norm?, [extra accepted answers]?]
    function fromPool(pool, defaultNorm) {
        return function (rng) {
            const e = pick(rng, pool);
            return { q: e[0], answer: e[1], distractors: e[2], hint: e[3], norm: e[4] || defaultNorm, accept: [e[1]].concat(e[5] || []) };
        };
    }

    // ================= ACT 1: Network Realm =================

    const PORTS = [
        ['What TCP port does SSH listen on by default?', '22', ['23', '21', '2222', '443', '25', '3389'], 'Telnet is 23. Its encrypted replacement sits one below.'],
        ['What TCP port does RDP use by default?', '3389', ['3390', '5900', '22', '445', '1433', '8080'], 'Remote Desktop. Four digits, starts with 33.'],
        ['What port does DNS use by default (UDP and TCP)?', '53', ['54', '35', '67', '123', '161', '853'], 'A five and a three.'],
        ['What TCP port does LDAPS (LDAP over TLS) use?', '636', ['389', '3268', '3269', '443', '993', '686'], 'Plain LDAP is 389. The TLS version is a palindrome.'],
        ['What UDP port does an SNMP agent listen on for queries?', '161', ['162', '160', '514', '123', '69', '116'], 'Traps go to 162. Queries go one lower.'],
        ['What TCP port does HTTPS use by default?', '443', ['80', '8443', '434', '344', '8080', '993'], 'Four-four-something.'],
        ['What UDP port does NTP use?', '123', ['321', '113', '161', '137', '1234', '53'], 'Count to three.'],
        ['What TCP port does SMB (direct-hosted, no NetBIOS) use?', '445', ['139', '137', '443', '544', '135', '3389'], 'One digit off HTTPS.'],
        ['What TCP port does SMTP use for server-to-server mail relay?', '25', ['587', '465', '110', '143', '52', '21'], 'Submission is 587. Relay is the classic two-digit one.'],
        ['What UDP port does a syslog server listen on by default?', '514', ['515', '541', '161', '162', '601', '6514'], 'Five-one-something.'],
        ['What UDP port does a TFTP server listen on?', '69', ['21', '20', '96', '67', '161', '123'], 'Trivial FTP, a famously juvenile number.'],
        ['What TCP port does Microsoft SQL Server use by default?', '1433', ['1434', '3306', '5432', '1521', '3433', '1443'], 'MySQL is 3306. Microsoft picked 14-something.']
    ];

    function genSubnet(rng) {
        const prefix = randInt(rng, 24, 30);
        const base = pick(rng, [[10, randInt(rng, 0, 255), randInt(rng, 0, 255)], [192, 168, randInt(rng, 0, 255)], [172, randInt(rng, 16, 31), randInt(rng, 0, 255)]]);
        const ip = ipToInt(base.concat(randInt(rng, 1, 254)));
        const mask = maskInt(prefix);
        const net = (ip & mask) >>> 0;
        const bcast = (net | (~mask >>> 0)) >>> 0;
        const block = 2 ** (32 - prefix);
        const hosts = block - 2;
        const addr = intToIp(ip) + '/' + prefix;
        const kind = pick(rng, ['broadcast', 'network', 'hosts', 'mask']);
        if (kind === 'broadcast') {
            return {
                q: `What is the broadcast address of ${addr}?`, answer: intToIp(bcast), norm: 'ipv4',
                distractors: [intToIp(net), intToIp(bcast + 1), intToIp(bcast - 1), intToIp(((ip & maskInt(prefix - 1)) | (~maskInt(prefix - 1) >>> 0)) >>> 0),
                    intToIp(((ip & maskInt(prefix + 1)) | (~maskInt(prefix + 1) >>> 0)) >>> 0), intToIp((ip | 255) >>> 0), intToIp(net + 1),
                    intToIp(bcast - 2), intToIp(bcast + block), intToIp(bcast - block)],
                hint: `A /${prefix} block holds ${block} addresses. The broadcast is the last address in the block.`
            };
        }
        if (kind === 'network') {
            return {
                q: `What is the network address of ${addr}?`, answer: intToIp(net), norm: 'ipv4',
                distractors: [intToIp(bcast), intToIp(net + 1), intToIp((ip & maskInt(prefix - 1)) >>> 0), intToIp((ip & maskInt(prefix + 1)) >>> 0),
                    intToIp((ip & 0xFFFFFF00) >>> 0), intToIp(net - block), intToIp(net + block),
                    intToIp(ip), intToIp(net + 2), intToIp(bcast - 1)],
                hint: `Blocks of ${block} start at multiples of ${block} in the last octet. Find the one this host falls in.`
            };
        }
        if (kind === 'hosts') {
            return {
                q: `How many usable host addresses are in a /${prefix}?`, answer: String(hosts), norm: 'int',
                distractors: [block, block - 1, hosts * 2 + 2, Math.max(hosts / 2 - 1, 1), hosts + 1, 2 ** (31 - prefix)].map(String),
                hint: `2 to the power of the host bits (${32 - prefix}), minus the network and broadcast addresses.`
            };
        }
        return {
            q: `What dotted-decimal subnet mask matches /${prefix}?`, answer: intToIp(mask), norm: 'ipv4',
            distractors: [intToIp(maskInt(prefix - 1)), intToIp(maskInt(prefix + 1)), intToIp(maskInt(prefix - 2)), intToIp(maskInt(Math.min(prefix + 2, 32))),
                intToIp((~mask) >>> 0), '255.255.255.0'],
            hint: `The last octet is 256 minus the block size (${block}).`
        };
    }

    function genIpConv(rng) {
        const kind = pick(rng, ['tohex', 'tobin', 'fromhex']);
        if (kind === 'tobin') {
            const n = randInt(rng, 1, 254);
            const bin = n.toString(2).padStart(8, '0');
            const flip = i => bin.slice(0, i) + (bin[i] === '1' ? '0' : '1') + bin.slice(i + 1);
            return {
                q: `Write the octet ${n} as 8 binary bits.`, answer: bin, norm: 'bin8',
                distractors: [flip(0), flip(3), flip(7), bin.split('').reverse().join(''), flip(1), flip(5)],
                hint: 'Place values from left to right: 128 64 32 16 8 4 2 1.'
            };
        }
        const o = [pick(rng, [10, 172, 192]), randInt(rng, 0, 255), randInt(rng, 0, 255), randInt(rng, 1, 254)];
        const hex = o.map(x => x.toString(16).padStart(2, '0')).join('');
        if (kind === 'tohex') {
            const swap = hex.slice(0, 6) + hex.slice(7) + hex[6];
            return {
                q: `Convert ${o.join('.')} to a 32-bit hexadecimal number.`, answer: '0x' + hex.toUpperCase(), norm: 'hex', accept: [hex],
                distractors: [swap, o.map(x => x.toString(16).padStart(2, '0')).reverse().join(''), (ipToInt(o) + 1).toString(16).padStart(8, '0'),
                    (ipToInt(o) ^ 0x00010000).toString(16).padStart(8, '0'), (ipToInt(o) ^ 0x10000000).toString(16).padStart(8, '0'),
                    ((ipToInt(o) ^ 0x00000100) >>> 0).toString(16).padStart(8, '0'), ((ipToInt(o) ^ 0x01000000) >>> 0).toString(16).padStart(8, '0')].map(x => '0x' + x.toUpperCase()),
                hint: 'Convert each octet to two hex digits separately, then join them.'
            };
        }
        return {
            q: `Hex 0x${hex.toUpperCase()} is which dotted-decimal IPv4 address?`, answer: o.join('.'), norm: 'ipv4',
            distractors: [o.slice().reverse().join('.'), [o[0], o[1], o[2], (o[3] + 16) % 256].join('.'), [o[0], (o[1] + 1) % 256, o[2], o[3]].join('.'),
                [o[0], o[2], o[1], o[3]].join('.'), [o[0], o[1], o[2], (o[3] + 1) % 256].join('.'),
                [o[0], o[1], (o[2] + 16) % 256, o[3]].join('.'), [(o[0] + 1) % 256, o[1], o[2], o[3]].join('.'), [o[0], o[1], o[2], o[3] ^ 1].join('.')],
            hint: 'Every two hex digits is one octet. 0xC0 = 192, 0x0A = 10, 0xAC = 172.'
        };
    }

    const OSI = [
        ['At which OSI layer does a switch forward frames by MAC address?', 'Layer 2 (Data Link)', 'Switches read MAC addresses, one layer above the wire.'],
        ['At which OSI layer does a router make forwarding decisions by IP address?', 'Layer 3 (Network)', 'IP lives here.'],
        ['At which OSI layer do TCP and UDP operate?', 'Layer 4 (Transport)', 'Ports and segments.'],
        ['At which OSI layer do HTTP, DNS and SMTP operate?', 'Layer 7 (Application)', 'The top of the stack.'],
        ['At which OSI layer do cables, hubs and repeaters live?', 'Layer 1 (Physical)', 'You can trip over it.'],
        ['Which OSI layer\'s unit of data is called a "frame"?', 'Layer 2 (Data Link)', 'Packets are a layer higher.'],
        ['Which OSI layer\'s unit of data is called a "packet"?', 'Layer 3 (Network)', 'Frames are a layer lower; segments a layer higher.'],
        ['Which OSI layer\'s unit of data is called a "segment"?', 'Layer 4 (Transport)', 'TCP chops data into these.'],
        ['At which OSI layer does a VLAN tag (802.1Q) get added?', 'Layer 2 (Data Link)', 'It is inserted into the Ethernet frame header.']
    ];
    const OSI_LABELS = ['Layer 1 (Physical)', 'Layer 2 (Data Link)', 'Layer 3 (Network)', 'Layer 4 (Transport)', 'Layer 5 (Session)', 'Layer 6 (Presentation)', 'Layer 7 (Application)'];

    function genOsi(rng) {
        const e = pick(rng, OSI);
        return { q: e[0], answer: e[1], norm: 'osi', distractors: OSI_LABELS.filter(l => l !== e[1]), hint: e[2] };
    }

    const DHCPARP = [
        ['In DHCP\'s DORA exchange, what is the second message, sent by the server?', 'Offer', ['Discover', 'Request', 'Acknowledge', 'Release', 'Inform'], 'Discover, ___, Request, Acknowledge.', 'text', ['dhcpoffer', 'dhcp offer']],
        ['What UDP port does a DHCP server listen on?', '67', ['68', '53', '69', '546', '547', '76'], 'The client uses 68. The server is one lower.', 'int'],
        ['What does ARP resolve an IPv4 address to?', 'MAC address', ['Hostname', 'Default gateway', 'Subnet mask', 'IPv6 address', 'VLAN ID'], 'A 48-bit hardware address.', 'text', ['mac', 'mac addr', 'hardware address', 'ethernet address', 'physical address']],
        ['A Windows host shows a 169.254.x.x address. Which server did it fail to reach?', 'DHCP', ['DNS', 'NTP', 'Domain controller', 'Proxy', 'TFTP'], 'APIPA kicks in when no lease arrives.', 'text', ['dhcp server']],
        ['What is an ARP announcement of your own IP-to-MAC mapping, sent without anyone asking, called?', 'Gratuitous ARP', ['Proxy ARP', 'Reverse ARP', 'ARP probe', 'Inverse ARP', 'ARP flood'], 'Nobody asked for it. It is free.', 'text', ['garp', 'gratuitous']],
        ['By default, at what fraction of the lease time does a DHCP client first try to renew (T1)?', '50%', ['87.5%', '25%', '75%', '100%', '33%'], 'T2 is at 87.5%. T1 is at half.', 'num', ['50', '0.5']],
        ['What feature lets a router forward DHCP broadcasts to a server on another subnet? (Cisco command name)', 'ip helper-address', ['ip dhcp relay', 'ip forward-protocol', 'ip proxy-arp', 'dhcp snooping', 'ip directed-broadcast'], 'A helpful helper.', 'text', ['helper-address', 'helper address', 'ip helper']]
    ];

    function genDhcpArp(rng) {
        const e = pick(rng, DHCPARP);
        return { q: e[0], answer: e[1], distractors: e[2], hint: e[3], norm: e[4], accept: [e[1]].concat(e[5] || []) };
    }

    const DNS = [
        ['Which DNS record type maps a hostname to an IPv4 address?', 'A', 'The first letter of the alphabet.'],
        ['Which DNS record type maps a hostname to an IPv6 address?', 'AAAA', 'Four times the IPv4 record, for four times the bits.'],
        ['Which DNS record type tells senders where to deliver email for a domain?', 'MX', 'Mail eXchanger.'],
        ['Which DNS record type makes one name an alias of another name?', 'CNAME', 'The Canonical NAME.'],
        ['Which DNS record type is used for reverse lookups (IP to name)?', 'PTR', 'A pointer, in in-addr.arpa.'],
        ['SPF and DKIM policy data is published in which DNS record type?', 'TXT', 'Free-form text.'],
        ['Which DNS record type lists the authoritative name servers for a zone?', 'NS', 'Name Server.'],
        ['Which DNS record type holds the zone\'s serial number and refresh timers?', 'SOA', 'Start Of Authority.'],
        ['Which DNS record field tells resolvers how many seconds they may cache an answer?', 'TTL', 'Time To Live.'],
        ['Which DNS record type advertises a service\'s host and port, like _ldap._tcp?', 'SRV', 'A SeRVice record.']
    ];
    const DNS_TYPES = ['A', 'AAAA', 'MX', 'CNAME', 'PTR', 'TXT', 'NS', 'SOA', 'TTL', 'SRV', 'CAA'];

    function genDns(rng) {
        const e = pick(rng, DNS);
        return { q: e[0], answer: e[1], norm: 'text', distractors: DNS_TYPES.filter(t => t !== e[1]), hint: e[2] };
    }

    // ================= ACT 2: Systems Realm =================

    const PERMS = ['755', '644', '600', '700', '750', '640', '775', '664', '711', '444', '400', '770', '660', '740', '705', '751'];

    function genChmod(rng) {
        const oct = pick(rng, PERMS);
        const sym = octalToPerm(oct);
        const near = [];
        for (let i = 0; i < 3; i++) {
            const d = Number(oct[i]);
            for (const bit of [1, 2, 4]) near.push(oct.slice(0, i) + (d ^ bit) + oct.slice(i + 1));
        }
        const swapped = oct[1] + oct[0] + oct[2];
        const others = shuffle(rng, near).concat(swapped, oct.split('').reverse().join(''));
        if (rng() < 0.5) {
            return {
                q: `Convert the permission string ${sym} to octal.`, answer: oct, norm: 'octal',
                distractors: others, hint: 'r = 4, w = 2, x = 1. Add them up for each group of three.'
            };
        }
        return {
            q: `Write chmod ${oct} as a symbolic permission string (like rwxr-x---).`, answer: sym, norm: 'symbolic',
            distractors: others.map(octalToPerm), hint: 'Each digit is one group: 4 = r, 2 = w, 1 = x. User, group, other.'
        };
    }

    const CRON_MIN = [['0', 1], ['*/5', 12], ['*/10', 6], ['*/15', 4], ['*/20', 3], ['*/30', 2], ['0,30', 2], ['15', 1], ['0,20,40', 3]];
    const CRON_HOUR = [['*', 24], ['*/2', 12], ['*/4', 6], ['*/6', 4], ['*/8', 3], ['9', 1], ['9-17', 9], ['0,12', 2], ['8-11', 4]];
    const CRON_DOW = [['*', 7, 'every day'], ['1-5', 5, 'weekdays'], ['0,6', 2, 'weekends'], ['1', 1, 'Mondays']];

    function genCron(rng) {
        const m = pick(rng, CRON_MIN), h = pick(rng, CRON_HOUR), d = pick(rng, CRON_DOW);
        const expr = `${m[0]} ${h[0]} * * ${d[0]}`;
        const perDay = m[1] * h[1];
        if (d[0] !== '*' && rng() < 0.5) {
            const perWeek = perDay * d[1];
            return {
                q: `How many times per week does the cron job \`${expr}\` run?`, answer: String(perWeek), norm: 'int',
                distractors: [perDay, perDay * 7, perWeek + perDay, m[1] * d[1], h[1] * d[1], perDay * (7 - d[1]) || perWeek * 2].map(String),
                hint: `Runs per day (minute matches × hour matches) times the number of matching days (${d[2]}).`
            };
        }
        return {
            q: `On a day it is active, how many times does the cron job \`${expr}\` run?`, answer: String(perDay), norm: 'int',
            distractors: [m[1], h[1], m[1] * 24, perDay * 2, perDay + h[1], Math.max(perDay - 1, 1) === perDay ? perDay + 2 : perDay - 1].map(String),
            hint: 'Field order is minute, hour, day-of-month, month, day-of-week. Multiply the minute matches by the hour matches.'
        };
    }

    function genRaid(rng) {
        const size = pick(rng, [1, 2, 4, 8, 10, 12, 16]);
        const level = pick(rng, ['0', '1', '5', '6', '10']);
        let n = level === '1' ? 2 : randInt(rng, 4, 8);
        if (level === '10' && n % 2) n++;
        const usable = { '0': n * size, '1': size, '5': (n - 1) * size, '6': (n - 2) * size, '10': (n / 2) * size };
        const ans = usable[level];
        const all = [n * size, (n - 1) * size, (n - 2) * size, (n / 2) * size, size, (n - 3) * size, ans + size, ans * 2];
        return {
            q: `RAID ${level} with ${n} × ${size} TB disks: how many TB are usable?`, answer: String(ans), norm: 'int',
            distractors: all.filter(x => x > 0).map(String),
            hint: { '0': 'Striping only. No redundancy, so nothing is lost.', '1': 'A mirror. Every disk holds the same data.',
                '5': 'One disk\'s worth of capacity goes to parity.', '6': 'Two disks\' worth of capacity goes to parity.',
                '10': 'Mirrored pairs, then striped. Half the raw capacity.' }[level]
        };
    }

    const SEVERITIES = ['emerg', 'alert', 'crit', 'err', 'warning', 'notice', 'info', 'debug'];
    const SYSLOG_POOL = [
        ['On RHEL, which log file records sshd logins and sudo use?', '/var/log/secure', ['/var/log/auth.log', '/var/log/messages', '/var/log/wtmp', '/var/log/sshd.log', '/var/log/boot.log'], 'Debian calls it auth.log. Red Hat calls it something more reassuring.', 'text', ['secure']],
        ['On Debian/Ubuntu, which log file records sshd logins and sudo use?', '/var/log/auth.log', ['/var/log/secure', '/var/log/syslog', '/var/log/kern.log', '/var/log/sshd.log', '/var/log/faillog'], 'RHEL calls it secure. Debian calls it something about authentication.', 'text', ['auth.log']],
        ['Which journalctl flag follows the log live, like tail -f?', '-f', ['-r', '-b', '-u', '-x', '-e'], 'The same letter tail uses.', 'text', ['--follow']],
        ['Which journalctl flag limits output to one systemd unit?', '-u', ['-f', '-b', '-p', '-k', '-n'], 'u is for unit.', 'text', ['--unit']]
    ];

    function genSyslog(rng) {
        if (rng() < 0.6) {
            const lvl = randInt(rng, 0, 7);
            if (rng() < 0.5) {
                return {
                    q: `What is the numeric syslog severity of "${SEVERITIES[lvl]}"?`, answer: String(lvl), norm: 'int',
                    distractors: [0, 1, 2, 3, 4, 5, 6, 7].filter(x => x !== lvl).map(String),
                    hint: 'emerg is 0 and debug is 7. Lower numbers are worse.'
                };
            }
            return {
                q: `Syslog severity ${lvl} has which keyword?`, answer: SEVERITIES[lvl], norm: 'text',
                accept: [SEVERITIES[lvl]].concat({ 0: ['emergency', 'panic'], 2: ['critical'], 3: ['error'], 4: ['warn'], 6: ['informational'] }[lvl] || []),
                distractors: SEVERITIES.filter((_, i) => i !== lvl),
                hint: 'Order: emerg, alert, crit, err, warning, notice, info, debug.'
            };
        }
        return fromPool(SYSLOG_POOL, 'text')(rng);
    }

    const SIGNALS = [
        ['Which signal does `kill -9` send?', 'SIGKILL', ['SIGTERM', 'SIGHUP', 'SIGINT', 'SIGSTOP', 'SIGQUIT'], 'The one that cannot be caught or ignored.', 'text', ['kill', 'sig kill']],
        ['Which signal does a plain `kill PID` send by default?', 'SIGTERM', ['SIGKILL', 'SIGHUP', 'SIGINT', 'SIGSTOP', 'SIGUSR1'], 'A polite request to terminate. Number 15.', 'text', ['term', '15']],
        ['Which signal, by long daemon convention, means "reload your config"?', 'SIGHUP', ['SIGUSR1', 'SIGTERM', 'SIGCONT', 'SIGINT', 'SIGALRM'], 'Originally meant the modem hung up.', 'text', ['hup', '1']],
        ['Which signal does Ctrl+C send to the foreground process?', 'SIGINT', ['SIGTERM', 'SIGKILL', 'SIGQUIT', 'SIGTSTP', 'SIGHUP'], 'An interrupt. Number 2.', 'text', ['int', '2']],
        ['What is the signal number of SIGTERM?', '15', ['9', '1', '2', '19', '3'], 'SIGKILL is 9. SIGTERM is higher.', 'int'],
        ['`ps` shows a process in state Z. What kind of process is it?', 'zombie', ['sleeping', 'stopped', 'running', 'orphan', 'daemon'], 'It is dead, but its parent has not collected its exit status yet.', 'text', ['zombie process', 'defunct']],
        ['Which command lists open files, handy for finding a deleted log a process still holds open?', 'lsof', ['fuser', 'du', 'df', 'stat', 'find'], 'LiSt Open Files.', 'text'],
        ['Which command reports free space per mounted filesystem?', 'df', ['du', 'free', 'lsblk', 'fdisk', 'mount'], 'Disk Free.', 'text', ['df -h']],
        ['Which command totals the space used under a directory?', 'du', ['df', 'ls -l', 'lsblk', 'stat', 'free'], 'Disk Usage.', 'text', ['du -sh', 'du -h']]
    ];

    const pad2 = n => String(n).padStart(2, '0');

    function genCronNext(rng) {
        const minField = pick(rng, [['*/15', [0, 15, 30, 45]], ['*/20', [0, 20, 40]], ['*/30', [0, 30]], ['0', [0]], ['30', [30]], ['45', [45]], ['0,30', [0, 30]]]);
        const hourField = pick(rng, [['*', null], ['*/2', 2], ['*/3', 3], ['*/6', 6]]);
        const nowH = randInt(rng, 0, 22), nowM = randInt(rng, 1, 58);
        const expr = `${minField[0]} ${hourField[0]} * * *`;
        let t = nowH * 60 + nowM;
        let found = null;
        for (let i = 1; i <= 48 * 60 && found === null; i++) {
            const c = (t + i) % (24 * 60);
            const h = Math.floor(c / 60), m = c % 60;
            if (minField[1].includes(m) && (hourField[1] === null || h % hourField[1] === 0)) found = c;
        }
        const fmt = c => pad2(Math.floor(((c % 1440) + 1440) % 1440 / 60)) + ':' + pad2((((c % 1440) + 1440) % 1440) % 60);
        return {
            q: `It is ${pad2(nowH)}:${pad2(nowM)}. When does \`${expr}\` next run? (HH:MM, 24-hour)`, answer: fmt(found), norm: 'time',
            distractors: [fmt(found + 15), fmt(found - 15), fmt(found + 60), fmt(found - 60), fmt(found + 30), fmt(nowH * 60 + nowM + 1), fmt(found + 120)],
            hint: 'Walk forward from now. The minute field and the hour field must both match.'
        };
    }

    function genEpoch(rng) {
        const days = randInt(rng, 3, 90);
        const hours = randInt(rng, 0, 1) ? 0 : 12;
        const now = 1790000000 + randInt(rng, 0, 50000000);
        const later = now + days * 86400 + hours * 3600;
        if (hours === 0) {
            return {
                q: `A certificate's notAfter is Unix time ${later}. It is now Unix time ${now}. How many whole days until it expires?`,
                answer: String(days), norm: 'int',
                distractors: [days + 1, days - 1, days * 24, days + 7, Math.round(days * 1.157), days * 10].map(String),
                hint: 'Subtract, then divide by 86,400 seconds per day.'
            };
        }
        const total = days * 24 + 12;
        return {
            q: `A job started at Unix time ${now} and finished at ${later}. How many hours did it run?`,
            answer: String(total), norm: 'int',
            distractors: [days * 24, total + 12, total - 1, days, total * 60, total + 24].map(String),
            hint: 'Subtract, then divide by 3,600 seconds per hour.'
        };
    }

    // ================= ACT 3: Datacenter =================

    function genVlsm(rng) {
        if (rng() < 0.65) {
            const hosts = randInt(rng, 2, 2000);
            let p = 30;
            while (2 ** (32 - p) - 2 < hosts) p--;
            return {
                q: `What is the smallest IPv4 subnet (as /prefix) that holds ${hosts} usable hosts?`, answer: '/' + p, norm: 'cidr',
                distractors: ['/' + (p - 1), '/' + (p + 1), '/' + (p - 2), '/' + Math.min(p + 2, 32), '/' + (p + 3), '/24'].filter(x => x !== '/' + p),
                hint: 'Find the smallest power of two that is at least the host count plus 2.'
            };
        }
        const big = randInt(rng, 16, 24), small = big + randInt(rng, 2, 6);
        const n = 2 ** (small - big);
        return {
            q: `How many /${small} subnets fit in one /${big}?`, answer: String(n), norm: 'int',
            distractors: [n / 2, n * 2, small - big, n - 2, n * 4, 2 ** (32 - small)].map(String),
            hint: `2 to the power of the difference in prefix lengths (${small} − ${big}).`
        };
    }

    const AD = [['directly connected', 0], ['static', 1], ['eBGP', 20], ['internal EIGRP', 90], ['OSPF', 110], ['IS-IS', 115], ['RIP', 120], ['external EIGRP', 170], ['iBGP', 200]];
    const ROUTING_POOL = [
        ['A router has 10.1.0.0/16 via OSPF and 10.1.1.0/24 via RIP. Which protocol\'s route carries traffic to 10.1.1.5?', 'RIP', ['OSPF', 'Both (ECMP)', 'Neither', 'Static', 'Connected'], 'Longest prefix match wins before administrative distance is ever compared.', 'text'],
        ['What TCP port does BGP use?', '179', ['178', '197', '1723', '520', '89', '646'], 'One-seven-something.', 'int'],
        ['What is OSPF area 0 called?', 'backbone', ['stub', 'NSSA', 'totally stubby', 'transit', 'core'], 'Every other area must connect to it.', 'text', ['backbone area', 'the backbone']],
        ['On Cisco, which BGP path attribute is compared first?', 'weight', ['local preference', 'AS path', 'MED', 'origin', 'router ID'], 'It is Cisco-proprietary and local to the router.', 'text', ['weight attribute']],
        ['What IP protocol number does OSPF run over directly?', '89', ['88', '179', '6', '17', '112', '520'], 'EIGRP is 88. OSPF is right after it.', 'int']
    ];

    function genRouting(rng) {
        if (rng() < 0.55) {
            const e = pick(rng, AD);
            return {
                q: `What is the default Cisco administrative distance for ${e[0]} routes?`, answer: String(e[1]), norm: 'int',
                distractors: AD.map(x => String(x[1])).filter(x => x !== String(e[1])).concat('100', '255'),
                hint: 'Lower is more trusted. Connected 0, static 1, eBGP 20, EIGRP 90, OSPF 110, IS-IS 115, RIP 120, iBGP 200.'
            };
        }
        return fromPool(ROUTING_POOL, 'text')(rng);
    }

    const COOLING_POOL = [
        ['Server fans pull air in from which aisle?', 'cold aisle', ['hot aisle', 'center aisle', 'return plenum', 'raised floor', 'ceiling plenum'], 'Fronts face the cold aisle. Backs exhaust into the hot aisle.', 'text', ['cold']],
        ['Roughly how many BTU/hr does 1 watt of IT load produce? (to 2 decimal places)', '3.41', ['1.00', '0.29', '3.14', '12.00', '34.12', '4.18'], 'The figure is 3.412.', 'num', ['3.412']],
        ['ASHRAE\'s recommended maximum server inlet temperature, in °C?', '27', ['18', '35', '22', '32', '40', '25'], 'The recommended range is 18 to __ °C.', 'num'],
        ['What do blanking panels in empty rack slots stop? (two words)', 'hot air recirculation', ['cold air leakage', 'cable sprawl', 'static buildup', 'dust ingress', 'fan noise'], 'Exhaust air sneaking back to the front of the rack.', 'text', ['recirculation', 'air recirculation', 'hot-air recirculation']]
    ];

    function genPower(rng) {
        const r = rng();
        if (r < 0.35) {
            const amps = pick(rng, [2, 3, 4, 5, 6, 7.5, 8, 10, 12]);
            const watts = Math.round(amps * 208);
            return {
                q: `A server draws ${watts} W on a 208 V circuit. How many amps is that? (P = V × I)`, answer: String(amps), norm: 'num', tol: 0.05,
                distractors: [amps * 2, amps / 2, (watts / 120).toFixed(1), amps + 1, (watts / 240).toFixed(1), amps * 1.73].map(x => String(Number(Number(x).toFixed(2)))),
                hint: 'Divide watts by volts.'
            };
        }
        if (r < 0.65) {
            const breaker = pick(rng, [15, 20, 30, 40, 50, 60]);
            const cont = breaker * 0.8;
            if (rng() < 0.5) {
                return {
                    q: `Under the NEC 80% rule, what is the maximum continuous load, in amps, on a ${breaker} A circuit?`, answer: String(cont), norm: 'num', tol: 0,
                    distractors: [breaker, breaker * 0.9, breaker * 0.75, breaker * 0.5, breaker * 0.7, breaker - 5].map(x => String(Number(x.toFixed(1)))),
                    hint: 'Multiply the breaker rating by 0.8.'
                };
            }
            const watts = Math.round(cont * 208);
            return {
                q: `What is the maximum continuous load, in watts, on a ${breaker} A, 208 V single-phase circuit under the 80% rule?`, answer: String(watts), norm: 'num', tol: 5,
                distractors: [breaker * 208, Math.round(cont * 120), Math.round(cont * 208 * 1.73), Math.round(breaker * 0.75 * 208), Math.round(cont * 240), Math.round(cont * 208 / 2)].map(String),
                hint: 'Take 80% of the breaker rating, then multiply amps by volts.'
            };
        }
        const e = pick(rng, COOLING_POOL);
        const q = { q: e[0], answer: e[1], distractors: e[2], hint: e[3], norm: e[4], accept: [e[1]].concat(e[5] || []) };
        if (q.norm === 'num') q.tol = q.answer === '3.41' ? 0.01 : 0;
        return q;
    }

    const OOB = [
        ['What UDP port does IPMI-over-LAN (RMCP) use?', '623', ['443', '161', '664', '5900', '22', '632'], 'Six-two-something.', 'int'],
        ['What is the classic default baud rate of a Cisco or server serial console?', '9600', ['115200', '19200', '38400', '57600', '2400', '4800'], 'Four digits. The other settings are 8N1.', 'int'],
        ['In "9600 8N1", how many stop bits does the 1 stand for?', '1', ['0', '2', '8', '9600'], 'The last character is the stop bit count.', 'int'],
        ['What is Dell\'s baseboard management controller called?', 'iDRAC', ['iLO', 'IMM', 'CIMC', 'XCC', 'BMC-X'], 'Integrated Dell Remote Access Controller.', 'text', ['drac', 'idrac9', 'idrac 9']],
        ['What is HPE\'s baseboard management controller called?', 'iLO', ['iDRAC', 'IMM', 'CIMC', 'XCC', 'ILOM'], 'Integrated Lights-Out.', 'text', ['ilo5', 'ilo 5', 'ilo6', 'integrated lights-out']],
        ['Which ipmitool command hard power-cycles a hung server? (finish: ipmitool ... chassis power ____)', 'cycle', ['reset', 'off', 'soft', 'status', 'diag'], 'Off, wait, on. One word.', 'text', ['power cycle', 'chassis power cycle']],
        ['What is the DMTF\'s modern REST/JSON replacement for IPMI called?', 'Redfish', ['Swordfish', 'SNMPv3', 'WS-Man', 'NETCONF', 'gNMI'], 'A fish, not a sword.', 'text'],
        ['What is a Cisco blue console cable, which swaps pins end-to-end, called?', 'rollover', ['crossover', 'straight-through', 'null modem', 'loopback', 'patch'], 'Pin 1 goes to pin 8; it rolls over.', 'text', ['rollover cable']]
    ];

    const IPV6_POOL = [
        ['What IPv6 prefix are link-local addresses taken from?', 'fe80::/10', ['fc00::/7', 'ff00::/8', '2000::/3', '::1/128', 'fec0::/10'], 'Every IPv6 interface has one. It starts with fe80.', 'text', ['fe80::/64', 'fe80::']],
        ['What is the IPv6 loopback address?', '::1', ['::', 'fe80::1', '127.0.0.1', '::ffff:127.0.0.1', 'ff02::1'], 'All zeros except the very last bit.', 'text', ['0:0:0:0:0:0:0:1', '::1/128']],
        ['Which protocol replaces ARP in IPv6? (abbreviation)', 'NDP', ['DHCPv6', 'ICMPv4', 'RARP', 'SLAAC', 'MLD'], 'Neighbor Discovery Protocol.', 'text', ['neighbor discovery', 'neighbor discovery protocol', 'nd']],
        ['What prefix length is standard for an IPv6 LAN segment (required for SLAAC)?', '/64', ['/48', '/56', '/96', '/112', '/127'], 'Half the address is the network, half the interface ID.', 'cidr'],
        ['Which IPv6 range is set aside for Unique Local Addresses (ULA)?', 'fc00::/7', ['fe80::/10', 'ff00::/8', '2001:db8::/32', '2000::/3', 'fec0::/10'], 'In practice, ULAs you generate start with fd.', 'text', ['fd00::/8']]
    ];

    function genIpv6(rng) {
        const r = rng();
        if (r < 0.4) {
            const groups = [];
            for (let i = 0; i < 8; i++) groups.push(randInt(rng, 0, 0xffff).toString(16).padStart(4, '0'));
            groups[0] = pick(rng, ['2001', '2600', '2a00', 'fd12', 'fe80']);
            groups[1] = pick(rng, ['0db8', '0000', '0abc', '1f00', '00c3']);
            const zs = randInt(rng, 2, 4), at = randInt(rng, 2, 7 - zs);
            for (let i = at; i < at + zs; i++) groups[i] = '0000';
            if (rng() < 0.5) groups[7] = '000' + randInt(rng, 1, 9);
            const full = groups.join(':');
            const short = compressIpv6(groups);
            if (rng() < 0.55) {
                const g2 = groups.map(x => x.replace(/^0+(?=.)/, ''));
                return {
                    q: `Write ${full} in shortest (RFC 5952) form.`, answer: short, norm: 'ipv6short',
                    distractors: [g2.join(':'), short.toUpperCase().replace('::', ':0:'), short.replace('::', ':'), full.replace(/:0000/, '::'),
                        short.replace(/::(?=.)/, '::0:'), short + ':0'],
                    hint: 'Drop leading zeros in each group, then replace the longest run of all-zero groups with :: (only once).'
                };
            }
            return {
                q: `Expand ${short} to its full 8-group form.`, answer: full, norm: 'ipv6full',
                distractors: [groups.slice(0, 7).concat('0000').join(':'), full.replace(/0000:/, ''), groups.map(x => x.replace(/^0+(?=.)/, '')).join(':'),
                    groups.slice().reverse().join(':'), groups.slice(1).concat(groups[0]).join(':'),
                    [groups[1], groups[0]].concat(groups.slice(2)).join(':'), groups.slice(0, 6).concat(groups[7], groups[6]).join(':')],
                hint: 'Pad every group to four hex digits, then fill the :: with as many 0000 groups as it takes to reach eight.'
            };
        }
        if (r < 0.7) {
            const big = pick(rng, [32, 40, 48, 52, 56, 60]);
            const n = 2 ** (64 - big);
            return {
                q: `How many /64 subnets fit in a /${big}?`, answer: String(n), norm: 'int',
                distractors: [n / 2, n * 2, 64 - big, n * 16, n - 1, 2 ** (128 - 64 - big + 1)].map(x => String(Math.round(x))),
                hint: `2 to the power of (64 − ${big}).`
            };
        }
        return fromPool(IPV6_POOL, 'text')(rng);
    }

    const BOOT = [
        ['Which file lists the filesystems Linux mounts at boot?', '/etc/fstab', ['/etc/mtab', '/etc/mounts', '/boot/grub2/grub.cfg', '/etc/default/grub', '/proc/mounts'], 'FileSystem TABle.', 'text', ['fstab']],
        ['At the GRUB menu, which key opens the selected boot entry for editing?', 'e', ['c', 'b', 'Esc', 'Tab', 'F2'], 'e for edit. (Ctrl+X boots the edited entry.)', 'text'],
        ['Which kernel argument breaks into the initramfs shell on RHEL, before the root filesystem is mounted?', 'rd.break', ['init=/bin/bash', 'single', 'emergency', 'systemd.unit=rescue.target', 'nomodeset'], 'An RHEL root-password-reset classic. It starts with "rd."', 'text', ['rd.break enforcing=0']],
        ['Which command regenerates the GRUB2 config on RHEL?', 'grub2-mkconfig', ['update-grub', 'grub2-install', 'dracut', 'grubby --update', 'mkinitrd'], 'Debian wraps it as update-grub. RHEL calls it directly (-o /boot/grub2/grub.cfg).', 'text', ['grub2-mkconfig -o /boot/grub2/grub.cfg']],
        ['Which command checks and repairs an unmounted ext4 filesystem?', 'fsck', ['mkfs', 'tune2fs', 'xfs_repair', 'badblocks', 'mount -o remount'], 'File System ChecK. (For XFS it would be xfs_repair.)', 'text', ['e2fsck', 'fsck.ext4']],
        ['Which command rebuilds the initramfs on RHEL?', 'dracut', ['mkinitramfs', 'update-initramfs', 'grub2-mkconfig', 'depmod', 'kexec'], 'Named after a town in Massachusetts.', 'text', ['dracut -f', 'dracut --force']]
    ];

    const SEQUENCES = [
        {
            q: 'The Lich hisses: "Order these steps to power-cycle a hung production server safely. Answer with the letters, like DCBA."\n' +
                '  A) Power-cycle through the BMC\n  B) Note the incident and tell stakeholders\n  C) Watch the console as it boots\n  D) Check the console for a panic and try a graceful shutdown',
            answer: 'BDAC', hint: 'Communicate first. Look before you pull. Watch after.'
        },
        {
            q: 'The Lich hisses: "Order these steps to recover from a kernel panic after a bad update. Answer with the letters, like DCBA."\n' +
                '  A) Boot the previous kernel from the GRUB menu\n  B) Capture the panic message from the console\n  C) Set the known-good kernel as the default\n  D) Remove or roll back the bad update',
            answer: 'BADC', hint: 'Evidence first. Get it booting, then fix it, then make the fix stick.'
        }
    ];

    function genSequence(rng) {
        const e = pick(rng, SEQUENCES);
        const perms = [];
        const permute = (rest, acc) => rest.length ? rest.forEach((c, i) => permute(rest.slice(0, i).concat(rest.slice(i + 1)), acc + c)) : perms.push(acc);
        permute(e.answer.split(''), '');
        return { q: e.q, answer: e.answer, norm: 'sequence', distractors: shuffle(rng, perms).slice(0, 8), hint: e.hint };
    }

    // ---------- registry ----------

    const TOPICS = {
        ports: { label: 'Well-known ports', gen: fromPool(PORTS, 'int'), tool: 'nettools/' },
        subnet: { label: 'Subnetting', gen: genSubnet, tool: 'nettools/subnet-calculator.html' },
        ipconv: { label: 'IP conversion', gen: genIpConv, tool: 'nettools/ip-converter.html' },
        osi: { label: 'OSI layers', gen: genOsi },
        dhcparp: { label: 'DHCP and ARP', gen: genDhcpArp },
        dns: { label: 'DNS', gen: genDns },
        chmod: { label: 'chmod', gen: genChmod, tool: 'system/chmod-calculator.html' },
        cron: { label: 'cron', gen: genCron, tool: 'system/cron-builder.html' },
        raid: { label: 'RAID capacity', gen: genRaid, tool: 'system/disk-tools.html' },
        syslog: { label: 'Syslog and logs', gen: genSyslog, tool: 'system/log-parser.html' },
        signals: { label: 'Signals and disk', gen: fromPool(SIGNALS, 'text') },
        cronnext: { label: 'cron schedules', gen: genCronNext, tool: 'system/cron-builder.html' },
        epoch: { label: 'Unix time', gen: genEpoch, tool: 'system/timestamp-converter.html' },
        vlsm: { label: 'VLSM', gen: genVlsm, tool: 'nettools/subnet-planner.html' },
        routing: { label: 'Routing', gen: genRouting },
        power: { label: 'Power and cooling', gen: genPower },
        oob: { label: 'Out-of-band management', gen: fromPool(OOB, 'text') },
        ipv6: { label: 'IPv6', gen: genIpv6, tool: 'nettools/subnet-calculator-ipv6.html' },
        boot: { label: 'Boot recovery', gen: fromPool(BOOT, 'text') },
        sequence: { label: 'Incident procedure', gen: genSequence }
    };

    // Build a question for `topic` from `seed`. Same seed, same question.
    function make(topic, seed) {
        const t = TOPICS[topic];
        if (!t) throw new Error('Unknown topic: ' + topic);
        const rng = makeRng(seed);
        const raw = t.gen(rng);
        const q = {
            topic, q: raw.q, answer: String(raw.answer), norm: raw.norm,
            accept: (raw.accept || [raw.answer]).map(String), hint: raw.hint, tol: raw.tol
        };
        if (!q.accept.includes(q.answer)) q.accept.unshift(q.answer);
        let pool = raw.distractors.map(String);
        // Numeric answers get padded with near misses so choice-mode retries never run dry
        if ((q.norm === 'int' || q.norm === 'num') && /^\d+(\.\d+)?$/.test(q.answer)) {
            const n = Number(q.answer);
            const step = n >= 100 ? Math.max(1, Math.round(n / 20)) : 1;
            pool = pool.concat([n + step, n - step, n + 2 * step, n * 2, n + 3 * step, n * 3, n + 4 * step, n + 5 * step].filter(x => x >= 0).map(String));
        }
        q.distractors = cleanDistractors(q, pool);
        return q;
    }

    return {
        TOPICS, NORMALIZERS, make, isCorrect, makeRng, hashString, shuffle,
        // exported for tests
        _internal: { expandIpv6, compressIpv6, permToOctal, octalToPerm, maskToPrefix, parseIpv4 }
    };
});
