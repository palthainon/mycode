# Pomodoro Timer - Project Plan

## Overview

A customizable Pomodoro timer with circular countdown display, browser notifications, pleasant audio alerts, and optional task tracking. This will be the first tool under a new **Productivity** top-level navigation section.

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
|  Work: [25] min  Break: [5] min          |
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
- [ ] Add "Productivity" to top-level navigation in `navigationv2.js`
- [ ] Create `public_html/productivity/` directory
- [ ] Create `pomodoro.html` page with base structure

### 2. Core Timer Logic
- [ ] Implement countdown timer with work/break cycle management
- [ ] Handle phase transitions (work → short break → work → ... → long break)
- [ ] Pause, resume, reset functionality
- [ ] Track current pomodoro count in cycle (1-4)

### 3. Circular Countdown UI
- [ ] SVG-based circular progress ring
- [ ] Animate progress smoothly
- [ ] Display time remaining in center
- [ ] Phase and cycle indicators

### 4. Notifications & Audio
- [ ] Request browser notification permission
- [ ] Trigger notifications on phase completion
- [ ] Integrate pleasant chime audio file
- [ ] Handle notification permission denied gracefully

### 5. Settings (Inline)
- [ ] Duration inputs for work, short break, long break
- [ ] Save/load settings from localStorage
- [ ] Apply settings to timer

### 6. Task Tracking & History
- [ ] Task name input with "Focus" default
- [ ] Save completed sessions to localStorage
- [ ] Display today's history below timer
- [ ] Calculate and display daily stats

## Technical Notes

- Use existing `storage-utils.js` for localStorage operations
- Use existing `a11y-utils.js` and `a11y.css` for accessibility
- Follow patterns from existing tools (e.g., `nettools/`, `financials/`)
- Audio file should be lightweight (<50KB)

## Dependencies

- None external; vanilla HTML/CSS/JS
- Browser Notification API
- Web Audio API or HTML5 Audio for sound
