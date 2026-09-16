# TURN-03 A3 — Adversarial complete-thought falsifier

**Date:** 2026-09-16
**State:** COMPLETE · CURRENT SMART-TURN FUSION REJECTED · A3 REMAINS OPEN
**Evidence SHA-256:** `8a13e17ee0d427e194fe5c6f2ade696630fd6cac735c3b550b5def25bc492a65`

## Purpose

The first A3 corpus favored semantic-only evidence because its true yields used explicit yield phrases. This adversarial population removes that advantage: seven continuation cases are grammatically complete or rhetorically complete, and five true yields are implicit rather than explicit.

## Result

| policy | false floor seizures | rate | correct implicit yields | yield recall |
| --- | ---: | ---: | ---: | ---: |
| baseline | 7/7 | 1.000 | 5/5 | 1.000 |
| semanticOnly | 0/7 | 0.000 | 0/5 | 0.000 |
| smartTurn | 7/7 | 1.000 | 5/5 | 1.000 |
| smartTurnSemantic | 7/7 | 1.000 | 5/5 | 1.000 |

## Ruling

Raw Smart Turn and Smart Turn + the existing semantic override both falsely yield on **all seven** complete-but-continuing cases while correctly yielding on all five implicit endings. The completion probability therefore does not distinguish the ownership question MAIA actually needs to answer on this population.

Semantic-only safely preserves every continuation, but does not recognize any implicit yield. This exposes the real design tradeoff: **false-floor-seizure safety versus implicit-yield latency**.

Therefore the current rule `Smart Turn complete => yield after member floor` is rejected. No threshold tuning is authorized from this population. The next A3 candidate must treat model completion as evidence only and test an asymmetric law in which predictive models can extend waiting but cannot independently seize the floor.

No live endpointing, transcript commit, cognition dispatch, TTS start, TURN-04 authority, or production change is authorized.
