---
description: Audit and fix error handling patterns in web tools to prevent CSS conflicts
argument-hint: Optional path to specific HTML file
---

# Error Handling Pattern Audit

Audit web tools for error handling CSS conflicts that cause inputs to disappear or break layout.

## Known Issues to Check

### 1. Generic `.error` class with `display: none`
**Problem**: Using `.error { display: none; }` for error message containers will also hide any `<input class="error">` elements.

**Check for**:
```css
.error {
    display: none;
}
```

**Fix**: Use specific selector `#error` or `.error-container` instead:
```css
#error {
    display: none;
}
#error.show {
    display: block;
}
input.error {
    border-color: #f44336 !important;
}
```

### 2. A11yUtils.showError() with wrapped inputs
**Problem**: `A11yUtils.showError()` appends error elements to `input.parentNode`. For inputs inside `.input-prefix` or `.input-suffix` wrappers, this breaks layout.

**Check for**: Inputs wrapped in prefix/suffix divs that use `A11yUtils.showError()`:
```html
<div class="input-prefix">
    <span>$</span>
    <input type="text" id="amount">
</div>
```

**Fix**: Use a local showError function instead:
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

---

## Audit Steps

$ARGUMENTS

1. **If a specific file is provided**: Audit only that file
2. **Otherwise**: Search all HTML files in `public_html/` for these patterns

### For each file, check:
- [ ] CSS: Does `.error` have `display: none`? Should be `#error` instead
- [ ] JS: Does it use `A11yUtils.showError()` on inputs inside wrapper divs?
- [ ] JS: Does error clearing properly remove `.error` class and `aria-invalid`?

### Report findings with:
- File path and line numbers
- Which pattern is violated
- Suggested fix

---

## Auto-Fix Option

If user requests fixes, apply the standard pattern:
1. Change `.error` CSS selector to `#error`
2. Add `input.error` styling for red border
3. Replace `A11yUtils.showError()` with local function for wrapped inputs
4. Update error clearing to use `classList.remove('error')`
