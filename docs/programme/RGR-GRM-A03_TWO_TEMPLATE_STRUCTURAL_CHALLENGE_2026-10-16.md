# RGR-GRM-A03 — Two-Template Relational-Composition Challenge

**Date:** 2026-10-16
**Programme:** Existing RELATIONAL-GEOMETRY-REASONING research programme
**Standing:** DOCUMENTARY / HAND-AUTHORED FIXTURE DESIGN CANDIDATE; NOT PREREGISTERED; NOT FOUNDER-ADJUDICATED
**Immediate parent:** GRM-A02 candidate commit `9780af3387aa0015299b96069c90b4cd2a31a18c` (draft PR #1834)
**History:** GRM-A01 draft PR #1833, GRM-01 draft PR #1832; each remains a separate unmerged research-design candidate
**Exact scope:** one new fixed eight-vertex mathematical pair, source/guard tests and documentary review. NO experiment population, prose renderer, dataset generator, model, training, TEST, REPLICATION, MAIA or deployment.

## 1. Why another pair is worth defining—but not yet worth treating as an experiment

The preceding A01 four-node cycle-versus-reciprocal-pairs task can be solved by simple connectivity. A02 tightened the contrast: same directed graph, same per-vertex typed degrees and aggregate two-hop label counts, but a different source-anchored typed three-step relation. Its mathematics passed, yet **one six-node 2×2 P/Q checkerboard** cannot support a meaningful out-of-domain structural generalization claim.

A03 introduces a **different-sized and differently connected eight-node 3×3 P/Q/R Latin-square motif**, with the *same fixed semantic predicate*: does source s reach target t via exactly three directed edges labeled OPEN, P, ACK in order?

This provides a second **distinct graph topology**. But the two motifs still share the deeper **typed-label-permutation mechanism**. Both put an OPEN-labeled source edge through a bipartite typed middle stage toward an ACK-labeled exit. Therefore A03 *does not* give two independently generated relationship families, nor an estimate of model ability to transfer to genuinely different causal/relational rules.

## 2. Three-by-three fixed graph

Let the vertices be:

```text
V = {s, a, b, c, u, v, w, t}
```

Both worlds have exactly sixteen directed arcs and the **same untyped adjacency**.

**Unchanged arcs (seven):**

| Arc | Type |
|---|---|
| s→a | OPEN |
| s→b | CLOSED |
| s→c | WAIT |
| u→t | ACK |
| v→t | IGNORE |
| w→t | DEFER |
| t→s | RESET |

The labels WAIT, IGNORE, DEFER, RESET are purely **synthetic edge types**, not psychological Weather or patient states.

**Nine-arc middle block (from a,b,c to u,v,w):**

Positive \(G_+\):

| From \ To | u | v | w |
|---|---|---|---|
| a | P | Q | R |
| b | Q | R | P |
| c | R | P | Q |

Negative \(G_-\):

| From \ To | u | v | w |
|---|---|---|---|
| a | Q | R | P |
| b | R | P | Q |
| c | P | Q | R |

The negative differs by a **cyclic reassignment of P/Q/R on all nine existing middle arcs**. Each middle-layer source has exactly one P, one Q and one R outgoing edge; each middle-layer destination has exactly one P, one Q and one R incoming edge in *both* worlds.

### Exact target truth table

\[
r(G;s,t) = 1 \quad\text{iff}\quad \exists x,y:(s,x,\mathrm{OPEN})\land(x,y,P)\land(y,t,\mathrm{ACK}).
\]

- **G+: YES.** The unique matching path is s→a [OPEN], a→u [P], u→t [ACK].
- **G−: NO.** The OPEN edge leads to a; in the negative, a→u carries Q, and the P edge from a goes to w, whose exit carries DEFER. Other P→ACK occurrences are reached by CLOSED or WAIT rather than OPEN.

Each world has paths, but only the positive world composes the three *correctly aligned* roles. This is a target of an **exact finite typed-graph predicate**, not a diagnosis or a literal measure of lived meaning.

## 3. Matched properties and exact limits

For the fixed positive/negative pair, the following **are equal**:

- The full untyped directed edge set: **8 vertices, 16 distinct nonloop arcs** in each.
- In/out degree and **every named vertex's typed incoming and outgoing degree counts**.
- Global edge-label multiset; lexical unigram bag of canonical [source,type,destination] clauses.
- Global **endpoint-free** two-hop adjacent edge-type label histogram.
- Full strong connectivity: from any vertex one can reach t, then s, then every source/middle/exit vertex; zero reciprocal arc pairs.

**Do not count those as independent experimental discoveries.** Because typed-degree counts agree at every vertex, equality of global two-hop type-label counts follows by the algebraic identity

\[
B_{ij} = \sum_{v\in V} d_i^-(v)\,d_j^+(v).
\]

The untyped graph's equality is the defining construction, not additional evidence. **Endpoint-anchored two-hop paths are not equal**, nor are the exact typed triples. For example, in G+, the source-anchored OPEN→P route ends at u; in G− it ends at w. An ordinary exact symbolic typed-graph traversal obtains the answer perfectly.

The fixed A02 and A03 graphs **cannot be graph-isomorphic** (6 vs. 8 vertices, 9 vs. 16 arcs), and their middle blocks have different arities and type alphabets. But both use bipartite label permutations, leaving a shared mechanism shortcut. A cross-template model trained on one and tested on the other could exploit that mechanism; a favorable result would not establish general human relational invariance.

## 4. Fair information-access study design (future, not executable)

As in GRM-A01/A02, **all representations get the same admitted raw inputs**: the same number of complete, unambiguous texts expressing every arc and the same fixed query. The experiment designer would have to decide/freeze whether four whole-graph renditions are scientifically defensible; A03 does not create those renditions.

The gold adjacency, type table, construction flags, scenario root, hidden label, domain ID and exact graph oracle are **evaluator-only**. A source-aware grammar parser given private generator rules is *privileged*, unless all methods receive those rules in separately labeled matched conditions.

The future design must compare:
- lexical all-views / label-frequency and clause-order controls;
- pooled point vector embeddings of **all** views (same encoder);
- a strong multiview non-geometric/set comparator using the same observations and tuning budget;
- source-text-to-typed-graph extraction followed by exact symbolic three-hop traversal;
- the candidate Grassmann/subspace representation with declared encoder, centering, \(k,n\), SVD/rank tolerance, principal-angle metric and stable training-only preprocessing;
- a suitable same-information generic neural model;
- an **oracle-only** gold-graph solver as upper reference, not a fair model competitor.

A hypothetical positive Grassmann effect must exceed **all** strong equal-observation baselines under a preregistered, multiplicity-aware and root-clustered uncertainty contract. The exact symbolic graph solver already has perfect accuracy on the hidden source graph. A label/role or lexicon cue on rendered text would invalidate the proposed comparison.

## 5. What an adequate next design would require

A03 is a **two-template feasibility reference**, not even a minimal scientifically interpretable text benchmark. A separate design must address all of the following:

1. An independently constructed **third relation family whose distinguishing intervention is not another P/Q/R checkerboard or global label permutation**. That is a *design request*, not authorization to generate one.
2. Within each family, several genuinely distinct instances with noncosmetic topology/role differences; a concrete proof of existence of balanced counterfactuals before setting sample quotas.
3. Strict test separation by source scenario/root, template *family*, role cast, paraphrase sibling and domain, with counterfactual pairs inseparable across splits. With only one pair per family, no held-out experiment is presently possible.
4. A source-reviewed natural-language renderer with unambiguous roles, genuinely distinct domains, matched lexical/length/sentence features and no target leakage in filenames/metadata.
5. Strong information-parity vector, multiview, generic, symbolic graph-extraction and geometry candidates; a gold-graph oracle declared privileged.
6. A single primary target/estimand and prospective frozen \(\delta_{\min}\), competence floor, root-cluster uncertainty, familywise contrast procedure, multiplicity, calibration, stopping and negative-result custody.
7. Distinct research and Founder acts for code/dependency/weights review, corpus/benchmark materialization, training, TEST, REPLICATION and any eventual MAIA relevance review. None is authorized here.

The established RGR-03 falsification law remains: **relation-preserved under surface changes AND relation-broken under matched surface**. The September frozen RGR-04/06 rules and TEST/REPLICATION partitions are protected. The separate October RGR-05B Flow sampler's frozen-budget failure remains a failure, not retroactively solved by these constructive fixed examples.

## 6. Scientific meaning and rights boundary

The pair is **mathematical proof of two explicit assignment outcomes only**. It is not an experimental claim about a model, a sheaf, Grassmannian meaning, embodied consciousness, Burger/Stone physiology, psychoanalysis, telepathy, Weather, Elemental Alchemy, or spiritual truth.

Sophontic's public perturbation claims and the academic Zhou et al. "Geometry of Reasoning" literature are kept as distinct source traditions, not direct provenance of the team-authored Latin square.

**Disposition:** retain A01 as elementary calibration; retain A02's 2×2 typed-composition control; add A03's 3×3 arity challenge **for independent scientific critique only**. No numbered canonical RGR gate was opened. No renderer, synthetic experimental corpus, neural model, dataset, member information, external provider, production migration, merge or deployment is created by A03.
