# BCS-01A · Step 6 — Checkpoint Resume · Evidence

**Date:** 2026-09-13 · **Branch:** `claude/bold-bohr-pmtynu` · **Obligation:** P6

> **A checkpoint is durable execution progress. It is not a finding, observation, coverage,
> lineage, output or authority.** ⛔ Step 6 implements no recurrence discovery.

---

## 1 · Built

```text
database/migrations/20260913000003_recurrence_sweep_checkpoints.sql
  recurrence_sweep_partitions · recurrence_sweep_checkpoints
lib/boundedCognition/recurrenceSweepStore.ts  (+ partitions, checkpoints, resume)
lib/boundedCognition/__tests__/w-checkpoint-resume.pg.test.ts   14 assertions
```

### The partition set is persisted, not just an ordinal

A checkpoint recorded as *"partition 2 completed"* is meaningless if `partition 2` can mean
something different after a restart or a code change. `recurrence_sweep_partitions` freezes the
execution plan against the commission that authorized it. ⭐ **A partition remains an execution
convenience** — that one proving partition maps to one body-scope section establishes nothing
about Work structure or developmental boundaries.

### Derivation is atomic and from the commission only

`enqueueExecution` creates the execution **and** derives its partitions in **one data-modifying
CTE** (`unnest(body_scope_section_ids) WITH ORDINALITY`). ⛔ No caller-supplied plan: *execution
may subdivide authority; it may not enlarge or rewrite it.* If partition creation fails, execution
creation fails with it — witnessed: after `scope_not_partitionable`, **zero execution rows exist**.

⭐ **A scope that cannot yield disjoint partitions REFUSES** (`UNIQUE (execution_id, section_id)`
→ `scope_not_partitionable`) rather than being silently deduplicated to obtain a plan.

## 2 · The resume witness, in one array

```text
seen === ['s1', 's2', 's2', 's3']
```

attempt 1: `s1` succeeds → checkpoint 0 · `s2` throws → **no checkpoint** · claim expires →
recovered to `queued`, **checkpoint 0 survives** · attempt 2 (different worker, attempt 2) resumes
at **`s2`, not `s1`**, then `s3`.

⭐ **Checkpointed work survives; uncheckpointed work repeats.** *The system may repeat work it
cannot prove completed; it may never skip work because an old process probably completed it.
Durability, not likelihood, licenses resume.*

## 3 · Ownership, ordering, lifecycle

- **Claim generation inherited from Step 5.** `recordCheckpoint` requires `status='running' AND
  claimed_by=$worker AND attempts=$expected`, with the execution row locked `FOR UPDATE` first —
  so a checkpoint can never commit after the claim that authorized it was revoked. Witnessed both
  ways: an obsolete attempt (same worker string) is refused `not_claim_owner`; a post-recovery
  write is refused `not_running`; a checkpoint committed **before** expiry survives it.
- **Prefix-shaped.** Only the earliest unfinished partition may be checkpointed
  (`partition_not_next`), giving the charter geometry *completed 0…N, resume at N+1* and stopping
  a caller manufacturing progress. ⛔ A proving-workload constraint, **not** a law against future
  parallel cognition — and success here does not authorize it.
- **Progress is derived, never stored.** First-unfinished is a `LEFT JOIN … IS NULL` over
  partitions and checkpoints. No `progress`, `next_partition`, `last_completed_partition`,
  `completed_count`.
- **⭐ `completeExecution` strengthened (Step-6 refinement, not a Step-4 reopening).** With a
  partitioned computation, completing with unfinished partitions would make `completed` **false
  under its own predicate**, so normal completion now requires every partition checkpointed
  (`incomplete_partitions`). `failExecution` and `observeCancellation` are non-normal terminal
  paths and keep no such condition.
- **Checkpointing the last partition does not complete the execution** — status stays `running`
  until the execution path records its terminus. *Checkpoint is progress; `completed` is the
  historical lifecycle fact.*

## 4 · ⚠️⚠️ The M8 finding — a column-absence assertion could not see the defect

The first version of this suite asserted only **schema** absence. The M8 mutation added a
**function** deriving `DevelopmentalCoverage` from checkpoint rows, and **passed every schema
assertion.**

⭐ The missing instrument was added: a comment-stripped source scan plus an export-name check over
`recurrenceSweepStore.ts`, asserting no `DevelopmentalCoverage` reference, no `coverage` token, and
no exported coverage producer. Comments are stripped first — the C21 lesson already recorded in
this repository: *a file documenting its own compliance must not read as the banned behaviour
returning.*

```text
before instrument   M8 → 14 passed  (defect invisible)
after  instrument   M8 →  1 failed, 13 passed
```

⭐⭐ **This is the second time in this lane that a structural prohibition needed a structural
instrument.** Step 3 refused coverage-from-bookkeeping by making it unwritable in the signature;
here the same prohibition needed a module-level witness, because a *derivation* has no column to
be absent from.

## 5 · Checkpoint ≠ coverage · checkpoint ≠ observation

A fully checkpointed, `completed` execution has: commission · execution · partitions ·
checkpoints — and **0 observations · 0 coverage · 0 lineage · 0 currency · 0 CMT material**.
Asserted by the table list and by a column allow-list that is exactly
`completed_at · execution_id · id · ordinal · partition_id · section_id`.

⭐ The Step-3 ruling holds through persistence: *evidence/progress may exist **and** recurrence is
not yet admissible*, with no provisional, pending or partial finding anywhere.

## 6 · Mutation evidence — eight bad implementations, eight REDs

```text
M1  checkpoint before computation              → 2 failed, 11 passed
M2  recovery deletes checkpoints               → 2 failed, 11 passed
M3  resume ignores checkpoints                 → 3 failed, 10 passed
M4  old claim may checkpoint (ABA)             → 1 failed, 12 passed
M5  premature completion                       → 1 failed, 12 passed
M6  final checkpoint auto-completes execution  → 1 failed, 12 passed
M7  partition plan differs from frozen scope   → 3 failed, 10 passed
M8  checkpoints derived into coverage          → 1 failed, 13 passed  (after §4 instrument)

RESTORED   8 suites · 85 tests · 85 passed   (Steps 2 · 3 · 4 · 5 · 6 together)
```

## 7 · Exit gate

```text
partition set derived atomically from frozen scope   GREEN
successful unit → checkpoint · failed unit → none    GREEN
expired claim preserves checkpoint                   GREEN
new claim skips checkpointed · unfinished repeats    GREEN
old claim generation cannot checkpoint               GREEN
checkpoint/claim-revocation serializes truthfully    GREEN
early completion refused · all-checkpoints ≠ done    GREEN
explicit completion after all checkpoints            GREEN
checkpoint ≠ coverage · checkpoint ≠ observation     GREEN
real PostgreSQL 16.13                                GREEN
M1–M8                                                RED
```

⭐ **Step 6 closes. Next: frozen input lineage + currency** — ⛔ not recurrence discovery.

## 8 · Owed / not established

```text
⛔ project gates        npm run typecheck · npm run test still not run (no node_modules here)
⛔ prior witnesses restated, not weakened — the Step-4 and Step-5 suites now checkpoint their
   partitions before normal completion, and the Step-4 table-list assertion admits the two new
   execution tables. Recorded because an assertion that changes is a claim that changed
⛔ no recurrence discovery · no model call · no manuscript interpretation
⛔ no parallel partition execution authorized by the prefix constraint
⛔ no worker-loop autonomy · no production readiness
⛔ Step-4 M5 divergent-read half still owed
```
