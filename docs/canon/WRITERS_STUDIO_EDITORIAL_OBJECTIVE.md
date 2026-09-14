# Writer's Studio · the editorial objective

**Ratified** founder, 2026-09-14.
**Standing** This is the criterion every Writer's Studio feature is judged
against from here forward. It is not a feature list and not a roadmap.

---

## The objective

> MAIA should function as an intelligent editorial partner who can read the Work
> in context, notice what may need attention, discuss it with the writer, offer
> possibilities, answer questions, generate and revise proposed wording, receive
> the writer's edits and direction, and continue working together until the
> writer is satisfied — then apply only the exact final changes the writer
> explicitly approves.

⛔ **Not** `AI finds error → AI fixes error → author approves.`

```
MAIA reads the Work
      ↓  notices something worth attention
      ↓  shows the writer where, and why
      ↓  writer asks · questions · disagrees · explores
      ↓  MAIA offers possibilities
      ↓  writer edits or redirects
      ↓  MAIA revises
      ↓  they continue until it feels right
      ↓  writer sees the exact final result
      ↓  writer approves
      ↓  MAIA applies THAT EXACT VERSION to the Work
      ↓  the Work is reread in its new context
```

## The two laws

> **Nothing moves directly from MAIA's perception into the manuscript. It moves
> through relationship with the writer.**

> **The purpose of Writer's Studio is not to automate editing. It is to make
> deep editorial collaboration unusually fluid, contextual, intelligible, and
> safe.**

## The scales — and the UI adapts to them

Grammar and mechanics · sentence craft · paragraph craft · context · voice ·
argument and meaning · continuity · repetition · structure · whole-book
development.

⛔ **These may not all be forced through one "Proposed Change" card.** A comma
should be nearly invisible. A recurrence across three chapters deserves a guided
workspace. Grammar should feel light; developmental editing should feel
spacious.

## The four kinds — ratified

| kind | what MAIA is doing | may bind to an authorization? |
|---|---|---|
| **INSIGHT** | noticing something about the Work | no |
| **DIRECTION** | naming a way the Work could develop | no |
| **SUGGESTION** | offering a concrete editorial idea | no |
| **CHANGE** | proposing exact wording at an exact locus | **only this one** |

⭐ The first three are **not forbidden from writing — there is no executable
object for them to become.** That is safer than attaching increasingly
permissive flags to one generic suggestion object.

⛔ **Upward movement requires the member.** MAIA may say *"I can make that
concrete if you want."* She may not decide an insight is now an exact change
because she has enough confidence.

⚠️ **DIRECTION is a direction the Work could take**, never MAIA directing the
writer. The no-guru-stance invariant lives in that word.

## The writer remains the active author

The exchange the whole product exists for:

> **MAIA** — I think this repeats the earlier story.
> **Kelly** — No. The repetition is intentional; this time I understand what
> happened.
> **MAIA** — That changes my reading. Then the issue may not be repetition but
> making the evolution clearer. Want to work on that instead?

⭐⭐ **The writer's disagreement is editorial information, not an objection to
overcome.** MAIA must be able to revise her *reading*, not only her wording —
and must not keep re-proposing a diagnosis the writer has ruled on.

## Honest standing · what exists and what does not

```
BUILT · WITNESSED
  the membrane            a change can be held against the Work without
                          becoming it — exact locus, both views, server-resolved
                          authority, inspection-only structural, exact-once
                          acceptance, three independent refusals
  the writer's ruling     EDITORIAL-DECISION-01 — a member-authored editorial
                          decision, append-only, sibling to the standing chain

NEXT
  step 3                  staged-version succession with per-version authorship
                          — what makes "MAIA v1 → v2 → v3 → KELLY v4" truthful,
                          and therefore what makes the wording loop possible

NOT BUILT
  MAIA proposes           nothing MAIA has read has ever become a proposal
  insight · direction     no object exists for either
  the pattern workspace   recurrence sets, sequential walk-through, completion
  the conversational UX   deliberately unfrozen pending interaction research
```

⚠️ **The current proposal panel is witness instrumentation.** It proved the
machinery. ⛔ It is not the design template, and no further polish goes into it.

⭐ **The connection not yet made:** EDITORIAL-DECISION-01 already exists for
*"Kelly disagreed, explained why, and that ruling should govern future
suggestions."* It is built, witnessed and closed — and entirely unconnected to
the proposal path. That seam is worth opening before inventing anything new.

## The test

Every feature is judged by whether the writer can answer, without explanation:

```
Where am I?
What did MAIA notice?
What evidence is she looking at?
Is this an insight, a direction, a suggestion, or an exact change?
What happens if I act?
What have we already decided elsewhere?
```

⛔ Never make the writer infer what the system is doing.
⛔ Never make the writer mentally reconstruct a result the interface can show.
⛔ Complexity belongs underneath the experience, not inside it.

The member should never meet `proposal_work`, `execution_authority`,
`expected_text`, a coordinate space, or a succession chain.

> *notice → understand → discuss → explore → revise → refine → decide → apply*


---

## Appendix · what the interaction research must answer

**Ratified 2026-09-14.** ⛔ The lane answers SCENARIOS, not *"what features do
other editors have?"* A feature survey produces a pile of buttons; a scenario
survey produces an interaction model.

```
tiny grammar correction
awkward sentence
paragraph restructuring
chapter-level problem
three similar stories across the book
recurring metaphor whose meaning evolves
contradiction between distant chapters
structural relocation
source / factual uncertainty
the writer disagrees with MAIA and teaches her why
repeated MAIA/writer revisions before final approval
```

⭐ **Visual and interaction craft belongs at the BEGINNING of that work, not
after.** The three-story case is partly spatial: the writer must perceive the
occurrences, their distance through the book, their differing roles, and their
own progress through them. ⛔ That cannot be solved by better button labels once
the interaction model has hardened.

The experiential target, against which every candidate is measured:

> *MAIA noticed something. Here it is in your Work. Here's what she means.
> Here's why it may matter. Want to work on it together?*

Everything complicated happens underneath that sentence.

---

## What is kept from the witness build, and what is not

```
KEPT — the membrane
  exact locus · Work-state binding · inspection-only authority · provenance
  atomic acceptance · stale-state refusal · server-owned section authority
  the Current → Would read computation

NOT KEPT as the UX template
  the Proposed Change card
  system-shaped language
  one-card-fits-all editing
  forms standing in for conversation
```

⛔ **The panel is frozen at `e5b363995`.** No further polish pending the research.
