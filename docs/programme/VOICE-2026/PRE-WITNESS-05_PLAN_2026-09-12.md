# PRE-WITNESS-05 — PLAN — 2026-09-12 — **ACCEPTED WITH THREE AMENDMENTS (founder, 2026-09-12); amendments recorded in place; Phase A IMPLEMENTED (§7), NOT compiled**

**Founder act (verbatim in substance):** §1 ACCEPT with timing correction · §2 ACCEPT · §3 KEEP E1–E4 named, hypotheses only (unordered, non-exhaustive, none authorized until Phase A is read; E4's 500 ms not ratified) · §4 ACCEPT verbatim · §5 ACCEPT with a necessary wording change (mutating order pinned; observation calls whitelisted) · §6 ACCEPT with W4 provenance precision. **PHASE A AUTHORIZED · BEHAVIORAL REORDER NOT AUTHORIZED · B2 HOLD · B3 INVESTIGATION OPEN.**

**Authorized by:** founder, 2026-09-12, on the attested run-4 record: *"B3 — OPEN as the next bounded investigation … I authorize a PRE-WITNESS-05 plan only. No behavioral source change until the plan is accepted. Its first act should be instrumentation, not another attempted fix."*
**The question (founder wording):** *Can we arrange voice-processing initialization so the first engine start actually takes?*
**The physical finding it starts from (runs 3–4, verified):** with VP OFF, `engine.start()` returns and `isRunning` is true; input flows within 333 ms; listening holds. With VP ON, `engine.start()` returns **without throwing** and `isRunning` is **false from the first instant**, on every generation ever recorded; an `AVAudioEngineConfigurationChange` follows 125–295 ms later; no callback ever arrives. Nothing was stopped; nothing ever ran. Observed on iPhone 16 Pro Max · iOS 26.6.1 (23G83) Beta; not asserted as Apple-universal.
**Boundaries:** no threshold change · no recovery-law change · no session-ownership change · no architecture change · B2 HOLD · H1/H2 held · one experiment per SHA, one SHA per compile, one compile per device run.

## 1. Phase A — instrument the startup seam (the plan's first and only unconditional act)

Every step below becomes a journal record (or a field on an existing one), in the order it happens, on both VP settings, so the two traces can be laid side by side and the first divergent line named. **No call is reordered, added or removed in Phase A.**

| # | Seam | Where it already is / what is added |
|---|---|---|
| 1 | session configured · activated | already journalled (`session_category_set` … `session_activated` · `session_configured`) — unchanged |
| 2 | engine created | `graph_start_trace step=engine_created` (generation, VP setting requested) |
| 3 | input format **before** VP | `step=input_format_before_vp` {sampleRate, channels} — read `inputNode.outputFormat(forBus:0)` before `setVoiceProcessingEnabled` |
| 4 | VP enable begins / returns | `step=vp_enable_begin` · `step=vp_enable_return` {outcome ok/error, elapsedMs, `isVoiceProcessingEnabled` as read back} |
| 5 | input format **after** VP | `step=input_format_after_vp` {sampleRate, channels} |
| 6 | player attach / connect | `step=output_connected` |
| 7 | tap installation | `step=input_tap_installed` (after the §3.1 precondition, unchanged) |
| 8 | engine.prepare | `step=prepare_begin` · `step=prepare_return` {elapsedMs} |
| 9 | engine.start enters / returns | `step=start_begin` · `step=start_return` {outcome ok/error, elapsedMs} |
| 10 | isRunning immediately | `step=is_running_immediate` {engineRunning} (already on `graph_started`; kept there and echoed here) |
| 11 | isRunning at short observations | **AMENDMENT 1 (founder):** the existing tick is ~100 ms, so the plan may not promise ~10/50 ms. `is_running_immediate` on `start_return`, then `engine_running_observed` on **every existing tick** through ≥ 1000 ms, each carrying the actual `msSinceStartReturn`. Evidence reads `immediate → first tick → second tick → … → ≥1000 ms`; no new timer; no nominal values. |
| 12 | AVAudioEngineConfigurationChange | already journalled with §2.3/§3.4 evidence — unchanged |
| 13 | first input callback | `first_input_callback` {generation, msSinceStartReturn} — once per generation |

Additive, evidence-only. `graph_start_trace` records carry `causeSeq` = the `command`/recovery record that caused the start (they are steps of one act, not new acts; the replayer treats them as observations). The VP-OFF run is traced identically so the comparison is like-for-like.

## 2. Phase A acceptance (what the trace must let us say)

- **The first divergent line** between the VP-ON and VP-OFF traces is named by step number, with its evidence (a format that differs, a `start_return` that reports ok while `is_running_immediate` is false, a VP-enable error, an elapsed time that differs by an order of magnitude, …).
- Whether `setVoiceProcessingEnabled(true)` itself throws, returns false-on-read-back, or changes the input format on this runtime.
- Whether `isRunning` ever becomes true in the first second under VP ON without any kernel act (it has never been sampled that early before).
- **No behavioural conclusion is drawn from Phase A; it selects an experiment.**

## 3. Phase B — candidate orderings (named now; selected by the founder AFTER Phase A; one at a time; each its own accepted sub-plan line, SHA, MAC-COMPILE, device run)

| Exp | Ordering under test | What it would falsify |
|---|---|---|
| **E1** | `setVoiceProcessingEnabled(true)` **before** `AVAudioSession` activation (engine created, VP set, then `configureForConversation`, then start) | VP must be configured against an inactive session for the IO unit to initialize |
| **E2** | VP set after session activation but **before** `preferredSampleRate` / `preferredIOBufferDuration` are applied (the two session preferences deferred until after VP) | the preferences applied before VP leave the VP IO unit unable to start |
| **E3** | `engine.prepare()` **before** `setVoiceProcessingEnabled(true)`, then start | prepare-before-VP is required for the VP IO unit |
| **E4** | VP set, then `engine.start()`, then observe without a tap for 500 ms, then install the tap | tap installation before the VP IO unit is live is what prevents it running (the §3.1 precondition stays in force) |

Each experiment changes **only the named ordering**, keeps every guard and every journal line, and is run VP ON once and VP OFF once (the OFF run guards against a regression of the working path). An experiment that leaves `engineRunning: false` at every observation is falsified and the next is selected; none is pre-chosen; the founder selects from Phase A's evidence.

> **AMENDMENT 2 (founder):** E1–E4 stay named so the next session does not invent solutions after seeing the trace, but they are **hypotheses only — non-exhaustive, unordered, none authorized until Phase A is read.** E4's literal 500 ms is **not ratified**; if Phase A selects E4, its observation/delay mechanism belongs to that experiment's sub-plan. No arbitrary timing constant enters the plan before the evidence selects the experiment.

## 4. Not authorized by this plan

Any Phase B ordering before Phase A's trace has been read and the founder has selected the experiment · B2 · thresholds · recovery law · session ownership · architecture · STT/TTS · turn work · lower-level AudioUnit migration · H1/H2 repair · legacy repair.

## 5. Gates

- `swift test`: pure tests for the trace record shape (step names closed set; every trace record carries `causeSeq`).
- Source gate — **AMENDMENT 3 (founder): "byte-identical apart from journal hooks" withdrawn** (Phase A intentionally adds read-only calls: `outputFormat` before VP, the VP read-back, `isRunning` reads). The gate proves instead: **MUTATING STARTUP CALL ORDER unchanged from `35b0f61d0`** (`setVoiceProcessingEnabled → attach → connect → requireValid → input installTap → player installTap → addObserver → prepare → start`, each exactly once) · **ADDED CALLS observation/read-only or journal instrumentation only** (whitelisted) · **NO NEW timer · mutation · recovery act · configuration act** (forbidden-token scan of `start()`; `Task.sleep` count in the kernel unchanged; `engine_running_observed` emitted from the existing tick only; fault-class caller set closed) · thresholds/policy byte-pinned (existing).
- MAC-COMPILE-06 verbatim on the exact SHA before any device act.

## 6. Sequence

Founder accepts this plan → Phase A instrumentation SHA → MAC-COMPILE-06 → install → **run 5a** VP ON (Enter → 15 s → Export) · **run 5b** VP OFF (Enter → 15 s → Export) → `KERNEL-00_WITNESS_<date>_run5.md` names the first divergent line → founder selects E1–E4 (or none) → one experiment per cycle. **AMENDMENT (W4 provenance, founder):** if W4 under VP ON is folded into run 5, it is a **separate fresh VP-ON session** (Enter → Leave within ~2 s → wait → Export) recorded as *W4 measured on the Phase-A subject* — never retroactively relabelled as run-4 evidence.

## 7. Phase A implementation record (after acceptance; NOT compiled here)

| Item | Change | Where |
|---|---|---|
| trace steps | `AudioGraph.StartTraceStep` — closed, ordered enum of 14 raw values (`engine_created` · `input_format_before_vp` · `vp_enable_begin` · `vp_enable_return` · `output_connected` · `input_format_after_vp` · `input_tap_installed` · `render_tap_installed` · `observer_installed` · `prepare_begin` · `prepare_return` · `start_begin` · `start_return` · `is_running_immediate`) | AudioGraph.swift |
| `start(…, trace:)` | non-escaping trace closure; **no mutating call moved**; added reads only: `outputFormat(forBus:0)` before VP, `isVoiceProcessingEnabled` read-back, `isRunning` immediately after `start_return`; elapsed ms on VP enable / prepare / start; VP-enable and start errors traced then rethrown (behaviour unchanged) | AudioGraph.swift |
| journal | kernel journals each step as `graph_start_trace {step, generation, …}` with the start's `causeSeq` (steps of one act; observations to the replayer) | VoiceKernel.swift |
| post-start observation | `startReturnedAtMs` armed at graph start; **existing** `tick()` journals `engine_running_observed {generation, msSinceStartReturn, engineRunning, callbacksSoFar}` on every tick until ≥ 1000 ms; no new timer (`Task.sleep` count unchanged at 3) | VoiceKernel.swift |
| first callback | `first_input_callback {generation, msSinceStartReturn, frames}` once per generation, in `handleInput` after the generation gate | VoiceKernel.swift |
| tests | `StartTraceTests` (closed ordered set) → expected **30** on the Mac | tests |
| gates | PRE-WITNESS-05 Phase A ×3 (mutating order pinned and single; forbidden tokens absent in `start()`; added reads exactly as listed; every step emitted; tick-only observation; `Task.sleep` count 3; caller set closed) → **28/28** here | gate |

Untouched: session authority · RecoveryPolicy · HealthSupervisor · classifier · thresholds · harness. Nothing reordered.
