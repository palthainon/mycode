/*
 * Datacenter Quest - game engine. No DOM access: everything visible goes through
 * the `io` object, so the same engine runs in the page and in the Node tests.
 *
 * io = {
 *   print(text, kind)        kind: cmd | title | text | quiz | good | bad | sys | act
 *   clear()
 *   announce(text, priority) screen-reader announcement ('polite' | 'assertive')
 *   choices(list)            [{label}] for choice mode; [] hides them
 *   status(info)             {quest, character, act, actName, lives, maxLives, potions, room, ...}
 *   mode(mode)               'parser' | 'choice'
 *   save(data) / remove()    persistence (StorageUtils in the page)
 *   setup()                  show the character / quest picker (no game running)
 *   victory(info)            {rank, line}
 *   random(), now()          injectable for tests
 * }
 *
 * A game is a quest (world registered in quests/<id>.js) played by a character
 * (world.js CHARACTERS). Start with start(saved) to resume, or newGame({quest, character}).
 *
 * Saving: the act-start checkpoint holds position and inventory. Lives, potions,
 * hints and perk uses are also written the moment they drop, and a reload takes
 * the lower value, so reloading never undoes a strike or refunds a spent resource.
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./questions.js'), require('./world.js'));
    } else {
        root.QuestEngine = factory(root.QuestQuestions, root.QuestWorld);
    }
})(typeof self !== 'undefined' ? self : this, function (Q, W) {
    'use strict';

    const SAVE_VERSION = 2;

    const DIRS = { n: 'north', s: 'south', e: 'east', w: 'west', north: 'north', south: 'south', east: 'east', west: 'west' };
    const FILLER = new Set(['the', 'a', 'an', 'at', 'to', 'into', 'under', 'behind', 'inside', 'in', 'up', 'around', 'my', 'some', 'past']);
    // During a quiz, input starting with anything else is treated as an answer
    const QUIZ_VERBS = new Set(['answer', 'hint', 'back', 'flee', 'retreat', 'run', 'look', 'l', 'ls', 'help', '?', 'man',
        'status', 'uptime', 'inventory', 'inv', 'i', 'mode', 'drink', 'quaff', 'whoami', 'sudo', 'clear', 'reset', 'question', 'repeat', 'use', 'sneak', 'examine', 'inspect']);

    const HELP = [
        'Commands (shell aliases in brackets):',
        '  look [ls]                     describe the room again',
        '  go north / n / s / e / w [cd] move; "back" [cd ..] returns the way you came',
        '  examine <thing> [cat, less]   look closely; try "look under counter"',
        '  take <item> / drop <item>     pick things up, put them down',
        '  use <item> [on <target>]      use an item; drink <potion>',
        '  inventory [i]                 what you are carrying',
        '  answer <x>                    answer a guardian (or just type the answer)',
        '  hint                          trade one potion for a hint (wizards get one free per act)',
        '  sneak                         rogues only: slip past a guardian once per act',
        '  status [uptime]               lives, potions, perks, act',
        '  mode                          switch between typing and choice buttons',
        '  man <command>                 help for one command',
        '  clear, reset                  clear the screen; wipe your save and pick a new quest'
    ].join('\n');

    const MAN = {
        look: 'look (ls): describe your surroundings. "look <thing>" works like examine.',
        go: 'go <direction> (cd): move north, south, east or west. n/s/e/w work alone. "back", "flee" or "cd .." returns the way you came, even mid-question.',
        examine: 'examine <thing> (x, cat, less, read): inspect something. Hidden things turn up when you look closely.',
        take: 'take <item> (get, grab): pick an item up. drop <item> puts it down.',
        use: 'use <item> [on <target>]: use an item. Key items open boss fights. Potions restore a life.',
        drink: 'drink <potion>: restore one life, up to your maximum.',
        inventory: 'inventory (i): list what you carry.',
        answer: 'answer <x>: answer the guardian blocking your way. While a question is open you can also type the answer on its own.',
        hint: 'hint: costs one potion. Wizards get one free hint per act. Gives a nudge, not the answer.',
        sneak: 'sneak: rogues only. Once per act, slip past a guardian without answering. Bosses notice everything.',
        status: 'status (uptime): lives, potions, perks and where you are.',
        mode: 'mode [parser|choice]: switch between typing commands and picking numbered choices.',
        reset: 'reset: wipe your saved game and go back to the character and quest picker. Asks for confirmation.',
        sudo: 'sudo: you are not in the sudoers file. This incident will be reported.'
    };

    function articled(name) {
        return /^[A-Z]/.test(name) ? name : (/^[aeiou]/i.test(name) ? 'an ' : 'a ') + name;
    }

    const cap = s => s[0].toUpperCase() + s.slice(1);

    function QuestEngine(io) {
        this.io = io;
        this.random = io.random || Math.random;
        this.now = io.now || (() => Date.now());
        this.state = null;
        this.world = null;
        this.char = null;
        this.pendingReset = false;
        this.choiceList = [];
    }

    const P = QuestEngine.prototype;

    // ---------------- lifecycle ----------------

    // Resume a saved game. Returns false (and shows the picker) when there is nothing to resume.
    P.start = function (saved) {
        let s = saved && saved.checkpoint ? saved : null;
        if (s && s.v === 1) s = Object.assign({}, s, { v: 2, quest: 'classic', character: 'wizard' });
        if (!s || s.v !== SAVE_VERSION || !W.QUESTS[s.quest] || !W.CHARACTERS[s.character]) {
            this.state = null;
            this.io.setup();
            return false;
        }
        this.world = W.QUESTS[s.quest];
        this.char = W.CHARACTERS[s.character];
        const cp = s.checkpoint;
        this.newAct(cp.act, cp, { quiet: true });
        const st = this.state;
        st.lives = Math.min(cp.lives, typeof s.lives === 'number' ? s.lives : cp.lives);
        const potionCap = Math.min(this.potionCount(), typeof s.potions === 'number' ? s.potions : 99);
        while (this.potionCount() > potionCap) this.removePotion();
        st.hintsUsed = Math.max(cp.hintsUsed || 0, s.hintsUsed || 0);
        if (typeof s.freeHints === 'number') st.freeHints = Math.min(st.freeHints, s.freeHints);
        if (typeof s.sneaks === 'number') st.sneaks = Math.min(st.sneaks, s.sneaks);
        st.mode = s.mode === 'choice' ? 'choice' : 'parser';
        this.io.mode(st.mode);
        this.saveLive();
        if (st.lives <= 0) {
            this.gameOver();
            this.refresh();
            return true;
        }
        this.io.print(`Resuming ${this.world.name} as the ${this.char.name} at the start of Act ${cp.act}. Lives and spent potions carry over.`, 'sys');
        this.io.print(this.world.acts[cp.act - 1].intro, 'act');
        this.describe();
        this.refresh();
        return true;
    };

    P.newGame = function (opts) {
        const quest = W.QUESTS[opts.quest];
        const ch = W.CHARACTERS[opts.character];
        if (!quest || !ch) throw new Error('Unknown quest or character');
        this.world = quest;
        this.char = ch;
        this.state = null;
        this.io.clear();
        this.io.print(`${quest.name}, played as the ${ch.name}. ${ch.perk}`, 'sys');
        this.io.print(ch.intro, 'text');
        this.newAct(1, { act: 1, lives: ch.maxLives, inventory: [], hintsUsed: 0, elapsedMs: 0 }, { quiet: false, mode: opts.mode });
        this.io.mode(this.state.mode);
        this.saveLive();
        this.refresh();
    };

    // Begin an act. `from` is a checkpoint to restore, or null to carry on from the current state.
    P.newAct = function (n, from, opts) {
        opts = opts || {};
        const prev = this.state;
        const rooms = this.world.rooms;
        const act = this.world.acts[n - 1];
        const roomItems = {};
        Object.keys(rooms).forEach(id => {
            if (rooms[id].act === n) roomItems[id] = (rooms[id].items || []).slice();
        });
        this.state = {
            act: n,
            room: act.start,
            prevRoom: null,
            lives: from ? from.lives : (prev ? prev.lives : this.char.maxLives),
            inventory: from ? from.inventory.slice() : (prev ? prev.inventory.slice() : []),
            hintsUsed: from ? from.hintsUsed || 0 : (prev ? prev.hintsUsed : 0),
            elapsedMs: from ? from.elapsedMs || 0 : (prev ? this.elapsed() : 0),
            sessionStart: this.now(),
            actSeed: from && from.actSeed ? from.actSeed : Math.floor(this.random() * 2 ** 31),
            mode: opts.mode || (prev ? prev.mode : 'parser'),
            freeHints: this.char.freeHints,
            sneaks: this.char.sneaks,
            roomItems,
            revealed: {},
            examined: {},
            cleared: {},
            visited: {},
            quiz: null
        };
        this.state.visited[act.start] = true;
        this.saveCheckpoint();
        if (!opts.quiet) {
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

    // Lives, potions, hints and perk uses are written as soon as they change
    P.saveLive = function () {
        const st = this.state;
        if (!st || st.won) return;
        this.io.save({
            v: SAVE_VERSION, quest: this.world.id, character: this.charId(), mode: st.mode, checkpoint: this.checkpoint,
            lives: st.lives, potions: this.potionCount(), hintsUsed: st.hintsUsed, freeHints: st.freeHints, sneaks: st.sneaks
        });
    };

    // ---------------- helpers ----------------

    P.charId = function () {
        return Object.keys(W.CHARACTERS).find(k => W.CHARACTERS[k] === this.char);
    };

    P.maxLives = function () { return this.char.maxLives; };
    P.item = function (id) { return this.world.items[id]; };
    P.room = function () { return this.world.rooms[this.state.room]; };
    P.roomById = function (id) { return this.world.rooms[id]; };

    P.potionCount = function () {
        return this.state.inventory.filter(id => this.item(id).kind === 'potion').length;
    };

    P.removePotion = function () {
        const inv = this.state.inventory;
        const i = inv.findIndex(id => this.item(id).kind === 'potion');
        if (i >= 0) return inv.splice(i, 1)[0];
        return null;
    };

    P.actQuizRooms = function () {
        const n = this.state.act;
        const rooms = this.world.rooms;
        return Object.keys(rooms).filter(id => rooms[id].act === n && rooms[id].quiz);
    };

    P.sealsLit = function () {
        return this.actQuizRooms().filter(id => this.state.cleared[id]).length;
    };

    P.findItem = function (words, ids) {
        const phrase = words.join(' ');
        if (!phrase) return null;
        return ids.find(id => this.item(id).names.includes(phrase)) ||
            ids.find(id => this.item(id).names.some(n => n.split(' ').includes(words[words.length - 1]))) || null;
    };

    P.findFeature = function (words) {
        const phrase = words.join(' ');
        if (!phrase) return null;
        const feats = this.room().features || [];
        return feats.find(f => f.names.includes(phrase)) ||
            feats.find(f => f.names.some(n => n.split(' ').includes(words[words.length - 1]))) || null;
    };

    P.perkLine = function () {
        const st = this.state;
        if (this.char.freeHints) return ` | Free hints ${st.freeHints}`;
        if (this.char.sneaks) return ` | Sneaks ${st.sneaks}`;
        return '';
    };

    P.statusLine = function () {
        const st = this.state;
        return `${this.world.name} (${this.char.name}) | Act ${st.act}: ${this.world.acts[st.act - 1].name} | Lives ${st.lives}/${this.maxLives()} | Potions ${this.potionCount()}${this.perkLine()} | ${this.room().name}`;
    };

    P.refresh = function () {
        const st = this.state;
        if (!st) {
            this.choiceList = [];
            this.io.choices([]);
            return;
        }
        this.io.status({
            quest: this.world.name, character: this.char.name, act: st.act, actName: this.world.acts[st.act - 1].name,
            lives: st.lives, maxLives: this.maxLives(), potions: this.potionCount(), room: this.room().name,
            freeHints: this.char.freeHints ? st.freeHints : null, sneaks: this.char.sneaks ? st.sneaks : null, over: !!st.won
        });
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
        if (items.length) this.io.print('You see ' + items.map(id => articled(this.item(id).name)).join(', ') + ' here.', 'text');
        if (st.quiz) {
            this.printQuestion();
            return;
        }
        this.io.print(this.exitsLine(), 'sys');
        if (r.boss && !st.cleared[st.room]) this.io.print(this.bossPrompt(), 'text');
    };

    P.exitsLine = function () {
        const r = this.room();
        const parts = Object.keys(r.exits).map(dir => {
            const destId = r.exits[dir];
            const dest = this.roomById(destId);
            let note = '';
            if (dest.boss && !this.state.cleared[destId]) note = ` [sealed: ${this.sealsLit()}/5 runes lit]`;
            else if (dest.quiz && !this.state.cleared[destId] && this.state.visited[destId]) note = ' [guarded]';
            return `${dir} (${dest.name}${note})`;
        });
        return 'Exits: ' + parts.join(', ');
    };

    P.bossPrompt = function () {
        const b = this.room().bossFight;
        if (this.state.inventory.includes(b.key)) {
            return `${b.locked} The ${this.item(b.key).name} in your pack feels ready. (use ${this.item(b.key).names[0]})`;
        }
        return b.locked;
    };

    // ---------------- command entry points ----------------

    P.input = function (raw) {
        const text = String(raw || '').trim();
        if (!text || !this.state) return;
        this.io.print('> ' + text, 'cmd');
        if (this.state.won) {
            if (/^reset/i.test(text)) return this.cmdReset(['confirm']);
            this.io.print(`${this.world.target} is back. Type "reset" to pick a new quest.`, 'sys');
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
        const name = this.char.name.toLowerCase();
        switch (verb) {
            case 'go': case 'walk': case 'move': case 'head':
                return this.cmdGo(args);
            case 'cd':
                if (!args.length || args[0] === '~') return this.io.print(`There's no place like ~. But ${this.world.target} is still down.`, 'sys');
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
            case 'sneak': case 'hide': case 'stealth':
                return this.sneak();
            case 'status': case 'uptime':
                return this.io.print(this.statusLine(), 'sys');
            case 'help': case '?':
                return this.io.print(HELP, 'sys');
            case 'man':
                return this.io.print(MAN[args[0]] || (args[0] ? `No manual entry for ${args[0]}.` : 'What manual page do you want? Try "man go".'), 'sys');
            case 'mode':
                return this.setMode(args[0]);
            case 'whoami':
                return this.io.print(`${name} (on-call)\ngroups: ${name} wheel pager-duty`, 'sys');
            case 'sudo':
                return this.io.print(`${name} is not in the sudoers file. This incident will be reported.`, 'bad');
            case 'ping':
                if (args.length) return this.io.print(`PING ${args.join(' ')}: Request timed out. (It's 3 AM. Everything is timing out.)`, 'sys');
                return this.io.print(this.exitsLine(), 'sys');
            case 'clear': case 'cls':
                return this.io.clear();
            case 'reset':
                return this.cmdReset(args);
            case 'rm':
                return this.io.print('You reach for rm -rf, then remember the last person who did that. You put your hands in your pockets.', 'bad');
            case 'xyzzy':
                return this.io.print('Nothing happens. This is a different kind of cave.', 'sys');
            case 'exit': case 'quit': case 'logout':
                return this.io.print('There is no logging out of on-call. Close the tab if you must; your progress saves at each act.', 'sys');
            case 'reboot': case 'shutdown':
                return this.io.print('You can\'t fix it from here. That\'s the whole problem.', 'sys');
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
        const dir = Object.keys(exits).find(d => this.roomById(exits[d]).name.toLowerCase().includes(a));
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
            return this.io.print(`${cap(st.quiz.guardian)} blocks your way. Answer, or go back.`, 'bad');
        }
        const r = this.room();
        if (r.quiz && !st.cleared[st.room] && dest !== st.prevRoom) {
            return this.io.print('The guardian blocks that way. Answer, or go back.', 'bad');
        }
        if (this.roomById(dest).boss && this.sealsLit() < 5) {
            return this.io.print(`The way is sealed. ${this.sealsLit()} of 5 runes are lit; each guardian of this realm lights one.`, 'bad');
        }
        this.enter(dest);
    };

    P.enter = function (id) {
        const st = this.state;
        st.prevRoom = st.room;
        st.room = id;
        st.visited[id] = true;
        const r = this.roomById(id);
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
        const seed = `${this.world.id}:${st.actSeed}:${st.room}:${q.step}`;
        const question = Q.make(q.topic, seed);
        const rng = Q.makeRng(seed + ':opts');
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
        if (this.state.mode === 'parser') this.io.print('(Type your answer, "hint" for a clue, or "back" to retreat.)', 'sys');
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

    P.clearGuardian = function () {
        const st = this.state;
        st.quiz = null;
        st.cleared[st.room] = true;
        const lit = this.sealsLit();
        this.io.print(lit === 5 ? 'Far away, the fifth rune on the sealed door blazes to life. The way to this realm\'s boss is open.' : `A rune on the sealed door flickers on. (${lit}/5)`, 'sys');
        this.io.print(this.exitsLine(), 'sys');
    };

    P.correct = function () {
        const st = this.state;
        const quiz = st.quiz;
        this.io.announce('Correct!', 'assertive');
        this.io.print('Correct!', 'good');
        if (quiz.kind === 'guardian') {
            this.io.print(this.room().quiz.cleared, 'good');
            this.clearGuardian();
            return;
        }
        if (quiz.step === 0) {
            st.quiz = null;
            this.startQuiz({ kind: 'boss', guardian: quiz.guardian, topic: this.room().bossFight.topics[1], step: 1 });
            return;
        }
        this.bossDefeated();
    };

    P.sneak = function () {
        const st = this.state;
        if (!this.char.sneaks) return this.io.print(`A ${this.char.name.toLowerCase()} sneaking? You'd be about as quiet as a dropped server rack.`, 'sys');
        if (!st.quiz) return this.io.print('There\'s nobody here to sneak past.', 'sys');
        if (st.quiz.kind === 'boss') return this.io.print(`${cap(st.quiz.guardian)} notices everything. No sneaking past this one.`, 'bad');
        if (st.sneaks <= 0) return this.io.print('You already used your shadowstep in this realm. The guardian is watching you closely now.', 'bad');
        st.sneaks -= 1;
        this.saveLive();
        this.io.print(`You melt into the shadows and slip past ${st.quiz.guardian}. By the time it turns around, you're gone.`, 'good');
        this.io.announce('You sneak past the guardian.', 'assertive');
        this.clearGuardian();
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
        const lost = this.maxLives() - st.lives;
        const rank = this.char.ranks[Math.min(lost, 2)];
        const mins = Math.max(1, Math.round(this.elapsed() / 60000));
        const p = this.potionCount();
        const line = `Datacenter Quest [${this.world.name}, ${this.char.name}]: restored ${this.world.target} with ${st.lives}/${this.maxLives()} lives, ` +
            `${p} ${p === 1 ? 'potion' : 'potions'} unused, ${st.hintsUsed} ${st.hintsUsed === 1 ? 'hint' : 'hints'}, ${mins}m.`;
        this.io.print('*** SERVICE RESTORED ***', 'act');
        this.io.print(`Rank: ${rank}`, 'good');
        this.io.print(this.world.epilogue, 'text');
        this.io.print(line, 'sys');
        this.io.announce(`Service restored. Rank: ${rank}.`, 'assertive');
        this.io.remove();
        this.io.victory({ rank, line });
    };

    P.gameOver = function () {
        const st = this.state;
        const act = st.act;
        const panic = `Kernel panic - not syncing: ${this.char.name.toLowerCase()} ran out of lives\n---[ end Kernel panic ]---\n` +
            `You wake at the start of Act ${act} with ${this.maxLives()} lives and fresh questions.`;
        this.io.print(panic, 'bad');
        this.io.announce(`Game over. Restarting Act ${act} with ${this.maxLives()} lives.`, 'assertive');
        const cp = this.checkpoint;
        this.newAct(act, { act, lives: this.maxLives(), inventory: cp.inventory, actSeed: Math.floor(this.random() * 2 ** 31), hintsUsed: st.hintsUsed, elapsedMs: this.elapsed() }, { quiet: false });
    };

    P.hint = function () {
        const st = this.state;
        if (!st.quiz) return this.io.print('There\'s no question to get a hint for.', 'sys');
        if (st.freeHints > 0) {
            st.freeHints -= 1;
            st.hintsUsed += 1;
            this.saveLive();
            this.io.print(`You recall a line from an old spellbook: ${st.quiz.question.hint}`, 'quiz');
            return;
        }
        if (!this.potionCount()) return this.io.print('You have no potion to trade for wisdom. Find one, or think harder.', 'bad');
        const used = this.removePotion();
        st.hintsUsed += 1;
        this.saveLive();
        this.io.print(`You trade the ${this.item(used).name} for a whisper of wisdom: ${st.quiz.question.hint}`, 'quiz');
    };

    // ---------------- items ----------------

    P.examine = function (args) {
        const st = this.state;
        if (!args.length) return this.io.print('Examine what?', 'sys');
        const here = st.roomItems[st.room] || [];
        const itemId = this.findItem(args, st.inventory.concat(here));
        if (itemId) return this.io.print(this.item(itemId).desc, 'text');
        const f = this.findFeature(args);
        if (f) {
            this.io.print(f.text, 'text');
            const key = st.room + ':' + f.names[0];
            st.examined[key] = true;
            if (f.reveals && !st.revealed[key]) {
                st.revealed[key] = true;
                here.push(f.reveals);
                this.io.print(`You found ${articled(this.item(f.reveals).name)}!`, 'good');
            }
            return;
        }
        if (st.quiz) {
            const nameWords = st.quiz.guardian.toLowerCase().split(/\s+/).filter(w => w !== 'the' && w !== 'of');
            if (args.some(a => nameWords.includes(a) || a === 'guardian' || a === 'boss')) {
                return this.io.print(`${cap(st.quiz.guardian)} waits for your answer.`, 'text');
            }
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
        const it = this.item(id);
        this.io.print(`Taken: ${it.name}.`, 'good');
        if (it.kind === 'potion') this.io.print('Drink it to restore a life, or keep it to trade for a hint.', 'sys');
        if (it.kind === 'key') this.io.print('This looks important. Something in this realm is waiting for it.', 'sys');
    };

    P.drop = function (args) {
        const st = this.state;
        const id = this.findItem(args, st.inventory);
        if (!id) return this.io.print(args.length ? `You aren't carrying "${args.join(' ')}".` : 'Drop what?', 'sys');
        if (this.item(id).kind === 'key') return this.io.print('You have a feeling you\'ll need that. You hold on to it.', 'sys');
        st.inventory.splice(st.inventory.indexOf(id), 1);
        (st.roomItems[st.room] = st.roomItems[st.room] || []).push(id);
        this.io.print(`Dropped: ${this.item(id).name}.`, 'sys');
    };

    P.use = function (args) {
        const st = this.state;
        const onAt = args.indexOf('on');
        const itemWords = onAt >= 0 ? args.slice(0, onAt) : args;
        const id = this.findItem(itemWords, st.inventory);
        if (!id) return this.io.print(itemWords.length ? `You aren't carrying "${itemWords.join(' ')}".` : 'Use what?', 'sys');
        const it = this.item(id);
        if (it.kind === 'potion') return this.drinkItem(id);
        if (it.kind === 'key') {
            const r = this.room();
            if (!r.boss || r.bossFight.key !== id || st.cleared[st.room]) return this.io.print(`Not here. The ${it.name} is meant for something else in this realm.`, 'sys');
            if (st.quiz) return this.io.print('You\'re already in the fight.', 'sys');
            this.io.print(r.bossFight.intro, 'quiz');
            this.startQuiz({ kind: 'boss', guardian: r.bossFight.name, topic: r.bossFight.topics[0], step: 0 });
            return;
        }
        this.io.print(it.use || `You wave the ${it.name} around. Nothing happens.`, it.use ? 'text' : 'sys');
    };

    P.drink = function (args) {
        const st = this.state;
        const id = args.length ? this.findItem(args, st.inventory) : st.inventory.find(x => this.item(x).kind === 'potion');
        if (!id) return this.io.print('You have nothing to drink.', 'sys');
        if (this.item(id).kind !== 'potion') return this.io.print('You probably shouldn\'t drink that.', 'sys');
        this.drinkItem(id);
    };

    P.drinkItem = function (id) {
        const st = this.state;
        if (st.lives >= this.maxLives()) return this.io.print(`You're already at ${this.maxLives()} lives. Save it for when you need it, or trade it for a hint.`, 'sys');
        st.inventory.splice(st.inventory.indexOf(id), 1);
        st.lives += 1;
        this.saveLive();
        const msg = `You drink the ${this.item(id).name}. Lives: ${st.lives}/${this.maxLives()}.`;
        this.io.print(msg, 'good');
        this.io.announce(msg, 'polite');
    };

    P.showInventory = function () {
        const inv = this.state.inventory;
        this.io.print(inv.length ? 'You are carrying: ' + inv.map(id => this.item(id).name).join(', ') + '.' : 'You are carrying nothing but a pager and a sense of dread.', 'sys');
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
            this.state = null;
            this.refresh();
            this.io.setup();
            return;
        }
        this.pendingReset = true;
        this.io.print('This wipes your saved game and returns to the quest picker. Type "reset" again to confirm.', 'bad');
    };

    // ---------------- choice mode ----------------

    P.buildChoices = function () {
        const st = this.state;
        const list = [];
        const add = (label, run) => list.push({ label, run });
        if (st.won) return list;
        const canDrink = this.potionCount() && st.lives < this.maxLives();
        if (st.quiz) {
            st.quiz.options.forEach(opt => add(opt, () => this.answer(opt, true)));
            if (st.freeHints > 0) add('Recall a hint (free)', () => this.hint());
            else if (this.potionCount()) add('Trade a potion for a hint', () => this.hint());
            if (st.quiz.kind === 'guardian' && st.sneaks > 0) add('Sneak past (once per act)', () => this.sneak());
            if (canDrink) add('Drink a potion (+1 life)', () => this.drink([]));
            if (st.prevRoom) add('Retreat', () => this.goBack());
            return list;
        }
        const r = this.room();
        if (r.boss && !st.cleared[st.room] && st.inventory.includes(r.bossFight.key)) {
            add(`Use the ${this.item(r.bossFight.key).name}`, () => this.use([this.item(r.bossFight.key).names[0]]));
        }
        Object.keys(r.exits).forEach(dir => {
            const dest = this.roomById(r.exits[dir]);
            const sealed = dest.boss && this.sealsLit() < 5;
            add(`Go ${dir}: ${dest.name}${sealed ? ' (sealed)' : ''}`, () => this.move(dir));
        });
        (st.roomItems[st.room] || []).forEach(id => add(`Take the ${this.item(id).name}`, () => this.take([this.item(id).names[0]])));
        (r.features || []).forEach(f => {
            if (!st.examined[st.room + ':' + f.names[0]]) add(`Examine the ${f.names[0]}`, () => this.examine(f.names[0].split(' ')));
        });
        if (canDrink) add('Drink a potion (+1 life)', () => this.drink([]));
        add('Look around', () => this.describe());
        add('Check inventory', () => this.showInventory());
        return list;
    };

    return QuestEngine;
});
