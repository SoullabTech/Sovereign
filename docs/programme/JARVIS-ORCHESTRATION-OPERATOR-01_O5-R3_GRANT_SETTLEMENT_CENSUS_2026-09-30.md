# JARVIS-ORCHESTRATION-OPERATOR-01 / O5-R3 — Grant Settlement / Lock Integrity · CENSUS

**Date:** 2026-09-30
**Base:** `1d5c8c84` (R2F closed)
**Class:** Census, READ-ONLY. ⛔ O5-R3 NOT OPENED · ⛔ no code changed · ⛔ no falsifier authored.
**Scope (founder-named, carried verbatim):** consume failure before/after durable result · abandoned grant
locks · CLAIMED + W4 already present · atomicity/order between result persistence, grant settlement and W4
append · crash at every boundary.

## 1. The execution path, as code orders it

`canonicalConfirmAuthorizedExecution` (`jarvis-desktop/src/work-unit-control.js`, from line 1031):

| # | Step | Durable write | Checked? |
|---|---|---|---|
| B0 | read grant standing (must be ACTIVE) | — (unlocked read) | ✅ |
| B1 | final admission; on refusal → `invalidate…` | grant `INVALIDATED` | ❌ return ignored |
| B2 | transport/containment prep; on refusal → `invalidate…` or return (grant stays ACTIVE) | grant `INVALIDATED` | ❌ return ignored |
| B3 | credential check; missing → `HELD_FOR_CREDENTIAL` (grant stays ACTIVE) | — | ✅ |
| B4 | **claim** (`withLedgerLock` → append `CLAIMED`) | grant ledger line | ✅ |
| B5 | if unit ROUTED → **transition EXECUTING** (`atomicWrite` tmp+rename); on failure → `invalidate…` | W0 envelope | transition ✅ · invalidate ❌ |
| B6 | **runner**: provider call (the effect) + `persistCanonicalDurableResult` (bare `writeFileSync`) | durable result | — |
| B7 | **consume** (`withLedgerLock` → append `CONSUMED`) | grant ledger line | ❌ **return ignored** |
| B8 | **W4 append** (`appendCanonicalExecutionResultV2` → `atomicWrite`) | W0 envelope | ✅ |

Supporting facts:
- `withLedgerLock`: `openSync(lock,'wx')` then `closeSync`, so the lock is an **empty file with no owner record**, released in `finally`.
  Contention returns `GRANT_LEDGER_BUSY`.
- Grant-ledger append: bare `appendFileSync` of one JSON line, inside the lock.
- Grant-ledger read (`readCanonicalGrantEventsV1`): **unlocked**, and it **throws** `CANONICAL_EXECUTION_GRANT_LEDGER_CORRUPT`
  on any unparseable line.
- **No `fsync`/`fdatasync` anywhere** in the grant store, the W v2 store, the durable-result writer or the W4 ledger.
- Lifecycle is forward-only: `AUTHORIZED → ROUTED → EXECUTING → EVIDENCE_READY…`, with no edge back to ROUTED.

## 2. Crash at every boundary → durable state → what R2 does today

| Crash point | Durable state left | R2 classification today | Truth |
|---|---|---|---|
| before B4 | grant ACTIVE | NONE | ✅ nothing dispatched |
| B4 torn (partial line) | ledger has an unparseable last line | GATED · `GRANT_LEDGER_UNREADABLE` (ambiguous) | ✅ honest, but see §3.2 |
| B4 → B5 (claimed, unit still **ROUTED**) | CLAIMED, lifecycle ROUTED | GATED · `W2_NOT_EXECUTING` → **authority_no_longer_sufficient** | ⚠️ **mislabelled**: the effect is **proven absent** (§3.3) |
| B5 torn | envelope intact (rename is atomic) + `.tmp-<pid>` residue | as above + `TEMP_FILE_RESIDUE` shape | ✅ |
| B6 before persist | CLAIMED, EXECUTING, no witness | GATED · `DISPATCHED_WITHOUT_WITNESS_NO_PROBE` | ✅ UNKNOWN (the provider may have been called and billed) |
| B6 persist torn | truncated result file | GATED · `DURABLE_RESULT_UNREADABLE` | ✅ UNKNOWN, never PRESENT |
| B6 → B7 | CLAIMED + witness | RECORD (settle, then W4) | ✅ |
| B7 → B8 | CONSUMED + witness, no W4 | RECORD (W4 only) | ✅ |
| B8 torn | envelope intact + residue | RECORD | ✅ |
| after B8 | converged | CONVERGED | ✅ (all 8 real grants, R2F) |

## 3. Findings

### 3.1 ⭐ CLAIMED + W4 is reachable only through concurrency

B7's refusal paths are `GRANT_LEDGER_BUSY` (another holder has the unit's lock) or `GRANT_NOT_CLAIMED` /
`GRANT_NOT_FOUND` (another writer changed the grant). A lock that goes stale during a *previous* crash would
have failed **B4** first, and a thrown filesystem error at B7 aborts before B8, leaving **CLAIMED + witness**,
which R2 records correctly. So the only way to reach "W4 written, grant CLAIMED" is **a concurrent writer to
the same unit's grant ledger at B7**: for example, authorizing another participant's grant or revoking, from a
second IPC call at the same instant.

**Consequence for sequencing:** the defect R3 was named for is a **concurrency hazard**, not a crash hazard.
It belongs with (or after) the concurrency falsifier the founder held back ("an authority + evidence race,
not merely a locking problem"). The real home has **no instance** (R2F: 8/8 `settle_grant=false`).

### 3.2 A torn grant-ledger line bricks the whole unit

`readCanonicalGrantEventsV1` throws on the first unparseable line, and every claim, consume, invalidate,
revoke and standing read goes through it. One torn append, which is possible at B4 or B7 on a hard kill
because there's no fsync and no line-level recovery, therefore makes **every grant of that unit unreadable
for live execution as well as for recovery**. R2 gates it honestly as ambiguous; nothing can repair it except
a human editing the ledger. Not observed in the real home.

### 3.3 ⭐ One boundary has an ordering-derived absence proof, which R2 does not use

The runner (the only effect-bearing step) is reachable only **after** the B5 transition, and lifecycle
never returns to ROUTED. So **grant CLAIMED ∧ unit lifecycle ROUTED ⇒ this grant's effect was never
dispatched.** This is PROVEN ABSENT without a probe, the one Path B case where R1's "absent → may act"
branch is available.

R2 today labels it `authority_no_longer_sufficient`. That is safe, since it stops, but untrue about why. The lawful
settlement for a proven-undispatched claimed grant would be **retiring the grant**, not recording anything:
it is single-use and was spent on nothing, so the operator can re-authorize. ⛔ That is a **new write action**
(an authority narrowing on the grant ledger) and needs a founder ruling. ⚠️ The proof holds **only** while the
lifecycle is ROUTED; once any grant has moved the unit to EXECUTING, a later crash between B4 and B6 is UNKNOWN again.

### 3.4 The empty lock carries no owner, so staleness is unprovable

This is the same epistemic shape as Path A's unstamped runs: an abandoned `.lock` can't be distinguished from a
live holder, so the only honest reading is "busy". The census names it (`GRANT_LEDGER_LOCK_PRESENT`). The repair
direction mirrors R2E (stamp the owner, reconcile only on proof), and it isn't taken here.

### 3.5 Four unchecked returns

B1, B2 and B5 ignore the result of `invalidate…`, and B7 ignores the result of `consume…`. For B1, B2 and B5 a lost invalidation
leaves an ACTIVE grant that **re-runs final admission** on the next confirm, so no authority leaks. It's a lost
record of intent, not a hole. B7 is §3.1.

### 3.6 No durability barrier anywhere

There is no fsync on appends, and no fsync on the file or directory around renames. A crash of the OS itself, as
opposed to the process, can lose writes that "succeeded". Every R2 classification assumes that what's on disk
is what was last written. That assumption holds for process crashes, which is the modelled case, and is
**unexamined for power loss**.

## 4. What an O5-R3 opening would carry (for adjudication, ⛔ not a design)

| Item | Nature | Suggested home |
|---|---|---|
| CLAIMED + W4 (§3.1) | concurrency | the concurrency falsifier lane, **not** a crash lane |
| proven-undispatched claimed grant (§3.3) | new recovery action: retire the grant | R3, needs a founder ruling on the write |
| torn ledger line bricks the unit (§3.2) | integrity + repairability | R3 |
| unowned lock (§3.4) | owner stamp + proof-requiring reconciliation | R3, mirroring R2E |
| unchecked invalidate returns (§3.5) | record fidelity | R3, low |
| no fsync (§3.6) | durability model | its own decision: accept "process crash only" explicitly, or add barriers |

Real-home exposure today: **none observed.** R2F found 0 locks, 0 unreadable ledgers, 0 CLAIMED + W4, and
0 claimed grants on ROUTED units.

**Standing: O5-R3 CENSUS ✅ (read-only) · ⛔ LANE NOT OPENED · ⛔ NO CODE · ⛔ NO FALSIFIERS · real-home
exposure 0 · the headline defect is concurrency-only · one probe-free absence proof found.**
