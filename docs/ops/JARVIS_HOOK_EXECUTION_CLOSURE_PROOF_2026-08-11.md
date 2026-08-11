# JARVIS — Hook Execution Closure Proof

**Date:** 2026-08-11 · **Mode:** VERIFY → MERGE (normal) → PROVE IN FRESH ISOLATION → REPORT → STOP
**Supersedes acceptance of:** `docs/ops/JARVIS_HOOK_CUSTODY_CLOSURE_PROOF_2026-08-10.md` (found the defects)
**Trunk under test:** `clean-main-no-secrets` @ **`63dbc1310144dba0147917bcfd42cdf79c6014dc`** (PR #1017 merge commit)
**Isolation:** fresh `git clone --depth 1` from GitHub into scratchpad, independent of the PR worktree

---

## §1 — VERDICT

```
STRONGER PROPOSITION:
  A fresh canonical checkout can reconstruct and execute committed Git-hook
  governance using dependencies derivable from committed repository state,
  without undeclared machine-local executables or opportunistic network
  fetching during hook execution.

RESULT:  ✅ PROVEN

HOOK EXECUTION ASSURANCE:  CLOSED
```

## §2 — PR #1017 disposition

| | |
|---|---|
| Classification | **Class B** — held per founder ruling; not escalated to Class A (doctrine unchanged, undeclared dependency *removed*, not added) |
| Rollback plan | Revert commit sufficient — checked |
| Trunk moved during review | #1016 (Slice 3) merged; **did not touch `.githooks/`** — confirmed via `git diff --name-only ea2f50df5..origin/clean-main-no-secrets -- .githooks/` (empty) |
| Branch updated | `gh pr update-branch` → new head `60e959638`; **effective delta re-verified identical** post-update (161 insertions, 3 files, unchanged) |
| Final checks on `60e959638` | 5/5 green, **single clean run each** (no rerun noise this time) — auto-label, build, check-diagrams, covenant-gates, sovereignty |
| Merge | **Normal merge, no bypass/admin** — `gh pr merge --merge`. `fatal: Not possible to fast-forward` was the local worktree's own branch sync, not the merge; confirmed via `gh pr view --json state,mergedAt,mergeCommit` → `MERGED` at `63dbc1310` |

## §3 — Isolation baseline (independent of the PR worktree)

Fresh clone, HEAD `63dbc1310`. `core.hooksPath` unset. **0** non-sample hooks pre-bootstrap.
Bootstrap installs 3/3 hooks **byte-identical** to `.githooks/` sources (sha256 match, all three).

## §4 — commit-msg: original defect proven closed

| # | Control | Environment | exit | |
|---|---|---|---|
| C1 | valid message accepted | normal | 0 | ✅ |
| C2/C3 | both prohibited forms rejected | normal | 1 | ✅ |
| C4 | valid message accepted | **`rg` absent** (`PATH=/usr/bin:/bin`) | 0 | ✅ |
| C5 | attribution **rejected** | **`rg` absent** | 1 | ✅ **the exact case that failed open on 2026-08-10 now fails closed** |

## §5 — pre-commit: fail-fast-closed, then full execution, then network-independence

| # | Control | Condition | Result |
|---|---|---|---|
| X1 | pre-commit **before** `npm ci` | `node_modules` absent | **exit 1, 0s** with `Run: npm ci` — was: hang past 90s |
| — | `npm ci` from **committed** `package-lock.json` | — | succeeds, ~seconds, installs `node_modules/.bin/tsx` |
| X2 | pre-commit **full gate**, deps present, allowed branch | positive control | **exit 0, 6s**, all five checks run including `check:design-canon` |
| X3 | pre-commit on **disallowed branch** | negative control | **exit 1**, dep-free branch guard still fires first |
| **N1** | ⭐ full gate under a **black-holed npm registry** (`npm_config_registry=http://127.0.0.1:1/blackhole`) | decisive network-independence test | **exit 0, 6s — unaffected** |

**N1 is the strongest evidence in this proof.** It does not merely observe that no fetch happened to occur — it makes any live fetch attempt fail immediately against an unreachable registry, and the gate was unaffected. That distinguishes *"didn't fetch this time"* from *"cannot fetch."*

## §6 — pre-push: unchanged, re-confirmed

P1 (allowed ref accepted, exit 0) · P2 (disallowed ref rejected, exit 1). No behavior change from #1017 — hook untouched by this PR.

## §7 — What closes, and what remains explicitly open

**Closed:** hook **installation** (proven 2026-08-10, #1013) + hook **execution** (proven here) — both now reconstructable from committed trunk state alone, with no undeclared machine-local binary and no opportunistic network dependency.

**Explicitly NOT reopened or claimed by this unit:**
- `docs/ops/GIT_HOOK_CUSTODY_AUDIT_2026-08-10.md` dangling reference (#1013) — separate documentation-custody finding, untouched.
- Builder OS Slice 1–3 executable readiness (`scripts/builder/work-unit.mjs`, `session.mjs` presence on trunk) — separate question, not re-tested here.
- `s-90e108c2` / Route A `deterministic.mjs` custody — preserved byte-identically in scratchpad, source **untouched**, claim **not recovered**. Its own custody unit is still pending.

## §8 — Report

```
TRUNK SHA (proof):     63dbc1310144dba0147917bcfd42cdf79c6014dc
PR #1017:               MERGED (normal, no bypass) — merge commit 63dbc1310
STRONGER PROPOSITION:   PROVEN
  - install:            byte-identical, 3/3 hooks
  - commit-msg:         rejects attribution with AND without rg — defect closed
  - pre-commit:         fails fast+closed pre-deps; full gate passes post-`npm ci`;
                         proven network-independent via black-holed registry
  - pre-push:           unchanged, re-confirmed
HOOK EXECUTION ASSURANCE: CLOSED
```

**STOP.**
