# RGR-GRM-A02 — Bounded Verification Return

**Date:** October 16, 2026
**Standing:** DOCUMENTARY / FIXED HAND-AUTHORED MATHEMATICAL CHECKS PASS · DESIGN UNADJUDICATED
**Exact parent:** `1cc463da4d660a6bbf351df5847c4108d8166d4e` (GRM-A01 draft PR #1833)
**Class:** research design candidate only; no frozen benchmark, learning, human study, source-corpus admission or canonical Work Unit progression
**Scope of files:** two research documents, a restrictive JSON candidate envelope, this return, one pure JS two-world toy, one native Node test suite.

## 1. Concrete mathematical result

The exact pair is on six vertices and **nine fixed directed arcs**. Four existing arcs undergo only a checkerboard P/Q label switch. The untyped arc set is **identical**, the graph is strongly connected in both versions, every named node's typed in/out degree counts are identical, and the canonical source/type/target token unigram bag is identical.

The global multiset of unanchored two-hop **type-label** pairs is also identical. This is an **algebraic corollary** of matching typed degrees, not an independent invariant: for label pair (i,j), the number of such two-hop paths is the sum over intermediate vertices v of indegree_i(v) × outdegree_j(v). Node-anchored two-hop endpoints are *not* equal.

The predicate is an exactly three-arc route **source s → target t** with ordered types OPEN, P, ACK:

```text
G+ : s→a [OPEN], a→c [P], c→t [ACK]     = YES (one route)
G− : s→a [OPEN], a→d [P], d→t [IGNORE]  = NO  (zero routes)
```

The negative nevertheless contains a P→ACK leg from b→c→t, but b is reached from CLOSED, not OPEN. Thus global role/endpoint continuity is essential for this exact target; **a symbolic typed graph solver can compute it perfectly**. No superiority of Grassmann, sheaf, geometric model, cognitive geometry or the AIN Flow architecture is inferred.

## 2. Tests and independent-language arithmetic

Native Node 22 run from the isolated A02 worktree:

```text
node --test tests/constitutional/rgr-grm-a02/typed-composition-toy.test.mjs
20 passed · 0 failed
```

It includes: exact toy shape; identical bare adjacency and typed degrees; unigram and typed bigram histograms; algebraic reconstruction of the latter from typed degrees; explicit failure of endpoint-anchored two-hop equality; strong connectivity/zero reciprocal arcs; positive/negative three-hop truth; checkerboard involution; partial-flip rejection; all **720** coherent node renamings; edge ordering; invalid-input refusals; static no-I/O/module guard; SHA binding of authored research documents; inherited protected-source byte identity; scope allowlist; no-authorization contract.

A separate one-off **Python** enumeration, independent of the Node implementation, verified: 6 vertices, 9 arcs, identical untyped graph and per-node typed degree, identical unanchored typed two-hop label bags, strong connectivity in both worlds, target counts **1/0**, and all **720 coherent node relabelings**. Python imported no node source and used no network or model.

During development, after adding the explicit corollary note, a test temporarily reported **19/20** solely because the documentary SHA-256 binding was stale. It was updated after freezing the modified prose, and the final run passed **20/20**. Earlier preliminary runs reached 18/18 before two additional anti-overclaim tests were added. These historical non-final counts are not silently presented as final green evidence.

## 3. Source and authority custody

The candidate is based on commit `1cc463da4d660a6bbf351df5847c4108d8166d4e`. The test enforces byte identity for **23 parent and canonical source artifacts**, including the earlier GRM-A01 and GRM-01 documents/tests, RGR-00–06 documents and RGR-01 claim/source landscape. It examines staged, unstaged and untracked changes against the parent and accepts only its own six declared paths.

Source lineages preserved:
- RGR-04: separate frozen six-vertex/eight-edge directed TWO-step composition preregistration.
- RGR-06: closed September implementation lock (no H-RT1 performance evidence), not available as a new identifier.
- October RGR-05A/B: derived Flow architecture and independent sampler feasibility failure, neither amended.
- RGR-CF01/RGR-EVAL-CAUSAL-01: existing October research intakes, neither superseded.
- GRM-01 PR #1832 and GRM-A01 PR #1833: parent and calibration candidates; no claims of canonical merge or independent scientific support.

Parent test suites are scope-specific and must be run in their own untouched parent worktrees. They are deliberately not weakened to accept descendant paths.

## 4. Scientific blockers — explicit return, not launch readiness

1. The reference comprises only **two fixed worlds in one graph-template family**. It does not constitute a meaningful population, independent validation set, cross-domain transfer study or human-meaning result.
2. All methods with exact typed adjacency solve the query deterministically. Endpoint-aware two-hop features may already expose the target. The proper comparator is a strong *same-text* graph-extraction-plus-symbolic-solver system, not a fake weak bag of words.
3. No text rendering, unbiased paraphrases, lexical controls beyond the bare edge-clause bag, domains, held-out templates, encoder, rank/metric, weights, learned models, budgets, primary effect margin, confidence procedure or benchmark split is chosen. No score exists.
4. Before any experimental lock, an independent methodology review must challenge proxy adequacy and construct multiple structurally distinct matched target families *without* using TEST/REPLICATION to choose the design.
5. Both possible outcomes, including no advantage over symbolic/vector/multi-view methods, must remain legitimate. If a richer task changes the graph family or what is held invariant, it requires a **new version with the old result preserved**.

## 5. No-execution covenant

No experimental dataset or generator materialized, no pretrained embedding weights downloaded, no training or inference, no external provider call, no spend, no TEST/REPLICATION, no member/clinical/manuscript/private data, no MAIA/Studio/House memory or routing changes, no schema or migration, no amendment of the RGR-04/06 locks, no canonical gate opened, no merge and no deployment.

**Final disposition:** A02 is an **inspectable source-grounded counterfactual design candidate with an exact mathematical witness**. It is **NOT PREREGISTERED** and is **NOT** approval to carry out an empirical test. Next required act: genuinely independent review and a Founder decision on whether to design multiple richer template families under an entirely separate future lock.
