/*
 * Datacenter Quest - Python Realm: Python 3 for automation engineers and sysadmins.
 * Every "What does this print?" answer has been executed on CPython 3.13; snippets avoid
 * behavior that differs between 3.12 and 3.13.
 * Most questions are "what does this print?" and use the `code` normalizer
 * (case-sensitive, whitespace-insensitive, ' and " alike). See QUEST-AUTHORING.md.
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('../questions.js'), require('../world.js'));
    else factory(root.QuestQuestions, root.QuestWorld);
})(typeof self !== 'undefined' ? self : this, function (Q, W) {
    'use strict';
    const { pick, randInt, shuffle, fromPool, ipToInt, intToIp, maskInt } = Q.util;

    // ---------- Python formatting helpers ----------

    const PRINTS = 'What does this print?';
    const py = (...lines) => lines.join('\n');

    // Python repr of a float (shortest round-trip, like JS, but integers keep ".0")
    const pyFloat = x => Number.isInteger(x) ? x.toFixed(1) : String(x);
    // Tuples are wrapped so repr can tell them from lists
    const tup = items => ({ tuple: items });

    function repr(v) {
        if (v === null) return 'None';
        if (v === true) return 'True';
        if (v === false) return 'False';
        if (typeof v === 'number') return String(v);
        if (typeof v === 'string') return "'" + v + "'";
        if (Array.isArray(v)) return '[' + v.map(repr).join(', ') + ']';
        if (v && v.tuple) return '(' + v.tuple.map(repr).join(', ') + (v.tuple.length === 1 ? ',)' : ')');
        if (v instanceof Map) return '{' + [...v].map(([k, x]) => repr(k) + ': ' + repr(x)).join(', ') + '}';
        throw new Error('repr: unsupported value');
    }
    // What print() shows: strings bare, everything else as repr
    const shown = v => typeof v === 'string' ? v : repr(v);

    // Python's range() as a JS array
    function pyRange(start, stop, step) {
        const out = [];
        if (step > 0) for (let i = start; i < stop; i += step) out.push(i);
        else for (let i = start; i > stop; i += step) out.push(i);
        return out;
    }

    // Python slice semantics: seq[start:stop:step], undefined meaning omitted
    function sliceIdx(n, start, stop, step) {
        step = step === undefined ? 1 : step;
        let lo, hi;
        if (step > 0) {
            lo = start === undefined ? 0 : start < 0 ? Math.max(start + n, 0) : Math.min(start, n);
            hi = stop === undefined ? n : stop < 0 ? Math.max(stop + n, 0) : Math.min(stop, n);
        } else {
            lo = start === undefined ? n - 1 : start < 0 ? Math.max(start + n, -1) : Math.min(start, n - 1);
            hi = stop === undefined ? -1 : stop < 0 ? Math.max(stop + n, -1) : Math.min(stop, n - 1);
        }
        return pyRange(lo, hi, step);
    }
    function pySlice(seq, start, stop, step) {
        const items = sliceIdx(seq.length, start, stop, step).map(i => seq[i]);
        return typeof seq === 'string' ? items.join('') : items;
    }

    const floorDiv = (a, b) => Math.floor(a / b);
    const pyMod = (a, b) => a - b * Math.floor(a / b);

    // ================= ACT 1 =================

    const TYPES = [
        [py(PRINTS, 'print(bool("False"))'), 'True', ['False', "'False'", 'None', 'TypeError', 'ValueError', '0'], 'Only empty strings are falsy. Look at the length of this one, not the word inside it.'],
        [py(PRINTS, 'print(bool([]))'), 'False', ['True', '[]', 'None', '0', 'TypeError', "'False'"], 'Empty containers have a famous truth value.'],
        [py(PRINTS, 'print(type(10 / 2))'), "<class 'float'>", ["<class 'int'>", 'float', 'int', '5.0', "<type 'float'>", "<class 'double'>", '5'], 'In Python 3, / never returns the type you might expect from two whole numbers.'],
        [py(PRINTS, 'print(0.1 + 0.2 == 0.3)'), 'False', ['True', '0.3', '0.30000000000000004', 'None', 'TypeError', '1'], 'Binary floating point cannot store a tenth exactly.'],
        [py(PRINTS, 'print("10" + "5")'), '105', ['15', "'105'", 'TypeError', '510', '15.0', '10 + 5'], 'Both operands are strings. + on strings does not do arithmetic.'],
        [py(PRINTS, 'print(3 * "ab")'), 'ababab', ['ab3', "['ab', 'ab', 'ab']", 'TypeError', "'ababab'", 'aaabbb', '3ab'], 'Multiplying a sequence repeats it.'],
        [py(PRINTS, 'print(None == False)'), 'False', ['True', 'None', 'TypeError', '0', "'False'", 'NoneType'], 'None is falsy, but falsy is not the same as equal to False.'],
        [py(PRINTS, 'print(round(2.5))'), '2', ['3', '2.0', '3.0', '2.5', '1', '4'], 'Python 3 rounds halves to the nearest even number.'],
        [py(PRINTS, 'print(int(-3.7))'), '-3', ['-4', '-3.7', '-4.0', '-3.0', '3', '4'], 'int() on a float drops the fractional part. It does not floor.'],
        [py(PRINTS, 'print(len("eth0\\n"))'), '5', ['4', '6', '3', '7', 'TypeError', 'None'], 'Backslash-n is one character, not two.'],
        [py(PRINTS, 'print(10 ** -1)'), '0.1', ['0', '-10', '10', '0.01', '-0.1', 'ValueError'], 'A negative exponent means a reciprocal.'],
        [py(PRINTS, 'print(bool(0.0), bool("0"))'), 'False True', ['True False', 'False False', 'True True', '0.0 0', 'False 0', 'None True'], 'One is a zero number. The other is a non-empty string that happens to contain a zero.']
    ];

    const STRINGS = [
        [py(PRINTS, 'print("/var/log/".strip("/"))'), 'var/log', ['var/log/', '/var/log', 'varlog', "['var', 'log']", 'log', 'var'], 'strip() works on both ends, never the middle.'],
        [py(PRINTS, 'print("GigabitEthernet0/1".lower())'), 'gigabitethernet0/1', ['GigabitEthernet0/1', 'GIGABITETHERNET0/1', 'gigabitEthernet0/1', 'None', "'gigabitethernet0/1'", 'Gigabitethernet0/1'], 'lower() returns a new string with every cased letter lowered.'],
        [py(PRINTS, 'name, vlan = "sw1", 10', 'print(f"{name}-vl{vlan:04d}")'), 'sw1-vl0010', ['sw1-vl10', 'sw1-vl1000', 'sw1-vl 10', '{name}-vl{vlan:04d}', 'sw1-vl0004', 'sw1-vl010'], 'The format spec 04d means width four, padded with zeros.'],
        [py(PRINTS, 'print(f"{3.14159:.2f}")'), '3.14', ['3.15', '3.1', '3.14159', '3.142', '3', '3.1416'], '.2f means exactly two digits after the decimal point.'],
        [py(PRINTS, 'print(f"{255:x}")'), 'ff', ['FF', '0xff', '0xFF', '255', '11111111', '377'], 'Lower-case x means lower-case hexadecimal with no prefix.'],
        [py(PRINTS, 'print(f"{10:08b}")'), '00001010', ['1010', '10100000', '0b1010', '00000010', '00010100', '0b00001010'], 'b is binary. 08 pads to eight digits with zeros on the left.'],
        [py(PRINTS, 'print("a,b,c".upper().replace(",", ";"))'), 'A;B;C', ['a;b;c', 'A,B,C', 'A;b;c', "['A', 'B', 'C']", 'ABC', 'A;B,C'], 'Methods chain left to right, and replace() changes every match by default.'],
        [py(PRINTS, 'print("router.example.com".split(".")[0])'), 'router', ['example', 'com', "['router']", 'r', "'router'", 'router.example'], 'split() gives a list, and [0] takes its first item.'],
        [py(PRINTS, 'print("vlan" in "Vlan100")'), 'False', ['True', '0', '-1', 'None', '1', 'TypeError'], 'Substring tests are case-sensitive.'],
        [py(PRINTS, 'print("10.0.0.1".count("."))'), '3', ['4', '2', '1', '0', '-1', '7'], 'Count the dots, not the octets.'],
        [py(PRINTS, 'print("router".find("z"))'), '-1', ['None', '0', 'ValueError', 'False', '6', 'IndexError'], 'find() does not raise when nothing matches. index() does.'],
        [py(PRINTS, 'print("Error: disk full".find("disk"))'), '7', ['8', '6', '1', '-1', '11', 'True'], 'Indexes start at zero. Count the characters before the match, including the space.']
    ];

    function genIndex(rng) {
        const isPorts = rng() < 0.5;
        const pool = isPorts ? [22, 53, 80, 123, 443, 514, 3389, 8080] : ['web1', 'web2', 'db1', 'db2', 'lb1', 'cache1', 'dns1'];
        const name = isPorts ? 'ports' : 'hosts';
        const n = randInt(rng, 5, 7);
        const xs = shuffle(rng, pool).slice(0, n);
        let idx = randInt(rng, -n, n - 1);
        if (rng() < 0.12) idx = pick(rng, [n, -n - 1]);
        const valid = idx >= -n && idx < n;
        const answer = valid ? shown(xs[(idx + n) % n]) : 'IndexError';
        const distractors = xs.map(shown).concat(['IndexError', 'None', 'KeyError']);
        if (valid && !isPorts) distractors.push(repr(xs[(idx + n) % n]));
        return {
            q: py(PRINTS, `${name} = ${repr(xs)}`, `print(${name}[${idx}])`),
            answer, norm: 'code', distractors: shuffle(rng, distractors),
            accept: valid ? [answer] : ['IndexError', 'IndexError: list index out of range'],
            hint: `The list has ${n} items. Valid indexes run from 0 to ${n - 1}, or from -1 back to -${n}.`
        };
    }

    function genDivmod(rng) {
        let a = randInt(rng, 7, 60) * pick(rng, [1, -1]);
        const b = randInt(rng, 2, 9) * pick(rng, [1, -1]);
        // exactly one negative operand, so floor and truncation disagree
        if ((a > 0) === (b > 0)) a = -a;
        if (a % b === 0) a += 1;
        const fd = floorDiv(a, b), md = pyMod(a, b);
        const tr = Math.trunc(a / b), tm = a % b;
        const op = pick(rng, ['//', '//', '%', '%', 'divmod', '/']);
        if (op === '//') {
            return {
                q: py(PRINTS, `print(${a} // ${b})`), answer: String(fd), norm: 'code',
                distractors: [tr, fd + 1, fd - 1, -fd, -tr, pyFloat(fd), pyFloat(a / b), md].map(String),
                hint: 'Floor division rounds toward negative infinity, not toward zero.'
            };
        }
        if (op === '%') {
            return {
                q: py(PRINTS, `print(${a} % ${b})`), answer: String(md), norm: 'code',
                distractors: [tm, -md, -tm, Math.abs(a) % Math.abs(b), md + 1, md - 1, fd, pyFloat(md), pyFloat(tm), md + 2, md - 2].map(String),
                hint: 'In Python the result of % always has the same sign as the divisor.'
            };
        }
        if (op === 'divmod') {
            return {
                q: py(PRINTS, `print(divmod(${a}, ${b}))`), answer: `(${fd}, ${md})`, norm: 'code',
                distractors: [`(${tr}, ${tm})`, `(${fd}, ${tm})`, `(${tr}, ${md})`, `[${fd}, ${md}]`, `(${md}, ${fd})`, `(${fd - 1}, ${md})`, `(${-fd}, ${-md})`, `(${pyFloat(a / b)}, ${md})`],
                hint: 'divmod(a, b) returns (a // b, a % b), and // rounds toward negative infinity.'
            };
        }
        return {
            q: py(PRINTS, `print(${a} / ${b})`), answer: pyFloat(a / b), norm: 'code',
            distractors: [fd, tr, pyFloat(fd), pyFloat(tr), pyFloat(-a / b), `${fd} r ${md}`, (a / b).toFixed(2), Math.round(a / b)].map(String),
            hint: 'In Python 3, / is true division whatever the operand types.'
        };
    }

    const TOKENS = ['web1', 'db2', 'core', 'edge', 'mgmt', 'vlan10', 'eth0', 'up', 'down', 'lab'];

    function genSplit(rng) {
        const kind = pick(rng, ['csv', 'maxsplit', 'ws', 'join']);
        const words = shuffle(rng, TOKENS);
        if (kind === 'csv') {
            const fields = words.slice(0, randInt(rng, 3, 4));
            fields.splice(randInt(rng, 1, fields.length), 0, '');
            const s = fields.join(',');
            const nonEmpty = fields.filter(f => f);
            return {
                q: py(PRINTS, `line = "${s}"`, 'print(line.split(","))'), answer: repr(fields), norm: 'code',
                distractors: [repr(nonEmpty), repr(fields.map(f => f || null)), repr([s]), repr(tup(fields)), repr(fields.concat([''])), String(fields.length), nonEmpty.join(' ')],
                hint: 'Two delimiters in a row still have something between them, even if it is nothing.'
            };
        }
        if (kind === 'maxsplit') {
            const [k, v1, v2] = words;
            const s = `${k}=${v1}=${v2}`;
            const right = rng() < 0.4;
            const answer = right ? [`${k}=${v1}`, v2] : [k, `${v1}=${v2}`];
            const other = right ? [k, `${v1}=${v2}`] : [`${k}=${v1}`, v2];
            return {
                q: py(PRINTS, `s = "${s}"`, `print(s.${right ? 'rsplit' : 'split'}("=", 1))`), answer: repr(answer), norm: 'code',
                distractors: [repr(other), repr([k, v1, v2]), repr([k]), repr([k, v1]), repr(tup(answer)), repr([s]), repr([v2])],
                hint: `The second argument is maxsplit: at most that many cuts${right ? ', counted from the right' : ''}.`
            };
        }
        if (kind === 'ws') {
            const ws = words.slice(0, 3);
            const sp = () => ' '.repeat(randInt(rng, 1, 3));
            const s = ' '.repeat(randInt(rng, 1, 2)) + ws.join(sp()) + sp();
            const bySpace = s.split(' ');
            if (rng() < 0.5) {
                return {
                    q: py(PRINTS, `s = "${s}"`, 'print(s.split())'), answer: repr(ws), norm: 'code',
                    distractors: [repr(bySpace), repr([s.trim()]), repr(ws.slice(0, 2)), repr(tup(ws)), String(ws.length), repr(ws.slice().reverse()), repr([''].concat(ws))],
                    hint: 'With no argument, split() treats any run of whitespace as one separator and ignores the ends.'
                };
            }
            return {
                q: py(PRINTS, `s = "${s}"`, 'print(len(s.split(" ")))'), answer: String(bySpace.length), norm: 'int',
                distractors: [ws.length, bySpace.length - 1, bySpace.length + 1, ws.length - 1, s.length, bySpace.length - 2].map(String),
                hint: 'With an explicit " " separator, every single space is a cut, and empty strings are kept.'
            };
        }
        const xs = words.slice(0, randInt(rng, 3, 4));
        const sep = pick(rng, ['-', '.', '/', ':', ',']);
        const other = sep === ',' ? '-' : ',';
        return {
            q: py(PRINTS, `parts = ${repr(xs)}`, `print("${sep}".join(parts))`), answer: xs.join(sep), norm: 'code',
            distractors: [xs.join(sep) + sep, sep + xs.join(sep), repr([xs.join(sep)]), xs.join(other), xs.join(''), xs.slice().reverse().join(sep), repr(xs)],
            hint: 'join() puts the separator between items, never before the first or after the last.'
        };
    }

    function genRange(rng) {
        const form = pick(rng, [1, 2, 3, 3, 3]);
        let a = 0, b, c = 1, call;
        if (form === 1) { b = randInt(rng, 3, 12); call = `range(${b})`; }
        else if (form === 2) { a = randInt(rng, -3, 8); b = a + randInt(rng, -2, 9); call = `range(${a}, ${b})`; }
        else {
            c = pick(rng, [2, 3, 4, 5, -1, -2, -3]);
            a = randInt(rng, -5, 15);
            b = c > 0 ? a + randInt(rng, -2, 16) : a - randInt(rng, -2, 16);
            call = `range(${a}, ${b}, ${c})`;
        }
        const xs = pyRange(a, b, c);
        const hint = 'The stop value is never included, and the step decides which direction counts toward it.';
        if (xs.length <= 7 && rng() < 0.6) {
            const sign = c > 0 ? 1 : -1;
            const distractors = [
                pyRange(a, b + sign, c), pyRange(a + c, b, c), pyRange(a, b, sign), xs.slice().reverse(),
                xs.slice(1), xs.slice(0, -1), xs.length ? xs.concat([xs[xs.length - 1] + c]) : [a],
                pyRange(b, a, -c), pyRange(a, b, -c), xs.length ? [] : [a, a + c], [b]
            ].map(repr).concat([String(xs.length), 'None', 'ValueError']);
            return { q: py(PRINTS, `print(list(${call}))`), answer: repr(xs), norm: 'code', distractors, hint };
        }
        const span = Math.abs(b - a), step = Math.abs(c);
        const distractors = [xs.length + 1, xs.length - 1, span, Math.floor(span / step), span + 1, xs.length + 2, xs.length ? 0 : Math.ceil(span / step) || 1]
            .filter(x => x >= 0).map(String);
        return { q: py(PRINTS, `print(len(${call}))`), answer: String(xs.length), norm: 'int', distractors, hint };
    }

    const ERRORS = [
        ['A script mixes tabs and spaces inconsistently in one block. Which exception does Python 3 raise when compiling it?', 'TabError', ['IndentationError', 'SyntaxError', 'ValueError', 'WhitespaceError', 'IndentError', 'TypeError'], 'It is a subclass of IndentationError, named for the character that started it.'],
        ['Which exception does int("ten") raise?', 'ValueError', ['TypeError', 'NameError', 'SyntaxError', 'KeyError', 'ArithmeticError', 'AttributeError'], 'The type is right (a string), but its contents are not.'],
        ['Which exception does "port " + 22 raise?', 'TypeError', ['ValueError', 'SyntaxError', 'NameError', 'AttributeError', 'OverflowError', 'KeyError'], 'You are combining two kinds of object that + refuses to mix.'],
        ['Which exception does looking up a missing key with d["missing"] raise on a dict?', 'KeyError', ['IndexError', 'LookupError', 'ValueError', 'NameError', 'AttributeError', 'NoneType'], 'Lists raise one error for bad positions. Dicts raise a different one for bad keys.'],
        ['Which exception does [1, 2][5] raise?', 'IndexError', ['KeyError', 'ValueError', 'OverflowError', 'RangeError', 'LookupError', 'StopIteration'], 'The position is past the end of a sequence.'],
        ['Which exception does calling .strip() on None raise?', 'AttributeError', ['TypeError', 'NameError', 'ValueError', 'NullPointerException', 'NoneError', 'KeyError'], 'None simply does not have that method.'],
        ['Which exception does using a variable that was never assigned raise?', 'NameError', ['UnboundLocalError', 'KeyError', 'AttributeError', 'ValueError', 'UndefinedError', 'ReferenceError'], 'Python cannot find the name anywhere it looks.'],
        ['Which exception does 1 / 0 raise?', 'ZeroDivisionError', ['ArithmeticError', 'ValueError', 'OverflowError', 'FloatingPointError', 'DivideByZeroException', 'MathError'], 'The name says exactly what you did.'],
        ['Which exception does import nosuchmodule raise in Python 3 when the module does not exist?', 'ModuleNotFoundError', ['NameError', 'FileNotFoundError', 'ImportWarning', 'OSError', 'PackageNotFoundError', 'LookupError'], 'It is a subclass of ImportError, added in Python 3.6, with a more specific name.'],
        ['Which exception does next() raise on an exhausted iterator?', 'StopIteration', ['IndexError', 'StopAsyncIteration', 'EOFError', 'GeneratorExit', 'ValueError', 'None'], 'for loops catch it silently. Calling next() yourself does not.']
    ];

    // ================= ACT 2 =================

    function genSlice(rng) {
        const isStr = rng() < 0.5;
        const n = isStr ? randInt(rng, 6, 10) : randInt(rng, 5, 8);
        const seq = isStr ? 'abcdefghij'.slice(0, n) : pyRange(0, n, 1).map(i => i * 10);
        const name = isStr ? 's' : 'xs';
        const opt = (p, lo, hi) => rng() < p ? undefined : randInt(rng, lo, hi);
        let start, stop, step, result;
        for (let tries = 0; tries < 20; tries++) {
            start = opt(0.3, -n - 1, n + 1);
            stop = opt(0.3, -n - 1, n + 1);
            step = rng() < 0.4 ? undefined : pick(rng, [2, 3, -1, -1, -2, 2]);
            result = pySlice(seq, start, stop, step);
            if (!isStr || result.length) break;
        }
        if (isStr && !result.length) { start = undefined; stop = undefined; step = -1; result = pySlice(seq, start, stop, step); }
        const f = x => x === undefined ? '' : String(x);
        const expr = `${name}[${f(start)}:${f(stop)}${step === undefined ? '' : ':' + step}]`;
        const out = v => isStr ? v : repr(v);
        const s1 = step === undefined ? 1 : step;
        const bump = (x, d) => x === undefined ? undefined : x + d;
        const wrong = [
            pySlice(seq, start, bump(stop, s1 > 0 ? 1 : -1), step),
            pySlice(seq, bump(start, 1), stop, step),
            pySlice(seq, bump(start, -1), stop, step),
            pySlice(seq, start, stop, undefined),
            pySlice(seq, start, stop, -s1),
            isStr ? result.split('').reverse().join('') : result.slice().reverse(),
            result.slice(1),
            result.slice(0, -1),
            seq.slice(0, 2),
            pySlice(seq, stop, start, step),
            pySlice(seq, undefined, undefined, step),
            seq.slice(-2),
            seq.slice(1, 3),
            isStr ? seq[seq.length - 1] : [seq[seq.length - 1]]
        ];
        return {
            q: py(PRINTS, `${name} = ${isStr ? `"${seq}"` : repr(seq)}`, `print(${expr})`),
            answer: out(result), norm: 'code',
            distractors: wrong.filter(w => w.length).map(out).concat(isStr ? [repr(result)] : [], ['IndexError', 'None']),
            hint: `len(${name}) is ${n}. Add ${n} to any negative index, stop is excluded, and a negative step walks backward from the end.`
        };
    }

    function genComp(rng) {
        const nums = shuffle(rng, pyRange(-9, 13, 1)).slice(0, 6);
        const kind = pick(rng, ['filter', 'sum', 'count', 'dict']);
        const lst = `nums = ${repr(nums)}`;
        if (kind === 'filter') {
            const t = randInt(rng, -2, Math.min(5, Math.max(...nums) - 1));
            const ans = nums.filter(x => x > t).map(x => x * 2);
            return {
                q: py(PRINTS, lst, `print([x * 2 for x in nums if x > ${t}])`), answer: repr(ans), norm: 'code',
                distractors: [nums.filter(x => x >= t).map(x => x * 2), nums.map(x => x * 2), nums.filter(x => x > t), nums.filter(x => x < t).map(x => x * 2),
                    nums.filter(x => x > t).map(x => x * x), ans.slice().sort((p, q) => p - q), ans.slice(1), nums.filter(x => x <= t),
                    [Math.max(...nums) * 2], nums.filter(x => x > t).map(x => x + 2), []].map(repr).concat(['None']),
                hint: 'The if clause filters first, then the expression on the left runs on what survives.'
            };
        }
        if (kind === 'sum') {
            const even = nums.filter(x => pyMod(x, 2) === 0);
            const sum = a => a.reduce((s, x) => s + x, 0);
            return {
                q: py(PRINTS, lst, 'print(sum(x for x in nums if x % 2 == 0))'), answer: String(sum(even)), norm: 'int',
                distractors: [sum(nums.filter(x => pyMod(x, 2) === 1)), sum(nums), even.length, sum(even.filter(x => x > 0)), sum(even.map(Math.abs)), -sum(even), sum(even) + 2, sum(even) - 2, sum(even) * 2, sum(even) + 4, sum(even) - 4, sum(even) + 3].map(String),
                hint: 'In Python, -4 % 2 is 0, so negative even numbers count as even too.'
            };
        }
        if (kind === 'count') {
            const neg = nums.filter(x => x < 0).length;
            return {
                q: py(PRINTS, lst, 'print(len([x for x in nums if x < 0]))'), answer: String(neg), norm: 'int',
                distractors: [nums.filter(x => x <= 0).length, nums.filter(x => x > 0).length, nums.length, nums.filter(x => x < 0).reduce((s, x) => s + x, 0), neg + 1].map(String),
                hint: 'len() counts the items the comprehension kept. Zero is not negative.'
            };
        }
        const hosts = shuffle(rng, ['web1', 'db10', 'core', 'edge01', 'lb', 'mgmt7']).slice(0, 3);
        const m = new Map(hosts.map(h => [h, h.length]));
        return {
            q: py(PRINTS, `hosts = ${repr(hosts)}`, 'print({h: len(h) for h in hosts})'), answer: repr(m), norm: 'code',
            distractors: [repr(hosts.map(h => tup([h, h.length]))), repr(new Map(hosts.map(h => [h.length, h]))), repr(hosts.map(h => h.length)),
                repr(new Map(hosts.map(h => [h, h.length - 1]))), repr(new Map(hosts.map(h => [h, h]))), repr(hosts), repr(new Map([[hosts[2], hosts[2].length]]))],
            hint: 'A dict comprehension builds key: value pairs and keeps them in insertion order.'
        };
    }

    const DICTS = [
        [py(PRINTS, 'd = {"a": 1}', 'print(d.get("b"))'), 'None', ['KeyError', '0', "''", 'False', '1', "'b'"], 'get() is the polite lookup. With no default it returns the null object.'],
        [py(PRINTS, 'd = {"a": 1}', 'print(d.get("b", 0))'), '0', ['None', 'KeyError', '1', "'b'", 'False', '{}'], 'The second argument to get() is what you get back when the key is missing.'],
        [py(PRINTS, 'd = {}', 'd.setdefault("vlans", []).append(10)', 'print(d)'), "{'vlans': [10]}", ['{}', "{'vlans': []}", "{'vlans': 10}", 'None', 'KeyError', "{'vlans': [[10]]}"], 'setdefault() inserts the default if needed and returns the stored object, not a copy.'],
        [py(PRINTS, 'd = {"x": 1}', 'print(d.setdefault("x", 5))'), '1', ['5', 'None', "{'x': 5}", "{'x': 1}", '6', 'KeyError'], 'setdefault() never overwrites a key that already exists.'],
        [py(PRINTS, 'd = {"a": 1, "b": 2}', 'print(list(d.items()))'), "[('a', 1), ('b', 2)]", ["['a', 'b']", '[1, 2]', "[['a', 1], ['b', 2]]", "{'a': 1, 'b': 2}", "[('a', 'b'), (1, 2)]", "dict_items([('a', 1), ('b', 2)])"], 'items() yields (key, value) pairs, and list() collects them.'],
        [py(PRINTS, 'd = {"a": 1}', 'd["a"] += 1', 'd.update({"b": 3})', 'print(d)'), "{'a': 2, 'b': 3}", ["{'a': 1, 'b': 3}", "{'a': 2}", "{'b': 3}", 'None', "{'a': 2, 'b': 3, 'a': 1}", "{'a': 1}"], 'update() merges in place. The += already changed a.'],
        [py(PRINTS, 'print({"a": 1, "a": 2})'), "{'a': 2}", ["{'a': 1}", "{'a': 1, 'a': 2}", "{'a': [1, 2]}", 'KeyError', 'SyntaxError', "{'a': 3}"], 'Duplicate keys are legal in a literal. Later assignments win.'],
        [py(PRINTS, 'd = {"r1": 1, "r2": 2}', 'print("r1" in d, 1 in d)'), 'True False', ['True True', 'False True', 'False False', 'True None', '1 False', 'True'], 'in on a dict checks keys only.'],
        [py(PRINTS, 'd = dict(zip(["a", "b"], [1, 2]))', 'print(d)'), "{'a': 1, 'b': 2}", ["[('a', 1), ('b', 2)]", "{'a': 'b', 1: 2}", "{1: 'a', 2: 'b'}", "{'a': [1, 2]}", "{('a', 1), ('b', 2)}", "{'a': 1}"], 'zip pairs items up by position, and dict() turns pairs into key: value.'],
        [py(PRINTS, 'd = {"b": 2, "a": 1}', 'print(list(d))'), "['b', 'a']", ["['a', 'b']", '[2, 1]', '[1, 2]', "[('b', 2), ('a', 1)]", "{'b': 2, 'a': 1}", "['b', 2, 'a', 1]"], 'Iterating a dict yields keys, in insertion order since Python 3.7.'],
        [py(PRINTS, 'd = {"a": 1, "b": 2}', 'print(d.pop("a"), d)'), "1 {'b': 2}", ["{'b': 2} {'b': 2}", "a {'b': 2}", "1 {'a': 1, 'b': 2}", "None {'b': 2}", "('a', 1) {'b': 2}", "2 {'a': 1}"], 'pop() removes the key and hands back its value.']
    ];

    const EXCEPTS = [
        [py(PRINTS, 'try:', '    print("A")', 'except ValueError:', '    print("B")', 'else:', '    print("C")', 'finally:', '    print("D")'),
            'A C D', ['A D', 'A B D', 'A C', 'A B C D', 'A D C', 'C D'], 'else runs only when the try block raised nothing, and finally always runs last.'],
        [py(PRINTS, 'try:', '    print("A")', '    int("x")', '    print("B")', 'except ValueError:', '    print("C")', 'else:', '    print("D")', 'finally:', '    print("E")'),
            'A C E', ['A B C E', 'A C D E', 'A B D E', 'A E', 'A C', 'A B E'], 'The line after the failing one never runs, and else is skipped when an exception was caught.'],
        [py('What does this print to stdout before the traceback?', 'try:', '    print("A")', '    int("x")', 'except KeyError:', '    print("B")', 'finally:', '    print("C")'),
            'A C', ['A B C', 'A', 'A B', 'C', 'B C', 'A C B'], 'The except clause does not match this exception type, but finally runs on the way out anyway.'],
        [py(PRINTS, 'def f():', '    try:', '        return 1', '    finally:', '        return 2', 'print(f())'),
            '2', ['1', '1 2', '2 1', 'None', 'SyntaxError', '3'], 'finally runs after the return is evaluated, and its own return replaces the pending one.'],
        [py(PRINTS, 'try:', '    1 / 0', 'except Exception:', '    print("A")', 'except ZeroDivisionError:', '    print("B")'),
            'A', ['B', 'A B', 'B A', 'ZeroDivisionError', 'SyntaxError', 'None'], 'Except clauses are checked top to bottom, and the first match wins.'],
        [py(PRINTS, 'try:', '    {}["k"]', 'except KeyError as e:', '    print(repr(e))'),
            "KeyError('k')", ["'k'", 'KeyError', "KeyError: 'k'", 'k', "KeyError(k)", 'None'], 'repr() of an exception shows its class name and its arguments.'],
        [py(PRINTS, 'def f():', '    try:', '        return "A"', '    finally:', '        print("B")', 'print(f())'),
            'B A', ['A B', 'A', 'B', 'A None', 'None B', 'B None'], 'The finally block runs before the caller ever receives the return value.'],
        [py(PRINTS, 'for i in range(3):', '    if i == 5:', '        break', 'else:', '    print("done")'),
            'done', ['nothing', 'None', '2', 'SyntaxError', 'done done done', '3'], 'A loop\'s else clause runs when the loop finishes without hitting break.']
    ];

    function genIpaddress(rng) {
        const p = randInt(rng, 20, 29);
        const host = ipToInt([10, randInt(rng, 0, 255), randInt(rng, 0, 255), randInt(rng, 1, 254)]);
        const mask = maskInt(p);
        const net = (host & mask) >>> 0;
        const size = 2 ** (32 - p);
        const bcast = (net + size - 1) >>> 0;
        const N = `${intToIp(net)}/${p}`;
        const decl = `net = ipaddress.ip_network("${N}")`;
        const lead = 'What does this print? (ipaddress is imported.)';
        const kind = pick(rng, ['size', 'hosts', 'bcast', 'mask', 'strict', 'loose', 'in']);
        if (kind === 'size' || kind === 'hosts') {
            const ans = kind === 'size' ? size : size - 2;
            return {
                q: py(lead, decl, kind === 'size' ? 'print(net.num_addresses)' : 'print(len(list(net.hosts())))'), answer: String(ans), norm: 'int',
                distractors: [kind === 'size' ? size - 2 : size, size - 1, p, 32 - p, size * 2, size / 2, ans + 1].map(String),
                hint: kind === 'size' ? `A /${p} leaves ${32 - p} host bits.` : 'hosts() skips the network and broadcast addresses.'
            };
        }
        if (kind === 'bcast') {
            return {
                q: py(lead, decl, 'print(net.broadcast_address)'), answer: intToIp(bcast), norm: 'ipv4',
                distractors: [intToIp(net), intToIp(bcast + 1), intToIp(bcast - 1), intToIp((net + size * 2 - 1) >>> 0), intToIp((net + size / 2 - 1) >>> 0), intToIp((net | 255) >>> 0), intToIp(net + 1)],
                hint: `The block holds ${size} addresses, and the broadcast is the last one.`
            };
        }
        if (kind === 'mask') {
            return {
                q: py(lead, decl, 'print(net.netmask)'), answer: intToIp(mask), norm: 'ipv4',
                distractors: [intToIp(maskInt(p - 1)), intToIp(maskInt(p + 1)), intToIp(maskInt(p - 2)), intToIp(maskInt(p + 2)), intToIp(~mask >>> 0), '255.255.255.0', intToIp(maskInt(p - 8))],
                hint: `${p} leading one bits, written as four octets.`
            };
        }
        // a host address with host bits set (never equal to the network address)
        const h = net + randInt(rng, 1, size - 1);
        const H = `${intToIp(h)}/${p}`;
        if (kind === 'strict') {
            return {
                q: py(lead, `print(ipaddress.ip_network("${H}"))`), answer: 'ValueError', norm: 'code',
                accept: ['ValueError', `ValueError: ${H} has host bits set`],
                distractors: [N, H, `${intToIp(h)}/32`, 'None', 'TypeError', `${intToIp(net)}/${p + 1}`, intToIp(h)],
                hint: 'ip_network() is strict by default about bits to the right of the prefix.'
            };
        }
        if (kind === 'loose') {
            return {
                q: py(lead, `print(ipaddress.ip_network("${H}", strict=False))`), answer: N, norm: 'code',
                distractors: [H, 'ValueError', `${intToIp(h)}/32`, `${intToIp(net)}/${p - 1}`, `${intToIp(net + 1)}/${p}`, intToIp(net), `${intToIp(bcast)}/${p}`],
                hint: 'strict=False masks off the host bits instead of complaining.'
            };
        }
        const inside = rng() < 0.5;
        const a = inside ? h : (pick(rng, [bcast + 1, net - 1]) >>> 0);
        return {
            q: py(lead, decl, `print(ipaddress.ip_address("${intToIp(a)}") in net)`), answer: inside ? 'True' : 'False', norm: 'code',
            distractors: [inside ? 'False' : 'True', 'None', 'true', 'false', 'TypeError', 'ValueError'],
            hint: `${N} runs from ${intToIp(net)} to ${intToIp(bcast)}.`
        };
    }

    const TOOLING = [
        ['What command creates a virtual environment in a folder called .venv using the standard library?', 'python -m venv .venv', ['pip install venv', 'python venv .venv', 'pip venv .venv', 'source .venv/bin/activate', 'python -m pip venv .venv', 'venv create .venv'], 'Run a standard-library module as a script with -m.', 'text', ['python3 -m venv .venv', 'py -m venv .venv']],
        ['Which pip subcommand prints installed packages in requirements-file format (name==version)?', 'pip freeze', ['pip list', 'pip show', 'pip export', 'pip dump', 'pip save', 'pip requirements'], 'It captures the environment as it is right now, like ice.', 'text', ['freeze', 'python -m pip freeze']],
        ['What command installs every package listed in requirements.txt?', 'pip install -r requirements.txt', ['pip install requirements.txt', 'pip install -e requirements.txt', 'pip install -c requirements.txt', 'pip restore requirements.txt', 'pip sync requirements.txt', 'pip install -f requirements.txt'], 'The flag stands for "requirement file".', 'text', ['python -m pip install -r requirements.txt', 'pip3 install -r requirements.txt']],
        [py('What does this print? (json is imported.)', 'print(json.dumps({"up": True, "vlan": None}))'), '{"up": true, "vlan": null}', ['{"up": True, "vlan": None}', '{"up": "true", "vlan": "null"}', '{"up": true, "vlan": None}', '{"up": 1, "vlan": null}', '{"up": true}', '{"up": true, "vlan": ""}'], 'JSON has its own spelling for booleans and null, and dumps() uses it.', 'code'],
        [py('What does this print? (json is imported.)', 'print(json.loads("[1, 2.0, null, true]"))'), '[1, 2.0, None, True]', ['[1, 2, None, True]', '[1, 2.0, null, true]', "['1', '2.0', 'null', 'true']", '[1, 2.0, None, true]', '[1.0, 2.0, None, True]', '[1, 2.0, True]'], 'loads() converts JSON values to their Python equivalents, keeping int and float apart.', 'code'],
        [py('What does this print? (json is imported.)', 'data = json.loads(\'{"port": 22}\')', 'print(type(data["port"]).__name__)'), 'int', ['str', 'float', 'dict', 'number', 'NoneType', 'bytes'], 'An unquoted JSON number without a decimal point.', 'code'],
        ['Which statement guarantees a file is closed even if an exception is raised while you read it?', 'with', ['try', 'finally', 'open', 'close', 'using', 'async'], 'It is a context manager statement. C# spells its cousin "using".', 'text', ['with open', 'with statement']],
        ['Which open() mode character appends to a log file without truncating it?', 'a', ['w', 'r+', 'w+', 'x', 'r', 'rb'], 'w truncates first. This one starts writing at the end.', 'text', ['at']],
        ['Which environment variable does an activated venv set to its own path?', 'VIRTUAL_ENV', ['PYTHONPATH', 'PYTHONHOME', 'VENV', 'PATH', 'CONDA_PREFIX', 'PIP_PREFIX'], 'Your shell prompt reads it to show the environment name.', 'text', ['$VIRTUAL_ENV']]
    ];

    function genSorted(rng) {
        const kind = pick(rng, ['str', 'len', 'abs', 'sortnone']);
        if (kind === 'str' || kind === 'sortnone') {
            // a one-digit number above 1 plus some 1x numbers, so string order and natural order differ
            const nums = shuffle(rng, [pick(rng, [2, 3, 9]), ...shuffle(rng, [10, 11, 12]).slice(0, 2), pick(rng, [1, 20])]);
            const hosts = nums.map(n => 'sw' + n);
            const asc = hosts.slice().sort();
            const natural = nums.slice().sort((p, q) => p - q).map(n => 'sw' + n);
            if (kind === 'sortnone') {
                return {
                    q: py(PRINTS, `hosts = ${repr(hosts)}`, 'result = hosts.sort()', 'print(result)'), answer: 'None', norm: 'code',
                    distractors: [repr(asc), repr(natural), repr(hosts), '[]', 'True', 'AttributeError', repr(asc.slice().reverse()), 'TypeError'],
                    hint: 'list.sort() works in place. Check what the method itself hands back.'
                };
            }
            return {
                q: py(PRINTS, `hosts = ${repr(hosts)}`, 'print(sorted(hosts))'), answer: repr(asc), norm: 'code',
                distractors: [repr(natural), repr(asc.slice().reverse()), repr(hosts), repr(natural.slice().reverse()), 'None', repr(hosts.slice().sort((p, q) => p.length - q.length)), repr(nums.slice().sort((p, q) => p - q)), 'TypeError'],
                hint: 'Strings compare character by character, so "1" sorts before "9" no matter what follows it.'
            };
        }
        if (kind === 'len') {
            const words = shuffle(rng, ['web', 'db', 'core', 'edge', 'lb', 'mgmt', 'dns', 'ntp']).slice(0, 5);
            const byLen = words.slice().sort((p, q) => p.length - q.length);
            const byLenAlpha = words.slice().sort((p, q) => p.length - q.length || (p < q ? -1 : 1));
            const alpha = words.slice().sort();
            const distractors = [byLenAlpha, alpha, byLen.slice().reverse(), words, words.slice().sort((p, q) => q.length - p.length),
                byLenAlpha.slice().reverse(), alpha.slice().reverse(), words.map(w => w.length).sort((p, q) => p - q)].map(repr).concat(['None', 'TypeError']);
            return {
                q: py(PRINTS, `words = ${repr(words)}`, 'print(sorted(words, key=len))'), answer: repr(byLen), norm: 'code', distractors,
                hint: 'Python\'s sort is stable: items with equal keys keep their original order.'
            };
        }
        const base = shuffle(rng, [1, 2, 3, 4, 5, 6, 7]).slice(0, 4);
        const tie = base[0];
        const nums = shuffle(rng, base.map(x => rng() < 0.5 ? -x : x).concat([rng() < 0.5 ? tie : -tie]));
        if (nums.indexOf(tie) === -1 || nums.indexOf(-tie) === -1) nums[nums.indexOf(tie) === -1 ? nums.indexOf(-tie) : nums.indexOf(tie)] *= -1;
        const byAbs = nums.slice().sort((p, q) => Math.abs(p) - Math.abs(q));
        return {
            q: py(PRINTS, `nums = ${repr(nums)}`, 'print(sorted(nums, key=abs))'), answer: repr(byAbs), norm: 'code',
            distractors: [nums.slice().sort((p, q) => p - q), nums.slice().sort((p, q) => Math.abs(p) - Math.abs(q) || p - q), nums.slice().sort((p, q) => Math.abs(p) - Math.abs(q) || q - p),
                byAbs.map(Math.abs), byAbs.slice().reverse(), nums.slice().sort((p, q) => q - p), nums].map(repr).concat(['TypeError', 'None']),
            hint: 'The key only decides the order. The values printed are the originals, and ties keep their input order.'
        };
    }

    // ================= ACT 3 =================

    const MUTABLE = [
        [py(PRINTS, 'def add(x, acc=[]):', '    acc.append(x)', '    return acc', 'add(1)', 'print(add(2))'), '[1, 2]', ['[2]', '[1]', '[]', 'None', '[[1], 2]', '[2, 1]'], 'Default values are evaluated once, when the def statement runs.'],
        [py(PRINTS, 'a = [1, 2]', 'b = a', 'b.append(3)', 'print(a)'), '[1, 2, 3]', ['[1, 2]', '[3]', '[1, 2, [3]]', 'None', '[3, 1, 2]', '[1, 2, 3, 3]'], 'Assignment never copies a list. It adds another name for the same one.'],
        [py(PRINTS, 'a = [1, 2]', 'b = a[:]', 'b.append(3)', 'print(a)'), '[1, 2]', ['[1, 2, 3]', '[3]', '[]', 'None', '[1, 2, [3]]', '[1]'], 'A full slice builds a new list.'],
        [py(PRINTS, 'grid = [[0] * 2] * 2', 'grid[0][0] = 1', 'print(grid)'), '[[1, 0], [1, 0]]', ['[[1, 0], [0, 0]]', '[[1, 1], [0, 0]]', '[[1, 0, 0, 0]]', '[[1, 1], [1, 1]]', '[1, 0, 0, 0]', 'TypeError'], 'Multiplying the outer list repeats references to one inner list.'],
        [py(PRINTS, 'a = [1]', 'b = [1]', 'print(a == b, a is b)'), 'True False', ['True True', 'False False', 'False True', 'True', 'True None', '1 0'], '== compares contents. is compares identity.'],
        [py(PRINTS, 'x = None', 'print(x is None, x == None)'), 'True True', ['True False', 'False True', 'False False', 'True None', 'None None', 'TypeError'], 'There is only ever one None object.'],
        [py(PRINTS, 'def f(d={}):', '    d["n"] = d.get("n", 0) + 1', '    return d["n"]', 'f(); f()', 'print(f())'), '3', ['1', '2', '0', 'None', 'KeyError', "{'n': 3}"], 'The same dict object is reused by every call that does not pass d.'],
        [py(PRINTS, 't = ([1], 2)', 't[0].append(3)', 'print(t)'), '([1, 3], 2)', ['([1], 2)', 'TypeError', '([1], 2, 3)', '[[1, 3], 2]', '([3], 2)', '([1, 3], 2, 3)'], 'A tuple cannot change which objects it holds, but those objects can change themselves.'],
        [py(PRINTS, 's = "abc"', 't = s', 't += "d"', 'print(s)'), 'abc', ['abcd', 'd', 'None', 'TypeError', 'abc d', "'abc'"], 'Strings are immutable, so += rebinds the name to a new string.']
    ];

    const GENERATORS = [
        [py(PRINTS, 'g = (x * 2 for x in range(3))', 'print(list(g), list(g))'), '[0, 2, 4] []', ['[0, 2, 4] [0, 2, 4]', '[2, 4, 6] []', '[0, 2, 4]', '[] []', '[0, 2] []', '[2, 4, 6] [2, 4, 6]'], 'A generator can be consumed only once.'],
        [py(PRINTS, 'def gen():', '    yield 1', '    yield 2', 'g = gen()', 'print(next(g), next(g))'), '1 2', ['1 1', '2 2', '[1, 2]', '1', 'None None', 'StopIteration'], 'Each next() resumes where the last yield paused.'],
        [py(PRINTS, 'def gen():', '    print("start")', '    yield 1', 'g = gen()', 'print("made")'), 'made', ['start made', 'made start', 'start', '1 made', 'made 1', 'start 1 made'], 'Calling a generator function runs none of its body yet.'],
        [py(PRINTS, 'nums = map(int, ["1", "2"])', 'print(sum(nums), sum(nums))'), '3 0', ['3 3', '12 12', '3', "'12' 0", '0 0', 'TypeError'], 'map() in Python 3 returns a lazy iterator, not a list.'],
        [py(PRINTS, 'print(type(x for x in []))'), "<class 'generator'>", ["<class 'list'>", "<class 'tuple'>", "<class 'function'>", "<class 'iterator'>", '[]', "<class 'NoneType'>"], 'Parentheses around a comprehension do not make a tuple.'],
        [py(PRINTS, 'def countdown(n):', '    while n > 0:', '        yield n', '        n -= 1', 'print(list(countdown(3)))'), '[3, 2, 1]', ['[3, 2, 1, 0]', '[2, 1, 0]', '[3]', '[1, 2, 3]', '[0, 1, 2]', '[2, 1]'], 'Each yield hands out the current n before it is decremented.'],
        [py(PRINTS, 'def gen():', '    yield from range(2)', '    yield 9', 'print(list(gen()))'), '[0, 1, 9]', ['[range(0, 2), 9]', '[0, 1, 2, 9]', '[9]', '[1, 2, 9]', '[0, 9]', '[[0, 1], 9]'], 'yield from hands out every item of the inner iterable, one at a time.'],
        [py(PRINTS, 'g = (x for x in range(3))', 'print(2 in g, list(g))'), 'True []', ['True [0, 1, 2]', 'True [0, 1]', 'False []', 'True [2]', 'False [0, 1, 2]', 'True [1, 2]'], 'in on a generator consumes items until it finds a match.'],
        [py(PRINTS, 'it = iter([1, 2, 3])', 'next(it)', 'print(list(it))'), '[2, 3]', ['[1, 2, 3]', '[1, 2]', '[3]', '[]', '[1]', '2'], 'An iterator remembers how far it has already gone.']
    ];

    const CLOSURES = [
        [py(PRINTS, 'fs = [lambda: i for i in range(3)]', 'print([f() for f in fs])'), '[2, 2, 2]', ['[0, 1, 2]', '[3, 3, 3]', '[0, 0, 0]', '[1, 2, 3]', 'NameError', '[2, 1, 0]'], 'The lambdas look up i when they are called, not when they are made.'],
        [py(PRINTS, 'fs = [lambda i=i: i for i in range(3)]', 'print([f() for f in fs])'), '[0, 1, 2]', ['[2, 2, 2]', '[3, 3, 3]', '[0, 0, 0]', '[1, 2, 3]', 'TypeError', '[None, None, None]'], 'Default values are captured when each lambda is created.'],
        [py(PRINTS, 'def counter():', '    n = 0', '    def inc():', '        nonlocal n', '        n += 1', '        return n', '    return inc', 'c = counter(); c()', 'print(c())'), '2', ['1', '0', '3', 'None', 'UnboundLocalError', 'NameError'], 'nonlocal makes inc() update the n that lives on in the closure.'],
        [py(PRINTS, 'x = 1', 'def f():', '    print(x)', '    x = 2', 'f()'), 'UnboundLocalError', ['1', '2', 'NameError', 'None', 'SyntaxError', '1 2'], 'An assignment anywhere in a function makes the name local for the whole function.', 'code', ["UnboundLocalError: cannot access local variable 'x' where it is not associated with a value"]],
        [py(PRINTS, 'def make(n):', '    return lambda x: x * n', 'double = make(2)', 'print(double(5))'), '10', ['7', '25', '5', '2', 'None', 'NameError'], 'The inner function keeps the n it was made with.'],
        [py(PRINTS, 'x = 10', 'def f():', '    global x', '    x += 1', 'f()', 'print(x)'), '11', ['10', '1', 'None', 'UnboundLocalError', 'NameError', '12'], 'global tells the function to rebind the module-level name.'],
        [py(PRINTS, 'adders = {}', 'for n in (1, 2):', '    adders[n] = lambda x: x + n', 'print(adders[1](10))'), '12', ['11', '10', '1', '3', 'KeyError', '21'], 'All the lambdas share the loop variable, and the loop has finished.']
    ];

    const DECORATORS = [
        [py(PRINTS, 'def shout(fn):', '    def w():', '        return fn().upper()', '    return w', '@shout', 'def hi(): return "hi"', 'print(hi())'), 'HI', ['hi', 'Hi', 'None', '<function w>', 'w', 'TypeError'], 'The decorator replaces hi with w, which calls the original and changes its result.'],
        [py(PRINTS, 'def deco(fn):', '    print("D")', '    return fn', '@deco', 'def f(): print("F")', 'f()'), 'D F', ['F', 'F D', 'D', 'D F D', 'D D F', 'F F'], 'A decorator runs once, at definition time, before anyone calls the function.'],
        [py(PRINTS, 'def a(fn): return lambda: "a" + fn()', 'def b(fn): return lambda: "b" + fn()', '@a', '@b', 'def f(): return "f"', 'print(f())'), 'abf', ['baf', 'fab', 'fba', 'af', 'bf', 'abff'], 'Stacked decorators apply bottom up, so the top one ends up outermost.'],
        [py(PRINTS, 'def deco(fn):', '    def wrapper(): return fn()', '    return wrapper', '@deco', 'def ping(): pass', 'print(ping.__name__)'), 'wrapper', ['ping', 'deco', 'fn', 'None', '<lambda>', 'AttributeError'], 'Without functools.wraps, the name ping now points at a different function.'],
        [py(PRINTS, 'def twice(fn):', '    def w(x): return fn(fn(x))', '    return w', '@twice', 'def inc(x): return x + 1', 'print(inc(5))'), '7', ['6', '8', '12', '10', '5', 'TypeError'], 'The wrapper feeds the original function its own output.'],
        ['Which functools decorator memoizes a function with a bounded least-recently-used cache?', 'lru_cache', ['wraps', 'partial', 'cached_property', 'reduce', 'singledispatch', 'total_ordering'], 'The initials of the eviction policy are in its name.', 'text', ['functools.lru_cache', '@lru_cache', '@functools.lru_cache']],
        ['Which functools decorator copies __name__ and __doc__ from the wrapped function onto your wrapper?', 'wraps', ['lru_cache', 'partial', 'update', 'reduce', 'cache', 'singledispatch'], 'Its name describes what a decorator does to a function.', 'text', ['functools.wraps', '@wraps', '@functools.wraps']]
    ];

    const R = String.raw;
    const REGEX = [
        [py('What does this print? (re is imported.)', R`m = re.search(r"(\d+)\.(\d+)", "ver 12.4 rel")`, 'print(m.group(2))'), '4', ['12', '12.4', '2', '.4', "('12', '4')", 'None'], 'Groups are numbered from 1 by their opening parenthesis.'],
        [py('What does this print? (re is imported.)', R`m = re.search(r"(\d+)\.(\d+)", "ver 12.4 rel")`, 'print(m.group(0))'), '12.4', ['12', '4', 'ver 12.4 rel', "('12', '4')", 'ver', 'IndexError'], 'Group 0 is special: it is the whole match.'],
        [py('What does this print? (re is imported.)', R`print(re.findall(r"\d+", "Gi1/0/24"))`), "['1', '0', '24']", ['[1, 0, 24]', "['1', '0', '2', '4']", "['1']", "['1/0/24']", "['1', '24']", "'1'"], 'findall() returns every non-overlapping match, as strings.'],
        [py('What does this print? (re is imported.)', R`print(re.findall(r"(\w+)=(\d+)", "a=1 b=2"))`), "[('a', '1'), ('b', '2')]", ["['a=1', 'b=2']", "['a', '1', 'b', '2']", "[('a', 1), ('b', 2)]", "[['a', '1'], ['b', '2']]", "[('a', '1')]", "{'a': '1', 'b': '2'}"], 'With more than one group, findall() returns a tuple of groups per match.'],
        [py('What does this print? (re is imported.)', R`print(re.match(r"\d+", "eth0"))`), 'None', ['0', "'0'", 'eth0', 'False', '[]', "<re.Match object; span=(3, 4), match='0'>"], 'match() only tries at the very start of the string.'],
        [py('What does this print? (re is imported.)', R`m = re.search(r"(?P<host>\w+)\.lab", "sw1.lab")`, 'print(m["host"])'), 'sw1', ['sw1.lab', 'host', 'lab', 'KeyError', 'TypeError', 'None'], 'A match object can be indexed by group name.'],
        [py('What does this print? (re is imported.)', R`print(re.sub(r"\d", "#", "vlan10"))`), 'vlan##', ['vlan#', 'vlan#0', '####', 'vlan10', '#vlan10', 'vlan#10'], 'sub() replaces every match, and \\d matches one digit at a time.'],
        [py('What does this print? (re is imported.)', R`print(re.split(r"[,;]", "a,b;c"))`), "['a', 'b', 'c']", ["['a', 'b;c']", "['a,b', 'c']", "['a', ',', 'b', ';', 'c']", "['abc']", "('a', 'b', 'c')", "['a', 'b', 'c', '']"], 'A character class matches any one of the characters inside it.'],
        [py('What does this print? (re is imported.)', R`print(re.search(r"a.*?b", "a1b2b").group())`), 'a1b', ['a1b2b', 'a', '1', 'ab', 'b', 'a1b2'], 'The ? after * makes it match as little as possible.'],
        [py('What does this print? (re is imported.)', R`print(re.search(r"a.*b", "a1b2b").group())`), 'a1b2b', ['a1b', 'a', '1b2', 'ab', 'a1', 'a1b2'], 'A plain * is greedy and backtracks only as far as it must.']
    ];

    const CONCURRENCY = [
        ['You have CPU-bound pure-Python parsing to spread across 8 cores on a standard CPython build. Which standard-library module gives true parallelism?', 'multiprocessing', ['threading', 'asyncio', 'queue', 'sched', 'select', 'signal'], 'Each worker needs its own interpreter, and therefore its own lock.', 'text', ['concurrent.futures.ProcessPoolExecutor', 'ProcessPoolExecutor']],
        ['What is the name of the lock that stops threads in a standard (not free-threaded) CPython build from executing Python bytecode in parallel?', 'GIL', ['mutex', 'RLock', 'semaphore', 'event loop', 'spinlock', 'futex'], 'Three letters, and it is global.', 'text', ['global interpreter lock', 'the GIL', 'the global interpreter lock']],
        ['Which standard-library module provides an event loop for single-threaded concurrency with async def and await?', 'asyncio', ['multiprocessing', 'threading', 'select', 'sched', 'subprocess', 'selectors'], 'Its name puts async in front of input/output.', 'text'],
        ['Inside an async def, which keyword pauses the coroutine until another awaitable finishes?', 'await', ['yield', 'async', 'defer', 'wait', 'then', 'sleep'], 'It is the partner keyword of async.', 'text'],
        ['Which asyncio function runs a top-level coroutine from ordinary synchronous code, creating and closing the event loop for you?', 'asyncio.run', ['asyncio.start', 'asyncio.gather', 'asyncio.wait', 'loop.run_forever', 'asyncio.create_task', 'asyncio.sleep'], 'It is the shortest name in the module that sounds like "go".', 'text', ['asyncio.run()', 'run']],
        ['Which asyncio function runs several awaitables concurrently and returns their results in order?', 'asyncio.gather', ['asyncio.run', 'asyncio.wait_for', 'asyncio.sleep', 'asyncio.shield', 'asyncio.collect', 'asyncio.join'], 'It collects, like a harvest.', 'text', ['asyncio.gather()', 'gather']],
        ['Inside a coroutine, what should replace time.sleep(5) so the event loop keeps serving other tasks?', 'await asyncio.sleep(5)', ['await time.sleep(5)', 'asyncio.wait(5)', 'yield 5', 'threading.Timer(5)', 'os.sleep(5)', 'time.sleep(5)'], 'The blocking call has an asyncio twin that must be awaited.', 'text', ['asyncio.sleep(5)']],
        ['Which concurrent.futures executor suits 200 parallel SSH sessions that spend most of their time waiting on the network?', 'ThreadPoolExecutor', ['ProcessPoolExecutor', 'SelectorExecutor', 'AsyncExecutor', 'GILExecutor', 'TaskExecutor', 'NetworkPoolExecutor'], 'Blocking I/O releases the GIL, so the lighter-weight workers are fine.', 'text', ['concurrent.futures.ThreadPoolExecutor']]
    ];

    const PACKAGING = [
        ['Which file declares a Python project\'s build system and metadata under PEP 517, 518 and 621?', 'pyproject.toml', ['setup.cfg', 'requirements.txt', 'setup.py', 'Pipfile', 'package.json', 'MANIFEST.in'], 'It is TOML, and its name says it belongs to the project.', 'text'],
        ['Which pyproject.toml table names the build backend, for example setuptools.build_meta or hatchling.build?', '[build-system]', ['[project]', '[tool.setuptools]', '[build]', '[backend]', '[dependencies]', '[tool.pip]'], 'Two words joined by a hyphen, describing what does the building.', 'text', ['build-system']],
        ['In pyproject.toml, which key under [project] lists the runtime dependencies?', 'dependencies', ['install_requires', 'requires', 'requirements', 'deps', 'packages', 'requires-python'], 'setup.py used install_requires. PEP 621 picked the plain English word.', 'text'],
        ['Which pyproject.toml table exposes a console command that calls a function in your package?', '[project.scripts]', ['[tool.scripts]', '[scripts]', '[console_scripts]', '[project.cli]', '[build-system]', '[project.commands]'], 'It sits under [project] and is named for what you run in a shell.', 'text', ['project.scripts']],
        ['Which pip install flag installs your project in editable (development) mode?', '-e', ['-r', '-U', '-t', '--user', '-c', '-i'], 'The long form is --editable.', 'text', ['--editable']],
        ['What is the standard built-distribution format for Python packages, with the .whl extension?', 'wheel', ['egg', 'sdist', 'tarball', 'zip', 'rpm', 'msi'], 'It comes after the egg in the cheese shop jokes.', 'text', ['whl', '.whl', 'wheels']],
        ['Which tool is the PyPA-recommended way to upload built distributions to PyPI?', 'twine', ['pip', 'setuptools', 'wheel', 'build', 'pipx', 'tox'], 'It ties things together, like string.', 'text'],
        ['Which [project] key in pyproject.toml declares the minimum supported Python version?', 'requires-python', ['python_requires', 'python-version', 'min-python', 'requires', 'python', 'dependencies'], 'Hyphenated, and it starts with what the project needs.', 'text']
    ];

    Q.registerTopics({
        'python-types': { label: 'Python types and truthiness', gen: fromPool(TYPES, 'code') },
        'python-strings': { label: 'Python strings and f-strings', gen: fromPool(STRINGS, 'code') },
        'python-index': { label: 'Python list indexing', gen: genIndex },
        'python-divmod': { label: 'Python division and modulo', gen: genDivmod },
        'python-split': { label: 'Python split and join', gen: genSplit },
        'python-range': { label: 'Python range()', gen: genRange },
        'python-errors': { label: 'Python exceptions', gen: fromPool(ERRORS, 'text') },
        'python-slice': { label: 'Python slicing', gen: genSlice },
        'python-comp': { label: 'Python comprehensions', gen: genComp },
        'python-dict': { label: 'Python dicts', gen: fromPool(DICTS, 'code') },
        'python-except': { label: 'Python try/except/finally', gen: fromPool(EXCEPTS, 'code') },
        'python-ipaddress': { label: 'Python ipaddress', gen: genIpaddress },
        'python-tooling': { label: 'venv, pip, json and files', gen: fromPool(TOOLING, 'text') },
        'python-sorted': { label: 'Python sorting', gen: genSorted },
        'python-mutable': { label: 'Mutability and identity', gen: fromPool(MUTABLE, 'code') },
        'python-generators': { label: 'Generators and iterators', gen: fromPool(GENERATORS, 'code') },
        'python-closures': { label: 'Closures and scope', gen: fromPool(CLOSURES, 'code') },
        'python-decorators': { label: 'Decorators', gen: fromPool(DECORATORS, 'code') },
        'python-regex': { label: 'Python re', gen: fromPool(REGEX, 'code') },
        'python-concurrency': { label: 'GIL, threads, processes, asyncio', gen: fromPool(CONCURRENCY, 'text') },
        'python-packaging': { label: 'Packaging', gen: fromPool(PACKAGING, 'text') }
    });

    // ================= WORLD =================

    const ITEMS = {
        'spam-tin': {
            name: 'Tin of Spam', names: ['spam', 'tin', 'potion', 'tin of spam'], kind: 'potion',
            desc: 'A dented tin of spam, spam, spam and spam. Eat it to restore a life, or trade it for a hint.'
        },
        'pickle-jar': {
            name: 'Jar of Pickles', names: ['pickles', 'jar', 'potion', 'pickle', 'jar of pickles'], kind: 'potion',
            desc: 'Serialized cucumbers. Only open jars from sources you trust. Eat one to restore a life, or trade it for a hint.'
        },
        'thermos': {
            name: 'Thermos of Tea', names: ['tea', 'thermos', 'potion', 'thermos of tea'], kind: 'potion',
            desc: 'Earl Grey, still hot after three deploys. Drink it to restore a life, or trade it for a hint.'
        },
        'pep8-ruler': {
            name: 'PEP 8 Ruler', names: ['ruler', 'pep 8 ruler', 'pep8 ruler', 'pep8'], kind: 'key', boss: 'hydra-den',
            desc: 'A steel ruler marked in units of exactly four spaces. Tabs flinch when you hold it up.'
        },
        'lockfile': {
            name: 'Pinned Requirements Scroll', names: ['scroll', 'requirements', 'lockfile', 'pinned requirements scroll', 'requirements scroll'], kind: 'key', boss: 'dependency-pit',
            desc: 'A scroll listing every package with == and an exact version. Dependency resolvers fall silent before it.'
        },
        'pitchfork': {
            name: 'Pitchfork of Multiprocessing', names: ['pitchfork', 'fork', 'pitchfork of multiprocessing'], kind: 'key', boss: 'gil-throne',
            desc: 'A pitchfork whose every tine is a separate process with its own interpreter. No single lock can hold it.'
        },
        'print-statement': {
            name: 'print statement', names: ['print statement', 'statement', 'print'], kind: 'junk',
            desc: 'A fossilized `print "hello"` from Python 2. It no longer compiles, but it has sentimental value.',
            use: 'You try it. SyntaxError: Missing parentheses in call to \'print\'. Did you mean print(...)?'
        },
        'pycache': {
            name: '__pycache__ folder', names: ['pycache', '__pycache__', 'folder', 'cache'], kind: 'junk',
            desc: 'A folder of .pyc files that someone committed to git. You will be deleting this in a separate PR.'
        }
    };

    const ACTS = [
        {
            n: 1, name: 'The Interpreter Shallows', start: 'repl-cove', boss: 'hydra-den', key: 'pep8-ruler',
            intro: 'ACT I: THE INTERPRETER SHALLOWS\nAt 3:12 AM the deploy pipeline goes red. The log ends in a Python traceback from a script nobody admits to writing. You open a REPL and wade in.'
        },
        {
            n: 2, name: 'The Standard Library', start: 'site-packages', boss: 'dependency-pit', key: 'lockfile',
            intro: 'ACT II: THE STANDARD LIBRARY\nPast the Hydra, the script turns out to import half the standard library and a package last released in 2016. Batteries are included. Some of them are leaking.'
        },
        {
            n: 3, name: 'The Automation Server', start: 'runner-hall', boss: 'gil-throne', key: 'pitchfork',
            intro: 'ACT III: THE AUTOMATION SERVER\nThe build runner hums in a rack nobody has labelled. Every pipeline job queues behind one stuck worker, and something enormous sits on its only lock.'
        }
    ];

    const ROOMS = {
        // ======================= ACT I =======================
        'repl-cove': {
            act: 1, name: 'The REPL Cove',
            text: 'Three angle brackets blink at you from a tide pool: >>>. A failed pipeline log is pinned to a rock. Paths lead north to a gate, east over a bridge of quotation marks, and west to a canteen; a dark den gapes to the south.',
            exits: { north: 'truthy-gate', east: 'string-bridge', west: 'spam-canteen', south: 'hydra-den' },
            features: [
                { names: ['log', 'pipeline log', 'rock'], text: 'deploy.py, line 212: IndentationError: unindent does not match any outer indentation level. Someone edited it in nano over SSH. On a Friday.' },
                { names: ['pool', 'tide pool', 'prompt', '>>>'], text: 'You type import this. The pool murmurs "Errors should never pass silently." The pipeline disagrees.' },
                { names: ['den', 'south', 'seals', 'seal'], text: 'The den mouth is sealed by five runes, one per guardian of this realm. Inside, something hisses about inconsistent indentation.' }
            ]
        },
        'spam-canteen': {
            act: 1, name: 'The Canteen of Spam',
            text: 'A greasy spoon where every dish comes with spam, except one, which has less spam in it. A pantry door stands ajar. The cove is back east.',
            exits: { east: 'repl-cove' },
            features: [
                { names: ['pantry', 'door', 'shelf', 'shelves'], text: 'Behind a crate labelled "eggs" sits a single dented tin of spam.', reveals: 'spam-tin' },
                { names: ['menu', 'dishes'], text: 'Egg and spam. Spam, bacon, sausage and spam. You do not like spam, but the on-call rota did not ask.' }
            ]
        },
        'truthy-gate': {
            act: 1, name: 'The Gate of Truthiness',
            text: 'A gate that opens for anything that is not empty, zero or None, which rules out most of your motivation at this hour. Stairs climb north. The cove is south.',
            exits: { south: 'repl-cove', north: 'index-stairs' },
            quiz: { topic: 'python-types', guardian: 'the Truthiness Sphinx', intro: 'A sphinx with a bool() collar blocks the gate. "Everything here is either truthy or falsy," it purrs. "Which are you?"', cleared: 'The sphinx evaluates you as truthy and steps aside.' }
        },
        'index-stairs': {
            act: 1, name: 'The Zero-Indexed Stairs',
            text: 'A staircase whose first step is numbered 0 and whose last is numbered -1. Everyone trips on the top one. A hall echoes to the east. The gate is back south.',
            exits: { south: 'truthy-gate', east: 'floor-hall' },
            quiz: { topic: 'python-index', guardian: 'the Off-by-One Gnome', intro: 'A gnome sitting on step 1 insists it is the first step. "Prove me wrong," it says, holding up a list.', cleared: 'The gnome grumbles, renumbers itself to step 0, and lets you climb.' }
        },
        'floor-hall': {
            act: 1, name: 'The Hall of Floors',
            text: 'The floor tiles slope gently toward negative infinity. Remainders roll down the slope and gather by the east door. The stairs are back west.',
            exits: { west: 'index-stairs', east: 'style-shrine' },
            quiz: { topic: 'python-divmod', guardian: 'the Floor Division Troll', intro: 'A troll used to C rounds everything toward zero and has been wrong for years. "Divide this," it growls, "the Python way."', cleared: 'The troll floors itself out of the doorway. "Toward negative infinity. Fine."' }
        },
        'string-bridge': {
            act: 1, name: 'The Bridge of Quotation Marks',
            text: 'The planks alternate single and double quotes, and nobody can agree which to step on. A market bustles to the east. The cove is back west.',
            exits: { west: 'repl-cove', east: 'split-market' },
            quiz: { topic: 'python-strings', guardian: 'the f-String Weaver', intro: 'A spider weaves format specs between the railings. "Every thread here is interpolated," it clicks. "Read one for me."', cleared: 'The weaver formats you a passage, zero-padded to four digits.' }
        },
        'split-market': {
            act: 1, name: 'The Delimiter Market',
            text: 'Stalls sell commas, colons and pipes by the pound. A path north leads past some old headstones. The bridge is back west.',
            exits: { west: 'string-bridge', north: 'py2-graveyard' },
            quiz: { topic: 'python-split', guardian: 'the Delimiter Merchant', intro: 'A merchant chops strings on a block. "Tell me how many pieces I get," she says, cleaver raised, "and I let you through."', cleared: 'The merchant joins your pieces back together with a hyphen and waves you on.' }
        },
        'py2-graveyard': {
            act: 1, name: 'The Graveyard of Python 2',
            text: 'Headstones mark scripts that never made it past 2020. Something lies in the grass by the newest grave. A shrine stands to the north; the market is back south.',
            exits: { south: 'split-market', north: 'style-shrine' },
            items: ['print-statement'],
            features: [
                { names: ['headstones', 'graves', 'grave', 'headstone'], text: 'One reads: "backup_switches.py. Used urllib2. Ran in production from 2011 until the server was recycled. Nobody noticed."' }
            ]
        },
        'style-shrine': {
            act: 1, name: 'The Shrine of PEP 8',
            text: 'A quiet shrine where every line is under 80 characters and indented with four spaces. A steel ruler lies on the altar. Doors lead west to the hall and south to the graveyard.',
            exits: { west: 'floor-hall', south: 'py2-graveyard' },
            items: ['pep8-ruler'],
            features: [
                { names: ['altar'], text: 'Carved into the stone: "A foolish consistency is the hobgoblin of little minds." Someone has added: "but run the linter anyway."' }
            ]
        },
        'hydra-den': {
            act: 1, name: 'The Den of the IndentationError Hydra', boss: true,
            text: 'A cave where every wall is indented differently. The IndentationError Hydra writhes in the middle, each head offset by a different mix of tabs and spaces. Beyond it, a passage leads into the Standard Library.',
            exits: { north: 'repl-cove' },
            bossFight: {
                name: 'the IndentationError Hydra', topics: ['python-errors', 'python-range'], key: 'pep8-ruler',
                locked: 'The Hydra\'s heads shift left and right, never lining up. You cannot tell which block any of them belongs to. You need something that measures exactly four spaces.',
                intro: 'You hold up the PEP 8 Ruler. The heads snap into alignment, four spaces apart, and the Hydra howls. "NAME OUR ERRORS," they hiss, "AND COUNT OUR RANGE."',
                win: 'The last head dedents to column zero and falls silent. deploy.py compiles. The passage into the Standard Library stands open.'
            }
        },

        // ======================= ACT II =======================
        'site-packages': {
            act: 2, name: 'The Plaza of site-packages',
            text: 'A plaza crowded with installed packages, half of them pinned and half of them not. North is a forge, east a fortress, west a cellar door, and to the south a pit rumbles with version conflicts.',
            exits: { north: 'slice-forge', east: 'except-bastion', west: 'pickle-cellar', south: 'dependency-pit' },
            features: [
                { names: ['packages', 'crowd'], text: 'requests is here, and urllib3 is standing very close to it. Someone installed both with sudo pip. You make a note.' },
                { names: ['pit', 'south', 'seals', 'seal'], text: 'Five seals ring the pit, one per guardian of this realm. From below comes the sound of a resolver backtracking forever.' }
            ]
        },
        'pickle-cellar': {
            act: 2, name: 'The Pickle Cellar',
            text: 'Shelves of jars hold serialized objects of uncertain origin. A sign warns: "Never unpickle data you did not pickle yourself." The plaza is back east.',
            exits: { east: 'site-packages' },
            features: [
                { names: ['shelves', 'shelf', 'jars'], text: 'Most jars are labelled "untrusted". One, in your own handwriting, holds actual pickles.', reveals: 'pickle-jar' },
                { names: ['sign'], text: 'Below it, someone has scratched: "pickle.loads() is just eval() with extra steps."' }
            ]
        },
        'slice-forge': {
            act: 2, name: 'The Slice Forge',
            text: 'A smith hammers lists into shorter lists on an anvil marked [start:stop:step]. Sparks fly backwards whenever the step is negative. A loom clatters to the north; the plaza is south.',
            exits: { south: 'site-packages', north: 'comp-loom' },
            quiz: { topic: 'python-slice', guardian: 'the Slice Smith', intro: 'The smith blocks the door with a half-forged sequence. "Tell me what comes off the anvil," she says, "and mind the stop."', cleared: 'The smith hands you a slice, start included, stop excluded, and waves you through.' }
        },
        'comp-loom': {
            act: 2, name: 'The Comprehension Loom',
            text: 'A loom weaves whole lists in a single line, each thread filtered by an if. A door to the east smells of old paper. The forge is back south.',
            exits: { south: 'slice-forge', east: 'dict-archive' },
            quiz: { topic: 'python-comp', guardian: 'the Comprehension Spider', intro: 'A spider drops from the loom, eight legs working a one-liner. "Predict my weaving," it says, "before I finish."', cleared: 'The spider folds your answer into a list and scuttles aside.' }
        },
        'dict-archive': {
            act: 2, name: 'The Hash Table Archive',
            text: 'Endless drawers, each labelled with a key, filed in the order they were inserted. A vault door lies east. The loom is back west.',
            exits: { west: 'comp-loom', east: 'lockfile-vault' },
            quiz: { topic: 'python-dict', guardian: 'the Key Librarian', intro: 'A librarian with a ring of hashed keys blocks the stacks. "KeyErrors are not tolerated here. Show me you know how to look things up."', cleared: 'The librarian get()s out of your way, with a default of politeness.' }
        },
        'except-bastion': {
            act: 2, name: 'The Bastion of try',
            text: 'A fortress with four gates in a row: try, except, else and finally. The last one is always open. An observatory dome rises to the east; the plaza is back west.',
            exits: { west: 'site-packages', east: 'net-observatory' },
            quiz: { topic: 'python-except', guardian: 'the Finally Knight', intro: 'A knight in plate stands at the last gate. "Whatever happens in there," it says, "I always run. Tell me in what order."', cleared: 'The knight salutes. "Cleanup complete." The gates swing open.' }
        },
        'net-observatory': {
            act: 2, name: 'The ipaddress Observatory',
            text: 'A brass telescope points at a sky full of CIDR blocks. Charts on the wall show every /24 in 10.0.0.0/8. A tunnel leads north. The bastion is back west.',
            exits: { west: 'except-bastion', north: 'pycache-crypt' },
            quiz: { topic: 'python-ipaddress', guardian: 'the ipaddress Astronomer', intro: 'An astronomer looks up from the eyepiece. "No hand-rolled subnet math in my observatory. What does the module say?"', cleared: 'The astronomer checks your answer against the stars and lets you pass, strict=False.' }
        },
        'pycache-crypt': {
            act: 2, name: 'The __pycache__ Crypt',
            text: 'A crypt of compiled bytecode, each tomb stamped with a magic number. A folder lies on the floor. Passages lead north and south.',
            exits: { south: 'net-observatory', north: 'lockfile-vault' },
            items: ['pycache'],
            features: [
                { names: ['tombs', 'tomb', 'bytecode'], text: 'One tomb reads: "deploy.cpython-312.pyc. Stale since someone edited the .py and restarted nothing."' }
            ]
        },
        'lockfile-vault': {
            act: 2, name: 'The Lockfile Vault',
            text: 'A vault where every version is pinned with == and every hash is checked. A scroll lies on a pedestal. Doors lead west to the archive and south to the crypt.',
            exits: { west: 'dict-archive', south: 'pycache-crypt' },
            items: ['lockfile'],
            features: [
                { names: ['pedestal'], text: 'An inscription: "It worked on my machine" crossed out, and "It works in the venv" written underneath.' }
            ]
        },
        'dependency-pit': {
            act: 2, name: 'The Pit of the Dependency Wyrm', boss: true,
            text: 'A pit coiled with version ranges. The Dependency Wyrm rests on a hoard of conflicting packages, each demanding a different urllib3. A stair at the back climbs toward the automation server.',
            exits: { north: 'site-packages' },
            bossFight: {
                name: 'the Dependency Wyrm', topics: ['python-tooling', 'python-sorted'], key: 'lockfile',
                locked: 'The Wyrm breathes a cloud of >= and ~= at you. Every time you install one thing, two others break. You need versions that hold still.',
                intro: 'You unroll the Pinned Requirements Scroll. The Wyrm\'s ranges collapse into exact versions and it hisses. "PINNED? Then prove you can run a clean environment."',
                win: 'The resolver finishes in under a second. The Wyrm uninstalls itself, and the stair to the automation server is clear.'
            }
        },

        // ======================= ACT III =======================
        'runner-hall': {
            act: 3, name: 'The Runner Hall',
            text: 'Build agents stand in rows, all idle, all waiting on one job that will not finish. North a throne room glows hot. Halls run east and west, and a tea room sits to the south.',
            exits: { north: 'gil-throne', east: 'mutable-hall', west: 'decorator-gallery', south: 'tea-room' },
            features: [
                { names: ['agents', 'runners', 'build agents'], text: 'Every agent shows the same status: "Waiting for lock." CPU usage on the 32-core host: 3%.' },
                { names: ['throne', 'north', 'seals', 'seal'], text: 'The throne room door has five seals, one per guardian of this realm. Behind it, a single core runs at 100%.' }
            ]
        },
        'tea-room': {
            act: 3, name: 'The Tea Room',
            text: 'A quiet room with a kettle, a stack of runbooks and a whiteboard covered in race conditions. The hall is back north.',
            exits: { north: 'runner-hall' },
            features: [
                { names: ['kettle', 'cupboard', 'table'], text: 'Next to the kettle is a full thermos, labelled with your name in your own handwriting. Past you planned ahead.', reveals: 'thermos' },
                { names: ['whiteboard', 'board'], text: 'Someone has drawn two threads incrementing one counter. The final value is circled, with three question marks.' }
            ]
        },
        'mutable-hall': {
            act: 3, name: 'The Hall of Default Arguments',
            text: 'Every chair in this hall is the same chair, shared by everyone who ever sat in it. A well echoes to the north. The runner hall is back west.',
            exits: { west: 'runner-hall', north: 'generator-well' },
            quiz: { topic: 'python-mutable', guardian: 'the Mutable Default Mimic', intro: 'A treasure chest marked acc=[] snaps open, already full of everything from the last call. "Trust me," it says. "I am empty."', cleared: 'You pass None as the default. The Mimic closes, finally empty.' }
        },
        'generator-well': {
            act: 3, name: 'The Generator Well',
            text: 'A well that yields one bucket of water each time you ask, and nothing until you do. A cold draft blows from the east. The hall is back south.',
            exits: { south: 'mutable-hall', east: 'closure-crypt' },
            quiz: { topic: 'python-generators', guardian: 'the Lazy Evaluator', intro: 'A figure lounges on the well\'s rim and will not do any work until something calls next(). "Ask nicely," it yawns.', cleared: 'The Evaluator yields you passage and goes back to being suspended.' }
        },
        'closure-crypt': {
            act: 3, name: 'The Closure Crypt',
            text: 'Lambdas haunt this crypt, each still holding a variable from a loop that ended long ago. A forge glows to the east. The well is back west.',
            exits: { west: 'generator-well', east: 'process-forge' },
            quiz: { topic: 'python-closures', guardian: 'the Late-Binding Wraith', intro: 'A wraith that remembers only the last value of every loop drifts toward you. "Call me," it whispers, "and see what I captured."', cleared: 'You bind the wraith with a default argument and it fades to its correct value.' }
        },
        'decorator-gallery': {
            act: 3, name: 'The Decorator Gallery',
            text: 'Portraits hang in frames inside frames inside frames. Each frame changes what the picture does. A labyrinth opens to the north; the runner hall is back east.',
            exits: { east: 'runner-hall', north: 'regex-maze' },
            quiz: { topic: 'python-decorators', guardian: 'the Wrapper', intro: 'A figure wrapped in layers of @ symbols steps out of a frame. "I am not the function you called," it says. "Tell me what I do."', cleared: 'The Wrapper unwraps itself, functools.wraps and all, and steps aside.' }
        },
        'regex-maze': {
            act: 3, name: 'The Regex Labyrinth',
            text: 'Walls of backslashes, brackets and question marks twist in every direction. Somewhere a greedy star is eating a corridor. Paths lead south and east.',
            exits: { south: 'decorator-gallery', east: 'debt-museum' },
            quiz: { topic: 'python-regex', guardian: 'the Backreference Minotaur', intro: 'A minotaur with \\1 branded on its flank lowers its horns. "Match me," it bellows, "or be captured in a group."', cleared: 'The Minotaur\'s pattern fails to match you, and it backtracks out of the way.' }
        },
        'debt-museum': {
            act: 3, name: 'The Museum of Technical Debt',
            text: 'Exhibits include a 4,000-line utils.py, a bare except: pass, and a script that shells out to Python from Python. A forge glows to the north; the labyrinth is back west.',
            exits: { west: 'regex-maze', north: 'process-forge' },
            features: [
                { names: ['utils.py', 'utils', 'exhibit', 'exhibits'], text: 'utils.py contains 212 functions. One is called do_stuff2_final. It is imported by everything.' },
                { names: ['except', 'bare except'], text: 'The placard reads: "except: pass. Swallowed 14,000 errors and one KeyboardInterrupt. Donated by the network team."' }
            ]
        },
        'process-forge': {
            act: 3, name: 'The Process Forge',
            text: 'A forge that splits one task into many, each with its own interpreter and its own memory. A pitchfork leans against the anvil. Doors lead west to the crypt and south to the museum.',
            exits: { west: 'closure-crypt', south: 'debt-museum' },
            items: ['pitchfork'],
            features: [
                { names: ['anvil', 'forge'], text: 'Engraved on the anvil: "if __name__ == \'__main__\':". Forget it on Windows and the forge spawns forever.' }
            ]
        },
        'gil-throne': {
            act: 3, name: 'The Throne of the GIL Golem', boss: true,
            text: 'The automation server\'s throne room. The GIL Golem sits on the only lock in the building, letting one thread through at a time. Behind it, the deploy pipeline glows red.',
            exits: { south: 'runner-hall' },
            bossFight: {
                name: 'the GIL Golem', topics: ['python-concurrency', 'python-packaging'], key: 'pitchfork',
                locked: 'The Golem grips the lock. Every thread you send at it waits its turn, and none of them gets far. One interpreter will never beat it.',
                intro: 'You raise the Pitchfork of Multiprocessing. Each tine is its own process, and the Golem cannot hold them all. "SEPARATE INTERPRETERS?" it grinds. "THEN KNOW YOUR CONCURRENCY, AND SHIP IT PROPERLY."',
                win: 'The Golem releases the lock and crumbles into bytecode. The stuck job finishes, the runners wake, and every stage of the deploy pipeline turns green.'
            }
        }
    };

    W.register({
        id: 'python',
        name: 'Python Realm',
        blurb: 'Python 3 for automation: slicing, comprehensions, exceptions, ipaddress, closures and the GIL.',
        target: 'the deploy pipeline',
        epilogue: 'You open a pull request that adds a linter, pins the requirements and deletes __pycache__ from git. It sits in review for three weeks.',
        items: ITEMS,
        acts: ACTS,
        rooms: ROOMS
    });
});
