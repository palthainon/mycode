# Site Review Phase 2 — Fixes + 4 New Tools

**Status:** ✅ Completed (commit `2c19138`, 2026-05-12)
**Source plan:** `C:\Users\deric\.claude\plans\lets-review-the-site-bubbly-lovelace.md`
**Scope decision:** One focused PR — 1 new tool per category + verified fixes only.

## Overview

Subagent-driven audit of nettools/system/data/productivity to find improvement opportunities. Three Explore agents flagged issues in parallel; each finding was verified against actual code before acting (most "urgent bugs" turned out to be false-positives — see "Rejected" section).

Final PR: 4 new tools (one per category) + per-row Copy buttons on subnet planners + Copy buttons on data-rate-calculator + StorageUtils persistence + Clear-Saved-Data on three existing data tools. 15 files changed, +2686 / -9.

## Features

### New tools (one per category)

| Tool | File | Status |
|---|---|---|
| IP Address Converter (dotted ↔ binary ↔ hex ↔ int) | `nettools/ip-converter.html` | ✅ Done |
| JWT Decoder (header/payload/signature, exp/iat/nbf in human time) | `system/jwt-decoder.html` | ✅ Done |
| JSON Formatter & Validator (format/minify/validate/escape) | `data/json-formatter.html` | ✅ Done |
| Plaintext Scratchpad (auto-saving textarea) | `productivity/scratchpad.html` | ✅ Done |

### Existing-tool fixes

| File | Fix | Status |
|---|---|---|
| `nettools/subnet-planner.html` | Per-row Copy button on allocation table | ✅ Done |
| `nettools/subnet-planner-ipv6.html` | Same — uses `compressIPv6(intToIPv6(networkInt))` for output | ✅ Done |
| `nettools/data-rate-calculator.html` | Copy button next to each computed time value | ✅ Done |
| `data/base64-hash.html` | `StorageUtils.loadFormInputs` + `autoSaveFormInputs` + Clear button | ✅ Done |
| `data/uuid-generator.html` | Same pattern; preserved "generate-one-on-load" behavior | ✅ Done |
| `data/text-diff.html` | Extended existing `clearAll()` to also call `StorageUtils.remove` | ✅ Done |
| `sitemap.xml` | 4 new URLs with `lastmod 2026-05-12` | ✅ Done |
| 4 category `index.html` files | New tool cards added | ✅ Done |

## Implementation Notes

### IP Address Converter (`nettools/ip-converter.html`)
- 4 input fields with two-way binding via event listeners
- `parseBinary`, `parseHex`, `parseInteger`, `isValidDotted` validators
- `intToDotted`, `intToBinary`, `intToHex`, `intToHexDotted` formatters
- StorageUtils fields: `['dottedField', 'binaryField', 'hexField', 'intField']`
- Edge cases tested: `0.0.0.0`, `255.255.255.255`, `127.0.0.1`, malformed input

### JWT Decoder (`system/jwt-decoder.html`)
- `base64UrlDecode` handles URL-safe alphabet + padding
- `formatEpoch`, `humanRelative`, `classifyTimeClaim` for `exp`/`iat`/`nbf` table
- Renders header/payload/signature in separate panels with `colorizeJson`
- **Explicitly does NOT verify signature** — warning displayed
- Privacy note: "All decoding happens locally in your browser. Your token never leaves this page."

### JSON Formatter (`data/json-formatter.html`)
- Actions: format / minify / validate / escape / unescape
- Custom indent (2-space / 4-space / tabs)
- `parseWithPosition` returns line+column on syntax errors
- `sortKeysDeep` for alphabetical key sort
- Stats footer: chars / bytes / lines
- Ctrl+Enter to format, download as `.json`

### Plaintext Scratchpad (`productivity/scratchpad.html`)
- Full-height textarea, debounced auto-save on every keystroke
- Footer: word / char / line / byte counts
- Font toggle (monospace/serif), Copy All, Download .txt
- Confirms before clearing
- StorageUtils fields: `['padInput', 'fontSelect']`

### Copy-button additions
- `data-rate-calculator`: restructured `.result-item` to wrap value in `.value-row` flex container with Copy button — existing `.textContent` setters on `.value` still work
- `subnet-planner` v4/v6: new `.copy-row-btn` CSS class (blue variant) on the `.action-btn` style; copies `${ip}/${cidr}` for v4 and compressed form for v6

## Rejected (audit false-positives)

Verified against current code — none of these were actually broken:

- ❌ Claim: `A11yUtils.clearError` is missing. **Reality:** Exists at `a11y-utils.js:101`.
- ❌ Claim: `logparser-core.js` is missing. **Reality:** Exists at `system/logparser-core.js` (15.5 KB).
- ❌ Claim: Financial calculators don't persist inputs. **Reality:** `amortization`, `compound-interest`, `retirement` all use `StorageUtils.autoSaveFormInputs` correctly.
- ❌ Claim: Subnet planner missing export. **Reality:** Both v4 and v6 already had `exportCSV()` and `exportJSON()`. Only per-row Copy was missing.

## Deferred (out of scope for this PR)

- Route summarization, MAC OUI lookup, Wildcard Mask converter (net)
- SLA/Uptime calc, `.env` parser, JSON↔YAML↔TOML converter (system)
- URL encoder standalone, hex/bin/dec/oct converter (data)
- Take-Home Pay, Salary-to-Hourly (financials — already most-built-out category)
- Countdown timer, TZ meeting planner (productivity)

## Dependencies

None new. Reused: `a11y-utils.js`, `storage-utils.js`, `navigationv2.js`.
