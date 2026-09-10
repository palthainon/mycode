---
id: YYYY-MM-DD-<slug>     # stable handle; matches the filename (no .md)
short_id:                 # repo code MC + machine letter (P/V/L) + seq, e.g. MCP1
title: <one-line work-stream title>
project:                 # optional: repo sub-area this stream touches
status: active           # active | blocked | done
todoist_parent:          # leave empty; this repo uses no Todoist project
todoist_project:         # leave empty; see the CLAUDE.md work-stream ticket rule
retros: []               # paths to retros and to this ticket's Status history file
cm_status: n/a           # this repo is a static site with no change-management gates,
                         # so every ticket stays n/a and carries no gate work items
opened: YYYY-MM-DD
closed:                  # set when status -> done
---

## Tracker

<!-- Machine-readable state, and the only place state lives. A session resumes from
this block alone. Prose below is history; if prose and this block disagree, this
block is right and the prose is stale - delete the stale line.

Never restate a Tracker fact in a prose table. One fact, one home.

`work` is every actionable item, in one list. There is no separate gate ladder.

state:
  open       - actionable now
  blocked    - cannot start; say why in `blocker`
  scheduled  - committed to a date that has not arrived; carries `on:`
  done       - finished; carries `date:` (the day it finished) and `note:`

`date:` only ever means the day an item finished. A booked or committed future date
uses `on:`, which any item may carry. Use `date: null` where a date is genuinely
unknown. Never invent one.

An item keeps `blocker:` while it is open or blocked and swaps it for `note:` when
it is done - the note says what the answer turned out to be. `note:` is allowed on
any item, in any state. Move a real dependency into `needs:` before you delete a
blocker, or it is lost.

Omit any optional key that does not apply. Do not write a placeholder.
`change_record` is always `none` in this repo.

`do_not` carries two things: work someone ruled out, and traps that break a page.
Measured: with the traps in this block a model recalled four of them when planning
a run; with the same facts in prose it recalled one, and invented a parameter that
does not exist. Anything a later session must not do belongs here, not in a Status
entry.

Every ticket carries this block, including a research-only stream. -->

```yaml
next: {n: <item n>, do: "<the action, imperative, few words>", date: YYYY-MM-DD, owner: operator|claude}
change_record: none
sensitive_output: false | "<one line why, when true>"
work:
  - {n: 1, name: <kebab-slug>, state: blocked, owner: operator|claude,
     pages: [<path/to/tool.html>],               # the files this item touches
     waiting_on: "<the person who owes the answer>",
     blocker: "<what is actually missing>",
     needs: [<item n>],                          # items that must finish first
     verify: "<what proves the item is done - a browser check, a harness run>"}
  - {n: 2, name: <kebab-slug>, state: scheduled, on: YYYY-MM-DD, owner: operator}
  - {n: 3, name: <kebab-slug>, state: done, date: YYYY-MM-DD, owner: claude,
     note: "<what the answer turned out to be>"}
do_not:
  - {what: "<the action nobody should take>", why: "<what it breaks, or who ruled it out and when>"}
```

## Goal

<What "done" means for this work-stream, in 1-3 sentences.>
— target close: YYYY-MM-DD

## Status
<!-- Newest first. Keep the five most recent entries. Older entries move to
`tickets/history/<id>-history.md`, get linked from `retros:` in the frontmatter,
and leave a one-line pointer here so a session can still find them.

Before trimming, check that no durable fact lives only in the entries you are
about to move. A work item state, a decision, a trap, a constraint - lift it into
the Tracker (`work:` or `do_not:`) first. Prose you delete is gone from the ticket. -->

- YYYY-MM-DD — <what moved; root cause / decision / what's left>

## Verification

<!-- This repo ships static pages straight to oldweb.tech, so the browser IS the
test suite. Name what was actually checked and what was not. A DOM-stub harness
or a `node --check` pass is a static check, not a browser test - say so.

The repo CLAUDE.md sets the bar: keyboard tab order, screen-reader announcements,
skip-link, focus indicators, ARIA attributes, Chrome/Firefox/Safari, offline
after first load, and the tool's entry in the navigation dropdown. -->

- Browser: <which browsers, which modes, or "not tested">
- Accessibility: <what was checked, or "not tested">
- Navigation and sitemap: <updated? verified?>

## Notes / context

<Anything a resuming human or Claude needs that isn't in a linked retro.>
