# RELATIONAL-GEOMETRY-INTEGRATION-01 — R22 / H6d Result

**Status:** EXECUTED · STRUCTURAL PASS / ACQUISITION FALSIFIER  
**Date:** 2026-09-16  
**Authority:** offline research only

## Question

Can configuration geometry carry information beyond the inventory of its component relation types?

Ten frozen graphs were arranged as five collision pairs. Within each pair, the node count and multiset of neutral relation operators were identical; only endpoint incidence topology differed.

No astrological labels were shown to the inference model.

## Neutral motifs

- `CROSS_CONSTRAINT_TRIAD`
- `RESONANT_TRIAD`
- `ASYMMETRIC_FOCAL_CONFIGURATION`
- `POLAR_MEDIATION_TRIAD`
- `BALANCED_CROSS_CONSTRAINT`
- `NONE`
## Benchmark correction

The first H6d artifact was rejected before adjudication because the `M5_CONTROL` graph was mislabeled `NONE` even though it contained a smaller `CROSS_CONSTRAINT_TRIAD`, and the deterministic recognizer checked smaller triads before the more specific four-node balanced-cross motif.

V2 preserves the original model outputs but corrects ground truth and motif precedence. The rejected V1 artifact remains in evidence for provenance.

## Result

- bag-of-relation-types maximum possible accuracy: **5/10**
- same-model off-production Sonnet full-topology classification: **11/20**
- deterministic full-topology recognizer: **10/10**

Every collision pair had the same operator inventory but a different configuration identity. Therefore the edge inventory alone was information-theoretically insufficient for this benchmark.

The LLM result is an acquisition falsifier: fluent classification is not reliable enough to author motif identity. The deterministic recognizer succeeded because motif identity is a graph-topology property once admitted pairwise relations already exist.
## Architectural consequence

The relation pipeline should therefore remain:

```text
member evidence
→ admitted pairwise relation geometry
→ deterministic motif detection
→ higher-order configuration object
→ temporal tracking / standing
```

not:

```text
raw prose → LLM names a configuration → treat that name as structure
```

Research-only analogues may now be compared downstream:
- `CROSS_CONSTRAINT_TRIAD` → T-square-like hypothesis source
- `RESONANT_TRIAD` → grand-trine-like hypothesis source
- `ASYMMETRIC_FOCAL_CONFIGURATION` → yod-like focal hypothesis source
- `BALANCED_CROSS_CONSTRAINT` → grand-cross-like hypothesis source

These analogues do not grant astrological interpretation or causality.

## Law

> **Configuration is a property of relation incidence topology, not merely the inventory of relation types. Configuration identity should be computed from admitted geometry, not authored by model fluency.**

## Boundary

H6d establishes structural distinguishability, not psychological predictive validity. A separate experiment must test whether configuration motifs improve prediction of field transition or preserve meaningful process information beyond pairwise geometry alone.
