# RGR-GRM-A04 — Bounded Verification Return

**Date:** October 16, 2026
**Standing:** FIXED GRAPH MATHEMATICS VERIFIED · RESEARCH DESIGN CANDIDATE ONLY · NOT PREREGISTERED
**Immediate source SHA:** `547aa43042a3189b198fa132c15c75eb95542967` (A03 draft PR #1835, unmerged at this check)
**Authoritative test scope:** two fixed eight-node/fourteen-arc worlds; no model, experimental population or member corpus.
**Independent human reviewer:** NOT PERFORMED. The one-off Python arithmetic cross-check is independently implemented *software arithmetic*, not independent human methodological review.

## 1. Exactly what has been proved

A04's two fixed source-authored directed typed graphs differ by the **P-typed destination switch**:

```text
G+    a→u [P], b→v [P]
G−    a→v [P], b→u [P]

All 12 other typed arcs are identical.
OPEN/P/ACK path from s to t: G+ = 1, G− = 0.
```

Both fixed graphs have **eight vertices and fourteen arcs**, identical typed in/out degree counts **at each named vertex**, identical global relation-label and canonical token-unigram counts, identical strongly-connected/zero-reciprocity status, and identical endpoint-free two-hop label-pair counts.

**The untyped adjacency of named vertices is NOT identical**. The two unlabeled directed graph shapes are isomorphic by swapping u↔v, which changes the identities of the ACK and IGNORE exit nodes and does not preserve the full typed graph. Endpoint-aware OPEN→P walks differ (ending at u versus v). This is where the target truth changes.

The global type-label two-hop histogram equality is **mathematically determined by the equal per-node typed degrees**:
\[
B_{ij}=\sum_{x\in V}d^-_i(x)d^+_j(x).
\]
It is *not* a separate empirical finding.

**Methodological attribution:** A01 also used an untyped edge-target two-switch. A04 is distinct from A02/A03's fixed-topology P/Q/R *label permutations* and applies stricter *typed* degree constraints than A01, but is not the first invented 2-switch in the RGR programme. All use a synthetic target and do not establish substantive human relational meaning.

## 2. Bounded deterministic verification

From the isolated, source-pinned A04 worktree:

```text
node --test tests/constitutional/rgr-grm-a04/typed-endpoint-rewire.test.mjs

21 checks passed / 0 failed
```

This covers: two fixed shapes; precisely 12 common typed arcs and two removed/two added P arcs; deliberately changed named adjacency; untyped graph isomorphism via u↔v (not typed equivalence); exactly equal typed degrees; label and lexical bag controls; corollary two-hop histogram; anchored endpoint difference; three-hop positive/negative contrast; strong connectivity and zero reciprocity; exact involutive two-switch; refusal of invalid single-edge mutation; all **40,320** coherent eight-vertex renamings; order invariance; invalid-input refusals; source-module no-I/O/no-network boundary; comparison with A02/A03's distinct *label-permutation* mechanism; inherited source/canon hashes; exact six-file path allowlist; document SHA custody; no-experiment authority.

A second, separately authored **Python** Cartesian arc-enumeration check—without using the Node implementation—independently found:
- 8 nodes, 14 arcs each, **12** common typed arcs.
- Named untyped adjacency differs, but bare graph isomorphic under u↔v; typed graph is **not** isomorphic under that same witness.
- Per-vertex typed in/out degrees, canonical token unigrams and global two-hop label-pair histograms match.
- Both graphs strongly connected.
- Exactly one positive and zero negative OPEN→P→ACK source-target routes.
- All **40,320** coherent vertex renamings preserve the two answers and typed-degree equality.

The 40,320 renamed versions are **mathematical symmetry checks of only two source-authored worlds**, not a statistical sample, independently generated examples, a held-out corpus, performance results or replication.

## 3. Protected source scope

The candidate's source base is the exact A03 commit `547aa43042a3189b198fa132c15c75eb95542967`. Native tests compare **35 inherited parent/canonical artifacts byte-for-byte** against that base. These include GRM-01/A01/A02/A03 research papers/tests and September RGR-00 through RGR-06 governing records; no parent files are edited.

The new A04 changes only **six** explicitly listed research files: two source-bound design/review documents, the strict candidate work-unit JSON, this return, one pure toy module and one test module. The original parent test guards remain untouched; they intentionally refuse later child files if run in a child worktree. A previous parent PASS must not be misrepresented as a new independent rerun if its worktree is no longer present.

The A04 source text and this verification return are documentary records. The node/Python math witnesses do not elevate a new source to a confirmed meaning model.

## 4. Scientific objections preserved

- The target is the same anchored OPEN→P→ACK path used by A02/A03. Intervention diversification **does not** establish transfer to independent relation-rule families.
- Named adjacency differs: a simple text-to-named-edge extractor can classify the change, and a fully informed typed-graph solver computes the target exactly. This is a **serious rival**, not an objection to conceal or an engineered weakness.
- The bare graph isomorphism equality is a modest structural control; it is not same full adjacency as the previous two candidates.
- A04 and A01 both use graph two-switches, despite different target/typed-degree constraints.
- No renderer, paired scenario population, independent root/domain/template splits, encoder/weights, rank/metric, text-to-graph comparator, learner, effect margin, confidence method or valid stopping/replication protocol exists.
- Therefore **no neural-model comparison**, geometry superiority, sheaf meaning, psychological coherence, spiritual/clinical claim, or MAIA intelligence improvement is supported.
- Independent scientific source/method review is now the appropriate **stop point** before extending the toy series or freezing any experiment.

## 5. Strict no-execution boundary

**Nothing outside documents and fixed source-authored mathematical tests is authorized or performed:** zero model weights downloaded; zero benchmark data examples materialized; zero experimental training rows; zero local/external inference; zero external provider spending; no member, private, clinical, manuscript or connected-app content accessed for the toy; no TEST/REPLICATION; no MAIA/Writer's Studio/House prompt, memory, routing, schema or deployment changes. RGR-07 is not opened and the existing RGR-04/06 experimental locks, October Flow findings, RGR-CF01 and method-design intakes are unchanged.

**Disposition:** RESEARCH_DESIGN_CANDIDATE / FIXED_TOY_MATH_PASS / INDEPENDENT_HUMAN_METHOD_REVIEW_PENDING. A Founder might subsequently authorize further *design* of a testable multi-family protocol, but no automatic experiment, A05, merge or deployment follows from this result.
