# MAIA Voice — Function / Provider Taxonomy (interview framework)

**Status:** Candidate — first draft, 2026-07-07. Companion to `VOICE_LAB_SPEC_2026-07-06.md`.
Purpose: replace "which voice wins?" with "which provider serves which **function** MAIA
performs?" — so evaluation produces a *capability map*, not a single score. This is the
design layer the Voice Lab operationalizes once ≥2 real providers are live.

The core claim: **a provider is not good or bad in the abstract — it is good *for a function*.**
So we (a) catalog the functions MAIA's voice actually performs, (b) catalog the provider
options and their fixed attributes, then (c) class each function against the providers that
are even *candidates* for it, plus the interview dimensions that dominate *that* function.

---

## Part A — The functions MAIA's voice performs

Grounded in canon (modes: Talk / Care / Note), processing tiers (FAST <2s / CORE 2–6s /
DEEP 6–20s), and the protocol scenarios. Each function names the quality that dominates it
— the dimension that, if it fails, the function fails regardless of other scores.

| # | Function | Mode | Tier | Dominant quality | Capability class needed |
|---|----------|------|------|------------------|-------------------------|
| F1 | **Greeting / return** — "Welcome back…" | Talk | FAST | felt recognition, warmth | batch TTS |
| F2 | **Reflective dialogue** — sustained back-and-forth | Talk | CORE | listening comfort over minutes, pacing | **duplex** (turn-taking) |
| F3 | **Guided practice / meditation** | Care | DEEP | breath cadence, spaciousness, settling | batch TTS (long, paced) |
| F4 | **Coaching** — inquiry + challenge | Talk | CORE | challenge without harshness | batch TTS / duplex |
| F5 | **Therapeutic / grief holding** | Care | CORE/DEEP | emotional containment, *restraint* (no over-acting) | batch TTS |
| F6 | **Teaching / explanation** | Talk | CORE | clarity, pacing, sustained attention | batch TTS |
| F7 | **Storytelling / long narration** | Talk | DEEP | endurance, rhythm, low fatigue | batch TTS |
| F8 | **Celebration** — genuine delight | Talk | FAST | non-performed joy (rare in TTS) | batch TTS |
| F9 | **Fast assistant** — "read my calendar" | Note | FAST | efficiency, intelligibility, low latency | batch TTS |
| F10 | **Silence / interruption / barge-in** | Talk | — | graceful stop + resume, pause tolerance | **duplex only** |
| F11 | **Continuity over time** (days/weeks) | all | — | familiarity, does it deepen or tire | any — longitudinal |

**Key split:** F2 and F10 (and partly F4) are **conversational/duplex** functions — real-time
turn-taking, barge-in, listening. A batch-TTS engine *cannot* be interviewed for these at all.
This is why Moshi belongs to a separate "conversation instrument," not the passage lab
(per `VOICE_LAB_SPEC` §6). Do not score a batch engine on F2/F10.

F11 (continuity) is a longitudinal instrument — same person, same engine, days apart —
not a blind panel. Different evidence stream; never averaged with the others.

---

## Part B — Provider options and fixed attributes

Fixed = true regardless of function. The **sovereignty gate** (Stage A) is binary and
precedes all scoring: a cloud engine is disqualified for `production-maia` no matter how it
scores. It may still be interviewed in the lab for reference.

### Qualification is layered (earned from the PersonaPlex experiment, 2026-07-07)

A provider being *reachable and producing audio* does **not** mean it is qualified. Standing
PersonaPlex up proved this: it is operationally healthy (server up, model loaded, `/health`
green, bytes returned) yet it **ignores the supplied text and free-generates unrelated
speech** — so it fails the actual requirement for passage reading. Qualification has three
layers, and a provider must clear each *for the role it is being selected for*:

1. **Operationally healthy** — can it run? (reachable, initialized, returns audio)
2. **Behaviorally correct** — does it perform the requested task? (e.g. speaks *this* text)
3. **Role-appropriate** — is that behavior the right kind for this interaction?

This is the existing *Infrastructure → Capability → Experience* verification discipline applied
to **provider selection**: the sovereignty gate (R15) is one facet of layer 3, not the whole
of qualification. `pplex_healthy` = layer 1 only. The runtime's question is therefore not
*"which provider is best?"* but **"which provider is appropriate for this interaction?"** — the
platform selects **capabilities, not brands.** A green health check is necessary, never sufficient.

### Transcript-fidelity ruler — FROZEN (validated 2026-07-07)

Layer 2 (behavioral correctness) for passage reading is measured objectively, not by ear:
`scripts/voice-lab/fidelity_harness.py` synthesizes each frozen passage through the real lab
path, transcribes it with a local sovereign **Faster-Whisper `small.en`**, and scores
**fidelity = 1 − WER**. The ruler is validated BEFORE it judges any new system:

| Reference reader | mean fidelity | min | gate |
|---|---|---|---|
| Kokoro | **1.000** | 1.000 | PASS |
| OpenAI | **1.000** | 1.000 | PASS |

Both known-faithful readers score a perfect 1.000, and a generative/hallucinating engine
(PersonaPlex-style) would score ≈0 — so the ruler discriminates. **Frozen** (do not tune per
provider): passages, model (`small.en`), decode settings, normalization.

- **Gate threshold: fidelity ≥ 0.90** per passage AND provenance faithful (`provider==requested`,
  no fallback). A silent substitution auto-fails — bytes returned ≠ faithful.
- **Objective gates (automated):** health · transcript fidelity · latency · gen-success · format/sample-rate.
- **Subjective (human, documented, non-gating):** naturalness · presence · warmth · expressiveness.
- **Fidelity is a HARD release gate** — nothing passes on "sounds good" if it says the wrong words.
- Caveat: on short passages WER is coarse (one STT slip on an 8-word line ≈ 0.875), so a
  sub-threshold result triggers **transcript inspection** (the harness prints what was heard) to
  separate an STT slip from true infidelity — not silent auto-reject.
- **When Meta approves Llama-3.2-1B:** run the SAME frozen harness against `csm` first, before any
  listening. `csm` earns layer-2 only by clearing this ruler.

### Blind listening protocol — the subjective half (human, non-gating)

Warmth/presence/naturalness/attunement require a listener and must NOT be fabricated by the model.
The lab enforces the rigor that can be enforced; the rest is rater discipline:

- **Blind until each rating is saved** — the provider is revealed only on Save. *(code-enforced)*
- **Randomize passage AND provider** each draw, so expectation can't build. *(code — "Random passage" + "Blind draw" toggles, both default on)*
- **Rate immediately after each clip**, not from memory. *(workflow: draw → score → save per clip)*
- **Confidence (High/Med/Low)** recorded with every rating, to weight close calls. *(code — saved + in CSV)*
- **One free-text prompt per clip:** *"What, if anything, drew your attention?"* — the qualitative signal numbers miss. *(code)*
- **Same playback equipment throughout.** *(rater discipline — not enforceable in code; hold it manually)*

Pipeline (every provider, no special treatment): **objective gates verify the system → blind
listening gathers human observation → identity revealed only after scoring → results summarized
without altering the original ratings → CSM enters the exact same process.** The model may organize
and summarize the evidence; it never supplies a subjective score.

| Provider | Sovereignty | Class | Expressiveness controls | Latency | Host | Lab status (2026-07-07) |
|----------|-------------|-------|-------------------------|---------|------|------------------------|
| **Kokoro** | ✅ local | batch | fixed voice ids, speed | fast (CPU) | any | **LIVE** (16–23 ms) |
| **PersonaPlex** | ✅ local | **generative (Moshi lineage), not passage-faithful** | persona, prosody | fast (MLX) | **Apple Silicon only** | server LIVE + renders, but **MLX text-conditioning incomplete → free-generates, ignores input text** (verified 2026-07-07) ⚠ |
| **Sesame CSM** (`csm-1b`) | ✅ local | batch, context-conditioned | audio-context prompting (RVQ) | **~8s mean / 17s max, CPU** (MPS pending) | Mac lab | **LIVE (lab, :8890)** — genuine csm-1b; fidelity **1.000 PASS** (2026-07-07); faithful but CPU latency too slow for interactive use ⚠ |
| **OpenAI TTS** | ❌ cloud | batch | voice, speed | low | cloud | reference only; **fails Stage A** |
| **Moshi** | ✅ local | **duplex** | turn-taking, barge-in | real-time | GPU host | conversation instrument (separate) |

⚠ **Sesame integrity note:** `docker-compose.local-voice.yml`'s `sesame-tts` service built
`Dockerfile.simple` = **Google TTS (gTTS) mislabeled `sesame-csm`**. It is cloud, not local,
and not CSM. Real CSM = `Dockerfile.real` / `start-sesame-real.sh` (Coqui + torch + HF weights).
Until the real backend is stood up, Sesame must stay OUT of the lab — a mislabeled provider is
worse than an absent one.

✅ **Resolution (2026-07-07):** the mislabel is closed at three layers rather than kept live —
option (b) (swap in real CSM) is blocked on the Meta Llama-3.2 license review, and option (c)
(delete) would discard the one honest thing the service does (`/ci/shape`, local text-shaping).
So the label was made **honest** (option a):
1. **Source** — `app/api/_backend/csm/sesame_simple.py` now reports `service="gtts-cloud"`,
   `sovereign=false`, `cloud_vendor="google"`; the `/tts` Google-egress path is **default off**
   (`ALLOW_CLOUD_TTS=1` required — cloud egress is never silent); `/ci/shape` + `/health` stay local.
2. **Runtime** — `lib/tts/providers/sesame.ts` refuses to stamp `provider:'sesame'` unless the
   backend self-reports a sesame/csm `service` and `sovereign !== false`.
3. **CI** — `npm run check:voice-provenance` (`scripts/check-voice-provenance.ts`, in `preflight` +
   `ci:sovereignty`) fails the build if any CSM-backend file uses a cloud engine while claiming a
   sovereign identity. The lab service is renamed `gtts-placeholder` (`maia-gtts-placeholder`).

---

## Part C — Classification: function → candidate providers + interview focus

Only sovereignty-passing, capability-matching providers are *candidates* for a function.
For each, interview on the **dominant** dimension first; the generic dimensions (trust,
presence, warmth, attunement, calm, naturalness) are secondary.

| Function | Candidate providers (local, right class) | Interview focus (beyond the 6 generic dims) |
|----------|------------------------------------------|---------------------------------------------|
| F1 Greeting | Kokoro, (real Sesame) | does it land as *recognition*, not announcement |
| F2 Reflective dialogue | **Moshi**; PersonaPlex *(candidate — conditioning fix pending)* | fatigue over 15 min; does trust grow or wear |
| F3 Meditation | Kokoro, (real Sesame) | breath cadence, pause length, nervous-system settling |
| F4 Coaching | Kokoro; PersonaPlex *(conversational, candidate)* | challenge without harshness |
| F5 Grief holding | Kokoro, (real Sesame) | **restraint** — penalize over-acted emotion |
| F6 Teaching | Kokoro, (real Sesame) | clarity + sustained attention |
| F7 Storytelling | Kokoro, (real Sesame) | endurance, rhythm, listener fatigue |
| F8 Celebration | Kokoro, (real Sesame) | genuine (non-performed) delight |
| F9 Fast assistant | Kokoro | latency + intelligibility (warmth secondary) |
| F10 Silence / barge-in | **Moshi**; PersonaPlex *(candidate)* | stop→resume grace, pause tolerance |
| F11 Continuity | whichever ships as default | longitudinal familiarity |

**PersonaPlex is removed from every passage function** (F1, F3, F5–F9): it does not read supplied
text (see Part B, verified 2026-07-07). It appears only under the conversational functions (F2,
F4, F10) as a *candidate*, contingent on its MLX text-conditioning being completed. Until real
Sesame CSM is stood up, **Kokoro is the only qualified passage reader** — so the passage lab has
one provider, and a blind A/B awaits a second *behaviorally-correct* passage engine.

**Output of the interviews = a per-provider "voice fingerprint":** *best-for* map, e.g.
"PersonaPlex → practices + celebration; Kokoro → assistant + coaching; Moshi → live dialogue."
This likely yields **function-scoped voices**, not one global winner — MAIA may keep a single
default optimized for continuity while reserving specialized voices for practice/teaching.

---

## Part D — What the Voice Lab needs next to run this

The current MVP tests **fixed passages** through **one drawn provider**. To interview by
*function* it needs one increment: a **scenario/function dimension** — select F1–F9 (each with
its own passage set + dominant-dimension prompt), score against the function's focus, and roll
up into the fingerprint map. Duplex functions (F2/F10) require the **separate conversation
instrument** (Moshi) — not this lab.

**Sequencing (holds the spec's discipline — build only what evidence names):**
1. Get a **second real provider** live (PersonaPlex MLX or real Sesame CSM) so *any* blind
   comparison is possible. Kokoro alone cannot be A/B'd.
2. Add the **function/scenario dimension** to the lab (F1, F3, F5, F6, F9 first — all batch).
3. Roll scored evidence into the **fingerprint map**.
4. Only then consider the duplex conversation instrument for F2/F10.

**Not authorized yet:** the full scenario Studio, MAIA-as-facilitator, longitudinal automation.
Those remain preserved direction until the interviews above produce evidence they're worth building.
