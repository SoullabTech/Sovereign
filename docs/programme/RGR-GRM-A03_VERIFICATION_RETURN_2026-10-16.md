# RGR-GRM-A03 — Bounded Design Verification Return

**Date:** 2026-10-16
**Standing:** FIXED-MATHEMATICAL-WITNESS PASS; DOCUMENTARY DESIGN CANDIDATE ONLY
**Exact source parent:** `9780af3387aa0015299b96069c90b4cd2a31a18c` (unmerged A02 draft PR #1834)
**Research authority:** NONCANONICAL / NOT FOUNDER ADJUDICATED / NOT PREREGISTERED / NOT EXECUTION AUTHORIZED
**Independent human reviewer:** NONE; assistant-authored methodology/attribution review is not peer review.

## 1. Mathematical witness result

The A03 pair adds two **explicitly authored** graph worlds on eight vertices and sixteen directed arcs each, with a 3×3 P/Q/R Latin-style middle layer. The entire untyped graph and all named per-vertex typed in/out degrees are identical. Both are strongly connected and have no reciprocal arcs.

The positive graph has one exact source s → target t path with ordered labels OPEN → P → ACK, namely s→a→u→t. The negative graph's cyclic P/Q/R reassignment blocks the anchored triple while preserving each vertex's type marginals and unanchored two-hop label counts. The negative still has OPEN→P and P→ACK fragments individually, but they do not compose through one consistent pair of intermediate vertices.

**Important correction:** equality of the global endpoint-free two-hop label histogram is a mathematical **corollary** of equal typed vertex degrees:

\[
B_{ij}=\sum_{v\in V} d^-_i(v)\,d^+_j(v).
\]

It is *not* independent evidence. Endpoint-anchored two-hop destinations are different (u vs. w), and an exact symbolic typed-graph traversal is sufficient to classify both worlds perfectly.

## 2. Recorded verification

Run from the isolated GRM-A03 worktree:

```text
node --test tests/constitutional/rgr-grm-a03/latin-three-template.test.mjs
21 tests passed, 0 failed
```

Checks cover the exact 8/16 shape, bare adjacency, per-node typed degrees, P/Q/R Latin row-and-column assignments, cyclic type reassignment, global type/lexical/2-hop bags, algebraic derived histogram, anchored two-hop endpoints, complete typed three-hop predicate, strong connectivity, zero reciprocal arcs, distinct source template size, all 8! actor renamings, edge-order invariance, invalid single-edge mutation, strict input refusal, static pure/no-I/O boundary, protected source/canon hashes, exact change-path allowlist, document source binding and denied experimental authority.

A **separately written one-off Python calculation**, not importing the Node source or calling any learned model, independently recovered:
- 8 nodes, 16 arcs, identical untyped edge set;
- identical per-node typed in/out degrees and global two-hop type histograms;
- exactly **1** OPEN,P,ACK anchored path in G+ and **0** in G−;
- invariance under **40,320** coherent vertex permutations.

The 40,320 are mathematical symmetry checks of the *same two fixed worlds*, not an experimental dataset, independent roots, held-out examples or learned-model validation.

A preliminary run passed 20/21 because an exact documentary test expected literal "NOT independent human" while the source note correctly used Markdown bold **NOT**. The assertion was corrected to match the actual preserved wording; no model or scientific result was changed. The candidate standing was then updated to explicitly distinguish **fixed-toy math verified** from all empirical claims, and the final suite passed 21/21.

## 3. No historical mutation

The child branch is based on the exact A02 commit. An A03-specific guard confirmed **29 parent/canonical source artifacts byte-identical**, including GRM-01, A01 and A02 source/test contracts and the September RGR-00 through RGR-06 records. The candidate differs only in its **six declared files**.

The parent A02's exact source-scope guard is designed to refuse extra A03 paths when run *inside the child*; do not weaken that historical guard. The inherited A02, A01 and GRM-01 suites must pass separately in their respective original worktrees.

The A03 work proves no benchmark/engine success, and does not amend RGR-04's separately frozen six-node, eight-edge two-step task, September RGR-06's closed implementation lock, October RGR-05B's frozen-budget sampler failure or the RGR-CF01/RGR-EVAL-CAUSAL-01 method intakes. RGR-07 remains unopened.

## 4. Scientific adequacy remains RETURN_FOR_SPECIFICATION

A02 and A03 have different sizes and non-isomorphic untyped graphs (6/9 and 8/16), different type alphabets and different switch arities (2×2 and 3×3). **They share the same fundamental bipartite label-permutation intervention.** A model could recognize this common motif, so a favorable comparison on those two fixed templates would not show general relational transfer. No model comparison was performed.

A future design must show a truly different non-permutation relation-changing construction; prove its paired instances are feasible independently; establish source-verified text rendering, leakage/group/domain controls and fair same-input vector, multiview, symbolic and Grassmann competitors; and freeze the primary metric, minimum meaningful effect, uncertainty, calibration, stopping and replication rules before any experiment. A perfect source-graph oracle remains a privileged ceiling, never a fair text-only learned comparator.

Even such a future result could at most support a narrow empirical claim about a declared task/representation pipeline. It would not prove consciousness is geometric, that a person’s meaning has one global section, or that Elemental Alchemy/Weather are physical operators.

## 5. Preserved no-execution covenant

**No benchmark examples or generator, prose renderer, neural weights, training, local/external model inference, private/member/clinical/manuscript data, provider spend, TEST, REPLICATION, MAIA/Writer’s Studio changes, schema/migration, canonical gate promotion, merge or deployment.** Only versioned documentary research and explicitly authored pure graph fixtures were tested.

**Disposition:** A03 is an inspectable **mathematical design challenge** to A02. It is ready for independent source/method critique, **not** for any learned-model experiment or human-use interpretation. The next lawful step is a genuine independent review and a separate Founder decision on designing a third non-permutation relation family, not execution.
