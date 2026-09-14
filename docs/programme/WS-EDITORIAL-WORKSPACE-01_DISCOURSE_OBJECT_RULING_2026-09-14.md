# WS-EDITORIAL-WORKSPACE-01 · DISCOURSE OBJECT RULING — 2026-09-14

**RECORD ONLY.** No code, no schema, no migration, no implementation authorization.

Transferred into this lane by the conductor. It gives W5 the ontology it must
satisfy when that act is opened. **It does not authorize W5 schema.**

---

## The ruling

> **Editorial discourse and proposal succession are one experience but different
> durable objects. Insight, Direction, Question/Discourse, and
> Recommendation-to-keep are non-authorizable conversational acts.
> `ProposalVersion` remains exact authored candidate wording only. A conversational
> act may causally produce a version, but is never stored inside, derived from, or
> conflated with that version.**

## The discriminator

> **MAIA may conclude "keep the current wording" without creating any
> `ProposalVersion`.**

A valid editorial turn; zero versions created. Any candidate representation that
cannot express this turn is refused — a conversation derived from proposal versions
literally cannot represent it.

## Boundary

```
conversation  ≠ formulation
formulation   ≠ authorization
authorization ≠ execution
```

The writer experiences *"MAIA and I are working on this paragraph."* The
architecture preserves all four as distinct.

## Why direction-on-version is false provenance

A member DIRECTION that causes a MAIA SUGGESTION is **two authored acts**. Storing
the direction on the version it caused makes a MAIA-authored object carry
member-authored instruction text — precisely the confusion succession exists to
prevent.

Causal linkage, when it is eventually designed, is **provenance, not ownership**: it
says *this version arose in response to that conversational act*; it does not say
*that act is part of this version*.

## Authority per act

| Act | Can contain wording? | Can be authorized? |
|---|---|---|
| Insight | no | no |
| Question | no | no |
| Direction | no | no |
| Explanation / discourse | no | no |
| Recommendation to keep | no | no |
| Suggestion / `ProposalVersion` | yes | **yes** |
| Authorization | points to exact version | executes permission |

⛔ **No generic `comment` table.** It would flatten editorial acts of differing
authority into chat messages.

## Explicitly rejected

- ⛔ Deriving conversation from version lineage.
- ⛔ Attaching the writer's direction text to the version it caused.
- ⛔ The claim that *"the conversation and the version lineage are the same object."*
  They are **one experience, not one object.**

## Standing

- This lane (`claude/proposal-authorization-integration`, W2 landed) implements the
  ruling when W3/W5 are opened by explicit act.
- ⛔ W5 schema is **not** authorized by this transfer. A docs transfer must never
  quietly become *"the schema decision was already made."*
- Conductor source: `docs/programme/JARVIS-WS-CONVERGENCE-CONTRACT_2026-09-14.md`
  on the conductor record ref. That contract is **not** merged here; only this
  ruling is.
