# JARVIS UNIT 11 — PERSISTENT LOCAL RUNTIME SERVICE (execution record)

> Durable record. A Builder with **no conversation context** must be able to
> reconstruct the runtime from this file plus the code it names.
> Mandate: `docs/ops/JARVIS_UNIT_11_RUNTIME_SERVICE.md`.
> Base commit `395ffad43` · executed 2026-08-10 · Builder session `s-728dac70`.

**Classification: A — JARVIS RUNTIME VERIFIED.**

A persistent local runtime accepted a real work packet through its HTTP API,
executed the proven Units 7–10 pipeline, reached `VERIFIED` on independently
checked evidence, emitted observable state transitions, persisted the result,
survived a full restart, and remained loopback-only throughout.

---

## 1. What was missing before this unit

Units 7–10 built a governed pipeline that only a human in a Claude Code session
could start. `scripts/ain-delegate.sh` is a shell entry point invoked by an
operator; nothing could ask JARVIS to do work programmatically, nothing could
watch it work, and run history existed only as files nobody enumerated.

The seam that was actually missing was small: **a process that owns the pipeline's
lifecycle and exposes it**. Not new delegation logic — an operating doorway.

## 2. Architecture

```
   client  ──HTTP(loopback)──▶  jarvis-runtime.mjs        (lifecycle, API, SSE, queue)
                                      │
                                      ▼
                               jarvis-runtime-pipeline.mjs (THE SEAM — no delegation
                                      │                     logic of its own)
        ┌─────────────────────────────┼─────────────────────────────┐
        ▼                ▼            ▼             ▼               ▼
 packet-guard      jarvis-context  session.mjs  ain-delegate.sh  independent
 (Unit 10:         (Unit 8:        (Unit 3/6:   local-native     evidence
  leakage lint,     materialize,   capacity)    (Units 7/9:      verification
  SHA binding)      budget gate)                 claim → prompt   (new in Unit 11)
                                                 → native worker
                                                 → result contract)
                                      │
                                      ▼
                               jarvis-runtime-store.mjs  (durable run index)
```

Nothing in Units 7–10 was rewritten. The runtime calls the same modules the shell
path calls, and dispatches the worker by spawning `ain-delegate.sh local-native`
— one subprocess, array argv, no shell interpolation.

## 3. Implementation

| File | Purpose |
|---|---|
| `scripts/builder/jarvis-runtime.mjs` | HTTP service: lifecycle, endpoints, SSE, FIFO dispatch queue, cancellation, loopback enforcement |
| `scripts/builder/jarvis-runtime-pipeline.mjs` | The seam. Run state machine, packet schema validation, authority refusal, gate orchestration, delegate spawn, result-contract validation, independent evidence verification |
| `scripts/builder/jarvis-runtime-store.mjs` | Durable run index + append-only event log + runtime process record; orphan reconciliation on restart |
| `scripts/builder/jarvis-runtime-client.mjs` | Typed client (§15): `health · createRun · getRun · listRuns · cancelRun · subscribe · waitForRun` |
| `scripts/jarvis-runtime.sh` | Operator commands: `start · status · stop` |
| `scripts/builder/__tests__/jarvis-runtime-proof.mjs` | 15 assertions covering the §17 list |

`package.json` was deliberately **not** modified: Units 8 and 10 run their proofs
directly with `node`, and this unit follows that precedent rather than editing a
file shared with every other lane.

## 4. Runtime model (§2)

Lifecycle `STARTING · READY · DEGRADED · STOPPING · STOPPED`. `DEGRADED` means the
process is serving but the local worker is unreachable — the runtime does not
pretend to be able to execute.

`GET /health` and `jarvis-runtime.sh status` both work without Claude Code, and
report: runtime id · pid · state · start time · uptime · version (git SHA of the
repository it serves) · repository path · address · worker availability, host,
model count and probe latency · active / queued / in-flight / total runs · last
error. No secrets, no prompts, no file contents.

The process record is written to `~/.claude/ain-delegation/runtime/runtime.json`
and cleared on clean shutdown, so `status` distinguishes *running* from *a stale
record whose process is gone*.

## 5. API (§4)

| Endpoint | Purpose |
|---|---|
| `GET /health` | runtime health, version, state, worker availability, run counts |
| `POST /runs` | submit a bounded work packet → `202` + `run_id` |
| `GET /runs/:id` | run state, disposition, context manifest, verification, audit references |
| `GET /runs` | recent runs, newest first, `limit` ≤ 100, `offset` |
| `POST /runs/:id/cancel` | cancel where the stage safely supports it |
| `GET /events` | Server-Sent Events |

Five endpoints plus the event stream. This is an internal local contract, not a
public API design.

## 6. Run state machine (§5)

```
QUEUED → VALIDATING → CONTEXT_ROUTING → READY_FOR_WORKER → RUNNING
       → VALIDATING_RESULT → VERIFYING_EVIDENCE → VERIFIED
                                                | ESCALATION_REQUIRED
any non-terminal → FAILED | CANCELLED
READY_FOR_WORKER → QUEUED     (governed: runtime accepted, worker capacity absent)
```

Transitions are checked against an explicit legality table; an illegal transition
raises and emits `run.illegal_transition` rather than silently correcting itself.
Failures are **not** collapsed: every `FAILED`/`ESCALATION_REQUIRED` run carries a
`failure_class` naming the stage that refused —

`PACKET_SCHEMA_INVALID · LOCAL_WRITE_AUTHORITY_REFUSED · LANE_NOT_PERMITTED ·
WORK_UNIT_ID_IN_USE · WORKTREE_CLAIM_FAILED · PACKET_ANSWER_LEAKAGE ·
SELECTOR_SHA_UNBOUND · SELECTOR_SHA_MISMATCH · SELECTOR_REBIND_AMBIGUOUS ·
SELECTOR_REBIND_NOT_FOUND · SELECTOR_FILE_NOT_FOUND · CONTEXT_SELECTION_FAILED ·
CONTEXT_BUDGET_EXCEEDED · BUILDER_OWNERSHIP_REFUSED · CONTENDED_OR_UNKNOWN_LANE ·
WORKER_EXECUTION_FAILED · WORKER_TERMINATED · RESULT_MISSING ·
RESULT_CONTRACT_INVALID · LOCAL_WORKER_WROTE · WORKER_OUTPUT_EMPTY ·
EVIDENCE_INSUFFICIENT · EVIDENCE_OUT_OF_CONTEXT · WORKER_ESCALATED ·
RUNTIME_STOPPED_MID_RUN · RUNTIME_ERROR`

Full transition history, with timestamps, is persisted per run.

## 7. Independent evidence verification (new mechanism)

Across Runs 001–003R the worker reported `escalation_required: false` every single
time, and a human decided the disposition by reading the transcript. §7 requires
the runtime to drive verification, so it needed a mechanical verifier.

**Method — materialized-fragment containment.** The runtime re-derives the exact
fragments the worker was handed, extracts every `file:line` (and `file:N-M`)
citation from the worker's output, and requires each to fall inside one of those
ranges. A native local worker has no tools and cannot open a file, so a citation
outside the materialized context is fabricated *by construction* — which is
precisely how Run 003's bad citation escaped.

Disposition rules, in order:

1. worker escalated (contract flag or `ESCALATE_TO_CLAUDE:` line) → `ESCALATION_REQUIRED` / `WORKER_ESCALATED`
2. zero citations → `ESCALATION_REQUIRED` / `EVIDENCE_INSUFFICIENT`
3. any citation outside context → `ESCALATION_REQUIRED` / `EVIDENCE_OUT_OF_CONTEXT`
4. otherwise → `VERIFIED`

The worker's self-report is recorded next to the verdict and never used to reach it.

**Known limit, stated plainly:** this proves *citation containment*, not semantic
correctness. Unit 10's Run 003-R imprecision — citing a comment line while
describing the `if` on the next line — is in-context and would pass this check. The
verifier refuses fabrication; it does not certify interpretation.

## 8. Event stream (§6)

SSE at `GET /events`, plus a durable append-only
`~/.claude/ain-delegation/runtime/events.jsonl` and a 500-event in-memory ring.
Emitted: `runtime.ready · runtime.stopping · runtime.reconciled · run.created ·
run.state_changed · run.illegal_transition · context.selected · worker.started ·
worker.completed · verification.started · verification.completed · run.verified ·
run.escalation_required · run.failed`.

Events carry ids, states, counts, token estimates and SHAs — never prompts, never
worker output, never fragment content. Telemetry, not the audit artifact; the
artifact remains the packet/result/log triple written by the existing pipeline.

## 9. Security boundary (§14)

| Control | Implementation |
|---|---|
| Loopback only | `assertLoopback()` allows `127.0.0.1`, `::1`, `localhost` and nothing else; `createRuntime()` throws `NON_LOOPBACK_BIND_REFUSED` before binding. The client refuses a non-loopback base URL too |
| Content type | `POST /runs` requires `application/json`, else `415` |
| Request size | 256 KB cap (`JARVIS_RUNTIME_MAX_BODY`), else `413` and the socket is destroyed |
| Packet schema | validated before anything else; `work_unit_id` must match `^[a-z0-9][a-z0-9-]{2,63}$` because it becomes a filename, a branch name and an argv entry |
| Shell exposure | **none.** No `/exec`, no `/shell`, no `/eval`, no filesystem-path endpoint. The only subprocess is `bash ain-delegate.sh local-native <validated-slug>`, spawned with array argv |
| Secrets | health, status and events expose no credentials; model *names* are not returned by health, only a count |
| Auth | none — out of scope by §14, and unnecessary because the socket is loopback-only |

**Arbitrary shell exposed: NO.**

## 10. Authority (§8)

`LOCAL worker authority remains READ-ONLY`, enforced at three points:

1. **Lane** — only `local-native` is accepted; any other lane → `LANE_NOT_PERMITTED` (403).
2. **Packet** — `allow_write`, `requested_write_authority`, `write_authority`,
   `permission_mode`, `repo_write_scope`, `worker_authority` are refused when they
   request write → `LOCAL_WRITE_AUTHORITY_REFUSED` (403), before any workspace exists.
3. **Post-hoc** — if the result contract reports `files_changed` or an `ending_sha`,
   the run FAILS with `LOCAL_WORKER_WROTE` regardless of what the worker claimed.

The HTTP API is not an authority bypass.

## 11. Concurrency (§9)

No second capacity system. The runtime shells out to
`session.mjs status --json` and dispatches only when `active < limit`; if the
ledger is unreadable it fails **closed** (`available: false`). When capacity is
absent the run returns to `QUEUED` carrying
`blocked: {reason: "WORKER_CAPACITY_UNAVAILABLE", active, limit}` and is retried
on a 10 s poll. `POST /runs` answers `202` — *runtime accepted* — which is a
different fact from *worker capacity available*.

The runtime never recovers, forces or terminates another lane's claim. During
Run 004 the `reflection-provenance-reconciliation` lane held its slot untouched.

## 12. Durability (§10)

No database. One directory beside the substrate Units 7–10 already write to:

```
~/.claude/ain-delegation/runtime/runs/<run_id>.json   one file per run, atomic write
~/.claude/ain-delegation/runtime/events.jsonl         append-only
~/.claude/ain-delegation/runtime/runtime.json         process record (cleared on clean stop)
```

A run record holds run id · work unit · created/updated/finished time · state ·
full transition history · worker (lane, model, transport, start) · context manifest
(provenance only) · result summary · verification verdict · escalation state ·
final disposition · and **references** to the canonical packet/result/log paths.
Authoritative worker evidence is never copied into the runtime store — one artifact,
one location.

On start, any run left in an in-flight state by a hard kill is reconciled to
`FAILED / RUNTIME_STOPPED_MID_RUN`: an in-flight state is not evidence of a live
worker once the owning process is gone.

## 13. First runtime run (§11)

`docs/ops/JARVIS_UNIT_11_RUN_004.md` is the full record. Summary:

`POST /runs` → `r-526195d3c4` → 8 legal transitions → native `maia-coder:latest`
via Ollama (6 s, exit 0, no files changed) → **6/6 citations valid, 0 invalid** →
`VERIFIED` → persisted. Entry point reported as **253**, matching Unit 10's
verified answer at `54809f994`. 6 fragments, 1,496 est tokens against a 32,768
threshold. No operator ran `ain-delegate.sh`.

## 14. Restart proof (§12)

Stopped `rt-631bc86b` (pid 71887) with SIGTERM → record cleared, port refused.
Restarted as `rt-8974f405` (**pid 74591**). `GET /runs/r-526195d3c4` returned
`VERIFIED` with its disposition, all 8 transitions, verification counts and audit
references. The result artifact's mtime predates the new process — the worker was
not re-executed.

## 15. Negative case (§13)

An answer-leaking packet: one `established_facts` entry naming
`lib/ai/modelService.ts:52`, the exact Unit 9 defect Unit 10's guard exists to
refuse. Everything else identical to Run 004.

- `r-648e71b714` → `FAILED / PACKET_ANSWER_LEAKAGE`, worker never invoked, runtime
  stayed `READY`. But the leak was caught *after* a worktree had been claimed.
- Fix applied: leakage is a property of the packet alone and needs no repository,
  so the lint now runs **before** any workspace or Builder slot is claimed.
- `r-d02b62d211` (same packet, re-submitted) → `FAILED / PACKET_ANSWER_LEAKAGE`
  with **no worktree claimed at all**. Transitions
  `QUEUED → VALIDATING → CONTEXT_ROUTING → FAILED`. Runtime `READY`, `last_error: null`.

A governed failure state, not a crash.

## 16. Tests (§17)

`node scripts/builder/__tests__/jarvis-runtime-proof.mjs` → **15 passed · 0 failed**,
covering all fourteen required cases: loopback start · `/health` READY · malformed
packet rejected · valid run accepted · legal transitions with no stage collapsed ·
native pipeline invoked with `local-native` · `VERIFIED` exposed · `ESCALATION_REQUIRED`
exposed (both fabricated-citation and explicit-escalation paths) · run survives
restart without re-execution · non-loopback bind rejected · oversized (413) and
wrong-content-type (415) rejected · local WRITE authority refused (403) and a
worker that writes anyway failed post-hoc · no shell/exec/filesystem endpoint ·
event stream carries transitions and leaks neither prompt nor source · plus a
direct unit check of the verifier.

The suite is hermetic: `AIN_DELEGATION_HOME` is redirected to a temp dir before the
modules load, and a temp git repo provides real anchors. Every stage runs for real
except the delegate subprocess, which is canned via `createRuntime({spawnDelegate})`
— the sole injection point, unused in every real invocation — so the suite does not
invoke a 6-second local model fifteen times. The real invocation is proved by Run 004.

Kept green: Unit 8 context proof **16/16**, Unit 10 packet-guard proof **16/16**,
`session-proof` 54/54, `rate-proof` 24/24, `loop-governance-proof` 28/28,
`incident-scenario-proof` 18/18.

**Pre-existing failures, not caused by this unit:** `orient-proof` 32/1 and
`continue-proof` 25/2 fail identically in a clean control worktree at base commit
`395ffad43` (`~/.claude/worktrees/ain-jarvis-unit-10-sha-bound-context`, 0 dirty
files). They are live-measurement assertions about the ambient repository, and
neither proof references any Unit 11 file.

## 17. Operator use (§16)

```bash
scripts/jarvis-runtime.sh start [--port 8787] [--host 127.0.0.1]
scripts/jarvis-runtime.sh status
scripts/jarvis-runtime.sh stop
```

Ordinary terminal, no Claude Code. `start` refuses to double-start, tails its own
output if the process dies during startup, and a non-loopback `--host` fails closed
before the socket opens. `stop` sends SIGTERM and lets the runtime run its own
`STOPPING → STOPPED` path; it never escalates to SIGKILL on its own. Run history is
never touched by either command.

## 18. Limitations — what this does NOT prove

- **Verification is containment, not comprehension.** See §7. A plausible in-context
  misreading passes.
- **One worker at a time.** The runtime dispatches FIFO. Real parallelism is bounded
  by Builder capacity anyway, but the runtime does not attempt it.
- **Cancellation is coarse.** SIGTERM to the delegate subprocess. A worker already
  inside an Ollama request may finish that request; the run is still marked `CANCELLED`.
- **No authentication.** Deliberate (§14). Anything that can reach loopback can submit
  a read-only packet. This is not safe to expose beyond loopback, and the code refuses
  to try.
- **`model: "UNKNOWN"` in the result contract for `local-native` runs.** A Unit 9-owned
  gap in `ain-delegate.sh`, recorded in Run 004 and deliberately not fixed here.
- **Ollama token counts are not captured** on this path — `ain-delegate.sh` invokes the
  native worker without `--json`.
- **One real run.** Classification A rests on Run 004 plus the proof suite, not on
  sustained operation.
- **Two worktrees left in place** by the negative cases
  (`ain-jarvis-u11-negative-leak-005`, `ain-jarvis-u11-provider-trace-004`), per the
  existing `ain-worktree-claim.sh release` convention, which never deletes a worktree.

## 19. What JARVIS can actually do now

Start from a terminal, stay running, accept a bounded read-only work packet over
loopback HTTP, route precision context bound to a canonical SHA, refuse leaking or
write-requesting packets before touching a workspace, wait for governed Builder
capacity rather than stealing it, invoke the native local model, independently
verify the evidence it returns, expose every stage as it happens, persist the whole
thing, and answer for that run after being killed and restarted.

**Demonstrated capability only.** One task, one model, one run, read-only.

## 20. Next unit

**JARVIS DESKTOP ALPHA** — the first native desktop access point against this
runtime (`command → activity → evidence → approval/escalation → result`), consuming
`jarvis-runtime-client.mjs`. Do not integrate MAIA in that unit. Not started here.
