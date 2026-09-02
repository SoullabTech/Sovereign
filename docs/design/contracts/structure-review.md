---
room: Structure Review
human_activity: reviewing MAIA's reading of a Work — understanding what she saw, correcting or
  questioning that reading, and deciding what the writer wants to take up before anything becomes
  authored structure
surfaces:
  - app/writers-studio/canvas/StructureReview.tsx
change_class: experiential
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
screenshot_desktop: docs/design/contracts/screenshots/writer-structure-review-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/writer-structure-review-mobile.png
witnessed_sha: 869e559c9
experience_verification: >
  Founder walk, 2026-09-02, authenticated, against a synthetic 14-section witness Work with a
  real unadopted Structure Review persisted in scratch Postgres, on the exact SHA 869e559c9.
  The runtime, the route, the command and the database were real; the manuscript was
  deliberately synthetic. Desktop and mobile (390x844), each walked
  before the crossing, through it, and after it, with the database read directly afterwards.
  What was looked for: whether "Make this my structure" reads as an act of authorship rather
  than another MAIA suggestion or an ordinary review edit; and whether, after the act, the room
  says the writer authored the structure rather than that MAIA changed the Work. Both held.
  MAIA's reading stayed visible and attributed, the writer's own alterations stayed
  distinguishable from it, and only the explicit act made the reviewed structure part of the
  Work. No redesign is indicated by this walk. Falsifier run on mobile with a breakpoint on
  /adopt: hard reload produced no call; the explicit button click produced a call stack of
  <button> -> cross() -> authorStructure(). Database after the mobile act: adopted true,
  adopted_review_revision 3, 4 canonical units, 14 memberships, Work content unchanged, second
  invocation refused already_adopted, with the four canonical units reached through
  adopted_from_proposal_id, so the provenance column was exercised rather than merely counted.
  The two screenshots depict the threshold as offered — desktop and mobile 390x844 before the
  crossing, the mobile one with the /adopt breakpoint armed and unpaused. SCOPE, by design: the
  synthetic Work is the instrument, not a shortfall — the mechanics were exercised without
  risking a real Work, and the machinery under them was entirely real. A later walk against a
  non-fixture manuscript is useful field validation, not part of this acceptance boundary.
  Full record:
  docs/programme/WS2-06A_RUNTIME_WITNESS_2026-09-02.md
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
| take it up as structure | "Make this my structure" | crossing from proposal to authored structure is the one boundary that may never be implicit, so the wording names the writer as the one doing it |

## The crossing

The room ends in one act, and the act is the writer's.

> **Make this my structure**
>
> This writes the structure you reviewed into your Work. MAIA cannot do this for you.

**Review may shape a possible structure. Only an explicit member act may make that structure part
of the Work. MAIA may prepare the threshold but may never cross it.**

The invitation carries no accent. Gold is not spent on a decision that belongs to the writer
alone: the surface makes the act available and unhurried, never attractive. It is the last thing
on the page, after everything that might change their mind, and it is **absent rather than
disabled** where the reading proposed no divisions — a greyed control would offer an act that does
not exist.

After the act the room says *"This is your structure now"* and names what the writer made part of
the Work. It does not report that MAIA changed anything, because she did not.

## The non-consent boundary

**Leaving the room, continuing to edit, silence, or failure to reject a proposal is never consent
to adoption.**

Held structurally, not by intention. On `869e559c9` the crossing is reached from exactly one place
in the surface; no `useEffect` body names it; the file contains no `setTimeout`, `setInterval`,
`requestIdleCallback` or `queueMicrotask`; no `beforeunload`, `unload`, `visibilitychange`,
`pagehide` or `popstate` handler exists; a refusal ends the gesture with no retry; and the client
issues exactly one POST carrying only the review revision. MAIA's Ask runtime cannot reach the
command at all. Pinned by
`lib/writersStudio/__tests__/adoptionRequiresGesture.test.ts` and
`lib/manuscript/ask/__tests__/askRuntimeCannotWrite.test.ts`.

## Forbidden here

- any gesture that turns a proposal into authored structure implicitly, by acceptance, by timeout,
  by arrival, by departure, by reload, or as a side effect of review
- styling the crossing as a call to action — an invitation designed to be taken is the system
  leaning on a decision that is the writer's
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
