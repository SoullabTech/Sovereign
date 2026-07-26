# TTS Renderer Evaluation Spec — 2026-07-26

> **Purpose:** define how OpenAI TTS, local Kokoro, and (when a renderer exists) Inworld TTS are
> compared as *independent peer renderers of the same MAIA text*, so MAIA's public voice default
> is chosen **from evidence** by explicit founder ruling — never by inertia or by which path
> happened to be wired.
>
> **This spec authorizes evaluation only.** It does not change MAIA's production voice, does not
> introduce Inworld, and does not run automatically. Governing ruling:
> `docs/architecture/INTERACTION_ENGINE_VOICE_ABSTRACTION_CANDIDATE_2026-07-26.md`.
>
> Constitutional frame: *voice is a governed presentation layer, distinct from cognition.*
> Changing the renderer can substantially alter the felt voice; it does **not** change what MAIA
> says or how she reasons.

## 1. What is (and isn't) being compared

- **Compared:** the audio rendering of *identical, frozen MAIA text* across renderers.
- **Not compared / held constant:** Claude cognition, memory, orchestration, persistence, the
  written response, chunking, playback queue, and barge-in (all AIN-owned and renderer-independent).
- **Renderers in scope:** `openai` (production default today), `kokoro` (local, deployed), and
  `inworld` (only once `lib/tts/providers/inworld.ts` exists under a separate authorization).
  On-prem Kokoro and, if commercially viable, Inworld on-prem may be added as later columns.

## 2. Method

1. **Frozen text fixtures only.** Use synthetic or founder-approved MAIA utterances — never live
   member content. Fixtures live in a versioned file (proposed `docs/ai/fixtures/tts_eval_fixtures.md`)
   covering: short acknowledgement; medium reflection; long multi-paragraph response; text with
   canonical names (MAIA, AIN, Soullab, Spiralogic, Elemental Alchemy, Aether, anamnesis); numbers/
   dates/abbreviations; an emotionally tender passage; a grounding/structural passage.
2. **Same input, every renderer.** Feed each fixture, unchanged, to each renderer via the existing
   `ttsRouter` `providerOverride` in `voice-quality-lab` deployment context (`ttsRouter.ts:120–177`)
   — the only path where all renderers are qualified. No cognition call is involved.
3. **Provenance captured per render** (from Phase 0 telemetry): `provider_selected`,
   `selection_reason`, `fallback_occurred`, `fallback_reason`, latency fields (below).
4. **Blind qualitative pass.** Founder (and optional listeners) rate qualitative dimensions
   without seeing which renderer produced the audio, to reduce provider bias.

## 3. Metrics

**Quantitative (auto-measured, from telemetry):**

| Metric | Definition | Source |
|---|---|---|
| Time to first audio | request → first playable chunk | queue instrumentation |
| Total synthesis latency | request → full audio available | router/route timing |
| Interruption latency | barge-in → audible stop | playback layer |
| Reliability | success rate over N renders; error classes | `logFallbackEvent` |
| Chunk-boundary artifacts | audible gaps/clicks between sentence chunks | per-chunk timing + listen |
| Privacy / egress | what data leaves the host per render | route inspection |
| Retention policy | provider's data-retention terms | provider docs (cite) |
| Estimated cost | $ per 1k chars (or per minute) at expected volume | provider pricing (cite) |
| Local / offline availability | can it run with no external network? | deploy inspection |
| Operational reversibility | steps + time to disable and revert to prior renderer | runbook |

**Qualitative (founder-judged, blind, 1–5):**
pronunciation · prosody · emotional appropriateness · long-response consistency · listening
fatigue (over a long passage). Judged against MAIA's relational stance — warmth that does not
manufacture intimacy (per the Oath / Sovereignty Invariants).

## 4. Sovereignty scorecard (non-negotiable columns)

For each renderer, record explicitly:
- Does any member data beyond the finalized utterance text leave the host? (must be **no**)
- Where are provider credentials held? (must be **server-side only**)
- Is a local/offline fallback available if the renderer is removed?
- Retention + training-use terms (cite provider docs).

A renderer failing the "text-only egress + server-side keys + credible removal path" bar is
**not admissible as default**, regardless of quality — matching the provider-governance discipline
(*infrastructure first, admissibility second*).

## 5. Decision procedure

1. Run the method above (OpenAI vs Kokoro now; Inworld later, if/when admitted).
2. Produce a results table (quantitative auto + qualitative blind + sovereignty scorecard).
3. **Explicit founder ruling** selects MAIA's public voice default. Until that ruling, the default
   stays OpenAI. The ruling is recorded (append to the seal doc / an ADR), with the evidence cited.
4. Any change is rolled out reversibly (flag / env), never as a silent substitution.

## 6. Non-goals

- Not a cognition/model evaluation (that is a separate track).
- Not a realtime/interaction-engine evaluation (Prompts 3+; separate).
- Does not admit Inworld — admission requires a founder ruling + canon amendment
  (`PROVIDER_GOVERNANCE.md`, CLAUDE.md voice rule).
- Does not run on or store live member audio/text.
