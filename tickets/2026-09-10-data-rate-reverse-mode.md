---
id: 2026-09-10-data-rate-reverse-mode
short_id: MCP1
title: Data Rate Calculator — add reverse mode (size + duration to rate)
project: nettools
status: active
todoist_parent:
todoist_project:
retros: []
cm_status: n/a
opened: 2026-09-10
closed:
---

## Tracker

```yaml
next: {n: 4, do: "Test both modes in a browser", date: 2026-09-10, owner: operator}
change_record: none
sensitive_output: false
work:
  - {n: 1, name: mode-toggle-and-duration-input, state: done, date: 2026-09-10, owner: claude,
     pages: [nettools/data-rate-calculator.html],
     note: "A \"Calculate:\" toggle swaps the transfer-rate input for an elapsed-time input."}
  - {n: 2, name: rate-results-export-storage, state: done, date: 2026-09-10, owner: claude,
     pages: [nettools/data-rate-calculator.html],
     note: "New #rateResults section, mode-aware CSV export, localStorage key data-rate-calc-mode."}
  - {n: 3, name: bind-todoist-parent, state: blocked, owner: operator,
     waiting_on: "the user",
     blocker: "The repo CLAUDE.md names no Todoist project, so there is no parent to bind."}
  - {n: 4, name: browser-verify-both-modes, state: open, owner: operator,
     pages: [nettools/data-rate-calculator.html],
     needs: [1, 2],
     verify: "Transfer Rate mode with 12 TB and 36 hours reads 814.45 Mbps in binary mode."}
do_not:
  - {what: "Use a generic `.error` CSS class for the new error container.",
     why: "It applies display:none and hides the input elements. See the error pattern in the repo CLAUDE.md."}
  - {what: "Write the page with `git add` under core.autocrlf=true after a Python rewrite.",
     why: "The repo stores CRLF blobs. A LF rewrite turns a 400-line edit into a 1147-line whole-file diff. Stage with `git -c core.autocrlf=false add`."}
```

## Goal

Add a second mode to `nettools/data-rate-calculator.html`. The user enters a data
size and an elapsed time. The tool reports the achieved transfer rate.
Example: 12 TB in 36 hours.
— target close: 2026-09-10

## Status

- 2026-09-10 — Ported `tickets/TEMPLATE.md` to the jayveeye Tracker shape and
  copied `tickets/New-TicketId.ps1`. This ticket took the code `MCP1`. The
  jayveeye change-management and implementation-plan sections do not apply to a
  static-site repo, so the template drops them and adds a `## Verification`
  section instead.

- 2026-09-10 — Merged the reverse direction to `main` as `e5edea0`. A
  "Calculate:" toggle switches between "Transfer Time" and "Transfer Rate".
  Rate mode takes a data size and an elapsed time, then reports bits per
  second, bytes per second, and the volume moved per hour and per day. I
  verified the page script with a DOM-stub harness under node, not in a real
  browser: the Chrome extension was not connected. 12 TB in 36 hours returns
  814.45 Mbps in binary mode and 740.74 Mbps in decimal mode.

- 2026-09-10 — Opened the stream.

## Verification

- Browser: not tested. The Chrome extension was not connected, so
  `tabs_context_mcp` refused. A DOM-stub harness under node ran the real page
  script and covered both modes, the round trip, a zero elapsed time, and the
  CSV export. That is a static check.
- Accessibility: not tested. The new controls carry `aria-pressed`,
  `aria-label`, `aria-describedby` and `A11yUtils.announce` calls that copy the
  patterns already on the page. Nobody has tabbed through them or run a screen
  reader.
- Navigation and sitemap: no change needed. The reverse mode adds no file, so
  `sitemap.xml` and the navigation dropdown are unchanged.

## Notes / context

The page uses binary or decimal multipliers for data size, and always decimal
multipliers for network rates. The reverse mode keeps that split, so the two
directions round-trip.
