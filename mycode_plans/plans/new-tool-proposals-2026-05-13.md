# New Tool Proposals — OldWeb.tech

**Date:** 2026-05-13
**Goal:** Propose new tools that help the largest number of people, beyond the current network/sysadmin niche.

## Decision Framework (resolved via /grill-me)

| Decision | Choice |
|---|---|
| Audience | Broad — students + adults of all types, ad-free, no-subscription |
| Selection filter | High search volume, beat ad-heavy incumbents |
| Tech constraint | Client-side OK with large lazy-loaded libs (WASM/JS). Files never leave the browser. |
| Proposal depth | 3–5 deeply researched picks |
| Brand fit | Any utility is fair game (PDF, image, audio, QR, color, etc.) |

## Research — Landscape of High-Volume Free Tools

| # | Tool | Est. Monthly Searches (US) | Top Ad-Supported Incumbents | Common Complaints | Client-Side Feasibility | Differentiator |
|---|------|----------------------------|------------------------------|-------------------|------------------------|----------------|
| 1 | PDF Merge / Split / Rotate / Compress | 10M+ global combined | smallpdf.com, ilovepdf.com, sejda.com | Uploads required, 2-task/hour limits, watermarks, 637 tracking cookies from 221 third-party domains in single iLovePDF session | Yes — `pdf-lib` + `pdf.js` | "Your PDF never leaves your browser." |
| 2 | Image Compress / Resize / Convert | 1M–10M | tinypng.com, compressor.io, iloveimg.com | 20-image batch cap, server uploads, ad-injected mid-flow | Yes — `browser-image-compression`, Squoosh-style WASM (mozjpeg, oxipng, libwebp, AVIF) | Bulk + AVIF/WebP locally with quality preview slider |
| 3 | Background Remover | 1M+ | remove.bg, photoroom.com, Canva BG remover | Paywall after 1 free HD image, login wall, hidden subscription dark patterns | Yes — `@imgly/background-removal` (~40MB ONNX model, WebGPU) | Unlimited free HD, no signup |
| 4 | QR Code Generator + Reader | 10M+ globally | qr-code-generator.com, qrstuff.com, qrcode-monkey | Aggressive upsell to "dynamic QR", ads on download, tracking pixels in generated codes | Yes — `qrcode` + `jsQR` / `html5-qrcode` | Both directions in one tool, no tracking embedded |
| 5 | EXIF / Metadata Stripper | 100k+ | exifremover.com, metadata2go.com, verexif.com | Uploads photos containing GPS to server (ironic) | Yes — `piexifjs` or byte-level JPEG/PNG editing | Strips GPS/serial/device data locally |
| 6 | Color Contrast Checker + Palette | 100k–1M | coolors.co, WebAIM, contrastchecker.com | WebAIM dated, no APCA; Coolors paywalls features | Yes — pure JS math | WCAG 2.1 AA/AAA + APCA side-by-side |
| 7 | Image OCR (image/PDF → text) | 100k+ | onlineocr.net, newocr.com | 15-image limit, server uploads, garbled output | Yes — `tesseract.js` (100+ languages, WASM) | 100+ languages, multi-page, never uploads — safe for IDs/receipts |
| 8 | CSV ↔ JSON / Excel Converter | 100k+ | convertcsv.com, jsonformatter.org, codebeautify.org | Ad-saturated, row caps, slow on >10MB | Yes — `papaparse` + `sheetjs/xlsx` | Stream-parses 100MB+ files locally |
| 9 | Markdown Editor (Live Preview + Export) | 100k+ | dillinger.io, stackedit.io | Slow boot, flaky cloud sync, no spellcheck | Yes — `marked` / `markdown-it` + `highlight.js` + `html2pdf.js` | Fast cold-start, PDF/HTML/Word export, GFM + Mermaid |
| 10 | Favicon Generator | 100k+ | favicon.io, realfavicongenerator.net | favicon.io has misdirecting ad buttons; RFG uploads to server | Yes — Canvas API + `JSZip` | All sizes (ico/png/apple-touch/manifest) locally zipped |
| 11 | Timezone Meeting Planner / World Clock | 1M+ | worldtimebuddy.com, timeanddate.com | WTB capped at 4 locations free; T&D ad-dense | Yes — `luxon` or native `Intl.DateTimeFormat` | Unlimited locations, share-by-URL meeting link |
| 12 | Date / Age / Days-Between Calculator | 1M+ | calculator.net, timeanddate.com | Ad-heavy, intrusive cookie banners | Yes — `date-fns` or native `Date` | One page: age + duration + business-days + add/subtract |

**Reusable libraries:** `pdf-lib`, `pdf.js`, `tesseract.js`, `@imgly/background-removal`, `jsQR`, `html5-qrcode`, `qrcode`, `papaparse`, `sheetjs`, `piexifjs`, `browser-image-compression`, `marked`, `luxon`, `JSZip`.

**Strongest "beat the incumbent" narrative themes:**
1. No upload / no server (privacy)
2. No file/usage caps
3. No watermark / no signup
4. No third-party trackers

---

# Top 5 Picks — Ranked by "Largest Number of People Helped"

## #1 — PDF Suite (Merge / Split / Compress / Rotate / PDF↔Image)

**Audience:** Every student, professional, and parent who has ever needed to combine PDFs or shrink one under a file-size limit. Single highest-volume utility category on the web.

**Search volume:** 10M+ monthly globally. "compress pdf" alone ~2M/mo US.

**Incumbents & their sins:**
- smallpdf.com / ilovepdf.com / sejda — uploads required (tax forms, IDs, contracts go to a stranger's server). Free tier caps at 2 tasks/hour. Watermarks on free output. iLovePDF documented to load 637 tracking cookies from 221 third-party domains pre-click.

**Differentiator:** "Your PDF never leaves your browser — unlimited files, no watermarks, no signup, no trackers."

**Implementation sketch:**
- `pdf-lib` (merge/split/rotate/manipulate) + `pdf.js` (render/preview/extract). Both pure JS, ~400KB gzipped each, lazy-loaded.
- One page per sub-tool under `/pdf/` (merge.html, split.html, compress.html, rotate.html, pdf-to-image.html, image-to-pdf.html).
- Drag-drop file zone; output via Blob URL download.
- Compression: re-render pages through pdf.js to canvas at user-selected DPI, re-encode JPEG quality, repack with pdf-lib. Show before/after size live.

**Why it wins:** Most-searched utility category on the internet, and the privacy story is the marketing copy: *"We literally cannot see your file."*

---

## #2 — Image Toolkit (Compress / Resize / Convert / Crop)

**Audience:** Everyone with a phone camera. Job-seekers, sellers, students, devs converting to WebP/AVIF.

**Search volume:** 1M–10M monthly ("compress image" ~1.2M US, "resize image online" ~600k, "image converter" ~500k).

**Incumbents & their sins:**
- tinypng.com — 20-image batch cap, server-side, no AVIF.
- iloveimg.com / compressor.io — ads injected mid-flow, file size limits, slow on >5MB uploads.

**Differentiator:** Squoosh-grade quality, no batch limits, modern formats (AVIF/WebP), side-by-side preview slider, all local.

**Implementation sketch:**
- `browser-image-compression` for fast path; WASM-compiled `mozjpeg` / `oxipng` / `libwebp` / AVIF encoder for max quality (Squoosh-style).
- Canvas API for resize/crop/format conversion in common cases.
- Single-page UI with tabs (Compress, Resize, Convert, Crop). Drag-drop multi-file, ZIP download via `JSZip`.

**Why it wins:** Most people don't realize they're uploading every selfie to a third party just to shrink it. Once they see local processing, they bookmark.

---

## #3 — QR Code Generator + Scanner (one tool, both directions)

**Audience:** Small-business owners, teachers, students sharing wifi, event organizers. Universal.

**Search volume:** 10M+ globally. qr-code-generator.com alone pulls ~8.6M visits/month.

**Incumbents & their sins:**
- qr-code-generator.com / qrstuff.com / qrcode-monkey — relentless upsell to "dynamic QR" subscription, ads on the download button, some embed tracking redirects in the generated PNG (the "free" QR routes through their server, so they capture scan analytics).

**Differentiator:** Both directions in one URL, no tracking embedded in output, full logo/color customization client-side, mobile camera scanner.

**Implementation sketch:**
- `qrcode` (npm) for generation, `html5-qrcode` for camera scanning, `jsQR` for image-upload scanning.
- Gen options: URL, wifi credentials (SSID + password preset), vCard, plain text, email. Logo overlay via canvas. Color / error-correction-level / size sliders.
- Scan: tap camera icon → live scan, or drop an image. Decoded payload shows with "Open link," "Copy," "Connect to wifi" actions.

**Why it wins:** People assume QR generators are all the same. They're not — most exfiltrate scan data. A clean, no-tracking one is genuinely rare.

---

## #4 — Background Remover (one-click, free HD, no signup)

**Audience:** Students (slide decks/posters), gig workers (profile photos), parents (invitations), anyone selling stuff online. Strongest "wow" reaction in this list — best bookmark-driver.

**Search volume:** ~1M monthly US ("remove background" + variants).

**Incumbents & their sins:**
- remove.bg — first HD image free, then login wall + credit purchase.
- photoroom.com / canva — require account, watermark or downsample exports.

**Differentiator:** Unlimited free, full HD, no signup, runs entirely in your browser via WebGPU.

**Implementation sketch:**
- `@imgly/background-removal` (Apache-2.0, ISNet ONNX model on `onnxruntime-web`, ~40MB model, WebGPU with WASM fallback).
- One-time ~40MB model download cached in IndexedDB → subsequent uses instant and offline.
- "Downloading model (one-time, 40MB)…" progress bar on first use to prevent bounce.
- Output: PNG with transparent background; optional solid/gradient background picker.

**Why it wins:** The demo you can show a non-technical friend in 10 seconds and they immediately get why your site is better. Word-of-mouth magnet.

---

## #5 — Date & Timezone Toolbelt

**Audience:** Remote workers, international students, project managers, trip planners, HR doing tenure math. Boring but constant.

**Search volume:** "days between dates" ~500k/mo US, "timezone converter" ~600k/mo US, "age calculator" ~1M/mo US. Combined 3M+.

**Incumbents & their sins:**
- calculator.net / timeanddate.com — ad-dense, intrusive cookie banners, slow JS.
- worldtimebuddy.com — 4-location cap on free tier, paywall popups.

**Differentiator:** One page does it all (age + duration + business-days + add/subtract + unlimited-city timezone planner with shareable meeting URL), and it's fast.

**Implementation sketch:**
- Tabs in one page: "Age / Days Between," "Add or Subtract," "Business Days," "Meeting Planner."
- Native `Intl.DateTimeFormat` + IANA tz list; `luxon` only if DST-aware arithmetic needed.
- Meeting planner: pick N cities, scrub time slider, see local time in each. URL-encode state so `?cities=NYC,LON,TYO&time=14:00` is shareable — sender's coworker lands on a working link. Big virality lever.

**Why it wins:** Highest "I'll need this again next week" repeat-use rate of anything in this list. Quietly massive.

---

## Pick-One Cheat Sheet

| Goal | Pick |
|---|---|
| Most total users helped | #1 PDF Suite |
| Biggest "wow factor" / shareability | #4 Background Remover |
| Highest repeat-use / habit-forming | #5 Date & Timezone |
| Easiest to ship cleanly in a weekend | #3 QR Generator/Scanner |
| Best privacy story for marketing | #1 or #4 (tie) |

**Recommended build order for "largest number of people helped":** PDF Suite → Image Toolkit → QR. Combined ~25M+ monthly searches with strong differentiation against incumbents.

## Honorable Mentions (skipped from top 5)

- **Word Counter / Case Converter / Lorem Ipsum** — massive volume (1M+) but trivial; only worth bundling.
- **Tip / Percentage / Refinance / Paycheck Take-Home calculators** — huge volume; could extend financials section.
- **Box-shadow / gradient / cubic-bezier generators** — niche but devs love them; medium volume (10k–100k).
- **File hash verifier (drag-drop SHA-256)** — could extend existing hash tool with drag-drop file mode.

## Sources

- [Smallpdf/iLovePDF privacy review](https://www.gethonestpdf.com/blog/is-smallpdf-safe-2026)
- [iLovePDF alternatives (no upload)](https://fixmypdf.in/blog/free-ilovepdf-alternatives)
- [TinyPNG alternatives roundup](https://imageoptimizerpro.ai/blog/best-tinypng-alternatives/)
- [qr-code-generator.com traffic (Semrush)](https://www.semrush.com/website/qr-code-generator.com/overview/)
- [pdf-lib](https://pdf-lib.js.org/)
- [@imgly/background-removal](https://www.npmjs.com/package/@imgly/background-removal)
- [tesseract.js](https://tesseract.projectnaptha.com/)
- [jsQR](https://github.com/cozmo/jsQR)
- [html5-qrcode](https://github.com/mebjas/html5-qrcode)
- [EXIF remover landscape](https://www.metadata2go.com/delete-metadata)
- [Markdown editor complaints](https://www.jekyllpad.com/blog/best-markdown-editors)
- [WorldTimeBuddy alternatives](https://rigorousthemes.com/blog/best-world-time-buddy-alternatives/)
- [WebAIM contrast checker](https://webaim.org/resources/contrastchecker/)
- [Favicon generator alternatives](https://alternativeto.net/software/realfavicongenerator-net/)
- [Awesome CSV (libraries)](https://github.com/secretGeek/AwesomeCSV)
