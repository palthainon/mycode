(function() {
    // Tool registry - organized by category
    const toolsData = {
        home: {
            name: 'Home',
            file: 'index.html',
            id: 'home'
        },
        network: [
            { name: 'Subnet Calc (IPv4)', file: 'nettools/subnet-calculator.html', id: 'subnet' },
            { name: 'Subnet Calc (IPv6)', file: 'nettools/subnet-calculator-ipv6.html', id: 'subnet-ipv6' },
            { name: 'Subnet Planner', file: 'nettools/subnet-planner.html', id: 'planner' },
            { name: 'CIDR Converter', file: 'nettools/cidr-converter.html', id: 'cidr' },
            { name: 'Bit Calc', file: 'nettools/bit-calculator.html', id: 'bit' },
            { name: 'Data Rate', file: 'nettools/data-rate-calculator.html', id: 'data-rate' }
        ],
        system: [
            { name: 'Regex', file: 'system/regex-tester.html', id: 'regex' },
            { name: 'Timestamp', file: 'system/timestamp-converter.html', id: 'timestamp' },
            { name: 'Disk Tools', file: 'system/disk-tools.html', id: 'disk' },
            { name: 'Cron', file: 'system/cron-builder.html', id: 'cron' },
            { name: 'Chmod', file: 'system/chmod-calculator.html', id: 'chmod' },
            { name: 'Password', file: 'system/password-generator.html', id: 'password' }
        ],
        data: [
            { name: 'Base64/Hash', file: 'data/base64-hash.html', id: 'base64' }
        ]
    };

    // Track currently open dropdown
    let currentOpenDropdown = null;

    // Navigation CSS styles
    const navStyles = `
        /* Add spacing between navigation and page heading */
        body > .container > h1,
        body > h1 {
            margin-top: 80px;
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
            background: rgba(22, 33, 62, 0.95);
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

        .nav-dropdown-link[aria-current="page"]::after {
            content: " ✓";
            font-size: 0.8rem;
        }

        @media (max-width: 768px) {
            /* Reset h1 top margin on mobile since nav is in normal flow */
            body > .container > h1,
            body > h1 {
                margin-top: 30px;
            }

            .nav-bar {
                position: static;
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
            }

            .nav-dropdown:not([hidden]) {
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

        // Handle root home page (only if not in a subfolder)
        if (filename === '' || filename === '/' || filename === 'index.html') {
            return { id: 'home', category: null };
        }

        // Search through categories
        for (const [category, tools] of Object.entries(toolsData)) {
            if (category === 'home') continue;

            const tool = tools.find(t => t.file.endsWith(filename));
            if (tool) {
                return { id: tool.id, category: category };
            }
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
                const isCurrentTool = tool.id === currentPage.id;
                const currentAttr = isCurrentTool ? ' aria-current="page"' : '';
                // Adjust tool link based on current location
                const toolLink = pathPrefix + tool.file;
                html += `
                    <a href="${toolLink}" class="nav-dropdown-link" role="menuitem"${currentAttr}>${tool.name}</a>`;
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
})();
