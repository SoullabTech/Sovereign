# RGR-GRM-A01 — Critical Source Review and Return Matrix

**Date:** 2026-10-16
**Reviewed source:** draft PR #1832 at `b8e1b34df46784667b54bb68ebda491a66f86ec8`
**Review type:** assistant-authored source/method critique; NOT independent human verification
**Disposition:** `RETURN_FOR_SPECIFICATION` for GRM-A experiment design; the parent GRM-01 documentary candidate is preserved without alteration.

## 1. Specific review findings and disposition

| ID | Finding in exact prior records | Risk if ignored | Disposition in this A01 design | Standing |
|---|---|---|---|---|
| A-R1 | RGR-01 mathematical landscape §14 already proposes subspace versus point-vector/graph held-out relational transfer | falsely claim a novel foundational hypothesis | state lineage explicitly; refine controls rather than reopen RGR-01 | ADDRESSED IN DESIGN |
| A-R2 | GRM-01 nominates many unrelated hypothetical relation families with no primary formal predicate | post hoc selection and interpretive circularity | propose one exact four-role directed-cycle predicate; other families excluded from this design | CANDIDATE; PROXY ADEQUACY UNREVIEWED |
| A-R3 | GRM-01 requires equal multi-view inputs but has no observation schema, encoder, rank or comparators | apparent geometry advantage due to extra views or better encoder | four equal full renditions for all candidates; pooled/vector, multi-view, symbolic text parser, generic, exact oracle separate | DESIGN ONLY; no implementations |
| A-R4 | A graph-labeled dataset may expose a hidden gold graph to a structure-mapping baseline while subspace sees text | unfair information access | text-to-graph parser must derive relations from same texts; true-graph oracle is privileged ceiling not fair comparator | DESIGN ONLY |
| A-R5 | Random balancing can exhaust a per-root budget (separate October RGR-05B Task B result) | distorted conditional distribution and silent quota rescue | constructive two-edge head swap produces positive/negative counterfactual pair; failure stops rather than replacing roots | EXACT FOUR-ROLE WITNESS ONLY |
| A-R6 | GRM-01 suggests grouping every structure-equivalent graph, but a fixed positive 4-cycle and negative 2+2-cycle only have two abstract motif classes | impossible train/test if all isomorphic graphs must be kept apart | distinguish *world-root/paraphrase/template* leakage from intentionally repeated motif classes; label task as surface/domain transfer not topology-class transfer | IN DESIGN; future corpus adequacy open |
| A-R7 | `Gr(k,n)` requires a fixed embedding space and rank but real view families can be collinear/encoder-sensitive | degenerate subspaces, numerically arbitrary distances or semantic inflation | freeze encoder, `n,k`, centered-vs-uncentered choice, SVD tolerance, view permutations, rank fallback or abstention BEFORE data; no unique concept-subspace claim | OPEN FOR SOURCE/VERSION REVIEW |
| A-R8 | A label defined on transparent directed graphs is perfectly solvable by exact graph algorithms | marketing claim that Grassmann "beats symbolic reasoning" is impossible on privileged oracle input | require graph-oracle ceiling and strong text-to-graph/cheap-summary baselines; positive result can only support bounded extraction/invariance | BOUNDED CLAIM |
| A-R9 | RGR-03 requires both same-relation surface transfer AND relation-breaking sensitivity; GRM-01 lacks locked metric/effect/uncertainty | trivial constant predictor or p-hacking could appear coherent | paired exact-correctness primary proposal, explicit four-cell control, cluster paired uncertainty, predeclared failure/no-rescue | CANDIDATE, NOT FROZEN |
| A-R10 | Sophontic perturbation claims and academic Geometry of Reasoning sources are easily conflated | false historical/methodological attribution | keep Sophontic company-published claims separate from Zhou et al. and other academic research; no proprietary methods claimed | DOCUMENTED |
| A-R11 | Canonical RGR-06 is already September's accepted implementation lock | identity/authority collision | GRM-A01 is a noncanonical child of GRM-01; RGR-07 not opened; RGR-04/06 locked fixtures untouched | VERIFIED PATH/WORDING |
| A-R12 | "Meaning" in the team paper can be mistaken for synthetic graph labels | synthetic logical success promoted to claims about people | graph orientation is an artificial relational proxy, not lived meaning; no member data, interpretations or diagnosis | DOCUMENTED |

**This matrix is not approval** of the proposed four-role target. In particular, serious empirical-value objections remain: the motif is deliberately simple; a grammar-aware parser, connectivity/mutuality statistics, or other symbolic solution may saturate it; synthetic prose may not capture natural relation/meaning generalization. Those objections are defeat candidates, not weaknesses to suppress.

## 2. Explicit existing-source trail

### Local governing records, ordered by dependency

1. `RGR-00_RELATIONAL_GEOMETRY_RESEARCH_CONSTITUTION_2026-09-18.md` — typed relational inquiry; geometry is candidate, not a predetermined ontology.
2. `RGR-01_LITERATURE_MATHEMATICAL_LANDSCAPE_2026-09-18.md`, §§6,14 — `Gr(k,n)`, principal angles, and the original relation-preserving cross-domain subspace test hypothesis.
3. `RGR-01_SOURCE_CORPUS_2026-09-18.md`, S03 Gentner structure mapping; S21 Mu et al. 2017; S22 Ishibashi et al. 2024; S23 Naowarat et al. 2026; S24 classical principal angles — alternatives/limitations.
4. `RGR-01_CLAIM_LEDGER_2026-09-18.md`, CL-20 — *HYPOTHESIS* only; test vector, graph, symbolic and other subspaces. CL-21 keeps heterogeneous perspective/sheaf hypothesis separate.
5. `RGR-02_FORMAL_VOCABULARY_CANDIDATE_STRUCTURES_2026-09-18.md` — ten primitive slots and only earned metric/manifold/subspace geometry.
6. `RGR-03_FALSIFICATION_CONTRACT_2026-09-18.md` — common-source paired control matrix, serious baselines, same-information comparator, preregistration/no-rescue.
7. `RGR-04_PREREGISTRATION_LOCK_2026-09-18.md` — **different** `RGR-RT1-D2C-01` benchmark; no license to reuse its test data.
8. `RGR-05_PRE_MATERIALIZATION_FEASIBILITY_REPORT_2026-09-18.md` — feasibility on September D2C-01, not a later Flow or GRM-A experiment.
9. `RGR-06_CONFIRMATORY_IMPLEMENTATION_LOCK_2026-09-19.md` — closed, no TEST/REPLICATION/performance.
10. October `RGR-05A/05B` branches / PRs #1779–1781 — Flow derived placement and distinct frozen-budget feasibility failure.
11. `RGR-CF01_COUNTERFACTUAL_RELATIONAL_GEOMETRY_INTAKE_2026-10-12.md` — related counterfactual inquiry; distinct noncanonical draft and authorizations.
12. `RGR-EVAL-CAUSAL-01_METHOD_DESIGN_2026-10-12.md` — tooling/causal questions are design-only, no package/model execution.
13. `RGR-GRM-01_HYPOTHESIS_AND_FALSIFICATION_CANDIDATES_2026-10-16.md` — immediate parent, candidate GRM-A/B/C, nothing preregistered.

When named branch sources are absent from the current clean-main worktree, refer to their precise branch or PR. **Do not infer** that a branch, PR, product capability or source limitation has been canonically merged or scientifically validated from its mention here.

### External literature: support and limitation, not new verification this turn

- Gärdenfors (2000) and Gärdenfors & Osta-Vélez (2026) support conceptual-spaces vocabulary; do not establish universal metrics for meaning.
- Gentner (1983) and related structure mapping supply non-geometric relational alternatives; omitting them would bias the comparison.
- Mu, Bhat & Viswanath (ACL 2017), Ishibashi et al. (NAACL 2024) supply scoped subspace representation precedents.
- Naowarat, Tang & Goldwater (CoNLL 2026) and the RGR-01 claim ledger caution that inferred concept subspaces are estimator-dependent and not unique.
- Principal-angle mathematics is established; its semantic relevance requires a declared encoder/mapping and empirical test.
- Sophontic's public *perturbation paradigm* is a company-described evaluation family, not an independent proof of geometric reasoning claims; Zhou et al. *The Geometry of Reasoning: Flowing Logics in Representation Space* is a separate scholarly lineage.

All bibliographic statuses are inherited from the versioned RGR-01/CF01 records. This document has not run a new full external systematic review, audited copyright/license status, or accessed new proprietary model internals.

## 3. What remains open before a true frozen protocol

- Choose one encoder and license/weights under a separately authorized source-and-dependency audit; do not select a model by a favorite test result.
- Prove that domain and template families, rendering methods, and independent scenario groups genuinely support the proposed holdout and replication populations.
- Choose the minimal meaningful superiority margin and a validated cluster/bootstrap or alternative inferential procedure *before* evaluating methods.
- Validate that a strong text-to-graph parser is not an intentionally crippled strawman, and separate grammar-aware privileged alternatives from fair observed-input baselines.
- Decide whether this *deliberately elementary* four-node motif has scientific value beyond a low-cost negative control. If not, return for a richer—but separately versioned—relation family.
- Obtain a genuine independent human or separately constituted methodological review and Founder approval of the exact new protocol before any new benchmark materialization, model evaluation, use of TEST or REPLICATION.

**Final disposition: GRM-A01 may be preserved as an inspectable experimental design candidate; its outcome is NOT a preregistration, trained-model result or admission to MAIA.**
