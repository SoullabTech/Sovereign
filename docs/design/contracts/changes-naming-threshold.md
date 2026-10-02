---
room: Changes — Naming Threshold
human_activity: Putting a lived change into the member's own words before choosing any orienting category.
surfaces:
  - components/maia/changes/NameYourChange.tsx
  - components/maia/changes/changes-threshold.module.css
change_class: experiential
principles:
  - CHANGES-UX-01 — phenomenon first; classification second
  - CHANGES-ENTRY-01 — arrival precedes administration
  - INHABITABLE_ARCHITECTURE_STANDARD — the member's lived words are the primary material
  - RELATIONSHIPS-UX-01 — representation follows encounter
reference_surfaces:
  - docs/design/contracts/changes-threshold-room.md
  - docs/design/contracts/changes-living-room.md
  - docs/design/contracts/journal-room.md
shared_with_house: material writing surface, restrained atmospheric field, explicit member authorship, and human-language gestures.
distinct_to_room: the Change begins as authored movement. Type is withheld until the member has named what is actually happening, then offered only as a loose orientation.
screenshot_desktop: docs/design/contracts/screenshots/changes-entry-02-after-words-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/changes-entry-02-mobile.png
experience_verification: 2026-09-27 authenticated local witness on reconciled current-House candidate at localhost:3698 using a temporary member. Before any member-authored title or description existed, zero Change-type choices were rendered. After both authored fields contained words, the six existing type orientations appeared. Choosing Emergence and Keep this Change returned HTTP 200 through the existing POST /api/changes route, persisted exactly one member-owned Change with the exact title and description, preserved change_type=emergence, and routed to the exact /changes?change=<uuid> Living Change room. Desktop before/after and mobile captures passed. Temporary Change, member and session were deleted; residue zero.
---

# CHANGES-ENTRY-02 — Name a Change as a Phenomenon-First Threshold

## Purpose

Repair the creation flow so the person encounters their own experience before the system asks them to classify it.

The sequence is:

> **What is changing?**
>
> member words
>
> optional orienting category
>
> explicit Keep

## Member words first

The naming surface begins with two authored fields:

- In a few words
- What is actually happening?

No Change-type options are visible before both fields contain member-authored text.

The room explicitly permits uncertainty, incompleteness and contradiction.

Nothing has to be resolved before it belongs.

## Material register

The authored words live on a warm paper-like field inside the darker Changes environment.

This gives the person's language more material authority than the classification controls that follow.

## Type appears second

Only after words exist does the room ask:

> **What kind of movement does this feel closest to?**

The existing six values remain unchanged:

- Dissolution
- Emergence
- Threshold
- Integration
- Upheaval
- Ripening

The UI frames them as orientations, not diagnoses.

No new Change type is introduced.

## Persistence

The existing POST /api/changes route remains authoritative.

The flow persists:

- exact member-authored title;
- exact member-authored description;
- explicitly chosen existing Change type;
- existing default urgency behavior;
- carried-source provenance when present.

No schema or API change is introduced.

## Carried-source provenance

When the member arrives from Journal, Reflection, Idea or Relationship, the existing FacetCarryNotice remains intact.

That source may accompany the member, but does not pre-author title, description or type.

## Keep

The final gesture is:

> **Keep this Change**

Before that gesture, the UI states that nothing is kept yet.

After a successful POST in room presentation, the member routes directly to the exact Living Change room:

/changes?change=<uuid>

The member does not fall back into the legacy ChangeJourney sheet.

## Explicitly unchanged

CHANGES-ENTRY-02 does not alter:

- Change type vocabulary;
- persistence schema;
- House crossings;
- I Ching;
- MAIA;
- Pattern;
- status lifecycle;
- existing embedded ChangesSheet presentation.

## Exact stop

The Changes threshold and creation threshold now belong to one coherent room.

The next clean act is founder visual witness on localhost:3698 before any promotion to 3597.