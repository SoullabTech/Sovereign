---
room: Personal Decisions — Naming
human_activity: Putting a real choice into the member's own words before adding stakes, state or time pressure, and before inviting any council perspective.
surfaces:
  - app/decisions/new/page.tsx
  - app/decisions/decision-house.module.css
change_class: experiential
principles:
  - DECISIONS-UX-01 — phenomenon first; the decision belongs to the member
  - DECISIONS-UX-02 — the question comes before the apparatus
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — perspective cannot pre-author the choice
  - SOULLAB_LIVING_ORIENTATION_SYSTEM — carried source is provenance, not target meaning
reference_surfaces:
  - docs/design/contracts/personal-decisions-room.md
  - docs/design/contracts/personal-decisions-threshold.md
  - docs/design/contracts/changes-naming-threshold.md
shared_with_house: member-authored material first, explicit source provenance, material paper surface, quiet contextual deepening, and one clear Keep gesture.
distinct_to_room: a Decision begins as a choice and the context that makes it real. Stakes, time pressure and present state appear only after those words exist, and council consultation is deferred until after the Decision has been kept.
screenshot_desktop: docs/design/contracts/screenshots/decisions-ux-03-after-words-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/decisions-ux-03-mobile.png
experience_verification: 2026-09-27 authenticated local witness on isolated localhost:3699 with a temporary member. Before the member authored both the choice and its context, zero secondary context fields were rendered and zero consultation POSTs occurred. After both authored fields contained words, stakes, time pressure and present-state context appeared. Keep this Decision returned HTTP 200 through the existing personal Decisions POST, persisted exactly one personal-scope Decision with situation_type=self and the member's exact title/context, routed to the exact /decisions/<uuid> detail, and produced zero consultation POSTs. Desktop before/after and mobile captures passed; temporary Decision, session and member were deleted; residue zero.
---

# DECISIONS-UX-03 — Phenomenon-First Personal Decision Naming

## Purpose

Make the member's actual choice the first material in the room.

The creation sequence is:

> **What are you deciding?**
>
> member-authored choice
>
> member-authored context
>
> optional surrounding context
>
> explicit Keep

Council consultation is not part of creation.

## Primary authored material

The first two fields are:

- **The choice**
- **What makes this a real choice now?**

No stakes, time-pressure or state controls appear before both contain member-authored words.

## Secondary context

Only after the choice and context exist does the room offer:

- What feels at stake?
- How much time is actually here?
- What do you notice in yourself?

These are optional context for later perspective.

They are not diagnostic variables and do not determine a recommendation.

## Source crossings

Journal, Reflection, Idea or Relationship provenance remains visible through the existing FacetCarryNotice.

The source does not prefill the choice, context, stakes or state.

## Continuing from an earlier Decision

A parent Decision may be named as provenance:

> **Continuing from …**

The earlier council recommendation is **not** copied into the new Decision context.

This repairs the legacy behavior where system-authored recommendation text could arrive prefilled inside the member's next decision.

The prior Decision may contextualize the new one. It does not author it.

## No auto-consult

The old creation flow offered Save & Consult before the member had even entered the Decision room.

Personal Decisions now performs exactly one act at creation:

> **Keep this Decision**

The existing POST persists the member-owned Decision and routes to its exact room.

Perspective is a later explicit threshold.

## Persistence

The existing /api/studio/decisions route remains authoritative.

Personal creation sends:

- scope=personal;
- exact member-authored title;
- exact member-authored context;
- optional stakes;
- explicit timePressure;
- optional emotionalState;
- situationType=self;
- optional parentDecisionId;
- optional governed sourceRef.

No schema change is introduced.

## Exact stop

The next clean boundary is:

> **DECISIONS-UX-04 — PERSONAL DECISION ROOM + INVITED PERSPECTIVE CONTRACT**

That act should rebuild the personal detail surface around the member's choice, move the council behind an explicit Gather perspectives gesture, remove confidence/weight machinery from the primary experience, preserve iteration history, and stop before inventing a new durable resolution field.