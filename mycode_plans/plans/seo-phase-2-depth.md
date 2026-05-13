# SEO Phase 2 — Depth (Related Tools, Pinned, Category Copy, Meta Audit)

**Status:** ✅ Implemented locally (2026-05-13); awaiting commit/PR
**Roadmap:** [seo-roadmap.md](seo-roadmap.md)
**PR scope:** Single PR bundling all 4 sub-features.

## Overview

Phase 1 gave the site search, breadcrumbs, JSON-LD, sitemap, and a 404. Phase 2 deepens on-page content for SEO and adds internal cross-linking:

- **A. Related-tools panel** — auto-injected at the bottom of every tool page
- **B. Pinned tools** — top tools surface first in the Cmd/Ctrl-K search overlay
- **C. Category intro/outro copy** — 200-300 words of keyword-rich content on each category index
- **D. Meta-description audit** — rewrite weak/generic descriptions

## Features

| Feature | Approach | Files | Status |
|---|---|---|---|
| Related-tools panel (auto-injected) | `related:[id1,id2,id3]` on every `toolRegistry` entry; `buildRelatedToolsHTML` + `injectRelatedTools` follow the breadcrumbs pattern; injected before `<footer>` inside `<main>` | `navigationv2.js` | ✅ |
| Pinned tools in search overlay | `pinned:true` on 8 tools; when query empty, "Popular tools" section header + ★ indicator; non-pinned tools listed under "More tools" | `navigationv2.js` | ✅ |
| Category intro/outro copy | 200-300 word intro before grid; outro with sibling cross-links after | 5 category `index.html` files | ✅ |
| Meta-description audit | Audited all 50; rewrote 19 (8 over-length, 6 borderline, 5 weak/incomplete) | 19 HTML files (see worksheet below) | ✅ |
| Sitemap `<lastmod>` bump | Bumped all entries dated 2026-05-11 / 2026-05-12 to 2026-05-13 | `sitemap.xml` | ✅ |
| Backlog: register 3 tools missing from `toolRegistry` | `ip-converter`, `jwt-decoder`, `json-formatter` (commit `2c19138`) added; descriptions added to `toolDescriptions` | `navigationv2.js` | ✅ |

## Pinned tool set (confirmed with user)

Broad cross-category coverage (8 tools):

- `subnet` (Subnet Calculator IPv4)
- `regex` (Regex Tester)
- `password-gen` (Password Generator) — registry uses `password-gen`, not `password-generator`; verify
- `base64` (Base64 & Hash Tools)
- `timestamp` (Timestamp Converter)
- `take-home-pay` (Take-Home Pay Calculator)
- `chmod` (Chmod Calculator)
- `amortization` (Amortization Calculator)

## Related-tools mapping strategy

3 IDs per tool. Picked for: same-category neighbors first, then complementary cross-category, then thematic. Example:

| Tool | Related |
|---|---|
| `subnet` | `subnet-ipv6`, `cidr`, `planner` |
| `regex` | `string-tools`, `text-diff`, `base64` |
| `take-home-pay` | `salary-hourly`, `compound-interest`, `retirement` |
| `jwt-decoder` | `base64`, `timestamp`, `cert-parser` |
| `pomodoro` | `countdown-timer`, `scratchpad`, `tz-meeting-planner` |
| `pdf-merge` | `pdf-split`, `pdf-rotate`, `base64` |

Full map will be in the `toolRegistry` source.

## Implementation notes

### `navigationv2.js` injection pattern (existing, lines 853-861)

```javascript
function injectBreadcrumbs(currentPage, pathPrefix) {
    const html = buildBreadcrumbs(currentPage, pathPrefix);
    if (!html) return;
    const target = document.querySelector('main') || document.querySelector('.container');
    if (!target) return;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    target.insertBefore(tempDiv.firstElementChild, target.firstChild);
}
```

Related-tools follows the same pattern but **appends** to `main` (or inserts before any existing `<footer>` inside main) instead of prepending.

### Search-overlay sort change (existing, lines 978-998)

When `q === ''`, replace the current `slice(0, 8)` with:
```javascript
const pinned = toolRegistry.filter(t => t.pinned);
const rest = toolRegistry.filter(t => !t.pinned).slice(0, Math.max(0, 8 - pinned.length));
results = [...pinned, ...rest].map(t => ({ tool: t, score: t.pinned ? 1 : 0 }));
```
And render a "Popular tools" section header above the pinned ones.

### Category page structure (current)

Existing structure (e.g., `nettools/index.html`):
```html
<main>
  <h1>Network Tools</h1>
  <p class="subtitle">...</p>
  <div class="tools-grid">...</div>
</main>
```

Add **before** the grid: `<section class="category-intro">` with 2-3 paragraphs.
Add **after** the grid: `<section class="category-outro">` with privacy/offline story + cross-links.

### Meta-description scoring rubric

- ✅ 140-165 characters (Google truncates around 160)
- ✅ Primary keyword in first 60 characters
- ✅ Action verb at start ("Calculate", "Generate", "Convert", "Test", "Parse")
- ✅ Unique against other pages (no shared boilerplate suffix)
- ✅ Includes value prop ("offline", "no signup", "browser-only")

## Verification

1. Open `nettools/subnet-calculator.html` in Chrome → confirm:
   - Related-tools `<aside>` renders at bottom of `<main>`
   - 3 tools shown (`subnet-ipv6`, `cidr`, `planner`)
   - Links work and are keyboard-navigable (Tab order respects DOM order)
2. Open Cmd/Ctrl-K overlay with empty input → confirm:
   - "Popular tools" header visible above 8 pinned tools
   - Star indicator (★) on each pinned row
   - Typing replaces the popular section with fuzzy results
3. Visit each of the 5 category index pages → confirm:
   - Intro paragraph above grid; outro section below grid with sibling-category links
   - `<h2>` headings on intro/outro (not `<h1>` — that's the page title)
4. Spot-check 5 rewritten meta descriptions in browser View-Source.
5. Run Lighthouse SEO on 3 pages — target ≥95.
6. Tab through related-tools panel + verify screen-reader announces "Related tools" landmark.
7. Cross-browser: load 1 modified page in Chrome, Firefox, Safari → no console errors.
8. Validate `sitemap.xml` updates `<lastmod>` for every edited URL.

## Out of scope (deferred to Phase 3)

- Per-tool "How this works" educational sections
- `FAQPage` JSON-LD on top 8 tools
- "Load example" buttons
- Shareable result URLs on calculators that lack them
- CollectionPage JSON-LD on category index pages

## Meta-description rewrite worksheet (19 changes)

| File | Old length | New length | Note |
|---|---|---|---|
| `financials/take-home-pay-calculator.html` | 195 | 142 | Trimmed "Free, fast, offline-ready calculator" boilerplate |
| `financials/compound-interest-calculator.html` | 188 | 156 | Same trim |
| `system/iops-calculator.html` | 200 | 152 | "on-premises RAID arrays" → "on-prem RAID" |
| `nettools/mtu-calculator.html` | 207 | 144 | Condensed protocol-overhead listing |
| `data/string-tools.html` | 196 | 144 | Tightened example listing |
| `financials/loan-reference.html` | 184 | 154 | New angle: glossary + predatory-lending detection |
| `productivity/tz-meeting-planner.html` | 181 | 154 | "Shareable URL, no signup" instead of "No accounts, runs offline" |
| `data/measurement-converter.html` | 178 | 152 | Removed "Perfect for students and professionals" filler |
| `financials/loan-payoff-methods.html` | 179 | 153 | Removed duplication w/ debt-payoff-comparison |
| `financials/amortization-calculator.html` | 167 | 144 | |
| `financials/salary-hourly-converter.html` | 169 | 144 | |
| `financials/index.html` | 175 | 144 | Lists all 6 actual tools instead of just 3 |
| `financials/debt-payoff-comparison.html` | 173 | 142 | |
| `system/jwt-decoder.html` | 167 | 145 | "Tokens never leave your browser — no upload." value prop |
| `system/index.html` | 175 | 144 | Reflects current 11-tool set |
| `system/passphrase-generator.html` | 117 | 141 | Was too short; added crypto value prop |
| `system/password-generator.html` | 132 | 153 | Added entropy/no-logging detail |
| `index.html` | 148 | 156 | Updated to include Financials, Productivity, PDF |
| `productivity/index.html` | 148 | 152 | Reflects all 4 tools in category |
| `data/index.html` | 127 | 144 | Reflects current 6-tool set |
| `data/base64-hash.html` | 134 | 144 | Added browser-only value prop |

Total: 21 rewrites (one file appears twice in count above — measurement-converter only once). Bit-calculator at 128 chars was borderline-short but kept as-is.

## Files changed (final count)

- `navigationv2.js` — added `related`/`pinned` fields to 43 registry entries; registered 3 missing tools (ip-converter, jwt-decoder, json-formatter); added `buildRelatedToolsHTML`, `injectRelatedTools`, `renderSearchResultRow`; updated `renderSearchResults` for pinned-first; added CSS for related-tools panel, search-section-heading, search-result-pin, category-intro, category-outro.
- 5 category `index.html` files — added intro + outro sections.
- 21 tool HTML files — meta-description rewrites.
- `sitemap.xml` — bumped 41 `<lastmod>` entries to 2026-05-13.
- `mycode_plans/plans/seo-roadmap.md` (new)
- `mycode_plans/plans/seo-phase-2-depth.md` (this file, new)
- `mycode_plans/plans/seo-phase-3-engagement.md` (new, outline only)

## Static verification (passed)

- `node --check navigationv2.js` → exit 0 (no syntax errors)
- Sitemap parsed by Python `xml.etree` → 49 URLs, well-formed
- All edited pages return HTTP 200 via `python -m http.server`
- Grep confirms all helper functions wired into `init()` and CSS classes resolved

## Browser verification (manual, recommended before merge)

1. `python -m http.server` in repo root, then in Chrome:
2. Open `http://localhost:8000/nettools/subnet-calculator.html` → confirm "Related Tools" `<aside>` appears at bottom of `<main>`, lists IPv6 calc + CIDR + planner, all links work.
3. Press Cmd/Ctrl-K → confirm "Popular tools" section with 8 pinned tools (each with ★), "More tools" below.
4. Type "regex" → confirm pinned section collapses to fuzzy results.
5. Open `http://localhost:8000/nettools/` → confirm category intro paragraph above grid, outro section with sibling cross-links below.
6. Repeat for system/, data/, financials/, productivity/.
7. Tab through related-tools panel: confirm keyboard navigation, visible focus, screen-reader announces "Related tools" landmark.
8. Repeat in Firefox + Safari (or test responsive mode at 400px width).
9. Run Lighthouse SEO audit on 3 representative pages; target ≥95.

## Dependencies

None new. Reuses `a11y-utils.js`, `storage-utils.js`, existing CSS variables.
