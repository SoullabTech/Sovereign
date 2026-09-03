# MAIA Voice Ecology — roadmap after the floor is repaired

**Status:** roadmap, and the **first partial pass** of `MAIA-VOICE-R&D-CENSUS-01`.
Recovered R&D trail + one structural finding, 2026-08-31.
**Program:** `docs/programs/MAIA_VOICE_EVOLUTION_PROGRAM.md` — this document is
that program's starting state, to be verified rather than repeated.
**Governed by:** `docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md`
(the Deep-Intelligence Gate). Everything below concerns **sensory technology**.
None of it may substitute MAIA's mind.

> The current Whisper/Desktop repair is the **floor**, not the vision.
> Do not let four days of debugging redefine the ambition downward.

---

## 0 · The load-bearing architectural insight

**MAIA should have a voice *system*, not a voice.** Identity, delivery/prosody,
routing and generation engine are separated so her relational intelligence stays
hers while the sensory technology keeps evolving. The incubation lane exists so
MAIA can adopt better engines *without replacing her intelligence*.

⭐ The deeper target, already named in the R&D: voice should become
**relationship-aware**, not merely context-aware within one utterance — delivery
adapting subtly to history, emotional pattern, trust depth and developmental
phase. That is the thing that distinguishes presence from correct audio.

---

## 1 · What already exists — point at it, do not restate it

Kelly's concern was that the R&D would be lost. Much of it is not: it is written,
and part of it is structurally enforced.

| artefact | what it holds |
|---|---|
| `docs/specs/VOICE_LAB_SPEC_2026-07-06.md` | the **incubation lane**. Admin-gated `/admin/voice-lab`, blind A/B, provenance-with-score. Separates a building MVP from a preserved-direction Studio |
| `docs/specs/VOICE_FUNCTION_TAXONOMY_2026-07-07.md` | *"a provider is not good or bad in the abstract — it is good **for a function**"*. Function → capability-class → candidate-provider mapping |
| `docs/specs/MAIA_VOICE_EVALUATION_PROTOCOL_v0.2.md` | the instrument the Lab operationalizes |
| `docs/adr/012-openai-tts-production-status.md` | the open governance question on archetype→OpenAI defaults |
| **Refusal R15** (`docs/architecture/REFUSAL_REGISTRY.md`) | **live, demonstrated.** `assertProviderQualified()` in `lib/tts/ttsRouter.ts`; `QUALIFIED_PROVIDERS['production-maia']` is verified-local-only (`auto,kokoro`); `getDeploymentContext()` **fails closed** to production |

⭐ **The governing rule, already adopted verbatim:** controls may create variants
for testing, but member-facing MAIA exposes **archetypes, not provider knobs**.
The Lab may say `Kokoro · MAIA Warm · speed 0.92`; the member sees
`MAIA / MAIA Warm / MAIA Expressive`.

⭐ **R15 is why experimentation is safe.** The Lab cannot become a production
egress bypass: the same guard refuses `openai`/`pplex` even to an admin when the
deployment context is production. New engines can be evaluated without any risk
of one silently reaching a member.

---

## 2 · ⚠️ THE FINDING — MAIA has a mouth architecture and no ear architecture

```
lib/tts/     router · providers/ · qualification gate · sovereignty ·
             adapter · cloud policy · sanitizer · speech weaver
lib/stt/     ✗ does not exist
```

STT is a hardcoded POST to `/api/voice/transcribe-simple` → one Whisper
container → one model (`WHISPER__MODEL=base`, CPU), with **no router, no
provider abstraction, no qualification gate, no lab, and no evaluation
protocol**.

The asymmetry shows in the R&D itself. Provider mentions in the function
taxonomy: **Kokoro 13 · Sesame 11 · PersonaPlex 10 · Moshi 7 · Whisper 1.**

⛔ **This is the structural explanation for the last four days.** The ear had no
architecture, so it had no instrument. Comparing `base` against `small` on the
same audio — the measurement now required before the model may change — is
exactly what the Voice Lab does for TTS and what nothing does for STT. It is
being done by hand because there is nowhere for it to live.

An inverted transcript (*"really hard time"* → *"really good time"*) is a
sovereignty failure, and it reached a member through the one part of the voice
system that has no governance layer at all.

**First unit of this roadmap, therefore: an ear lane matching the mouth lane** —
STT provider abstraction, a qualification gate on the R15 pattern, and a
same-audio A/B instrument. Not a model change. The capacity to *evidence* a model
change.

---

## 3 · The strands, by evidence status

Using the six-category typology (`STATE_AND_ROADMAP_2026-05-24.md` §8).
⛔ Researched ≠ built. Collapsing these into "we have it" is the inflation drift.

### Cat 6 — live
- **Kokoro** — the stable sovereign baseline, verified-local, the only production-qualified engine besides `auto`. ⛔ **Deliberately a baseline, not the evolutionary endpoint.**

### Cat 3/4 — built substrate, gated out of production
- **PersonaPlex (`pplex`)** — adapter exists (`lib/tts/providers/personaplex.ts`), dispatch branch exists, reachable only past R15. Excluded from production for a **stated technical reason, not a quality one**: *no x86 production backend*.
- **Sesame CSM** — `maia-sesame-tts` runs in production but does **CI text-shaping only, not audio synthesis**. R15 keeps `sesame` a Voice Lab candidate until a verified Sesame CSM *audio* backend exists. ⚠️ A production selection today would emit a buffer mislabelled `provider:'sesame'` from a non-Sesame backend.

### Cat 1 — preserved direction, researched, not built
- **MLX / Apple-Silicon local runtime** — identified as a serious local-runtime path, materially faster than the Ollama/llama.cpp path on Apple Silicon; MLX-based serving queued for evaluation. See §4.
- **Moshi** — the R&D baseline for what conventional STT→LLM→TTS **loses**: latency, interruption, turn-taking, naturalness, presence. The bar was *the least noticeable interface* — human conversation, not merely correct audio. Present in both existing voice specs.
- **Voxtral** — richer prosody, emotional contour, voice identity. Explicitly envisioned as a **parallel / dark-launched** engine rather than something that destabilises the working path.
- **Orpheus** — expressive, streaming-capable TTS; an R&D lane worth evaluating.
- **Parler-TTS** — open controllable-speech baseline; useful for experimentation even if never MAIA's voice.

⚠️ Voxtral, Orpheus and Parler-TTS appear in **no repo document** prior to this
one. They are recorded here from the recovered R&D trail so they are not lost a
second time — as *directions*, with no implementation and no ruling behind them.

---

## 4 · MLX and the production-topology constraint

The R15 row states the real obstacle plainly: `pplex` is excluded because there
is **no x86 production backend**.

Production is minisforum — **x86 Linux**. MLX is **Apple-Silicon only**. So an
MLX-based engine cannot serve production as currently deployed, however good it
is. That is a topology fact, not a verdict on MLX.

It leaves three honest options, none of them yet ruled on:

1. MLX serves the **Mac lab** only — evaluation and R&D, never member traffic.
2. Apple-Silicon hardware enters the **production** path (a sovereignty and ops decision well beyond a voice unit).
3. An engine is chosen for its **x86-servable** implementation, with MLX used only to explore what is possible.

⛔ Do not let "MLX is faster on Apple Silicon" quietly become "MLX is MAIA's
runtime". The measured claim is about the Mac; production is not the Mac.

---

## 5 · Apple SpeechAnalyzer — ruled 2026-09-03 (was: not recovered)

Until 2026-09-03 no prior ruling existed and this section said *do not invent
this*. Founder qualification at the time, verbatim:

> *"I have not yet recovered a prior specific ruling around Apple
> SpeechAnalyzer/WhisperKit, so I don't want to invent that part."*

**The ruling now exists and is dated, not back-dated:** founder directive
2026-09-03 authorises lane **`VOICE-RECOGNITION-ENGINE-01`**
(`docs/programme/VOICE-RECOGNITION-ENGINE-01_LANE.md`) — a bounded engineering
migration of the iOS Layer 2 recognizer onto an engine-neutral boundary, with
an availability-gated SpeechAnalyzer + SpeechTranscriber engine, a
DictationTranscriber fallback, and the legacy SFSpeechRecognizer preserved as
the default until a same-device witness is won. **WhisperKit remains unruled**
(2B in that lane: benchmark only after Apple is witnessed). The Apple-Silicon
strand that was already recovered is MLX, §4, and is unaffected.

---

## 6 · Sequence

```
1. FLOOR      the basic sensory pathway becomes reliable
              she hears accurately, stays conversationally alive, speaks reliably
              ← we are here, and not yet through it

2. GATE       the Deep-Intelligence Gate holds
              voice reaches full canonical MAIA, never a reduced assistant
              ← merged, enforced, GREEN on the wiring

3. ECOLOGY    resume the voice R&D lane on a stable substrate
              ear lane (§2) · MLX/Apple-native evaluation (§4) · Moshi-class
              full-duplex dynamics · CSM/Orpheus/Voxtral expressive engines ·
              streaming · interruption · relational prosody — all behind stable
              interfaces
```

⛔ **Do not begin 3 before 1 is proven.** And do not let 1 conclude with
*"Whisper `small` + Kokoro = MAIA voice, done."* That would discard the R&D.

The destination is not "MAIA can hear and speak". It is:

> MAIA feels **present** — continuous, responsive, interruptible, emotionally
> attuned, relationally intelligent, increasingly embodied — without surrendering
> sovereignty.
