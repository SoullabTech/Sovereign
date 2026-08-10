# JARVIS UNIT 7 — RUN 001 (AUDIT RECORD)

Governing authority: `docs/ops/JARVIS_UNIT_7_FUNCTIONAL_MVP.md`
(SHA-256 `d81941b5d584acbcb2dda09f8b9f4d5ab41752f4adb04f4f629191e1fdcf3a26`)

## Run metadata

| Field | Value |
|---|---|
| packet id | `jarvis-u7-provider-trace` |
| timestamp | 2026-08-10 |
| repository | `/Users/soullab/MAIA-SOVEREIGN` |
| HEAD | `54809f994` |
| Unit 7 branch | `jarvis/unit-7-functional-mvp` |
| Unit 7 worktree | `/Users/soullab/.claude/worktrees/ain-jarvis-unit-7-functional-mvp` |
| Unit 7 Builder claim | `s-362ec1a9` (write) |
| packet worktree | `/Users/soullab/.claude/worktrees/ain-jarvis-u7-provider-trace` |
| packet branch | `chore/ain-delegate-jarvis-u7-provider-trace` |
| selected lane | `local` |
| worker | `maia-code` → Claude Code CLI client → `http://localhost:11434` → `maia-coder:latest` |
| execution status | **NOT EXECUTED — refused before invocation** |
| contract status | n/a (no result produced) |
| evidence status | n/a |
| verification status | n/a |
| escalation status | **ESCALATION REQUIRED** |
| result location | none — no result file written |

## Context manifest

**SELECTED**

| Resource | Reason |
|---|---|
| `app/api/sovereign/app/maia/list/route.ts` | live sovereign MAIA route — the packet's entry point |
| `lib/sovereign/maiaService.ts` | orchestration layer between route and provider selection |
| `lib/ai/modelService.ts` | the provider-selection layer the packet must locate |

**EXCLUDED**

| Resource / category | Reason |
|---|---|
| remainder of the repository (~10,500 files) | outside the bounded trace; worker instructed to answer only from `allowed_files` |
| memory corpus (`~/.claude/projects/**/memory`) | not required for a static file:line trace |
| `docs/canon/**`, `CLAUDE.md`, `PROJECT_ORIENTATION.md` | orientation context; task is mechanical reconnaissance, not governance reasoning |
| `database/migrations/**` (440 files) | no schema question in this packet |
| deep-v1 worktree | owned by another live Builder lane; out of bounds |

## Lane eligibility decision

Task type: bounded read-only static code-path tracing.
Per mandate §6 this is **local-eligible**. Worker authority set to READ-ONLY;
`prohibited_files_actions` enumerates edits, writes, installs, commits, network
calls, production access, and service mutation.

## Invocation attempted

```
$ bash scripts/ain-delegate.sh local jarvis-u7-provider-trace

🛑 [ain-delegate] Builder WRITE ownership REFUSED for 'jarvis-u7-provider-trace':
🛑 REFUSED — Claude concurrency budget reached: 2 / 2 active.
   limit source: file:/Users/soullab/.claude/ain-delegation/concurrency.json
     s-362ec1a9  write  opus  jarvis-unit-7-functional-mvp  (jarvis/unit-7-functional-mvp)
     s-ea973bea  write  opus  deep-v1-classifier  (feat/deep-v1-classifier)
   Delegation stopped before invoking any worker — an unowned worktree is not a
   governed workspace.
```

Exit before any worker process started. **No worker was invoked. No result was
fabricated or substituted.**

## The seam — precisely identified

`scripts/builder/session.mjs:236-238`:

```js
// ── invariant 2: concurrency budget. Read-only counts too — inspection consumes
// the same scarce Claude capacity. It simply carries no write authority.
if (active.length >= cfg.max_active) {
```

**Builder OS models one governed session as one *Claude* session.** The stated
rationale — *"inspection consumes the same scarce Claude capacity"* — holds for
the `claude` lane and is **false for the `local` lane**, which routes inference to
Ollama at `http://localhost:11434` with `ANTHROPIC_API_KEY` hard-blanked by
`~/bin/maia-code`. A local worker consumes **zero** Anthropic capacity, yet is
charged a slot in a budget whose entire purpose is rationing Anthropic capacity.

Consequence: whenever both Claude lanes are legitimately occupied, **no local
worker can run at all** — even though local inference capacity is completely idle.
The scarce resource and the rationed resource are not the same resource.

This is a capacity-*model* defect, distinct from the PID/liveness semantics that
mandate §15 places out of scope.

## Proof the local backend is genuine (not Claude relabeled)

| Evidence | Value |
|---|---|
| `~/bin/maia-code` | `export ANTHROPIC_API_KEY=""` — cannot reach Anthropic |
| `~/.maia-env` | `ANTHROPIC_BASE_URL="http://localhost:11434"` |
| `~/.maia-env` | `ANTHROPIC_MODEL="maia-coder"` |
| `ollama list` | `maia-coder:latest  1ca70a216894  18 GB` |
| `pgrep -l ollama` | pids 3901, 44195, 50454 — daemon live |

The wrapper uses the Claude Code CLI as a *client*, pointed at a local model. This
satisfies mandate §7's genuineness requirement; it was the budget, not the
backend, that blocked the run.

## Candidate fixes (NOT applied — require founder authorization)

1. **Lane-aware budget accounting.** Charge only `claude`-lane sessions against
   `max_active`; govern `local`/`kimi` lanes under their own limits. Most correct;
   changes governance semantics.
2. **Audited override.** `session.mjs open … --override "<reason>"` — the
   sanctioned escape hatch, recorded in the ledger and surfaced by `status`. Not
   used here: the governing ruling says *"Do not increase beyond 2,"* and an
   override admits a third active session.
3. **Wait for a lane.** `--queue` records the session as queued, holding no claim,
   eligible when an active session closes.

## Disposition

**ESCALATION REQUIRED** — local invocation blocked by the capacity-model seam
above. Required next authority: **founder**, to choose among the candidate fixes.

Per mandate §11, correct escalation is successful JARVIS behavior. Per §16 this is
classification **B — FUNCTIONAL CONTROL PLANE / LOCAL INVOCATION BLOCKED**.

---

# RUN 001 — SECOND ATTEMPT (after deep-v1 handoff freed a lane)

deep-v1 (`s-ea973bea`) handed off; capacity became `limit=2 active=1 available=1`.
The packet was re-run through the same operator entry point. **The seam described
above was not fixed — it was relieved by a lane becoming free.** It remains a real
defect and is carried forward as the Unit 8 candidate.

## Invocation (genuine)

```
$ bash scripts/ain-delegate.sh local jarvis-u7-provider-trace
[ain-delegate] Builder WRITE ownership registered: s-c1939bc7
[ain-delegate] local run complete for 'jarvis-u7-provider-trace' — exit=1 tests=pass escalate=false
```

## Structured result captured

| Field | Value |
|---|---|
| lane | `local` |
| model | `maia-coder:latest` |
| duration_s | **116** |
| attempts | 1 |
| exit | **1** |
| files_changed | `[]` |
| starting_sha | `54809f994` |
| ending_sha | `null` |
| recommended_next_action | `reject` |
| log_path | `~/.claude/ain-delegation/logs/jarvis-u7-provider-trace.log` |

## Proof maia-coder actually executed

- A real subprocess ran for **116 seconds** — not a mock, not a stub, not Claude.
- Backend identity recorded by the control plane as `maia-coder:latest`
  (Ollama, 18 GB, `ANTHROPIC_BASE_URL=http://localhost:11434`,
  `ANTHROPIC_API_KEY` hard-blanked by `~/bin/maia-code`).
- Worker transcript written to disk (211 bytes), containing a runtime error
  emitted by the worker process itself.

## Worker failure (genuine, detected)

```
Prompt is too long
```

The bounded 3-file context manifest still exceeded the worker's configured window
(`CLAUDE_CODE_MAX_CONTEXT_TOKENS=65536`, set in `~/bin/maia-code` to match the
Modelfile `num_ctx`). The three selected files total roughly 100 KB, dominated by
`app/api/sovereign/app/maia/list/route.ts` (81 KB) and `lib/sovereign/maiaService.ts`.

**The context router was bounded but not bounded enough.** Selecting whole files is
insufficient for an 18 GB local model; the router needs line-range or symbol-level
selection. This is a concrete, actionable finding produced by real execution.

## JARVIS judgment

| Check | Result |
|---|---|
| Execution complete | **NO** — worker exited 1 |
| Result contract structurally valid | **YES** — well-formed JSON, all required fields |
| Required evidence present | **NO** — no entry point, call chain, or `file:line` returned |
| Independent evidence verification | **RUN** — 3 verification commands executed by JARVIS, all PASS |
| Boundary respected | **YES** — `files_changed: []`, no writes, READ-ONLY honored |
| Failures disclosed | **PARTIAL** — see defect below |
| **Verified** | **NO** |
| **Escalation required** | **YES** |

## Contract defect found in the result record

The worker's result asserts `"escalation_required": false` while simultaneously
reporting `exit=1` and `"recommended_next_action": "reject"`. A failed run that
declares no escalation is internally inconsistent. JARVIS did not accept the
worker's self-assessment — it escalated on the objective evidence (non-zero exit,
absent required evidence) rather than the worker's own flag.

**This is precisely why mandate §9 separates EXECUTION COMPLETE from CONTRACT VALID
from EVIDENCE SUFFICIENT from VERIFIED.** A syntactically valid result that
self-reports success is not a trustworthy result.

## Disposition

**ESCALATION REQUIRED.** Reason: worker exited non-zero with zero required evidence
produced, due to context-window overflow. Required next authority: founder, to
authorize either (a) line-range/symbol-level context routing, or (b) a
larger-context local model for this packet class.

## Full pipeline stage record

| Stage | Status |
|---|---|
| PACKET CREATED | ✅ `jarvis-u7-provider-trace.json` |
| PACKET ACCEPTED | ✅ validated by `ain-delegate.sh` |
| CONTEXT SELECTED | ✅ 3-file manifest, ~10,500 files excluded |
| LANE ELIGIBILITY | ✅ local-eligible (bounded read-only recon) |
| maia-coder INVOKED | ✅ **genuinely — 116s, exit 1** |
| RESULT CAPTURED | ✅ structured JSON |
| CONTRACT VALIDATED | ✅ valid form, inconsistent self-report detected |
| EVIDENCE CHECKED | ✅ 3 commands PASS; required worker evidence ABSENT |
| VERIFIED / ESCALATION | ✅ **ESCALATION REQUIRED** |
| RESULT PERSISTED | ✅ this record + result JSON + transcript |
