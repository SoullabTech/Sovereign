# Sovereign Routing Coverage Audit

**Date:** 2026-05-19
**Status:** Diagnostic — no cuts proposed yet. Surface this to user before any refactor.
**Doctrine triggers:** Pause requirement at deploy sequencing · Sequential cuts preserve signal · Diagnosis first, surgery second.

---

## Headline finding

The Phase 1 runbook names **3 known bypasses**. The actual surface is **~45+ files** importing `@anthropic-ai/sdk` directly, and **~6 high-leverage callers** of `getClaudeService()` (a separate gateway that itself bypasses `sovereignRouter`).

**Only one file in the entire app routes through the sovereign path: `lib/ai/modelService.ts`.**

This is the mismatch with stated scope. Do not proceed to refactor without acknowledgment of the actual surface size.

---

## Routing topology (current runtime)

```
sovereignRouter ← modelService.generateText ← [unknown small set of callers]
                                              (need to audit who calls modelService)

@anthropic-ai/sdk ← ~45 direct importers (bypass)
ClaudeService.ts  ← ~6 oracle/agent/voice callers (bypass via gateway)
```

**Leverage point:** `lib/services/ClaudeService.ts` is the single gateway for voice + oracle + agent surfaces. Routing *it* through `sovereignRouter` collapses many bypasses at once.

---

## Bypass classification (by surface category)

### Tier A — User-facing cognition (highest priority)
Direct user-visible reasoning. These produce the responses members read/hear.

- `lib/services/ClaudeService.ts` — central gateway (used by 6+ callers below)
  - `lib/oracle/core/MayaIntelligenceOrchestrator.ts`
  - `lib/services/MaiaOrchestrator.ts`
  - `lib/integrated-oracle-system.ts`
  - `lib/agents/modules/ResponseGenerator.ts`
  - `lib/agents/elemental/FireAgent.ts`
  - `app/api/voice/stream-conversation/route.ts` (voice realtime)
- `lib/consciousness/MAIAUnifiedConsciousness.ts` — 3 direct Anthropic calls
- `lib/consciousness/LLMProvider.ts`
- `lib/consciousness/relationalCheckin.ts`
- `lib/complete-sacred-oracle.ts`, `lib/elegant-sacred-oracle.ts`, `lib/layered-sacred-oracle.ts`
- `lib/ai/claudeClient.ts`, `lib/ai/ClaudeBridge.ts`
- `app/api/_backend/maia-i-thou.js`
- `app/api/_backend/maia-triad-conversation.js`, `maia-triad-continue.js`
- `app/api/_backend/maia-ask-needs.js`
- `app/api/_backend/maia-first-contact-direct.js`, `maia-first-reflection.js`
- `app/api/_backend/maia-session-closing.js`, `maia-supervision-session.js`
- `app/api/_backend/src/core/UnifiedOracleCore.ts`
- `app/api/_backend/src/services/ElementalIntelligenceRouter.ts`
- `app/api/portal/[slug]/chat/route.ts`

### Tier B — Memory / pattern / interpretation (post-conversation cognition)
Not realtime to the member but shapes what MAIA remembers and infers about them.

- `lib/memory/bardic/LinkingService.ts`, `TeleologyService.ts`
- `lib/patterns/generatePatternIntelligence.ts`
- `lib/dialectical-ai/core.ts`
- `lib/transcript-analysis/PatternExtractor.ts`, `TranscriptAnonymizer.ts`
- `lib/secondbrain/secondBrainClassifier.ts`
- `lib/scribe/sovereignSummarizer.ts` *(naming irony — named "sovereign" but bypasses the router)*
- `lib/scribe/sessionSummaryGenerator.ts`
- `lib/maia/sessionProcessor.ts`
- `lib/services/conversationEssenceExtractor.ts`
- `lib/services/UnifiedInsightEngine.ts`
- `lib/team/maiaReflectService.ts`, `maiaThreadReflection.ts`
- `lib/songwriter/seedInterpreter.ts`
- `lib/story/archetypalNarrativeService.ts`
- `lib/astrology/spiralogicReportGenerator.ts`
- `lib/consciousness/CacheWarmingService.ts`

### Tier C — Content pipeline / library (corpus processing)
Distillation of source material. Probably exempt from sovereignty enforcement *for now* but should still route through a logged path.

- `lib/content/transformer.ts`, `extractor.ts`
- `lib/content-pipeline/transformer.ts`, `extractor.ts`, `qualityFilter.ts`
- `lib/pipelines/document-analysis.ts`
- `lib/consultation/claude-consultation-service.ts`

### Tier D — Tooling / scripts (likely exempt)
Not runtime. Likely fine to remain direct, but should be documented.

- `scripts/audit-sovereignty.ts` *(meta-irony: the auditor itself uses raw SDK)*
- `scripts/library/distillSource.ts`
- `scripts/generate-chapter-illustrations.ts`
- `scripts/backfill-maia-turns-summaries.ts`
- `app/api/anthropic/ping/route.ts` *(health probe)*
- `app/api/_backend/src/services/hallucination-testing/maiaModelRunner.ts` *(test harness)*
- `lib/maia-sdk.DISABLED/providers/claude.ts` *(already disabled)*

---

## Mismatch with previous stated scope

| Previously documented | Actually observed |
|---|---|
| Voice reasoning | ✓ confirmed — but routes via `getClaudeService()`, which itself bypasses |
| Consciousness dialogues (2 files) | Understated — at least 14 files in `app/api/_backend/maia-*.js` + 4 in `lib/consciousness/*` |
| Elemental router | ✓ confirmed at `app/api/_backend/src/services/ElementalIntelligenceRouter.ts` |
| *(not listed)* | **Memory / interpretation tier (Tier B)** — entire post-conversation cognition surface |
| *(not listed)* | **Sacred oracle variants** — 3 separate files |
| *(not listed)* | **`ClaudeService.ts` as central gateway** — biggest single-file leverage point |

The runbook said "current known bypasses." The audit reveals that "known" was a small subset.

---

## What I am *not* doing

- Not starting any refactor.
- Not collapsing tiers into one PR.
- Not flipping routing defaults.
- Not enforcing the engineering invariant codified in the Phase 1 doc until the actual surface size is acknowledged and a sequencing decision is made.

---

## Decisions needed from user (before any cut)

1. **Acknowledge actual surface size.** ~45 files, ~6 gateway callers, 4 tiers — not 3 surfaces.
2. **Confirm cut sequence.** Recommended order:
   - **Cut 1:** Route `lib/services/ClaudeService.ts` through `sovereignRouter`. Collapses ~6 Tier A callers in one move. Highest leverage, lowest blast radius (one file changes, downstream callers unchanged).
   - **Cut 2:** Each Tier A `app/api/_backend/maia-*.js` script individually. One per commit.
   - **Cut 3:** `lib/consciousness/*` Anthropic call sites (4 files).
   - **Cut 4:** Tier B (memory/interpretation) — separate decision per file. Some may need their own router policy (e.g., interpretation memory should probably default to local even in `primary` mode, per the *Right to Remain Unpossessed* canon).
   - **Cut 5+:** Tier C/D — documented exemptions with rationale per file.
3. **Engineering invariant.** Codify: *No cognitive surface bypasses `sovereignRouter` without documented exemption in this file.* Add this to the Phase 1 doc as the live invariant.
4. **Audit script.** Replace `scripts/audit-sovereignty.ts` (which itself bypasses) with one that lints for raw `@anthropic-ai/sdk` imports outside the exemption list.

---

## Doctrine alignment

- **Diagnosis first, surgery second** — this file is the classification map. No surgery yet.
- **Sequential cuts preserve signal** — each tier change is observable in isolation.
- **Pause requirement at deploy sequencing** — surfaced the mismatch before any push.
- **In-file invariant via docstring** — proposed for Phase 1 doc + each refactored gateway.
- **Right to Remain Unpossessed** — Tier B (memory/interpretation) likely needs stronger default than Tier A. Interpretation traffic crossing to external substrate is the operational form of "the edges we commit to not drawing."

---

## Open questions

- Is `getClaudeService()` reachable when `MAIA_INFERENCE_MODE=sovereign` is set? Currently it does *not* check the mode — it goes straight to Anthropic. **This means setting `sovereign` mode does not actually enforce sovereignty on voice/oracle surfaces.** That is the architectural drift in concrete form.
- Should `ClaudeService` route through `sovereignRouter`, or should it be deprecated in favor of `modelService.generateText` directly? (Recommendation: route through, don't deprecate yet — the streaming API surface in `ClaudeService` is non-trivial to replace mid-refactor.)
- Does `sovereignRouter` currently support streaming? If not, that is a blocker for Cut 1 (voice realtime uses `generateOracleResponseStreaming`).
