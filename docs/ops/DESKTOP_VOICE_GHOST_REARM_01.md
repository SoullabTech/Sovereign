# DESKTOP-VOICE-GHOST-REARM-01

**Class:** authorship / voice authority
**Candidate:** `1c2c59af9` — DEVICE-witnessed 2026-08-30
**Ruling:** candidate NOT ACCEPTED · DO NOT PACKAGE

> A non-empty model transcription is not sufficient evidence that the member spoke.

---

## 1. What happened on the device

The pinned two-origin witness (`MAIA_PLATFORM_ORIGIN` and `MAIA_BASE_URL` both
`http://127.0.0.1:3105`, `source=override`, worktree at `1c2c59af9`) passed every
objective it was built to test, and then authored words the member did not say.

```
PASSED
  short turn                     mic → sovereign-whisper → real transcript → turn
  long turn                      32.749 s · 278 chars · final tail survived
  120 s ceiling                  active; the old ~8 s truncation is gone
  readTranscript()               delivered real Whisper transcripts  (#1150)

FAILED
  post-turn re-arm               captured a room in which nobody spoke
  authorship                     Whisper returned "You" → dispatched as member speech
  duplicate                      sameAsPrevious:true → dispatched again
```

### The observed cycle

```
legitimate member turn
      ↓
MAIA responds        (no TTS audio produced on any attempt)
      ↓
hands-free re-arms   on all_tts_done → requestRestart('maia_stopped_speaking')
      ↓
~2 s capture, no member speech attested
      ↓
Whisper returns "You"
      ↓
non-empty transcript == accepted as authorship
      ↓
ghost member turn → MAIA responds → re-arm → "You" again → dispatched again
```

**Speaker feedback is ruled out.** Every TTS attempt explicitly returned no
audio, and re-arm occurred only after `all_tts_done`. There was no sound for the
microphone to capture from MAIA.

---

## 2. What the durations prove on their own

`recordWithSilenceDetection` stops when
`elapsed >= minMs (800) && silenceFor >= silenceHoldoffMs (1500)`, where
`silenceFor = now - lastLoudAt`. The two ghost captures are therefore
self-describing:

| capture | reading |
|---|---|
| **1.503 s** | `lastLoudAt` never updated. Not one sample crossed `SILENCE_RMS_THRESHOLD`. Stop fires at exactly `silenceHoldoffMs`. Pure silence. |
| **2.094 s** | `lastLoudAt` updated once at ~594 ms, then never again. One 100 ms blip, then silence. |

This is independent corroboration that no member speech occurred, derived from
timing alone — no audio required.

It also **rules out the obvious repair**: a boolean `speechObserved` set by any
single threshold crossing would have refused the 1.503 s ghost and admitted the
2.094 s one. One ambient blip satisfies it. The evidence must be voiced
*duration*.

---

## 3. The source chain (all at `1c2c59af9`)

Every link is sourced. No step is inferred.

**1. Re-arm after the long turn was correct by design.**
`components/OracleConversation.tsx:6682` — *"accepted voice turn — the mic may
re-arm after the response. Set AFTER the feedback/duplicate guards."* A
legitimate voice turn grants re-arm. That is the consent model working.

**2. Nothing asks whether speech actually occurred.**
`lib/voice/androidVoiceFallback.ts:43` defines `SILENCE_RMS_THRESHOLD`; its
*only* use was `if (rms >= SILENCE_RMS_THRESHOLD) lastLoudAt = now;` — deciding
**when to stop**, never **whether anything was said**. The VAD computed the exact
signal authorship needed and discarded it. A capture that never crossed the
threshold was still POSTed to Whisper.

**3. Dispatch had no dedupe authority, deliberately.**
`lib/voice/dispatchProvenance.ts:29` — *"`sameAsPrevious` is REPORTED, never
acted on."* So `sameAsPrevious:true` followed by dispatch is not a guard
failing. It is a field that was never a guard.

**No guard failed. No guard was ever asked.**

---

## 4. The structural cause

Web Speech had VAD: a silent room produced **no result at all**. The gate existed,
but it lived in the browser. Whisper always returns text. Moving to the sovereign
path removed an implicit safety property that had never been written down,
because we had never had to write it.

**#1150 did not cause this — it exposed it.** Before the response-shape repair,
every whisper transcript was discarded, ghosts included. The path had to start
working before the missing gate could matter.

---

## 5. The repair

A mechanical rule at the capture/authorship boundary:

> A sovereign capture that never observed positive speech evidence cannot become
> a member turn, regardless of what Whisper returns.

**Deliberately NOT used** — each fails on a member's real words or merely masks
this instance:

- minimum transcript length (`"Hi"` is valid speech)
- blacklisting `"You"`
- generic Whisper hallucination lists
- disabling hands-free
- suppressing `sameAsPrevious` alone

**Implemented** in `lib/voice/androidVoiceFallback.ts`:

```
RecordingOutcome { blob, voicedMs }   the VAD's own evidence, kept not discarded
voicedMs                              accumulates VAD_POLL_MS per threshold crossing
MIN_VOICED_MS = 200                   two samples — one blip cannot satisfy it
                                      refusal reason: 'no_speech_observed'
```

`lastLoudAt` is left seeded to `Date.now()` — it is correct for stop timing and
useless as evidence, and changing it would alter stop behaviour. `voicedMs`
starts at zero and counts only readings that actually crossed the threshold.

### Why the gate is in the producer, not the call sites

Three call sites in `components/voice/ContinuousConversation.tsx` each guard on
`result.ok && result.transcript` before `witnessDispatch` and `onTranscript`:

```
:1263  fallback
:2819  android_fallback
:3503  web_whisper          ← the path in the trace
```

Refusing inside `recordAndTranscribe` makes all three safe by construction, and a
fourth call site added later inherits the refusal without having to remember it.

### Why the refusal is placed before the upload

Strictly earlier than dispatch was required; earlier than the network was
available for free. A capture that never heard a member is not the member's
audio, so it does not leave the device at all — the same rule the revocation gate
already enforces, applied to a capture that was never authored rather than one
whose authority was withdrawn.

---

## 6. Regression witness

`lib/voice/__tests__/ghostRearmAuthorship.test.ts` drives the analyser tick by
tick, reproducing both device captures:

| case | pattern | expected |
|---|---|---|
| pure silence (1.503 s ghost) | 20 quiet ticks | refused · `no_speech_observed` |
| silent capture never uploaded | 20 quiet ticks | `fetch` not called |
| single blip (2.094 s ghost) | 5 quiet · 1 voiced · 20 quiet | refused · `fetch` not called |
| short real utterance | 3 voiced · 20 quiet | admitted · `"Hi"` returned |
| sustained speech | 20 voiced · 20 quiet | admitted, unchanged |
| distinct reason | 20 quiet | not `empty_transcript`, not `empty_blob` |

The **single blip** case is the load-bearing one: it is the negative control for
the repair we did not make. The **short utterance** case is the calibration
guard — if raising `MIN_VOICED_MS` ever turns it red, the floor went too far, and
the two ghost cases must not be relaxed to compensate.

---

## 7. Evidence state

```
#1150 response reader       DEVICE PASS / CLOSED
Desktop short turn          DEVICE PASS
Desktop >12 s turn          DEVICE PASS
120 s ceiling               DEVICE PASS
ghost re-arm authorship     DEFECT — repaired in source, TEST pending run
Desktop whole candidate     NOT ACCEPTED
1c2c59af9                   DO NOT PACKAGE
```

---

## 8. Deliberately out of scope

**Not established, and not needed for this repair:** whether Whisper hallucinated
`"You"` from true silence or misrecognised a faint ambient sound. The authority
defect is identical either way, and the repair does not depend on the answer.

**Routed separately — do not fold into this unit:** Desktop initialises
`listeningModeRef = HANDS_FREE` and `handsFreeActiveRef = true`, while nearby
comments still describe push-to-talk as the default. That contradiction deserves
adjudication as a policy question. Mixing a default-mode migration into an
authorship repair would make both harder to review and would let a policy change
ride in on a correctness fix.
