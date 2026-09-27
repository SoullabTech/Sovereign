---
room: Personal Decision — Living Room
human_activity: Holding one member-owned choice in view, inviting perspective when wanted, and returning to lived evidence without allowing the council to become the decision-maker.
surfaces:
  - app/decisions/[id]/page.tsx
  - app/decisions/decision-house.module.css
change_class: experiential
principles:
  - DECISIONS-UX-01 — the Decision remains primary; perspective is plural and provisional
  - DECISIONS-UX-03 — council consultation happens only after the Decision exists
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — council output cannot become choice authority
  - SOULLAB_LIVING_ORIENTATION_SYSTEM — exact source provenance and Daily Anchor crossings remain explicit
reference_surfaces:
  - docs/design/contracts/personal-decisions-room.md
  - docs/design/contracts/personal-decisions-naming.md
  - docs/design/contracts/changes-maia-encounter.md
shared_with_house: material member-authored object, explicit provenance, reversible depth, quiet contextual side field, and human-language gestures.
distinct_to_room: the member's choice remains visibly stable while a separate perspective field can open around it. Council synthesis is rendered as material to think with, never a verdict or score.
screenshot_desktop: docs/design/contracts/screenshots/decisions-ux-04-after-perspective-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/decisions-ux-04-mobile.png
experience_verification: 2026-09-27 authenticated local witness on isolated localhost:3699 with a temporary personal Decision and two real decision_experiences. Opening the Decision produced zero consultation POSTs and no visible confidence/weight controls. Only the explicit Gather perspectives gesture produced one consult POST; the existing personal consult route returned HTTP 200, persisted one council result, set status active and iteration_count=1, and returned to the same Decision room. The rebuilt room rendered member-authored choice/context as the stable paper object and presented council material as What became visible, Tensions worth holding, Risks and uncertainties, and One possible direction with an explicit non-verdict boundary. Raw framing weights and confidence percentages are not rendered by the room. Desktop and mobile captures passed. Temporary Decision, iterations, experiences, session and member were deleted; residue zero.
---

# DECISIONS-UX-04 — Personal Decision Room + Invited Perspective

## Purpose

Replace the personal Decision detail dashboard with one lived Decision room.

The governing spatial fact is:

> **The choice remains present while perspective opens around it.**

## The choice as primary object

The member's title and context are rendered on the most materially stable surface.

Stakes, time and present-state language remain subordinate context.

House provenance remains visible through the existing FacetOriginTrail.

The existing Decision → Daily Anchor crossing remains:

> **Hold this choice today →**

## Perspective threshold

If no council result exists, the room offers one explicit gesture:

> **Gather perspectives**

Before invocation the room states:

> Different lenses may expose assumptions, tensions, risks and possibilities. They do not produce the answer.

Opening the Decision itself does not call the council.

## Council presentation

After consultation, the room renders only human-useful perspective:

### What became visible
- existing council insights;

### Tensions worth holding
- existing council tensions;

### Risks and uncertainties
- existing council risks;

### One possible direction
- the existing council recommendation, explicitly reframed as a council suggestion rather than a verdict.

The room does not render:

- confidence percentage;
- framing weights;
- emergence score;
- raw model-routing metadata;
- a 'winner';
- a claim that the recommendation is the decision.

## Existing experiences

Member-owned decision_experiences remain visible as:

> **What has happened since**

UX-04 reads them only.

Writing a new moment is a separate next act.

## Iteration history

If prior consultation rounds exist, they remain visible as earlier perspective in time.

Earlier recommendations are not treated as baseline truth.

## Resolution boundary

A current Decision may carry status=complete.

That status is rendered as resolved, but UX-04 does not add a Resolve button because the substrate has no first-class member-authored record of **what the member actually chose**.

Marking a choice resolved without recording the choice would complete the system state while leaving the human act absent.

That substrate gap remains explicit.

## Practice separation

`/studio/decisions/[id]` is untouched.

Practitioner loops, clients, protocols, field signals, occupancy, professional notes and practice council tooling remain in Studio.

## Exact stop

The next clean act is:

> **DECISIONS-UX-05 — NOTICE WHAT CHANGED AS MEMBER-AUTHORED EVIDENCE ONLY**

That act should bind the existing personal decision_experiences POST behind one phenomenon-first gesture, then stop before re-consultation or resolution.