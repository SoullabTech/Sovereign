# RELATIONAL-GEOMETRY-INTEGRATION-01 — R15 / H3j Result

**Status:** EXECUTED · PROOF-OF-CONCEPT PASS  
**Date:** 2026-09-16  
**Authority:** offline research only

## Question

Does dimension-specific parallel evidence extraction recover multidimensional relation geometry more reliably than one extractor handling all dimensions at once, without increasing false-positive relations?

Architecture:

```text
DYNAMIC EVIDENCE EXTRACTOR ─┐
                            ├→ deterministic admission/canonicalization → relation geometry
CONFIG EVIDENCE EXTRACTOR ──┘
```

The dynamic extractor was forbidden to classify alignment/tension. The configuration extractor was forbidden to classify elicitation/inhibition.
## Result

Same-model off-production inference: `claude-sonnet-4-6`, local Claude CLI, restricted/no-tools, low effort.

12 runs:
- exact merged relation geometry: **12/12**
- dynamic dimension correct: **12/12**
- configuration dimension correct: **12/12**
- false-positive dynamic relations: **0**
- false-positive configuration relations: **0**

All six structural cases passed 2/2:
- `EVOKES + ALIGNMENT`
- `TENSION` only
- `INHIBITS + TENSION`
- `EVOKES` only
- `ALIGNMENT` only
- neither dimension present

This directly repairs H3i's salience failure: the previously missed elicitation evidence in the `EVOKES + ALIGNMENT` case was recovered when the dynamic and configuration detectors attended independently.
## Adjudication

H3 receives **proof-of-concept support** in this bounded synthetic benchmark for the following narrower architecture:

1. preserve differentiated channels;
2. acquire evidence independently by relational dimension;
3. require exact evidence descent;
4. canonicalize predicates/direction deterministically;
5. merge only after each dimension has independently earned admission.

This is a computational version of **differentiate before synthesis** and a defensible version of the corpus-callosal analogy: selective exchange through a membrane, not early fusion into one interpretation.

It does **not** establish that Elemental channels are biological modules, that every human process belongs neatly to one element, or that the result generalizes to unconstrained natural conversation.

## Current relation object

```text
RELATION GEOMETRY
├─ dynamic interaction
│  ├─ predicate
│  ├─ directed source → target
│  └─ evidence basis
├─ configuration
│  ├─ predicate
│  ├─ symmetric endpoints
│  └─ evidence basis
├─ standing / provenance
└─ temporal state   ← next research target
```

**Next:** temporal geometry should test how an admitted relation changes rather than treating each edge as timeless.
