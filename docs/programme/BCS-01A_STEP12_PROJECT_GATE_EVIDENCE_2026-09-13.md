# BCS-01A · Step 12 — Project Integration Gate Evidence

**Date:** 2026-09-13 · **Subject:** `8c79f4a2` · **Tree:** clean
**Kind:** gate execution record · ⛔ no code changed by this act
**Dependencies:** `npm install` → `added 2450 packages`, exit **0** (this environment had no
`node_modules`; that is why the gates were previously OWED rather than failing)

---

## Gate 1 · `npm run typecheck` — ✅ **GREEN**

```text
command   npm run typecheck    (node scripts/check-typehealth-baseline.js)
exit      0

TypeScript no-regression gate — tsconfig.ship.json
  program files : 4277 (baseline 3965)
  errors        : 229  (baseline 239)

✨  10 error(s) fixed since the baseline (8 identities gone, 0 reduced)
📈  316 new file(s) entered the program
🗑   4 baselined file(s) were deleted from disk (not a regression)
✅  No TypeScript regressions.
```

⭐ **No new diagnostics attributable to the lane.** ⛔ The baseline was **not** re-recorded —
`npm run typecheck:baseline` was not run, and the 10 fixed errors remain unblessed, exactly as the
gate's own governance requires.

---

## Gate 2 · `npm run test` — 🔴 **RED**

```text
command   npm run test    (jest --config jest.config.js)
exit      1

Test Suites  46 failed · 1 skipped · 390 passed · 436 of 437
Tests        182 failed · 19 skipped · 2 todo · 6854 passed · 7057
```

### Attribution — measured, not asserted

A pre-lane baseline was run in a detached worktree at **`e1c6f527`** sharing the same
`node_modules`:

```text
BASELINE  e1c6f527   40 failed suites · 102 failed tests · exit 1
CURRENT   8c79f4a2   46 failed suites · 182 failed tests · exit 1
DELTA                 +6 suites · +80 tests
```

Failing-suite lists were diffed. **Zero suites were fixed; six are new, and all six are
identified:**

| New failure | Cause | Attributable to lane |
|---|---|---|
| `w-durable-execution.pg.test.ts` | no database configured | ⚠️ yes — infrastructure |
| `w-expired-claim-recovery.pg.test.ts` | no database configured | ⚠️ yes — infrastructure |
| `w-checkpoint-resume.pg.test.ts` | no database configured | ⚠️ yes — infrastructure |
| `w-frozen-lineage-currency.pg.test.ts` | no database configured | ⚠️ yes — infrastructure |
| `w-observation-participation.pg.test.ts` | no database configured | ⚠️ yes — infrastructure |
| **`lib/manuscript/development/__tests__/evidenceCannotAct.test.ts`** | ⭐ **a real guard trip — see below** | ⚠️ **yes** |

⭐ **The 40 pre-existing failures are untouched by this lane** — chiefly suites importing `vitest`
under a CommonJS jest runner. ⛔ Not this lane's subject and not repaired here.

### 2a · The five pg witnesses — a conformance defect in my work

Run against a live disposable PostgreSQL 16.13 they pass **122/122**. Under `npm run test` they
fail for want of a database.

⚠️ **The repository already has a convention for this**, and I did not follow it. `jest.config.js`
excludes infrastructure-dependent tests by filename pattern —
`.*Integration\.test\.ts$`, `.*\.integration\.test\.ts$`, `.*\.soak\.test\.ts$` — under the comment
*"Integration tests requiring infrastructure (run separately)"*. My `*.pg.test.ts` naming matches
none of them.

⛔ **Not repaired in this act.** The founder's instruction was to run the gates and record; changing
config to make a gate green is precisely the move this lane refuses to make unilaterally.

### 2b · ⭐⭐ `evidenceCannotAct.test.ts` — a genuine guard trip, and an instructive one

```text
● adds no migration — the evidence object needs no schema of its own
  Expected []   Received ["20260913000005_recurrence_sweep_observations.sql"]
```

The BUILD-07A guard asserts that no migration dated `>= 20260903` whose **filename** matches
`/develop|evidence|reading|observation/i` exists outside a named allow-list.

⭐ **Only migration `…0005` trips it.** The lane's other four —
`_execution`, `_claim_recovery`, `_checkpoints`, `_checkpoint_inputs` — contain none of those
tokens. The trip is on the word **`observations`** in a filename.

**Is it a real violation?** The guard protects one claim: *the BUILD-07A developmental-evidence
substrate has no schema of its own.* A bounded-cognition recurrence-observation table is a
different unit's schema, so the underlying claim is **not** violated — this is a **filename token
standing in for a relation**, the same over-match class this lane has now hit four times.

⭐ **But the guard already anticipated exactly this** and provides the disciplined remedy:
`OTHER_UNITS_SCHEMA`, a named allow-list. Its existing entries are each accompanied by a dated
comment explaining why the named migration belongs to a different unit — and the author's own note
says naming it there *"keeps this claim exact rather than weakening it."*

⛔ **Not added here.** Adding an entry is a founder-visible act with a reason and a date, on the
repository's own convention — not a quiet edit made to turn a gate green.

---

## Verdict

```text
GATE 1  typecheck   ✅ GREEN · exit 0 · no regressions · baseline not re-recorded
GATE 2  test        🔴 RED  · exit 1 · 40 failures pre-existing · 6 new, all attributable
                              5 = infrastructure/naming conformance · 1 = guard filename over-match

BCS-01A  CONSTITUTIONAL ACCEPTANCE   COMPLETE (Step 11, P1–P12)
         FINAL PASS                  ⛔ STILL WITHHELD
```

⛔ **FINAL PASS is not declarable.** Gate 2 is RED and two of its causes are this lane's. ⭐ Neither
is a defect in the bounded-cognition contract or its evidence — the witnesses pass 122/122 against a
real database, and the guard trip is a filename match, not a schema violation — but **the acceptance
rule names the gates, not their explanations.**

## Two owed acts, neither performed here

```text
1  the five pg witnesses must conform to the repository's existing
   infrastructure-test convention so the project gate does not run them without a database
2  migration 20260913000005 needs a named, dated OTHER_UNITS_SCHEMA entry stating why a
   bounded-cognition observation table is not developmental-evidence schema —
   or, if the founder rules otherwise, the migration is renamed
```

⚠️ **Both are instrument/convention conformance, not contract repair.** Recorded so the distinction
survives: *the contract passed; the packaging did not.*
