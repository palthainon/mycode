Here's the detailed build plan:
Good, a few days opens this up nicely. The postmortem timeline builder is a great pick — it's visual, genuinely useful, and the kind of tool that gets passed around teams.

A paste input area at the top
Vertical timeline feed with mock events
Each event showing severity, assignee, tags, and contributing factors
Click-to-edit on events
Placeholder export buttons
\A: An exportable file (PDF, PNG, Markdown)2:02 PMGood, that shapes things a lot. An incident commander wants speed — they're likely doing this under pressure or right after a stressful event, so the UI needs to be fast and low-friction.


---

## Postmortem Timeline Builder — Full Build Plan

### Pre-Work (Before Writing Code)

**Environment Discovery** — Have the developer audit the existing repo/environment before assuming anything:
- Check `package.json` for existing dependencies (timeline libs, PDF libs, testing setup)
- Check if a design system or component library is already in use (shadcn, MUI, Chakra, etc.)
- Check for an existing API key management pattern (`.env.local`, Vault, secrets manager)
- Check for existing fetch/axios patterns and error handling conventions
- Check for TypeScript config — if `tsconfig.json` exists, build in TS from the start
- Check for existing linting/formatting rules (ESLint, Prettier configs)

---

## Day 1 — UI Shell & Mock Data

### Step 1: Project Scaffold

- Initialize Next.js project if greenfield: `npx create-next-app@latest postmortem-timeline`
- Select: TypeScript yes, Tailwind yes, App Router yes
- If dropping into existing project, confirm routing convention (App Router vs Pages Router) before creating any files
- Create folder structure:
```
/app
  /page.tsx              ← main entry
  /api
    /parse/route.ts      ← Day 2
/components
  /timeline
    TimelineFeed.tsx
    TimelineEvent.tsx
    EventEditor.tsx
  /intake
    PasteInput.tsx
  /export
    ExportBar.tsx
/lib
  /mock-data.ts
  /types.ts
  /claude.ts             ← Day 2
/hooks
  useTimeline.ts
```

---

### Step 2: Define the Core Data Types

Create `/lib/types.ts` first. Everything else depends on this.

```typescript
export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type Tag = "detection" | "mitigation" | "resolution" | "escalation" | "communication";

export interface TimelineEvent {
  id: string;
  timestamp: string;          // ISO 8601 preferred, display-formatted for UI
  description: string;
  severity: Severity;
  assignee: string;
  tags: Tag[];
  contributingFactors: string;
  isAmbiguous?: boolean;      // flag for events Claude wasn't confident about
}

export interface ParsedTimeline {
  incidentTitle: string;
  events: TimelineEvent[];
  rawInput: string;
}
```

---

### Step 3: Mock Data

Create `/lib/mock-data.ts` with 6–8 realistic events covering the full range of severities and tags. Make sure at least one event has `isAmbiguous: true` so the UI warning state gets built and tested on Day 1. Include at least one event with an empty `contributingFactors` so that empty state is also handled.

---

### Step 4: Build `useTimeline` Hook

Create `/hooks/useTimeline.ts`. This is the single source of truth for timeline state. Keep all event mutation logic here — components should never mutate events directly.

The hook should expose:
- `events` — current event array
- `updateEvent(id, patch)` — partial update a single event
- `deleteEvent(id)`
- `reorderEvent(id, direction)` — up/down manual reorder
- `loadEvents(events[])` — called after Claude parse returns
- `resetTimeline()`

Use `useReducer` internally rather than multiple `useState` calls — it'll be easier to extend on Day 2 when parse results come in.

---

### Step 5: Build `PasteInput` Component

Simple textarea with a prominent "Parse Incident" button. On Day 1 this button just loads mock data — the real API call gets wired on Day 2.

Important UX details to build now so they don't get skipped:
- Character count or line count indicator
- Clear/reset button
- Loading state (disabled textarea + spinner on button) — wire to a `isLoading` prop even though it won't do anything yet
- Placeholder text should show a realistic example of what to paste (a few lines of Slack-style log text)

---

### Step 6: Build `TimelineEvent` Component

This is the most complex UI component. Build it in two modes controlled by an `isEditing` boolean:

**View mode:**
- Timestamp displayed prominently
- Description as the main body text
- Severity shown as a colored left border or badge
- Tags as small inline chips
- Assignee with a subtle label
- Contributing factors in a visually distinct callout box (only shown if non-empty)
- Ambiguity warning if `isAmbiguous: true` — something visible like a yellow flag icon with tooltip "Claude was uncertain about this event — please review"
- Click anywhere on the card to enter edit mode

**Edit mode:**
- All fields become inputs in-place (no modal)
- Severity as a select/dropdown
- Tags as a multi-select or toggle chips
- Save/Cancel buttons
- Auto-save on blur is an option but confirm with the team — some editors prefer explicit save

---

### Step 7: Build `TimelineFeed` Component

Renders the vertical list of `TimelineEvent` components. Responsibilities:
- Renders the connecting vertical line between events
- Handles empty state (no events yet — show instructional copy)
- Passes `updateEvent` and `deleteEvent` down from the hook
- For now, skip drag-to-reorder — use simple up/down arrow buttons on each card to keep Day 1 scope tight

---

### Step 8: Build `ExportBar` Component

A fixed or sticky bar with three export buttons: PDF, PNG, Markdown. On Day 1 all three are rendered but disabled or show a "coming Day 3" tooltip. Build the visual layout now so there are no surprises when wiring it up later.

Also include an incident title input field here — the title will be needed for all three export formats.

---

### Step 9: Wire Page Together

In `/app/page.tsx`, compose all components using the `useTimeline` hook. By end of Day 1 the full UI should render mock data, editing should work end-to-end, and the layout should be production-quality.

**Day 1 done when:** A developer can paste nothing, click "Parse Incident", see mock events render, click an event, edit every field, save it, and see the update reflected — all without errors.

---

## Day 2 — Claude Parsing API Route

### Step 1: Environment Setup

- Add `ANTHROPIC_API_KEY` to `.env.local`
- Check how the existing project handles env vars — if there's a secrets pattern already in use, follow it rather than introducing a new one
- Install Anthropic SDK: `npm install @anthropic-ai/sdk`
- **Developer research note:** Check the current Anthropic SDK docs and the project's existing API route patterns before writing the route. The SDK interface and Next.js App Router conventions for streaming vs non-streaming responses may have evolved — don't assume the pattern from memory.

---

### Step 2: Design the Claude Prompt

This is the highest-risk step of the entire project. Budget significant time here.

The prompt should:
- Instruct Claude to return **only valid JSON** — no preamble, no markdown fences
- Define the exact output schema (mirror `TimelineEvent` from `/lib/types.ts`)
- Instruct Claude to set `isAmbiguous: true` on any event where the timestamp was guessed, inferred, or missing
- Handle relative times ("10 minutes later") by resolving them against the nearest absolute timestamp
- Instruct Claude to use `null` for fields it cannot determine rather than guessing
- Set tone: "You are parsing raw incident notes for a postmortem. Extract discrete events in chronological order."

Build a `/lib/prompts.ts` file so the prompt lives separately from the route logic and can be iterated without touching infrastructure code.

**Developer research note:** Test the prompt directly in the Claude.ai interface or via the API playground before wiring it into the route. Iteration in the UI is much faster than deploy cycles. Test with at least three realistic messy inputs: a clean Slack export, a freeform narrative paragraph, and a mixed format with some timestamps missing.

---

### Step 3: Build the API Route

Create `/app/api/parse/route.ts`.

Responsibilities:
- Accept POST with `{ rawText: string }`
- Validate input — reject empty strings, enforce a max character limit (suggest 10,000 chars to start)
- Call Claude with the structured prompt + raw text
- Parse the JSON response — wrap in try/catch because malformed JSON from the model is a real failure mode
- Return `{ events: TimelineEvent[] }` or a structured error response
- Never expose the raw Claude error to the client — log server-side, return a safe generic message

Error states to handle explicitly:
- Claude returns invalid JSON → return 422 with message "Parsing failed — try rephrasing your input"
- Claude API is down or rate limited → return 503
- Input too long → return 400
- Empty events array returned → return 200 but with a flag so the UI can show a "nothing found" message rather than an empty timeline

---

### Step 4: Wire Parse to `PasteInput`

Replace the mock data load in `PasteInput` with a real fetch call to `/api/parse`. On success, call `loadEvents()` from the `useTimeline` hook. 

Handle loading state (already built in Day 1), error state (show the error message returned from the API inline below the textarea), and the ambiguous event warnings (already built in Day 1 — they'll now light up for real).

---

### Step 5: Integration Testing

Test the full paste → parse → render loop with at least:
- A clean structured log (easy case)
- A Slack thread export (moderate — names, reactions, threads to ignore)
- A pure freeform narrative with no timestamps (hard case)
- An intentionally empty or junk input (error case)

**Day 2 done when:** A real paste of incident notes produces a rendered, editable timeline without errors across all four test cases.

---

## Day 3 — Export & Polish

### Step 1: Markdown Export

Start here — it's the simplest and de-risks the export pattern before tackling PDF/PNG.

Create `/lib/exporters/toMarkdown.ts`. It takes a `ParsedTimeline` and returns a markdown string. Format suggestion:

```
# Incident Postmortem: [Title]

## Timeline

### 09:12 — Critical
**Description:** Automated alert fired...
**Assignee:** SRE On-Call
**Tags:** detection
**Contributing Factors:** Threshold not tuned after traffic growth.
```

Trigger a browser download using a Blob + anchor click pattern. No libraries needed.

---

### Step 2: PNG Export

**Developer research note:** Before implementing, check what version of `html2canvas` or its modern alternatives (like `dom-to-image-more`) are current and stable. This library space has had breaking changes and maintenance issues — verify the best option at build time.

The approach:
- Target the `TimelineFeed` component's DOM node via a `ref`
- Temporarily apply a fixed width and white/dark background before capture (the rendered output in the browser may have transparent or viewport-relative sizing that breaks offscreen capture)
- Capture, then trigger download as `.png`
- Restore original styles after capture

Gotchas to handle:
- Custom fonts may not render in canvas — test early, may need to embed font as base64 or use a web-safe fallback for the export
- If the timeline is very long, the canvas may hit browser memory limits — consider paginating long timelines across multiple PNGs

---

### Step 3: PDF Export

**Developer research note:** Check the current state of `jsPDF` and `@react-pdf/renderer` before choosing an approach. `@react-pdf/renderer` gives better layout control but has a learning curve and its own component system. `jsPDF` with the PNG approach (render to canvas, embed image in PDF) is faster to implement but lower fidelity. Choose based on how much time remains on Day 3.

Whichever approach, the PDF should include:
- Incident title as a header
- Generation timestamp as a footer
- Page numbers if multi-page

---

### Step 4: UX Polish Pass

Go through the full user flow and address:
- All loading states have spinners or skeleton screens
- All error states have clear, actionable messages
- Empty states are instructional, not just blank
- The ambiguity warning is noticeable but not alarming
- Tab order and keyboard navigation work through the event editor
- The layout doesn't break on a 13" laptop screen (the most likely device for an incident commander)
- Test in Chrome and Firefox at minimum

---

### Step 5: Final Smoke Test

Run the complete flow end-to-end three times with different inputs. Export all three formats from each. Verify downloads open correctly. Deploy to Vercel.

**Day 3 done when:** A real incident note can be pasted, parsed, edited, and exported to all three formats without errors.

---

## Out of Scope (Document for V2)

- Shareable URLs / persistence
- Authentication
- Collaboration / multi-user
- Importing from PagerDuty, Slack, or OpsGenie APIs directly
- Custom severity levels or tag taxonomies

---

Want me to now generate the designer/developer prompt you can hand off to kick this off?