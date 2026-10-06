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
  curios (`kind: 'curio'`, at least 2 per act). `names` are the words a player types; put
  the most natural one first. (`kind: 'junk'` still works but doesn't count; use curios.)
- `mystery` and `ambient`: see Exploration below.

## Exploration

Exploring should pay off even when it doesn't help. `world.js validate()` enforces the
first three rules.

- **Every room has at least one feature**, quiz and boss rooms included. Name the
  features in the room text, so a player who reads carefully knows what to examine. Any
  other noun from the room text gets a generic one-liner, but a real feature is better.
- **Curios** (`kind: 'curio'`) are collectibles that do nothing useful: a funny `desc`, an
  optional `use` line. Each one is placed exactly once, either lying in a room (`items`) or
  turned up by a feature (`reveals: '<curio id>'`). Picking one up counts toward the
  "Curios n/m" tally on the HUD and the victory line.
- **A mystery.** `mystery: { title, clues: { id: 'one-line note' }, solved }`, with 3 to 5
  clues spread across all 3 acts. A feature with `clue: '<id>'` adds that line to the
  player's `notes` when examined. Finding every clue prints `solved` after the epilogue.
  Imply; never explain. The clues should point at something odd about tonight (who
  really caused the outage, who got here first, why the server went down when it did),
  and `solved` should feel like the moment the player realizes, not a confession. The
  answer is left to the player.
- **nightowl.** Every quest has one recurring, never-explained figure in common:
  "nightowl", someone who always seems to have been here a few minutes before you.
  Mention nightowl at least twice per quest (a feature, `again` text or an ambient line).
  Classic makes nightowl its whole mystery; other quests can make it a side note.
- Optional extras for features and rooms:
  - `again: '...'`: shown instead of `text` when the feature is examined a second time.
    A good place for a second joke or an unsettling detail.
  - `extra: { wizard, knight, rogue }`: one aside per character, shown after `text` the
    first time. Use sparingly, 3 to 6 per quest.
  - `uses: { '<item id>': '...' }`: the response to `use <item> on <feature>`. Curios are
    good candidates.
  - Room `sense: { listen, smell, touch }`: answers those verbs in this room. `listen`
    also shows as a choice-mode button. Aim for one sense on most rooms.
- `ambient: [{ act, text }]`: 4 to 6 short lines (about 2 per act) that may play when the
  player walks into a non-boss room, each at most once per act. Things heard or glimpsed
  just out of sight.
- Exploration text must never give away a quiz answer or contradict one. Facts in jokes
  must be right too.

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
