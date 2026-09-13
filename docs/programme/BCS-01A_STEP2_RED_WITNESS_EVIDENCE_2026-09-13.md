# BCS-01A · Step 2 — Dangerous-Boundary RED Witness Evidence

**Date:** 2026-09-13 · **Branch:** `claude/bold-bohr-pmtynu`
**Authorization:** `BCS-01A_RECURRENCE_PROVING_IMPLEMENTATION_AUTHORIZATION_2026-09-13.md` §4, §14
**Vocabulary gate:** `BCS-01A_STEP1_PREDICATE_PREFLIGHT_2026-09-13.md`
**Subject:** P3 · P7 · P9 · P10 **only.** ⛔ No recurrence machinery exists.

> **Purpose:** prove the four highest-risk acceptance instruments can DETECT their prohibited
> behavior before recurrence execution is built. ⭐ **A witness that cannot go RED is invalid; a
> witness that can only go RED because everything is refused is also invalid.**

---

## 0 · What was built, and what was deliberately not

```text
lib/boundedCognition/permission.ts               W-P3   permitCrossing()
lib/boundedCognition/executionState.ts           W-P7   recordCancelRequest · observeCancellation · completeExecution
lib/boundedCognition/currency.ts                 W-P9   measureCurrency()
lib/boundedCognition/executionAuthorization.ts   W-P10  authorizeExecution()
lib/boundedCognition/__tests__/*.test.ts         4 witnesses, 25 assertions
```

⛔ **NO schema · NO migration · NO worker · NO queue · NO persistence.** None of the four
distinctions requires durable storage to prove its semantics, and fixing a provisional state
model into a migration before the instruments are validated is the failure the ordering exists to
prevent.

⛔ **NO manager, service, controller or context object.** FR-J6 / BCS-M1 §8: `lib/boundedCognition/`
is a **location, not a runtime actor** — there is no barrel, no class that assembles the four
decisions, and each file is named for one responsibility. *A noun does not prove the object it
names exists.*

⭐ **Two Step-1 refusals are honoured in code:** no `result` type and no stored `stale` boolean —
`Currency` is the three-state term, and outputs are named by what they are.

---

## 1 · Instrument-validation method

Assertion of a known-bad **inside** a passing test proves only that the bad behavior is
expressible. To establish that the instrument *detects* it, each lawful module was **mutated to
express the prohibited behavior**, the same witness was re-run, and the RED was observed. The
mutation was then reverted and the suite re-run clean.

```text
toolchain   jest 30.5.1 · ts-jest · typescript 5.9.3 (project pins ^5.6.3)
config      scratchpad jest config over lib/boundedCognition only
note        the repository has no node_modules in this environment; a minimal
            toolchain was installed in the session scratchpad. ⛔ The project's own
            gates (npm run typecheck, npm run test) have NOT been run and are owed
            before this code merges anywhere.
```

---

## 2 · W-P3 · current consent contracts frozen authority

| | |
|---|---|
| **SUBJECT** | `permitCrossing(requested, frozen, protection)` — `lib/boundedCognition/permission.ts` |
| **INSTRUMENT** | `__tests__/w-p3-consent-contraction.test.ts`, 5 assertions |
| **BAD CONTROL** | mutated `permitCrossing` to read protection once and reuse the cached value |
| **RED OBSERVATION** | **`Tests: 3 failed, 2 passed, 5 total`** |
| **LAWFUL CONTROL** | `frozen permit + current permit → PERMIT` · `frozen permit + current deny → REFUSE` · `frozen deny + current permit → REFUSE` · `sovereign crossing under the most protective state → PERMIT` |
| **GREEN OBSERVATION** | 5/5 pass on the restored module |
| **CLAIM CEILING** | ⛔ Establishes that the permission function and its instrument **model contraction correctly**. ⛔ Does **not** establish that every final runtime material crossing is wired through it — owed at full P3 acceptance. |

⭐ **The design decision that carries P3:** the function takes a **provider**, not a value. A
value parameter would let an execution read protection at T0 and satisfy the type forever — the
exact F-J9.2 failure. One assertion counts provider reads and requires **3 reads for 3
crossings**, so the re-read is structural rather than disciplinary.

⭐ **Both directions proved:** current protection **contracts** the frozen ceiling
(`refused_by_current_protection`) and may **never enlarge** it (`refused_by_frozen_ceiling`).

## 3 · W-P7 · cancellation request is not cancellation

| | |
|---|---|
| **SUBJECT** | `recordCancelRequest` · `observeCancellation` · `completeExecution` |
| **INSTRUMENT** | `__tests__/w-p7-cancellation.test.ts`, 6 assertions |
| **BAD CONTROL** | mutated `recordCancelRequest` to set `status: 'cancelled'` when writing the request |
| **RED OBSERVATION** | **`Tests: 3 failed, 3 passed, 6 total`** |
| **LAWFUL CONTROL** | no request + normal terminus → `completed`; a request on a running execution leaves it `running`; only `observeCancellation` yields `cancelled` |
| **GREEN OBSERVATION** | 6/6 pass restored |
| **CLAIM CEILING** | ⛔ State semantics only. No durable cancellation record, no worker observing a request, no real interleaving — owed when durable execution exists. |

⭐ The interval is witnessed at T1–T2: the request exists **and** the execution is still
`running`. ⭐ A `completed` execution refuses both a later request and a forced transition
(`already_terminal`) — withdrawal of completed outputs remains a separate, undecided
responsibility.

## 4 · W-P9 · completion and currency are orthogonal

| | |
|---|---|
| **SUBJECT** | `measureCurrency(lineage, readCurrent)` |
| **INSTRUMENT** | `__tests__/w-p9-currency.test.ts`, 8 assertions |
| **BAD CONTROL** | mutated `measureCurrency` so a null measurement is skipped (unknown collapses to current) |
| **RED OBSERVATION** | **`Tests: 2 failed, 6 passed, 8 total`** |
| **LAWFUL CONTROL** | identical frozen/current inputs genuinely yield `unchanged` — so an always-`unmeasured` implementation cannot pass |
| **GREEN OBSERVATION** | 8/8 pass restored, all three arms |
| **CLAIM CEILING** | ⛔ Establishes the three-state measurement and that the axes do not collapse. ⛔ Does not establish lineage capture from a real Work, nor that a real store's unavailability surfaces as `unmeasured` in production paths. |

```text
ARM A  status COMPLETED · currency UNCHANGED
ARM B  status COMPLETED · currency CHANGED      ← status untouched by currency
ARM C  status COMPLETED · currency UNMEASURED   ← unknown never becomes current
```

⭐ Two further refusals proved: a **throwing** reader is an unavailable measurement, and **empty
lineage** is `unmeasured` — nothing was compared, so nothing may be called unchanged. ⭐ Nothing
in `currency.ts` imports or returns an `ExecutionStatus`, which is how the second collapse is
prevented structurally.

## 5 · W-P10 · invalidation does not authorize execution

| | |
|---|---|
| **SUBJECT** | `authorizeExecution(commission, request)` + an enqueue spy |
| **INSTRUMENT** | `__tests__/w-p10-invalidation-not-authorization.test.ts`, 6 assertions |
| **BAD CONTROL** | mutated `authorizeExecution` to drop the consumed-commission refusal (staleness treated as a basis) |
| **RED OBSERVATION** | **`Tests: 1 failed, 5 passed, 6 total`** |
| **LAWFUL POSITIVE** | fresh commission + explicit request → **exactly one** enqueue (`['c-B']`), so a system in which recomputation is simply impossible cannot pass |
| **GREEN OBSERVATION** | 6/6 pass restored |
| **CLAIM CEILING** | ⛔ Behavioural at the authorization seam with a spy queue. ⛔ Does not establish that a real scheduler, retry path or reaper has no other door to execution — owed at full P10 acceptance. |

⭐⭐ **The structural point:** `authorizeExecution` does not accept a `Currency`. There is **no
type-level path from a measurement to an enqueue**, so the prohibited wiring cannot be written
without deliberately adding it — which the RED control then catches. Second negative control
proved: with no commission, an **explicit** recomputation request is still refused
(`no_commission`) — *the existence of a stale comparison is not an authorization basis.*

---

## 6 · Exit gate

```text
P3    known-bad RED (3 failed) · lawful controls GREEN          ✅
P7    known-bad RED (3 failed) · request/termination interval   ✅
P9    both collapse controls RED (2 failed) · three arms GREEN  ✅
P10   automatic-recompute RED (1 failed) · fresh-commission     ✅
RESTORED SUITE   4 suites · 25 tests · 25 passed                ✅
```

⭐ **Step 2 closes.** The next authorized sequence is **coverage falsification + uniformity
trap.** ⛔ No recurrence happy path is implied, and none exists.

## 7 · Owed / not yet established

```text
⛔ project gates not run here   npm run typecheck · npm run test (no node_modules in this env)
⛔ no wiring proof              P3/P10 ceilings above — the seams exist, the runtime does not
⛔ no persistence               deliberate; durable execution is a later step
⛔ no recurrence                classifier untouched, no sweep, no partitions, no coverage
⛔ CMT-01 M3                    unauthorized and untouched
⛔ no producer registered       none needed; none added
```

> **We are not yet proving recurrence. We have proved that the four easiest sovereignty failures
> have instruments capable of catching them** — each demonstrated by making the failure real and
> watching the instrument go red.
