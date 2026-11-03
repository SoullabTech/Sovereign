# RGR-07 — H-MO1 Motif Benchmark Constitution

**Programme:** RELATIONAL-GEOMETRY-REASONING
**Gate:** RGR-07 (opened by founder act 2026-11-03)
**Work Unit:** `rgr-07-motif-benchmark-constitution-20261103` (W2 authorized 2026-11-03, *"authorized"*)
**Governing law:** `docs/programme/RGR-07_H-MO1_CANDIDATE_CHARTER_2026-09-23.md` (§§2–20)
**Hypothesis:** H-MO1 — HIGHER-ORDER MOTIF TRANSFER
**Benchmark:** `RGR-MO1-TRIAD-01`
**Date:** 2026-11-03
**Standing:** FROZEN DESIGN CANDIDATE · NOT MATERIALIZED · NOT EXECUTED · NOT INDEPENDENTLY REVIEWED
**Canonical base:** `f21fda83a15a6ddb0c5af429895dc1c7e0f9c7af`

---

# 0 · Gate boundary

This document freezes the values the charter left open, and nothing else.

It may: name one benchmark; fix its observable set, factorial law, target
function, paired counterfactual, views, comparator classes, budget, split
sizes, metrics, thresholds, invalidation conditions, legibility contract,
support law and seeds.

It may not: materialize a fixture, run a generator, implement or train a
model, call a provider, inspect any performance number, touch member data,
name an Elemental or aspect-derived operator, alter MAIA, or open a successor
gate.

Where this document and the charter differ, the charter governs; where the
charter and an inherited RGR-00…06 clause differ, the inherited clause
governs (charter §2).

---

# I · What RGR-MO1-TRIAD-01 can and cannot establish

The target label is a function of a group-level structure by construction.
RGR-04 §I therefore applies unchanged: a positive result shows that a
first-class motif representation **transfers** under surface shift and
**breaks** under group-level severance. It cannot show that motifs are
fundamental to human meaning, that member conversations contain them, or
that any inherited symbolic grammar is correct.

TRIAD-01 is a **structural** benchmark in the RGR-04 family. The group-level
evidence is a structured joint record, not member language. The
member-language extraction that the 16 September team paper reports (H3j,
H4a) is **not** what this benchmark tests; an extractor-based benchmark over
rendered language is a later benchmark (`TRIAD-02`, not opened), and natural
conversation is an unavailable evidence class (charter §16).

⭐ Why structural first: the charter's §4 (spans in O for both comparators)
and §6 (no surface token intrinsically associated with any `r_group`) are
jointly satisfiable only if the information lives in structure and the
language is a surface rendering with split-disjoint vocabulary. A benchmark
whose group effect is carried by content words would make those words
surface variables that identify the target, which RGR-03 §9 forbids. The
rendering layer is therefore deferred to TRIAD-02 rather than smuggled in
here as decoration.

---

# II · Benchmark identity

```text
benchmark_id                 RGR-MO1-TRIAD-01
motif_family                 HYPEREDGE_COMPOSITION
members_per_fixture          6
designated_triad             exactly 1 (a 3-member hyperedge)
pairwise_records             15 (every unordered pair of the 6 members)
hyperedge_records            1
temporal_order               ABSENT in TRIAD-01 (charter §5: "where the
                             fixture carries it"; it does not)
```

Six members rather than three so that the designated triad must be **bound**
through surface codes among distractors. With exactly three members every
pairwise record is in-triad and the parity below needs no binding; the
benchmark would then test arithmetic, not relational identity. Six members
is the RGR-04 precedent and gives C(6,3) = 20 possible triads.

---

# III · Observable set O (full-information view)

For every fixture:

```text
U   6 member codes          u_v ∈ {-1,+1}^16, balanced (8 of each), one per member
P   15 pairwise records     (code_i, code_j, config, dyn)
                            config ∈ {ALIGNMENT, TENSION}          one-hot 2
                            dyn    ∈ {EVOKES_ij, EVOKES_ji,
                                      INHIBITS_ij, INHIBITS_ji, NONE} one-hot 5
H   1 hyperedge record      (code_a, code_b, code_c, o)
                            o ∈ {COLLECTIVE_CONSTRAINT, COLLECTIVE_SYNERGY} one-hot 2
```

`config` is the H3j **configuration** dimension (symmetric). `dyn` is the
H3j **dynamic** dimension (directed) and is **nuisance** in TRIAD-01: it is
drawn independently of everything and predicts nothing. It is present so
that a model must ignore a relational field, not merely read one.

Members are referred to **only** by their codes inside P and H. Record rows
of P are serialized in a randomized order. The triad's membership is
recoverable only by matching codes between H and P.

O contains nothing else. In particular O does **not** contain: the target y,
the in-triad signature, its parity class, any "motif present" flag beyond
the H record itself, or any precomputed composite.

Canonical row-major encodings (frozen; the implementation gate may not
re-order fields):

```text
U      6  × 16                              =  96
P      15 × (16 + 16 + 2 + 5) = 15 × 39     = 585
H      1  × (16 + 16 + 16 + 2)              =  50
full-information vector length               = 731
```

---

# IV · r_pair — the pairwise signature and its class partition

The **in-triad signature** is the configuration triple over the three pairs
inside the designated triad:

```text
σ = (config_ab, config_ac, config_bc) ∈ {A, T}^3        8 values
```

The frozen class partition is **parity of TENSION count**:

```text
CLASS_E   even number of T in σ   {AAA, ATT, TAT, TTA}
CLASS_O   odd  number of T in σ   {TAA, ATA, AAT, TTT}
```

Properties, each load-bearing:

- balanced 4 / 4;
- invariant under any permutation of the three members, so randomized row
  order and role assignment cannot leak the class;
- non-evaluative: parity encodes no severity, confidence or importance
  (charter §6; WRITERS-STUDIO ranking law by analogy);
- not computable from any single pair: every single in-triad config is
  independent of the class by construction.

The twelve **distractor** pairwise records (pairs with at least one member
outside the triad) carry `config` drawn independently, balanced 50 / 50 per
cell. They are nuisance.

---

# V · r_group — the group-level attribute

```text
r_group = o ∈ {COLLECTIVE_CONSTRAINT, COLLECTIVE_SYNERGY}
```

`o` is drawn **independently of σ** and of every pairwise record. This is
the H4a construction generalized to the whole dataset: for every pairwise
signature both group effects occur equally often, so **no function of P
predicts o**, and the complete pairwise graph carries zero information about
the group-level effect. That is what makes H a genuine higher-order object
rather than a summary of its pairs.

`NONE` is not a value of `o` in TRIAD-01. The abstention control the charter
names (§12) exists for extractor-based comparators that *mint* a motif;
TRIAD-01's frozen comparators receive H as given and mint nothing, so the
control is recorded **NOT APPLICABLE** here and **REQUIRED** for any
extractor-based successor.

---

# VI · Target function f

```text
y = 1   iff   (CLASS_E ∧ COLLECTIVE_CONSTRAINT)  ∨  (CLASS_O ∧ COLLECTIVE_SYNERGY)
y = 0   otherwise
```

Equivalently `y = [class = CLASS_E] XNOR [o = COLLECTIVE_CONSTRAINT]`.

Marginal law, by the factorial (§VII), exactly:

```text
P(y = 1)            = 1/2
P(y = 1 | σ)        = 1/2   for every σ          (hence for every class)
P(y = 1 | o)        = 1/2   for both o
P(y = 1 | any single pairwise record, or any distractor set)  = 1/2
P(y = 1 | U, dyn)   = 1/2
```

Only the **composition** of the triad's parity with the triad's group
attribute determines y. This is the charter §7 requirement discharged
exactly rather than approximately.

The label is named `COMPOSED_OUTCOME`. It has **no semantics** beyond this
table. It is not "stability", not "resolution", not a claim about any
person; naming it otherwise would be the inflation the charter's §I caveat
forbids.

---

# VII · Full-factorial fixture law

A fixture cell is `(σ, o)`: 8 × 2 = 16 cells. Every split holds exactly
equal counts per cell.

Within a cell, independently and counterbalanced by named streams:

```text
TRIAD_SELECTION     which 3 of the 6 member slots form the triad: uniform over 20
SURFACE_ASSIGNMENT  which 6 codes from the split codebook, and which code
                    lands in which slot: uniform, no code intrinsically
                    associated with a slot, a class, or o
ROW_ORDER           the 15 P rows: uniform random permutation
CONFIG_DISTRACTOR   each of the 12 distractor configs: T with probability 1/2,
                    balanced exactly within each (cell, split)
DYN                 each of the 15 dyn fields: uniform over the 5 values
```

Cardinality is fixed by construction (6 members, 15 pairs, 1 hyperedge, 731
dimensions), so the charter's cardinality audit is discharged exactly.

---

# VIII · Paired counterfactual — group-level severance

Every positive fixture `x⁺` has one paired `x⁻` with:

```text
identical U, identical P (all 15 records, same row order), identical triad
membership and codes in H,
o flipped,
therefore y flipped.
```

The pair differs in the group-level attribute and in **nothing else**. This
is RGR-04 §VIII lifted one order: no marginal, no pairwise fact and no
surface fact distinguishes the members of a pair.

`C_break` is defined exactly as RGR-04 §XIX over these pairs.

---

# IX · Relation-preserving surface perturbation

Two perturbations, both leaving `(σ, o)` and hence y unchanged:

1. **Held-out codebook shift** (primary, RGR-04 §VI): TEST and REPLICATION
   draw codes from codebooks disjoint from TRAIN and VALIDATION.
2. **Re-rendering twin** (secondary): for every TEST fixture a twin `x′` with
   fresh codes from the same split codebook, fresh row order and fresh
   `dyn` values, everything structural unchanged.

Frozen stability metric:

```text
S_perturb(F) = fraction of TEST fixtures on which F's class prediction
               for x equals its prediction for x′, averaged over the five
               confirmatory seeds
```

Together with `C_break` this is the charter §11 conjunction instantiated:
stable under relation-preserving perturbation, changed under group-level
severance. The conjunction is inherited from RGR-03 §1 and not restated.

---

# X · Views

```text
V_S   surface-only     U, the three codes named in H (membership only),
                       all 15 dyn fields.
                       Excludes every config bit and o.
V_P   pairwise-only    U, P in full.  Excludes H.
V_H   group-only       U, H in full.  Excludes P.
V_F   full             U, P, H.
```

Exact audits, mechanical and fail-closed:

- `V_S(x⁺) = V_S(x⁻)` for every pair, byte-identical. Hence any
  deterministic classifier over `V_S` scores **exactly 0.50** balanced
  accuracy on the paired set (RGR-04 §XXI logic). Deviation beyond
  floating tolerance ⇒ BENCHMARK_INVALID.
- `V_P(x⁺) = V_P(x⁻)` for every pair, byte-identical. Hence the
  **pairwise-only probe scores exactly 0.50**, which is the charter §12
  pairwise-only condition discharged structurally rather than empirically.
- `V_H` is not paired-identical, so the **group-only probe** is empirical:
  an F_S2-class MLP over `V_H` must not exceed 0.52 held-out balanced
  accuracy.

No view receives y, σ, the class, or any oracle composite.

---

# XI · Comparator classes

| Family | View | Architecture (frozen) |
|---|---|---|
| F_S1 | V_S | regularized logistic; L2 ∈ {1e-4, 1e-3, 1e-2, 1e-1} on validation only |
| F_S2 | V_S | MLP 256 → 128 → 64, ReLU, binary output |
| F_G | V_F | flat MLP over the 731-vector; G1 512→256 · G2 512→256→128 · G3 512→256→128→64; no hand-coded parity or composite feature |
| F_R | V_F | minimal **hypergraph** message passer (below) |
| F_R-oracle | V_F + (class, o) as two explicit scalars | **diagnostic ceiling only; never evidence** |

F_S score = max(M(F_S1), M(F_S2)), predeclared (RGR-04 §XIV A).

## F_R, frozen

- member hidden width 64, shared weights across members;
- pairwise message passing over the 6-member graph using each record's
  `(config, dyn)` as edge features, sum aggregation, depth ∈ {1, 2, 3}
  rounds selected on validation only;
- a **hyperedge aggregation**: the three member states named by H are
  pooled (sum) together with the one-hot `o`, through one shared layer;
- binary readout from the hyperedge state;
- no explicit parity feature, no composite feature, no oracle input.

F_R's inductive bias is "the group is a first-class object that aggregates
its members with its own attribute". That is the whole of what H-MO1 tests.
Its success would not establish hypergraphs as the ontology of RGR.

## Extractor-inside-F_R law (charter §10)

TRIAD-01's F_R has **no extractor stage**: H is given as a structured
record. The charter's full-pipeline budget law therefore reduces here to
search-count parity (§XII). Any successor in which F_R constructs the motif
from rendered language must count the extractor's parameters, data, tuning
and inference inside F_R's budget, and F_G must be allowed at least that
total. Recorded so that TRIAD-01's simplicity is not later read as having
discharged the law.

---

# XII · Training / search budget law

Identical to RGR-04 §XVI and RGR-06 §implementation_lock, re-frozen here:

```text
optimizer family        AdamW
learning rate           {1e-3, 3e-4}
weight decay            {0, 1e-4}
F_S2                    4 configurations
F_G                     3 architectures × 4 = 12 configurations
F_R                     3 depths        × 4 = 12 configurations
maximum epochs          50
early-stopping patience 5 validation epochs
selection metric        validation balanced accuracy
selection data          TRAIN + VALIDATION only
batch size              128
device / dtype          CPU-only / float32 (F_S1 float64)
```

Search-count parity between F_G and F_R, not parameter-count parity
(RGR-03 §10 permits a defensible policy; it does not require identical
counts across unlike architectures).

---

# XIII · Split sizes

```text
TRAIN        12,000 pairs    24,000 labeled examples    750 pairs per cell
VALIDATION    3,000 pairs     6,000 labeled examples    187.5 → 188/187 per cell, balanced by frozen schedule
TEST          6,000 pairs    12,000 labeled examples    375 pairs per cell
REPLICATION   6,000 pairs    12,000 labeled examples    375 pairs per cell
total        27,000 pairs    54,000 labeled examples
```

VALIDATION's 3,000 pairs over 16 cells is 187.5; the frozen schedule assigns
188 to the eight CLASS_E cells and 187 to the eight CLASS_O cells, keeping
`o` balanced within class. Recorded so it is a rule, not a rounding choice.

Re-rendering twins (§IX) are generated for TEST only and are not counted in
the sizes above.

This document generates zero examples.

---

# XIV · Metrics and thresholds

```text
M                        balanced accuracy, mean over five seeds
τ_min                    0.80    absolute held-out floor:        LB95(M(F_R)) > 0.80
δ_min                    0.10    RGR-03 relative advantage:      LB95(M(F_R) − M(F_S)) > 0.10
κ_min                    0.75    paired severance sensitivity:   LB95(C_break(F_R)) > 0.75
S_min                    0.95    perturbation stability:         S_perturb(F_R) ≥ 0.95
competence floor         0.80    validation BA of the selected F_R configuration, else UNDERDETERMINED
permutation control      ≤ 0.52  held-out BA with TRAIN labels permuted (seed below)
group-only probe         ≤ 0.52  held-out BA of F_S2 over V_H
exact audits             = 0.50  V_S and V_P paired-identity (fail-closed)
necessity margin δ_G     0.05    LB95(M(F_R) − M(F_G)) > 0.05 for REPRESENTATIONAL-NECESSITY
uncertainty              hierarchical bootstrap, 10,000 replicates, pairs atomic, 2.5 / 97.5 percentiles
```

Under the exact `V_S` audit `M(F_S) = 0.50`, so `τ_min` is the stronger of
the first two conditions; `δ_min` is retained for RGR-03 traceability. No
threshold may move after a result is observed.

---

# XV · Invalidation conditions (charter §12 instantiated)

| Probe | Invalid when |
|---|---|
| `V_S` paired identity | any pair not byte-identical, or any deterministic F_S ≠ 0.50 beyond tolerance |
| `V_P` paired identity | any pair not byte-identical |
| group-only probe (F_S2 over `V_H`) | > 0.52 held-out BA |
| relation-label permutation (seed 92991) | > 0.52 held-out BA |
| cell balance | any (split, cell) count differs from §XIII |
| codebook disjointness | any code shared across splits |
| distractor balance | any (split, cell) distractor-T rate ≠ 0.50 exactly |
| generator separability | generator cannot intervene on codes, σ, o independently |
| Elemental audit (§XVIII) | any forbidden term in any identifier |

Each is categorical or numeric as stated; none is a caveat.

---

# XVI · Support law and interpretation

**MOTIF-STRUCTURAL** (evidence axis) requires all of:

```text
LB95(M(F_R)) > 0.80
LB95(Δ_transfer) > 0.10
LB95(C_break(F_R)) > 0.75
S_perturb(F_R) ≥ 0.95
competence floor met
every §XV condition clean
§XVII legibility floor met by human witness
```

**REPRESENTATIONAL-NECESSITY** (separate axis) additionally requires
`LB95(M(F_R) − M(F_G)) > 0.05`. It is an outcome to be earned, never part of
the hypothesis conclusion.

**MOTIF-NATURAL** is unreachable from TRIAD-01 by construction (charter
§16); nothing here may be reported under it.

| Observed | Standing |
|---|---|
| all MOTIF-STRUCTURAL conditions met | candidate SUPPORT for H-MO1 on TRIAD-01 |
| F_G also passes τ, κ, S and the margin is not met | transferable group-level information **without** representational necessity; a precommitted admissible outcome |
| F_G fails, F_R passes | the tested hyperedge inductive bias enabled transfer; architecture independence not established |
| F_G passes, F_R fails competence | UNDERDETERMINED for the preregistered contrast |
| `C_break` fails | NOT_SUPPORTED for claimed relational use (RGR-03 §14) |
| `S_perturb` fails | NOT_SUPPORTED: the representation is lexical in the codes, not relational |
| any §XV condition | BENCHMARK_INVALID |
| legibility unwitnessed | *Unknown — requires human witness*; MOTIF-STRUCTURAL not reportable |

Stopping law and no-rescue law: RGR-04 §XXVIII, §XXIX and charter §18,
inherited by reference. Additionally frozen: the composition table, the
parity partition, the view definitions and the six-member cardinality may
not change after materialization; any change is a new benchmark version.

---

# XVII · Forced-choice human legibility contract (charter §14 instantiated)

Fixtures are rendered for witnesses in **plain prose**: six anonymous
parties, fifteen pairwise descriptions ("X and Y pull against each other"
/ "X and Y are at ease together"; the dyn field rendered neutrally), and
one joint description of the three named parties together ("together the
three lock" / "together the three open"). No word from {motif, triad,
hyperedge, constraint, synergy, parity, tension, alignment, configuration,
channel} appears in the rendering; the rendering vocabulary is frozen at
the materialization gate.

For each of **24 fixtures** (balanced over the 16 cells, each cell at least
once), each witness receives the rendering and **three** plain translations
of what the evidence says about `COMPOSED_OUTCOME`:

```text
T_true   derived from the admitted composition (class ⊗ o)
T_pair   a competent defeat candidate reading only the three in-triad pairs
T_group  a competent defeat candidate reading only the joint description
```

presented in randomized order, and selects which translation the evidence
supports. Scoring is **discrimination**: the fraction of witness selections
equal to `T_true`.

```text
witnesses             ≥ 3, each blind to the others and to the key
discrimination floor  ≥ 0.75
agreement rule        Fleiss κ ≥ 0.60 across witnesses
chance                1/3
```

Both must be met. An agreement rating ("does this sound right?") is not
admissible. No automated result may report this leg passed; until a
founder-run witness exists the leg is *Unknown — requires human witness*.

Scope limitation, binding: TRIAD-01 legibility tests whether the
**composition** is humanly recoverable from a plain rendering of synthetic
structure. It says nothing about a member's experience of a reading and
must never be cited as member legibility.

---

# XVIII · Elemental and symbolic-grammar audit (RGR-03 §19)

Every identifier in this document was checked against the forbidden set
{Fire, Water, Earth, Air, Aether, Weather, Spiralogic, alchemical,
conjunction, sextile, square, trine, opposition, orb, applying, separating}
and their derivatives. None appears in any target, latent rule identifier,
class name, view name, template class or generator taxonomy. The
configuration vocabulary `ALIGNMENT / TENSION` and the dynamic vocabulary
`EVOKES / INHIBITS` are the H3j neutral operators, not aspect names. The
group vocabulary `COLLECTIVE_CONSTRAINT / COLLECTIVE_SYNERGY` is the H4a
neutral vocabulary.

Mechanical check recorded in the Work Unit packet.

---

# XIX · Independent adversarial review

**NOT PERFORMED.** This Work Unit authorizes no external inference
(`external_ai_inference: false`, `model_provider_api: false`). RGR-04's
pattern (two bounded local-CLI reviews with execution provenance, §XXXIV)
is **owed before any materialization gate opens**, and is itself a separate
founder act under the ratified development-provider canon. Recorded as a
gap, not as a pass.

---

# XX · Standing

```text
benchmark               RGR-MO1-TRIAD-01, FROZEN DESIGN CANDIDATE
examples materialized   0
pairs materialized      0
models implemented      0
provider calls          0
member data             none
Elemental operators     none
independent review      NOT PERFORMED
founder adjudication    PENDING
successor gates         NONE OPENED
```
