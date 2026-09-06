---
room: Journal
human_activity: writing — the member putting their own experience into words, and returning to it
surfaces:
  - app/journal/page.tsx
  - app/journal/room/**
  - components/journal/room/**
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE — rooms come from human activity, not data models
  - INHABITABLE_ARCHITECTURE visual-grammar law — the member's OWN words are the meaning layer
  - SOULLAB_THEME §3 — accent is never decorative (ember marks one gesture per state)
  - SOULLAB_THEME §4 — variation by function; the field stays continuous
  - MAIA_OATH — no guru stance; MAIA offers reflection, never authority
reference_surfaces:
  - docs/design/references/JOURNAL_EXPERIENTIAL_REFERENCE_2026-08-10.md
  - docs/design/references/JOURNAL_SLICE1_IMPLEMENTATION_CONTRACT.md
shared_with_house: House token layer (--sl-* field/surface/signal hierarchy) · provenance voice · gesture language in human verbs · quiet ember accent · the Journal marker as room orientation
distinct_to_room: writing is the destination, not a control surface — the room opens on a question rather than an inventory, holds one long readable measure for both composing and reading, and lets MAIA appear only after the member has kept something
screenshot_desktop: docs/design/contracts/screenshots/journal-room-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/journal-room-mobile.png
experience_verification: CUTOVER (2026-08-11) — walked at /journal from a clean worktree branched off trunk, after the room replaced UnifiedJournalView on the canonical member route. Confirmed the paper arrival renders with no old-surface markers; wrote and kept an entry and verified the row persisted; left and returned and found it still present; opened Browse and reached entries, Captures, Sessions and Changes, with Decisions correctly not offered when its source answers 401; confirmed exact literal search; confirmed Reflect returns 200 for an owned entry and 401 without a session; confirmed Return fires a calendar rule and discloses a factual account. Accessibility re-measured on the paper material across all states: zero room-level failures (lowest contrast 5.16, targets >=44px, named heading per state, zero reduced-motion offenders, no overflow at 1280/400/200% text). EARLIER (2026-08-10) — walked all five approved states in a browser at 1280x800 and 375x812 against a live dev server with an authenticated dev session — arrival, writing (typed, kept), reading, MAIA reflection (live /api/journal/reflect response), and return. Verified the anniversary selection rule fired, that `Why this?` discloses the literal rule, that `Write from here` carries MAIA's question as context without seeding the member's text, and that a failed keep preserves the writing. Unauthorized House chrome observed and reported, not silently suppressed.
---

# Journal — Experience Contract

**Canonical route: `/journal`** (cutover 2026-08-11, founder-authorized).
`/journal/room` remains as the route the room was built and walked on;
`/labtools/journal` still serves the legacy UnifiedJournalView, which the cutover
preserves rather than deletes.

**Material: paper.** The room was first built on a navy field. Walked at
`79fd8e911`, that field broke no behaviour but pulled the room toward *screen*
rather than *surface* — and Journal's activity is inscription. Corrected under
founder ruling to a paper expression, scoped to this room only by re-pointing the
House colour variables on each state's `<main>`; the House layer is untouched and
no other surface changed. Contrast was measured rather than inverted: lowest room
ratio 5.16 against the paper field.

**Composition: one spine.** The same walk found three left edges — marker and
doorway at the page margin, content on the centred measure — so the emptiness
read as leftover. The marker, the writing column and the Browse doorway now hang
from one axis. No air was removed.

**Implementation lineage: NEW.** Built from the approved experiential reference; no
prior Journal code lineage was recoverable. This is not a restoration.

## What this room is for

A person putting their own experience into words, and sometimes returning to what
they wrote before. The room exists for the writing — not for managing writing.
Everything else in it is subordinate to that, including MAIA.

## Arrival

> **What would you like to Journal?**

The question is the largest thing in the room, and most of the surface is empty.
There is no inventory to survey on arrival: three gestures, one of which is
tertiary. Nothing counts, filters, or summarises the member back to themselves.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| primary | `Begin writing` | an invitation to an activity, not `New Entry` |
| secondary | `Or note something` | lower ceremony, same room — not a separate product |
| keep | `Keep this` | the member decides what becomes an entry; not `Save` |
| reflect | `Reflect with MAIA` | a gesture toward relationship, offered only on kept writing |
| release | `Let it go` | the reflection is transient and says so |
| disclose | `Why this?` | the room can account for itself without a settings page |

## Forbidden here

- dashboard, card grid, or any listing-as-arrival
- search, filters, category tabs, entry counts, streaks, stats
- title ceremony before writing; classification before writing
- chat input, message bubbles, avatars, "MAIA is thinking", regenerate
- persisted reflection history
- carousels, "Recommended for you", relevance scores

## The two brand tests

**Same house?** Yes. It draws its field, surface and signal from the House token
layer, keeps ember for one gesture per state, and speaks in the same human verbs as
the rest of Soullab. Nothing in it was copied from a neighbouring room's aesthetic.

**Distinct room?** Yes. No other Soullab surface opens on a question with an empty
field beneath it, and no other surface makes writing the destination rather than a
control surface. A member would know this is the Journal without the label.

## Ambient MAIA handle — RULED, 2026-09-06 (was: known deviation)

The golden screenshots showed the room **without** the House's floating MAIA
handle (`components/maia/presence/MaiaPresence.tsx`) because the headless capture
session resolved no member; a signed-in member saw it, contradicting the arrival
state's *MAIA presence: none*. This was left for a founder ruling. It is now ruled.

**Ruling.** *House MAIA availability does not imply an ambient MAIA affordance in
every room.* Journal suppresses the floating handle. Its sole **in-room MAIA
invocation affordance** is the room-owned `Reflect with MAIA` gesture on a kept
entry.

**Sharpened 2026-09-06** after the closure walk observed a header back-link
reading `← MAIA` at arrival. That link **may remain**: it is egress/navigation,
not in-room invocation. It takes the member *out of Journal to MAIA*; it does not
bring MAIA into Journal, open a conversation over a Journal entry, or compete with
`Reflect with MAIA`. Accordingly, *MAIA presence: none* means **no ambient or
in-room MAIA presence on arrival**; it does not prohibit a clearly directional
link that leaves the room. This closes the apparent contradiction without
weakening the threshold ruling.

**Scope: throughout `/journal`, not merely on arrival.** The handle broke the room
in both directions:

```text
before Keep  → MAIA appears without the member crossing Journal's threshold
after Keep   → an always-available canonical conversation competes with
               Journal's deliberately transient "Reflect with MAIA"
```

Once a kept entry exists Journal already has its legitimate MAIA gesture; showing
the House handle there would introduce a second relationship grammar in one room.

**This is not a rejection of MAIA as House infrastructure.** It is the distinction
the presence layer already carries:

```text
Journal may be MAIA-capable  ≠  Journal must advertise the House MAIA handle
```

The room controls the threshold. Journal remains a **governed room** — place facts
still resolve and still travel on a message the member intentionally sends; only
the unprompted advertisement is gone.

**Implementation.** No new suppression mechanism was built, and the concern that
one would refactor shared House infrastructure does not apply. `place.ts` already
separated eligibility from affordance via `handleVisibility`; this ruling added
the value `'none'` to that existing closed vocabulary and set Journal to it.
`FULL_CONVERSATION_ROUTES` was deliberately **not** reused — it means *the page IS
the conversation*, which Journal is not, and overloading it would have made the
registry say something false about this room. Pinned by
`lib/maia/presence/__tests__/place.test.ts`.
