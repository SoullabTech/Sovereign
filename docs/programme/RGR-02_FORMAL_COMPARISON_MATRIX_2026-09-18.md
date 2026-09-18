# RGR-02 — Formal Comparison Matrix

**Programme:** RELATIONAL-GEOMETRY-REASONING
**Gate:** RGR-02 — FORMAL VOCABULARY + CANDIDATE STRUCTURES
**Date:** 2026-09-18
**Status:** CANDIDATE MATRIX · NO FORMALISM SELECTED
**Canonical base:** 8c8525eae316f21eeb844ba7af4af7ab1476f461
**Governing constitution:** RGR-00
**Upstream evidence:** RGR-01 canonical + CLOSED

---

# 0 · Comparison discipline

RGR-02 compares four candidate formal families against the **same ten primitives**.

No family is treated as the default ontology.

Status terms:

- **NATIVE** — the formalism supplies a standard mathematical object closely matching the primitive;
- **SUPPORTED** — the primitive can be represented naturally, but requires a choice among several standard constructions;
- **EXTRA STRUCTURE** — the primitive is possible only after adding a non-canonical modeling choice;
- **NONCANONICAL** — the primitive has no privileged representation in the formalism and forcing one risks metaphor;
- **DEFERRED** — not needed or not responsibly identifiable at RGR-02.

The ten primitives are:

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

---

# 1 · Primitive-by-formalism matrix

| Primitive | Vector / relational | Graph / structural | Subspace / Grassmann | Local-to-global / sheaf |
|---|---|---|---|---|
| ENTITY / STATE | **NATIVE** — vector or tuple in a carrier space | **NATIVE** — node, attributed node, subgraph, or whole graph state | **NATIVE** for fixed dimension — subspace U ∈ Gr(k,n) | **NATIVE** locally — stalk element / local assignment |
| RELATION | **SUPPORTED** — relation operator, bilinear/tensor map, predicate, difference | **NATIVE** — edge, hyperedge, typed predicate/incidence | **SUPPORTED** — principal-angle spectrum, intersection dimension, projection relation, linear map | **NATIVE** — base incidence plus restriction/transport maps |
| TRANSFORMATION | **NATIVE** — linear/affine/nonlinear map; group action when declared | **NATIVE** — morphism, isomorphism, relabeling, rewrite | **NATIVE** — GL(n)/O(n) action; curve/geodesic on Gr(k,n) | **SUPPORTED** — sheaf morphism / compatible family of local maps |
| EQUIVALENCE / INVARIANT | **SUPPORTED** — equality/orbit relation; invariant function under declared transformations | **NATIVE/SUPPORTED** — isomorphism class, graph invariant, relation-preserving equivalence | **SUPPORTED** — dimension; angle spectrum under simultaneous orthogonal action; orbit invariants | **SUPPORTED** — isomorphism/cohomological/global-section properties when appropriately defined |
| CONTEXT | **EXTRA STRUCTURE** — parameter selecting metric/operator/carrier | **EXTRA STRUCTURE** — layer, edge type, active subgraph/rule set | **EXTRA STRUCTURE** — ambient metric, admissible subset, family of subspaces | **SUPPORTED** — context may select base complex/sheaf/restriction system |
| PERSPECTIVE | **EXTRA STRUCTURE** — observation/encoding map | **SUPPORTED** — view/subgraph/quotient/observation map | **NONCANONICAL** — projection may change rank/dimension; no privileged perspective map | **SUPPORTED / structurally natural** — local stalk/view plus relation maps; semantic interpretation still external |
| TRAJECTORY | **NATIVE** — discrete sequence, flow, ODE/map | **SUPPORTED** — path, temporal graph sequence, rewrite sequence | **NATIVE** — curve/geodesic in Gr(k,n) for fixed dimension | **EXTRA STRUCTURE** — time-indexed assignments or sheaf family |
| BOUNDARY | **EXTRA STRUCTURE** — constraint set/level set/topological boundary after topology chosen | **SUPPORTED** — cut, frontier, subgraph boundary, forbidden edge/state condition | **NONCANONICAL** — standard Grassmannian is boundaryless; only an admissible subset can have a boundary | **EXTRA STRUCTURE** — subcomplex/domain boundary or admissibility constraint |
| COMPATIBILITY | **EXTRA STRUCTURE** — equality/tolerance after mapping to comparison space | **SUPPORTED** — structure-preserving map, matching constraints, commuting graph relations | **EXTRA STRUCTURE** — intersection/angle/map constraints; no canonical semantic compatibility | **NATIVE** — local assignments agree after restriction to shared incidence |
| OBSTRUCTION | **EXTRA STRUCTURE** — infeasible constraints, residual, no-solution certificate | **SUPPORTED** — absence of homomorphism/matching/extension; structural constraint violation | **EXTRA STRUCTURE** — no subspace satisfying declared dimension/angle/intersection constraints | **SUPPORTED / often native to extension problem** — failure of global section/extension; cohomology may encode specific obstructions |

---

# 2 · What each family is naturally good at

## A · Vector / relational baseline

Best native questions:

- Where is a representation?
- What direction separates or connects representations?
- Which linear/nonlinear transform relates them?
- Which transformations leave a feature invariant?
- How does a path move through a shared carrier space?

Weakest RGR primitives:

- heterogeneous perspectives;
- intrinsic compatibility;
- obstruction;
- boundary unless imposed;
- relations that cannot be reduced to a shared ambient coordinate system.

Constitutional use:

> baseline continuous representation family.

It must remain strong enough that a more elaborate RGR formalism has something real to beat.

---

## B · Graph / structural

Best native questions:

- Which entities are related?
- What relation type connects them?
- Which structural pattern is preserved under relabeling or mapping?
- Can one relational configuration map into another?
- What paths or rewrite sequences connect configurations?

Weakest RGR primitives:

- metric similarity unless added;
- smooth trajectory unless augmented;
- perspective unless a view/observation construction is chosen;
- local-to-global compatibility with different local carrier spaces.

Constitutional use:

> relation-first non-metric comparator.

If graph/structural representation explains the target phenomenon as well as geometry, RGR may not claim geometry is necessary.

---

## C · Subspace / Grassmann

Best native questions:

- Is a representation better described by a family of directions than by one point?
- How are two subspaces oriented relative to one another?
- What dimensions are shared?
- How does a subspace rotate/evolve while preserving dimension?
- Which quantities are invariant under simultaneous ambient transformations?

Key standard objects:

~~~text
U, V ∈ Gr(k,n)

principal angles:
θ1, …, θk

projection matrices:
P_U, P_V

intersection dimension:
dim(U ∩ V)
~~~

Useful standard metrics can be functions of principal angles. Principal-angle theory and unitarily invariant metrics are established mathematics; semantic interpretation is not.

Weakest RGR primitives:

- context;
- perspective;
- compatibility;
- obstruction;
- boundary.

### Critical boundary result

For fixed 0 < k < n, the ordinary Grassmann manifold Gr(k,n) is a smooth compact manifold **without boundary**.

Therefore RGR-02 forbids the statement:

> "the Grassmannian boundary represents a psychological or relational threshold."

A boundary exists only after RGR defines an additional constrained/admissible subset:

~~~text
A ⊂ Gr(k,n)
~~~

and equips the problem with the structure needed to define:

~~~text
∂A
~~~

This is one of RGR-02's strongest anti-metaphor constraints.

### Variable dimension warning

A single Gr(k,n) assumes fixed subspace dimension k.

If relational states are allowed to change intrinsic dimension, the object is no longer one Grassmann manifold. A candidate construction would need something like:

~~~text
⋃_k Gr(k,n)
~~~

or a different rank-varying formalism.

That change is not free and can alter continuity/topology.

Constitutional use:

> serious candidate for multi-directional representations, but not a universal carrier.

---

## D · Local-to-global / sheaf

Best native questions:

- Can different locations/perspectives carry different local state spaces?
- What relation-specific maps connect those local spaces?
- When are local assignments compatible?
- Does a compatible global assignment exist?
- Where does local-to-global extension fail?

Core schematic:

~~~text
base relation:
v —— e —— w

local spaces:
F(v), F(e), F(w)

restriction maps:
ρ_{v→e}: F(v) → F(e)
ρ_{w→e}: F(w) → F(e)
~~~

Compatibility of local assignments x_v and x_w across e can be written schematically as:

~~~text
ρ_{v→e}(x_v) = ρ_{w→e}(x_w)
~~~

This is an exact mathematical notion once the sheaf is defined.

What is **not** exact yet is the RGR interpretation that:

~~~text
human perspective = stalk
relationship = restriction map
contradiction = cohomological obstruction
~~~

Those remain hypotheses/engineering analogies until operational mappings exist.

### Obstruction warning

RGR-02 forbids the blanket statement:

> "contradiction is H¹."

Cohomology can encode particular failures/extensions in particular sheaf constructions. It is not a universal synonym for disagreement or psychological contradiction.

Weakest RGR primitives:

- metric distance;
- smooth trajectory;
- intrinsic temporal evolution;
- semantic interpretation of stalks/maps.

Constitutional use:

> strongest candidate for heterogeneous local representations and explicit compatibility.

---

# 3 · Transformation comparison

The four families differ sharply in what counts as a transformation.

| Family | Typical transformation | Must it be invertible? | What is preserved by default? |
|---|---|---:|---|
| Vector | linear/affine/nonlinear map T:V→W | No | nothing unless declared |
| Graph | homomorphism/isomorphism/rewrite | No; isomorphism yes | adjacency/relation structure depending morphism |
| Grassmann | U↦AU, A∈GL(n); orthogonal action Q∈O(n); curve on manifold | group actions yes, general evolution no | dimension under invertible maps; metric quantities under appropriate isometries |
| Sheaf | compatible local maps/sheaf morphism | No | commutation with restriction structure |

RGR-02 therefore distinguishes:

~~~text
TRANSFORMATION
≠
SYMMETRY
≠
EQUIVALENCE
~~~

A symmetry is a special transformation preserving declared structure.

An equivalence relation requires reflexivity, symmetry, and transitivity.

A trajectory step may be irreversible and therefore cannot automatically generate equivalence.

---

# 4 · Invariant comparison

An RGR invariant must always declare:

~~~text
1. domain
2. transformation family
3. codomain
4. exact vs approximate status
5. tolerance/metric if approximate
~~~

Generic exact form:

I(τ(x)) = I(x)

for every declared τ in the invariance family.

Approximate form:

d_Y(I(τ(x)), I(x)) ≤ ε.

The value of ε is part of the model.

It cannot be chosen after seeing the desired result without being reported as such.

### Examples by family

**Vector**
- norm under orthogonal transformation;
- pairwise inner products under simultaneous orthogonal action;
- learned feature under a specified augmentation family.

**Graph**
- graph isomorphism invariants;
- degree multiset;
- spectral quantities, subject to known non-uniqueness limitations;
- typed relational motifs.

**Grassmann**
- subspace dimension under invertible ambient maps;
- principal-angle spectrum under simultaneous orthogonal action;
- intersection dimension under suitable invertible structure-preserving actions.

**Sheaf**
- quantities preserved under sheaf isomorphism;
- global-section dimension / cohomological dimensions when the exact sheaf construction warrants it.

No example above is automatically a semantic invariant.

---

# 5 · Equivalence comparison

RGR-02 defines equivalence separately from similarity.

## Exact equivalence

An equivalence relation ~ on a set X must be:

~~~text
reflexive
symmetric
transitive
~~~

Possible sources of equivalence:

- orbit under a declared group action;
- graph isomorphism;
- equality of a formal relational rule;
- sheaf isomorphism;
- a separately defined quotient relation.

## Similarity is not equivalence

Examples:

~~~text
cosine(x,y) > 0.9
principal_angle(U,V) < ε
graph edit distance small
~~~

are usually similarity predicates, not equivalence relations, because transitivity need not hold.

RGR-02 forbids silently replacing:

~~~text
"similar enough"
~~~

with:

~~~text
"the same relational meaning"
~~~

without a declared quotient/equivalence law.

---

# 6 · Context comparison

RGR-02 defines context as **structure selection/modulation**, not automatically as another coordinate.

A context c may select or modify:

- state carrier;
- active relation set;
- metric;
- admissible transformations;
- transition probabilities;
- observation maps;
- compatibility rule;
- admissible region.

This yields a family R_c rather than necessarily one state vector with an extra "context dimension."

This is important for later Weather work: RGR-02 does **not** identify Weather with context, but it preserves the mathematical possibility that a future context variable modulates the relational system rather than appearing as an ordinary feature coordinate.

---

# 7 · Perspective comparison

RGR-02 gives perspective a stricter role than "context."

A perspective must include an explicit representation or observation rule.

Possible generic form:

π_p : X → X_p

when a shared underlying carrier X is justified.

But RGR-02 does **not** require a single global X.

For heterogeneous local models, perspective may instead be represented by:

~~~text
local carrier X_p
+
translation/compatibility maps to related carriers
~~~

This distinction prevents RGR from assuming in advance that every perspective is merely a lossy camera view of one privileged global representation.

### Perspective non-collapse law

~~~text
PERSPECTIVE ≠ CONTEXT
~~~

A perspective changes **how/where a state is represented or observed**.

A context changes **which relational/metric/transition structure governs the problem**.

They may interact, but neither is defined as the other.

---

# 8 · Trajectory comparison

Generic discrete trajectory:

~~~text
x0 --τ0→ x1 --τ1→ ... --τ(n-1)→ xn
~~~

where the maps are composable.

Generic continuous trajectory where supported:

γ : [0,T] → X.

RGR-02 treats trajectory as potentially path-dependent.

Therefore:

~~~text
same endpoint
≠
same trajectory
~~~

This matches the already-proven JARVIS Work Unit law that a later success does not erase an earlier failure, but that engineering analogy is not itself evidence for human meaning.

### Formalism-specific status

- vector: straightforward;
- graph: path or graph-rewrite sequence;
- Grassmann: smooth curve/geodesic for fixed-dimension subspaces;
- sheaf: must add time-indexed assignments or time-indexed sheaf structure.

Trajectory is therefore a **cross-cutting axis**, not a reason to select one formalism.

---

# 9 · Boundary comparison

RGR-02 uses "boundary" only when the formal model supplies:

1. an admissible region/set/subobject;
2. an ambient structure that defines a frontier;
3. a declared meaning for crossing it.

Possible constructions:

### Vector

A = {x : g(x) ≤ 0}

with boundary g(x)=0 under suitable regularity/topology.

### Graph
- graph cut;
- interface between designated node sets;
- forbidden relation;
- boundary of a subgraph/domain.

### Grassmann

A ⊂ Gr(k,n)

with boundary only for the chosen subset/stratification, **not** for the ordinary Grassmannian itself.

### Sheaf
- boundary subcomplex;
- restriction to a domain;
- admissibility frontier imposed on assignments.

### Boundary non-collapse law

~~~text
BOUNDARY
≠
LARGE DISTANCE
≠
LOW SIMILARITY
≠
OBSTRUCTION
~~~

Those can correlate in a model, but are mathematically different.

---

# 10 · Compatibility comparison

Compatibility asks:

> Can two or more local descriptions coexist under a declared relation/map?

It does **not** require those descriptions to be identical.

Generic form:

K(a,b) = true

or, where maps exist:

f(a) = g(b).

### Vector
Requires a chosen comparison map/tolerance.

### Graph
Can mean consistency under graph mapping, shared labels, edge constraints, or overlap.

### Grassmann
Requires an added rule such as:

- intersection dimension constraint;
- principal-angle tolerance;
- commutation with relation operators.

There is no single canonical notion of semantic compatibility between subspaces.

### Sheaf
Compatibility is the most structurally native:

ρ_{v→e}(x_v) = ρ_{w→e}(x_w).

This is the strongest reason to keep sheaf methods in RGR-02's candidate set.

---

# 11 · Obstruction comparison

RGR-02 defines an obstruction as:

> a witness that a declared local assignment, transformation, or compatibility requirement cannot be extended or jointly satisfied.

Possible forms:

### Vector
- infeasible linear/nonlinear constraint system;
- nonzero residual above declared tolerance;
- rank incompatibility.

### Graph
- no graph homomorphism/isomorphism satisfying typed constraints;
- forbidden pattern;
- unsatisfied matching or extension condition.

### Grassmann
- no subspace of declared dimension satisfying required angle/intersection constraints;
- incompatible rank constraints;
- failure of a declared map to preserve dimension.

### Sheaf
- no global section extending local assignments;
- specific cohomological obstruction when the construction and theorem justify that interpretation.

### Obstruction non-collapse law

~~~text
OBSTRUCTION
≠
DISAGREEMENT
≠
CONTRADICTION
≠
ERROR
~~~

A later psychological interpretation would need an independent operational bridge.

---

# 12 · Formalism selection pressure

RGR-02 does not rank the four families.

Instead, it records which future research question would legitimately create pressure toward one family.

## Pressure toward vector / relational

If the target phenomenon can be captured by:

- one shared carrier space;
- simple transformations;
- metric similarity;
- explicit relation operators;

then more elaborate geometry is unnecessary.

## Pressure toward graph / structural

If:

- relation type and compositional structure dominate;
- metric distance adds little;
- structural mappings generalize;

then graph/symbolic structure may be sufficient.

## Pressure toward subspace / Grassmann

If:

- point embeddings collapse multiple meaningful directions;
- orientation between direction-families predicts transfer;
- fixed or well-controlled intrinsic dimension is plausible;
- principal-angle/intersection structure beats matched baselines;

then subspace geometry becomes justified.

## Pressure toward sheaf / local-to-global

If:

- local perspectives require genuinely different carrier spaces;
- forcing one shared coordinate system destroys useful information;
- relation-specific translation maps are measurable;
- local compatibility predicts global behavior;

then sheaf-like structure becomes justified.

---

# 13 · RGR-02 non-selection result

The current comparison yields no single winner.

A defensible formal statement is:

> RGR's ten primitives define a **typed contextual relational scaffold**. Vector, graph, Grassmann, and sheaf structures are alternative enrichments of that scaffold. "Geometry" becomes mathematically substantive only when a candidate adds metric, manifold, topological, subspace, or related structure that produces testable consequences.

Therefore RGR-02 currently supports:

~~~text
COMMON CORE:
typed contextual relational system

OPTIONAL ENRICHMENTS:
metric
graph structure
subspace geometry
local-to-global sheaf structure
trajectory/dynamics
topology
probability
~~~

This result deliberately prevents RGR from making "geometry" true by definition.

---

# 14 · Source anchors used for formal discipline

The following source families anchor the definitions rather than determine RGR semantics:

- Bronstein, Bruna, Cohen & Veličković, Geometric Deep Learning — transformations, symmetry, invariance/equivariance;
- Drmač, "On Principal Angles between Subspaces of Euclidean Space," SIAM J. Matrix Anal. Appl. 22(1), DOI 10.1137/S0895479897320824;
- Qiu, Zhang & Li, "Unitarily Invariant Metrics on the Grassmann Space," DOI 10.1137/040607605;
- Hansen & Ghrist, "Toward a Spectral Theory of Cellular Sheaves," arXiv:1808.01513;
- Bodnar et al., "Neural Sheaf Diffusion," NeurIPS 2022, DOI 10.52202/068431-1346;
- Gentner structure-mapping literature — relation-preserving non-geometric comparator;
- Stachenfeld, Botvinick & Gershman successor-representation literature — transition structure as a competing primitive.

These sources establish mathematics/computational precedents.

They do not establish RGR's semantic interpretations.
