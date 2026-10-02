# Interaction Engine / Voice Abstraction Layer — Held Direction (Cat 1)

> **Status:** Preserved direction (six-category typology **Cat 1** — held, not authorized).
> Direction ratified 2026-07-26 (Kelly). The discovery audit (§7 Prompt 1) is **complete**
> and the **TTS-seam architecture is ratified** (see Ruling below); **Phase 0 hygiene** is
> authorized. Provider *admission* (Inworld) and MAIA's *public voice default* remain gated
> on explicit founder rulings — and, for Inworld specifically, a canon amendment (see §5).

---

## Ruling — 2026-07-26 (Kelly)

**On the fork "what should MAIA's default voice be after Phase 0?" (Option 3 chosen):**

> **MAIA's cognitive identity is provider-independent. Voice rendering is a governed
> presentation layer whose default may change only by explicit founder decision after
> comparative evaluation.**

Operative consequences:

1. **Ratified — the TTS seam as architecture.** Route all MAIA TTS through the existing
   provider-neutral `lib/tts/ttsRouter.ts`; remove the duplicate direct-OpenAI bypass in
   `app/api/voice/openai-tts/route.ts`. One governed decision point, one audit trail.
2. **Default voice unchanged in Phase 0 — MAIA keeps OpenAI.** No member-facing voice change.
   This is *architecture hygiene, not provider expansion*. (Voice rendering is a distinct layer
   from cognition/memory/authorship, which stay identical regardless of renderer — "a
   voice-render question, not a mind question.")
3. **Kokoro is NOT auto-ratified as the permanent default.** Its being deployed + healthy does
   not make it the default; cadence, prosody, pronunciation, pauses, and warmth are
   member-facing and must be *evaluated*, not assumed.
4. **Next (separate from the Phase 0 PR): a structured A/B evaluation** — OpenAI vs Kokoro vs
   future local voices, over the *same* real MAIA interactions.
5. **Then: an explicit founder ruling** on MAIA's public voice default. Until that ruling, the
   default stays OpenAI. This resolves the disposition of the archetype→OpenAI open question
   the router flags as "ADR-012's open question" (`ttsRouter.ts:174-176`, `:187-223`): it is
   now *governed* (founder-decision-after-evaluation), not open-ended.

**Governance pattern (Kelly):** *infrastructure first, admissibility second* — identical to the
provider-governance discipline applied elsewhere; here the "provider" is a voice renderer rather
than a reasoning model, but the pattern holds.

**Wording discipline:** avoid "flip to local Kokoro now"; frame any future default change as a
governed presentation-layer decision made by founder ruling after comparative evaluation.

---

## 1. The architectural shift being preserved

The constitution is no longer the voice engine. **The constitution is the *governor* of the
voice engine.** MAIA's identity does not live in any provider; it lives in the layers AIN owns.
Providers render — they do not mean.

Two framings, one principle:

```
        MAIA                             MAIA
  Consciousness Layer          Intent Generator  ("what is true to say?")
  (Elemental Alchemy,                  ↓
   Spiralogic)                 Expression Engine ("how should it be expressed?")
        ↓                              ↓
  Constitutional Layer         Interaction Engine ("when? how fast? interrupt? pause?")
  (what may / may not happen)          ↓
        ↓                       Voice Renderer    ("how does it sound?")
  Conversation Layer
  (reasoning, memory, invitations)
        ↓
  Realtime Interaction Layer
  (voice, interruption, emotion, timing, latency, streaming)
        ↓
  Infrastructure Providers
  (OpenAI, Anthropic, Inworld, …)
```

Today AIN owns the top three (five-layer) / top two (four-layer). The realtime/interaction
and voice layers are candidates for *governed, replaceable* provider infrastructure —
never for ownership of meaning.

## 2. Why this is already canon, not a new idea

This generalizes the **Provider Governance** principle down the stack:

> *"Providers are replaceable, governable infrastructure beneath MAIA's identity — never the
> identity itself."* — `docs/canon/PROVIDER_GOVERNANCE.md`

- The provider-neutral `MaiaResponse` / `SpeechRenderer` object is the same discipline as
  ADR-013 context assembly and the FIS Field-State primitive: one interface, many renderers.
- The "what a provider may **not** own" list below is the Sovereignty Invariants restated.

## 3. The boundary (what AIN owns vs. what a provider may render)

**AIN owns — never delegated to any provider:**
constitutional & relational stance · Elemental Alchemy / Spiralogic intelligence · memory &
continuity · member consent & privacy boundaries · tool selection & execution · response
authorship & expression policy · model-routing policy · transcript persistence · the
member-visible distinction between text and spoken response.

**A provider may supply — replaceable infrastructure only:**
speech-to-text · text-to-speech · realtime audio transport · voice-activity detection ·
turn detection · interruption / barge-in mechanics.

**A provider must never:** become MAIA · own MAIA's memory or identity · become the only
route through which MAIA can speak · author MAIA's response · receive member memory,
journals, profile, or session history beyond the finalized utterance text needed to render.

## 4. Named subsystem: the Interaction Engine

A subsystem AIN has not previously named explicitly. **Not reasoning. Not memory. Not
speech. Interaction.** Responsibilities: turn-taking · silence · interruptions · pacing ·
vocal gestures · acknowledgements · timing · repair · latency · streaming · voice
rendering. It exposes an AIN-owned interface; a provider (initially perhaps Inworld) may
power it underneath, but the application depends only on AIN's contracts.

## 5. Governance tension — the load-bearing caveat (READ BEFORE PROMPT 2)

Admitting Inworld as a *runtime* provider is **not** a neutral infrastructure experiment
under current canon. It runs *against* the sealed posture:

1. **Provider Governance is a one-directional burn-down.** `check-provider-governance.ts`
   scans tracked source and **fails the build** on new provider surfaces; the
   `provider-policy.json` allowlist "can only shrink." New surfaces cannot enter.
2. **The current TTS direction is *toward local*.** The documented burn order retires OpenAI
   TTS in favor of **Kokoro (local)**. STT is already local (faster-whisper); episodic
   embeddings already local (nomic).
3. **CLAUDE.md sovereignty rule:** *"Voice: Local TTS/STT or browser APIs only. Never use
   OpenAI or other cloud AI providers."*

Therefore: **introducing Inworld TTS is a founder ruling that requires amending both
`docs/canon/PROVIDER_GOVERNANCE.md` (to admit a governed cloud voice-render tier) and the
CLAUDE.md voice rule.** The abstraction/consolidation work (§4, seams) is canon-safe and
provider-neutral and does *not* require that ruling; the *provider admission* does.
The discovery audit (§7) is read-only and requires no ruling at all.

## 6. Six-category placement

- **Cat 1 (held, this doc):** the Interaction Engine / Voice Abstraction *direction*.
- Would become **Cat 6 (live runtime authority)** only after: (a) the audit, (b) a founder
  provider-admission ruling + canon amendment, (c) a flagged, reversible, verified rollout.
- *Discipline reminder:* declaration ≠ liveness; built ≠ wired; wired ≠ surfacing;
  surfacing ≠ verified. Name the mechanism (*provider-neutral speech rendering*), not the
  mythology (*living conversation*), until measured.

## 7. Authorized sequence (Kelly, 2026-07-26)

| # | Step | Status |
|---|------|--------|
| 1 | **Voice architecture audit** (Prompt 1) — discovery only, no code | **AUTHORIZED NOW** → `VOICE_INTERACTION_ARCHITECTURE_AUDIT_2026-07-26.md` |
| 2 | Extract provider-neutral speech interfaces; Inworld TTS-2 behind a flag, OpenAI fallback | **GATED** — needs review of audit + founder provider-admission ruling + canon amendment (§5) |
| 3 | Prove streaming speech on mobile | GATED |
| 4 | Realtime Interaction Engine: interruption + turn-taking (cognition stays in AIN) | GATED |
| 5 | Route selected *expression* work to open models | GATED |
| 6 | Open-model *cognition* migration (turn-class routing taxonomy) — kept independent of voice PRs | GATED |
| 7 | Only then evaluate Inworld's full realtime speech-to-speech API (currently a research preview) | GATED |

**Rationale for TTS-first:** Inworld's streaming TTS endpoint is production-addressable now;
its integrated speech-to-speech Realtime API is described as a research preview. TTS-first
avoids muddling cognition, expression, transport, and voice into one broad replacement.

## 8. Cross-links

- Canon: `docs/canon/PROVIDER_GOVERNANCE.md` · `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md`
- Related memory: `project_provider_governance_layer` (SEALED) ·
  `project_openai_removal_embeddings_live` · `project_openai_sovereignty_completion_plan`
  (core = Claude) · `project_mobile_voice_investigation` ·
  `project_kimi_k3_integration_audit` (hosted provider NOT admitted — precedent for §5) ·
  `project_multi_model_delegation_standard`
- Prior art in repo: `lib/services/VoiceService.ts`, `VoiceServiceWithFallback.ts`,
  `UnifiedVoiceRouter.ts`, `lib/voice/*` (~100 files), `MaiaRealtimeWebRTC.ts.DISABLED`.
