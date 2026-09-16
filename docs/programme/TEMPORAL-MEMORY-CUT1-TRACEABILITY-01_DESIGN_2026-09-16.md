# TEMPORAL-MEMORY-CUT1-TRACEABILITY-01 — DESIGN

**Date:** 2026-09-16  
**Status:** ⭐ DESIGN COMPLETE · implementation not opened · production untouched  
**Authority:** founder delegated architecture choice for this lane on 2026-09-16. This record spends that design authority only. It does **not** authorize a schema migration, merge, deploy, ranking change, or scorer redesign.

> **Traceability is the instrument for future reconciliation, not the reconciliation itself.**

This design inherits the charter and census in
`TEMPORAL-MEMORY-CUT1-TRACEABILITY-01_CHARTER_AND_CENSUS_2026-09-16.md` and the ratified temporal law from `TEMPORAL-MEMORY-RECONCILIATION-01`.

---

## 1. The problem, now bounded

The live non-vector developmental-memory path decides Cut 1 inside PostgreSQL:

```text
eligible developmental memories
        ↓
live decay-bearing score
        ↓
ORDER BY score DESC LIMIT 12
        ↓
Node / MemoryBundle
```

Rows below that cut never enter application memory. ACT 2 established that the decay-bearing score changes top-12 membership for some members. The row remains recoverable, but the historical turn contains no durable record of which otherwise-valid rows decay excluded.

The lane has one acceptance question:

> For a historical turn, can we answer **which otherwise-valid memories would have crossed Cut 1 if the decay factor had been neutral, but did not cross under the live decay-bearing ranking — and why — without reconstructing the turn from current database state?**

---

## 2. Design rulings

### D1 — the trace gets its own address

⛔ Do not overload `conversation_memory_uses` and do not add a new `used_as` value.

That table records retrieved/surviving memories. A causal exclusion is a different event. Production's open `used_as` vocabulary is a governance hazard, not semantic permission.

### D2 — trace the causal difference, not the rejected pool

The trace does **not** persist `eligible_pool − live_top12`. That set is unbounded and mostly records the ordinary fact that bounded retrieval has a limit.

The only authorized exclusion set is:

```text
live_top12           = top 12 under the production decay-bearing score
neutral_top12        = top 12 over the same eligible pool and same score,
                       with only the decay factor held at 1

decay_excluded       = neutral_top12 − live_top12
```

Therefore `0 <= |decay_excluded| <= 12` for one Cut-1 run.

### D3 — a durable zero is required

An exclusions table alone cannot distinguish:

```text
0 exclusions
from
trace did not run / trace write failed
```

Every eligible traced turn therefore requires a **trace-run header**, even when the causal exclusion set is empty.

### D4 — observation is downstream of decision

The production selection is decided before the durable trace is written. Trace failure must never change retrieval.

A trace-write failure is emitted as a structured operational failure and retrieval proceeds unchanged. A failed trace is a traceability gap; it is never repaired by inventing a historical result later.

### D5 — same statement snapshot, no historical reconstruction

The live top 12 and neutral-decay top 12 must be computed from the **same PostgreSQL statement snapshot**. The neutral comparison is returned as observational metadata alongside the already-decided live rows.

No second later query may stand in for the historical comparison: data may have changed by then.

---

## 3. Selected mechanism

### 3.1 Read side — one statement, two views of the same pool

The non-vector retrieval becomes one read statement with three logical components:

```text
A. live_top12
   — preserves the current eligibility predicate
   — preserves the current live score expression
   — preserves ORDER BY live score DESC
   — preserves LIMIT 12

B. neutral_top12
   — identical eligibility predicate
   — identical scoring terms and weights
   — only calculate_decayed_confidence(...) is neutralized to factor 1
   — LIMIT 12

C. causal_diff
   neutral_top12 LEFT ANTI JOIN live_top12 by memory id
```

The externally returned developmental-memory candidates remain the rows from `live_top12` only. `causal_diff` is metadata for observation; it is not merged into the candidate set and cannot participate in `rankCandidates`, `deduplicate`, or the later `maxBullets` cut.

The implementation must not compute the neutral comparison by changing the live score, by removing the 0.40 term, or by using a later database snapshot. Neutralization means the decay factor is held at `1` while the term and its weight remain present, matching the verified ACT 2 witness.

### 3.2 Write side — append-only trace event

Two narrow durable objects are specified.

#### `memory_cut1_trace_runs`

One row per traced Cut-1 invocation.

Minimum fields:

```text
id                     UUID primary key
user_id                member identifier
session_id             invocation/session identifier
message_id             existing trace/turn identifier
policy_key              closed value: developmental_nonvector_decay_v1
cutoff                  integer, required = 12 for this policy
eligible_count          integer >= 0
live_count              integer 0..12
neutral_count           integer 0..12
exclusion_count         integer 0..12
captured_at             timestamptz
```

The header is the durable proof that observation ran, including the zero-exclusion case.

#### `memory_cut1_decay_exclusions`

Zero to twelve rows per completed trace run.

Minimum fields:

```text
trace_run_id            FK → memory_cut1_trace_runs.id
memory_id               developmental_memories.id
reason                   closed value: decay_cut1_exclusion
neutral_rank             integer 1..12
live_score               double precision
neutral_score            double precision
created_at               timestamptz
```

Unique key: `(trace_run_id, memory_id)`.

No memory body, summary, embedding, psychological label, or inferred meaning is stored in either trace object.

### 3.3 Why no displaced-memory pair is stored

When multiple rows cross the boundary, assigning `excluded X ↔ displaced Y` creates a pair relation the ranking did not actually assert. The causal statement is set-level:

> X is in neutral top 12 and not in live top 12.

That is sufficient. The design refuses to manufacture a one-to-one displacement relation for explanatory convenience.

### 3.4 Write ordering and failure semantics

```text
1. PostgreSQL read statement determines live_top12 + causal_diff.
2. Application materializes the live candidates exactly as today.
3. Application attempts one atomic trace transaction:
      insert trace-run header
      insert 0..12 exclusion children
4. If trace transaction succeeds → trace complete.
5. If trace transaction fails → roll back trace transaction, emit structured
   `cut1_trace_write_failed`, and continue with the already-decided live candidates.
```

The trace transaction must never wrap or roll back the retrieval decision.

A later replay may not synthesize the missing trace from current state. Historical absence remains an explicit observability failure.

---

## 4. Closed vocabularies

This lane introduces exactly two semantic constants:

```text
policy_key = developmental_nonvector_decay_v1
reason     = decay_cut1_exclusion
```

Both are closed by schema-level CHECKs in any implementation. The open `conversation_memory_uses.used_as` vocabulary is not reused and is not repaired in this lane.

No generic `excluded`, `withheld`, `suppressed`, `irrelevant`, or `stale` value is admitted. Those words carry different authority and would widen the lane.

---

## 5. Falsifiers — the observer must not perturb the observed system

An implementation candidate fails if any of these fail.

### F1 — selected identity
For the same database state and input, trace OFF and trace ON return the same ordered live developmental-memory IDs.

### F2 — selected order
The order of those IDs is identical.

### F3 — live scores
The live score returned for every selected ID is identical within the database type's exact representation; no reweighted or recomputed application score may substitute.

### F4 — boundary
The trace path returns no more and no fewer live rows than the uninstrumented path. `LIMIT 12` remains the production cut.

### F5 — trace failure independence
Force trace persistence to fail. Retrieval must return the same IDs, order, and live scores as trace OFF.

### F6 — durable zero
Construct a pool where live and neutral top 12 are identical. A trace-run header with `exclusion_count = 0` must persist and no exclusion child may exist.

### F7 — bounded volume
For every trace run, exclusion children are `<= 12`. Any candidate that writes the rejected pool fails.

### F8 — historical traceability
After a traced turn, mutate later database state so a present-day counterfactual would differ. The stored trace must still answer the historical turn's exclusion question without consulting current ranking state.

### F9 — idempotence
A retry of the same traced invocation must not manufacture duplicate exclusion events. The implementation must define one stable idempotency key from the existing per-turn identifiers before build authority is granted.

### F10 — content minimization
No memory body or member-authored prose enters the trace tables or failure log.

### F11 — no downstream authority
Removing the trace objects from the returned application structure must alter observability only. No prompt, candidate list, ranking, permission gate, or model input may depend on trace success.

---

## 6. Acceptance witness

The first implementation witness must compare the **unmodified pre-instrumentation query** with the instrumented candidate over the same fixture/database state and report:

```text
selected ids          exact equality
selected order        exact equality
live scores           exact equality
selected count        exact equality
causal exclusions     expected set
zero case             durable header witnessed
forced trace failure  selection unchanged
max-volume case       <= 12 child rows
historical mutation   stored trace remains sufficient
```

A green functional test without the OFF/ON equivalence comparison is insufficient.

---

## 7. Schema authority boundary

The selected design requires new durable relations and therefore a migration.

Per programme governance, a migration is not treated as a routine implementation detail. **This record authorizes the schema shape as the selected design; it does not authorize creating, merging, or deploying the migration.** The schema act is a separate authority boundary because a merged migration can acquire deployment consequence on a later ordinary deploy.

Everything that can be decided before that boundary is decided here.

---

## 8. Standing

```text
lane .................................. OPEN
diagnostic inheritance ................ ✅ BOUND
substrate census ....................... ✅ COMPLETE
design ................................ ⭐ COMPLETE
object placement ....................... ✅ OWN TRACE OBJECTS
open used_as reused .................... ❌ REFUSED
unbounded rejected-pool logging ........ ❌ REFUSED
durable zero ........................... ✅ REQUIRED
causal exclusion bound ................. ✅ 0..12 / run
observer perturbation falsifiers ....... ✅ PREDECLARED
ranking / coefficient / LIMIT change ... ⛔ OUT OF SCOPE
Cut 2 ................................. ⛔ OUT OF SCOPE
schema migration ....................... ⛔ REQUIRES SEPARATE SCHEMA ACT
implementation ........................ ⛔ NOT YET OPENED
production ............................ UNTOUCHED
```
