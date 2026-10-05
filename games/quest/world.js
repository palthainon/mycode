/*
 * Datacenter Quest - the world: 3 acts x 10 rooms, plus items.
 *
 * Per act: 1 hub, 5 quiz rooms (a guardian blocks every exit except the way you
 * came in until its question is answered), 3 more exploration rooms (one hides a
 * potion, one holds the act's key item, one is lore) and 1 sealed boss room.
 * The boss door opens once all 5 guardians are cleared. The boss fight starts
 * when the key item is used on the boss.
 *
 * Room text is second person. Keep it to 2-4 sentences.
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.QuestWorld = factory();
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const ITEMS = {
        'cold-brew': {
            name: 'Cold Brew of Haste', names: ['cold brew', 'brew', 'potion', 'coffee', 'cold brew of haste'], kind: 'potion',
            desc: 'A mason jar of cold brew strong enough to restart a heart. Drink it to restore a life, or trade it for a hint.'
        },
        'rollback-elixir': {
            name: 'Elixir of Rollback', names: ['elixir', 'potion', 'rollback', 'elixir of rollback'], kind: 'potion',
            desc: 'A vial labelled "snapshot-before-change". Drink it to undo one mistake, or trade it for a hint.'
        },
        'break-room-coffee': {
            name: 'Break-Room Coffee', names: ['coffee', 'potion', 'mug', 'break-room coffee', 'break room coffee'], kind: 'potion',
            desc: 'Burnt, lukewarm, and somehow exactly what you need. Drink it to restore a life, or trade it for a hint.'
        },
        'lantern': {
            name: 'Lantern of Resolution', names: ['lantern', 'lantern of resolution', 'lamp'], kind: 'key', boss: 'hydra-lair',
            desc: 'A brass lantern whose flame answers every name you speak to it. Hydras hate being looked up.'
        },
        'crontab-scroll': {
            name: 'Crontab Scroll', names: ['scroll', 'crontab', 'crontab scroll'], kind: 'key', boss: 'daemon-pit',
            desc: 'A scroll of five-field incantations. Read aloud, it binds a daemon to its schedule.'
        },
        'console-cable': {
            name: 'Console Cable', names: ['cable', 'console cable', 'rollover', 'rollover cable'], kind: 'key', boss: 'row-13',
            desc: 'A blue rollover cable with a USB-serial dongle zip-tied to one end. The only thing that can reach a server whose network is gone.'
        },
        'rubber-duck': {
            name: 'rubber duck', names: ['duck', 'rubber duck'], kind: 'junk',
            desc: 'A yellow rubber duck with a tiny headset. Explaining your problem to it helps more than it should.'
        },
        'sticky-note': {
            name: 'sticky note', names: ['note', 'sticky note', 'sticky', 'post-it'], kind: 'junk',
            desc: 'It says "root pw: hunter2". You quietly add an item to the audit findings.'
        },
        'zip-tie': {
            name: 'zip tie', names: ['zip tie', 'tie', 'zip-tie', 'ziptie'], kind: 'junk',
            desc: 'A single black zip tie. Every datacenter runs on these.'
        }
    };

    const ACTS = [
        {
            n: 1, name: 'The Network Realm', start: 'tower', boss: 'hydra-lair', key: 'lantern',
            intro: 'ACT I: THE NETWORK REALM\nYour pager screams at 3:47 AM: PROD-ORACLE-01 is down and its remote KVM is dead. Someone has to walk to the datacenter and power-cycle it. You check the on-call rota. It is you.'
        },
        {
            n: 2, name: 'The Systems Realm', start: 'square', boss: 'daemon-pit', key: 'crontab-scroll',
            intro: 'ACT II: THE SYSTEMS REALM\nPast the Hydra\'s lair, the network gives way to the land of daemons and file permissions. Every process here has a parent, and most of them are neglectful.'
        },
        {
            n: 3, name: 'The Datacenter', start: 'dock', boss: 'row-13', key: 'console-cable',
            intro: 'ACT III: THE DATACENTER\nThe loading dock hums with the sound of ten thousand fans. Somewhere inside, PROD-ORACLE-01 sits in Row 13, and something with a crown of severed plugs sits beside it.'
        }
    ];

    const ROOMS = {
        // ======================= ACT I =======================
        'tower': {
            act: 1, name: 'Your Tower Study',
            text: 'Your study smells of solder and old spell books. A pager buzzes on the desk next to a cold mug. Stone stairs lead north to the Port Gatehouse, a rope bridge runs east, and the tavern\'s lights glow to the west.',
            exits: { north: 'gatehouse', east: 'bridge', west: 'tavern', south: 'hydra-lair' },
            features: [
                { names: ['pager'], text: 'CRITICAL: PROD-ORACLE-01 unreachable. KVM-over-IP: no response. Ack required. It has been acked. By you. Just now.' },
                { names: ['desk', 'mug'], text: 'A desk of papers and a mug of coffee gone cold before the last outage ended. Nothing useful, only regret.' },
                { names: ['door', 'south door', 'seal', 'seals', 'south'], text: 'A heavy door to the south, carved with five runes: one per guardian of this realm. Beyond it, something with many heads resolves names badly.' }
            ]
        },
        'tavern': {
            act: 1, name: 'The Dropped Packet Tavern',
            text: 'A low tavern where off-duty engineers trade outage stories. The barkeep polishes a glass and nods at the long counter. The only way out is back east.',
            exits: { east: 'tower' },
            features: [
                { names: ['barkeep', 'bartender'], text: '"Kitchen\'s closed, wizard. Check under the counter, though. The night shift always leaves something."' },
                { names: ['counter', 'bar', 'under counter'], text: 'Under the counter, behind a box of unlabelled SFPs, sits a mason jar of cold brew.', reveals: 'cold-brew' },
                { names: ['engineers', 'patrons'], text: 'One of them is explaining, for the ninth time, that "it was DNS." Everyone nods. It is always DNS.' }
            ]
        },
        'gatehouse': {
            act: 1, name: 'The Port Gatehouse',
            text: 'A stone gatehouse with 65,535 tiny doors set into its walls, most of them bricked up. The way north continues to a library. Stairs lead back south to your tower.',
            exits: { south: 'tower', north: 'library' },
            quiz: { topic: 'ports', guardian: 'the Portmaster Golem', intro: 'A granite golem steps into your path, a firewall rule etched across its chest. "STATE YOUR PORT," it grinds.', cleared: 'The golem steps aside and logs your session. "ALLOWED."' }
        },
        'library': {
            act: 1, name: 'The Library of Seven Layers',
            text: 'Seven floors of shelves rise around a central stair, each labelled with a layer of the stack. A doorway east shimmers like a mirror. The gatehouse lies south.',
            exits: { south: 'gatehouse', east: 'mirror-hall' },
            quiz: { topic: 'osi', guardian: 'the Librarian', intro: 'An owl in half-moon glasses looks up from the Physical-layer stacks. "Shush. Before you pass, tell me where this belongs."', cleared: 'The owl stamps your hand. "Correctly shelved. Go on."' }
        },
        'mirror-hall': {
            act: 1, name: 'The Hall of Mirrors',
            text: 'Every mirror shows your reflection in a different base: binary, hex, dotted decimal. A lighthouse beam sweeps the doorway east. The library lies west.',
            exits: { west: 'library', east: 'lighthouse' },
            quiz: { topic: 'ipconv', guardian: 'your hex reflection', intro: 'Your reflection, rendered entirely in hexadecimal, steps out of the glass. "Prove you can read me."', cleared: 'Your reflection shrugs and climbs back into the mirror, mumbling in base 16.' }
        },
        'bridge': {
            act: 1, name: 'The Bridge of Subnets',
            text: 'A rope bridge spans a chasm, its planks numbered in blocks of 4, 8, 16 and 64. A market bustles on the far side to the east. Your tower is back west.',
            exits: { west: 'tower', east: 'lease-market' },
            quiz: { topic: 'subnet', guardian: 'the Bridge Troll', intro: 'A troll hauls itself up from under the bridge, clutching an ACL printout. "Only traffic that matches my rules crosses. Answer me this."', cleared: 'The troll grunts and adds a permit line for you. "Implicit deny for everyone else."' }
        },
        'lease-market': {
            act: 1, name: 'The Lease Market',
            text: 'Merchants hand out IP addresses from stalls, each with a little timer ticking above it. A path north leads to a quiet graveyard. The bridge is back west.',
            exits: { west: 'bridge', north: 'graveyard' },
            quiz: { topic: 'dhcparp', guardian: 'the DHCP Innkeeper', intro: 'A round innkeeper blocks the north path with a ledger of leases. "No lease, no passage. Let\'s see if you know how this works."', cleared: 'The innkeeper writes you a lease. "Renew at half time, mind."' }
        },
        'graveyard': {
            act: 1, name: 'The Graveyard of Decommissioned Servers',
            text: 'Rows of headstones bear hostnames: EXCH2003, NT4-PDC, the-old-sharepoint. A rubber duck rests on one grave like an offering. North, a lighthouse sweeps its beam across the dark.',
            exits: { south: 'lease-market', north: 'lighthouse' },
            items: ['rubber-duck'],
            features: [
                { names: ['headstones', 'graves', 'grave', 'headstone'], text: 'One reads: "FILESRV01. Uptime 2,341 days. Patched never. Missed by no one but the auditors."' }
            ]
        },
        'lighthouse': {
            act: 1, name: 'The Resolver\'s Lighthouse',
            text: 'A lighthouse whose beam spells out root hints across the sky. A brass lantern hangs from a hook by the door. Paths lead west to the Hall of Mirrors and south to the graveyard.',
            exits: { west: 'mirror-hall', south: 'graveyard' },
            items: ['lantern'],
            features: [
                { names: ['beam', 'light', 'root hints'], text: 'a.root-servers.net, b.root-servers.net... all thirteen, sweeping in order. Very soothing.' }
            ]
        },
        'hydra-lair': {
            act: 1, name: 'The Lair of the DNS Hydra', boss: true,
            text: 'A cavern full of stale cache entries. The DNS Hydra coils at its heart, each head answering a different question wrongly. Beyond it, a tunnel leads on into the Systems Realm.',
            exits: { north: 'tower' },
            bossFight: {
                name: 'the DNS Hydra', topics: ['dns', 'dns'], key: 'lantern',
                locked: 'The Hydra\'s heads hiss out of the dark. In this blackness they regrow faster than you can count. You need light that can look things up.',
                intro: 'You raise the Lantern of Resolution. The Hydra\'s heads shriek as their TTLs expire. "ANSWER US," they hiss in chorus, "AND WE WILL BE FLUSHED."',
                win: 'The last head\'s cache entry expires and the Hydra dissolves into NXDOMAIN. The tunnel to the Systems Realm stands open.'
            }
        },

        // ======================= ACT II =======================
        'square': {
            act: 2, name: 'Shell Village Square',
            text: 'A village square paved with terminal prompts. A dollar-sign fountain trickles in the middle. North stands an iron gate, a clocktower rises to the east, an inn sits to the west, and a smoking pit opens to the south.',
            exits: { north: 'perm-gate', east: 'clocktower', west: 'inn', south: 'daemon-pit' },
            features: [
                { names: ['fountain'], text: 'Carved into the base: "Here lies rm -rf / --no-preserve-root. Never again."' },
                { names: ['pit', 'south', 'seals', 'seal'], text: 'The pit is ringed by five sealed runes, one per guardian of this realm. Something inside ticks like a clock.' }
            ]
        },
        'inn': {
            act: 2, name: 'The Sleeping Process Inn',
            text: 'Every guest here is in state S, snoring in interruptible sleep. A wall of numbered cubbies holds their belongings. The square lies east.',
            exits: { east: 'square' },
            features: [
                { names: ['cubbies', 'cubby', 'shelf', 'wall'], text: 'Cubby PID 1 is untouchable. Cubby PID 4242 holds a vial labelled "snapshot-before-change".', reveals: 'rollback-elixir' },
                { names: ['guests', 'processes'], text: 'One guest mumbles "waiting on I/O" in their sleep. They have been mumbling it since Tuesday.' }
            ]
        },
        'perm-gate': {
            act: 2, name: 'The Gate of Permissions',
            text: 'A wrought-iron gate with three locks marked u, g and o. A vault door glints north. The square is back south.',
            exits: { south: 'square', north: 'raid-vault' },
            quiz: { topic: 'chmod', guardian: 'the Octal Sphinx', intro: 'A sphinx with nine eyes, three per group, rises over the gate. "Permission denied," it purrs, "unless you can read me."', cleared: 'The sphinx sets your execute bit. The gate swings open.' }
        },
        'raid-vault': {
            act: 2, name: 'The Vault of Redundant Disks',
            text: 'Dwarves stack platters into neat arrays, arguing about parity. A scriptorium door stands east. The gate is back south.',
            exits: { south: 'perm-gate', east: 'scriptorium' },
            quiz: { topic: 'raid', guardian: 'the Dwarf Storage Admin', intro: 'A dwarf in a hard hat blocks the door with a hand truck of drives. "Nobody passes who can\'t count usable space."', cleared: '"Good. And remember: RAID is not a backup." The dwarf waves you on.' }
        },
        'scriptorium': {
            act: 2, name: 'The Scriptorium of /etc',
            text: 'Monks copy configuration files by candlelight, never quite the same way twice. A scroll sealed with five asterisks lies on a lectern. Doors lead west to the vault and south to some ruins.',
            exits: { west: 'raid-vault', south: 'tmp-ruins' },
            items: ['crontab-scroll'],
            features: [
                { names: ['monks', 'monk'], text: 'A monk whispers: "We do not use version control here. We use .bak, .bak2 and .bak-FINAL."' },
                { names: ['lectern'], text: 'An oak lectern, worn smooth by centuries of people reading man pages.' }
            ]
        },
        'clocktower': {
            act: 2, name: 'The Clocktower of Crontab',
            text: 'Five gears turn overhead: minute, hour, day of month, month, day of week. A swamp steams to the east. The square is back west.',
            exits: { west: 'square', east: 'log-swamp' },
            quiz: { topic: 'cron', guardian: 'the Clockwork Warden', intro: 'A clockwork knight steps out of the gears, ticking. "Tell me how often the bell tolls."', cleared: 'The warden winds itself down. "Schedule acknowledged."' }
        },
        'log-swamp': {
            act: 2, name: 'The Swamp of /var/log',
            text: 'Endless log lines float on the murky water, rotated but never deleted. Frogs croak their severity levels. A crypt looms north. The clocktower is back west.',
            exits: { west: 'clocktower', north: 'process-crypt' },
            quiz: { topic: 'syslog', guardian: 'the Swamp Witch', intro: 'A witch rises from the bog, wrapped in a 40 GB unrotated logfile. "Grep me this, wizard."', cleared: 'The witch sinks back with a satisfied gurgle and a logrotate cron entry.' }
        },
        'process-crypt': {
            act: 2, name: 'The Process Crypt',
            text: 'Zombie processes shuffle between the tombs, waiting for parents who will never call wait(). A path north leads to some ruins. The swamp is back south.',
            exits: { south: 'log-swamp', north: 'tmp-ruins' },
            quiz: { topic: 'signals', guardian: 'the Zombie Reaper', intro: 'A hooded reaper with a scythe labelled "init" blocks the way. "Know your signals, or join them."', cleared: 'The reaper reaps a zombie and lets you pass. "Adopted by PID 1. As they all are, eventually."' }
        },
        'tmp-ruins': {
            act: 2, name: 'The Ruins of /tmp',
            text: 'Crumbling files with names like core.1337 and test.txt litter the ground. Nobody remembers creating them, and everyone is afraid to delete them. Paths lead north to the scriptorium and south to the crypt.',
            exits: { south: 'process-crypt', north: 'scriptorium' },
            features: [
                { names: ['files', 'core', 'core.1337', 'test.txt'], text: 'test.txt contains the single word "test". It is 14 years old. It has outlived three CTOs.' }
            ]
        },
        'daemon-pit': {
            act: 2, name: 'The Pit of the Cron Daemon', boss: true,
            text: 'A pit of gears and brimstone. The Cron Daemon squats at the bottom, firing jobs at random intervals and laughing. A stair at the back descends toward the datacenter.',
            exits: { north: 'square' },
            bossFight: {
                name: 'the Cron Daemon', topics: ['cronnext', 'epoch'], key: 'crontab-scroll',
                locked: 'The Daemon fires a job at you, then another, then six at once. Without its schedule you can\'t predict a thing.',
                intro: 'You unroll the Crontab Scroll. The Daemon freezes mid-cackle. "A SCHEDULE? Fine. Prove you can read time itself."',
                win: 'The Daemon\'s jobs all finish at once, and it collapses with exit code 0. The stair down to the datacenter is clear.'
            }
        },

        // ======================= ACT III =======================
        'dock': {
            act: 3, name: 'The Loading Dock',
            text: 'Pallets of shrink-wrapped servers wait under flickering lights. North is the mantrap to the server floor. A long hallway runs east, the break room is south, and a meeting room glows west.',
            exits: { north: 'row-13', east: 'ipv6-hall', south: 'break-room', west: 'cab-chamber' },
            features: [
                { names: ['mantrap', 'north', 'leds', 'seals', 'seal'], text: 'The mantrap has five status LEDs, one per guardian of this realm. It will not cycle until they are all green.' },
                { names: ['pallets', 'servers'], text: 'The packing slip says "rack by Friday." It does not say which Friday.' }
            ]
        },
        'break-room': {
            act: 3, name: 'The Break Room',
            text: 'A vending machine hums next to a coffee maker that has never been cleaned. A sign reads "Your mother doesn\'t work here." The dock is back north.',
            exits: { north: 'dock' },
            features: [
                { names: ['coffee maker', 'maker', 'pot', 'coffee pot'], text: 'There is one mug\'s worth left in the pot. It has achieved sentience. You pour it anyway.', reveals: 'break-room-coffee' },
                { names: ['vending machine', 'machine'], text: 'It takes only exact change, and only in a currency discontinued in 2009.' },
                { names: ['sign'], text: 'Someone has added below it, in Sharpie: "and neither does the DBA."' }
            ]
        },
        'cab-chamber': {
            act: 3, name: 'The Change Advisory Chamber',
            text: 'Twelve empty chairs face a long table. The Wise Elder of Change Advisory sleeps at its head beside a sticky note. A corridor leads west to the routing crossroads. The dock is back east.',
            exits: { east: 'dock', west: 'crossroads' },
            items: ['sticky-note'],
            features: [
                { names: ['elder', 'wise elder'], text: 'The Elder stirs. "Ticket number?" You don\'t have one. "Emergency change, then. File it retroactively." The Elder goes back to sleep.' },
                { names: ['chairs', 'table'], text: 'Every seat has a placard. Every placard says "Approver (out of office)".' }
            ]
        },
        'crossroads': {
            act: 3, name: 'The Routing Crossroads',
            text: 'A dozen signposts point everywhere at once, each claiming to be the best path. An alcove lies north. The CAB chamber is back east.',
            exits: { east: 'cab-chamber', north: 'oob-alcove' },
            quiz: { topic: 'routing', guardian: 'the Route Reflector', intro: 'A figure made of mirrors bounces your own route back at you. "Which path do I believe?"', cleared: 'The reflector installs your route in its RIB. "Converged."' }
        },
        'oob-alcove': {
            act: 3, name: 'The Crash Cart Alcove',
            text: 'An alcove holding a squeaky crash cart with a monitor, a keyboard and an empty hook for a cable. Catacombs open to the north. The crossroads is back south.',
            exits: { south: 'crossroads', north: 'catacombs' },
            quiz: { topic: 'oob', guardian: 'the Ghost of the Remote Hands Tech', intro: 'A translucent tech in a lanyard drifts over the cart. "Network\'s down? Then you go out of band. Show me you know how."', cleared: 'The ghost nods. "You\'d have made a fine night-shift tech," and fades away.' }
        },
        'catacombs': {
            act: 3, name: 'The Cable Catacombs',
            text: 'Beneath the raised floor, cables run in tangled rivers, some still carrying traffic and most of them not. Coiled on a hook is a blue rollover cable. Passages lead south to the alcove and east into heat.',
            exits: { south: 'oob-alcove', east: 'hot-aisle' },
            items: ['console-cable', 'zip-tie'],
            features: [
                { names: ['cables', 'rivers', 'floor'], text: 'You find a 10BASE2 coax segment still terminated, still live, and still carrying something. You decide not to ask.' }
            ]
        },
        'ipv6-hall': {
            act: 3, name: 'The Infinite Hallway of IPv6',
            text: 'A hallway so long it would take 2^64 steps to reach the end of any single room. Doors to the east open onto an address-planning office. The dock is back west.',
            exits: { west: 'dock', east: 'vlsm-office' },
            quiz: { topic: 'ipv6', guardian: 'the Keeper of the 128 Bits', intro: 'A robed figure with a very long name tag steps from a doorway. "We have run out of IPv4 excuses. Speak IPv6."', cleared: 'The keeper hands you a /48. "Use it wisely. Or don\'t, there are plenty."' }
        },
        'vlsm-office': {
            act: 3, name: 'The Address Planning Office',
            text: 'Spreadsheets cover every wall, color-coded by site, VLAN and regret. A blast of heat comes from the north. The hallway is back west.',
            exits: { west: 'ipv6-hall', north: 'hot-aisle' },
            quiz: { topic: 'vlsm', guardian: 'the IPAM Clerk', intro: 'A clerk peers over a 4,000-row spreadsheet. "Before you go, I need a subnet sized correctly. Not a /24 for everything."', cleared: 'The clerk adds a row to the spreadsheet and color-codes you green.' }
        },
        'hot-aisle': {
            act: 3, name: 'The Sweltering Hot Aisle',
            text: 'Exhaust air roars out of a hundred servers at 45°C. The PDUs glow amber. Openings lead south to the planning office and west to the catacombs.',
            exits: { south: 'vlsm-office', west: 'catacombs' },
            quiz: { topic: 'power', guardian: 'the PDU Elemental', intro: 'A crackling elemental of 208-volt fury rises from a power strip. "Mind your load, or I trip."', cleared: 'The elemental settles to a steady 24 amps and lets you through.' }
        },
        'row-13': {
            act: 3, name: 'Row 13, Rack 7', boss: true,
            text: 'At the end of the row, PROD-ORACLE-01 sits in its rack, every LED amber. The Kernel-Panic Lich stands guard, its crown a ring of severed plugs.',
            exits: { south: 'dock' },
            bossFight: {
                name: 'the Kernel-Panic Lich', topics: ['boot', 'sequence'], key: 'console-cable',
                locked: 'The Lich laughs. "Network\'s gone, wizard. KVM\'s gone. You have no way in." It is right. You need a cable that does not care about the network.',
                intro: 'You plug the Console Cable into the server\'s serial port. Text crawls across your screen: "Kernel panic - not syncing." The Lich turns. "So. You came the old way. Then prove you know what to do with it."',
                win: 'The Lich crumbles into a pile of stack traces. You power-cycle PROD-ORACLE-01 through the BMC and watch the console. POST... GRUB... systemd... login prompt. Every LED turns green.'
            }
        }
    };

    return { ITEMS, ACTS, ROOMS };
});
