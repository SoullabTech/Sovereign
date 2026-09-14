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

**Kernel diff budget** (a gate pin at implementation): `VoiceKernel.swift` changes only at the two buffer-typed seams and the trace-step type name; `ConfigurationChange.swift` is retained unchanged in source (its `voice_processing_reconfiguration` class is engine-specific and will read **absent** on VPIO journals, never manufactured — §5); `Package.swift` gains the Audio Toolbox link for the substrate target only. Any other kernel line changed = disguised redesign = refusal.

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
| K00-11 route change survives | route change arrives from the authority's `routeChanged` observation (not from an engine notification); rebuild under a new generation, session untouched; speaker ↔ receiver and every admitted Bluetooth topology; unsupported = platform capability | D — needs the phone (see §7) |
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

**What VPIO-01 will not have:** an `AVAudioEngineConfigurationChange`; therefore no `voice_processing_reconfiguration` classification, no `configuration_change_deferred`, no VP expectation. Those records read **absent** on the new subject. Their absence is recorded, never treated as "the problem went away": the entry axis is judged on K00-04 alone.

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
- **VPIO-01 build identity:** its own compile record (`KERNEL-00_VPIO-01_MAC-COMPILE-01_<date>.md`), its own signed artifact, its own dylib UUID + SHA-256 + manifest recorded before any install. **RULED YES (founder, 2026-09-14):** a distinct bundle identifier, `life.soullab.voicekernel.vpio01` (or as finally spelled in the project configuration), so the device can never hold two subjects under one id; the driver's `--subject vpio-01` maps to that bundle id in a subject table (C-D7 pattern). Changing the bundle identifier / project configuration is an explicitly permitted custody and build-identity delta, not a kernel diff-budget violation; the harness's behavioural source stays invariant.
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

Accepted as written: the substitution boundary (`AudioGraph.swift` interior replaced; `VoiceKernel.swift` only the two buffer-typed seams + trace-step type/vocabulary; package/build configuration = Audio Toolbox link + VPIO bundle identity; authority · supervisor · policy · projection · journal · replay byte-identical); the fail-closed rule (*any kernel change outside that budget is evidence that this is not the substrate substitution we authorized*); `ioRunning` never aliased to `engineRunning`; the manual-witness limitation (the first VPIO experiment qualifies K00-04 only; it cannot discharge K00-11/12/13/15 and therefore cannot accept KERNEL-00 — a 30/30 entry result earns consideration of the remaining witness, never KERNEL-01).

**Standing:** VPIO-01 PLAN/CENSUS ACCEPTED · law trigger reconciled (record only) · F-W1 matrix PINNED · distinct bundle id RULED YES · old K00/R1 container purge REMOVED · **VPIO implementation HELD · MAC-COMPILE HELD · device install NOT AUTHORIZED · N = 30 VPIO witness NOT AUTHORIZED** · KERNEL-01 · BENCH-01 · BRIDGE-01 · MIGRATE-01 CLOSED · AVAudioEngine subject FROZEN · SEAM-01 CLOSED · JOP-04 UNTOUCHED. Next act: founder adjudication of bounded VPIO implementation against this pinned plan.

