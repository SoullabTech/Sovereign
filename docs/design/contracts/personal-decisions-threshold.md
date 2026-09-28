---
room: Personal Decisions — Threshold
human_activity: Entering Personal Decisions, beginning a choice, or returning to a choice already being lived.
surfaces:
  - app/decisions/page.tsx
  - app/decisions/decision-house.module.css
change_class: experiential
principles:
  - DECISIONS-UX-01 — the question comes before the apparatus
  - SOULLAB_LIVING_ORIENTATION_SYSTEM — choice remains one movement in a life, not an optimization problem
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — perspective informs; the member chooses
  - INHABITABLE_ARCHITECTURE_STANDARD — arrival precedes administration
reference_surfaces:
  - docs/design/contracts/personal-decisions-room.md
  - docs/design/contracts/changes-threshold-room.md
  - docs/design/contracts/journal-room.md
shared_with_house: warm architectural field, editorial serif hierarchy, restrained brass, quiet polarity, human-language gestures, and explicit return to House.
distinct_to_room: the threshold holds a live choice in balanced attention. It foregrounds the decision question and existing choices rather than filters, status badges or council machinery.
screenshot_desktop: docs/design/contracts/screenshots/decisions-ux-02-threshold-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/decisions-ux-02-threshold-mobile.png
experience_verification: 2026-09-27 authenticated local witness on isolated localhost:3699 using a temporary member with two open personal Decisions, one resolved Decision, and three real decision_experiences. Desktop and mobile rendered the new personal threshold, two open Decision cards, and the resolved section. The old Decision Council title and All/Draft/Active/Resolved filter strip were absent. The practitioner route /studio/decisions was not changed. Temporary Decisions, experiences, session and member were deleted; residue zero. localhost:3597 remained on the accepted Changes candidate.
---

# DECISIONS-UX-02 — Personal Decisions Threshold

## Purpose

Replace the personal Decisions dashboard arrival with a room organized around a human act:

> **What choice is asking something of you?**

## Arrival

The room opens with the choice, not the council.

The primary orientation says:

> Hold a real choice in view, gather perspective, and notice what changes — without handing the decision away.

A secondary boundary names the epistemic stance:

> **Perspective without surrender**

## Begin

The primary threshold is:

> **Bring a decision into view**

It does not promise a recommendation or resolution.

## Open Decisions

Open member-owned Decisions appear as living choice objects.

Each card shows only:

- status in human language;
- last updated date;
- member-authored title;
- member-authored context;
- whether perspectives have been gathered or how many lived moments exist;
- an explicit return gesture.

No confidence percentage, framing weight, emergence score, or recommendation appears at threshold.

## Resolved Decisions

Resolved choices are quieter and lower in the composition.

The room explicitly states:

> Resolved does not mean the council was right. It means you chose.

This preserves member authority over the meaning of resolution.

## Personal / Practice membrane

This act changes only `/decisions`.

`/studio/decisions` remains the practitioner decision-support surface and is not visually or behaviorally changed.

## Exact stop

The next clean act is:

> **DECISIONS-UX-03 — PHENOMENON-FIRST PERSONAL DECISION NAMING ONLY**

That act should let the member author the decision and context before stakes, state or time pressure appear, preserve carried-source provenance, remove auto-consult from creation, and stop before redesigning the Decision detail room.