# RGR-02 — Formal Vocabulary + Candidate Structures

**Programme:** RELATIONAL-GEOMETRY-REASONING
**Gate:** RGR-02 — FORMAL VOCABULARY + CANDIDATE STRUCTURES
**Date:** 2026-09-18
**Status:** CLOSED · FOUNDER ADJUDICATED · FORMALIZATION PRESERVED
**Canonical base:** 8c8525eae316f21eeb844ba7af4af7ab1476f461
**Governing constitution:** RGR-00
**Upstream evidence:** RGR-01 canonical + CLOSED

---

# 0 · Gate boundary

RGR-02 asks one question only:

> **What exactly are the mathematical objects of Relational Geometry Reasoning?**

RGR-02 may:

- define the ten accepted primitives;
- distinguish primitives that had previously been used too loosely;
- propose a formalism-neutral common scaffold;
- instantiate that scaffold in four competing mathematical families;
- identify where each formalism requires extra structure;
- identify formal contradictions, category errors, and metaphor risks;
- recommend the smallest vocabulary worth carrying into a later empirical hypothesis.

RGR-02 may not:

- implement an RGR model;
- create a benchmark;
- run an empirical RGR experiment;
- select a winning formalism;
- open RGR-03;
- formalize Fire, Water, Earth, Air, or Weather as mathematical operators;
- use Elemental Alchemy as ground truth;
- alter MAIA;
- create schema or migrations;
- deploy.

RGR-02 is a **formal vocabulary gate**, not an empirical gate.

---

# I · First result: RGR's common core is not yet a geometry

RGR-01 preserved four candidate families:

~~~text
vector / relational
graph / structural
subspace / Grassmann
local-to-global / sheaf
~~~

These families do not all begin with a metric space or manifold.

Therefore the common object beneath them cannot honestly be defined as "a geometry" without excluding or subordinating the graph/structural candidate by definition.

RGR-02 adopts the more neutral formulation:

> **The common core of RGR is a typed contextual relational system. Geometry is an optional enrichment whose legitimacy must be earned by the task.**

This is not a rejection of the programme name Relational Geometry Reasoning.

It is a constraint on what the word geometry may mean.

A future candidate becomes genuinely geometric only when the model supplies mathematically relevant structure such as:

- metric;
- inner product;
- manifold;
- subspace geometry;
- topology;
- connection;
- group action;
- sheaf/local-to-global geometry;
- statistical geometry.

RGR may not call every structured relation "geometry" merely because the word is evocative.

---

# II · The ten primitive slots

RGR-02 defines a common scaffold:

\[
\mathfrak{R}
=
(
\mathcal{S},
\mathcal{R},
\mathcal{T},
\mathcal{Q},
\mathcal{C},
\mathcal{P},
\Gamma,
\mathcal{B},
\mathcal{K},
\mathcal{O}
)
\]

where the ten slots correspond to:

~~~text
S  = ENTITY / STATE
R  = RELATION
T  = TRANSFORMATION
Q  = EQUIVALENCE / INVARIANT structure
C  = CONTEXT
P  = PERSPECTIVE
Γ  = TRAJECTORY
B  = BOUNDARY
K  = COMPATIBILITY
O  = OBSTRUCTION
~~~

This tuple is a **formal comparison scaffold**, not yet a complete mathematical theory.

The slot \(\mathcal{Q}\) is deliberately **composite**:

\[
\mathcal{Q}=(\sim,\mathcal{I})
\]

where \(\sim\) denotes the declared equivalence structure and \(\mathcal{I}\) the declared invariant family. RGR-02 retains the ten accepted primitive headings while formally refusing to conflate the two components. A candidate formalism may make one component more natural than the other.

Each candidate formalism must say what its version of these slots actually is.

A slot may be:

- native;
- supported by standard constructions;
- supplied only through extra structure;
- noncanonical;
- inapplicable.

No formalism is required to make every slot equally natural.

---

# III · Primitive 1 — ENTITY / STATE

## 1. Minimal definition

RGR-02 separates **entity identity** from **state representation**.

Let:

\[
E
\]

be a set or class of entity identifiers.

Let:

\[
X_{c,p}
\]

be the **perspective-indexed local state carrier** under context \(c\) and perspective \(p\). The notation \(X_{c,p}\) is not a hidden global state space. When later sections write \(X_p\), context is being suppressed for readability: \(X_p\) is shorthand for the appropriate \(X_{c,p}\) in the active context.

A state occurrence may be represented schematically as:

\[
s = (e,x;c,p)
\]

with:

\[
e \in E,
\qquad
x \in X_{c,p}.
\]

If the object of study is a whole relational configuration rather than one entity, \(e\) may identify that configuration.

## 2. Why the distinction matters

RGR-02 rejects:

~~~text
ENTITY = STATE
~~~

An entity may undergo many states.

Two entities may occupy equivalent states.

One state representation may fail to preserve entity identity.

This is directly relevant to any future claim about transformation:

~~~text
state changed
≠
entity necessarily changed identity
~~~

## 3. No required ontology

An entity may later be:

- a symbol;
- object;
- person identifier;
- proposition;
- graph node;
- configuration;
- subspace-bearing item;
- local sheaf cell;
- synthetic benchmark object.

RGR-02 does not decide that question.

---

# IV · Primitive 2 — RELATION

## 1. Minimal definition

A relation must be **typed**.

For carriers \(X_1,\dots,X_k\), an exact relation may be represented as a subset:

\[
r \subseteq X_1 \times \cdots \times X_k
\]

or as a valued relation/operator:

\[
r : X_1 \times \cdots \times X_k \to Y_r.
\]

The codomain \(Y_r\) is part of the declared **relation type**. RGR does not permit an untyped valued relation whose output domain is left implicit.

The first form answers whether a tuple participates in a relation.

The second form may encode:

- relation type;
- strength;
- orientation;
- transformation parameter;
- probability;
- score;
- structured output.

## 2. Relation is not distance

RGR-02 rejects:

~~~text
RELATION = DISTANCE
~~~

Distance can be one relation-derived quantity.

But relations can also be:

- directed;
- asymmetric;
- typed;
- higher-order;
- compositional;
- causal;
- structural;
- categorical;
- incidence-based.

A metric alone cannot represent every relational distinction.

## 3. Relation is not transformation

A relation states a structured connection or predicate.

A transformation acts.

Thus:

~~~text
RELATION ≠ TRANSFORMATION
~~~

A relation may parameterize a transformation, but they remain distinct formal roles.

---

# V · Primitive 3 — TRANSFORMATION

## 1. Minimal definition

A transformation is a typed map between state-bearing objects or configurations:

\[
\tau : A \to B.
\]

The domain and codomain must be declared.

If a transformation changes context and/or perspective, that change is typed directly. For example:

\[
\tau : X_{c,p} \to X_{c',p'}.
\]

This does **not** create an eleventh primitive. It means that TRANSFORMATION may map between differently indexed carriers when the source and target context/perspective are explicit.

A transformation may change:

- state;
- representation;
- perspective;
- context;
- graph structure;
- subspace orientation;
- local assignment;
- relation parameters.

## 2. Transformations need not be invertible

RGR-02 rejects the assumption:

~~~text
TRANSFORMATION = SYMMETRY
~~~

A symmetry is a special transformation preserving declared structure and typically belonging to an invertible transformation family.

A generic transformation may be:

- many-to-one;
- lossy;
- irreversible;
- stochastic;
- context-changing.

## 3. Transformation law

No future RGR claim may say:

> "this property is invariant"

without first declaring:

> "invariant under which transformation family?"

---

# VI · Primitive 4 — EQUIVALENCE / INVARIANT

The heading remains one accepted primitive, but RGR-02 formally separates its two roles.

---

## A · Equivalence

An equivalence relation \(\sim\) on a domain \(X\) must satisfy:

\[
x \sim x
\]

(reflexivity),

\[
x \sim y \Rightarrow y \sim x
\]

(symmetry),

and:

\[
x \sim y,\ y \sim z \Rightarrow x \sim z
\]

(transitivity).

Possible sources of equivalence include:

- equality;
- orbit under a group action;
- graph isomorphism;
- a declared quotient relation;
- sheaf isomorphism;
- equality of a formal relational rule.

### Similarity is not automatically equivalence

A thresholded metric relation such as:

\[
d(x,y)<\varepsilon
\]

usually fails transitivity.

Therefore:

~~~text
SIMILARITY
≠
EQUIVALENCE
~~~

unless equivalence has independently been established.

---

## B · Invariant

Let:

\[
I : X \to Y
\]

be a declared property/measurement.

For transformation family \(\mathcal{T}_I\), exact invariance means:

\[
I(\tau x)=I(x)
\]

for every:

\[
\tau \in \mathcal{T}_I.
\]

Approximate invariance is defined only when the codomain \(Y\) has an explicitly declared metric or pseudometric \(d_Y\). Then:

\[
d_Y(I(\tau x),I(x)) \le \varepsilon.
\]

The metric/pseudometric \(d_Y\) and tolerance \(\varepsilon\) are part of the formal model. If no such structure on \(Y\) is declared, only exact invariance is defined.

They may not be silently chosen after the result is known.

---

## C · Invariant is not equivalence

Two states may share one invariant without being equivalent.

For example:

~~~text
same norm
≠
same vector

same graph degree sequence
≠
isomorphic graph

same subspace dimension
≠
same subspace
~~~

Thus:

~~~text
EQUIVALENCE
≠
INVARIANT
~~~

RGR keeps them under one heading because they jointly govern "what survives transformation," but they are not synonyms.

---

# VII · Primitive 5 — CONTEXT

## 1. Minimal definition

A context is a selector or modulator of the active relational structure.

Let:

\[
c \in \mathcal{C}.
\]

Context may select:

- state carrier \(X_c\);
- active relation family \(\mathcal{R}_c\);
- transformation family \(\mathcal{T}_c\);
- metric \(d_c\);
- transition probabilities;
- compatibility law;
- admissible region;
- the **set of permissible perspectives**, without defining the perspective-specific observation map itself.

It is therefore useful to think of context as selecting:

\[
\mathfrak{R}_c
\]

from a family of relational systems.

## 2. Context is not required to be a coordinate

RGR-02 rejects the default move:

~~~text
context
→ append another scalar feature
~~~

That may be valid in a particular model, but it is not the formal definition.

Context can instead alter the structure in which states and relations are interpreted.

## 3. Elemental boundary

RGR-02 does not identify:

~~~text
Weather = context
~~~

It merely preserves the possibility that a later Weather hypothesis might involve contextual modulation rather than a fifth scalar coordinate.

That hypothesis remains closed.

---

# VIII · Primitive 6 — PERSPECTIVE

## 1. Minimal definition

Perspective is a local representational frame with an explicit observation or encoding rule.

When a common underlying carrier \(X\) is justified, a perspective can take the form:

\[
\pi_p : X \to X_p.
\]

Here:

- \(X\) is an underlying state carrier;
- \(X_p\) is the representation available under perspective \(p\);
- \(\pi_p\) is the perspective map.

## 2. No privileged global carrier is assumed

RGR-02 does not require all perspectives to arise from one global state space.

An alternative form is:

~~~text
local carrier X_p
+
relation-specific translation/compatibility maps
~~~

This is especially important for the sheaf candidate.

## 3. Perspective is not context

RGR-02 adopts:

~~~text
PERSPECTIVE ≠ CONTEXT
~~~

A perspective changes:

> how/where the system is represented or observed.

A context changes:

> which relational/metric/transition structure governs interpretation.

The same context may admit multiple perspectives.

The same perspective apparatus may be used under multiple contexts.

Example: a context may select the active relation set, transition law, or metric, while two perspectives \(p_1,p_2\) provide different observation maps \(\pi_{p_1},\pi_{p_2}\). The context may permit those perspectives without defining their observation maps.

---

# IX · Primitive 7 — TRAJECTORY

## 1. Discrete trajectory

A discrete trajectory is a composable sequence:

\[
x_0
\xrightarrow{\tau_0}
x_1
\xrightarrow{\tau_1}
\cdots
\xrightarrow{\tau_{n-1}}
x_n.
\]

The codomain of each step must match the domain of the next, up to the declared typing rules.

## 2. Continuous trajectory

Where the formalism supports it:

\[
\gamma : [0,T] \to X.
\]

A Grassmannian trajectory, for example, can be a curve through fixed-dimensional subspaces.

## 3. Trajectory is history-bearing

RGR-02 preserves:

~~~text
same endpoint
≠
same trajectory
~~~

Two trajectories may terminate in the same state while differing in:

- path length;
- transformations undergone;
- crossed boundaries;
- accumulated cost;
- intermediate relations;
- irreversibility.

## 4. Engineering analogy boundary

JARVIS Work Units already preserve failed attempts along later successful trajectories.

That is an **engineering analogy** supporting the usefulness of path-sensitive systems.

It is not evidence that human meaning is path-dependent in the same formal sense.

---

# X · Primitive 8 — BOUNDARY

## 1. Minimal definition

"Boundary" is not meaningful until a formalism supplies:

1. an admissible region or subobject;
2. an ambient structure defining adjacency/topology/frontier;
3. a rule for what counts as crossing.

A boundary specification may therefore be represented abstractly as:

\[
\mathcal{B}=(S,A,\partial_S,\chi)
\]

where:

- \(S\) is the declared ambient structure;
- \(A\) is an admissible region/subobject of \(S\);
- \(\partial_S\) is the boundary/frontier operation appropriate to that ambient structure;
- \(\partial_S(A)\) is the resulting boundary of \(A\);
- \(\chi\) is the declared crossing/admissibility rule.

For a topological space, \(\partial_S\) may be the ordinary topological boundary. For a graph, a declared graph-boundary operator may return incident nodes/edges crossing from \(A\) to its complement. RGR-02 does not assume one universal boundary operator across all formalisms.

## 2. Boundary is not distance

RGR-02 rejects:

~~~text
BOUNDARY = LARGE DISTANCE
~~~

and:

~~~text
BOUNDARY = LOW SIMILARITY
~~~

A boundary may occur at arbitrarily small metric distance.

## 3. Boundary is not obstruction

A boundary states a frontier/admissibility condition.

An obstruction states failure of an extension or joint satisfaction problem.

Thus:

~~~text
BOUNDARY ≠ OBSTRUCTION
~~~

## 4. Grassmann warning

The standard Grassmann manifold \(Gr(k,n)\) for fixed \(0<k<n\) is a smooth manifold without boundary.

Therefore RGR may only speak of a Grassmann "boundary" after defining something like:

\[
A \subset Gr(k,n)
\]

with an induced or separately defined frontier.

This rule is mandatory.

---

# XI · Primitive 9 — COMPATIBILITY

## 1. Minimal definition

Compatibility is a declared **typed relation** among local descriptions saying that they can coexist under the governing mapping rules.

If \(a\in A\) and \(b\in B\), then the compatibility predicate must declare its domain:

\[
K : A\times B \to \{\mathrm{true},\mathrm{false}\}.
\]

Thus:

\[
K(a,b) \in \{\mathrm{true},\mathrm{false}\}.
\]

or, when maps into a shared comparison object \(Z\) exist:

\[
f(a)=g(b).
\]

Approximate compatibility may be defined with explicit tolerance:

\[
d_Z(f(a),g(b))\le\varepsilon.
\]

## 2. Compatibility is not identity

RGR-02 adopts:

~~~text
COMPATIBILITY ≠ IDENTITY
~~~

Two perspectives can differ while remaining compatible.

## 3. Compatibility is not agreement

In eventual human interpretation:

~~~text
compatible formal descriptions
≠
people agree
~~~

Psychological agreement is not currently a mathematical primitive.

## 4. Sheaf special case

For a cellular sheaf over an edge \(e\) incident to vertices \(v,w\), local assignments can be compatible when:

\[
\rho_{v\to e}(x_v)
=
\rho_{w\to e}(x_w).
\]

This is genuine local-to-global mathematics once the stalks and restriction maps are defined.

It is not yet a model of human perspectives.

---

# XII · Primitive 10 — OBSTRUCTION

## 1. Minimal definition

An obstruction is a witness that a declared local assignment, mapping requirement, or compatibility constraint **cannot be extended or jointly satisfied**.

In generic constraint form, let \(Z\) be a candidate solution space, \(C\) a constraint space, \(F:Z\to C\) a declared constraint map, and \(C_0\subseteq C\) the set of admissible constraint values. The extension problem is:

\[
\text{find } z\in Z \text{ such that } F(z)\in C_0.
\]

An obstruction is then evidence that no admissible \(z\) exists, or a theorem-specific witness of that non-extension. In the special case \(C_0=\{0\}\), this reduces to \(F(z)=0\).

An obstruction may be:

- proof of non-existence;
- violated rank/dimension condition;
- unsatisfied graph constraint;
- nonzero residual beyond declared tolerance;
- nontrivial obstruction class where a theorem establishes that role.

## 2. Obstruction is not ordinary error

RGR-02 rejects:

~~~text
OBSTRUCTION = ERROR
~~~

An error may be numerical or implementation failure.

An obstruction is structural relative to a declared extension/compatibility problem.

## 3. Obstruction is not contradiction by default

RGR-02 also rejects:

~~~text
psychological contradiction = mathematical obstruction
~~~

A later model could test a bridge between them.

RGR-02 does not assume one.

## 4. Sheaf caution

Sheaf cohomology can encode particular global extension/consistency phenomena.

RGR-02 forbids the universal slogan:

~~~text
contradiction is H¹
~~~

unless a specific sheaf construction and theorem justify that interpretation.

---

# XIII · Common non-collapse laws

RGR-02 adopts the following formal discipline.

~~~text
ENTITY
≠
STATE

RELATION
≠
DISTANCE

RELATION
≠
TRANSFORMATION

TRANSFORMATION
≠
SYMMETRY

SIMILARITY
≠
EQUIVALENCE

EQUIVALENCE
≠
INVARIANT

CONTEXT
≠
PERSPECTIVE

TRAJECTORY
≠
ENDPOINT

BOUNDARY
≠
LARGE DISTANCE

BOUNDARY
≠
OBSTRUCTION

COMPATIBILITY
≠
IDENTITY

COMPATIBILITY
≠
AGREEMENT

OBSTRUCTION
≠
ERROR

OBSTRUCTION
≠
PSYCHOLOGICAL CONTRADICTION
~~~

A future formalization that requires one of these collapses must declare and justify that additional identification rather than inheriting it from RGR language.

---

# XIV · Common structural laws

## Law 1 — Typing

Every relation and transformation has a declared domain/codomain or arity.

No untyped "relationship" is accepted as a formal object.

## Law 2 — Transformation declaration

Every invariance claim names the transformation family relative to which invariance is asserted.

## Law 3 — No default metric

No RGR state space receives a metric merely because the programme contains the word geometry.

## Law 4 — No default global coordinate system

Perspectives are not forced into one ambient representation space unless evidence/formal need justifies it.

## Law 5 — Equivalence rigor

Equivalence requires a true equivalence relation or justified quotient/orbit construction.

Similarity thresholds are not sufficient.

## Law 6 — Path retention

If trajectory is used, the model must say whether only endpoints matter or whether the path contributes formal information.

## Law 7 — Boundary declaration

Every boundary claim identifies the admissible region and ambient structure that define the boundary.

## Law 8 — Compatibility declaration

Every compatibility claim identifies the maps/predicates under which compatibility is tested.

## Law 9 — Obstruction witness

An obstruction must be tied to a specific failed extension/constraint problem.

## Law 10 — Formalism neutrality

RGR-02 may not call a primitive "more fundamental" merely because one candidate formalism represents it elegantly.

## Law 11 — Semantic bridge discipline

A mathematically valid structure becomes an RGR semantic claim only after an explicit empirical or theoretical mapping is separately justified.

## Law 12 — No ontology by notation

Using symbols from geometry, topology, category theory, or physics does not promote a hypothesis into a fact about human meaning.

---

# XV · The common scaffold in operational form

A future RGR candidate should be able to answer this exact checklist.

## State

~~~text
What is the state carrier?
What is an entity?
What distinguishes entity identity from state?
~~~

## Relation

~~~text
What is the arity?
Is the relation typed?
Is it directed/asymmetric?
Does it return truth, a value, or another object?
~~~

## Transformation

~~~text
What is the domain/codomain?
Is it invertible?
What structure, if any, does it preserve?
~~~

## Equivalence / invariant

~~~text
What exactly defines equivalence?
Which invariant is being measured?
Under which transformations?
Exact or approximate?
~~~

## Context

~~~text
What structure does context select or modify?
~~~

## Perspective

~~~text
What is the local carrier?
What is the observation/translation map?
Is there a global carrier or not?
~~~

## Trajectory

~~~text
What composes?
Is the path itself information-bearing?
Discrete or continuous?
~~~

## Boundary

~~~text
What is the admissible region?
What ambient structure defines its frontier?
What does crossing mean?
~~~

## Compatibility

~~~text
Which maps or constraints must agree?
Exact or approximate?
~~~

## Obstruction

~~~text
Which extension/constraint problem fails?
What is the witness?
~~~

A candidate formalism that cannot answer these questions is not ready for RGR-03.

---

# XVI · Candidate structure A — Vector / Relational RGR

A minimal vector candidate may take:

\[
X = V
\]

for a vector space \(V\).

States:

\[
x \in V.
\]

Relations may be represented by typed operators such as:

\[
r(x,y)
\]

or:

\[
R_\alpha : V \to V
\]

for relation type \(\alpha\).

A simple relation representation might use:

\[
y \approx R_\alpha x.
\]

This is only one candidate; vector differences or bilinear/tensor relations are also possible.

Transformations:

\[
T:V\to W.
\]

Perspective:

\[
\pi_p:V\to V_p.
\]

Trajectory:

\[
x_{t+1}=T_t(x_t)
\]

or a continuous flow.

### Strength

Simple, scalable, strong baseline.

### Failure risk

The model may collapse relational structure into one shared coordinate system and mistake similarity for equivalence.

### RGR-03 pressure

Vector baseline must be included in any later empirical comparison.

---

# XVII · Candidate structure B — Graph / Structural RGR

A minimal graph candidate:

\[
G=(V,E,\lambda)
\]

where:

- \(V\) are entities/states;
- \(E\) contains typed relational incidence;
- \(\lambda\) carries attributes/types.

Relation is native:

\[
(u,v,\alpha) \in E.
\]

Transformation may be:

- **graph homomorphism** — preserves the declared adjacency/relation structure in the forward direction;
- **graph isomorphism** — a bijective structure-preserving map with structure-preserving inverse;
- **relabeling** — changes labels while preserving the underlying declared graph structure;
- **graph rewrite** — changes the graph/configuration itself and therefore should not be confused with equivalence.

A relation-preserving map \(f\) must satisfy the relevant structural condition.

For a simple typed graph example:

\[
(u,v,\alpha)\in E
\Rightarrow
(f(u),f(v),\alpha)\in E'.
\]

### Strength

Relations are explicit and need no metric interpretation.

### Failure risk

Graph structure may be too discrete or may require extensive hand-engineered relation typing.

### RGR-03 pressure

If graph structure matches geometric generalization, RGR cannot claim geometry is necessary.

---

# XVIII · Candidate structure C — Subspace / Grassmann RGR

For fixed \(k,n\), let:

\[
U \in Gr(k,n)
\]

represent a \(k\)-dimensional subspace of \(\mathbb{R}^n\).

A state is not one vector.

It is a family of directions.

Relations between \(U,V\) may use:

- principal-angle vector;
- projection operators;
- intersection dimension;
- canonical correlations;
- explicitly defined linear maps.

Principal angles:

\[
0\le\theta_1\le\cdots\le\theta_k\le\pi/2.
\]

Under orthonormal basis matrices \(Q_U,Q_V\), singular values of:

\[
Q_U^\top Q_V
\]

are:

\[
\cos(\theta_i).
\]

Candidate distance functions can be built from the angle vector.

### Strong RGR opportunity

If relational meaning requires a **space of directions** rather than a point, Grassmann structure gives a precise candidate.

### Strong RGR constraint

Fixed \(k\) is a real assumption.

If dimension varies meaningfully, one Grassmannian is insufficient.

### Boundary result

Gr(k,n) is not supplied with the threshold/boundary semantics RGR language might tempt us to project onto it.

Any boundary must be attached to an extra subset/constraint.

### RGR-03 pressure

Grassmann methods become justified only if orientation/intersection information predicts relational transfer beyond matched vector/graph baselines.

---

# XIX · Candidate structure D — Local-to-Global / Sheaf RGR

Let \(K\) be a base graph/cell complex.

A cellular sheaf \(F\) assigns local vector spaces:

\[
F(\sigma)
\]

to cells \(\sigma\), with restriction maps along incidence.

For a graph:

\[
v \subset e
\]

may carry:

\[
\rho_{v\to e}:F(v)\to F(e).
\]

A local assignment is a selection:

\[
x_v \in F(v).
\]

For edge \(e=(v,w)\), compatibility requires:

\[
\rho_{v\to e}(x_v)
=
\rho_{w\to e}(x_w).
\]

A global section is a globally compatible assignment.

### Strong RGR opportunity

Different local carriers can coexist without forcing identical coordinates.

This is the strongest current formal candidate for:

~~~text
different local perspectives
+
relation-specific translation
+
global compatibility
~~~

### Strong RGR constraint

The difficult question moves into the restriction maps.

If those maps are invented to make the desired interpretation work, the formalism explains nothing.

They must eventually be grounded or learned under falsifiable conditions.

### Obstruction boundary

Failure to extend local data globally may be a genuine mathematical obstruction.

But no future psychological interpretation is licensed by that fact alone.

### RGR-03 pressure

Sheaf methods become justified if heterogeneous local representations outperform forced global coordinates and if relation-specific compatibility maps make novel predictions.

---

# XX · Why "meaning" is not an eleventh primitive

RGR-02 deliberately does not define:

\[
MEANING
\]

as a primitive.

Doing so would risk encoding the conclusion of the theory into the formal language.

The current RGR hypothesis remains:

> meaning may depend in part on relational structure preserved, transformed, constrained, or made coherent across perspective, context, and trajectory.

That remains a **HYPOTHESIS**.

RGR-02 therefore permits future candidate measures of meaning-related structure, but does not define mathematical meaning by fiat.

This creates a critical asymmetry:

~~~text
RGR formalism
may represent relational structure

RGR formalism
does not thereby define lived meaning
~~~

---

# XXI · Why "geometry" is not an extra primitive either

RGR-02 also does not add:

\[
GEOMETRY
\]

as an eleventh primitive.

Geometry is a property of an enriched candidate structure.

Examples:

~~~text
vector space + inner product
→ Euclidean geometry

state space + metric
→ metric geometry

smooth state space + Riemannian metric
→ Riemannian geometry

fixed-dimensional subspaces
→ Grassmann geometry

graph + metric/Laplacian/sheaf
→ structured non-Euclidean geometry
~~~

The research programme may therefore discover that:

- some relational tasks are geometric;
- some are primarily structural;
- some need both;
- some need neither.

That outcome remains admissible.

---

# XXII · Four-formalism comparison result

RGR-02's current candidate result is:

## Vector / relational

Most economical baseline.

Strong when one shared coordinate system is adequate.

## Graph / structural

Most direct relation-first non-metric competitor.

Strong when relational pattern matters more than distance.

## Subspace / Grassmann

Most precise candidate for representing multiple meaningful directions/orientations.

Strong when point representations collapse useful relational variation.

## Sheaf / local-to-global

Most precise candidate for heterogeneous local state spaces plus compatibility.

Strong when perspectives cannot responsibly be forced into one carrier.

No formalism dominates all ten primitives.

That is a feature, not a failure.

---

# XXIII · Formal falsification cases for RGR-02

RGR-02 itself can be wrong before any benchmark is run.

The formalization must be RETURNED if any of these failures survives review.

## F02-1 — Hidden geometry by definition

The common scaffold requires metric/manifold structure in a way that makes graph/structural representation second-class.

## F02-2 — Similarity/equivalence collapse

A distance threshold is treated as formal equivalence without proof of an equivalence relation.

## F02-3 — Invariance without transformations

An invariant is named without a declared transformation family.

## F02-4 — Context/perspective collapse

Context and perspective are used interchangeably.

## F02-5 — Grassmann boundary hallucination

A standard Grassmannian is treated as having an intrinsic boundary/threshold.

## F02-6 — Sheaf psychology laundering

Stalks/restriction maps/cohomology are directly identified with human perspectives/relationships/contradictions.

## F02-7 — Obstruction inflation

Every disagreement or model mismatch is called an obstruction.

## F02-8 — Formalism favoritism

One candidate is selected because it resonates with Spiralogic or the founding intuition rather than because of formal necessity.

## F02-9 — Meaning by definition

Meaning is introduced as a formal primitive in a way that makes RGR true by construction.

## F02-10 — Elemental backdoor

Fire, Water, Earth, Air, or Weather enters the formal model before its separately authorized hypothesis gate.

---

# XXIV · What RGR-02 can legitimately hand to RGR-03 later

If RGR-02 survives independent review, a future RGR-03 would inherit:

1. the ten precisely separated primitives;
2. the common typed contextual relational scaffold;
3. four competing candidate enrichments;
4. explicit transformation/invariance discipline;
5. a no-default-metric law;
6. a no-default-global-coordinate law;
7. explicit boundary/compatibility/obstruction definitions;
8. the non-collapse laws;
9. the requirement for matched simpler baselines.

RGR-03 would **not** inherit a selected formalism.

A later empirical gate would have to create that selection pressure.

---

# XXV · Deferred vocabulary

The following terms remain intentionally outside the RGR-02 core:

~~~text
FIELD
CONNECTION
CURVATURE
GAUGE
CANONICAL FORM
POSITIVE GEOMETRY
ELEMENTAL OPERATOR
WEATHER OPERATOR
CONSCIOUSNESS GEOMETRY
~~~

They may be introduced only if a later formal problem makes them necessary.

The discipline is:

> **No mathematical noun enters RGR merely because it sounds structurally resonant.**

---

# XXVI · Candidate conclusion

RGR-02 currently supports the following candidate conclusion:

> **Relational Geometry Reasoning can be given a precise common vocabulary without assuming that all relations are geometric. Its minimal common object is a typed contextual relational system with state, relation, transformation, equivalence/invariance, context, perspective, trajectory, boundary, compatibility, and obstruction. Vector, graph, Grassmann, and sheaf approaches are competing enrichments of this common scaffold. Their mathematical differences are substantive and should be allowed to determine what the later experiments test.**

This is a formalization result.

It is not an empirical result.

It does not establish a geometry of meaning.

---

# XXVII · Current standing before independent mathematical challenge

~~~text
RGR-00:
CANONICAL

RGR-01:
CANONICAL + CLOSED

RGR-02:
FORMALIZATION CANDIDATE

ten primitives:
DEFINED

common scaffold:
DEFINED

four candidate formalisms:
PRESERVED

winning formalism:
NONE

RGR-03:
CLOSED

Elemental Operator hypothesis:
CLOSED

MAIA alteration:
NONE

implementation:
NONE

benchmark:
NONE

deployment:
NONE
~~~

The next RGR-02 act is independent mathematical challenge and source-grounding only.

No successor gate is opened by this candidate.


---

# XXVIII · Independent mathematical challenge

RGR-02 was reviewed independently against the same unchanged formal packet by the two local roles already bound in the governed Work Unit.

## 1 · GPT-OSS primary review

~~~text
provider: gpt-oss-local
model:    gpt-oss:20b
role:     deep_reasoning_primary
verdict:  ACCEPT
~~~

GPT-OSS found the core formalization mathematically sound and returned mostly low-level typing clarifications.

### Source-grounded corrections accepted

The following findings survived inspection and were incorporated:

1. **Perspective-indexed carrier notation**
   - X_{c,p} is now explicitly local/perspective-indexed.
   - X_p is declared shorthand with context suppressed.
   - No hidden global carrier is assumed.

2. **Context-changing transformations**
   - transformations between contexts/perspectives are now typed directly:
     X_{c,p} → X_{c',p'}.
   - no eleventh CTX_TRANSITION primitive was introduced.

3. **Context / perspective separation**
   - CONTEXT no longer selects the perspective-specific observation rule.
   - context may select the set of permissible perspectives.
   - PERSPECTIVE owns the actual observation/representation map.

4. **Approximate invariance typing**
   - approximate invariance now requires a declared metric or pseudometric on the invariant codomain.
   - without such structure, only exact invariance is defined.

5. **Boundary typing**
   - boundary is now relative to an explicit ambient structure S and boundary operator ∂_S.
   - no universal boundary operator is assumed.

6. **Valued relation typing**
   - valued relation codomain Y_r is now part of the declared relation type.

### GPT-OSS findings rejected or reframed

**Split EQUIVALENCE and INVARIANT into an eleventh slot**

Rejected.

RGR-01 and the Founder boundary explicitly preserve ten primitive headings. RGR-02 already defines the composite slot:

Q = (~, I)

and rigorously separates equivalence from invariance inside it.

The correction is therefore **clarification of the composite slot**, not expansion of the primitive set.

**Require all compatibility through a shared comparison object**

Rejected as too restrictive.

A typed predicate:

K : A × B → {true,false}

is already a legitimate mathematical compatibility relation.

Mapping to a shared object Z is one optional construction, not the universal definition.

---

## 2 · Qwen independent challenger

~~~text
provider: qwen-local
model:    qwen3-coder:30b
role:     independent_local_challenger
verdict:  RETURN
~~~

Qwen returned ten findings.

### Qwen findings accepted

The following findings survived source/formal grounding and were incorporated:

1. **Obstruction constraint problem should be typed**
   - now uses Z as candidate solution space, C as constraint space, F:Z→C, and admissible set C_0⊂C.

2. **Graph transformation terminology should distinguish**
   - homomorphism;
   - isomorphism;
   - relabeling;
   - graph rewrite.

3. **Trajectory interaction with other primitives can be stated**
   - boundary crossing and stepwise compatibility are now explicitly derived constructions, not new primitives.

### Qwen findings rejected as mathematically invalid or already satisfied

#### A · "No default metric" is unsound

Rejected.

RGR-02 does not prohibit metrics.

It states only that a metric is **not assumed by default** merely because the programme is called Relational Geometry Reasoning.

The candidate matrix explicitly permits metric structure as an optional enrichment.

#### B · BOUNDARY ≠ LARGE DISTANCE is too strong

Rejected.

Boundary and metric distance are different mathematical objects.

A topological boundary can be characterized using distance in some metric settings, but it is not identical to "large distance"; points on a boundary can have zero distance to a set and its complement.

The non-collapse law therefore stands.

#### C · Grassmann boundary warning is logically flawed

Rejected.

The warning is a direct application of the general boundary law.

The ordinary fixed-dimensional Grassmannian is a smooth manifold without boundary in the standard manifold sense.

Therefore any RGR threshold/boundary interpretation must attach to an additional subset, stratification, admissibility condition, or other structure.

#### D · Approximate invariance is circular

Rejected.

It is standard to define approximate invariance only after equipping the codomain with a metric or pseudometric.

RGR-02 has nevertheless made that prerequisite explicit.

#### E · Threshold similarity claim is too absolute

Rejected.

RGR-02 says thresholded metric similarity **usually** fails transitivity.

It does not claim universal failure.

The equivalence warning stands.

#### F · Formalism neutrality improperly excludes elegance

Rejected.

The law says a primitive may not be called more fundamental **merely because** one formalism represents it elegantly.

It does not forbid mathematical elegance from being evidence in a broader principled argument.

No change required.

---

# XXIX · External mathematical source grounding

The following source checks were used to ground the review disposition.

## Principal angles

Drmač, "On Principal Angles between Subspaces of Euclidean Space," SIAM Journal on Matrix Analysis and Applications 22(1), DOI 10.1137/S0895479897320824:

- cosines of principal angles are singular values of Q_U^T Q_V for orthonormal basis matrices.

This supports the Grassmann/subspace statements.

## Grassmann manifold

Standard manifold treatments describe Gr(k,n) as a compact smooth manifold of fixed-dimensional subspaces.

The RGR-02 boundary claim uses the ordinary manifold-without-boundary interpretation; it does not claim that constrained subsets, Schubert varieties, positive regions, or stratified subsets lack boundaries/frontiers.

## Cellular sheaves

Hansen & Ghrist, arXiv:1808.01513, and Bodnar et al., NeurIPS 2022:

- cellular sheaves assign vector spaces to cells/nodes/edges with linear restriction maps;
- local-to-global compatibility and global sections are legitimate mathematical objects;
- learned sheaf structure can alter graph diffusion behavior.

These sources do **not** establish that human perspectives literally are stalks or that psychological contradiction is cohomology.

---

# XXX · Review result

After grounded corrections:

~~~text
GPT-OSS:
  ACCEPT
  grounded corrections incorporated: 6
  rejected/unnecessary suggestions: preserved

Qwen:
  RETURN
  grounded corrections incorporated: 3
  invalid/already-satisfied objections: preserved

core mathematical falsifiers:
  hidden geometry by definition: NOT FOUND
  equivalence/similarity collapse: NOT FOUND
  invariance without transformation family: NOT FOUND
  context/perspective collapse: REPAIRED
  Grassmann boundary hallucination: NOT FOUND
  sheaf psychology laundering: NOT FOUND
  obstruction inflation: REPAIRED/TIGHTENED
  formalism favoritism: NOT FOUND
  meaning by definition: NOT FOUND
  Elemental backdoor: NOT FOUND
~~~

Reviewer disagreement remains part of the evidence record.

No reviewer is granted semantic winner authority.

---

# XXXI · RGR-02 candidate standing after challenge

RGR-02 now has:

~~~text
ten primitive headings:
PRESERVED

equivalence / invariant:
FORMALLY DISTINCT WITHIN COMPOSITE SLOT

common typed contextual relational scaffold:
DEFINED

vector / relational candidate:
DEFINED

graph / structural candidate:
DEFINED

subspace / Grassmann candidate:
DEFINED

local-to-global / sheaf candidate:
DEFINED

winning formalism:
NONE

independent mathematical challenge:
COMPLETE

grounded corrections:
APPLIED

RGR-03:
CLOSED

Elemental Operator hypothesis:
CLOSED

MAIA alteration:
NONE

implementation:
NONE

benchmark:
NONE

deployment:
NONE
~~~

The next legitimate act is Founder adjudication of RGR-02 itself.

No successor gate is opened by this standing.


---

# XXXII · Founder adjudication — RGR-02 closure

**Founder act:** 2026-09-18
**Accepted formalization candidate:** f07286b026e5998eedebae27b057cc267afbe184

The Founder accepts the RGR-02 Formal Vocabulary + Candidate Structures package and the recorded evidence.

Accepted standing:

- RGR-00 is canonical;
- RGR-01 is canonical and CLOSED;
- RGR-02 was opened from exact canonical 8c8525eae316f21eeb844ba7af4af7ab1476f461;
- the governed RGR-02 Work Unit reached EVIDENCE_READY with its authorized core unchanged;
- only the three authorized RGR-02 documentary/research artifacts were created;
- no code, benchmark, model implementation, schema, migration, MAIA runtime change, deployment, or production action occurred;
- all sovereignty pre-commit gates passed.

The Founder accepts the central formal result:

> The minimal common structure of Relational Geometry Reasoning is not itself required to be a geometry. It is a typed contextual relational scaffold. Geometry enters only through separately justified enrichment.

The accepted primitive headings remain:

~~~text
ENTITY / STATE
RELATION
TRANSFORMATION
EQUIVALENCE / INVARIANT
CONTEXT
PERSPECTIVE
TRAJECTORY
BOUNDARY
COMPATIBILITY
OBSTRUCTION
~~~

The accepted non-collapse laws remain:

~~~text
ENTITY ≠ STATE
RELATION ≠ DISTANCE
RELATION ≠ TRANSFORMATION
TRANSFORMATION ≠ SYMMETRY
SIMILARITY ≠ EQUIVALENCE
EQUIVALENCE ≠ INVARIANT
CONTEXT ≠ PERSPECTIVE
TRAJECTORY ≠ ENDPOINT
BOUNDARY ≠ LARGE DISTANCE
BOUNDARY ≠ OBSTRUCTION
COMPATIBILITY ≠ IDENTITY
COMPATIBILITY ≠ AGREEMENT
OBSTRUCTION ≠ ERROR
OBSTRUCTION ≠ PSYCHOLOGICAL CONTRADICTION
~~~

EQUIVALENCE / INVARIANT remains one of the ten governing headings while its equivalence relation and invariant family remain mathematically distinct within the composite formal slot.

Meaning remains outside the primitive set.

Meaning is not made true by definition.

The four candidate formal families remain preserved without a winner:

~~~text
1. VECTOR / RELATIONAL
2. GRAPH / STRUCTURAL
3. SUBSPACE / GRASSMANN
4. LOCAL-TO-GLOBAL / SHEAF
~~~

Trajectory / predictive structure remains a cross-cutting axis rather than a fifth candidate formal family.

The Founder accepts the formal constraints recorded in RGR-02, including:

- typed relations and transformations;
- declared transformation families for invariance;
- declared metric/pseudometric and tolerance for approximate invariance;
- no promotion of similarity into equivalence without a true equivalence law;
- context/perspective separation;
- explicit observation/representation rules for perspective;
- trajectory as potentially information-bearing beyond endpoints;
- explicit ambient structure, admissible region, boundary operator, and crossing rule for boundary claims;
- no intrinsic psychological/relational boundary assigned to an ordinary fixed-dimensional Grassmannian;
- no treatment of variable intrinsic subspace dimension as motion inside one fixed Grassmannian without a rank-varying construction;
- typed compatibility predicates or maps;
- explicit failed extension/constraint problem for obstruction;
- no direct identification of sheaf stalks, restriction maps, global sections, or cohomology with human perspectives, relationships, agreement, or contradiction without a separately tested bridge;
- no declaration of fundamentality merely because a formalism is elegant or resonates with Spiralogic.

The independent mathematical review evidence remains preserved:

~~~text
GPT-OSS:
VERDICT = ACCEPT

Qwen:
VERDICT = RETURN
~~~

Grounded corrections incorporated from the reviews remain part of the accepted candidate.

Reviewer objections judged mathematically invalid, already satisfied, or inconsistent with the exact packet remain preserved as challenged-but-rejected evidence rather than being erased.

No candidate formalism presently dominates all ten primitives.

## Lifecycle closure

By Founder act, the governed Work Unit has advanced:

~~~text
EVIDENCE_READY
→ ADJUDICATED
→ CLOSED
~~~

with:

~~~text
authorized core: unchanged
review attempts: preserved
verifier evidence: preserved
routing provenance: preserved
~~~

## Successor boundary

This closure explicitly preserves:

~~~text
RGR-03: CLOSED

Elemental Operator hypothesis: CLOSED

Fire / Water / Earth / Air formalization: NOT AUTHORIZED

Weather formalization: NOT AUTHORIZED

MAIA alteration: NOT AUTHORIZED

RGR implementation: NOT AUTHORIZED

RGR benchmark: NOT AUTHORIZED

deployment: NOT AUTHORIZED
~~~

No successor gate is opened by this closure.

## Preservation law

The exact accepted RGR-02 formalization remains identified by:

f07286b026e5998eedebae27b057cc267afbe184

This closure act is a later documentary/lifecycle record layered on top of that accepted candidate. It does not rewrite the accepted formalization evidence.

**RGR-02 standing: CLOSED.**
