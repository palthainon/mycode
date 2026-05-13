# SEO Roadmap — OldWeb Tools

**Owner:** Derick Lawson
**Started:** 2026-05-01
**Source plan:** `C:\Users\deric\.claude\plans\lets-update-our-mycode-plans-radiant-piglet.md`

Unified 3-phase SEO program for oldweb.tech. Goal: improve organic discoverability of a 40+ tool static site without bloating the codebase or adding tracking.

## Phase status

| Phase | Theme | Status | Plan file |
|---|---|---|---|
| 1 | Foundation — registry, search, breadcrumbs, JSON-LD, sitemap, 404 | ✅ Completed (PR #15, commit `2c65d7f`) | [site-review-phase-1.md](site-review-phase-1.md) |
| 2 | Depth — related-tools panel, pinned tools, category copy, meta-description audit | ✅ Implemented locally (2026-05-13), awaiting commit | [seo-phase-2-depth.md](seo-phase-2-depth.md) |
| 3 | Engagement — "How this works" + FAQ schema, "Load example" buttons, shareable URLs | 📋 Future | [seo-phase-3-engagement.md](seo-phase-3-engagement.md) |

> Note: `site-review-phase-2.md` is a parallel track (4 new tools + copy buttons + storage persistence) that shipped 2026-05-12. It's not part of the SEO roadmap, but the work happened alongside Phase 1.

## Design principles (apply across all phases)

1. **Centralize where possible.** Auto-injected features go in `navigationv2.js` so 46+ tool HTMLs don't drift.
2. **HTML for content, JS for structure.** Anything crawlers need to see on first paint goes in the actual HTML — intro copy, meta tags, FAQ schema. Auto-injection is only for cross-cutting UI scaffolding.
3. **No dependencies added.** Reuse `a11y-utils.js`, `storage-utils.js`, existing CSS.
4. **Accessibility-first.** Semantic landmarks, ARIA where needed, keyboard navigation, focus-visible.
5. **Offline-still-works.** Nothing we add can require a network round-trip.

## Quick links

- `navigationv2.js` — registry + auto-injection (single source of truth)
- `sitemap.xml` — bump `<lastmod>` on every Phase that edits page content
- `404.html` — owns its own discoverability surface
- Category index pages: `nettools/index.html`, `system/index.html`, `data/index.html`, `financials/index.html`, `productivity/index.html`
