# FREE-SYNTHESIS-STRUCTURAL-STANDING-01 · ACT 6 — Interpretive Basis, Not Entailment

**Date:** 2026-09-16
**Base:** `49ca2f17a` / ACT 5 support-derived ground
**Mode:** offline R&D only
**Production authority:** NONE

## Problem

ACT 5 exposed a semantic hazard: a model can attach a real evidence id to a synthesis clause that the evidence does not actually entail. Referential evidence descent is not the same thing as semantic proof.

Trying to solve that by adding another model as an entailment judge would recreate the very authority problem this programme is separating: a second interpreter would decide which meanings MAIA is allowed to form.

## Ruling tested

> **Evidence references attached to free synthesis express lineage/basis, not entailment.**

Only substrate-owned evidence or substrate-owned typed relations may carry grounded standing. MAIA-authored novel meaning remains `maia_provisional` regardless of how many evidence ids it references.

The plan field therefore changes from `supportEvidenceIds` to `basisEvidenceIds`, and the trace states explicitly:

`basisSemantics: lineage_not_entailment`.

This is an epistemic type distinction, not a claim that semantic correctness has been solved.

## Pure proof

`interpretive-basis-envelope-proof.ts` passes **9/9** assertions, including the exact ACT 5 hazard: a speculative clause about previously overshadowed emotions may be rendered as MAIA's provisional possibility with traceable basis, but it cannot be represented as member evidence or as evidence-entailment.

Unknown basis evidence and borrowed member first-person voice still fail closed.

## Local replay

Same correction fixture, same `llama3.1:8b`, temperature 0.2, seeds 42 / 137 / 211 / 509.

Result:

- direct renders: **4/4**;
- current member standing visibly grounded: **4/4**;
- basis semantics `lineage_not_entailment`: **4/4**;
- basis selected: `E-NOW` in all four runs;
- observed prompt-eval count: **363**;
- prompt: **1,582 chars**, versus ACT 5's 1,584.

Free synthesis survives the epistemic type change. No entailment validator or second inference pass is introduced.

## Constitutional distinction

The system now has three different epistemic objects:

1. **Primary / substrate-grounded evidence** — authorship and standing come from the act that created it.
2. **Substrate-owned derived relations** — may be grounded only when their derivation/provenance law establishes that status.
3. **MAIA-authored synthesis** — may have reversible evidence lineage but remains provisional interpretation; lineage is never proof.

This resolves the false implication contained in the word `support` without pretending that arbitrary synthesis has become semantically verified.

## What remains open

ACT 6 does not detect whether a provisional interpretation is wise, relevant, beautiful, or overdrawn. Those are cognition/relationship quality questions, not standing questions.

The safety property is narrower and stronger: **an interpretation can be wrong without becoming member truth.**

## Architectural finding

> **Provenance can be structural. Meaning remains interpretive. Do not ask provenance machinery to certify interpretation as truth.**

This preserves MAIA's freedom to see more than the literal record while keeping the record authoritative about what the member actually said, corrected, adopted, or rejected.

## Evidence

- `docs/programme/evidence/FREE_SYNTHESIS_STRUCTURAL_STANDING_ACT6_INTERPRETIVE_BASIS_2026-09-16.json`
- `docs/programme/evidence/FREE_SYNTHESIS_STRUCTURAL_STANDING_ACT6_SUMMARY_2026-09-16.json`
- `scripts/research/structural-standing/interpretive-basis-envelope.ts`
- `scripts/research/structural-standing/interpretive-basis-envelope-proof.ts`
- `scripts/research/structural-standing/act6-interpretive-basis-replay.ts`

## Standing

ACT 6 is COMPLETE as bounded offline R&D. No production change is authorized or implied.

The next meaningful test should leave the single correction fixture and return to the **Alive-MAIA benchmark corpus**: does this architecture preserve whole-arc perception and relational initiative across qualitatively different conversations, not only Silver Cedar / correction standing?
