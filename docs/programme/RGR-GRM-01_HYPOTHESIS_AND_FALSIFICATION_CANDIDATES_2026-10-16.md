# RGR-GRM-01 — Three Testable Questions and Controlled Design Matrix

**Date:** 2026-10-16
**Standing:** PROSPECTIVE DESIGN — NOT PREREGISTERED; NO BENCHMARK EXECUTION AUTHORIZED
**Parent:** `RGR-GRM-01_GEOMETRY_OF_RELATIONAL_MEANING_2026-10-16.md`

## Why not run one end-to-end "meaning model" now?

Three potential effects must be separated. A method might retrieve structurally analogous cases without representing perspective translation. A constraint solver can find global assignments without any geometric embedding. A time-dependent graph can predict delivery without a novel meaning representation. **Every comparison needs a simple non-geometric rival** and its own estimand; success on one does not support the others.

These are **candidate tasks for subsequent freeze**, not a new numerical benchmark or permission to train. Their task family, generator, models, seeds, budgets, thresholds, uncertainty method, test/replication and failure policies remain unselected. The RGR-03 four-cell logic is reused as design discipline without modifying the frozen RGR-04 synthetic benchmark.

## GRM-A — Relational invariance across expression and domain

**Question:** Given exactly defined relations expressed in different surface domains, does a specified subspace-based representation generalize beyond simple vector embedding, symbolic structure mapping and same-information generic baselines?

**Candidate representation:** An episode is a finite family of observations `v_1,...,v_m`. A fixed-rank `k` subspace `span(V_k)` in a declared ambient space could represent a family of directions. It must specify embedding source/version, preprocessing, rank, inner product, orientation/sign invariance, degeneracy, uncertainty and test-time permitted data. *Do not assume a subspace is more meaningful merely because it is higher-dimensional.*

**Hypothesis H-GRM-A (unestablished):** A preregistered subspace/relational candidate achieves a practically meaningful held-out relational-transfer advantage under changed surface/domain, *and* retains sensitivity to changed relations under matched surface. The meaningful-effect margin and uncertainty rule remain TODO; this design makes no support claim.

**Required paired controls (same relation versus changed relation crossed with surface familiar versus held-out):**

| Surface | Underlying relation | What must happen |
|---|---|---|
| Matched | Preserved | Competence; no hidden target leak |
| Held-out | Preserved | Transfer despite actor/vocabulary/domain shift |
| Matched | Broken or flipped | Correct structural sensitivity |
| Held-out | Broken or flipped | Joint-shift robustness or a transparent failure |

**Candidate tasks:** synthetic typed graphs for pursuit/withdrawal, bottleneck/dependency, mutual obligation, conditional access, or other formally defined relational families. *Do not* label invented clinical states or infer motives from prose. Each relation family needs exact predicate truth tables, variable typing, controlled paraphrase domains, nuisance variables and an admissible intervention proof.

**Negative controls and comparators:** strongest valid surface-only embedding/cosine baseline; symbolically specified graph matching/structure mapping; same-information unrestricted learned comparator if authorized later; token/length/style/topic/actor identity confound screening. A graph comparator matching the geometric method forbids a necessity claim for Grassmannians. All candidates and comparators must receive the **same permitted family of observations**; a vector baseline must be allowed to pool/use all available members, not crippled by being given only one vector while the subspace method receives many. Fitting, pooling and rank selection use training/validation only.

**Split law proposal:** group by latent relational instance and transformation family; keep paraphrase cousins, agent-permutation descendants, and structure-equivalent graphs on the same side of all partitions. Domain holdout should be exact, not merely string disjointness. Independently freeze a dictionary and a test-time information contract before any examples are generated. Do not reuse RGR-04 TEST/REPLICATION or its seeds.

**Defeat:** no advantage over strong symbolic/vector comparators; relation-breaking perturbations fail; advantage disappears under group-held-out splitting or shortcut controls; representation depends on privileged labels unavailable to rivals; or uncertainty spans the prespecified margin.

## GRM-B — Perspective coherence: local-to-global compatibility

**Question:** Can a representation combine *partial and nonidentical* local constraints without (a) requiring identical narratives or (b) presenting a contradicted or underspecified state as coherent truth?

**Minimal formal sandbox:** finite variables `X={a,b,c}`, domains `{0,1}`, and local relations specified on overlapping scopes. Each local relation admits multiple assignments. Exact global compatibility is **CSP satisfiability**: a global assignment whose restrictions satisfy all local relations. A pairwise projection check asks whether each pair of local relations admits a compatible assignment on their overlap. That weaker check can pass while global satisfiability fails on a cycle.

This sandbox is sheaf-*inspired*, not a sheaf cohomology computation. Every permitted local restriction and its agreement test is explicit. A zero section or trivial empty observation must not be confused with a meaningful resolution.

**Three hand-authored reference worlds:**

1. `a=b, b=c, a=c`: local feasible; pairwise projection compatible; **2** global assignments.
2. `a=b, b=c, a≠c`: local feasible; pairwise projection compatible; **0** global assignments. A global obstruction in the ordinary CSP sense (not a cohomology class).
3. `a=b` (c not otherwise observed): local feasible; pairwise compatible; **4** global assignments. Multiple admissible completions = underdetermination, not evidence of one privileged meaning.

An additional overt-conflict control `a=0, a=1` has no global assignments and fails pairwise compatibility. Its detection does **not** establish the more subtle ability to detect higher-order inconsistency.

**Hypothesis H-GRM-B (unestablished):** A specified local-to-global candidate outperforms a specified weak pairwise-consistency rule on exact held-out global solvability, while remaining comparable to **exact symbolic CSP/SAT baselines** in accuracy and computational burden. Be explicit: beating the weak rule but merely matching CSP does **not** establish a distinctive geometric advantage. It may establish correctness of an implementation.

**Later benchmark extensions (not admitted here):** heterogeneous translations, lossy maps, incomplete observation, time-indexed perspectives, noisy reports with reliability weights, withheld variables, distinct embedding charts. Each changes the mathematical problem and must be separately typed. Before involving human perspectives, source standing, time, uncertainty and translation warrant must be attached; a "global section" may be inappropriate or coercive.

**Defeat:** rule conflates local satisfiability with global coherence, infers certainty from multiple completions, invents absent observations, treats natural disagreement as formal contradiction, or cannot beat/justify its complexity against exact symbolic CSP.

## GRM-C — Typed dynamical Flow across relational structures

**Question:** Does time- and carrier-aware computation improve a declared transfer task over same-information, serious graph-temporal and generic comparators, without reinterpreting relational feeling as conserved transport?

**Sources to preserve:** October RGR-05A accepts Flow as first-class *derived* object; the separate RGR-05B R1 synthetic return task failed at its preregistered sampler limit (six positive cases found in 100,000 draws where ten were required). The older September RGR-05 pre-materialization feasibility pass concerns a **different** Directed Two-Step Composition benchmark. These are separate evidence objects.

**Candidate H-GRM-C (unestablished):** typed path/delay/context representations have prospective task-specific utility when compared with identical-observation alternatives. It does not isolate a unique algorithm by calling an ordinary graph network `FLOW_D`.

A future version must declare carriers; operationalized transition rules; path direction/delay; context inputs; conservation law *only if domain-correct*; sampling-feasibility pretest; topology/group split; complete positive and negative controls; model-selection protocol; calibrated uncertainty; resources; stop; replication; and negative-result custody. It must not import the failed RGR-05B sampler as though the missing strata were repaired. Any new sampler or quota becomes a **new explicitly numbered benchmark version**, with R1 still FAILED_UNDER_FROZEN_BUDGET.

**Weather and Elements:** Weather as a hypothetical context variable is optional and demands its own ablation with identical observations and a meaningfully independent measurement rule. Fire/Water/Earth/Air/Aether are **not labels, targets, features, or validation metrics** in this initial test. Later elemental utility requires a separate candidate and tests against non-elemental groupings.

**Defeat:** effect due to changed information access or privileged simulator traces; baseline inadequate; sample quota failure; confound with topology or pulse ordering; non-identifiable parameter claims; effect vanishes under held-out carriers/delays; or inappropriate transfer of material conservation to psychological variables.

## Common execution and adjudication boundary

Before any comparative synthetic experiment, the team must lock and independently review:
- exact hypothesis and primary endpoint/estimand, including which of A/B/C is **primary**;
- full generator and finite feasibility witnesses;
- source/target variables, counterfactual transformations and label rule;
- units of independence and groups kept together;
- train/validation/TEST/REPLICATION partitions and RNG streams;
- all model/comparator capacities and information-access parity;
- numerical effect margin, competence gates, uncertainty calibration and multiplicity plan;
- leakage/adversarial controls, preregistered negative controls;
- stopping and failure dispositions, hardware/runtime/source hashes;
- data provenance, licensing and resource budget;
- distinct Founder acts for execution, TEST, REPLICATION, and integration.

**Prospective outcomes:** INVALID / UNDERDETERMINED / NOT_SUPPORTED / NARROWLY_SUPPORTED_AFTER_REPLICATION / REPLICATION_FAILED. No null result can be reclassified as equivalence without an actual equivalence interval/gate. No test of synthetic structure can be presented as proof about people, consciousness, telepathy, or Burger/Stone therapeutic mechanisms.

## Review decisions now requested (none presumed granted)

- Admit the `RGR-GRM-01` label as a noncanonical research-documentation lane.
- Choose whether GRM-A, GRM-B or GRM-C should next receive an **exact** separately frozen benchmark design.
- Require source-grounded external human review before any claim of validated relational meaning.
- Preserve RGR-00 through RGR-06, the RGR-CF01 intake, the RGR-EVAL-CAUSAL-01 method design, and the October Flow records without amendment.

The toy reference implementation checks only the three hand-authored B examples and basic invariances; **it is not the proposed human-meaning experiment, a new benchmark population, or training evidence**.
