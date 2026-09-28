---
room: Changes — Living Change Room
human_activity: Returning to a lived change, seeing what has moved over time, and staying in relationship with it before choosing any deeper practice or interpretation.
surfaces:
  - app/changes/page.tsx
  - components/maia/changes/ChangeRoom.tsx
  - components/maia/changes/change-room.module.css
change_class: experiential
principles:
  - CHANGES-UX-01 — the lived Change has authority; one inquiry becomes deeper; time is constitutive
  - INHABITABLE_ARCHITECTURE_STANDARD — Changes is a room organized around human activity, not a record dashboard
  - SOULLAB_LIVING_ORIENTATION_SYSTEM — exact source identity and return remain visible across House crossings
  - MAIA_OATH — MAIA remains available but does not interpret without invitation
  - DREAM-02R1 — a field may evoke without pre-shaping member meaning
reference_surfaces:
  - docs/design/contracts/changes-living-room.md
  - docs/design/contracts/dream-room-live-shell.md
  - docs/design/contracts/dream-room-experience-architecture.md
  - docs/design/contracts/journal-room.md
  - docs/architecture/RELATIONSHIPS-UX-01.md
  - docs/architecture/RELATIONSHIPS-UX-02.md
shared_with_house: House membranes, editorial serif hierarchy, restrained brass, human-language orientation, abstract MAIA presence, source provenance, and responsive desktop/mobile room continuity.
distinct_to_room: Changes is organized around lived movement through time. The member-authored Change is the stable center; moments accumulate longitudinally without becoming progress metrics, while symbolic consultation and MAIA remain secondary invited practices.
screenshot_desktop: docs/design/contracts/screenshots/changes-ux-02-live-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/changes-ux-02-live-mobile.png
experience_verification: 2026-09-27 local authenticated witness on isolated port 3697 against a temporary member-owned Change. The canonical /changes?change=<uuid> route rendered the new living room shell at 1440x1000 and 390x844, read the real studio_changes object and three real change_experiences through the existing authenticated GET API, showed an existing I Ching cast only as a read-only symbolic lens, and exposed no Notice, casting, MAIA conversation, Pattern, mutation, or new crossing act. The temporary Change, experiences, auth session and member were deleted after capture. The live localhost:3597 working build was not modified.
---

# CHANGES-UX-02 — Canonical Change Room Shell + Existing Change Object Read-Only Binding

## Standing

This act binds the accepted CHANGES-UX-01 visual authority to the existing member Change object.

It deliberately stops before any new cognition or mutation.

## Route behavior

An exact Change URL:

`/changes?change=<uuid>`

now renders the Living Change Room in this candidate branch.

The existing Changes list / creation / carry-source flow remains on the existing ChangesSheet path when no exact Change id is present or when an explicit carry source is being authored into a new Change.

This avoids rebuilding the creation workflow during the room-shell act.

## Bound in this act

### Existing authenticated read

The room reads only:

`GET /api/changes/[id]`

No new read endpoint is introduced.

The server remains authoritative for ownership and returns 404 for unavailable member Changes.

### Primary Change material

The center of the room renders existing:

- title;
- description;
- created date;
- change type;
- lifecycle status;
- emotional state when present;
- follow-up intention when present.

Type and status remain visually subordinate to member-authored words.

### Lived moments over time

Existing `change_experiences` rows are rendered chronologically as:

**THE MOVEMENT SO FAR**

The representation explicitly says:

> **Not progress. Just what has happened.**

No score, completion percentage, predicted trajectory, or developmental ranking is added.

### Existing symbolic material

If the Change already has a hexagram, the room may show its existing identity as:

**SYMBOLIC LENS ALREADY HELD**

This is read-only.

If no cast exists, the room explicitly allows the Change to stand without one.

No cast is requested automatically.

### Provenance

The existing `FacetOriginTrail` remains the source authority for:

- Where this began;
- exact source identity;
- Return to source.

No duplicate provenance system is introduced.

### MAIA

The right membrane says:

**Present when invited.**

No conversation mounts.
No prompt runs.
No MAIA context is sent.
No memory is written.

## Explicitly unbound

CHANGES-UX-02 does not bind:

- Add / Notice experience;
- I Ching casting;
- I Ching re-casting;
- I Ching interpretation generation;
- Council consultation;
- MAIA mentor generation;
- MAIA conversation;
- Pattern cognition;
- automatic synthesis;
- integration actions;
- new House crossings;
- status updates;
- title / description editing;
- schema changes.

The candidate UI includes a temporary witness note making this read-only boundary visible during founder review. That note is not intended as final member copy.

## Visual behavior

The room uses the CHANGES-UX-01 atmospheric threshold language:

- dark House membranes;
- warm/cool field pressure;
- a materially stable paper-like Change object;
- temporal trace rather than analytics timeline;
- abstract MAIA orb at the room edge;
- no transformation clichés or figurative symbolic imagery.

The desktop room uses three zones:

**House membrane / Living Change / MAIA edge**

The mobile room collapses these into one continuous vertical composition while keeping Change identity and temporal movement intact.

## Acceptance result

Local authenticated witness passed for:

- real member-scoped Change read;
- real change_experiences read;
- desktop render;
- mobile render;
- existing hexagram read-only display;
- no automatic cast;
- no MAIA mount;
- no mutation gesture;
- no new schema / API.

## Exact stop

CHANGES-UX-02 stops here.

The next act, if founder-accepted, should be:

> **CHANGES-UX-03 — NOTICE / LIVED MOMENT CAPTURE AS PHENOMENON-FIRST GESTURE ONLY**

That act should bind one thing only:

> **What happened?**

to the existing change_experiences persistence path, with optional classification only after member-authored content exists, then stop before I Ching or MAIA.
