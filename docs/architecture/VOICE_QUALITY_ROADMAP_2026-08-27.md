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

## A5 — Voice identity / quality

### Correction, 2026-08-27

**Previous assumption:** Kokoro `af_kore` could serve as a perceptual
equivalent of OpenAI Alloy under the same MAIA voice identity.

**Current evidence:**

```
ROUTING
  maia_core → af_kore under sovereign/local policy
  STRUCTURALLY CORRECT

MEMBER WITNESS
  af_kore is materially more robotic / not perceptually equivalent
  to the prior Alloy experience
  PERCEPTUAL-EQUIVALENCE ASSUMPTION FALSIFIED

HISTORICAL RECONCILIATION
  the "almost perfect" MAIA voice heard before today's sovereignty
  change was OpenAI Alloy, not Kokoro af_kore
```

**State:** OPEN PRODUCT / CANON QUESTION. Not a routing bug.

**Candidate paths — none selected:**

```
A. make a local Kokoro voice good enough to be MAIA
   (af_kore / af_sarah / other qualified local voice)
B. explicitly re-authorize cloud voice choice
   (canon amendment; member speech text leaves the machine)
C. qualify a stronger sovereign local model
   (CSM / Orpheus class; research only until proven)
```

`af_sarah` is a genuine alternate — heard directly and liked (Kelly's
observation, not reproduced by the authoring agent) — and is already a
first-class identity, so comparing it costs a preference change rather than new
plumbing:

```
maia_warm · "Maia (Warm)" · kokoro af_sarah · openai shimmer
```

`af_kore` is not sacred: chosen as the sovereign default mapped from alloy,
never established as perceptually superior.

**Engineering measurement does not overrule this stage.** Routing was verified
correct while the lived result was still wrong. The converse also holds: a
voice that measures well and sounds wrong has not passed.

## A6 — Provider / sovereignty decision

**Was:** a contingency if Kokoro could not meet the quality bar.

**Now:** a LIVE DECISION, intentionally deferred until A1–A4 evidence exists.

**Reason:** restoring the previously preferred Alloy experience currently means
restoring OpenAI synthesis, which conflicts with today's local-default
sovereignty canon unless that canon is explicitly amended.

⚠️ **Do not treat "Alloy" as provider-neutral in future roadmap language.**
Distinguish:

```
voice identity / desired perceptual character
        from
synthesis provider / data boundary
```

Audition passages, when A5 runs, must expose what matters — tenderness,
directness, humour, contemplative depth, one long complex sentence, one short
intimate answer, difficult emotional material, ordinary practical guidance.
Judge on presence, warmth, intelligence, natural cadence, embodiedness,
emotional range, absence of "AI announcer" quality, recognizability as MAIA.
Not generic voice quality.

---

## What today's work did and did not cause

A distinction to preserve, because it decides where repair effort belongs:

**Today's sovereignty work did NOT create the sanitizer or mic defects.** It
changed the dominant voice path, and thereby exposed pre-existing Kokoro-path
defects continuously instead of rarely.

| Symptom | Caused by today? | Mechanism |
|---|---|---|
| Voice sounds different / robotic | **Yes — intended** | `c92667e`/`bc46085` made local TTS the production authority; `auto` and `cloud` no longer lead to OpenAI |
| MAIA speaks code aloud | **Exposed, not created** | SSML is generated for Kokoro only; the OpenAI path passes `text` and never SSML. The bypass could only fire on the Kokoro path, which went from rare fallback to every turn |
| ~7s wait for first audio | **Exposed, not created** | same: Kokoro synthesis cost went from occasionally felt to universally felt. Whether it was always this slow is unmeasured |
| Mic dies after MAIA speaks | **No evidence** | the rapid-end guard predates today's work; not attributed |

---

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
