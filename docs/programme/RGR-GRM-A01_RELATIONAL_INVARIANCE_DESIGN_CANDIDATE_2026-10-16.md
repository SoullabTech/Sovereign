# RGR-GRM-A01 — Cross-Domain Relational Invariance: Prospective Experimental Design Candidate

**Date:** 16 October 2026
**Programme:** `RELATIONAL-GEOMETRY-REASONING`; exploratory subdivision of `RGR-GRM-01`
**Standing:** DESIGN_CANDIDATE / RETURN_FOR_SPECIFICATION_OPEN / NOT_PREREGISTERED / NOT_AUTHORIZED_TO_EXECUTE
**Parent source SHA:** `b8e1b34df46784667b54bb68ebda491a66f86ec8` (draft PR #1832, itself unmerged)
**Scope:** documents, source comparison and *four hand-authored mathematical reference graphs only*. No data generation, encoder/model use, metrics, benchmark materialization, TEST or REPLICATION.

## 0. What is genuinely new relative to the existing RGR programme?

The **question is not new**. RGR-01's September 18 landscape (§14) explicitly proposed that a relation-preserving surface change should be used to compare a subspace representation against matched point-vector and graph/structural models. RGR-03 set the relation-preserving AND relation-breaking falsification law; RGR-04 froze a different `DIRECTED_TWO_STEP_COMPOSITION` benchmark, and RGR-06 locked its confirmatory machinery without empirical results. `RGR-GRM-01` now proposes a geometry-of-meaning synthesis while RGR-CF01 covers related counterfactual response changes. **A01's contribution is a more discriminating experimental-design contract—not a new foundational hypothesis or a reopened canonical gate.**

This proposed study must not change the RGR-RT1-D2C-01 rules or use its TEST/REPLICATION partitions; it must receive its own future identifier/lock if ever authorized. The October Flow RGR-05B R1 failure remains intact.

## 1. One bounded empirical proxy—not an ontological definition of meaning

**Candidate target:** directed four-role circulation versus partitioned reciprocity in a synthetically described relational network. Every edge has one typed meaning, such as "passes a message to"; distinct permitted lexicons/domain scenarios would be proposed later.

Let `V={a,b,c,d}`. Each reference graph has exactly four directed edges, each vertex has in-degree and out-degree one, no loops and no repeated directed edges. Positive `r=1`: one directed 4-cycle. Negative `r=0`: two disjoint directed 2-cycles. The exact hand-authored pair:

```text
Positive G+ : a→b, b→c, c→d, d→a     [one 4-cycle]
Negative G- : a→b, b→a, c→d, d→c     [two 2-cycles]
```

The counterfactual is a two-edge head swap:

```text
{ b→c, d→a } → { b→a, d→c }
```

It preserves node count, edge count, every node's in-degree and out-degree, and the multiset of actor occurrences as a sender and receiver. It *changes* the global directed cycle partition. A first-order bag of edge-clause words can be controlled to be identical even when directional pairings differ. This counterfactual family has both outcomes **by construction**, avoiding the per-root random rejection/quota trap in RGR-05B. It does **not** preserve reciprocity count, weak-component count or strongly-connected-component sizes; those must be admitted as legitimate simpler graph cues and comparators, not hidden.

**Important validity ceiling:** when a comparator receives the *true* four-edge graph, an exact graph-algorithm oracle classifies the task perfectly. GRM-A is consequently a **surrogate study of how well textual/representational systems recover a declared relation from held-out expressions**, not a demonstration that geometry is required for logical inference. The exact symbolic oracle is a privileged information ceiling and must never be misreported as an equal-observation baseline.

### Information-access and renderer boundaries

A future instance is `x=(t_1,t_2,t_3,t_4,q)`: four source-equivalent **complete narrative renderings of the same directed graph**, plus the same fixed question `q` asking whether one directed cycle passes through all four actors. Each rendering must express all four arcs; the same number of renderings is provided to *every* serious competing model. Rendered text is the permitted raw input. Internal source graph, label, pair ID, edge-list oracle trace, generation seed, domain ID and transformation tags are held by the evaluator and **not exposed to competitors** unless an identical-information variant of *every* comparator receives them too.

The *toy reference graphs above* are the only concrete examples admitted in this design. This work does not instantiate `t_1...t_4`, synthetic corpora, lexicons, names or held-out domains. A separate generator design must be completed and reviewed before any example file can be generated.

RGR-03's four-cell logic is retained:

| Relational state | Surface condition | Desired criterion |
|---|---|---|
| unchanged | familiar vocabulary, order and layout | in-domain competence |
| unchanged | held-out domain, names, paraphrase families or style | relation-preserving transfer |
| changed by exact two-edge head swap | matched surface scenario and actor multiset | relation-breaking sensitivity |
| changed by the same swap | held-out domain/surface | joint-shift discrimination |

**No diagnostic label, clinical interpretation, social motive, energetic state or spiritual meaning** can be inferred from this toy graph task. The family is chosen for explicit mathematical falsifiability, not for psychological realism.

## 2. Distinct baselines with fair raw information

The following are *prospective model-family definitions*; no encoder weights have been selected, downloaded or executed. Exact implementations, versions, licensing, seed and runtime bindings remain PENDING.

| Candidate | Same permitted four renderings? | Proposed operation | What it tests |
|---|---|---|---|
| `F_LEX` lexical | yes | TRAIN-only word/character n-gram vectorization over all four rendered texts, pooled or concatenated, with a tuned linear classifier | simple lexical/format shortcuts |
| `F_POINT` single vector | yes | frozen shared encoder `E_0`; pool the four view vectors by a declared operation; tune the same held-out-domain classifier search discipline | whether the *multi-view source* is enough without a subspace |
| `F_MULTI` multi-view non-geometric | yes | order-invariant learned set pooling or equal-budget multi-vector comparison using the same four `E_0` outputs | whether any gain is merely aggregation or capacity |
| `F_TEXT2GRAPH` symbolic structural | yes | source-text relation extractor with TRAIN/VALIDATION-only syntax; then graph/cycle classifier | a serious explicit relation-first competitor |
| `F_SUBSPACE` Grassmann candidate | yes | basis of the same four `E_0` view vectors; principal-angle/chordal kernel or declared projection features | specific additional value from orientation of the subspace |
| `F_GENERIC` same-observation comparator | yes | suitably capacity-controlled non-geometric sequence/set model on the same four renderings | whether architectural restrictions are necessary |
| `F_ORACLE` separate ceiling | **no** (privileged latent graph) | exact graph-cycle test | renderer/gold consistency only; excluded from main fair-head-to-head contrast |

**Non-negotiable parity:** the subspace method does **not** receive four paraphrases while the point-vector baseline receives one. All view count, original text, encoder training, vocabulary and supervision are the same unless an explicitly labeled ablation varies one. If `F_SUBSPACE` has a larger hyperparameter budget or a stronger encoder, no causal advantage may be assigned to the Grassmann representation.

A graph parser constructed from the known synthetic grammar must be declared a **privileged grammar-aware structural baseline** if its rules are given from the hidden renderer. Only a parser learned or specified using the same permitted TRAIN/VALIDATION information counts as an equal-observation main comparator. Distinguish a *metadata-aware algorithm* from an algorithm actually extracting edge roles from input text.

## 3. The Grassmann candidate: mathematical obligations

Let `z_j=E_0(t_j)∈R^n` be embeddings from one frozen and explicitly identified encoder; `n` and tokenizer/model digest must be resolved before execution. Propose a TRAIN/VALIDATION-only comparison between:

- uncentered subspace spanned by `[z_1,…,z_4]`;
- centered variation subspace spanned by `[z_j − z̄]` (rank at most three).

Do **not** select between them using TEST. With `k` fixed to a candidate grid `{1,2}` for validation-only selection, let `Q_x∈R^{n×k}` be orthonormal columns from a deterministic SVD/QR procedure. A candidate chordal distance is

$$
d_c(Q_x,Q_y)=\sqrt{k-\left\|Q_x^{\mathsf T}Q_y\right\|_F^2}.
$$

for common rank `k`; equivalently it is the square root of the sum of squared sines of the `k` principal angles. The formula describes subspace geometry; it does **not** establish that the chosen encoder contains a meaning manifold.

Specify sign/basis-rotation invariance, view permutation invariance, near-zero singular-value and rank-deficiency handling, and numerical tolerance **before evidence**. No label-dependent rank, oracle latent graph feature, test-time paraphrase augmentation, or post-hoc denominator change is allowed. Include k=1, pooled-mean and centered/uncentered ablations with identical encoder data. Source-stability testing across a separately licensed second encoder remains an optional later confirmatory gate, not an assumption.

### Basic mathematical defeat cases to preserve

- Four views identical after encoding: centered basis rank collapses; this is a declared degeneracy, *not* permission to quietly replace the input, inflate rank, or drop an unfavorable case.
- All view vectors multiply by -1 or rotate within their span: the Grassmann point should be basis-independent. A distance that changes under orthonormal basis changes is not measuring the intended subspace.
- The same relation rendered in an unrecognized domain: the approach may fail or report abstention; never relabel it as a different relation to rescue results.
- A strong multi-view pooling baseline matches the candidate: extra value from the Grassmann structure has **not** been shown.

## 4. Sampling and partition law (design only, not executed)

**Primary scientific unit:** a matched `(G+,G-)` *scenario root* sharing one domain scenario, role cast and non-load-bearing descriptions. Construct each pair deterministically from the exact two-edge head swap, then render its admissible view families. No independent positive/negative rejection quotas are needed and no sibling can be excluded to rebalance a difficult topology. A failure to render one counterpart invalidates that pair and must be reported in the prospective feasibility phase; root replacement rules require their own explicit pre-lock decision.

**Intended generalization:** held-out *surface realization and domain*, not previously unseen graph-isomorphism class. There are only two graph motif classes in this deliberately minimal candidate. Because those classes must appear in both training and test to assess transfer, a blanket “put all graph-isomorphic cases in one partition” would make the proposed test impossible. Instead, keep every descendant of a given scenario root together, and freeze distinct domain/template families for TEST and REPLICATION. Report the deliberate repetition of the two graph motifs across partitions without calling it topology-held-out generalization.

Candidate group units:
- root pair, all its renamed-actor descendants, all four textual renditions, all surface perturbations and the flipped relation;
- grammar template *family*, rather than just exact text string;
- domain, with TEST and REPLICATION domains disjoint from development domains;
- cloned or reused source passages, which must not cross splits.

**Provisional resource envelope for future design review** (not a quota, study commitment or experiment lock): target 800 train, 200 validation, 300 TEST and 300 REPLICATION **scenario pairs** using separately declared template/domain families and deterministic streams. These are planning figures only. A source-reviewed feasibility audit must show that there are enough semantically distinct template families and domains to make such partitions meaningful. Do not manufacture independence by repeating identical graph labels under cosmetic renamings. If the corpus cannot support the target envelope, record `BENCHMARK_DESIGN_RETURN`, not a hidden substitution.

Do not expose labels or scenario roots via filenames, prompt metadata, punctuation, record order, output length, dialect, gender, unusual stopwords, token count or direction verbs. Rendered positive/negative pairs must be checked for imbalance in length, actor-token counts, relationship-word counts, sentence counts and lexical/domain correlations; departures become explicit nuisance variables or a *new* proposal before freeze.

## 5. Prospective scoring, analysis and stop law

**Candidate primary endpoint:** *paired correct classification rate* on held-out-domain TEST, assessed once per held-out scenario root:


$$
M(F)=\frac{1}{N}\sum_{i=1}^{N}\mathbf{1}\{\widehat r_F(x_i^+)=1\;\land\;\widehat r_F(x_i^-)=0\}.
$$

A paired score awards one point only when the same method gives **both** sides correctly. Score each model on the same root pairs. Do not collapse multiple views or paraphrase cousins into independent observations; one root produces one primary outcome. Record balanced accuracy separately, including whether errors disproportionately affect one label; a constant predictor cannot receive paired credit.

**Candidate main contrast:** `Δ = M(F_SUBSPACE) - max[M(F_POINT),M(F_MULTI),M(F_TEXT2GRAPH),M(F_GENERIC)]` on the **matched information-access comparator set**. The max-selection rule and hyperparameter search protocol must be fixed using TRAIN/VALIDATION before TEST; choosing the maximum observed TEST result as if it were a validation selection requires simultaneous-inference or valid multiple-comparison correction. `F_LEX` is a required leakage screen; `F_ORACLE` is the labeled information-privileged ceiling.

**Not yet locked:** practically meaningful margin `δ_min`, 95% confidence rule, bootstrap calibration, optimizer/encoder versions, SVD numerical rules, initializer/seed count, model-size budget, training stop, chosen held-out domains, anti-leakage thresholds, handling of degenerate views and TEST/REPLICATION populations. The eventual experiment must fix these **before any confirmatory data generation or inspection**.

**Candidate uncertainty method:** root-clustered paired bootstrap using common root resamples across models; where models are stochastic, independently resample declared model-initialization runs within each model family. Coverage must be assessed in a separately permitted simulation/calibration step, not presumed. Because there are multiple strong competitors, predeclare a simultaneous confidence procedure or conservative familywise contrast (not ad hoc selection from many promising p-values). The `δ_min` should come from task utility/cost or a justified pilot on separate data, not be chosen because it helps the candidate.

**Decision hierarchy:**
- `BENCHMARK_INVALID`: renderer/paired labels leak, source roots cross splits, balanced-pair construction fails, information access differs, or controls cannot distinguish relation and surface.
- `UNDERDETERMINED`: competence floor not met, uncertainty uncalibrated/too broad, or required comparator unavailable.
- `NOT_SUPPORTED`: a valid, competent study fails the preregistered superiority/transfer or relation-breaking gate.
- `PROVISIONAL_SUPPORT`: all preregistered gates pass on untouched TEST; not final until separately authorized REPLICATION.
- `REPLICATION_FAILED`: eligible TEST result fails under the same independent replication plan.
- `SUPPORTED_FOR_THIS_TASK`: only after all frozen gates and replication pass; it does not imply ontological meaning-as-geometry.
- **No equivalence claim** just because superiority fails; actual equivalence needs separately justified equivalence margins and full interval inclusion.

Stop on first invalidating leakage violation, unauthorized data/model/provenance change or budget breach. Failed controls and weak performance remain part of the result. A method-name change, new data filter, changed split or new `k` creates a new version and preserves prior outcome. These are prospective rules only.

## 6. Specific negative controls that must defeat shortcuts

1. **Role permutation:** rename all four actors coherently without changing edge directions or target; answers should remain stable.
2. **Clause/view permutation:** reorder clauses and four full renderings; label must remain stable.
3. **Lexical balancing:** source and destination actor occurrences, edge verbs and sentence counts matched between positive and negative pair.
4. **Relational two-switch:** flip precisely the two declared arcs, hold shared scenario/textual apparatus fixed; the target must flip.
5. **Cheap-graph-feature comparator:** equal degree and edge count are insufficient; in contrast, reciprocity, SCC counts and weak connectivity may solve the surrogate. Admit them as valid parsimonious explanations.
6. **Embeddings versus encoder:** check if a second permitted encoder qualitatively changes the subspace result before generalizing.
7. **View-count parity:** if multi-view subspaces beat a one-view vector but not pooled/multi-view vectors, the claimed subspace-specific effect is **defeated**.
8. **Baseline budget:** permit the same TRAIN/VALIDATION search, compute and observations for serious competitors, or label sensitivity/budget differences instead of claiming causal superiority.
9. **Question/label leakage:** no explicit graph target labels, hidden edge lists, generator tags or memoized answer cues in any candidate input.
10. **Out-of-domain paraphrase:** if domain shift simply changes a lexicon into never-learned arbitrary tokens, a failure is about linguistic grounding; record this rather than claiming relational meaning is lost.
11. **Natural-language ambiguity:** reject or separate renderings admitting multiple graph parses; do not silently assign one convenient graph as ground truth.
12. **Strongest alternative:** if a simple text-to-graph parser and exact graph rules solve held-out domains, the study does not warrant an essential Grassmann claim.

## 7. Tooling, personnel, acceptance and permissions

The code/method choices from `RGR-EVAL-CAUSAL-01` remain candidates for **later source review**: Inspect AI, LM Evaluation Harness, DoWhy and pyvene are not installed or admitted by this packet. A source editor must inspect descriptions for lexical-template alignment; a methodological reviewer must challenge oracle-versus-observed information fairness, training-budget comparability, group dependence, and uncertainty calibration. The Founder selects and authorizes the exact subsequent experiment only after those objections receive a documented disposition.

**Permitted this turn:** documentary design, local source comparisons, preservation of evidence, hand-authored graph truth-table witness and ordinary documentation tests.

**Not authorized:** synthesize an evaluation corpus, download model weights or datasets, package-install benchmark tools, run local/external model inference, train or score learner families, touch member/clinical/private data, open RGR-07, change RGR-03/04/05/06 or RGR-CF01, change MAIA/Studio/House or production memory, schema/migrate, merge or deploy. A frozen benchmark requires its own accepted version, source digests, runtime and explicit execution grant.

### Decision requested after independent review

Either (i) `RETURN` for unsuitable proxy or unfair comparators, or (ii) accept this as the **design basis only** for a separately frozen `GRM-A` experimental protocol. No action in this candidate automatically becomes an admitted RGR gate or a claim that human meaning has been geometrically explained.
