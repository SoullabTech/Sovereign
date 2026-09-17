# RELATIONAL-GEOMETRY-INTEGRATION-01 — R14 / H3i Result

**Status:** EXECUTED · STRONG PARTIAL SUPPORT  
**Date:** 2026-09-16  
**Authority:** offline research only

## Question

Does relation acquisition improve if the model extracts exact member-authored evidence spans and basis classes, while deterministic code constructs the relation geometry?

Pipeline:

```text
raw member language
→ evidence-span extraction
→ basis class
→ deterministic admission
→ deterministic predicate/direction
```

The model was not permitted to author `EVOKES`, `INHIBITS`, `ALIGNMENT`, or `TENSION` directly.
## Result

Same-model off-production inference: `claude-sonnet-4-6`, local Claude CLI, restricted/no-tools, low effort.

12 runs:
- exact evidence set: **10/12**
- true positives: **12**
- false positives: **0**
- false negatives: **2**
- precision: **1.00**
- recall: **0.857**
- false relation on neither fixture: **0**

By fixture:
- dynamic + alignment: **0/2 exact** (alignment preserved; elicitation omitted)
- tension only: **2/2**
- inhibits + tension: **2/2**
- dynamic only: **2/2**
- alignment only: **2/2**
- neither: **2/2**
## Interpretation

Evidence-first acquisition improved exact performance from H3h's 7/12 to 10/12 while eliminating false-positive relation construction on this benchmark. Deterministic canonicalization therefore appears materially safer than asking one model act to construct a finished multidimensional relation.

The remaining failure is narrow: when two independent evidence dimensions coexist, one can dominate extraction salience. In the `EVOKES + ALIGNMENT` fixture, the extractor reliably retained consonance but omitted elicitation.

This suggests a successor architecture analogous to differentiated processing itself:

```text
DYNAMIC-EVIDENCE EXTRACTOR ─┐
                            ├→ deterministic merge → relation geometry
CONFIG-EVIDENCE EXTRACTOR ──┘
```

Each extractor is forbidden to answer for the other dimension. The merge layer cannot manufacture missing evidence.

**Constitutional law:** dimensional recall may be improved by parallel extraction; cross-dimensional synthesis may not substitute for absent evidence.
