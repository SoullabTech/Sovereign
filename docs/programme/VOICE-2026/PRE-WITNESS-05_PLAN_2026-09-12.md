# PRE-WITNESS-05 — PLAN (for founder acceptance; NO CODE until accepted) — 2026-09-12

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
| 11 | isRunning at short observations | `engine_running_observed` at ~10 · 50 · 100 · 250 · 500 · 1000 ms after `start_return`, taken on the kernel's **existing** tick (no new timer; the record carries the actual `atMs`, not the nominal) |
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

## 4. Not authorized by this plan

Any Phase B ordering before Phase A's trace has been read and the founder has selected the experiment · B2 · thresholds · recovery law · session ownership · architecture · STT/TTS · turn work · lower-level AudioUnit migration · H1/H2 repair · legacy repair.

## 5. Gates

- `swift test`: pure tests for the trace record shape (step names closed set; every trace record carries `causeSeq`).
- Source gate: (a) in the Phase A SHA, the **order of calls** in `AudioGraph.start` is byte-identical to `35b0f61d0` apart from inserted journal hooks (asserted by extracting the call sequence `setVoiceProcessingEnabled → attach → connect → outputFormat → requireValid → installTap → installTap → addObserver → prepare → start` and comparing); (b) no new timer; (c) thresholds/policy byte-pinned (existing); (d) fault-class caller set closed (existing).
- MAC-COMPILE-06 verbatim on the exact SHA before any device act.

## 6. Sequence

Founder accepts this plan → Phase A instrumentation SHA → MAC-COMPILE-06 → install → **run 5a** VP ON (Enter → 15 s → Export; a Leave-within-2-s session is 4a-2's business and may be folded in here if still owed) · **run 5b** VP OFF (Enter → 15 s → Export) → `KERNEL-00_WITNESS_<date>_run5.md` names the first divergent line → founder selects E1–E4 (or none) → one experiment per cycle.
