# RGR-04 — Preregistration Lock

**Benchmark:** RGR-RT1-D2C-01
**Hypothesis:** H-RT1 — RELATIONAL TRANSFER
**Gate:** RGR-04
**Date:** 2026-09-18
**Standing:** FROZEN DESIGN CANDIDATE · NOT MATERIALIZED · NOT EXECUTED

---

# 1 · Benchmark identity lock

~~~text
benchmark_id:
RGR-RT1-D2C-01

relation_family:
DIRECTED_TWO_STEP_COMPOSITION

graph_nodes:
6

directed_edges_per_graph:
8

self_loops:
FORBIDDEN

duplicate_edges:
FORBIDDEN

direct_source_target_edge:
FORBIDDEN

positive_rule:
exactly one intermediate m such that s→m and m→t

negative_rule:
no intermediate m such that s→m and m→t
~~~

---

# 2 · Surface lock

~~~text
surface_specification:
BALANCED_16BIT_NODE_CODE

node_surface_dimension:
16

surface_values:
{-1,+1}

positive_bits_per_code:
8

negative_bits_per_code:
8

codebook_size_per_split:
256

codebooks_pairwise_disjoint:
YES

split master seed TRAIN:
41041

split master seed VALIDATION:
41042

split master seed TEST:
41043

split master seed REPLICATION:
41044

named deterministic substreams:
CODEBOOK
GRAPH
SURFACE_ASSIGNMENT
ROW_ORDER
SWITCH

substream derivation:
SHA-256 of canonical UTF-8 string
RGR04|RGR-RT1-D2C-01|<split>|<master-seed>|<stream-name>|<counter>
~~~

Within each graph:

~~~text
six distinct node codes:
REQUIRED

code-to-structural-role assignment:
RANDOMIZED / COUNTERBALANCED

node-row order:
RANDOMIZED

source/target query indicators:
FOLLOW NODE ROWS
~~~

---

# 3 · Counterfactual lock

Every benchmark unit contains:

~~~text
one positive example
one paired relation-broken negative example
~~~

Pairwise invariants:

~~~text
U:
IDENTICAL

node row order:
IDENTICAL

source query:
IDENTICAL

target query:
IDENTICAL

edge count:
IDENTICAL

per-node in-degree:
IDENTICAL

per-node out-degree:
IDENTICAL

reciprocal-edge count:
IDENTICAL
~~~

Relation-breaking operator:

~~~text
DIRECTED DEGREE-PRESERVING 2-SWITCH
~~~

Required semantic effect:

~~~text
positive:
unique s→m→t path exists

negative:
no s→m'→t path exists
~~~

Any pair that violates any invariant is inadmissible.

If multiple valid degree-preserving 2-switches exist, select uniformly using the frozen SWITCH substream. Any switch that changes reciprocal-edge count is inadmissible.

---

# 4 · Split lock

~~~text
TRAIN:
12,000 pairs
24,000 examples

VALIDATION:
3,000 pairs
6,000 examples

TEST:
6,000 pairs
12,000 examples

REPLICATION:
6,000 pairs
12,000 examples

TOTAL:
27,000 pairs
54,000 examples
~~~

Cross-split rules:

~~~text
exact (A,q_s,q_t) duplicate:
FORBIDDEN

counterfactual pair split across datasets:
FORBIDDEN

test used for model selection:
FORBIDDEN

replication opened before primary disposition freeze:
FORBIDDEN
~~~

---

# 5 · Observable/input lock

Full observable:

\[
x=(U,A,q_s,q_t).
\]

Forbidden model inputs:

~~~text
target y
q_*(G,s,t)
latent intermediate m
precomputed two-hop path indicator
oracle relation identity
hidden generator target metadata
~~~

---

# 6 · F_S lock

Surface-only view:

~~~text
U
q_s
q_t
~~~

Explicitly excluded because they are structural rather than surface variables:

~~~text
per-node in-degree
per-node out-degree
total edge count
explicit node-row index
~~~

Forbidden F_S input:

~~~text
A
edge endpoint pairs
pairwise adjacency
target y
latent intermediate
precomputed relational feature
~~~

Preregistered surface-only model classes:

~~~text
F_S1:
regularized logistic classifier

L2 grid:
1e-4
1e-3
1e-2
1e-1

F_S2:
MLP
256 → 128 → 64
ReLU
binary output
~~~

Confirmatory surface score:

\[
M(F_S)=\max(M(F_{S1}),M(F_{S2})).
\]

This max operation is mechanically fixed before data exist. Both scores are always reported; it is not post-test model selection.

---

# 7 · F_G lock

~~~text
input:
full x=(U,A,q_s,q_t)

model class:
generic feed-forward network

architecture candidates:
G1 = 512 → 256
G2 = 512 → 256 → 128
G3 = 512 → 256 → 128 → 64

activation:
ReLU

output:
binary

explicit message passing:
NO

precomputed path feature:
NO

oracle relation input:
NO
~~~

F_G is interpretive, not the primary support comparator.

---

# 8 · F_R lock

~~~text
input:
full x=(U,A,q_s,q_t)

model class:
directed message-passing network

node hidden width:
64

message-passing depth candidates:
1 round
2 rounds
3 rounds

aggregation:
SUM

weights:
SHARED ACROSS NODES

readout:
QUERY-CONDITIONED SOURCE/TARGET

output:
binary

oracle path feature:
NO

target label as input:
NO
~~~

F_R is the preregistered primary relation-aware comparator.

Its use in this benchmark does not establish graph ontology for RGR.

---

# 9 · Neural training lock

For F_S2, F_G, and F_R:

~~~text
learning-rate grid:
1e-3
3e-4

weight-decay grid:
0
1e-4

F_S2 confirmatory configurations:
4

F_G confirmatory configurations:
3 architecture candidates × 4 optimizer settings = 12

F_R confirmatory configurations:
3 message-passing depths × 4 optimizer settings = 12

F_R depth is a validation-selected model-search parameter, not a second scientific hypothesis.

maximum epochs:
50

early-stopping patience:
5 validation epochs

selection metric:
validation balanced accuracy

test use during tuning:
FORBIDDEN

replication use during tuning:
FORBIDDEN
~~~

After one configuration is selected per class:

~~~text
PRIMARY model initialization seeds:
51001
51002
51003
51004
51005

REPLICATION model initialization seeds:
61001
61002
61003
61004
61005
~~~

Optimizer family itself must be fixed by the later implementation gate before benchmark materialization and may not change afterward.

---

# 10 · Metric lock

Primary metric:

\[
M=\text{balanced accuracy}.
\]

Model-family score:

\[
M(F)=\frac{1}{5}\sum_{j=1}^{5}BA_j.
\]

Primary contrast:

\[
\Delta_{transfer}=M(F_R)-M(F_S).
\]

---

# 11 · Absolute transfer and effect threshold lock

~~~text
τ_min:
0.80 balanced accuracy

δ_min:
0.10 absolute balanced-accuracy points
~~~

Primary support requires:

\[
LB_{95}(M(F_R))>0.80
\]

and:

Primary support requires:

\[
LB_{95}(\Delta_{transfer})>0.10.
\]

Under valid paired F_S input identity, BA(F_S)=0.50 exactly; therefore τ_min=0.80 is stronger than δ_min=0.10 in this benchmark. δ_min remains frozen for traceability to RGR-03.

δ_min may not be reduced after test inspection.

---

# 12 · Counterfactual metric lock

Pair correctness:

\[
c_{ij}
=
\mathbf{1}[
\hat y_j(x_i^+)=1
\land
\hat y_j(x_i^-)=0
].
\]

Counterfactual relation-break score:

\[
C_{break}(F)
=
\frac{1}{5}
\sum_j
\frac{1}{N_{pairs}}
\sum_i c_{ij}.
\]

Frozen threshold:

~~~text
κ_min:
0.75
~~~

Primary support requires:

\[
LB_{95}(C_{break}(F_R))>0.75.
\]

Rationale:

~~~text
random independent pair correctness ≈ 0.25
τ_min = 0.80 can imply pair correctness as low as 0.60
κ_min = 0.75 therefore adds independent counterfactual pressure
~~~

---

# 13 · Uncertainty lock

~~~text
procedure:
HIERARCHICAL BOOTSTRAP

bootstrap replicates:
10,000

level 1:
sample model seeds with replacement

level 2:
sample whole counterfactual pairs as atomic units with replacement within seed; never split positive/negative pair members

interval:
2.5th / 97.5th percentiles

confidence level:
95%
~~~

No alternate uncertainty procedure may replace this after test inspection.

---

# 14 · Leakage lock

Structural surface identity condition:

\[
x_{S,i}^+=x_{S,i}^-.
\]

Required for:

~~~text
100% of counterfactual pairs
~~~

Any violation:

~~~text
BENCHMARK_INVALID
~~~

Exact surface-only theorem:

Because every opposite-label counterfactual pair has exactly identical F_S input and deterministic evaluation emits the same prediction for both members:

\[
BA(F_S)=0.50
\]

exactly on the balanced paired evaluation set.

Required:

~~~text
F_S1 held-out BA:
0.50 exactly within floating/reporting tolerance

F_S2 held-out BA:
0.50 exactly within floating/reporting tolerance
~~~

Any violation is:

~~~text
BENCHMARK_INVALID
~~~

as an implementation/data-contract failure, not interpreted as a positive surface signal.

---

# 15 · Permutation-control lock

~~~text
control:
TRAIN relation-label permutation

permutation seed:
91991

inputs:
UNCHANGED

permuted-control maximum true-test balanced accuracy:
0.52
~~~

If exceeded:

~~~text
BENCHMARK_INVALID
~~~

pending a new benchmark version.

---

# 16 · Competence lock

F_R validation competence floor:

\[
BA_{validation}\ge0.80.
\]

If F_R fails:

~~~text
UNDERDETERMINED
~~~

not NOT_SUPPORTED.

The floor may not be lowered after test inspection.

---

# 17 · Primary support lock

SUPPORTED requires all:

~~~text
1 benchmark validity passes

2 F_R validation BA ≥ 0.80

3 LB95(M(F_R)) > 0.80

4 LB95(Δ_transfer) > 0.10

5 LB95(C_break(F_R)) > 0.75

6 F_S1 and F_S2 each satisfy exact paired BA = 0.50 law

7 permutation-control BA ≤ 0.52

8 no information-access/oracle violation

9 REPLICATION independently satisfies conditions 1–8
~~~

No subset is sufficient.

---

# 18 · Outcome lock

~~~text
SUPPORTED:
all support conditions pass

NOT_SUPPORTED:
benchmark valid
F_R competent
absolute transfer, relative transfer, or C_break threshold fails

UNDERDETERMINED:
benchmark valid
interpretation blocked by competence / optimization / capacity / precision

BENCHMARK_INVALID:
any frozen validity condition fails

REPLICATION_FAILED:
primary SUPPORT passes
replication support law fails
~~~

---

# 19 · Pre-materialization feasibility lock

Before full benchmark materialization, a separately authorized implementation gate must prove:

~~~text
sufficient admissible unique counterfactual pairs exist for frozen split sizes
positive validator enforces exactly one s→m→t intermediate
negative validator enforces zero s→m→t intermediates
degree-preserving 2-switch preserves all pair invariants
reciprocal-edge count is preserved
no self-loop / duplicate / direct s→t / alternative two-hop path appears
at least one admissible switch exists for every retained positive unit
split allocator can satisfy duplicate exclusions and disjoint codebooks
~~~

If any proof fails:

~~~text
RETURN RGR-04 DESIGN
DO NOT MATERIALIZE DATA
~~~

RGR-04 itself runs no generator and creates no example.

---

# 20 · Stopping lock

After TEST disposition:

~~~text
freeze primary disposition:
BEFORE REPLICATION

retune on test:
FORBIDDEN

retune on replication:
FORBIDDEN

change model class:
FORBIDDEN

change threshold:
FORBIDDEN

change metric:
FORBIDDEN

change relation family:
FORBIDDEN

change surface spec:
FORBIDDEN

change split:
FORBIDDEN

change model code or training procedure after confirmatory implementation digest freeze:
FORBIDDEN
~~~

Any change creates:

~~~text
NEW BENCHMARK VERSION
+
NEW WORK UNIT
~~~

---

# 21 · Elemental / human-data lock

Forbidden:

~~~text
Fire labels
Water labels
Earth labels
Air labels
Weather labels
Spiralogic state labels
Elemental operators
member conversations
client data
PHI
Sanctuary data
MAIA production memory
private journals
clinical data
~~~

Any later use requires a separate authorization.

---

# 22 · Execution lock

RGR-04 does not authorize:

~~~text
generator code
dataset materialization
model code
training
test execution
replication execution
RGR-05
MAIA modification
deployment
production action
~~~

This document is a preregistration design candidate only.
