# IOS-CONVERSATION-RUNTIME-01 — Deterministic Speak ↔ Listen Lifecycle

**Status (2026-09-11):** OPENED AS A LANE DOCUMENT — DIAGNOSTIC CAPTURE
PENDING — **NO BUILD AUTHORIZED YET.** Build begins only after the
calibrated Console capture (`VOICE-RECOGNITION-ENGINE-01_LANE.md` §13.4)
names a locus and the founder authorizes exactly one locus-specific repair.
The runtime rebuild described in §3–§4 is this lane's mandate thereafter,
gated by §6 sequencing and §5 acceptance.

Predecessor: `docs/programme/VOICE-RECOGNITION-ENGINE-01_LANE.md` (suspended
at §13). Founder ruling that opened this lane: 2026-09-11, recorded there.

---

## 0 · Governing sentence

> Rebuild the conversation audio runtime and state authority so that MAIA
> always knows whether she is listening, thinking or speaking, and every
> state has a deterministic way out.

Not "fix the mic." Not "patch the timeout." Not the whole iOS app.

## 1 · Why this lane exists — the defect as witnessed

On the iPhone 16 Pro Max (iOS 26.6.1), beta bundle `5846a0824` over native
`73d0df30d` (§12.10 of the predecessor): the member speaks, is transcribed,
MAIA's reply renders as text with no spoken audio, and the microphone does
not return to listening. A tap on the orb does nothing. After roughly
90–120 seconds the app returns to listening — because
`components/OracleConversation.tsx` (`[voice:watchdog]`, ~line 2869) forces
a reset after `AUDIO_STUCK_TIMEOUT_MS = 90000` / `PROCESSING_STUCK_TIMEOUT_MS
= 120000`, not because anything recovered. The symptom family predates the
predecessor lane (prior voice-loop testing; an August 30 engineering note on
a response completing without audio and the consequences for re-arming).
Attribution to any single changed surface is unresolved.

Founder's reading: *too many layers each doing something reasonable
locally, with no single component owning the whole turn.* JS, TTS
playback, the community speech-recognition plugin and the native
`AudioSessionManager` each take decisions about the audio session and the
microphone lifecycle.

## 2 · Target

```text
HUMAN SPEAKS
    ↓
LISTENING
    ↓
TURN CLOSES
    ↓
MAIA THINKS
    ↓
MAIA SPEAKS
    ↓
SPEECH ENDS
    ↓
LISTENING

EVERY TIME
```

**There must be no legitimate state in which the app waits indefinitely for
an event that might never arrive.**

## 3 · Invariants (founder, 2026-09-11)

1. **One owner of audio-session transitions.** JS, TTS, community
   recognition and native recognition cannot independently decide
   microphone / audio-session lifecycle.
2. **Explicit states, not inferred states.**

   ```text
   idle
   listening
   closing_turn
   thinking
   preparing_to_speak
   speaking
   rearming
   listening
   ```

3. **Every transition has success, failure and timeout.** If TTS produces
   no audio: `speaking requested → TTS fails / silent / no completion event
   → bounded timeout → rearm listening anyway`.
4. **`prepareForListening()` and `prepareForSpeaking()` are idempotent.**
   Calling either twice cannot strand the audio graph.
5. **The orb remains sovereign.** If the system believes MAIA is still
   speaking and the member taps the orb, the member's explicit act must be
   capable of forcing a lawful re-entry to listening — not "ignore the tap
   until a stale timeout expires."
6. **TTS completion is not the sole authority for microphone re-entry.**
   (Directly responsive to the witnessed symptom.)
7. **Runtime telemetry describes the transition.** For every turn:

   ```text
   speaking requested
   audio session configured
   playback began / did not begin
   playback ended / timed out
   rearm requested
   audio session configured for record
   recognizer started
   first audio buffer received
   first transcript produced
   ```

   Then these bugs stop being séance work.

## 4 · Architecture geometry (long-term)

```text
                 MAIA Conversation
                        │
                        ▼
              ConversationAudioCoordinator
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
      TTS OUTPUT                 MIC CAPTURE
          │                           │
          │                    RecognitionEngine
          │                    baseline / modern
          └─────────────┬─────────────┘
                        │
                 AVAudioSession
                 ONE AUTHORITY
```

The community speech plugin (`@capacitor-community/speech-recognition`) may
remain as a temporary fallback during migration; it must not remain a
second owner of the audio lifecycle. The predecessor's engine-neutral
`RecognitionEngine` boundary and `lib/voice/recognition/humanTurnAuthority.ts`
(sole owner of human turn `open|complete`) carry forward unchanged in
role: `TURN CLOSES` in §2 is that authority, not recognizer finality.

## 5 · Acceptance — brutal, before the rebuilt runtime replaces anything

```text
20 consecutive ordinary turns
10 deliberate long pauses
10 silent/failed-TTS simulations
10 rapid orb re-entries
background → foreground
phone lock → unlock
ringer mute / unmute
Bluetooth connect / disconnect
TTS → mic transition repeatedly
mic → TTS transition repeatedly

ZERO stranded states
ZERO "wait and it eventually fixes itself"
ZERO Kelly rescue
```

Same-device, relayed, recorded here with the two-layer header
(`NATIVE SUBJECT` / `WEB BUNDLE`) inherited from the predecessor §12.7.
Then — and only then — the SpeechAnalyzer comparison
(`VOICE-RECOGNITION-ENGINE-01` Probe / A-B) resumes.

## 6 · Sequencing (each step a STOP on failure; each build step needs its own ruling)

1. **Calibrated capture** — predecessor §13.4: positive control, reproduce,
   three taps, read A/B/C/D. No source change. Output is this lane's first
   evidence entry (§9).
2. **Exactly one locus-specific repair**, authorized by founder ruling on
   the capture. Bounded to the locus the capture names. Witnessed by the
   same S1–S4 walk. Not a mitigation that masks the failure (the watchdog
   shortening is explicitly deferred — §8).
3. **Runtime rebuild** per §3–§4: coordinator + explicit state machine +
   telemetry. Scope and file plan authored as §7 before any code.
4. **Acceptance** per §5.
5. **Resume the predecessor witness** (Probe / A-B) on the rebuilt runtime.

## 7 · Surfaces (map, not a plan — plan is authored at step 3)

| layer | surface | role today |
|---|---|---|
| web | `components/OracleConversation.tsx` — voice state, `handlePlaybackSignal`, `[voice:watchdog]` | inferred states, watchdog recovery |
| web | `lib/voice/AudioSessionManager.ts` (`VoiceController.prepareForListening/Speaking`) | JS-side caller of native transitions |
| web | `lib/audio/ttsWithFallback.ts`, streaming voice playback | TTS playback; completion signals |
| web | `@capacitor-community/speech-recognition` binding (live mic) | second owner of the session today |
| native | `ios/App/App/AudioSessionManager.swift` | session category / activation / full teardown |
| native | `ios/App/App/VoiceController.swift`, `ios/App/App/Recognition/*` | engine-neutral recognition boundary (predecessor) |
| contract | `lib/voice/recognition/humanTurnAuthority.ts` | human turn `open|complete` — unchanged |

## 8 · Held, deferred, not authorized

- **Watchdog resilience ruling** — 90–120 s is too long for a
  conversational product even after the root cause is fixed; separate
  ruling later; not now, because shortening it before the locus is known
  masks the failure.
- **Web mitigation (re-arm on playback failure)** — same reason.
- **Native revert of the predecessor's `AudioSessionManager.swift` edit** —
  unattributed; not authorized.
- **Production recognition routing / `legacy_until_witnessed`** — unchanged.
- **Any new diagnostic surface** — P12 stands; telemetry in §3.7 is
  runtime logging, not a page.

## 9 · Evidence log

*(empty — awaiting the calibrated capture, predecessor §13.4)*

## 10 · Governance

- **Deep-Intelligence Gate** applies: this lane changes the capture and
  speech path; it may not change the mind. Spoken and typed turns converge
  where `__tests__/voice-non-degradation.test.ts` pins them.
- **Sovereignty check**: §3.5 is the agency invariant — the member's act
  outranks the system's belief about its own state. No feature in this lane
  may make the orb less responsive to the member than it is today.
- **Claim discipline**: nothing in this document is Live. §2–§5 are Design.
