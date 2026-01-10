---
description: Add localStorage persistence to a web tool for form data auto-save
argument-hint: Path to HTML file (e.g., public_html/nettools/example.html)
---

# Add localStorage Persistence

Add form data persistence to a web tool using the storage-utils.js pattern.

$ARGUMENTS

## Prerequisites
- Target file must be in public_html/
- Must have identifiable input/select/checkbox elements with IDs

## Steps

1. **Analyze the target file** - Read the file and identify all form input IDs (input, select, textarea, contentEditable elements)
2. **Check script reference** - Verify `storage-utils.js` is included, add if missing:
   ```html
   <script src="../storage-utils.js"></script>
   ```
3. **Define storage key** - Create unique key based on filename (kebab-case, e.g., `my-tool.html` → `'my-tool'`)
4. **Add CSS** - Add `.btn.secondary` styles if missing (check existing button styles first)
5. **Add clear button** - Insert before footer with accessibility attributes
6. **Add clear function** - Generate `clearAllSavedData()` with field-specific resets
7. **Add init code** - Add `DOMContentLoaded` handler with `loadFormInputs`/`autoSaveFormInputs`

## Storage Key Naming Convention
- Use kebab-case based on filename: `my-tool.html` → `'my-tool'`
- StorageUtils automatically prefixes all keys with `owt_`
- For tools with multiple data sets, use separate keys (e.g., `'debt-payoff-debts'`, `'debt-payoff-expenses'`)

---

## Required Patterns

### 1. Button HTML
Place after main action button, before footer:
```html
<button type="button" class="btn secondary"
        onclick="clearAllSavedData()"
        aria-label="Clear all saved form data from this page">
    Clear Saved Data
</button>
```

### 2. CSS for Button (if .btn.secondary not already defined)
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
    box-shadow: none;
    transform: none;
}
```

### 3. Clear Function Template
```javascript
// Clear all saved data and reset form
function clearAllSavedData() {
    StorageUtils.remove('tool-key');

    // Reset each field to defaults
    formFields.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.type === 'checkbox') {
            el.checked = el.defaultChecked;
        } else if (el.tagName === 'SELECT') {
            el.selectedIndex = 0;
        } else if (el.isContentEditable) {
            el.textContent = '';
        } else {
            el.value = '';
        }
    });

    // Hide any results sections
    document.getElementById('results')?.classList.remove('show');

    // Announce to screen readers
    A11yUtils.announce('All saved data has been cleared', 'polite');
}
```

### 4. Init Code Template
Add at end of script, inside DOMContentLoaded if one exists:
```javascript
// Form field IDs to persist
const formFields = ['input1', 'input2', 'checkbox1'];

document.addEventListener('DOMContentLoaded', function() {
    // Load saved data
    StorageUtils.loadFormInputs('tool-key', formFields, function(data) {
        // Optional: handle special cases after load
    });

    // Auto-save on changes (300ms debounce)
    StorageUtils.autoSaveFormInputs('tool-key', formFields);
});
```

---

## Type-Specific Handling

StorageUtils automatically handles these element types:
- **Checkboxes**: Saves/restores `checked` boolean
- **Select dropdowns**: Saves/restores `value`
- **ContentEditable**: Saves/restores `textContent`
- **Text inputs/textareas**: Saves/restores `value`

---

## Dynamic Lists Pattern

For tools with add/remove item functionality (like debt-payoff-comparison):

```javascript
let items = [];
let nextItemId = 1;

function saveFormData() {
    StorageUtils.save('tool-items', items);
}

// On load
const savedItems = StorageUtils.load('tool-items', []);
if (savedItems.length > 0) {
    savedItems.forEach(item => addItem(item, true)); // skipSave=true
    nextItemId = Math.max(...savedItems.map(i => i.id)) + 1;
}
```

---

## Accessibility Requirements

1. Clear button must have `aria-label="Clear all saved form data from this page"`
2. After clearing, announce: `A11yUtils.announce('All saved data has been cleared', 'polite')`
3. Button must be keyboard accessible (use `<button>`, not `<a>` or `<div>`)

---

## Verification Checklist

After implementation, verify:
- [ ] Data persists after page refresh
- [ ] Clear button resets all fields to defaults
- [ ] Screen reader announces "All saved data has been cleared"
- [ ] Clear button is keyboard accessible
- [ ] No console errors on load or clear
