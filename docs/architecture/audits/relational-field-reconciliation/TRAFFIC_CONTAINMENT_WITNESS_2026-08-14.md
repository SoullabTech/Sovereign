# Traffic containment witness — rupture assertions

**Runtime referent:** production `GIT_COMMIT=22200f967` (unchanged before, during
and after this witness). **Date:** 2026-08-14.
**Result: PASSED** — for the single question below, and no other.

---

## ⛔ Scope — read before citing this result

This witness answers **one** question:

> Does this specific traffic boundary, when actually exercised under the
> witnessed conditions, enforce the ratified containment invariant?

It establishes containment behaviour **and nothing else**. It does **NOT**
establish: overall Relational Field safety · relationship identity continuity ·
provenance completeness elsewhere · correctness of `relationship_essences` ·
member-facing reachability · historical data integrity · constitutional
incorporation · Constitution-on-trunk status. Each of those is independently
established or unestablished.

⚠️ **Named hazard:** *"this one boundary held"* silently becoming *"the Relational
Field is safe."* The permitted success statement is exactly:

> **This boundary was exercised under these conditions and behaved according to
> this invariant.**

---

## Why absence of writes was not accepted as proof

Founder instruction: *do not treat silence or absence of writes as proof.* Zero
rupture writes is consistent with two very different worlds — containment
working, or simply nobody saying anything rupture-flavoured. The witness
therefore required (a) proof the path executed, (b) proof a trigger actually
occurred in real traffic, and (c) a calibrated expectation of what would have
happened without the containment.

---

## A. Positive control — the path executed (PRODUCTION-PROVEN)

| Measure | Value |
|---|---|
| conversation turns since deploy (2026-08-14 00:52Z) | **35** |
| member turns since deploy | **34** |
| relational signals **written** since deploy | **1** (2026-08-14 05:05:06Z) |

⭐ A signal was persisted under `22200f967`, so `insertRelationalSignal` — the
containment chokepoint — **ran in production after the deploy**. The path is
live, not dormant.

## B. Positive control — a real trigger occurred (PRODUCTION-PROVEN)

Member turns since deploy whose text contains rupture-trigger substrings
(`broken`, `divorce`, `break up`, `estranged`, `cut off`, `no contact`,
`betrayed`, `fell apart`, `ended it`, `tension`, `hurt me`, `not speaking`,
`silent treatment`, `upset with`, `frustrated with`):

> **1 of 34**

Counted, never read — no member content was inspected.

## C. Calibration — what would have happened before (PRODUCTION-PROVEN)

Seven days **before** the deploy:

| Measure | Value |
|---|---|
| member turns containing rupture-trigger language | **5** |
| rupture assertions written | **5** |

⭐ **1:1.** Every trigger turn produced a stored rupture assertion. That is the
prior that makes the post-deploy zero meaningful.

## D. Negative control — the assertion did not persist (PRODUCTION-PROVEN)

| Measure | Value |
|---|---|
| rupture assertions written **since deploy** | **0** |
| rupture rows total (44 `ruptured` + 53 `strained`) | **97 — unchanged** |
| last rupture write | before the deploy |

Expected under the pre-deploy rate: ~1. Observed: **0**.

## E. Mechanism control — end-to-end at the deployed code (SOURCE + EXECUTED)

Executed in a worktree at **`22200f967`**, the exact deployed SHA, against a
**local scratch database — production was never written to**:

```
1. DETECTOR (upstream, unchanged): detected=true  ruptureState="ruptured"
2. WRITE executed (positive control):  row WRITTEN
3. STORED rupture_state (negative control):  null
4. SERVED ruptureState via rowToSignal (read control):  null
5. scratch row removed from local db
```

⭐ Step 1 matters as much as step 3: the detector **still asserts "ruptured"**.
The hazard was not fixed and was not meant to be — the containment withholds the
assertion at the boundary while the upstream incapacity remains exactly as
documented. Steps 3 and 4 show both chokepoints holding: write and read.

---

## Evidence classes

| Claim | Class |
|---|---|
| path executed in production post-deploy | PRODUCTION-PROVEN |
| a rupture trigger occurred in real post-deploy traffic | PRODUCTION-PROVEN |
| pre-deploy trigger→write correspondence was 1:1 | PRODUCTION-PROVEN |
| no rupture assertion persisted post-deploy | PRODUCTION-PROVEN |
| write and read chokepoints both withhold the assertion | EXECUTED at the deployed SHA (local DB) |

## ⚠️ Stated limitation

**n = 1** post-deploy trigger turn. The pre-deploy 1:1 rate over 5 observations
is a strong prior, but a single post-deploy trigger is thin evidence *on its
own*. The witness rests on the **conjunction** of A–E, not on D alone; the
mechanism control (E) is what makes the result robust rather than statistical.
⛔ Do not restate this as "no false rupture is possible" — restate it only as the
permitted success statement above.

---

**Production referent unchanged: `22200f967`. No production row was written,
altered, or removed by this witness. The 97 historical rows remain untouched.**
