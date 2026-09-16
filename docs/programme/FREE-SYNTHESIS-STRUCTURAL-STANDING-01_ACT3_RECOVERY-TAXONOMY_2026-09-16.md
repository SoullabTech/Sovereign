# FREE-SYNTHESIS-STRUCTURAL-STANDING-01 · ACT 3 — Recovery Taxonomy

**Date:** 2026-09-16
**Base:** `409496e32` / ACT 2 structural recovery
**Mode:** offline R&D only
**Production authority:** NONE

## Governing law

> **The substrate may repair relationships among things the model actually perceived. It may not supply perception the model failed to have.**

ACT 3 turns that law into a closed recovery taxonomy. Recovery is not a fallback generation strategy and is not a second reasoning pass.

## Operational disposition

There are only two runtime dispositions:

1. **RECOVERABLE_COMPOSITION** — eligible for the one-shot ACT 2 repair, subject to all ACT 2 predicates.
2. **HARD_STOP** — no structural repair is authorized.

Diagnostic attribution is separate: `model_plan`, `substrate_integrity`, `context_dependent`, or `unclassified`. This prevents a shared refusal code from being falsely attributed to MAIA or to the substrate.

## The only recoverable refusal

`superseded_without_current` is the sole currently recoverable code.

Even then, the code alone does not authorize repair. Recovery is allowed only when the authoritative current head is already referenced by the model as synthesis support, ground capacity remains bounded, synthesis and question are unchanged, and regeneration count remains zero.

## Hard-stop boundary

Hard stops include missing cognition (`recovery_current_not_referenced`), missing evidence descent (`synthesis_requires_support`), borrowed member voice, malformed or over-capacity plans, invented/unknown fields, and all substrate standing/invariant faults.

The substrate may not recover these by inventing evidence, adding provenance, deleting model-selected content, rewriting synthesis, rewriting questions, or re-prompting the model.

`unknown_evidence` is deliberately marked `context_dependent`: it may be a model-invented id or a broken substrate lineage reference. Either way the runtime disposition is HARD_STOP; blame requires call-site evidence.

## Completeness and future-default law

The proof censuses every `StandingEnvelopeRefused` code currently emitted by:

- `standing-envelope.ts`
- `claim-standing.ts`
- `structural-recovery.ts`

All **25/25** current codes are classified with zero missing and zero extra. Any future refusal code not in the taxonomy is automatically `HARD_STOP / unclassified`; adding a new code cannot silently widen recovery authority.

## One-shot / idempotence

A lawfully recovered plan, passed through the same recovery path again, renders normally without a second repair and produces the same digest. Recovery therefore changes composition once rather than creating a recovery loop.

## Frozen-plan non-regression

The four frozen ACT 1 correction plans were replayed with **zero model calls** after taxonomy enforcement:

- seed 42 — rendered → rendered, digest unchanged;
- seed 137 — rendered → rendered, digest unchanged;
- seed 211 — refused → recovered, `E-NOW` inserted visibly;
- seed 509 — rendered → rendered, digest unchanged.

All four preserve raw synthesis and question byte-for-byte.

## Proof standing

`recovery-taxonomy-proof.ts` passes **15/15** assertions. Prior proof surfaces remain green: base standing **14/14**, correction **15/15**, structural recovery **17/17**.

## Architectural finding

Structural recovery is now bounded by a negative rule rather than an aspiration:

> **Recovery authority is closed unless the substrate can prove that it is only surfacing authoritative structure the model already used.**

That makes refusal a first-class constitutional outcome. Conversational availability may motivate better plan interfaces, but it cannot widen recovery after the fact.

## Evidence

- `docs/programme/evidence/FREE_SYNTHESIS_STRUCTURAL_STANDING_ACT3_TAXONOMY_2026-09-16.json`
- `docs/programme/evidence/FREE_SYNTHESIS_STRUCTURAL_STANDING_ACT3_NONREGRESSION_2026-09-16.json`
- `scripts/research/structural-standing/recovery-taxonomy.ts`
- `scripts/research/structural-standing/recovery-taxonomy-proof.ts`

## Standing

ACT 3 is COMPLETE as offline R&D. No production change is authorized or implied.

The next unresolved question is upstream rather than downstream: can the **plan interface itself** make recoverable composition omissions rarer without adding behavioral prompt pressure or pre-writing MAIA's synthesis?
