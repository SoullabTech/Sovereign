---
room: Cabin Destination Membranes
human_activity: entering a chosen room from Cabin, remaining in that room's own experience, and returning to Cabin only when I choose
surfaces:
  - app/writers-studio/full-redesign/Shell.tsx
  - app/relationships/page.tsx
  - app/relationships/[id]/page.tsx
  - app/maia/anchor/history/page.tsx
  - app/maia/anchor/page.tsx
change_class: experiential
principles:
  - DESTINATION_LOCAL_AUTHORITY — each room remains authoritative for its own content, state, permissions, and meaning
  - EXPLICIT_RETURN — Cabin return is a member gesture, never an automatic redirect or browser-history dependency
  - ORIGIN_WITHOUT_AUTHORITY — from=cabin is navigation provenance only
  - ORIGIN_PROPAGATION — explicit Cabin origin survives destination-local navigation when needed to preserve the return locus
  - NO_SEMANTIC_CARRY — Cabin origin never selects or recalls a domain object
  - MAIA_AS_THRESHOLD — entering MAIA from Cabin does not itself create cognition
  - ROOM_CONTINUITY — a Cabin crossing adds only a return membrane; it does not turn the destination into a Cabin sub-room
  - MOBILE_PARITY — the return membrane must not introduce horizontal overflow or collapse the destination's own hierarchy
reference_surfaces:
  - docs/design/contracts/cabin-doorway-crossing.md
  - docs/design/contracts/house-continuity-thresholds.md
  - docs/design/contracts/house-return.md
  - docs/design/contracts/studio-home.md
  - app/writers-studio/full-redesign/Shell.tsx
  - app/relationships/page.tsx
  - app/maia/anchor/page.tsx
shared_with_house: readable threshold language, explicit return, room identity, member choice, and refusal to turn navigation into hidden semantic state
distinct_to_room: the receiving room keeps its own visual material, navigation, content authority, and work semantics. Cabin contributes only a quiet source-aware return membrane.
screenshot_desktop: docs/design/contracts/screenshots/cabin-h4-4-writers-studio-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/cabin-h4-4-writers-studio-mobile.png
experience_verification: >-
  2026-10-01 local offline runtime witness on port 3692. Entered
  /writers-studio?from=cabin, /relationships?from=cabin,
  /maia/anchor/history?from=cabin, and /maia/anchor?from=cabin.
  All four routes returned HTTP 200. After hydration, Writer's Studio exposed
  an explicit Return to Cabin link; Relationships exposed Back to Cabin;
  Anchor history exposed Return to Cabin; and Daily Anchor exposed
  Return to Cabin. Relationships detail was also exercised through its
  source-aware path and preserved the Cabin return locus. Desktop witness:
  1440px wide with no horizontal overflow. Mobile witness: Relationships,
  Anchor history, and Daily Anchor all measured scrollWidth=390 at a 390px
  viewport. Writer's Studio initially measured 431px on mobile because the
  existing horizontal studio nav had no bounded overflow; H4.4 repaired that
  nav to scroll within its available width, then the witness measured
  scrollWidth=390. Non-Cabin paths remain separate: House-origin return
  behavior continues to use the existing House destination. No Cabin context
  refresh, object selection, memory recall, relationship interpretation, or
  MAIA cognition was triggered by the crossing.
---

# Cabin Destination Membranes — Experience Contract

## Law

> **Cabin opens the room. The room becomes itself.**

The Cabin origin marker tells the destination only that the member arrived from
Cabin and may want a deliberate way back.

It does not carry:

- Work identity;
- manuscript identity;
- relationship identity;
- memory identity;
- member identity;
- session identity;
- memory content;
- relationship interpretation;
- MAIA prompt;
- generated meaning.

## Destination-specific membrane

### Writer's Studio

The Studio adds a quiet Return to Cabin link when the member arrived with
from=cabin.

The Work, manuscript, mode, and Studio navigation remain Studio-owned.

The Cabin return does not choose a Work.

The Studio's mobile product bar remains bounded to its viewport. The navigation
may scroll internally; it may not widen the document.

### Relationships

The field and relationship detail both recognize Cabin origin.

The list propagates from=cabin when the member opens a relationship or creates
one from the Cabin-origin field.

The detail room returns directly to /cabin when the member chooses its return
gesture.

Without from=cabin, ordinary Relationships behavior remains unchanged.

### Memory / Daily Anchor

Anchor history recognizes Cabin origin and preserves it when opening today's
Anchor.

Daily Anchor recognizes Cabin origin, offers Return to Cabin, and preserves the
Cabin origin when opening Earlier Anchors.

No memory is surfaced merely because the member arrived from Cabin.

### MAIA

The MAIA Anchor recognizes Cabin origin as a return membrane only.

It does not create a cognition request because the origin is Cabin.

## Falsifiers

F1 — a destination selects a domain object because from=cabin is present.

F2 — Cabin origin grants access the destination would not otherwise grant.

F3 — a destination loses Cabin origin during local navigation before the member leaves.

F4 — Return to Cabin uses browser history or an arbitrary return URL.

F5 — a destination returns automatically merely because it came from Cabin.

F6 — MAIA speaks or generates cognition merely because the member entered through Cabin.

F7 — memory content or relationship interpretation appears merely because of Cabin origin.

F8 — Writer's Studio mobile navigation widens the document beyond the viewport.

F9 — ordinary non-Cabin destination behavior changes.

F10 — any receiving room refreshes, remounts, downloads, or synchronizes Cabin context.

## Acceptance

H4.4 is accepted when:

1. each receiving surface recognizes Cabin origin correctly;
2. each receiving surface provides an explicit return to /cabin;
3. origin survives local destination navigation where needed;
4. ordinary non-Cabin behavior remains unchanged;
5. desktop and mobile witnesses show no membrane-induced layout regression;
6. focused tests and design-canon gates pass.

## Stop boundary

This contract does not add domain-specific semantic carry, memory recall,
relationship interpretation, MAIA cognition, synchronization, JARVIS authority,
or production deployment.

The next boundary is post-return continuity: proving that returning to
Cabin sees the same already-mounted field rather than silently reinitializing or
replacing it.
