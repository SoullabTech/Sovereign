# Migration Boundary — CANDIDATE

**Act:** ARCH-01 · artifact 4 · 2026-09-11 · **Status:** the four label sets in §1–§4 are **RATIFIED (founder, 2026-09-11)** with one refinement — recognizers, TTS engines, VAD, semantic/acoustic turn models, diagnostics and transport are **ADAPT**: *instruments feeding the runtime, not authorities governing it*. The per-item reconciliation and §5–§6 remain CANDIDATE.

Labels (charter §9): **KEEP** concept and implementation survive · **ADAPT** concept survives, implementation changes · **REPLACE** responsibility survives, owner changes · **REMOVE** the responsibility should no longer exist. The census (§4) proposed dispositions per subsystem; the research (§16) proposed them per responsibility. This artifact reconciles the two into one boundary. Where they differ, the row says so.

**The boundary in one sentence (census §4):** canonical MAIA and the record survive unchanged; the sensory/motor apparatus is rebuilt. Nothing labelled KEEP is voice infrastructure.

---

## 1. KEEP — survives unchanged

| Item | Where today | Why |
|---|---|---|
| Canonical MAIA cognition, routing, memory, relational intelligence, Spiralogic, model orchestration | `lib/maia/*`, `lib/sovereign/*`, the canonical `/list` route | Out of scope by charter §2; D3 |
| The Deep-Intelligence convergence (`handleVoiceTranscript` → `handleTextMessage`) and its gate test | `components/OracleConversation.tsx`; `__tests__/voice-non-degradation.test.ts` | The `CognitionBridge` delivers committed text to exactly this seam; voice keeps the same mind |
| The `commitOracleTurn` seam and its gate | `OracleConversation.tsx`; `__tests__/voice-transcript-commit.test.ts` | Protects the record of MAIA's words independent of TTS; still needed when the synthesizer is an adapter |
| Member/session identity and governed data paths (`x-member-id`, `apiFetch`, Sanctuary rules) | `lib/http/apiBase.ts`, `lib/auth/*` | Unchanged by voice |
| The principle *recognizer segment ≠ member turn* | Repair Two (E20), `lib/voice/turnAccumulator.ts` on its branch | Becomes VOICE-03; the **implementation is not carried** — its re-arm-on-recognition-start is exactly the coupling the constitution forbids (E21 note) |
| The 6 s transcript watchdog concept | `VOICE_TRANSCRIPT_WATCHDOG_MS` | It protects the record, not the audio; remains meaningful under the bridge (census labelled KEEP; research silent — KEEP stands) |
| **Accumulated transcript / turn continuity as a concept** (ratified KEEP) | `accumulatedTranscript`, continuity buffer, salvage-to-draft, Repair Two's fold | The *concept* — the member's words are held across engine boundaries and never silently lost — crosses intact as the turn dimension's custody rule (state model §1, §3). No legacy implementation crosses. |
| **The observational record and witness methodology** (ratified KEEP) | RUNTIME-01 lane doc E-series; CENSUS-01; the witness discipline (deployed ≠ demonstrated; a reading is dated, never edited) | Voice 2026 is built and accepted by the same method: predeclared obligations, on-device witness, both outcomes legitimate |

## 2. ADAPT — concept survives, implementation changes

| Item | Today | Becomes |
|---|---|---|
| Dispatch provenance and the voice diagnostics catalogue | `lib/voice/dispatchProvenance.ts`, `voiceDiagnostics.ts`, `witnessDispatch` at eight send sites | The kernel's structured causal journal (state model §7); one dispatch boundary (`CognitionBridge`), witnessed once |
| Server-side sovereign STT/TTS assets | `maia-whisper`, `/api/voice/transcribe-simple`, Kokoro behind the TTS route | `SpeechRecognizer` / `SpeechSynthesizer` adapters for the sovereign-server profile, **if they benchmark well in BENCH-01**; capture no longer belongs to the caller |
| UI presentation of voice state | `VoiceInteractionBar`, holoflower captions, aura — derived from OC booleans | A projection of `voice.*` events (state model §6) |
| Existing conversation APIs | called directly by `OracleConversation` after its own guards | Reached through `CognitionBridge`; the twelve orchestrator guards become bridge policy with a return channel (census P4 §6.3) |
| Continuity buffer / salvage implementation | `conversationContinuityBuffer`, `salvageTranscript` — web-only today | The concept is KEEP (§1); the implementation becomes kernel turn custody (state model §3); salvage-to-draft remains the abandonment behaviour |
| **Recognizers, TTS engines, VAD, turn models, transport** (ratified ADAPT refinement) | community plugin (owns session+engine+task) · OpenAI/Kokoro route · level thresholds · none | `SpeechRecognizer` / `SpeechSynthesizer` / `TurnInference` / `RealtimeTransport` adapters that **possess evidence, never authority** (authority graph §4) |

## 3. REPLACE — responsibility survives, owner changes

| Responsibility | Today's owner(s) (census) | New owner |
|---|---|---|
| Audio-session ownership | speech plugin (per start) · gatekeeper (repaired build) · WebKit · voice-recorder | `AudioSessionAuthority` |
| Capture ownership | plugin engine + tap, recreated per start | kernel input graph, persistent per session |
| Recognition lifecycle | plugin task, no identity, self-stopping | `SpeechRecognizer` adapter consuming a kernel stream, generation-stamped |
| Turn closure | four armed closers + OC veto | `TurnCoordinator` |
| Output playback | `maiaSpeak` Web Audio graph, no handle | `OutputController` — every stream has an identity and a cancellable lifetime (ruled F3) |
| Interruption policy | raw level threshold flipping flags | `InterruptionController` |
| Recovery logic | ten drivers + two watchdogs + 75 s timer | `HealthSupervisor` → kernel, generation-bounded |
| Routing / health model | none (no observers) | `AudioSessionAuthority` (route) + `HealthSupervisor` (health) as first-class state |
| Native ⇄ web state bridge | `useVoiceSession` handle, `micState` snapshots, `user_tap` relabelling | the command/event contract (authority graph §5) |
| Composer mic (chat-mode capture) | `useVoiceInput` → `capacitor-voice-recorder` + gatekeeper | a bounded capture **grant** from the kernel (VOICE-19, ruled F2: *the composer can still record; it requests capture from the kernel, it does not own another `AVAudioSession` regime*) |
| Spoken-output engine selection | `/api/voice/openai-tts` route, archetype table | `VoiceProviderPolicy` (artifact 5) selecting among allowed adapters |

## 4. REMOVE from the iOS voice path — the responsibility should not exist

| Item | Census / research basis |
|---|---|
| WebKit `SpeechRecognition` as a capture owner (incl. the unguarded post-TTS auto-resume driver, Quick Journal's web SR over voice mode) | P2 D4/F4/F5; P5 #4; research §16, §17 |
| Web Audio / `<audio>` as MAIA's primary output owner on iOS | P3 #8; research §16 |
| The restart-driver family D1–D7 + P1–P4 | P2 §2; census §3.3 |
| Turn closure from recognizer `stopped` (`native_stop`) | P4 site 6 |
| Multiple competing silence timers as closers | P4 §3 |
| The gatekeeper's per-turn session flip (`prepareForSpeaking` / `prepareForListening` / `stopAllAudio`) and `AudioSessionManager.swift`'s teardown model | P1 #13–17; VOICE-04 |
| `VoiceController.swift` (uncompiled) | P1 #18–20 |
| Implicit output → restart chains (`isSpeaking` fan-out) | P2 F9 |
| Watchdogs that restart capture without understanding output/session state (`[voice:watchdog]` 90/120 s, 75 s recovery timer) | P3 #23–24 |
| The `Audio output confirmed` probe | P3 §4 |
| Standing WebKit keep-alive contexts (`ios-audio-session.ts` oscillator, `voice-feedback-prevention.ts` context) | P5 #8–9 |
| The 16-phrase echo list, three overlapping dedup windows, ten engine-side discard sites | P4 §2 (one dedup at the bridge survives as ADAPT) |
| **Optimistic booleans pretending to describe physical microphone state** (ratified REMOVE) | three OC `isListening=true` writers; `isMuted` as "source of truth"; `micState` never rendered (P4 §4c–4d) |
| Any provider fallback that bypasses sovereignty policy — *any cloud fallback invisible to the member or to runtime policy* (ratified wording) | census F1; VOICE-17 (ruled F1) |
| Dormant cloud STT/TTS and dead capture modules (`streamTranscribe.ts` OpenAI/Deepgram, `MaiaRealtimeClientDirect.ts`, `MaiaRealtimeWebRTC`, `ttsWithFallback.ts`, `VoiceMirror`, `WhisperContinuousConversation`, `NativeAudioRecorder`, `MicInputWithTorus`) | P5 §1c; P3 #30 — deletion is a MIGRATE-01 act, not this one |

**Reconciliation notes.** (0) The ratified lists are honoured verbatim: KEEP = canonical MAIA cognition/convergence · `commitOracleTurn` or its semantic equivalent as the cognition boundary · segment ≠ turn · accumulated transcript/turn continuity as a concept · the observational record and witness methodology; REPLACE = audio-session authority · capture · recognition lifecycle · turn commitment · playback/output · route/interruption handling · recovery · authoritative UI voice state; REMOVE = restart-driver family · competing turn timers as independent authorities · Web Speech Recognition on the iOS conversational path · WebView ownership of conversational audio · watchdogs that "recover" by restarting subsystems they cannot observe · optimistic booleans · any cloud fallback invisible to the member/runtime policy; ADAPT = recognizers · TTS engines · VAD · turn models · diagnostics · transport. (i) The census listed the `[voice:watchdog]` under REMOVE and the transcript watchdog under KEEP; the research lists "watchdogs that restart capture" under REMOVE — consistent, both kept. (ii) The census labelled the composer mic REPLACE; the research does not name it; REPLACE stands because chat-mode capture is a member-facing responsibility. (iii) The research adds "implicit output restart/resume chains" as its own REMOVE; folded into the restart-driver row. No disagreements remain.

## 5. Rules of the migration itself

1. **No dual hardware.** At no point do the legacy runtime and `VoiceKernel` both own the microphone or the session on one build. During `MIGRATE-01` exactly one hardware kernel is active per build (research §16). The E19 A/B, by contrast, compares two *builds*, never two owners in one process.
2. **Shadow evaluation is allowed.** One kernel-owned PCM stream may be fanned out to several *read-only* STT/turn adapters for comparison (BENCH-01). Read-only means: no adapter output reaches `TurnCoordinator` or the bridge unless it is the selected adapter.
3. **Feature-gated cutover.** `MIGRATE-01` replaces the `/maia` iOS voice transport behind a gate; the PWA/desktop web path is out of this lane's scope and keeps its current implementation until its own census.
4. **The legacy runtime is not a donor.** Code is not lifted from `ContinuousConversation.tsx`/`OracleConversation.tsx` into the kernel. Principles are (D8).
5. **Deletion follows cutover, not ratification.** REMOVE labels authorize nothing today; the legacy runtime stays frozen as evidence until `MIGRATE-01` is accepted on device.

## 6. Sequence this boundary serves (charter §5, as amended)

`ARCH-01` (this) → `KERNEL-00` → `KERNEL-01` → `BENCH-01` → `BRIDGE-01` → `MIGRATE-01` → `TURN-02` → `DUPLEX-R&D`. Each opens on a founder act; gates-green never opens the next.
