---
room: Changes — Notice
human_activity: Recording what actually happened inside a lived change before deciding what kind of moment it was.
surfaces:
  - components/maia/changes/ChangeRoom.tsx
  - components/maia/changes/change-room.module.css
change_class: experiential
principles:
  - CHANGES-UX-01 — phenomenon first; classification second
  - CHANGES-UX-02 — the lived Change remains the stable center
  - INHABITABLE_ARCHITECTURE_STANDARD — the interaction serves lived experience rather than record administration
  - MAIA_OATH — member experience may be recorded without MAIA weighing in
reference_surfaces:
  - docs/design/contracts/changes-living-room.md
  - docs/design/contracts/changes-room-live-shell.md
  - docs/design/contracts/journal-room.md
  - docs/architecture/RELATIONSHIPS-UX-02.md
shared_with_house: human-language gesture, explicit member authorship, quiet material field, and no automatic interpretation.
distinct_to_room: Notice adds one lived moment to an ongoing Change. The person writes what happened first; optional type language appears only after words exist.
screenshot_desktop: docs/design/contracts/screenshots/changes-ux-03-notice-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/changes-ux-03-notice-mobile.png
experience_verification: 2026-09-27 authenticated local witness on isolated port 3697 using a temporary member-owned Change. Before any text was written, no experience-type choices were rendered. After member-authored words existed, optional distinctions appeared. Choosing reflection and Keep this moment produced a 200 from the existing /api/changes/[id]/experiences route, persisted exactly one reflection row with the authored content, refreshed the same Change room, and surfaced the kept moment in the temporal field. Desktop and mobile captures were taken; temporary Change, experience, auth session and member were removed; residue count was zero. localhost:3597 was not modified.
---

# CHANGES-UX-03 — Notice / Lived Moment Capture

## Purpose

Bind one existing Change capability into the new room:

> **Notice what happened**

Nothing else is opened.

## Interaction law

The member encounters one question first:

> **What happened?**

The room does not ask them to classify the event before writing.

Only after non-empty member-authored content exists may the room quietly offer:

> **This was more like…**

with existing experience distinctions:

- a moment;
- a reflection;
- a dream;
- a breakthrough;
- a setback;
- a synchronicity.

The default persistence type remains `field_event` so the member can keep the moment without classifying it further.

## Persistence

This act reuses the existing governed endpoint:

`POST /api/changes/[id]/experiences`

It introduces:

- no schema change;
- no new API;
- no new event type;
- no MAIA call;
- no symbolic interpretation;
- no automatic element assignment;
- no tags;
- no hexagram resonance inference.

The member's exact text is persisted as the content.

## Return behavior

After Keep this moment succeeds:

1. the Notice field closes;
2. the Change object is re-read from the existing GET route;
3. the new moment appears in the same room;
4. the member does not navigate away from the Change.

This preserves the governing experience:

> **one inquiry becoming deeper**

rather than sending the person through a form workflow.

## Failure behavior

If persistence fails:

- the authored text remains in the Notice field;
- the room reports that the moment could not be kept;
- no fake success state is shown.

## Explicitly unbound

CHANGES-UX-03 does not bind:

- element selection;
- tag selection;
- hexagram resonance;
- I Ching consultation;
- MAIA conversation;
- Council;
- Pattern synthesis;
- automatic categorization;
- automatic date interpretation beyond the existing current timestamp;
- editing or deleting moments.

## Exact stop

CHANGES-UX-03 stops after proving phenomenon-first Notice persistence.

The next clean act, if founder-accepted, is:

> **CHANGES-UX-04 — I CHING CONSULTATION AS INVITED SYMBOLIC PRACTICE ONLY**

That act should replace the old auto-open caster with one explicit **Consult the I Ching** doorway inside the Living Change Room, preserve Three Coins and Yarrow as methods of asking, return the resulting reading to the same Change, and stop before MAIA interpretation or Council.
