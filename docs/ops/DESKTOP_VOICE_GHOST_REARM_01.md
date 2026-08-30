# DESKTOP-VOICE-GHOST-REARM-01

**Class:** authorship / voice authority
**Candidate:** `1c2c59af9` — DEVICE-witnessed 2026-08-30, pinned two-origin loopback witness
**Ruling:** candidate NOT ACCEPTED · DO NOT PACKAGE

**Findings only.** This document establishes what is known. It does not design a
repair, name a signal, or choose a threshold — see §6.

---

## The central finding

> **No authority allowed the ghost transcript; the architecture never asked the
> authorship question.**

The causal distinction, kept exact:

```
nothing failed open
no suppression rule malfunctioned
sameAsPrevious did what it was designed to do
Whisper returned non-empty text
the architecture treated non-empty model output as sufficient
  evidence of member speech
the missing thing is an authorship question, not a broken
  existing authority
```

No guard was bypassed, no check regressed, no condition evaluated wrongly. The
path from "a model returned characters" to "the member said this" contains no
point at which authorship is interrogated. The defect is an absence, not a
malfunction — which is why it survived review, and why it cannot be closed by
repairing anything that already exists.

---

## 1. DEVICE

Witnessed on candidate `1c2c59af9`, both origins pinned to `http://127.0.0.1:3105`,
`source=override` confirmed before speaking.

```
legitimate long turn                 PASS
  32.749 s captured
  278-char final transcript
  tail "marigold" survived
  MAIA responded to the real turn

member then said nothing
  automatic re-arm occurred
  ~2.1 s capture → 3-char transcript "You"
  "You" dispatched as member speech
  second ~1.5 s capture → same 3-char result
  sameAsPrevious = true
  duplicate still dispatched
```

Each ghost dispatch produced a MAIA response, which completed, which re-armed
capture, which produced another ghost. The cycle was self-sustaining.

**Speaker feedback is ruled out.** Every TTS attempt explicitly returned no
audio, and re-arm occurred only after `all_tts_done`. There was no sound present
for the microphone to capture from MAIA.

---

## 2. SOURCE

Read at `1c2c59af9`. Each line is sourced; none is inferred.

- **Re-arm after an accepted voice turn is intentional.**
  `components/OracleConversation.tsx:6682` — *"accepted voice turn — the mic may
  re-arm after the response. Set AFTER the feedback/duplicate guards."* The
  re-arm following the legitimate 32.7 s turn was the consent model working as
  designed.

- **The sovereign recorder uses RMS only to decide when recording ends.**
  `lib/voice/androidVoiceFallback.ts:43` defines `SILENCE_RMS_THRESHOLD`; its only
  use is `if (rms >= SILENCE_RMS_THRESHOLD) lastLoudAt = now;` — a stop-timing
  input. The signal is computed and then discarded.

- **There is no positive speech prerequisite before transcription.** A capture
  that never crossed the threshold is still uploaded to
  `/api/voice/transcribe-simple`.

- **A non-empty Whisper result is sufficient to reach dispatch.** Three call
  sites in `components/voice/ContinuousConversation.tsx` — `:1263` `fallback`,
  `:2819` `android_fallback`, `:3503` `web_whisper` (the path in the trace) —
  each guard on `result.ok && result.transcript` and then call `witnessDispatch`
  and `onTranscript`. Non-empty is the whole test.

- **`sameAsPrevious` is observational telemetry, not suppression authority.**
  `lib/voice/dispatchProvenance.ts:29` — *"`sameAsPrevious` is REPORTED, never
  acted on."* The second ghost was correctly labelled a duplicate and dispatched
  anyway, because the label was never wired to a decision.

### Corroboration from timing alone

`recordWithSilenceDetection` stops when
`elapsed >= minMs (800) && silenceFor >= silenceHoldoffMs (1500)`, where
`silenceFor = now - lastLoudAt`. The two ghost captures therefore describe
themselves:

| capture | reading |
|---|---|
| **~1.5 s** | `lastLoudAt` never updated — no sample crossed the threshold. Stop fires at exactly `silenceHoldoffMs`. |
| **~2.1 s** | `lastLoudAt` updated once at ~594 ms, then never again. |

This corroborates that no sustained member speech occurred, from durations
alone, without reference to the audio.

---

## 3. RULING

- **#1150 did not create the defect; it exposed it.** Before the response-shape
  repair, every sovereign-whisper transcript was discarded as `empty_transcript`
  — ghosts along with everything else. The path had to start working before the
  missing question could matter.

- **Web Speech previously supplied an implicit no-speech property.** Its VAD
  returned *no result at all* for a silent room. The guarantee existed, but it
  lived in the browser and was never written down, because it never had to be.

- **The sovereign Whisper transport removed that implicit property without
  replacing it with an explicit authorship gate.** Whisper always returns text.
  The transport swap silently dropped a safety property that no line of our code
  had ever been responsible for holding.

- **Non-empty model output is not proof that the member spoke.**

---

## 4. UNRESOLVED

- Whether the captured stimulus was near-silence, ambient sound, or another
  restart/capture artifact. The authority defect is identical under all three,
  so this does not block adjudication — but it is not established.
- The exact repair design. See §6.

---

## 5. HELD

Explicitly refused as approaches, each because it either fails on a member's
real words or conceals this instance without answering the authorship question:

```
no blacklist for "You"
no minimum transcript-length heuristic          ("Hi" is valid speech)
no generic hallucination list
no sameAsPrevious suppression presented as the authorship fix
no disabling hands-free merely to hide the defect
no packaging of 1c2c59af9
```

---

## 6. Why no remedy is designed here

The likely repair surface is visible — the recorder already computes the signal
that authorship would need — but naming it here would fix a design before its
preconditions are known. Two censuses must precede any repair:

1. **What signal evidence `recordWithSilenceDetection()` can truthfully export.**
   What the analyser actually observes, at what sampling rate, with what
   quantisation, and what that permits us to claim honestly about a capture.
2. **What existing tests already constrain.** The sovereign capture suites carry
   assumptions about this function's contract; a change to what it returns may
   be constrained, or already contradicted, by proofs that exist.

Until both are done, any threshold would be a number chosen ahead of its
evidence.

**Separately noted, not part of this repair:** Desktop initialises
`listeningModeRef = HANDS_FREE` and `handsFreeActiveRef = true`, while nearby
comments still describe push-to-talk as the default. That contradiction deserves
adjudication as a policy question in its own unit. A default-mode migration must
not ride in on an authorship correctness fix.

---

## 7. Evidence state

```
#1150 response reader       DEVICE PASS / CLOSED
Desktop short turn          DEVICE PASS
Desktop >12 s turn          DEVICE PASS
120 s ceiling               DEVICE PASS
ghost re-arm authorship     DEFECT — open, remedy not designed
Desktop whole candidate     NOT ACCEPTED
1c2c59af9                   DO NOT PACKAGE
```
