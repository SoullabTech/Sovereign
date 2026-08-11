# JARVIS — Route A Custody + Adoption Proof

**Date:** 2026-08-11 · **Mode:** CUSTODY → SECURITY ACCEPTANCE → CLASSIFY → ADMIT → STOP before merge
**Subject:** `scripts/builder/deterministic.mjs` (+ its required, never-delivered proof file)
**Source claim:** `s-90e108c2` · **Adoption claim:** `s-fb3b61ce` (worktree `ain-jarvis-route-a-deterministic-lane`)

---

## §1 — Custody

| | |
|---|---|
| Original packet | `jarvis-route-a-sub-a-registry` — `docs/ops/JARVIS_COST_RELIEF_ALPHA_2026-08-10.md`, Sub-unit A |
| Original result | ⚠️ **`recommended_next_action: "reject"`** — delegate exited 1. `evidence`: `PASS: test -f … · PASS: no shell:true · FAIL: node …/deterministic-registry-proof.mjs` |
| Root cause | the packet's **second required file**, `deterministic-registry-proof.mjs`, was never produced — the FAIL is "file doesn't exist," not "tests ran and failed" |
| Preserved (2026-08-10, prior unit) | sha256 `f021f0e4ee2fbd678cda6043c4b13acc8c3082f92251c0fe1b18be90ed7be2f6` · 9189 bytes · 264 lines · **0 commits in git history anywhere** |
| Provenance evidence | `~/.claude/ain-delegation/{packets,results,logs}/jarvis-route-a-sub-a-registry.*` — governing authority, acceptance criteria, and failed-attempt transcript all recovered and read (§1 of the packet itself) |
| Recovery | `s-90e108c2` recovered via sanctioned STALE path, no `--force`, **only after** adoption was ready (§2 complete) |
| Adoption claim | `s-fb3b61ce` opened on the same worktree; baseline `dirty_count: 1` — ⭐ **explicitly recorded as adopting pre-existing work prospectively; not asserted as originating under this claim** |

## §2 — Security acceptance

Testing ran on a **disposable copy**, outside the claimed worktree, before any mutation of the original. `runCapability`'s actual object (not static grep — grep undercounted by one, corrected by direct inspection) is authoritative throughout.

| Control | Result |
|---|---|
| `shell: true` anywhere | **0 occurrences** |
| `exec(`/`execSync(` (non-File variants) | **none** — 13/13 calls are `execFileSync` |
| argv-array execution only | ✅ confirmed by source read |
| unknown capability rejected | ✅ |
| unknown argument rejected | ✅ |
| wrong type rejected | ✅ |
| oversized string rejected | ✅ |
| path escape rejected (`../../../../etc/passwd`) | ✅ |
| shell metacharacters remain literal — `$()`, backtick, `;`, `&&`, `\|`, `\|\|` | ✅ **5/5 payload forms**, zero filesystem side effect (verified via a marker-file existence check, not by absence of an error) |
| `repo.grep` zero matches | ⛔ **found broken** — see below |
| `repo.grep` max_results bound ≤200 | ✅ declared and enforced |
| model calls (`maia-code`/`kimi-cc`/`claude`/`anthropic`/`openai`/`fetch`/prompt strings) | **0** — grepped the capability file **and** the downstream `run-check.mjs` it invokes |
| **MODEL CALLS = 0** | ✅ |

### Two bounded defects found — both fixed, neither a redesign

**Defect 1 — `repo.grep` threw on zero matches.** `git grep` exits 1 for "no matches" (not an error); `execFileSync` throws on any non-zero exit. Fixed with a scoped catch: `err.status === 1` → `{ exit_code: 0, stdout: '' }`; every other exit code still propagates. This is the exact acceptance case the unit named by name.

**Defect 2 — `check.run`'s enum was declared but structurally dead.** `test_type: { type: 'string', …, enum: [...] }` — `runCapability`'s validator only checks the `enum` array when `argSchema.type === 'enum'`. A `'string'`-typed arg with an `enum` property never reaches that branch, so the registry itself enforced nothing; the only reason a bogus `test_type` was rejected was that the downstream `run-check.mjs` happened to validate it too. **Confirmed by testing the registry directly**, bypassing `run-check.mjs` entirely, both before and after the fix. One-line change: `type: 'string'` → `type: 'enum'`. No handler touched.

Both fixes applied identically in the disposable copy and the real worktree; sha256 of the two post-fix copies **matches exactly** — `8b04080598fafcf38a2ef2af509cc63de7b0c6886778e526e81d2e0f1490dff8`.

## §3 — Capability inventory

**15/15 required, exactly** (packet acceptance criterion A3 — 15, not the 14 an earlier grep undercounted):
`git.rev_parse · git.log · git.show_stat · git.diff_stat · git.branch_contains · git.file_history · repo.grep · repo.find_file · repo.locate_symbol · check.run · inventory.migrations · inventory.routes · verify.file_exists · verify.sha256 · verify.count_matches`

No capability added, removed, or renamed by this unit.

## §4 — Classification

```
PASS WITH BOUNDED DEFECTS
```

Both defects fixed to the minimum required for Route A Alpha. Registry structure, capability set, and validation architecture otherwise unchanged.

## §5 — Admit

The required-but-missing `deterministic-registry-proof.mjs` was written during this unit (it is not a new capability — it is the packet's own undelivered acceptance test, now runnable):

```
11 passed, 0 failed   (in-place, real repo cwd)
verification_commands from the original packet, run verbatim:
  PASS: test -f scripts/builder/deterministic.mjs
  PASS: ! grep -q 'shell: *true' scripts/builder/deterministic.mjs
  PASS: node scripts/builder/__tests__/deterministic-registry-proof.mjs
```

Committed under claim `s-fb3b61ce`. Class B (infra — governance-adjacent execution surface, no auth/migration/routing change). **PR opened; not merged — stop, per the unit's own instruction, unless separately authorized.**

## Not done in this unit (per DO NOT)

No cost routing. No DeepSeek. No Kimi repair. No new providers. No capability taxonomy expansion. No Super Learner. No Builder OS wiring beyond what's needed to admit this file — §6 (wire + prove one live task) is the next unit, not this one.
