# JARVIS-00 — Reality Binding Proof

**Date**: 2026-08-24
**Program**: JARVIS-00 (Reality Binding) — first Program of the JARVIS master directive
**Scope**: establish and prove the canonical JARVIS runtime and repository binding. No architecture built. JARVIS-01 not started.

## Verdict

**PASS with one named limit.** The binding resolves, a bounded read-only task executes through the canonical router, evidence persists, and a separate process re-binds and retrieves it. One defect was found on the C1 lane and fixed within the smallest safe scope. C1 cannot be proven end-to-end in this environment because no local model runtime is present.

## Historical failure — status

`repo root not found — cannot route` was resolved by JOP-04 (2026-08-17): dev mode now falls **through** the walk into the same `env → config → default` ladder packaged mode honours, instead of off a cliff. Order lives in `jarvis-desktop/src/repo-resolution.js`; the sources stay in `main.js`, so each has one implementation.

Per the directive this was **proven, not assumed** — and proving it surfaced a *different*, live binding defect on the C1 lane.

## Defect found: C1 lane bound to an undeclared identifier

`jarvis-desktop/src/main.js` resolved the C1 substrate through a bare `REPO_ROOT` (3 references). That identifier **is never declared** — only `REPO_ROOT_MODE` and `currentRoot()` exist. Introduced in `b235ba0` (JOP-00, 2026-08-16).

Consequence: every C1 task threw `ReferenceError: REPO_ROOT is not defined` on the block's first statement, was swallowed by the lane's own `try/catch`, and surfaced as a generic `status: 'failed'` — **indistinguishable on screen from "Ollama is down"**. The console blamed the worker for a binding fault.

### Why the existing C1 test did not catch it

`test/c1-evidence-containment.test.mjs` proves its scope guards by reading `main.js` as **text** and re-implementing the imports against its own test-local `REPO_ROOT` const. Against a text assertion the defective source reads correctly — the identifier is right there in the string.

**Text proves shape; only execution proves binding.**

### Fix

Three references → `currentRoot()`, matching the C0 lane and the file's stated "rebind without relaunch" contract. No new resolution source; no behavior change to any lane that was already working.

### Regression cover

`test/jop-05-c1-root-binding.test.mjs` **executes** the shipped C1 block in a scope that supplies no repo-root name, so an undeclared binding throws instead of hiding. Includes a negative control that reintroduces the exact defect and requires the harness to catch it — a test that cannot fail proves nothing.

## Evidence

| Field | Value |
|---|---|
| Repository root | `/home/user/Sovereign` |
| Canonical markers | all 4 present (`session.mjs`, `deterministic.mjs`, `router.mjs`, `package.json`) |
| Commit | `be5b3b8` |
| Branch | `claude/jarvis-master-directive-ckcg9b` |
| Worktree | single, not detached |
| Binding source | dev-mode upward **walk** (highest precedence; `JARVIS_REPO_ROOT` unset, no config, default candidate `/Users/soullab/MAIA-SOVEREIGN` absent — macOS path, this host is Linux) |
| Persistence | `$AIN_DELEGATION_HOME/runtime/` (`runs/<id>.json`, `events.jsonl`, `runtime.json`), atomic temp+rename |
| Worker runtime | `scripts/builder/deterministic.mjs` — 15 registered read-only capabilities |
| Model used | **none** — C0 is deterministic by design |

### Bounded task, executed

Routed `git.rev_parse{ref:HEAD}` through the canonical `router.mjs` (no reimplementation) → lane `C0`, cost class `deterministic`, `exit_code 0`, stdout `be5b3b80241eb988e74f16cb8851888f135d45df`. Persisted as run `r-47eac36194` (pid 14032).

### Restart test

A **separate process** (pid 14398) re-resolved the binding from scratch, retrieved `r-47eac36194`, and independently re-derived HEAD:

- `same_process: false`
- `rebound_to_same_root: true`
- `evidence_matches: true` (persisted HEAD == re-derived HEAD)
- `listRuns` → `{total: 1, …}`

Provenance survived the restart.

## Blockers / named limits

1. **C1 not provable end-to-end here.** The lane calls Ollama at `127.0.0.1:11434` (`qwen2.5:7b`); the port is not reachable in this container. The *binding* fault is fixed and proven by execution; the *full* C1 path (worker → evidence containment → `verifyEvidence`) remains unwitnessed in this environment. This is an environment limit, not a code defect — and it is exactly the failure the old defect was masquerading as, so the two must not be conflated.
2. **Electron surface unexercised.** `main.js` was proven by executing its shipped C1 block in a faithful scope, not by launching the app. Desktop IPC end-to-end remains unwitnessed here.
3. **Layer witnessed**: source + module execution. Not build, not deployed, not runtime-in-app.

## Not done (deliberately)

JARVIS-01 not started. No Deep Agents, Semantica, or TencentDB evaluation or installation. No architecture, memory, graph, or governance work.
