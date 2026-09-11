# KERNEL-00 Acceptance Law — CANDIDATE

**Act:** ARCH-01 · artifact 6 · 2026-09-11 · **Status:** CANDIDATE. Becomes law by founder act; `KERNEL-00` itself opens by a **separate** founder act after ratification.

`KERNEL-00` is the first code of Voice 2026: the **physical audio organism**, and nothing else. It exists to prove that one native owner can keep a duplex-capable session alive through listening, playback, cancellation, route changes, interruptions, media-services resets and long sessions, without a manual microphone tap and without any recognizer, synthesizer, model, WebView audio, or MAIA in the build.

The law follows FR-14's discipline (JARVIS-CIRCLES-01): *PASS = 0 failed AND every named obligation present AND discharged by PASS only.* WARN, SKIP and MISSING never discharge. The named set is the law; the count is descriptive.

---

## 1. Scope

**In the build:** `VoiceKernel` (actor) · `AudioSessionAuthority` · a duplex `AVAudioEngine` graph with voice processing (or, if it fails K00-11, the lower Voice I/O path — research §20.1) · `HealthSupervisor` · `StateProjection` · the flight recorder · a test harness page (`/voice-kernel-test`, native) with: Start · Stop · Play known PCM · Cancel · inject faults · show the three-dimension state and generation.

**Not in the build (each is a falsifier if present):** any STT (`SFSpeechRecognizer`, `SpeechAnalyzer`, whisper, …) · any TTS model · any LLM or call to canonical MAIA · WebKit `SpeechRecognition`, `getUserMedia`, Web Audio or `<audio>` on the harness page · `@capacitor-community/speech-recognition` · `AudioSessionManager.swift` / `VoiceController.swift` · any restart driver from the legacy runtime · any network egress.

**Where:** on the founder's device, Xcode Run (Debug) with the console attached, so the flight recorder and the native log are one witness. Both outcomes — *the organism holds* and *the organism does not hold* — are legitimate results; the record takes whichever happens.

## 2. Obligations (the named set)

| ID | Obligation | Falsifier (what FAIL looks like) | Gate |
|---|---|---|---|
| K00-01 | **One session owner.** Only `AudioSessionAuthority` mutates `AVAudioSession` in the KERNEL-00 target and its linked pods. | any other mutation site in source; any second writer in the journal | S + D |
| K00-02 | **One entry, one exit.** `enterConversation()` establishes the session once; `leaveConversation()` releases it once; the journal shows exactly one activation and one deactivation per session. | extra activations/deactivations; a session left active after leave | D |
| K00-03 | **Zero configuration mutations during the conversation.** Across the whole run, no category/mode/options/preferred-rate change occurs between enter and leave except an act stamped `route_recovery` or `interruption_recovery`. | any unstamped mutation | D |
| K00-04 | **Input flow is observable and healthy.** Input callback cadence, frame counts and RMS/peak are journalled; `inputFlow` reaches `healthy` after enter and stays there through every listen/play cycle absent an injected fault. | cadence gaps or `unknown` persisting past the entry window | D |
| K00-05 | **Known PCM renders through native output and is cancellable by handle.** Every play yields a handle; a cancel stops rendering within the cancel window; `outputFlow` shows `rendering → idle`. | play without handle; frames rendered after the window; `outputFlow` stuck | D |
| K00-06 | **Duplex holds.** While PCM renders, input callbacks continue with plausible energy (not digital zero) and voice processing keeps the rendered signal out of the input beyond the residual tail. | input dies during output; input mirrors output beyond tolerance | D |
| K00-07 | **Dead input is detected.** With the harness injecting digital-zero input frames, `HealthSupervisor` marks `inputFlow = dead` within the detection window and requests recovery. | `healthy` persists; no request; detection late | D |
| K00-08 | **Stalled output is detected.** With the harness stalling the render callback, `outputFlow = stalled` within the window and recovery is requested. | as above | D |
| K00-09 | **Recovery is generation-safe.** Every recovery increments the generation; callbacks from the previous generation (the harness holds and fires one late) are journalled and dropped and change nothing. | a stale callback stops/starts/reconfigures anything | D |
| K00-10 | **Recovery is bounded.** Under a persistent injected fault, attempts follow the declared schedule, stop at the budget, and end in `degraded` with the cause displayed on the harness; no further attempts occur. | attempts beyond budget; schedule violated; no visible degraded state | D |
| K00-11 | **Route change survives.** Switching speaker ↔ receiver ↔ Bluetooth (HFP and A2DP) during a cycle produces a `route_changed` record, an `AudioSessionAuthority` act, and `inputFlow`/`outputFlow` back to healthy without a manual tap. | a manual tap needed; flow dead after the switch; unstamped mutation | D |
| K00-12 | **Interruption survives.** An incoming call / Siri / another app's audio produces `audioSession = interrupted` then `active`, with flow restored without a manual tap. | as above | D |
| K00-13 | **Media-services reset survives.** A simulated or real reset produces `resetting → active` and a rebuilt graph under a new generation, flow restored. | flow dead after reset; old generation still live | D |
| K00-14 | **Background / lock policy is explicit.** Lock and background events produce the declared behaviour (hold or release, per the policy chosen for KERNEL-00) and the journal says which. | undeclared behaviour; session silently lost | D |
| K00-15 | **Long session.** The organism completes the endurance run (§3) with zero manual taps, zero unstamped mutations, zero unbounded loops. | any one | D |
| K00-16 | **Nothing else is in the build.** The exclusion list in §1 holds. | any excluded thing linked or reachable | S |
| K00-17 | **The trace replays.** The run's journal replays into the state machine (`03_STATE_MODEL.md` §2) with no orphan transition and answers *what observation caused this act, and which generation* for every automatic act. | an orphan; an unanswerable act | D |
| K00-18 | **The UI is a projection.** The harness page shows only `voice.*` event state; it holds no local voice state; it never displays "listening" without `inputFlow = healthy`. | a local state write; a display not traceable to an event | S + D |

## 3. Thresholds — PROPOSED, ratified with this law

| Parameter | Proposed value | Rationale |
|---|---|---|
| Entry window (enter → `inputFlow = healthy`) | ≤ 1 500 ms | covers session activation + voice-processing engine start; measured, not tuned |
| Dead-input detection window (K00-07) | ≤ 2 000 ms of digital zero | E18's condition was discovered ~69 s late; two seconds is the first number that makes VOICE-08 real without false alarms on a quiet room (noise floor ≠ digital zero — SURVEY-01 §8's three-way classification) |
| Stalled-output detection window (K00-08) | ≤ 1 000 ms without a render callback while `rendering` | |
| Cancel window (K00-05) | ≤ 100 ms from `cancel(handle)` to last rendered frame | |
| Recovery schedule (K00-10) | budget 3 attempts per fault class per 60 s; backoff 500 / 1 000 / 2 000 ms; then `degraded` | replaces the legacy 800/1500/2500 with a real ceiling; values are policy, not scattered literals |
| Endurance run (K00-15) | 60 minutes · ≥ 50 listen/play cycles · ≥ 3 route changes · ≥ 2 interruptions · 1 reset | research §14.5 uses 60 min / 100 turns for the *full* organism; KERNEL-00 has no turns, so cycles stand in |
| Duplex residual (K00-06) | rendered signal in input ≤ the level the harness declares as its echo tolerance, with the residual-tail gate ≤ 800 ms | SURVEY-01 §2 reports a 500–800 ms AEC tail; the number is measured on device, not assumed |

Any threshold changed after ratification is a founder act with a recorded reason; a threshold is never loosened to make a run pass.

## 4. Fault-injection matrix (harness controls)

| Fault | Obligations exercised |
|---|---|
| return digital-zero input frames | K00-07, K00-09, K00-10 |
| stall the render callback | K00-08 |
| hold a callback and fire it after a recovery | K00-09 |
| persistent fault (never clears) | K00-10 |
| remove / reinsert Bluetooth route; switch speaker/receiver | K00-11 |
| incoming call / Siri / other-app audio | K00-12 |
| media-services reset (`AVAudioSession.mediaServicesWereResetNotification`, simulated where the OS allows) | K00-13 |
| lock / background / foreground | K00-14 |
| suspend/resume app; reload the harness page | K00-14, K00-18 |

STT/TTS/transport faults (research §14.6) belong to KERNEL-01 and BENCH-01; they are listed there, not here.

## 5. Pass rule and record

- **PASS** = every K00 obligation present in the run's checklist and discharged by PASS; 0 FAIL; 0 WARN; 0 SKIP; thresholds as ratified; journal attached.
- Any FAIL is recorded with its journal excerpt and adjudicated on what failed. *Repair versus redesign is decided then, never pre-chosen* (the CIRCLES rule applies here too).
- K00-11's Voice-I/O fallback: if the `AVAudioEngine` voice-processing path cannot pass K00-06 or K00-11, the run is recorded as FAIL on that path and a second run on the lower path is a **new** witness, not a retry.
- The record is `docs/programme/VOICE-2026/KERNEL-00_WITNESS_<date>.md`: build identity (native SHA, Xcode, iOS version, device), the checklist, thresholds used, journal, founder attestation. Deployed ≠ demonstrated; a kernel verified only by its author's tests is a claim about code, not about the organism.

## 6. What KERNEL-00 acceptance does not license

It does not select a recognizer or synthesizer, does not open `KERNEL-01` (founder act), does not touch `/maia`, and does not make any claim about MAIA's voice being "fixed". It proves one thing: *one owner can keep the physical organism alive.* Everything else is built on that proof or not at all.
