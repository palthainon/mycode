---
id: 2026-09-10-data-rate-reverse-mode
title: Data Rate Calculator — add reverse mode (size + duration to rate)
project: nettools
status: active
todoist_parent:          # TBD — repo defines no Todoist project yet
todoist_project:         # TBD
retros: []
opened: 2026-09-10
closed:
---

## Goal

Add a second mode to `nettools/data-rate-calculator.html`. The user enters a data
size and an elapsed duration. The tool reports the achieved transfer rate.
Example: 12 TB in 36 hours. — target close: 2026-09-10

## Tracker

```yaml
next:
  do: Confirm the Todoist project for this repo, then bind the parent task. Test the page in a real browser.
  date: 2026-09-10
change_record: none
sensitive_output: none
work:
  - n: 1
    what: Add a mode toggle and a duration input to the calculator page.
    state: done
    date: 2026-09-10
    note: A "Calculate:" toggle swaps the rate input for an elapsed-time input.
  - n: 2
    what: Add rate results, CSV export and localStorage keys for the new mode.
    state: done
    date: 2026-09-10
    note: New #rateResults section, mode-aware CSV, key data-rate-calc-mode.
  - n: 3
    what: Confirm the Todoist project for this repo and write the parent id back.
    state: blocked
    blocker: The repo CLAUDE.md names no Todoist project.
    waiting_on: user
    owner: operator
    date: null
do_not:
  - what: Use a generic `.error` CSS class for the new error container.
    why: It hides the input elements. See the repo CLAUDE.md error pattern.
```

## Status (latest first)

- 2026-09-10 — Added the reverse direction to
  `nettools/data-rate-calculator.html`. A "Calculate:" toggle switches between
  "Transfer Time" and "Transfer Rate". Rate mode takes a data size and an
  elapsed time, then reports bits per second, bytes per second, and the volume
  moved per hour and per day. I verified the page script with a DOM-stub
  harness under node, not in a real browser: the Chrome extension was not
  connected. 12 TB in 36 hours returns 814.45 Mbps in binary mode and
  740.74 Mbps in decimal mode.

- 2026-09-10 — Opened the stream. Work runs in the worktree
  `.claude/worktrees/data-rate-reverse` on branch `worktree-data-rate-reverse`.

## Notes / context

The page uses binary or decimal multipliers for data size, and always decimal
multipliers for network rates. The reverse mode must keep that split.
