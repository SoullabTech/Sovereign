# PRE-WITNESS-01 — bounded instrumentation repair before the KERNEL-00 device witness

**Ruling (founder, 2026-09-11, on `eef487422`):**
**RUN** `MAC-COMPILE-01` against **exactly `eef487422`**. **HOLD** the KERNEL-00 device witness.
Preserve the unmodified first-compile evidence: the commit is explicit that this source has never been compiled, so changing it before the first Mac compile would erase useful evidence. Compilation establishes *native viability*; it does not make a witness meaningful while some ratified falsifiers cannot yet be measured.

```text
KERNEL-00 SOURCE     WRITTEN
SOURCE BOUNDARY      GOOD
MAC COMPILE          AUTHORIZED NOW      (exactly eef487422)
DEVICE WITNESS       HOLD
ARCHITECTURE         NOT REOPENED
PRE-WITNESS FIXES    BOUNDED INSTRUMENTATION ONLY  (after the compile is recorded; new SHA)
```

**Status of this document:** PLAN. Nothing in it is applied. The Swift sources at `eef487422` are frozen until `MAC-COMPILE-01` is recorded. Do not install `eef487422` and start the 60-minute witness because it compiles.

---

## 1. MAC-COMPILE-01 — what to run and record

```bash
cd ~/MAIA-SOVEREIGN && git fetch origin claude/voice-2026-census-01 && git checkout eef487422
cd ios/VoiceKernel && swift build 2>&1 | tee /tmp/k00-swift-build.txt
swift test 2>&1 | tee /tmp/k00-swift-test.txt
cd ../.. && npx jest __tests__/voice-kernel-00-source-gates.test.ts 2>&1 | tee /tmp/k00-gate.txt
cd ios/VoiceKernelHarness && xcodegen generate 2>&1 | tee /tmp/k00-xcodegen.txt
xcodebuild -project VoiceKernelHarness.xcodeproj -scheme VoiceKernelHarness -destination 'generic/platform=iOS' -allowProvisioningUpdates build 2>&1 | tail -60 | tee /tmp/k00-xcodebuild.txt
```

Record all five outputs **verbatim** in `KERNEL-00_MAC-COMPILE-01_<date>.md` with: macOS · Xcode · Swift toolchain version · iOS SDK. A failure at any step is the evidence of that step; the bounded fix is making the written design compile, not redesign. Deprecation of `.allowBluetooth` in favour of `.allowBluetoothHFP` is expected on current SDKs — let the compile establish the actual consequence before touching it.

## 2. Findings ruled bounded (founder) — and the disposition each gets in PRE-WITNESS-01

| # | Finding | Why it matters | Bounded disposition (to implement after the compile is recorded) |
|---|---|---|---|
| P1 | **Acceptance-law record is stale.** `06_KERNEL-00_ACCEPTANCE_LAW.md` header still says "KERNEL-00 NOT OPEN" while README/charter say OPEN. | Record coherence. | Header repair citing the opening act (README §2c). |
| P2 | **K00-02 latent contradiction.** "Exactly one activation/deactivation per session" vs K00-12/13 and the implementation, which reactivate after interruption/reset. | The law would fail a lawful recovery. | Clarify K00-02: *one user-intent entry activation + one exit deactivation; OS-forced recovery reactivations are permitted only when separately stamped `interruption_recovery` or `media_services_reset_recovery`.* Clarification, not loosening. |
| P3 | **Session mutations not individually witnessed.** `configureForConversation()` performs category/mode, sample rate, buffer duration and activation, then emits one aggregate `session_configured`. A failure halfway mutates physical state without recording which step succeeded. | K00-01/02/03 must be countable per mutation. | `AudioSessionAuthority` journals each mutation and its outcome separately: `session_category_set` · `session_preferred_sample_rate_set` · `session_preferred_io_buffer_set` · `session_activated` · `session_deactivated`, each with `ok`/`error`. The aggregate record may remain as a summary. |
| P4 | **Physical-health evidence incomplete.** K00-04 requires cadence, frame counts, RMS/peak to be journalled; today input observations live in the snapshot and the journal records only flow transitions. | Longitudinal physiology is the point of VOICE-08. | Bounded, aggregated `input_health_sample` records (e.g. once per second: callbacks in window, frames, min/mean/max RMS, peak, energy class, generation) so 60 minutes stays within the recorder cap. Same for output: `output_render_sample` while rendering. |
| P5 | **K00-05's 100 ms metric does not measure its law.** `cancelLatencyMs` brackets `player.stop()` — function-call duration, not `cancel(handle) → last rendered frame`. | The ratified threshold is about rendered audio. | Instrument the render side: an output tap on the mixer/player path records the timestamp of the last non-zero rendered frame; `stream_cancelled` carries `cancelIssuedAtMs`, `lastNonZeroRenderedAtMs`, and `cancelToSilenceMs` = their difference. Audible stop corroborates; it cannot replace the metric. |
| P6 | **K00-08 fault injection contradicts observed state.** With `stallOutput` the kernel suppresses the supervisor's progress observation while still updating the stream's `framesRendered`; it can declare "stalled" while its own counter advances. | Observed state must agree with itself. | Move the synthetic stall to the render-progress observation seam (the graph's `renderedFrames()` freezes under the fault) so supervisor, snapshot and journal all see progress stop; stamp the observation `synthetic: true`. |
| P7 | **K00-11/13/14 not fully exercisable by the harness.** No speaker/receiver route control; no app-lifecycle observation in the journal; the runbook wrongly allows "NOT EXERCISABLE" for reset. | Falsifiers must be reachable. | (a) `AudioSessionAuthority.overrideOutput(.speaker | .none, cause:)` — the ONLY place `overrideOutputAudioPort` may appear (gate updated) — with a harness control; Apple: `.speaker` is supported with `playAndRecord`, `.none` restores the system default, `defaultToSpeaker` changes the default from receiver to speaker. (b) Harness observes `UIApplication` lifecycle (`willResignActive` · `didEnterBackground` · `willEnterForeground` · `didBecomeActive`) and the kernel journals `app_lifecycle` events. (c) Runbook K00-13: on a development device, **Settings → Developer → Reset Media Services** triggers `mediaServicesWereResetNotification`; "NOT EXERCISABLE" is removed as a default path. |
| P8 | **K00-17's replay gate is weaker than its law.** Replay checks a non-empty `cause` string; that does not answer *which observation* caused an act when identical observations recur. | Causality must be proved, not inferred. | `JournalEvent` gains `seq` (monotonic per session) and automatic acts gain `causeSeq` (the `seq` of the observation that caused them). `StateReplayer` verifies every automatic act's `causeSeq` exists, precedes it, and belongs to the same or an earlier generation. |

**Boundaries of PRE-WITNESS-01 (founder):** no architecture changes · no STT/TTS/MAIA · no threshold changes · only record coherence, witnessability, physiological instrumentation, causal instrumentation, lawful harness controls. Compile again as a **new SHA** before the device witness.

## 3. Sequence

```text
eef487422
   ├── MAC-COMPILE-01 (founder, Mac Studio) → KERNEL-00_MAC-COMPILE-01_<date>.md, verbatim
   ├── bounded PRE-WITNESS-01 repair (P1–P8 above; plus any compile fixes, each named)
   ├── source gate + swift test + xcodegen + Xcode compile again → NEW SHA recorded
   └── DEVICE WITNESS under the ratified law (runbook), on the new SHA
```

## 4. Why this is the right first result

The instrumentation was caught reporting success without proving the organism healthy — a cancel timer that timed a function call, a stall fault that left the counter advancing, a replay that accepted any cause string. That is the E18 lesson made operational, before the first device run rather than 69 seconds into one.
