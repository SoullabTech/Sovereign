# RELATIONAL-GEOMETRY-INTEGRATION-01 — R4 / H1b Relation Acquisition

**Status:** EXECUTED · PARTIAL PASS / FALSIFIER FOUND
**Date:** 2026-09-16
**Lane:** research only; no production integration

## Question

Can typed relations be discovered from raw conversational evidence without supplying the answer key, while preserving exact source/target identity and abstaining when antecedent identity is unresolved?

## Conditions

- A: sovereign `nomic-embed-text` similarity only; oracle threshold selected after scoring.
- B: production-equivalent Sonnet 4.6 typed relation classifier.
- C: same Sonnet/evidence/vocabulary, plus exact target, evidence IDs, direction, claim granularity, abstention, and prohibition on authority fields.

B and C each ran two zero-shot passes over five frozen fixtures. No repair feedback was given.
## Result

| Condition | Target / relation result |
| --- | --- |
| A similarity only | target 3/5; typed relation 1/5 |
| B typed classifier | exact triple 8/10 |
| C constrained acquisition | exact triple 8/10 |

B and C were 8/8 on the four relation-present classes: correction, exact confirmation, developmental return, and Silver Cedar adoption.

Both were 0/2 on opaque reference. In both passes each inferred `U_QUERY REFERS_TO P1` where ground truth was `NO_RELATION`.

C produced valid evidence IDs and no authority-field violations, but still falsely bound the antecedent.

## Falsifier

**Evidence presence is not antecedent-binding evidence.**

A model can cite the source gesture and a plausible prior claim while still lacking any evidence that the gesture refers to that specific claim. Therefore a general evidence-descent requirement is insufficient for `REFERS_TO` admission.
## New law

`RETROSPECTIVE_DEMAND` and `REFERS_TO` are different facts.

- retrospective language may establish that the member is reaching backward;
- it does not establish *which* earlier object is the antecedent;
- semantic similarity, recurrence, adjacency, or model confidence may propose a candidate target but cannot admit `REFERS_TO` by themselves;
- `REFERS_TO` requires relation-specific antecedent-binding evidence.

This reproduces the earlier programme insight: **reaching back is not the same relation as reaching back to this.**

## Next falsifier — H1c

Test a deterministic antecedent-admission gate over positive and negative reference cases. Candidate binding evidence may include exact quotation, a unique explicit lexical anchor, or a prior explicit selection/confirmation relation. Opaque retrospective demand must remain unresolved.

H1b does not authorize relation acquisition in cognition. It demonstrates strong typed-relation discovery for four classes and identifies unresolved antecedent binding as the remaining failure class.
