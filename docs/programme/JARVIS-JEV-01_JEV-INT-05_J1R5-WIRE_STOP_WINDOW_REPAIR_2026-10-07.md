# JARVIS-JEV-01 / JEV-INT-05 — Settled-before-Halt Window Repair

**Date:** 2026-10-07 · **Status:** ⭐ REVIEWABLE CANDIDATE · ⛔ **OFF · NOT RATIFIED · AUTHORIZES NOTHING**
**Repaired HEAD:** `7ae0fdbeda0a15c93705db265042257628e00a80` · follows the Mac verification at
`1d0c76a369605cb82e12c56a0d4b86af8a1b6012` (branch `chore/jev-int05-repair-mac-witness-20261007`; read, not merged).
Fake transports only · no credential · no provider registration/assignment · no spend · no inference ·
no ratification · no merge · no deploy · PILOT-01 deferred, no labels.

## 1 · Defect and repair

**Defect (confirmed):** a failing attempt was settled, then its stop was written as a second append. A
process lost between the two left a settled attempt with no halt, and the next process dispatched again
(transport error, malformed response, model drift, excess usage: 1 send each, required 0).

**Repair — the stop is no longer a thing that must be written; it is derived from the outcome.**
`summarize()` now computes `halted` from durable history: any `halted` record, **or** any `settled` whose
outcome is not `ok`, **or** any `observed` record whose returned model differs from the pinned model, **or**
whose input-token cost exceeds the reserve. The observed record is written *before* settlement, so there is
no window at all for drift or usage; for transport error and malformed response the non-`ok` settlement is
the stop. The explicit `halted` record remains as a log entry only. Not a retry of the missing write.
A clean success interrupted at the same boundary is **not** blocked (control in W35).

**Safe integers:** both `usage` counts must be nonnegative safe integers; a hand-written `observed` record
with an unsafe token count is `LEDGER_CORRUPT`.

## 2 · Independent witness, before and after

The Mac reviewer's committed `schema-stop-witness-portable.mjs` (run unmodified against the captured
schema, sha256 `a191f8a7…60d5` — verified equal) was run on both trees; child exits at the real settled write.

| Condition | `765c236e1` next fake sends | `7ae0fdbed` next fake sends |
|---|---:|---:|
| transport error | **1** (invariant false) | **0** (true) |
| malformed response | **1** (false) | **0** (true) |
| model drift | **1** (false) | **0** (true) |
| usage exceeds reserve | **1** (false) | **0** (true) |
| `output_tokens = 9007199254740992` | accepted | refused |

Receipts: pre `dd9123c3…a1571`, post `532e3fb0…92bc4` (sha256, synthetic temp dirs, not committed).

## 3 · Committed regressions and defeat candidates (new)

| Check | Proves | Defeat candidates (each dies on it) |
|---|---|---|
| W35 | real child-process exit after the real settled append; all four conditions → next dispatch `HALTED`, 0 sends; clean-success control not blocked | `DC-HALT-ONLY-IF-RECORD-WRITTEN`, `DC-OUTCOME-STOP-NOT-DERIVED`, `DC-DRIFT-STOP-NOT-DERIVED`, `DC-USAGE-STOP-NOT-DERIVED` |
| W36 | settlement/halt append failure (injected) → success is not reported and restart is blocked | `DC-SETTLEMENT-FAILURE-REPORTED-OK` |
| W37 | safe-integer bounds, both fields and the ledger | `DC-UNSAFE-TOKEN-ACCEPTED`, `DC-UNSAFE-LEDGER-TOKEN-ACCEPTED` |

Defeat candidates reworked because the repair made the old single-layer ones equivalent: stop semantics now
have two layers (runner's explicit record + derived status), so `DC-MODEL-DRIFT-TOLERATED`,
`DC-USAGE-ANOMALY-IGNORED` and `DC-CROSSING-UNKNOWN-NOT-STOPPING` remove **both** layers; the explicit-record
candidate is retargeted to what it still affects (`DC-HALT-LOG-RECORD-NOT-WRITTEN` → W11). Before this rework
the matrix reported 3 problems (two survivors, one wrong-death) — found and fixed in the suite.

## 4 · Results (clean tree at `7ae0fdbed`, this container, Node v22.22.0)

| Command | Exit | Result | Log sha256 |
|---|---|---|---|
| `node …/jev-wire-v1-findings-repro.mjs old` | 0 | old fails 8/8 | `3953f2a0b6d3…fae926` |
| `node …/jev-wire-v1-findings-repro.mjs new` | 0 | repair fails 0/8 | `816de9258ec1…cee4` |
| `node …/jev-wire-v1-proof.mjs` | 0 | **37 passed · 0 failed** | `0e51e3214803…32951` |
| `node …/jev-wire-v1-matrix.mjs` | 0 | **49/49 killed on named check · 0 problems** | `405138486b00…98` |
| `node scripts/verify-jarvis-jev-j1-freeze.mjs` | 0 | 0 violations | `c77942443850…5f17` |
| `node …/jev-judgment-host-v1-proof.mjs` | 0 | PASS | `2272eddabf1b…ac1` |
| `tsx tests/constitutional/jarvis-jev-j1/matrix.ts` | 0 | LETHAL + DISCRIMINATING, survivors 0 | `9ba90f54d0ff…a80` |
| `tsc -p tsconfig.jarvis-jev-j1.json` (strict J1 only) | 0 | no diagnostics | `8ee5d01b9c54…92e7` |

The two TypeScript rows used a **scratchpad** toolchain (TS 5.6.3, tsx 4.21.0); the Mac run on the project's
own dependencies remains the record for them. This is a J1 typecheck, not a full-application typecheck.

Blob ids: `jev-wire-v1.mjs 6d8aadb0…` · `jev-wire-v1-proof.mjs 5371332b…` · `jev-wire-v1-matrix.mjs a6513115…` ·
`jev-judgment-host-v1.mjs 8138beeb…` (unchanged) · question table `6bb269d8…064e` and fixture list `a0f4a26c…4f60`
(unchanged). The committed `RESPONSE_SHAPE.witnessed` is still `false` (W20).

## 5 · Remaining blockers (the candidate stays OFF)

1. **External anchor is specified, not built.** `ledger_head` being returned persists and enforces nothing.
   Before any live execution the runtime owner must: choose durable storage outside the ledger's own
   directory; persist an independent `{experiment_id, last-known head, seq}` after each recorded outcome;
   on every start compare it with the ledger and **refuse** on truncation, replacement, or re-initialization;
   make establishment and resumption explicit, deliberate acts; and treat a stale `.lock` as a refusal
   pending inspection, never auto-deleted. Not implemented here because the storage location is an owner decision.
2. **Late response handling** is covered (W29: ignored, not recorded); a late answer arriving after
   `crossing_unknown` is deliberately **discarded evidence** — the experiment is already halted.
3. Still unopened and unauthorized: a real adapter that owns its deadline, J1R5-WIRE ratification as a J1
   reopening, the Route A chain, execution/network/spend/disclosure grants, the DPA/retention review, the
   credential, and opening `witnessed`.
4. The Mac project-dependency run of this HEAD's wire proof/matrix is **NOT RUN** by me (container run only).
