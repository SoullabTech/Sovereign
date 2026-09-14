# KERNEL-00 / VPIO-01 — Lower Voice-Processing-I/O Qualification · PLAN + SOURCE CENSUS

**Status:** OPEN — READ-ONLY CENSUS + PLAN (founder act, 2026-09-14) · CODE NOT AUTHORIZED · DEVICE ACT NONE · NEW SAMPLE NONE
**Lane:** `VOICE-2026` · `KERNEL-00` · branch `claude/voice-2026-census-01`
**Question (founder, verbatim in substance):** *Can the already-ratified VoiceKernel architecture be realized on the lower Voice Processing I/O path without changing its authority model, state model, sovereignty law, or K00 acceptance obligations?*
**Basis:** research §20.1 (begin with the higher-level engine; if it cannot meet the gates, move lower) as applied by the founder ruling of 2026-09-14. The ruling is narrow: the present higher-level subject has not demonstrated a stable physical substrate, and the bounded measurement programme (Pass 1, Pass 2, SEAM-01) produced no controllable mechanism that justifies another repair cycle. It is **not** a finding that `AVAudioEngine` is intrinsically incapable, not a retry of SEAM-01, not a repair, not KERNEL-01, not an architecture reset, and not evidence that the late configuration post caused any miss.

This document answers the seven questions the ruling names and nothing else. Where it names a platform API, the name is taken from the programme's platform survey (`SURVEY-01` §2) and Apple's Audio Toolbox documentation as cited there; **every property and call name is confirmed against the SDK headers at implementation time (a read, not a device act) and never assumed** — the lane's rule for `devicectl` and `log(1)` applies to Audio Toolbox too.

---

## 0. Source census (read-only, at `418fcf60f`)

The physical-I/O dependency of the current subject is confined to **one file**. Counts are of `AVAudioEngine` / `AVAudioPlayerNode` / `installTap` / `AVAudioPCMBuffer` / `AVAudioFormat` / `setVoiceProcessingEnabled` / `inputNode` / `outputNode` / `mainMixerNode` references per file:

| file | lines | engine-API refs | AVAudioSession refs | role |
|---|---|---|---|---|
| `AudioGraph.swift` | 338 | **22** | 0 (one comment) | the substrate — the only file that touches the engine |
| `VoiceKernel.swift` | 764 | 1 (a comment naming the notification) | 0 | the organism; reaches the substrate through 16 call sites listed below |
| `ConfigurationChange.swift` | 51 | 1 (a comment) | 0 | pure classifier for the engine's configuration-change notification (PRE-WITNESS-04) |
| `AudioSessionAuthority.swift` | 237 | 0 | **13** | the only session mutator (K00-01), iOS-only |
| `HealthSupervisor.swift` | 192 | 0 | 0 | pure; consumes `InputObservation` / `OutputObservation`, ratified windows |
| `RecoveryPolicy.swift` | 62 | 0 | 0 | pure; 3 / fault class / 60 s at 500 · 1000 · 2000 ms |
| `KernelState.swift` · `StateProjection.swift` · `Journal.swift` · `Replay.swift` | 136 · 39 · 112 · 85 | 0 | 0 | state, projection, flight recorder, replayer |
| `Tests/PureLogicTests.swift` | 400 | 1 | 0 | pure-logic tests (`swift test` on macOS) |
| harness `ios/VoiceKernelHarness` | — | 0 | 0 | SwiftUI reducer over snapshots; links the package; no `AVAudio` symbol of its own |

**The kernel → substrate surface** (every place `VoiceKernel.swift` reaches `AudioGraph`): construction `AudioGraph(generation:)` (line 281) · three callbacks `onInput` / `onStreamComplete` / `onConfigurationChange` (282–284) · `start(voiceProcessing:clock:trace:)` (286) · `stop()` · `schedule(_:as:)` (210) · `cancel(_:)` · `renderStats()` (431, 589) · `setSyntheticStall(_:)` (305) · `currentInputFormat()` (497) · `inputFormatAtStart()` (299, 329) · `ageMs(now:)` (498) · `lastNonSilentRenderedAtMs()` (725) · `isRunning` (326, 499, 602) · `makeTone(frequencyHz:seconds:)` (208) · `outputFormat`. Sixteen seams, all value-typed except two (`schedule` takes and `makeTone` returns `AVAudioPCMBuffer`).

**What flows across it** is already substrate-neutral: `InputObservation { generation, timeMs, frames, rms, peak }` (defined in `HealthSupervisor.swift`, not in the graph), `RenderStats { streamId, framesRendered, framesScheduled, lastNonSilentRenderedAtMs, synthetic }`, `InputFormatObservation { sampleRate, channels }`, `OutputStreamID`, `StartTraceStep` (a string per seam), integers and booleans. The supervisor, policy, projection, recorder and replayer never see an AVFoundation type.

**Reading:** the current subject is already shaped as *one organism over one substrate file*. A lower-path subject is a substitution at that file if — and only if — the sixteen seams keep their meaning and the kernel's diff is confined to the two buffer-typed seams and the trace-step vocabulary. That is the test §2 applies and §6 falsifies.

---

## 1. Invariant substrate — what survives unchanged

Unchanged in source, meaning and law (a diff outside these files, or a semantic change inside them, is a §6 refusal):

- **`VoiceKernel` (actor)** — floor, generation custody, entry/exit, recovery requests, journalling, the sixteen seams above. Its only permitted delta is the type at the two buffer-typed seams and the name of the trace-step enum (§2).
- **`AudioSessionAuthority`** — the one `AVAudioSession` mutator; `configureForConversation` / `release` / `overrideOutput` / `mutate` with journalled outcome per mutation (P3); observes interruption, route change and media-services reset and forwards them as events with a `seq`. **Byte-identical.**
- **`HealthSupervisor`** — pure; `beginGeneration` / `observeInput` / `observeOutput` / `tick`; ratified windows 1500 · 2000 · 1000 · 100 ms; three-way energy classification (digital zero ≠ noise floor ≠ signal). **Byte-identical; thresholds unchanged.**
- **`RecoveryPolicy`** — 3 attempts per fault class per sliding 60 s at 500 / 1000 / 2000 ms; monotonic generations; `degraded budget_exhausted:<class>`. **Byte-identical.**
- **Generation custody** — one substrate instance per generation; every observation stamped with its generation; stale generations journalled and dropped (K00-09); `beginGeneration` semantics unchanged.
- **Recovery law** — rebuild-not-resume for route change / interruption / reset, as narrowed by PRE-WITNESS-04 Amendment 2 (an expected reconfiguration with unchanged route and no demonstrated failure is not yet recovery; a health verdict declares failure). B2 restart-in-place stays RESERVED.
- **Output identity and cancellation** — `schedule` returns an `OutputStreamID`; `cancel(id)` is the only way rendering stops; one stream at a time; `stream_cancel_measured { cancelIssuedAtMs, lastNonSilentRenderedAtMs, cancelToSilenceMs, withinRatifiedWindow }` (P5).
- **`StateProjection` / `KernelSnapshot`** — `displaysListening` = floor listening ∧ input healthy; no `isListening` anywhere (VOICE-07).
- **Flight recorder and replayer** — `seq` on every record, `causeSeq` on every automatic act, `StateReplayer` fails on `brokenCausality` (P8, K00-17). Record names unchanged: `graph_started`, `graph_start_trace`, `graph_start_refused`, `graph_rebuild_failed`, `recovery_requested`, `recovery_scheduled`, `input_health_sample`, `output_render_sample`, `stream_cancel_measured`, `first_input_callback`, `engine_running_observed` (see §5 for the one evidence key that must not lie).
- **Fault injection** — digital-zero input, output stall at the render-observation seam (P6, stamped `synthetic`), hold-stale-callback, persistent fault: kernel-level flags, unchanged.
- **The harness** — a projection over snapshots; five visible labels; no voice state; the Mode-L driver reaches it by bundle id.
- **The exclusion list** (K00-16) — no STT, TTS, LLM, canonical MAIA, Web audio, Capacitor plugin, legacy voice component, network egress.

---

## 2. AVAudioEngine-specific substrate — precisely what is replaced

Replaced: **`AudioGraph.swift`, the one file**, and only its interior. The lower-path implementation is a Voice-Processing I/O audio unit (Audio Toolbox `kAudioUnitType_Output` / `kAudioUnitSubType_VoiceProcessingIO`, the unit `AVAudioEngine` itself wraps when voice processing is enabled — survey §2) driven directly:

| current (engine) | lower path (unit) | seam kept? |
|---|---|---|
| `AVAudioEngine()` + `inputNode` + `AVAudioPlayerNode` + `mainMixerNode` per generation | one VPIO unit instance per generation | construction seam unchanged (`generation:`) |
| `inputNode.setVoiceProcessingEnabled(true)` before start | the unit **is** the voice processor; VP on/off = the unit's bypass property (and AGC property) set before initialize | `start(voiceProcessing:)` unchanged |
| `inputNode.installTap` → push of `AVAudioPCMBuffer`s | input callback registered on the unit; the app **pulls** the mic frames from the unit inside that callback (render into an app-owned buffer) | `onInput(InputObservation)` unchanged; the observation is computed from the pulled frames |
| `player.scheduleBuffer` + render tap on the player | the unit's **output render callback** asks the app for frames; the app fills them from the scheduled stream's buffer or emits silence | `schedule` / `cancel` / `renderStats` / `lastNonSilentRenderedAtMs` unchanged; `framesRendered` counts what the callback actually produced |
| `NotificationCenter` `AVAudioEngineConfigurationChange` | none exists for a raw unit; hardware-format change is observable through a property listener on the unit's stream format (read-only observation) | `onConfigurationChange(generation)` kept as the seam; fired only by that listener, or never |
| `engine.prepare()` · `engine.start()` · `engine.isRunning` | `AudioUnitInitialize` · `AudioOutputUnitStart` · the unit's running property | `isRunning` kept as **evidence only** (§5) |
| `input.outputFormat(forBus: 0)` read (§3.1 precondition) | hardware stream-format read on the unit's input element before any callback is armed | `InputFormatObservation.requireValid()` unchanged — `invalidInputFormat` thrown before any callback exists; NSException machinery still absent |
| `AVAudioPCMBuffer` at `schedule` / `makeTone` | a plain float sample buffer type owned by the substrate | the **two typed seams change type**; nothing else in the kernel does |
| `StartTraceStep` (13 engine steps) | a VPIO step set (created · properties set · formats set · callbacks armed · initialize begin/return · start begin/return · running immediate) | `graph_start_trace` records unchanged in shape; the step vocabulary is the subject's |

**Not replaced, not touched:** everything in §1. **Not added:** no second substrate behind a protocol selected at runtime, no selector on the harness, no fallback from unit to engine or back inside a build — two substrates in one build is a §6 refusal (K00-16 in spirit: one organism, one physical substrate, one subject).

**Kernel diff budget — GOVERNED BY VPIO-01A CENSUS §4 (founder ruling 2026-09-14, this plan §11).** The first wording here (two seams + trace-step type only) was superseded by the semantic census; the concurrent "corrected" wording (`ebd9eef5d`, Record A) was ruled superseded as an active ruling and is quoted verbatim in §11.1. The governing budget is: `AudioGraph.swift` interior REPLACED · `RouteComparison.swift` ADDED (pure port equality only) · `VoiceKernel.swift` bounded to: the two buffer-typed seams · the VPIO trace-step vocabulary · retire the `onConfigurationChange` wiring/handler · retire the engine VP-expectation state and provenance fields · add the `onFormatChanged` observation-only seam · `engineRunning` → `ioRunning` · `engine_running_observed` → `io_running_observed` · authority-sourced route recovery through the existing policy with the eligibility guard (§11 item 4) · `ConfigurationChange.swift` + `ConfigurationChangeClassifierTests` REMOVED · `AudioSessionAuthority` · `HealthSupervisor` · `RecoveryPolicy` · `KernelState` · `StateProjection` · `Journal` · `Replay` · thresholds · generation/recovery law · harness behavioural source UNCHANGED · `Package.swift` Audio Toolbox link · bundle `life.soullab.voicekernel.vpio01` · gate: historical engine assertions by immutable SHA + active VPIO semantic assertions. Anything beyond = F-V3 → REFUSE.

---

## 3. Authority proof — the unit is not a second session owner

- **Source law (K00-01, gate-pinned today):** only `AudioSessionAuthority.swift` may contain `AVAudioSession.sharedInstance()` or any session mutator. The VPIO substrate file keeps that pin **and gains a second pin**: it may import Audio Toolbox and call unit APIs; it may not import or name `AVAudioSession`, and no file other than the substrate may name an Audio Toolbox symbol.
- **What the unit legitimately owns:** its own component instance, its stream formats on its own elements, its bypass/AGC properties, its callbacks, initialize/start/stop of *itself*. None of these is a session mutation. The hardware sample rate, I/O buffer duration, category, mode, options, activation, route and output override remain the authority's (`configureForConversation` sets 48 kHz / 10 ms preferred; the unit **reads** the resulting hardware format and adapts its client format — it never asks the session for anything).
- **Order of authority at entry (unchanged):** `enterConversation` → authority activates (journalled, `session_activated`) → kernel builds generation 1 → substrate reads the hardware format, refuses if invalid, arms callbacks, initializes, starts. The substrate never runs before the authority has spoken and never outlives `session_released` (K00-W4 exit guard from PRE-WITNESS-03 stands: the substrate is stopped before release, and a late callback after release is a journalled orphan, not an act).
- **Journal proof (K00-01 D-gate):** the run's journal must show session mutations only from component `AudioSessionAuthority`. A VPIO-01 witness with any session mutation attributed to another component is FAIL on K00-01, not a warning.
- **Ducking is a session-adjacent policy, not a substrate right:** the unit exposes an other-audio-ducking configuration (survey §2, [S2-11]). Setting it is not an `AVAudioSession` mutation, but it is a policy choice about other apps' audio. VPIO-01 does **not** set it; if the first witness shows it must be set for K00-05/06 to pass, that is returned to the founder as a finding, never adopted in place.

---

## 4. Acceptance mapping — K00-01…18 on the lower path, thresholds unchanged

| ID | on VPIO-01 | witness |
|---|---|---|
| K00-01 one session owner | unchanged; second source pin (§3) | S + D |
| K00-02 one entry, one exit | unchanged; OS-forced re-activations only stamped `interruption_recovery` / `media_services_reset_recovery` | D |
| K00-03 zero configuration mutations in conversation | unchanged; a unit property set *before* start is not a session mutation; a unit property set *during* conversation is a new act class and is not authorized | D |
| K00-04 input flow observable and healthy, **entry ≤ 1500 ms** | the input callback cadence is the unit's own pull cadence; `inputFlow = healthy` earned by callbacks, never by the running property | D — **the first witness axis** |
| K00-05 known PCM renders, cancellable by handle, **≤ 100 ms to last rendered frame** | render callback fills from the scheduled stream; `cancel` clears the active stream under the lock; `cancelToSilenceMs` measured at the render callback itself (§5) | D |
| K00-06 duplex physiology | input and output are one unit by construction; input callbacks continue during rendering; digital zero on input during output is the K00-06 falsifier as before; echo coupling recorded per route (quantitative gate still KERNEL-01/BENCH-01) | D |
| K00-07 dead input **≤ 2000 ms** | unchanged supervisor; digital-zero injection replaces pulled frames before observation | D |
| K00-08 stalled output **≤ 1000 ms** | unchanged supervisor; synthetic stall freezes the render-observation seam, stamped `synthetic` (P6) | D |
| K00-09 generation-safe recovery | unchanged; every callback carries its unit's generation; stale dropped | D |
| K00-10 bounded recovery **3 / class / 60 s at 500 · 1000 · 2000** | unchanged policy | D |
| K00-11 route change survives | **GOVERNED (founder ruling 2026-09-14, §11):** route recovery is sourced from `AudioSessionAuthority`'s own `route_changed` observation — `handleSession(.routeChanged)` always updates `snap.route`; a recovery act (`recovery_requested`, cause `session_route_change`, existing fault class `configuration_change`, existing `RecoveryPolicy`, never a direct rebuild) only when in conversation ∧ not suspended ∧ a successfully started substrate baseline exists (`routeAtStart` set by a successful start) ∧ floor ≠ degraded ∧ ports differ from `routeAtStart`; same-port / data-source-only notification = evidence, no act. `io_format_changed` is observation only. Speaker ↔ receiver and every admitted Bluetooth topology; unsupported = platform capability. (Record A's "two facts / retained seam" row superseded; quoted in §11.1.) | D — needs the phone (see §7) |
| K00-12 interruption survives | authority's interruption events; health suspended; re-activation stamped; rebuild | D — needs the phone |
| K00-13 media-services reset survives | authority's reset event → re-activation + rebuild (first exercised on device in Stage B, O7; the silent-limbo reading there is a K00-13 falsifier candidate to watch) | D — needs the phone |
| K00-14 background / lock policy explicit | unchanged (HOLD policy, `UIBackgroundModes: audio`), journalled | D |
| K00-15 endurance **60 min · ≥ 50 cycles · ≥ 3 route changes · ≥ 2 interruptions · 1 reset** | unchanged | D — needs the phone |
| K00-16 nothing else in the build | unchanged list **plus**: no `AVAudioEngine` / `AVAudioPlayerNode` / `installTap` symbol in the VPIO build; exactly one substrate | S |
| K00-17 the trace replays | unchanged; every automatic act carries `causeSeq`; the VPIO step vocabulary is added to the replayer's known automatic acts only if a step is an act (none is — steps are observations) | D |
| K00-18 the UI is a projection | unchanged | S + D |

**No obligation is removed, renamed, or re-thresholded.** The six ratified values stand. The acceptance law's §1 and §5 name the lower path as the route "if the engine path cannot pass K00-06 or K00-11"; the founder ruling applies research §20.1's broader clause (the engine path has not met the entry gate K00-04 in roughly half of automated cold starts across four strata, and no mechanism was found). This plan records that the law's own trigger wording (K00-06 / K00-11) is narrower than the condition actually used. **The plan does not amend the law**; whether §1/§5 should be amended to name the entry-window failure as an admitted trigger is a founder act on the law, separate from this plan.

---

## 5. Observability — what the new subject exposes, and what may not stand in for health

| physiology | how VPIO-01 exposes it | record |
|---|---|---|
| **actual callback cadence** | the input callback is the physical cadence; each call → `InputObservation { generation, timeMs, frames, rms, peak }`; per-second `input_health_sample` aggregates count / frames / gap max; `first_input_callback` per generation with `msSinceStartReturn` | unchanged records |
| **rendered frames** | counted **inside the render callback** as frames actually written for the active stream (not frames scheduled); `output_render_sample` per second; `RenderStats.framesRendered` | unchanged records; stronger than the engine subject (the callback *is* the render, no tap) |
| **digital zero** | supervisor's three-way classification on pulled input frames; injected zero replaces frames before observation and is stamped | unchanged |
| **route** | `AudioSessionAuthority.currentRoute()` at every generation start (`routeAtStart`) and on every `routeChanged` event; never read by the unit | unchanged |
| **generation** | on every observation, record and unit instance | unchanged |
| **cancellation-to-silence** | `cancelIssuedAtMs` at `cancel`; `lastNonSilentRenderedAtMs` = the render callback's own timestamp of the last non-silent buffer it produced; `cancelToSilenceMs` = difference; `withinRatifiedWindow` ≤ 100 ms | `stream_cancel_measured`, unchanged |
| **interruption / reset recovery** | authority events → `recovery_requested` (class `interruption_recovery` / `media_services_reset_recovery`) → policy → new generation; the substrate contributes only `graph_start_trace` + `graph_started` for the new generation | unchanged |
| **causal parentage** | `causeSeq` on every automatic act; the property-listener observation, if it fires, is an observation record with its own `seq` that a later act may name | unchanged (K00-17) |
| **hardware format** | read before callbacks are armed (§3.1 precondition) and at any property-listener firing; `inputSampleRate` / `inputChannels` / `inputFormatValid` on `graph_started`, `graph_start_refused`, and the observation | unchanged fields |

**The running proxy.** The engine subject's journals carry `engineRunning` (from `engine.isRunning`) on `graph_started`, `engine_running_observed` and the samples. Runs 4–6 and the census showed that key reading `true` at `start_return` and the organism never listening (O5, M-b). On VPIO-01 the equivalent read is the unit's running property. Rule, unchanged from the law and made explicit here: **no running read earns `inputFlow = healthy`; only callbacks do.** Evidence-key rule: VPIO journals carry the read under a key that names what it is — `ioRunning` — and never carry `engineRunning` (absent, not aliased). The ledger classifier (`k00-ledger.py`) and the census tools read `engineRunning` for the M-a/M-b shape; on the VPIO subject they read absent, and a subject-aware field mapping is added in the C-D7 pattern (declared subject decides the key; existing rows unchanged). This is the one journal-vocabulary change the plan proposes, and it is proposed so that a field cannot mean two things across subjects.

**What VPIO-01 will not have:** an `AVAudioEngineConfigurationChange`; therefore no `voice_processing_reconfiguration` classification, no `configuration_change_deferred`, no VP expectation. Those records read **absent** on the new subject, and the absence is **made true by removal** — the VP-expectation state, the classifier and the `onConfigurationChange` handler are not in the VPIO subject (census §4; founder ruling §11) — never by forcing an engine-specific expectation to `false` and leaving an engine classifier reachable (Record A, superseded; §11.1). Their absence is recorded, never treated as "the problem went away": the entry axis is judged on K00-04 alone.

---

## 6. Falsifiers — what kills VPIO-01 before implementation, or at its first witness

**Before implementation (design-time refusals; any one → VPIO-01 CLOSED, returned to the founder):**

- F-V1 **Second session owner.** The unit path requires the substrate to activate, categorize, set mode/options/preferred rate, override output, or otherwise call into `AVAudioSession` — refuse. The authority is not extended to the substrate and the substrate is not given the session.
- F-V2 **Two substrates in one build.** A protocol with two conforming implementations, a runtime selector, or an engine fallback inside the VPIO build — refuse (one organism, one substrate, one subject).
- F-V3 **Kernel diff outside the budget** (§2): any change to `HealthSupervisor`, `RecoveryPolicy`, `StateProjection`, `Journal`, `Replay`, `AudioSessionAuthority`, or to `VoiceKernel.swift` beyond the two buffer-typed seams and the trace-step type — refuse. Weakening single ownership, generation law, recovery ceilings, or the exclusion list is a refusal, not an adaptation.
- F-V4 **Threshold pressure.** Any argument of the form "the unit needs a longer entry window / cancel window / more attempts" — refuse; thresholds are ceilings that may not be loosened because an implementation misses them.
- F-V5 **Realtime-thread mutation.** A design in which the render or input callback mutates kernel state directly (rather than handing a value struct to the actor) — refuse; the current bounded pattern stands, the lock-free ring stays KERNEL-01.
- F-V6 **Exclusion-list creep.** Any STT, TTS, LLM, MAIA, Web audio, Capacitor or legacy-component symbol reachable from the VPIO build — refuse (K00-16).
- F-V7 **Undocumented API dependence.** A property or call needed for the design that cannot be read from the SDK headers / Apple documentation at implementation time — stop and return (never guess a property name, as with `devicectl` and `log(1)`).

**At the first witness (evidence, recorded as FAIL, never repaired into PASS inside the same subject):**

- F-W1 **The entry axis does not move — PINNED (founder ruling 2026-09-14; frozen before any VPIO outcome exists, superseding the elastic first wording).** Primary population: the 30 authorized invocations; take-rate denominator = valid non-infrastructure rows; no top-up. **Infrastructure-heavy:** more than 2 infrastructure rows → characterize only → F-W1 NOT ADJUDICATED → no automatic retry. **Clear entry improvement:** one-sided Fisher exact p < .05 (VPIO higher) against EACH engine stratum separately — A 14/29 · B 15/28 · C 16/29 · R1 13/30 — never pooled. **About the same / worse:** the VPIO valid take proportion does not exceed the highest observed engine-stratum proportion (16/29 = 0.552). **Intermediate:** higher than that band but not satisfying the all-four Fisher criterion → INDETERMINATE → return for ruling → no second witness earned automatically. Consequences of the rule, computed here and not separately chosen: with 0 infra rows the first count satisfying "clear improvement" is **24/30** (p vs A .011 · B .031 · C .038 · R1 .004); with 1 infra row **23/29**; with 2 infra rows **23/28**. A result such as 20/30 reads INDETERMINATE (p vs C = .26). None of these outcomes authorizes a repair cycle on the VPIO subject.
- F-W2 **The unit reads running with zero callbacks** (the O5 shape on the new substrate) — recorded as the same physiological finding at a lower layer; not repaired.
- F-W3 **Cancel-to-silence > 100 ms** or rendering after cancel — FAIL K00-05.
- F-W4 **Input collapses to digital zero during output**, or input callbacks stop while rendering — FAIL K00-06.
- F-W5 **A route change, interruption or reset needs a manual tap** — FAIL K00-11/12/13 (phone-bound obligations; see §7).
- F-W6 **A session mutation from any component but the authority** in the journal — FAIL K00-01.
- F-W7 **Replay fails** (`brokenCausality`, orphan) — FAIL K00-17.
- F-W8 **Ducking or other-audio behaviour must be configured on the unit for output to be audible** — returned as a finding (§3), not set.

---

## 7. Subject / custody boundary

- **The `AVAudioEngine` subject is FROZEN as historical evidence:** sources at `24a6fcfa1` (P5-B0 · `CC0D3604-…`) and R1 (`64EEC026-…`), their witness records, all driver ledgers (A · B · C · R1 · PRE-AUTH · LOG-CAL · SEAM-01 CONTROL/LOGGED), the census and its §7 sub-sections. Nothing is relabelled, re-read as VPIO evidence, or pooled with VPIO rows. The device currently holds R1; it stays until a VPIO-01 install is authorized, and that install expects a **new** UUID recorded before install by the same custody route (`k00-reinstall.sh` with `K00_EXPECT_UUID` / `K00_EXPECT_DYLIB_SHA` / `K00_EXPECT_MANIFEST`).
- **VPIO-01 build identity:** its own compile record (`KERNEL-00_VPIO-01_MAC-COMPILE-01_<date>.md`), its own signed artifact, its own dylib UUID + SHA-256 + manifest recorded before any install. **RULED YES (founder, 2026-09-14):** a distinct bundle identifier, frozen exactly as `life.soullab.voicekernel.vpio01` (founder, 2026-09-14; no later respelling), so the device can never hold two subjects under one id; the driver's `--subject vpio-01` maps to that bundle id in a subject table (C-D7 pattern). Changing the bundle identifier / project configuration is an explicitly permitted custody and build-identity delta, not a kernel diff-budget violation; the harness's behavioural source stays invariant.
- **Witness lineage:** `KERNEL-00_VPIO-01_WITNESS_<date>.md` records; driver ledgers `VPIO-01-<stamp>`; stratum `AUTOMATED-COLD-LAUNCH · VPIO-01`, never merged with any engine stratum; the classifier accepts the VPIO trace vocabulary under the declared subject only.
- **Instrument reuse (no new instrument):** DRIVER-01 Mode L, `k00-driver-batch.sh`, the ledger classifier, `k00-reinstall.sh`, container archive only if independently useful. **RULED (founder, 2026-09-14): no purge of the historical K00/R1 container is part of VPIO-01.** Its accumulated exports (the pre-install batch, R1, LOG-CAL, both SEAM-01 blocks since the 2026-09-13 purge; count read by listing at archive time, never assumed) belong to the frozen historical subject; with a distinct bundle identifier VPIO-01 gets its own container, so mutating the old one buys VPIO nothing and weakens historical custody. A read-only archive of the old container remains permissible.
- **What the automated instrument cannot witness:** K00-11 (route), K00-12 (interruption), K00-13 (reset), K00-15 (endurance) are physical acts on the phone. The manual phone witness is SUSPENDED by the founder. This plan does not pretend the driver covers them: the first VPIO-01 witness is the **entry axis only** (K00-04 under cold VP-ON launch), read as F-W1; the remaining obligations stay owed and require either the founder's phone or a separately authorized driver instrument for those acts.
- **Sequence if the plan is accepted (each a separate founder act):** (1) bounded implementation of the substrate file + the two seams + the gate pins, `swift test` green here on the pure logic (no Audio Toolbox on Linux), (2) MAC-COMPILE for VPIO-01 (build · test · gate · xcodegen · unsigned · signed; custody recorded), (3) historical K00/R1 container left untouched; prove the VPIO bundle is NOT installed before its first install (process list + app list by bundle id, recorded), (4) custody-gated first install of the VPIO artifact expecting the VPIO UUID / dylib SHA / manifest, establishing its own container, (5) one N = 30 cold VP-ON batch, `--subject vpio-01`, no reinstall inside, (6) reading under F-W1 returned for ruling. No step authorizes the next.

---

## Held (verbatim from the ruling)

KERNEL-01 CLOSED · BENCH-01 CLOSED · BRIDGE-01 CLOSED · MIGRATE-01 CLOSED · AVAudioEngine K00 FROZEN · SEAM-01 CLOSED · additional K00 diagnostic samples NOT AUTHORIZED · STT NOT AUTHORIZED · TTS NOT AUTHORIZED · turn intelligence NOT AUTHORIZED · canonical MAIA NOT AUTHORIZED · Web audio NOT AUTHORIZED · threshold changes NOT AUTHORIZED. JOP-04 untouched; its R1b/R1c ruling has no jurisdiction here.

**Standing after this document:** VPIO-01 OPEN · CENSUS DONE (§0) · PLAN RETURNED · CODE NOT AUTHORIZED · DEVICE ACT NONE · NEW SAMPLE NONE. The next act is the founder's reading of §2 and §6: if the substitution is confined to the one file and the two typed seams as §0 shows it can be, bounded implementation may be authorized; if any answer above reads as a redesign, VPIO-01 closes here.

---

## 8. Founder ruling on this plan (2026-09-14) — ACCEPTED WITH THREE RECORD-ONLY CORRECTIONS

Founder read `2637e1692` against the plan, the ratified acceptance law, research §20.1 and the charter sequence, and independently confirmed the §0 boundary at `418fcf60f` (22 engine-API references in `AudioGraph.swift`; the only other matches are comments in `VoiceKernel.swift` and `ConfigurationChange.swift`). **Plan architecturally sound; implementation NOT yet lawful** until three pins exist. Applied in this commit:

1. **Acceptance-law trigger reconciled (record only).** `ARCH-01/06_KERNEL-00_ACCEPTANCE_LAW.md` §1 and §5 amended narrowly: the lower path may open as a new KERNEL-00 subject after a recorded K00-04, K00-06 or K00-11 failure on the higher-level subject; new witness, never retry or silent fallback; no fallback inside one build; K00-01…18, the six thresholds, the pass rule and the authority model unchanged; not a general licence. K00-04 belongs there because the evidence is persistent entry instability across four automated strata plus pass 1/pass 2, and SEAM-01 closed the bounded measurement avenue without a lawful controllable mechanism. The 2026-09-14 opening act was sufficient for PLAN + CENSUS, not for implementation; this amendment is what makes implementation adjudicable.
2. **F-W1 pinned** (§6 above, verbatim in substance; 24/30 is a consequence of the rule, recomputed here, not a chosen threshold).
3. **Distinct bundle identifier RULED YES; old-container purge REMOVED from the VPIO sequence** (§7 above).

Accepted as written, **with the diff budget now governed by VPIO-01A census §4 as ruled in §11** (the six `engineRunning` → `ioRunning` key substitutions are admitted there; Record A's "permanently-false VP expectation" is superseded, §11.1): the substitution boundary (`AudioGraph.swift` interior replaced; `VoiceKernel.swift` bounded per census §4; package/build configuration = Audio Toolbox link + VPIO bundle identity; authority · supervisor · policy · projection · journal · replay byte-identical); the fail-closed rule (*any kernel change outside that budget is evidence that this is not the substrate substitution we authorized*); `ioRunning` never aliased to `engineRunning`; the manual-witness limitation (the first VPIO experiment qualifies K00-04 only; it cannot discharge K00-11/12/13/15 and therefore cannot accept KERNEL-00 — a 30/30 entry result earns consideration of the remaining witness, never KERNEL-01).

**Standing:** VPIO-01 PLAN/CENSUS ACCEPTED · law trigger reconciled (record only) · F-W1 matrix PINNED · distinct bundle id RULED YES · old K00/R1 container purge REMOVED · **VPIO implementation HELD · MAC-COMPILE HELD · device install NOT AUTHORIZED · N = 30 VPIO witness NOT AUTHORIZED** · KERNEL-01 · BENCH-01 · BRIDGE-01 · MIGRATE-01 CLOSED · AVAudioEngine subject FROZEN · SEAM-01 CLOSED · JOP-04 UNTOUCHED. Next act: founder adjudication of bounded VPIO implementation against this pinned plan.

---

## 9. Implementation HOLD (founder, 2026-09-14) → VPIO-01A semantic-boundary census

Founder read `cfe3984a4`: record pins ACCEPTED; superseded §5 wording stays in place; `below → above` editorial fixed. **Implementation HELD**: §0 was an API-reference census, not a semantic-dependency census — `VoiceKernel.swift` still carries the engine subject's configuration-change semantics (`vpExpectationPending`, the classifier call, `engine_configuration_changed` / `configuration_change_deferred` / `voice_processing_reconfiguration`, six `engineRunning` sites, and a `routeChanged` branch that delegates rebuild to the engine notification), continuing into `ConfigurationChange.swift`, `Replay.swift`, the pure tests and the repo gate. Following §2's budget literally would force manufactured engine-shaped records, a budget breach, or knowingly incomplete route recovery — none admissible. **The census is `KERNEL-00_VPIO-01A_SEMANTIC_CENSUS_2026-09-14.md`**; its §4 supersedes §2's diff budget and its §5 defines route recovery under VPIO without a second authority. Bundle id frozen exactly (§7 above); instrument plumbing recorded as later witness work.

---

## 10. CONCURRENT RECORD DIVERGENCE (2026-09-14, ~15:52Z) — UNRESOLVED, founder ruling required

Two records of the implementation boundary now exist in this document and contradict each other. Neither is applied; no source moved. Both are preserved verbatim; nothing was rewritten.

| | **Record A — `ebd9eef5d`** (another session, author "Claude", founder-attributed "CORRECTED BY FOUNDER ACT"; edits §2, §4 K00-11 row, §5, §8, and the acceptance law's note/§5 layout) | **Record B — `986225ae9` + VPIO-01A census §4/§5** (this session, from the founder's HOLD ruling that opened VPIO-01A) |
|---|---|---|
| `engineRunning` → `ioRunning` (six kernel sites) | admitted, vocabulary only | same |
| record name `engine_running_observed` | **NOT renamed** (replay-compatibility identifier) | proposed `io_running_observed` (founder's call; census §3) |
| `onConfigurationChange` seam | **retained**; the VPIO stream-format property listener is wired into it | **retired** (no such event on VPIO); replaced by `onFormatChanged` → observation `io_format_changed`, never an act |
| `ConfigurationChangeClassifier` | **retained byte-identical**; `vpExpectationPending = false` permanently so the VP class is unreachable; the route class still classifies the format callback | **removed from the VPIO tree** with its tests (recommended; `samePorts` kept as a pure helper); engine semantics not translated |
| K00-11 route recovery | via the retained seam: the format observation reaches the classifier, "sees the route changed", existing `configuration_change` recovery; *do not amend `handleSession(.routeChanged)`* | via the authority's own `route_changed` observation: `handleSession(.routeChanged)` becomes record + `recovery_requested` (cause `session_route_change`, existing class `configuration_change`, existing policy) — no new class/budget/timer/threshold |
| acceptance-law superseded §5 sentence | moved into the amendment note | the founder's instruction to this session was "keep it exactly where it is"; the merge carries Record A's layout unedited |

**What the two agree on:** one VPIO build, one substrate, no selector; the six-site key rename; authority · supervisor · policy · projection · journal · replay byte-identical; thresholds unchanged; implementation, MAC-COMPILE, install and N = 30 all HELD.

**What this session observes about Record A, for the founder's reading, not as an adjudication:** (1) the founder's HOLD ruling that opened VPIO-01A named "wire the property listener into `onConfigurationChange` so the kernel interprets a VPIO observation through an engine-specific classifier" as option A and called it inadmissible; Record A adopts that wiring with the VP class disabled. (2) With `vpExpectationPending = false`, the classifier returns `routeConfigurationChange` for *every* format callback, including one on an unchanged route (the classifier's route class is its default when the VP expectation is absent — `ConfigurationChange.swift`, pinned by `ConfigurationChangeClassifierTests` "pending: false → routeConfigurationChange"), so a benign format observation would request recovery through the budget on the very first callback; whether that is intended is a question for the founder, not a finding. (3) Record A's stream-format observation would be journalled as `engine_configuration_changed` with cause `os_configuration_change` unless the record name is also changed, which Record A does not admit.

**Rule applied here (AUTH-1/2/3):** attribution explains a record; it does not authorize this session to prefer it or to erase it. Both stand until the founder rules which boundary governs; the census remains read-only and no implementation is authorized under either.

---

## 11. FOUNDER RULING on §10 (2026-09-14) — RECORD B GOVERNS · Record A superseded as an active ruling, preserved as contradictory historical evidence

Read by the founder: `bf85b49e6`, the full VPIO-01A census, Record A at `ebd9eef5d`, the current gate, the authority route observer, the kernel route path, the replayer.

1. **Boundary — VPIO-01A census §4/§5 GOVERNS.** Record A's decisive defect is mechanical: with `vpExpectationPending = false`, `ConfigurationChangeClassifier.classify` fails its guard and returns `.routeConfigurationChange` for **every** callback reaching the retained seam — it never establishes that the route changed; that class is its residual. An unchanged-route VPIO format notification would enter `engine_configuration_changed → routeConfigurationChange → recovery_requested(configuration_change)` and spend recovery budget on a benign observation, journalled under an engine name and cause. **Rejected:** Record A wiring · retained `onConfigurationChange` · format-listener → classifier · permanently-false expectation as the reconciliation. AUTH-1 applies: attribution explains why Record A exists; it does not make the contradictory mechanism authoritative.
2. **`graph_*` — KEEP**, with the definition: *within the KERNEL-00 journal protocol, `graph_*` names the lifecycle of the generation-scoped physical I/O substrate; it does not imply an `AVAudioEngine` node graph.* VPIO component string `VoiceIO`; trace steps VPIO-native. Explicitly engine-named observations cannot be generalized: `engine_running_observed → io_running_observed`, `engineRunning → ioRunning`. Founder verified: `engine_running_observed` is not a `StateReplayer` automatic act and has no non-gate runtime/script dependency requiring the old name; Record A's "replay-compatibility identifier" rationale does not hold. Historical engine journals keep their names forever.
3. **Classifier — REMOVE from VPIO.** `ConfigurationChange.swift` and `ConfigurationChangeClassifierTests` out of the VPIO subject; `voiceProcessingReconfiguration` ABSENT; `configuration_change_deferred` ABSENT from new VPIO traces; `vpExpectationPending`, the VP-expectation provenance fields, the configuration-change ordinal state and `callbacksSinceChange` REMOVED. `Replay.swift` unchanged (its superset vocabulary may keep the name; a name in a replay vocabulary manufactures no event). **New `RouteComparison.swift`** containing only the existing port-identity logic `a.output == b.output && a.input == b.input`; data source stays evidence, not identity; no session reads, timers, recovery or substrate knowledge in the helper.
4. **Route recovery — authority-sourced act ACCEPTED, with one guard refinement.** Path: `AudioSessionAuthority` `route_changed` observation (its `seq`) → `handleSession(.routeChanged)` → `recovery_requested` (cause `session_route_change`, fault class `configuration_change`, `causeSeq` = the observation) → existing `RecoveryPolicy` → new generation. No direct `rebuildGraph()` from the route handler. **Guard (founder, from the entry-failure path):** `startObserving()` begins before `startGraph()` and `routeAtStart` exists only after a successful start, so a queued route notification could arrive after a refused first start with the floor already degraded and must not resurrect a failed entry or contaminate F-W1. Therefore: *always* `snap.route = newRoute`; *recovery act only if* in conversation ∧ not suspended ∧ `routeAtStart` exists ∧ the physical I/O instance successfully started ∧ floor ≠ degraded ∧ ports differ from `routeAtStart`; otherwise observation/state update only. Same-port / data-source-only → route evidence updated, no act. `io_format_changed` → observation only, no classifier, no `requestRecovery`, no rebuild; if physiology later fails the `HealthSupervisor` earns the recovery under its existing thresholds. Not a new recovery policy.
5. **Gate restructuring — gate by history ACCEPTED, two things named separately.** *Historical engine gate:* engine-subject assertions run against the immutable source objects `24a6fcfa1` (P5-B0) and `4596b9bdb` (Phase-A) loaded from the local Git object database — no branch name, moving ref, network fetch or working tree may stand in; a reproducibility gate, not protection of an immutable commit. *Active VPIO gate* on the working tree: only `AudioGraph.swift` names/imports Audio Toolbox · only `AudioSessionAuthority` mutates/names `AVAudioSession` · no `AVAudioEngine` / `AVAudioPlayerNode` / `installTap` / `AVAudioEngineConfigurationChange` · no `engineRunning` / `engine_running_observed` / `vpExpectationPending` / `voice_processing_reconfiguration` emission / `configuration_change_deferred` emission · `ioRunning` and `io_running_observed` present · `io_format_changed` journal-only (no `requestRecovery`, no rebuild) · `routeChanged`: authority observation is the causal parent, same-port = no act, changed ports = `requestRecovery("configuration_change")`, never direct rebuild · `HealthSupervisor` · `RecoveryPolicy` · `AudioSessionAuthority` · `StateProjection` · `Journal` byte-identical · thresholds unchanged. **Do not pre-invent a VPIO working-tree hash**: candidate assembled → VPIO gate green → implementation SHA fixed → MAC-COMPILE (if separately authorized) captures exact source-tree hashes + dylib UUID + dylib SHA + app manifest → a later record-only gate update may pin the accepted tree hash. Artifact custody = UUID + SHA + manifest, never a Jest hash pretending to be binary custody. Historical K00 instrumentation stays historical-K00-specific until the separately authorized witness-plumbing act.
6. **Acceptance-law layout:** Record A's move of the superseded §5 sentence into the amendment note is rejected (placement already ruled). Restored beside the amended §5 bullet in this commit; `ebd9eef5d` not erased or rewritten; the note now states that its layout preference was superseded by this ruling.
7. **VPIO-01A census — ACCEPTED** with the route guard refinement; the budget above (§2, restated) is settled.
8. **Implementation authorization:** this record-only reconciliation commit is made from `bf85b49e6` first (gate read, committed separately). **Once pinned, bounded VPIO-01 source implementation is AUTHORIZED exactly against the budget above.** It opens nothing afterward: MAC-COMPILE HELD · device installation NOT AUTHORIZED · VPIO witness N = 30 NOT AUTHORIZED · historical-container mutation NOT AUTHORIZED / unnecessary · KERNEL-01 · BENCH-01 · BRIDGE-01 · MIGRATE-01 CLOSED · JOP-04 UNTOUCHED.

### 11.1 Record A passages superseded by this ruling (quoted verbatim from `ebd9eef5d`; preserved, not erased)

**§2 kernel diff budget + VP-expectation ruling (Record A):**

> **Kernel diff budget** (a gate pin at implementation). ⚠️ **CORRECTED BY FOUNDER ACT, 2026-09-14 — the first wording forbade two changes this same plan requires, so a gate built from it would have had to violate one sentence or the other.** `VoiceKernel.swift` may change at, and only at:
> 
> 1. the two buffer-typed seams;
> 2. the trace-step type name / vocabulary;
> 3. ⭐ **the six existing `engineRunning` evidence-key occurrences**, which become `ioRunning` — **vocabulary only**. ⛔ No control flow, condition, threshold or health meaning may change at those sites. Verified present at `VoiceKernel.swift` lines **326** (`graph_started`), **427** (`input_health_sample`), **499** (the configuration-change observation), **516** (`configuration_change_deferred`), **602** (`engine_running_observed`), **625** (the `input_dead` recovery evidence). ⚠️ A seventh occurrence lives in `AudioGraph.swift:200` and disappears with that file's interior; it is not part of this budget. ⛔ **Record NAMES such as `engine_running_observed` are NOT renamed** — they are replay-compatibility identifiers. It is the evidence KEY that must stop lying about which substrate produced the reading.
> 4. ⭐ **`vpExpectationPending` becomes permanently `false` on this subject** — see the VP-expectation ruling below.
> 
> `ConfigurationChange.swift` and `ConfigurationChangeClassifier.swift` are retained **byte-identical**; `Package.swift` gains the Audio Toolbox link for the substrate target only. Any other kernel line changed = disguised redesign = refusal.
> 
> **⛔ THE VP-EXPECTATION RULING (founder act, 2026-09-14).** §5 says VPIO-01 has no `AVAudioEngineConfigurationChange`, therefore no `voice_processing_reconfiguration` and no `configuration_change_deferred` — *"absent, never manufactured"*. ⚠️ **But the unchanged kernel can still manufacture exactly that class.** `VoiceKernel.swift:322` sets
> 
> ```
> vpExpectationPending = snap.voiceProcessingEnabled
> ```
> 
> for **every** generation. A raw unit's stream-format property listener still calls the retained `onConfigurationChange` seam, so the first callback on an unchanged route could be classified through the old **engine-specific** expectation and journalled as `voice_processing_reconfiguration → configuration_change_deferred`. That would violate the plan's own never-manufactured rule.
> 
> ⭐ **So exactly one subject-specific adaptation is permitted**: on the VPIO subject, `vpExpectationPending = false` (or the mechanically equivalent compile-time form). ⛔ **No new selector. No runtime engine/VPIO choice. One VPIO build, one substrate.** The old branch may remain in source and becomes unreachable on this subject; the classifier is untouched.

**§4 K00-11 row (Record A):**

> | K00-11 route change survives | ⚠️ **corrected 2026-09-14** — the architecture uses **two** facts, not one: `AudioSessionAuthority.routeChanged` updates route identity, AND the **VPIO stream-format property observation** reaches the retained `onConfigurationChange` seam, so the classifier sees the route changed and the existing bounded `configuration_change` recovery runs. ⭐ That is the closest lower-path analogue of the engine architecture and needs **no new recovery law**. ⛔ Do **not** amend `handleSession(.routeChanged)` into a new direct rebuild path merely to make earlier prose true. Session untouched; speaker ↔ receiver and every admitted Bluetooth topology; unsupported = platform capability | D — needs the phone (see §7) |

**§5 "What VPIO-01 will not have" (Record A):**

> **What VPIO-01 will not have:** an `AVAudioEngineConfigurationChange`; therefore no `voice_processing_reconfiguration` classification, no `configuration_change_deferred`, no VP expectation. Those records read **absent** on the new subject. ⚠️ **And that absence is MADE true, not assumed**: the unchanged kernel sets a VP expectation every generation and would classify a stream-format callback through it, so §2's ruling pins `vpExpectationPending = false` on this subject. ⛔ Without that one adaptation this sentence would be a hope rather than a property. Their absence is recorded, never treated as "the problem went away": the entry axis is judged on K00-04 alone.

**§8 acceptance sentence (Record A):**

> Accepted as written, ⚠️ **with the diff budget as corrected on 2026-09-14** (the six `engineRunning` → `ioRunning` evidence-key substitutions and the permanently-false VPIO VP expectation are **admitted deltas**, not violations): the substitution boundary (`AudioGraph.swift` interior replaced; `VoiceKernel.swift` only the two buffer-typed seams + trace-step type/vocabulary + those two admitted adaptations; package/build configuration = Audio Toolbox link + VPIO bundle identity; authority · supervisor · policy · projection · journal · replay byte-identical); the fail-closed rule (*any kernel change outside that budget is evidence that this is not the substrate substitution we authorized*); `ioRunning` never aliased to `engineRunning`; the manual-witness limitation (the first VPIO experiment qualifies K00-04 only; it cannot discharge K00-11/12/13/15 and therefore cannot accept KERNEL-00 — a 30/30 entry result earns consideration of the remaining witness, never KERNEL-01).

