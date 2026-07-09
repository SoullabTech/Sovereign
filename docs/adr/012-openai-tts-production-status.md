# ADR-012: OpenAI TTS Production Status (archetype→OpenAI default)

**Status:** Open / Deferred
**Date:** 2026-07-07
**Authors:** — (stub; the substantive ruling is reserved for Kelly)
**Reviewers:**

> **Status: Open / Deferred**
>
> This ADR exists because R15 currently references the archetype→OpenAI TTS question.
> No production authorization is granted by this document.

## Context

Refusal **R15** (`lib/tts/ttsRouter.ts` — `assertProviderQualified`) governs which TTS
providers a deployment context may *select*. In `production-maia` the qualified set is
verified-local-only (`auto`, `kokoro`); `openai`, `pplex`, and `sesame` are refused there.

R15 does **not** resolve a separate, adjacent question: the **archetype→OpenAI default**,
whereby certain MAIA voice archetypes (the "feminine" / `maia_*` family) resolve to OpenAI
cloud TTS via the archetype-intercept path in `synthesize()` — a path R15 explicitly does
not gate (see the guard comment: *"Does not touch the archetype→OpenAI path below — that is
ADR-012's open question."*). Several artifacts already cite this ADR as the decision record
for that question, but the ADR did not exist. This stub resolves the dangling reference
without pretending the question is decided.

## Decision

**None. The archetype→OpenAI question is deferred.**

No production authorization for cloud TTS on the archetype path is granted or implied by
this document. The status quo (whatever the archetype-intercept currently does) is neither
ratified nor prohibited here — it awaits a substantive ruling by Kelly. Until then:

- R15 remains the operative refusal for *explicit provider selection* (unchanged by this ADR).
- The archetype→OpenAI default remains an open governance question, not a settled policy.
- Widening any production allow-list still requires an explicit, referenced decision — this
  stub is **not** that decision.

## Consequences

### Positive
- R15 and its companion artifacts no longer cite a missing governance artifact; the PR can
  proceed with an intact reference chain.
- The open question is named and located, not silently carried.

### Negative
- The archetype→OpenAI default remains unresolved; this ADR must be revisited before any
  claim that OpenAI is absent from production, or before the archetype path is ratified.

### Neutral
- Purely documentary; no code or configuration changes accompany this stub.

## References

Artifacts that cite this ADR (the reference chain this stub closes):

- `lib/tts/ttsRouter.ts` — R15 guard comment ("governance question: docs/adr/012")
- `lib/tts/providers/personaplex.ts` — adapter header note
- `tests/constitutional/refusal-registry/refusal-15-tts-provider-qualification-guard.ts` — decision-record citation
- `docs/architecture/REFUSAL_REGISTRY.md` — R15 row + harness note ("separate open governance question")
- `docs/specs/VOICE_LAB_SPEC_2026-07-06.md` — companion-to reference

Related commits:

- `3263453a9` — feat(voice): PersonaPlex as second real TTS provider (pplex), lab-gated behind R15
- `6a7eaf9cb` — fix(voice): remove sesame from production-maia qualified providers (R15)
