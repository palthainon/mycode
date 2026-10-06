/*
 * Datacenter Quest - registry of quests and playable characters.
 *
 * Each quest lives in quests/<id>.js and calls register() with its own items,
 * acts and rooms. validate() checks the shape described in QUEST-AUTHORING.md;
 * the tests run it on every quest file.
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.QuestWorld = factory();
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const CHARACTERS = {
        wizard: {
            name: 'Wizard', maxLives: 3, freeHints: 1, sneaks: 0,
            perk: 'Lorekeeper: one free hint per act.',
            intro: 'You straighten your hat, grab your staff with the console port in the orb, and head out.',
            ranks: ['Archmage of Uptime', 'Senior Wizard', 'Wizard on Probation']
        },
        knight: {
            name: 'Knight', maxLives: 4, freeHints: 0, sneaks: 0,
            perk: 'Plate armor: 4 lives instead of 3.',
            intro: 'You buckle on your armor, sling your shield with the vendor stickers on it, and head out.',
            ranks: ['Paladin of Uptime', 'Knight of the Rack', 'Squire on Probation']
        },
        rogue: {
            name: 'Rogue', maxLives: 3, freeHints: 0, sneaks: 1,
            perk: 'Shadowstep: once per act, "sneak" past a guardian without answering.',
            intro: 'You pull up your hood, check your lockpicks and a cloned badge, and slip out.',
            ranks: ['Shadow of Uptime', 'Master of Side Doors', 'Pickpocket on Probation']
        }
    };

    const QUESTS = {};

    function register(quest) {
        if (QUESTS[quest.id]) throw new Error('Duplicate quest id: ' + quest.id);
        QUESTS[quest.id] = quest;
    }

    // Returns a list of problems; empty means the quest is well formed
    function validate(quest) {
        const errs = [];
        const rooms = quest.rooms || {};
        const items = quest.items || {};
        const need = (cond, msg) => { if (!cond) errs.push(msg); };
        need(quest.id && quest.name && quest.blurb && quest.target && quest.epilogue, 'quest needs id, name, blurb, target, epilogue');
        need(Array.isArray(quest.acts) && quest.acts.length === 3, 'quest needs exactly 3 acts');
        (quest.acts || []).forEach((act, i) => {
            const ids = Object.keys(rooms).filter(id => rooms[id].act === i + 1);
            const tag = `act ${i + 1}`;
            need(act.n === i + 1, `${tag}: n should be ${i + 1}`);
            need(act.name && act.intro, `${tag}: needs name and intro`);
            need(ids.length === 10, `${tag}: has ${ids.length} rooms, needs 10`);
            need(ids.filter(id => rooms[id].quiz).length === 5, `${tag}: needs 5 quiz rooms`);
            need(ids.filter(id => rooms[id].boss).length === 1, `${tag}: needs 1 boss room`);
            need(rooms[act.start] && rooms[act.start].act === i + 1 && !rooms[act.start].quiz && !rooms[act.start].boss, `${tag}: start must be a plain room in this act`);
            need(rooms[act.boss] && rooms[act.boss].boss && rooms[act.boss].act === i + 1, `${tag}: boss must be this act's boss room`);
            need(items[act.key] && items[act.key].kind === 'key', `${tag}: key item ${act.key} must exist with kind "key"`);
            need(ids.filter(id => (rooms[id].items || []).includes(act.key)).length === 1, `${tag}: key item must be placed in exactly one room`);
            const potions = ids.filter(id => (rooms[id].features || []).some(f => f.reveals && items[f.reveals] && items[f.reveals].kind === 'potion'));
            need(potions.length === 1, `${tag}: exactly one room must hide a potion behind a feature`);
            const boss = rooms[act.boss];
            if (boss && boss.bossFight) {
                need(boss.bossFight.key === act.key, `${tag}: boss fight key must be the act key`);
                need(Array.isArray(boss.bossFight.topics) && boss.bossFight.topics.length === 2, `${tag}: boss needs 2 topics`);
                need(boss.bossFight.name && boss.bossFight.locked && boss.bossFight.intro && boss.bossFight.win, `${tag}: boss needs name, locked, intro, win`);
            } else {
                need(false, `${tag}: boss room needs bossFight`);
            }
            // every room reachable from the start
            const seen = new Set([act.start]);
            const queue = [act.start];
            while (queue.length) {
                const r = rooms[queue.shift()];
                if (!r) continue;
                Object.values(r.exits || {}).forEach(d => { if (!seen.has(d)) { seen.add(d); queue.push(d); } });
            }
            ids.forEach(id => need(seen.has(id), `${tag}: ${id} is unreachable from ${act.start}`));
        });
        Object.entries(rooms).forEach(([id, r]) => {
            need(r.name && r.text, `${id}: needs name and text`);
            Object.entries(r.exits || {}).forEach(([dir, dest]) => {
                need(['north', 'south', 'east', 'west'].includes(dir), `${id}: exit "${dir}" must be north/south/east/west`);
                need(rooms[dest], `${id}: exit ${dir} leads to missing room ${dest}`);
                if (rooms[dest]) {
                    need(rooms[dest].act === r.act, `${id}: exit ${dir} crosses into another act`);
                    need(Object.values(rooms[dest].exits || {}).includes(id), `${id}: ${dest} has no exit back`);
                }
            });
            if (r.quiz) need(r.quiz.topic && r.quiz.guardian && r.quiz.intro && r.quiz.cleared, `${id}: quiz needs topic, guardian, intro, cleared`);
            (r.items || []).forEach(it => need(items[it], `${id}: unknown item ${it}`));
            need((r.features || []).length >= 1, `${id}: needs at least one feature to examine`);
            (r.features || []).forEach(f => {
                need(Array.isArray(f.names) && f.names.length && f.text, `${id}: feature needs names and text`);
                if (f.reveals) need(items[f.reveals], `${id}: feature reveals unknown item ${f.reveals}`);
                if (f.clue) need(quest.mystery && quest.mystery.clues && quest.mystery.clues[f.clue], `${id}: feature clue ${f.clue} is not in mystery.clues`);
                Object.keys(f.extra || {}).forEach(c => need(CHARACTERS[c], `${id}: feature extra for unknown character ${c}`));
                Object.keys(f.uses || {}).forEach(it => need(items[it], `${id}: feature uses unknown item ${it}`));
            });
            Object.keys(r.sense || {}).forEach(s => need(['listen', 'smell', 'touch'].includes(s), `${id}: sense "${s}" must be listen, smell or touch`));
        });
        Object.entries(items).forEach(([id, it]) => {
            need(it.name && Array.isArray(it.names) && it.names.length && it.desc, `item ${id}: needs name, names, desc`);
            need(['potion', 'key', 'junk', 'curio'].includes(it.kind), `item ${id}: kind must be potion, key, junk or curio`);
        });

        // Where each item can be found: lying in a room, or revealed by a feature
        const placed = {};
        Object.entries(rooms).forEach(([id, r]) => {
            (r.items || []).forEach(it => (placed[it] = placed[it] || []).push(r.act));
            (r.features || []).forEach(f => { if (f.reveals) (placed[f.reveals] = placed[f.reveals] || []).push(r.act); });
        });
        const curios = Object.keys(items).filter(id => items[id].kind === 'curio');
        curios.forEach(id => need((placed[id] || []).length === 1, `curio ${id}: must be placed exactly once`));
        [1, 2, 3].forEach(n => need(curios.filter(id => (placed[id] || [])[0] === n).length >= 2, `act ${n}: needs at least 2 curios`));

        const m = quest.mystery;
        need(m && m.title && m.clues && m.solved, 'quest needs mystery { title, clues, solved }');
        if (m && m.clues) {
            const ids = Object.keys(m.clues);
            need(ids.length >= 3 && ids.length <= 5, 'mystery needs 3 to 5 clues');
            const clueActs = new Set();
            ids.forEach(c => {
                const where = Object.values(rooms).filter(r => (r.features || []).some(f => f.clue === c));
                need(where.length === 1, `mystery clue ${c}: must be on exactly one feature`);
                where.forEach(r => clueActs.add(r.act));
            });
            need(clueActs.size === 3, 'mystery clues must be spread across all 3 acts');
        }
        (quest.ambient || []).forEach((a, i) => need([1, 2, 3].includes(a.act) && a.text, `ambient ${i}: needs act 1-3 and text`));
        return errs;
    }

    return { CHARACTERS, QUESTS, register, validate };
});
