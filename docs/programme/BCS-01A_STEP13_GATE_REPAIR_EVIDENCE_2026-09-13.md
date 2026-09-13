# BCS-01A · Step 13 — Gate Repair Evidence + Acceptance-Rule Question

**Date:** 2026-09-13 · **Branch:** `claude/bold-bohr-pmtynu` · **Prior subject:** `2b2e8653`
**Kind:** two founder-ruled repairs, five reruns, and one acceptance-rule question **not**
self-adjudicated.

---

## 1 · Repair A — witnesses renamed to the existing convention

⛔ **No `jest.config.js` change.** The repository already defines the convention; adding a
`*.pg.test.ts` pattern would have created a second one where an adequate one exists.

```text
w-durable-execution.pg.test.ts        → w-durable-execution.integration.test.ts
w-expired-claim-recovery.pg.test.ts   → w-expired-claim-recovery.integration.test.ts
w-checkpoint-resume.pg.test.ts        → w-checkpoint-resume.integration.test.ts
w-frozen-lineage-currency.pg.test.ts  → w-frozen-lineage-currency.integration.test.ts
w-observation-participation.pg.test.ts → w-observation-participation.integration.test.ts
```

Renamed with `git mv`, so history follows the files.

## 2 · Repair B — migration allow-listed, not renamed

⛔ **The migration keeps its truthful name.** `20260913000005_recurrence_sweep_observations.sql`
is added to `OTHER_UNITS_SCHEMA` in `lib/manuscript/development/__tests__/evidenceCannotAct.test.ts`,
with a dated reason in the guard's own established style:

> *BCS-01A (2026-09-13) stores a bounded-cognition RECURRENCE OBSERVATION after it passes the
> recurrence admission law — a different unit's durable output, reached through commission →
> execution → partition → checkpoint → frozen input lineage. It is not BUILD-07A
> developmental-evidence substrate schema; the evidence substrate remains schema-free. Named here
> rather than renamed: `_observations` is the truthful name for what that table holds, and renaming
> a file to evade a lexical filter would make the architecture less legible in order to satisfy the
> instrument.*

⭐ The guard's claim is **narrowed to exactness, not weakened** — the same reasoning its existing
entries carry.

---

## 3 · The five reruns

| # | Run | Result |
|---|---|---|
| **1** | five renamed integration witnesses + lane suite vs real PostgreSQL 16.13 | ✅ **10 suites · 122 / 122** — the rename did not remove them from their own acceptance path |
| **2** | `evidenceCannotAct.test.ts` | ✅ **6 / 6 GREEN** |
| **3** | `npm run typecheck` | ✅ **exit 0** · 229 vs baseline 239 · no regressions · baseline still not re-recorded |
| **4** | `npm run test` | 🔴 **exit 1** · **40 failed suites · 102 failed tests** · 391 passed |
| **5** | failing-suite diff vs `e1c6f527` | ⭐ **zero new · zero fixed · the 40-suite set is identical** |

```text
PRE-LANE BASELINE  e1c6f525→ e1c6f527   40 failed suites · 102 failed tests
POST-REPAIR        this tree            40 failed suites · 102 failed tests
NEW (BCS-attributable)                  0
NO LONGER FAILING                       0
boundedCognition suites in the failure set   0
```

⭐ **Both Step-12 findings are closed**, and the lane's contribution to the project gate is now
exactly zero. Passing suites rose 386 → 391: the five pure-function witnesses that need no
infrastructure.

---

## 4 · ⚠️ The acceptance-rule question — recorded, NOT self-adjudicated

`npm run test` still exits **1**, because **the repository was already red before this lane
existed**. Step 8's acceptance rule said the project gates must be green.

```text
OPTION A · LITERAL
  FINAL PASS stays withheld until the repository-wide 40-suite baseline is repaired.
  ⚠️ Makes BCS-01A responsible for forty unrelated pre-existing failures.

OPTION B · NO-REGRESSION CORRECTION  (founder-recommended)
  the project-test rule requires ZERO BCS regression against the measured pre-lane
  baseline, AND the BCS infrastructure suite absolutely green.
```

### Conditions for Option B, measured

```text
BCS PostgreSQL witnesses        122 / 122          ✅
BUILD-07A guard                 GREEN              ✅
typecheck                       exit 0             ✅
npm test · BCS-attributable     0                  ✅
npm test · baseline-only        unchanged (40/102) ✅
```

⭐ **Every condition the corrected rule would require is already satisfied and measured.**

### ⛔ Why this document does not declare FINAL PASS

The correction would be an amendment to the acceptance rule **that this lane's own subject
benefits from.** This programme's standing law is that *evidence licenses; it does not itself edit
the record* (`CLAIM_STATE_AUTHORITY`). The measured baseline **licenses** the correction; it does
not enact it.

> **FINAL PASS is withheld pending one explicit founder act** adopting the no-regression
> correction — or ruling Option A, in which case the verdict stands as withheld until the
> repository baseline is repaired.

⛔ Jarvis does not adopt an acceptance-rule amendment on its own act, least of all one whose effect
is to let its own lane pass.

## 5 · Standing

```text
REPAIRS                  A (rename) · B (allow-list) — both as ruled, nothing else touched
JEST CONFIG              UNCHANGED
MIGRATION NAME           UNCHANGED
CONSTITUTIONAL           ACCEPTANCE COMPLETE (P1–P12)
GATE 1 typecheck         GREEN
GATE 2 npm test          RED — 100% pre-existing, 0% attributable
FINAL PASS               ⛔ WITHHELD — one founder act away
```
