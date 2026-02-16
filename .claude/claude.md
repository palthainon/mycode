# Project Philosophy: Web Tools for Network Engineers & Systems Administrators

## Core Principles

### 1. **Simplicity Over Complexity**
- Build single-purpose tools that do one thing exceptionally well
- Avoid feature creep - if it's not essential for the core use case, don't add it
- Prefer vanilla JavaScript/HTML/CSS over heavy frameworks
- Keep dependencies minimal to reduce attack surface and maintenance burden

### 2. **Performance First**
- Tools must be fast on first load and faster on subsequent uses
- Target sub-50ms response times for calculations and transformations
- Use client-side processing by default - no server round trips for simple operations
- Lazy load only when necessary; most tools should work offline once loaded

### 3. **Stability & Reliability**
- Input validation at boundaries - handle edge cases explicitly
- Fail gracefully with clear error messages
- No assumptions about user input - validate everything
- Test with real-world data from network/system contexts

### 4. **Practical Design**
- Mobile-friendly but desktop-optimized (engineers work on laptops)
- Copy-to-clipboard functionality for all outputs
- Support keyboard shortcuts for power users
- Dark mode support (terminal users expect it)
- Consistent navigation across all tools - users should be able to jump between tools without returning to home
- Navigation should be minimal, unobtrusive, and positioned for quick access
- Highlight current tool in navigation to show user location

### 5. **No Fluff**
- No analytics, tracking, or unnecessary JavaScript
- No splash screens, loading animations, or marketing content
- No account creation or authentication unless absolutely necessary
- Tools should work with JavaScript disabled when possible

## Technical Standards

### Code Quality
- Write code that can be understood at 2am during an outage
- Comments only where logic isn't self-evident
- Consistent naming conventions across all tools
- Pure functions where possible - easier to test and reason about
- Always update sitemap.xml with new files.

### Architecture
- Static HTML pages with embedded JavaScript for simple tools
- Progressive enhancement - basic functionality without JS
- Local storage for user preferences only
- No backend unless tool requires it (APIs, databases, etc.)
- Build for americans with disability compliance. Users with disabilities need tools too.

### Error Handling Patterns
When implementing form validation with error states:

1. **Use specific CSS selectors for error containers**
   - Use `#error` or `.error-container` for error message divs (with `display: none` default)
   - Use `input.error` for input field error styling (red border only)
   - NEVER use a generic `.error` class that applies `display: none` - it will hide inputs too

2. **Avoid A11yUtils.showError() for wrapped inputs**
   - `A11yUtils.showError()` appends error elements to `input.parentNode`
   - This breaks layout for inputs inside `.input-prefix` or `.input-suffix` wrappers
   - Instead, use this pattern for wrapped inputs:
     ```javascript
     function showError(message, input) {
         document.getElementById('error').textContent = message;
         document.getElementById('error').classList.add('show');
         input.classList.add('error');
         input.setAttribute('aria-invalid', 'true');
         input.focus();
         A11yUtils.announce(message, 'assertive');
     }
     ```

3. **Clear errors properly**
   ```javascript
   inputs.forEach(input => {
       input.classList.remove('error');
       input.removeAttribute('aria-invalid');
   });
   document.getElementById('error').classList.remove('show');
   ```

4. **CSS pattern for error states**
   ```css
   #error { display: none; /* error message container */ }
   #error.show { display: block; }
   input.error { border-color: #f44336 !important; }
   ```

### localStorage Persistence Pattern
When implementing form data persistence with localStorage:

1. **Use storage-utils.js** - Located at `/public_html/storage-utils.js`
   ```html
   <script src="../storage-utils.js"></script>
   ```

2. **Storage API**
   ```javascript
   StorageUtils.save(key, value)              // Save JSON data
   StorageUtils.load(key, defaultValue)       // Load with fallback
   StorageUtils.remove(key)                   // Remove specific key
   StorageUtils.saveFormInputs(key, inputIds) // Save multiple fields
   StorageUtils.loadFormInputs(key, inputIds, callback) // Restore fields
   StorageUtils.autoSaveFormInputs(key, inputIds)       // Auto-save on input (300ms debounce)
   ```

3. **Standard implementation**
   ```javascript
   const myToolFields = ['input1', 'input2', 'checkbox1'];

   function clearAllSavedData() {
       StorageUtils.remove('my-tool');
       myToolFields.forEach(id => {
           const el = document.getElementById(id);
           if (el?.type === 'checkbox') el.checked = el.defaultChecked;
           else el.value = '';
       });
       A11yUtils.announce('All saved data has been cleared', 'polite');
   }

   document.addEventListener('DOMContentLoaded', function() {
       StorageUtils.loadFormInputs('my-tool', myToolFields);
       StorageUtils.autoSaveFormInputs('my-tool', myToolFields);
   });
   ```

4. **Required clear button** - Always provide a visible way to clear saved data
   ```html
   <button type="button" class="btn secondary"
           onclick="clearAllSavedData()"
           aria-label="Clear all saved form data from this page">
       Clear Saved Data
   </button>
   ```

5. **CSS for clear button** (if not using existing .btn.secondary)
   ```css
   .btn.secondary {
       background: transparent;
       border: 2px solid rgba(255, 255, 255, 0.3);
       color: #90caf9;
       margin-top: 10px;
   }
   .btn.secondary:hover {
       background: rgba(255, 255, 255, 0.1);
       border-color: rgba(255, 255, 255, 0.5);
   }
   ```

6. **Key naming convention**: Use kebab-case tool name (e.g., `'amortization-calc'`)
   - StorageUtils prefixes all keys with `owt_` automatically
   - For tools with multiple data sets, use separate keys (e.g., `'debt-payoff-debts'`, `'debt-payoff-expenses'`)

### Internationalization (i18n) Pattern
All pages must support multiple languages using the built-in i18n system. The system auto-initializes and requires no manual setup beyond including the script and marking translatable content.

**Supported Languages:**
- English (en) - Default
- Spanish (es)
- Hindi (hi)
- Chinese (zh) - Simplified Chinese (简体中文)

#### 1. **Required Script Includes**
Include scripts in this order in `<head>`:
```html
<!-- Root pages -->
<script src="a11y-utils.js"></script>
<script src="storage-utils.js"></script>
<script src="i18n-utils.js"></script>
<script src="navigationv2.js"></script>

<!-- Subdirectory pages (nettools/, system/, data/, financials/, productivity/) -->
<script src="../a11y-utils.js"></script>
<script src="../storage-utils.js"></script>
<script src="../i18n-utils.js"></script>
<script src="../navigationv2.js"></script>
```

#### 2. **HTML Data Attributes for Translation**
Mark translatable content with data attributes:

```html
<!-- Text content -->
<h1 data-i18n="tools.myTool.title">My Tool Title</h1>
<p data-i18n="home.subtitle">Default text shown before translation loads</p>

<!-- Input placeholders -->
<input type="text" data-i18n-placeholder="tools.myTool.placeholder" placeholder="Default placeholder">

<!-- Aria labels (accessibility) -->
<button data-i18n-aria-label="common.calculate" aria-label="Calculate">🔢</button>

<!-- Title attributes -->
<span data-i18n-title="tools.myTool.tooltip" title="Default tooltip">Hover me</span>
```

#### 3. **JavaScript API (I18nUtils)**
For dynamic content generated in JavaScript:

```javascript
// Get translated string
const label = I18nUtils.t('tools.myTool.results.total');

// With interpolation (use {{variable}} in translation strings)
const msg = I18nUtils.t('nav.languageChanged', { language: 'Spanish' });

// Format numbers/currency/dates for current locale
const num = I18nUtils.formatNumber(12345.67);           // "12,345.67" (en)
const money = I18nUtils.formatCurrency(5000, 'USD');    // "$5,000.00" (en)
const date = I18nUtils.formatDate(new Date());          // Locale-formatted date

// Check current language
const lang = I18nUtils.getCurrentLang();  // "en", "es", or "hi"

// Listen for language changes
document.addEventListener('langchange', (e) => {
    console.log('Language changed to:', e.detail.language);
    // Re-render any dynamic content here
});
```

#### 4. **Translation File Structure**
Translation files are located in `/public_html/i18n/{lang}.json`:

```json
{
  "_meta": {
    "language": "en",
    "nativeName": "English",
    "direction": "ltr"
  },
  "common": {
    "calculate": "Calculate",
    "clear": "Clear",
    "copy": "Copy",
    "copied": "Copied!",
    "error": "Error",
    "required": "Required"
  },
  "nav": {
    "home": "Home",
    "network": "Network",
    "system": "System",
    "data": "Data",
    "financials": "Financials",
    "selectLanguage": "Select language"
  },
  "tools": {
    "myTool": {
      "title": "My Tool",
      "labels": {
        "input": "Input",
        "output": "Output"
      },
      "results": {
        "total": "Total"
      },
      "validation": {
        "invalidInput": "Please enter a valid value"
      }
    }
  }
}
```

#### 5. **Adding Translations for New Tools**
When creating a new tool:

1. **Add keys to all language files** (`en.json`, `es.json`, `hi.json`):
   ```json
   "tools": {
     "newTool": {
       "title": "New Tool Name",
       "labels": { ... },
       "results": { ... },
       "validation": { ... }
     }
   }
   ```

2. **Use consistent key naming**:
   - `tools.{toolName}.title` - Page title
   - `tools.{toolName}.labels.*` - Form labels
   - `tools.{toolName}.placeholders.*` - Input placeholders
   - `tools.{toolName}.results.*` - Output labels
   - `tools.{toolName}.validation.*` - Error messages
   - `tools.{toolName}.buttons.*` - Button labels (if not using common.*)

3. **Reuse common keys** when possible:
   - `common.calculate`, `common.clear`, `common.copy`
   - `sections.input`, `sections.output`, `sections.results`
   - `buttons.generate`, `buttons.reset`

#### 6. **Language Selector**
The language selector is automatically included in navigation via `navigationv2.js`. No additional markup needed - it appears in the top navigation bar.

#### 7. **i18n Testing Checklist**
- [ ] All visible text has `data-i18n` attributes
- [ ] All input placeholders use `data-i18n-placeholder`
- [ ] All aria-labels use `data-i18n-aria-label`
- [ ] Dynamic JS content uses `I18nUtils.t()`
- [ ] Numbers/currency use `I18nUtils.formatNumber()`/`formatCurrency()`
- [ ] New translation keys added to ALL language files (en, es, hi)
- [ ] Test language switching works without page reload
- [ ] Verify `langchange` event handler updates dynamic content
- [ ] Default English text provided as fallback in HTML

### Testing Philosophy
- Test with actual network data formats (routing tables, config files, logs)
- Verify edge cases: empty inputs, malformed data, extreme values
- Cross-browser testing (Chrome, Firefox, Safari minimum)
- Test on slow connections and low-end devices

## Tool Categories

### Network Tools
- IP/subnet calculators (IPv4 & IPv6)
- CIDR notation converters
- Subnet planners
- Bit/byte calculators
- Data rate calculators
- Jinja template builders

### System Admin Tools
- Timestamp converters
- chmod calculators
- Cron expression builders
- Disk usage tools
- Password generators
- Regex testers

### Data Tools
- Text diff utilities
- String manipulation tools
- Base64/hash encoders & generators

### Financials
- Amortization calculators

## Development Guidelines

1. **Start with HTML** - Build the structure first, add interactivity after
2. **Minimize dependencies** - Can you do it without a library? Then do.
3. **Optimize for speed** - Profile before optimizing, but be conscious from the start
4. **Make it obvious** - UI should be self-explanatory, no documentation needed
5. **Build for real use** - Every tool should solve an actual problem you've encountered
6. **Maintain Navigation Consistency** - All tools must have identical navigation structure and styling
7. **ADA Compalince requirement** 
- Tab through all controls with keyboard
- Validate compatibility with screen reader (announcements work)
- Verify skip-link functionality
- Check focus indicators visible
- Validate ARIA attributes
8. **Cross-browser testing:**
- Chrome, Firefox, Safari minimum
9. **Navigation verification:**
- Confirm tool appears in Data dropdown
- Verify current page highlighting works
- Test navigation from other pages
10. **Offline capability:**
- Verify tool works without network after first load
11. **Internationalization verification:**
- All static text has `data-i18n` attributes
- Dynamic content uses `I18nUtils.t()` for translations
- Translation keys added to all language files (en.json, es.json, hi.json)
- Test language switching updates all content without reload
- Numbers and currency use locale-aware formatting

## Success Criteria
A tool is done when:
- It loads in under 1 second on a 3G connection
- It handles malformed input without breaking
- A new user can figure it out in under 10 seconds
- It works reliably with real-world data
- The code can be understood by someone who hasn't seen it before
- All text is translatable via i18n data attributes and translation keys exist in all language files

## What This Project Is NOT

- Not a framework showcase
- Not a portfolio piece with fancy animations
- Not a SaaS product with premium features
- Not a data collection platform

## What This Project IS

A collection of fast, reliable, no-nonsense utilities that solve actual problems encountered by network engineers and systems administrators in their daily work.



 Verification Plan

