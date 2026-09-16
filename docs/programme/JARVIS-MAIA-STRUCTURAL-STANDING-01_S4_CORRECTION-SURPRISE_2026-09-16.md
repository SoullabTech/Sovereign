# JARVIS-MAIA-STRUCTURAL-STANDING-01 — S4 Correction / Surprise

**Date:** 2026-09-16
**Mode:** offline R&D only
**Production authority:** NONE

## Purpose

Test the law inherited from Free Synthesis:

> **Surprise outranks continuity.**

A member correction must be able to reorganize present standing without deleting history and without fighting a prior MAIA interpretation that has accidentally hardened into fact.

## Two axes kept separate

S4 does not overload provenance with truth status.

1. **Source standing** — who authored the material and how it participates (`authoredBy`, `participationClass`, `authority`).
2. **Present claim standing** — which member-authored statement is the current head of one bounded claim lineage.

Present claim standing is derived from append-only member acts. The old utterance remains evidence. The new utterance succeeds it for present standing.

## Fixture

Historical member evidence:

> `I think autonomy is the center of this for me.`

Historical MAIA inference derived from it:

> `Autonomy seems to be the organizing center of what is happening.`

Later member correction:

> `Actually, grief is the center. Autonomy is how I have been organizing around it.`

The claim-standing chain is `E-OLD → E-NOW`. The MAIA inference is not a node in the member-standing chain.

## Structural proof

Final deterministic proof: **14 assertions PASS**.

Among the proved properties:

- historical member evidence remains present and is marked superseded, not deleted;
- the later member act is the only current head;
- MAIA inference cannot mint member claim standing;
- superseded evidence cannot be grounded alone;
- superseded evidence cannot support synthesis without the current head somewhere in the composition;
- a stale MAIA inference whose derivation descends from superseded evidence inherits the same correction requirement;
- the model plan cannot encode its own correction status.

That descendant rule is load-bearing. Without it, a system inference derived from stale member evidence could carry the old frame back in after the source evidence itself had been correctly superseded.

## Local-model surprise replay

Model: `llama3.1:8b`, temperature `0.2`, same four fixed seeds.

All four runs rendered successfully. All four reorganized around grief as the current center while preserving autonomy as historically meaningful rather than declaring it false.

One run selected the historical MAIA inference. It was permitted only because the same composition also referenced the current member correction. The inference therefore remained discussable as history without regaining present authority.

The model still made contestable interpretive moves — e.g. language about navigating or coping with grief. Those claims were not suppressed. They remained structurally MAIA-owned, provisional possibilities.

## S4 finding

Structural standing changes the correction problem from:

```text
old interpretation + new correction → competing prose in the model's context
```

to:

```text
immutable history
+ substrate-owned current standing
+ derived-lineage constraints
→ free provisional synthesis
```

The member does not need to persuade MAIA to relinquish its earlier frame. The earlier frame never acquires the kind of standing that would require persuasion.
