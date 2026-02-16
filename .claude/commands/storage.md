---
description: Audit and add localStorage persistence to web tools for form data auto-save
argument-hint: Path to HTML file (e.g., public_html/nettools/example.html)
---

# localStorage Persistence - Audit & Add

Audit a web tool for localStorage implementation, then add/fix any missing components.

$ARGUMENTS

## Prerequisites
- Target file must be in public_html/
- Must have identifiable input/select/checkbox elements with IDs

---

## Phase 1: Audit

Read the target file and check for these required components:

| Component | How to Check |
|-----------|--------------|
| Script include | `<script src="../storage-utils.js">` or `<script src="/storage-utils.js">` |
| Field array | `const xxxFields = [...]` or similar pattern |
| Clear function | `function clearAllSavedData()` |
| Load on init | `StorageUtils.loadFormInputs(` in DOMContentLoaded |
| Auto-save | `StorageUtils.autoSaveFormInputs(` in DOMContentLoaded |
| Clear button | `onclick="clearAllSavedData()"` with `class="btn secondary"` |
| Button CSS | `.btn.secondary` style definition |

### Audit Output Format
```
File: path/to/file.html
Form Inputs Found: input1, input2, checkbox1, select1

[✓] storage-utils.js included
[✗] Field array not defined
[✗] clearAllSavedData() function missing
[✗] loadFormInputs not called
[✗] autoSaveFormInputs not called
[✗] Clear button missing
[✓] .btn.secondary CSS exists

Status: PARTIAL (2/7 components)
```

### Skip Audit If
- File has no form inputs (static/informational pages)
- File only has action buttons with no persistent state
- File is an index/navigation page

---

## Phase 2: Add Missing Components

After audit, implement any missing components using these patterns:

### 1. Script Include
Add after other utility scripts (like a11y-utils.js):
```html
<script src="../storage-utils.js"></script>
```

### 2. Storage Key
Use kebab-case based on filename: `my-tool.html` → `'my-tool'`
StorageUtils automatically prefixes all keys with `owt_`

### 3. Field Array
Place near top of main script block:
```javascript
// Form field IDs to persist
const formFields = ['input1', 'input2', 'checkbox1'];
```

### 4. Clear Function
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

### 5. DOMContentLoaded Initialization
Add to existing DOMContentLoaded or create new one:
```javascript
document.addEventListener('DOMContentLoaded', function() {
    // Load saved data
    StorageUtils.loadFormInputs('tool-key', formFields, function(data) {
        // Optional: handle special cases after load
    });

    // Auto-save on changes (300ms debounce)
    StorageUtils.autoSaveFormInputs('tool-key', formFields);
});
```

### 6. Clear Button HTML
Place after main action button, before footer:
```html
<button type="button" class="btn secondary"
        onclick="clearAllSavedData()"
        aria-label="Clear all saved form data from this page">
    Clear Saved Data
</button>
```

### 7. CSS for Button (if not already defined)
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

## Verification Checklist

After implementation, verify:
- [ ] Data persists after page refresh
- [ ] Clear button resets all fields to defaults
- [ ] Screen reader announces "All saved data has been cleared"
- [ ] Clear button is keyboard accessible
- [ ] No console errors on load or clear
