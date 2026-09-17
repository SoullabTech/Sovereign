# RELATIONAL-GEOMETRY-INTEGRATION-01 — R12 / H3g Result

**Status:** EXECUTED · PARTIAL CONFIRMATION · SCHEMA FALSIFIER  
**Date:** 2026-09-16  
**Authority:** offline research only

## Question

Can one pair carry independent relational dimensions—binding form, directionality, dynamic operator, and configuration—without forcing those dimensions into one exclusive label?

## Inference boundary

The first production-container research attempt produced no evidence and was abandoned after a container restart warning. The accepted H3g evidence used the same `claude-sonnet-4-6` model through the local Claude CLI in restricted/no-tools mode. CLI temperature is managed by that client, so this is same-model off-production replication, not an exact production-temperature replay.

## Result

12 runs across six frozen fixtures. Overall exact all-axis score: **8/12**.
Axis accuracy:
- binding 8/12
- binding form 8/12
- direction 8/12
- endpoints 8/12
- dynamic operator 10/12
- configuration 10/12

The decisive positive result is the multi-dimensional subset: every case where a dynamic operator and configuration were simultaneously expected passed **6/6**.

Examples:
- `AIR_LEAVE → EARTH_SETTLE`: `EVOKES` + `ALIGNMENT`
- `EARTH_EXHAUST → FIRE_LAUNCH`: `INHIBITS` + `TENSION`
- `AIR_NEWPATH → WATER_HOPE`: `EVOKES` + `ALIGNMENT`

Thus H3f's central correction survives: dynamic operator and configuration are not mutually exclusive edge labels.
## Falsifier

Two cases exposed a defect in the global `bound` field.

1. **Configuration-only tension** (`I still love him` / `I want to leave`; `those truths pull against each other`) was classified as unbound 2/2. The model appears to have interpreted binding as dynamic/causal linkage rather than any lawful relational configuration.
2. **Temporal conditional sequence only** (`when I think about financial risk, my chest tightens`, with explicit disclaimer of agreement/conflict) was classified as unbound 2/2. This refusal is epistemically defensible: temporal sequence alone does not establish `EVOKES`.

Therefore a single global `bound` flag is rejected as too coarse. It couples independent axes and risks treating configuration as secondary to causal/dynamic linkage.

## Successor hypothesis

H3h removes global binding entirely. A relation object will carry two independently admissible structures:

```text
DYNAMIC RELATION
predicate · direction · source · target · evidence basis

CONFIGURATION RELATION
predicate · symmetric endpoints · evidence basis
```

Either, both, or neither may be present. Evidence for one dimension cannot automatically authorize the other.

**Constitutional law:** co-presence of relational dimensions is allowed; standing must be earned per dimension.
