# RGR-GRM-A03 — Adversarial Two-Template Review

**Date:** 2026-10-16
**Review type:** Assistant-authored source-grounded formal-design critique; **NOT** independent human scientific review or Founder adjudication
**Standing:** RETURN_FOR_SPECIFICATION; no accepted preregistration, hypothesis-support verdict, benchmark or test authorization
**Exact source parent:** `9780af3387aa0015299b96069c90b4cd2a31a18c` (A02 draft PR #1834)
**Ancestor research candidates:** A01 draft PR #1833 and GRM-01 draft PR #1832

## Review of the important differences

| Testable distinction | A02 source case | A03 proposed case | Legitimate inference |
|---|---|---|---|
| Number of nodes and edges | 6 / 9 | 8 / 16 | Not graph-isomorphic; structurally distinct sizes and degrees |
| Bipartite typed middle stage | 2×2 | 3×3 | Stronger arity/alphabet variation |
| Middle-stage labels | P,Q | P,Q,R | More local type possibilities, still explicit |
| Label-changing mechanism | Checkerboard P↔Q | Cyclic P→Q→R→P | **Same general permutation family**, not unrelated causality |
| Global bare graph across pair | Identical | Identical | Basic graph-topology shortcut cannot distinguish within each pair |
| Per-node typed degrees across pair | Matched | Matched | Local typed marginals cannot alone explain target change |
| Global 2-hop type-label histogram | Matched | Matched | Mathematical consequence of typed degrees, NOT independent proof |
| Source-anchored 2-hop endpoints | Different | Different | Endpoint continuity is crucial; no claim of full local equality |
| Typed OPEN,P,ACK path | 1 in G+, 0 in G− | 1 in G+, 0 in G− | Exact typed compositional predicate, fully solvable by symbolic algorithm |
| Language/model comparison | Not performed | Not performed | No superiority, transfer or human-meaning conclusion |

## High-priority potential defeats

1. **Shared mechanism disguised as independent families.** K₂,₂ and K₃,₃ are different directed network structures and label alphabets, but both use checkerboard/Latin permutation of bipartite arc labels. No honest report may call them independent-generating mechanisms. A model could simply learn this motif.
2. **Gold symbolic oracle perfect.** An exact typed-graph parser/solver returns the target on either family. A learned method tested on only two hand-authored graphs cannot demonstrate representational superiority; it cannot support claims that subspace geometry is a necessary reasoning architecture.
3. **Ambiguity of "local invariants".** Per-vertex type-degree equality implies the **unanchored** two-hop label-count equality through \(B_{ij}=\sum_v d_i^-(v)d_j^+(v)\). Counting both as separate protective conditions exaggerates the proof. Endpoint-conditioned two-hop evidence is *not* matched.
4. **Surface task is still entirely hypothetical.** Four complete narratives per graph, an encoder, lexicon, held-out domains, tokenizer, pretrained weights, train/validation/test split, fixed metric, confidence procedure and actual strong models have *not* been constructed or selected.
5. **False higher-order meaning inference.** Typed paths over synthetic symbols are graph facts, not beliefs about a member, third party, body, emotion, dream image, or metaphysical consciousness.
6. **Parent-doc scope conflicts.** A02's exact file allowlist intentionally refuses new A03 paths. It must continue to pass in its original A02 worktree, not be weakened or trivially bypassed in the A03 child.
7. **Prototype/reference difference.** A static JS fixture checker does not constitute a research prototype measuring learned representations. Pair count is two worlds per template, with no statistical independence.
8. **Source corpus contamination.** Source comparisons and this pair are *not* an authorized RGR-04/06 benchmark amendment. H-RT1 remains empirically unestablished; RGR-07 is unopened.
9. **One-sided no-rescue danger.** A disappointing outcome for one family cannot authorize dropping that family, adding prompts, selecting encoder rank on TEST, reallocating quotas or reporting only the favorable subgroup.
10. **Sophontic confusion.** Sophontic's publicly claimed compact-model geometry and load-bearing perturbations are not an experimental method used in A03. The independent academic “Geometry of Reasoning” trajectory research is not Sophontic's proprietary training method.
11. **Need non-permutation mechanism.** A stronger future test needs at least one independently designed and independently reviewed relation-changing intervention which is not a P/Q/R permutation on a complete bipartite middle block. This request does **not** authorize constructing a new benchmark.
12. **Library and Kelly's World standing.** Research orientation and document custody do not promote a source to a member-facing corpus, a canonical W2 Work Unit, model memory, MAIA reasoning, or a runtime action.

## Source hierarchy and provenance

- RGR-00 (September 18): relation is the inquiry, geometry a *candidate* language rather than a predetermined answer.
- RGR-01: conceptual-spaces, analogy/structure-mapping, subspace/Grassmann, sheaf, neural/social maps and alternative frameworks; the cross-domain subspace-versus-vector/graph test was already proposed.
- RGR-02: ten formal primitive headings and optional earned geometric enrichment; Flow is not automatically #11.
- RGR-03: relation-preserving transfer AND relation-breaking sensitivity, matched inputs, strong comparators and no rescue.
- RGR-04/06: separate frozen September two-step benchmark and confirmatory implementation lock; no earned empirical H-RT1 support.
- October RGR-05A/B: derived FLOW_D design and separately recorded bounded sampler failure.
- RGR-CF01 / RGR-EVAL-CAUSAL-01: separate October research/method-design intakes.
- GRM-01/A01/A02: distinct stacked candidate documents and finite mathematical witnesses, not merged and not authorized for neural experimental evaluation.

## Disposition and exact next gate

A03 is justified as a **design contrast**: it demonstrates the same typed-path truth pattern in a larger non-isomorphic graph with stronger arity control. It is *not* sufficient for a preregistration. A scientifically adequate next design would have to state a formal third family with a genuinely different intervention mechanism, and then independently check whether textual expression and model comparisons are plausible and nontrivial.

**Candidate review outcome: RETURN_FOR_SPECIFICATION.** This is a methodological recommendation by the assistant, not an independent external human's acceptance or rejection, a Founder instruction to execute, or a canonical RGR gate promotion.

No training, provider call, generated population, member data, corpus admission, MAIA runtime changes, schema, merge or deployment is permitted by this packet.
