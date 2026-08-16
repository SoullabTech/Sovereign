---
room: Studio Home
human_activity: arriving — a writer entering their studio to orient and choose where to begin or continue
surfaces:
  - app/writers-studio/page.tsx
  - app/writers-studio/HomeView.tsx
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE — rooms come from human activity, not data models
  - INHABITABLE_ARCHITECTURE warehouse test — a surface showing all capabilities at once has failed
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — authority moves upward only, through authored experience
  - MAIA_OATH — no guru stance; reflection, never authority
  - STUDIO_COPY_VOICE — describe what the person can do, not what the Studio is
  - WRITER_CANVAS_AND_PRESS_EDITOR_DIVISION — the Work is the enduring centre; arrival returns to it
reference_surfaces:
  - docs/design/author-studio/STUDIO_HOME_EXPERIENCE_CONTRACT_DRAFT_2026-08-14.md
  - docs/design/author-studio/WITNESS_RECORD_STUDIO_HOME_THRESHOLD_2026-08-14.md
  - docs/design/author-studio/FOUNDER_STUDIO_HOME_WALK_VERDICT_2026-08-14.md
  - docs/design/contracts/journal-room.md
shared_with_house: House token layer and field hierarchy · gesture language in human verbs ·
  provenance voice — every fact shown is a member-authored fact or an observable one, never an
  inference · the Press palette and serif the member already crosses into the Manuscript Room with
distinct_to_room: this is the only room whose subject is the writer's whole practice rather than
  one work. It opens on the Work they last touched, not on a question or an inventory — arrival is
  continuation, and the single dominant action leaves this room immediately. Nothing here is a
  destination in itself; the room's success is measured by how quickly the writer stops being in it.
screenshot_desktop: docs/design/contracts/screenshots/writers-studio-home-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/writers-studio-home-mobile.png
experience_verification: SYNTHETIC COMPONENT RENDER, 2026-08-14 — NOT an authenticated member walk, and must never be recorded as one. The real HomeView component was rendered against synthetic fixtures at 1280x800 and 375x812 (deviceScaleFactor 2) via a temporary preview route since deleted, because neither party could produce a true walk — impersonating a member through the bare x-member-id path was refused (it passes the middleware route gate but getMemberIdFromRequest rejects it, so the page would render an empty room and be photographed as a walk), and the founder could not reach the dev port. Fixtures were deliberately unflattering — a titled book, a second book, an UNTITLED work, and a manuscript no work has claimed — so the awkward states are visible rather than staged. WHAT THIS ESTABLISHES: layout, hierarchy, typography, responsive composition, copy, and that the six NOT YET tiles, the three-card row, the giant New project tile and the duplicate import panel are gone. WHAT IT DOES NOT ESTABLISH, all still OWED: member authentication; real useLivingWorks data binding; that the most-recently-updated work is selected correctly from live data; that Continue writing resolves to the correct manuscript and loads the correct draft; persistence across reload and session; real mobile member behaviour. Criterion "Continue opens the Work" stands as STRUCTURALLY WIRED — behavioural witness owed. Criterion "mobile feels designed rather than compressed" is NOT CLAIMED; the mobile render is the same layout at a narrower width, which is correct but not yet designed. Founder visual review of these four renders was favourable ("this is looking good"); the authenticated walk remains outstanding and this contract is not evidence that it passed.
deviation: the implementation's primary action reads "Continue writing" and names the work, where
  this contract's Specified language column reads "Continue your work". Secondary actions read
  "Begin a new work" and "Import a manuscript" rather than "Begin something new" and "Bring
  something in".
authority: founder ruling 2026-08-14 — "a button named for an outcome must perform that outcome",
  and the prototype default that the action must name what will happen (Continue writing / Return to
  manuscript / Continue shaping), issued AFTER this contract was drafted. The draft's "Continue your
  work" is the exact generic label the founder's own walk verdict identified as a defect: "a
  continuation action must name the actual work and the actual place… a command without an object".
  The contract text is deliberately left UNCHANGED rather than edited to match the build; the later
  ruling supersedes that column and this field records it. Reconcile the draft's language table
  against the walk verdict in a separate governed act.
---

# Studio Home — Experience Contract

**The authored text of this contract is
`docs/design/author-studio/STUDIO_HOME_EXPERIENCE_CONTRACT_DRAFT_2026-08-14.md`**, written at
`baa9c7071` — before the implementation this contract now governs. It is cited rather than
copied so the design record and the build cannot be confused, and so no one can later mistake
a contract edited to fit the code for a contract the code was built to meet.

Read there: why this contract exists (the Writer Canvas contract claimed this surface while
describing a different room), the door rule, what the room reveals by state, what persists, the
amended orientation provenance rule, and the known deviations at drafting time.

## What this room is for

A writer entering their studio. Not inside any one work — in the whole place, orienting, and
choosing where to begin or continue. The room's own success measure is unusual and worth
stating plainly: **it is judged by how quickly the writer stops being in it.**

## Arrival

> **Your studio, with your work in it.**

The room opens on the work the writer last touched, named, with one dominant action that leaves
this room. Their other works sit beneath it. Beginning and importing are present and plainly
secondary. When no work exists, there are exactly two paths and no continuation is offered —
`Continue` appears only when there is something real to continue.

## The door rule, as built

> A control using threshold language must produce a perceptible threshold action.

Every visible action navigates or mutates:

| Control | Performs |
|---|---|
| Continue writing | opens `/writers-studio/canvas?id=<manuscript>` |
| A work in the list | the same, for that work |
| Begin a new work | creates the work, then lands **inside** the Canvas |
| Import a manuscript | opens `/press/manuscript?import=1` |

**Nothing scrolls in place while wearing a door's language.** That was the failure this room
was rebuilt to end.

## The honest limit, carried in the code

There is no last-location substrate — nothing records which room the writer left from or where
the cursor was. So the action says *Continue writing* and opens the Canvas, which is true, and
the supporting line carries only observable facts: the form the member declared, the page
count, when it was last edited. **It does not say "you were last in Chapter 7."** Naming a
location the system cannot source would be the invented authority the walk failed. When that
substrate exists, this action becomes *Return to manuscript* / *Continue shaping* per the
founder's default.

Writing that no work has claimed appears inside *Your works*, described as **ready to become a
work** — an invitation the writer can act on. The earlier phrasing, *not yet part of a work*,
was corrected on founder review as database truth rather than writer truth: this surface must
not teach members the Studio's ontology, since being made to learn the architecture before
being allowed to work is precisely what failed here.

## The two brand tests

**Same house?** Yes — Press palette and serif, human-verb gestures, provenance voice, and the
same restraint about what may be asserted.

**Distinct room?** Yes. Journal opens on a question; the Canvas opens on the member's own
unfinished sentence. This room opens on **a name and one way out of it.**
