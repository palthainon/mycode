#!/usr/bin/env node
'use strict';
// Datacenter Quest tests: node games/quest/tests/test-quest.js
// Every file in games/quest/quests/ is loaded and checked automatically.
// QUEST=<id> node games/quest/tests/test-quest.js loads only classic + that quest.

const fs = require('fs');
const path = require('path');
const Q = require('../questions.js');
const W = require('../world.js');
const QuestEngine = require('../engine.js');

const questDir = path.join(__dirname, '..', 'quests');
fs.readdirSync(questDir).filter(f => f.endsWith('.js')).sort()
    .filter(f => !process.env.QUEST || f === 'classic.js' || f === process.env.QUEST + '.js')
    .forEach(f => require(path.join(questDir, f)));
const QUEST_IDS = Object.keys(W.QUESTS);
const CHAR_IDS = Object.keys(W.CHARACTERS);

let passed = 0;
let failed = 0;

function assert(condition, msg) {
    if (condition) {
        passed++;
    } else {
        console.log('  ✗ FAIL: ' + msg);
        failed++;
    }
}

function section(name) {
    console.log('\n' + name);
}

// ---------------- harness ----------------

function makeGame(opts) {
    opts = opts || {};
    const out = [];
    const io = {
        saved: opts.saved || null,
        victoryInfo: null,
        setupShown: 0,
        print: (t, k) => out.push({ t, k }),
        clear() {},
        announce() {},
        choices(list) { io.choiceLabels = list.map(c => c.label); },
        status(s) { io.lastStatus = s; },
        mode(m) { io.modeShown = m; },
        save(d) { io.saved = JSON.parse(JSON.stringify(d)); },
        remove() { io.saved = null; },
        setup() { io.setupShown++; },
        victory(v) { io.victoryInfo = v; },
        random: opts.random || (() => 0.5),
        now: () => 0
    };
    const g = new QuestEngine(io);
    if (opts.saved) g.start(opts.saved);
    else g.newGame({ quest: opts.quest || 'classic', character: opts.character || 'wizard', mode: opts.mode });
    return { g, io, out };
}

const last = game => game.out[game.out.length - 1].t;

// Shortest path of directions between two rooms
function pathIn(rooms, from, to) {
    const prev = { [from]: null };
    const queue = [from];
    while (queue.length) {
        const cur = queue.shift();
        if (cur === to) break;
        for (const [dir, next] of Object.entries(rooms[cur].exits)) {
            if (!(next in prev)) { prev[next] = [cur, dir]; queue.push(next); }
        }
    }
    if (!(to in prev)) return null;
    const dirs = [];
    for (let n = to; prev[n]; n = prev[n][0]) dirs.unshift(prev[n][1]);
    return dirs;
}

// Walk to a room, answering any guardian on the way correctly
function walkTo(game, target) {
    const rooms = game.g.world.rooms;
    let guard = 0;
    while (game.g.state.room !== target && guard++ < 80) {
        if (game.g.state.quiz) { game.g.input(game.g.state.quiz.question.answer); continue; }
        game.g.input(pathIn(rooms, game.g.state.room, target)[0]);
    }
    if (game.g.state.quiz) game.g.input(game.g.state.quiz.question.answer);
}

function playAct(game, opts) {
    opts = opts || {};
    const st = () => game.g.state;
    const world = game.g.world;
    const act = world.acts[st().act - 1];
    const actRooms = Object.keys(world.rooms).filter(id => world.rooms[id].act === act.n);
    for (const id of actRooms) {
        const r = world.rooms[id];
        if (r.quiz && !st().cleared[id]) walkTo(game, id);
        const potionFeature = (r.features || []).find(f => f.reveals && world.items[f.reveals].kind === 'potion');
        if (potionFeature && opts.collect !== false) {
            walkTo(game, id);
            game.g.input('examine ' + potionFeature.names[0]);
            game.g.input('take ' + world.items[potionFeature.reveals].names[0]);
        }
        if ((r.items || []).includes(act.key)) {
            walkTo(game, id);
            game.g.input('take ' + world.items[act.key].names[0]);
        }
    }
    walkTo(game, act.boss);
    game.g.input('use ' + world.items[act.key].names[0]);
    game.g.input(st().quiz.question.answer);
    game.g.input(st().quiz.question.answer);
}

// A bot that only ever presses choice buttons
function choiceBot(game) {
    const st = () => game.g.state;
    let steps = 0;
    while (!game.io.victoryInfo && steps++ < 3000) {
        const world = game.g.world;
        const list = game.g.choiceList.map(c => c.label);
        if (st().quiz) { game.g.choose(list.indexOf(st().quiz.question.answer)); continue; }
        let i = list.findIndex(l => /^Use the /.test(l));
        if (i < 0) i = list.findIndex(l => /^Take the /.test(l));
        if (i < 0) {
            const r = world.rooms[st().room];
            const target = Object.keys(r.exits).find(d => !st().visited[r.exits[d]] && !(world.rooms[r.exits[d]].boss && game.g.sealsLit() < 5));
            const act = world.acts[st().act - 1];
            const uncleared = Object.keys(world.rooms).filter(id => world.rooms[id].act === st().act && world.rooms[id].quiz && !st().cleared[id]);
            let goal = target ? r.exits[target] : null;
            if (!goal) goal = st().inventory.includes(act.key) && game.g.sealsLit() === 5 ? act.boss : uncleared[0] ||
                Object.keys(world.rooms).find(id => world.rooms[id].act === st().act && !st().visited[id] && !world.rooms[id].boss);
            const p = goal ? pathIn(world.rooms, st().room, goal) : null;
            i = p && p.length ? list.findIndex(l => l.startsWith('Go ' + p[0] + ':')) : list.indexOf('Look around');
        }
        game.g.choose(i);
    }
    return steps;
}

// ---------------- structure ----------------

section(`Quests loaded: ${QUEST_IDS.join(', ')}`);
assert(QUEST_IDS.includes('classic'), 'classic quest is registered');
for (const id of QUEST_IDS) {
    const quest = W.QUESTS[id];
    const errs = W.validate(quest);
    errs.forEach(e => console.log(`    ${id}: ${e}`));
    assert(errs.length === 0, `${id}: passes world validation`);
    Object.values(quest.rooms).forEach(r => {
        if (r.quiz) assert(Q.TOPICS[r.quiz.topic], `${id}: quiz topic ${r.quiz.topic} exists`);
        if (r.bossFight) r.bossFight.topics.forEach(t => assert(Q.TOPICS[t], `${id}: boss topic ${t} exists`));
    });
}

// ---------------- questions ----------------

section(`Question bank (${Object.keys(Q.TOPICS).length} topics, 1,500 seeds each)`);
for (const topic of Object.keys(Q.TOPICS)) {
    let ok = true, minD = Infinity;
    for (let s = 0; s < 1500; s++) {
        let q;
        try { q = Q.make(topic, topic + ':' + s); } catch (e) { ok = false; console.log('    threw:', topic, e.message); break; }
        if (!q.q || !q.answer || !Q.NORMALIZERS[q.norm]) { ok = false; console.log('    malformed:', topic, JSON.stringify(q)); break; }
        if (!Q.isCorrect(q, q.answer)) { ok = false; console.log('    answer rejected:', topic, q.q, q.answer); break; }
        if (!q.accept.every(a => Q.isCorrect(q, a))) { ok = false; console.log('    accept rejected:', topic, q.q, q.accept); break; }
        const bad = q.distractors.find(d => Q.isCorrect(q, d));
        if (bad) { ok = false; console.log('    distractor accepted:', topic, q.q, bad); break; }
        if (!q.hint) { ok = false; console.log('    no hint:', topic, q.q); break; }
        minD = Math.min(minD, q.distractors.length);
    }
    assert(ok, `${topic}: answers accepted, distractors rejected, hints present`);
    assert(minD >= 5, `${topic}: at least 5 distractors (min ${minD})`);
}
const sameA = Q.make('subnet', 'seed-1'), sameB = Q.make('subnet', 'seed-1');
assert(sameA.q === sameB.q && sameA.answer === sameB.answer, 'same seed gives the same question');

section('Normalizers');
const N = Q.NORMALIZERS;
assert(N.cidr('255.255.255.192') === '/26' && N.cidr('26') === '/26' && N.cidr('/26') === '/26', 'cidr accepts mask, bare and slash forms');
assert(N.cidr('255.0.255.0') === null, 'cidr rejects a non-contiguous mask');
assert(N.cidr('/64') === '/64', 'cidr accepts IPv6 prefix lengths');
assert(N.hex('0xC0A80101') === N.hex('c0a80101') && N.hex('c0.a8.01.01') === 'c0a80101', 'hex ignores 0x, case and dots');
assert(N.octal('0750') === '750' && N.octal('758') === null, 'octal accepts a leading 0, rejects 8');
assert(N.symbolic('-rwxr-x---') === 'rwxr-x---', 'symbolic accepts a leading dash');
assert(N.osi('layer 2') === '2' && N.osi('L3') === '3' && N.osi('Data Link') === '2' && N.osi('Layer 7 (Application)') === '7', 'osi accepts numbers, names and labels');
assert(N.time('2:30 pm') === '14:30' && N.time('14:30') === '14:30' && N.time('25:00') === null, 'time handles 12/24-hour');
assert(N.ipv6short('2001:db8::1') === '2001:db8::1' && N.ipv6short('2001:0db8::1') === null, 'ipv6short needs the shortest form');
assert(N.ipv6full('2001:0db8:0000:0000:0000:0000:0000:0001') !== null && N.ipv6full('2001:db8::1') === null, 'ipv6full needs all 8 groups');
assert(N.ipv4('010.001.002.003') === '10.1.2.3' && N.ipv4('256.1.1.1') === null, 'ipv4 strips leading zeros, rejects 256');
assert(N.int('1,024 hosts') === '1024', 'int ignores commas and units');
assert(N.code('[1, "a"]') === N.code("[1,'a']") && N.code('True') !== N.code('true') && N.code('`len(x)`') === 'len(x)', 'code: whitespace/quotes/backticks ignored, case kept');
const U = Q.util;
assert(U.compressIpv6(U.expandIpv6('2001:db8:0:0:1:0:0:1')) === '2001:db8::1:0:0:1', 'RFC 5952 collapses the leftmost longest zero run');

// ---------------- every quest x every character ----------------

section('Full playthrough of every quest with every character (parser)');
for (const quest of QUEST_IDS) {
    for (const character of CHAR_IDS) {
        const game = makeGame({ quest, character });
        for (let a = 1; a <= 3 && !game.io.victoryInfo; a++) playAct(game);
        const v = game.io.victoryInfo;
        assert(v, `${quest} / ${character}: victory reached`);
        assert(v && v.rank === W.CHARACTERS[character].ranks[0], `${quest} / ${character}: no mistakes gives the top rank`);
        assert(game.io.saved === null, `${quest} / ${character}: save removed after victory`);
    }
}

section('Full playthrough of every quest, choice mode only');
for (const quest of QUEST_IDS) {
    const game = makeGame({ quest, character: 'knight', mode: 'choice' });
    const steps = choiceBot(game);
    assert(game.io.victoryInfo, `${quest}: choice-only bot wins (${steps} steps)`);
}

// ---------------- setup and saves ----------------

section('Setup, saves and migration');
{
    const io = { setupShown: 0, setup() { io.setupShown++; }, choices() {}, print() {}, clear() {}, status() {}, mode() {}, save() {}, remove() {}, announce() {} };
    const g = new QuestEngine(io);
    assert(g.start(null) === false && io.setupShown === 1 && g.state === null, 'no save: picker is shown, nothing runs');
    assert(g.start({ v: 2, quest: 'no-such-quest', character: 'wizard', checkpoint: { act: 1 } }) === false, 'save for an unknown quest falls back to the picker');
    g.input('look');
    assert(g.state === null, 'input is ignored while the picker is up');

    const v1 = { v: 1, mode: 'choice', checkpoint: { act: 2, lives: 2, inventory: [], actSeed: 7, hintsUsed: 1, elapsedMs: 0 }, lives: 2, potions: 0, hintsUsed: 1 };
    const m = makeGame({ saved: v1 });
    assert(m.g.world.id === 'classic' && m.g.char.name === 'Wizard' && m.g.state.act === 2 && m.g.state.lives === 2, 'a v1 save resumes as classic / wizard');
    assert(m.io.saved.v === 2 && m.io.saved.quest === 'classic', 'the resumed save is rewritten as v2');

    const game = makeGame({ quest: 'classic', character: 'rogue' });
    assert(game.io.saved.quest === 'classic' && game.io.saved.character === 'rogue', 'save records quest and character');
    game.g.input('reset');
    game.g.input('reset');
    assert(game.g.state === null && game.io.setupShown === 1 && game.io.saved === null, 'reset twice wipes the save and shows the picker');
}

// ---------------- classic-specific behavior ----------------

section('Guardians block the way forward');
{
    const game = makeGame();
    game.g.input('n');
    assert(game.g.state.quiz, 'entering the gatehouse opens a question');
    game.g.input('n');
    assert(game.g.state.room === 'gatehouse' && game.g.state.lives === 3, 'moving past a guardian is blocked, at no cost');
    game.g.input('9999');
    assert(game.g.state.lives === 2, 'a wrong typed answer costs a life');
    game.g.input('back');
    assert(game.g.state.room === 'tower' && !game.g.state.quiz, '"back" retreats without penalty');
    game.g.input('n');
    game.g.input('s');
    assert(game.g.state.room === 'tower' && game.g.state.lives === 2, 'the way you came stays open, at no cost');
    game.g.input('s');
    assert(game.g.state.room === 'tower', 'the boss door stays sealed until all 5 guardians are cleared');
}

section('Lives, potions and hints (knight)');
{
    const game = makeGame({ character: 'knight' });
    assert(game.g.state.lives === 4, 'knight starts with 4 lives');
    game.g.input('w');
    game.g.input('hint');
    assert(/no question/i.test(last(game)), 'hint without a question is refused');
    game.g.input('look under counter');
    game.g.input('take brew');
    assert(game.g.potionCount() === 1, 'potion picked up');
    game.g.input('drink brew');
    assert(game.g.potionCount() === 1 && game.g.state.lives === 4, 'drinking at full lives is refused and keeps the potion');
    game.g.input('e'); game.g.input('n');
    game.g.input('hint');
    assert(game.g.potionCount() === 0 && game.g.state.hintsUsed === 1, 'hint costs a potion');
    game.g.input('hint');
    assert(game.g.state.hintsUsed === 1, 'no potion, no hint');
    game.g.input('sneak');
    assert(game.g.state.quiz && /quiet as a dropped server rack/.test(last(game)), 'knights cannot sneak');
    for (let i = 0; i < 3; i++) game.g.input('wrong answer');
    assert(game.g.state.lives === 1, 'three misses leave the knight one life');
    game.g.input('wrong answer');
    assert(game.g.state.lives === 4 && game.g.state.room === 'tower', 'fourth miss: game over, act restarts with 4 lives');
}

section('Wizard: one free hint per act');
{
    const game = makeGame({ character: 'wizard' });
    game.g.input('n');
    game.g.input('hint');
    assert(game.g.state.freeHints === 0 && game.g.state.hintsUsed === 1 && /spellbook/.test(last(game)), 'first hint is free');
    game.g.input('hint');
    assert(game.g.state.hintsUsed === 1 && /no potion/.test(last(game)), 'second hint needs a potion');
    const reloaded = makeGame({ saved: game.io.saved });
    assert(reloaded.g.state.freeHints === 0, 'reload does not refund the free hint');
    playAct(game);
    assert(game.g.state.act === 2 && game.g.state.freeHints === 1, 'free hint refreshes in the next act');
}

section('Rogue: sneak past one guardian per act');
{
    const game = makeGame({ character: 'rogue' });
    game.g.input('n');
    game.g.input('sneak');
    assert(game.g.state.cleared.gatehouse && !game.g.state.quiz && game.g.state.sneaks === 0, 'sneak clears the guardian');
    assert(game.g.sealsLit() === 1, 'a sneaked guardian lights its rune');
    game.g.input('s'); game.g.input('e');
    game.g.input('sneak');
    assert(game.g.state.quiz && !game.g.state.cleared.bridge, 'second sneak in the same act is refused');
    const reloaded = makeGame({ saved: game.io.saved });
    assert(reloaded.g.state.sneaks === 0, 'reload does not refund the sneak');
    game.g.input('back');
    playAct(game);
    assert(game.g.state.act === 2 && game.g.state.sneaks === 1, 'sneak refreshes in the next act');
    // bosses can't be sneaked
    const g2 = makeGame({ character: 'rogue' });
    playActUntilBoss(g2);
    g2.g.input('sneak');
    assert(g2.g.state.quiz && g2.g.state.quiz.kind === 'boss' && /notices everything/.test(last(g2)), 'bosses cannot be sneaked past');
}

function playActUntilBoss(game) {
    const world = game.g.world;
    const act = world.acts[game.g.state.act - 1];
    Object.keys(world.rooms).filter(id => world.rooms[id].act === act.n && world.rooms[id].quiz).forEach(id => walkTo(game, id));
    const keyRoom = Object.keys(world.rooms).find(id => (world.rooms[id].items || []).includes(act.key));
    walkTo(game, keyRoom);
    game.g.input('take ' + world.items[act.key].names[0]);
    walkTo(game, act.boss);
    game.g.input('use ' + world.items[act.key].names[0]);
}

section('Reload cannot undo a strike or recover a spent potion');
{
    const game = makeGame({ character: 'knight' });
    game.g.input('w'); game.g.input('look under counter'); game.g.input('take brew'); game.g.input('e');
    game.g.input('n'); game.g.input('wrong');
    assert(game.io.saved.lives === 3, 'strike is saved immediately');
    game.g.input('drink brew');
    const save = game.io.saved;
    assert(save.lives === 4 && save.potions === 0, 'drinking saves lives 4, potions 0');
    const reloaded = makeGame({ saved: save });
    assert(reloaded.g.state.lives === 4 && reloaded.g.potionCount() === 0, 'reload: checkpoint lives, potion stays spent');
    reloaded.g.input('n'); reloaded.g.input('wrong');
    const again = makeGame({ saved: reloaded.io.saved });
    assert(again.g.state.lives === 3 && again.g.state.room === 'tower', 'reload after a strike keeps the strike and returns to the act start');
    assert(again.g.state.actSeed === game.g.state.actSeed, 'reload keeps the same question seed');
    assert(again.g.char.name === 'Knight', 'reload keeps the character');
}

section('Act checkpoint carries into act 2');
{
    const game = makeGame();
    playAct(game, { collect: false });
    assert(game.g.state.act === 2 && game.io.saved.checkpoint.act === 2, 'checkpoint written at act 2');
    const reloaded = makeGame({ saved: game.io.saved });
    assert(reloaded.g.state.act === 2 && reloaded.g.state.room === 'square', 'reload resumes at the act 2 start');
    assert(!reloaded.g.state.inventory.includes('lantern'), 'the act 1 key item is spent');
}

section('Choice mode');
{
    const game = makeGame({ character: 'knight' });
    game.g.input('mode');
    assert(game.g.state.mode === 'choice' && game.io.modeShown === 'choice' && game.io.saved.mode === 'choice', 'mode switch is shown and saved');
    game.g.choose(game.g.choiceList.findIndex(c => /^Go north/.test(c.label)));
    const quiz = game.g.state.quiz;
    assert(quiz && quiz.options.length === 4 && quiz.options.includes(quiz.question.answer), 'four options including the answer');
    const wrong = quiz.options.find(o => o !== quiz.question.answer);
    game.g.choose(game.g.choiceList.findIndex(c => c.label === wrong));
    assert(game.g.state.lives === 3, 'a wrong choice costs a life');
    assert(!game.g.state.quiz.options.includes(wrong), 'the wrong option is replaced');
    assert(game.g.state.quiz.options.length === 4 && game.g.state.quiz.options.includes(quiz.question.answer), 'still four options, answer still present');
    game.g.choose(game.g.choiceList.findIndex(c => c.label === quiz.question.answer));
    assert(game.g.state.cleared.gatehouse, 'right choice clears the guardian');
    game.g.choose(game.g.choiceList.findIndex(c => /^Go south/.test(c.label)));
    game.g.choose(game.g.choiceList.findIndex(c => /^Go west/.test(c.label)));
    const ex = game.g.choiceList.findIndex(c => c.label === 'Examine the counter');
    assert(ex >= 0, 'choice list offers to examine the counter');
    game.g.choose(ex);
    const take = game.g.choiceList.findIndex(c => /^Take the Cold Brew/.test(c.label));
    assert(take >= 0, 'revealed potion appears as a take choice');
    game.g.choose(take);
    assert(game.g.choiceList.some(c => /^Drink a potion/.test(c.label)), 'drink choice offered when below max lives');
    const rogue = makeGame({ character: 'rogue', mode: 'choice' });
    rogue.g.choose(rogue.g.choiceList.findIndex(c => /^Go north/.test(c.label)));
    assert(rogue.g.choiceList.some(c => /^Sneak past/.test(c.label)), 'rogue gets a sneak choice');
    const wiz = makeGame({ character: 'wizard', mode: 'choice' });
    wiz.g.choose(wiz.g.choiceList.findIndex(c => /^Go north/.test(c.label)));
    assert(wiz.g.choiceList.some(c => c.label === 'Recall a hint (free)'), 'wizard gets a free-hint choice');
}

section('Single-letter answers are not eaten by commands');
{
    const game = makeGame();
    game.g.input('n');
    game.g.state.quiz.question = { q: 'x', answer: 'A', norm: 'text', accept: ['A'] };
    game.g.input('A');
    assert(game.g.state.cleared.gatehouse, '"A" answers a DNS-style question');
}

section('Parser odds and ends');
{
    const game = makeGame();
    game.g.input('ls'); assert(/Exits:/.test(last(game)), 'ls describes the room');
    game.g.input('cat desk'); assert(/cold/.test(last(game)), 'cat examines');
    game.g.input('man go'); assert(/cd \.\./.test(last(game)), 'man shows one command');
    game.g.input('whoami'); assert(/wizard/.test(last(game)), 'whoami names the character');
    game.g.input('ping'); assert(/Exits:/.test(last(game)), 'ping lists exits');
    game.g.input('cd gatehouse'); assert(game.g.state.room === 'gatehouse', 'cd <room name> moves');
    game.g.input('examine golem'); assert(/waits for your answer/.test(last(game)), 'examining the guardian by name works');
    game.g.input('cd ..'); assert(game.g.state.room === 'tower', 'cd .. retreats mid-question');
    game.g.input('frobnicate'); assert(/don't know how/.test(last(game)), 'unknown verbs explain themselves');
    game.g.input('reset'); assert(/again to confirm/.test(last(game)), 'reset asks to confirm');
    game.g.input('look'); game.g.input('reset');
    assert(/again to confirm/.test(last(game)), 'any other command cancels a pending reset');
}

section('Exploration: curios, clues, second looks, senses');
{
    const game = makeGame({ character: 'rogue' });
    const outText = () => game.out.map(o => o.t).join('\n');
    game.g.input('examine pager');
    assert(game.g.state.clues.includes('early-ack') && game.out.some(o => o.k === 'clue'), 'examining a clue feature notes the clue');
    assert(game.io.saved.clues.includes('early-ack'), 'a clue is saved the moment it is found');
    const before = game.g.state.clues.length;
    game.g.input('examine pager');
    assert(game.g.state.clues.length === before && /Neither does it/.test(last(game)), 'a second look shows the again text and does not re-count');
    game.g.input('examine books');
    assert(game.out.some(o => /hollow/.test(o.t)), 'character aside shows for the rogue');
    game.g.input('notes');
    assert(/nightowl/.test(last(game)) && /more things? out there/.test(last(game)), 'notes lists found clues and how many remain');
    game.g.input('listen');
    assert(/second pager/.test(last(game)), 'room listen text');
    game.g.input('smell');
    assert(/Solder/.test(last(game)), 'room smell text');
    game.g.input('dance');
    assert(game.out[game.out.length - 1].k === 'text' && !/don't know how/.test(last(game)), 'idle verbs answer');
    game.g.input('examine stairs');
    assert(/stairs/.test(last(game)) && !/You see no/.test(last(game)), 'nouns in the room text get a quip instead of "you see no"');
    game.g.input('examine spaceship');
    assert(/You see no "spaceship"/.test(last(game)), 'unknown nouns are still refused');
    game.g.input('kick spaceship');
    assert(/You see no "spaceship"/.test(last(game)), 'kicking something absent is refused');

    // curios
    game.g.input('w');
    game.g.input('examine box');
    game.g.input('take sfp');
    assert(game.g.state.found.includes('mystery-sfp') && /Curio 1\//.test(outText()), 'taking a curio counts it');
    assert(game.io.lastStatus.curios === 1 && game.io.lastStatus.curiosTotal >= 6, 'HUD status carries the curio tally');
    game.g.input('drop sfp'); game.g.input('take sfp');
    assert(game.g.state.found.length === 1, 're-taking a curio does not count twice');
    game.g.input('i');
    assert(/Curios: unlabelled SFP/.test(last(game)), 'inventory lists curios separately');
    game.g.input('use sfp on glass');
    assert(/Nothing happens, but you feel like you were thorough/.test(last(game)), 'use X on a feature without a reaction');
    game.g.input('use sfp on spaceship');
    assert(/You see no/.test(last(game)), 'use X on something absent');

    // reload keeps discoveries even though the checkpoint predates them
    const reloaded = makeGame({ saved: game.io.saved });
    assert(reloaded.g.state.clues.includes('early-ack') && reloaded.g.state.found.includes('mystery-sfp'), 'reload keeps clues and curios found since the checkpoint');
}
{
    // use X on Y reaction, and choice mode buttons
    const game = makeGame({ mode: 'choice' });
    assert(game.g.choiceList.some(c => c.label === 'Listen'), 'choice mode offers Listen when the room has a sound');
    game.g.choose(game.g.choiceList.findIndex(c => c.label === 'Listen'));
    assert(!game.g.choiceList.some(c => c.label === 'Listen'), 'Listen goes away once used');
    game.g.choose(game.g.choiceList.findIndex(c => c.label === 'Examine the pager'));
    assert(game.g.choiceList.some(c => c.label === 'Read your notes'), 'choice mode offers notes once a clue is found');
}
{
    // ambient lines: only when random allows, once each
    let r = 0.1;
    const game = makeGame({ random: () => r });
    game.g.input('w');
    assert(game.out.some(o => o.k === 'ambient'), 'ambient line plays when the roll is low');
    const n = game.out.filter(o => o.k === 'ambient').length;
    game.g.input('e'); game.g.input('w'); game.g.input('e');
    const lines = game.out.filter(o => o.k === 'ambient').map(o => o.t);
    assert(new Set(lines).size === lines.length && lines.length <= 2 && n === 1, 'each ambient line plays at most once per act');
    r = 0.9;
}
{
    // victory: tallies and the solved line when every clue is found
    const game = makeGame();
    game.g.state.clues = Object.keys(game.g.world.mystery.clues);
    playAct(game); playAct(game); playAct(game);
    const v = game.io.victoryInfo;
    assert(v && /curios \d+\/\d+, clues 5\/5 \(mystery solved\?\)/.test(v.line), 'victory line carries curio and clue tallies');
    assert(game.out.some(o => o.t === game.g.world.mystery.solved), 'all clues prints the solved epilogue');
    const partial = makeGame();
    playAct(partial); playAct(partial); playAct(partial);
    assert(partial.out.some(o => /never added up/.test(o.t)), 'missing clues get the "never added up" line');
}

section('Every quest: features and clues are reachable');
for (const id of QUEST_IDS) {
    const world = W.QUESTS[id];
    // examine every feature of every room by its first name and check it resolves to itself
    Object.entries(world.rooms).forEach(([rid, r]) => {
        (r.features || []).forEach(f => {
            const g = makeGame({ quest: id });
            g.g.state.room = rid;
            g.g.state.act = r.act;
            const hit = g.g.findFeature(f.names[0].split(' '));
            assert(hit === f, `${id}/${rid}: "examine ${f.names[0]}" finds its own feature`);
        });
    });
    const curios = Object.keys(world.items).filter(k => world.items[k].kind === 'curio');
    curios.forEach(c => {
        const holder = Object.entries(world.rooms).find(([, r]) => (r.items || []).includes(c));
        if (!holder) return;
        const g = makeGame({ quest: id });
        const hit = g.g.findItem(world.items[c].names[0].split(' '), (holder[1].items || []));
        assert(hit === c, `${id}: "take ${world.items[c].names[0]}" picks up ${c} in ${holder[0]}`);
    });
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
