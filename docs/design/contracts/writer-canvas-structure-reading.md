---
room: Writer Canvas — Structure drawer
human_activity: writing — and, from the Study Wall, asking for another perspective on the shape of what has been written

# Explicit files, not a canvas/** glob: StructureReview.tsx in this same
# directory is the Structure Review room and is governed by its own contract.
surfaces:
  - app/writers-studio/canvas/page.tsx
  - app/writers-studio/canvas/StructureReadingGesture.tsx
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE — rooms come from human activity, not data models
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — authority moves upward only, through authored experience
  - MAIA_OATH — no guru stance; reflection, never authority
  - MAIA_SOVEREIGNTY_INVARIANTS — the member's agency outweighs the system's momentum
  - STUDIO_COPY_VOICE — describe what the person can do, not what the Studio is
  - SOULLAB_THEME §3 — accent is never decorative
reference_surfaces:
  - docs/design/author-studio/WRITER_CANVAS_V01_IMPLEMENTATION_BOUNDARY_2026-08-05.md
  - docs/design/contracts/structure-review.md
  - docs/design/contracts/studio-home.md
shared_with_house: the Press palette and serif · gesture language in human verbs · provenance
  voice — the drawer states an authored fact ("14 sections, carried in with your import") before it
  offers anything · the House rule that accent marks live state, not invitation
distinct_to_room: the Canvas is where the writer is writing, and it must stay that. The Structure
  drawer is a folded concern on the Study Wall, not a second review surface: it can ask for a
  reading and can carry the member to one, but it never displays one. Three rooms, deliberately —
  Canvas (I am working on my book) · Structure drawer (I want another perspective on its shape) ·
  Structure Review (I am considering MAIA's reading). Collapsing the middle into either neighbour
  would make the Canvas a place where the machine talks about the Work while the Work is open.
screenshot_desktop: docs/design/contracts/screenshots/writers-studio-canvas-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/writers-studio-canvas-mobile.png
experience_verification: >-
  AUTHENTICATED WALK, 2026-09-01, Mac Studio, against a scratch database
  (maia_ws2_02c_2r_mac_58ac95a77) holding a synthetic 14-section Work — no member's real Work was
  read. Real `maia_session` cookie, real Canvas route, real server, real structured-inference seam.
  Desktop 1440x900 and mobile 390x844, deviceScaleFactor 2.
  DESKTOP — Structure remained a folded Canvas concern rather than becoming a second review
  surface. The reading invitation appeared beneath the authored section facts and above the Source
  link, exactly where the drawer's existing sentence had left room for it. MAIA's action was
  visually secondary to the Work.
  MOBILE — the same hierarchy survived at phone width. The action and the sovereignty sentence
  wrapped over two lines without clipping; documentElement.scrollWidth equalled innerWidth at both
  widths, so nothing forced horizontal scrolling.
  INTERACTION — the member initiated one reading. While pending the action changed to "MAIA is
  reading…" and became disabled; two further clicks during that window produced no second request
  (exactly one POST to /structure/read was observed). Successful completion navigated directly to
  the server-returned Structure Review path, with no intervening "view the reading" step. The
  reading was real: proposal ed5fbc48 was frozen with reader provenance claude-opus-5 /
  REAL-STRUCTURE-READER-01, and MAIA returned form "none" — she found no stable larger structure in
  filler prose, which is a finding about the Work and not a fault.
  WORK UNCHANGED — manuscript_structure_units remained 0 rows; source sections 14 and draft
  sections 14, both unchanged, before and after.
  CORRECTED DURING THE WALK — the first render drew the invitation in PRESS.accent, which made
  MAIA's offer the brightest element in the drawer, above the member's own authored section count.
  The accent was removed rather than the observation softened; accent in this room now remains only
  on live state (the active tab, the drafting line).
  NOT ESTABLISHED, OWED — the failure state was not witnessed visually. No safe way to induce a
  genuine model or transport failure existed without modifying product code, and none was
  simulated. Its code path is covered by the route's 502 branch and the client's catch; a visual
  witness of "MAIA couldn't complete the reading. Your work hasn't changed." remains outstanding.
  Also owed: a real member on a real device, and a Work whose prose is not filler.
---

# Writer Canvas — Structure drawer Experience Contract

## What this room offers

One invitation, and no more than one:

```text
STRUCTURE

14 sections, carried in with your import.

Ask MAIA to read the structure
MAIA will bring back a reading of how the work
seems to be organized. Nothing changes until you decide.

Read them in the Source
```

## Why the copy is what it is

| Language | Why not the alternative |
|---|---|
| **Ask MAIA to read the structure** | Not "Read my structure" — that is a command to a generic tool and blurs whose reading it will be. Not "Analyze structure" — too mechanical for an interpretive reading. |
| **Nothing changes until you decide.** | Said *before* the model runs, which is the only moment it can inform the decision to ask. A sovereignty boundary stated afterwards is a notification, not a choice. |
| **MAIA couldn't complete the reading. Your work hasn't changed.** | A failure is not a reading. "MAIA found no structure" is a fact about the book; "the reading did not happen" is a fact about the machine, and the surface must never let the second dress as the first. |

## The gesture

One gesture, one arrival. There is no second "view the reading" button after success — asking
already expressed the intent, and arriving at the reading completes that act. On failure the member
stays in the drawer: no proposal card, no invented interpretation, no redirect.

## What the drawer must never become

It must not render a reading. The moment this drawer draws units, alternatives, or MAIA's account,
there are two structure surfaces drawn from different payloads, and they will eventually disagree.
