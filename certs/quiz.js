// Practice-test engine for the certs/ pages.
// Each exam page loads its bank (data/<exam>.js sets window.CERT_BANK) and then this file.
// Everything runs in the browser; progress is kept in localStorage under the exam id.
(function () {
    'use strict';

    const bank = window.CERT_BANK;
    const root = document.getElementById('quiz');
    if (!root) return;
    if (!bank || !Array.isArray(bank.questions) || !bank.questions.length) {
        root.innerHTML = '<div class="box"><div class="box-body"><p>The question bank did not load. Refresh the page; if it keeps happening, the file may be missing.</p></div></div>';
        return;
    }

    const STORE_KEY = 'cert-' + bank.id;
    const LETTERS = 'ABCDEF';
    const domainById = Object.fromEntries(bank.domains.map(d => [d.id, d]));

    // ---------- Saved progress: last result per question ----------
    // { results: { [questionId]: { right: n, wrong: n, last: true|false } } }
    let saved = StorageUtils.load(STORE_KEY, { results: {} });
    if (!saved || typeof saved.results !== 'object') saved = { results: {} };
    function record(q, right) {
        const r = saved.results[q.id] || { right: 0, wrong: 0, last: null };
        if (right) r.right++; else r.wrong++;
        r.last = right;
        saved.results[q.id] = r;
        StorageUtils.save(STORE_KEY, saved);
    }

    // ---------- Helpers ----------
    function el(tag, attrs, ...kids) {
        const node = document.createElement(tag);
        Object.entries(attrs || {}).forEach(([k, v]) => {
            if (v === null || v === undefined || v === false) return;
            if (k === 'class') node.className = v;
            else if (k === 'text') node.textContent = v;
            else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
            else node.setAttribute(k, v === true ? '' : v);
        });
        kids.flat().forEach(kid => {
            if (kid === null || kid === undefined || kid === false) return;
            node.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
        });
        return node;
    }
    function shuffle(list) {
        const a = list.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
    const pct = (n, d) => d ? Math.round(n / d * 100) : 0;
    const sameSet = (a, b) => a.length === b.length && a.every(x => b.includes(x));

    // ---------- State ----------
    const session = {
        list: [],          // questions in this run, each with a shuffled choice order
        index: 0,
        picks: [],         // per question: array of original choice indexes the user chose
        checked: [],       // per question: has it been graded
        mode: 'practice'   // practice: grade each question; exam: grade at the end
    };

    // Shuffle choices per question but keep the original indexes so answers still line up
    function prepare(q) {
        const order = shuffle(q.choices.map((_, i) => i));
        return { q, order };
    }

    // ---------- Setup screen ----------
    function renderSetup() {
        root.textContent = '';
        const seen = bank.questions.filter(q => saved.results[q.id]);
        const lastRight = seen.filter(q => saved.results[q.id].last).length;
        const missed = bank.questions.filter(q => saved.results[q.id] && saved.results[q.id].last === false);
        const unseen = bank.questions.filter(q => !saved.results[q.id]);

        const domainRows = bank.domains.map(d => {
            const qs = bank.questions.filter(q => q.domain === d.id);
            const done = qs.filter(q => saved.results[q.id]);
            const right = done.filter(q => saved.results[q.id].last).length;
            return el('label', { class: 'domain-pick' },
                el('input', { type: 'checkbox', value: d.id, checked: true, name: 'domain' }),
                el('span', { class: 'domain-name' }, d.name),
                el('span', { class: 'domain-meta' },
                    `${qs.length} q · ${d.weight}% of exam` + (done.length ? ` · you: ${pct(right, done.length)}%` : ''))
            );
        });

        const progressText = seen.length
            ? `You've answered ${seen.length} of ${bank.questions.length} questions; ${pct(lastRight, seen.length)}% right on your latest try.`
            : `${bank.questions.length} questions. Nothing answered yet on this device.`;

        const form = el('form', { class: 'box setup', 'aria-labelledby': 'setup-heading', onsubmit: e => { e.preventDefault(); start(new FormData(form)); } },
            el('div', { class: 'box-head' }, el('h2', { id: 'setup-heading' }, 'set up a practice run')),
            el('div', { class: 'box-body' },
                el('p', { class: 'progress-note' }, progressText),
                el('fieldset', {},
                    el('legend', {}, 'Domains'),
                    el('div', { class: 'domain-list' }, domainRows),
                    el('div', { class: 'row-actions' },
                        el('button', { type: 'button', class: 'btn small', onclick: () => toggleAll(form, true) }, 'All'),
                        el('button', { type: 'button', class: 'btn small', onclick: () => toggleAll(form, false) }, 'None'))
                ),
                el('div', { class: 'setup-grid' },
                    el('fieldset', {},
                        el('legend', {}, 'How many'),
                        ['10', '25', '50', 'all'].map((n, i) => el('label', { class: 'pill' },
                            el('input', { type: 'radio', name: 'count', value: n, checked: i === 0 }), n === 'all' ? 'All' : n))
                    ),
                    el('fieldset', {},
                        el('legend', {}, 'Which questions'),
                        el('label', { class: 'pill' }, el('input', { type: 'radio', name: 'pool', value: 'any', checked: true }), 'Any'),
                        el('label', { class: 'pill' }, el('input', { type: 'radio', name: 'pool', value: 'unseen', disabled: !unseen.length }), `Not seen yet (${unseen.length})`),
                        el('label', { class: 'pill' }, el('input', { type: 'radio', name: 'pool', value: 'missed', disabled: !missed.length }), `Missed last time (${missed.length})`)
                    ),
                    el('fieldset', {},
                        el('legend', {}, 'Mode'),
                        el('label', { class: 'pill' }, el('input', { type: 'radio', name: 'mode', value: 'practice', checked: true }), 'Practice: answer shown after each question'),
                        el('label', { class: 'pill' }, el('input', { type: 'radio', name: 'mode', value: 'exam' }), 'Exam: answers shown at the end')
                    )
                ),
                el('p', { id: 'setup-error', class: 'setup-error', role: 'alert' }),
                el('div', { class: 'row-actions' },
                    el('button', { type: 'submit', class: 'btn primary' }, 'Start'),
                    el('button', {
                        type: 'button', class: 'btn secondary',
                        'aria-label': 'Clear all saved progress for this exam from this browser',
                        onclick: clearAllSavedData
                    }, 'Clear Saved Data'))
            )
        );
        root.append(form);
    }

    function toggleAll(form, on) {
        form.querySelectorAll('input[name="domain"]').forEach(cb => { cb.checked = on; });
    }

    function start(data) {
        const domains = data.getAll('domain');
        const err = document.getElementById('setup-error');
        if (!domains.length) {
            err.textContent = 'Pick at least one domain.';
            A11yUtils.announce('Pick at least one domain.', 'assertive');
            return;
        }
        let pool = bank.questions.filter(q => domains.includes(q.domain));
        const which = data.get('pool');
        if (which === 'unseen') pool = pool.filter(q => !saved.results[q.id]);
        if (which === 'missed') pool = pool.filter(q => saved.results[q.id] && saved.results[q.id].last === false);
        if (!pool.length) {
            err.textContent = 'No questions match those choices. Try more domains or "Any".';
            A11yUtils.announce(err.textContent, 'assertive');
            return;
        }
        const count = data.get('count') === 'all' ? pool.length : Math.min(pool.length, Number(data.get('count')));
        beginRun(shuffle(pool).slice(0, count), data.get('mode'));
    }

    function beginRun(questions, mode) {
        session.list = questions.map(prepare);
        session.index = 0;
        session.picks = questions.map(() => []);
        session.checked = questions.map(() => false);
        session.mode = mode;
        renderQuestion();
    }

    // ---------- Question screen ----------
    function renderQuestion() {
        const { q, order } = session.list[session.index];
        const n = session.index + 1, total = session.list.length;
        const picks = session.picks[session.index];
        const graded = session.checked[session.index];
        const multi = q.type === 'multi';
        const need = q.answer.length;
        const domain = domainById[q.domain];

        root.textContent = '';
        const choiceList = el('div', { class: 'choices', role: multi ? 'group' : 'radiogroup', 'aria-labelledby': 'q-stem' },
            order.map((orig, pos) => {
                const chosen = picks.includes(orig);
                const isAnswer = q.answer.includes(orig);
                let state = '';
                if (graded) state = isAnswer ? ' correct' : chosen ? ' wrong' : '';
                const btn = el('button', {
                    type: 'button',
                    class: 'choice' + (chosen ? ' chosen' : '') + state,
                    role: multi ? 'checkbox' : 'radio',
                    'aria-checked': String(chosen),
                    'aria-disabled': graded ? 'true' : null,
                    'data-orig': orig,
                    onclick: () => pick(orig)
                },
                    el('span', { class: 'choice-key', 'aria-hidden': 'true' }, LETTERS[pos]),
                    el('span', { class: 'choice-text' }, q.choices[orig]),
                    graded && isAnswer ? el('span', { class: 'sr-only' }, ' (correct answer)') : null,
                    graded && chosen && !isAnswer ? el('span', { class: 'sr-only' }, ' (your answer, incorrect)') : null
                );
                return btn;
            })
        );

        const actions = el('div', { class: 'row-actions' });
        if (!graded && session.mode === 'practice') {
            actions.append(el('button', { type: 'button', class: 'btn primary', id: 'btn-check', disabled: picks.length !== need, onclick: check }, 'Check answer'));
        }
        if (session.mode === 'exam' && !graded) {
            if (session.index > 0) actions.append(el('button', { type: 'button', class: 'btn', onclick: () => go(-1) }, 'Back'));
            actions.append(el('button', { type: 'button', class: 'btn primary', id: 'btn-next', disabled: picks.length !== need, onclick: () => (n === total ? finishExam() : go(1)) }, n === total ? 'Finish and score' : 'Next'));
        }
        if (graded && session.mode === 'practice') {
            actions.append(el('button', { type: 'button', class: 'btn primary', id: 'btn-next', onclick: () => (n === total ? renderResults() : go(1)) }, n === total ? 'See results' : 'Next question'));
        }
        actions.append(el('button', { type: 'button', class: 'btn secondary', onclick: () => { if (confirmQuit()) renderSetup(); } }, 'End run'));

        const box = el('section', { class: 'box question', 'aria-labelledby': 'q-count' },
            el('div', { class: 'box-head' },
                el('h2', { id: 'q-count' }, `question ${n} of ${total}`),
                el('span', { class: 'q-domain' }, domain ? domain.name : '', q.objective ? ` · obj ${q.objective}` : '')
            ),
            el('div', { class: 'box-body' },
                el('div', { class: 'meter', 'aria-hidden': 'true' }, el('span', { style: `width:${pct(session.index, total)}%` })),
                el('p', { class: 'q-stem', id: 'q-stem', tabindex: '-1' }, q.q),
                multi ? el('p', { class: 'q-hint' }, `Choose ${need}.`) : null,
                choiceList,
                graded ? feedback(q, picks, order) : null,
                actions,
                el('p', { class: 'keys-hint' }, 'Keys: A-', LETTERS[order.length - 1], ' or 1-', String(order.length), ' to choose, Enter to check or continue.')
            )
        );
        root.append(box);
    }

    function feedback(q, picks, order) {
        const right = sameSet(picks, q.answer);
        return el('div', { class: 'feedback ' + (right ? 'is-right' : 'is-wrong'), role: 'status' },
            el('p', { class: 'verdict' }, right ? 'Correct.' : 'Not quite.'),
            el('p', {}, q.explain),
            el('ul', { class: 'why-list' },
                order.map((orig, pos) => el('li', { class: q.answer.includes(orig) ? 'why-right' : '' },
                    el('strong', {}, LETTERS[pos] + ': '), q.why[orig])))
        );
    }

    function pick(orig) {
        if (session.checked[session.index]) return;
        const { q } = session.list[session.index];
        const picks = session.picks[session.index];
        if (q.type === 'multi') {
            const at = picks.indexOf(orig);
            if (at >= 0) picks.splice(at, 1);
            else if (picks.length < q.answer.length) picks.push(orig);
            else { picks.shift(); picks.push(orig); }
        } else {
            picks.length = 0;
            picks.push(orig);
        }
        const focusOrig = orig;
        renderQuestion();
        const again = root.querySelector(`.choice[data-orig="${focusOrig}"]`);
        if (again) again.focus();
    }

    function check() {
        const { q } = session.list[session.index];
        const picks = session.picks[session.index];
        if (picks.length !== q.answer.length) return;
        session.checked[session.index] = true;
        const right = sameSet(picks, q.answer);
        record(q, right);
        renderQuestion();
        A11yUtils.announce(right ? 'Correct.' : 'Not quite. ' + q.explain, 'polite');
        const next = document.getElementById('btn-next');
        if (next) next.focus();
    }

    function go(step) {
        session.index = Math.max(0, Math.min(session.list.length - 1, session.index + step));
        renderQuestion();
        document.getElementById('q-stem').focus();
    }

    function confirmQuit() {
        const answered = session.picks.filter(p => p.length).length;
        const note = session.mode === 'exam' ? ' Exam-mode answers are only saved when you finish.' : ' Checked answers are already saved.';
        return answered === 0 || window.confirm('End this run?' + note);
    }

    function finishExam() {
        session.list.forEach(({ q }, i) => {
            session.checked[i] = true;
            record(q, sameSet(session.picks[i], q.answer));
        });
        renderResults();
    }

    // ---------- Results ----------
    function renderResults() {
        root.textContent = '';
        const rows = session.list.map(({ q }, i) => ({ q, i, right: sameSet(session.picks[i], q.answer) }));
        const score = rows.filter(r => r.right).length;
        const byDomain = bank.domains.map(d => {
            const r = rows.filter(x => x.q.domain === d.id);
            return { d, n: r.length, right: r.filter(x => x.right).length };
        }).filter(x => x.n);
        const missed = rows.filter(r => !r.right);

        const box = el('section', { class: 'box results', 'aria-labelledby': 'results-heading' },
            el('div', { class: 'box-head' }, el('h2', { id: 'results-heading', tabindex: '-1' }, 'results')),
            el('div', { class: 'box-body' },
                el('p', { class: 'score' }, el('strong', {}, `${score} / ${rows.length}`), ` (${pct(score, rows.length)}%)`),
                el('table', { class: 'data-table' },
                    el('caption', { class: 'sr-only' }, 'Score by domain'),
                    el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, 'Domain'), el('th', { scope: 'col' }, 'Right'), el('th', { scope: 'col' }, '%'))),
                    el('tbody', {}, byDomain.map(x => el('tr', {},
                        el('td', {}, x.d.name), el('td', {}, `${x.right} / ${x.n}`), el('td', {}, `${pct(x.right, x.n)}%`))))
                ),
                el('div', { class: 'row-actions' },
                    missed.length ? el('button', { type: 'button', class: 'btn primary', onclick: () => beginRun(missed.map(r => r.q), 'practice') }, `Retry the ${missed.length} missed`) : null,
                    el('button', { type: 'button', class: 'btn', onclick: renderSetup }, 'New run'))
            )
        );
        root.append(box);

        if (missed.length) {
            root.append(el('section', { class: 'box review', 'aria-labelledby': 'review-heading' },
                el('div', { class: 'box-head' }, el('h2', { id: 'review-heading' }, 'review what you missed')),
                el('div', { class: 'box-body' }, missed.map(({ q, i }) => {
                    const order = session.list[i].order;
                    return el('article', { class: 'review-item' },
                        el('p', { class: 'q-stem' }, q.q),
                        el('p', { class: 'review-answers' },
                            'Your answer: ', session.picks[i].map(o => q.choices[o]).join(' + ') || '(none)'),
                        feedback(q, session.picks[i], order));
                }))
            ));
        }
        document.getElementById('results-heading').focus();
        A11yUtils.announce(`Finished. ${score} of ${rows.length} correct.`, 'polite');
    }

    // ---------- Keyboard ----------
    document.addEventListener('keydown', e => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
        if (document.querySelector('.search-overlay:not([hidden])')) return;
        if (!root.querySelector('.question')) return;
        const { order } = session.list[session.index];
        const key = e.key.toLowerCase();
        let pos = -1;
        if (/^[1-6]$/.test(key)) pos = Number(key) - 1;
        else if (/^[a-f]$/.test(key)) pos = LETTERS.toLowerCase().indexOf(key);
        if (pos >= 0 && pos < order.length) {
            e.preventDefault();
            pick(order[pos]);
        } else if (e.key === 'Enter' && !(t && t.tagName === 'BUTTON' && !t.classList.contains('choice'))) {
            // Enter on a choice (or nowhere in particular) checks or moves on; other buttons keep their own Enter
            const btn = document.getElementById('btn-check') || document.getElementById('btn-next');
            if (btn && !btn.disabled) { e.preventDefault(); btn.click(); }
        }
    });

    // ---------- Saved data ----------
    function clearAllSavedData() {
        if (!window.confirm('Clear your saved progress for this exam?')) return;
        StorageUtils.remove(STORE_KEY);
        saved = { results: {} };
        renderSetup();
        A11yUtils.announce('All saved data has been cleared', 'polite');
    }
    window.clearAllSavedData = clearAllSavedData;

    // ---------- Exam facts on the page ----------
    const facts = document.getElementById('exam-facts');
    if (facts) {
        facts.textContent = '';
        facts.append(
            el('tr', {}, el('td', {}, 'Exam'), el('td', {}, bank.exam.startsWith(bank.vendor) ? bank.exam : `${bank.vendor} ${bank.exam}`)),
            el('tr', {}, el('td', {}, 'Code'), el('td', {}, bank.code)),
            el('tr', {}, el('td', {}, 'Questions here'), el('td', {}, String(bank.questions.length))),
            el('tr', {}, el('td', {}, 'Written against'), el('td', {},
                el('a', { href: bank.objectivesUrl, rel: 'noopener' }, 'official exam objectives'), ` (as of ${bank.asOf})`))
        );
    }

    renderSetup();
})();
