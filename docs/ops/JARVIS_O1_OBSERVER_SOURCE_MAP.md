# JARVIS Unit O-1 — Observer Source Map

**Unit:** COMMAND 1 — Daily Observer
**Mode:** implementation authorized; **read-only authority**.
**Branch:** `chore/jarvis-o1-daily-observer`, off `a530388e6` (D-14R tip — the JARVIS Desktop program tip).
**Date:** 2026-08-10

This is the mandated pre-implementation map: *required datum → authoritative producer → retrieval → freshness → failure state → presentation*. It exists so Observer **assembles** existing authority rather than manufacturing a second source of truth.

---

## 0. Three corrections to the assumed source list

The COMMAND 1 brief named candidate producers. Source inspection changes three of them. Recording this before building, because each would have produced a wrong design.

**C-1 — `jarvis-context.mjs` is NOT a program/unit state source.** Its exported surface is `estimateTokens`, `extractSymbol`, `materializeOne`, `materializePacket`, `renderFragments`, `budget`. It is a **context-packet materializer and token budgeter** for dispatching workers — it answers *"will this packet fit in the worker's window?"*, not *"what is the program doing?"*. **Observer must not read it.** Program/unit state comes from run records (§3) and claim records (§2).

**C-2 — `jarvis-governance-gate.mjs` is a validator, not a state store.** It exports frozen constants (`GATE_CLASSES`, `GATE_STATUS`, `GATE_REFUSAL`, `NON_GOVERNANCE_REASONS`) and pure functions (`validateWorkerGate`, `resolveGovernanceGate`, `publicGovernanceGate`). Gate **state** lives inside run records. Observer imports the **constants and `publicGovernanceGate` only** — the latter is the existing redaction boundary and is the required path for rendering any gate to the founder. Observer must never call `resolveGovernanceGate` or `validateWorkerGate`; those decide, and deciding is not observing.

**C-3 — the existing Desktop surface is a command-submission surface, not an observation surface.** `desktop-app/jarvis/renderer/index.html` contains `command-form`, `objective`, `authority-badge`, `submit`, `submit-result`, `run-list`, `detail-panel`. That is Assistant/Operator-shaped. **Observer is a distinct read-only surface.** It reuses the transport (`lib/runtime-client.js`) and the presentation helpers, and it does **not** extend, touch, or borrow the submit path.

---

## 1. Substrate

All Builder-OS / JARVIS state is file-based under `$AIN_DELEGATION_HOME` (default `~/.claude/ain-delegation`), written atomically:

```
sessions/<id>.json          claim records            (session.mjs)
sessions.jsonl              append-only claim ledger (session.mjs)
concurrency.json            limit + limit source     (session.mjs)
runtime/runs/<run_id>.json  one file per run         (jarvis-runtime-store.mjs)
runtime/events.jsonl        append-only transitions  (jarvis-runtime-store.mjs)
runtime/runtime.json        current runtime process  (jarvis-runtime-store.mjs)
```

Observer reads through the **producers**, never by parsing these files directly — file layout is the producers' private contract.

---

## 2. Claims — `session.mjs status --json`

**Authoritative producer.** Verified: `cmdStatus()` emits exactly the Claims family Observer needs.

```json
{ "limit": n, "limit_source": "...", "active": n, "queued": n,
  "sessions": [ { ...record, "liveness": {...} } ],
  "queued_sessions": [], "overrides": [], "collisions": [], "recoverable": [],
  "local_request_rate": { "windows": {...}, "overall_band": "...", "recommendation": "..." } }
```

| Property | Value |
|---|---|
| Retrieval | `node scripts/builder/session.mjs status --json`, subprocess, argv-fixed, no shell |
| Freshness | point-in-time at exec; stamp `observed_at` at spawn |
| Failure | non-zero exit / unparseable → `UNAVAILABLE` + stderr reason. **Never** an empty claim list |
| Presentation | active/queued/limit + `limit_source`; owner, age, worktree; collisions; recoverable |

**Two doctrines already encoded upstream that Observer MUST propagate, not flatten:**

1. *"Concurrency is a PROXY for the variable that actually failed on 2026-08-09; rate is the variable itself. Never let a green concurrency number imply a calm request rate — they can and did diverge."* → Observer renders concurrency and `local_request_rate` as **two independent readings**. A green concurrency count must never visually imply a calm rate.
2. **Ungoverned lanes**: when `local_request_rate.windows.w60m.distinct_sessions > active`, the difference is sessions consuming the same allowance while invisible to the budget. Observer must surface this as a first-class warning, not a footnote.

`local_request_rate` is explicitly **not** Anthropic quota units — it is local transcript counts. Label accordingly.

---

## 3. Runs / governance — JARVIS runtime REST

**Authoritative producer.** `scripts/builder/jarvis-runtime.mjs` on loopback `127.0.0.1:8787` (`JARVIS_RUNTIME_PORT`).

| Route | Observer use |
|---|---|
| `GET /health` | runtime reachability + process record |
| `GET /runs` | run list — unit, state, gate |
| `GET /runs/:id` | detail, via `publicRun()` |
| `GET /events` (SSE) | **notification only** — see below |
| `POST /runs`, `POST /runs/:id/resolve-gate`, `POST /runs/:id/cancel` | ⛔ **FORBIDDEN** — Observer must be structurally incapable of reaching these |

**Transport already exists and is correct: `desktop-app/jarvis/lib/runtime-client.js`.** It asserts loopback (`assertLoopback`, `LOOPBACK_HOSTS`), rejects non-loopback hosts, classifies offline codes (`ECONNREFUSED`/`ENOTFOUND`/`EHOSTUNREACH`/…), and carries this doctrine in-code:

> *"GET /events (SSE). **Notification, never truth (§14)** — every handler is expected to re-fetch REST state."*

That is precisely Observer's freshness discipline, already established. **Adopt it; do not reinvent it.** SSE may only invalidate a cache and trigger a re-read — it may never itself become displayed state.

| Property | Value |
|---|---|
| Freshness | per-REST-response `observed_at`; SSE marks stale, never supplies value |
| Failure | offline → runtime family `UNAVAILABLE`, endpoint named. **Never** "no runs" |

---

## 4. Git / PR

| Datum | Producer | Failure |
|---|---|---|
| branch, HEAD SHA, dirty count | `git` in the observed worktree | `UNAVAILABLE` |
| trunk relationship | `git rev-list --count` vs `origin/clean-main-no-secrets` | ⚠️ **must not fetch** — read-only means the tracking ref may be stale; expose staleness rather than curing it |
| **local-only branch** | `git ls-remote` presence check | a branch with no remote ref must render **visibly distinct** from a synchronized one |
| PR number/state/checks | `gh pr view --json …` | network/auth failure → `UNAVAILABLE`, **never** cached-as-current |

⚠️ **The stale-tracking-ref trap is proven, not hypothetical.** During COMMAND 0 this program recorded `origin/clean-main-no-secrets = 0d145071c` from an unfetched local tracking ref; true remote trunk was `06f5103ef`, 4 commits ahead, which also made the production delta wrong (2 → 6). Observer must therefore label trunk comparisons with the **age of the tracking ref**, or state that it is unfetched. This is the single most likely way Observer lies while appearing precise.

---

## 5. Production

| Datum | Producer | Failure |
|---|---|---|
| production SHA | `ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'` | `UNREACHABLE` — ⛔ **never** "healthy" |
| health | `docker ps` / `/api/health` | as above |
| prod ↔ trunk divergence | `git rev-list --count` | `UNKNOWN` if either side unavailable |

`GIT_COMMIT=unknown` means the deploy bypassed the provenance chain (per `CLAUDE.md`) — Observer renders that as a **distinct** state, not as a missing value.

---

## 6. Epistemic contract

Every datum carries one of four classes, and they must be visually distinguishable:

| Class | Meaning |
|---|---|
| **OBSERVED** | read directly from an authoritative producer, with `observed_at` |
| **DERIVED** | computed from observed values (e.g. prod↔trunk delta); shows its inputs |
| **INFERRED** | a warning Observer raises (e.g. ungoverned lanes); labelled as inference |
| **UNAVAILABLE** | producer failed; carries the reason. **Never rendered as a clear/empty/healthy state** |

Freshness accompanies every family: *when observed, from what source*. Anything past its TTL renders visibly stale rather than silently current.

---

## 7. Negative controls (the acceptance test, not the happy path)

| # | Condition | Required behavior |
|---|---|---|
| N1 | no active claim | renders "no active claims", **not** a phantom claim |
| N2 | `gh` unavailable | PR family `UNAVAILABLE`; **no** cached state shown as current |
| N3 | production unreachable | `UNREACHABLE`; **never** "healthy" |
| N4 | unit waiting for founder | never appears runnable/unblocked |
| N5 | datum past TTL | renders stale; never silently fresh |
| N6 | local branch with no remote | distinguishable from synchronized |
| N7 | runtime offline | runtime family `UNAVAILABLE`; **not** "0 runs" |
| N8 | concurrency green + rate ANOMALOUS | both shown; green must not imply calm |
| N9 | any POST route | structurally unreachable from Observer |

N9 is enforced **structurally** — the Observer IPC surface exposes no write verb — not by a flag.

---

## 8. Known fork (out of scope here, feeds COMMAND 2)

`chore/jarvis-unit-20-native-gate-wiring` (`d4b5fff43`) and `chore/jarvis-desktop-d14r-…` (`a530388e6`) **diverged at Unit 19 (`8548a30d2`); neither is an ancestor of the other.** Observer is based on `a530388e6` because it carries the fuller record set and everything Observer reads.

Practical consequence to expect at commit time: `d4b5fff43` contains *"make the sovereignty pre-commit hook hermetic in worktrees"*, which is **not** in this lineage. Committing from this worktree may hit the non-hermetic hook. Handle it when it occurs; do **not** reconcile the fork inside COMMAND 1.

---

## 9. Build order

1. Read-only adapters, one per §2–§5, each returning `{value, class, observed_at, source, error}` — never a bare value.
2. Composition layer: assemble; never reconcile conflicting sources into a single confident number.
3. Read-only IPC (no write verbs) + renderer.
4. Negative controls §7 first, happy path second.

**Non-goals restated:** no command execution, no claim mutation, no approval machinery, no deployment, no remediation, no new governance database, no external retrieval. Observer observes.
