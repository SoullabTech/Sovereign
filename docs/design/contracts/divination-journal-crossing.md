---
room: Divination → Journal Crossing
human_activity: writing in my own words while keeping a saved symbolic reading visibly in view and returnable
surfaces:
  - app/oracle/reflections/page.tsx
  - app/journal/page.tsx
  - components/journal/room/WritingSurface.tsx
  - components/journal/room/EntryReader.tsx
  - components/house/SymbolicCarryNotice.tsx
  - components/house/FacetOriginTrail.tsx
  - app/api/house/carry-source/route.ts
  - app/api/house/crossings/route.ts
  - app/api/journal/quick/list/route.ts
change_class: experiential
principles:
  - SOULLAB_LIVING_ORIENTATION_SYSTEM — the saved reading remains the source and Journal remains the member's writing
  - MAIA_OATH — symbolic interpretation may accompany but may not become member authorship
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — source fact, tradition, synthesis, and member meaning remain distinguishable
reference_surfaces:
  - docs/design/contracts/divination-symbolic-receiving-prototype.md
  - docs/design/contracts/symbolic-crossing-readiness.md
  - docs/design/contracts/facet-crossings.md
shared_with_house: explicit gesture, authenticated source resolution, identity-only durable relation, exact return
distinct_to_room: Journal receives typed symbolic provenance beside a blank page; keeping member-authored writing atomically records the source relation
screenshot_desktop: docs/design/contracts/screenshots/facet-flow-05-divination-journal-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/facet-flow-05-divination-journal-mobile.png
experience_verification: >
  2026-09-27 authenticated local witness on localhost:3597 using one temporary Runes reading explicitly marked SAFE TO DELETE. The real Saved Readings action Write with this in Journal opened the canonical Journal route with typed provenance visible as WHAT HAPPENED, SYMBOLIC TRADITION, SYSTEM'S READING, and YOUR MEANING while the Journal textarea remained empty. Read-only arrival created 0 Journal rows and 0 crossing rows. The member then authored one temporary Journal sentence and chose Keep this; the server created exactly 1 quick_journal_entries row and exactly 1 divination-write-journal member_facet_crossings row to target 79fd61d8-ba5c-4d3c-9d81-e3fdb8181720. Reopening that exact Journal entry preserved the typed provenance under WHERE THIS BEGAN, and Return to exact reading reopened the original saved Runes reading by runes:<uuid> with its original question and cast. Desktop and mobile arrival evidence were captured. The temporary crossing, Journal entry, and saved reading were deleted; residue verified journal=0, crossing=0, reading=0.
---

# FACET-FLOW-05 — Divination → Journal Durable Crossing + Exact Return
## Standing

> **LOCAL ACCEPTANCE PASS · JOURNAL CROSSING PROVEN · DAILY ANCHOR REMAINS CLOSED**

FACET-FLOW-05 turns the accepted read-only symbolic receiver into one durable member act:

> **Write with this in Journal**

A saved Divination reading may accompany the member to Journal only after that explicit gesture.

## Source law

The URL carries only:

- sourceFacet=divination;
- the durable saved-reading identity (iching:<uuid>, tarot:<uuid>, or runes:<uuid>);
- crossingId=divination-write-journal.

No question, card, rune, hexagram, interpretation, guidance, or member note is accepted from the URL.

The server re-resolves the exact owned source under the authenticated member.
## Epistemic provenance law

Journal renders the same typed distinctions proven in FACET-FLOW-04:

- **What happened** — question actually asked and symbols actually cast/drawn;
- **Symbolic tradition** — inherited symbolic meanings when stored;
- **System's reading** — generated interpretation, Wyrd synthesis, or guidance;
- **Possible expression** — only explicitly hypothetical lived-expression language;
- **Your meaning** — member-authored notes.

Missing classes remain absent.

The Journal textarea begins blank. No source field seeds it.

## Keep law

**Keep this** is the durable authorship act.

Only after source validation succeeds, the server transaction:

1. creates the member-authored Journal entry;
2. records one member_facet_crossings row containing identities only.

If either act fails, neither is committed.

The source reading itself is not copied into the Journal row.
## Durable return law

Reopening the kept Journal entry must show:

> **Where this began**

For a Divination source, the typed epistemic provenance is rendered again rather than collapsing back into one blended excerpt.

**Return to exact reading** reopens the original saved reading by durable identity.

The original reading remains canonical symbolic source material.

## Forbidden

- pre-filling Journal with reading text;
- treating generated guidance as an instruction to the member;
- flattening fact/tradition/synthesis/member meaning into one unlabeled block;
- copying the source reading into Journal persistence;
- writing MAIA memory at this seam;
- creating a crossing merely by opening Journal;
- broadening this act to Daily Anchor;
- reconstructing a deleted source from the Journal entry.

## Acceptance

FACET-FLOW-05 closes only after an authenticated local witness proves:

- the doorway originates from one exact saved reading;
- Journal opens with typed source provenance and an empty writing field;
- read-only arrival creates no Journal row and no crossing row;
- member-authored keep creates exactly one Journal row and exactly one identity-only crossing row atomically;
- reopening the Journal entry preserves typed provenance;
- exact return reopens the original saved reading;
- temporary witness reading, Journal row, and crossing row are removed with zero residue.
## Exact stop

> **FOUNDER ADJUDICATION — FACET-FLOW-05 REAL JOURNAL EXPERIENCE**

The local crossing is proven and clean. The next decision is not automatically another crossing.

The House should first adjudicate the real Journal experience: whether symbolic context remains sufficiently secondary to the page and sufficiently clear in its epistemic standing.

Until then: **NO DIVINATION → DAILY ANCHOR AUTHORITY.**
