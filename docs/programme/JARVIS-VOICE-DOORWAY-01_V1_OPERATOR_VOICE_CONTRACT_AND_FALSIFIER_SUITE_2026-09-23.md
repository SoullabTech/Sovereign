# JARVIS-VOICE-DOORWAY-01 — V1 · Operator Voice Contract Ratification + Falsifier Suite

**Authorized by:** founder continuation act 2026-09-23 (*"V1 remains documentary/test-contract work only"*). **Direction ratified by the founder in that act:** push-to-talk first · local Whisper only at `127.0.0.1:8080` · local Kokoro only at `localhost:8880` · **speech off by default** · no cloud fallback · wake phrase "Jarvis" deferred until a genuine local keyword-spotting system is evidenced · the real voice implementation waits for B6 so typed and spoken input share the live O1 `compileIntent` seam. **Standing: V1 DELIVERED · contract `jarvis-operator-voice.v1` RATIFIED AS TEST CONTRACT · ⛔ V2 NOT OPEN.**

## 1 · What landed

`tests/constitutional/voice-doorway/contract.mjs` — the contract typed at the boundary (states · endpoints as constants · the ten laws) and a **conforming reference double** (pure over injected `stt` · `tts` · `seam` · `player`; ⛔ no audio, no Electron, no IPC; ⛔ never a seed for V2) · `candidates.mjs` — ten defeat candidates DC-V1…DC-V10 · `matrix.mjs` — V-F1…V-F10 + static guard V-S1. `npm run matrix:voice-doorway`.

## 2 · Laws and results

| Law | Holds when | Defeat candidate | Result |
|---|---|---|---|
| V-F1 identity | voice(s) and typed(s) yield deep-equal seam objects | DC-V1 voice-only tidy-up | DEAD (+ classified collateral V-F5: a voice-only transform also diverges "Jarvis, run it") |
| V-F2 loopback STT constant | STT endpoint owned by the doorway; renderer cannot point it elsewhere | DC-V2 renderer-supplied endpoint (OpenAI) | DEAD |
| V-F3 no retention | frames held after transcription = 0 | DC-V3 debug retention | DEAD |
| V-F4 fail-closed TTS | Kokoro down → `voice unavailable`, text kept, no fallback; STT down → "type instead", text path intact | DC-V4 `speechSynthesis` fallback | DEAD |
| V-F5 no voice-only authority | the seam is the only sink | DC-V5 "Jarvis, run it" grammar | DEAD |
| V-F6 indicator from frames | `listening` only after a received frame | DC-V6 indicator from button | DEAD |
| V-F7 blank audio never submitted | `[BLANK_AUDIO]`/empty → nothing heard | DC-V7 submits blank | DEAD |
| V-F8 interruptible | Escape or a new gesture stops playback now | DC-V8 queued playback finishes first | DEAD |
| V-F9 speech off by default | first `speak()` → `speech off`, no TTS call | DC-V9 on by default | DEAD |
| V-F10 no wake | loud frames never open capture | DC-V10 energy-spike wake | DEAD |
| V-S1 static guard | `jarvis-desktop/src/**` carries no cloud speech host and no browser speech API | — | PASS (0 hits; vacuous today, binding on V2) |

Reference: 0 violations. **Matrix LETHAL + DISCRIMINATING (exit 0).** Typecheck strict `checkJs` exit 0.

## 3 · What V1 fixes for V2 (binding), and what it does not

Binding: the doorway owns both endpoint constants; the transcript enters **the same function the textarea feeds** (today `submitOperatorIntent` → `OF.buildTask`; after B6 `compileIntent`) — V2 opens only after B6 per the founder's act; capture opens on a founder gesture only; frames are discarded after transcription; speech is opt-in per session; two invoke verbs at most under the five-question preload law (`jarvis:voice-utterance` · `jarvis:speak`) plus a media-only permission handler for the app's own `file://` origin.

Not fixed here (VD-1…VD-4 carried from V0, plus): **VD-5** the Mac Studio whisper-server log is a possible transcript-retention channel until proven otherwise (V0 §Q9) — V2 must bound it. **VD-6 (from the founder's cross-surface direction):** browser voice comes later through a governed secure bridge to the sovereign host, ⛔ never through browser or cloud speech services — recorded in the OE charter amendment, not designed here.

## 4 · Not done

No microphone, STT or TTS activated · no Desktop file · no IPC · no worklet · no wake word · ⛔ V2 not open.
