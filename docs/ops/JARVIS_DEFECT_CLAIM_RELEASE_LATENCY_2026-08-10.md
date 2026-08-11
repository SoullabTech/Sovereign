# DEFECT — Claim Release Latency (Builder OS)

**Date:** 2026-08-10 · **Class:** control-plane usability / capacity-cost defect
**Status:** RECORDED — ⛔ not fixed, ⛔ not scheduled
**Founder ruling 2026-08-10:** record separately; ⛔ **do not fix inside the authority-scope recovery unit.**

---

## §1 — Statement

> **Delegation completion does not release the Builder claim promptly. Capacity may remain falsely
> occupied until the lease staleness threshold elapses.**

⛔ **This is NOT permanent capacity exhaustion.** That hypothesis was tested and **falsified** —
`docs/ops/JARVIS_CLAIM_CUSTODY_AND_AUTHORITY_SCOPE_ADJUDICATION_2026-08-10.md` §5. The state machine
is time-based and self-clearing. The defect is **latency**, and conflating the two would misdirect
any fix.

## §2 — Mechanism

```js
counts_active = open                             // a dead pid still holds capacity
claim_state   = alive ? 'LIVE'
              : (authenticated && !leaseStale) ? 'LIVE'   // supervisor lease outlives the process
              : leaseStale ? 'STALE' : …
recoverable   = open && claim_state === 'STALE'
leaseStale    = leaseAgeS > 14400                // 4 hours
```

A claim whose worker has finished or died stays `LIVE` — and keeps consuming a capacity slot — for up
to **4 hours**, because nothing on the completion path calls `close`. Recovery only becomes available
once the lease ages out.

⭐ The lease-outlives-process behaviour is **correct by design** (a supervisor lease must survive a
process restart). The defect is the **absent release on completion**, not the lease semantics.

## §3 — Measured instance

| | |
|---|---|
| Claim | `s-80845628` · unit `D-14R` |
| Opened | 2026-08-10T22:22:06Z |
| Last heartbeat | 2026-08-10T22:30:47Z (last sign of life) |
| Process | pid 68323 — dead well before recovery |
| Recovered | 2026-08-11T02:38:16Z |
| ⭐ **Falsely-held capacity** | **≈ 4 h 08 m** after last sign of life |

At a configured limit of **2**, one such claim removes **50 % of Builder OS capacity** for four
hours. During that window the only lane doing real `authority_scope` work held **no claim at all**
(custody class C) — capacity was consumed by a dead claim while live work ran ungoverned.

## §4 — Prior art (not a new discovery)

Already named as **§C.4** in `docs/ops/JARVIS_CLAIM_STATE_ADJUDICATION_2026-08-10.md`:
*"Delegation completion does not release the Builder claim."* This record supplies the **measured
magnitude** (4 h 08 m) and the capacity-percentage consequence, which the earlier note did not.

## §5 — ⚠️ Aggravating observation (separate, larger)

`session.mjs status` at 22:38 reported:

```
⚠ 10 distinct sessions observed in transcripts vs 2 Builder-governed — 8 lane(s) are UNGOVERNED.
LOCAL REQUEST RATE  5 min 182 reqs  16.57x baseline  ANOMALOUS
⚠ RECOMMEND HANDOFF — request rate matches the 2026-08-09 exhaustion shape.
```

⛔ **Do not fold this into the latency defect.** It is a distinct and larger governance gap: the
concurrency budget governs only sessions that called `session.mjs open`, so **80 % of active lanes
are outside it entirely**. A latency fix would not touch this.

⭐ **Now recorded separately, per founder ruling 2026-08-10:**

- Coverage → `docs/ops/JARVIS_DEFECT_BUILDER_CAPACITY_COVERAGE_2026-08-10.md`
  (⭐ ruled **architectural**, and to outrank this defect: the two are opposite failures of the same
  number — latency makes capacity *overstate* load and self-clears on a 4 h clock; coverage makes it
  *understate* load and does not self-clear.)
- Request rate → `docs/ops/JARVIS_OBSERVATION_LOCAL_REQUEST_RATE_2026-08-10.md`
  (⛔ observation only — `CAUSE: UNKNOWN`.)

## §6 — Candidate directions (⛔ none authorized)

1. Release on completion — have the delegation completion path call `close`.
2. Distinguish *finished* from *stale* so a completed claim frees capacity without waiting on lease age.
3. Shorten the staleness threshold — ⚠️ weakens the supervisor-lease guarantee; likely wrong.
4. Report `counts_active` separately from *"has a live worker"* so capacity reads honestly.

⛔ **Not authorized. Not scheduled.** Recorded for its own future unit.
