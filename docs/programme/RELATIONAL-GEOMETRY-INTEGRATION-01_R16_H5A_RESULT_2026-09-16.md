# RELATIONAL-GEOMETRY-INTEGRATION-01 — R16 / H5a Result

**Status:** EXECUTED · FOUNDATION PASS  
**Date:** 2026-09-16  
**Authority:** offline research only

## Question

Does temporal order carry transition information that is unavailable from the same unordered multiset of admitted relation states?

Frozen operators:
- `EMERGES`
- `DISSOLVES`
- `TRANSFORMS`
- `RETURNS_TO`
- `PERSISTS`
- `AMBIGUOUS`

Ordered and unordered representations contained the same state values; only temporal ordering differed.
## Result

Same-model off-production inference: `claude-sonnet-4-6`, local Claude CLI, restricted/no-tools, low effort.

12 paired runs:
- ordered histories correct: **12/12**
- unordered histories correct: **12/12**
- directional ordered cases: **10/10**
- directional unordered cases: **10/10 correct abstention (`AMBIGUOUS`)**
- persistence control: **2/2** ordered and **2/2** unordered

The model distinguished:
- `NONE → TENSION` as emergence
- `TENSION → NONE` as dissolution
- `ALIGNMENT → TENSION` from `TENSION → ALIGNMENT`
- `TENSION → NONE → TENSION` as return

The same unordered state multisets were correctly treated as directionally indeterminate.
## Interpretation

H5a confirms a necessary architectural law:

> **Temporal direction must be represented; it may not be reconstructed from an unordered memory aggregate.**

This matters because recurrence, dissolution, and transformation are properties of ordered change, not properties of isolated states.

It also sharpens the boundary around future astrology-derived temporal analogies: notions such as applying/separating may only be considered after MAIA can represent direction and recurrence independently of those symbolic terms.

## Next falsifier

H5b tests the distinction between **recurrence and sameness**. Reappearance of the same endpoints after an interval must not imply that the relation geometry is unchanged. A returning pair may carry a changed dynamic operator, configuration, standing, or scope.
