# Writing a Datacenter Quest quest

A quest is one file, `games/quest/quests/<id>.js`, that registers its own
question topics and its own world. `quests/classic.js` is the reference.

## File shape

```js
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('../questions.js'), require('../world.js'));
    else factory(root.QuestQuestions, root.QuestWorld);
})(typeof self !== 'undefined' ? self : this, function (Q, W) {
    'use strict';
    const { pick, randInt, shuffle, fromPool } = Q.util;

    Q.registerTopics({ /* '<id>-<topic>': { label, gen } */ });

    W.register({ id, name, blurb, target, epilogue, items, acts, rooms });
});
```

Then add `<script src="quest/quests/<id>.js"></script>` to `games/datacenter-quest.html`,
after `quest/world.js` and before `quest/engine.js`.

## Topics

- Topic ids are `<quest id>-<name>`, e.g. `cisco-acl`. They must be unique.
- `gen(rng)` returns `{ q, answer, norm, distractors, hint, accept?, tol? }`.
  - `norm` is a key of `Q.NORMALIZERS`: `text` (case-insensitive), `int`, `num` (with `tol`),
    `ipv4`, `cidr`, `hex`, `bin8`, `octal`, `symbolic`, `osi`, `time`, `ipv6full`,
    `ipv6short`, `sequence` (letters like `BDAC`), `code` (case-sensitive, ignores
    whitespace, treats `'` and `"` alike), `ios` (network OS commands: each keyword may be
    shortened to any prefix of 2+ letters, as IOS allows; words with digits must be exact).
  - `accept` lists other spellings that are also right (`['sh ip ro', 'show ip route']`).
  - `distractors`: at least 6 plausible wrong answers. Make them real mistakes, not jokes.
  - `hint`: a nudge that does not give the answer away.
  - Numeric answers (`int`/`num`) get extra near-miss distractors automatically. Return
    `noPad: true` when valid answers come in fixed steps (STP priorities, multiples of 4096)
    so the padding doesn't add options that are obviously impossible.
  - For `sequence` questions, `Q.util.permutations('BDAC')` lists every ordering; shuffle
    it and take a few as distractors.
- Pool topics: `fromPool(POOL, defaultNorm)` where each entry is
  `[question, answer, [distractors], hint, norm?, [extra accepted]?]`. Give each pool
  at least 6 entries so replays vary.
- Generated topics: compute the answer from random inputs (`randInt(rng, lo, hi)`,
  `pick(rng, arr)`). Use only `rng`, never `Math.random`, so a saved seed replays.
- Shared topics in `questions.js` (`subnet`, `vlsm`, `chmod`, `cron`, `routing`, `ipv6`,
  `dns`, `ports`, ...) may be reused, but most of a quest's topics should be its own.
- Facts must be correct for current versions. If a default changed between versions,
  say which version the question means, or pick a different fact. Never guess.

## World

- `id`, `name` (picker label), `blurb` (one line for the picker), `target` (what gets
  restored, used in "restored X"), `epilogue` (one or two sentences after the win).
- `acts`: exactly 3, `{ n, name, start, boss, key, intro }`. Difficulty rises:
  Act 1 help-desk / associate, Act 2 admin / professional, Act 3 senior / expert.
- `rooms`: exactly 10 per act:
  - 1 hub (`start`): plain room, no quiz. The boss room is reached from it.
  - 5 quiz rooms: `quiz: { topic, guardian, intro, cleared }`. `guardian` is lower case
    with an article ("the Bridge Troll"); `intro` is how it blocks you; `cleared` is
    how it lets you pass.
  - 3 exploration rooms: one hides the act's potion behind a feature
    (`features: [{ names, text, reveals: '<potion id>' }]`), one holds the act's key
    item (`items: ['<key id>']`), one is lore or jokes.
  - 1 boss room: `boss: true, bossFight: { name, topics: [t1, t2], key, locked, intro, win }`.
    `locked` is shown without the key; `intro` when the key is used; `win` after both
    questions. Act 3's `win` is the moment the target comes back.
- Exits are `north`/`south`/`east`/`west` only, always two-way, never across acts.
  Quiz rooms should sit between the hub and the exploration rooms so guardians gate
  the way forward.
- `items`: potions (`kind: 'potion'`, 3, one per act), keys (`kind: 'key'`, 3), and
  optional junk (`kind: 'junk'`, may have a `use` line). `names` are the words a player
  types; put the most natural one first.

## Voice

Second person, dry on-call humor, 2-4 sentences per room. The player may be a wizard,
knight or rogue, so never name or assume the character ("you", not "the wizard").
Jokes should land for people who do the job; the funniest ones double as hints.

## Checking

```
QUEST=<id> node games/quest/tests/test-quest.js
```

This validates the world shape, fuzzes every topic over 1,500 seeds, and plays the
quest to victory with every character in both play modes. It must report 0 failures.
