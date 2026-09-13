# BCS-01A · Step 4 — Minimum Durable Execution · Evidence

**Date:** 2026-09-13 · **Branch:** `claude/bold-bohr-pmtynu`
**Prior:** Step 2 RED witnesses · Step 3 admission boundary · Step-3 two-unit ruling
**Proves:** P1 · P2 · durable core of P4 · durable form of P7
**Does not prove:** crash recovery · checkpoint resume · recurrence discovery · lineage ·
currency · CMT participation

---

## 1 · What was built

```text
database/migrations/20260913000001_recurrence_sweep_execution.sql
  recurrence_sweep_commissions · recurrence_sweep_executions · recurrence_sweep_cancel_requests

lib/boundedCognition/recurrenceSweepStore.ts
lib/boundedCognition/__tests__/w-durable-execution.pg.test.ts   14 assertions, real PostgreSQL
```

⭐ **Schema is recurrence-specific by ruling.** No `bounded_cognition_jobs`, no
`cognition_executions`, no `universal_commissions`. **Mechanics borrowed from `media_jobs`;
meaning borrowed from BCS-01A** — `running`, never `processing`, because Step 2 already gave that
word an exact predicate and the cancellation semantics are built on it.

## 2 · The two structural decisions

### `consumed` is not persisted — the execution's existence is the fact

```sql
commission_id UUID NOT NULL UNIQUE REFERENCES recurrence_sweep_commissions(id)
```

```text
no execution row → not consumed        execution row exists → consumed
```

⭐ There is no second mutable truth to drift. ⭐ `enqueueExecution` does **not** check-then-insert
— it inserts and translates `23505` into `commission_already_executed`, because a check-then-insert
could be lost to a concurrent second request. **The constraint is the gate; the translation is
only truthful reporting.**

### `authorization_basis` is the commission reference, not prose

The execution row carries `commission_id` and nothing else about authority. Member authority, body
scope, frozen revision and maximum jurisdiction resolve **through** the immutable commission and
are never restated as authoritative copies.

## 3 · Absence is part of the subject, and is asserted

Two assertions read `information_schema.columns` and require these to be **absent**:

```text
commissions   coverage · consumed · current_protection · effective_permission
executions    consumed · max_jurisdiction · body_scope_section_ids · authorization_basis ·
              coverage · checkpoint · progress · input_data · output_data · lineage ·
              currency · stale · producer · depends_on · priority · metadata
```

⭐ **This is not future-proofing left out; it is future authority deliberately not pre-claimed.**
A later step that earns one of these words must add it deliberately, and the assertion will make
that visible.

⭐ **`coverage` is absent from the commission on purpose.** `body_scope_section_ids` is what the
execution was **authorized to read**. Coverage is what an execution **actually read**, is owed only
when real work reads material, and is never seeded from the commission.

⭐ **No current-protection snapshot.** The commission stores `max_jurisdiction` — the ceiling the
act authorized. Effective permission remains `frozen ∩ current NOW`, evaluated at the governed act
by the Step-2 provider seam.

## 4 · Real-PostgreSQL witness

```text
PostgreSQL 16.13, disposable cluster, migration applied, truncated between tests
```

| | Result |
|---|---|
| **A · commission** | frozen identity reads back exactly; `commissionIsUnconsumed` true; forbidden columns absent |
| **B · one-shot** | first execution created · second refused `commission_already_executed` · no mutable flag exists |
| **C · claim** | two concurrent workers on two connections → **exactly one** wins; `running`, `attempts 1`, one `claimed_by`, `claimed_at`/`heartbeat_at` set, `finished_at` null; a running execution is not claimable again |
| **D · heartbeat** | owner refreshes · foreign worker `not_claim_owner` · terminal execution refused |
| **E/F · terminal** | `completed`/`failed` set `finished_at` and are unclaimable; ⭐ a completed execution finishes with **no epistemic output at all** — asserted by the table list |
| **G · cancellation** | request written → status **still `running`**, `finished_at` null → foreign worker refused → claiming worker observes → `cancelled` + `finished_at`; no request → `no_cancel_request`; completed → `already_terminal` |

⭐ **C proves the database owns concurrency, not a mock** — two real connections, `Promise.all`,
`FOR UPDATE SKIP LOCKED`. ⭐ **G is the Step-2 interval reproduced in persistence**: the request is
a row in a different table, and the lifecycle fact stays untouched until the claimant terminates.

## 5 · Mutation evidence

```text
M1  UNIQUE removed from commission_id              → Tests: 1 failed, 13 passed
M2  cancel request also sets status = cancelled    → Tests: 2 failed, 12 passed
M3  claim ignores queue state                      → Tests: 4 failed, 10 passed
M4  heartbeat drops claimed_by ownership           → Tests: 1 failed, 13 passed
M5  duplicate max_jurisdiction column on execution → Tests: 1 failed, 13 passed

RESTORED   pg witness 14/14 · non-pg suites 5 · 43/43
```

⚠️ **M5 is narrower than the act specified, and is named rather than glossed.** The act asks for a
mutable execution-side authority copy **that authorization then reads instead of the commission**.
Step 4 has no durable authorization read to corrupt — `authorizeExecution` is still the Step-2
in-memory function. M5 therefore proves the **schema-level** prohibition: adding the duplicate
column REDs the witness. ⛔ **The divergent-read half is owed** at the step that wires durable
authorization, and is recorded here as unproved rather than counted as proved.

## 6 · Exit gate

```text
P1  durable commission independently observable            GREEN
P2  frozen Work identity recoverable                       GREEN
P4  enqueue · concurrent claim · worker identity ·
    heartbeat · bounded attempts · terminal states         GREEN
P7  durable request ≠ cancelled state                      GREEN
M1–M5 known-bad implementations                            RED
REAL POSTGRES WITNESS                                      GREEN
```

⭐ **Step 4 closes. Next: crash recovery** — ⛔ not checkpoint resume.

## 7 · Owed / not established

```text
⛔ project gates      npm run typecheck · npm run test not run (no node_modules in this env)
⛔ FK to app tables   member/manuscript/draft ids are typed UUID with no FK to the app schema,
                      so the witness can run on a disposable database. A production migration
                      must revisit this deliberately — recorded, not silently accepted
⛔ M5 divergent read  schema prohibition proved; the read-path half is owed
⛔ no reaping         heartbeat records liveness truthfully and reaps nothing; crash recovery is
                      the next responsibility and was not smuggled in
⛔ no checkpoint      no checkpoint table, column or blob exists — Step 6 earns that
⛔ no outputs         no observation, coverage, lineage or currency is persisted. A completed
                      execution with no epistemic output is the persistence-layer form of
                      execution ≠ participation · completion ≠ finding
⛔ no terminal→queued no transition returns a terminal execution to the queue in Step 4
```
