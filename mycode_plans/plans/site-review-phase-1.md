# Site Review Phase 1 — Search, Breadcrumbs, JSON-LD, Sitemap, 404

**Status:** ✅ Completed (commit `2c65d7f`, PR #15)
**Scope decision:** Centralize in `navigationv2.js` so 36 tool HTML files don't each need edits.

## Overview

Site-wide UX and SEO improvements driven entirely from `navigationv2.js`. Adds Cmd/Ctrl-K search overlay, auto-injected breadcrumbs, SoftwareApplication JSON-LD on tool pages that lack inline schema, a tiered sitemap, and a custom 404 page.

## Features

| Feature | Status |
|---|---|
| Tool registry in `navigationv2.js` (31 entries + descriptions) | ✅ Done |
| Cmd/Ctrl-K + `/` site-wide search overlay with fuzzy match on name + keywords | ✅ Done |
| ARIA combobox semantics + keyboard navigation in search overlay | ✅ Done |
| Breadcrumb nav auto-injected at top of `<main>` on tool & category pages | ✅ Done |
| `BreadcrumbList` JSON-LD matching breadcrumb UI | ✅ Done |
| `SoftwareApplication` JSON-LD auto-injected on tool pages lacking inline schema | ✅ Done |
| Duplicate-detection — skips pages that already ship `WebApplication`/`SoftwareApplication` JSON-LD | ✅ Done |
| Filename-fallback registry lookup for pages omitted from dropdown menus | ✅ Done |
| Custom `404.html` with category links and Ctrl-K search hint (`noindex`) | ✅ Done |
| Sitemap `<lastmod>` on every URL; removed unused `changefreq` | ✅ Done |
| Sitemap tiered priorities (1.0 home, 0.9 category hubs + top 6 tools, 0.7 long-tail) | ✅ Done |
| Sitemap: added missing `password-generator` entry | ✅ Done |

## Files changed

- `404.html` — created (161 lines)
- `navigationv2.js` — +577 lines (tool registry, search, breadcrumbs, JSON-LD injection)
- `sitemap.xml` — restructured (404 lines added, 201 removed; net +203)

## Design Notes

- **Why centralized**: 36 tool HTMLs means per-page edits would be 36× the work and 36× the drift surface. Tool registry in `navigationv2.js` is the single source of truth.
- **Why filename-fallback registry**: a few pages (`loan-reference`, `loan-payoff-methods`) aren't in the dropdown menus but still deserve breadcrumbs and schema. Falls back to filename match.
- **Why duplicate-detection on JSON-LD**: pages that already inline `WebApplication`/`SoftwareApplication` (e.g., calculators with schema-marked outputs) shouldn't get a second copy. Auto-inject only runs if none is found.

## Dependencies

None new.
