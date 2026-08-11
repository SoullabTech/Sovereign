# JARVIS — Route A Live Zero-LLM Proof

**Date:** 2026-08-11 · **Mode:** VERIFY MERGE → LIVE TASK → NEGATIVE CONTROL → CLAIM RELEASE → STOP
**Trunk:** `clean-main-no-secrets` @ `83a240b08e4bf913f10eadc6f4c8199400de8d26` (PR #1021 merge commit)

---

## §3–4 Merge + post-merge verification

`#1021` updated from `696f3241e` → `a2bccf0d9` (trunk had advanced to `ef7319ea8`). Re-verified before merge: `696f3241e` ancestor of new head ✅ · delta unchanged (3 files, +424, 0 unrelated) ✅ · `deterministic.mjs` sha256 `8b04080598fafcf…` unchanged ✅ · both security fixes present ✅ · proof file present ✅. 5/5 checks green, single run each. Merged normally, no bypass — **`83a240b08`**.

Post-merge, in a **fresh independent clone** (not the PR worktree): merge commit names #1021, exactly 3 files entered (0 unrelated), `deterministic.mjs` sha256 matches exactly, proof suite **11/11 passing in place** with real git history (a first attempt using `/tmp` and a bare `git init` failed for unrelated reasons — no `HEAD` exists pre-first-commit; not a trunk defect, a test-environment artifact, corrected by using the real clone).

## §5 — Live task, full chain

```
work packet → route A selected explicitly → deterministic capability invoked
  → zero prompt construction → zero maia-code/kimi-cc/claude → result
  → independent verification → claim release
```

**Task:** inventory route files under `app/api` — real, useful, Builder-OS-relevant.

```json
{"work_unit_id":"route-a-live-proof-2026-08-11","execution_lane":"route-a-deterministic","capability":"inventory.routes","args":{"dir":"app/api"}}
```

| | |
|---|---|
| Route selected | **A (deterministic)** — explicit in the packet, no model consulted to choose it |
| Capability | `inventory.routes` |
| Result | `exit_code: 0`, 14–18ms, **2090 files** |
| Model call ledger | `prompt_construction_calls: 0` · `{"maia-code":0,"kimi-cc":0,"claude":0}` |
| **Independent verification** | a **separate** `git ls-files app/api` call — not a re-run of the same capability — also returned **2090**, set-equal. Match: **true** |

⚠️ **First attempt genuinely failed verification** — 2726 vs 2090 — and the failure was correctly not waved through. Root cause: `inventory.routes` defaults `dir` to `'app'`; the task called it with `args: {}` while independently checking only `app/api`. Two different questions compared as one. Fixed by passing `dir: 'app/api'` explicitly, matching both sides of the check. This is exactly what independent verification is *for* — it caught a real test-design error, not a capability defect.

## §6 — Negative control

Founder's spec allows unknown-capability, path-escape, **or** shell-metacharacter payload — with the requirement *rejected with no side effect*.

**Control A — path escape**, `verify.file_exists` with `../../../../../../etc/passwd`: **rejected**, `"Path argument path resolves outside cwd"`.

**Control B — shell-metacharacter payload**, `repo.grep` with `$(touch <marker>)`: did not throw, but **zero side effect** — the marker file was never created (`execFileSync` argv-isolation, confirmed by direct filesystem check, not by the absence of an error).

⚠️ **Honest observation, not silently fixed.** An initial attempt used `inventory.routes`'s `dir` argument with a `$(...)` payload; it neither threw nor produced a side effect. The built-in path-escape heuristic only fires on strings starting with `/` or containing `../` — this payload matches neither, so no explicit rejection occurred. It remains **safe by construction** (argv isolation), not **safe by validation** (schema rejection) — confirmed zero side effect. Not a Route A blocker; flagged for a future unit, not patched here (out of scope per the unit's own DO NOT list).

## §5 — Claim lifecycle

Opened `s-e0c306b0`, unit `route-a-live-proof`, **read-only** (correct — the run mutates nothing in the governed repo, only a disposable clone). Ran the full chain and the negative control under the open claim, both exit 0. Closed `s-e0c306b0` as `completed`. Capacity confirmed released.

---

## §7 — RETURN

```
CANONICAL TRUNK SHA:      83a240b08e4bf913f10eadc6f4c8199400de8d26
ROUTE A MERGED:           YES — #1021
LIVE TASK:                inventory.routes({dir:"app/api"}) — declared route inventory
CAPABILITY:                inventory.routes
MODEL CALLS:               0  (maia-code:0, kimi-cc:0, claude:0, prompt_construction:0)
RESULT:                    2090 files, exit_code 0, 14-18ms
INDEPENDENT VERIFICATION:  MATCH — separate git ls-files call, 2090 == 2090
                           (first attempt caught a real args mismatch — not waved through)
CLAIM RELEASE:             s-e0c306b0 opened read-only, ran chain, closed completed
NEGATIVE CONTROL:          PASS — path escape rejected; shell-metachar payload
                           produced zero side effect (safe-by-construction gap
                           in inventory.routes' dir arg noted, not fixed)
ROUTE A OPERATIONAL:       YES
```

**STOP Route A recovery.**

Next: **minimal cost routing → Desktop Alpha.** Not authorized here: capability expansion, new providers, Super Learner.
