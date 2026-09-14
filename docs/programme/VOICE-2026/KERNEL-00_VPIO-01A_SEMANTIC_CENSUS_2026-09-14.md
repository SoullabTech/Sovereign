# KERNEL-00 / VPIO-01A — Semantic-Boundary Census (read-only)

**Status:** OPEN — READ-ONLY (founder ruling 2026-09-14 on `cfe3984a4`) · CODE NOT AUTHORIZED · VPIO-01 implementation HELD · MAC-COMPILE HELD · device/install/sample NOT AUTHORIZED
**Question (founder):** *What engine-specific semantics escaped `AudioGraph.swift`, and what is the smallest truthful boundary change required so VPIO does not impersonate `AVAudioEngine` while preserving the ratified organism?*
**Why this exists:** the VPIO-01 plan's §0 was an API-reference census (22 engine-API references in `AudioGraph.swift`, comments elsewhere). It was not a semantic-dependency census. The founder found that one layer of engine meaning had leaked upward into the kernel, the classifier, the replayer and the tests, and that following the plan's diff budget literally would force one of three inadmissible choices: manufacture engine-shaped records on VPIO, exceed the frozen budget, or leave route recovery knowingly incomplete. This census settles the five things the ruling names. Read at `cfe3984a4`; every line number below is from that tip.

---

## 1. Enumeration — every engine-semantic dependency outside `AudioGraph.swift`

"Engine-semantic" = code, record vocabulary, or a pin whose meaning is *the `AVAudioEngine` subject's behaviour*, not merely a symbol from the engine API.

### 1.1 `VoiceKernel.swift`

| lines | item | engine meaning | VPIO meaning |
|---|---|---|---|
| 47 · 322 · 385–389 · 483 · 488 · 512 · 327 · 429 | `vpExpectationPending` · `vp_expectation_retired` record · `vpReconfigurationExpected` evidence (on `graph_started`, samples, the change record, the deferred record) | PRE-WITNESS-04 Amendment 1: one expected `AVAudioEngineConfigurationChange` per VP-enabled generation, consumed on match, retired on healthy | **none** — a raw unit posts no such notification; an "expectation" of one would be a fabricated antecedent |
| 284 · 460–527 | `onConfigurationChange` wiring → `handleConfigurationChange(generation:)` | the engine's configuration-change notification: exit guard (PW-03 A) · generation guard · ordinal · classification · `engine_configuration_changed` observation · `configuration_change_deferred` (VP class) or `recovery_requested configuration_change` (route class) | **no event of this kind exists**; wiring the unit's stream-format property listener into this seam would route a VPIO observation through an engine classifier (the founder's option A) |
| 49 · 324 · 476 · 489 | `configChangeOrdinal` / `configurationChangeOrdinalInGeneration` | ordinal of engine change notifications within a generation | none |
| 50 · 325 · 377 · 428 · 503 | `callbacksSinceChange` | input callbacks since the last engine change notification | meaningless without that event (could only mean "since the last format-change observation") |
| 48 · 323 · 328 · 483 · 490 · 492 | `routeAtStart` (+ `dataSourceAtStart`) | input to the classifier's `samePorts` test | **substrate-neutral** — the route at generation start comes from the authority; still meaningful (see §5) |
| 326 · 427 · 499 · 516 · 602 · 625 | evidence key `engineRunning` (six sites) | `engine.isRunning` | the unit's running property; ruled key `ioRunning` (plan §5) |
| 598–604 · 58 · 319 | `engine_running_observed` record · `runningObservationDone` | Phase-A A1 tick observation of `engine.isRunning` through ≥1000 ms | same physiology on the unit under a truthful name (`io_running_observed`) |
| 501 | record `engine_configuration_changed`, cause `os_configuration_change` | the engine notification as an observation | none |
| 513 | record `configuration_change_deferred`, cause `voice_processing_reconfiguration` | PW-04 refined-B deferral act | none |
| 520–522 | `recovery_requested` cause `configuration_change` → `requestRecovery(faultClass: "configuration_change")` | PW-03 B bounded route recovery, **sourced from the engine notification** | the fault class is substrate-neutral (a recovery budget bucket); its *source* is engine-specific |
| 550–553 | `handleSession(.routeChanged)`: records the route and does nothing, comment: *"The engine posts AVAudioEngineConfigurationChange when the route affects it; the rebuild happens there."* | route recovery is delegated to the engine event | **on VPIO nothing would ever trigger route recovery** — this is the coupling behind the founder's option C |
| 291 · 380 | `graph_start_trace` per step · `first_input_callback` | step vocabulary = engine seams (13 P5-B0 steps) | record shapes neutral; step vocabulary is the subject's (plan §2) |
| throughout | record family `graph_started` · `graph_start_refused` · `graph_rebuilt` · `graph_rebuild_failed` · `graph_rebuild_*`; component string `"AudioGraph"` | "graph" named the `AVAudioEngine` node graph | the kernel's act is the same on any substrate: start/refuse/rebuild *the generation's physical I/O instance*; "graph" is a name, not a claim about nodes (§3 decides) |

### 1.2 `ConfigurationChange.swift` (51 lines)

Pure `ConfigurationChangeClassifier` for the engine notification: `voiceProcessingReconfiguration` (`voice_processing_reconfiguration`) vs `routeConfigurationChange` (`route_configuration_change`); `samePorts(_:_:)` helper; the file header names `AVAudioEngineConfigurationChange`. **Wholly engine-semantic**, except `samePorts`, which is a pure route comparison.

### 1.3 `Replay.swift`

Line 39: `configuration_change_deferred` is in `StateReplayer.automaticActs` (must carry `causeSeq`). Vocabulary only; the set is a superset and a never-emitted name in it is not a false record.

### 1.4 `Tests/PureLogicTests.swift`

Lines 219–226: replayer causality tests use `engine_configuration_changed` / `configuration_change_deferred` as example events. Lines 340–380: `ConfigurationChangeClassifierTests` (7 tests, +7 at PW-04) pin the classifier's one-shot, same-ports, VP-off, suspended behaviour. **Engine-semantic tests.**

### 1.5 `__tests__/voice-kernel-00-source-gates.test.ts` (the repo gate)

Engine-subject pins: lines 225–257 (`handleConfigurationChange` exit guard ordering vs `"engine_configuration_changed"`), 239–241 (no direct `rebuildGraph(cause: "route_recovery")`), 280–308 (classifier shape, deferral branch `vpExpectationPending = false` + `configuration_change_deferred`, `vpExpectationPending = snap.voiceProcessingEnabled`, never `= true`), 319 (`Replay` contains `configuration_change_deferred`), 327 (samples carry `engineRunning` + `callbacksSinceChange`), 366 · 421 (`trace(.isRunningImmediate, ["engineRunning": …])`), and **440–442: the kernel tree (`Sources`, `Tests`, `Package.swift`) and the harness tree are byte-pinned at the P5-B0 subject `24a6fcfa1`** ("the app under test is never rebuilt for the driver"). **A VPIO implementation on this branch necessarily changes those bytes; the pin cannot survive as written.** This is a custody consequence the VPIO-01 plan did not name.

### 1.6 Witness instruments (Mac side)

`scripts/witness/k00-ledger.py` lines 20–23 · 47–66: subject step lists (`p5b0` 13, `phase-a` 14), `SUBJECT-MISMATCH` on any other, and reads `evidence.engineRunning` on `is_running_immediate` and `graph_started` (the M-a/M-b shape). Bundle id `life.soullab.voicekernel.k00` hard-coded in `k00-driver-batch.sh:26`, `k00-reinstall.sh:15`, `k00-container-archive.sh:14`, `k00-container-purge.sh:28`, `ios/VoiceKernelDriver/DriverUITests/K00DriverTests.swift:23`, `ios/VoiceKernelHarness/project.yml:50`. Instrument-only; ruled as later witness-instrument work before any install/batch authorization (archive/purge tools stay historical-K00-only).

### 1.7 Not engine-semantic (confirmed byte-identical candidates)

`AudioSessionAuthority.swift` (0 engine refs; owns `routeChanged` / interruption / reset observation) · `HealthSupervisor.swift` · `RecoveryPolicy.swift` · `StateProjection.swift` · `KernelState.swift` (`voiceProcessingEnabled` is a member-set harness control, substrate-neutral) · `Journal.swift` · the harness (`toggleVoiceProcessing`, label projection only).

---

## 2. What `onConfigurationChange` means — RETIRED as a seam name for VPIO

It cannot mean both "the engine posted its configuration notification" and "the unit observed a hardware stream-format property change". On the engine subject it is the former, with a classifier and a deferral act behind it. On VPIO there is no such event, so the seam **does not exist**: the kernel neither wires it nor handles it. The unit's stream-format property listener is a **different observation with a different name** (§3), and it is an observation only — no classifier, no deferral, no expectation, no act.

---

## 3. Truthful VPIO vocabulary (records and evidence)

| engine subject | VPIO-01 | rule |
|---|---|---|
| `engineRunning` (evidence, 6 sites) | `ioRunning` | already ruled (plan §5); never aliased, never both |
| `engine_running_observed` | `io_running_observed` | same A1 physiology, truthful name |
| `is_running_immediate` (trace step) | `is_running_immediate` with evidence `ioRunning` | step name is substrate-neutral |
| `engine_configuration_changed` | **not emitted** | no such event |
| `configuration_change_deferred` · `voice_processing_reconfiguration` · `vp_expectation_retired` · `vpReconfigurationExpected` · `vpExpectationConsumed` · `configurationChangeOrdinalInGeneration` | **not emitted, absent** | absence recorded as absence, never manufactured |
| — | `io_format_changed` (component `VoiceIO`, cause `unit_property_listener`, evidence: generation, `inputSampleRate`/`inputChannels`/`inputFormatValid` before and after, `ioRunning`, `generationAgeMs`, `callbacksSinceStart`) | **new observation record**, never an act; K00-17: it carries `seq` and may be named as `causeSeq` by a later health verdict, never by a rebuild directly |
| `recovery_requested` cause `configuration_change` (from the engine event) | `recovery_requested` cause `session_route_change`, fault class `configuration_change` | the class is the existing recovery-budget bucket (no new class, budget, timer or threshold — PW-03 pin honoured); the **cause names the true source**: the authority's `route_changed` observation (§5) |
| `graph_started` · `graph_start_refused` · `graph_start_trace` · `graph_rebuilt` · `graph_rebuild_failed`; component `"AudioGraph"` | **keep the record names**; component string becomes `"VoiceIO"` | the kernel's act (start/refuse/rebuild the generation's physical I/O instance) is substrate-neutral and the replayer, ledger and census tools key on these names; renaming them buys no truth and breaks every reader. Recorded as a definition: *in the journal, "graph" means the generation's physical I/O instance, whichever substrate provides it.* Founder may rule otherwise. |
| trace steps (13 engine seams) | VPIO steps: `unit_created` · `io_enabled` · `vp_properties_set` · `formats_set` · `input_format_read` · `callbacks_armed` · `initialize_begin` · `initialize_return` · `start_begin` · `start_return` · `is_running_immediate` (exact names confirmed against the SDK at implementation; count fixed then) | subject vocabulary; the ledger's `SUBJECTS` table gains `vpio-01` |

---

## 4. The real implementation diff budget (restated; supersedes plan §2's budget)

**Untouchable (byte-identical):** `AudioSessionAuthority.swift` · `HealthSupervisor.swift` · `RecoveryPolicy.swift` · `StateProjection.swift` · `KernelState.swift` · `Journal.swift` · the six ratified thresholds · generation law · the harness's behavioural source.

**`AudioGraph.swift`** — interior replaced (plan §2); public seams: construction, `onInput`, `onStreamComplete`, **`onFormatChanged`** (replaces `onConfigurationChange`), `start(voiceProcessing:clock:trace:)`, `stop`, `schedule`, `cancel`, `renderStats`, `setSyntheticStall`, `currentInputFormat`, `inputFormatAtStart`, `ageMs`, `lastNonSilentRenderedAtMs`, `isRunning`, `makeTone`, `outputFormat`.

**`VoiceKernel.swift`** — bounded, enumerated, nothing else:
1. the two buffer-typed seams (`schedule` / `makeTone`) and the trace-step type name (plan §2, unchanged);
2. **remove** `handleConfigurationChange` and the `onConfigurationChange` wiring (line 284, 460–527);
3. **remove** `vpExpectationPending` · `vp_expectation_retired` (385–389) · `configChangeOrdinal` · `callbacksSinceChange` and their evidence fields (`vpReconfigurationExpected`, `configurationChangeOrdinalInGeneration`, `callbacksSinceChange`) from `graph_started`, the samples and the tick;
4. **add** the `onFormatChanged` handler: exit guard (K00-W4, as in the removed handler) → generation guard → journal `io_format_changed` → nothing else;
5. **rename** the evidence key at the six `engineRunning` sites → `ioRunning`; `engine_running_observed` → `io_running_observed`;
6. **`handleSession(.routeChanged)`**: from record-only to *record + act through the existing policy* (§5). This is the single place a real act is added to the kernel and it is required by the ruling's rejection of option C.

**`ConfigurationChange.swift`** — **removed from the VPIO subject tree together with `ConfigurationChangeClassifierTests`** (recommended). Rationale: SwiftPM compiles and links every file under `Sources`, so "retained but unreferenced" still puts engine-semantic code and its `AVAudioEngineConfigurationChange` header into a subject that claims to have no engine semantics — the impersonation risk in miniature. The historical subject keeps the file at `24a6fcfa1` / R1 in git history. `samePorts` is the one pure piece with a VPIO use (§5); it moves into the kernel or a small `RouteComparison` pure helper (founder's call; either is a pure function, tested).

**`Replay.swift`** — untouched (superset vocabulary; `io_format_changed` is an observation, not an act).

**`Tests/PureLogicTests.swift`** — `ConfigurationChangeClassifierTests` removed with the classifier; replayer tests keep their example event names (the replayer's set is unchanged); one new pure test for the route-change act's `samePorts` decision.

**`Package.swift`** — Audio Toolbox link for the substrate target only.

**Harness `project.yml`** — `PRODUCT_BUNDLE_IDENTIFIER: life.soullab.voicekernel.vpio01` (ruled; custody delta, not a kernel delta).

**The repo gate (`__tests__/voice-kernel-00-source-gates.test.ts`)** — lands **in the same commit** as the implementation, never red-then-fixed: (a) the engine-subject pins in §1.5 become **historical-subject pins evaluated against `git show 24a6fcfa1:<path>`** (and R1's `4596b9bdb` where they pin Phase-A shapes), so the frozen subject stays gated in history, not in the working tree; (b) the byte-pin at 440–442 becomes: historical trees pinned by SHA in history + the VPIO working tree pinned to its own hash at MAC-COMPILE time (recorded, not chosen); the driver's "app under test is never rebuilt" guarantee moves where it always really lived — the installed artifact's UUID / dylib SHA / manifest in `k00-reinstall.sh`; (c) new VPIO pins: only `AudioGraph.swift` imports Audio Toolbox; no `AVAudioEngine|AVAudioPlayerNode|installTap|AVAudioEngineConfigurationChange` symbol anywhere in the VPIO tree; no `engineRunning`, `vpExpectationPending`, `configuration_change_deferred`, `voice_processing_reconfiguration` in the kernel; `ioRunning` present; `io_format_changed` handler journals and does not call `rebuildGraph`/`requestRecovery`; `handleSession(.routeChanged)` reaches recovery only through `requestRecovery(faultClass: "configuration_change"`; `AudioSessionAuthority`/`HealthSupervisor`/`RecoveryPolicy`/`StateProjection` byte-pinned to their current hashes.

**Anything outside this list = disguised redesign = refusal** (plan §6 F-V3, restated against this budget).

---

## 5. Route recovery under VPIO — no second authority

`AudioSessionAuthority` keeps sole ownership of the session and of route/interruption/reset **observation** (unchanged, byte-identical). The only question is what substrate-independent observation causes a VPIO rebuild and how its causal parent is recorded:

- The authority already journals `route_changed` (with reason and the new `RouteState`) and forwards `.routeChanged(reason:route:)` to the kernel with its `seq` — this is the observation, and it is already recorded with a `seq`.
- Kernel rule (the §4 item 6 act): on `.routeChanged` while `inConversation` and not `suspended`: `snap.route = route`; if `!samePorts(routeAtStart, route)` → `recovery_requested` (cause `session_route_change`, `causeSeq` = the authority's observation seq) → `requestRecovery(faultClass: "configuration_change", …)` → existing `RecoveryPolicy` (3 / class / 60 s at 500 · 1000 · 2000 ms) → `rebuildGraph` under a new generation, session untouched — rebuild-not-resume as ratified. If the ports are the same (data-source-only change, as PW-04 ruled: *data source is evidence, never identity*) → `snap.route` updated, journalled by the authority, no act.
- Interruption and media-services reset: unchanged paths (already authority-sourced; `interruption_recovery` / `media_services_reset_recovery` re-activation + rebuild).
- The VPIO `io_format_changed` observation never triggers a rebuild by itself; if a format change kills the input, the supervisor's own `entry_timeout` / `input_dead` verdict requests recovery through the same policy, and that verdict may name the observation as `causeSeq` (K00-17 causal parentage preserved).
- No new fault class, budget, timer or threshold. The `configuration_change` class was ratified at PW-03 for exactly this bucket; only its *source* changes from an engine notification to the authority's route observation, and the cause string says so.

---

## 6. Two smaller pins (founder, applied)

- **Bundle identifier frozen exactly:** `life.soullab.voicekernel.vpio01`. The plan's "or as finally spelled" is withdrawn.
- **Instrument plumbing is later witness work, not VPIO audio implementation:** `k00-driver-batch.sh`, `k00-reinstall.sh`, `K00DriverTests.swift` (and the ledger's `SUBJECTS` / `ioRunning` mapping) gain the `vpio-01` subject → bundle-id mapping before any install/batch authorization; `k00-container-archive.sh` / `k00-container-purge.sh` remain historical-K00-only.
- The SDK check (founder, iPhoneOS 26.2 headers): `kAudioUnitSubType_VoiceProcessingIO`, `AudioUnitInitialize`, `AudioOutputUnitStart`, `kAudioOutputUnitProperty_EnableIO`, the VPIO bypass/AGC/ducking properties, `AudioUnitAddPropertyListener`, the stream-format property, the render callback and `AudioUnitRender` are present → F-V7 is not the blocker; the blocker was this boundary.

---

## 7. Reading

The physical API was isolated in one file; the *meaning* of one engine event (its configuration-change notification) had leaked into the kernel's state, records, replayer vocabulary, tests and gate pins, and route recovery had been delegated to that event. A truthful VPIO subject removes that event's semantics rather than translating them, names the unit's running read and format observation for what they are, and sources route recovery from the authority's observation through the existing policy. The diff budget is larger than plan §2 stated and is now enumerated line by line; everything the ruling names untouchable stays untouchable. The gate's byte-pin on the working tree is the one structural consequence the plan missed: the frozen subject must be pinned in history, not in the tree the new subject will occupy.

**Standing:** VPIO-01A CENSUS RETURNED · VPIO-01 implementation HELD · MAC-COMPILE HELD · device/install/sample NOT AUTHORIZED · thresholds UNCHANGED · authority/recovery law UNCHANGED · KERNEL-01 · BENCH-01 · BRIDGE-01 · MIGRATE-01 CLOSED · AVAudioEngine subject FROZEN · SEAM-01 CLOSED · JOP-04 UNTOUCHED. Founder rulings owed: §3 record-name definition (`graph_*` kept) · §4 classifier removal vs retention · §4 item 6 route act · gate restructuring (§4, historical pins by SHA) · then, if accepted, bounded implementation against §4 exactly.

---

## 8. Founder ruling (2026-09-14) — CENSUS ACCEPTED · §4/§5 GOVERN · one guard refinement

Recorded in full in the plan, §11. Applied to this census: (a) §4 budget settled as written, with **`RouteComparison.swift`** ruled as the pure-helper disposition (port equality only; data source = evidence, never identity; no session/timer/recovery/substrate knowledge) and the classifier + its tests REMOVED from the VPIO subject; (b) §5 route act accepted **with an eligibility guard**: `startObserving()` precedes `startGraph()` and `routeAtStart` exists only after a successful start, so a queued route notification after a refused first start (floor already degraded) must not resurrect a failed entry or contaminate F-W1 — recovery act only if in conversation ∧ not suspended ∧ `routeAtStart` exists ∧ the physical I/O instance successfully started ∧ floor ≠ degraded ∧ ports differ; else state update only; (c) §3 vocabulary accepted, `graph_*` kept under the ruled definition, `engine_running_observed → io_running_observed` (not a replayer automatic act; no non-gate consumer needs the old name); (d) gate by history accepted: engine-subject assertions against immutable objects `24a6fcfa1` / `4596b9bdb` from the local Git object database; active VPIO semantic assertions on the working tree; no pre-invented VPIO tree hash. The concurrent Record A (`ebd9eef5d`) is superseded as an active ruling (plan §11.1 quotes it). **Bounded VPIO-01 source implementation AUTHORIZED against §4 after the record-only reconciliation is pinned; MAC-COMPILE HELD; install and N = 30 NOT AUTHORIZED.**

