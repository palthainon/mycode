(function() {
    // Tool registry - organized by category
    const toolsData = {
        home: {
            name: 'Home',
            file: 'index.html',
            id: 'home'
        },
        network: [
            { name: 'Subnet Calculator', file: 'nettools/subnet-calculator.html', id: 'subnet' },
            { name: 'Subnet Planner', file: 'nettools/subnet-planner.html', id: 'planner' },
            { name: 'CIDR Convert', file: 'nettools/cidr-converter.html', id: 'cidr' },
            { name: 'Bit Calc', file: 'nettools/bit-calculator.html', id: 'bit' },
            { name: 'Data-Rate Calc', file: 'nettools/data-rate-calculator.html', id: 'data-rate' },
            { name: 'MTU Calc', file: 'nettools/mtu-calculator.html', id: 'mtu' },
            { name: 'Jinja Builder', file: 'nettools/jinja-builder.html', id: 'jinja' }
        ],
        system: [
            { name: 'Regex', file: 'system/regex-tester.html', id: 'regex' },
            { name: 'Timestamp Convert', file: 'system/timestamp-converter.html', id: 'timestamp' },
            { name: 'Disk Tools', file: 'system/disk-tools.html', id: 'disk' },
            { name: 'IOPS Calc', file: 'system/iops-calculator.html', id: 'iops' },
            { name: 'Password Gen', file: 'system/passphrase-generator.html', id: 'password' },
            { name: 'Certificate Parse', file: 'system/certificate-parser.html', id: 'cert-parser' },
            { name: 'Log Parser', file: 'system/log-parser.html', id: 'log-parser' },
            { separator: '(Linux)' },
            { name: 'Cron', file: 'system/cron-builder.html', id: 'cron' },
            { name: 'Chmod', file: 'system/chmod-calculator.html', id: 'chmod' }
        ],
        data: [
            { name: 'Base64/Hash', file: 'data/base64-hash.html', id: 'base64' },
            { name: 'String Tools', file: 'data/string-tools.html', id: 'string-tools' },
            { name: 'Text Diff(Compare)', file: 'data/text-diff.html', id: 'text-diff' },
            { name: 'UUID Gen', file: 'data/uuid-generator.html', id: 'uuid' },
            { name: 'Measurement Convert', file: 'data/measurement-converter.html', id: 'measurement' }
        ],
        financials: [
            { name: 'Amortization', file: 'financials/amortization-calculator.html', id: 'amortization' },
            { name: 'Compound Interest', file: 'financials/compound-interest-calculator.html', id: 'compound-interest' },
            { name: 'Debt Payoff', file: 'financials/debt-payoff-comparison.html', id: 'debt-payoff' },
            { name: 'Retirement', file: 'financials/retirement-calculator.html', id: 'retirement' },
            { name: 'Take-Home Pay', file: 'financials/take-home-pay-calculator.html', id: 'take-home-pay' },
            { name: 'Salary ↔ Hourly', file: 'financials/salary-hourly-converter.html', id: 'salary-hourly' }
        ],
        productivity: [
            { name: 'Pomodoro Timer', file: 'productivity/pomodoro.html', id: 'pomodoro' },
            { name: 'Scratchpad', file: 'productivity/scratchpad.html', id: 'scratchpad' },
            { name: 'Countdown Timer', file: 'productivity/countdown-timer.html', id: 'countdown-timer' },
            { name: 'TZ Meeting Planner', file: 'productivity/tz-meeting-planner.html', id: 'tz-meeting-planner' }
        ]
    };

    // Canonical site URL (used for absolute URLs in JSON-LD schema)
    const SITE_ORIGIN = 'https://oldweb.tech';

    // Category metadata used for breadcrumbs, JSON-LD, and search labels
    const categoryMeta = {
        network:      { displayName: 'Network Tools',      subdir: 'nettools/' },
        system:       { displayName: 'System Tools',       subdir: 'system/' },
        data:         { displayName: 'Data Tools',         subdir: 'data/' },
        financials:   { displayName: 'Financial Tools',    subdir: 'financials/' },
        productivity: { displayName: 'Productivity Tools', subdir: 'productivity/' }
    };

    // Full registry of every page (including ones omitted from the dropdown menus).
    // Powers site-wide search, breadcrumbs, and per-tool JSON-LD.
    const toolRegistry = [
        // Network
        { id: 'subnet',          name: 'Subnet Calculator (IPv4)',      file: 'nettools/subnet-calculator.html',       category: 'network',      keywords: ['ip', 'ipv4', 'subnet', 'cidr', 'mask', 'netmask', 'broadcast'] },
        { id: 'subnet-ipv6',     name: 'Subnet Calculator (IPv6)',      file: 'nettools/subnet-calculator-ipv6.html',  category: 'network',      keywords: ['ipv6', 'subnet', 'prefix', 'cidr'] },
        { id: 'planner',         name: 'Subnet Planner (IPv4)',         file: 'nettools/subnet-planner.html',          category: 'network',      keywords: ['vlsm', 'subnet', 'planner', 'allocation', 'design'] },
        { id: 'planner-ipv6',    name: 'Subnet Planner (IPv6)',         file: 'nettools/subnet-planner-ipv6.html',     category: 'network',      keywords: ['ipv6', 'planner', 'allocation', 'prefix'] },
        { id: 'cidr',            name: 'CIDR Converter',                file: 'nettools/cidr-converter.html',          category: 'network',      keywords: ['cidr', 'netmask', 'wildcard', 'prefix', 'convert'] },
        { id: 'bit',             name: 'Bit/Byte Calculator',           file: 'nettools/bit-calculator.html',          category: 'network',      keywords: ['bit', 'byte', 'kilobyte', 'megabyte', 'gigabyte', 'convert'] },
        { id: 'data-rate',       name: 'Data Rate Calculator',          file: 'nettools/data-rate-calculator.html',    category: 'network',      keywords: ['bandwidth', 'mbps', 'gbps', 'transfer', 'throughput', 'speed'] },
        { id: 'mtu',             name: 'MTU Calculator',                file: 'nettools/mtu-calculator.html',          category: 'network',      keywords: ['mtu', 'mss', 'fragmentation', 'packet', 'size'] },
        { id: 'jinja',           name: 'Jinja Template Builder',        file: 'nettools/jinja-builder.html',           category: 'network',      keywords: ['jinja', 'template', 'config', 'ansible', 'render'] },
        // System
        { id: 'regex',           name: 'Regex Tester',                  file: 'system/regex-tester.html',              category: 'system',       keywords: ['regex', 'regexp', 'pattern', 'match', 'test', 'pcre'] },
        { id: 'timestamp',       name: 'Timestamp Converter',           file: 'system/timestamp-converter.html',       category: 'system',       keywords: ['unix', 'epoch', 'timestamp', 'date', 'time', 'iso8601'] },
        { id: 'disk',            name: 'Disk Tools',                    file: 'system/disk-tools.html',                category: 'system',       keywords: ['disk', 'storage', 'raid', 'capacity', 'partition'] },
        { id: 'iops',            name: 'IOPS Calculator',               file: 'system/iops-calculator.html',           category: 'system',       keywords: ['iops', 'raid', 'aws', 'ebs', 'azure', 'gcp', 'performance'] },
        { id: 'password-gen',    name: 'Password Generator',            file: 'system/password-generator.html',        category: 'system',       keywords: ['password', 'random', 'secure', 'credentials'] },
        { id: 'passphrase',      name: 'Passphrase Generator',          file: 'system/passphrase-generator.html',      category: 'system',       keywords: ['passphrase', 'diceware', 'password', 'secure', 'memorable'] },
        { id: 'cert-parser',     name: 'Certificate Parser',            file: 'system/certificate-parser.html',        category: 'system',       keywords: ['certificate', 'ssl', 'tls', 'x509', 'pem', 'der', 'parse'] },
        { id: 'log-parser',      name: 'Log Parser',                    file: 'system/log-parser.html',                category: 'system',       keywords: ['log', 'syslog', 'parse', 'grep', 'analyze'] },
        { id: 'cron',            name: 'Cron Builder',                  file: 'system/cron-builder.html',              category: 'system',       keywords: ['cron', 'crontab', 'schedule', 'job', 'linux'] },
        { id: 'chmod',           name: 'Chmod Calculator',              file: 'system/chmod-calculator.html',          category: 'system',       keywords: ['chmod', 'permissions', 'octal', 'unix', 'linux', 'file mode'] },
        // Data
        { id: 'base64',          name: 'Base64 & Hash Tools',           file: 'data/base64-hash.html',                 category: 'data',         keywords: ['base64', 'hash', 'md5', 'sha1', 'sha256', 'encode', 'decode'] },
        { id: 'string-tools',    name: 'String Tools',                  file: 'data/string-tools.html',                category: 'data',         keywords: ['string', 'case', 'upper', 'lower', 'trim', 'transform'] },
        { id: 'text-diff',       name: 'Text Diff / Compare',           file: 'data/text-diff.html',                   category: 'data',         keywords: ['diff', 'compare', 'text', 'changes', 'merge'] },
        { id: 'uuid',            name: 'UUID Generator',                file: 'data/uuid-generator.html',              category: 'data',         keywords: ['uuid', 'guid', 'random', 'identifier', 'v4'] },
        { id: 'measurement',     name: 'Measurement Converter',         file: 'data/measurement-converter.html',       category: 'data',         keywords: ['convert', 'unit', 'measurement', 'metric', 'imperial'] },
        // Financials
        { id: 'amortization',    name: 'Amortization Calculator',       file: 'financials/amortization-calculator.html',     category: 'financials', keywords: ['mortgage', 'loan', 'amortization', 'payment', 'schedule', 'interest'] },
        { id: 'compound-interest', name: 'Compound Interest Calculator', file: 'financials/compound-interest-calculator.html', category: 'financials', keywords: ['compound', 'interest', 'investment', 'savings', 'growth'] },
        { id: 'debt-payoff',     name: 'Debt Payoff Comparison',        file: 'financials/debt-payoff-comparison.html',      category: 'financials', keywords: ['debt', 'snowball', 'avalanche', 'payoff', 'credit card'] },
        { id: 'retirement',      name: 'Retirement Calculator',         file: 'financials/retirement-calculator.html',       category: 'financials', keywords: ['retirement', '401k', 'ira', 'savings', 'fire'] },
        { id: 'take-home-pay',   name: 'Take-Home Pay Calculator',      file: 'financials/take-home-pay-calculator.html',    category: 'financials', keywords: ['paycheck', 'net pay', 'take home', 'salary', 'tax', 'fica', 'federal', 'state tax', '401k', 'hsa'] },
        { id: 'salary-hourly',   name: 'Salary to Hourly Converter',    file: 'financials/salary-hourly-converter.html',     category: 'financials', keywords: ['salary', 'hourly', 'wage', 'rate', 'convert', 'annual', 'weekly', 'biweekly'] },
        { id: 'loan-payoff',     name: 'Loan Payoff Methods',           file: 'financials/loan-payoff-methods.html',         category: 'financials', keywords: ['loan', 'payoff', 'extra payment', 'biweekly', 'strategy'] },
        { id: 'loan-reference',  name: 'Loan Reference',                file: 'financials/loan-reference.html',              category: 'financials', keywords: ['loan', 'reference', 'glossary', 'apr', 'apy'] },
        // Productivity
        { id: 'pomodoro',         name: 'Pomodoro Timer',                file: 'productivity/pomodoro.html',            category: 'productivity', keywords: ['pomodoro', 'timer', 'focus', 'productivity', '25 minute'] },
        { id: 'scratchpad',       name: 'Plaintext Scratchpad',          file: 'productivity/scratchpad.html',          category: 'productivity', keywords: ['scratchpad', 'notepad', 'notes', 'plaintext', 'autosave', 'sticky'] },
        { id: 'countdown-timer',  name: 'Countdown Timer',               file: 'productivity/countdown-timer.html',     category: 'productivity', keywords: ['countdown', 'timer', 'deadline', 'date', 'days until', 'event'] },
        { id: 'tz-meeting-planner', name: 'Timezone Meeting Planner',    file: 'productivity/tz-meeting-planner.html',  category: 'productivity', keywords: ['timezone', 'tz', 'meeting', 'world clock', 'time zone', 'converter', 'scheduler'] }
    ];

    // Per-tool descriptions for JSON-LD (kept short; meta description owns long-form copy)
    const toolDescriptions = {
        'subnet':            'Calculate IPv4 subnet ranges, broadcast addresses, host counts, and netmasks.',
        'subnet-ipv6':       'Calculate IPv6 prefixes, address ranges, and host counts.',
        'planner':           'Plan IPv4 subnet allocations using VLSM.',
        'planner-ipv6':      'Plan IPv6 subnet allocations and prefix delegations.',
        'cidr':              'Convert between CIDR notation, netmasks, and wildcard masks.',
        'bit':               'Convert between bits, bytes, and binary/decimal multiples.',
        'data-rate':         'Calculate data transfer times across bandwidth tiers.',
        'mtu':               'Calculate MTU, MSS, and fragmentation thresholds.',
        'jinja':             'Build and preview Jinja2 templates for network configs.',
        'regex':             'Test regular expressions against sample text with live highlighting.',
        'timestamp':         'Convert between Unix timestamps and human-readable dates.',
        'disk':              'Plan disk capacity, RAID overhead, and usable storage.',
        'iops':              'Calculate IOPS for on-prem RAID, AWS EBS, Azure, and GCP volumes.',
        'password-gen':      'Generate strong random passwords with configurable character sets.',
        'passphrase':        'Generate memorable diceware-style passphrases.',
        'cert-parser':       'Parse and inspect X.509 certificates from PEM or DER input.',
        'log-parser':        'Parse and filter log files for analysis.',
        'cron':              'Build and validate cron expressions with a visual schedule preview.',
        'chmod':             'Calculate Unix file permissions in octal and symbolic notation.',
        'base64':            'Encode/decode Base64 and compute MD5, SHA-1, SHA-256, and SHA-512 hashes.',
        'string-tools':      'Transform strings: case, trim, escape, encode, and more.',
        'text-diff':         'Compare two blocks of text and highlight differences.',
        'uuid':              'Generate UUIDs (v4 and others) in bulk.',
        'measurement':       'Convert between units of length, weight, volume, and more.',
        'amortization':      'Calculate loan payments and generate a full amortization schedule.',
        'compound-interest': 'Calculate compound interest growth on investments and savings.',
        'debt-payoff':       'Compare snowball vs avalanche debt-payoff strategies side by side.',
        'retirement':        'Project retirement savings with contribution and growth assumptions.',
        'take-home-pay':     'Estimate take-home pay after US federal income tax, FICA, and state tax.',
        'salary-hourly':     'Convert between hourly, weekly, biweekly, monthly, and annual pay rates.',
        'loan-payoff':       'Compare loan payoff strategies including biweekly and extra payments.',
        'loan-reference':    'Glossary and reference of loan terminology.',
        'pomodoro':          'Pomodoro focus timer with configurable work and break intervals.',
        'scratchpad':        'Persistent plaintext scratchpad that auto-saves to your browser.',
        'countdown-timer':   'Live countdown timer to any future date or time with notifications.',
        'tz-meeting-planner':'Plan meetings across timezones with business-hours indicators.'
    };

    // Track currently open dropdown
    let currentOpenDropdown = null;

    // Navigation CSS styles
    const navStyles = `
        /* Add spacing between navigation and page heading */
        .container h1,
        body > h1 {
            margin-top: 30px !important;
        }

        .nav-bar {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 15px;
            align-items: center;
            z-index: 1000;
        }

        .nav-home {
            color: #4fc3f7;
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 600;
            transition: color 0.2s, text-shadow 0.2s;
        }

        .nav-home:hover {
            color: #2196f3;
            text-shadow: 0 0 10px rgba(79, 195, 247, 0.5);
        }

        .nav-home[aria-current="page"] {
            color: #66bb6a;
            border-bottom: 2px solid #66bb6a;
            padding-bottom: 2px;
        }

        .nav-separator {
            color: rgba(79, 195, 247, 0.3);
            user-select: none;
        }

        .nav-categories {
            display: flex;
            gap: 5px;
            align-items: center;
        }

        .nav-category {
            position: relative;
        }

        .nav-category-btn {
            background: transparent;
            border: none;
            color: #4fc3f7;
            font-size: 0.9rem;
            font-weight: 600;
            padding: 8px 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: color 0.2s, text-shadow 0.2s, background 0.2s;
            border-radius: 4px;
            font-family: inherit;
        }

        .nav-category-btn:hover {
            color: #2196f3;
            text-shadow: 0 0 10px rgba(79, 195, 247, 0.5);
            background: rgba(79, 195, 247, 0.1);
        }

        .nav-category-btn:focus {
            outline: 2px solid #4fc3f7;
            outline-offset: 2px;
        }

        .nav-category-btn[aria-expanded="true"] {
            background: rgba(79, 195, 247, 0.15);
        }

        .nav-category.current .nav-category-btn {
            border-bottom: 2px solid #66bb6a;
        }

        .nav-chevron {
            font-size: 0.7rem;
            transition: transform 0.2s ease;
            display: inline-block;
        }

        .nav-category-btn[aria-expanded="true"] .nav-chevron {
            transform: rotate(180deg);
        }

        .nav-dropdown {
            position: absolute;
            top: calc(100% + 8px);
            left: 0;
            min-width: 180px;
            background: #16213e;
            backdrop-filter: blur(10px);
            border-radius: 8px;
            border: 1px solid rgba(79, 195, 247, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            padding: 8px 0;
            opacity: 0;
            transform: translateY(-10px);
            transition: opacity 0.2s ease, transform 0.2s ease;
            pointer-events: none;
        }

        .nav-dropdown:not([hidden]) {
            opacity: 1;
            transform: translateY(0);
            pointer-events: auto;
        }

        .nav-dropdown-link {
            display: block;
            color: #4fc3f7;
            text-decoration: none;
            padding: 10px 20px;
            font-size: 0.9rem;
            font-weight: 500;
            transition: background 0.2s, color 0.2s, padding-left 0.2s;
            border-left: 3px solid transparent;
        }

        .nav-dropdown-link:hover {
            background: rgba(79, 195, 247, 0.1);
            color: #2196f3;
            padding-left: 24px;
        }

        .nav-dropdown-link:focus {
            outline: 2px solid #4fc3f7;
            outline-offset: -2px;
        }

        .nav-dropdown-link[aria-current="page"] {
            color: #66bb6a;
            border-left-color: #66bb6a;
            background: rgba(102, 187, 106, 0.1);
            font-weight: 600;
        }

        .nav-dropdown-separator {
            color: rgba(79, 195, 247, 0.5);
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            padding: 12px 20px 8px 20px;
            margin-top: 8px;
            border-top: 1px solid rgba(79, 195, 247, 0.1);
            letter-spacing: 0.5px;
            user-select: none;
        }

        .nav-dropdown-separator:first-child {
            margin-top: 0;
            border-top: none;
            padding-top: 8px;
        }

        /* Search trigger button */
        .nav-search-btn {
            background: transparent;
            border: 1px solid rgba(79, 195, 247, 0.4);
            color: #4fc3f7;
            font-size: 0.85rem;
            padding: 6px 10px;
            border-radius: 6px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-family: inherit;
            transition: background 0.2s, border-color 0.2s, color 0.2s;
        }

        .nav-search-btn:hover {
            background: rgba(79, 195, 247, 0.1);
            border-color: rgba(79, 195, 247, 0.7);
        }

        .nav-search-btn:focus-visible {
            outline: 2px solid #4fc3f7;
            outline-offset: 2px;
        }

        .nav-search-btn kbd {
            font-family: 'Courier New', Courier, monospace;
            font-size: 0.7rem;
            background: rgba(79, 195, 247, 0.15);
            border: 1px solid rgba(79, 195, 247, 0.3);
            border-radius: 3px;
            padding: 1px 5px;
            color: #90caf9;
        }

        /* Breadcrumbs */
        .breadcrumbs {
            font-size: 0.85rem;
            margin: 50px 0 16px 0;
            color: #90caf9;
        }
        .breadcrumbs ol {
            list-style: none;
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            padding: 0;
            margin: 0;
        }
        .breadcrumbs li {
            display: flex;
            align-items: center;
        }
        .breadcrumbs li + li::before {
            content: "\\203A";
            margin-right: 6px;
            color: rgba(144, 202, 249, 0.5);
        }
        .breadcrumbs a {
            color: #4fc3f7;
            text-decoration: none;
        }
        .breadcrumbs a:hover {
            text-decoration: underline;
        }
        .breadcrumbs [aria-current="page"] {
            color: #90caf9;
        }

        /* Search overlay */
        .search-overlay {
            position: fixed;
            inset: 0;
            background: rgba(10, 14, 26, 0.75);
            backdrop-filter: blur(4px);
            z-index: 2000;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding-top: 12vh;
        }
        .search-overlay[hidden] {
            display: none;
        }
        .search-panel {
            width: min(560px, calc(100% - 32px));
            background: #16213e;
            border: 1px solid rgba(79, 195, 247, 0.3);
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        .search-input-row {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 14px 18px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .search-input-row svg {
            color: #4fc3f7;
            flex-shrink: 0;
        }
        .search-input {
            flex: 1;
            background: transparent;
            border: none;
            color: #fff;
            font-size: 1rem;
            font-family: inherit;
            outline: none;
            min-width: 0;
        }
        .search-hint {
            font-size: 0.75rem;
            color: rgba(144, 202, 249, 0.6);
            white-space: nowrap;
        }
        .search-results {
            list-style: none;
            margin: 0;
            padding: 6px 0;
            max-height: 50vh;
            overflow-y: auto;
        }
        .search-result {
            display: flex;
            flex-direction: column;
            gap: 2px;
            padding: 10px 18px;
            cursor: pointer;
            color: #fff;
            text-decoration: none;
        }
        .search-result:hover,
        .search-result.active {
            background: rgba(79, 195, 247, 0.12);
        }
        .search-result-name {
            color: #4fc3f7;
            font-weight: 500;
        }
        .search-result-meta {
            font-size: 0.75rem;
            color: rgba(144, 202, 249, 0.7);
        }
        .search-empty {
            padding: 20px 18px;
            color: rgba(144, 202, 249, 0.7);
            font-size: 0.9rem;
            text-align: center;
        }

        @media (max-width: 768px) {
            /* Reset h1 top margin on mobile since nav is in normal flow */
            .container h1,
            body > h1 {
                margin-top: 30px !important;
            }

            .breadcrumbs {
                margin-top: 8px;
            }

            .nav-bar {
                position: static;
                transform: none;
                flex-direction: column;
                align-items: stretch;
                gap: 10px;
                margin-bottom: 20px;
            }

            .nav-home {
                text-align: center;
                padding: 8px;
            }

            .nav-separator {
                display: none;
            }

            .nav-categories {
                justify-content: center;
                flex-wrap: wrap;
            }

            .nav-category-btn {
                min-width: 100px;
                min-height: 44px;
                justify-content: center;
            }

            .nav-dropdown {
                left: 50%;
                transform: translateX(-50%) translateY(-10px);
                min-width: 200px;
                z-index: 1001;
                background: #16213e;
                background-color: #16213e;
                background-image: none;
                backdrop-filter: none;
                -webkit-backdrop-filter: none;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
            }

            .nav-dropdown:not([hidden]) {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
                pointer-events: auto;
            }

        }
    `;

    // Detect current page and its category
    function getCurrentPageInfo() {
        const pathname = window.location.pathname;
        const filename = pathname.split('/').pop() || 'index.html';

        // Check for category index pages first (before generic index.html check)
        if (pathname.includes('/nettools/') && (filename === 'index.html' || filename === '')) {
            return { id: 'network-home', category: 'network' };
        }
        if (pathname.includes('/system/') && (filename === 'index.html' || filename === '')) {
            return { id: 'system-home', category: 'system' };
        }
        if (pathname.includes('/data/') && (filename === 'index.html' || filename === '')) {
            return { id: 'data-home', category: 'data' };
        }
        if (pathname.includes('/financials/') && (filename === 'index.html' || filename === '')) {
            return { id: 'financials-home', category: 'financials' };
        }
        if (pathname.includes('/productivity/') && (filename === 'index.html' || filename === '')) {
            return { id: 'productivity-home', category: 'productivity' };
        }

        // Handle root home page (only if not in a subfolder)
        if (filename === '' || filename === '/' || filename === 'index.html') {
            return { id: 'home', category: null };
        }

        // Special case: IPv6 subnet calculator (not in nav but should highlight network category)
        if (filename === 'subnet-calculator-ipv6.html') {
            return { id: 'subnet-ipv6', category: 'network' };
        }

        // Search through categories
        for (const [category, tools] of Object.entries(toolsData)) {
            if (category === 'home') continue;

            const tool = tools.find(t => t.file && t.file.endsWith(filename));
            if (tool) {
                return { id: tool.id, category: category };
            }
        }

        // Fallback: detect subdirectory from pathname even if file not in nav
        // This ensures pages not in the menu (e.g., educational pages) still get correct path prefixes
        if (pathname.includes('/financials/')) {
            return { id: null, category: 'financials' };
        }
        if (pathname.includes('/nettools/')) {
            return { id: null, category: 'network' };
        }
        if (pathname.includes('/system/')) {
            return { id: null, category: 'system' };
        }
        if (pathname.includes('/data/')) {
            return { id: null, category: 'data' };
        }
        if (pathname.includes('/productivity/')) {
            return { id: null, category: 'productivity' };
        }

        return { id: null, category: null };
    }

    // Generate navigation HTML
    function generateNavHTML(currentPage) {
        const homeCurrentAttr = currentPage.id === 'home' ? ' aria-current="page"' : '';

        // Determine if we're in a subfolder to adjust all links accordingly
        const inSubfolder = currentPage.category !== null;
        const pathPrefix = inSubfolder ? '../' : '';
        const homeLink = pathPrefix + 'index.html';

        let html = `<nav class="nav-bar" role="navigation" aria-label="Main navigation">
        <a href="${homeLink}" class="nav-home"${homeCurrentAttr}>Home</a>
        <span class="nav-separator">|</span>
        <button type="button" class="nav-search-btn" aria-label="Search tools" aria-haspopup="dialog">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>Search</span>
            <kbd>${navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} K</kbd>
        </button>
        <span class="nav-separator">|</span>
        <div class="nav-categories">`;

        // Generate each category
        for (const [category, tools] of Object.entries(toolsData)) {
            if (category === 'home') continue;

            const isCurrent = currentPage.category === category;
            const categoryClass = isCurrent ? ' class="nav-category current"' : ' class="nav-category"';
            const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

            html += `
            <div${categoryClass} data-category="${category}">
                <button class="nav-category-btn"
                        aria-expanded="false"
                        aria-controls="dropdown-${category}"
                        aria-haspopup="true">
                    ${categoryName}
                    <span class="nav-chevron" aria-hidden="true">▾</span>
                </button>
                <div class="nav-dropdown" id="dropdown-${category}" role="menu" hidden>`;

            // Generate tool links with adjusted paths
            tools.forEach(tool => {
                // Check if this is a separator
                if (tool.separator) {
                    html += `
                    <div class="nav-dropdown-separator" role="separator">${tool.separator}</div>`;
                } else {
                    const isCurrentTool = tool.id === currentPage.id;
                    const currentAttr = isCurrentTool ? ' aria-current="page"' : '';
                    // Adjust tool link based on current location
                    const toolLink = pathPrefix + tool.file;
                    html += `
                    <a href="${toolLink}" class="nav-dropdown-link" role="menuitem"${currentAttr}>${tool.name}</a>`;
                }
            });

            html += `
                </div>
            </div>`;
        }

        html += `
        </div>
    </nav>`;
        return html;
    }

    // Toggle dropdown
    function toggleDropdown(categoryBtn, dropdown) {
        const isExpanded = categoryBtn.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
            closeDropdown(categoryBtn, dropdown);
        } else {
            // Close any currently open dropdown
            if (currentOpenDropdown) {
                const { btn, menu } = currentOpenDropdown;
                closeDropdown(btn, menu);
            }

            openDropdown(categoryBtn, dropdown);
            currentOpenDropdown = { btn: categoryBtn, menu: dropdown };
        }
    }

    function openDropdown(btn, dropdown) {
        btn.setAttribute('aria-expanded', 'true');
        dropdown.removeAttribute('hidden');
    }

    function closeDropdown(btn, dropdown) {
        btn.setAttribute('aria-expanded', 'false');
        dropdown.setAttribute('hidden', '');
        currentOpenDropdown = null;
    }

    function closeAllDropdowns() {
        document.querySelectorAll('.nav-category-btn[aria-expanded="true"]').forEach(btn => {
            const dropdown = document.getElementById(btn.getAttribute('aria-controls'));
            if (dropdown) {
                closeDropdown(btn, dropdown);
            }
        });
    }

    // Setup event listeners
    function setupEventListeners() {
        // Category button clicks
        document.querySelectorAll('.nav-category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = document.getElementById(btn.getAttribute('aria-controls'));
                toggleDropdown(btn, dropdown);
            });
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-category')) {
                closeAllDropdowns();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Escape key closes dropdowns
            if (e.key === 'Escape') {
                const activeBtn = document.querySelector('.nav-category-btn[aria-expanded="true"]');
                if (activeBtn) {
                    const dropdown = document.getElementById(activeBtn.getAttribute('aria-controls'));
                    closeDropdown(activeBtn, dropdown);
                    activeBtn.focus();
                }
            }

            // Arrow down on category button opens dropdown
            if (e.key === 'ArrowDown' && e.target.classList.contains('nav-category-btn')) {
                e.preventDefault();
                const dropdown = document.getElementById(e.target.getAttribute('aria-controls'));
                if (e.target.getAttribute('aria-expanded') === 'false') {
                    toggleDropdown(e.target, dropdown);
                } else {
                    // Already open, focus first link
                    const firstLink = dropdown.querySelector('.nav-dropdown-link');
                    if (firstLink) firstLink.focus();
                }
            }

            // Arrow navigation within dropdown
            if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') &&
                e.target.classList.contains('nav-dropdown-link')) {
                e.preventDefault();
                const links = Array.from(e.target.closest('.nav-dropdown').querySelectorAll('.nav-dropdown-link'));
                const currentIndex = links.indexOf(e.target);

                if (e.key === 'ArrowDown') {
                    const nextLink = links[Math.min(currentIndex + 1, links.length - 1)];
                    nextLink.focus();
                } else {
                    if (currentIndex === 0) {
                        // Return to category button
                        const categoryBtn = e.target.closest('.nav-category').querySelector('.nav-category-btn');
                        const dropdown = e.target.closest('.nav-dropdown');
                        closeDropdown(categoryBtn, dropdown);
                        categoryBtn.focus();
                    } else {
                        links[currentIndex - 1].focus();
                    }
                }
            }

            // Home/End keys in dropdown
            if ((e.key === 'Home' || e.key === 'End') &&
                e.target.classList.contains('nav-dropdown-link')) {
                e.preventDefault();
                const links = Array.from(e.target.closest('.nav-dropdown').querySelectorAll('.nav-dropdown-link'));
                if (e.key === 'Home') {
                    links[0].focus();
                } else {
                    links[links.length - 1].focus();
                }
            }
        });
    }

    // ---------- Breadcrumbs ----------

    function findRegistryEntry(currentPage) {
        if (!currentPage) return null;
        if (currentPage.id) {
            const byId = toolRegistry.find(t => t.id === currentPage.id);
            if (byId) return byId;
        }
        // Fallback: match by filename for pages omitted from the dropdown nav
        const filename = (window.location.pathname.split('/').pop() || '').toLowerCase();
        if (!filename || filename === 'index.html') return null;
        return toolRegistry.find(t => t.file.toLowerCase().endsWith('/' + filename)) || null;
    }

    function buildBreadcrumbs(currentPage, pathPrefix) {
        // Only render breadcrumbs on pages with a category context (tool pages
        // and category index pages). Skip home and unknown pages.
        if (!currentPage.category) return null;
        const meta = categoryMeta[currentPage.category];
        if (!meta) return null;

        const homeHref = pathPrefix + 'index.html';
        const categoryHref = pathPrefix + meta.subdir + 'index.html';

        const isCategoryIndex = currentPage.id && currentPage.id.endsWith('-home');
        const entry = findRegistryEntry(currentPage);

        const items = [
            `<li><a href="${homeHref}">Home</a></li>`
        ];

        if (isCategoryIndex) {
            items.push(`<li aria-current="page">${meta.displayName}</li>`);
        } else if (entry) {
            items.push(`<li><a href="${categoryHref}">${meta.displayName}</a></li>`);
            items.push(`<li aria-current="page">${entry.name}</li>`);
        } else {
            // Unknown page within a known category (e.g., loan-reference if not in registry)
            items.push(`<li aria-current="page">${meta.displayName}</li>`);
        }

        return `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${items.join('')}</ol></nav>`;
    }

    function injectBreadcrumbs(currentPage, pathPrefix) {
        const html = buildBreadcrumbs(currentPage, pathPrefix);
        if (!html) return;
        const target = document.querySelector('main') || document.querySelector('.container');
        if (!target) return;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        target.insertBefore(tempDiv.firstElementChild, target.firstChild);
    }

    // ---------- JSON-LD schema ----------

    function injectJsonLd(currentPage, pathPrefix) {
        if (!currentPage.category) return; // home has its own JSON-LD
        const meta = categoryMeta[currentPage.category];
        if (!meta) return;

        const isCategoryIndex = currentPage.id && currentPage.id.endsWith('-home');
        const entry = findRegistryEntry(currentPage);

        const items = [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` }
        ];

        if (isCategoryIndex) {
            items.push({ '@type': 'ListItem', position: 2, name: meta.displayName, item: `${SITE_ORIGIN}/${meta.subdir}` });
        } else if (entry) {
            items.push({ '@type': 'ListItem', position: 2, name: meta.displayName, item: `${SITE_ORIGIN}/${meta.subdir}` });
            items.push({ '@type': 'ListItem', position: 3, name: entry.name, item: `${SITE_ORIGIN}/${entry.file}` });
        } else {
            return;
        }

        const breadcrumbLd = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: items
        };
        appendJsonLd(breadcrumbLd);

        if (entry && !isCategoryIndex && !hasExistingAppSchema()) {
            const description = toolDescriptions[entry.id] || `${entry.name} - free offline-ready utility from OldWeb Tools.`;
            const appLd = {
                '@context': 'https://schema.org',
                '@type': 'SoftwareApplication',
                name: entry.name,
                description: description,
                url: `${SITE_ORIGIN}/${entry.file}`,
                applicationCategory: 'UtilitiesApplication',
                operatingSystem: 'Web Browser',
                isAccessibleForFree: true,
                offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
                creator: { '@type': 'Organization', name: 'OldWeb.tech' }
            };
            appendJsonLd(appLd);
        }
    }

    // Most tool pages already ship inline WebApplication/SoftwareApplication LD;
    // detect and skip injection to avoid duplicate entities for the same URL.
    function hasExistingAppSchema() {
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        for (const s of scripts) {
            try {
                const data = JSON.parse(s.textContent);
                const types = Array.isArray(data) ? data.map(d => d['@type']) : [data['@type']];
                if (types.some(t => t === 'SoftwareApplication' || t === 'WebApplication')) {
                    return true;
                }
            } catch (e) { /* malformed JSON-LD: ignore */ }
        }
        return false;
    }

    function appendJsonLd(obj) {
        const s = document.createElement('script');
        s.type = 'application/ld+json';
        s.textContent = JSON.stringify(obj);
        document.head.appendChild(s);
    }

    // ---------- Search overlay ----------

    let searchOverlayEl = null;
    let searchInputEl = null;
    let searchResultsEl = null;
    let searchActiveIndex = -1;
    let searchCurrentResults = [];
    let searchPathPrefix = '';

    function buildSearchOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'search-overlay';
        overlay.setAttribute('hidden', '');
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Search tools');
        overlay.innerHTML = `
            <div class="search-panel">
                <div class="search-input-row">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="7"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text"
                           class="search-input"
                           id="oldweb-search-input"
                           placeholder="Search tools by name or keyword..."
                           autocomplete="off"
                           spellcheck="false"
                           role="combobox"
                           aria-autocomplete="list"
                           aria-controls="oldweb-search-results"
                           aria-expanded="true">
                    <span class="search-hint">Esc to close</span>
                </div>
                <ul class="search-results"
                    id="oldweb-search-results"
                    role="listbox"
                    aria-label="Search results"></ul>
            </div>`;
        document.body.appendChild(overlay);
        return overlay;
    }

    function renderSearchResults(query) {
        const q = query.trim().toLowerCase();
        let results;
        if (!q) {
            // No query: show first 8 tools as a starting point
            results = toolRegistry.slice(0, 8).map(t => ({ tool: t, score: 0 }));
        } else {
            results = toolRegistry
                .map(t => {
                    const nameLower = t.name.toLowerCase();
                    const keywordHit = (t.keywords || []).some(k => k.toLowerCase().includes(q));
                    let score = -1;
                    if (nameLower.startsWith(q))      score = 100;
                    else if (nameLower.includes(q))   score = 60;
                    else if (keywordHit)              score = 30;
                    return { tool: t, score };
                })
                .filter(r => r.score >= 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, 8);
        }

        searchCurrentResults = results.map(r => r.tool);
        searchActiveIndex = results.length ? 0 : -1;

        if (!results.length) {
            searchResultsEl.innerHTML = `<li class="search-empty" role="status">No tools match "${escapeHtml(query)}"</li>`;
            announce('No results');
            return;
        }

        searchResultsEl.innerHTML = results.map((r, i) => {
            const cat = categoryMeta[r.tool.category];
            const catLabel = cat ? cat.displayName : '';
            return `<li role="option" aria-selected="${i === 0 ? 'true' : 'false'}">
                <a href="${searchPathPrefix}${r.tool.file}" class="search-result${i === 0 ? ' active' : ''}" data-idx="${i}">
                    <span class="search-result-name">${escapeHtml(r.tool.name)}</span>
                    <span class="search-result-meta">${escapeHtml(catLabel)}</span>
                </a>
            </li>`;
        }).join('');

        announce(`${results.length} result${results.length === 1 ? '' : 's'}`);
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }

    function announce(msg) {
        if (window.A11yUtils && typeof window.A11yUtils.announce === 'function') {
            window.A11yUtils.announce(msg, 'polite');
        }
    }

    function setSearchActive(idx) {
        const items = searchResultsEl.querySelectorAll('.search-result');
        if (!items.length) return;
        const clamped = (idx + items.length) % items.length;
        searchActiveIndex = clamped;
        items.forEach((el, i) => {
            const selected = i === clamped;
            el.classList.toggle('active', selected);
            el.parentElement.setAttribute('aria-selected', selected ? 'true' : 'false');
            if (selected) el.scrollIntoView({ block: 'nearest' });
        });
    }

    function openSearch() {
        if (!searchOverlayEl) return;
        searchOverlayEl.removeAttribute('hidden');
        searchInputEl.value = '';
        renderSearchResults('');
        // Defer focus to next tick so screen readers see the dialog first
        setTimeout(() => searchInputEl.focus(), 0);
    }

    function closeSearch() {
        if (!searchOverlayEl) return;
        searchOverlayEl.setAttribute('hidden', '');
    }

    function setupSearch(pathPrefix) {
        searchPathPrefix = pathPrefix;
        searchOverlayEl = buildSearchOverlay();
        searchInputEl = searchOverlayEl.querySelector('#oldweb-search-input');
        searchResultsEl = searchOverlayEl.querySelector('#oldweb-search-results');

        searchInputEl.addEventListener('input', e => renderSearchResults(e.target.value));

        searchInputEl.addEventListener('keydown', e => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSearchActive(searchActiveIndex + 1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSearchActive(searchActiveIndex - 1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const target = searchCurrentResults[searchActiveIndex];
                if (target) window.location.href = searchPathPrefix + target.file;
            } else if (e.key === 'Escape') {
                e.preventDefault();
                closeSearch();
            }
        });

        // Click on overlay backdrop (not the panel) closes
        searchOverlayEl.addEventListener('click', e => {
            if (e.target === searchOverlayEl) closeSearch();
        });

        // Trigger button
        const trigger = document.querySelector('.nav-search-btn');
        if (trigger) {
            trigger.addEventListener('click', e => {
                e.preventDefault();
                openSearch();
            });
        }

        // Global keyboard shortcuts: Cmd/Ctrl+K and "/"
        document.addEventListener('keydown', e => {
            // Cmd/Ctrl+K — always opens
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                if (searchOverlayEl.hasAttribute('hidden')) openSearch();
                else closeSearch();
                return;
            }
            // "/" — open only when not typing in an input
            if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
                const t = e.target;
                const isTyping = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
                if (!isTyping && searchOverlayEl.hasAttribute('hidden')) {
                    e.preventDefault();
                    openSearch();
                }
            }
        });
    }

    // Inject CSS into head
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = navStyles;
        document.head.appendChild(style);
    }

    // Initialize navigation
    function init() {
        const currentPage = getCurrentPageInfo();
        const navHTML = generateNavHTML(currentPage);

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = navHTML;
        const navElement = tempDiv.firstElementChild;

        document.body.insertBefore(navElement, document.body.firstChild);
        setupEventListeners();

        const inSubfolder = currentPage.category !== null;
        const pathPrefix = inSubfolder ? '../' : '';

        injectBreadcrumbs(currentPage, pathPrefix);
        injectJsonLd(currentPage, pathPrefix);
        setupSearch(pathPrefix);
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            injectStyles();
            init();
        });
    } else {
        injectStyles();
        init();
    }

    // Expose toolsData for home page quick access feature
    window.toolsData = toolsData;
})();
