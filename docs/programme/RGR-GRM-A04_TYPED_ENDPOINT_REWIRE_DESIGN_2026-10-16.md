# RGR-GRM-A04 — Typed Degree-Preserving Endpoint Rewiring

**Date:** October 16, 2026
**Programme:** Existing RELATIONAL-GEOMETRY-REASONING programme · noncanonical GRM-A design family
**Standing:** RESEARCH DESIGN CANDIDATE · EXACT HAND-AUTHORED MATHEMATICAL WITNESS ONLY · NOT PREREGISTERED
**Immediate parent:** `547aa43042a3189b198fa132c15c75eb95542967` (GRM-A03 draft PR #1835)
**Ancestry:** GRM-A02 draft #1834, A01 #1833, GRM-01 #1832; all research-only and unmerged at the time of review
**Scope:** documentary design plus exactly two fixed synthetic graph worlds, pure local arithmetic and custody checks. No experimental corpus, model, inference, training, TEST, REPLICATION, MAIA or deployment.

## 0. Why A04 changes the research problem

A02 and A03 used **permutations of labels on a fixed untyped graph**. Their six-node 2×2 and eight-node 3×3 structures were non-isomorphic, but the underlying type-permutation *mechanism* was shared.

A04 introduces a formally different intervention: **rewire the endpoints of two existing P-typed arcs while preserving every named node's typed incoming and outgoing degree**. No retained edge is relabeled. This adds a **distinct intervention type relative to A02/A03**, not a third completed experiment. A01 already used an untyped edge-target two-switch, so A04 is **not historically novel as a graph-edit family**; its new contribution is preserving the stronger *per-node typed-degree* controls while using the same anchored three-hop predicate as A02/A03.

**Important trade-off:** A04 does **not** retain the exact untyped adjacency, unlike A02/A03. Therefore it is not unconditionally "stronger" on every control. Its *untyped graphs are isomorphic* via exchanging the names u and v, but the identity of each named P-typed endpoint differs. A strong text-to-graph relation matcher may detect that difference. An exact symbolic typed-graph solver still solves the target.

The same three-edge typed-path target survives across these toy designs, so even adding A04 does **not** establish transfer to a new kind of relational question. It only diversifies the *intervention* used to flip the known target.

Canonical source boundary remains: September RGR-06 is the **closed Confirmatory Implementation Lock**, not a new "meaning" lane; RGR-07 is not opened. RGR-04's separately frozen six-node/eight-edge two-step task and October RGR-05B's independent frozen-budget failure are untouched.

## 1. Eight-node fixed mathematical pair

Let V = {s, a, b, c, u, v, w, t}; each arc has a discrete type. Exactly **14 unique directed arcs** appear in each world.

**The following twelve arcs are identical in both worlds:**

| Directed arc | Type |
|---|---|
| s→a | OPEN |
| s→b | CLOSED |
| s→c | WAIT |
| u→t | ACK |
| v→t | IGNORE |
| w→t | DEFER |
| t→s | RESET |
| a→w | Q |
| b→w | R |
| c→u | Q |
| c→v | R |
| c→w | P |

**The two P-typed arcs undergo a directed destination 2-switch:**

| World | First P arc | Second P arc |
|---|---|---|
| Positive G+ | a→u | b→v |
| Negative G− | a→v | b→u |

The intervention removes a→u and b→v and introduces a→v and b→u; each of these four mentioned arcs carries **P** when present. This is an **endpoint change**, not the A02/A03 operation of changing P/Q/R labels on pre-existing arcs.

### Exact predicate

For a designated source s and target t, ask whether there is a path of exactly three directed arcs with type sequence OPEN → P → ACK.

\[
r(G;s,t)=\mathbf{1}\big\{\exists x,y:\ (s,x,\mathrm{OPEN}),\ (x,y,P),\ (y,t,\mathrm{ACK})\big\}.
\]

- **G+ = YES:** s→a [OPEN], a→u [P], u→t [ACK].
- **G− = NO:** s→a [OPEN], a→v [P], v→t [IGNORE]. The negative does contain b→u [P], u→t [ACK], but b is reached through CLOSED, not OPEN.

This task is a finite typed relation-composition problem. OPEN/CLOSED/WAIT are **toy edge labels**, not classifications of human emotional states.

## 2. What is preserved and what is not

**Equal within the positive/negative pair:**
- Node count **8**; typed directed arc count **14**; no duplicates or loops.
- Global type histogram and canonical bag of individual tokens from all clauses `SOURCE TYPE DEST`.
- Every *named* node's incoming/outgoing degree **by type** (not merely total degree).
- Total number of reciprocal arc pairs (zero).
- Strong connectivity: every node can reach t→s and every other node.
- Aggregate, endpoint-free, adjacent two-hop type-label counts. This equality is a **consequence** of typed degree equality, via
  \[
  B_{ij}=\sum_{x\in V}d_i^-(x)d_j^+(x).
  \]
- The unlabeled directed graph *isomorphism class*, witnessed by swapping u↔v in the positive **untyped** graph and recovering the negative's untyped edges (all other vertex names fixed under that witness).

**Not preserved:**
- The exact directed adjacency of the **named** graph. The intervention is precisely a rewiring.
- Endpoint-specific two-hop paths: the OPEN→P leg from s ends at u in G+ and v in G−.
- A fixed source/target three-hop OPEN,P,ACK route (positive 1, negative 0).
- The full multiset of source→destination pairs and any edge-identity features that see exactly which target receives a P arc.

Do **not** describe the last difference as a hidden-invisible or purely semantic field. It is an observable typed graph relation which can be extracted and solved by explicit symbolic computation.

## 3. Distinctness relative to A01, A02 and A03

| Candidate | Graph size | Intervention | Key preservation | Main limitation |
|---|---:|---|---|---|
| A01 | 4 nodes / 4 arcs | edge-target swap with altered cycle partition | per-node untyped degrees and simple token bag | graph connectivity / reciprocity gives answer |
| A02 | 6 nodes / 9 arcs | P/Q **label reassignment** on fixed 2×2 middle arcs | **exact named untyped topology** and typed per-node degrees | one bipartite permutation mechanism |
| A03 | 8 nodes / 16 arcs | P/Q/R **label reassignment** on fixed 3×3 middle arcs | **exact named untyped topology** and typed per-node degrees | same broad permutation mechanism as A02 |
| **A04** | **8 nodes / 14 arcs** | **two P-typed edge endpoint rewiring** | typed per-node degrees + untyped **isomorphism**, but *not* named adjacency | simple graph-identity features may detect new edge pairs |

A04 earns the modest statement **"a non-label-permutation structural edit exists under matched typed-degree constraints."** It does not earn "three independently validated empirical relation families" or "semantic meaning is geometric."

## 4. Required future observed-text comparison (not executed)

As in the GRM-A01/A02/A03 design, a fair later protocol must give **the same raw information**—for example the same number of fully grounded renderings of each world and an identical question—to each learned or programmed *non-oracle* comparator.

Required scientifically serious candidates:
- a lexical/n-gram baseline over **all** admitted views;
- the same encoder outputs pooled to a single point-vector representation (all views included);
- strong non-geometric multi-view or set-learning comparator with matched tuning and capacity;
- an observed-text-to-typed-graph extractor **built only with permitted TRAIN/VALIDATION information**, followed by an exact symbolic path solver;
- the candidate Grassmann/subspace representation of those same encoder outputs, with predeclared rank, centered/uncentered choice, principal-angle metric, SVD tolerance, degenerate-basis policy, and provenance;
- a matched-information generic sequence model;
- the **true-source-graph** exact solver, labeled **privileged oracle ceiling**, never included as though it received the same raw text.

A graph identity-matching baseline capable of recovering the switched named P edge **must be included**, since A04 relaxes exact named adjacency unlike A02/A03. No candidate may receive hidden edge lists, relation labels, source generator tags, or extra views unavailable to its matched rivals.

## 5. Data, statistics and falsification remain future gates

This pair is a **fixed mathematical witness**, not a statistical sample. It cannot establish out-of-domain transfer. Before creating any future renderer/corpus/experiment:
- require multiple non-isomorphic *and mechanistically distinct* template families and multiple root instances per family; do not count 8! renamings as independent samples;
- define a provably legal positive/negative construction without quota-dependent rejection sampling, and respect the separate negative RGR-05B Flow feasibility result;
- preregister the *relation-preserved/surface-changed* and *relation-broken/surface-matched* controls from RGR-03; hold all pair siblings, source identities and template derivatives together;
- prevent leakage from renderer syntax, actor/role naming, clause order, path length, tokens, metadata, file naming, hidden graph summaries and domain origin;
- define a **single primary estimand** and root-level paired correctness/competence, meaningful-effect margin, simultaneous-comparison adjustment, uncertainty calibration, seeded model selection, explicit stop/no-rescue and separate TEST/REPLICATION, all **before data**;
- preserve null, invalid, underdetermined and replication-failed outcomes; do not reinterpret failure as evidence of a deeper theory;
- require independent source/method review, Founder approval, license/weights and resource audit before any dataset generator, learned-model comparison or external inference.

**The immediate recommended stop boundary is methodological review, not A05 by automatic repetition.** The growing list of fixed witnesses has established **logical feasibility** for several edits. It has *not* established that the same task is scientifically valuable, or that a proposed encoder can read its relation from natural language. Independent critique should decide whether to proceed to a separately governed benchmark design or return for a more meaningful target.

## 6. Epistemic and product limits

No conclusion is established about Grassmann's empirical benefit, sheaf cohomology, consciousness, embodied Field/Weather, Burger/Stone physiological claims, psychological diagnosis, sacred imagery, Elemental Alchemy, or any person's first-person experience. These examples concern only graph-theoretic, team-authored typed path rules.

Sophontic's company-described geometric reasoning and load-bearing perturbations remain related *external inspiration*, not the source or executable implementation of the two-switch. Zhou et al.'s academic Geometry of Reasoning work remains a distinct literature lineage.

**Disposition:** A04 is a noncanonical Class C *research-design challenge*, not an authorized RGR benchmark, training procedure, MAIA model-memory update, admission of private text, or runtime change. The existing GRM-01, A01–A03, RGR-00–06, RGR-CF01, October Flow and Research Method Evaluation records must remain unchanged.

**Next authorized action after this packet:** independent scientific/source review of the exact A02/A03/A04 family distinctions and proposed fair comparators; afterward a separate Founder decision whether a truly frozen, properly powered experimental protocol merits authorization. No generated corpus, model weights, inference, training, TEST, REPLICATION, merge or deployment is authorized here.
