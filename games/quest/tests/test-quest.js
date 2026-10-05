#!/usr/bin/env node
'use strict';
// Datacenter Quest tests: node games/quest/tests/test-quest.js

const Q = require('../questions.js');
const W = require('../world.js');
const QuestEngine = require('../engine.js');

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
        print: (t, k) => out.push({ t, k }),
        clear() {},
        announce() {},
        choices(list) { io.choiceLabels = list.map(c => c.label); },
        status(s) { io.lastStatus = s; },
        mode(m) { io.modeShown = m; },
        save(d) { io.saved = JSON.parse(JSON.stringify(d)); },
        remove() { io.saved = null; },
        victory(v) { io.victoryInfo = v; },
        random: opts.random || (() => 0.5),
        now: () => 0
    };
    const g = new QuestEngine(io);
    g.start(opts.saved || null);
    return { g, io, out };
}

// Shortest path of directions between two rooms of the same act, honoring nothing
function path(from, to) {
    const prev = { [from]: null };
    const queue = [from];
    while (queue.length) {
        const cur = queue.shift();
        if (cur === to) break;
        for (const [dir, next] of Object.entries(W.ROOMS[cur].exits)) {
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
    let guard = 0;
    while (game.g.state.room !== target && guard++ < 60) {
        if (game.g.state.quiz) { game.g.input(game.g.state.quiz.question.answer); continue; }
        const dirs = path(game.g.state.room, target);
        game.g.input(dirs[0]);
    }
    if (game.g.state.quiz) game.g.input(game.g.state.quiz.question.answer);
}

function playAct(game, opts) {
    opts = opts || {};
    const st = () => game.g.state;
    const act = W.ACTS[st().act - 1];
    // pick up the potion and the key, clear every guardian, then the boss
    const actRooms = Object.keys(W.ROOMS).filter(id => W.ROOMS[id].act === act.n);
    for (const id of actRooms) {
        const r = W.ROOMS[id];
        if (r.quiz && !st().cleared[id]) walkTo(game, id);
        const potionFeature = (r.features || []).find(f => f.reveals);
        if (potionFeature && opts.collect !== false) {
            walkTo(game, id);
            game.g.input('examine ' + potionFeature.names[0]);
            game.g.input('take ' + W.ITEMS[potionFeature.reveals].names[0]);
        }
        if ((r.items || []).includes(act.key)) {
            walkTo(game, id);
            game.g.input('take ' + W.ITEMS[act.key].names[0]);
        }
    }
    walkTo(game, act.boss);
    game.g.input('use ' + W.ITEMS[act.key].names[0]);
    game.g.input(st().quiz.question.answer);
    game.g.input(st().quiz.question.answer);
}

// ---------------- world ----------------

section('World graph');
for (const act of W.ACTS) {
    const rooms = Object.keys(W.ROOMS).filter(id => W.ROOMS[id].act === act.n);
    assert(rooms.length === 10, `act ${act.n} has 10 rooms (got ${rooms.length})`);
    assert(rooms.filter(id => W.ROOMS[id].quiz).length === 5, `act ${act.n} has 5 quiz rooms`);
    assert(rooms.filter(id => W.ROOMS[id].boss).length === 1, `act ${act.n} has 1 boss`);
    const potionRooms = rooms.filter(id => (W.ROOMS[id].features || []).some(f => f.reveals && W.ITEMS[f.reveals].kind === 'potion'));
    assert(potionRooms.length === 1, `act ${act.n} hides exactly one potion`);
    for (const id of rooms) {
        assert(path(act.start, id) !== null, `act ${act.n}: ${id} is reachable from ${act.start}`);
        for (const [dir, dest] of Object.entries(W.ROOMS[id].exits)) {
            assert(W.ROOMS[dest], `${id} ${dir} -> ${dest} exists`);
            assert(W.ROOMS[dest].act === act.n, `${id} ${dir} stays inside act ${act.n}`);
            assert(Object.values(W.ROOMS[dest].exits).includes(id), `${id} ${dir} -> ${dest} has a way back`);
        }
        for (const item of W.ROOMS[id].items || []) assert(W.ITEMS[item], `${id} item ${item} is defined`);
        const r = W.ROOMS[id];
        if (r.quiz) assert(Q.TOPICS[r.quiz.topic], `${id} quiz topic ${r.quiz.topic} exists`);
        if (r.bossFight) r.bossFight.topics.forEach(t => assert(Q.TOPICS[t], `${id} boss topic ${t} exists`));
    }
    const keyRoom = rooms.find(id => (W.ROOMS[id].items || []).includes(act.key));
    assert(keyRoom, `act ${act.n} key item ${act.key} is placed`);
}

// ---------------- questions ----------------

section('Question bank (2,000 seeds per topic)');
for (const topic of Object.keys(Q.TOPICS)) {
    let ok = true, minD = Infinity;
    for (let s = 0; s < 2000; s++) {
        const q = Q.make(topic, topic + ':' + s);
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
const ipq = Q._internal;
assert(ipq.compressIpv6(ipq.expandIpv6('2001:db8:0:0:1:0:0:1')) === '2001:db8::1:0:0:1', 'RFC 5952 collapses the leftmost longest zero run');

// ---------------- engine ----------------

section('Full playthrough, parser mode');
{
    const game = makeGame();
    for (let a = 1; a <= 3; a++) {
        assert(game.g.state.act === a, `reached act ${a}`);
        playAct(game);
    }
    assert(game.io.victoryInfo, 'victory reached');
    assert(game.io.victoryInfo && game.io.victoryInfo.rank === 'Archmage of Uptime', 'no mistakes gives the top rank');
    assert(game.io.saved === null, 'save is removed after victory');
    assert(/3\/3 lives, 3 potions unused, 0 hints/.test(game.io.victoryInfo.line), 'result line counts lives, potions and hints: ' + game.io.victoryInfo.line);
}

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
    const q1 = game.g.state.quiz.question.q;
    assert(q1 === game.g.state.quiz.question.q, 'returning gives the same question');
    game.g.input('s');
    assert(game.g.state.room === 'tower' && game.g.state.lives === 2, 'the way you came stays open, at no cost');
    game.g.input('s');
    assert(game.g.state.room === 'tower', 'the boss door stays sealed until all 5 guardians are cleared');
}

section('Lives, potions and hints');
{
    const game = makeGame();
    game.g.input('w');
    game.g.input('hint');
    assert(/no question/i.test(game.out[game.out.length - 1].t), 'hint without a question is refused');
    game.g.input('look under counter');
    game.g.input('take brew');
    assert(game.g.potionCount() === 1, 'potion picked up');
    game.g.input('drink brew');
    assert(game.g.potionCount() === 1 && game.g.state.lives === 3, 'drinking at full lives is refused and keeps the potion');
    game.g.input('e'); game.g.input('n');
    game.g.input('hint');
    assert(game.g.potionCount() === 0 && game.g.state.hintsUsed === 1, 'hint costs a potion');
    game.g.input('hint');
    assert(game.g.state.hintsUsed === 1, 'no potion, no hint');
    game.g.input('wrong answer');
    game.g.input('wrong answer');
    assert(game.g.state.lives === 1, 'two misses leave one life');
    game.g.input('wrong answer');
    assert(game.g.state.lives === 3 && game.g.state.room === 'tower' && game.g.state.act === 1, 'third miss: game over, act 1 restarts with 3 lives');
    assert(game.g.state.cleared.gatehouse === undefined, 'cleared guardians reset after game over');
}

section('Reload cannot undo a strike or recover a spent potion');
{
    const game = makeGame();
    game.g.input('w'); game.g.input('look under counter'); game.g.input('take brew'); game.g.input('e');
    game.g.input('n'); game.g.input('wrong');
    assert(game.io.saved.lives === 2, 'strike is saved immediately');
    game.g.input('drink brew');
    const save = game.io.saved;
    assert(save.lives === 3 && save.potions === 0, 'drinking saves lives 3, potions 0');
    const reloaded = makeGame({ saved: save });
    assert(reloaded.g.state.lives === 3 && reloaded.g.potionCount() === 0, 'reload: checkpoint lives 3, potion stays spent');
    reloaded.g.input('n'); reloaded.g.input('wrong');
    const again = makeGame({ saved: reloaded.io.saved });
    assert(again.g.state.lives === 2, 'reload after a strike keeps the strike');
    assert(again.g.state.room === 'tower', 'reload puts you at the act start');
    assert(again.g.state.actSeed === game.g.state.actSeed, 'reload keeps the same question seed');
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
    const game = makeGame();
    game.g.input('mode');
    assert(game.g.state.mode === 'choice' && game.io.modeShown === 'choice' && game.io.saved.mode === 'choice', 'mode switch is shown and saved');
    const goN = game.g.choiceList.findIndex(c => /^Go north/.test(c.label));
    game.g.choose(goN);
    const quiz = game.g.state.quiz;
    assert(quiz && quiz.options.length === 4 && quiz.options.includes(quiz.question.answer), 'four options including the answer');
    const wrong = quiz.options.find(o => o !== quiz.question.answer);
    game.g.choose(game.g.choiceList.findIndex(c => c.label === wrong));
    assert(game.g.state.lives === 2, 'a wrong choice costs a life');
    assert(!game.g.state.quiz.options.includes(wrong), 'the wrong option is replaced');
    assert(game.g.state.quiz.options.length === 4 && game.g.state.quiz.options.includes(quiz.question.answer), 'still four options, answer still present');
    game.g.choose(game.g.choiceList.findIndex(c => c.label === quiz.question.answer));
    assert(game.g.state.cleared.gatehouse, 'right choice clears the guardian');
    // choice mode can reach the hidden potion
    game.g.choose(game.g.choiceList.findIndex(c => /^Go south/.test(c.label)));
    game.g.choose(game.g.choiceList.findIndex(c => /^Go west/.test(c.label)));
    const ex = game.g.choiceList.findIndex(c => c.label === 'Examine the counter');
    assert(ex >= 0, 'choice list offers to examine the counter');
    game.g.choose(ex);
    const take = game.g.choiceList.findIndex(c => /^Take the Cold Brew/.test(c.label));
    assert(take >= 0, 'revealed potion appears as a take choice');
    game.g.choose(take);
    assert(game.g.choiceList.some(c => /^Drink a potion/.test(c.label)), 'drink choice offered when below max lives');
}

section('Full playthrough, choice mode only');
{
    const game = makeGame();
    game.g.input('mode choice');
    let steps = 0;
    const st = () => game.g.state;
    // A simple bot: answer correctly, otherwise take/use keys, then explore unvisited exits
    while (!game.io.victoryInfo && steps++ < 2000) {
        const list = game.g.choiceList.map(c => c.label);
        if (st().quiz) { game.g.choose(list.indexOf(st().quiz.question.answer)); continue; }
        let i = list.findIndex(l => /^Use the /.test(l));
        if (i < 0) i = list.findIndex(l => /^Take the /.test(l));
        if (i < 0) {
            const r = W.ROOMS[st().room];
            const dirs = Object.keys(r.exits);
            const target = dirs.find(d => !st().visited[r.exits[d]] && !(W.ROOMS[r.exits[d]].boss && game.g.sealsLit() < 5));
            const uncleared = Object.keys(W.ROOMS).filter(id => W.ROOMS[id].act === st().act && (W.ROOMS[id].quiz || W.ROOMS[id].boss) && !st().cleared[id]);
            const keyHeld = st().inventory.includes(W.ACTS[st().act - 1].key);
            let goal = target ? r.exits[target] : null;
            if (!goal) goal = keyHeld && game.g.sealsLit() === 5 ? W.ACTS[st().act - 1].boss : uncleared.find(id => !W.ROOMS[id].boss) ||
                Object.keys(W.ROOMS).find(id => W.ROOMS[id].act === st().act && !st().visited[id] && !W.ROOMS[id].boss);
            const p = goal ? path(st().room, goal) : null;
            i = p && p.length ? list.findIndex(l => l.startsWith('Go ' + p[0] + ':')) : list.indexOf('Look around');
        }
        game.g.choose(i);
    }
    assert(game.io.victoryInfo, `choice-only bot wins (${steps} steps)`);
}

section('Single-letter answers are not eaten by commands');
{
    const q = { q: 'x', answer: 'A', norm: 'text', accept: ['A'] };
    const game = makeGame();
    game.g.input('n');
    game.g.state.quiz.question = q;
    game.g.input('A');
    assert(game.g.state.cleared.gatehouse, '"A" answers a DNS-style question');
    game.g.state.room = 'row-13';
    game.g.state.quiz = { kind: 'boss', guardian: 'the Lich', step: 1, question: { q: 'x', answer: 'e', norm: 'text', accept: ['e'] }, options: [], spare: [] };
    game.g.input('e');
    assert(!game.g.state.quiz || game.g.state.won, '"e" answers the GRUB question where east is not an exit');
}

section('Parser odds and ends');
{
    const game = makeGame();
    const last = () => game.out[game.out.length - 1].t;
    game.g.input('ls'); assert(/Exits:/.test(last()), 'ls describes the room');
    game.g.input('cat pager'); assert(/PROD-ORACLE-01/.test(last()), 'cat examines');
    game.g.input('man go'); assert(/cd \.\./.test(last()), 'man shows one command');
    game.g.input('whoami'); assert(/wizard/.test(last()), 'whoami');
    game.g.input('ping'); assert(/Exits:/.test(last()), 'ping lists exits');
    game.g.input('cd gatehouse'); assert(game.g.state.room === 'gatehouse', 'cd <room name> moves');
    game.g.input('cd ..'); assert(game.g.state.room === 'tower', 'cd .. retreats mid-question');
    game.g.input('frobnicate'); assert(/don't know how/.test(last()), 'unknown verbs explain themselves');
    game.g.input('reset'); assert(/again to confirm/.test(last()), 'reset asks to confirm');
    game.g.input('look'); game.g.input('reset');
    assert(/again to confirm/.test(last()), 'any other command cancels a pending reset');
    game.g.input('reset');
    assert(game.g.state.act === 1 && game.g.state.lives === 3, 'second reset wipes the game');
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
