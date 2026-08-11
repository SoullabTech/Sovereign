# JARVIS — Hook Custody Closure Proof

**Date:** 2026-08-10 · **Mode:** RECOVER → VERIFY → PROVE IN ISOLATION → REPORT → STOP
**Trunk under test:** `clean-main-no-secrets` @ **`de04d9a31fd59ca20ebad7e30a1117e2f5d78bdb`**
**Isolation:** fresh `git clone --depth 1` from `https://github.com/SoullabTech/Sovereign.git` into scratchpad

> ⛔ Builder OS Slice 2 **not begun**. ⛔ No Journal · Super Learner · `authority_scope` · governance
> redesign · Experience Language change. ⛔ Nothing repaired by this unit.

---

## §1 — VERDICT

```
RECONSTRUCTION:  ✅ YES — bootstrap installs all three hooks byte-identically
EXECUTION:       ⚠️ PARTIAL — 2 of 3 hooks are not self-sufficient from committed state

SUCCESS CONDITION: ⛔ NOT MET
```

| Hook | Reconstructs | Executes from committed state alone |
|---|---|---|
| `pre-push` | ✅ | ✅ **fully proven** — bash + committed scripts only |
| `commit-msg` | ✅ | ⛔ **FAILS OPEN** without a machine-local binary (§4) |
| `pre-commit` | ✅ | ⛔ **cannot run** without a dependency install the bootstrap neither performs nor documents (§5) |

## §2 — Steps 1–3: PR #1013

| Check | Result |
|---|---|
| State | **MERGED** — merge commit `de04d9a31`, base `clean-main-no-secrets` |
| Required checks | **5/5 pass** — auto-label · build · check-diagrams · covenant-gates · sovereignty |
| Authorized repair in ancestry | ✅ `5f2d62cf` is an ancestor of trunk |
| Effective delta | ✅ **exactly one file** — `scripts/setup-githooks.sh`, +14 lines, installing the committed `commit-msg` hook. Nothing else. |

⚠️ **Method note.** The bootstrap was first read from the *session's own branch* (`feature/labtools-redesign`, sha256 `e22ae207…`), which **differs from trunk** (`416311a1…`). Every finding below is read from the isolated clone. Same failure class as the earlier `git grep` error — a checkout is not the repository.

## §3 — Steps 4–7: reconstruction

**Isolation baseline (before bootstrap):** `core.hooksPath` unset (local/global/system); `init.templateDir` unset; **0 non-sample hooks** in `.git/hooks`.

`./scripts/setup-githooks.sh` → installs `pre-commit`, `pre-push`, `commit-msg`.

**Byte equivalence to committed `.githooks/` sources — all three `cp`-verbatim:**

| Hook | committed | installed | |
|---|---|---|---|
| `commit-msg` | `c5d287c909d5` | `c5d287c909d5` | ✅ identical |
| `pre-commit` | `ad6439ee6695` | `ad6439ee6695` | ✅ identical |
| `pre-push` | `f259a3d0166b` | `f259a3d0166b` | ✅ identical |

⭐ One committed copy per hook; no generated variant; no drift surface.

## §4 — ⚠️ DEFECT: `commit-msg` fails OPEN without `rg`

**PROPOSITION** — the commit-msg attribution ban is enforced by committed repository state.
**SETUP** — `.git/hooks/commit-msg` invoked with a message containing `Co-Authored-By: Claude`, run twice: once with the normal `PATH`, once with a `PATH` from which `rg` is absent.
**EXPECTED** — exit 1 (rejected) in both cases.
**OBSERVED**

| Control | PATH | exit | |
|---|---|---|---|
| C2 | normal (`/opt/homebrew/bin/rg` present) | **1** | ✅ rejected |
| C4 | `rg` absent | **0** | ⛔ **ACCEPTED** — `line 5: rg: command not found` |

**CONCLUSION** — ⛔ **The hook fails open.** The body is `if rg -n "…" "$MSG_FILE"; then … exit 1; fi`.
A missing binary returns 127, `if` reads that as *false*, and the hook exits 0. `ripgrep` is **not** a
committed dependency (0 occurrences in `package.json`); on this machine it comes from Homebrew.

⭐ This is **the same defect class #1013 was created to fix**, one layer down. #1013's own commit
message states it: *"A control that exists only on one developer machine is an environmental
condition, not governance."* #1013 fixed **installation**; **execution** still depends on machine-local
state. ⛔ Not repaired here — out of this unit's scope.

## §5 — `pre-commit` cannot execute from committed state alone

**PROPOSITION** — pre-commit governance runs on a fresh clone.
**SETUP** — fresh clone, **no** `npm install`/`npm ci`; hook run on an allowed branch, hard 90 s bound.
**EXPECTED** — pass, or fail fast and closed.
**OBSERVED** — branch guard passes (dep-free, correct), then `npm run check:no-supabase` →
`npx warn: tsx@4.23.12 not found and will be installed` → **`EXIT=124` (hung at 90 s)**.
**CONCLUSION** — the four `npm run check:*` gates need an install step the bootstrap neither performs
nor documents; absent it, `npx` reaches for the **network** and the hook **hangs rather than failing
closed**. ⚠️ Recoverable via `npm ci` (derivable from committed `package-lock.json`) — so this is a
**gap in the bootstrap contract**, not an unfixable dependency on machine-local state.

## §6 — Controls that passed

| # | Control | Exit | |
|---|---|---|---|
| C1 | valid commit message accepted | 0 | ✅ |
| C2 | `Co-Authored-By: Claude` rejected | 1 | ✅ |
| C3 | `Generated with [Claude Code]` rejected | 1 | ✅ |
| C5 | allowed branches accepted — `clean-main-no-secrets`, `feature/x`, `fix/y`, `chore/z` | 0 | ✅ |
| C6 | disallowed branches rejected — `wip/danger`, `randombranch`, `main-typo` | 1 | ✅ |
| P1 | pre-push allows `refs/heads/feature/ok` | 0 | ✅ |
| P2 | pre-push **blocks** `refs/heads/wip/bad` | 1 | ✅ fails closed |
| P3 | pre-push allows branch **deletion** (documented carve-out) | 0 | ✅ |
| X1 | pre-commit on disallowed branch **fails closed** | 1 | ✅ |

⛔ Per step 10, no control was scored from exit 0 alone, hook presence, or bootstrap output. Every
negative control was run to an observed non-zero exit with its refusal message captured; C4's
fail-open was found precisely because exit 0 was **not** accepted as success.

## §7 — Step 11: Slice 1 on trunk

| Artifact | On trunk `de04d9a31` |
|---|---|
| `docs/ops/AIN_WORK_PACKET_CONTRACT.md` | ✅ PRESENT |
| `docs/ops/AIN_RESULT_CONTRACT.md` | ✅ PRESENT |
| `docs/ops/AIN_DELEGATION_CONTROL_PLANE_2026-08-09.md` | ✅ PRESENT |
| `scripts/builder/work-unit.mjs` | ⛔ **MISSING** |
| `scripts/builder/session.mjs` | ⛔ **MISSING** |

⚠️ **The Slice 1 *contracts* are on trunk; the Builder OS *executables* are not.** Every
`session.mjs` / `work-unit.mjs` invocation in this session ran from the main checkout, not from
trunk. Bearing on Slice 2 — **stated, not solved.**

(`scripts/builder/knowledge/authority-scope.mjs` is also absent, as expected: `fcc0dd416` is on
`chore/authority-scope-slice-1`, unmerged.)

## §8 — Report

```
TRUNK SHA:            de04d9a31fd59ca20ebad7e30a1117e2f5d78bdb
PR #1013:             MERGED · 5/5 required checks pass · delta exactly setup-githooks.sh
RECONSTRUCTION:       PROVEN — 3/3 hooks byte-identical to committed sources
EXECUTION:            pre-push PROVEN · commit-msg FAILS OPEN (rg) · pre-commit HANGS (no deps)
SLICE 1 ON TRUNK:     contracts PRESENT · executables MISSING
SUCCESS CONDITION:    NOT MET
SLICE 2:              NOT BEGUN
```

**STOP.** ⛔ Nothing repaired. Two findings (§4, §5) and one readiness gap (§7) are reported for
founder decision, not acted on.
