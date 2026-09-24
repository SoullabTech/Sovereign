# H7h — Material-Dimension Attention

**Experiment:** `H7h-HELDOUT-01`  
**Status:** OFFLINE R&D ONLY  
**Verdict:** **CONFIRMED, BOUNDED**

No production prompt, cognition, memory, schema, routing, validator, model, or egress change is authorized by this experiment.

## Frozen question

> Given already-typed relational evidence, does materiality-aware selection preserve governing surrounding structure better than standing-aware query relevance or generic axis diversity?

This experiment does **not** test whether MAIA can infer materiality correctly from raw prose. Materiality metadata was supplied to the selector before scoring. The result therefore bears on **attention/selection**, not on **materiality acquisition**.

## Frozen spec

SHA-256: `81c7a155dcbc68fba86c8a15807b06489d66bd4a6ffb9ba23117eea583ffb362`

Conditions:

- **B** — TF-IDF query relevance + standing/provenance
- **C** — B + generic unseen-axis diversity
- **D_low** — B + 0.20 × typed materiality
- **D_mid** — B + 0.35 × typed materiality
- **D_high** — B + 0.50 × typed materiality

Six fresh historical replay cases were used, excluding the H7e/H7f/H7g cases:

1. signup end-to-end truth
2. legacy delete-memory truth
3. voice-quota causality
4. Voice Evolution identity boundary
5. governance liveness
6. relational handoff lifetime

Each case contained six source-backed candidate facts, three frozen gold features, one primary target, and one designated material-surrounding target.

## Aggregate result

| Metric | B | C | D_low | D_mid | D_high |
|---|---:|---:|---:|---:|---:|
| Gold-feature recall | 15/18 | 15/18 | **18/18** | **18/18** | 17/18 |
| Primary targets retained | 6/6 | 6/6 | **6/6** | **6/6** | 5/6 |
| Material-surrounding targets retained | 4/6 | 4/6 | **6/6** | **6/6** | **6/6** |
| New materiality=0 selections vs B | — | — | 0 | **0** | 0 |

## Frozen promotion checks

- **PASS** — D_mid gold recall > B: 18/18 > 15/18
- **PASS** — D_mid gold recall > C: 18/18 > 15/18
- **PASS** — D_mid material-surrounding recall ≥ 5/6: **6/6**
- **PASS** — D_low, D_mid, D_high each no worse than B on total recall: 18, 18, 17 vs 15
- **PASS** — D_mid primary worse than B on ≤1/6: **0/6 worse**
- **PASS** — D_mid introduces zero new materiality=0 selections: **0**

All frozen promotion checks pass.

## Per-case selections

### 1. SIGNUP_END_TO_END

Gold: `s_accept · s_arrival · s_completion`

- B: `s_completion · s_accept · s_arrival`
- C: `s_completion · s_accept · s_arrival`
- D_low: `s_completion · s_arrival · s_accept`
- D_mid: `s_completion · s_arrival · s_accept`
- D_high: `s_completion · s_arrival · s_stalls`

Important sensitivity finding: at high materiality weight, the contextual outcome fact `s_stalls` displaced the present-act transport fact `s_accept`. Materiality helped until it became strong enough to compete with the present encounter itself.

### 2. DELETE_MEMORY_TRUTH

Gold: `d_void · d_survival · d_paths`

- B: `d_paths · d_void · d_survival`
- C: `d_paths · d_void · d_survival`
- D_low: `d_paths · d_void · d_survival`
- D_mid: `d_void · d_paths · d_survival`
- D_high: `d_void · d_paths · d_survival`

All conditions retained the governing deletion truth.

### 3. VOICE_QUOTA_CAUSALITY

Gold: `q_notcause · q_wallclock · q_deadline`

- B: `q_notcause · q_wallclock · q_failfast`
- C: `q_notcause · q_wallclock · q_failfast`
- D_low: `q_notcause · q_wallclock · q_deadline`
- D_mid: `q_notcause · q_wallclock · q_deadline`
- D_high: `q_notcause · q_wallclock · q_deadline`

Materiality recovered the missing deadline mechanism: the stall did not cause the earlier 429, but the absent deadline made the stall possible and wall-clock accounting made the stall poison later quota.

### 4. VOICE_EVOLUTION_IDENTITY

Gold: `v_same · v_reject · v_system`

All five conditions selected all three gold features.

This is a control-like case: query relevance and standing were already sufficient, so materiality added no distortion at low or medium weight.

### 5. GOVERNANCE_LIVENESS

Gold: `g_no · g_live · g_exists`

- B: `g_no · g_live · g_schema`
- C: `g_no · g_live · g_schema`
- D_low: `g_no · g_live · g_exists`
- D_mid: `g_no · g_live · g_exists`
- D_high: `g_no · g_live · g_exists`

Materiality displaced a descriptive evidence-schema fact with the governing authority distinction: existence is not participation, and participation is not decision authority.

### 6. RELATIONAL_HANDOFF_LIFETIME

Gold: `r_onepost · r_recency · r_seed`

- B: `r_onepost · r_noname · r_recency`
- C: `r_onepost · r_noname · r_recency`
- D_low: `r_onepost · r_recency · r_seed`
- D_mid: `r_onepost · r_recency · r_seed`
- D_high: `r_onepost · r_recency · r_seed`

Materiality retained the transition semantics of the handoff rather than spending the third slot on a true but less governing disclosure constraint.

## Development-set diagnostic

The original H7g five-case set was **not** counted as confirmatory evidence because H7h was derived from its failures. It was used only as a repair diagnostic.

The materiality formulation directly addresses both known H7g failure classes:

- Writer's Studio: preserve the inspiration/creative-process dimension because omitting it changes the shape of the work, rather than selecting any merely different axis.
- Research boundary: preserve the evidence-status and no-production-change constraints because omitting either changes what action is warranted.

That diagnostic is supportive but intentionally excluded from the held-out promotion numbers.

## Interpretation

### 1. H7h confirms the missing distinction in H7g

Generic diversity asks:

> Is this different from what is already selected?

Materiality asks:

> If this disappears, does the warranted meaning, constraint, causal account, or next permissible action change?

The held-out result supports the second formulation.

### 2. Standing and materiality do different jobs

Standing answers:

> How is MAIA entitled to hold this candidate?

Materiality answers:

> If this candidate is omitted from the present projection, does the projection become materially misleading or incomplete?

A fact can have excellent standing and still not deserve scarce foreground space in the present turn.

### 3. Materiality is not new epistemic authority

The high-weight condition exposed the danger. In `SIGNUP_END_TO_END`, stronger materiality weighting displaced the provider-acceptance fact that anchored the member's actual question.

Therefore:

> **Materiality may preserve governing surrounding structure; it may not displace the present encounter that gives the projection its point of view.**

Or more compactly:

> **Present relevance anchors attention. Standing governs admissibility. Materiality prevents consequential collapse.**

### 4. Candidate architecture

```text
PRIMARY EVIDENCE
      ↓
ADMITTED RELATIONAL FIELD
      ↓
CURRENT MEMBER ACT
      ↓
PRIMARY RELEVANCE ANCHOR
      ↓
STANDING / PROVENANCE
      ↓
MATERIALITY PRESERVATION
      ↓
SMALL DISPOSABLE GESTALT
      ↓
FREE SYNTHESIS
```

This is stronger than generic dimensional coverage because the surrounding structure is retained for a reason, not simply because it is different.

## What is not proven

H7h does **not** establish that:

- MAIA can reliably infer materiality from untyped raw evidence;
- the frozen materiality scale is optimal;
- the 0.35 weight should become a production constant;
- three slots is the correct production projection size;
- TF-IDF resembles the production selector;
- the six replay cases predict live conversational behavior;
- materiality should override query relevance;
- any production implementation is authorized.

The strongest bounded result is:

> **When materiality is already correctly typed, using it as a moderate attention factor improved held-out projection fidelity over standing-aware relevance and generic diversity in this replay. Making materiality too strong began to suppress the present-act anchor.**

## Successor gate

Candidate successor:

### `H7i — Materiality Acquisition + Primary Anchor`

Two questions must now be separated:

1. **Acquisition:** Can materiality type/strength be derived from evidence and typed relations without reading the gold answer into the field?
2. **Projection invariant:** Does reserving the primary present-act anchor prevent materiality from becoming a new form of tunnel vision?

No implementation should open before those are tested on a new held-out corpus.
