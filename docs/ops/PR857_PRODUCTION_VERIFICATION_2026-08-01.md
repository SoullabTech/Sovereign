# #857 — production route verification record (2026-08-01)

**PR:** [#857 — a Working Draft cannot be saved: the version guard compares a
bigint string to a number](https://github.com/SoullabTech/Sovereign/pull/857)

**Result: 13 assertions, 13 passed, 0 failed. Baseline restored exactly.**

---

## Gate 1 — deployed artifact identity

| Check | Value |
|---|---|
| `GIT_COMMIT` | `0671a547a` (= trunk tip, the #857 merge commit) |
| `DEPLOY_LANE` | `deploy-lane` |
| Container created | `2026-08-01T11:51:11Z` |
| Health | `healthy` |
| LAN IP | `192.168.0.104` (matches router port-forward target) |

Deployed by the in-flight `pre-deploy-gate.sh deploy-maia 0671a547a` lane, which
held the deploy lock from 11:45:15Z and exited after 270s. The lock was **not**
forced or removed.

## Gate 2 — smoke

`scripts/deploy-production.sh smoke-prod` — all passed: `/api/health`,
`/api/version`, `/api/ready`, main page, auth lock on `/api/build/status` and
`/api/build/alert` (both correctly 503), and constitutional verification
(Co-Lab + Memory + Relationships + Development + MAIA).

## Fixture boundary

One disposable manuscript + one section, both titled/bodied
`DISPOSABLE #857 PRODUCTION VERIFICATION — DELETE`. No real manuscript content
was used, read, or written. Manuscript id `9432c30c-3d3d-4556-bb2c-9c912424f1b3`
(deleted). The authenticated session token was read and used **inside the
container** and never left it.

**Pre-test baseline (all four tables): 0 / 0 / 0 / 0.**

## Gate 3 — the authenticated routes

Exercised against the deployed artifact via `localhost:3000` with a real verified
session (`x-session-token`; a bare `x-member-id` is correctly rejected).

| # | Act | Expected | Actual |
|---|---|---|---|
| 1 | begin (`POST /draft`) | 201, version 1 | ✅ 201, `revisionId: 1` |
| 2 | save (`PUT`) | 200, version 2 | ✅ 200, `revisionId: 2`, `checkpointed: false` |
| 3 | checkpoint (`PUT checkpoint:true`) | 200, version 3 | ✅ 200, `revisionId: 3`, `checkpointed: true`, `revisionCount: 2` |
| 4 | revision recorded | ≥1 | ✅ n=2 |
| 5 | restore (`POST /revisions`) | 200, version 4 | ✅ 200, `revisionId: 4`, `restoredFrom: 2` |
| 6 | stale base (`baseRevisionId: 1`) | 409 `stale_base` | ✅ 409, `reason: stale_base`, `currentRevisionId: 4` |
| 7 | missing base | 400 | ✅ 400 `baseRevisionId must be a positive integer` |
| 8 | malformed base (`"two"`) | 400 | ✅ 400 same message |

**What this proves:** the bigint/number boundary is closed at the driver edge.
Before the fix, `version` arrived from node-postgres as the string `"1"`, never
`!==`-equal to the number `1`, so **every** write — save, checkpoint, and restore,
the undo path included — was rejected as `stale_base`. The version now advances
1 → 2 → 3 → 4 across the full cycle, and `stale_base` fires only when the base
is genuinely stale.

## Gate 4 — cleanup and baseline

Cleanup ran in a `finally` block: revisions → draft → sections → manuscript, plus
a mark-based sweep. **Post-test counts: 0 / 0 / 0 / 0 — identical to baseline.**
Residual scan for anything bearing the fixture mark: 0 rows. The verification
script was removed from the container (`/app/verify857.js`, confirmed absent).

## Gate 5 — logs

Scanned `maia-sovereign` logs from verification start: **no 5xx, no
`Failed to save/load/restore/create`, no unhandled errors.** (The two 503s in the
smoke report are the intended auth locks, not failures.)

---

## Out of scope — recorded separately

Both in [DEPLOY_OBLIGATIONS_2026-08-01.md](./DEPLOY_OBLIGATIONS_2026-08-01.md),
deliberately **not** bundled into this verification:

1. **`living_works` migration is an outstanding deployment obligation.** It is
   MISSING in production; the quick lane that shipped #856 runs no migrations.
   Safe today only because `lib/livingWork/domain.ts` has zero runtime callers.
   It must run through the full guarded path before the declaration gesture or
   any Living Work route deploys.
2. **Defect: `scripts/deploy-production.sh` prints usage and exits 0 when given
   no command.** It should exit nonzero. This produced a false "deploy succeeded"
   reading earlier the same morning.
