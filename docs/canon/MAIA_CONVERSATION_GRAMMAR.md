# MAIA Conversation Grammar

**Status: Cat 2 — canonical primitive. Interface target, no runtime authority.**
Authored 2026-08-29. Nothing here is wired. The audit in §2 is the evidence that
it needs to be.

⛔ **Not part of the cloud-voice consent candidate** (`01374f51b`). This document
is committed above that candidate and changes no runtime behaviour; it is not
what a device witness of the consent boundary proves or disproves. Custody note,
founder ruling 2026-08-29: a lane leaves behind its behaviour and the machinery
that makes its regression tests unavoidable — not a broader philosophy commit.

⛔ **No lane authorized.** This describes a proposed acceptance gate and the
divergence that motivates it. It does not authorize the repairs in §5, which
belong to their own lanes.

---

## 1. Why this exists

The Desktop 8-second ceiling was not an STT bug. It was an **unstated
conversational convention**, inherited by accident:

> *"After eight seconds, I have decided your thought is over."*

Nobody chose that for Desktop. `DEFAULT_MAX_RECORDING_MS = 8000` was written for
one-shot Android fallback recovery, where a bounded capture is correct. Desktop
became a first-class conversational surface by calling the same function, and
took the convention along with the transport.

> ⭐ **The repair restored a deeper convention: the speaker, not the timer, owns
> the completion of the thought.** That sentence is a grammar rule. It was
> nowhere written down, which is why it could be lost by an import.

A conversational presence is partly intelligence and partly **interaction
architecture**. Desktop does not inherit MAIA's way of conversing merely by
talking to the same model. Three layers must be carried deliberately:

```
1  CONVERSATIONAL MIND    persona, relational stance, memory, how she reads
                          pause, uncertainty, emotion, interruption
2  PROSODIC EXPRESSION    voice, rate, cadence, segmentation, punctuation-to-
                          speech, inter-clause pauses, emphasis
3  TURN-TAKING GRAMMAR    when she decides you are finished, silence tolerance,
                          interruption, provisional transcription, latency,
                          resumption after interruption
```

Layer 1 follows the backend for free. **Layers 2 and 3 do not.** They live in the
client, and that is where MAIA drifts into being a different presence wearing the
same words.

> Same words, different segmentation, different silence threshold, different
> voice — **a completely different MAIA.** The surface may change. The being may
> not.

---

## 2. Measured divergence — what has already drifted

`lib/voice/voiceTiming.ts` opens: *"single source of truth for all voice
turn-taking thresholds… Applies to both PWA and native iOS."*

Grepped across `lib/`, `components/`, `hooks/`, `app/`, `VOICE_TIMING` has
**exactly one consumer**: `components/OracleConversation.tsx:10477-10479`, the
web path. Not the native path. Not Desktop.

The Desktop sovereign branch (`ContinuousConversation.tsx:3460`) calls
`recordAndTranscribe(stream, { signal })` — **no timing options at all** — so it
silently takes `androidVoiceFallback`'s defaults.

| | web Talk | web Care | native iOS | **Desktop sovereign** |
|---|---|---|---|---|
| silence → end of turn | 3500 ms | 10000 ms | 2500 ms *(declared)* | **1500 ms** |
| grace window | 750 ms | 750 ms | 750 ms *(declared)* | **none** |
| hard ceiling | none | none | none | **8000 ms** |
| mode-aware | yes | yes | no | **no** |

Three findings, in order of seriousness:

**a. Desktop ends a turn ~2.3× sooner than web, and is the only surface with a
guillotine.** Not a tuning difference — a different conversational personality.

**b. Care mode does not exist on Desktop.** On web, Care gives ten seconds of
silence tolerance: spacious room for emotional processing. Desktop passes no
mode, so Care gets 1.5 s and an 8 s cut.

> ⛔ **This is the worst instance, and it inverts the mode's purpose.** The mode
> that exists to hold someone through difficulty is the one Desktop most
> aggressively truncates. A member in Care on Desktop is cut off mid-feeling by
> a constant written for an Android network failure.

**c. `VOICE_TIMING`'s own claim is already false.** It declares itself the single
source of truth for PWA *and* native iOS; only the web path imports it. A module
that names itself canonical while one surface ignores it and another was never
connected is documentation drift of exactly the kind this repository polices
elsewhere. *Declaration is not liveness.*

---

## 3. The grammar

Written as rules a surface can be tested against, not as values. Values belong in
one module; these are the constraints that module must satisfy.

### LISTEN

- **The speaker owns turn completion.** A timer may bound pathological capture;
  it may never define the semantic end of a thought.
- **Silence is semantic, not merely absence of audio.** How long MAIA waits is a
  statement about what kind of attention she is offering, and it varies by mode.
- **Long thought is permitted.** Any ceiling must be far enough out to be
  genuinely exceptional. If members meet it in ordinary use, it is a turn
  boundary wearing a safety label.
- **Interruption remains possible throughout.**

### RESPONSE

- **No reflexive instant reply.** Immediacy is a claim about how much was
  considered.
- **Preserve reflective latency where appropriate.**
- **Do not over-segment.** Chunking is prosody, not transport convenience.
- **Do not fill every silence.**

### SPEECH

- Canonical voice, pacing, phrase boundaries, emphasis behaviour — **identical
  across surfaces.**
- Segmentation is part of identity. A surface that sends a whole paragraph to TTS
  where another sends shaped sentences has changed who is speaking.

### INTERRUPTION

- The member may interrupt MAIA.
- MAIA yields cleanly.
- **Abandoned speech does not resume unexpectedly.**

### CONTINUITY

- browser → Desktop → mobile does not reset the relationship.
- Conversational memory is shared.
- Style and prosody remain recognisable.

---

## 4. The acceptance gate

Proposed as a Desktop gate before the app is called finished:

> **The MAIA a member already knows is recognisably the same conversational
> presence when she inhabits Desktop.**

Not *"Desktop has voice."*

Testable form — for each surface, and for each mode:

```
LISTEN        silence thresholds and grace window come from ONE module
              mode reaches the transport and changes behaviour
              any ceiling is exceptional, not conversational
SPEECH        same voice identity, same segmentation, same pacing
INTERRUPTION  barge-in yields; abandoned speech never resumes
CONTINUITY    the same thread, memory and style across surfaces
```

⭐ The honest first version of this gate is not a felt-quality judgement but a
**divergence test**: assert that no surface reads turn-taking or prosody
constants from anywhere but the shared module. Felt presence is what we are
protecting; a constant defined twice is how we lose it, and that is mechanically
checkable today.

---

## 5. What this document is not

⛔ **Nothing here is wired.** No code reads this file. `VOICE_TIMING` remains
uncontacted by Desktop and native iOS, the divergence in §2 is live in
production, and no test asserts any rule in §3.

This is **Cat 2** in the six-category typology: a canonical primitive and an
interface target, with no runtime authority. Promoting it to Cat 6 requires, at
minimum:

1. Desktop and native iOS reading turn-taking thresholds from `VOICE_TIMING`
   (or its successor), with mode carried through to the transport.
2. A divergence test that fails when a surface defines its own.
3. `VOICE_TIMING`'s docstring corrected to describe what is actually true.

Until then this is a description of the MAIA we intend to keep, not a mechanism
that keeps her.

> The related repairs live in their own lanes: `DESKTOP-SOVEREIGN-STT-UTTERANCE-LIMIT-01`
> (the ceiling) and `DESKTOP-SOVEREIGN-STT-INTERIM-01` (provisional transcription).
> Neither is this document, and this document does not authorize either.
