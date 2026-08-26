---
room: Writer Canvas
human_activity: working — a writer inside one work, at the table, developing the draft in front of them
surfaces:
  - app/writers-studio/canvas/page.tsx
  - app/writers-studio/canvas/Worktable.tsx
  - app/writers-studio/canvas/StructureRail.tsx
  - app/writers-studio/canvas/WorkDrawer.tsx
  - app/writers-studio/canvas/MaterialsDrawer.tsx
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE — rooms come from human activity, not data models
  - INHABITABLE_ARCHITECTURE warehouse test — a surface showing all capabilities at once has failed
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — authority moves upward only, through authored experience
  - MAIA_OATH — no guru stance; the room reflects the writer's own acts, it does not direct the work
  - WORK_STRUCTURE_DESIGN — shape is revealed by the creator's acts and spoken in the creator's words;
    no auto-outline, no structure detection over the draft, no inferred hierarchy, no progress framing
  - WORK_STRUCTURE persona walk S1 — the rail names what it is a map OF (the expression, never the Work)
  - STUDIO_COPY_VOICE — describe what the person can do, not what the Studio is
  - WRITER_CANVAS_AND_PRESS_EDITOR_DIVISION — the Canvas is where the draft is developed; the Press
    Editor is where it is prepared for publication
reference_surfaces:
  - docs/design/author-studio/WRITER_CANVAS_EXPERIENCE_CONTRACT_DRAFT_2026-08-14.md
  - docs/design/author-studio/WRITER_CANVAS_ROOM_MAP_2026-08-05.md
  - docs/design/author-studio/WRITER_CANVAS_V01_IMPLEMENTATION_BOUNDARY_2026-08-05.md
  - docs/design/author-studio/WORK_STRUCTURE_DESIGN_2026-08-05.md
  - docs/design/author-studio/WORK_STRUCTURE_PERSONA_PAPER_WALK_2026-08-05.md
  - docs/design/author-studio/WRITER_CANVAS_WORKING_ON_ONE_PART_2026-08-24.md
  - docs/design/contracts/studio-home.md
shared_with_house: the Press palette and serif the writer crosses in from Studio Home · gesture
  language in human verbs · provenance voice — every fact shown is a member-authored fact or an
  observable one, never an inference · folded-by-default drawers, so capability is reachable without
  being displayed all at once
distinct_to_room: this is the only room whose subject is one work in motion. Its centre is the
  writing field and nothing may displace it — drawers fold, MAIA's presence folds, and the largest
  thing on screen is always the draft. It is also the only room that can narrow what it shows
  without narrowing what it holds: the frame may close around a single carried part while autosave,
  versioning and every persistence guarantee continue to operate on the whole manuscript.
screenshot_desktop: docs/design/contracts/screenshots/writer-canvas-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/writer-canvas-mobile.png
experience_verification: SYNTHETIC COMPONENT RENDER, 2026-08-24 — NOT an authenticated member walk,
  and must never be recorded as one. The real route (/writers-studio/canvas) was rendered in Chromium
  at 1280x900 and 375x812 (deviceScaleFactor 2) against a dev server with every /api/sovereign/*
  response replaced by synthetic fixtures at the network layer; the page gate was passed via the
  middleware's existing Capacitor client-side-auth path, using a WKWebView user agent, purely so the
  client could render. No member credential was presented, no member data was read, and no database
  was reachable during the render. Fixtures were deliberately unflattering — a book of 17 carried
  parts including front matter, one chapter whose heading was rewritten in the draft so the drift
  notice is visible rather than staged away, and a phrase repeated across parts so the find results
  look as monotonous as real search results often do. WHAT THIS ESTABLISHES: the rail renders the
  carried parts as doors and scrolls within a fixed-height room; opening a part frames the field on
  that part alone and the frame line names it; a part whose heading is no longer in the draft appears
  under "Not found in the draft" rather than vanishing; find reports matches with their part and the
  matched phrase highlighted in context; the layout holds at both widths. WHAT IT DOES NOT ESTABLISH,
  all still OWED - member authentication; real data binding to manuscript_sections; that autosave
  persists a framed edit correctly against a live draft route (covered by unit tests over the pure
  splice, NOT by this render); behaviour at true manuscript scale under a real member's draft;
  conflict and exit-guard behaviour while framed; that a member reads the drift notice as intended.
  The green "Audio enabled" toast in these renders is a global app element unrelated to this room; it
  was left in frame rather than hidden, because hiding it would make the screenshot a staged image
  rather than a render of the page. A third render,
  docs/design/contracts/screenshots/writer-canvas-find-desktop.png, shows find open with results.
deviation: this contract is authored AFTER the room it governs, and against a draft
  (WRITER_CANVAS_EXPERIENCE_CONTRACT_DRAFT_2026-08-14.md) written before the Structure rail and
  framed writing existed. It therefore covers surfaces whose design authority is the Structure design
  and its persona walk rather than that draft, and it records a synthetic render where a member walk
  is owed.
authority: the design canon gate itself (docs/design/contracts/README.md), which requires a contract
  for any member-facing surface a change touches; and the precedent set by
  docs/design/contracts/studio-home.md, which established BOTH that a synthetic component render may
  stand in for a walk that neither party can produce, AND that it must be labelled as one in the same
  breath. No ruling is claimed beyond those two.
---

# Writer Canvas — Experience Contract

**The authored text of the room's design is
`docs/design/author-studio/WRITER_CANVAS_EXPERIENCE_CONTRACT_DRAFT_2026-08-14.md`**, with the room
map at `WRITER_CANVAS_ROOM_MAP_2026-08-05.md` and the v0.1 boundary at
`WRITER_CANVAS_V01_IMPLEMENTATION_BOUNDARY_2026-08-05.md`. They are cited rather than copied so the
design record and the build cannot be confused.

## What this room is for

A writer inside one work, at the table. Not orienting — that is Studio Home, and its success is
measured by how fast the writer leaves it. Here the measure is the opposite: the room succeeds by
being somewhere a writer can stay.

## The room's shape

Three zones, none of which are named on the walls:

- **Study Wall** — a folded spine on the left: Work · Materials · Structure · History. One drawer
  open at a time. Structure appears only where structure exists.
- **Worktable** — the centre, always the largest thing. The draft, mid-motion.
- **Window** — MAIA's folded presence. In v0.1 it opens onto one honest sentence, because no
  reflection endpoint exists on this surface and a beautiful empty panel would be worse than a
  folded one.

## Working on one part

A carried part is a door. Opening it narrows the table's **frame** to that part; the frame line
names what is showing and offers the way back to the whole manuscript.

The rule that makes this safe is stated in the code and tested in
`app/writers-studio/canvas/__tests__/manuscriptMap.test.ts`: **the frame narrows, storage does not.**
A framed edit is spliced back into the whole draft before it reaches the saver, so ordered autosave,
idempotency, the version guard and the exit flush all operate on the same bytes they always did. A
kept version is a version of the book, never of the part on screen.

## What this room may not do

- **It may not detect structure.** The parts are the writer's own carried cuts. The rail locates
  their declared headings in the living text; it proposes nothing, fuzzy-matches nothing, and infers
  no hierarchy. See `WORK_STRUCTURE_DESIGN_2026-08-05.md` § *Refused now*.
- **It may not go quietly stale.** A part whose heading the writer has since rewritten is named under
  *"Not found in the draft"*, with their words unaffected and only the map changed. The system does
  not guess where it went.
- **It may not present the manuscript as the Work.** The rail's header names the expression
  (persona walk S1). A chapter list standing in for a Work is a collapse this room is built to
  refuse.
- **It may not score the work.** No "4 of 12 complete", no progress framing on parts. Pages are a
  fact about text; a plan the writer did not declare is not the system's to measure against.
