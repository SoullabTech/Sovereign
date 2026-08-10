# JARVIS UNIT 11 — PERSISTENT LOCAL RUNTIME SERVICE

> **THIS FILE IS THE AUTHORITY FOR JARVIS UNIT 11.**
>
> It is deliberately self-contained. A Builder with **zero conversation history**
> must be able to execute Unit 11 from this file alone. Nothing here depends on
> any chat transcript, prior session, or remembered instruction.
>
> **Entry instruction for a fresh session:**
> *"Read `docs/ops/JARVIS_UNIT_11_RUNTIME_SERVICE.md` and execute Unit 11
> completely. Do not rely on prior conversation context."*
>
> Authored 2026-08-10 as a durable handoff. **Unit 11 implementation has NOT
> begun. No runtime code exists.** Base commit `395ffad43`.

---

# PART I — PROVENANCE (what is already proven)

Units 7–10 are committed, each on its own branch, each with durable records.
None is merged to the main checkout; the main checkout remains `54809f994`.
Read the records before implementing — they are the authoritative account.

| Unit | Commit | Branch | Durable records |
|---|---|---|---|
| 7 | `e862a2073` | `chore/jarvis-unit-7-functional-mvp` | `JARVIS_UNIT_7_FUNCTIONAL_MVP.md`, `JARVIS_UNIT_7_RUN_001.md` |
| 8 | `df58fef2f` | `chore/jarvis-unit-8-precision-context` | `JARVIS_UNIT_8_PRECISION_CONTEXT.md`, `JARVIS_UNIT_8_RUN_002.md` |
| 9 | `2f93c5353` | `chore/jarvis-unit-9-native-transport` | `JARVIS_UNIT_9_NATIVE_TRANSPORT.md`, `JARVIS_UNIT_9_RUN_003.md` |
| 10 | `395ffad43` | `chore/jarvis-unit-10-sha-bound-context` | `JARVIS_UNIT_10_SHA_BOUND_CONTEXT.md`, `JARVIS_UNIT_10_RUN_003R.md` |

Ancestry is linear: `e862a2073` → `df58fef2f` → `2f93c5353` → `395ffad43`.
All eight records are present in the Unit 10 worktree and in this one.

## Unit 7 — functional JARVIS proof

Established that a governed pipeline runs end to end:
`PACKET → BOUNDED CONTEXT → LANE ELIGIBILITY → maia-coder → RESULT → CONTRACT
VALIDATION → EVIDENCE VERIFICATION → ESCALATION → AUDIT PERSISTENCE`.

Run 001 invoked maia-coder genuinely (116 s, exit 1) and failed with
`Prompt is too long`. JARVIS detected the failure and escalated rather than
accepting the worker's self-report. Classification **A** — the pipeline is the
deliverable, not the worker's success.

Also found: the concurrency budget in `scripts/builder/session.mjs` charges
local (Ollama) lanes against Claude reasoning capacity they do not consume.
Unresolved; not in Unit 11 scope.

## Unit 8 — precision-context proof

Added `scripts/builder/jarvis-context.mjs`: deterministic selectors
(whole-file, line-range, brace-balanced symbol, and later `anchor`),
materialization with provenance (`source_file · source_sha · selector ·
start_line · end_line · extraction_method · content_hash · reason`), and a
pre-invocation context budget gate that fails closed as
`CONTEXT_BUDGET_EXCEEDED`, distinct from `WORKER_EXECUTION_FAILED`.
No embeddings, no vector search, no LLM-based selection.

Run 002 measured **2,330 est tokens against a 32,768 threshold** yet still
failed. A control five-word prompt failed identically, proving the overflow was
not packet-attributable. Classification **B**. Failure layer: **RUNTIME**.

## Unit 9 — native Ollama transport proof

Root cause of Unit 8's failure: `~/bin/maia-code` execs the **Claude Code CLI**,
which auto-loads its system prompt, tool schemas, MCP definitions and `CLAUDE.md`
(~11,840 tokens in this repo) before any packet content.

Added `scripts/builder/jarvis-local-worker.mjs` — direct
`POST http://localhost:11434/api/generate`, and a `local-native` lane in
`scripts/ain-delegate.sh`. The legacy `local` lane is untouched.

Removing the CLI also removes the worker's tools (no Read, no Bash). **This is
viable only because Unit 8 materializes source fragments** — a toolless worker
must be handed its evidence. Precision routing is the precondition for the
transport, not a detour from it.

Proof: the five-word control that failed via CLI returned `OK` at
`prompt_eval_count: 254`. Run 003 exited 0 in 6 s with a substantive trace.
Independent verification passed 5 of 6 citations and **caught one fabrication**.
Classification: transport achieved; run **EVIDENCE INSUFFICIENT**.

## Unit 10 — SHA-bound, non-leaking, VERIFIED worker

Two packet-authoring defects caused Unit 9's bad citation:

1. **Answer leakage** — `verification_commands` containing `sed -n '257p' …` were
   serialized into the worker prompt; the worker echoed `257` without
   establishing it.
2. **SHA drift** — selectors authored against the dirty main checkout (`POST` at
   257) were materialized against clean `54809f994` (`POST` at **253**).

Added `scripts/builder/jarvis-packet-guard.mjs`:
- `WORKER_VISIBLE_FIELDS` allowlist with **default-deny** for unknown fields
- `VERIFIER_ONLY_FIELDS` (`verification_commands`, `expected_citations`,
  `expected_answer`, `expected_provider`, `gold_label`, `expected_symbols`,
  `verifier_notes`) that can never reach the worker
- narrow structural leakage lint → `PACKET_ANSWER_LEAKAGE` (exit 7)
- SHA-bound line selectors → `SELECTOR_SHA_UNBOUND` / `SELECTOR_SHA_MISMATCH`
- deterministic `anchor` rebinding at execution HEAD →
  `SELECTOR_REBIND_AMBIGUOUS` / `SELECTOR_REBIND_NOT_FOUND`

All gates fail closed **before** worker invocation. `verification_commands` were
removed from `_build_prompt`.

Run 003-R: same task, same native transport, one canonical tree throughout.
Worker returned the entry point as **253** — correct at execution HEAD, and the
exact value Unit 9 got wrong. **7/7 citations valid, 7/7 in-context, 6/7 claims
exactly supported** (one imprecision: cited the comment at `:153` while
describing the `if` at `:154`, having also cited `154-193` correctly).
Disposition **VERIFIED**. Classification **A**.

## Standing observation across all four runs

In every run the worker self-reported `escalation_required: false`. Independent
verification decided the disposition every time — twice refusing, twice
accepting. **Never trust the worker's self-assessment.**

## Proven components Unit 11 must reuse, not rebuild

| Path | Role |
|---|---|
| `scripts/ain-delegate.sh` | lane dispatch (`local-native`), prompt build, result capture, verification, result contract |
| `scripts/builder/jarvis-context.mjs` | selectors, materialization, provenance, budget gate |
| `scripts/builder/jarvis-packet-guard.mjs` | worker/verifier partition, leakage lint, SHA binding, anchor rebinding |
| `scripts/builder/jarvis-local-worker.mjs` | native Ollama transport (`run`, `health`) |
| `scripts/builder/session.mjs` | Builder capacity, claims, worktree ownership, collisions |
| `scripts/ain-worktree-claim.sh` | isolated governed worktrees |
| `docs/ops/AIN_WORK_PACKET_CONTRACT.md` | packet schema |
| `docs/ops/AIN_RESULT_CONTRACT.md` | result schema |
| `docs/ops/AIN_DELEGATION_CONTROL_PLANE_2026-08-09.md` | control-plane architecture |
| `scripts/builder/__tests__/jarvis-context-proof.mjs` | 16 assertions (must stay green) |
| `scripts/builder/__tests__/jarvis-packet-guard-proof.mjs` | 16 assertions (must stay green) |

## Environment facts (verify at execution time; do not assume)

- Local model: `maia-coder:latest`, Ollama, ~18 GB, `PARAMETER num_ctx 65536`
- Ollama endpoint: `http://localhost:11434`
- Repo: `/Users/soullab/MAIA-SOVEREIGN`; main checkout `54809f994`, branch
  `feature/labtools-redesign`, carrying ~52 modified and ~1,200 untracked files
  that are **unrelated to JARVIS and must be preserved untouched**
- Builder concurrency at authoring time: `limit=2` from
  `~/.claude/ain-delegation/concurrency.json` (founder-authorized temporary raise
  from 1). A separate lane `reflection-provenance-reconciliation`
  (`s-d5e6a4b1`) was active and is **not** Unit 11's to touch.
- Git hooks enforce: branch prefixes `main | clean-main-no-secrets | feature/* |
  fix/* | chore/*`, and **commit messages must not contain Claude attribution**.

---

# PART II — THE UNIT 11 MANDATE

## §0 — Governance and authoritative state

Establish state from repository evidence, not from memory. Verify: repository
root · branch · current HEAD · the Unit 7/8/9/10 commits listed above ·
ancestry · `git status` · active Builder claims · Builder capacity · Unit 10
claim disposition.

Read the durable records for Units 7–10 before implementing.

Acquire a canonical isolated Builder WRITE claim for
**`jarvis-unit-11-runtime-service`**. Preserve unrelated dirty/untracked state.
Do not deploy.

If another legitimate WRITE claim occupies capacity: **STOP**. Do not recover,
force, override, or terminate it. A dead registered PID does not prove a lane is
abandoned — check for live processes with a CWD inside its worktree
(`/usr/sbin/lsof -a -d cwd -c node -Fn | grep <worktree-basename>`) before
characterizing any claim as stale.

## §1 — Do not rebuild the pipeline

The runtime must wrap and reuse the existing proven mechanisms for packet
validation, context selection/materialization, packet guard, SHA binding,
answer-leakage protection, lane eligibility, native local worker transport,
result validation, evidence verification, escalation, audit persistence, and
Builder/worktree governance.

**Do NOT create a second JARVIS implementation inside a server.** The runtime is
an operating doorway to the existing control plane. First identify the smallest
seam required to invoke the proven pipeline programmatically.

## §2 — Runtime model

A persistent local runtime process with an explicit lifecycle:
`STARTING · READY · DEGRADED · STOPPING · STOPPED`.

It must expose its state without requiring Claude Code. Record at minimum:
runtime id · process id · start time · version/git SHA · repository · health ·
worker availability · active runs · queued runs · last error.

The runtime must not depend on conversational state. **Restarting the process
must not destroy durable run history.**

## §3 — Local-only boundary

Bind to loopback (`127.0.0.1` and/or `::1`) only. Fail closed if configuration
attempts an external interface unless a future explicit governance unit
authorizes it. No production deployment, no cloud hosting, no external webhook.

## §4 — Minimal runtime API

The smallest API sufficient for future Desktop and MAIA clients:

| Endpoint | Purpose |
|---|---|
| `GET /health` | runtime health, version, state |
| `POST /runs` | submit a bounded JARVIS work packet |
| `GET /runs/:id` | run state and final disposition |
| `GET /runs` | recent runs, bounded/paginated |
| `POST /runs/:id/cancel` | request cancellation where the stage safely supports it |

Do not add dozens of endpoints. Do not design the final public API. This is an
internal local runtime contract.

## §5 — Run state machine

Represent execution explicitly, at minimum:
`QUEUED · VALIDATING · CONTEXT_ROUTING · READY_FOR_WORKER · RUNNING ·
VALIDATING_RESULT · VERIFYING_EVIDENCE · VERIFIED · ESCALATION_REQUIRED ·
FAILED · CANCELLED`.

**Do not collapse all failures into FAILED.** The state machine should expose
where JARVIS currently is. Persist important transitions.

## §6 — Event stream

One bounded local event mechanism so a future Desktop can watch JARVIS work.
Prefer Server-Sent Events (`GET /events`), or an existing project-standard local
event mechanism if clearly better.

Events should include: `runtime.ready · run.created · run.state_changed ·
context.selected · worker.started · worker.completed · verification.started ·
verification.completed · run.verified · run.escalation_required · run.failed`.

Do not expose secrets or entire prompts automatically. The event stream is
operational telemetry, **not** the audit artifact.

## §7 — Operator submission

A successful `POST /runs` must NOT merely enqueue a fake object. It must drive
`packet → guard → context → lane → native worker → result → verification →
persistence` using the existing implementation.

## §8 — Authority

The runtime may not silently expand worker authority. **LOCAL worker authority
remains READ-ONLY.** Any packet requesting local WRITE authority must fail closed
or escalate under existing governance. Do not make the HTTP API an authority
bypass. All existing Builder/JARVIS governance remains authoritative.

## §9 — Concurrency

Do not invent a second capacity system. Reuse Builder OS/JARVIS capacity and
worktree governance. The runtime must distinguish **RUNTIME ACCEPTED** from
**WORKER CAPACITY AVAILABLE**. If no eligible governed capacity exists, queue or
return a governed blocked state per existing contracts. **Do not steal another
lane. Do not recover another claim.**

## §10 — Durability

A restart must preserve enough state to reconstruct previous runs. Use existing
JARVIS audit/result persistence where possible. Do not introduce a large database
merely for Unit 11 unless a canonical substrate is already clearly appropriate.

Persist at minimum: run id · packet id · created time · state · worker · context
manifest reference · result reference · verification state · escalation state ·
final disposition. Transient process state may stay in memory; **authoritative
run evidence must not.**

## §11 — First runtime run

Use the same provider-trace task, submitted **through the runtime API**:

> *"Trace the live MAIA text-model provider path from the sovereign MAIA route to
> its provider-selection layer and return exact file:line evidence. READ-ONLY.
> Do not modify anything."*

Do not run `scripts/ain-delegate.sh` manually as the operator — the runtime must
invoke the pipeline.

Required proof: `POST /runs` → run id returned → state transitions observable →
native maia-coder executed → result returned → evidence independently verified →
final state `VERIFIED` → audit persisted.

Use the Unit 10 SHA-bound, non-leaking context strategy (anchor selectors, no
expected line numbers in worker-visible fields, one canonical tree throughout).
Do not deliberately reintroduce old defects.

## §12 — Restart proof

After one successful run: stop the runtime cleanly, restart it, then
`GET /runs/:id`. The completed run must still be discoverable with its final
disposition and audit reference, **without re-executing the worker**. This proves
durable operating continuity independent of one process or session.

## §13 — Failure proof

Run one bounded negative case — malformed packet, local WRITE authority
requested, answer-leaking packet, or bad SHA selector. Use the narrowest
deterministic case. Prove the runtime returns a **governed failure state rather
than crashing**.

## §14 — Security / local trust

Minimum boundary: loopback binding · content-type validation · request-size limit
· packet schema validation · **no arbitrary shell command endpoint** · **no
generic "execute" endpoint** · **no arbitrary filesystem path endpoint** · no
secrets returned from health, status, or events.

Do not build account authentication in Unit 11. **Do not create a local RCE API.**

## §15 — Client contract

A small typed client or schema sufficient for the next unit, conceptually:
`jarvis.health()` · `jarvis.createRun(packet)` · `jarvis.getRun(id)` ·
`jarvis.listRuns()` · `jarvis.cancelRun(id)` · `jarvis.subscribe(callback)`.

Do not build the Desktop. The point is to make the runtime consumable without
duplicating HTTP details across future clients.

## §16 — Operator commands

Simple local commands, conceptually `jarvis-runtime start | status | stop`,
following existing script conventions. **Success means starting JARVIS from an
ordinary terminal without opening Claude Code.**

## §17 — Tests

Focused tests covering at least:

1. runtime starts on loopback
2. `/health` reports READY
3. malformed packet rejected
4. valid run accepted
5. run state transitions legal
6. native local pipeline invoked
7. `VERIFIED` result exposed correctly
8. `ESCALATION_REQUIRED` exposed correctly
9. run persists across runtime restart
10. non-loopback bind rejected
11. oversized request rejected
12. local WRITE packet rejected/escalated
13. arbitrary shell execution unavailable
14. event stream receives run transitions

Use existing conventions. Keep the Unit 8 and Unit 10 proofs green. Do not run
unrelated enormous suites unless required.

## §18 — Non-goals

DO NOT: build JARVIS Desktop · integrate MAIA · expose the runtime to LAN or
internet · deploy a production runtime · build autonomous planning · build
recursive agents · grant the local worker WRITE authority · build user
authentication · build cloud sync · build notifications · build voice · build
final UX · rewrite Units 7–10 internals without a proven defect · **begin Unit 12**.

## §19 — Durable record

Create `docs/ops/JARVIS_UNIT_11_RUNTIME_SERVICE_RECORD.md` (or extend this file's
execution log) plus a first runtime run record at the canonical audit location.

Record: runtime architecture · API · security boundary · state machine · event
mechanism · first real run · restart proof · negative test · limitations.

A future Builder with no conversation context must be able to reconstruct the
runtime from that record.

## §20 — Commit

Inspect the final diff. Use path-scoped staging. Commit Unit 11-owned files only.
Preserve unrelated state. Verify the commit. Release the Builder claim
canonically.

## §21 — Classification

Choose exactly one:

**A — JARVIS RUNTIME VERIFIED.** A persistent local runtime accepted a real work
packet through its API, executed the proven JARVIS pipeline, reached `VERIFIED`,
emitted observable state transitions, persisted the result, survived restart, and
remained loopback-only.

**B — RUNTIME FUNCTIONAL / END-TO-END RUN BLOCKED.** Runtime, API, state and
durability work, but one identified pipeline seam prevented the real
API-submitted run from completing.

**C — PARTIAL.** Runtime infrastructure incomplete.

**D — STOPPED.** Governance or repository contradiction prevented safe
implementation.

## §22 — Final report

```
# JARVIS UNIT 11 — PERSISTENT RUNTIME
## Starting state
## Proven pipeline reused
## Missing runtime seam
## Implementation                file → purpose
## Runtime                       address / pid / version / state
## API                           endpoint → purpose
## State machine
## Event stream
## Security boundary             loopback only / request limits / arbitrary shell exposed YES|NO
## First API-submitted run       run id / packet / worker / backend / transitions / disposition
## Verification                  contract / evidence / verified
## Restart proof                 stopped / restarted / prior run recovered
## Negative case                 input / result
## Tests                         command → result
## Git proof                     starting HEAD / ending HEAD / commit / unrelated state preserved / claim released
## Classification                A / B / C / D
## What JARVIS can actually do now      demonstrated capability only
## Next unit
```

Then **STOP**. Do not begin Unit 12.

**If A:** the next unit is **JARVIS DESKTOP ALPHA** — the first native desktop
access point against this runtime (`command → activity → evidence →
approval/escalation → result`). Do not integrate MAIA in that same unit. Do not
implement it here.

---

# PART III — EXECUTION STATE LOG (append-only)

| Date | HEAD | Session | Event |
|---|---|---|---|
| 2026-08-10 | `395ffad43` | `s-206bd45d` | Mandate authored as a durable handoff. **Unit 11 implementation NOT started; no runtime code, no API, no tests, no service scripts created.** Next session executes from this file. |
| 2026-08-10 | `395ffad43` | `s-8ac1ef90` | Fresh session re-established state from repository evidence. `s-206bd45d`'s process was gone (only two wedged pre-commit hook children survived in its worktree); its own claim was closed as `handed-off` — the handoff it had itself recorded above — and this lane re-claimed the same branch and worktree. No other lane touched; `reflection-provenance-reconciliation` (`s-d5e6a4b1`) held its slot throughout. |
| 2026-08-10 | `395ffad43` | `s-8ac1ef90` → `s-728dac70` | **Unit 11 EXECUTED. Classification A — JARVIS RUNTIME VERIFIED.** Runtime, API, SSE, state machine, durable store, typed client, operator commands and a 15-assertion proof suite implemented. Run 004 (`r-526195d3c4`) submitted through `POST /runs` reached `VERIFIED` on 6/6 independently checked citations; restart proof and answer-leakage negative case both passed. The lane paused its own claim for the run's governed slot (Unit 10 precedent) and re-opened as `s-728dac70`. Records: `JARVIS_UNIT_11_RUNTIME_SERVICE_RECORD.md`, `JARVIS_UNIT_11_RUN_004.md`. |
