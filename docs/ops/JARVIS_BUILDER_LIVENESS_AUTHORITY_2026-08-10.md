# JARVIS — BUILDER OS LIVENESS AUTHORITY + HEARTBEAT RECOVERY REPAIR

**Date:** 2026-08-10
**Mode:** PROVE → DESIGN → IMPLEMENT MINIMUM GOVERNANCE REPAIR → TEST → CORRECT → RE-TEST → STOP
**Scope:** Builder OS claim liveness / heartbeat / recovery only. No MAIA application work.
**Builder claim:** `s-2f2cf54d` · unit `builder-liveness-authority-repair` · mode write · branch `chore/builder-liveness-authority-repair` · worktree `~/.claude/worktrees/ain-builder-liveness-authority-repair` · baseline `54809f99` / dirty 0
**Admission:** `--override` (authorized bootstrap exception — see §0.1)
**WU-009:** PAUSED. **Bloom:** PAUSED. **Legacy migration:** PAUSED.

---

## 0. Why this unit exists

Builder OS reached a capacity deadlock that it could not diagnose without corrupting its
own evidence. Two independent defects combined:

1. **Observation mutated liveness.** `check` refreshed `last_heartbeat` on the claim it was
   inspecting. Auditing a claim for staleness made it fresh.
2. **Heartbeat had no speaker.** Any process on the host that knew a session id could
   refresh any lease. `owner()` is `user@host`, which on a single-user machine resolves
   identically for every concurrent lane and therefore cannot distinguish them.

Together these made a claim with a dead registered process **permanently unrecoverable**
while it continued to consume a capacity slot: `recoverable` requires
`heartbeat_age_s > stale_after_s`, and any writer polling faster than the interval — including
an investigator — reset that age to zero.

### 0.1 Admission exception

Normal acquisition was impossible: capacity was 2/2 and both slots were held by claims whose
registered processes were dead. The repair could not acquire a claim through the mechanism it
existed to fix. A founder-authorized `--override` was used, recorded in the ledger and the
session record.

| Field | Value |
|---|---|
| `override_used` | true |
| `normal_capacity_at_open` | 2 / 2 |
| `defect_class` | heartbeat authority · observer mutation · lease deadlock |
| `claims_bypassed` | capacity only |
| `claims_recovered` | **none** |
| pre-flight | normal `open` refused (verified); both existing claim records byte-identical before and after (verified); isolated worktree used so no write entered another lane's claimed tree |

---

## 1. Defect reproduction

Reproduced hermetically (`/tmp` home, `/tmp` repo, `BUILDER_STALE_AFTER_S=5`), touching no
production claim.

### D1 — audit observation mutates liveness evidence — **CONFIRMED**

```
T0 08:56:31  raw=08:56:18.600
T1 08:57:01  raw=08:56:18.600   ← 30s idle, unchanged (no autonomous writer)
T2 08:57:02  raw=08:57:02.098   ← immediately after `check`   ★ MUTATED
T3 08:57:02  raw=08:57:02.098   ← after `status` (status was already observational)
```

Exact site: `scripts/builder/session.mjs:319` (pre-repair) — `rec.last_heartbeat = nowISO()`
inside `cmdCheck`, in the `moved.length === 0` branch.

### D2 — PID / heartbeat decoupling — **CONFIRMED**

With the registered pid forced to a non-existent process, a **non-owner** `check` refreshed
the lease:

```
registered pid 999999 (dead)   pid_alive=false  hb_age_s=0.4  recoverable=false
after non-owner `check`:       pid_alive=false  hb_age_s=0.0  recoverable=false
```

Independently observed in production: `s-2aece444`'s heartbeat advanced autonomously at
`08:59:17.117Z` during a four-minute window in which the investigator invoked nothing —
cadence `08:50:06 → 08:53:15 → 08:56:18 → 08:59:17` (189s, 183s, 179s). Writer identity was
never established: sub-200ms process, invisible to 0.2s polling and to `pgrep -f session.mjs`;
no cron entry; no launchd job.

### D3 — permanent non-recoverability — **CONFIRMED**

```
after 7s quiet (threshold 5s):  hb_age_s=7.1  recoverable=TRUE
observer #1 (check):            hb_age_s=0.0  recoverable=FALSE
observer #2..4:                 hb_age_s=0.0  recoverable=FALSE
```

A claim that had legitimately aged into recoverability was pushed back out of it, repeatedly,
by nothing but being looked at. Any writer polling faster than `stale_after_s` holds a
capacity slot indefinitely.

---

## 2. Heartbeat writer inventory (pre-repair)

| Writer | Site | Mutated heartbeat | Verified owner | Should it |
|---|---|---|---|---|
| `open` | `:248`, `:270` | YES (initial stamp) | creates claim | ✅ establishes the lease |
| `heartbeat` | `cmdHeartbeat:294` | YES | **NO** | ✅ by contract — but must verify owner |
| `check` | `cmdCheck:319` | **YES** | compared `owner()` only | ❌ audit command must not |
| `sync` | `cmdSync:349` | YES | **NO** | ⚠️ owner act — must verify owner |
| `close` | `:367` | no | — | ✅ |
| `recover` | `:392` | no | — | ✅ |
| `status` | `cmdStatus:421` | no | — | ✅ already observational |
| `report` | `:513` | no | — | ✅ |

`writeRec` is a pure persist and never stamps. All mutation was explicit at three sites.
No cron, launchd, or supervisor loop writes the record; the production writer reaches it
through one of these commands.

---

## 3. Root cause

`check` fused two different speech acts. It answers a question about the **worktree** —
*is the artifact still stable?* — while a heartbeat asserts something about the **owner** —
*I still hold execution authority*. The heartbeat write sat only in the no-collision branch,
so the intent is legible: "the owner checked in and nothing had moved" was treated as an
implicit *I am still here*. That is sound only if the caller is always the owner, and nothing
enforced that. `cmdHeartbeat` accepted `--session <id>` with no ownership test at all, and the
one identity check that existed (`owner()` = `user@host`) cannot separate concurrent lanes on
a single-user machine. Heartbeat authority therefore collapsed to *anyone on this host who
knows the session id*.

> **A heartbeat is not evidence that something touched the record. It is a claim by an
> authorized owner: "I still hold execution authority."**

---

## 4. Ownership model after repair

| Question | Answer |
|---|---|
| owner identity | the holder of the **lease token** issued at `open` |
| owner process | `pid` — now *supporting evidence*, never sole authority |
| lease authority | `lease_fingerprint` = `sha256(token)`; only the fingerprint is persisted |
| heartbeat authority | lease holder only (`--token` or `BUILDER_LEASE_TOKEN`) |
| release authority | the owner (`close`) |
| recovery authority | a human, for `STALE` claims only |
| reconciliation authority | a human, for `AMBIGUOUS_OWNERSHIP` claims only |

PID death and lease freshness are reported as **separate signals**. `claim_state` is the
derived semantic answer:

```
pid alive                              → LIVE
pid dead + authenticated fresh lease   → LIVE            (legitimate supervisor)
pid dead + unauthenticated touches     → AMBIGUOUS_OWNERSHIP
pid dead + lease quiet past threshold  → STALE           (normally recoverable)
pid dead + lease quiet, not yet stale  → QUIET
```

---

## 5. What changed

**Only authenticated heartbeats extend a lease.** Unauthenticated attempts are refused and
recorded as `last_unauthenticated_touch` / `unauthenticated_touches` — evidence of ambiguity,
never evidence of life. This is what breaks the deadlock: an unidentified writer can no longer
keep a dead claim warm, so the lease ages out on schedule.

| Requirement | Change |
|---|---|
| A — observation must not refresh | `cmdCheck` heartbeat write removed; clean path writes nothing |
| B — heartbeat needs a speaker | lease token at `open`; `leaseHeld()` gate on `heartbeat` |
| C — `sync` must prove ownership | same gate; refusal leaves baseline unchanged |
| D — separate signals | `pid_alive`, `lease_authenticated`, `heartbeat_age_s`, `unauthenticated_touch_age_s`, derived `claim_state` |
| E — ambiguity first-class | `AMBIGUOUS_OWNERSHIP` + `reconcile` command |
| F — recovery stays conservative | `recoverable` now requires `claim_state === 'STALE'` |
| G — force auditable | records `claim_state_at_recovery`, `normal_recoverable`, `conflicting_liveness`, `safeguards_bypassed[]` |

### Ambiguity is not a deadlock

`reconcile` is deliberately **not** `--force`: force bypasses a safeguard, reconcile
*discharges* one. It becomes available only once the lease itself has aged past the threshold —
i.e. no authenticated owner has spoken for a full interval — so a genuinely live supervisor
keeps its claim simply by heartbeating with its token, and an ambiguous claim can never be
held hostage forever.

### Status legibility

PID death is no longer the dominant operator cue. Operators must not infer ownership from one
lower-quality signal while the governor holds stronger conflicting evidence:

```
🔶 AMBIGUOUS_OWNERSHIP — process dead, lease 240s old, 3 unauthenticated touch(es);
   no proven owner. reconcile available.
●  LIVE via authenticated lease (pid gone, lease 12s old)
⚠  RECOVERABLE (process gone + lease quiet past threshold)
```

---

## 6. Tests

`scripts/builder/__tests__/session-liveness-authority-proof.mjs` — hermetic, **9/9 passed**.

| # | Case | Result |
|---|---|---|
| T1 | observation (`check`/`status`) does not refresh the lease | ✓ |
| T2 | authenticated owner heartbeat advances the lease; claim LIVE | ✓ |
| T3 | dead owner + quiet lease → STALE, normally recoverable | ✓ |
| T4 | dead leaf pid + authenticated lease → LIVE; status names the lease, not a ghost | ✓ |
| T5 | non-owner heartbeat refused; lease unchanged; touch recorded | ✓ |
| T6 | AMBIGUOUS_OWNERSHIP; recover refused; reconcile governed and time-gated | ✓ |
| T7 | `--force` records what was bypassed and what the governor believed | ✓ |
| T8 | repairing one claim leaves an unrelated claim byte-identical | ✓ |
| T9 | regression: a repeating unauthenticated writer can no longer hold a claim forever | ✓ |

Neighbouring suites, unchanged by this repair:

```
session-proof                   55 passed · 0 failed   (54/0 pre-repair; +1 lease-token assertion)
loop-governance-proof           28 passed · 0 failed
claude-adapter-governance-proof 30 passed · 0 failed
incident-scenario-proof         18 passed · 0 failed
work-unit-proof                 37 passed · 0 failed
run-check-proof                 15 passed · 0 failed
```

`session-proof.mjs` required two updates, both contract changes rather than weakened
assertions: it now captures the lease token at `open` and passes it to `sync`.

---

## 7. Disposition of `s-2aece444`

Evaluated from scratch under the repaired governor, observationally. Both production records
were **byte-identical before and after** the evaluation — the repaired `status` does not mutate.

```
s-2aece444  DEEP-WU-009-elemental-constitution
   claim_state          QUIET
   pid_alive            false
   lease_authenticated  false
   lease_age_s          100      (threshold 14400)
   recoverable          false
   reconcilable         false
```

**Disposition: QUIET — not recovered, not reconciled, not forced.** It does not meet the stale
test and must not be touched.

**Adoption caveat, stated plainly.** The repair lives on `chore/builder-liveness-authority-repair`.
The main checkout still runs the pre-repair governor, so the unidentified writer continues to
refresh `s-2aece444` (its record checksum moved from `be22f14a` to `c2ee0c48` during this unit).
Until the repair is adopted in the checkout that writer invokes, the deadlock persists in
practice. Adoption is a merge decision outside this unit's authority.

Once adopted, the writer's touches will be refused and recorded as unauthenticated; the lease
will age normally and the claim will become either `STALE` (ordinary recovery) or
`AMBIGUOUS_OWNERSHIP` (governed reconciliation) within one stale interval. **The repair proves
normal governance can make that decision correctly — it was not used to make it.**

---

## 8. Historical note — WU-007

> Earlier WU-007 recovery justification relied partly on a liveness model now known to be
> incomplete.

Recorded only. WU-007 is **not** reverted, reopened, re-ruled, or altered, and its result is
not claimed invalid. Result validity and process validity are distinct.

---

## 9. Files changed

| Path | Change |
|---|---|
| `scripts/builder/session.mjs` | liveness model, lease authority, observational `check`, `reconcile`, force audit, status legibility |
| `scripts/builder/__tests__/session-liveness-authority-proof.mjs` | new — 9 hermetic cases |
| `scripts/builder/__tests__/session-proof.mjs` | updated to the new lease contract (token captured at open, passed to `sync`) |
| `docs/ops/JARVIS_BUILDER_LIVENESS_AUTHORITY_2026-08-10.md` | this record |

---

## 10. Standing principle

Every signal that protects execution authority needs a clear **speaker**, a clear **meaning**,
and a clear **right to speak**. A timestamp that anyone may write is not an authority
assertion — it is only a rumour that something happened.
