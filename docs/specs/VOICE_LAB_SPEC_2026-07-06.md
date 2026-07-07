# Admin Voice Lab — Spec (2026-07-06)

**Status:** Candidate — MVP building
**Companion to:** [`MAIA_VOICE_EVALUATION_PROTOCOL_v0.2.md`](./MAIA_VOICE_EVALUATION_PROTOCOL_v0.2.md) (the instrument this Lab operationalizes), [`../adr/012-openai-tts-production-status.md`](../adr/012-openai-tts-production-status.md) (governance), Refusal **R15** (the qualification guard).

## The line this spec draws

The design conversation produced two things of very different maturity. This spec keeps them apart on purpose — collapsing them is the inflation drift the project refuses.

- **MVP (building now)** — an admin-gated panel that plays the fixed protocol passages through a *chosen* wired provider, blind-labelled, provider-locked per session, recording provenance + per-dimension scores + notes, exportable. This is the smallest thing that makes the protocol's **first run** possible with the three engines already behind `ttsRouter` (OpenAI / Kokoro / Sesame). It is the instrument; running it produces the evidence that earns everything below.
- **Voice Evaluation Studio (preserved direction — NOT built)** — scenario-based evaluation (greeting, reflection, meditation, coaching, grief, teaching, storytelling, celebration, silence…), MAIA-as-facilitator (blind presentation + spoken-reflection capture + STT), longitudinal pattern-recognition across weeks, per-provider "voice fingerprint" capability maps, and the generalization to a reusable evaluation framework (atmosphere, prompts, models). All Cat-1 until the MVP produces evidence that a given piece is worth building. Recorded here so it is not lost — and not narrated as if it exists.

**Governing rule (from the design conversation, adopted verbatim):**
> Controls may create variants for testing, but member-facing MAIA exposes **archetypes, not provider knobs.** In the Lab you may set `Kokoro · MAIA Warm · speed 0.92`; in production the member sees `MAIA / MAIA Warm / MAIA Expressive` — never a cockpit of synthesis parameters.

## MVP scope

### Surface
- Route: `/admin/voice-lab` (page) + `/api/admin/voice-lab/*` (APIs). **Admin-gated** via `isAdminRequest` (`LABTOOLS_ADMIN_PASSWORD`, fails closed). **No member-facing exposure. No provider names in normal MAIA UI. No URL-param bypass.**
- Runs on the **Mac Studio lab stack** (`MAIA_DEPLOYMENT_CONTEXT=voice-quality-lab`), where R15 qualifies all providers. On production (context unset → `production-maia`), the same guard refuses `openai`/`pplex` even to an admin — the Lab cannot become a production egress bypass.

### Controls (3 layers, per the design)
1. **Shared** (fair comparison): archetype, passage, speed, provider-lock. *(temperature / pause-length / gain deferred — not all providers expose them; add per-provider as the adapters grow.)*
2. **Provider-specific**: shown only where supported. MVP surfaces `voice/archetype + speed`; richer knobs (PPlex cadence/emotional-temperature, Kokoro voice-id) are added as adapters expose them.
3. **Evaluation**: blind A/B/C labels, randomized order, same-passage replay, per-dimension score, notes, export.

### Provenance (the evidence discipline)
Every synthesis records what actually happened: `provider`, `fallback`, `reason`, `latencyMs`. A score is stored *with* its provenance, so a fallback (e.g. PPlex down → OpenAI) can never be silently scored as the intended engine.

### Persistence
MVP uses an append-only JSON-lines store (`VOICE_LAB_DATA_DIR`, default repo-local `.voice-lab/`, gitignored) — survives restarts, supports export, needs no migration. **Graduation trigger:** when longitudinal (multi-week) analysis is actually run, promote to a DB table. Not before — a table now would be built substrate with zero readers.

### Explicitly NOT in the MVP
Scenarios, MAIA-facilitator, STT reflection capture, cross-session pattern-recognition, capability-map fingerprints, Moshi (→ conversation instrument, §6 of the protocol), and the general evaluation framework. Each enters only when the MVP's evidence names it as worth building.

## Build steps
1. `ttsRouter`: guarded per-request `providerOverride` (still passes `assertProviderQualified`).
2. `POST /api/admin/voice-lab/synthesize` — admin-gated; returns base64 audio + provenance.
3. `POST/GET /api/admin/voice-lab/evaluations` — admin-gated; append score+notes+provenance; export.
4. `/admin/voice-lab` page — functional controls, provider-lock, blind labels, scoring, export.
5. Verify: typecheck · refusal harness (R15 incl. override path) · voice-sovereignty jest · page renders.
