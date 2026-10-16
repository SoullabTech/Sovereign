# RGR-GRM-A01 — Bounded Verification Return

**Date:** 2026-10-16
**Scope:** source-grounded methodological review + candidate GRM-A design + exactly one hand-authored counterfactual graph pair
**Candidate standing:** `DESIGN_CANDIDATE_RETURN_FOR_SPECIFICATION` · **not preregistered** · **not experimentally authorized**
**Source parent:** `b8e1b34df46784667b54bb68ebda491a66f86ec8` (RGR-GRM-01 draft PR #1832)
**Human-independent review:** NOT PERFORMED. Assistant-authored source critique and a different-language arithmetic cross-check are not human peer review.

## 1. What is actually verified

A Node 22 test suite exercised the **hand-authored mathematical witness and documentary guardrails**, with final result:

```text
node --test tests/constitutional/rgr-grm-a01/design-guard.test.mjs

15 passed · 0 failed
```

An earlier initial check failed because a test assertion did not account for Markdown emphasis. The document-rendering check also exposed two escaped mathematical formulas. Both the assertion and the formulas were repaired in this candidate *before* accepting the final 15/15 result; document digests were then regenerated. No statistical/scientific test result was affected.

The simple relation-changing pair is:

```text
G+ : a→b  b→c  c→d  d→a     → one directed 4-cycle
G− : a→b  b→a  c→d  d→c     → two directed 2-cycles

Two-edge edit: (b→c, d→a) → (b→a, d→c).
```

Both graphs have four vertices, four edges and degree (in=1,out=1) at every vertex. A one-clause-per-edge canonical lexical bag with the same relation verb is identical across both cases. Their directed cycle partitions differ. A cheap mutuality or connected-components statistic also distinguishes them; that is a valid non-geometric explanation which the design explicitly retains.

A separately written one-off **Python arithmetic check**, not importing the Node test or evaluating any neural model, independently counted the cycle lengths as `[4]` vs `[2,2]`, confirmed equal degree and lexical bags, and checked coherent relabelings of all four actors under **24 permutations**. This is an exact arithmetic/graph combinatorial witness over fixed examples, **not** an empirical corpus, independent experimental replication, or a test of actual language paraphrases.

## 2. Document and source custody

The candidate adds only:
- `docs/programme/RGR-GRM-A01_RELATIONAL_INVARIANCE_DESIGN_CANDIDATE_2026-10-16.md`
- `docs/programme/RGR-GRM-A01_CRITICAL_SOURCE_REVIEW_2026-10-16.md`
- `docs/programme/RGR-GRM-A01_WORK_UNIT_2026-10-16.json` (candidate metadata, not a canonical W2 work unit)
- this return
- `tests/constitutional/rgr-grm-a01/design-guard.test.mjs`

The test compares **17 protected source artifacts** byte-for-byte with the exact parent, covering prior GRM-01 candidate files and September RGR-00/01/02/03/04/05/06 authority records (including the RGR-01 literature landscape and claim ledger). It rejects changes outside the five new candidate paths, including untracked changes. The two principal documentary sources have SHA-256 values in the work-unit candidate, checked by the test.

The parent RGR-GRM-01 suite was **re-run in its own untouched parent worktree** at exact commit `b8e1b34df46784667b54bb68ebda491a66f86ec8`: **13/13 PASS**. Running that ancestor suite *inside the new child worktree* produced **12/13** with an expected refusal (`out-of-scope: docs/programme/RGR-GRM-A01_CRITICAL_SOURCE_REVIEW_2026-10-16.md`): the parent's strict descendant-scope guard does not authorize any new child paths. **That refusal was preserved; the parent test was not weakened or rewritten.** The child suite independently checks its five new paths, still **15/15 PASS**. The new candidate neither revises the RGR-04 benchmark nor constitutes a second result for RGR-05B's separate Flow sampler.

## 3. Mandatory open scientific challenges

The mathematical toy is **intentionally easy for an exact graph algorithm** and may also be saturated by cheap mutuality/connected-components features. It therefore should probably serve as **a calibration/negative-control tier**, not the sole confirmatory target for claiming a Grassmann-specific advantage. An honest independent reviewer may return the design and require a richer role/relationship family before freezing it.

No language renderer, domain corpus, output labels, embedding encoder, vector/multi-view/symbolic baseline, Grassmann kernel classifier, model optimizer, threshold, uncertainty procedure or TEST/REPLICATION fixture has been selected or executed. The proposed 800/200/300/300 pairs are a planning envelope, not admitted quotas or evidence of feasibility. In particular, the only two graph-isomorphism classes repeat by design; this study would measure **surface/domain transfer**, not unseen-topology generalization.

GRM-A inherits RGR-03's paired source/target rules and requires strong **equal-observation** alternatives. Giving the exact latent graph to one method is an oracle ceiling, not an information-matched comparator. Giving four views to a Grassmann candidate while a vector baseline receives only one is forbidden. Both must receive the same four complete views, and technical rank/encoder decisions must be locked before any confirmatory data inspection.

Any later result would support at most a **task-specific, representation-pipeline comparison**. It cannot establish that meanings are inherently Grassmannian subspaces, that all persons share a manifold, or that MAIA detects hidden energetic or spiritual states.

## 4. Authority and stop boundary

**Nothing beyond documents and fixed-mathematical-reference tests occurred here**: no member/clinical/private content; no benchmark generator or dataset; no model weights; no local/external model inference; no neural learning/scoring; no TEST/REPLICATION; no MAIA/Studio/House memory, code, routing, schema, production, merge or deployment. No external provider spend. No official RGR-07 opening. No Owner/Founder adjudication and no independently constituted human reviewer is claimed.

**Disposition:** candidate source/method packet **ready for independent critique**, *not* ready to freeze or execute as-is. The next proper decision is whether this four-role motif should be kept as a bounded calibration and whether a scientifically stronger relation family can be specified with no fairness/leakage shortcuts. A separate Founder acceptance and exact preregistration would then be required for any future experimental generator, encoder or training.
