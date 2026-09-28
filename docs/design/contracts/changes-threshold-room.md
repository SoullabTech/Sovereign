---
room: Changes — Threshold
human_activity: Entering Changes, orienting to what the room is for, beginning a new Change, or returning to one already unfolding.
surfaces:
  - app/changes/page.tsx
  - components/maia/changes/ChangesSheet.tsx
  - components/maia/changes/ChangeListView.tsx
  - components/maia/changes/changes-threshold.module.css
change_class: experiential
principles:
  - CHANGES-UX-01 — Changes is a room for living through movement over time, not a utility sheet
  - INHABITABLE_ARCHITECTURE_STANDARD — arrival precedes administration
  - RELATIONSHIPS-UX-01 — presence before representation; encounter outranks apparatus
  - SOULLAB_THEME — restrained atmospheric depth, material hierarchy, and human-language gestures
reference_surfaces:
  - docs/design/contracts/changes-living-room.md
  - docs/design/contracts/dream-room-live-shell.md
  - docs/design/contracts/journal-room.md
  - docs/architecture/RELATIONSHIPS-UX-03.md
shared_with_house: House-level atmospheric field, editorial serif hierarchy, restrained brass, quiet MAIA presence, and responsive continuity.
distinct_to_room: Changes arrives through movement, temporality, and return. The room first orients the member to what is shifting, then offers a threshold to begin and a field of existing Changes to continue.
screenshot_desktop: docs/design/contracts/screenshots/changes-entry-01-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/changes-entry-01-mobile.png
experience_verification: 2026-09-27 authenticated local witness on reconciled current-House candidate at localhost:3698 using a temporary member with two real Changes and three real change_experiences. Desktop and mobile both rendered the full atmospheric Changes threshold with no bottom sheet and no dead black void; both rendered two living Change continuation cards and one primary Begin invitation. Existing Change cards remained real authenticated objects; selecting one is routed to the exact /changes?change=<uuid> Living Change room rather than the legacy ChangeJourney sheet. New Change creation still uses the existing governed POST and then routes into the exact Living Change room. Temporary member, Changes, experiences and session were deleted; residue zero. localhost:3597 was not mutated by this act.
---

# CHANGES-ENTRY-01 — Canonical Changes Threshold Room

## Problem repaired

The prior canonical /changes arrival rendered as a bottom utility sheet over a mostly empty black viewport.

Its visual hierarchy was:

> sheet → New Change button → empty-state utility copy

That made the room read as an administrative control surface.

The accepted Changes architecture requires the inverse:

> arrival → lived orientation → begin / continue → deeper practices

## Canonical arrival

The room now opens with:

> **Stay close to what is moving.**

and explains the activity of the room before presenting controls.

MAIA is present quietly at the edge:

> **Available when invited — to help you stay with what is changing.**

No conversation begins.

## Begin

The primary threshold is:

> **Name a new Change**

with a human orientation:

> Give enough form to what is shifting that you can return to it without having to know what it means yet.

This is not a command bar.

It is a threshold object inside the room.

## Continue

Existing member-owned Changes appear under:

> **Continue what is already unfolding**

Each card carries only existing Change data:

- change type;
- last updated date;
- title;
- member-authored description;
- count of member-kept moments;
- explicit open gesture.

The cards do not expose Council scores, AI analysis, urgency badges, or tool status at arrival.

## Exact Change routing

A member who opens an existing Change from the threshold is sent to:

/changes?change=<uuid>

which is already bound to the accepted Living Change Room.

The threshold does not re-enter the legacy ChangeJourney UI.

Likewise, after a new Change is persisted, room presentation routes directly to the exact Living Change Room.

This means threshold and lived object now belong to one architecture.

## Sheet compatibility

ChangesSheet remains available in its original sheet presentation mode for older embedded MAIA call sites.

The canonical /changes route explicitly opts into:

presentationMode="room"

This prevents a threshold redesign from silently changing every historical embedded sheet invocation in the application.

## Visual field

The Changes threshold shares the House material family but remains distinct:

- warm/dark atmospheric pressure;
- subtle cool secondary field;
- no literal transformation imagery;
- no phoenix, butterfly, path, mountain or doorway iconography;
- generous negative space;
- one primary threshold object;
- quiet MAIA presence.

## Mobile

Mobile preserves the same ordering:

1. room identity;
2. Changes orientation;
3. quiet MAIA presence;
4. begin a Change;
5. continue existing Changes.

It does not collapse back into a bottom sheet.

## Explicitly not changed

CHANGES-ENTRY-01 does not redesign:

- the internal Name Your Change form;
- Living Change internals;
- Notice;
- I Ching;
- MAIA encounter;
- Pattern;
- member meaning;
- APIs;
- schema;
- House crossings.

Those remain governed by their existing acts.

## Exact stop

The threshold is now sufficient for founder visual witness.

The next boundary, if accepted, is:

> **CHANGES-ENTRY-02 — NAME A CHANGE AS A PHENOMENON-FIRST THRESHOLD ONLY**

That act should rebuild the current classification-heavy creation form so member words come before Change type, preserve carried-source provenance, persist through the existing /api/changes route, and stop before adding any new field.