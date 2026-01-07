(function() {
    // Tool registry - single source of truth for all navigation
    const tools = [
        { name: 'Home', file: 'index.html', id: 'home' },
        { name: 'Subnet Calc', file: 'subnet-calculator.html', id: 'subnet' },
        { name: 'CIDR Converter', file: 'cidr-converter.html', id: 'cidr' },
        { name: 'Subnet Planner', file: 'subnet-planner.html', id: 'planner' },
        { name: 'Bit Calc', file: 'bit-calculator.html', id: 'bit' },
        { name: 'Data Rate', file: 'data-rate-calculator.html', id: 'data-rate' },
        { name: 'Regex', file: 'regex-tester.html', id: 'regex' },
        { name: 'Timestamp', file: 'timestamp-converter.html', id: 'timestamp' },
        { name: 'Disk Tools', file: 'disk-tools.html', id: 'disk' },
        { name: 'Password', file: 'password-generator.html', id: 'password' }
    ];

    // Navigation CSS styles
    const navStyles = `
        .nav-bar {
            position: absolute;
            top: 20px;
            left: 40px;
            display: flex;
            gap: 15px;
            align-items: center;
            z-index: 100;
        }

        .nav-link {
            color: #4fc3f7;
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 600;
            transition: color 0.2s, text-shadow 0.2s;
        }

        .nav-link:hover {
            color: #2196f3;
            text-shadow: 0 0 10px rgba(79, 195, 247, 0.5);
        }

        .nav-link.current {
            color: #66bb6a;
            border-bottom: 2px solid #66bb6a;
        }

        .nav-separator {
            color: rgba(79, 195, 247, 0.3);
            user-select: none;
        }

        @media (max-width: 768px) {
            .nav-bar {
                position: static;
                justify-content: center;
                flex-wrap: wrap;
                margin-bottom: 20px;
                gap: 10px;
            }
        }
    `;

    // Detect current page based on URL
    function getCurrentPageId() {
        const pathname = window.location.pathname;
        const filename = pathname.split('/').pop() || 'index.html';

        // Handle root path
        if (filename === '' || filename === '/') {
            return 'home';
        }

        // Find matching tool
        const tool = tools.find(t => t.file === filename);
        return tool ? tool.id : null;
    }

    // Generate navigation HTML
    function generateNavHTML(currentId) {
        const navLinks = tools.map((tool, index) => {
            const isCurrent = tool.id === currentId;
            const currentClass = isCurrent ? ' current' : '';
            const link = `<a href="${tool.file}" class="nav-link${currentClass}">${tool.name}</a>`;

            // Add separator after each link except the last one
            if (index < tools.length - 1) {
                return link + '<span class="nav-separator">|</span>';
            }
            return link;
        }).join('\n        ');

        return `<nav class="nav-bar">
        ${navLinks}
    </nav>`;
    }

    // Inject CSS into head
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = navStyles;
        document.head.appendChild(style);
    }

    // Inject navigation into body
    function injectNavigation() {
        const currentId = getCurrentPageId();
        const navHTML = generateNavHTML(currentId);

        // Create navigation element
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = navHTML;
        const navElement = tempDiv.firstElementChild;

        // Insert at the start of body
        document.body.insertBefore(navElement, document.body.firstChild);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            injectStyles();
            injectNavigation();
        });
    } else {
        // DOM is already loaded
        injectStyles();
        injectNavigation();
    }
})();
