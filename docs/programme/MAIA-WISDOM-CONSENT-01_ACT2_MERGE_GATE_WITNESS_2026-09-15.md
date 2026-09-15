# MAIA-WISDOM-CONSENT-01 · ACT 2 — Merge Gate Witness

**Status: ⭐ JEST CARRIER RUN · PASS · COMMITTED TEST UNCHANGED · MERGE GATE EARNED.**
**Date:** 2026-09-15 · ⛔ Merge and deploy remain founder acts.

---

## 1. Identity of the run

| | |
|---|---|
| **Repository** | `soullabtech/sovereign` |
| **Branch** | `claude/loving-ramanujan-mlka7d` |
| **Commit** | `51bc60adc6e5ffa21ad90035a67c74702cacfd53` |
| **Tree before** | clean |
| **Tree after** | ⭐ **clean** — `git status --porcelain` empty |
| **Dependencies** | `npm ci` from the committed `package-lock.json` — 2,450 packages |
| **Node** | v22.22.2 · **npm** 10.9.7 |
| **jest** | declared `^29.7.0` · **installed `29.7.0`** |
| **ts-jest** | declared `^29.4.6` · **installed `29.4.6`** |
| **@types/jest** | declared `^29.5.14` · **installed `29.5.14`** |
| **typescript** | declared `^5.6.3` · **installed `5.9.3`** |

⚠️ **Stated rather than smoothed:** `typescript` resolved to `5.9.3`, not `5.6.3`. That is the
caret range the repository itself declares, resolved from its own lockfile by `npm ci` — ⛔ not
a substitution made for this run. Recorded because *"pinned dependencies"* and *"the exact
version in `package.json`"* are not the same claim.

⛔ `npm ci` installed `node_modules` (gitignored) and ran the repository's own `patch-package`
and `prisma generate` postinstall steps. ⛔ No tracked file was touched — tree clean after.

## 2. Exact command

```bash
npx jest --config jest.config.js __tests__/ain-corridor-containment.test.ts
```

## 3. Literal result

```
PASS __tests__/ain-corridor-containment.test.ts
  AIN corridor containment (MAIA-WISDOM-CONSENT-01)
    every /api/ain route is mapped
      ✓ /api/ain/collective/breakthrough matches the corridor rule (3 ms)
      ✓ /api/ain/control matches the corridor rule
      ✓ /api/ain/knowledge matches the corridor rule
      ✓ /api/ain/process matches the corridor rule (1 ms)
      ✓ /api/ain/telemetry matches the corridor rule (1 ms)
      ✓ /api/ain/digest matches the corridor rule
      ✓ /api/ain/activate matches the corridor rule (1 ms)
    unauthenticated callers are refused before the handler
      ✓ /api/ain/collective/breakthrough refuses an anonymous caller (2 ms)
      ✓ /api/ain/control refuses an anonymous caller
      ✓ /api/ain/knowledge refuses an anonymous caller
      … (all seven)
    authenticated non-admins are refused
      ✓ role member cannot reach the corridor
      ✓ role practitioner cannot reach the corridor
      ✓ role steward cannot reach the corridor
      ✓ role curator cannot reach the corridor
      ✓ role partner cannot reach the corridor
    admins reach the corridor normally
      ✓ /api/ain/collective/breakthrough admits an admin
      … (all seven)
      ✓ does not require a paid tier of an admin
    regression — containment is scoped to the corridor
      ✓ leaves Seam 2 (/api/between/chat) unmapped and untouched
      ✓ does not capture neighbouring /api paths by prefix (1 ms)
      ✓ does not capture a lookalike path outside the corridor

Test Suites: 1 passed, 1 total
Tests:       30 passed, 30 total
Snapshots:   0 total
Time:        0.678 s
```

**Test suites: 1 passed / 1 · Tests: 30 passed / 30 · 0 failed · 0 skipped.**

⭐ **The committed test was not altered.** ⛔ No production logic changed to satisfy the
harness. ⛔ No `jest.config.js` change. The earlier `Preset ts-jest not found` was a missing
`node_modules` — an **environment** condition, resolved by installing the repository's own
dependencies, ⛔ not a defect in the test or the product.

⚠️ **30, not 25.** The tsx pass exercised 25 assertions; the committed suite carries 30,
because `it.each` expands the corridor and role tables into one case per route and per role.
⭐ **Same propositions, finer granularity** — ⛔ recorded so the two numbers are never read as
a discrepancy.

## 4. What the gate now stands on

| Evidence | State |
|---|---|
| Access-matrix semantics conjunctive | ⭐ read from the evaluator |
| Rule genuinely admin-only | ⭐ asserted, 5 non-admin roles refused |
| No prior rule captures the corridor | ⭐ scan of 195 exact / 63 prefix / 3 regex |
| All seven `/api/ain/*` captured | ⭐ 7/7 |
| Unauthenticated → 401 | ⭐ `unauthenticated` reason; middleware `:281-287` |
| Authenticated non-admin → 403 | ⭐ `missing-role` |
| Admin → allowed | ⭐ 7/7 |
| `/api/ainsley` not captured | ⭐ corridor, not substring |
| Seam 2 unchanged | ⭐ asserted |
| `ACCESS_CONTROL_MODE` unchanged | ⭐ 0 in diff |
| Diff scope | ⭐ **+24 / −0** |
| **Jest carrier** | ⭐ **PASS, 30/30, unchanged** |

## 5. Standing

**⭐ MERGE GATE EARNED · ⛔ MERGE NOT PERFORMED · ⛔ DEPLOY NOT PERFORMED · ⛔ ACT 2 NOT CLOSED
(closes on the post-deploy witnesses) · ⛔ LANE NOT CLOSED — Seam 2's R15 defect is untouched
and ACT 3 is unopened · PRODUCTION UNTOUCHED.**

Post-deploy, the three no-write probes in the candidate record are owed. ⭐ The decisive one
stays one line: if `/api/ain/collective/breakthrough` still answers **400** to the
unauthenticated `{}` probe, **containment did not take.**

> *The door now refuses strangers. Seam 2 still reads a closed mouth as a yes.*
