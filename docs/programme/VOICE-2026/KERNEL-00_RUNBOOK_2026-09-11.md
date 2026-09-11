# KERNEL-00 — Runbook and witness template

**Act:** `KERNEL-00` — OPEN by founder act 2026-09-11 under the ratified acceptance law (`ARCH-01/06_KERNEL-00_ACCEPTANCE_LAW.md`).
**Branch:** `claude/voice-2026-census-01` · **Code:** `ios/VoiceKernel/` (Swift package) · `ios/VoiceKernelHarness/` (harness app spec + sources).
**Status:** WITNESS SUBJECT = **`488e0666c`** · `MAC-COMPILE-01` RECORDED on `eef487422` · PRE-WITNESS-01 APPLIED at `488e0666c` · **`MAC-COMPILE-02` RECORDED GREEN on exactly `488e0666c`** (`KERNEL-00_MAC-COMPILE-02_2026-09-11.md`: `swift build` PASS · `swift test` 17/17 · source gate 13/13 · `xcodegen` PASS · unsigned iOS PASS · signed device build PASS) · **DEVICE WITNESS HOLD LIFTED** · **WITNESS READY · UNSPENT** (not installed, not launched).

> ⭐ **HOLD LIFTED (2026-09-11, by the standing rule, on `MAC-COMPILE-02`):** `488e0666c` earned itself on every predeclared compile gate, recorded verbatim by the founder. **The next bounded act is not code: install `488e0666c` on the paired iPhone and execute §3 under the ratified law, recording whatever the organism actually does — both outcomes legitimate, no threshold loosened, a failure is evidence.** Two compile-era notes carried into the witness, neither a change: (a) the unsigned compile emits one non-blocking warning, `result of 'try?' is unused` at the `leaveConversation` release — **deliberately left**, a fix would create a new subject requiring qualification; (b) the render tap and `.dataRendered` completion coexist at compile time — whether they behave under real rendering and cancellation is exactly what step 3/4 establish. First signed attempt failed before compilation on a destination-ID mismatch (`devicectl` id vs Xcode's destination id) — operator evidence, preserved in the record's Appendix A, not a kernel defect.

> The question KERNEL-00 must answer is deliberately small: *can one native authority keep MAIA's physical auditory/vocal apparatus alive, observable, cancellable, and recoverable for an entire conversation?* Nothing about intelligence. Nothing about whether her voice sounds beautiful. First prove that the body can hear and speak without fighting itself.

---

## 1. What was built, and what was deliberately not

| Component | File | Obligation it serves |
|---|---|---|
| `VoiceKernel` (actor) | `Sources/VoiceKernel/VoiceKernel.swift` | sole coordinator; commands → decisions; K00-02, -09, -10, -17 |
| `AudioSessionAuthority` | `AudioSessionAuthority.swift` (iOS only) | the ONLY `AVAudioSession` mutator; interruption / route / reset observers; K00-01, -03, -11, -12, -13 |
| `AudioGraph` | `AudioGraph.swift` | one `AVAudioEngine` per generation, voice processing on, input tap → observations, `AVAudioPlayerNode` output with stream identity; K00-04, -05, -06 |
| `HealthSupervisor` | `HealthSupervisor.swift` | physiological health from cadence, energy, render progress; the only recovery requester; K00-07, -08 |
| `RecoveryPolicy` | `RecoveryPolicy.swift` | ratified budget/backoff; monotonic generations; K00-09, -10 |
| `StateProjection` + `KernelSnapshot` | `StateProjection.swift`, `KernelState.swift` | one authoritative snapshot; `displaysListening` rule; K00-18 |
| `FlightRecorder` + `StateReplayer` | `Journal.swift`, `Replay.swift` | causal journal, JSONL export, replay validation; K00-17 |
| Harness app | `ios/VoiceKernelHarness/Harness/*` | Enter/Leave · Play tone · Cancel · fault toggles · witness counters · export |
| Pure-logic tests | `Tests/VoiceKernelTests/PureLogicTests.swift` | windows, budget, gating, replay — `swift test` on macOS |
| Source gates | `__tests__/voice-kernel-00-source-gates.test.ts` | K00-01, K00-16, VOICE-06/07/10/15/16 as code-shape gates; runs in CI |

**Not in the build (by construction, and gated):** STT · TTS · LLM · Web audio · Capacitor · the community speech plugin · `AudioSessionManager.swift` / `VoiceController.swift` · network · any turn/VAD logic · any agent logic. The harness is a **separate app target** with bundle id `life.soullab.voicekernel.k00`, never a member of `ios/App`.

**Decisions taken inside the ratified law (recorded, not new authority):**
- Session: `.playAndRecord` / `.voiceChat` / `[defaultToSpeaker, allowBluetooth, allowBluetoothA2DP]`, preferred 48 kHz / 10 ms, **no** `.mixWithOthers` (a conversation owns its session). Configured once at enter; re-configured only on interruption end or media-services reset, stamped as such (K00-03).
- Voice processing: `AVAudioEngine.inputNode.setVoiceProcessingEnabled(true)` before start (research §20.1 — the higher-level path first; a lower Voice-I/O path is a separately witnessed run, per the founder act).
- Route change: the engine's `AVAudioEngineConfigurationChange` triggers a **rebuild under a new generation** with the session untouched (rebuild-not-resume, SURVEY-01 §7). The session-level route notification only records state.
- Interruption: health evaluation is **suspended** while the OS holds the session; on end, session re-activated (cause `interruption_recovery`) and graph rebuilt. `shouldResume` is recorded as evidence, not obeyed as authority.
- K00-14 background policy for KERNEL-00: **HOLD** (`UIBackgroundModes: audio`). Whether MAIA holds in production is a later ruling.
- `setMicEnabled(false)` is an intention for the future turn layer; the physical organism stays observed.
- Output: one stream at a time; `cancel` = `AVAudioPlayerNode.stop()` on the identified stream; fade is not implemented in K00 (the law requires cancel; fade is a later refinement).

**Known limits, stated plainly:** the input tap hands observations to the actor via `Task {}` (bounded, not realtime-safe — a KERNEL-01 refinement); `playerTime(forNodeTime:)` is the render-progress source and returns nil after `stop()` (the last progress value is kept); `.allowBluetooth` may warn as deprecated on newer SDKs; **none of this has been compiled** — the first Mac build will find what the author could not.

## 2. Build (Mac Studio)

```bash
cd ~/MAIA-SOVEREIGN
git fetch origin claude/voice-2026-census-01
git checkout claude/voice-2026-census-01
cd ios/VoiceKernel && swift build && swift test
cd ../VoiceKernelHarness
brew list xcodegen >/dev/null 2>&1 || brew install xcodegen
xcodegen generate
open VoiceKernelHarness.xcodeproj
```

In Xcode: select the `VoiceKernelHarness` target → Signing & Capabilities → your team. Select the iPhone. **Run (Debug) with the console attached.** Grant the microphone prompt.

If `swift build` fails, record the compiler output in the witness file as the first entry — a compile failure is evidence, and the fix is bounded to making the written design compile, not to redesign.

## 3. The witness — one obligation at a time

Every step: read the harness state, read the console, and after the run export the journal (toolbar → *Export journal*; AirDrop the `.jsonl` to the Mac). Both outcomes are legitimate. Never loosen a threshold to obtain green.

| Step | Do | PASS reads | Obligation |
|---|---|---|---|
| 0 | `swift test` | all green | pure logic |
| 0b | `npx jest __tests__/voice-kernel-00-source-gates.test.ts` (Mac) | all green | K00-01, K00-16 |
| 1 | Tap **Enter conversation** | `session active`, `inputFlow healthy` within the entry window, floor `listening`; the journal shows the mutation chain `session_category_set → session_preferred_sample_rate_set → session_preferred_io_buffer_set → session_activated` each with `outcome ok`, then one `session_configured` summary — all with cause `enter_conversation` | K00-02, K00-04 |
| 2 | Speak, stay quiet, speak | rms/peak move; quiet reads `healthy` (noise floor), never `dead`; the journal carries one `input_health_sample` per second (callbacks, frames, rms/peak min·max·mean, classification) for the whole run — the longitudinal evidence, not the last value | K00-04 |
| 3 | **Play 3 s tone** ×5, letting each complete | floor `maiaSpeaking` → `listening`; stream `complete` with frames rendered = scheduled; **input callbacks continue during the tone and rms does not collapse to zero**; the journal has no session mutation | K00-03, K00-05, K00-06 |
| 3b | Note, for the current route, the input rms during the tone vs silence | recorded as echo coupling (measurement, not gate) | K00-06 |
| 4 | Play tone, **Cancel active** mid-tone | stream `cancelled`, then (≈300 ms later) `stream_cancel_measured` with `cancelToSilenceMs` ≤ 100 and `withinRatifiedWindow true`; the harness row *last cancel → silence* reads green; audible stop | K00-05 |
| 5 | Faults → **Digital-zero input** → Apply | within ≤ 2 000 ms: `inputFlow dead`, `recovery_requested input_dead`, `recovering`, then `graph_rebuilt` with generation+1; clear the fault → `listening` returns without a tap | K00-07, K00-09 |
| 6 | Faults → **Stall output** → Apply → Play tone | within ≤ 1 000 ms: `outputFlow stalled`, `stream_failed`, recovery; the frozen `output_render_sample` records are stamped `synthetic true` and the harness stream counter stops with them (the stall is injected at the observation seam, so supervisor, snapshot and journal agree); clear the fault | K00-08 |
| 7 | Faults → **Hold one callback** → Apply → then trigger a recovery (step 5) | after `graph_rebuilt`, one `stale_callback_dropped` with `callbackGeneration < current`; nothing else changes | K00-09 |
| 8 | Faults → **Persistent fault** → Apply | three recoveries at 500 / 1 000 / 2 000 ms, then `degraded` with cause and attempts 3/3 displayed; no fourth attempt; **Re-enter** restores | K00-10, K00-15 |
| 9 | Route: **Speaker** / **System default** buttons (authority-owned `overrideOutputAudioPort(.speaker | .none)` → `session_output_override` in the journal), then hold to ear / away, then connect/disconnect each Bluetooth device the OS admits | each transition: `route_changed`, `engine_configuration_changed`, `graph_rebuilt`, then `healthy` **with no manual tap**; the route line shows the new path and data source; unsupported topologies recorded as platform capability | K00-11 |
| 10 | Incoming call / Siri / another app's audio, then return | `interruption_began` → `recovering`; on end `interruption_recovery`, `session_configured (interruption_recovery)`, `graph_rebuilt`, `listening` — no tap | K00-12 |
| 11 | Media-services reset: on the witness device, **Settings → Developer → Reset Media Services** (the Developer menu appears once the device has been used with Xcode) — this is exercisable, not optional | `media_services_reset` → `resetting` → `session_activated` + `session_configured` stamped `media_services_reset_recovery` → `graph_rebuilt` (generation+1) → `listening`, no tap | K00-13 |
| 12 | Lock / unlock; background / foreground | `app_lifecycle` records (`willResignActive`, `didEnterBackground`, `willEnterForeground`, `didBecomeActive`, protected-data events) bracket what the session and flows did; declared HOLD behaviour observed; the journal, not memory, says which | K00-14 |
| 13 | Endurance: 60 min, ≥ 50 cycles, ≥ 3 route changes, ≥ 2 interruptions, 1 reset; **manual interventions must read 0** | counters on the harness; export at the end | K00-15 |
| 14 | Export journal | `replay PASS · N transitions · stale dropped · gens […]` on the harness (FAIL names orphans · unattributed acts · broken causality — an automatic act whose `causeSeq` is missing, later, absent or from a later generation); the `.jsonl` attached to the record | K00-17 |
| 15 | Throughout | the harness never shows "listening" without `inputFlow healthy` | K00-18 |

**K00-06 / K00-11 on the voice-processing path.** If the `AVAudioEngine` voice-processing path cannot satisfy K00-06 or K00-11, record the FAIL with the journal before considering the lower Voice-I/O path; that second run is a **new** witness, not a retry (law §5).

## 4. Record template — `KERNEL-00_WITNESS_<date>.md`

```text
Build identity: native SHA · Xcode · iOS · device · route hardware available
Compile: swift build / swift test / xcodegen / Xcode build — outputs verbatim
Checklist: K00-01 … K00-18 — PASS / FAIL, one line of evidence each (K00-13 is exercisable via Settings → Developer → Reset Media Services; "NOT EXERCISABLE" is admitted only for a route topology the OS does not offer on the witness device, recorded as platform capability)
Thresholds used: the ratified six; K00-06 coupling measurements per route
Journal: attached .jsonl; replay report line
Manual interventions: count (must be 0 for K00-15)
Founder attestation
```

Deployed ≠ demonstrated. A kernel verified only by its author's tests is a claim about code, not about the organism.

## 5. What KERNEL-00 does not license (founder act, verbatim)

No model selection (BENCH-01 closed) · no `/maia` integration (BRIDGE-01 closed) · no legacy cleanup or migration (MIGRATE-01 closed) · no "helpful" additions (VAD, turn detection, transcription, synthetic speech, semantic state, JARVIS logic) · no threshold tuning to obtain green · a failure is evidence · E19/E20 remain overlay evidence and do not block KERNEL-00.
