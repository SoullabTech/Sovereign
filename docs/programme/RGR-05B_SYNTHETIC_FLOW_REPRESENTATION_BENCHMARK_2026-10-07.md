# RGR-05B — Synthetic Flow Representation Benchmark Constitution

**Programme:** RELATIONAL-GEOMETRY-REASONING
**Gate:** RGR-05B — SYNTHETIC FLOW REPRESENTATION BENCHMARK
**Date:** 2026-10-07
**Status:** OPEN · FOUNDER AUTHORIZED · BENCHMARK CONSTITUTION ONLY
**Canonical base:** 6eb1396912162501982a26d8a105ed165a5f96bd
**Upstream:** RGR-05A CLOSED · Founder adjudicated
**Accepted architectural object:** FLOW_D — first-class derived dynamical object
**Primitive #11:** NOT EARNED
**Runtime authority:** NONE
**Member-facing authority:** NONE

---

# 0 · Founder authorization

The Founder authorized RGR-05B on 2026-10-07:

> **Open RGR-05B, the Synthetic Flow Representation Benchmark.**

This authorization permits benchmark design only.

RGR-05B may define a synthetic dynamic process, target tasks, counterfactual families, representation/model classes, split law, metrics, thresholds, uncertainty procedure, failure conditions, and independent review requirements.

RGR-05B may not materialize benchmark data, run the generator, train or evaluate models, use member/private/clinical data, introduce Elemental labels into the primary benchmark, alter MAIA or AIN runtime, create production schema/migrations, deploy, or open RGR-05C/RGR-05D.

---

# I · Benchmark question

RGR-05A established:

> **Flow is architecturally primary and formally derived.**

RGR-05B asks:

> **Does representing FLOW_D explicitly provide measurable compositional-transfer or counterfactual-sensitivity advantages over matched representations that receive the same dynamic information without a Flow-specific inductive structure?**

This is not another primitive-status test.

A negative result does not overturn RGR-05A.

A positive result does not make Flow primitive.

---

# II · Primary hypothesis

## H-FR1 — EXPLICIT FLOW REPRESENTATION ADVANTAGE

For a frozen synthetic transport process whose outcome depends on typed carrier, directed relation structure, edge-local passage conditions, transit delay, and temporal injection pattern:

> **A preregistered FLOW_D-aware model receiving no privileged information will show a practically meaningful held-out transfer advantage over the strongest preregistered same-information generic model, while satisfying topology-preserving Flow counterfactual tests and representation-invariance controls.**

The claim is task-family bounded.

---

# III · Null hypothesis

## H0-FR1 — SAME-INFORMATION SUFFICIENCY

> **Once the same raw dynamic information is available, a generic representation/model matches the FLOW_D-aware model within the preregistered practical-equivalence margin.**

If H0-FR1 survives, FLOW_D remains the accepted first-class AIN architectural object. What fails is only the stronger claim that the tested Flow-specific inductive structure adds computational value.

---

# IV · Benchmark identity

The suite is:

## RGR-FLOW-SFRB-01

Expanded:

> **Synthetic Flow Representation Benchmark 01 — Typed Pulsed Transport**

It contains two separately scored tasks.

### Task A — DELIVERY

Question:

> Does enough of the queried carrier reach the sink by a fixed horizon?

Task A is primary.

### Task B — RETURN

Question:

> After a fixed turn-around transformation at the sink, does enough carrier complete a return path to the source by a second horizon?

Task B is secondary and receives an independent disposition.

No overall result may conceal disagreement between A and B.

---

# V · Common synthetic world

Each example uses a directed graph:

~~~text
G = (V, E)
|V| = 8
~~~

Each example declares:

- source node s;
- sink/turn node t;
- carrier query kappa;
- directed adjacency;
- edge-local passage attributes;
- source pulse schedule;
- horizon.

Node identifiers are randomly permuted per example.

Source/sink flags move with the permutation.

No semantic meaning attaches to node names.

---

# VI · Carrier

The synthetic carrier vocabulary is deliberately meaningless outside the benchmark:

~~~text
kappa ∈ {K0, K1}
~~~

These labels do not represent psychological, physiological, spiritual, elemental, or material categories.

Each edge has carrier-specific permeability:

~~~text
p_e(K0), p_e(K1) ∈ {0, 0.5, 1}
~~~

The queried carrier selects the relevant permeability channel.

A coherent carrier-relabeling control swaps query carrier identity and both permeability channels together. A correct representation must preserve the target under that simultaneous relabeling.

---

# VII · Edge-local passage properties

For each directed edge e = (u, v):

### Conductance

~~~text
c_e ∈ {0.25, 0.5, 0.75, 1.0}
~~~

### Resistance

~~~text
r_e ∈ {0, 0.25, 0.5}
~~~

### Transit delay

~~~text
d_e ∈ {1, 2, 3}
~~~

The effective passage coefficient for carrier kappa is:

~~~text
a_e(kappa) = p_e(kappa) × c_e × (1 - r_e)
~~~

Resistance and conductance are both included because the benchmark tests whether the representation preserves their declared roles.

They are synthetic parameters, not claims about universally independent physical quantities.

---

# VIII · Source rhythm

The source injection schedule is selected from a frozen equal-mass codebook:

~~~text
P0 = [1.00, 0.00, 0.00, 0.00]
P1 = [0.50, 0.50, 0.00, 0.00]
P2 = [0.50, 0.00, 0.50, 0.00]
P3 = [0.25, 0.25, 0.25, 0.25]
~~~

For every schedule:

~~~text
sum(Pj) = 1
~~~

The schedules differ in temporal organization, not total injected quantity.

---

# IX · Frozen transport law

Let x_v(t) ≥ 0 be carrier stock at node v at integer time t.

Initially:

~~~text
x_v(0) = 0 for every node v
~~~

At each time t, the active source pulse P(t) is added to x_s(t).

For a non-sink node v, define:

~~~text
A_v(kappa) = sum of a_e(kappa) over all outbound edges e from v
~~~

For each outbound edge e = (v, w), dispatch:

~~~text
y_e(t) = x_v(t) × a_e(kappa) / max(1, A_v(kappa))
~~~

Therefore:

~~~text
sum of dispatched y_e(t) from v ≤ x_v(t)
~~~

Dispatched quantity is removed from v immediately and arrives at w after d_e time steps.

Undispatched quantity remains at v.

The sink is absorbing for Task A.

The law is deterministic.

The generator computes labels mechanically.

No model receives the simulated state trace.

---

# X · Task A — DELIVERY target

Freeze:

~~~text
H_A = 10
delivery threshold = 0.60
~~~

Let D_A be cumulative stock absorbed at the sink by H_A.

Target:

~~~text
y_A = 1 if D_A ≥ 0.60
y_A = 0 otherwise
~~~

The generator must construct an exactly class-balanced dataset through deterministic rejection sampling using named random streams.

The threshold may not change after materialization.

---

# XI · Task B — RETURN / completion

Task B uses two graph layers over the same node set:

~~~text
G_out = (V, E_out)
G_ret = (V, E_ret)
~~~

Outbound transport follows the Task A law until quantity arrives at t.

Each newly arrived quantity at t undergoes a fixed turn-around transformation:

~~~text
q_return = 0.75 × q_arrived
q_absorbed = 0.25 × q_arrived
~~~

Returned quantity is injected at t into G_ret on the next integer time step and follows the same transport law toward the original source s.

Freeze:

~~~text
H_B = 18
return threshold = 0.30
~~~

Let D_B be cumulative returned stock arriving at s by H_B.

Target:

~~~text
y_B = 1 if D_B ≥ 0.30
y_B = 0 otherwise
~~~

Task B tests return/completion as a formal trajectory property.

It is not a psychological model of completion.

---

# XII · Graph construction

## Task A

The outbound graph must be a directed acyclic graph with:

- exactly 8 nodes;
- source s with at least one outbound edge;
- sink t with at least one inbound edge;
- exactly 10 directed edges;
- no self-loops;
- no duplicate edges;
- at least two distinct source-to-sink paths before permeability is considered;
- at least two distractor branches not lying on every source-to-sink path.

## Task B

Both G_out and G_ret satisfy analogous constraints.

G_ret must contain at least one topological route from t to s.

No graph may be selected after model performance is observed.

---

# XIII · Counterfactual families

Every primary test example belongs to at least one preregistered matched counterfactual family.

## CF-1 · Carrier counterfactual

Hold fixed:

- graph topology;
- source/sink;
- all edge properties;
- pulse schedule.

Change only:

~~~text
K0 ↔ K1
~~~

Retain the pair only when the target label changes.

This tests typed carrier dependence.

---

## CF-2 · Rhythm counterfactual

Hold fixed:

- graph topology;
- source/sink;
- carrier;
- all edge properties;
- total injected mass.

Change only the pulse schedule between two frozen codebook patterns.

Retain the pair only when the target changes.

This tests temporal organization rather than total quantity.

---

## CF-3 · Passage-field counterfactual

Hold fixed:

- graph topology;
- source/sink;
- carrier;
- pulse schedule;
- the complete multiset of edge-attribute tuples:
  (p(K0), p(K1), c, r, d).

Permute complete attribute tuples across existing edges.

Retain the pair only when the target changes.

Thus the pair has:

- identical topology;
- identical global edge-attribute histogram;
- identical carrier;
- identical pulse;
- different placement of passage conditions in the relational structure.

This is the strongest primary Flow counterfactual.

---

## CF-4 · Coherent carrier relabeling invariance

Simultaneously relabel K0 ↔ K1 in:

- query carrier;
- permeability channels on every edge.

Target must remain exactly unchanged.

A model sensitive to arbitrary carrier names fails this invariance control.

---

## CF-5 · Node relabeling invariance

Apply a random node permutation while coherently moving:

- adjacency;
- edge attributes;
- source/sink flags.

Target must remain exactly unchanged.

This tests relational rather than coordinate memorization.

---

## CF-6 · Return-path counterfactual — Task B only

Hold fixed:

- G_out;
- source/sink;
- carrier;
- pulse;
- all outbound edge attributes;
- return graph topology;
- complete multiset of return-edge attribute tuples.

Permute return-edge attribute tuples across E_ret.

Retain only label-changing pairs.

This isolates return/completion sensitivity.

---

# XIV · Held-out transfer law

The TEST split differs from TRAIN/VALIDATION along three axes:

1. unseen node permutations;
2. held-out combinations of carrier × pulse pattern × graph-template family;
3. held-out assignments of edge-attribute tuples to relational positions.

No numerical parameter value is outside the training support.

The test measures compositional transfer, not numerical extrapolation.

The REPLICATION split uses fresh graph templates, attribute assignments, node permutations, and random streams while preserving the frozen value sets and target law.

---

# XV · Information views

RGR-05B freezes three information views.

## View S — STATIC / MARGINAL NEGATIVE CONTROL

May receive:

- directed topology;
- source/sink flags;
- queried carrier token;
- total injected mass (= 1);
- global histograms of permeability, conductance, resistance, and delay.

It may not receive:

- edge-local assignment of those attributes;
- pulse ordering;
- simulated trace;
- target.

Purpose:

> determine whether topology plus global marginals can solve what should require edge-local/time-local Flow information.

---

## View G — GENERIC SAME-INFORMATION

Receives the complete raw observable:

- randomized node table;
- directed adjacency;
- all edge-local attributes;
- carrier query;
- pulse schedule;
- source/sink flags;
- task identifier;
- for Task B, both graph layers and the fixed turn-around coefficient.

It does not receive:

- target;
- simulated state trace;
- precomputed path score;
- precomputed effective delivery;
- Flow counterfactual identity;
- generator latent variables.

---

## View F — FLOW_D SAME-INFORMATION

Receives exactly the same raw observable as View G.

The difference is representational/architectural only.

It may explicitly organize the input as:

- carrier;
- source;
- destination;
- directed passage relations;
- permeability;
- conductance;
- resistance;
- transit delay;
- pulse rhythm;
- trajectory step;
- return phase.

It may not receive any quantity unavailable to G.

---

# XVI · Model classes

## F_S1 — static linear baseline

Regularized logistic classifier over View S.

## F_S2 — static MLP baseline

Three-layer MLP over View S.

Static comparator:

~~~text
M(F_S) = max(M(F_S1), M(F_S2))
~~~

---

## F_G — generic same-information comparator

A generic token/set model over View G.

Frozen family:

- edge tokens contain endpoints plus raw edge attributes;
- node tokens contain source/sink flags;
- pulse tokens contain time index plus injection amount;
- no precomputed path;
- no explicit transport equation;
- no message passing tied to graph incidence.

Architecture candidates:

~~~text
G1: 4 transformer blocks, width 128
G2: 6 transformer blocks, width 128
G3: 4 transformer blocks, width 256
~~~

No absolute edge-list positional embedding is allowed.

Token order is randomized during training.

---

## F_F — FLOW_D-aware comparator

A directed temporal graph network over View F.

Frozen properties:

- shared node-state encoder;
- directed message passing along declared edges;
- raw passage attributes on edges;
- carrier query conditions message computation;
- recurrent/shared temporal update;
- pulse schedule enters at source;
- Task B exposes a declared return phase/layer;
- query-conditioned readout;
- no generator equation hard-coded;
- no simulated trace supplied;
- no precomputed delivery supplied.

Architecture candidates:

~~~text
F1: width 64
F2: width 128
F3: width 256
~~~

Each candidate unrolls the required frozen task horizon.

The unrolling represents time, not privileged target computation.

---

# XVII · Search-budget fairness

For F_S2, F_G, and F_F freeze the optimizer grid:

~~~text
learning rate:
1e-3
3e-4

weight decay:
0
1e-4
~~~

F_G receives:

~~~text
3 architectures × 4 optimizer settings = 12 confirmatory configurations
~~~

F_F receives:

~~~text
3 architectures × 4 optimizer settings = 12 confirmatory configurations
~~~

Search-count parity is required.

The execution gate must report parameter count, wall time, accelerator, peak memory, and epochs to selection.

No claim of exact compute equivalence is implied.

---

# XVIII · Split sizes

Freeze separately for each task.

## TRAIN

~~~text
20,000 ordinary examples
6,000 matched counterfactual pairs
~~~

## VALIDATION

~~~text
5,000 ordinary examples
1,500 matched counterfactual pairs
~~~

## TEST

~~~text
10,000 ordinary examples
4,000 matched counterfactual pairs
~~~

## REPLICATION

~~~text
10,000 ordinary examples
4,000 matched counterfactual pairs
~~~

Each counterfactual pair contributes two labeled examples.

No exact canonical example signature may cross split boundaries.

---

# XIX · Randomness law

All future generator randomness comes from named deterministic streams:

~~~text
GRAPH
NODE_PERMUTATION
EDGE_ATTRIBUTES
CARRIER
PULSE
COUNTERFACTUAL
SPLIT
MODEL_INIT
PERMUTATION_CONTROL
~~~

The implementation gate must freeze exact integer seeds before materialization.

RGR-05B itself chooses no seed numbers.

No stream may be silently reused for a different semantic purpose.

---

# XX · Primary metrics

## M — balanced accuracy

For each confirmatory model seed j:

~~~text
M_j = balanced accuracy on the declared split
~~~

Across five model seeds:

~~~text
M(F) = mean_j M_j
~~~

---

## C_flow — paired Flow counterfactual correctness

For a matched opposite-label pair (x_plus, x_minus), pair correctness is 1 only when both members receive their correct labels.

For each model seed:

~~~text
C_flow = number of fully correct pairs / total pairs
~~~

Report separately for:

- CF-1 carrier;
- CF-2 rhythm;
- CF-3 passage field;
- CF-6 return path.

No pooled score may conceal a failed counterfactual family.

---

## I_inv — invariance consistency

For target-preserving transforms CF-4 and CF-5:

~~~text
I_inv = proportion of transformed pairs with identical model prediction
~~~

Report carrier-relabel and node-relabel invariance separately.

---

# XXI · Frozen practical thresholds

## Validation competence

A confirmatory family is interpretable only if:

~~~text
validation balanced accuracy ≥ 0.85
~~~

Failure makes the relevant comparison UNDERDETERMINED.

---

## Absolute held-out performance

FLOW_D support requires:

~~~text
lower 95% bound of M(F_F) > 0.80
~~~

---

## Static-information separation

Require:

~~~text
lower 95% bound of [M(F_F) - M(F_S)] > 0.10
~~~

This tests whether edge-local/time-local information matters beyond topology and global marginals.

---

## Specialized Flow advantage

To support H-FR1:

~~~text
lower 95% bound of [M(F_F) - M(F_G)] > 0.05
~~~

The five-point margin is the frozen minimum practical advantage for claiming value from the explicit Flow inductive representation over the same raw information in a generic representation.

---

## Counterfactual sensitivity

For every primary Task A counterfactual family:

~~~text
lower 95% bound of C_flow(F_F) > 0.75
~~~

Task B must separately satisfy CF-6 for a RETURN-supported disposition.

---

## Invariance

Require:

~~~text
lower 95% bound of I_inv(F_F) > 0.95
~~~

for both coherent carrier relabeling and coherent node relabeling.

---

# XXII · Uncertainty procedure

Use a hierarchical bootstrap:

1. resample model seeds with replacement;
2. resample ordinary examples or whole counterfactual pairs as atomic units;
3. recompute the relevant metrics;
4. repeat 10,000 times;
5. use the 2.5th and 97.5th percentiles as the 95% interval.

Members of a counterfactual pair may never be separated by bootstrap.

No alternative uncertainty procedure may replace this after final-result inspection.

---

# XXIII · Negative controls

## NC-1 · Label permutation

Train a separate negative control on deterministically permuted TRAIN labels.

Its balanced accuracy on true held-out labels must not exceed:

~~~text
0.52
~~~

If it does, the benchmark is BENCHMARK_INVALID pending leakage investigation.

---

## NC-2 · Pulse-total shortcut

Every pulse schedule sums to exactly 1 within declared floating tolerance.

Any preprocessing pipeline that changes this invariant invalidates the affected run.

---

## NC-3 · Attribute-histogram shortcut

For every CF-3 pair, the full multiset of edge-attribute tuples must be exactly equal.

Otherwise:

~~~text
BENCHMARK_INVALID
~~~

---

## NC-4 · Counterfactual identity leakage

No input token or feature may expose:

- counterfactual family;
- positive/negative member;
- generator branch;
- target.

---

# XXIV · Benchmark-validity checks

Before model execution, a later implementation gate must deterministically prove:

1. transport simulation obeys the declared stock law;
2. dispatch never exceeds node stock;
3. delayed arrivals occur at declared times;
4. Task A sink is absorbing;
5. Task B turn-around coefficient is exactly 0.75;
6. all pulse schedules sum exactly to 1 within tolerance;
7. CF-1 changes only queried carrier;
8. CF-2 changes only pulse temporal organization;
9. CF-3 preserves topology and full edge-attribute multiset exactly;
10. CF-4 coherent carrier relabeling preserves target exactly;
11. CF-5 node permutation preserves target exactly;
12. CF-6 preserves return topology and return-attribute multiset exactly;
13. split signatures do not cross split boundaries;
14. class balance satisfies the frozen construction;
15. no model input contains a simulated trace or precomputed target proxy.

Failure of any required validity check blocks scientific interpretation.

---

# XXV · Task A outcome law

## FLOW_REPRESENTATION_SUPPORTED

Only if all hold:

1. benchmark valid;
2. F_F reaches validation competence;
3. lower 95% bound of M(F_F) > 0.80;
4. lower 95% bound of [M(F_F) - M(F_S)] > 0.10;
5. lower 95% bound of [M(F_F) - M(F_G)] > 0.05;
6. CF-1, CF-2, and CF-3 each exceed the 0.75 pair-correctness lower-bound threshold;
7. CF-4 and CF-5 each exceed the 0.95 invariance lower-bound threshold;
8. permutation control passes;
9. REPLICATION independently satisfies the same frozen conditions with the selected configuration.

---

## FLOW_INFORMATION_SUPPORTED_BUT_SPECIALIZATION_NOT_NEEDED

Use when:

- benchmark valid;
- F_F and F_G both show strong held-out Flow sensitivity;
- F_F does not exceed F_G by the frozen five-point margin.

Interpretation:

> the synthetic task contains transferable Flow information, but explicit Flow-specific inductive structure is not required by the tested model classes.

This outcome is fully compatible with RGR-05A.

---

## NOT_SUPPORTED

Benchmark valid and relevant model classes reach competence, but the explicit F_F advantage or required Flow counterfactual performance fails.

---

## UNDERDETERMINED

Use when interpretation is blocked by competence failure, unstable model selection, unresolved capacity/optimization confound, or insufficient precision.

---

## BENCHMARK_INVALID

Use when any frozen generator, leakage, split, counterfactual, or validity law fails.

---

## REPLICATION_FAILED

Use when primary support passes but the frozen independent replication split fails the same support conditions.

---

# XXVI · Task B outcome law

Task B receives a separate disposition:

~~~text
RETURN_SUPPORTED
RETURN_NOT_SUPPORTED
RETURN_UNDERDETERMINED
RETURN_BENCHMARK_INVALID
RETURN_REPLICATION_FAILED
~~~

No Task A success may be used to imply return/completion competence.

---

# XXVII · What a positive result could establish

The strongest permitted Task A result is:

> **For RGR-FLOW-SFRB-01 Task A, the tested explicit FLOW_D-aware representation supports held-out compositional transfer and Flow-specific counterfactual sensitivity beyond the tested same-information generic comparator under the frozen benchmark conditions.**

It would not establish:

- Flow as primitive #11;
- universal architecture for intelligence;
- Elemental Alchemy;
- subtle-energy physiology;
- consciousness ontology;
- psychological truth;
- MAIA readiness.

A RETURN_SUPPORTED result adds only the bounded finding that the tested representation handled the synthetic return/completion task.

---

# XXVIII · What a negative result could establish

## Case A — generic model is sufficient

FLOW_D remains useful for architecture, interpretation, governance, provenance, and cross-domain typing, but its tested specialized inductive bias is not necessary.

## Case B — neither dynamic model transfers

This benchmark/task family does not support the proposed representation advantage.

## Case C — static control performs unexpectedly well

Investigate leakage or benchmark design.

## Case D — counterfactual families fail

The model may be learning distributional shortcuts rather than Flow structure.

No negative result automatically rescinds RGR-05A.

---

# XXIX · Elemental quarantine

RGR-05B primary and secondary tasks contain no:

- Fire labels;
- Water labels;
- Earth labels;
- Air labels;
- Aether labels;
- Weather labels;
- Spiralogic phases;
- chakra labels;
- subtle-energy labels;
- psychological categories.

The Flow representation must first demonstrate value independently of the framework that motivated it.

Only a later separately authorized RGR-05C may compare Elemental operator families against non-elemental alternatives.

---

# XXX · Human-data quarantine

RGR-05B requires no human data.

Forbidden:

- member conversations;
- Writer's Studio manuscripts;
- dreams;
- journals;
- therapy/client material;
- physiological recordings;
- BCI/EEG;
- HRV;
- CSF;
- relationship material;
- production memory.

The benchmark is entirely synthetic.

---

# XXXI · Runtime boundary

RGR-05B authorizes no production implementation.

Even a future positive result would not authorize:

- MAIA Flow Witness;
- prompt changes;
- memory changes;
- Living Field visualization;
- Writer's Studio Flow analysis;
- somatic inference;
- relationship inference;
- user-visible Elemental interpretation.

Those remain separately gated.

---

# XXXII · Current standing

~~~text
RGR-05A:
CLOSED · FOUNDER ADJUDICATED

FLOW_D:
FIRST-CLASS DERIVED DYNAMICAL OBJECT

Flow primitive #11:
NOT EARNED

RGR-05B:
OPEN · BENCHMARK CONSTITUTION ONLY

benchmark data:
NOT MATERIALIZED

generator:
NOT IMPLEMENTED

models:
NOT IMPLEMENTED

benchmark execution:
NOT AUTHORIZED BY THIS DOCUMENT

RGR-05C:
CLOSED

RGR-05D:
CLOSED

MAIA runtime:
UNCHANGED

member-facing authority:
NONE
~~~

The next act after this constitution is independent adversarial review and Founder adjudication of the benchmark design itself.

No benchmark materialization or execution occurs in RGR-05B.
