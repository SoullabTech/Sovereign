---
room: Personal Decision — Notice
human_activity: Recording what actually changed around a live choice before deciding what kind of evidence or meaning it represents.
surfaces:
  - app/decisions/[id]/page.tsx
  - app/decisions/decision-house.module.css
change_class: experiential
principles:
  - DECISIONS-UX-01 — time matters because choices develop
  - DECISIONS-UX-04 — the Decision remains primary while lived evidence accumulates
  - CHANGES-UX-03 — phenomenon first; classification second
  - MAIA_OATH — member experience may be kept without council interpretation
reference_surfaces:
  - docs/design/contracts/personal-decision-live-room.md
  - docs/design/contracts/changes-notice.md
shared_with_house: member-authored evidence first, optional classification second, explicit Keep, and no automatic interpretation.
distinct_to_room: Notice records what happened around a live choice so later perspective can respond to changed reality rather than merely repeat the original framing.
screenshot_desktop: docs/design/contracts/screenshots/decisions-ux-05-notice-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/decisions-ux-05-notice-mobile.png
experience_verification: 2026-09-27 authenticated local witness on isolated localhost:3699 using a temporary personal Decision. Opening Notice produced zero council POSTs and no experience-type choices before authored words. After the member wrote what happened, optional moment/reflection/breakthrough/setback distinctions appeared. Choosing reflection and Keep this moment returned HTTP 200 through the existing personal decision_experiences endpoint and persisted the exact authored content as one reflection. No consultation occurred. Desktop and mobile captures passed; temporary Decision, experience, session and member were deleted; residue zero.
---

# DECISIONS-UX-05 — Notice What Changed

## Purpose

Give a live Decision a way to accumulate real-world evidence without forcing immediate re-analysis.

The opening gesture is:

> **Notice what changed**

## Phenomenon first

The first question is:

> **What happened around this choice?**

No category appears before the member writes.

After words exist, the member may optionally distinguish the moment as:

- a moment;
- a reflection;
- a breakthrough;
- a setback.

The default remains field_event.

## Persistence

The existing endpoint remains authoritative:

/api/studio/decisions/[id]/experiences?scope=personal

No new schema or event type is introduced.

The exact member-authored content is persisted.

## Council boundary

Keeping a moment does not automatically:

- run the council;
- update a recommendation;
- change status;
- create a mentor reflection;
- reinterpret the Decision.

The member can accumulate evidence before deciding whether another perspective is useful.

## Exact stop

The next clean act is:

> **DECISIONS-UX-06 — REVISIT PERSPECTIVE FROM EXPLICIT NEW EVIDENCE ONLY**

That act should let the member explicitly bring what changed into another council round without treating the prior recommendation as baseline truth, then stop before Decision resolution.