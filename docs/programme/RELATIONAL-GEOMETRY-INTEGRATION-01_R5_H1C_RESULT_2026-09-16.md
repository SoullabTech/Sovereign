# RELATIONAL-GEOMETRY-INTEGRATION-01 — R5 / H1c Result

**Status:** EXECUTED · RESEARCH ONLY  
**Date:** 2026-09-16  
**Hypothesis:** `REFERS_TO` must require relation-specific antecedent-binding evidence; semantic similarity, recurrence, adjacency, retrospective intent, and model confidence are insufficient alone.

## Frozen admission classes

Admissible:
- `EXACT_QUOTE`
- `UNIQUE_EXPLICIT_ANCHOR`
- `PRIOR_EXPLICIT_SELECTION`

Insufficient alone:
- retrospective intent
- semantic similarity / paraphrase
- ambiguous shared anchor
- adjacency / recurrence / model confidence
## Result

Production-equivalent model: `claude-sonnet-4-6`, temperature `0.65`.

| Measure | Result |
| --- | ---: |
| Runs | 12 |
| Model proposal correct before gate | 10/12 |
| Final correct after deterministic gate | **12/12** |
| False positives before gate | 2 |
| False positives after gate | **0** |
| True positive references admitted | **6/6** |
| Binding-basis classification correct | **12/12** |

The two pre-gate failures were both the semantic-paraphrase-only fixture. Sonnet proposed a specific `REFERS_TO` target, but the gate rejected it with `REJECT_NO_BINDING_EVIDENCE`.
## Interpretation

H1b showed that typed relation acquisition is strong when the relation is actually present, but an LLM can still manufacture an antecedent when only semantic resemblance exists.

H1c demonstrates that this failure can be contained structurally: the model may propose a relation, but admission requires evidence appropriate to that relation type.

Constitutional law:

> **Relation proposal is not relation standing. A `REFERS_TO` edge becomes admissible only through evidence that binds this source to this target.**

This preserves true exact references while rejecting plausible-but-unbound guesses.

## Boundary

This result is offline research evidence only. It does not authorize serving integration, prompt deployment, member-facing behavior, schema migration, memory write, or production cognition exposure.
