// Question-bank export for the certs/ pages: Moodle XML and GIFT.
// Files are built in the browser from the same data the quiz uses and saved as a download.
// Pure builders (moodleXml, gift) take banks and return a string; nothing leaves the page.
(function (root) {
    'use strict';

    const SITE = 'https://oldweb.tech/certs/';
    const LICENSE_URL = 'https://creativecommons.org/licenses/by-nc/4.0/';
    const ATTRIBUTION = 'Questions from oldweb.tech, a Lawson Cyber site (' + SITE + '). ' +
        'Licensed CC BY-NC 4.0 (' + LICENSE_URL + '): share and adapt with attribution, non-commercial use only. ' +
        'Original questions, not affiliated with or endorsed by CompTIA or Cisco.';

    const EXAMS = [
        { id: 'security-plus', name: 'Security+' },
        { id: 'a-plus', name: 'A+' },
        { id: 'network-plus', name: 'Network+' },
        { id: 'cysa-plus', name: 'CySA+' },
        { id: 'ccna', name: 'CCNA' },
        { id: 'ccnp-encor', name: 'CCNP ENCOR' },
        { id: 'ccnp-scor', name: 'CCNP SCOR' },
        { id: 'cisco-ise', name: 'Cisco ISE' }
    ];

    const escHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // Text shown as HTML in Moodle: escape markup, keep line breaks.
    const htmlText = s => escHtml(s).replace(/\r?\n/g, '<br>');
    const cdata = s => '<![CDATA[' + String(s).replace(/\]\]>/g, ']]]]><![CDATA[>') + ']]>';
    const xmlText = s => '<text>' + cdata(htmlText(s)) + '</text>';
    // Moodle XML comments must not contain "--".
    const xmlComment = s => '<!-- ' + String(s).replace(/--/g, '- -') + ' -->';
    // GIFT reserves ~ = # { } : and backslash.
    const giftEsc = s => String(s).replace(/([\\~=#{}:])/g, '\\$1');
    const giftHtml = s => giftEsc(htmlText(s));

    const bankTitle = b => b.exam.startsWith(b.vendor) ? b.exam : b.vendor + ' ' + b.exam;
    const domainName = (b, q) => (b.domains.find(d => d.id === q.domain) || { name: q.domain }).name;

    // Share of the grade per choice. Single: 100 for the right one. Multi: right ones split 100,
    // any wrong pick is -100 so "select everything" cannot score.
    function fractions(q) {
        const n = q.answer.length;
        const right = q.type === 'multi' && n > 1 ? Number((100 / n).toFixed(5)) : 100;
        const wrong = q.type === 'multi' ? -100 : 0;
        return q.choices.map((_, i) => q.answer.includes(i) ? right : wrong);
    }

    // ---------- Moodle XML ----------
    function moodleQuestion(b, q) {
        const fr = fractions(q);
        const lines = [
            '  <question type="multichoice">',
            '    <name><text>' + escHtml(q.id) + '</text></name>',
            '    <questiontext format="html">' + xmlText(q.q) + '</questiontext>',
            '    <generalfeedback format="html">' + xmlText(q.explain) + '</generalfeedback>',
            '    <defaultgrade>1</defaultgrade>',
            '    <penalty>0.3333333</penalty>',
            '    <hidden>0</hidden>',
            '    <single>' + (q.type === 'multi' ? 'false' : 'true') + '</single>',
            '    <shuffleanswers>true</shuffleanswers>',
            '    <answernumbering>abc</answernumbering>',
            '    <correctfeedback format="html"><text></text></correctfeedback>',
            '    <partiallycorrectfeedback format="html"><text></text></partiallycorrectfeedback>',
            '    <incorrectfeedback format="html"><text></text></incorrectfeedback>',
            '    <tags><tag><text>' + escHtml(domainName(b, q)) + '</text></tag>' +
                (q.objective ? '<tag><text>objective ' + escHtml(q.objective) + '</text></tag>' : '') + '</tags>'
        ];
        q.choices.forEach((c, i) => {
            lines.push('    <answer fraction="' + fr[i] + '" format="html">',
                '      ' + xmlText(c),
                '      <feedback format="html">' + xmlText((q.why && q.why[i]) || '') + '</feedback>',
                '    </answer>');
        });
        lines.push('  </question>');
        return lines.join('\n');
    }

    function moodleBank(b) {
        const cat = '$course$/top/oldweb.tech/' + bankTitle(b);
        const head = [
            '  <question type="category">',
            '    <category><text>' + escHtml(cat) + '</text></category>',
            '    <info format="html"><text>' + escHtml(ATTRIBUTION) + '</text></info>',
            '  </question>'
        ].join('\n');
        return [head].concat(b.questions.map(q => moodleQuestion(b, q))).join('\n');
    }

    function moodleXml(banks) {
        return '<?xml version="1.0" encoding="UTF-8"?>\n' + xmlComment(ATTRIBUTION) + '\n<quiz>\n' +
            banks.map(moodleBank).join('\n') + '\n</quiz>\n';
    }

    // ---------- GIFT ----------
    function giftQuestion(b, q) {
        const fr = fractions(q);
        const multi = q.type === 'multi';
        const ans = q.choices.map((c, i) => {
            const mark = multi ? '~%' + fr[i] + '%' : (fr[i] === 100 ? '=' : '~');
            const why = (q.why && q.why[i]) ? '#' + giftHtml(q.why[i]) : '';
            return mark + giftHtml(c) + why;
        });
        return '// ' + domainName(b, q) + (q.objective ? ', objective ' + q.objective : '') + '\n' +
            '::' + giftEsc(q.id) + '::[html]' + giftHtml(q.q) + ' {\n' +
            ans.join('\n') + '\n####' + giftHtml(q.explain) + '\n}\n';
    }

    function giftBank(b) {
        return '$CATEGORY: $course$/top/oldweb.tech/' + bankTitle(b) + '\n\n' +
            b.questions.map(q => giftQuestion(b, q)).join('\n');
    }

    function gift(banks) {
        const head = ATTRIBUTION.match(/.{1,100}(\s|$)/g).map(l => '// ' + l.trim()).join('\n');
        return head + '\n\n' + banks.map(giftBank).join('\n');
    }

    // ---------- Saving ----------
    const FORMATS = {
        moodle: { build: moodleXml, ext: 'xml', mime: 'application/xml', label: 'Moodle XML' },
        gift: { build: gift, ext: 'txt', mime: 'text/plain', label: 'GIFT' }
    };

    function fileName(slug, format) {
        return 'oldweb-' + slug + '-' + format + (format === 'gift' ? '.gift' : '') + '.' + FORMATS[format].ext;
    }

    function save(banks, slug, format) {
        const f = FORMATS[format];
        const blob = new Blob([f.build(banks)], { type: f.mime + ';charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName(slug, format);
        document.body.append(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        return a.download;
    }

    // Each data file assigns window.CERT_BANK, so load them one at a time and collect.
    function loadBank(id) {
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'data/' + id + '.js';
            s.onload = () => { const b = root.CERT_BANK; s.remove(); b ? resolve(b) : reject(new Error(id)); };
            s.onerror = () => { s.remove(); reject(new Error(id)); };
            document.head.append(s);
        });
    }
    async function loadAll() {
        const keep = root.CERT_BANK;
        const banks = [];
        try {
            for (const e of EXAMS) banks.push(await loadBank(e.id));
        } finally {
            root.CERT_BANK = keep;
        }
        return banks;
    }

    // ---------- Buttons ----------
    // mount(container, { banks: () => Promise<bank[]>, slug, name }) adds one button per format.
    function mount(container, opts) {
        const status = document.createElement('span');
        status.className = 'export-status';
        status.setAttribute('role', 'status');
        Object.keys(FORMATS).forEach(key => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn small';
            btn.textContent = FORMATS[key].label;
            btn.setAttribute('aria-label', 'Download ' + opts.name + ' as ' + FORMATS[key].label);
            btn.addEventListener('click', async () => {
                btn.disabled = true;
                try {
                    const name = save(await opts.banks(), opts.slug, key);
                    status.textContent = 'Saved ' + name;
                } catch (err) {
                    status.textContent = 'Could not build the file. Refresh and try again.';
                } finally {
                    btn.disabled = false;
                }
            });
            container.append(btn);
        });
        container.append(status);
    }

    // Pages opt in with markup: #export-bank (exam page, uses window.CERT_BANK) or
    // #export-list (index: one row per exam plus a combined row, banks loaded on click).
    function autoMount() {
        const one = document.getElementById('export-bank');
        if (one && root.CERT_BANK) {
            const b = root.CERT_BANK;
            mount(one, { banks: () => Promise.resolve([b]), slug: b.id, name: bankTitle(b) });
        }
        const list = document.getElementById('export-list');
        if (list) {
            let all;
            const rows = EXAMS.map(e => ({ slug: e.id, name: e.name, banks: () => loadBank(e.id).then(b => [b]) }))
                .concat([{ slug: 'all', name: 'all 8 exams', label: 'All 8 exams', banks: () => all || (all = loadAll()) }]);
            rows.forEach(r => {
                const li = document.createElement('li');
                const name = document.createElement('span');
                name.className = 'export-name';
                name.textContent = r.label || r.name;
                const actions = document.createElement('span');
                actions.className = 'row-actions';
                li.append(name, actions);
                list.append(li);
                mount(actions, r);
            });
        }
    }
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoMount);
        else autoMount();
    }

    root.CertExport = { EXAMS, ATTRIBUTION, moodleXml, gift, fileName, loadAll, mount };
})(typeof window !== 'undefined' ? window : globalThis);
