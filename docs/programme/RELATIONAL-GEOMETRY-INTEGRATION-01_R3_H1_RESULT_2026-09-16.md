# RELATIONAL-GEOMETRY-INTEGRATION-01 — R3 / H1 Result

**Status:** H1 EXECUTED · OFFLINE RESEARCH ONLY
**Date:** 2026-09-16

## Hypothesis

> Typed relation representation preserves relational identity better than scalar semantic similarity. Standing plus exact claim identity adds epistemic authority and granularity that typed edges alone do not carry.

## Design

Five frozen failure classes were evaluated over the same underlying conversational objects:

1. opaque reference;
2. member correction;
3. confirmation/adoption;
4. developmental return-with-difference;
5. Silver Cedar continuity.

Condition A used local `nomic-embed-text` cosine similarity. Its decision threshold was selected *after seeing the benchmark* to maximize target accuracy, making its reported target score an optimistic upper bound rather than a deployable held-out estimate.
## Conditions

- **A — similarity only:** semantic embedding rank + one scalar threshold.
- **B — typed relation:** the same objects plus typed relational edges; no standing and no exact claim-level identity.
- **C — typed relation + standing + claim identity:** typed relation, current epistemic standing, and exact claim granularity.

## Results

| Condition | Target accuracy | Relation accuracy |
| --- | ---: | ---: |
| A — similarity only | 3/5 (60%) | 1/5 (20%) |
| B — typed relation | 4/5 (80%) | 5/5 (100%) |
| C — relation + standing + identity | 5/5 (100%) | 5/5 (100%) |

Condition C additionally achieved:

- standing correctness: **4/4** applicable cases;
- exact claim target in confirmation: **PASS**;
- developmental/Silver Cedar continuity: **2/2**;
- false standing promotions: **0**.
## Calibration finding

The similarity-only optimum required a threshold in a narrow interval:

```text
0.4984 ≤ threshold ≤ 0.5118
width = 0.0134
```

Below that interval, the opaque-reference fixture produces a false antecedent. Above it, the developmental-return fixture is lost. This is evidence of calibration fragility, not a universal property of embeddings.

The Silver Cedar fixture is especially diagnostic: similarity strongly selects the literal symbol (`0.9906`) while the relational target is the already-established **guardian role** (`0.4129` similarity). The relation is therefore not recoverable merely by choosing the nearest semantic object.

The confirmation fixture is complementary: the generic member gesture had insufficient semantic similarity to recover the exact candidate claim, while claim-level `CONFIRMS` identity resolved it deterministically.

## Adjudication

H1 is **supported on this frozen benchmark as a representational result**: typed relations carry relational information that scalar similarity alone did not preserve, and standing + exact claim identity supplied additional authority/granularity unavailable in the typed-edge-only condition.
## Boundary

This experiment does **not** establish that MAIA can infer the correct typed relation from raw conversation. Conditions B/C were given the frozen relation structure so the experiment could isolate representational sufficiency from relation acquisition.

Therefore the next falsifier is distinct:

> Given only bounded raw evidence plus candidate objects, can a relation-acquisition mechanism infer `REFERS_TO`, `CORRECTS`, `CONFIRMS`, `RETURNS_TO`, and `ADOPTED_AS` accurately enough to outperform semantic similarity without laundering inference into standing?

That successor test must keep inferred relations provisional until independently supported or member-confirmed.
