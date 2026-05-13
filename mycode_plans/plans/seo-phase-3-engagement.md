# SEO Phase 3 — Engagement (How-It-Works, Examples, Shareable URLs)

**Status:** 📋 Future (not started)
**Roadmap:** [seo-roadmap.md](seo-roadmap.md)
**Estimated effort:** Highest of the three phases — touches individual tool HTMLs.

## Overview

Phase 1 built the SEO foundation; Phase 2 deepens the content. Phase 3 raises the engagement and educational quality of the top tools, plus adds shareable result URLs to calculators that lack them.

## Planned features

### 3A. "How this works" + FAQ schema on top 8 tools

Add a collapsible "How this works" section + `FAQPage` JSON-LD to the highest-traffic / highest-keyword-value tools:

1. `subnet` — Subnet Calculator (IPv4)
2. `regex` — Regex Tester
3. `passphrase` — Passphrase Generator
4. `base64` — Base64 & Hash Tools
5. `timestamp` — Timestamp Converter
6. `take-home-pay` — Take-Home Pay Calculator
7. `amortization` — Amortization Calculator
8. `jwt-decoder` — JWT Decoder

Each gets 3-5 FAQ entries. Schema example:
```json
{ "@type": "FAQPage", "mainEntity": [
  { "@type": "Question", "name": "What is CIDR notation?",
    "acceptedAnswer": { "@type": "Answer", "text": "..." } }
]}
```

### 3B. "Load example" buttons

Pre-fill inputs with curated, realistic datasets — biggest UX win for first-time visitors. Examples:

- Subnet Calculator → "192.168.1.0/24"
- Regex Tester → email-validation regex + sample text
- JWT Decoder → demo token (no real credentials)
- Cron Builder → "0 9 * * 1-5" (weekdays 9am)
- Take-Home Pay → $85k salary, single, no state tax

Pattern: a small button labeled "Try with example" near the input; clicking fills all relevant fields and triggers the existing calculation/preview flow.

### 3C. Shareable result URLs

Audit (from Phase 1 exploration) showed 19/46 tools already have hash/query-string state. Bring the remaining calculators up to parity:

**Candidates (missing shareable state):**
- `subnet` (verify — may have it)
- `amortization`
- `compound-interest`
- `debt-payoff`
- `retirement`
- `chmod`
- `cron`
- `cidr`
- `data-rate`
- `mtu`
- `iops`

Use `URLSearchParams` for short calculator inputs, `location.hash` for long-form text. Restore on page load via existing `StorageUtils.loadFormInputs` pattern but prefer URL params over localStorage when both present.

## Estimated scope

- **3A:** 8 tools × ~150 lines each (HTML + JSON-LD + collapsible CSS reuse) = ~1200 lines
- **3B:** ~10 tools × ~30 lines each (button + handler) = ~300 lines
- **3C:** ~10 tools × ~50 lines each (URL state init + serialize/restore) = ~500 lines

## Open questions (resolve before starting Phase 3)

1. Should "How this works" be collapsed by default (saves vertical space, hurts SEO) or expanded (more content visible to crawlers, looks busier)?
2. For shareable URLs: short links via hash, or query strings? Hash doesn't hit server logs but query strings work better for analytics-free embedding.
3. Do we want a centralized FAQ-builder utility in `navigationv2.js` (reuse), or inline JSON-LD per tool (more independent)?

## Verification (when Phase 3 lands)

1. Top 8 tools render their "How this works" sections; toggle works with mouse + keyboard.
2. JSON-LD validates at https://validator.schema.org/.
3. Rich Results Test (https://search.google.com/test/rich-results) recognizes FAQPage on all 8.
4. "Load example" buttons fill inputs and produce the expected output on first click.
5. Shareable URLs round-trip: open with params → result correct → copy URL → open in new tab → same result.
