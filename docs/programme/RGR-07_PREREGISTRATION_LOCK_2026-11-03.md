# RGR-07 — Preregistration Lock

**Benchmark:** RGR-MO1-TRIAD-01
**Hypothesis:** H-MO1 — HIGHER-ORDER MOTIF TRANSFER
**Gate:** RGR-07
**Date:** 2026-11-03
**Standing:** FROZEN DESIGN CANDIDATE · NOT MATERIALIZED · NOT EXECUTED · NOT INDEPENDENTLY REVIEWED
**Constitution:** `docs/programme/RGR-07_MOTIF_BENCHMARK_CONSTITUTION_2026-11-03.md`

Every value below is frozen. Changing any after materialization creates a new
benchmark version (RGR-04 §XXIX; charter §18).

---

# 1 · Benchmark identity lock

~~~text
benchmark_id:            RGR-MO1-TRIAD-01
motif_family:            HYPEREDGE_COMPOSITION
members_per_fixture:     6
pairwise_records:        15 (all unordered pairs)
hyperedge_records:       1 (designated triad)
temporal_order:          ABSENT
config_vocabulary:       {ALIGNMENT, TENSION}
dyn_vocabulary:          {EVOKES_ij, EVOKES_ji, INHIBITS_ij, INHIBITS_ji, NONE}   (nuisance)
group_vocabulary:        {COLLECTIVE_CONSTRAINT, COLLECTIVE_SYNERGY}
abstention_value NONE:   NOT APPLICABLE (no extractor stage)
~~~

# 2 · Surface lock

~~~text
surface_specification:   BALANCED_16BIT_NODE_CODE  (RGR-04 §V, reused exactly)
code_dimension:          16, values {-1,+1}, 8 of each
codebook_size_per_split: 256, pairwise disjoint across splits
stream_naming:           RGR07|RGR-MO1-TRIAD-01|<split>|<master-seed>|<stream>|<counter>
named_streams:           CODEBOOK · TRIAD_SELECTION · SURFACE_ASSIGNMENT · ROW_ORDER ·
                         CONFIG_INTRIAD · CONFIG_DISTRACTOR · DYN · GROUP_ATTRIBUTE ·
                         PERTURB_RERENDER
split master seeds:      TRAIN 72041 · VALIDATION 72042 · TEST 72043 · REPLICATION 72044
~~~

# 3 · Structure lock

~~~text
r_pair signature σ:      (config_ab, config_ac, config_bc) ∈ {A,T}^3
class partition:         CLASS_E = even #T {AAA, ATT, TAT, TTA}
                         CLASS_O = odd  #T {TAA, ATA, AAT, TTT}
r_group o:               independent of σ and of every pairwise record
distractor config:       T with probability 1/2, exactly balanced per (split, cell)
dyn:                     uniform over 5 values, independent of everything
~~~

# 4 · Target lock

~~~text
label name:              COMPOSED_OUTCOME
y = 1 iff:               (CLASS_E ∧ COLLECTIVE_CONSTRAINT) ∨ (CLASS_O ∧ COLLECTIVE_SYNERGY)
marginals:               P(y|σ) = P(y|o) = P(y|any single record) = P(y|U,dyn) = 1/2 exactly
semantics:               none beyond the table
~~~

# 5 · Factorial and split lock

~~~text
cells:                   (σ, o) = 16, equal counts per split
TRAIN:                   12,000 pairs · 750 per cell
VALIDATION:               3,000 pairs · 188 per CLASS_E cell, 187 per CLASS_O cell
TEST:                     6,000 pairs · 375 per cell  (+ one re-rendering twin per fixture)
REPLICATION:              6,000 pairs · 375 per cell
total:                   27,000 pairs · 54,000 labeled examples
~~~

# 6 · Counterfactual lock

~~~text
pair construction:       x⁻ = x⁺ with o flipped; U, P (incl. row order), H membership identical
C_break:                 RGR-04 §XIX, unchanged
V_S paired identity:     EXACT (byte-identical)
V_P paired identity:     EXACT (byte-identical)
~~~

# 7 · Views lock

~~~text
V_S  surface-only:       U + H membership codes + all dyn fields   (no config, no o)
V_P  pairwise-only:      U + P                                      (no H)
V_H  group-only:         U + H                                      (no P)
V_F  full:               U + P + H                                  (731 dims, row-major as §III)
forbidden to every view: y, σ, class, parity feature, oracle composite
~~~

# 8 · Comparator lock

~~~text
F_S1:                    logistic over V_S, L2 ∈ {1e-4,1e-3,1e-2,1e-1}, float64
F_S2:                    MLP 256→128→64 over V_S
F_S score:               max(M(F_S1), M(F_S2)), predeclared
F_G:                     flat MLP over V_F; G1 512→256 · G2 512→256→128 · G3 512→256→128→64
F_R:                     hypergraph MPNN: width 64, shared weights, pairwise messages with
                         (config,dyn) edge features, sum aggregation, depth ∈ {1,2,3};
                         hyperedge pooling (sum) of the 3 named member states + one-hot o
                         through one shared layer; binary readout from hyperedge state
F_R-oracle:              F_R + (class, o) scalars — DIAGNOSTIC CEILING ONLY, never evidence
extractor stage:         NONE in TRIAD-01 (charter §10 law recorded, not discharged)
~~~

# 9 · Budget lock

~~~text
optimizer:               AdamW
learning rate:           {1e-3, 3e-4}
weight decay:            {0, 1e-4}
configurations:          F_S2 4 · F_G 12 · F_R 12   (search-count parity)
max epochs:              50
early stopping:          5 validation epochs
selection metric:        validation balanced accuracy, TRAIN+VALIDATION only
batch size:              128
device / dtype:          CPU-only / float32
primary seeds:           71001 71002 71003 71004 71005
replication seeds:       81001 81002 81003 81004 81005
permutation seed:        92991
bootstrap seed:          718206421
bootstrap replicates:    10,000 (hierarchical: seeds, then whole pairs)
~~~

# 10 · Threshold lock

~~~text
M:                       balanced accuracy, mean of 5 seeds
τ_min:                   0.80   LB95(M(F_R)) > 0.80
δ_min:                   0.10   LB95(M(F_R) − M(F_S)) > 0.10
κ_min:                   0.75   LB95(C_break(F_R)) > 0.75
S_min:                   0.95   S_perturb(F_R) ≥ 0.95
competence floor:        0.80   validation BA, else UNDERDETERMINED
permutation control:     ≤ 0.52
group-only probe:        ≤ 0.52
exact audits:            = 0.50 (fail-closed)
necessity margin δ_G:    0.05   LB95(M(F_R) − M(F_G)) > 0.05
~~~

# 11 · Legibility lock

~~~text
fixtures:                24, every cell ≥ 1
translations:            T_true · T_pair · T_group, randomized order
witnesses:               ≥ 3, blind
discrimination floor:    ≥ 0.75 (chance 1/3)
agreement:               Fleiss κ ≥ 0.60
reporting:               human witness only; automated results may not report it passed
scope:                   composition recoverability from synthetic structure; never member legibility
~~~

# 12 · Support-level lock

~~~text
MOTIF-STRUCTURAL:        τ ∧ δ ∧ κ ∧ S ∧ competence ∧ all invalidations clean ∧ legibility witnessed
REPRESENTATIONAL-NECESSITY: MOTIF-STRUCTURAL ∧ δ_G
MOTIF-NATURAL:           unreachable from TRIAD-01
~~~

# 13 · Non-materialization

~~~text
examples materialized:   0
pairs materialized:      0
codebooks generated:     0
models implemented:      0
provider calls:          0
independent review:      NOT PERFORMED (owed before any materialization gate)
~~~
