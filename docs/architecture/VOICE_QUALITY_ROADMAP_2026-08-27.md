# Voice Quality Roadmap — 2026-08-27

**Governing ruling (Kelly, 2026-08-27):**

```
DEFAULT / AUTO      local sovereign voice
EXPLICIT CLOUD      only under explicit permitted choice
CLOUD AS DEFAULT    NOT AUTHORIZED

Local voice must become fast enough for natural conversation,
perceptually acceptable as MAIA, and free of code/markup leakage.
```

Cloud-primary is not the fix for a slow local stack. It is the thing we do
only if local demonstrably cannot meet the bar — and then as a conscious canon
amendment, not by backing into it.

---

## Where we are

Three distinct defects were separated today. They are independent; none is a
cause of another.

| Defect | Mechanism | Evidence | Status |
|---|---|---|---|
| MAIA speaks code aloud | SSML built from raw text; `ttsRouter` prefers `ssml ?? text`, discarding the sanitized string | OBSERVED in source + runtime | PR #1115, in CI |
| Mic dies after MAIA speaks | one 302ms recognition end classified as an infinite abort loop → capture loss → `MicState ERROR` | OBSERVED in production log | fix written, awaiting canonical |
| Voice slow and robotic | unknown — `n=1` | one turn: 6,911ms synthesis | unmeasured |

---

## Stage 1 — Correctness: Kokoro never speaks code

**Owner:** PR #1115 (head `8be9e648`).
**Acceptance:** Kokoro cannot receive unsanitized MAIA speech, whichever
upstream representation supplied it — plain text or SSML.

The enforcement point is the Kokoro provider, because it is the last boundary
both representations pass through. The route pass is a non-destructive,
idempotent shim delegating to the shared sanitizer; it survives only so that
non-Kokoro paths (cloud, PersonaPlex) are not left raw, and disappears once
every synthesizer boundary enforces the invariant itself.

Gate: required CI green, fresh canonical read immediately before merge.

## Stage 2 — Reliability: one benign abort cannot end a conversation

**Ready:** rapid-end policy + `ContinuousConversation` integration, to be
rebranched alone from post-#1115 canonical.

**Root cause:** the same handler already tolerated ten rapid *restarts* before
declaring a loop, while the *abort* path declared one on the first occurrence.
That asymmetry was the defect. Restarting the mic the instant MAIA stops
speaking is exactly what produces a benign rapid abort, so the most ordinary
moment in a conversation was the one most likely to end it.

**Acceptance:** a single sub-500ms end recovers with a fresh instance; three
consecutive ones still stop and tell the member.

**Explicitly not in scope:** the second restart authority
(`OracleConversation.tsx` schedules its own `startListening` 300ms after
playback). The mic-state guard is observed to block it and it was never shown
to be causal. The soak gets first refusal on that hypothesis.

## Stage 3 — Measurement: the soak

A natural 20-minute conversation after Stages 1 and 2 deploy.

**No new instrumentation required.** The `[voice:server_timing]` header already
emits `tts_N_requested`, `tts_N_done` and `all_tts_done` per turn, so the
synthesis distribution comes for free.

Acceptance:

```
no spoken code or markup
mic resumes after every MAIA turn
a single 302ms rapid end recovers
no unexplained RECOGNITION_ABORT_LOOP
no silent post-TTS mic death
Kokoro sovereignty intact (zero provider:"openai")
```

Collected alongside: per-turn synthesis time, chunk count, chunk size.

## Stage 4 — Kokoro performance

Not started, and deliberately not designed from `n=1`. One 6.9s turn proves
something is wrong; it cannot distinguish steady state from an outlier.

**Already eliminated** from the existing turn: chunk serialization. Two chunks
requested at 1375ms, first done at 8286ms, all done at 8288ms — the chunks
synthesize in parallel, so 6,911ms is one chunk's own cost, not accumulation.

Hypotheses, each with a cheap discriminator the soak mostly answers:

| Hypothesis | Discriminator |
|---|---|
| Cold start / model load per request | turn 1 slow, turns 4–12 fast → warm-up, not architecture |
| No resident model | synthesis time flat and high regardless of text length |
| Chunk size superlinear | plot synthesis ms against input chars |
| CPU-only execution | container inspect; GPU availability on minisforum |
| Host CPU contention | whisper / RLM / postgres load during the same window |
| Per-request connection overhead | fixed floor even on very short input |

Order: read the soak distribution first, then test only the hypotheses it
leaves standing.

## Stage 5 — Voice-quality audition

`af_kore` was selected as the Kokoro analogue of `alloy` — a mapping decision,
not a listening decision. It is not sacred.

Audition the qualified local voices by ear against MAIA's actual register, on
real conversational text rather than sample sentences. `SOVEREIGN_VOICES`
already carries the candidate set and per-element mappings.

The member's ear is the instrument here. Routing was confirmed correct while
the result was still experienced as wrong; that is a perceptual finding, and it
outranks the code being right.

## Stage 6 — Canon decision, contingent only

Reached **only** if Stages 4 and 5 establish that local voice cannot meet the
bar. If so, the change is authored as an explicit canon amendment with its
reasoning recorded — never as a quiet gate edit, and never as the path of least
resistance from a slow afternoon.

---

## Parked, in order

```
VOICE-CAPTURE-01B          rerun clean after Stages 1-2 deploy; window broken
                           by the urgent repair, not to be reconstructed
VOICE-SOVEREIGNTY-01 C     server half PASSED; client half unobserved
VOICE-TTS-OBSERVABILITY-01 [tts.resolve] reports openaiVoice:"alloy" via ??
                           default when none was chosen
VOICE-TTS-WEAVER-DRIFT-01  speechWeaver claims universal Kokoro application;
                           the dispatch passes params.text directly
VOICE-LATENCY-02/03        endpoint 3500ms + synthesis; both real, neither tuned
                           until the distribution exists
second restart authority   candidate only; soak has first refusal
VOICE-IDENTITY-01          folded into Stage 5
```
