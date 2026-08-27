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

## A5 — Listen to Alloy again

**The presumption is KEEP, not replace.**

Alloy is the reference voice. It was previously experienced as *"almost
perfect"* in a correctly-routed state (Kelly's observation; not reproduced by
the authoring agent). Nothing since has established a better voice for MAIA —
only that the current experience is wrong while three known defects are
present. Remove those first, then listen again.

```
FIX ALLOY
  → prove correct routing
  → fix code-speak
  → fix mic/turn reliability
  → measure and reduce latency
  → listen to Alloy again
  → KEEP ALLOY if it feels right
```

⚠️ **Unresolved and load-bearing: which Alloy was the good baseline?**

```
OpenAI alloy      cloud implementation — NOT reachable under current canon
Kokoro af_kore    local realization of maia_core, labelled "alloy" upstream
```

The discriminator is timing: before #1113 shipped on 2026-08-27, cloud led and
the voice heard would have been OpenAI's. After it, only Kokoro is reachable.
If the good baseline was the cloud one, "restore Alloy" and "do not reverse the
canon" are in direct conflict and the roadmap must say so rather than assume
the local voice will arrive there. **Resolve before A5 runs.**

## A6 — Audition, only if Alloy still sounds wrong

Not a default stage. Reached only if A1–A4 are complete and the voice is still
wrong.

```
Alloy  vs  Kokoro af_sarah  vs  Kokoro af_kore  vs  any clearly stronger candidate
```

`af_sarah` is worth remembering specifically: heard directly, it was described
as *"a different woman voice and I liked it"* (Kelly's observation). It is
already a first-class identity in the codebase —

```
maia_warm · "Maia (Warm)" · kokoro af_sarah · openai shimmer
"Soft edge. Holds silence well. For when you need room."
```

— so comparing it costs a preference change, not new plumbing.

`af_kore` is not sacred. It was chosen as the sovereign default mapped from
alloy, never established as perceptually superior.

**Research candidates, not production-proven:** CSM-1B, Orpheus. Neither is a
demonstrated Alloy replacement and neither should enter an audition as though
it were.

Audition passages must expose what matters — tenderness, directness, humour,
contemplative depth, one long complex sentence, one short intimate answer,
difficult emotional material, ordinary practical guidance. Judge on presence,
warmth, intelligence, natural cadence, embodiedness, emotional range, absence
of "AI announcer" quality, and recognizability as MAIA. Not generic voice
quality.

**Engineering measurement does not overrule this stage.** Routing was verified
correct while the lived result was still wrong; the proof closed one hypothesis
and did not overrule the experience. The converse also holds: a voice that
measures well and sounds wrong has not passed.

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
