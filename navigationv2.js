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
            { name: 'Password Gen', file: 'system/password-generator.html', id: 'password' },
            { name: 'Certificate Parse', file: 'system/certificate-parser.html', id: 'cert-parser' },
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
            { name: 'Retirement', file: 'financials/retirement-calculator.html', id: 'retirement' }
        ],
        productivity: [
            { name: 'Pomodoro Timer', file: 'productivity/pomodoro.html', id: 'pomodoro' }
        ]
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

        /* Language Selector Styles */
        .nav-lang-selector {
            position: relative;
            margin-left: 10px;
        }

        .nav-lang-btn {
            background: transparent;
            border: 1px solid rgba(79, 195, 247, 0.3);
            color: #4fc3f7;
            font-size: 0.85rem;
            font-weight: 600;
            padding: 6px 10px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
            border-radius: 6px;
            font-family: inherit;
        }

        .nav-lang-btn:hover {
            background: rgba(79, 195, 247, 0.1);
            border-color: rgba(79, 195, 247, 0.5);
        }

        .nav-lang-btn:focus {
            outline: 2px solid #4fc3f7;
            outline-offset: 2px;
        }

        .nav-lang-btn[aria-expanded="true"] {
            background: rgba(79, 195, 247, 0.15);
            border-color: #4fc3f7;
        }

        .nav-lang-icon {
            width: 16px;
            height: 16px;
            fill: currentColor;
        }

        .nav-lang-code {
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .nav-lang-dropdown {
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            min-width: 140px;
            background: #16213e;
            backdrop-filter: blur(10px);
            border-radius: 8px;
            border: 1px solid rgba(79, 195, 247, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            padding: 6px 0;
            opacity: 0;
            transform: translateY(-10px);
            transition: opacity 0.2s ease, transform 0.2s ease;
            pointer-events: none;
        }

        .nav-lang-dropdown:not([hidden]) {
            opacity: 1;
            transform: translateY(0);
            pointer-events: auto;
        }

        .nav-lang-option {
            display: flex;
            align-items: center;
            gap: 10px;
            width: 100%;
            padding: 10px 16px;
            background: transparent;
            border: none;
            color: #4fc3f7;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s, color 0.2s;
            text-align: left;
            font-family: inherit;
        }

        .nav-lang-option:hover {
            background: rgba(79, 195, 247, 0.1);
            color: #2196f3;
        }

        .nav-lang-option:focus {
            outline: 2px solid #4fc3f7;
            outline-offset: -2px;
        }

        .nav-lang-option[aria-current="true"] {
            color: #66bb6a;
            background: rgba(102, 187, 106, 0.1);
        }

        .nav-lang-option[aria-current="true"]::after {
            content: '✓';
            margin-left: auto;
        }

        .nav-lang-native {
            font-weight: 400;
            opacity: 0.8;
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

        @media (max-width: 768px) {
            /* Reset h1 top margin on mobile since nav is in normal flow */
            .container h1,
            body > h1 {
                margin-top: 30px !important;
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

            .nav-lang-selector {
                margin-left: 0;
                margin-top: 10px;
                display: flex;
                justify-content: center;
            }

            .nav-lang-btn {
                min-height: 44px;
                padding: 8px 14px;
            }

            .nav-lang-dropdown {
                left: 50%;
                right: auto;
                transform: translateX(-50%) translateY(-10px);
            }

            .nav-lang-dropdown:not([hidden]) {
                transform: translateX(-50%) translateY(0);
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
        <div class="nav-lang-selector">
            <button class="nav-lang-btn"
                    id="nav-lang-btn"
                    aria-expanded="false"
                    aria-controls="nav-lang-dropdown"
                    aria-haspopup="listbox"
                    aria-label="Select language">
                <svg class="nav-lang-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                <span class="nav-lang-code" id="nav-lang-code">EN</span>
            </button>
            <div class="nav-lang-dropdown" id="nav-lang-dropdown" role="listbox" aria-label="Available languages" hidden>
                <button class="nav-lang-option" role="option" data-lang="en" aria-current="true">
                    English <span class="nav-lang-native">(English)</span>
                </button>
                <button class="nav-lang-option" role="option" data-lang="es" aria-current="false">
                    Spanish <span class="nav-lang-native">(Español)</span>
                </button>
                <button class="nav-lang-option" role="option" data-lang="hi" aria-current="false">
                    Hindi <span class="nav-lang-native">(हिन्दी)</span>
                </button>
                <button class="nav-lang-option" role="option" data-lang="zh" aria-current="false">
                    Chinese <span class="nav-lang-native">(中文)</span>
                </button>
            </div>
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

    // Setup language selector
    function setupLanguageSelector() {
        const langBtn = document.getElementById('nav-lang-btn');
        const langDropdown = document.getElementById('nav-lang-dropdown');
        const langCode = document.getElementById('nav-lang-code');

        if (!langBtn || !langDropdown) return;

        // Update current language display
        function updateLanguageDisplay(lang) {
            langCode.textContent = lang.toUpperCase();

            // Update aria-current on options
            langDropdown.querySelectorAll('.nav-lang-option').forEach(opt => {
                opt.setAttribute('aria-current', opt.dataset.lang === lang ? 'true' : 'false');
            });
        }

        // Initialize with current language
        if (typeof I18nUtils !== 'undefined' && I18nUtils.isReady()) {
            updateLanguageDisplay(I18nUtils.getCurrentLang());
        } else {
            // Try to get from localStorage if I18nUtils not ready yet
            try {
                const saved = localStorage.getItem('owt_user-language');
                if (saved) {
                    updateLanguageDisplay(JSON.parse(saved));
                }
            } catch (e) {
                // Default to EN
            }
        }

        // Listen for language changes from I18nUtils
        document.addEventListener('langchange', (e) => {
            updateLanguageDisplay(e.detail.language);
        });

        // Toggle dropdown
        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = langBtn.getAttribute('aria-expanded') === 'true';

            // Close other dropdowns first
            closeAllDropdowns();

            if (isExpanded) {
                langBtn.setAttribute('aria-expanded', 'false');
                langDropdown.setAttribute('hidden', '');
            } else {
                langBtn.setAttribute('aria-expanded', 'true');
                langDropdown.removeAttribute('hidden');
            }
        });

        // Language option clicks
        langDropdown.querySelectorAll('.nav-lang-option').forEach(opt => {
            opt.addEventListener('click', async (e) => {
                e.stopPropagation();
                const newLang = opt.dataset.lang;

                // Close dropdown
                langBtn.setAttribute('aria-expanded', 'false');
                langDropdown.setAttribute('hidden', '');

                // Change language
                if (typeof I18nUtils !== 'undefined') {
                    await I18nUtils.setLang(newLang);
                } else {
                    // Fallback: save to localStorage and reload
                    try {
                        localStorage.setItem('owt_user-language', JSON.stringify(newLang));
                    } catch (e) {}
                    window.location.reload();
                }

                updateLanguageDisplay(newLang);
            });
        });

        // Close language dropdown on escape or click outside
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && langBtn.getAttribute('aria-expanded') === 'true') {
                langBtn.setAttribute('aria-expanded', 'false');
                langDropdown.setAttribute('hidden', '');
                langBtn.focus();
            }
        });

        // Arrow key navigation in language dropdown
        langDropdown.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const options = Array.from(langDropdown.querySelectorAll('.nav-lang-option'));
                const currentIndex = options.indexOf(document.activeElement);

                if (e.key === 'ArrowDown') {
                    const nextIndex = Math.min(currentIndex + 1, options.length - 1);
                    options[nextIndex].focus();
                } else {
                    const prevIndex = Math.max(currentIndex - 1, 0);
                    options[prevIndex].focus();
                }
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

        // Click outside to close (including language dropdown)
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-category')) {
                closeAllDropdowns();
            }
            if (!e.target.closest('.nav-lang-selector')) {
                const langBtn = document.getElementById('nav-lang-btn');
                const langDropdown = document.getElementById('nav-lang-dropdown');
                if (langBtn && langDropdown) {
                    langBtn.setAttribute('aria-expanded', 'false');
                    langDropdown.setAttribute('hidden', '');
                }
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
        setupLanguageSelector();
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
