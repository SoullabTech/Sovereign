# JARVIS — MAIA VOICE EVOLUTION PROGRAM

**Status:** program charter, founder, 2026-08-31.
**Companion:** `docs/architecture/MAIA_VOICE_ECOLOGY_ROADMAP.md` — a first partial
recovery, and the starting state for this program's first unit.
**Governed by:** `docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md`.

---

## Mission

Develop MAIA into a sovereign, deeply intelligent, naturally conversational voice
presence **without degrading the canonical MAIA intelligence or destabilizing the
working production voice path.**

This is an **R&D → evaluation → promotion** program. It is **NOT** the active
Desktop voice defect lane.

## ⛔ Relationship to the current production repair

The existing repair lane owns:

```
accurate capture → accurate sovereign STT → canonical MAIA cognition → TTS
→ human witness
```

**Do not duplicate or interfere with it.** That lane continues until: *Kelly can
speak → MAIA hears accurately → full canonical MAIA responds → Kelly experiences
the depth.*

This program exists because otherwise the research already done — Apple/MLX,
Moshi-style conversational dynamics, CSM-1B, Orpheus, Voxtral, prosody, relational
modulation — **keeps getting rediscovered piecemeal during bug fixing.** One
program, not another sprawling voice lane.

## Non-negotiable invariant

Voice is the **sensory embodiment** of canonical MAIA. STT, TTS, runtime and
conversational audio technology may evolve. **MAIA's mind may not be replaced,
reduced or forked.**

```
spoken turn → authoritative transcript
            → SAME canonical MAIA cognition as text
            → speech-expression system
```

⛔ **If an experimental system requires a reduced cognition path, it is rejected.**
Not deferred, not flagged — rejected. However good it sounds.

## The program question

What combination of open, sovereign and Apple-native technologies can make MAIA:
hear accurately · respond with very low *perceived* latency · sustain natural
multi-turn conversation · tolerate interruption and re-entry · understand
conversational timing · preserve emotional meaning · speak with responsive
prosody · maintain one recognizable MAIA identity · modulate delivery
relationally over time · operate locally wherever technically viable · remain
commercially and licensing viable · **fail safely without becoming a generic
assistant**?

## Architectural principle

**MAIA has a VOICE SYSTEM, not one voice engine.** Eight layers kept independent
so an engine change is swapping an instrument, not rebuilding her speech mind:

```
1. Hearing               capture · enhancement · VAD · STT
2. Conversational        turn-taking · streaming · interruption · overlap · timing
   dynamics
3. Canonical cognition   full MAIA / AIN intelligence — NEVER reduced
4. Speech direction      meaning → phrasing · prosodic intent · relational modulation
5. Voice identity        persistent MAIA vocal character
6. Generation            Kokoro / CSM / Orpheus / future engine
7. Runtime               server · Apple Silicon · MLX · other sovereign compute
8. Evaluation            objective + human relational witness
```

⭐ **No engine owns MAIA's identity.** Layer 5 sits above layer 6, deliberately.

---

## Research tracks

### TRACK A — Apple / local runtime
Recover and evaluate Apple MLX, `mlx-lm` and relevant MLX serving, the MLX audio
ecosystem, and Core ML / Metal opportunities where appropriate.

*What should run directly on Apple Silicon, and what measurable advantage does
that give MAIA in latency, sovereignty and reliability?*

⛔ Do not adopt technology merely because Apple provides it.
⚠️ Start from the topology constraint already recorded (roadmap §4): production is
**x86 Linux**; MLX is **Apple-Silicon only**. Refusal R15 excludes `pplex` for
exactly this reason — *no x86 production backend*. That is a fact to design
around, not a verdict on MLX.

### TRACK B — Hearing
Benchmark sovereign STT candidates on the **same captured MAIA audio**, including
the current Whisper baseline. Measure semantic accuracy, **emotionally
consequential substitutions**, names, pauses, long speech, noisy-room
performance, latency, CPU/GPU cost.

⛔ **A transcript that reverses emotional meaning is a critical failure even if
WER looks acceptable.** This is not hypothetical: production `base` returned
*"I'm having a really good time"* for *"I'm having a really hard time"*, and MAIA
answered the inversion.

⚠️ This track inherits the roadmap's structural finding: **there is no `lib/stt/`.**
Hearing has no router, no provider abstraction, no qualification gate, no lab.
The mouth has all four.

### TRACK C — Conversational speech
Recover the Moshi / full-duplex R&D and current alternatives. Study streaming
audio understanding, interruption, barge-in, overlap, conversational timing, turn
completion, response onset — and the ability to **preserve canonical MAIA
cognition rather than replace it**.

⛔ The purpose is not "use Moshi". The purpose is to learn what architecture gives
MAIA the **least noticeable, most human** conversational interface. Many
end-to-end speech models replace the mind; those fail the invariant however good
they feel.

### TRACK D — Expressive sovereign voice
Evaluate in parallel, **never directly in production first**: Kokoro (stable
sovereign baseline), Sesame CSM-1B, Orpheus, Voxtral where licensing permits R&D,
and credible open models found in fresh research. All providers sit behind the
same MAIA voice interface.

### TRACK E — MAIA Speech Director
Recover and extend style presets, text shaping, prosodic intent, agent/element
tone, contextual pacing, paragraph-level rhythm, interruption-aware delivery.

Then add the missing layer — **RELATIONAL MODULATION**: delivery responding
subtly to relationship depth, emotional state, developmental phase, trust,
interaction history, grief / activation / contemplation / direct action, and
current elemental dynamics.

⛔ **This must remain subtle. The goal is not theatrical mood acting. The goal is
relational attunement.** Note the governance weight: modulation keyed to
developmental phase touches the Developmental State Shaping Guard (Refusal R16)
— inferred developmental state may not shape delivery unless member-marked or
produced within an authorized interpretation boundary. This track cannot be
designed without reading that refusal.

### TRACK F — Evaluation chamber
One provider-independent harness. Identical audio inputs for STT, identical
canonical MAIA response texts for TTS, identical context labels and hardware
conditions.

Technical: latency · accuracy · resource use · failure rate · long-session
stability.
Human: MAIA-ness · presence · naturalness · emotional fidelity · restraint ·
trustworthiness · continuity of identity · responsiveness to context ·
non-theatricality · relational fit.

⛔ **Never promote an engine from benchmark numbers alone.**

---

## Promotion model

```
RESEARCH → isolated prototype → repeatable benchmark → internal listening
→ controlled A/B → MAIA relational witness → dark launch → production candidate
→ explicit promotion
```

⛔ **No experiment enters production merely because it works.**

## Baseline preservation

Preserve existing production capability while evaluating successors. **Do not rip
out Kokoro, Whisper, or working infrastructure merely to test a new model.** The
system must make engines *replaceable* — which is a different achievement from
replacing one.

---

## FIRST UNIT — `MAIA-VOICE-R&D-CENSUS-01`

⛔ **READ-ONLY. Do not code.** Runs while the repair lane finishes getting a
member reliably talking to MAIA, so it creates no parallel production collision.

Recover everything already built, researched or ruled concerning: Apple/MLX ·
sovereign STT · Moshi / realtime conversational audio · Kokoro · CSM-1B ·
Orpheus · Voxtral · Speech Director · prosody · voice router · relational
modulation · evaluation harnesses · existing feature flags and provider
interfaces · licensing rulings · prior benchmarks.

Classify each: **BUILT · PARTIALLY BUILT · RESEARCHED · RATIFIED · EXPERIMENTAL ·
SUPERSEDED · UNKNOWN.**

Produce one canonical Voice Evolution map so future sessions stop rediscovering
the same research. Then recommend the next **one** experimental unit.

### Starting state — already recovered, to be verified not repeated

`docs/architecture/MAIA_VOICE_ECOLOGY_ROADMAP.md` holds a first pass:

| item | first-pass classification |
|---|---|
| Kokoro | **BUILT / RATIFIED** — only production-qualified engine besides `auto` |
| Refusal R15 (provider qualification) | **RATIFIED**, live, demonstrated |
| Voice Lab (`/admin/voice-lab`) | **PARTIALLY BUILT** — MVP spec'd; Evaluation Studio preserved-direction |
| Voice function taxonomy + evaluation protocol | **RESEARCHED**, written |
| PersonaPlex (`pplex`, MLX) | **BUILT, gated** — adapter exists; excluded, no x86 production backend |
| Sesame CSM | **PARTIALLY BUILT** — prod service does CI text-shaping only, **not audio synthesis** |
| Moshi | **RESEARCHED** — in both existing voice specs |
| Voxtral · Orpheus · Parler-TTS | **RESEARCHED** — in no repo document before the roadmap |
| `lib/stt/` provider layer | **UNKNOWN → does not exist.** The finding |
| Apple SpeechAnalyzer / WhisperKit | ⛔ **NOT RECOVERED.** No ruling found, absent from the repo. Founder: *"I don't want to invent that part."* Do not back-date it into the R&D trail |

⚠️ Treat that table as a **hypothesis to falsify**, not a result. It was
assembled by grep and reading, not by running anything.
