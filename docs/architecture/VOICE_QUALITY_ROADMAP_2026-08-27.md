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

## The goal, stated narrowly

Not "make TTS work." Restore MAIA's voice so she sounds like herself again:
**correct words, uninterrupted delivery, fast enough to feel conversational,
and perceptually right.**

### Identity is not implementation

```
VOICE IDENTITY        what MAIA sounds like, and is called
IMPLEMENTATION        kokoro / af_kore / openai / a future model
```

`lib/voice/sovereignVoices.ts` already encodes this: an entry has an `id` and
`label` (identity) plus per-provider realizations (`kokoro`, `openai`). The
underlying synthesizer can therefore improve without MAIA becoming a different
person each time the stack changes.

⚠️ **Naming hazard, unresolved.** In the code the identity is `maia_core`
("Maia (Kore)") and **`alloy` is the name of the OpenAI implementation**.
Informally "Alloy" has been used to mean the identity. Those are inverses and
cannot both stand — pick one and record it here and in `sovereignVoices.ts`.
Using an implementation's name for the identity is the drift this separation
exists to prevent.

---

## A1 — Speech correctness

**Establishes:** MAIA never speaks code, markdown or system debris.
**Change:** merge #1115, then rebuild from fresh canonical.

```
#1115 → CI green → merge → re-read canonical SHA → rebuild 463954b from it
```

Do not carry the mixed branch forward. Correctness lands before the voice
itself is judged, so no aesthetic verdict is contaminated by debris.

## A2 — Voice reliability

**Establishes:** the turn lifecycle survives real conversation.
**Change:** rebranch `463954b` (VOICE-ABORT-01) alone.

This is transport and coordination quality, not aesthetics. A conversation
cannot feel relational if the microphone dies. Acceptance must include the
hard cases, not just clean turns:

```
long reflective speech          soft sentence endings
pauses mid-sentence             self-correction
rapid follow-up                 MAIA speaking as the next turn becomes available
no stuck listening              no dropped tail            no duplicated turn
```

## A3 — Latency measurement

**Establishes:** the real distribution, not one bad turn.
**Change:** none. A 20-minute natural soak; no new instrumentation.

Already discriminating, from the one turn in hand:

```
chunks requested   ~1375 ms
first complete     ~8286 ms
all complete       ~8288 ms
```

Chunks synthesize concurrently — **serialization is falsified.** The ~6.9s is
one chunk's own cost.

Capture per turn: TTS request time, first completion, all completion, chunk
count and size, and turn number in session. Then ask: is only the first turn
slow, is every turn slow, does latency scale with text length, are there
occasional pathological spikes?

## A4 — Performance repair

**Change only the mechanism A3 proves.** The outcomes diverge sharply:

| A3 shows | Diagnosis | Repair |
|---|---|---|
| Turn 1 slow, later turns fast | cold start | warm the pipeline while the member speaks their first utterance — small fix, no rewrite |
| Every turn ~6–7s | steady-state synthesis cost | profile request → preprocessing → inference → waveform → encoding → transport → playback; find where the six seconds lives |
| Only long chunks slow | chunk sizing | progressive playback and chunk strategy, not provider replacement |
| Synthesis fast, audio late | downstream | buffering / transport / playback coordination — **not Kokoro at all** |

That last row matters most: it would mean every hour spent on the synthesizer
was spent in the wrong place.

## A5 — Perceptual tuning

**Establishes:** whether the voice is acceptable as MAIA.
**Engineering measurements do not overrule this stage.**

The question is *does this sound like MAIA* — not *did we route correctly*. We
already learned those come apart: routing was verified correct while the lived
result was still wrong.

Audition a small controlled set on the same MAIA passages: current voice as-is;
the same voice with cadence/prosody/speed adjustments; the best alternative
sovereign voice; the second-best.

Passages must expose what actually matters — tenderness, directness, humour,
contemplative depth, one long complex sentence, one short intimate answer,
difficult emotional material, ordinary practical guidance.

Judge on: presence, warmth, intelligence, natural cadence, embodiedness,
emotional range, absence of "AI announcer" quality, recognizability as MAIA.
Not generic voice quality.

## A6 — Voice canon decision

Reached only if A4 and A5 both fail.

```
correct speech?        no → fix correctness
reliable conversation? no → fix turn lifecycle
fast enough?           no → fix the measured cause
sounds right?          yes → it stays
                       no  → audition, then choose deliberately
```

Do not replace the voice because of one 7-second turn. Do not canonize
`af_kore` because the router says it is correct. If this branch is reached,
decide separately whether the identity keeps its name while the synthesizer
changes, or whether the identity itself changes.

## A7 — Device acceptance

**Establishes:** the same voice on every surface a member reaches from.

Real-device walks on PWA, Safari/iPhone, and native/desktop. Note the standing
constraint: iOS ships a frozen Capacitor bundle, so a native check requires a
fresh TestFlight build from the SHA under test — a web deploy does not reach it.

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
