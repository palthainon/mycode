/*
 * Datacenter Quest - game engine. No DOM access: everything visible goes through
 * the `io` object, so the same engine runs in the page and in the Node tests.
 *
 * io = {
 *   print(text, kind)        kind: cmd | title | text | quiz | good | bad | sys | act
 *   clear()
 *   announce(text, priority) screen-reader announcement ('polite' | 'assertive')
 *   choices(list)            [{label}] for choice mode; [] hides them
 *   status(info)             {act, actName, lives, potions, room}
 *   mode(mode)               'parser' | 'choice'
 *   save(data) / remove()    persistence (StorageUtils in the page)
 *   victory(info)            {rank, line}
 *   random(), now()          injectable for tests
 * }
 *
 * Saving: the act-start checkpoint holds position and inventory. Lives and potions
 * are also written the moment they drop, and a reload takes the lower value, so
 * reloading never undoes a strike or brings back a spent potion.
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./questions.js'), require('./world.js'));
    } else {
        root.QuestEngine = factory(root.QuestQuestions, root.QuestWorld);
    }
})(typeof self !== 'undefined' ? self : this, function (Q, W) {
    'use strict';

    const MAX_LIVES = 3;
    const SAVE_VERSION = 1;

    const DIRS = { n: 'north', s: 'south', e: 'east', w: 'west', north: 'north', south: 'south', east: 'east', west: 'west' };
    const FILLER = new Set(['the', 'a', 'an', 'at', 'to', 'into', 'under', 'behind', 'inside', 'in', 'up', 'around', 'my', 'some']);
    // During a quiz, input starting with anything else is treated as an answer
    const QUIZ_VERBS = new Set(['answer', 'hint', 'back', 'flee', 'retreat', 'run', 'look', 'l', 'ls', 'help', '?', 'man',
        'status', 'uptime', 'inventory', 'inv', 'i', 'mode', 'drink', 'quaff', 'whoami', 'sudo', 'clear', 'reset', 'question', 'repeat', 'use']);

    const HELP = [
        'Commands (shell aliases in brackets):',
        '  look [ls]                     describe the room again',
        '  go north / n / s / e / w [cd] move; "back" [cd ..] returns the way you came',
        '  examine <thing> [cat, less]   look closely; try "look under counter"',
        '  take <item> / drop <item>     pick things up, put them down',
        '  use <item> [on <target>]      use an item; drink <potion>',
        '  inventory [i]                 what you are carrying',
        '  answer <x>                    answer a guardian (or just type the answer)',
        '  hint                          trade one potion for a hint',
        '  status [uptime]               lives, potions, act',
        '  mode                          switch between typing and choice buttons',
        '  man <command>                 help for one command',
        '  clear, reset                  clear the screen; wipe your saved game'
    ].join('\n');

    const MAN = {
        look: 'look (ls): describe your surroundings. "look <thing>" works like examine.',
        go: 'go <direction> (cd): move north, south, east or west. n/s/e/w work alone. "back", "flee" or "cd .." returns the way you came, even mid-question.',
        examine: 'examine <thing> (x, cat, less, read): inspect something. Hidden things turn up when you look closely.',
        take: 'take <item> (get, grab): pick an item up. drop <item> puts it down.',
        use: 'use <item> [on <target>]: use an item. Key items open boss fights. Potions restore a life.',
        drink: 'drink <potion>: restore one life, up to 3.',
        inventory: 'inventory (i): list what you carry.',
        answer: 'answer <x>: answer the guardian blocking your way. While a question is open you can also type the answer on its own.',
        hint: 'hint: costs one potion. Gives a nudge, not the answer.',
        status: 'status (uptime): lives, potions and where you are.',
        mode: 'mode [parser|choice]: switch between typing commands and picking numbered choices.',
        reset: 'reset: wipe your saved game and start over. Asks for confirmation.',
        sudo: 'sudo: you are not in the sudoers file. This incident will be reported.'
    };

    function articled(name) {
        return /^[A-Z]/.test(name) ? name : (/^[aeiou]/i.test(name) ? 'an ' : 'a ') + name;
    }

    function QuestEngine(io) {
        this.io = io;
        this.random = io.random || Math.random;
        this.now = io.now || (() => Date.now());
        this.state = null;
        this.pendingReset = false;
        this.choiceList = [];
    }

    const P = QuestEngine.prototype;

    // ---------------- lifecycle ----------------

    P.start = function (saved) {
        const s = saved && saved.v === SAVE_VERSION && saved.checkpoint ? saved : null;
        if (s) {
            const cp = s.checkpoint;
            this.newAct(cp.act, cp, { quiet: true });
            const st = this.state;
            st.lives = Math.min(cp.lives, typeof s.lives === 'number' ? s.lives : cp.lives);
            const potionCap = Math.min(this.potionCount(), typeof s.potions === 'number' ? s.potions : MAX_LIVES);
            while (this.potionCount() > potionCap) this.removePotion();
            st.hintsUsed = Math.max(cp.hintsUsed || 0, s.hintsUsed || 0);
            st.mode = s.mode === 'choice' ? 'choice' : 'parser';
            this.io.mode(st.mode);
            this.saveLive();
            if (st.lives <= 0) {
                this.gameOver();
                this.refresh();
                return;
            }
            this.io.print(`Resuming at the start of Act ${cp.act}. Lives and spent potions carry over from where you left off.`, 'sys');
            this.io.print(W.ACTS[cp.act - 1].intro, 'act');
            this.describe();
        } else {
            this.newAct(1, null, { quiet: false });
        }
        this.refresh();
    };

    // Begin an act. `from` is a checkpoint to restore, or null for a fresh start.
    P.newAct = function (n, from, opts) {
        const prev = this.state;
        const act = W.ACTS[n - 1];
        const roomItems = {};
        Object.keys(W.ROOMS).forEach(id => {
            if (W.ROOMS[id].act === n) roomItems[id] = (W.ROOMS[id].items || []).slice();
        });
        this.state = {
            act: n,
            room: act.start,
            prevRoom: null,
            lives: from ? from.lives : (prev ? prev.lives : MAX_LIVES),
            inventory: from ? from.inventory.slice() : (prev ? prev.inventory.slice() : []),
            hintsUsed: from ? from.hintsUsed || 0 : (prev ? prev.hintsUsed : 0),
            elapsedMs: from ? from.elapsedMs || 0 : (prev ? this.elapsed() : 0),
            sessionStart: this.now(),
            actSeed: from && from.actSeed ? from.actSeed : Math.floor(this.random() * 2 ** 31),
            mode: prev ? prev.mode : 'parser',
            roomItems,
            revealed: {},
            cleared: {},
            visited: {},
            quiz: null,
            over: false
        };
        this.state.visited[act.start] = true;
        this.saveCheckpoint();
        if (!opts || !opts.quiet) {
            this.io.print(act.intro, 'act');
            this.describe();
        }
    };

    P.elapsed = function () {
        const st = this.state;
        return st ? st.elapsedMs + (this.now() - st.sessionStart) : 0;
    };

    P.checkpointData = function () {
        const st = this.state;
        return { act: st.act, lives: st.lives, inventory: st.inventory.slice(), actSeed: st.actSeed, hintsUsed: st.hintsUsed, elapsedMs: this.elapsed() };
    };

    P.saveCheckpoint = function () {
        this.checkpoint = this.checkpointData();
        this.saveLive();
    };

    // Lives, potions and hints are written as soon as they change
    P.saveLive = function () {
        const st = this.state;
        if (!st || st.won) return;
        this.io.save({ v: SAVE_VERSION, mode: st.mode, checkpoint: this.checkpoint, lives: st.lives, potions: this.potionCount(), hintsUsed: st.hintsUsed });
    };

    // ---------------- helpers ----------------

    P.room = function () { return W.ROOMS[this.state.room]; };

    P.potionCount = function () {
        return this.state.inventory.filter(id => W.ITEMS[id].kind === 'potion').length;
    };

    P.removePotion = function () {
        const inv = this.state.inventory;
        const i = inv.findIndex(id => W.ITEMS[id].kind === 'potion');
        if (i >= 0) return inv.splice(i, 1)[0];
        return null;
    };

    P.actQuizRooms = function () {
        const n = this.state.act;
        return Object.keys(W.ROOMS).filter(id => W.ROOMS[id].act === n && W.ROOMS[id].quiz);
    };

    P.sealsLit = function () {
        return this.actQuizRooms().filter(id => this.state.cleared[id]).length;
    };

    P.findItem = function (words, ids) {
        const phrase = words.join(' ');
        if (!phrase) return null;
        return ids.find(id => W.ITEMS[id].names.includes(phrase)) ||
            ids.find(id => W.ITEMS[id].names.some(n => n.split(' ').includes(words[words.length - 1]))) || null;
    };

    P.findFeature = function (words) {
        const phrase = words.join(' ');
        const feats = this.room().features || [];
        return feats.find(f => f.names.includes(phrase)) ||
            feats.find(f => f.names.some(n => n.split(' ').includes(words[words.length - 1]))) || null;
    };

    P.statusLine = function () {
        const st = this.state;
        const p = this.potionCount();
        return `Act ${st.act}: ${W.ACTS[st.act - 1].name} | Lives ${st.lives}/${MAX_LIVES} | Potions ${p} | ${this.room().name}`;
    };

    P.refresh = function () {
        const st = this.state;
        this.io.status({ act: st.act, actName: W.ACTS[st.act - 1].name, lives: st.lives, maxLives: MAX_LIVES, potions: this.potionCount(), room: this.room().name, over: !!st.won });
        this.choiceList = this.buildChoices();
        this.io.choices(this.choiceList.map(c => ({ label: c.label })));
    };

    // ---------------- describing ----------------

    P.describe = function () {
        const st = this.state;
        const r = this.room();
        this.io.print(r.name, 'title');
        this.io.print(r.text, 'text');
        const items = st.roomItems[st.room] || [];
        if (items.length) this.io.print('You see ' + items.map(id => articled(W.ITEMS[id].name)).join(', ') + ' here.', 'text');
        if (st.quiz) {
            this.printQuestion();
            return;
        }
        this.io.print(this.exitsLine(), 'sys');
        if (r.boss) this.io.print(this.bossPrompt(), 'text');
    };

    P.exitsLine = function () {
        const r = this.room();
        const parts = Object.keys(r.exits).map(dir => {
            const dest = W.ROOMS[r.exits[dir]];
            let note = '';
            if (dest.boss && !this.state.cleared[r.exits[dir]]) note = ` [sealed: ${this.sealsLit()}/5 runes lit]`;
            else if (dest.quiz && !this.state.cleared[r.exits[dir]] && this.state.visited[r.exits[dir]]) note = ' [guarded]';
            return `${dir} (${dest.name}${note})`;
        });
        return 'Exits: ' + parts.join(', ');
    };

    P.bossPrompt = function () {
        const b = this.room().bossFight;
        if (this.state.inventory.includes(b.key)) {
            return `${b.locked} The ${W.ITEMS[b.key].name} in your pack feels ready. (use ${W.ITEMS[b.key].names[0]})`;
        }
        return b.locked;
    };

    // ---------------- command entry points ----------------

    P.input = function (raw) {
        const text = String(raw || '').trim();
        if (!text || !this.state) return;
        this.io.print('> ' + text, 'cmd');
        if (this.state.won) {
            this.io.print('PROD-ORACLE-01 is up. Type "reset" to start a new shift.', 'sys');
            if (/^reset/i.test(text)) this.cmdReset(text.split(/\s+/).slice(1));
            return;
        }
        this.exec(text);
        if (this.state) this.refresh();
    };

    P.choose = function (index) {
        const c = this.choiceList[index];
        if (!c || !this.state) return;
        this.io.print('> ' + c.label, 'cmd');
        c.run();
        if (this.state) this.refresh();
    };

    P.exec = function (text) {
        const st = this.state;
        const words = text.toLowerCase().split(/\s+/);
        const verb = words[0];
        let args = words.slice(1);

        if (verb !== 'reset') this.pendingReset = false;

        // Mid-question, a bare direction that is an exit of this room means movement;
        // anything else that isn't a command is an answer
        const isExit = DIRS[verb] && !args.length && this.room().exits[DIRS[verb]];
        if (st.quiz && !(QUIZ_VERBS.has(verb) || isExit || (verb === 'cd' && args[0] === '..'))) {
            this.answer(text, false);
            return;
        }
        if (verb === 'answer') {
            if (!st.quiz) this.io.print('Nobody is asking you anything. Yet.', 'sys');
            else this.answer(text.replace(/^\S+\s*/, ''), false);
            return;
        }
        args = args.filter(w => !FILLER.has(w));

        if (DIRS[verb]) return this.move(DIRS[verb]);
        switch (verb) {
            case 'go': case 'walk': case 'move': case 'head':
                return this.cmdGo(args);
            case 'cd':
                if (!args.length || args[0] === '~') return this.io.print('There\'s no place like ~. But the server is still down.', 'sys');
                if (args[0] === '..' || args[0] === '-') return this.goBack();
                return this.cmdGo(args);
            case 'back': case 'flee': case 'retreat': case 'run':
                return this.goBack();
            case 'look': case 'l': case 'ls': case 'dir':
                if (args.length && !(args.length === 1 && /^-/.test(args[0]))) return this.examine(args);
                return this.describe();
            case 'examine': case 'x': case 'cat': case 'less': case 'more': case 'read': case 'inspect': case 'search': case 'check': case 'stat':
                return this.examine(args);
            case 'question': case 'repeat':
                return st.quiz ? this.printQuestion() : this.io.print('There is no open question.', 'sys');
            case 'take': case 'get': case 'grab': case 'pick':
                return this.take(args);
            case 'drop':
                return this.drop(args);
            case 'use':
                return this.use(args);
            case 'drink': case 'quaff':
                return this.drink(args);
            case 'inventory': case 'inv': case 'i':
                return this.showInventory();
            case 'hint':
                return this.hint();
            case 'status': case 'uptime':
                return this.io.print(this.statusLine(), 'sys');
            case 'help': case '?':
                return this.io.print(HELP, 'sys');
            case 'man':
                return this.io.print(MAN[args[0]] || (args[0] ? `No manual entry for ${args[0]}.` : 'What manual page do you want? Try "man go".'), 'sys');
            case 'mode':
                return this.setMode(args[0]);
            case 'whoami':
                return this.io.print('wizard (on-call)\ngroups: wizard wheel pager-duty', 'sys');
            case 'sudo':
                return this.io.print('wizard is not in the sudoers file. This incident will be reported.', 'bad');
            case 'ping':
                if (args.length) return this.io.print(`PING ${args.join(' ')}: Request timed out. (It's 3 AM. Everything is timing out.)`, 'sys');
                return this.io.print(this.exitsLine(), 'sys');
            case 'clear': case 'cls':
                return this.io.clear();
            case 'reset':
                return this.cmdReset(args);
            case 'rm':
                return this.io.print('You reach for rm -rf, then remember the last person who did that. Their headstone is in the graveyard.', 'bad');
            case 'xyzzy':
                return this.io.print('Nothing happens. This is a different kind of cave.', 'sys');
            case 'exit': case 'quit': case 'logout':
                return this.io.print('There is no logging out of on-call. Close the tab if you must; your progress saves at each act.', 'sys');
            case 'reboot': case 'shutdown':
                return this.io.print(st.act === 3 && st.room === 'row-13' ? 'You need console access first.' : 'You can\'t reboot it from here. That\'s the whole problem.', 'sys');
            case 'talk': case 'ask':
                return this.io.print('Nobody here wants to talk. They want answers.', 'sys');
            default:
                return this.io.print(`I don't know how to "${verb}". Type "help" for commands.`, 'sys');
        }
    };

    // ---------------- movement ----------------

    P.cmdGo = function (args) {
        if (!args.length) return this.io.print('Go where? (north, south, east, west, or back)', 'sys');
        const a = args.join(' ');
        if (DIRS[a]) return this.move(DIRS[a]);
        if (a === 'back') return this.goBack();
        const exits = this.room().exits;
        const dir = Object.keys(exits).find(d => W.ROOMS[exits[d]].name.toLowerCase().includes(a));
        if (dir) return this.move(dir);
        this.io.print(`You can't go "${a}" from here. ${this.exitsLine()}`, 'sys');
    };

    P.goBack = function () {
        const st = this.state;
        const exits = this.room().exits;
        const dir = Object.keys(exits).find(d => exits[d] === st.prevRoom);
        if (!dir) return this.io.print('There\'s no "back" from here. ' + this.exitsLine(), 'sys');
        if (st.quiz) {
            this.io.print(`You back away from ${st.quiz.guardian}. The question will be waiting when you return.`, 'sys');
            st.quiz = null;
        }
        this.enter(st.prevRoom);
    };

    P.move = function (dir) {
        const st = this.state;
        const dest = this.room().exits[dir];
        if (!dest) return this.io.print(`You can't go ${dir} from here. ${this.exitsLine()}`, 'sys');
        if (st.quiz) {
            if (dest === st.prevRoom) return this.goBack();
            return this.io.print(`${st.quiz.guardian[0].toUpperCase() + st.quiz.guardian.slice(1)} blocks your way. Answer, or go back.`, 'bad');
        }
        const r = this.room();
        if (r.quiz && !st.cleared[st.room] && dest !== st.prevRoom) {
            return this.io.print('The guardian blocks that way. Answer, or go back.', 'bad');
        }
        const destRoom = W.ROOMS[dest];
        if (destRoom.boss && this.sealsLit() < 5) {
            return this.io.print(`The way is sealed. ${this.sealsLit()} of 5 runes are lit; each guardian of this realm lights one.`, 'bad');
        }
        this.enter(dest);
    };

    P.enter = function (id) {
        const st = this.state;
        st.prevRoom = st.room;
        st.room = id;
        st.visited[id] = true;
        const r = W.ROOMS[id];
        if (r.quiz && !st.cleared[id]) {
            this.io.print(r.name, 'title');
            this.io.print(r.text, 'text');
            this.io.print(r.quiz.intro, 'quiz');
            this.startQuiz({ kind: 'guardian', guardian: r.quiz.guardian, topic: r.quiz.topic, step: 0 });
            return;
        }
        this.describe();
    };

    // ---------------- quizzes ----------------

    P.startQuiz = function (q) {
        const st = this.state;
        const question = Q.make(q.topic, `${st.actSeed}:${st.room}:${q.step}`);
        const rng = Q.makeRng(`${st.actSeed}:${st.room}:${q.step}:opts`);
        const pool = Q.shuffle(rng, question.distractors);
        st.quiz = Object.assign({}, q, {
            question,
            options: Q.shuffle(rng, [question.answer].concat(pool.slice(0, 3))),
            spare: pool.slice(3),
            rng
        });
        this.printQuestion();
    };

    P.printQuestion = function () {
        const quiz = this.state.quiz;
        const label = quiz.kind === 'boss' ? `[${quiz.guardian}: question ${quiz.step + 1} of 2]` : `[${quiz.guardian}]`;
        this.io.print(label + '\n' + quiz.question.q, 'quiz');
        if (this.state.mode === 'parser') this.io.print('(Type your answer, "hint" to trade a potion for a clue, or "back" to retreat.)', 'sys');
    };

    // `fromChoice` - the answer came from a choice button, so a miss swaps that option out
    P.answer = function (text, fromChoice) {
        const st = this.state;
        const quiz = st.quiz;
        if (!text.trim()) return this.io.print('Answer what?', 'sys');
        if (Q.isCorrect(quiz.question, text)) return this.correct();

        st.lives -= 1;
        if (fromChoice) {
            const i = quiz.options.indexOf(text);
            if (i >= 0) quiz.options.splice(i, 1);
            if (quiz.spare.length) quiz.options.push(quiz.spare.shift());
            quiz.options = Q.shuffle(quiz.rng, quiz.options);
        }
        this.saveLive();
        if (st.lives <= 0) return this.gameOver();
        const msg = `Wrong. ${st.lives} ${st.lives === 1 ? 'life' : 'lives'} left.`;
        this.io.print(msg, 'bad');
        this.io.announce(msg, 'assertive');
        this.printQuestion();
    };

    P.correct = function () {
        const st = this.state;
        const quiz = st.quiz;
        this.io.announce('Correct!', 'assertive');
        this.io.print('Correct!', 'good');
        if (quiz.kind === 'guardian') {
            st.quiz = null;
            st.cleared[st.room] = true;
            this.io.print(this.room().quiz.cleared, 'good');
            const lit = this.sealsLit();
            this.io.print(lit === 5 ? 'Far away, the fifth rune on the sealed door blazes to life. The way to this realm\'s boss is open.' : `A rune on the sealed door flickers on. (${lit}/5)`, 'sys');
            this.io.print(this.exitsLine(), 'sys');
            return;
        }
        if (quiz.step === 0) {
            st.quiz = null;
            this.startQuiz({ kind: 'boss', guardian: quiz.guardian, topic: this.room().bossFight.topics[1], step: 1 });
            return;
        }
        this.bossDefeated();
    };

    P.bossDefeated = function () {
        const st = this.state;
        const r = this.room();
        st.quiz = null;
        st.cleared[st.room] = true;
        this.io.print(r.bossFight.win, 'good');
        st.inventory = st.inventory.filter(id => id !== r.bossFight.key);
        if (st.act < 3) {
            this.io.print(`Checkpoint saved. Act ${st.act + 1} begins.`, 'sys');
            this.newAct(st.act + 1, null, { quiet: false });
            return;
        }
        this.victory();
    };

    P.victory = function () {
        const st = this.state;
        st.won = true;
        const rank = { 3: 'Archmage of Uptime', 2: 'Senior Wizard', 1: 'Wizard on Probation' }[st.lives] || 'Wizard on Probation';
        const mins = Math.max(1, Math.round(this.elapsed() / 60000));
        const p = this.potionCount();
        const line = `Datacenter Quest: rebooted PROD-ORACLE-01 with ${st.lives}/${MAX_LIVES} lives, ${p} ${p === 1 ? 'potion' : 'potions'} unused, ${st.hintsUsed} ${st.hintsUsed === 1 ? 'hint' : 'hints'}, ${mins}m.`;
        this.io.print('*** SERVICE RESTORED ***', 'act');
        this.io.print(`Rank: ${rank}`, 'good');
        this.io.print('Back at your tower, an email from the Change Advisory Board is waiting: "This change had no approved ticket." You close the laptop and go to bed.', 'text');
        this.io.print(line, 'sys');
        this.io.announce(`Service restored. Rank: ${rank}.`, 'assertive');
        this.io.remove();
        this.io.victory({ rank, line });
    };

    P.gameOver = function () {
        const st = this.state;
        const act = st.act;
        const panic = 'Kernel panic - not syncing: wizard ran out of lives\n---[ end Kernel panic ]---\n' +
            `The Kernel-Panic Lich cackles from somewhere far away. You wake at the start of Act ${act} with 3 lives and fresh questions.`;
        this.io.print(panic, 'bad');
        this.io.announce(`Game over. Restarting Act ${act} with 3 lives.`, 'assertive');
        const cp = this.checkpoint;
        this.newAct(act, { act, lives: MAX_LIVES, inventory: cp.inventory, actSeed: Math.floor(this.random() * 2 ** 31), hintsUsed: st.hintsUsed, elapsedMs: this.elapsed() }, { quiet: false });
    };

    P.hint = function () {
        const st = this.state;
        if (!st.quiz) return this.io.print('There\'s no question to get a hint for.', 'sys');
        if (!this.potionCount()) return this.io.print('You have no potion to trade for wisdom. Find one, or think harder.', 'bad');
        const used = this.removePotion();
        st.hintsUsed += 1;
        this.saveLive();
        this.io.print(`You trade the ${W.ITEMS[used].name} for a whisper of wisdom: ${st.quiz.question.hint}`, 'quiz');
    };

    // ---------------- items ----------------

    P.examine = function (args) {
        const st = this.state;
        if (!args.length) return this.io.print('Examine what?', 'sys');
        const here = st.roomItems[st.room] || [];
        const itemId = this.findItem(args, st.inventory.concat(here));
        if (itemId) return this.io.print(W.ITEMS[itemId].desc, 'text');
        const f = this.findFeature(args);
        if (f) {
            this.io.print(f.text, 'text');
            const key = st.room + ':' + f.names[0];
            if (f.reveals && !st.revealed[key]) {
                st.revealed[key] = true;
                here.push(f.reveals);
                this.io.print(`You found ${articled(W.ITEMS[f.reveals].name)}!`, 'good');
            }
            return;
        }
        if (st.quiz && /^(guardian|golem|troll|owl|librarian|sphinx|dwarf|witch|reaper|warden|keeper|clerk|elemental|ghost|reflector|reflection|innkeeper)$/.test(args.join(' '))) {
            return this.io.print(`${st.quiz.guardian[0].toUpperCase() + st.quiz.guardian.slice(1)} waits for your answer.`, 'text');
        }
        this.io.print(`You see no "${args.join(' ')}" here.`, 'sys');
    };

    P.take = function (args) {
        const st = this.state;
        const here = st.roomItems[st.room] || [];
        if (args[0] === 'all') args = args.slice(1);
        if (!args.length) {
            if (!here.length) return this.io.print('There\'s nothing here to take.', 'sys');
            here.slice().forEach(id => this.takeItem(id));
            return;
        }
        const id = this.findItem(args, here);
        if (!id) {
            if (this.findFeature(args)) return this.io.print('That isn\'t going anywhere.', 'sys');
            return this.io.print(`There's no "${args.join(' ')}" here to take.`, 'sys');
        }
        this.takeItem(id);
    };

    P.takeItem = function (id) {
        const st = this.state;
        const here = st.roomItems[st.room];
        here.splice(here.indexOf(id), 1);
        st.inventory.push(id);
        const it = W.ITEMS[id];
        this.io.print(`Taken: ${it.name}.`, 'good');
        if (it.kind === 'potion') this.io.print('Drink it to restore a life, or keep it to trade for a hint.', 'sys');
        if (it.kind === 'key') this.io.print('This looks important. Something in this realm is waiting for it.', 'sys');
    };

    P.drop = function (args) {
        const st = this.state;
        const id = this.findItem(args, st.inventory);
        if (!id) return this.io.print(args.length ? `You aren't carrying "${args.join(' ')}".` : 'Drop what?', 'sys');
        if (W.ITEMS[id].kind === 'key') return this.io.print('You have a feeling you\'ll need that. You hold on to it.', 'sys');
        st.inventory.splice(st.inventory.indexOf(id), 1);
        (st.roomItems[st.room] = st.roomItems[st.room] || []).push(id);
        this.io.print(`Dropped: ${W.ITEMS[id].name}.`, 'sys');
    };

    P.use = function (args) {
        const st = this.state;
        const onAt = args.indexOf('on');
        const itemWords = onAt >= 0 ? args.slice(0, onAt) : args;
        const id = this.findItem(itemWords, st.inventory);
        if (!id) return this.io.print(itemWords.length ? `You aren't carrying "${itemWords.join(' ')}".` : 'Use what?', 'sys');
        const it = W.ITEMS[id];
        if (it.kind === 'potion') return this.drinkItem(id);
        if (it.kind === 'key') {
            const r = this.room();
            if (!r.boss || r.bossFight.key !== id) return this.io.print(`Not here. The ${it.name} is meant for something else in this realm.`, 'sys');
            if (st.quiz) return this.io.print('You\'re already in the fight.', 'sys');
            this.io.print(r.bossFight.intro, 'quiz');
            this.startQuiz({ kind: 'boss', guardian: r.bossFight.name, topic: r.bossFight.topics[0], step: 0 });
            return;
        }
        if (id === 'rubber-duck') return this.io.print('You explain the outage to the duck. The duck says nothing, but you feel slightly better.', 'text');
        if (id === 'sticky-note') return this.io.print('You are not logging into anything with that. Ever.', 'text');
        this.io.print(`You wave the ${it.name} around. Nothing happens.`, 'sys');
    };

    P.drink = function (args) {
        const st = this.state;
        const id = args.length ? this.findItem(args, st.inventory) : st.inventory.find(x => W.ITEMS[x].kind === 'potion');
        if (!id) return this.io.print('You have nothing to drink.', 'sys');
        if (W.ITEMS[id].kind !== 'potion') return this.io.print('You probably shouldn\'t drink that.', 'sys');
        this.drinkItem(id);
    };

    P.drinkItem = function (id) {
        const st = this.state;
        if (st.lives >= MAX_LIVES) return this.io.print(`You're already at ${MAX_LIVES} lives. Save it for when you need it, or trade it for a hint.`, 'sys');
        st.inventory.splice(st.inventory.indexOf(id), 1);
        st.lives += 1;
        this.saveLive();
        const msg = `You drink the ${W.ITEMS[id].name}. Lives: ${st.lives}/${MAX_LIVES}.`;
        this.io.print(msg, 'good');
        this.io.announce(msg, 'polite');
    };

    P.showInventory = function () {
        const inv = this.state.inventory;
        this.io.print(inv.length ? 'You are carrying: ' + inv.map(id => W.ITEMS[id].name).join(', ') + '.' : 'You are carrying nothing but a pager and a sense of dread.', 'sys');
    };

    // ---------------- settings ----------------

    P.setMode = function (want) {
        const st = this.state;
        const next = want === 'parser' || want === 'choice' ? want : (st.mode === 'parser' ? 'choice' : 'parser');
        st.mode = next;
        this.saveLive();
        this.io.mode(next);
        this.io.print(next === 'choice' ? 'Choice mode: pick an option with the buttons or keys 1-9.' : 'Parser mode: type commands. "help" lists them.', 'sys');
        if (st.quiz) this.printQuestion();
    };

    P.cmdReset = function (args) {
        if (args[0] === 'confirm' || this.pendingReset) {
            this.pendingReset = false;
            this.io.remove();
            this.io.clear();
            const mode = this.state ? this.state.mode : 'parser';
            this.state = null;
            this.newAct(1, { act: 1, lives: MAX_LIVES, inventory: [], hintsUsed: 0, elapsedMs: 0 }, { quiet: true });
            this.state.mode = mode;
            this.saveLive();
            this.io.print('Saved game wiped. Starting a fresh shift.', 'sys');
            this.io.print(W.ACTS[0].intro, 'act');
            this.describe();
            this.refresh();
            return;
        }
        this.pendingReset = true;
        this.io.print('This wipes your saved game and starts over. Type "reset" again to confirm.', 'bad');
    };

    // ---------------- choice mode ----------------

    P.buildChoices = function () {
        const st = this.state;
        const list = [];
        const add = (label, run) => list.push({ label, run });
        if (st.won) return list;
        if (st.quiz) {
            st.quiz.options.forEach(opt => add(opt, () => this.answer(opt, true)));
            if (this.potionCount()) add('Trade a potion for a hint', () => this.hint());
            if (this.potionCount() && st.lives < MAX_LIVES) add('Drink a potion (+1 life)', () => this.drink([]));
            if (st.prevRoom) add('Retreat', () => this.goBack());
            return list;
        }
        const r = this.room();
        if (r.boss && !st.cleared[st.room] && st.inventory.includes(r.bossFight.key)) {
            add(`Use the ${W.ITEMS[r.bossFight.key].name}`, () => this.use([W.ITEMS[r.bossFight.key].names[0]]));
        }
        Object.keys(r.exits).forEach(dir => {
            const dest = W.ROOMS[r.exits[dir]];
            const sealed = dest.boss && this.sealsLit() < 5;
            add(`Go ${dir}: ${dest.name}${sealed ? ' (sealed)' : ''}`, () => this.move(dir));
        });
        (st.roomItems[st.room] || []).forEach(id => add(`Take the ${W.ITEMS[id].name}`, () => this.take([W.ITEMS[id].names[0]])));
        (r.features || []).forEach(f => {
            const seen = st.revealed[st.room + ':' + f.names[0]] || (st.examined && st.examined[st.room + ':' + f.names[0]]);
            if (!seen) add(`Examine the ${f.names[0]}`, () => {
                st.examined = st.examined || {};
                st.examined[st.room + ':' + f.names[0]] = true;
                this.examine(f.names[0].split(' '));
            });
        });
        if (this.potionCount() && st.lives < MAX_LIVES) add('Drink a potion (+1 life)', () => this.drink([]));
        add('Look around', () => this.describe());
        add('Check inventory', () => this.showInventory());
        return list;
    };

    QuestEngine.MAX_LIVES = MAX_LIVES;
    return QuestEngine;
});
