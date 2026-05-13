# Pomodoro Timer - Project Plan

**Status:** ✅ Completed — shipped at `productivity/pomodoro.html`. Productivity category added to top-level nav.

## Overview

A customizable Pomodoro timer with circular countdown display, mobile ready, browser notifications, pleasant audio alerts, and optional task tracking. This will be the first tool under a new **Productivity** top-level navigation section.

## Features

### Core Timer
- **Work session**: 25 minutes (default, customizable)
- **Short break**: 5 minutes (default, customizable)
- **Long break**: 15 minutes after 4 work sessions (standard Pomodoro cycle)
- **Controls**: Start, Pause, Resume, Reset

### Display
- Circular countdown progress indicator (SVG-based)
- Time remaining displayed in center
- Current phase indicator (Work / Short Break / Long Break)
- Cycle progress (e.g., "Pomodoro 2 of 4")

### Notifications
- Browser Notification API with permission prompt on first use
- Pleasant, non-startling audio chime when timer completes
- Notifications trigger on phase transitions

### Task Tracking
- Optional task name input
- Default task label: "Focus"
- Task name persists until manually changed

### History & Persistence
- Completed sessions saved to localStorage
- History displayed on same page below timer
- Each entry includes: timestamp, duration, task name, phase type
- Simple stats: total pomodoros today, total focus time

### Settings
- Inline settings on the same page (no modals/drawers)
- Customizable durations for work/short break/long break
- Settings saved to localStorage

## Page Layout

```
+------------------------------------------+
|  [Productivity] > Pomodoro Timer         |
+------------------------------------------+
|                                          |
|         +------------------+             |
|         |                  |             |
|         |   CIRCULAR       |             |
|         |   COUNTDOWN      |             |
|         |    24:59         |             |
|         |                  |             |
|         +------------------+             |
|              Work Session                |
|            Pomodoro 2 of 4               |
|                                          |
|    [ Start ]  [ Pause ]  [ Reset ]       |
|                                          |
|    Task: [ Focus______________ ]         |
|                                          |
+------------------------------------------+
|  Settings                                |
|  Work: [25] min Break: [5] min           |
|  Long Break: [15] min                    |
+------------------------------------------+
|  Today's History                         |
|  - 10:30 AM  Focus (25 min)              |
|  - 11:00 AM  Focus (25 min)              |
|  Total: 2 pomodoros, 50 min focus time   |
+------------------------------------------+
```

## Implementation Steps

### 1. Navigation & Page Setup
- [x] Add "Productivity" to top-level navigation in `navigationv2.js`
- [x] Create `productivity/` directory
- [x] Create `pomodoro.html` page with base structure

### 2. Core Timer Logic
- [x] Implement countdown timer with work/break cycle management
- [x] Handle phase transitions (work → short break → work → ... → long break)
- [x] Pause, resume, reset functionality
- [x] Track current pomodoro count in cycle (1-4)

### 3. Circular Countdown UI
- [x] SVG-based circular progress ring
- [x] Animate progress smoothly
- [x] Display time remaining in center
- [x] Phase and cycle indicators

### 4. Notifications & Audio
- [x] Request browser notification permission
- [x] Trigger notifications on phase completion
- [x] Integrate pleasant chime audio file
- [x] Handle notification permission denied gracefully

### 5. Settings (Inline)
- [x] Duration inputs for work, short break, long break
- [x] Save/load settings from localStorage
- [x] Apply settings to timer

### 6. Task Tracking & History
- [x] Task name input with "Focus" default
- [x] Save completed sessions to localStorage
- [x] Display today's history below timer
- [x] Calculate and display daily stats

## Technical Notes

- Use existing `storage-utils.js` for localStorage operations
- Use existing `a11y-utils.js` and `a11y.css` for accessibility
- Follow patterns from existing tools (e.g., `nettools/`, `financials/`)
- Audio file should be lightweight (<50KB)

## Dependencies

- None external; vanilla HTML/CSS/JS
- Browser Notification API
- Web Audio API or HTML5 Audio for sound
