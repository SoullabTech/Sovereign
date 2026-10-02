---
room: Dream Room — Canonical Live Shell
human_activity: Recording a dream, returning to an owned dream, and moving between Journal and Dream without duplicating the dream object.
surfaces:
  - app/dream/page.tsx
  - app/dream/DreamRoom.tsx
  - components/journal/room/EntryReader.tsx
principles:
  - SOULLAB_DREAM_FACET — one primary Dream object; interpretation remains plural and unbound in DREAM-03
  - DREAM-02R1 — the field may evoke but must not tell the member what to dream
  - SOULLAB_LIVING_ORIENTATION_SYSTEM — source identity survives crossings and return is part of the crossing
  - INHABITABLE_ARCHITECTURE_STANDARD — Dream is a room, not a dashboard
reference_surfaces:
  - docs/design/contracts/dream-room-experience-architecture.md
  - docs/design/contracts/dream-living-field-visual-authority.md
  - docs/design/contracts/dream-room-visual-prototype.md
shared_with_house: House membrane grammar, editorial serif hierarchy, abstract MAIA presence, warm material contrast, explicit return paths
distinct_to_room: one non-figurative nocturnal living field around a member-owned Dream object, with Re-member capture and exact Dream/Journal identity continuity
screenshot_desktop: docs/design/contracts/screenshots/dream03-arrival-live-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/dream03-arrival-live-mobile.png
experience_verification: 2026-09-27 authenticated Safari witness on localhost:3597. Arrival loaded the member's real Dream rows from the existing Journal substrate. Exact Dream UUID 971caa24-bab5-4ba4-83c4-374fdefbb1ae opened in Dream via the canonical exact-read API and then reopened in Journal at the same UUID with DREAM and place provenance intact. A temporary Dream was entered through the live Re-member textarea, persisted through the existing authenticated Journal POST with source=dream_room, reopened immediately as canonical Dream id 9803f1f8-c972-4944-980a-eab120b1199c, then deleted; residue count verified 0. Encounter/Amplify/Series/Integrate cognition remained unbound and Explore with MAIA remained disabled. House catalog migration was applied locally and admits dream in Center/Here-Now constraints.
---

# DREAM-03 — Canonical Dream Room Shell + Real Dream Read/Capture

## Standing

DREAM-03 makes Dream a real member House room without opening Dream cognition.

Canonical route:

`/dream`

Canonical object:

`quick_journal_entries.id` where `entry_type = 'dream'`

No second Dream content table is introduced.

## Bound in this act

### House

Dream is now:

- a canonical semantic House place;
- a Living Orientation facet;
- a member House destination;
- eligible for member-chosen Center placement;
- eligible for Here · Now placement.

Native policy is intentionally `web` until the new route is separately reconciled into the Capacitor bundle.

### Arrival

Arrival reads only authenticated owned Journal Dream rows through:

`GET /api/journal/quick/list?type=dream&limit=24`

It does not infer:

- importance;
- unfinished status;
- archetype;
- recurrence;
- dream type;
- symbolic meaning.

Recent Dreams means recent records only.

### Re-member

Dream capture writes through the already-governed Journal persistence path:

`POST /api/journal/quick/list`

with:

- `entryType: dream`;
- `source: dream_room`;
- member identity derived from the authenticated request;
- no generated title;
- no generated interpretation;
- no memory promotion;
- no Reflection promotion.

After persistence the room reopens the stored object by returned UUID.

### Exact canonical read

The new exact read route is:

`GET /api/dreams/canonical/[id]`

It:

- derives member identity from the authenticated request;
- resolves legacy Journal owner aliases only server-side;
- requires `entry_type = 'dream'`;
- returns only a member-owned row;
- uses the same 404 for absent and foreign identity;
- accepts no dream prose from the caller.

### Journal ↔ Dream

A kept Journal Dream now offers:

**Explore this dream →**

That doorway carries only the exact entry UUID:

`/dream?dream=<uuid>&from=journal`

Dream offers:

**Open this dream in Journal →**

using:

`/journal?entry=<same uuid>`

The object does not duplicate.

## Explicitly unbound

DREAM-03 does not bind:

- Dream → MAIA cognition;
- Jungian interpretation;
- amplification;
- Dream Series pattern recognition;
- computational dream sensitivity;
- active imagination;
- integration crossings;
- Dream → Reflection;
- Dream → Anchor;
- Dream → Astrology;
- Dream → Divination;
- generated imagery.

The visible **Explore with MAIA** control is disabled.

The old generic Journal reflection route now refuses `entry_type='dream'` so there is no hidden alternate MAIA path around the first-class Dream boundary.

## Visual authority

The production shell uses the same canonical abstract field:

`public/dream/dream-field.svg`

It contains no default identifiable dream imagery.

The member's actual dream text is the most materially stable object on the Dream page.

DREAM-03 also repairs one prototype error discovered during live witness: the first sentence of a Dream is no longer promoted into an invented title. The primary body is rendered as authored.

## Witness evidence

- `dream03-arrival-live-desktop.png` — authenticated live Arrival with real member Dream data.
- `dream03-arrival-live-mobile.png` — production mobile shell.
- `dream03-remember-live-desktop.png` — real Re-member input before persistence.
- `dream03-captured-dream-live-desktop.png` — temporary Dream after real persistence.
- `dream03-exact-dream-live-desktop.png` — existing owned Dream opened by exact UUID.
- `dream03-exact-journal-return-desktop.png` — same UUID reopened in Journal.

The temporary witness Dream has been removed from the local database.

## Exact stop

DREAM-03 stops with a real room, real capture, real read, and real identity return.

No Dream cognition is authorized by this act.

The next boundary, if accepted, is:

> **DREAM-04 — DREAM ENCOUNTER CONVERSATION CONTRACT + COGNITIVE RUNTIME ONLY**

That act should bind only the Encounter state first: one owned Dream, one explicit **Explore with MAIA** gesture, precise phenomenological dialogue, no amplification unless separately invited, no persistence of MAIA interpretation, and a stop before Amplify or Series cognition.
