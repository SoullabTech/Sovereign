# RGR-GRM-A02 — Typed Relational Composition Under Matched Local Statistics

**Date:** October 16, 2026
**Programme:** RELATIONAL-GEOMETRY-REASONING, exploratory/noncanonical GRM-A design family
**Standing:** RESEARCH_DESIGN_CANDIDATE · FINITE HAND-AUTHORED MATHEMATICAL WITNESS ONLY · NOT PREREGISTERED
**Immediate parent:** GRM-A01 design commit `1cc463da4d660a6bbf351df5847c4108d8166d4e` (draft PR #1833)
**Grandparent:** GRM-01 draft PR #1832 (also unmerged)
**Scope:** documentary refinement and exact fixed-graph tests only; no population/generator, model, training, TEST, REPLICATION or production integration.

## 0. Why A01 needs an alternative before a freeze

A01's one directed four-cycle versus two disjoint reciprocal cycles is valid mathematics and a useful calibration contrast. However, reciprocity, connected components and SCC size trivially reveal its label in a true graph. It is too weak, on its own, for a serious claim that a Grassmann/subspace representation captures something that relation-first symbolic reasoning does not.

A02 does **not** alter A01 or claim to rescue it. It proposes a second, strictly scoped hand-authored witness that holds more local and topological statistics fixed while changing an explicitly declared three-hop **typed path** relation. Its motivation is the existing RGR-01 cross-domain relational-transfer question, RGR-03's independent relation-break control, and the October RGR-05B lesson: construct both outcomes by exact edits rather than chasing rare positives under rejection quotas.

**Canonical numbering:** "RGR-06" already denotes the September 2026 confirmatory implementation lock (no empirical H-RT1 performance evidence). A02 is not a numbered canonical gate and does not open RGR-07. The existing RGR-04 DIRECTED_TWO_STEP_COMPOSITION benchmark has six nodes and eight edges, with its own frozen dataset/training/test rules. A02 is a different typed three-hop toy (six nodes/nine arcs), on a separate exploratory branch, with no attempt to reuse, modify or contaminate RGR-04 splits or seeds.

## 1. Formal task: three-hop relational binding, not a psychological diagnosis

Define an edge-typed directed graph:

\[
G=(V,E,\tau),\quad V=\{s,a,b,c,d,t\},
\]

where `τ` is the edge-type map with labels OPEN, CLOSED, P, Q, ACK, IGNORE and RESET.

Both worlds have the **same nine directed edges**, five with fixed labels:

| Edge | Type in both worlds |
|---|---|
| s→a | OPEN |
| s→b | CLOSED |
| c→t | ACK |
| d→t | IGNORE |
| t→s | RESET |

The only difference is a **checkerboard switch** of four edge labels:

| Edge | World G+ | World G− |
|---|---|---|
| a→c | P | Q |
| a→d | Q | P |
| b→c | Q | P |
| b→d | P | Q |

**Proposed target:** Does a directed path from designated source s to target t have exactly three edges, with label sequence **OPEN → P → ACK**?

\[
r(G;s,t)=\mathbf 1\{\exists u,v:(s,u,\mathrm{OPEN})\wedge
(u,v,P)\wedge(v,t,\mathrm{ACK})\}.
\]

The reference answers are:

- **G+: YES** — path s→a→c→t has labels OPEN, P, ACK.
- **G−: NO** — the OPEN/P leg reaches d and exits with IGNORE; the P/ACK leg starts from CLOSED via b.

This is a *typed relational-path predicate*, not human affect, attachment, trauma, mental health, energy flow, or a covert statement about another person's motivation.

## 2. Why the pair is a stronger matched control

The checkerboard switch preserves:

1. The entire **untyped directed adjacency graph**, not merely total edges/degrees.
2. Six vertices, nine arcs, looplessness and edge uniqueness.
3. Every vertex's total in- and out-degree.
4. The **type-resolved in- and out-degree counts at every named vertex**.
5. Global counts of all seven edge labels.
6. Total reciprocal-edge pairs (zero).
7. Weak and strong connectivity (the whole graph is strongly connected, since t→s provides return).
8. A canonical **unigram bag of edge-clause tokens** if each arc is rendered as `SOURCE TYPE DEST`.
9. Even the global multiset of adjacent **two-hop edge-type label pairs**, counted without retaining intermediate-node or endpoint identity.

But the triple composition OPEN,P,ACK changes from **one** source-to-target route to **none**. Both two-hop fragments OPEN→P and P→ACK occur in both worlds; their separate presence does not establish a single composable three-hop path.

This makes explicit weak baselines—unlabeled topology, per-vertex typed marginals, unigram tokens, global two-hop label-bigram histograms—provably unable to discriminate the two fixed worlds.

**Independence correction:** the unanchored two-hop label-bigram histogram is an **algebraic corollary**, not an independent additional control, of fixed typed degrees at every vertex. For edge types i,j its count is \(B_{ij}=\sum_{v\in V} d^-_i(v)d^+_j(v)\). The checkerboard deliberately preserves these marginals; retaining shared endpoint identities is what makes the global three-hop route distinguishable. Identical untyped connectivity is likewise a consequence of an unchanged edge set, not separate independent evidence.

### Limits of this matching

We **do not claim** that all two-hop structures are equal. Endpoint-aware two-hop walks can differ. Full edge-typed adjacency, when correctly extracted, allows exact symbolic classification. A text-to-graph parser plus a three-hop typed path solver is a valid, serious rival and may solve every future example. **Matching or losing to such a comparator does not justify a claim of unique Grassmann advantage.**

Exact fixed-graph correctness does not demonstrate cross-domain, natural-language, cognitive, phenomenological or interpersonal relational meaning.

## 3. Fair future representation comparisons (not executed here)

A later, separately authorized experiment would provide **the same number of complete natural-language renderings** of each typed world to *every* candidate, plus the same fixed source-target query. The gold graph, label, switch flag, root ID, construction seed, domain and template identifiers are evaluator-only. Giving those fields to one comparator requires the same information in a separately labeled condition for all others. A true-graph symbolic solver is an **oracle ceiling**, never an information-matched learned competitor.

| Method family | Proposed input/operation | Same raw views? |
|---|---|---|
| F_LEX | n-gram/lexical over all views, tuned only on TRAIN/VALIDATION | Yes |
| F_POINT | same frozen encoder, pooled/concatenated multi-view point features | Yes |
| F_MULTI | non-geometric set/multi-view model with equivalent source observations and tuning budget | Yes |
| F_TEXT2GRAPH | text-to-typed-graph extraction using admitted TRAIN/VALIDATION data, then exact typed path query | Yes |
| F_SUBSPACE | same encoder/view vectors; frozen-rank orthonormal subspace and principal-angle/chordal comparison | Yes |
| F_GENERIC | equally trained and informed unrestricted model | Yes |
| F_ORACLE | exact solver on **hidden source graph** | No: privileged ceiling only |

Grassmann requirements: choose and fingerprint exact encoder/tokenizer/weights, ambient dimension, centered/uncentered basis, rank grid, near-degeneracy/abstention, rank/SVD tolerance, principal-angle distance and training-only preprocessing **before evaluation**. In particular, a subspace method cannot be credited with a geometry effect just because it receives more paraphrases or better embeddings than the point/multiview models.

No decoder, renderer, representation model, encoder, embeddings, dataset, training run or performance statistics exist in A02.

## 4. Proposed future prelock requirements (all pending)

Before any benchmark is materialized, demand:

- More than one eligible structural-template family; the current single checkerboard is insufficient for generalization claims. Require **at least two** independently constructed and independently inspected families that admit equally balanced relation flips without revealing target labels through metadata.
- Explicit separation of **held-out structural templates** from surface/domain holdout; if impossible, narrow the claim to a predefined surface-transfer setting.
- Exact matched roots: both labels, each paraphrase and role-renamed descendant are kept in one partition; independent TRAIN, VALIDATION, untouched TEST and separately authorized REPLICATION.
- Mathematically proven finite feasibility for paired construction before any quota, not random rejection. Record failures rather than replacing hard roots or moving thresholds after scores.
- Unambiguous edge-role textual renderings and independent source verification of the true graph; uncertain text means BENCHMARK_INVALID, not convenient forced interpretation.
- Equal raw views, encoder choice, TRAIN/VALIDATION information, parameter and hyperparameter-search budgets across serious baselines.
- Exact primary endpoint **paired correct-both-sides at independent scenario-root level**, adequate baseline competence, root-level clustered uncertainty with a calibrated multicomparator contrast, meaningful effect margin fixed prospectively, and explicit abstention/invalid/underdetermined/unsupported/replication-failed outcomes.
- Adversarial checks on node-role renamings, clause/view order, actor identity, label wording, sentence length, lexical/domain imbalance, graph-template leakage and unbalanced nuisance features.
- Full source/license/dependency/runtime review, human method review, explicit Founder approval of a *new* frozen protocol and separate grants for benchmark generation, training, TEST and REPLICATION.
- Continued preservation of RGR-04/06, RGR-CF01, RGR-EVAL-CAUSAL-01 and the October RGR-05B failure without retroactive reclassification.

No new quotas, seeds, engines, weights, effect sizes, thresholds or TEST data are frozen by this document.

## 5. What the witness is—and isn't

**It can establish:** on the exact hand-authored pair, local type statistics and unanchored two-hop label histograms do not determine the anchored three-hop typed-path answer, while exact global composition does.

**It cannot establish:** a new empirical RGR result, model superiority, neural representation geometry, sheaf cohomology, personal truth, actual conservation of meaning, consciousness, or therapeutic/energetic mechanism.

The presence of t→s represents graph return, **not** Burger/Stone's physiological currents, and nothing in this toy turns Flow into primitive #11. Weather, Elemental Alchemy and Aether are not ground-truth labels or scoring variables.

Sophontic's company-described perturbation paradigm is an inspiration for load-bearing contrasts, **not** the source or implementation of this team-authored checkerboard. Zhou et al.'s independent Geometry of Reasoning trajectory work is a distinct source and must not be misattributed.

**Disposition:** A02 is a **research-design challenger** to A01's target adequacy, not a corrected benchmark result. It neither invalidates nor overwrites A01, opens RGR-07, changes the September confirmatory lock, nor licenses a research run.

**Next lawful act:** independent source/method review of this exact design and fixed witness; only then a Founder decision whether to keep A01 as calibration and commission a new multi-template A02 protocol, or return for an even stronger formal relation family. No member data, model inference/training, MAIA/runtime changes, merge or deployment is authorized.
