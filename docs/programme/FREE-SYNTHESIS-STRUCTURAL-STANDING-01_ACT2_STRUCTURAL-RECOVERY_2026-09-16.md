# FREE-SYNTHESIS-STRUCTURAL-STANDING-01 · ACT 2 — Structural Recovery

**Date:** 2026-09-16
**Base:** `a9639a626` / ACT 1 revalidation
**Mode:** offline R&D only
**Production authority:** NONE

## Governing question

Can an inadmissible plan recover from `superseded_without_current` without re-prompting the model, changing MAIA's synthesis, weakening correction dominance, or expanding the cognitive prompt?

## Recovery law

Recovery is permitted only for a narrow composition defect. The model plan must already reference the authoritative current standing head in synthesis support while failing to surface that head in visible ground.

The substrate may then lift that already-referenced current evidence id into ground exactly once. It may not regenerate, re-prompt, rewrite synthesis, rewrite the question, introduce evidence the model never referenced, remove stale evidence, or exceed the existing bounded ground capacity.

If those conditions do not hold, recovery fails closed.

## Proof

`structural-recovery-proof.ts` passes **17/17** assertions.

The proof establishes:

- the current standing head is inserted into visible ground;
- original ground order is preserved after the insertion;
- synthesis and question remain byte-for-byte unchanged;
- the raw model plan is not mutated;
- regeneration count is structurally zero;
- current authority cannot be introduced if the model never referenced it;
- recovery cannot exceed the three-ground-item bound;
- non-standing shape violations are never routed through recovery;
- stale member evidence remains historical;
- MAIA synthesis remains provisional;
- questions remain conditionally framed;
- stale MAIA inference derived from superseded evidence is rendered explicitly as historical stale lineage.

## Frozen-plan replay

The replay consumes the four frozen ACT 1 S4 plans from `FREE_SYNTHESIS_STRUCTURAL_STANDING_ACT1_S4_2026-09-16.json`. It makes **zero model calls**.

| Seed | ACT 1 | ACT 2 | Result |
| --- | --- | --- | --- |
| 42 | rendered | rendered | exact prior rendered digest preserved |
| 137 | rendered | rendered | exact prior rendered digest preserved |
| 211 | refused | recovered | `E-NOW` inserted; synthesis/question unchanged |
| 509 | rendered | rendered | exact prior rendered digest preserved |

The recovery therefore changes only the previously inadmissible composition. It does not perturb already-admissible plans.

## Seed 211 — exact structural repair

Original model ground:

`E-OLD + M-OLD`

The same model plan already cited `E-NOW` as synthesis support. Recovery changes ground to:

`E-NOW + E-OLD + M-OLD`

No model prose changes.

Rendering now says, in order:

1. **You now say** — current member correction (`E-NOW`);
2. **Earlier, you said** — superseded member evidence (`E-OLD`);
3. **Earlier, a system-originated inference derived from superseded evidence said** — stale MAIA inference (`M-OLD`);
4. MAIA's original synthesis, still marked **provisional**;
5. MAIA's original question, still conditionally framed.

## Why this is structural rather than prompt engineering

No prompt is changed. No prompt is sent. No second generation occurs. No model is asked to repair itself.

The substrate acts only on standing information it already owns and only promotes an evidence reference from hidden support to visible grounding when the model had already incorporated that current evidence.

This separates two failure classes:

- **composition omission** — current standing was cognitively present but not visibly grounded → recoverable structurally;
- **cognitive omission** — current standing was not referenced by the plan at all → not recoverable; fail closed.

That distinction prevents structural recovery from becoming a hidden second intelligence.

## Founder falsifier impact

- **SS-F1 NO-RESTART:** unchanged; ACT 2 does not reopen settled meaning.
- **SS-F2 NO-AUTHORITY-LAUNDERING:** strengthened; stale derived inference is visibly historical.
- **SS-F3 CORRECTION-DOMINANCE:** strengthened from safe refusal to one-shot structural recovery when and only when current standing was already incorporated.
- **SS-F4 EVIDENCE-DESCENT:** preserved; recovery cannot invent evidence and synthesis remains evidence-linked.
- **SS-F5 DISPOSABLE-GESTALT:** preserved; recovery is pure composition with no persistence path.
- **SS-F6 OPEN-EDGE:** preserved; question text is unchanged.
- **SS-F7 FREE-SYNTHESIS:** preserved; synthesis text is unchanged.
- **SS-F8 COGNITIVE-ECONOMY:** strengthened; ACT 2 costs **zero additional model tokens** and adds no prompt burden.

## Standing

`FREE-SYNTHESIS-STRUCTURAL-STANDING-01` remains **OPEN**.

ACT 2 demonstrates that one important class of inadmissible plan can be repaired without more prompt engineering and without weakening the standing boundary.

The next research question is no longer “can we retry?” It is:

> **What is the complete, minimal taxonomy of structurally recoverable composition failures versus failures that must remain hard refusals?**

No production implementation, prompt change, memory change, schema change, routing change, validator/egress change, or deployment is authorized or implied.
