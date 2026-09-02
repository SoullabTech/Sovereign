---
room: Writer Canvas — the Worktable, and the Press manuscript page it hands off to
human_activity: writing — the writer working on their book, at the page

# Two surfaces, one change: the Worktable becomes section-native, and the older
# Press editor stops pretending it can write a draft it cannot.
surfaces:
  - app/writers-studio/canvas/Worktable.tsx
  - app/writers-studio/canvas/WritingSurface.tsx
  - app/press/manuscript/WorkingDraftEditor.tsx
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE — rooms come from human activity, not data models
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — authority moves upward only, through authored experience
  - MAIA_SOVEREIGNTY_INVARIANTS — the member's agency outweighs the system's momentum
  - MAIA_OATH — no guru stance; the system never decides what the writer meant
  - STUDIO_COPY_VOICE — describe what the person can do, not what the Studio is
  - SOULLAB_THEME §3 — accent is never decorative
reference_surfaces:
  - docs/programme/WS2-07-PREREQ_SAVE_CONTRACT_OPTIONS_2026-09-02.md
  - docs/programme/WS2-07-BUILD-07A_RECOVERABILITY_BOUNDARY_2026-09-02.md
  - docs/design/contracts/writer-canvas-structure.md
  - docs/design/contracts/studio-home.md
shared_with_house: the Press palette and serif · the one-page sheet · gesture language in human
  verbs · the House rule that accent marks live state, never invitation · save facts held in the
  margin until looked at
distinct_to_room: the Worktable is where the writer is writing, and the ONE thing that must not
  change is that it reads as a page. What changed is underneath it. A section-addressable draft is
  now held as real section nodes carrying the server's own identities, because a keystroke has to
  be able to name WHICH part of the book it landed in — authored structure and, later,
  developmental evidence both hang off those identities. ⛔ The rejected alternative is the one
  that would have been invisible: a single field plus a hidden offset ledger. The ledger becomes a
  second fallible claim about the same text, and when it is wrong a durable identity moves with no
  way to detect it at write time. Section-native is emphatically NOT permission to draw a card
  around every section — the nodes carry no border, no ground, no gap, no label. Boundaries also do
  not MOVE here: merging with a backspace or splitting with a return are topology commands this
  unit does not implement, so they do not happen rather than happening approximately.
  The Press manuscript page is the counterpart decision. It is one CodeMirror document with five
  contracts reading whole-draft offsets out of it, so it cannot be section-native without rewriting
  all five — and the shortcut that avoids that IS the offset ledger. Rather than accept keystrokes
  into a field whose every save the server will decline, it shows the words read-only and says
  where they are written. Unconverted drafts — every draft that existed before this — are untouched
  and still written there.
screenshot_desktop: docs/design/contracts/screenshots/ws2-07-writing-surface-section-native-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/ws2-07-writing-surface-section-native-mobile.png
experience_verification: >-
  AUTHENTICATED BROWSER WALK, 2026-09-02, by scripts/ws2-07-liveness-browser-witness.ts. Real
  `maia_session` cookie against a real auth_sessions row, real Canvas route, real Next server,
  real route handlers. Scratch PostgreSQL 16 built from the repository's own migration chain,
  holding one synthetic three-section fixture — no member's Work was read. Desktop 1440x900 and
  mobile 390x844, deviceScaleFactor 2. 32 checks, 0 failures.
  THE PAGE IS STILL ONE PAGE — asserted geometrically, not by eye. Three nodes at both widths; the
  largest gap between consecutive nodes measured 0.00px; every node reported border 0px, background
  rgba(0,0,0,0), zero margin and zero padding, one shared font stack, size and leading, and an
  identical measure and left edge (1256px desktop, 342px phone). documentElement.scrollWidth
  equalled clientWidth at both widths, so nothing forced horizontal scrolling. The capture shows a
  heading, an unheaded section, and the boundaries between them: nothing marks where one ends.
  THE ARCHITECTURE HOLDS UNDER A KEYSTROKE — the walk typed into the second section. Exactly one
  PUT was dispatched; its body carried `sections` with all three identities and did NOT carry
  `content`, which the server derives. After a full reload the added characters were in the second
  section and only there (221/230/116 against 221/185/116 before), and the boundaries were still
  invisible.
  WHAT THIS WALK DOES NOT COVER — the Press manuscript page's read-only state was not captured in a
  browser; it is exercised by the handler witness (a content-only save against a converted draft is
  refused typed, with zero writes) and read in the diff. Split, merge and move are not implemented
  in this unit and were not walked.
---

# Writer Canvas — the Worktable, section-native

The body of this contract is its frontmatter: the room, what it shares with the House, what is
distinct to it, and the walk that verified it. Nothing below is load-bearing.
