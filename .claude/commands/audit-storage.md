---
description: Audit localStorage persistence patterns in web tools
argument-hint: Optional path to specific HTML file
---

# localStorage Persistence Audit

Audit web tools for proper localStorage implementation using StorageUtils.

## Required Pattern

Tools with form inputs should persist user data using `storage-utils.js`:

### 1. Script Include
```html
<script src="../storage-utils.js"></script>
```

### 2. Field Definition
```javascript
const myToolFields = ['input1', 'input2', 'select1'];
```

### 3. Clear Function
```javascript
function clearAllSavedData() {
    StorageUtils.remove('tool-name');
    // Reset fields to defaults
    A11yUtils.announce('All saved data has been cleared', 'polite');
}
```

### 4. DOMContentLoaded Initialization
```javascript
document.addEventListener('DOMContentLoaded', function() {
    StorageUtils.loadFormInputs('tool-name', fields);
    StorageUtils.autoSaveFormInputs('tool-name', fields);
});
```

### 5. Clear Button in HTML
```html
<button type="button" class="btn secondary"
        onclick="clearAllSavedData()"
        aria-label="Clear all saved form data from this page">
    Clear Saved Data
</button>
```

### 6. CSS for Secondary Button
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

---

## Audit Steps

$ARGUMENTS

1. **If a specific file is provided**: Audit only that file
2. **Otherwise**: Search all HTML files in `public_html/` for these patterns

### For each file with form inputs, check:
- [ ] Includes `storage-utils.js` script
- [ ] Defines field array for persistence
- [ ] Has `clearAllSavedData()` function
- [ ] Calls `StorageUtils.loadFormInputs()` in DOMContentLoaded
- [ ] Calls `StorageUtils.autoSaveFormInputs()` in DOMContentLoaded
- [ ] Has "Clear Saved Data" button with proper aria-label
- [ ] Has `.btn.secondary` CSS styles

### Exclusions
Skip files that:
- Have no form inputs (static/informational pages)
- Only have action buttons with no persistent state
- Are index/navigation pages

### Report Format
For each file, report:
- File path
- Status: COMPLIANT / MISSING / PARTIAL
- Missing components (if any)
- Line numbers where components should be added

---

## Auto-Fix Option

If user requests fixes, apply the standard pattern:
1. Add `<script src="../storage-utils.js"></script>` after other utility scripts
2. Add field array definition near top of main script
3. Add `clearAllSavedData()` function
4. Add/update DOMContentLoaded with load/autoSave calls
5. Add "Clear Saved Data" button after main calculate button
6. Add `.btn.secondary` CSS if missing

---

## Key Naming Convention

Use kebab-case tool name with descriptive suffix:
- `'amortization-calc'`
- `'compound-interest-calc'`
- `'debt-payoff-debts'`
- `'regex-tester'`

StorageUtils automatically prefixes all keys with `owt_`.
