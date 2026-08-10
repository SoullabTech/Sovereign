# JARVIS RUN 004 — first work packet submitted through the runtime API

**Date** 2026-08-10 · **Unit** 11 · **Builder session** `s-728dac70`
**Runtime** `rt-631bc86b` (pid 71887) → restarted as `rt-8974f405` (pid 74591)
**Run id** `r-526195d3c4` · **Work unit** `jarvis-u11-provider-trace-004`
**Disposition** **VERIFIED**

This is the first JARVIS run in which no human ran the delegation script. The
operator's only act was `POST /runs` with a JSON packet. The runtime drove
`packet → guard → context → capacity → native worker → result → verification →
persistence` on its own.

---

## Task

Identical to Runs 001–003R, deliberately, so the result is comparable:

> Trace the live MAIA text-model provider path from the sovereign MAIA route to
> its provider-selection layer and return exact file:line evidence. READ-ONLY.
> Do not modify anything.

Unit 10 packet strategy retained without alteration: six `anchor` selectors (no
authored line numbers anywhere), `verification_commands` absent, one canonical
tree throughout.

## Submission

```
POST http://127.0.0.1:8787/runs   content-type: application/json
→ 202  {"run_id":"r-526195d3c4","state":"QUEUED","accepted_by":"rt-631bc86b",
        "note":"runtime accepted; worker capacity is evaluated at dispatch"}
```

`202` is the §9 distinction made literal: the **runtime** accepted the packet.
Whether a **governed worker slot** exists is a separate fact, decided at dispatch
against Builder OS capacity — never a second capacity system.

## Observed transitions

```
QUEUED → VALIDATING → CONTEXT_ROUTING → READY_FOR_WORKER → RUNNING
       → VALIDATING_RESULT → VERIFYING_EVIDENCE → VERIFIED
```

Every stage was observable through `GET /runs/:id` and emitted on `GET /events`
(`run.created`, `run.state_changed` ×7, `context.selected`, `worker.started`,
`worker.completed`, `verification.started`, `verification.completed`,
`run.verified`).

## Workspace and capacity

| Fact | Value |
|---|---|
| Canonical SHA | `54809f994` |
| Worktree | `~/.claude/worktrees/ain-jarvis-u11-provider-trace-004` (claimed by the runtime via `ain-worktree-claim.sh`) |
| Execution HEAD | `54809f99417a9f4fef6030b7a78f690293e05143` |
| Builder capacity at dispatch | 1 / 2 active → slot available |
| Builder claim for the run | opened by `ain-delegate.sh`, released as `completed` afterwards |

The Unit 11 lane paused its own claim to free the slot, exactly as the Unit 10
lane did for Run 003-R. No other lane was touched; the concurrent
`reflection-provenance-reconciliation` claim held its slot throughout.

## Context routing (Unit 8 + Unit 10, unchanged)

6 fragments · **1,496 estimated input tokens** against a 32,768 safe threshold
(65,536 × 0.5) · 31,272 tokens of headroom.

| Fragment | Method | SHA | content_hash |
|---|---|---|---|
| `app/api/sovereign/app/maia/list/route.ts:253-259` | `anchor:lines` | `54809f994` | `e8158e2b00b1` |
| `app/api/sovereign/app/maia/list/route.ts:86-86` | `anchor:lines` | `54809f994` | `7c9a6672368a` |
| `lib/sovereign/maiaService.ts:6-6` | `anchor:lines` | `54809f994` | `9a1e16bd5de0` |
| `lib/ai/modelService.ts:76-96` | `anchor:lines` | `54809f994` | `01dde0c8623d` |
| `lib/ai/modelService.ts:52-54` | `anchor:lines` | `54809f994` | `64ad7f881754` |
| `lib/ai/modelService.ts:153-195` | `anchor:lines` | `54809f994` | `e8854beaeca4` |

## Worker

Native Ollama transport (Unit 9): `maia-coder:latest` via
`POST http://localhost:11434/api/generate`. No Claude Code CLI, no tools, no
auto-loaded `CLAUDE.md`. Delegate exit `0`, duration **6 s**, `files_changed: []`,
`ending_sha: null`.

Worker output (verbatim, trimmed):

```
LIVE ENTRY POINT: app/api/sovereign/app/maia/list/route.ts:253

CALL CHAIN:
1. app/api/sovereign/app/maia/list/route.ts:253 - POST handler
2. app/api/sovereign/app/maia/list/route.ts:86 - imports getMaiaResponse
3. lib/sovereign/maiaService.ts:6 - imports generateText from modelService
4. lib/ai/modelService.ts:76 - generateText function entry point

PROVIDER SELECTION: lib/ai/modelService.ts:52 (TEXT_MODEL_PROVIDER constant
declaration) and lib/ai/modelService.ts:153 (backend selection branch)

FAILURES: None
UNKNOWNS: None
```

## Verification — decided by the runtime, not the worker

Method: **materialized-fragment containment**. A toolless worker can only have
seen the fragments it was handed, so any citation outside those ranges is
fabricated by construction. This is the mechanism Run 003 lacked.

| Citation | In materialized context |
|---|---|
| `app/api/sovereign/app/maia/list/route.ts:253` | ✓ (253-259) |
| `app/api/sovereign/app/maia/list/route.ts:86` | ✓ (86-86) |
| `lib/sovereign/maiaService.ts:6` | ✓ (6-6) |
| `lib/ai/modelService.ts:76` | ✓ (76-96) |
| `lib/ai/modelService.ts:52` | ✓ (52-54) |
| `lib/ai/modelService.ts:153` | ✓ (153-195) |

**6 / 6 valid · 0 invalid.** The worker again self-reported
`escalation_required: false`; as in every prior run that self-report carried no
weight — the runtime decided. Entry point **253** matches Run 003-R's verified
answer and is the value Run 009 (Unit 9) got wrong.

## Audit artifacts

```
packet  ~/.claude/ain-delegation/packets/jarvis-u11-provider-trace-004.json
result  ~/.claude/ain-delegation/results/jarvis-u11-provider-trace-004.json
log     ~/.claude/ain-delegation/logs/jarvis-u11-provider-trace-004.log
run     ~/.claude/ain-delegation/runtime/runs/r-526195d3c4.json
events  ~/.claude/ain-delegation/runtime/events.jsonl
ledger  ~/.claude/ain-delegation/episodes.jsonl   (one line, as for every prior run)
```

## Restart proof (§12)

| Step | Evidence |
|---|---|
| Stop | `jarvis-runtime.sh stop` → pid 71887 exited on SIGTERM; runtime record cleared; port refused connections |
| Restart | new runtime `rt-8974f405`, **new pid 74591** |
| Recover | `GET /runs/r-526195d3c4` → `VERIFIED`, disposition `VERIFIED`, 6/6 citations, all 8 transitions, audit paths intact |
| No re-execution | result artifact mtime `06:05:38.144Z` predates the new runtime's `started_at` — the worker was not run again |

## Defect found, recorded not fixed

`scripts/ain-delegate.sh` resolves the result contract's `model` field with an
`if/elif` chain covering `local`, `kimi` and `claude` only, so a `local-native`
run records `"model": "UNKNOWN"` even though `maia-coder:latest` executed. This is
a Unit 9-owned provenance gap, not a Unit 11 regression, and fixing it after the
run would have invalidated the artifact this record certifies. The runtime records
the true transport and model in `run.worker`. Left for a future unit.

Also unavailable: Ollama's `prompt_eval_count`. `ain-delegate.sh` invokes the
native worker without `--json`, so the backend token counts land nowhere. Unit 9
Run 003 captured them; this path does not.
