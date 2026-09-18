# RGR-04 — Synthetic Relational Benchmark Constitution

**Programme:** RELATIONAL-GEOMETRY-REASONING
**Gate:** RGR-04 — SYNTHETIC RELATIONAL BENCHMARK CONSTITUTION
**Date:** 2026-09-18
**Status:** CLOSED · FOUNDER ADJUDICATED · BENCHMARK CONSTITUTION PRESERVED · NOT EXECUTED
**Canonical base:** b040d3bcaafe30df83e35a2fe534f5d0ea85e118
**Upstream:** RGR-00 through RGR-03 canonical + CLOSED
**Primary hypothesis:** H-RT1 — RELATIONAL TRANSFER

---

# 0 · Gate boundary

RGR-04 designs one benchmark constitution only.

It may:

- freeze one relation family q_*;
- freeze one surface specification Σ_*;
- define a synthetic generator contract;
- define positive, negative, relation-preserving, and relation-breaking constraints;
- freeze train, validation, test, and replication sizes;
- freeze model-class contracts without implementing them;
- freeze metrics, thresholds, uncertainty rules, leakage law, stopping law, and replication law;
- define BENCHMARK_INVALID and UNDERDETERMINED conditions;
- undergo independent adversarial review.

It may not:

- materialize even one benchmark example;
- run the generator;
- implement a model;
- train a model;
- run an empirical experiment;
- inspect empirical benchmark performance;
- open RGR-05;
- formalize Elemental operators;
- alter MAIA;
- create schema or migrations;
- deploy.

---

# I · What this benchmark can and cannot establish

The synthetic target label in RGR-04 is deliberately a function of a relational structure.

Therefore a future positive benchmark result **cannot establish that relations are fundamental**.

It cannot establish that:

- human meaning is relational;
- meaning is geometric;
- consciousness is geometric;
- Grassmann geometry is correct;
- sheaf theory describes psychology;
- Spiralogic is validated;
- Elemental Alchemy is validated.

The benchmark asks a narrower model-capability question:

> **Can a non-oracular system learn a frozen relational rule and transfer that rule across a held-out change in surface realization, while reacting correctly to a relation-breaking counterfactual and without relying on surface shortcuts?**

That is the empirical content of the first H-RT1 benchmark.

---

# II · Benchmark identity

RGR-04 names the first benchmark design:

## RGR-RT1-D2C-01

Expanded name:

> **Relational Transfer 1 — Directed Two-Step Composition**

Primary relation family:

## q_* = DIRECTED_TWO_STEP_COMPOSITION

The task operates on a simple directed graph:

\[
G=(V,E)
\]

with:

\[
|V|=6.
\]

A query is an ordered pair:

\[
(s,t), \qquad s\neq t.
\]

The target is:

\[
q_*(G,s,t)=
\begin{cases}
1 & \text{iff there exists a unique } m\notin\{s,t\}\text{ with }(s,m)\in E\text{ and }(m,t)\in E \\
0 & \text{iff no such }m\text{ exists.}
\end{cases}
\]

Every admissible example must also satisfy:

\[
(s,t)\notin E.
\]

A direct source-to-target edge is forbidden so the answer cannot be reduced to one-edge detection.

---

# III · Why this relation family

DIRECTED_TWO_STEP_COMPOSITION is chosen because it is:

- minimal;
- exact;
- synthetic;
- non-clinical;
- independent of Elemental labels;
- not inherently metric;
- not inherently Grassmannian;
- not inherently sheaf-theoretic;
- expressible as graph structure, algebraic composition, adjacency multiplication, or generic sequence/tensor computation;
- easy to break by a degree-preserving intervention.

This choice does **not** establish graph structure as the preferred RGR ontology.

A graph is simply the cleanest carrier for this first falsifiable relational rule.

---

# IV · Generator object

A future separately authorized generator must produce an abstract example:

\[
x=(U,A,q_s,q_t)
\]

where:

- \(U\in\{-1,+1\}^{6\times16}\) is the node surface-code matrix;
- \(A\in\{0,1\}^{6\times6}\) is the directed adjacency matrix;
- diagonal entries of \(A\) are zero;
- \(q_s\in\{0,1\}^6\) is the one-hot source-query indicator;
- \(q_t\in\{0,1\}^6\) is the one-hot target-query indicator.

The supervised target is:

\[
y=q_*(G,s,t)\in\{0,1\}.
\]

The target y is never part of model input.

The latent generator metadata used to construct y is never model input.

---

# V · Surface specification Σ_*

RGR-04 freezes:

## Σ_* = BALANCED_16BIT_NODE_CODE

Each node receives a 16-dimensional code:

\[
u_v\in\{-1,+1\}^{16}
\]

with exactly eight \(+1\) entries and eight \(-1\) entries.

This gives all node surface codes:

- identical L1 norm;
- identical L2 norm;
- equal positive/negative bit count.

The full admissible code universe therefore comes from the constant-weight set:

\[
\mathcal C=\{u\in\{-1,+1\}^{16}: \sum_i \mathbf{1}[u_i=+1]=8\}.
\]

The split-specific codebooks are pairwise disjoint.

All future pseudo-random choices are deterministic from frozen split master seeds. The implementation gate must derive named substreams for CODEBOOK, GRAPH, SURFACE_ASSIGNMENT, ROW_ORDER, and SWITCH from the split master seed using SHA-256 over a canonical UTF-8 string of the form:

~~~text
RGR04|RGR-RT1-D2C-01|<split>|<master-seed>|<stream-name>|<counter>
~~~

No later gate may replace the named-stream derivation after materialization begins.

Frozen split master seeds:

~~~text
TRAIN       41041
VALIDATION  41042
TEST        41043
REPLICATION 41044
~~~

The split-specific codebooks are pairwise disjoint:

\[
\mathcal C_{train}
\cap
\mathcal C_{val}
=
\mathcal C_{train}
\cap
\mathcal C_{test}
=
\cdots
=
\varnothing.
\]

Each codebook contains exactly 256 unique codes.

Frozen future codebook-selection seeds:

~~~text
train       41041
validation  41042
test        41043
replication 41044
~~~

No codebook is generated in RGR-04.

---

# VI · Held-out surface shift

The primary surface-transfer intervention is:

> **new node surface codes from a disjoint codebook, while the relational rule q_* remains unchanged.**

Train, validation, test, and replication use disjoint surface-code support.

Within every graph instance:

- six distinct codes are sampled from the split codebook;
- code assignment to graph roles is randomized;
- source, target, intermediate, and distractor roles are counterbalanced across node-code identities;
- no node code is intrinsically associated with q_*.

The raw node-row ordering is randomized.

The query source/target flags travel with the corresponding rows.

---

# VII · Relational positive construction

An admissible positive graph satisfies:

1. exactly one intermediate m creates a two-step path:
   \[
   s\to m\to t;
   \]

2. there is no second intermediate \(m'\neq m\) such that:
   \[
   s\to m'\to t;
   \]

3. there is no direct edge:
   \[
   s\to t;
   \]

4. no self-loops or duplicate directed edges exist;

5. the graph contains distractor edges sufficient to prevent the task from collapsing into a fixed sparse template;

6. the total directed edge count is fixed at:

\[
|E|=8.
\]

The exact generator must sample only graphs satisfying all constraints.

---

# VIII · Relation-breaking paired counterfactual

Every positive graph must have one paired negative counterfactual with:

- identical U;
- identical node-row ordering;
- identical source and target query flags;
- identical edge count;
- identical in-degree of every node;
- identical out-degree of every node;
- identical total reciprocal-edge count;
- no two-step source-to-target path.

The relation break uses a directed degree-preserving 2-switch.

Starting from edges:

\[
(m,t),\quad(a,b)
\]

the paired negative may replace them with:

\[
(m,b),\quad(a,t)
\]

only when all of the following hold:

- \(a,b\notin\{s,t,m\}\) where required by the generator validity proof;
- no replacement edge already exists;
- no self-loop is introduced;
- no alternative two-step path from s to t is created;
- all graph admissibility constraints remain satisfied.

This operation preserves the per-node in/out degree sequence.

The generator must additionally reject any admissible 2-switch that changes the total reciprocal-edge count. If multiple admissible switches remain, the SWITCH named random stream selects uniformly among them rather than always using a deterministic first match.

Therefore the paired positive and negative differ in **incidence/composition**, not edge count, node-degree marginals, or reciprocal-edge count.

---

# IX · Benchmark unit

The atomic benchmark unit is a paired counterfactual:

\[
P_i=(x_i^+,x_i^-)
\]

such that:

\[
y_i^+=1,
\qquad
y_i^-=0.
\]

The two examples share the same surface realization.

The relation-breaking pair exists to measure counterfactual relational sensitivity.

---

# X · Split sizes

RGR-04 freezes the future materialization sizes in counterfactual pairs:

~~~text
TRAIN:
12,000 pairs
24,000 labeled examples

VALIDATION:
3,000 pairs
6,000 labeled examples

TEST:
6,000 pairs
12,000 labeled examples

REPLICATION:
6,000 pairs
12,000 labeled examples
~~~

Total future benchmark size if separately authorized:

~~~text
27,000 counterfactual pairs
54,000 labeled examples
~~~

RGR-04 generates zero examples.

---

# XI · Dataset separation law

No exact \((A,q_s,q_t)\) tuple may appear in more than one split.

RGR-04 does **not** require query-marked graph-isomorphism classes to be disjoint across splits. This first benchmark tests transfer across surface support, not novel relational-skeleton abstraction. A later benchmark may add an isomorphism-class holdout, but a positive RGR-RT1-D2C-01 result may not be described as evidence of unseen-skeleton compositional generalization.

No full paired counterfactual may cross a split boundary.

All split assignment occurs before model training.

The test and replication labels remain unavailable to model selection.

The replication split is not used until the primary test disposition has been frozen.

---

# XII · Surface-only view

The surface-only view deliberately removes edge incidence while retaining strong non-incidence marginals.

For each example, F_S may receive only:

- U;
- q_s;
- q_t.

Per-node degrees and edge count are deliberately excluded because they are structural marginals, not surface variables. Node-row position is implicit only through the ordering of U and query flags; no explicit row-index feature is supplied.

It may not receive:

- A;
- edge endpoints;
- any pairwise adjacency indicator;
- y;
- latent intermediate identity;
- q_*(G,s,t).

Because the degree-preserving counterfactual pair has the same U, query, and degree sequence, the surface-only view is paired-identical across opposite labels.

This is an intentional negative-control property.

F_S is therefore interpreted as a **surface-only negative-control suite**, not as a realistic full-information competitor.

It means RGR-RT1-D2C-01 is a **relational-transfer capability benchmark**, not evidence that the target itself was discovered to be relational. The target is relational by definition; the empirical question is whether a system learns and transfers q_* across the frozen surface shift without oracle information or shortcut leakage.

---

# XIII · Full-information view

F_G and F_R receive the same full observable:

\[
(U,A,q_s,q_t).
\]

Neither receives:

- y as input;
- latent intermediate identity;
- a precomputed two-hop feature;
- q_*(G,s,t);
- an oracle path indicator.

No benchmark implementation may create a hidden privileged input path for F_R.

---

# XIV · Frozen comparator classes

RGR-04 freezes three comparator categories.

## A · F_S — surface-only baseline suite

Two preregistered model classes:

### F_S1
Regularized logistic classifier over the frozen surface-only view.

### F_S2
Three-layer feed-forward MLP over the frozen surface-only view.

The surface comparator score is the **mechanically predeclared maximum held-out score across both preregistered surface-only classes**, making the comparison conservative.

This is not test-set model selection: both classes are frozen before data exist, both are always reported, and the max operation is fixed in advance regardless of which class scores higher.

No additional surface-only class may be added after test inspection and treated as confirmatory.

---

## B · F_G — same-information generic comparator

A generic feed-forward network receives the flattened full observable:

\[
(U,A,q_s,q_t).
\]

It has no explicit message-passing, graph-isomorphism, Grassmann, sheaf, or relational algebra module.

Its purpose is interpretive:

> can a generic same-information learner acquire the rule without a relation-specific inductive bias?

H-RT1 does not require F_R to beat F_G.

---

## C · F_R — minimal relation-aware comparator

A directed two-step message-passing network receives the same:

\[
(U,A,q_s,q_t).
\]

It uses shared node/edge computation and exactly two message-passing rounds before a query-conditioned binary readout.

The architecture is chosen because it is a minimal explicit relation-aware comparator for a two-step directed composition task.

Its success would **not** establish graph structure as the ontology of RGR.

---

# XV · Frozen implementation-class constraints

RGR-04 freezes the following later implementation constraints.

## F_S1

- logistic output;
- L2 regularization;
- regularization strength selected only on validation from:
  \[
  \{10^{-4},10^{-3},10^{-2},10^{-1}\}.
  \]

## F_S2

- hidden widths:
  \[
  256\to128\to64;
  \]
- ReLU activations;
- binary output;
- no adjacency incidence input.

## F_G

- flattened full input;
- ReLU activations;
- binary output;
- no hand-coded path feature;
- architecture depth/width candidates frozen to:

~~~text
G1: 512 → 256
G2: 512 → 256 → 128
G3: 512 → 256 → 128 → 64
~~~

## F_R

- node hidden width 64;
- directed message passing;
- sum aggregation;
- shared weights across nodes;
- query-conditioned source/target readout;
- binary output;
- no oracle path feature;
- message-passing depth candidates frozen to:

~~~text
1 round
2 rounds
3 rounds
~~~

F_R is therefore not hard-coded to the target path length. Message-passing depth is a preregistered validation-selected search parameter, not a second scientific hypothesis. The RGR-04 scientific claim remains H-RT1; depth selection is ordinary model selection inside the frozen F_R class.

These are model-class contracts only.

No code is created in RGR-04.

---

# XVI · Training/search budget law

For F_S2, F_G, and F_R, the only confirmatory optimizer grid permitted is:

~~~text
learning rate:
1e-3
3e-4

weight decay:
0
1e-4
~~~

For F_S2 the architecture is fixed, yielding four optimizer configurations.

For F_G, each of the three frozen architecture candidates is crossed with the four optimizer configurations, yielding exactly 12 confirmatory configurations.

For F_R, each of the three frozen message-passing depths is crossed with the four optimizer configurations, yielding exactly 12 confirmatory configurations.

Thus F_G and F_R receive equal confirmatory architecture/optimizer search counts.

This is **search-count parity**, not a claim of exact parameter-count or compute equivalence. F_G is interpretive rather than the primary H-RT1 comparator, so RGR-04 does not pretend unlike architectures can be made causally identical by parameter matching.

Other frozen training constraints:

~~~text
maximum epochs: 50
early-stopping patience: 5 validation epochs
model-selection metric: validation balanced accuracy
training/model-selection data: TRAIN + VALIDATION only
test access during model selection: forbidden
replication access before primary test freeze: forbidden
~~~

After selecting one optimizer configuration per class, the future confirmatory runs use exactly these frozen independent initialization seeds:

~~~text
PRIMARY:
51001
51002
51003
51004
51005

REPLICATION:
61001
61002
61003
61004
61005
~~~

The same selected configuration is used for replication. Fresh model seeds plus a fresh replication codebook/graph stream provide independent evidence while preserving the meaning of replication.

A later implementation gate may choose the optimizer family only once before any benchmark materialization; it may not change it after seeing test results.

---

# XVII · Primary metric M

RGR-04 freezes:

\[
M=\text{balanced accuracy}.
\]

The benchmark is constructed class-balanced by pairs, but balanced accuracy remains the primary metric so class balance changes cannot silently alter interpretation.

For a model family with five confirmatory seeds:

\[
M(F)=\frac{1}{5}\sum_{j=1}^{5} BA_j.
\]

The strongest surface comparator is:

\[
M(F_S)=\max(M(F_{S1}),M(F_{S2})).
\]

---

# XVIII · Absolute transfer floor τ_min and practically meaningful advantage δ_min

Because F_S is intentionally a surface-only negative control, a relative advantage over F_S is not sufficient by itself.

RGR-04 therefore freezes an absolute held-out transfer floor:

\[
\tau_{min}=0.80.
\]

Primary support requires:

\[
LB_{95}(M(F_R))>0.80.
\]

This prevents a weak score such as 0.61 versus a chance-level surface control from being called meaningful relational transfer.

## Relative advantage


RGR-04 freezes:

\[
\delta_{min}=0.10
\]

absolute balanced-accuracy points.

The primary transfer contrast is:

\[
\Delta_{transfer}=M(F_R)-M(F_S).
\]

The threshold is chosen because:

- chance/surface-only expectation is approximately 0.50 by paired construction;
- a ten-point improvement is materially larger than trivial statistical detectability at the frozen test size;
- the benchmark is deliberately simple enough that a useful relational representation should produce a visible rather than microscopic effect.

The three quantitative thresholds have distinct roles and are conjunctive:

~~~text
τ_min = absolute held-out competence
δ_min = inherited RGR-03 relative-advantage requirement
κ_min = independently stronger paired relation-break sensitivity
~~~

A model cannot compensate for failing one threshold by exceeding another.

Under the valid paired F_S law, M(F_S)=0.50 exactly, so τ_min=0.80 is stronger than the inherited δ_min=0.10 requirement in this particular benchmark. δ_min is retained for traceability to RGR-03 rather than misrepresented as an independent constraint.

No later gate may reduce δ_min after observing test results.

---

# XIX · Counterfactual relation-break metric C_break

For each paired counterfactual:

\[
P_i=(x_i^+,x_i^-),
\]

define pair correctness for seed j:

\[
c_{ij}
=
\mathbf{1}[
\hat y_j(x_i^+)=1
\land
\hat y_j(x_i^-)=0
].
\]

For each seed:

\[
C_{break,j}
=
\frac{1}{N_{pairs}}
\sum_i c_{ij}.
\]

Across five seeds:

\[
C_{break}(F)
=
\frac{1}{5}
\sum_j C_{break,j}.
\]

RGR-04 freezes:

\[
\kappa_{min}=0.75.
\]

Random independent binary predictions yield pair correctness near 0.25.

For a perfectly balanced positive/negative paired task, an example-level accuracy of 0.80 can still be consistent with pair correctness as low as 0.60 if errors are distributed across different pairs. Therefore κ_min is deliberately set above that implied floor:

\[
0.75>0.60.
\]

The counterfactual criterion thus adds independent pressure beyond τ_min rather than merely restating it.

---

# XX · Uncertainty procedure

RGR-04 freezes a hierarchical bootstrap:

1. sample the five model seeds with replacement;
2. within each sampled seed, sample **whole counterfactual pairs as atomic units** with replacement; positive and negative members of a pair are never separated by the bootstrap;
3. recompute M, Δ_transfer, and C_break;
4. repeat 10,000 bootstrap replicates;
5. use the 2.5th and 97.5th percentiles as the 95% interval.

Primary H-RT1 support requires all three quantitative conditions:

\[
LB_{95}(M(F_R))>\tau_{min}=0.80,
\]

\[
LB_{95}(\Delta_{transfer})>\delta_{min}=0.10,
\]

and:

\[
LB_{95}(C_{break}(F_R))>\kappa_{min}=0.75.
\]

No alternative confidence procedure may replace this one after results are observed.

---

# XXI · Surface leakage law

The paired construction creates an exact structural audit:

\[
x_{S,i}^+=x_{S,i}^-.
\]

Therefore the surface-only view is identical within each opposite-label pair.

A materialized benchmark is BENCHMARK_INVALID if this exact equality fails for any pair.

Because each opposite-label pair presents **exactly the same F_S input**, any deterministic F_S classifier must emit the same class prediction for both members. One member is positive and one negative. Therefore every pair contributes exactly one correct and one incorrect prediction, implying:

\[
BA(F_S)=0.50
\]

exactly on the paired balanced evaluation set.

The later implementation must use deterministic evaluation mode. If either preregistered F_S class produces held-out balanced accuracy different from 0.50 beyond floating/reporting tolerance, the result is not interpreted as surface signal; it is treated as an implementation/data-contract violation and the benchmark is:

~~~text
BENCHMARK_INVALID
~~~

This exact paired-identity law replaces an arbitrary empirical surface ceiling.

---

# XXII · Relation-label permutation control

A future benchmark execution must include a separately trained negative control in which TRAIN relation labels are deterministically permuted using a frozen control seed.

Frozen permutation seed:

~~~text
91991
~~~

The input data remain unchanged.

The permuted-label control must not exceed:

\[
0.52
\]

balanced accuracy on the true held-out test labels.

If it does, the benchmark is BENCHMARK_INVALID pending leakage investigation.

---

# XXIII · In-domain competence floor

A confirmatory model family is considered adequate for held-out interpretation only if its selected configuration reaches:

\[
BA_{validation}\ge0.80
\]

on the ordinary validation relation task.

If F_R fails this competence floor:

~~~text
UNDERDETERMINED
~~~

not NOT_SUPPORTED.

Reason:

> failure to learn the task at all is not evidence against transfer.

The benchmark may not lower the competence floor after seeing results.

---

# XXIV · Primary support law

RGR-RT1-D2C-01 may return SUPPORTED only if all of the following hold:

1. benchmark validity checks pass;
2. F_R reaches the frozen validation competence floor;
3. lower 95% bound of M(F_R) exceeds τ_min = 0.80;
4. lower 95% bound of Δ_transfer exceeds 0.10;
5. lower 95% bound of C_break(F_R) exceeds 0.75;
6. both preregistered F_S classes satisfy the exact paired BA = 0.50 law;
7. relation-label permutation control remains at or below 0.52;
8. no oracle or information-access violation is found;
9. the replication dataset independently satisfies the same support conditions using the frozen selected configuration.

All nine are conjunctive.

---

# XXV · F_G interpretation law

F_G is not part of the primary support inequality.

Its result changes interpretation:

## F_G also passes

If F_G independently exceeds the surface comparator by δ_min and passes κ_min:

> transferable relational information is learnable without the explicit F_R inductive bias.

This weakens any later claim that specialized relation-aware architecture is necessary.

## F_G fails while F_R passes

H-RT1 may still be supported.

But the result supports:

> the tested explicit relational inductive bias enabled transfer.

It does not establish that relational information is architecture-independent.

## F_G passes while F_R fails competence

The H-RT1 benchmark is UNDERDETERMINED for the preregistered F_R contrast.

The F_G result may motivate a successor experiment but may not replace F_R post hoc.

---

# XXVI · Primary failure / outcome law

## SUPPORTED

All eight support conditions pass.

## NOT_SUPPORTED

The benchmark is valid, F_R reaches competence, but any primary quantitative support condition fails:

\[
LB_{95}(M(F_R))\le0.80,
\]

or:

\[
LB_{95}(\Delta_{transfer})\le0.10,
\]

or:

\[
LB_{95}(C_{break}(F_R))\le0.75.
\]

## UNDERDETERMINED

The benchmark is valid but interpretation is blocked by:

- F_R competence failure;
- model-selection instability;
- unresolved capacity/optimization confound;
- insufficient precision under the frozen procedure.

## BENCHMARK_INVALID

Any preregistered validity law fails, including:

- surface-pair identity failure;
- violation of the exact paired surface-view identity / BA = 0.50 law;
- permutation control above 0.52;
- forbidden duplicate/cross-split contamination;
- generator contract violation;
- oracle information leakage;
- surface/relation intervention failure.

## REPLICATION_FAILED

Primary test satisfies SUPPORT but the frozen replication split does not satisfy the same support law.

---

# XXVII · Pre-materialization feasibility and validator gate

Before a later gate may materialize the full benchmark, it must deterministically establish all of the following **without using model performance**:

1. the directed graph constraints admit enough distinct counterfactual pairs for the frozen split sizes;
2. every proposed positive validator checks exactly one source-to-target two-step intermediate;
3. every proposed negative validator checks zero source-to-target two-step intermediates;
4. the degree-preserving 2-switch preserves all frozen pair invariants;
5. replacement edges create no self-loop, duplicate edge, direct source-target edge, alternative two-step path, or reciprocal-edge-count change;
6. the switch-selection procedure can find at least one admissible switch for every retained positive unit;
7. the split allocator can satisfy duplicate exclusions and codebook separation.

If the feasibility/validator proof fails:

~~~text
RETURN RGR-04 DESIGN
DO NOT MATERIALIZE DATA
~~~

The proof belongs to a separately authorized implementation gate; RGR-04 itself creates no generator or example.

---

# XXVIII · Stopping law

After the primary TEST result is computed:

- its disposition is frozen before REPLICATION is opened;
- no architecture, metric, threshold, split, or hyperparameter grid may change;
- if SUPPORT fails, replication is not used to rescue the primary result;
- if SUPPORT passes, replication executes under identical frozen rules.

A failed result may be studied only in a separately authorized successor Work Unit.

---

# XXIX · No-rescue law

The following are forbidden after benchmark materialization:

- changing q_*;
- changing Σ_*;
- changing graph size;
- changing edge count;
- changing split sizes;
- changing δ_min;
- changing κ_min;
- changing L_max;
- changing M;
- changing the competence floor;
- changing the bootstrap rule;
- adding a new confirmatory baseline after test inspection;
- changing relation-break construction;
- excluding unfavorable valid seeds;
- using replication as a new tuning set;
- changing model code or training procedure after the confirmatory implementation digest is frozen and before interpreting TEST or REPLICATION.

Any such change creates a new benchmark version.

---

# XXX · Formalism neutrality

The benchmark carrier is a directed graph because q_* is a directed relational composition.

That does **not** grant graph/structural representation general RGR priority.

RGR-RT1-D2C-01 contains no:

- metric geometry target;
- subspace target;
- Grassmann target;
- sheaf target;
- topology target;
- Elemental target.

The graph is the task carrier, not a claim about the ontology of meaning.

---

# XXXI · Elemental and MAIA membrane

The benchmark contains no:

- Fire;
- Water;
- Earth;
- Air;
- Weather;
- Spiralogic labels;
- Elemental transformation operators;
- member data;
- clinical data;
- MAIA memory.

A future generator audit must verify that no hidden target taxonomy is derived from those systems.

RGR-04 grants no MAIA implementation authority.

---

# XXXII · What RGR-04 does not do

RGR-04 creates:

~~~text
BENCHMARK CONSTITUTION
PREREGISTRATION LOCK
GOVERNED WORK UNIT
~~~

RGR-04 does not create:

~~~text
GENERATOR CODE
DATASET
MODEL CODE
TRAINING RUN
TEST RESULT
REPLICATION RESULT
RGR-05
~~~

---

# XXXIII · Candidate conclusion

RGR-04 proposes a fully frozen synthetic benchmark design in which:

- the relational rule is directed two-step composition;
- surface codes shift across disjoint support;
- positive and relation-breaking examples are counterfactually paired;
- relation breaks preserve node degrees and surface realization;
- surface-only and same-information generic comparators are explicit;
- the primary relation-aware comparator has no oracle access;
- effect, counterfactual, leakage, competence, uncertainty, stopping, and replication rules are frozen before data exist.

The benchmark is intentionally narrow. Even SUPPORT would establish only that the frozen model class learned and transferred q_* across the frozen surface shift under the frozen counterfactual controls. It would not establish general relational intelligence, unseen-skeleton abstraction, relational metaphysics, or any particular RGR geometry.

The benchmark is intentionally capable of returning:

~~~text
SUPPORTED
NOT_SUPPORTED
UNDERDETERMINED
BENCHMARK_INVALID
REPLICATION_FAILED
~~~

RGR-04 stops before materialization or execution.


---

# XXXIV · Independent adversarial review

RGR-04 underwent two rounds of local independent challenge against frozen benchmark packets.

The governing review question was not:

> Is the benchmark elegant?

It was:

> Can RGR-RT1-D2C-01 produce an invalid, tautological, shortcut-driven, or post-hoc-rescuable SUPPORT result?

## A · Review execution provenance

The canonical W0.v2 / W2.v2 / W3.v2 route selected:

~~~text
PRIMARY:
GPT_OSS
role = architecture_primary

CHALLENGER:
QWEN
role = independent_local_challenger
~~~

A prior attempt to route RGR-04 itself as task shape ADVERSARIAL_FALSIFICATION was refused by the current J5 router because that shape requires an explicit evidence-backed challenge route and has no automatic local primary.

That refusal was preserved.

RGR-04 was then routed as:

~~~text
ARCHITECTURE_REASONING
+
high_value_uncertain review pressure
+
independent local review
~~~

No routing override was attempted.

---

# XXXV · GPT-OSS review evidence

## Initial API executions

Two GPT-OSS API executions consumed their bounded output budgets in internal thinking and emitted no semantic adjudication.

Standing:

~~~text
INSUFFICIENT
INSUFFICIENT
~~~

No verdict was inferred.

## First bounded CLI review

~~~text
VERDICT: RETURN
~~~

Substantive findings included:

- F_S should not contain structural marginals while being called surface-only;
- generator validity must explicitly verify the unique two-step rule and the relation-broken negative;
- F_R should not be hard-coded to exactly two message-passing rounds;
- generator feasibility requires a pre-materialization validator;
- memorization / shortcut risk must remain an explicit interpretive limitation.

Grounded corrections were incorporated.

Findings rejected as contradicted by the frozen packet included:

- per-node degree can leak the label despite being pair-identical;
- total edge count can leak the label despite being fixed at 8 for every graph;
- node-row position can leak the paired label despite pair-identical surface realization and randomized ordering;
- F_G must be crippled so it cannot use adjacency;
- the predeclared max of two F_S classes is post-test model selection;
- the paired bootstrap separates positive and negative members;
- replication should use weaker criteria than the primary test.

## Second bounded review

~~~text
VERDICT: RETURN
~~~

The second review led to further clarification rather than wholesale redesign:

- threshold roles are explicitly conjunctive;
- F_R depth is a model-selection parameter, not a second hypothesis;
- F_G/F_R search parity is defined as frozen trial-count parity rather than false parameter equivalence;
- replication uses fresh model seeds and fresh generated data under the same frozen selected configuration;
- feasibility remains a mandatory pre-materialization stop gate.

---

# XXXVI · Qwen review evidence

## First bounded review

~~~text
VERDICT: RETURN
~~~

Substantive concerns included:

- the benchmark target is relational by construction;
- the paired negative-control design can make the surface-only comparator structurally helpless;
- the graph carrier may be mistaken for evidence of graph ontology;
- a two-round F_R can be too perfectly aligned with a two-step task;
- hidden generator motifs can create shortcuts;
- graph size / edge-count feasibility must be checked rather than assumed.

Grounded response:

1. RGR-04 explicitly defines the benchmark as a **relational-transfer capability test**, not discovery that the target is relational.
2. F_S is explicitly reclassified as a **surface-only negative-control suite**.
3. F_G remains a same-information full-observable comparator.
4. F_R depth is searched over 1 / 2 / 3 rounds.
5. the relation-break pair additionally preserves reciprocal-edge count;
6. switch choice uses a frozen random substream rather than a deterministic first match;
7. pre-materialization feasibility proof is mandatory.

## Second bounded review

~~~text
VERDICT: RETURN
~~~

Qwen again challenged:

- the capability-test tautology;
- threshold choices;
- the F_S negative-control role;
- F_G/F_R search comparability;
- five-seed uncertainty;
- graph-carrier formalism bias.

Grounded disposition:

### Preserved limitation

The target is relational by construction.

Therefore SUPPORT means only:

> a frozen model class learned and transferred the frozen q_* rule across the frozen surface shift under the frozen counterfactual controls.

It does not establish that relations are fundamental, that unseen graph skeletons were abstracted, or that any RGR geometry is correct.

### Threshold correction

The second-pass threshold criticism exposed a real redundancy risk.

RGR-04 therefore now freezes:

~~~text
τ_min = 0.80 absolute held-out transfer floor

δ_min = 0.10 inherited RGR-03 relative-advantage requirement

κ_min = 0.75 paired counterfactual correctness floor
~~~

For a balanced paired task, 0.80 example accuracy can coexist with pair correctness as low as 0.60.

Therefore:

~~~text
κ_min = 0.75
~~~

adds independent counterfactual pressure.

### Surface leakage correction

The arbitrary F_S ceiling was removed.

Because paired positive and negative examples have exactly identical F_S input, deterministic F_S evaluation mathematically implies:

\[
BA(F_S)=0.50.
\]

Any deviation is a benchmark implementation/data-contract failure rather than evidence of a surface effect.

### Rejected prescriptions

The following were rejected:

- removing adjacency from F_G;
- loosening per-node degree preservation to ±1;
- weakening replication criteria;
- changing the selected configuration during replication;
- adding post-hoc combined-data inference to alter the primary disposition;
- claiming exact parameter equivalence between unlike architectures.

Those changes would weaken rather than strengthen the accepted H-RT1 falsification contract.

---

# XXXVII · Final design standing after challenge

RGR-04 now freezes:

~~~text
q_*:
DIRECTED_TWO_STEP_COMPOSITION

Σ_*:
BALANCED_16BIT_NODE_CODE

graph:
6 nodes
8 directed edges

pair construction:
degree-preserving relation break
surface-identical pair
degree-identical pair
reciprocal-edge-count-identical pair

F_S:
surface-only negative-control suite

F_G:
same-information generic full-input comparator

F_R:
minimal relation-aware full-input comparator
1 / 2 / 3 message-passing depth search

τ_min:
0.80

δ_min:
0.10

κ_min:
0.75

surface-only theorem:
BA(F_S)=0.50 exactly under valid paired deterministic evaluation

permutation negative-control ceiling:
0.52

primary seeds:
51001–51005

replication seeds:
61001–61005

uncertainty:
10,000-replicate hierarchical bootstrap
whole counterfactual pair = atomic resampling unit

pre-materialization feasibility proof:
MANDATORY
~~~

No benchmark example has been generated.

No model has been implemented.

No empirical result exists.

---

# XXXVIII · Remaining limitations deliberately retained

RGR-04 does not pretend to solve these future questions:

1. whether a more complex relation family behaves similarly;
2. whether query-marked graph isomorphism classes should be held out;
3. whether a generic model or explicit relational inductive bias is ultimately preferable;
4. whether any result transfers to natural language, perception, human cognition, or lived meaning;
5. whether graph, Grassmann, sheaf, vector, or another formalism is the best general RGR representation.

Those are later research questions.

They may not be smuggled into the interpretation of RGR-RT1-D2C-01.

---

# XXXIX · RGR-04 candidate standing

The benchmark constitution and preregistration lock are complete enough for Founder adjudication as **design artifacts only**.

Current standing:

~~~text
RGR-00:
CANONICAL + CLOSED

RGR-01:
CANONICAL + CLOSED

RGR-02:
CANONICAL + CLOSED

RGR-03:
CANONICAL + CLOSED

RGR-04:
DESIGN EVIDENCE_READY CANDIDATE

generator:
NOT IMPLEMENTED

dataset:
NOT GENERATED

models:
NOT IMPLEMENTED

training:
NOT EXECUTED

test:
NOT EXECUTED

replication:
NOT EXECUTED

RGR-05:
CLOSED

Elemental hypothesis:
CLOSED

MAIA:
UNCHANGED

deployment:
NONE
~~~

The next legitimate act is Founder adjudication of RGR-04 itself.

No implementation or execution gate is opened by this candidate.


---

# XL · Founder adjudication — RGR-04 closure

**Founder act:** 2026-09-18
**Accepted RGR-04 candidate:** a401722485a1d07a157086c0d4e030a407f06061

The Founder accepts the RGR-04 Synthetic Relational Benchmark Constitution package and the recorded evidence.

Accepted standing:

- RGR-00 is canonical and CLOSED;
- RGR-01 is canonical and CLOSED;
- RGR-02 is canonical and CLOSED;
- RGR-03 is canonical and CLOSED;
- RGR-04 was opened from exact canonical b040d3bcaafe30df83e35a2fe534f5d0ea85e118;
- RGR-04 uses the canonical Work Unit V2 substrate:
  - W0.v2 Work Unit;
  - W2.v2 lifecycle;
  - J5 / W3.v2 routing;
  - W3T governed transport bindings;
  - W4.v2 append-only evidence ledger;
- the initial ADVERSARIAL_FALSIFICATION routing request was refused and preserved rather than overridden;
- RGR-04 was subsequently governed as ARCHITECTURE_REASONING with high-value independent review;
- the governed Work Unit reached EVIDENCE_READY with its authorized core and route digest unchanged;
- only the three authorized RGR-04 documentary/research artifacts were created;
- no generator was implemented;
- no benchmark example was generated;
- no dataset was materialized;
- no model was implemented or trained;
- no empirical TEST or REPLICATION was executed;
- no private/member/client/PHI/Sanctuary/production-memory or other private human data was used;
- no schema, migration, MAIA runtime change, deployment, or production action occurred.

The Founder accepts the first benchmark identity:

~~~text
RGR-RT1-D2C-01
Relational Transfer 1 — Directed Two-Step Composition
~~~

and the frozen relation family:

~~~text
q_* = DIRECTED_TWO_STEP_COMPOSITION
~~~

using a six-node, eight-edge directed graph with ordered source and target query.

The Founder accepts the interpretive boundary:

> RGR-RT1-D2C-01 is a relational-transfer capability benchmark. Its target is relational by construction. A future positive result cannot establish relational metaphysics, geometry of meaning, consciousness geometry, or graph ontology for RGR.

The Founder accepts the frozen surface specification:

~~~text
Σ_* = BALANCED_16BIT_NODE_CODE
~~~

and the split master seeds:

~~~text
TRAIN       41041
VALIDATION  41042
TEST        41043
REPLICATION 41044
~~~

with deterministic named streams:

~~~text
CODEBOOK
GRAPH
SURFACE_ASSIGNMENT
ROW_ORDER
SWITCH
~~~

under the recorded SHA-256 derivation law.

The paired counterfactual law remains frozen.

Each positive / relation-broken negative pair must preserve:

- U;
- row order;
- source query;
- target query;
- edge count;
- each node's in-degree;
- each node's out-degree;
- reciprocal-edge count.

The directed degree-preserving relation-break construction must introduce no self-loop, duplicate edge, direct source-target edge, alternative two-step path, or reciprocal-edge-count change.

Future materialization sizes remain frozen:

~~~text
TRAIN:
12,000 pairs / 24,000 examples

VALIDATION:
3,000 pairs / 6,000 examples

TEST:
6,000 pairs / 12,000 examples

REPLICATION:
6,000 pairs / 12,000 examples

TOTAL:
27,000 pairs / 54,000 examples
~~~

RGR-04 itself materializes none of them.

The Founder ratifies the information-access contract:

~~~text
F_S:
surface-only negative-control suite
input = U, q_s, q_t only

F_G:
same-information generic comparator
input = U, A, q_s, q_t

F_R:
minimal relation-aware comparator
input = U, A, q_s, q_t
~~~

No comparator receives target labels, oracle relation identity, latent intermediate identity, or a precomputed path feature.

The exact surface-control theorem remains:

\[
BA(F_S)=0.50
\]

under valid paired deterministic evaluation.

The frozen comparator/search law remains:

~~~text
F_S1:
regularized logistic classifier

F_S2:
256 → 128 → 64 MLP
4 confirmatory optimizer configurations

F_G:
G1 = 512 → 256
G2 = 512 → 256 → 128
G3 = 512 → 256 → 128 → 64
12 confirmatory architecture/optimizer configurations

F_R:
node hidden width 64
directed message passing
sum aggregation
shared node weights
query-conditioned readout
candidate depths = 1 / 2 / 3 rounds
12 confirmatory depth/optimizer configurations
~~~

The primary and replication model seeds remain frozen:

~~~text
PRIMARY:
51001
51002
51003
51004
51005

REPLICATION:
61001
61002
61003
61004
61005
~~~

The primary metric and thresholds remain frozen:

~~~text
M = balanced accuracy

τ_min = 0.80
δ_min = 0.10
κ_min = 0.75

permutation-control ceiling = 0.52
bootstrap replicates = 10,000
~~~

The three quantitative roles remain distinct:

~~~text
τ_min:
absolute held-out competence

δ_min:
inherited RGR-03 relative-advantage requirement

κ_min:
paired relation-break sensitivity
~~~

A future SUPPORT disposition requires all nine frozen support conditions recorded in the preregistration lock, including independent replication under the same frozen selected configuration.

The accepted future dispositions remain:

~~~text
SUPPORTED
NOT_SUPPORTED
UNDERDETERMINED
BENCHMARK_INVALID
REPLICATION_FAILED
~~~

The pre-materialization feasibility gate is mandatory.

Before any full benchmark dataset may be created, a separately authorized implementation gate must prove:

- enough admissible unique counterfactual pairs exist for every frozen split;
- positive validation enforces exactly one source→intermediate→target path;
- negative validation enforces zero such paths;
- all frozen pair invariants are preserved;
- reciprocal-edge count is preserved;
- no self-loop, duplicate, direct shortcut, or alternative two-step path appears;
- at least one admissible relation-breaking switch exists for every retained positive;
- split allocation satisfies duplicate exclusions and disjoint codebooks.

Failure means:

~~~text
RETURN RGR-04 DESIGN
DO NOT MATERIALIZE DATA
~~~

The RGR-03 no-rescue law remains in force.

After materialization, a confirmatory result may not be rescued by changing the relation family, surface specification, graph size, edge count, split sizes, thresholds, metric, bootstrap law, competence floor, comparator classes, relation-break construction, valid seeds, or frozen model/training implementation.

Any such change requires a new benchmark version and a new governed Work Unit.

## Review evidence

The accepted review record remains:

~~~text
GPT-OSS API attempt 1:
INSUFFICIENT

GPT-OSS API attempt 2:
INSUFFICIENT

GPT-OSS bounded review 1:
RETURN

Qwen independent review 1:
RETURN

GPT-OSS bounded review 2:
RETURN

Qwen independent review 2:
RETURN

deterministic final contract audit:
PASS
~~~

The model reviewers did not approve RGR-04.

Their disagreement remains evidence.

Grounded corrections were incorporated.

Reviewer prescriptions contradicted by the exact H-RT1 comparison law or frozen benchmark contract remain preserved but rejected with explicit rationale.

The final deterministic contract audit remains PASS:

- shared constants match the constitution and preregistration lock;
- surface-control theorem present;
- counterfactual contract present;
- threshold roles explicit;
- W0.v2 authorized core unchanged;
- W3.v2 route digest unchanged;
- review provenance append-only and complete;
- only the three authorized RGR-04 files changed;
- no generator, dataset, model implementation, training, or empirical execution exists;
- RGR-05 and every implementation/execution authority remain closed.

## Canonical freshness standing at adjudication

Current canonical had advanced to:

78ba888aa074b9685ce810ace13d9228bdce469f

through MAIA Teaching Intelligence T4.

The Founder accepts zero true path overlap between that intervening canonical work and the three RGR-04 artifacts.

## Lifecycle closure

By Founder act, the governed RGR-04 Work Unit has advanced:

~~~text
EVIDENCE_READY
→ ADJUDICATED
→ CLOSED
~~~

with:

~~~text
authorized core: unchanged
route digest: unchanged
review attempts: preserved
verifier evidence: preserved
transport/model provenance: preserved
~~~

## Successor boundary

This closure explicitly preserves:

~~~text
RGR-05: CLOSED

benchmark generation: NOT AUTHORIZED

generator implementation: NOT AUTHORIZED

model implementation / training: NOT AUTHORIZED

empirical TEST / REPLICATION: NOT AUTHORIZED

Elemental Operator hypothesis: CLOSED

MAIA alteration: NOT AUTHORIZED

deployment: NOT AUTHORIZED
~~~

No successor gate is opened by this closure.

## Preservation law

The exact accepted RGR-04 candidate remains identified by:

a401722485a1d07a157086c0d4e030a407f06061

This closure act is a later documentary/lifecycle record layered on top of that accepted candidate. It does not rewrite the accepted benchmark-design evidence.

**RGR-04 standing: CLOSED.**
