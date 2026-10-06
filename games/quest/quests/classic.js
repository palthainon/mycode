/*
 * Datacenter Quest - On-Call Classic: the original mixed network/sysadmin quest.
 * It uses only the shared topics in questions.js. See QUEST-AUTHORING.md for the
 * shape every quest file follows.
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('../questions.js'), require('../world.js'));
    else factory(root.QuestQuestions, root.QuestWorld);
})(typeof self !== 'undefined' ? self : this, function (Q, W) {
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
            name: 'rubber duck', names: ['duck', 'rubber duck'], kind: 'curio',
            desc: 'A yellow rubber duck with a tiny headset. Explaining your problem to it helps more than it should.',
            use: 'You explain the outage to the duck. The duck says nothing, but you feel slightly better.'
        },
        'mystery-sfp': {
            name: 'unlabelled SFP', names: ['sfp', 'unlabelled sfp', 'unlabeled sfp', 'transceiver', 'optic'], kind: 'curio',
            desc: 'An SFP with no label, no part number and no indication of speed. It could be 1G. It could be 10G. It could be a very small brick.',
            use: 'You plug it into nothing. Link light: off. As expected.'
        },
        'bak-final': {
            name: 'config.bak-FINAL-v2', names: ['config', 'bak', 'config.bak-final-v2', 'backup', 'file'], kind: 'curio',
            desc: 'A scroll titled config.bak-FINAL-v2. A note in the margin says "use v3". There is no v3.',
            use: 'You consider restoring from it. Then you remember there is no v3, and that this is somehow worse.'
        },
        'test-txt': {
            name: 'test.txt', names: ['test.txt', 'test', 'txt'], kind: 'curio',
            desc: 'It contains the single word "test". It is 14 years old. It has outlived three CTOs.',
            use: 'You cat test.txt. It says "test". The test passed.'
        },
        'sticky-note': {
            name: 'sticky note', names: ['note', 'sticky note', 'sticky', 'post-it'], kind: 'curio',
            desc: 'It says "root pw: hunter2". You quietly add an item to the audit findings.',
            use: 'You are not logging into anything with that. Ever.'
        },
        'zip-tie': {
            name: 'zip tie', names: ['zip tie', 'tie', 'zip-tie', 'ziptie'], kind: 'curio',
            desc: 'A single black zip tie. Every datacenter runs on these.',
            use: 'You zip-tie nothing to nothing. It feels productive anyway.'
        }
    };

    // Someone was here before you tonight. The quest never says who.
    const MYSTERY = {
        title: 'On-call notes, things that don\'t add up:',
        clues: {
            'early-ack': '3:13 AM: someone called "nightowl" acked the page, then un-acked it. The alert only escalated to you after that.',
            'fresh-grave': 'A freshly dug grave in the graveyard is marked PROD-ORACLE-01, dated tonight.',
            'tmp-script': '/tmp holds nightowl.sh: "sleep 2100; echo \'they will send someone. they always do.\'"',
            'change-ticket': 'CHG-0347, approved weeks ago: reboot PROD-ORACLE-01 tonight at 3:47 AM. Requester: nightowl.',
            'badge-log': 'Badge log, Row 13: nightowl in at 3:40 AM. No badge out.'
        },
        solved: 'The next morning you open the postmortem template. Under "Root cause" you type, delete, and type again. Then you check the on-call rota one more time. Tomorrow night\'s shift, in a font slightly different from the rest, reads: nightowl. Nobody on the team knows who that is. The badge system says they never left.'
    };

    const AMBIENT = [
        { act: 1, text: 'Behind you, footsteps. When you turn, the stairwell is empty, and a door you didn\'t open is swinging shut.' },
        { act: 1, text: 'Somewhere a pager chirps, the same tone as yours, one room away. Then it stops.' },
        { act: 2, text: 'A process you don\'t recognize flickers past at the edge of your vision. Its owner column says "nightowl".' },
        { act: 2, text: 'Every cron job in the realm fires at once, then falls silent, as if something had checked the time.' },
        { act: 3, text: 'A cart squeaks somewhere deeper in the datacenter. You are supposed to be the only one here.' },
        { act: 3, text: 'The air handler hiccups, and for a second you can hear someone humming the vendor hold music.' }
    ];

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
                {
                    names: ['pager', 'history', 'alert'], clue: 'early-ack',
                    text: 'CRITICAL: PROD-ORACLE-01 unreachable. KVM-over-IP: no response. Ack required. You scroll back. The alert first fired at 3:12 AM. At 3:13 it was acked by someone called "nightowl". At 3:46 it was un-acked. At 3:47 it escalated to you.',
                    again: 'The pager shows the same history. nightowl. You don\'t know a nightowl. You check the team list. Neither does it.'
                },
                {
                    names: ['desk', 'mug', 'papers'], text: 'A desk of papers and a mug of coffee gone cold before the last outage ended. Nothing useful, only regret.',
                    again: 'Under the papers: a performance review that says "great in a crisis". You have never been more aware of what that means.'
                },
                {
                    names: ['spell books', 'books', 'spellbooks', 'shelf'], text: 'TCP/IP Illustrated, Vol. 1. The Practice of System and Network Administration. A grimoire titled "Regex: Do Not Read Aloud".',
                    extra: { wizard: 'Your own spellbook is on the end, bookmarked at "Turning It Off and On Again, Advanced".', knight: 'Wedged between them is a manual for your armor. You have never read it. It still works.', rogue: 'One of the books is hollow. Inside: a spare badge, not yours, no name on it. You put it back.' }
                },
                { names: ['door', 'south door', 'seal', 'seals', 'south'], text: 'A heavy door to the south, carved with five runes: one per guardian of this realm. Beyond it, something with many heads resolves names badly.' }
            ],
            sense: { listen: 'The pager buzzes. Under it, faintly, a second pager buzzes in reply from somewhere outside the tower.', smell: 'Solder flux, old paper, and the specific despair of a 3 AM page.' }
        },
        'tavern': {
            act: 1, name: 'The Dropped Packet Tavern',
            text: 'A low tavern where off-duty engineers trade outage stories. The barkeep polishes a glass and nods at the long counter. The only way out is back east.',
            exits: { east: 'tower' },
            features: [
                { names: ['barkeep', 'bartender'], text: '"Kitchen\'s closed, friend. Check under the counter, though. The night shift always leaves something."' },
                { names: ['counter', 'bar', 'under counter'], text: 'Under the counter, behind a box of unlabelled SFPs, sits a mason jar of cold brew.', reveals: 'cold-brew' },
                { names: ['box', 'sfps', 'box of sfps'], text: 'Dozens of SFPs, none labelled. One rolls into your hand as if it wants to leave.', reveals: 'mystery-sfp', again: 'The rest stay put. They have accepted their fate.' },
                {
                    names: ['engineers', 'patrons'], text: 'One of them is explaining, for the ninth time, that "it was DNS." Everyone nods. It is always DNS.',
                    again: 'Another is telling a story about a nightowl who fixed a SAN outage alone in 2014 and was never seen again. Everyone laughs a little too fast.'
                },
                { names: ['glass', 'glasses'], text: 'The barkeep has been polishing the same glass since you walked in. It is spotless. They are not going to stop.' }
            ],
            sense: { listen: 'Over the clink of glasses: "...and the backup job had been failing silently since March..." A collective groan.', smell: 'Spilled stout and the rubbery smell of a patch cable someone is chewing on, nervously.' }
        },
        'gatehouse': {
            act: 1, name: 'The Port Gatehouse',
            text: 'A stone gatehouse with 65,535 tiny doors set into its walls, most of them bricked up. The way north continues to a library. Stairs lead back south to your tower.',
            exits: { south: 'tower', north: 'library' },
            features: [
                { names: ['doors', 'tiny doors', 'walls', 'wall'], text: 'Door 22 has a welcome mat. Door 23 has been bricked up, and someone has scratched "good riddance" into the mortar. Door 3389 is boarded over and smells faintly of ransomware.', again: 'Door 8080 has a sign: "Dev. Do not use. In prod since 2016."' },
                { names: ['bricks', 'bricked'], text: 'Most of the doors are bricked shut. The bricks are labelled "implicit deny". They hold up the whole building.' }
            ],
            quiz: { topic: 'ports', guardian: 'the Portmaster Golem', intro: 'A granite golem steps into your path, a firewall rule etched across its chest. "STATE YOUR PORT," it grinds.', cleared: 'The golem steps aside and logs your session. "ALLOWED."' }
        },
        'library': {
            act: 1, name: 'The Library of Seven Layers',
            text: 'Seven floors of shelves rise around a central stair, each labelled with a layer of the stack. A doorway east shimmers like a mirror. The gatehouse lies south.',
            exits: { south: 'gatehouse', east: 'mirror-hall' },
            features: [
                { names: ['shelves', 'floors', 'stacks'], text: 'The Physical floor is all cables and dust. The Application floor is all arguments. Someone has taped a handwritten sign to a staircase between them: "Layer 8: the user. Not catalogued."' },
                { names: ['stair', 'staircase'], text: 'Each step is labelled with a layer. Step 5 is roped off. Nobody has been sure what Session does since 1994.' }
            ],
            sense: { listen: 'Pages turning on every floor, and the owl\'s distant, disapproving "shh".' },
            quiz: { topic: 'osi', guardian: 'the Librarian', intro: 'An owl in half-moon glasses looks up from the Physical-layer stacks. "Shush. Before you pass, tell me where this belongs."', cleared: 'The owl stamps your hand. "Correctly shelved. Go on."' }
        },
        'mirror-hall': {
            act: 1, name: 'The Hall of Mirrors',
            text: 'Every mirror shows your reflection in a different base: binary, hex, dotted decimal. A lighthouse beam sweeps the doorway east. The library lies west.',
            exits: { west: 'library', east: 'lighthouse' },
            features: [
                {
                    names: ['mirrors', 'mirror', 'reflection'], text: 'In binary you look tall. In hex you look tired. In dotted decimal you look exactly like a 3 AM page.',
                    again: 'In the last mirror, for half a second, there is someone standing behind your reflection. When you turn, nobody. When you look back, just you.',
                    extra: { rogue: 'Habit makes you check the mirror for hidden hinges. One swings. Behind it: a wall that just says "0x0". You close it again.' }
                }
            ],
            quiz: { topic: 'ipconv', guardian: 'your hex reflection', intro: 'Your reflection, rendered entirely in hexadecimal, steps out of the glass. "Prove you can read me."', cleared: 'Your reflection shrugs and climbs back into the mirror, mumbling in base 16.' }
        },
        'bridge': {
            act: 1, name: 'The Bridge of Subnets',
            text: 'A rope bridge spans a chasm, its planks numbered in blocks of 4, 8, 16 and 64. A market bustles on the far side to the east. Your tower is back west.',
            exits: { west: 'tower', east: 'lease-market' },
            features: [
                { names: ['planks', 'plank'], text: 'Plank .0 is the network. Plank .255 is the broadcast. You step only on the usable ones, out of respect.' },
                { names: ['chasm'], text: 'You look down. Far below, a pile of misconfigured /31s from before RFC 3021 made them legal. They look lonely.', extra: { knight: 'In full plate, you decide not to look down for very long.' } }
            ],
            sense: { listen: 'The wind through the ropes makes a sound like a fan bearing about to fail.' },
            quiz: { topic: 'subnet', guardian: 'the Bridge Troll', intro: 'A troll hauls itself up from under the bridge, clutching an ACL printout. "Only traffic that matches my rules crosses. Answer me this."', cleared: 'The troll grunts and adds a permit line for you. "Implicit deny for everyone else."' }
        },
        'lease-market': {
            act: 1, name: 'The Lease Market',
            text: 'Merchants hand out IP addresses from stalls, each with a little timer ticking above it. A path north leads to a quiet graveyard. The bridge is back west.',
            exits: { west: 'bridge', north: 'graveyard' },
            features: [
                { names: ['stalls', 'merchants', 'stall'], text: 'One stall sells static addresses "for life". A smaller sign below adds "life subject to renumbering".' },
                { names: ['timers', 'timer'], text: 'Most timers count down from eight days. One counts down from forever. Its address is 169.254.something, and nobody will make eye contact with it.', again: 'One stall is shuttered. The lease ledger on its counter has a single entry, made tonight: "nightowl - 1 lease - returned early".' }
            ],
            quiz: { topic: 'dhcparp', guardian: 'the DHCP Innkeeper', intro: 'A round innkeeper blocks the north path with a ledger of leases. "No lease, no passage. Let\'s see if you know how this works."', cleared: 'The innkeeper writes you a lease. "Renew at half time, mind."' }
        },
        'graveyard': {
            act: 1, name: 'The Graveyard of Decommissioned Servers',
            text: 'Rows of headstones bear hostnames: EXCH2003, NT4-PDC, the-old-sharepoint. A rubber duck rests on one grave like an offering. North, a lighthouse sweeps its beam across the dark.',
            exits: { south: 'lease-market', north: 'lighthouse' },
            items: ['rubber-duck'],
            features: [
                { names: ['headstones', 'graves', 'headstone'], text: 'One reads: "FILESRV01. Uptime 2,341 days. Patched never. Missed by no one but the auditors."', again: 'Another: "the-old-sharepoint. Migrated 2019. Still receives 40 requests a day from somewhere."' },
                {
                    names: ['fresh grave', 'grave', 'dirt', 'shovel'], clue: 'fresh-grave',
                    text: 'At the end of the row, a grave so fresh the dirt is still loose. The headstone is already carved: "PROD-ORACLE-01". The date is tonight. A shovel leans against it, still warm.',
                    again: 'The grave is still there. You decide, firmly, that it is a prank.'
                }
            ],
            sense: { listen: 'Very faintly, from under the headstones, the click-click-click of drives that refuse to spin up.', smell: 'Wet earth and old thermal paste.' }
        },
        'lighthouse': {
            act: 1, name: 'The Resolver\'s Lighthouse',
            text: 'A lighthouse whose beam spells out root hints across the sky. A brass lantern hangs from a hook by the door. Paths lead west to the Hall of Mirrors and south to the graveyard.',
            exits: { west: 'mirror-hall', south: 'graveyard' },
            items: ['lantern'],
            features: [
                { names: ['beam', 'light', 'root hints'], text: 'a.root-servers.net, b.root-servers.net... all thirteen, sweeping in order. Very soothing.', again: 'You count again. Thirteen names. For a moment you could swear the beam swept fourteen times.' },
                { names: ['hook', 'door'], text: 'The hook by the door has a label in neat handwriting: "for whoever comes next".' }
            ],
            sense: { listen: 'The beam hums as it sweeps. Every so often it stutters, like a resolver timing out and retrying.' }
        },
        'hydra-lair': {
            act: 1, name: 'The Lair of the DNS Hydra', boss: true,
            text: 'A cavern full of stale cache entries. The DNS Hydra coils at its heart, each head answering a different question wrongly. Beyond it, a tunnel leads on into the Systems Realm.',
            exits: { north: 'tower' },
            features: [
                { names: ['cache', 'entries', 'cache entries'], text: 'Stale records hang from the ceiling like stalactites. One still points www at an IP that was decommissioned in 2011. It has a TTL of 86,400 and the confidence of a much younger record.' },
                { names: ['heads', 'head', 'hydra'], text: 'You count the heads. Seven. Then nine. One of them is just saying "SERVFAIL" over and over.' }
            ],
            sense: { smell: 'Sulfur and stale cache. The smell of a resolver nobody has flushed since the last reorg.' },
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
                { names: ['fountain'], text: 'Carved into the base: "Here lies rm -rf / --no-preserve-root. Never again."', again: 'Coins in the fountain, each one a wish. You read a few: "please let it be DNS", "please let backups work", "please let nightowl take my shift".', uses: { 'rubber-duck': 'You float the duck in the fountain. It bobs once, turns to face the pit, and refuses to turn back. You retrieve it, slightly unnerved.' } },
                { names: ['prompts', 'paving', 'stones'], text: 'Each paving stone is a prompt. Most end in $. One, worn smooth by foot traffic, ends in #. You step around it carefully.' },
                { names: ['pit', 'south', 'seals', 'seal'], text: 'The pit is ringed by five sealed runes, one per guardian of this realm. Something inside ticks like a clock.' }
            ],
            sense: { listen: 'The fountain trickles. Under it, a steady tick-tick from the pit, exactly sixty to the minute.' }
        },
        'inn': {
            act: 2, name: 'The Sleeping Process Inn',
            text: 'Every guest here is in state S, snoring in interruptible sleep. A wall of numbered cubbies holds their belongings. The square lies east.',
            exits: { east: 'square' },
            features: [
                { names: ['cubbies', 'cubby', 'shelf', 'wall'], text: 'Cubby PID 1 is untouchable. Cubby PID 4242 holds a vial labelled "snapshot-before-change".', reveals: 'rollback-elixir' },
                { names: ['guests', 'processes'], text: 'One guest mumbles "waiting on I/O" in their sleep. They have been mumbling it since Tuesday.', again: 'A guest in state D will not wake no matter what you do. Even kill -9 just makes them roll over.' },
                { names: ['ledger', 'register', 'guestbook'], text: 'The guestbook\'s last line was signed tonight: "nightowl, PID 3347, checked out early. Left the bed made."', extra: { rogue: 'You check for a forwarding address out of habit. There isn\'t one. There never is.' } }
            ],
            sense: { listen: 'Snoring, in perfect unison, every guest waiting on the same disk.' }
        },
        'perm-gate': {
            act: 2, name: 'The Gate of Permissions',
            text: 'A wrought-iron gate with three locks marked u, g and o. A vault door glints north. The square is back south.',
            exits: { south: 'square', north: 'raid-vault' },
            features: [
                { names: ['locks', 'lock'], text: 'Lock u is polished from use. Lock g is stiff. Lock o has been set to 7 by someone in a hurry, and a small brass plaque underneath it says "temporary".', again: 'The plaque is dated eleven years ago.' }
            ],
            quiz: { topic: 'chmod', guardian: 'the Octal Sphinx', intro: 'A sphinx with nine eyes, three per group, rises over the gate. "Permission denied," it purrs, "unless you can read me."', cleared: 'The sphinx sets your execute bit. The gate swings open.' }
        },
        'raid-vault': {
            act: 2, name: 'The Vault of Redundant Disks',
            text: 'Dwarves stack platters into neat arrays, arguing about parity. A scriptorium door stands east. The gate is back south.',
            exits: { south: 'perm-gate', east: 'scriptorium' },
            features: [
                { names: ['dwarves', 'platters', 'arrays'], text: 'Two dwarves are arguing about RAID 5 versus RAID 6. A third is quietly rebuilding a RAID 5 and sweating.', again: 'The rebuild is at 34%. It was at 34% when you came in. The dwarf has started praying.' }
            ],
            sense: { listen: 'The whine of a hundred spindles and one drive that clicks. Everyone is pretending not to hear the one that clicks.' },
            quiz: { topic: 'raid', guardian: 'the Dwarf Storage Admin', intro: 'A dwarf in a hard hat blocks the door with a hand truck of drives. "Nobody passes who can\'t count usable space."', cleared: '"Good. And remember: RAID is not a backup." The dwarf waves you on.' }
        },
        'scriptorium': {
            act: 2, name: 'The Scriptorium of /etc',
            text: 'Monks copy configuration files by candlelight, never quite the same way twice. A scroll sealed with five asterisks lies on a lectern. Doors lead west to the vault and south to some ruins.',
            exits: { west: 'raid-vault', south: 'tmp-ruins' },
            items: ['crontab-scroll'],
            features: [
                { names: ['monks', 'monk'], text: 'A monk whispers: "We do not use version control here. We use .bak, .bak2 and .bak-FINAL." He presses a scroll into your hands to make the point.', reveals: 'bak-final', again: 'The monk has gone back to copying. He has made a typo in line 1. It will be there forever now.' },
                { names: ['lectern'], text: 'An oak lectern, worn smooth by centuries of people reading man pages.' },
                { names: ['candles', 'candle', 'candlelight'], text: 'The candles are arranged in a /etc/hosts file. 127.0.0.1 burns brightest. ::1 is unlit, as usual.' }
            ],
            sense: { listen: 'Quills scratching. Somewhere a monk mutters "who changed sshd_config?" and nobody answers.' }
        },
        'clocktower': {
            act: 2, name: 'The Clocktower of Crontab',
            text: 'Five gears turn overhead: minute, hour, day of month, month, day of week. A swamp steams to the east. The square is back west.',
            exits: { west: 'square', east: 'log-swamp' },
            features: [
                { names: ['gears', 'gear', 'clock'], text: 'The day-of-week gear has an extra tooth labelled 7, which is also Sunday. The clockmakers argued about it for a decade and kept both.', again: 'You watch the hour gear. It slips back an hour, then forward again. Daylight saving, rehearsing.' },
                { names: ['bell'], text: 'Engraved on the bell: "0 3 * * * /opt/scripts/cleanup.sh # DO NOT REMOVE - nightowl". The bell has not rung tonight.' }
            ],
            sense: { listen: 'Tick. Tick. Then, under the ticking, a second clock, slightly out of sync, coming from nowhere you can see.' },
            quiz: { topic: 'cron', guardian: 'the Clockwork Warden', intro: 'A clockwork knight steps out of the gears, ticking. "Tell me how often the bell tolls."', cleared: 'The warden winds itself down. "Schedule acknowledged."' }
        },
        'log-swamp': {
            act: 2, name: 'The Swamp of /var/log',
            text: 'Endless log lines float on the murky water, rotated but never deleted. Frogs croak their severity levels. A crypt looms north. The clocktower is back west.',
            exits: { west: 'clocktower', north: 'process-crypt' },
            features: [
                { names: ['log lines', 'lines', 'logs', 'water'], text: 'You fish out a line: "Oct 6 03:12:04 prod-oracle-01 kernel: [ 0.000000] Linux version..." The server rebooted at 3:12. Nobody touched it. Supposedly.' },
                { names: ['frogs', 'frog'], text: 'A big frog croaks "EMERG". A small one croaks "debug, debug, debug" without pausing for breath. Nobody listens to either.' }
            ],
            sense: { listen: 'Croaking, in eight severity levels. The debug frogs drown out everything.', smell: 'Like a disk that hit 100% sometime last week.' },
            quiz: { topic: 'syslog', guardian: 'the Swamp Witch', intro: 'A witch rises from the bog, wrapped in a 40 GB unrotated logfile. "Grep me this, on-call."', cleared: 'The witch sinks back with a satisfied gurgle and a logrotate cron entry.' }
        },
        'process-crypt': {
            act: 2, name: 'The Process Crypt',
            text: 'Zombie processes shuffle between the tombs, waiting for parents who will never call wait(). A path north leads to some ruins. The swamp is back south.',
            exits: { south: 'log-swamp', north: 'tmp-ruins' },
            features: [
                { names: ['tombs', 'tomb', 'zombies'], text: 'Each tomb lists a PID and a parent. Most parents are long gone. One tomb is empty and still open, and its PID is 3347.', again: 'The empty tomb\'s lid has been slid back from the inside.' }
            ],
            quiz: { topic: 'signals', guardian: 'the Zombie Reaper', intro: 'A hooded reaper with a scythe labelled "init" blocks the way. "Know your signals, or join them."', cleared: 'The reaper reaps a zombie and lets you pass. "Adopted by PID 1. As they all are, eventually."' }
        },
        'tmp-ruins': {
            act: 2, name: 'The Ruins of /tmp',
            text: 'Crumbling files with names like core.1337 and test.txt litter the ground. Nobody remembers creating them, and everyone is afraid to delete them. Paths lead north to the scriptorium and south to the crypt.',
            exits: { south: 'process-crypt', north: 'scriptorium' },
            items: ['test-txt'],
            features: [
                { names: ['files', 'core', 'core.1337'], text: 'core.1337 is 4 GB of memory from a process that died in 2017. Nobody has read it. Nobody ever will. It will outlive us all.' },
                {
                    names: ['nightowl.sh', 'script', 'sh', 'newest file'], clue: 'tmp-script',
                    text: 'Among the ancient files, one is new: nightowl.sh, created at 3:12 AM. It is a single line: sleep 2100; echo "they will send someone. they always do." 2,100 seconds after 3:12 is 3:47.',
                    again: 'You check the file\'s owner. nightowl. UID 0.'
                }
            ],
            sense: { smell: 'Dust, and the faint chemical tang of files that should have been cleaned up by a cron job that someone commented out.' }
        },
        'daemon-pit': {
            act: 2, name: 'The Pit of the Cron Daemon', boss: true,
            text: 'A pit of gears and brimstone. The Cron Daemon squats at the bottom, firing jobs at random intervals and laughing. A stair at the back descends toward the datacenter.',
            exits: { north: 'square' },
            features: [
                { names: ['gears', 'brimstone', 'jobs'], text: 'Jobs fly past like sparks. One is "*/1 * * * * curl https://example.com/heartbeat". It has been running every minute for six years. Nobody knows who reads the heartbeat.' },
                { names: ['stair', 'stairs'], text: 'The stair down is scorched with crontab entries. At the bottom step, chalked fresh: "3:47".' }
            ],
            sense: { listen: 'Every minute, on the minute, a dozen jobs fire at once. The Daemon laughs on the tick.' },
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
                { names: ['pallets', 'servers'], text: 'The packing slip says "rack by Friday." It does not say which Friday.', again: 'You check the date on the slip. It was delivered in 2022. It is still shrink-wrapped.' },
                { names: ['lights', 'light'], text: 'One tube flickers in a pattern. Short, short, long. You decide it is not Morse code, because you would rather not know what it says.' }
            ],
            sense: { listen: 'Ten thousand fans, all in roughly the same key.', smell: 'Cardboard, cold air, and the new-server smell of anti-static bags.' }
        },
        'break-room': {
            act: 3, name: 'The Break Room',
            text: 'A vending machine hums next to a coffee maker that has never been cleaned. A sign reads "Your mother doesn\'t work here." The dock is back north.',
            exits: { north: 'dock' },
            features: [
                { names: ['coffee maker', 'maker', 'pot', 'coffee pot'], text: 'There is one mug\'s worth left in the pot. It has achieved sentience. You pour it anyway.', reveals: 'break-room-coffee' },
                { names: ['vending machine', 'machine'], text: 'It takes only exact change, and only in a currency discontinued in 2009.', again: 'Slot B4 holds a single bag of chips with a sticky note on it: "reserved: nightowl". The note is dated 2014.' },
                { names: ['sign'], text: 'Someone has added below it, in Sharpie: "and neither does the DBA."' },
                { names: ['fridge', 'refrigerator'], text: 'A label maker has been at the fridge. "THIS FRIDGE IS CLEANED FRIDAY." It does not say which Friday either.', extra: { knight: 'You open it with your gauntlet. You are glad you are wearing a gauntlet.' } }
            ],
            sense: { smell: 'Burnt coffee, microwave fish, and despair.' }
        },
        'cab-chamber': {
            act: 3, name: 'The Change Advisory Chamber',
            text: 'Twelve empty chairs face a long table. The Wise Elder of Change Advisory sleeps at its head beside a sticky note. A corridor leads west to the routing crossroads. The dock is back east.',
            exits: { east: 'dock', west: 'crossroads' },
            items: ['sticky-note'],
            features: [
                { names: ['elder', 'wise elder'], text: 'The Elder stirs. "Ticket number?" You don\'t have one. "Emergency change, then. File it retroactively." The Elder goes back to sleep.' },
                { names: ['chairs', 'table'], text: 'Every seat has a placard. Every placard says "Approver (out of office)".' },
                {
                    names: ['calendar', 'change calendar', 'whiteboard', 'tickets'], clue: 'change-ticket',
                    text: 'The change calendar on the wall has one entry for tonight: CHG-0347, "Reboot PROD-ORACLE-01". Scheduled 3:47 AM. Requester: nightowl. Approved three weeks ago, by all twelve approvers, unanimously. You have never seen a unanimous CAB.',
                    again: 'You look for the ticket\'s implementation plan. It reads, in full: "someone will come."'
                }
            ],
            sense: { listen: 'The Elder snores. The clock on the wall ticks. Every few minutes, somebody\'s laptop in an empty chair dings with a meeting reminder.' }
        },
        'crossroads': {
            act: 3, name: 'The Routing Crossroads',
            text: 'A dozen signposts point everywhere at once, each claiming to be the best path. An alcove lies north. The CAB chamber is back east.',
            exits: { east: 'cab-chamber', north: 'oob-alcove' },
            features: [
                { names: ['signposts', 'signpost', 'signs'], text: 'One sign says "Default route: that way." It points at another sign that says "Default route: back there." You have found a routing loop, and it has a little bench.', again: 'Someone has carved "TTL exceeded" into the bench. Several times.' }
            ],
            quiz: { topic: 'routing', guardian: 'the Route Reflector', intro: 'A figure made of mirrors bounces your own route back at you. "Which path do I believe?"', cleared: 'The reflector installs your route in its RIB. "Converged."' }
        },
        'oob-alcove': {
            act: 3, name: 'The Crash Cart Alcove',
            text: 'An alcove holding a squeaky crash cart with a monitor, a keyboard and an empty hook for a cable. Catacombs open to the north. The crossroads is back south.',
            exits: { south: 'crossroads', north: 'catacombs' },
            features: [
                { names: ['crash cart', 'cart', 'monitor', 'keyboard'], text: 'The monitor is a 15-inch VGA from 2006. The keyboard is missing the F and U keys. Someone has worn the Delete key completely blank.', again: 'The cart is still warm, as if someone pushed it here a few minutes ago.' },
                { names: ['hook', 'empty hook'], text: 'A label on the empty hook: "CONSOLE CABLE - PUT IT BACK". Under it, in different handwriting: "moved it to the catacombs. you\'ll see."' }
            ],
            quiz: { topic: 'oob', guardian: 'the Ghost of the Remote Hands Tech', intro: 'A translucent tech in a lanyard drifts over the cart. "Network\'s down? Then you go out of band. Show me you know how."', cleared: 'The ghost nods. "You\'d have made a fine night-shift tech," and fades away.' }
        },
        'catacombs': {
            act: 3, name: 'The Cable Catacombs',
            text: 'Beneath the raised floor, cables run in tangled rivers, some still carrying traffic and most of them not. Coiled on a hook is a blue rollover cable. Passages lead south to the alcove and east into heat.',
            exits: { south: 'oob-alcove', east: 'hot-aisle' },
            items: ['console-cable', 'zip-tie'],
            features: [
                { names: ['cables', 'rivers', 'floor'], text: 'You find a 10BASE2 coax segment still terminated, still live, and still carrying something. You decide not to ask.', again: 'You follow the coax with your eyes. It runs under the wall toward Row 13. It is warm.', uses: { 'zip-tie': 'You zip-tie the loose coax to the tray, neatly, at right angles. It is the only tidy thing in the catacombs. You feel a deep, quiet peace.' } },
                { names: ['tile', 'floor tile', 'raised floor'], text: 'One floor tile has been lifted and set back crooked. Fingerprints in the dust. Recent ones.', extra: { rogue: 'Professional curiosity: you check the fingerprints. Whoever this was wore gloves for everything except this one tile.' } }
            ],
            sense: { listen: 'The hiss of cold air under the floor, and a ticking from a cable that shouldn\'t carry anything at all.', touch: 'The cables are cold. All except one bundle of coax, which is warm to the touch.' }
        },
        'ipv6-hall': {
            act: 3, name: 'The Infinite Hallway of IPv6',
            text: 'A hallway so long it would take 2^64 steps to reach the end of any single room. Doors to the east open onto an address-planning office. The dock is back west.',
            exits: { west: 'dock', east: 'vlsm-office' },
            features: [
                { names: ['hallway', 'doors', 'end'], text: 'You squint down the hallway. Somewhere around 2001:db8:: there is a door marked "documentation only". It is the only door anyone has ever opened.', again: 'Far down the hall, a figure waves at you from fe80::1. Link-local. They can only reach you from here, and only for now.' }
            ],
            quiz: { topic: 'ipv6', guardian: 'the Keeper of the 128 Bits', intro: 'A robed figure with a very long name tag steps from a doorway. "We have run out of IPv4 excuses. Speak IPv6."', cleared: 'The keeper hands you a /48. "Use it wisely. Or don\'t, there are plenty."' }
        },
        'vlsm-office': {
            act: 3, name: 'The Address Planning Office',
            text: 'Spreadsheets cover every wall, color-coded by site, VLAN and regret. A blast of heat comes from the north. The hallway is back west.',
            exits: { west: 'ipv6-hall', north: 'hot-aisle' },
            features: [
                { names: ['spreadsheets', 'spreadsheet', 'walls'], text: 'Tab 1: "IPAM". Tab 2: "IPAM (2)". Tab 3: "IPAM real". Tab 4: "DO NOT USE". Tab 4 is the one everyone uses.', again: 'One row is highlighted in a color not in the legend: 10.13.7.0/29, "reserved - nightowl - do not reclaim".' }
            ],
            quiz: { topic: 'vlsm', guardian: 'the IPAM Clerk', intro: 'A clerk peers over a 4,000-row spreadsheet. "Before you go, I need a subnet sized correctly. Not a /24 for everything."', cleared: 'The clerk adds a row to the spreadsheet and color-codes you green.' }
        },
        'hot-aisle': {
            act: 3, name: 'The Sweltering Hot Aisle',
            text: 'Exhaust air roars out of a hundred servers at 45°C. The PDUs glow amber. Openings lead south to the planning office and west to the catacombs.',
            exits: { south: 'vlsm-office', west: 'catacombs' },
            features: [
                { names: ['pdus', 'pdu'], text: 'Each PDU shows its load in amber digits. One reads 0.0 A on every outlet but still has a tag: "DO NOT UNPLUG - PROD". It has been unplugged for years.' },
                { names: ['servers', 'exhaust'], text: 'You hold a hand up to the exhaust. It\'s like standing behind a jet engine that bills by the hour.', extra: { knight: 'Inside your armor the temperature climbs from "uncomfortable" to "convection oven".', wizard: 'Your hat flutters straight up. It\'s a good look, honestly.' } }
            ],
            sense: { listen: 'A roar so loud it becomes a kind of silence.', touch: 'You touch a server lid. You will remember this the next time someone asks why the cooling budget matters.' },
            quiz: { topic: 'power', guardian: 'the PDU Elemental', intro: 'A crackling elemental of 208-volt fury rises from a power strip. "Mind your load, or I trip."', cleared: 'The elemental settles to a steady 24 amps and lets you through.' }
        },
        'row-13': {
            act: 3, name: 'Row 13, Rack 7', boss: true,
            text: 'At the end of the row, PROD-ORACLE-01 sits in its rack, every LED amber. The Kernel-Panic Lich stands guard, its crown a ring of severed plugs.',
            exits: { south: 'dock' },
            features: [
                {
                    names: ['badge reader', 'reader', 'badge log', 'log'], clue: 'badge-log',
                    text: 'The badge reader at the end of the row keeps a short log on its little screen. Last entry before yours: "nightowl - IN - 03:40". There is no OUT.',
                    again: 'You look up and down the row. Nobody here but you, the Lich and the server.'
                },
                { names: ['rack', 'leds', 'server'], text: 'PROD-ORACLE-01 has a label maker sticker on its bezel: "if this goes down, page on-call". It has been crossed out and rewritten in different handwriting: "if this goes down, they will send someone."' }
            ],
            sense: { listen: 'Under the fans, a heartbeat. Too slow to be yours.' },
            bossFight: {
                name: 'the Kernel-Panic Lich', topics: ['boot', 'sequence'], key: 'console-cable',
                locked: 'The Lich laughs. "Network\'s gone, on-call. KVM\'s gone. You have no way in." It is right. You need a cable that does not care about the network.',
                intro: 'You plug the Console Cable into the server\'s serial port. Text crawls across your screen: "Kernel panic - not syncing." The Lich turns. "So. You came the old way. Then prove you know what to do with it."',
                win: 'The Lich crumbles into a pile of stack traces. You power-cycle PROD-ORACLE-01 through the BMC and watch the console. POST... GRUB... systemd... login prompt. Every LED turns green.'
            }
        }
    };

    W.register({
        id: 'classic',
        name: 'On-Call Classic',
        blurb: 'The original shift: ports, subnets, chmod, cron, RAID, routing and IPv6.',
        target: 'PROD-ORACLE-01',
        epilogue: 'Back home, an email from the Change Advisory Board is waiting: "This change had no approved ticket." You close the laptop and go to bed.',
        items: ITEMS,
        acts: ACTS,
        rooms: ROOMS,
        mystery: MYSTERY,
        ambient: AMBIENT
    });
});
