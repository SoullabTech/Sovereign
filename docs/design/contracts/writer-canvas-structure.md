---
room: Writer Canvas — Structure drawer
human_activity: writing — and, from the Study Wall, asking for another perspective on the shape of what has been written

# Explicit file, not a canvas/** glob: StructureReview.tsx in this same directory
# is the Structure Review room and has its own contract.
surfaces:
  - app/writers-studio/canvas/page.tsx
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
  voice — the drawer states an authored fact before it offers anything · the House rule that accent
  marks live state, never invitation
distinct_to_room: the Canvas is where the writer is writing, and it must stay that. The Structure
  drawer is a folded concern on the Study Wall, not a second review surface: it can ask for a
  reading and carry the member to one, but it never displays one. Three rooms, deliberately —
  Canvas (I am working on my book) · Structure drawer (I want another perspective on its shape) ·
  Structure Review (I am considering MAIA's reading). Collapsing the middle into either neighbour
  would make the Canvas a place where the machine talks about the Work while the Work is open.
screenshot_desktop: docs/design/contracts/screenshots/writers-studio-canvas-structure-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/writers-studio-canvas-structure-mobile.png
experience_verification: >-
  AUTHENTICATED WALK of the pushed implementation (242194a7f), 2026-09-01, Mac Studio. Real
  `maia_session` cookie, real Canvas route, real server, real structured-inference seam. Scratch
  database maia_ws2_02c_2r_mac_58ac95a77 holding a synthetic 14-section Work — no member's real
  Work was read. Desktop 1440x900 and mobile 390x844, deviceScaleFactor 2.
  ORDER AND HIERARCHY — the drawer reads: authored fact ("14 sections, carried in with your
  import") · direct access to the Work ("Read them in the Source") · a rule · then MAIA's optional
  interpretive offer. MAIA is visibly secondary to both the Work and the member's own access to it.
  Asserted programmatically, not by eye: the Source link precedes the invitation in document order
  at both widths. Accent appears only on live state — the active STRUCTURE tab and the drafting
  line — never on the invitation.
  RESPONSIVE — the same hierarchy survived at phone width; the action and the sovereignty sentence
  wrapped over two lines without clipping. documentElement.scrollWidth equalled innerWidth at both
  widths, so nothing forced horizontal scrolling.
  INTERACTION — one member gesture produced exactly one POST to /structure/read. While pending the
  action read "MAIA is reading…", was disabled, and carried aria-busy="true"; three further clicks
  during that window produced no second request. The sovereignty sentence stayed visible while the
  reading ran. Completion navigated to the server-returned reviewPath —
  /writers-studio/review?m=…&p=b048f603 — with no intervening "view the reading" step.
  THE READING WAS REAL — proposal b048f603 was frozen unadopted with reader provenance
  claude-opus-5 / REAL-STRUCTURE-READER-01, and MAIA returned form "none": she found no stable
  larger structure in filler prose. That is a finding about the Work, not a fault, and the surface
  reports it as a reading rather than as an error.
  WORK UNCHANGED — before and after: manuscript_structure_units 0 rows, source sections 14, draft
  sections 14. The reading added a proposal and touched nothing authored.
  FIXTURE NOTE — sectionCount in this room counts manuscript_sections (imported source), while the
  reading operates on manuscript_draft_sections. A fixture carrying only the latter renders no
  Structure tab at all. The witness substrate for this surface is 14 source sections linked to 14
  draft sections; anything less does not exercise the drawer.
  NOT ESTABLISHED, OWED — the failure state was NOT witnessed visually. No safe way existed to
  induce a genuine model or transport failure without modifying product code, and none was
  simulated. Its path is covered by the route's 502 branch and the client's catch; a visual witness
  of "MAIA couldn't complete the reading. Your work hasn't changed." remains outstanding. Also
  owed: a real member on a real device, and a Work whose prose is not filler.
---

# Writer Canvas — Structure drawer Experience Contract

## What this room offers

```text
STRUCTURE

14 sections, carried in with your import.
Read them in the Source
────────────────────────────────────────
Ask MAIA to read the structure
MAIA will bring back a reading of how the work
seems to be organized. Nothing changes until you decide.
```

The order is the argument. The member's authored fact comes first, their own direct access to the
Work second, and only then — below a rule — an optional interpretive act. A reading is something
the writer may want; it is never the reason the drawer exists.

## Why the copy is what it is

| Language | Why not the alternative |
|---|---|
| **Ask MAIA to read the structure** | Not "Read my structure" — a command to a generic tool, and it blurs whose reading it will be. Not "Analyze structure" — too mechanical for an interpretive act. |
| **Nothing changes until you decide.** | Said *before* the model runs, which is the only moment it can inform the decision to ask, and kept visible *while* it runs, which is when the member is most exposed. A boundary stated afterwards is a notification, not a choice. |
| **MAIA couldn't complete the reading. Your work hasn't changed.** | A failure is not a reading. "MAIA found no structure" is a fact about the book; "the reading did not happen" is a fact about the machine. No refusal code reaches the screen — a failed reading has no taxonomy that means anything about a book. |

## The gesture

One gesture, one arrival. There is no second "view the reading" button after success — asking
already expressed the intent, and arriving at the reading completes that act. On failure the member
stays in the drawer: no proposal card, no invented interpretation, no redirect.

The drawer appears only where `sectionCount > 1`. Structure exists only where structure exists, and
a single-section draft is never offered a reading of divisions it does not have.

## What the drawer must never become

It must not render a reading. The moment this drawer draws units, alternatives, or MAIA's account,
there are two structure surfaces drawn from different payloads, and they will eventually disagree.
