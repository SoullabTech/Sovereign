# JARVIS Unit 12 — Desktop Alpha

**Status:** Desktop Alpha verified against the live local runtime
**Work unit:** `jarvis-unit-12-desktop-alpha`
**Branch:** `chore/jarvis-unit-12-desktop-alpha`
**Base:** `b59c61355` (Unit 11 — persistent local JARVIS runtime)
**Date:** 2026-08-10

This record stands without conversation context.

---

## 1. What this unit delivers

A native macOS desktop application that is a **doorway onto the Unit 11 JARVIS
runtime**. It lets an operator command → watch activity → inspect worker,
context and evidence → see the governed disposition, without opening Claude Code
and without calling the runtime API by hand.

The Desktop is a **client**. It implements none of: packet validation, context
routing, worker dispatch, evidence verification, Builder claims, result
contracts, or run persistence. Those remain runtime responsibilities. The
Desktop submits, observes, displays, requests cancellation, and surfaces
governed state.

---

## 2. Desktop technology and why

**Electron 28.3.3**, run through the Electron shell this repository already
carries at `desktop-app/` (which already declared `electron` + `electron-builder`
in `desktop-app/package.json`).

This was chosen by extension, not by introduction:

- No new desktop framework was added. No Tauri, no Capacitor desktop target, no
  second build toolchain. The same `electron` / `electron-builder` versions the
  repo already pinned are reused.
- The JARVIS window is a **separate entry point** (`desktop-app/jarvis/main.js`)
  from the MAIA desktop entry (`desktop-app/src/main.js`). They share the
  toolchain and nothing else — no MAIA window, no Next.js server, no MAIA
  conversation surface, no shared memory (§17 of the mandate).
- The renderer is a static local page loaded over `file://`. It does not require
  `npm run dev`, a localhost web server, or a browser tab. The runtime can
  restart underneath it and it keeps working.

**Launch:** `npm run jarvis:desktop` (root) → `npm --prefix desktop-app run jarvis`
→ `electron jarvis/main.js`.

### Files owned by this unit

| Path | Role |
|---|---|
| `desktop-app/jarvis/main.js` | Electron main process; owns the runtime client, IPC, menu, window |
| `desktop-app/jarvis/preload.js` | The renderer's entire authority surface (contextBridge) |
| `desktop-app/jarvis/lib/runtime-client.js` | Loopback-only HTTP + SSE client |
| `desktop-app/jarvis/lib/presentation.js` | Pure presentation contract (states, dispositions, evidence, disclosure) |
| `desktop-app/jarvis/lib/packets.js` | Bounded READ-ONLY command composer |
| `desktop-app/jarvis/lib/annotations.js` | Non-authoritative objective labels (see §9) |
| `desktop-app/jarvis/renderer/{index.html,app.js,styles.css}` | The four surfaces |
| `scripts/builder/__tests__/jarvis-desktop-proof.mjs` | 20-case proof suite |
| `package.json`, `desktop-app/package.json` | `jarvis:desktop`, `jarvis:desktop:proof`, `jarvis` scripts |

---

## 3. Runtime / client contract

The Desktop speaks only to the Unit 11 runtime, over loopback:

| Call | Use |
|---|---|
| `GET /health` | System state; also the source of `canonical_sha` for submissions |
| `POST /runs` | Submit a packet. `202` = runtime accepted (never "completed") |
| `GET /runs?limit&offset` | Run list |
| `GET /runs/:id` | Run detail — context, worker, result, verification, audit, history |
| `POST /runs/:id/cancel` | Cancellation request; the runtime decides |
| `GET /events` (SSE) | Notification only |

**SSE is notification, not truth.** Every event triggers a REST re-read; the
durable runtime store remains authoritative. On reconnect the Desktop re-fetches
rather than trusting the stream. Duplicate events are suppressed on
`(type, run_id, at, state)`.

**The Desktop never builds run state.** It renders what `GET /runs/:id` returns.

---

## 4. Information architecture

Four surfaces, no dashboard sprawl, no settings, no IDE:

1. **Command** — "What do you want JARVIS to do?" A bounded template plus an
   editable objective, a permanent `READ-ONLY` authority badge, and submit.
2. **Runs** — active and recent runs: run id, objective, state/disposition,
   lane, created time.
3. **Run detail / Evidence** — disposition, authority, context fragments, worker,
   execution, worker self-report, verification + per-citation evidence table,
   state history, audit paths, and cancel where the runtime can still act.
4. **System state** — a strip across the top: runtime state, address, worker
   availability, model, active/queued/total, event-stream condition, recent error.

### Why the command surface is template-bounded

The runtime only produces verifiable evidence for claims it can bind to
SHA-anchored source fragments. A bare objective with no `context_selectors`
materializes no fragments, and every such run terminates
`ESCALATION_REQUIRED / EVIDENCE_INSUFFICIENT`. The bounded composer is therefore
not a UI convenience — it is what makes a Desktop-submitted run capable of being
verified at all. It also means the Desktop cannot aim a run at arbitrary files.

Two templates ship: **Provider path trace** and **Evidence boundary trace**.
Both are READ-ONLY repository reconnaissance. Both are lint-clean against the
Unit 11 packet guard (no `file:line` answer leakage in worker-visible text).

---

## 5. Security boundary

| Property | Status |
|---|---|
| Runtime target | `127.0.0.1:8787` only |
| Non-loopback runtime address | **Refused, fails closed** (`NON_LOOPBACK_RUNTIME_REFUSED`) — including via env override |
| Configurable public runtime URL | No |
| Arbitrary shell / exec | No — no `child_process`, `exec`, `spawn` anywhere in the Desktop |
| Arbitrary filesystem access | No — the Desktop never reads the runtime store or repo files |
| Direct Builder-state mutation | No |
| WRITE authority | No — refused at the composer *and* by the runtime |
| Embedded credentials | None |
| Direct Anthropic / OpenAI dependency | None |
| Desktop-started processes | None (see §6) |
| Renderer network reach | None — CSP `default-src 'none'; connect-src 'none'` |
| Renderer node integration | Disabled; `contextIsolation: true`, `sandbox: true` |

The renderer's entire authority is the preload bridge: bootstrap, health, runs,
run, cancel, submit (template id + objective text only), copy, and three event
listeners. There is deliberately **no generic `invoke`**, no path argument, no
URL argument, and no command argument. Packets are built in the main process, so
a compromised renderer cannot widen authority or retarget a run.

Secrets are redacted from any error text before it reaches the UI.

---

## 6. Runtime offline experience

The Desktop has **no process-start authority**. When nothing is listening it
shows:

```
JARVIS Runtime Offline
Nothing is listening on http://127.0.0.1:8787.
The Desktop has no authority to start processes.

Start it from a terminal in the JARVIS runtime checkout:
  scripts/jarvis-runtime.sh start        [copy command]
```

Submit is disabled while `/health` cannot be read.

### Offline vs. not responding — a load-bearing distinction

The Unit 11 runtime performs **synchronous** git and Builder-session work while
preparing a run, which blocks its event loop: the socket stays bound and
connectable, but no response comes back for as long as that setup takes.

Reporting that as OFFLINE would tell the operator the runtime is down while it is
in fact mid-run. The Desktop therefore distinguishes:

- **`RUNTIME_OFFLINE`** — connection refused; nothing is listening.
- **`RUNTIME_UNRESPONSIVE`** — connected, but no answer in time. Rendered as
  **JARVIS Runtime Not Responding**, with the explicit statement *"It is running…
  No JARVIS failure has been reported."* Already-listed runs stay listed, because
  they are durable runtime facts and blanking them would imply they were gone.

Client timeout is 45s, chosen so ordinary run-setup blocking is not mistaken for
a fault.

---

## 7. Evidence presentation — the epistemic contract

This is the load-bearing surface of the unit.

**What the Unit 11 runtime actually establishes:** every `file:line` the worker
cited lies inside a fragment the worker was actually shown, SHA-bound
(`method: materialized-fragment-containment`), decided independently of the
worker's self-report.

**What it does not establish:** that the cited fragment supports the claim.

The Desktop never renders VERIFIED in a way that implies the stronger claim:

- The verification block opens with **"What JARVIS actually proved:"** followed by
  the disclosure: *"JARVIS verified that this citation lies within the exact
  source material supplied to the worker. Full semantic claim-support checking is
  not yet automated."*
- Citation status and semantic status are **separate labelled facts**:
  `CITATION VERIFIED / CONTAINED` vs
  `CLAIM SEMANTICALLY VERIFIED — NOT ESTABLISHED`.
- The semantic flag renders on **every** run — verified, escalated or absent — so
  the limitation is never something an operator has to go looking for.
- The VERIFIED disposition's own meaning line reads: *"Citations contained in the
  supplied source material. Not a semantic proof — see Evidence."*
- Every evidence row carries the disclosure as a tooltip.

Per-citation the table shows: claim, source file, line/range, source SHA,
containment status (with a glyph, not colour alone), and a copy button.

---

## 8. Disposition, failure classes, escalation

Terminal disposition is the most prominent element of run detail. `VERIFIED`,
`ESCALATION REQUIRED`, `FAILED` and `CANCELLED` each have a distinct tone **and**
a distinct glyph (`✓ ▲ ✕ ⊘`) and distinct wording — status is never colour-only.
ESCALATION REQUIRED never borrows the success tone.

Runtime `failure_class` strings are **always preserved verbatim** as the headline
and explained beneath; 17 classes have distinct explanatory copy, and an
unrecognised class is shown verbatim rather than collapsed into "something went
wrong". `failure_detail`, the runtime's recommended next action, and any
unresolved questions are surfaced when present.

**The Desktop does not auto-escalate to Claude.** That belongs to a later
authority workflow.

---

## 9. Known limitation: objective is not published by the runtime

`publicRun` in `scripts/builder/jarvis-runtime.mjs` returns `run_id`,
`work_unit_id`, `state`, `disposition`, `context`, `worker`, `result`,
`verification`, `audit` and `history` — but **not** the packet `objective`, which
stays behind `audit.packet_path`.

§8 of the mandate requires OBJECTIVE on the run-detail surface. The Desktop will
not read the runtime's store files to get it (security boundary) and did not
modify the Unit 11 runtime to publish it (scope). So it records the objective for
runs **it submitted**, in `desktop-objectives.json` under Electron `userData`, and
labels the provenance wherever it is shown:

- `RUNTIME` — published by the runtime (wins whenever present)
- `DESKTOP_ANNOTATION` — a label this Desktop recorded at submit time
- `UNAVAILABLE` — not submitted from this Desktop; the packet path is shown instead

This store is **not** the run store, **not** authoritative, and **not** required
for continuity. Deleting it loses objective labels and nothing else; every run
remains visible with its full state, evidence and disposition.

**Recommended narrow fix for a future runtime unit:** add `objective` (and
`title`) to `publicRun`, and delete the annotation store.

---

## 10. Proof — first real Desktop run

Submitted **through the Desktop UI**, against the live local runtime and the real
native worker. No mocked backend, no fixture, no hard-coded result.

| Fact | Value |
|---|---|
| Run id | `r-0a82252af2` |
| Work unit | `desk-provider-trace-1786348891806` (Desktop-generated id) |
| Task | Provider path trace (bounded template) |
| Objective | Trace the live MAIA text-model provider path from the sovereign MAIA route to its provider-selection layer and return exact file:line evidence. READ-ONLY. |
| Authority | READ-ONLY (`execution_lane: local-native`) |
| Worker | `maia-coder:latest` |
| Backend | `ollama-native` |
| Lane | `local-native` |
| Canonical SHA | `395ffad43` (taken from `/health`, not the filesystem) |
| Created / finished | 2026-08-10T08:01:31Z → 08:04:36Z |
| Worker duration | 34s |
| Context | 5 fragments, 838 est. tokens / 32768 threshold |
| Files changed | 0 (read-only lane, enforced post-hoc by the runtime) |
| Verification | `materialized-fragment-containment`, 5/5 contained, 0 outside, `ok: true` |
| Decided by | runtime (independent) — worker self-report is never authoritative |
| **Disposition** | **VERIFIED** |

States observed (runtime history is authoritative):

```
QUEUED → VALIDATING → CONTEXT_ROUTING → READY_FOR_WORKER
      → RUNNING → VALIDATING_RESULT → VERIFYING_EVIDENCE → VERIFIED
```

Materialized context, SHA-bound at `395ffad43`:

```
app/api/sovereign/app/maia/list/route.ts:253-259
app/api/sovereign/app/maia/list/route.ts:86-86
lib/sovereign/maiaService.ts:6-6
lib/ai/modelService.ts:76-96
lib/ai/modelService.ts:52-54
```

All five citations returned by the worker landed inside those fragments.

**Proof the Desktop did not substitute a different worker:** the run record
carries `worker.transport: ollama-native`, `worker.model: maia-coder:latest`,
`worker.lane: local-native`; the runtime refuses any lane other than
`local-native`; and the durable audit trio
(`packets/`, `results/`, `logs/desk-provider-trace-1786348891806.log`) exists on
disk. No Claude/Anthropic path is reachable from the Desktop at all.

### Second real Desktop run — submitted after the offline → reconnect cycle

To prove the whole doorway in one unbroken sequence (runtime stopped → Desktop
shows offline → runtime started by operator → Desktop reconnects → operator
commands), a second run was submitted through the UI:

| Fact | Value |
|---|---|
| Run id | `r-c1b395dc31` |
| Work unit | `desk-provider-trace-1786350264796` |
| Canonical SHA | `b59c61355` (the Unit 11 commit — runtime restarted from that checkout) |
| Worker / backend / lane | `maia-coder:latest` / `ollama-native` / `local-native` |
| Created / finished | 2026-08-10T08:24:24Z → 08:27:20Z |
| Worker duration | 5s |
| Context | 5 fragments, 838 est. tokens / 32768 |
| Verification | 6/6 citations contained, 0 outside, `ok: true` |
| **Disposition** | **VERIFIED** |
| Re-queue cycles before dispatch | 529 (see §13) |

Same eight canonical states, ending `VERIFYING_EVIDENCE → VERIFIED`. All five
context fragments and all six citations were SHA-bound to `b59c61355`.

---

## 11. Proof — offline → canonical start → reconnect

**Offline (runtime stopped via `scripts/jarvis-runtime.sh stop`, pid 76772):**

```
✕ JARVIS RUNTIME OFFLINE   ⌂ http://127.0.0.1:8787
✕ LOCAL WORKER UNAVAILABLE   ◎ MODEL reported per run
⟳ ACTIVE 0 · QUEUED 0 · TOTAL 0   ⌁ EVENTS RECONNECTING
```

- Submit: **disabled**
- Run list: empty
- Run detail: "JARVIS Runtime Offline — Nothing is listening… The Desktop has no
  authority to start processes." + `scripts/jarvis-runtime.sh start` + copy button
- Desktop process authority: **NONE**. It spawned no shell, no node, no Ollama,
  mutated no Builder state, and inspected no filesystem.

**Canonical operator start** — `scripts/jarvis-runtime.sh start` from the Unit 11
runtime checkout:

```
pid 76089 · runtime_id rt-3057a52d · version b59c61355 · state READY
worker available · ollama http://localhost:11434 · 9 models · 45ms
```

**Reconnect, with no Desktop restart and no manual Refresh:**

```
● JARVIS RUNTIME READY   ⌂ http://127.0.0.1:8787
● LOCAL WORKER AVAILABLE   ◎ MODEL maia-coder:latest
⟳ ACTIVE 0 · QUEUED 0 · TOTAL 6   ≈ EVENTS CONNECTED
```

The run list repopulated from runtime truth — 6 runs with their real
dispositions (`⊘ CANCELLED`, `⊘ CANCELLED`, `✓ VERIFIED`, `✕ FAILED`,
`✕ FAILED`, `✓ VERIFIED`). Submit re-enabled.

---

## 12. Proof — cancellation

Cancellation is offered only on non-terminal runs. Two live cancellations were
issued through `POST /runs/:id/cancel`:

| Run | HTTP | Rendered outcome |
|---|---|---|
| `r-e0785ccdeb` | 200 | ACCEPTED — "The runtime moved the run to CANCELLED." |
| `r-e074892961` | 200 | ACCEPTED |
| `r-c1b395dc31` | **409 `RUN_ALREADY_TERMINAL`** | **"Too late — run already terminal"** |

The third is the interesting one and it was not staged: a cancellation was issued
against `r-c1b395dc31` while it was believed to still be cycling, but it had
reached VERIFIED in the interim. The runtime answered `409 RUN_ALREADY_TERMINAL`
and the Desktop reported exactly that — the "too late" path proved against the
live runtime rather than a fixture.

`404` renders as "Run not found"; `405` as "Cancellation unsupported for this
run". Cancellation is never shown as immediate or faked — the Desktop reports
what the runtime answered, then re-reads state. The cancel control is not
rendered at all on terminal runs (verified in the UI for both a VERIFIED and a
FAILED run).

---

## 12b. Proof — Desktop restart continuity

The Desktop process was killed. The **runtime (pid 76089) and Ollama (pid 92864)
were left running** — only the doorway closed. A fresh Desktop process was then
launched.

| Check | Before restart | After restart |
|---|---|---|
| Runs visible | 7 | **7** (recovered from runtime history) |
| `r-c1b395dc31` disposition | VERIFIED | **VERIFIED** |
| Worker `started_at` | 2026-08-10T08:27:13.493Z | **2026-08-10T08:27:13.493Z** |
| `finished_at` | 2026-08-10T08:27:20.596Z | **2026-08-10T08:27:20.596Z** |
| Worker duration shown | 5s | **5s** |
| Citations | 6 contained / 6 total | **6 contained / 6 total** |
| Execution head | `b59c61355…` | **`b59c61355…`** |
| History length | 2124 | **2124** |
| Result / log file mtimes | 04:27:20 | **04:27:20 (unchanged)** |

**Worker rerun: NO.** The worker start time, finish time, duration, citation set,
history length and the on-disk result/log mtimes are all byte-identical. Nothing
was recomputed by reopening the Desktop — it re-read the runtime's durable store.

The Desktop-side objective annotation also survived, still correctly labelled
`DESKTOP_ANNOTATION`.

This is the property the unit exists to demonstrate: **the Desktop is a doorway;
the runtime is the durable authority.**

---

## 13. Observed Unit 11 characteristic — dispatch back-pressure

Not a Desktop defect; recorded because it dominates observed behaviour.

Between `READY_FOR_WORKER` and `RUNNING`, the runtime re-queues a run while
Builder capacity is unavailable, re-running `VALIDATING → CONTEXT_ROUTING →
READY_FOR_WORKER` each time. Run `r-0a82252af2` cycled **423 times** (1700 history
entries) over ~2.5 minutes before dispatching, and each cycle blocks the runtime
event loop on a synchronous `session.mjs` call — which is why `/health` and
`/runs` stop answering during that window.

Consequences the Desktop handles honestly: the `NOT RESPONDING` state (§6), the
45s client timeout, and a run history that legitimately contains hundreds of
repeated transitions. Fixing the back-pressure loop belongs to a runtime unit.

The re-queue is driven by Builder session capacity (`2 / 2` during this unit's
runs). Each dispatch attempt opens a Builder session; when the delegate process
exits, the session is left holding its claim (`⚠ process gone — still holds its
claim until recovered`), so a slot is consumed until recovery. One slot was also
held throughout by an **unrelated** 2.8h stale claim
(`s-d5e6a4b1 reflection-provenance-reconciliation`) belonging to another lane —
deliberately **not** touched by this unit, per the instruction to preserve
unrelated state.

Both Desktop runs nevertheless reached VERIFIED, at 423 and 529 cycles
respectively — the loop is slow and noisy, not deadlocked.

**Recommended for a runtime unit:** cap or back off the re-queue loop, close the
Builder session when a dispatch attempt aborts, and make the capacity refusal a
visible run state rather than a silent retry.

---

## 14. Tests

```
node scripts/builder/__tests__/jarvis-desktop-proof.mjs     →  20 passed, 0 failed
npm run jarvis:desktop:proof                                →  20 passed, 0 failed
```

Plain node, no test framework, matching the Unit 11 convention. A stub HTTP
runtime speaking the real Unit 11 wire contract (status codes, error envelopes,
SSE frames) is stood up on loopback and the Desktop's own client talks to it over
a real socket, so create / list / detail / cancel / SSE reconnect are proved end
to end rather than asserted about. No screenshot tests (the repo has no such
convention).

| # | Case |
|---|---|
| 1 | runtime health parsing |
| 2 | offline runtime state — distinct, instructs rather than execs |
| 2b | busy runtime reads as NOT RESPONDING, never OFFLINE or a failure |
| 3b | runtime reconnect — offline → live with no relaunch |
| 3 | create run |
| 4 | list runs |
| 5 | run detail — context, worker, execution, audit |
| 6 | state transition rendering — canonical name + human copy for all 11 states |
| 7 | VERIFIED rendering without semantic overclaim |
| 8 | ESCALATION REQUIRED never borrows the success tone; no auto-escalation to Claude |
| 9 | failure classes preserved, never collapsed; unknown classes shown verbatim |
| 10 | evidence/citation rendering incl. uncontained citations |
| 11 | semantic-verification limitation disclosure |
| 12 | cancel behaviour — accepted / too late / not found / unsupported |
| 13 | SSE reconnect + duplicate suppression |
| 14 | run persists across Desktop restart, no worker rerun; annotations non-authoritative |
| 15 | non-loopback runtime rejected, fails closed, env override included |
| 16 | no arbitrary shell/exec/filesystem action; no generic IPC invoke; CSP forbids network |
| 17 | READ-ONLY default authority; write-requesting fields refused at the composer |
| + | built packets carry no `file:line` answer leakage (real Unit 11 packet guard) |

---

## 15. Known limitations

1. **Unit 11 evidence verification proves citation containment, not general
   semantic claim support.** Disclosed throughout the Desktop; not fixed here.
2. **The Desktop cannot grant WRITE authority.** Refused at the composer and by
   the runtime.
3. **The Desktop does not integrate MAIA.** No "Ask MAIA", no shared
   conversational memory, no MAIA-initiated JARVIS invocation.
4. **The Desktop does not auto-escalate to Claude.**
5. **The Desktop exposes no arbitrary shell or process control**, including no
   "Start JARVIS" action — it prints the operator command instead.
6. **The runtime does not publish packet objectives** (§9); Desktop annotations
   fill the gap for self-submitted runs and are labelled as such.
7. **Command is template-bounded** (§4) — free-form objectives without context
   selectors are not submittable, by design.
8. **Visual design is Alpha.** Function over ornament; no final visual language.

---

## 16. Non-goals honoured

No MAIA integration · no Desktop shell access · no local-worker WRITE authority ·
no autonomous planning · no recursive agents · no LAN/internet exposure · no
accounts or auth · no team collaboration · no notifications beyond the local
Desktop · no mobile · no voice · no final visual design · no DEEP architecture
work · no change to Unit 11 semantic verification · no Unit 13.
