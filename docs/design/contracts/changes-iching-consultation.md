---
room: Changes — I Ching Consultation
human_activity: Voluntarily bringing a lived Change to the I Ching as a symbolic practice without surrendering authorship or treating the cast as an answer.
surfaces:
  - components/maia/changes/ChangeRoom.tsx
  - components/maia/changes/change-room.module.css
change_class: experiential
principles:
  - CHANGES-UX-01 — I Ching is a practice inside Changes, not the structural owner of Changes
  - CHANGES-UX-02 — the lived Change remains primary and existing symbolic material is read-only until explicitly invoked
  - INHABITABLE_ARCHITECTURE_STANDARD — practices are entered through human gestures rather than exposed as administrative controls
  - MAIA_OATH — symbolic material does not become authority over the member
reference_surfaces:
  - docs/design/contracts/changes-living-room.md
  - docs/design/contracts/changes-room-live-shell.md
  - docs/design/contracts/dream-room-experience-architecture.md
  - app/dream/dream.module.css
shared_with_house: explicit thresholds, restrained ceremonial pacing, human-language gestures, and return to the same member-owned object.
distinct_to_room: the I Ching appears only as an optional symbolic lens on an already-existing Change. The Change is whole without a cast.
screenshot_desktop: docs/design/contracts/screenshots/changes-ux-04-consult-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/changes-ux-04-consult-mobile.png
experience_verification: 2026-09-27 authenticated local witness on isolated port 3697 using temporary member-owned Changes. Before the explicit Consult the I Ching gesture, the database hexagram field remained null and no method controls were shown. After the explicit doorway, Three Coins and Yarrow Stalks appeared as ways of asking inside a contained symbolic-practice state. A Three Coins cast returned 200 through the existing /api/changes/[id]/cast route, persisted one hexagram with casting_method=coin, returned to the same Change room, and rendered the result as SYMBOLIC LENS ALREADY HELD. No MAIA interpretation or Council route was invoked. Desktop and mobile captures were made; all witness members, Changes and auth sessions were removed.
---

# CHANGES-UX-04 — I Ching Consultation as Invited Symbolic Practice

## Purpose

Bind the existing I Ching casting capability into the Living Change Room without allowing divination to organize the room.

The governing sequence is:

**lived Change**
→ explicit **Consult the I Ching**
→ choose a way of asking
→ cast
→ return to the same lived Change with a symbolic lens now held

## Before invitation

A Change with no hexagram is not incomplete.

The room says, in substance:

> This Change does not need a reading.

No method selector is visible.
No cast occurs.
No placeholder hexagram is shown.
No MAIA interpretation is requested.

## Explicit threshold

The only opening gesture in this act is:

> **Consult the I Ching**

The member must choose it.

Only then do the two existing methods appear:

- Three Coins;
- Yarrow Stalks.

They are presented as **ways of asking**, not as radio controls in a settings form.

## Symbolic-practice stance

The room states the boundary before casting:

> The cast is a symbolic mirror for this Change. It does not decide what the Change means or what you should do.

This is experiential copy, not a legal disclaimer.

Its purpose is to keep the relationship between person, Change and symbol clear.

## Persistence

This act reuses exactly:

`POST /api/changes/[id]/cast`

No new endpoint or schema is introduced.

The existing route remains authoritative for:

- ownership;
- archived-state refusal;
- casting method;
- random cast;
- hexagram lookup;
- changing lines;
- relating hexagram;
- persistence.

## Return to the Change

After a successful cast:

- the room re-reads the same Change;
- the consultation state closes;
- the existing cast appears as **SYMBOLIC LENS ALREADY HELD**;
- the member remains inside the same Change.

The cast does not replace the Change title or description.

## Re-casting

CHANGES-UX-04 does **not** expose re-casting.

An existing hexagram remains visible as held symbolic material.

Overwriting an existing cast is a separate experiential question and is not silently inherited from the old UI.

## Explicitly unbound

This act does not bind:

- Browse Hexagrams;
- re-cast;
- MAIA hexagram interpretation;
- Council;
- generated guidance;
- timing claims;
- warnings;
- Pattern cognition;
- MAIA conversation;
- new crossings.

## Exact stop

CHANGES-UX-04 stops after the member can explicitly enter the I Ching practice, cast through an existing method, and return to the same Change.

The next act should not automatically be “more divination.”

The clean next boundary is:

> **FOUNDER VISUAL / EXPERIENTIAL WITNESS — CHANGES-UX-02 THROUGH UX-04**

Only after the Living Change room, Notice gesture, and symbolic-practice threshold are accepted together should MAIA Encounter be opened.
