# RGR-01 — Literature + Mathematical Landscape

**Programme:** RELATIONAL-GEOMETRY-REASONING
**Gate:** RGR-01 — LITERATURE + MATHEMATICAL LANDSCAPE ONLY
**Date:** 2026-09-18
**Status:** EVIDENCE_READY · INDEPENDENT CHALLENGE COMPLETE · AWAITING FOUNDER ADJUDICATION
**Canonical base:** `c6ed841f8ebc378031b5c3fa0262e367a42dc3e8`
**Governing constitution:** RGR-00
**Data posture:** public scholarly/public technical sources only; no member/private/PHI/production data

---

# 0 · Executive finding

RGR-01 finds **substantial justification for a Relational Geometry Reasoning research programme**, but **insufficient evidence for a unified theory of relational meaning**.

The strongest defensible statement is:

> Multiple mature research traditions independently treat cognition, neural representations, semantic composition, relational reasoning, statistical models, or learned representations using geometry, topology, subspaces, graphs, transformations, manifolds, local-to-global maps, and invariance. These traditions make RGR scientifically plausible as a programme of comparative formalization and experiment. They do not converge on one ontology or one mathematics of meaning.

The most important 2026 bridge is Shang, Kreiman & Sompolinsky's controlled work on visual relational reasoning: they define relational rules as representation manifolds and show that geometric quantities predict held-out rule generalization in SimplifiedRPM. That is strong evidence that **geometry can be explanatory for a bounded form of relational generalization**.

The strongest constraints are equally important:

- structure mapping explains analogy through relation-preserving symbolic alignment without requiring geometric metrics;
- graph networks provide relational inductive bias without privileged manifold semantics;
- successor representations can generate map-like neural structure from predictive transition relations;
- concept subspaces are estimator-dependent and need not be unique;
- high-dimensional neural representations can be functionally meaningful;
- internal representation geometry does not by itself establish grounded meaning;
- representational evidence does not settle consciousness.

Therefore the next formal stage should not ask:

> "Which geometry is the geometry of meaning?"

It should ask:

> "What is the smallest relational task for which a specific geometric representation predicts cross-domain generalization better than simpler relational alternatives?"

That is the appropriate bridge into RGR-02/RGR-03.

---

# 1 · Literature map by family

## 1.1 Conceptual spaces

### What exists

Gärdenfors' conceptual-spaces programme treats concepts through geometric domains, similarity structure, regions, prototypes, and quality dimensions. The 2026 Gärdenfors–Osta-Vélez framework explicitly extends this programme to reasoning, including induction, analogy, expectations, and coherence.

### RGR relevance

This is the strongest established precedent for the broad idea that conceptual reasoning can be given a geometric formalization.

### Constraint

Conceptual spaces require decisions about dimensions, metrics, convexity, salience, and domain structure. Those decisions are not neutral. RGR cannot simply assert a conceptual space and then read the resulting geometry as discovered ontology.

### RGR standing

**High relevance; medium evidential strength for RGR's programme; low support for any unique RGR formalism.**

Sources: S01–S02.

---

## 1.2 Analogy and relational structure mapping

### What exists

Gentner's structure-mapping theory makes a strong relation-first claim: analogical transfer maps relational systems and higher-order relations rather than merely matching object attributes.

### RGR relevance

This is both support and a challenge.

Support: RGR's emphasis on relations rather than isolated objects is independently motivated.

Challenge: successful relational reasoning does not require geometric distance, manifolds, or subspaces.

### Baseline implication

Any RGR relational-transfer benchmark should include a structural/symbolic mapping baseline or an operational proxy for one.

### RGR standing

**Essential non-geometric baseline.**

Sources: S03–S04.

---

## 1.3 Geometric relational reasoning in neural networks

### What exists

Shang et al. (2026) define relational-rule manifolds over representations of inputs sharing the same relational rule across varied attributes/configurations. Their geometric analysis uses centroid separation, principal variability directions, dimensionality, and signal-noise overlap; these quantities predict generalization to held-out rules, and direct geometric optimization improves generalization.

### Why this matters

This is currently the closest literature match to RGR's engineering intuition:

```text
surface instances vary
        ↓
shared relational rule
        ↓
equivalence class / manifold
        ↓
generalization depends on representation geometry
```

### Critical limitation

The work concerns a controlled visual benchmark and neural-network representations. Its "rule manifolds" are empirical equivalence classes in feature space, not claims about lived meaning or human consciousness.

### RGR standing

**Strongest direct precedent for RGR-03 style relational-transfer testing.**

Source: S05.

---

## 1.4 Graph and relational inductive-bias methods

### What exists

Graph networks encode objects/entities plus relations and update them through structured message passing. Battaglia et al. frame relational inductive bias as central to flexible generalization. More recent work demonstrates that appropriate GNN parametrization can improve systematic reasoning on relational domains.

### RGR relevance

Graphs may capture much of what RGR wants without committing to continuous geometry.

### Baseline implication

A graph/hypergraph baseline is mandatory for any future claim that geometry adds explanatory or computational value.

### RGR standing

**Strong alternative; mandatory comparator.**

Sources: S06–S07.

---

## 1.5 Cognitive maps and abstract relational neuroscience

### What exists

Several experiments show that hippocampal-entorhinal and related systems can represent experimentally defined abstract structures in map-like ways:

- multidimensional social hierarchy with grid-like coding;
- conceptual search using allocentric and egocentric reference frames;
- task-specific low-dimensional manifolds jointly encoding physical and abstract variables;
- abstract boundary representations sensitive to context.

### RGR relevance

This supports three important possibilities:

1. relational knowledge can recruit map-like organization;
2. reference frame matters;
3. boundaries can be computationally relevant in abstract spaces.

### Critical limitation

These tasks are designed spaces with known axes or relations. The results do not show that unconstrained human meaning naturally occupies one geometric state space.

### RGR standing

**Strong evidence for abstract relational maps; weak evidence for universal semantic geometry.**

Sources: S08–S10, S14.

---

## 1.6 Predictive maps and successor representations

### What exists

The successor representation (SR) encodes expected discounted future occupancy/transition structure. It can explain important hippocampal map-like properties and has behavioral support in human reinforcement learning.

### RGR relevance

This is a major conceptual warning:

> Geometry may be an emergent description of transition structure rather than the causal primitive.

That is not anti-RGR. It suggests RGR may need to compare:

```text
geometry of states
vs
algebra of transitions
vs
geometry induced by transition structure
```

### RGR standing

**High-priority alternative model and causal interpretation.**

Sources: S11–S12.

---

## 1.7 Ordered experience and topology

### What exists

The "grid code for ordered experience" perspective argues that entorhinal-hippocampal structure may support a topology rooted in temporal ordering rather than a rigid Euclidean coordinate system.

### RGR relevance

This aligns closely with RGR's interest in trajectory and history:

```text
state alone
≠
ordered path through states
```

### RGR standing

**Important theoretical bridge toward trajectory/topology; not empirical proof of RGR.**

Source: S15.

---

## 1.8 Neural manifolds

### What exists

Large neural-population datasets frequently admit useful low-dimensional manifold descriptions. Recent reviews treat manifolds as constrained sets of possible population states. Geometric deep learning methods such as MARBLE exploit local dynamical flow on neural manifolds to compare computations across systems.

### Counterweight

Stringer et al. show that high-dimensional neural representations can be structured and functional. "Low-dimensional manifold" must not become an RGR dogma.

### RGR standing

**Useful representational family with explicit dimensionality caveat.**

Sources: S18–S20.

---

## 1.9 Vector embeddings as mandatory baseline

### What exists

Vectors remain the simplest and most computationally mature continuous representations for semantic similarity and learned features.

### RGR relevance

RGR cannot define itself merely as "not vectors."

A vector baseline is mandatory because many apparently relational effects may already be captured through:

- learned similarity;
- linear transformation;
- cosine distance;
- compositional embedding;
- contrastive representation learning.

### RGR standing

**Baseline, not straw man.**

---

## 1.10 Subspaces and Grassmannian geometry

### What exists

Sentence representations have been modeled as low-rank subspaces rather than single vectors. Subspace methods support principal-angle comparison and set-like operations such as soft intersection/union/complement. Classical principal-angle theory gives precise comparison tools.

A (k)-dimensional linear subspace of (mathbb{R}^n) can be treated as a point on a Grassmannian (Gr(k,n)).

### Why this is attractive for RGR

A point vector encodes one direction.

A subspace can encode a **family of available directions**.

For RGR this suggests a candidate motif:

```text
meaning-state
→ subspace of possible relational directions
```

and relation comparison through principal angles:

```text
theta_1 ... theta_k
```

rather than only one cosine angle.

### Major cautions

- concept subspaces need not be unique;
- estimator choice materially changes containment/disentanglement;
- subspace dimension is a modeling choice;
- linear subspaces may be poor approximations of nonlinear relational structure;
- a good subspace benchmark result does not imply human meanings are literally Grassmannian points.

### RGR standing

**Top candidate for an early formal prototype, but not privileged.**

Sources: S21–S24.

---

## 1.11 Information geometry

### What exists

Information geometry gives probability distributions/statistical models a differential-geometric structure via the Fisher metric, divergences, and dual affine connections.

### RGR relevance

This becomes principled if an RGR object is explicitly a probability distribution, belief state, predictive state, or stochastic relational model.

For example:

```text
perspective p
→ probability model P_p
```

could legitimately support information-geometric comparison.

### Major caution

Calling a semantic embedding "information geometry" without specifying a statistical model is category error.

### RGR standing

**High mathematical value; only applicable under explicit probabilistic semantics.**

Sources: S30–S31.

---

## 1.12 Geometric deep learning

### What exists

Geometric deep learning organizes machine-learning architectures around domain symmetry, invariance, equivariance, graph/manifold structure, and gauge-like local frames.

### RGR relevance

The most useful lesson is methodological:

> do not ask "which fashionable geometry should we use?"
> ask "what transformations should leave the task unchanged?"

That question naturally yields candidate invariance/equivariance structure.

### RGR standing

**Core methodological guide for RGR-02.**

Sources: S25–S26.

---

## 1.13 Sheaf theory and local-to-global compatibility

### What exists

A cellular sheaf can assign different vector spaces to different cells/nodes and linear restriction maps along relations. Global sections encode compatible local assignments; cohomological structure can characterize obstruction to global compatibility. Neural sheaf methods show this structure can be computationally useful.

### Why this matters for RGR

This may be the most precise candidate for the intuition:

> Different perspectives do not need identical representations in order to participate coherently in one relational structure.

Candidate RGR motif:

```text
perspective p → local space F(p)
perspective q → local space F(q)

relation p—q
→ transport/restriction maps

coherence
→ compatibility under those maps
```

### Critical cautions

- RGR must operationalize "perspective";
- restriction maps must be empirically grounded, not invented for elegance;
- a sheaf is a mathematical organizational framework, not evidence that human relationships are sheaves.

### RGR standing

**Top candidate for heterogeneous-perspective formalization.**

Sources: S27–S29.

---

## 1.14 Topological data analysis

### What exists

Persistent homology identifies topological features across scales/filtrations: connected components, loops, voids, and higher-dimensional features. It is increasingly used to characterize representational geometry and neural dynamics.

### RGR relevance

Topology may capture structures that survive continuous deformation, matching an RGR interest in invariants under transformations.

### Critical cautions

- topology intentionally discards metric detail;
- results depend on chosen metric and filtration;
- a persistent loop is not intrinsically meaningful;
- interpretability remains domain-specific.

### RGR standing

**Useful invariant-analysis tool; probably secondary to representation choice.**

Sources: S32–S34.

---

## 1.15 Category-theoretic and compositional approaches

### What exists

Compositional distributional semantics uses categorical structure to combine grammatical and distributional information through structure-preserving maps.

### RGR relevance

Category theory offers a radically different answer to "what matters?" than metric geometry:

```text
objects
+
morphisms
+
composition
```

rather than:

```text
points
+
distance
```

This is highly relevant if RGR ultimately cares more about compositional transformation than metric proximity.

### RGR standing

**Serious alternative/formal complement; should remain in RGR-02 comparison set.**

Sources: S35–S36.

---

## 1.16 Meaning and grounding

### What exists

Bender & Koller argue that success on linguistic form does not warrant claims of grounded human-like meaning. Formal-language experiments also show cases where distributional models fail to distinguish logically different operators.

### RGR relevance

This is constitutional for RGR:

> A geometric regularity inside a representation space is evidence about that representation space. It is not automatically evidence about lived human meaning.

### RGR standing

**Mandatory interpretive boundary.**

Sources: S37–S38.

---

## 1.17 Positive geometry, positive Grassmannians, and amplituhedra

### What exists

In planar scattering-amplitude physics, positive Grassmannians and amplituhedron/positive-geometry structures produce powerful reorganizations of calculations. Positive geometries are mathematical spaces with canonical forms recursively tied to boundaries.

### Legitimate RGR relevance

Only the following high-level questions legitimately transfer at RGR-01:

- Can boundaries define a global object?
- Can a complicated phenomenon admit a more natural global representation than a local decomposition?
- Can a Grassmannian arise for independent mathematical reasons in another domain?

### What does NOT transfer

No paper in this corpus provides a bridge from positive geometry to:

- consciousness;
- phenomenology;
- psychology;
- relational meaning;
- Spiralogic;
- MAIA.

### Threshold for future stronger use

A later RGR model would have to define, independently:

1. a positive domain;
2. its boundary stratification;
3. the relevant Grassmannian/projective object;
4. a canonical form or analogue with operational significance;
5. a prediction that simpler formalisms do not supply.

Until then, amplituhedron language is inspiration only.

### RGR standing

**Mathematically fertile inspiration; currently no evidential bridge.**

Sources: S39–S41.

---

# 2 · Comparison matrix

| Family | Representational object | Relation type | Transformation | Candidate invariant | Context | Trajectory | Local/global | Tractability | Main strength | Main limitation |
|---|---|---|---|---|---|---|---|---|---|---|
| Vector embeddings | vector | metric similarity / linear relation | linear/nonlinear map | distance/direction | weak unless encoded | weak | global shared space | very high | simple, scalable baseline | collapses multi-directional structure |
| Conceptual spaces | point/region in quality space | metric/domain relation | movement/projection | convexity/proximity/order | via domain weights | possible | mostly global | medium | psychologically interpretable geometry | dimensions/metrics theory-laden |
| Structure mapping | symbolic relational graph | predicate/system alignment | structure-preserving mapping | relational pattern | explicit relational context | possible | local-to-global alignment | medium | direct analogy baseline | representation engineering |
| Graph/hypergraph | nodes/edges/hyperedges | explicit relation | message passing / graph transform | topology/automorphism features | explicit edge/node context | possible | graph-global | high | native relation structure | metric geometry optional |
| Successor representation | transition-predictive matrix | expected future occupancy | policy/transition update | predictive similarity/eigenstructure | policy dependent | strong | global predictive map | high | causal/predictive account of maps | task/state-space dependent |
| Neural manifolds | low/high-dim population manifold | geometric proximity/flow | dynamical flow | manifold structure | task/internal state | strong | local/global | medium | models coordinated population states | manifold assumptions can overreach |
| Subspace/Grassmann | linear subspace | principal angles/intersection | rotation/projection/subspace map | orientation, dimension | through selected basis/data | moderate | global ambient space | high-medium | represents families of directions | linearity, non-uniqueness |
| Information geometry | probability distribution | divergence/statistical relation | statistical update | Fisher metric / dual structure | intrinsic to model family | possible | manifold-global | medium | canonical when objects are distributions | requires probabilistic semantics |
| Geometric deep learning | graph/manifold/group/gauge data | symmetry/equivariance | group/gauge-equivariant maps | invariant/equivariant features | domain structure | possible | local-global | high-medium | principled inductive bias | requires known/assumed symmetry |
| Sheaf | local vector spaces + maps | restriction/transport | local maps / sheaf morphisms | compatibility/cohomology | native | possible | explicitly local-to-global | medium-low | heterogeneous perspectives | hard to ground maps empirically |
| TDA | filtered simplicial complex | incidence/topology | filtration/deformation | persistence/homology | via metric/filtration | strong with dynamic TDA | multiscale global | medium | deformation-stable signatures | loses semantic/metric detail |
| Category/compositional | objects + morphisms | compositional relation | composition/functor | structural preservation | explicit | possible | compositional | medium-low | structure first, metric optional | abstraction/implementation burden |
| Positive geometry | positive region + canonical form | boundary stratification | projective/geometric operations | canonical form/boundary recursion | internal to region | not primary | strongly global | specialist | boundary-defined global object | no current semantic bridge |

---

# 3 · Strongest evidence supporting an RGR direction

## 3.1 Relational generalization has measurable representation geometry

S05 is the strongest direct evidence. In SimplifiedRPM, rule-equivalence manifolds and their geometry predict held-out rule generalization. Direct geometric optimization improves performance.

**RGR interpretation:** relational abstraction can have an empirically consequential geometry in learned representations.

**What it does not establish:** universal or phenomenological relational geometry.

---

## 3.2 Abstract relational knowledge can recruit map-like neural organization

S08–S10 and S14 show map-like, manifold, boundary, and reference-frame phenomena for abstract tasks.

**RGR interpretation:** "map" and "geometry" need not be limited to literal physical space.

**What it does not establish:** one natural coordinate system for lived meaning.

---

## 3.3 Relation-first cognitive theory predates the current geometry proposal

S03–S04 strongly support the basic shift from object identity to relational structure.

**RGR interpretation:** the relation-first premise is not dependent on Spiralogic or modern AI rhetoric.

**What it does not establish:** geometric formalization is superior to symbolic structure mapping.

---

## 3.4 Subspaces are empirically useful semantic objects

S21–S23 show that richer-than-vector semantic subspaces are computationally meaningful.

**RGR interpretation:** subspace/Grassmann methods deserve a fair RGR prototype.

**What it does not establish:** a stable universal concept subspace.

---

## 3.5 Local-to-global mathematics exists for heterogeneous representations

S27–S29 show that sheaf methods rigorously handle different local spaces connected by relation-specific transformations.

**RGR interpretation:** multi-perspective coherence has a real mathematical candidate beyond forcing all perspectives into one vector space.

**What it does not establish:** human perspectives instantiate sheaf axioms.

---

# 4 · Strongest evidence and arguments against a strong RGR thesis

## 4.1 Relational reasoning does not require continuous geometry

Structure mapping, graph networks, and neuro-symbolic methods can model relations directly.

If these methods match or outperform geometric methods, a strong geometry claim is unnecessary.

Sources: S03–S07.

---

## 4.2 Apparent geometry can be induced by transitions

Successor representations show that map-like structure can emerge from predictive occupancy/transition relations.

The primitive could be:

```text
transition relation
```

rather than:

```text
geometric space
```

Sources: S11–S12.

---

## 4.3 Low dimensionality is not universal

High-dimensional population codes can be structured and functional.

Source: S19.

RGR must not confuse "visualizable low-dimensional manifold" with "better representation."

---

## 4.4 Subspaces are not unique by default

S23 directly challenges naive concept-subspace realism.

If several different subspaces support comparable decoding/erasure behavior, RGR needs a criterion for representational identity beyond convenient linear separability.

---

## 4.5 Internal geometry is not grounded meaning

S37–S38 constrain the strongest semantic claim.

Even a perfectly organized representation space may reveal properties of the model's learned form rather than human communicative/lived meaning.

---

## 4.6 Representation itself is conceptually contested

S16–S17 distinguish sensitivity, specificity, invariance, functionality, and unresolved representation boundaries.

RGR must avoid:

```text
decodable
→ represented
→ meaningful
→ conscious
```

Each arrow requires evidence.

---

# 5 · Alternative non-geometric or differently-geometric formalisms

RGR-02 must keep at least these competitors alive.

## A. Structure mapping

Core object: relational predicate graph / system.

Strength:
- human analogy literature;
- explicit higher-order relations;
- systematicity.

Weakness:
- symbolic representation engineering;
- scaling/learning representations can be difficult.

## B. Graph/hypergraph models

Core object: explicit network.

Strength:
- native relation representation;
- scalable;
- high-order extensions available.

Weakness:
- geometry often implicit;
- systematic generalization remains architecture-dependent.

## C. Successor representation / predictive-state methods

Core object: transition-predictive matrix or predictive state.

Strength:
- trajectory/policy sensitivity;
- mechanistic cognitive-map account.

Weakness:
- requires defined state space;
- semantics beyond transition prediction not automatic.

## D. Symbolic/neuro-symbolic systems

Core object: predicates/rules/programs.

Strength:
- compositionality;
- systematic reasoning;
- explicit inference.

Weakness:
- grounding and representation acquisition;
- brittleness/scalability depending on design.

## E. Category/compositional models

Core object: morphisms/composition.

Strength:
- relational structure and compositionality without metric primacy.

Weakness:
- formal abstraction;
- empirical representation-learning bridge.

## F. Tensor/bilinear relation models

Core object: multi-linear binding / relation operators.

Strength:
- explicit role-filler/relational structure.

Weakness:
- dimensional cost;
- learned interpretability.

## G. Pure vector representation learning

Core object: vector.

Strength:
- simplest, scalable, strong empirical baseline.

Weakness:
- may conflate modes/directions and relational families.

---

# 6 · Grassmannian/subspace analysis: what we can actually claim

## 6.1 Established mathematics

A (k)-dimensional linear subspace of an (n)-dimensional vector space defines a point in the Grassmannian (Gr(k,n)).

Principal angles provide a rigorous way to compare two subspaces.

Given orthonormal bases (Q_U), (Q_V), singular values of (Q_U^T Q_V) are cosines of principal angles.

This is mathematics, not RGR speculation.

## 6.2 Established computational precedents

Sentence meaning and word-set semantics have been represented by low-rank subspaces with useful empirical performance on selected tasks.

## 6.3 RGR hypothesis

A relational state may be better represented by a subspace of admissible directions/variations than by one centroid vector.

## 6.4 Minimum valid future claim

If a subspace representation generalizes relations across held-out domains better than matched vector/graph/symbolic baselines, RGR could claim:

> For this task and representation pipeline, subspace orientation contains useful relational information not captured by the tested point-vector baseline.

It still could not claim:

> Meaning is a Grassmannian.

## 6.5 Key RGR-02 questions

- What generates the subspace basis?
- What fixes dimension (k)?
- Is (k) constant or variable?
- Which Grassmann metric is appropriate?
- Are principal angles stable across encoders?
- Does non-uniqueness undermine interpretation?
- Does nonlinear manifold structure outperform linear subspace structure?

---

# 7 · Sheaf/local-to-global analysis

## 7.1 Established mathematics

A cellular sheaf can attach different vector spaces to cells and maps along incidence relations.

Global compatibility is not identical to local equality.

## 7.2 RGR attraction

This directly supports a precise version of:

> two perspectives may be different locally yet coherent globally.

## 7.3 Candidate semantics

A future RGR-02 formalism might tentatively map:

```text
perspective / local context
→ stalk

relationship
→ restriction / transport map

compatible interpretation
→ local assignment satisfying consistency constraints

contradiction / obstruction
→ failure of global compatibility
```

This is currently **ENGINEERING_ANALOGY/HYPOTHESIS**, not established semantics.

## 7.4 Hard problems

- What empirically defines a perspective?
- Are local spaces vector spaces?
- How are maps learned/validated?
- Is global consistency psychologically desirable, or can meaningful tension be globally inconsistent?
- Should obstruction be treated as error, pluralism, or information?

## 7.5 RGR standing

Sheaf theory is probably the strongest candidate for multi-perspective structure, but it should not be the first empirical benchmark unless the task truly contains heterogeneous local coordinate systems.

---

# 8 · Cognitive-map neuroscience and the limits of spatial metaphor

## 8.1 What is supported

- abstract social/conceptual structures can recruit map-like codes;
- egocentric/allocentric frames can both participate;
- abstract boundaries can be represented;
- learned knowledge can organize on low-dimensional neural manifolds.

## 8.2 What is not supported

The literature does not show that:

- all concepts live in a stable Euclidean space;
- all semantic distances are spatial distances;
- hippocampal geometry is the ontology of thought;
- lived relational meaning inherits grid-cell geometry;
- cognitive-map signals are sufficient for consciousness.

## 8.3 Strong alternative reading

Map-like neural signatures may reflect:

- transition structure;
- predictive occupancy;
- task geometry;
- learned ordering;
- structured decision variables.

## 8.4 RGR implication

Use cognitive maps as evidence that **abstract relational structure can be geometrically organized**, not evidence that all meaning is spatial.

---

# 9 · Positive geometry/amplituhedron: bounded analysis

## 9.1 Established source fact

Positive Grassmannians and amplituhedron/positive-geometry constructions organize specific scattering-amplitude problems in planar gauge theory.

Positive geometries admit canonical forms determined recursively by boundary structure.

## 9.2 Why the analogy is intellectually attractive

RGR also cares about:

- global relational organization;
- boundaries;
- admissible regions;
- invariants;
- emergent structure.

## 9.3 Why the current bridge is insufficient

There is no defined RGR object corresponding to:

- positivity;
- external kinematic data;
- canonical differential form;
- residue/boundary recursion;
- physical amplitude.

Without such a mapping, "amplituhedron of meaning" is metaphor.

## 9.4 RGR standing

Current literature justifies only:

**SOURCE_OF_INSPIRATION / SPECULATIVE_CORRESPONDENCE.**

Anything stronger would violate RGR-00.

---

# 10 · Mathematical-prerequisite roadmap for RGR-02

RGR-02 will require enough mathematics to compare candidate formalisms without metaphor laundering.

## Tier 1 — required immediately

### Linear algebra
- vector spaces;
- inner products;
- orthogonal projections;
- SVD/eigendecomposition;
- rank;
- principal components;
- principal angles;
- canonical correlation;
- tensor products.

### Metric geometry basics
- metric spaces;
- norms;
- geodesic intuition;
- isometry;
- embeddings.

### Graph theory
- graphs, directed graphs;
- adjacency/Laplacian;
- paths;
- graph isomorphism/automorphism;
- hypergraphs.

### Probability/information basics
- probability distributions;
- KL divergence;
- entropy / mutual information;
- likelihood.

---

## Tier 2 — required for candidate formalization

### Differential geometry
- manifolds;
- tangent spaces;
- charts;
- Riemannian metrics;
- connections;
- curvature;
- geodesics.

### Grassmann geometry
- (Gr(k,n));
- Stiefel manifolds;
- principal-angle metrics;
- geodesics on Grassmannians;
- projection/chordal distances.

### Dynamical systems
- state spaces;
- flows;
- fixed points;
- attractors;
- trajectories;
- transition operators.

### Geometric deep learning
- symmetry groups;
- invariance/equivariance;
- message passing;
- gauge/local-frame ideas.

---

## Tier 3 — specialist candidates

### Sheaf theory
- presheaves/sheaves;
- stalks;
- restriction maps;
- sections;
- cellular sheaves;
- cohomology;
- sheaf Laplacians.

### Algebraic topology / TDA
- simplicial complexes;
- homology;
- filtrations;
- persistent homology;
- stability.

### Information geometry
- Fisher metric;
- statistical manifolds;
- dual affine connections;
- divergence functions.

### Category theory
- categories;
- functors;
- natural transformations;
- monoidal categories;
- compositional semantics.

### Positive geometry
- projective geometry;
- Grassmannians;
- positivity;
- stratification;
- differential forms;
- residues;
- canonical forms.

Positive geometry is lowest priority for RGR-02 unless a concrete mapping emerges.

---

# 11 · Unresolved foundational questions

1. **What exactly is the primitive RGR object?** Event, state, relation, pattern, subspace, graph, distribution, or transformation?
2. **Is relation primitive or derived?**
3. **What is the domain of a transformation?**
4. **What counts as invariance: exact, approximate, statistical, topological, ordinal?**
5. **What is a perspective operationally?**
6. **Should perspectives share an ambient space?**
7. **When is distance meaningful?**
8. **Does relational equivalence require a metric at all?**
9. **Is geometry explanatory or merely descriptive?**
10. **Can transition structure generate the geometry RGR wants?**
11. **What role does trajectory/history play beyond current state?**
12. **Can a relation have orientation/chirality that point embeddings lose?**
13. **How should contradiction be represented: distance, obstruction, incompatible mapping, competing model?**
14. **What empirical task genuinely requires heterogeneous local perspectives?**
15. **How do we ground relation labels without circularly defining the benchmark?**
16. **What would constitute evidence against geometry as the primary formalism?**
17. **What representation remains stable across different encoders/models?**
18. **How much of apparent geometry is an artifact of dimensionality reduction?**
19. **How do we prevent benchmark labels from baking the desired invariant into the task?**
20. **How should first-person meaning enter any eventual empirical programme without being reduced to model labels?**

---

# 12 · Smallest candidate formal vocabulary for RGR-02

RGR-01 recommends keeping RGR-02 smaller than the full poetic vocabulary.

The minimum formal set should be:

## 1. ENTITY / STATE
A declared representational object.

## 2. RELATION
A typed relation among two or more objects.

## 3. TRANSFORMATION
A declared map that changes representation or relational configuration.

## 4. EQUIVALENCE / INVARIANT
A declared property preserved under a specified transformation family.

## 5. CONTEXT
A variable/condition that changes relation, metric, transition, or interpretation.

## 6. PERSPECTIVE
A local representational frame with an explicit observational/encoding rule.

## 7. TRAJECTORY
An ordered sequence/path through states or relations.

## 8. BOUNDARY
A declared admissibility/extremal/partition condition.

## 9. COMPATIBILITY
A relation among local descriptions that does not require identity.

## 10. OBSTRUCTION
A formal failure of compatibility or extension.

Terms to defer until a model actually needs them:

- field;
- connection;
- curvature;
- gauge;
- canonical form;
- positive geometry;
- elemental operator.

This prevents metaphor from outrunning mathematics.

---

# 13 · Recommendations for RGR-02

RGR-01 recommends that RGR-02 compare **four candidate representation families**, not choose one:

### Candidate A — vector/relational baseline
Simple embeddings plus explicit relation operators.

### Candidate B — graph/structure model
Entity-relation graph with structure-preserving mappings.

### Candidate C — subspace/Grassmann model
Relations or contexts represented as low-rank subspaces with principal-angle comparison.

### Candidate D — local-to-global model
Sheaf-like perspective spaces and compatibility maps, initially formal only.

Trajectory/predictive representation should cut across A–D as a separate axis.

Information geometry and topology should be held as analytic tools until a task specifically requires them.

Positive geometry should remain outside the first formal model unless a genuine mathematical mapping is discovered.

---

# 14 · Proposed smallest RGR-03 question

RGR-01 recommends that the first falsifiable empirical question eventually be:

> **When surface entities and features change but a relational rule is preserved, does a subspace/relational representation generalize the rule across held-out domains better than matched point-vector and graph/structural baselines?**

Why this question:

- it is narrow;
- it has literature precedent;
- it can use synthetic data;
- it does not require human private data;
- it separates relation from surface content;
- it can falsify subspace advantage;
- it does not presuppose Spiralogic;
- it creates a legitimate bridge to Grassmannian mathematics.

RGR-03 is not authorized here.

---

# 15 · Strongest current interpretation

The current evidence supports this **RGR_INTERPRETATION**:

> Relational reasoning appears to benefit from representations that preserve structured equivalence across changing surface realizations. Geometry is one empirically supported language for characterizing those representations, particularly through manifolds, subspaces, invariance, and structured compression. However, relation-first symbolic, graph, predictive, and compositional accounts remain serious alternatives. The research question should therefore concern comparative explanatory and generalization power, not whether geometry is metaphysically fundamental.

---

# 16 · WHAT THE CURRENT LITERATURE DOES NOT ESTABLISH

The current literature does **not** establish that:

1. meaning is fundamentally geometric;
2. consciousness is a geometric manifold;
3. human relationships occupy a single shared metric space;
4. lived meaning can be recovered from neural or language-model representations alone;
5. low-dimensionality is universal or superior;
6. one concept has one unique neural/model subspace;
7. the hippocampal cognitive-map literature generalizes directly to relational phenomenology;
8. grid-like coding means all abstract thought is spatial;
9. trajectory is necessary for all meaning;
10. sheaves are the correct mathematical ontology of perspectives;
11. Grassmannians are the correct ontology of concepts;
12. information geometry applies without explicit probabilistic semantics;
13. topological persistence corresponds directly to psychological significance;
14. category theory or geometric deep learning establishes semantic grounding;
15. positive geometry applies to cognition;
16. the amplituhedron is a model of consciousness or meaning;
17. quantum theory validates Spiralogic;
18. Spiralogic or Elemental Alchemy has been empirically validated by this literature;
19. Fire, Water, Earth, Air are mathematical coordinates or operators;
20. Weather is a mathematical field, metric, connection, or contextual tensor;
21. MAIA should incorporate RGR;
22. any RGR model should be deployed;
23. a geometric benchmark result would establish personal or clinical truth.

---

# 17 · RGR-01 standing before independent challenge

Deliverables completed in candidate form:

1. curated source corpus — YES;
2. annotated literature map — YES;
3. claim ledger — YES;
4. candidate-term glossary — YES;
5. comparison matrix — YES;
6. strongest supporting evidence — YES;
7. strongest counterevidence/arguments — YES;
8. alternative non-geometric formalisms — YES;
9. Grassmannian/subspace analysis — YES;
10. sheaf/local-to-global analysis — YES;
11. cognitive-map neuroscience limits — YES;
12. positive-geometry/amplituhedron boundary analysis — YES;
13. mathematical-prerequisite roadmap — YES;
14. unresolved foundational questions — YES;
15. smallest RGR-02 candidate vocabulary — YES;
16. WHAT THE CURRENT LITERATURE DOES NOT ESTABLISH — YES.

Next required RGR-01 act:

```text
independent local challenge
        ↓
source/provenance corrections
        ↓
RGR-01 closure candidate
        ↓
Founder adjudication
```

RGR-02 remains closed.

---

# 18 · Independent challenge + source-grounding adjudication

RGR-01 required one routed primary review and one independent local challenger review against the same bounded research packet.

The review packet contained:

- `RGR-01_LITERATURE_MATHEMATICAL_LANDSCAPE_2026-09-18.md`;
- `RGR-01_CLAIM_LEDGER_2026-09-18.md`;
- `RGR-01_SOURCE_CORPUS_2026-09-18.md`;
- the governing RGR-00 epistemic rules;
- explicit instructions to identify overstatement, source-grounding failure, missing alternatives, formalism errors, and constitutional violations.

The packet was identical for both local reviewers.

## 18.1 Routed primary — GPT-OSS

Provider/model:

```text
provider: gpt-oss-local
model:    gpt-oss:20b
role:     deep_reasoning_primary
```

Returned disposition:

```text
VERDICT: RETURN
```

It raised four requested corrections.

### Finding A — CL-14 / sheaf mathematics

The review claimed CL-14 improperly treated the application of sheaf theory to heterogeneous human perspectives as established.

Source-grounding inspection shows CL-14 actually states:

> Cellular sheaves can represent heterogeneous local state spaces with relation-specific maps and characterize local-to-global consistency.

That is a mathematical/computational statement grounded in S27-S29.

The **application to perspectives** is separately isolated in CL-21:

```text
Class: HYPOTHESIS
```

Disposition:

```text
EVIDENCE-INVALID
```

### Finding B — CL-24 / CL-25 lack source support

The review objected that Spiralogic/Weather claims lack external source support.

Both records already state:

```text
Class: HYPOTHESIS
Support basis: PHENOMENOLOGICAL_ORIGIN + RGR interpretation
```

RGR-00 explicitly permits phenomenological origins to generate later falsifiable hypotheses while prohibiting their treatment as established evidence.

Disposition:

```text
EVIDENCE-INVALID
```

### Finding C — S07 missing stable identifier

The review stated that S07 lacked an arXiv identifier.

The corpus already records:

```text
arXiv:2407.17396
```

Disposition:

```text
EVIDENCE-INVALID
```

### Finding D — S05 may be hypothetical/future

The review questioned whether the 2026 Shang/Kreiman/Sompolinsky paper exists.

Independent public-source verification confirms:

```text
Scientific Reports 16:22146 (2026)
DOI 10.1038/s41598-026-47123-3
published 07 May 2026
```

The corpus has been tightened to include the DOI.

Disposition:

```text
EVIDENCE-INVALID
```

### GPT-OSS standing

```text
review attempt: VALID
verdict: RETURN
substantive source-grounded required corrections: NONE
four findings: EVIDENCE-INVALID
```

The RETURN is preserved as evidence. It is not rewritten into ACCEPT.

---

## 18.2 Independent challenger — Qwen

Provider/model:

```text
provider: qwen-local
model:    qwen3-coder:30b
role:     independent_local_challenger
```

Returned disposition:

```text
VERDICT: ACCEPT
```

It nevertheless attached four "required corrections."

### Finding A — CL-20 overstates Grassmannian/subspace status

Source-grounding inspection shows CL-20 explicitly states:

```text
Class: HYPOTHESIS
Required future test:
compare against vector, graph, symbolic,
and other subspace baselines
```

and explicitly says the claim does **not** establish that concepts or lived meanings are Grassmannian points.

Disposition:

```text
EVIDENCE-INVALID
```

### Finding B — subspace methods receive unjustified privileged status

The landscape says:

```text
Top candidate for an early formal prototype, but not privileged.
```

Immediately preceding this standing are explicit cautions:

- concept subspaces need not be unique;
- estimator choice changes the result;
- dimension is a modeling choice;
- nonlinear structure may outperform linear subspaces;
- a successful benchmark would not establish Grassmannian ontology.

The final RGR-02 recommendation also retains four competing representation families rather than selecting subspaces.

Disposition:

```text
EVIDENCE-INVALID
```

### Finding C — positive geometry relevance overstated

The positive-geometry section explicitly states:

```text
No paper in this corpus provides a bridge from positive geometry to:
consciousness
phenomenology
psychology
relational meaning
Spiralogic
MAIA
```

and concludes:

```text
amplituhedron language is inspiration only
```

Disposition:

```text
EVIDENCE-INVALID
```

### Finding D — "insufficient evidence for a unified theory" is incorrect framing

The executive finding says the literature justifies a **research programme** but does not converge on one ontology or one mathematics of meaning.

This is a restraint statement, not a requirement that RGR ultimately become unified.

The remainder of the package explicitly recommends comparative formalization among multiple competing families.

Disposition:

```text
EVIDENCE-INVALID
```

### Qwen standing

```text
review attempt: VALID
verdict: ACCEPT
substantive source-grounded required corrections: NONE
four requested corrections: EVIDENCE-INVALID
```

---

## 18.3 Independent bibliographic corrections

Independent of either model's substantive findings, source verification identified shorthand bibliography entries that could be made more reproducible.

The corpus was therefore tightened with exact source metadata for:

- Mark et al. (2020), DOI `10.1038/s41467-020-18254-6`;
- Esposito et al. (2025), DOI `10.1038/s41467-025-57644-6`;
- Chazal & Michel (2021), DOI `10.3389/frai.2021.667963`;
- Brown & Farivar (2025), DOI `10.3389/fnins.2025.1597899`;
- Zhang et al. (2023), DOI `10.1038/s41593-022-01212-4`;
- Shang, Kreiman & Sompolinsky (2026), DOI `10.1038/s41598-026-47123-3`.

These are editorial provenance improvements.

They do not alter the substantive RGR-01 interpretation.

---

# 19 · Research provenance record

## 19.1 Evidence population

RGR-01 used:

```text
public scholarly sources
public books/reference metadata
public journal articles
public preprints
public conference proceedings
public technical literature
```

It did not use:

```text
member conversations
client material
PHI
Sanctuary content
production memory
private journals
private family material
production embeddings
```

## 19.2 Retrieval date

```text
2026-09-18
```

## 19.3 Research-source policy

Priority was given to:

1. peer-reviewed primary articles;
2. primary books/monographs from scholarly publishers;
3. original conference proceedings;
4. original arXiv/preprint records where publication was not the research claim;
5. authoritative indexing records for bibliographic verification.

Secondary summaries were not used as the basis for strong RGR claims where a primary source was available.

## 19.4 Claim discipline

Source facts remain distinguishable from:

```text
RGR_INTERPRETATION
HYPOTHESIS
ENGINEERING_ANALOGY
PHENOMENOLOGICAL_ORIGIN
SPECULATIVE_CORRESPONDENCE
```

No claim was promoted merely because multiple fields use similar geometric vocabulary.

## 19.5 Review provenance

```text
primary local review:
  gpt-oss:20b
  routed role: deep_reasoning_primary
  returned: RETURN
  source-grounded substantive corrections: 0

independent challenger:
  qwen3-coder:30b
  routed role: independent_local_challenger
  returned: ACCEPT
  source-grounded substantive corrections: 0
```

The review disagreement is retained rather than collapsed:

```text
GPT-OSS: RETURN
Qwen:    ACCEPT
```

But there is no surviving substantive disagreement after source-grounding because the requested corrections from both reviews are contradicted by the inspected packet or independently verified sources.

---

# 20 · RGR-01 closure candidate standing

After literature synthesis, independent challenge, source-grounding adjudication, and bibliographic provenance correction:

```text
16 Founder-required deliverables: COMPLETE

public source corpus:
  COMPLETE

claim-classified ledger:
  COMPLETE

strong alternatives:
  INCLUDED

Grassmann/subspace analysis:
  COMPLETE · HYPOTHESIS-BOUNDED

sheaf/local-to-global analysis:
  COMPLETE · HYPOTHESIS-BOUNDED

cognitive-map limits:
  COMPLETE

positive-geometry boundary:
  COMPLETE · INSPIRATION ONLY

mathematical prerequisite roadmap:
  COMPLETE

independent local challenge:
  COMPLETE

source/provenance correction:
  COMPLETE

RGR-02:
  CLOSED

Elemental Operator hypothesis:
  CLOSED

MAIA alteration:
  NONE

deployment:
  NONE
```

The package is ready to be sealed as an RGR-01 closure candidate for Founder adjudication.

No successor gate is opened by this standing.
