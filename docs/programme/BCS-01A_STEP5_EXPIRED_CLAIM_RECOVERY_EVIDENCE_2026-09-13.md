# BCS-01A · Step 5 — Expired-Claim Recovery · Evidence

**Date:** 2026-09-13 · **Branch:** `claude/bold-bohr-pmtynu`
**Acceptance obligation:** P5 — crash recovery (charter capability name)
**Implementation term:** ⭐ **expired-claim recovery**

> **A missed heartbeat does not establish that a process crashed.** It establishes only that the
> durable store no longer recognizes this claim as sufficiently live to retain ownership.
> ⛔ No `crashed` state is stored, because none can be truthfully established. **BCS-M1 doing
> useful work again.**

---

## 1 · The Step-4 defect, repaired here

Step 4 left `claimed_by` / `claimed_at` / `heartbeat_at` populated after `completed`, `failed` and
`cancelled`. ⚠️ **Semantically wider than their Step-4 predicate** — the names describe the
**current** claim, and a terminal row would silently convert them into *historical last claim*.

⛔ **Not a contract challenge.** An implementation defect revealed by the next responsibility, so
it was repaired inside Step 5 rather than reopening Step 4. All terminal transitions now clear
them, and the database enforces it:

```sql
CHECK ((status = 'running'  AND claimed_by IS NOT NULL AND claimed_at IS NOT NULL AND heartbeat_at IS NOT NULL)
    OR (status <> 'running' AND claimed_by IS NULL     AND claimed_at IS NULL     AND heartbeat_at IS NULL))
```

⭐ If worker-attribution history is later required, it earns a separately named representation.

## 2 · ⭐⭐ `attempts` as claim generation — the ABA guard

Once reaping exists, **`claimed_by = worker` is no longer sufficient ownership evidence**: the
same worker string can hold a later claim. A successful claim already increments `attempts`
atomically, so that number identifies one claim incarnation. ⛔ No `claim_token` column was
introduced.

Every worker-owned operation — `heartbeat`, `complete`, `fail`, `observeCancellation` — now
requires `status = 'running' AND claimed_by = $worker AND attempts = $expectedAttempt`.

```text
worker A · attempt 1 → expires → queued → worker A · attempt 2
old A/attempt-1 complete()  → REFUSED
new A/attempt-2 complete()  → PERMITTED
```

## 3 · Durable invariants added

```text
attempts >= 0 · max_attempts >= 1 · attempts <= max_attempts
status = 'queued' → attempts < max_attempts
```

⭐ The second makes the word truthful: a `queued` row at its attempt ceiling could never be
claimed, so `queued` would be false. **The database makes that state unrepresentable.**

## 4 · Recovery lives in PostgreSQL

`fn_recover_expired_recurrence_sweep_claims(INTERVAL)` — recurrence-specific, ⛔ no generic job
reaper. It uses the same clock that stamps heartbeats, owns concurrency via `FOR UPDATE SKIP
LOCKED`, and rejects a non-positive interval.

```text
attempts remain    running → queued, current-claim fields cleared
budget exhausted   running → failed + finished_at, current-claim fields cleared
```

⭐ **Recovery never:** refunds an attempt (the expired claim happened; it stays counted) · rewrites
`queued_at` (its predicate is *first became eligible*, so FIFO may honestly favour an older
recovered execution) · deletes a cancel request · sets `cancelled` · creates an execution · mints
a commission.

⭐ **`failed` needs no new terminal state.** It already means *terminated without normal completion
and not by an accepted cancellation* — true here, and it claims nothing about an OS process.

## 5 · Real-PostgreSQL witness — 14 assertions

| | Result |
|---|---|
| **A** healthy claim | fresh heartbeat → `recovered = 0`, still `running`, same claimant, attempt 1 — ⭐ a reaper that requeued everything could not pass |
| **B** expired recoverable | `running → queued` · attempts **unchanged** · claim fields cleared · **`queued_at` unchanged** |
| **C** claim again | same execution id, attempts 1 → 2, new claimant and claim time |
| **D** ABA | same worker string, later attempt: old identity refused on `complete` and `heartbeat`; current identity permitted |
| **E** exhausted | `running → failed`, `finished_at` set, claim fields cleared, not claimable |
| **F** cancellation survives | requeue keeps status `queued` — ⛔ **not** `cancelled` — and the request row survives as evidence of the act |
| **G** later observation | next claimant observes the preserved request and truthfully cancels |
| **F′** exhausted + request | terminal state is **`failed`**: no execution path observed the request and terminated because of it. *The request is evidence of the act; it does not manufacture the lifecycle fact.* |
| **H** concurrent reapers | two connections, `ra + rb === 1`, attempts still 1 |
| **I** terminal never recovered | a long-finished `completed` row → `recovered = 0` |
| **J** creates nothing | execution count 1, commission count 1 |
| **K** invariants | a terminal row rejects a `claimed_by` write; a `queued` row rejects sitting at its ceiling |

## 6 · Mutation evidence — seven bad implementations, seven REDs

```text
M1  heartbeat-age predicate defeated (healthy claim reaped) → 1 failed, 13 passed
M2  attempt refunded on requeue                             → 4 failed, 10 passed
M3  ownership by claimed_by only (ABA)                      → 3 failed, 11 passed
M4  exhausted claim requeued instead of failed              → 3 failed, 11 passed
M5  reaper promotes a cancel request to `cancelled`         → 2 failed, 12 passed
M6  `queued_at` restamped on requeue                        → 1 failed, 13 passed
M7  terminal transitions retain current-claim fields        → 3 failed, 11 passed

RESTORED   7 suites · 71 tests · 71 passed (Step 2 · 3 · 4 · 5 together)
```

⭐ **M2 failing four assertions** is the useful signal: refunding an attempt breaks the budget
invariant, the exhausted-claim path and the ABA generation at once — the three are one mechanism.

## 7 · Exit gate

```text
P5 expired-claim recovery        GREEN      healthy-claim non-recovery   GREEN
attempt budget                   GREEN      ABA old-claim refusal        GREEN
cancellation separation          GREEN      concurrent reapers           GREEN
real PostgreSQL 16.13            GREEN      M1–M7                        RED
```

⭐ **Step 5 closes. Next: checkpoint resume** — ⛔ not recurrence discovery.

## 8 · Owed / not established

```text
⛔ project gates       npm run typecheck · npm run test not run (no node_modules in this env)
⛔ no crash claim      nothing here establishes that any OS process died or stopped computing
⛔ no worker loop      recovery is invoked by the witness; no autonomous reaper loop is wired
⛔ no partial work     recovery restarts whatever computation will exist. Deliberate: crash
                       recovery stops a dead claim stranding an execution; it does not yet
                       prevent repeated work. Step 6 solves that
⛔ no checkpoint / coverage / observation / output / lineage / currency / producer columns
⛔ M5 divergent read   still owed from Step 4 (schema prohibition proved; read path not wired)
```

⚠️ **One implementation note:** migration `…0002` was made **idempotent** (constraint guards) after
two witness suites applied it in the same database. That matches the repository's existing
migration-idempotency practice and is recorded rather than left as an incidental edit.
