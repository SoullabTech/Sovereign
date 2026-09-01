---
room: Structure Review
human_activity: reviewing MAIA's reading of a Work — understanding what she saw, correcting or
  questioning that reading, and deciding what the writer wants to take up before anything becomes
  authored structure
surfaces:
  - app/writers-studio/canvas/StructureReview.tsx
change_class: structural
principles:
  - INHABITABLE_ARCHITECTURE — the room is defined by the human activity of editorial review, not
    the proposal data model
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — perception and proposal may flow toward the writer;
    authorship never flows back without an explicit act
  - MAIA_OATH — MAIA is an editorial interlocutor, not an authority over the Work
  - proposal ≠ structure — a reading remains reviewable and reversible until authored
  - provenance voice — MAIA's labels are words about perceived divisions, never silently
    substituted for the writer's titles
reference_surfaces:
  - docs/design/writer-studio/WS2-05B-8B-02c-1_CONVERSATION_CONTRACT.md
  - docs/design/writer-studio/WS2-05B-8B-02c-2_ANCHORED_ASK.md
  - docs/design/writer-studio/WS2-05B-8B-02c-0_CANONICAL_CONVERGENCE.md
  - docs/design/contracts/studio-home.md
shared_with_house: the Writer's Studio field hierarchy · the Press serif and palette · the
  restrained gesture language · provenance voice · and the constitutional direction of authority —
  MAIA may perceive and propose; the writer decides what belongs to the Work
distinct_to_room: this is the editorial table between MAIA's perception and the writer's
  authorship. The proposal is visible as a reading about the Work, never as the Work itself.
  Questions and uncertainty are invitations to inspect or converse, not commands. Review may
  reshape the proposal, but nothing becomes authored structure implicitly; crossing that boundary
  requires the writer's separate explicit act.
structural_rationale: This change moves an existing useCallback above the component's loading
  return so React executes the same hooks in the same order on loading and loaded renders. It
  changes no rendered copy, layout, styling, gesture, anchor semantics, editorial behaviour, or
  information hierarchy. The callback body and member-visible behaviour are unchanged; the repair
  only allows the already-designed loaded state to render without violating React's hook-order
  invariant. The room itself remains an experiential room — a future visual or interaction change
  must raise change_class back to experiential and carry the evidence that class requires.
---

# Structure Review — Experience Contract

## What this room is for

A writer comes here to read MAIA's reading. They are neither arriving at the Studio nor writing
prose — they are judging an editorial perception of a Work they already made. The activity is
understanding what she saw, correcting or questioning it where it is wrong, and deciding what, if
anything, they want to take up. Nothing here is the Work. Everything here is a claim *about* the
Work, held at arm's length until the writer decides otherwise.

This room is a governance registration of an already-settled design. Its identity, boundaries and
language were established by the WS2-05B/8B/02c architecture named in `reference_surfaces`; this
contract records them, it does not invent them.

## Arrival

> **Here is how I read this Work. Tell me where I have it wrong.**

The writer meets a reading, attributed to MAIA and marked as hers. They can see what she divided,
where she was uncertain, and what she is asking about — and they can leave all of it exactly where
it is without consequence. The room owes them the ability to disagree cheaply.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| inspect a perceived division | "See what she read here" | the writer is opening a perception, not a record |
| answer or push back on a question | "Tell her" / "Ask her about this" | a question is an invitation to converse, never a task assigned to the writer |
| reshape the reading | "Change this reading" | the object being edited is the proposal, and the wording keeps saying so |
| take it up as structure | a separate, explicit, named act | crossing from proposal to authored structure is the one boundary that may never be implicit |

## Forbidden here

- any gesture that turns a proposal into authored structure implicitly, by acceptance, by timeout,
  or as a side effect of review
- presenting the reading as the Work, or MAIA's labels as the writer's titles
- framing uncertainty or questions as instructions, tasks, or a checklist the writer must clear
- authority language — recommendation, correction of the writer, confidence scoring of the Work
- dashboard or card-per-entity listing of divisions as though they were settled objects

## The two brand tests

**Same house?** Yes. Field hierarchy, Press serif and palette, restrained gestures and provenance
voice are all held in common with Studio Home and the Manuscript Room — a writer crossing in does
not change buildings.

**Distinct room?** Yes, and the distinction is the point. Studio Home is arrival across a whole
practice; the Manuscript Room is authorship. This is the only room whose subject is *someone
else's reading* of the writer's work, and the only one whose central discipline is keeping that
reading from becoming the thing it describes.
