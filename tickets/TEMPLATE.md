---
id: YYYY-MM-DD-<slug>     # stable handle; matches the filename (no .md)
title: <one-line work-stream title>
project:                 # optional: repo sub-area this stream touches
status: active           # active | blocked | done
todoist_parent:          # Todoist parent task id — the durable handle, reused across sessions
todoist_project:         # the Todoist project the parent lives in
retros: []               # paths to any retro/changelog docs this stream produced
opened: YYYY-MM-DD
closed:                  # set when status -> done
---

## Goal

<What "done" means for this work-stream, in 1-3 sentences.>

## Status (latest first)

- YYYY-MM-DD — <what moved; root cause / decision / what's left>

## Open follow-ups

- [ ] <pending item> (Todoist <subtask-id>)

## Notes / context

<Anything a resuming human or Claude needs that isn't in a linked retro.>
