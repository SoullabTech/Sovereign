# RGR-05 — Pre-Materialization Feasibility & Validator Gate

**Programme:** RELATIONAL-GEOMETRY-REASONING
**Benchmark:** `RGR-RT1-D2C-01 — Directed Two-Step Composition`
**Canonical base:** `567e062b3d8929c41d15882ae26ea9d42077a1bc`
**Standing:** `FEASIBILITY_PASS`
**Materialized benchmark pairs:** `0`

## 1 · Purpose and boundary

RGR-05 asks one question only:

> Can the frozen RGR-04 benchmark actually be materialized as specified before any full dataset, model, training run, TEST, or REPLICATION exists?

RGR-05 changes no RGR-04 law. It implements only the minimum deterministic machinery needed to prove or falsify pre-materialization feasibility: exhaustive graph-space enumeration, exact positive/negative validators, directed 2-switch validation, collision-free capacity proof, disjoint codebook proof, named-stream proof, bounded surface counterbalance, mutation rejection, and an independently implemented bitmask verifier.

No full benchmark examples or dataset files are written.
## 2 · Frozen law preserved

The implementation preserves six nodes, eight directed edges, no self-loops, no direct source→target edge, exactly one positive source→intermediate→target path, zero such paths in the paired negative, and the frozen directed degree-preserving 2-switch.

Each pair preserves the same surface realization, row order, source/target query, edge count, node-wise in-degree, node-wise out-degree, and reciprocal-edge count.

It preserves `Σ_* = BALANCED_16BIT_NODE_CODE`, 256 codes per split, disjoint TRAIN / VALIDATION / TEST / REPLICATION codebooks, split seeds `41041 / 41042 / 41043 / 41044`, and named streams `CODEBOOK / GRAPH / SURFACE_ASSIGNMENT / ROW_ORDER / SWITCH`.

Frozen split sizes remain `12,000 / 3,000 / 6,000 / 6,000` pairs.

No threshold, seed, relation family, surface specification, split size, comparator class, metric, test law, replication law, or no-rescue rule changed.

## 3 · Deterministic graph feasibility

The primary implementation exhaustively enumerates the complete admissible eight-edge positive graph space for canonical ordered query `source=0,target=1`.

A separate bitmask verifier re-implements the graph logic rather than importing it.

Both implementations return exactly:
| Quantity | Count per ordered query |
|---|---:|
| valid positive graphs | 1,035,272 |
| positives with ≥1 admissible relation break | 285,500 |
| positives with exactly one admissible switch | 238,512 |
| collision-free positive/negative pair representatives | **201,192** |

Switch-count distribution among retained positives:

| admissible switches | positives |
|---:|---:|
| 1 | 238,512 |
| 2 | 42,504 |
| 3 | 4,448 |
| 4 | 36 |

For the capacity proof, RGR-05 uses the stricter exactly-one-switch subset and then keeps one deterministic positive representative for each unique negative graph. Both members of every counted capacity pair are therefore unique.

The six node labels are exchangeable under permutation. The canonical `s=0,t=1` space maps bijectively to each of 30 ordered source/target queries.

Total collision-free query-marked capacity is therefore `201,192 × 30 = 6,035,760` pairs, versus only `27,000` required.
## 4 · Exact split-allocation feasibility

Every frozen split size is divisible by the 30 ordered source/target queries:

| Split | pairs/query | total pairs |
|---|---:|---:|
| TRAIN | 400 | 12,000 |
| VALIDATION | 100 | 3,000 |
| TEST | 200 | 6,000 |
| REPLICATION | 200 | 6,000 |
| **TOTAL** | **900** | **27,000** |

A disjoint ordinal reservation exists per query: TRAIN `0–399`, VALIDATION `400–499`, TEST `500–699`, REPLICATION `700–899`.

Required capacity per query is `900`; proven collision-free capacity is `201,192`; margin is `200,292`.

No exact `(A,q_s,q_t)` tuple need cross a split boundary. The proof establishes this allocation arithmetically; it does not create the 27,000 graph pairs.

## 5 · Relation-break validity

Every accepted switch is checked for exact eight-edge preservation, node-wise in/out degree preservation, reciprocal-edge-count preservation, no replacement duplicate, no self-loop, no direct source-target shortcut, and zero source-to-target two-step intermediates after the break.

The exhaustive scan also records rejected switch candidates: `202,464` negative-relation/graph-invalid, `407,184` reciprocal-edge-count-changing, and `487,920` replacement-duplicate candidates.
## 6 · Surface and codebook feasibility

The balanced 16-bit constant-weight universe contains exactly `C(16,8)=12,870` codes. Four frozen 256-code books require only `1,024`.

A deterministic split-order allocator driven by the frozen `CODEBOOK` SHA-256 stream selects four pairwise-disjoint codebooks.

Recorded codebook SHA-256 values:

- TRAIN: `299751fc0a84825a4f8cd5809dd07911de9ffee660ed2fcf7cac5cd25a23bbd3`
- VALIDATION: `de7d1581ca12f26e974a1abb9b5e6e3360c8f5ba75a42b9bb13bf01482c7d2e0`
- TEST: `a8d610cba4c64a520c0bf2254750926d3ac3b09693614edda950328301ffd151`
- REPLICATION: `c677135eaa0e2cea710bab65d5039c8d0414b7e8f8a2b8e8e0cecc4e624df72c`

A deterministic six-role schedule uses a split-specific SHA-256-derived offset, a split-specific odd stride, and role step `43`. Every role's code-identity frequency differs by at most one occurrence, while each proof assignment uses six distinct balanced codes.

`ROW_ORDER` deterministically selects among all `6! = 720` row permutations.

No full surface-coded dataset is written.
## 7 · Named-stream and validator evidence

The implementation uses the exact frozen UTF-8 law:

`RGR04|RGR-RT1-D2C-01|<split>|<master-seed>|<stream-name>|<counter>`

SHA-256 drives all five frozen streams. Bounded index draws use first-64-bit rejection sampling rather than biased modulo reduction.

The independent pair validator recomputes positive relation count, negative relation count, graph admissibility, degree vectors, reciprocal-edge count, surface identity, row-order identity, query identity, six-code distinctness, and 16-bit balance.

One bounded valid proof pair is accepted.

Eleven targeted mutations are rejected: surface mismatch, row-order mismatch, query mismatch, duplicate surface code, unbalanced surface code, unbroken negative relation, multiple positive two-step paths, direct source-target edge, degree drift, self-loop, and reciprocal-edge-count change.

## 8 · Independent mechanical verification

The separate bitmask verifier imports none of the primary graph enumeration logic.

It reproduces exactly all four graph counts and the complete switch histogram.

Independent verifier disposition: `PASS`.
## 9 · Local review provenance

The exact read-only review packet SHA-256 is:

`393e523d60fb1b30c6e670661a76a3475f298b53f79d12dae206f5c117705913`

Two local, non-networked reviewers examined the same frozen implementation/evidence packet.

- GPT-OSS `gpt-oss:20b` via local Ollama: `PASS`; no falsifying implementation defect identified.
- Qwen `qwen3-coder:30b` via local Ollama: `PASS`; capacity, graph/switch invariants, split/codebook separation, independent verifier agreement, mutation rejection, and no-materialization boundary accepted.

Reviewer scratch reasoning is not committed. Exact raw-response hashes, model identities, and bounded verdict provenance are preserved in `RGR05_REVIEW_PROVENANCE.json`.

## 10 · Implementation digest

Combined generator/validator feasibility implementation digest:

`98597755f40316ec4b0e60318635e1ad0dd587dd0d6176147aaf36923abb731b`

Components:

- `rgr05_feasibility.py`: `7f5b24b93c1bb5b74aaae6cbd5fc79784b7cd483c91e410201fc4ddee24af6aa`
- `rgr05_independent_verifier.py`: `1d1cc41f058b19d8de1b6a02cc19655cb47ac03791011f3bde366b66ebf92407`
## 11 · Materialization boundary witness

Exact RGR-05 evidence records:

- full benchmark materialized: **false**
- materialized benchmark pair count: **0**
- dataset files written: **0**
- model code implemented: **false**
- model training executed: **false**
- model performance inspected: **false**
- TEST executed: **false**
- REPLICATION executed: **false**

The only benchmark-like object constructed is one bounded in-memory proof pair used to exercise the validator and mutation tests. It is not persisted as a dataset example.

# Final disposition

`FEASIBILITY_PASS`

The frozen `RGR-RT1-D2C-01` constitution is mechanically feasible under the canonical RGR-04 constraints.

This finding means only that the benchmark **can be materialized as preregistered**. It does not authorize full materialization, model implementation, training, model-performance inspection, TEST, REPLICATION, H-RT1 support, Elemental Operator formalization, MAIA modification, production mutation, or deployment.

Any successor act must begin from this frozen implementation/evidence digest and remain subject to the RGR-04 no-rescue law.
