# Phase 2 — Per-Tool Content Depth & Pinned Quick Access

Branch: `claude/website-review-suggestions-RLWNX` (PR #15 continues from Phase 1)

## Context

Phase 1 (commit `fce3091`) added a tool registry, site-wide search, breadcrumbs, JSON-LD, sitemap upgrade, and a 404 page — all injected by `navigationv2.js` so individual tool HTML files were left untouched.

Phase 2 builds on that registry to improve **internal linking** (a strong SEO signal) and **cross-tool navigation depth** (UX), and tightens **per-page metadata** so each tool can rank for its own queries.

## Goals

1. Show users related tools at the bottom of every tool page — both for discoverability and for Google's internal-link graph.
2. Surface Quick Access pins on **every** page (not just home), so a user deep in one tool can jump to a pinned one without going back to the homepage.
3. Give each category index page intro + outro copy so they can rank for category-level queries (e.g., "free network tools online").
4. Eliminate duplicate or generic meta descriptions across tool pages.

## Changes

### 1. Related-tools panel (navigationv2.js)

- Extend `toolRegistry` entries with a `related: [...ids]` array (3-4 ids per tool, hand-picked).
- New function `injectRelatedTools(currentPage, pathPrefix)`:
  - Runs only on tool pages (not home, not category index, not 404).
  - Appends an `<aside class="related-tools">` to `<main>` containing 3-4 cards built from registry entries.
  - Each card: tool name, short description (from `toolDescriptions`), category badge, link.
- CSS: dark-themed compact grid that matches the existing card aesthetic.

### 2. Pinned-tools row in nav (navigationv2.js)

- Read `owt_quick_access` from localStorage (the existing Quick Access key used by `index.html`).
- If non-empty and current page is **not** home, render a compact pill row below the main nav bar:
  - Up to 8 small pill links labeled with the tool name.
  - Visually distinct from breadcrumbs (lives just below the nav, above breadcrumbs).
  - Hidden if user has not pinned anything.
- Reactive: listen for `storage` events so changes on the home page propagate to other tabs.

### 3. Category intro/outro copy (5 HTML files)

Edit each category index, adding a 2-3 sentence intro **above** `.tools-grid` and a 100-150 word "About these tools" block **below** it:

- `/home/user/mycode/nettools/index.html` — focus on subnet/CIDR/IP planning audience.
- `/home/user/mycode/system/index.html` — sysadmin/devops audience.
- `/home/user/mycode/data/index.html` — developer/data audience.
- `/home/user/mycode/financials/index.html` — personal finance/loan-planning audience.
- `/home/user/mycode/productivity/index.html` — focus/time-management audience.

Each block uses primary keywords naturally without stuffing. Style with existing `.tool-card`/`.subtitle` colors; no new CSS framework.

### 4. Meta-description audit

Grep every HTML file's `<meta name="description">`, find duplicates or generic descriptions, and rewrite each to be:

- 140-160 characters.
- Unique per page.
- Includes the primary keyword and one concrete benefit ("Free", "No signup", "Offline-ready").

Likely candidates for rewrite: `subnet-planner` vs `subnet-calculator`, `loan-payoff-methods` vs `debt-payoff-comparison`, the category hubs (they currently describe themselves similarly).

## Critical Files

- `/home/user/mycode/navigationv2.js` — extend with related-tools and pinned-row injection.
- `/home/user/mycode/{nettools,system,data,financials,productivity}/index.html` — intro/outro copy.
- All tool HTML files — meta-description audit (only edit ones that have duplicates or generic copy; don't touch ones that already differentiate well).
- `/home/user/mycode/storage-utils.js` — reuse `StorageUtils.load('quick_access', [])` (storage utility prefixes keys with `owt_` automatically; verify the exact key name used by `index.html`).

## Verification

Run a local server (`python3 -m http.server 8765` from `/home/user/mycode`) and check:

1. **Related tools panel** appears at the bottom of every tool page with 3-4 cards that resolve to the right URLs (use jsdom smoke tests as in Phase 1).
2. **Pinned-tools row** is empty on first visit; pin 2 tools via the homepage Quick Access modal, then navigate to a tool page and confirm the pills render and link correctly. Confirm the row is hidden on home (Quick Access section already serves it there).
3. **Category index intros/outros** render above and below the tool grid. No layout regressions on 375px viewport.
4. **Meta descriptions**: `grep -h '<meta name="description"' **/*.html | sort | uniq -d` returns nothing.
5. **No regression** in Phase 1: search overlay still opens (Ctrl-K), breadcrumbs render on tool pages, JSON-LD validates.
6. **Schema validators**: rerun https://validator.schema.org and https://search.google.com/test/rich-results against one tool page.

## Out of scope (deferred to Phase 3)

- "How this works" collapsible explanation block + `HowTo`/`FAQPage` schema.
- "Load example" buttons.
- Shareable result URLs for calculators.
- Per-category OG images.
