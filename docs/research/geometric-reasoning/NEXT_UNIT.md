# Next Unit — Retrieval-Mechanism Ablation (DESIGN ONLY, NOT AUTHORIZED TO RUN)

**Status:** proposal recorded at the close of the claim-audit unit. **Not executed. Not frozen for execution.** Requires its own founder authorization, its own pre-registration, and its own freeze commit.

## Why an ablation, not a tuning pass

The probe localized the defect to retrieval (`RESULTS.md`). The tempting next move — raise `K`, adjust embedding thresholds — is explicitly **not** the next move.

Retuning would very likely improve scores *on this corpus* while leaving the underlying defect intact, because the defect is not a badly chosen parameter. It is that **cosine proximity is being used as the sole criterion for a task that turns on what governs, what changed, and what is currently true.** A `K` that fixes 40 synthetic items is a fitted constant, not a mechanism, and it would convert a diagnostic corpus into a benchmark we have quietly trained against.

**Standing constraint carried into the next unit: no production tuning, no new model, no prompt optimization.** The corpus, prompt contract, and scoring stay byte-identical to `c16b6be14` so results are directly comparable across units.

## Question

> **What is the minimal added structure that closes the gap between A (0.325) and D (0.900)?**

Not "can we score higher" — *what structure is load-bearing*. An arm that helps identifies a mechanism; an arm that doesn't is equally informative.

## Proposed arms

Same corpus, same scoring, same ceiling.

| Arm | Retrieval mechanism | Hypothesis under test |
|---|---|---|
| **A** | Current embedding top-K (baseline, already measured: 0.325) | — |
| **E** | Entity/item-scoped + embedding | Scoping to the relevant subject recovers most of the deficit |
| **F** | Recency / current-version aware | Superseded facts are being surfaced alongside current ones |
| **G** | Contradiction / change-aware | Explicitly modelling *what changed* beats similarity |
| **D** | Full item context (ceiling, already measured: 0.900) | — |

**Prior (recorded before running, per the discipline that made the last unit honest):** E is expected to recover a large share of the gap on its own. If a memory atom is already known to belong to a specific person, object, or topic, then searching the whole store by cosine distance **discards structure the system already has.** The current failure mode — 1.5 of 4 retrieved atoms from the correct item, 2.5 cross-item distractors — is precisely what entity scoping would eliminate.

If E alone closes most of the gap, then F and G are refinements, not requirements, and the honest conclusion is that the defect was *unused available structure* rather than *missing capability*. That would be the cheapest possible fix and should be stated as such rather than dressed up.

## Design requirements (binding on the next unit)

1. **Positive-control invariant** (from D-3): Arm D is retained in every run. Non-negotiable.
2. Corpus, prompt contract, scoring, seed frozen and unchanged from `c16b6be14`.
3. Pre-register expected direction per arm **before** first run, including the E prior above.
4. Record deviations rather than amending the protocol.
5. Determinism: attempt a reproducibility control absent from this unit (D-1 removed `temperature`). Consider n≥3 samples per item with majority scoring, pre-registered.
6. Corpus stays synthetic. No member content.

## Explicit non-goals

- Not a model comparison. The model is held constant.
- Not a production change. Any positive result is evidence about mechanism, not authorization to ship.
- Not evidence about learned geometry, in any outcome. Adding relational structure to *retrieval* is application logic; it creates no learned representation and no model-weight geometry.
- Not related to Sophontic, whose claims remain unusable pending release artifacts (`CLAIM_LEDGER.md`).

## STOP

This document is a proposal. Nothing in it is authorized to execute.
