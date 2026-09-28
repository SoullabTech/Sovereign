---
room: Personal Decision — Revisit Perspective
human_activity: Bringing explicit new lived evidence into another round of perspective without treating the earlier council direction as baseline truth.
surfaces:
  - app/decisions/[id]/page.tsx
  - app/decisions/decision-house.module.css
change_class: experiential
principles:
  - DECISIONS-UX-01 — time matters because choices develop
  - DECISIONS-UX-04 — council output is provisional perspective, never the decision
  - DECISIONS-UX-05 — new lived evidence can accumulate before re-consultation
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — earlier recommendation does not become authority merely because it came first
reference_surfaces:
  - docs/design/contracts/personal-decision-live-room.md
  - docs/design/contracts/personal-decision-notice.md
shared_with_house: explicit member gesture, member-authored evidence, preserved history, and no automatic interpretation.
distinct_to_room: another perspective round begins only after the member says what is different now. Recent kept moments remain visible as evidence but are not silently sent or summarized as the member's new framing.
screenshot_desktop: docs/design/contracts/screenshots/decisions-ux-06-revisit-after-submit-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/decisions-ux-06-revisit-mobile.png
experience_verification: 2026-09-27 authenticated local witness on isolated localhost:3699 using a temporary personal Decision with one prior council result and one real new Decision experience. Opening the Decision and opening the Revisit form produced zero consultation POSTs. The member-authored recent experience was visible as read-only evidence. Only after the member explicitly authored 'What is different now?' and pressed Gather perspective again did one consultation POST occur. The existing consultation route returned HTTP 200, persisted iteration 2, stored the member's exact session-notes text and updated state, preserved the prior iteration, and left the Decision active. Desktop before/after and mobile captures passed; temporary Decision, iterations, experience, session and member were deleted; residue zero.
---

# DECISIONS-UX-06 — Revisit Perspective from Explicit New Evidence

## Purpose

Let perspective change because reality changed.

A Decision that has already been consulted may later accumulate new evidence. Another council round must begin from what the member now knows or has lived, not from automatic repetition.

## Threshold

After perspective exists, the room may offer:

> **Revisit perspective →**

The explanatory stance is:

> A new round should begin from new lived evidence, not from the assumption that the earlier direction was right.

## Evidence remains visible

Recent member-kept Decision moments are shown inside the revisit chamber as read-only context.

They are not automatically submitted.

The member authors:

> **What is different now?**

and may optionally update:

> **What do you notice in yourself now?**

## Explicit handoff

Only the final gesture:

> **Gather perspective again**

calls the existing personal Decision consultation endpoint.

The request carries the member-authored sessionNotes and optional updated emotional state.

## Continuity

The existing consultation route retains the prior round as a Decision iteration and writes the new round as the next iteration.

The witness verified:

- prior round preserved;
- new round stored as iteration 2;
- exact member-authored new-evidence text stored as session_notes;
- updated member state stored;
- Decision remains active.

## What this does not mean

A later round does not prove movement toward the earlier recommendation.

The prior recommendation is historical perspective, not an objective baseline.

The room therefore renders prior rounds as **Earlier perspectives**, not progress steps.

## Exact stop

The next unresolved question is no longer perspective.

It is the human act the substrate still fails to represent:

> **What did the member actually choose?**

The next boundary should therefore be:

> **DECISIONS-UX-07 — MEMBER-AUTHORED CHOICE / RESOLUTION SUBSTRATE DESIGN ONLY**

No Resolve UI should be added until that object has a truthful durable representation.