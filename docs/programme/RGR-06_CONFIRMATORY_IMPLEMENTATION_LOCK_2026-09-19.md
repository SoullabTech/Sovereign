# RGR-06 — Confirmatory Implementation Lock

**Programme:** RELATIONAL-GEOMETRY-REASONING
**Benchmark:** RGR-RT1-D2C-01
**Hypothesis:** H-RT1 — RELATIONAL TRANSFER
**Date:** 2026-09-19
**Base canonical:** a2d32f83d872bfa6c31b4bf96c5f83cd9d9b5804
**Standing:** IMPLEMENTATION CANDIDATE · NO BENCHMARK EVIDENCE

---

## 1 · Purpose

RGR-06 freezes the confirmatory model, training, metric, uncertainty,
control, and adjudication machinery before benchmark evidence exists.

RGR-06 does not materialize RGR-RT1-D2C-01, train on it, inspect its
performance, open TEST, or open REPLICATION.

The governing principle is:

> Remove remaining implementation degrees of freedom before evidence exists.

RGR-00 through RGR-05 remain unchanged.

RGR-05 remains CLOSED / closed / CLOSED with FEASIBILITY_PASS.

Accepted RGR-05 candidate:

    07004b1198d4e534fe1d9e8d701ab3d3637d8fda

Accepted RGR-05 implementation digest:

    98597755f40316ec4b0e60318635e1ad0dd587dd0d6176147aaf36923abb731b

---

## 2 · F_R wording hierarchy

The repeated detailed RGR-04 preregistration law governs:

    F_R message-passing depth candidates:
    1 round
    2 rounds
    3 rounds

    selection:
    VALIDATION ONLY

The isolated descriptive sentence referring to exactly two rounds does not
override the explicit 1 / 2 / 3 candidate grid.

This resolves hierarchy only. It changes no hypothesis or model family.

---

## 3 · Exact observable encodings

Canonical row-major encodings are:

    U   = 6 x 16 surface matrix
    A   = 6 x 6 directed adjacency
    q_s = 6-dimensional source one-hot
    q_t = 6-dimensional target one-hot

Surface view F_S1 / F_S2:

    flatten(U), q_s, q_t

Dimension:

    96 + 6 + 6 = 108

Full view F_G / F_R:

    U, A, q_s, q_t

Flattened F_G dimension:

    96 + 36 + 6 + 6 = 144

F_R receives the same information but preserves node/edge organization.

No model receives y, latent intermediate identity, a precomputed two-hop
indicator, oracle relation identity, or hidden generator metadata.

---

## 4 · Comparator implementation lock

### F_S1

Regularized logistic classifier over the 108-dimensional surface view.

L2 values are literal lambda coefficients:

    1e-4
    1e-3
    1e-2
    1e-1

Objective:

    mean BCEWithLogits + (lambda / 2) * ||w||^2

The intercept is not L2-penalized.

Solver:

    PyTorch LBFGS
    full batch
    CPU
    float64
    zero initialization
    lr = 1.0
    max_iter = 200
    max_eval = 250
    tolerance_grad = 1e-9
    tolerance_change = 1e-12
    history_size = 100
    line_search_fn = strong_wolfe

The convex baseline is deterministic. Confirmatory seed identities therefore
do not change its fitted solution; its held-out score is reported explicitly.

### F_S2

    108 -> 256 -> 128 -> 64 -> 1
    ReLU after each hidden layer
    binary logit output

### F_G

    input = flattened 144-dimensional full observable

    G1: 144 -> 512 -> 256 -> 1
    G2: 144 -> 512 -> 256 -> 128 -> 1
    G3: 144 -> 512 -> 256 -> 128 -> 64 -> 1

ReLU follows every hidden layer.

No message passing or hand-coded relational feature exists.

### F_R

Node input:

    [u_v, q_s(v), q_t(v)] = 18 dimensions

Node encoder:

    Linear(18,64) -> ReLU

For each selected message-passing round:

    message = Linear(64,64,bias=False)(source_state)
    incoming(target) = SUM messages over directed incoming edges
    update = Linear([current_state,incoming],64) -> ReLU

Each round has its own message/update parameters. Within each round the same
parameters are shared across all nodes.

Depth candidates remain exactly:

    1
    2
    3

Readout:

    concatenate selected source hidden state and selected target hidden state
    128 -> 64 -> ReLU -> 1 binary logit

No path feature is computed or supplied.

---

## 5 · Neural optimization lock

Neural families F_S2, F_G, and F_R use:

    optimizer: AdamW
    beta1: 0.9
    beta2: 0.999
    epsilon: 1e-8
    amsgrad: false
    maximize: false
    foreach: false
    capturable: false
    differentiable: false
    fused: false
    gradient clipping: NONE
    zero_grad: set_to_none=true
    loss: BCEWithLogitsLoss
    reduction: mean

Only the frozen grid is permitted:

    learning rates:
    1e-3
    3e-4

    weight decay:
    0
    1e-4

Counts:

    F_S2 = 4
    F_G  = 3 architectures x 4 = 12
    F_R  = 3 depths x 4 = 12

No scheduler is used.

---

## 6 · Determinism and training lock

Execution device:

    CPU ONLY

Neural precision:

    float32

F_S1 solver precision:

    float64

Linear initialization:

    Xavier uniform weights
    zero biases

Model-selection initialization seeds are derived by SHA-256 from:

    RGR06|RGR-RT1-D2C-01|MODEL_SELECTION_INIT|<family>|<config-id>

Epoch shuffle seeds are derived independently from:

    RGR06|RGR-RT1-D2C-01|MODEL_SELECTION_SHUFFLE|<family>|<config-id>|<epoch>

No RGR-04 split master seed participates in model initialization or shuffling.

Batch size:

    128

Maximum epochs:

    50

Early stopping:

    patience = 5 validation epochs
    improvement = validation BA > previous best + 1e-12
    ties do not reset patience
    earliest epoch at best BA is retained
    best checkpoint is restored

Configuration selection:

    highest validation balanced accuracy
    exact ties resolved by frozen enumeration order

Model-selection data:

    TRAIN + VALIDATION only

TEST and REPLICATION are rejected by the selection interface.

---

## 7 · Confirmatory seeds

PRIMARY:

    51001
    51002
    51003
    51004
    51005

REPLICATION:

    61001
    61002
    61003
    61004
    61005

No unfavorable valid seed may be excluded.

---

## 8 · Metric lock

Implemented exactly:

    balanced accuracy
    M(F) = mean BA across five confirmatory seeds
    M(F_S) = max(M(F_S1), M(F_S2))
    Delta_transfer = M(F_R) - M(F_S)
    C_break(F)

Frozen thresholds:

    tau_min   = 0.80
    delta_min = 0.10
    kappa_min = 0.75

Paired surface theorem:

    BA(F_S1) = 0.50
    BA(F_S2) = 0.50

Floating/reporting tolerance:

    1e-12

A held-out surface theorem violation is BENCHMARK_INVALID.

---

## 9 · Hierarchical bootstrap lock

Replicates:

    10,000

Level 1:

    sample model-seed identities with replacement

Level 2:

    within each sampled seed, sample whole counterfactual pair indices
    with replacement

Pair members are never split.

Interval:

    2.5th / 97.5th percentiles

Frozen RGR-06 bootstrap seed:

    706196780616792293

The seed is an implementation reproducibility lock, not a scientific tuning
parameter.

---

## 10 · Permutation control

Frozen label-permutation seed:

    91991

Inputs remain unchanged.

The future separately trained control is evaluated against true held-out TEST
labels only after TEST is authorized.

Validity ceiling remains:

    BA <= 0.52

RGR-06 implements the mechanism but executes it on no benchmark data.

---

## 11 · Mechanical adjudication

Final outcome vocabulary is restricted to:

    SUPPORTED
    NOT_SUPPORTED
    UNDERDETERMINED
    BENCHMARK_INVALID
    REPLICATION_FAILED

Primary conditions 1-8 are represented independently and conjunctively.

If primary validity fails:

    BENCHMARK_INVALID

If primary interpretation is blocked or F_R validation BA < 0.80:

    UNDERDETERMINED

If primary is valid and competent but a frozen transfer threshold fails:

    NOT_SUPPORTED

If primary conditions 1-8 pass, final adjudication remains sealed until
REPLICATION is separately authorized.

Only a replication satisfying the same frozen conditions permits SUPPORTED.

A valid but failed replication after primary support yields:

    REPLICATION_FAILED

---

## 12 · Runtime lock

Project runtime:

    Python 3.11.14
    PyTorch 2.8.0
    NumPy 2.3.3
    CPU-only confirmatory execution

The complete resolved Python dependency closure is pinned in:

    scripts/research/rgr/requirements-rgr06.txt

The runtime exists outside the repository during RGR-06 verification.

---

## 13 · RGR-06 verification boundary

Permitted verification uses only:

- hand-authored non-benchmark tensors;
- graph fixtures with edge count different from the benchmark;
- shape and forward-pass tests;
- a bounded one-step optimizer smoke test;
- deterministic initialization tests;
- forbidden-input tests;
- metric formula tests;
- bootstrap mechanics tests;
- adjudicator truth-table tests.

The primary source contains none of the four RGR-04 split master seed literals.

It imports no RGR-05 generator.

---

## 14 · No-evidence boundary

At RGR-06 closure candidate:

    benchmark examples materialized = 0
    benchmark pairs materialized = 0
    dataset files written = 0
    benchmark model training executed = false
    benchmark performance inspected = false
    TEST executed = false
    REPLICATION executed = false

RGR-06 does not authorize the next gate.

Any future benchmark materialization requires a separately authorized Work Unit.

The RGR-03/RGR-04 no-rescue law remains fully in force.
