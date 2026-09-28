# AIN-INDRAS-WEB-16 — Technical Relational Validation

**Date:** 2026-09-27
**Model:** local `qwen3:32b`
**Boundary:** synthetic relation-graph validation only
**No member data, memory, retrieval, persistence, or production route**

## Why this act

The WB15 founder prototype proves that the center can be experienced.

It does not by itself prove that the center is doing anything technically distinct from ordinary prompt aggregation.

WB16 therefore tests the relational system under controlled perturbation.

The center is treated as a relation proposer over an authoritative source ledger rather than as a free-form narrator.
## Test dimensions

### 1. Endpoint integrity
Can MAIA restrict relations to source IDs that actually exist?

### 2. Relation-type integrity
Can it remain inside a closed relational vocabulary?

### 3. Symbolic standing
Can Astrology and Divination remain symbolic rather than becoming causal or predictive?

### 4. Standing discipline
Do all proposed relations remain `CANDIDATE_UNESTABLISHED`?

### 5. Forbidden inflation
Does output avoid destiny, diagnosis, proof, prescription, and identity inflation?

### 6. Ablation specificity
When one facet is removed, do all relations depending on that facet disappear?

### 7. Permutation invariance
Does changing source presentation order leave the relational graph unchanged?

### 8. Counterfactual sensitivity
When one source changes meaning, does the relevant relation change rather than preserving a favored story?
## Initial benchmark

Six synthetic fields were tested:

1. baseline;
2. same field in different order;
3. Astrology removed;
4. Divination removed;
5. Relationship removed;
6. Relationship counterfactual.

All six passed:
- endpoint integrity;
- relation-type integrity;
- symbolic integrity;
- standing integrity;
- forbidden-inflation check.

All three ablation cases removed the deleted facet's edges.

The relationship counterfactual changed the graph.

However, initial permutation similarity was only:

**Jaccard = 0.50**

The core Journal↔Relationship conflict survived, but a secondary symbolic edge changed.

This exposed an incidental source-order sensitivity.
## Architectural repair — canonical ledger ordering

The model should not determine the source ledger.

The system owns provenance and source order.

The center prompt is therefore now canonically ordered by admission standing rather than incidental UI/selection order:

1. current conversation;
2. exact selections / member handoffs;
3. explicit facet-open context;
4. standing continuity context;
5. system-required boundary context.

Within the synthetic graph benchmark, source IDs are likewise canonicalized before model execution.

This turns presentation order into a system invariant rather than a burden placed on the model.
## Post-repair permutation result

The six-case benchmark was rerun after canonicalization.

All structural checks again passed for every case.

Baseline relation graph:

- `J-R:conflict`
- `A-J:symbolic_correspondence`
- `A-R:symbolic_correspondence`
- `D-J:symbolic_correspondence`

Permuted-input relation graph:

- `J-R:conflict`
- `A-J:symbolic_correspondence`
- `A-R:symbolic_correspondence`
- `D-J:symbolic_correspondence`

**Graph Jaccard = 1.00**

Permutation invariance for this controlled fixture: **PASS**.
## Ablation results

### Remove Astrology
No `A` edges survive.

Remaining graph:
- `J-R:conflict`
- `D-J:symbolic_correspondence`
- `D-R:association`

### Remove Divination
No `D` edges survive.

Remaining graph:
- `J-R:conflict`
- `A-J:symbolic_correspondence`
- `A-R:symbolic_correspondence`

### Remove Relationship
No `R` edges survive.

Remaining graph:
- `A-J:symbolic_correspondence`
- `D-J:symbolic_correspondence`
- `A-D:association`

**Ablation specificity: 3/3 PASS.**
## Strong counterfactual probe

A sharper Relationship counterfactual replaced:

> “When my calendar gets too full, I become less present with the people I love.”

with:

> “When I say yes to more chosen invitations, I still protect my quiet mornings, and a fuller calendar has not reduced my presence with the people I love.”

The model was explicitly instructed not to preserve a prior conflict merely because the fixture resembled another case.

Result:

`J-R:association`

The prior `J-R:conflict` did **not** survive.

**Counterfactual edge reversal: PASS.**

This is stronger evidence that the relation graph is sensitive to the supplied field rather than simply replaying a preferred interpretive narrative.
## Current technical standing

For this controlled synthetic fixture:

- endpoint integrity: **PASS**
- closed relation vocabulary: **PASS**
- symbolic standing preservation: **PASS**
- candidate-standing preservation: **PASS**
- forbidden semantic inflation: **PASS**
- ablation specificity: **PASS**
- canonical permutation invariance: **PASS**
- counterfactual sensitivity: **PASS**

## What this does not prove

WB16 does not prove:

- generalization across arbitrary source content;
- robustness across many random seeds;
- robustness across model families;
- human-level validity of proposed relations;
- genuine consciousness or metaphysical access;
- that the gestalt is irreducible to sophisticated constrained synthesis;
- member-data retrieval correctness;
- runtime consent enforcement;
- production reliability.

It does show that the current architecture can be tested as a falsifiable relational system rather than only as a compelling experience.
## Next technical boundary

**AIN-INDRAS-WEB-17 — MULTI-SEED ROBUSTNESS + CROSS-MODEL RELATION CONSISTENCY + HIGHER-ORDER SYNERGY TEST ONLY**

Three questions remain:

1. **Robustness:** does the graph survive multiple random seeds?
2. **Model independence:** do different capable models identify substantially the same lawful core relations?
3. **Higher-order contribution:** does the full field produce a lawful gestalt that cannot be reduced to simply concatenating the strongest pairwise relation?

No member data or production integration is authorized.
