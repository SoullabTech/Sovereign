---
room: Focus — Capture
human_activity: getting a thought or a next step out of one's head and into a trusted place

surfaces:
  - components/focus/InboxTriage.tsx
  - components/focus/NextStepBuilder.tsx

change_class: structural

principles:
  - INHABITABLE_ARCHITECTURE — capture serves the member's present activity rather than exposing system machinery
  - MAIA_SOVEREIGNTY_INVARIANTS — stewardship weight is information for the member, never leverage over them

reference_surfaces:
  - docs/design/contracts/journal-room.md — neighboring capture boundary; the member's own words stay the member's
  - docs/design/contracts/_TEMPLATE.md

shared_with_house: the House's restrained gestures, truthful state, and human-language labels
distinct_to_room: capture is deliberately fast and low-ceremony; the member is mid-thought, and the surface should cost them nothing to use

structural_rationale: >
  The only change to these two surfaces is a TypeScript annotation. `let stewardship = null`
  became `let stewardship: TriageResult['stewardship']` (and the NextStepResult equivalent),
  declaring the type the surrounding interface already specified instead of inferring an
  evolving-any that retained `null`. No rendered control, layout, copy, palette, spacing,
  navigation hierarchy or gesture changed. The emitted result now carries `undefined` rather
  than `null` when the stewardship fetch fails; verified no consumer compares the field to
  `null`, and the interface already declared it optional, so absent-as-undefined is the shape
  consumers were already typed against. ⛔ This contract makes no claim about the rest of
  these surfaces' design, which predates it and was not reviewed here.
---

# Focus — Capture — Experience Contract

## What this room is for

Getting something out of your head. A thought arrives mid-task and the cost of
recording it should be near zero — otherwise the member carries it, and carrying
it is the thing the room exists to stop.

## Arrival

The member does not arrive here. These surfaces open over whatever the member was
already doing and close again, which is why they must not ask for more than the
thought itself.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| record a capture | the member's own words, unedited | the capture is theirs, not a parsed record |
| name a next step | "next step", not "task" | a step is something you take; a task is something assigned to you |

## Forbidden here

- a dashboard or metric tile of captures
- stewardship weight presented as a score, a target, or a reason to do more
- ceremony between the thought and it being recorded

## Scope of this contract

⚠️ **Narrow by construction.** It was opened by a one-line type fix, and it claims
only what that change touched. The room's existing copy, layout and gestures are
described above as observed, ⛔ not ratified — a fuller reading is owed whenever
these surfaces are next changed experientially.

## The two brand tests

**Same house?** Yes — human-language labels, restrained gestures, no scoring.

**Distinct room?** Capture is the House's fastest room. Where Journal invites
dwelling, this one is built to be left.
