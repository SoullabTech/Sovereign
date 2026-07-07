# OpenAI Quarantine Ledger

> **AUTHORITATIVE SOURCE = the Provider Governance layer** (`docs/canon/PROVIDER_GOVERNANCE.md` + machine-readable `scripts/provider-policy.json`, enforced by `npm run check:no-openai`). That guard structurally **fails on any NEW OpenAI surface** and tracks the enumerated migration debt (53 files as of 2026-07-07) toward zero, burn order: browser keys → TTS → `_backend` → deps → key. **This ledger does not compete with it** — it adds a *reachability annotation* the flat allowlist doesn't encode: which debt files are **dormant** (no live path — safe/deferrable) vs **live** (urgent) vs **voice-adjacent** (hands off). Consult the policy for what's enforced; consult this for how dormant each item is.

**Created:** 2026-07-07 · Sovereignty completion plan, step 4.1 (dormant quarantine).
**Scope of this pass (authorized, narrow):** *record* the dormant OpenAI-using files so future audits don't overstate live dependency. **No code moved or deleted, no dependency removed, no key removed, no TTS/voice file touched.** This is the "mark" form of quarantine — a central manifest with reachability evidence — chosen over per-file edits because a concurrent session holds uncommitted voice work across the tree.

**Method:** transitive reachability BFS (`scripts` in session scratchpad `reach-openai.js`) from each `lib/` OpenAI call site up to a real production entrypoint (`app/**/route.ts` | `page.tsx`; `_backend`/backup excluded as entrypoints). **Limit:** proves graph-membership, not per-request execution; `/the-beginning` + `_backend` test-harness barrels overstate reachability. Re-verified 2026-07-07 (unchanged from 2026-07-06).

---

## QUARANTINED — dormant, non-voice, no path to a live entrypoint (13)

Treat as **inert** for audit purposes. Each references OpenAI but is reachable from no production route or page. Do **not** wire any of these to a live surface without a sovereignty review (they would reintroduce a cloud dependency).

- `lib/agents/utils/OracleAI.ts`
- `lib/consciousness/CollectiveWisdomField.ts`
- `lib/consciousness/WeQIngestionQueue.ts`
- `lib/integrated-oracle-system.ts`
- `lib/langchain/DecentralizedMayaChains.ts`
- `lib/maia/claude-elemental-connection.ts`
- `lib/maia/maia-router.ts`
- `lib/multi-tenant/TenantKnowledgeBase.ts`
- `lib/obsidian-knowledge-integration.ts`
- `lib/orchestration/awaken-maya.ts`
- `lib/services/FileIngestionService.ts`
- `lib/sovereignty/LocalVectorDB.ts`
- `lib/vectors/soulIndex.ts`

Plus `lib/maia-sdk.DISABLED/*` (explicitly disabled) and the 23 `app/api/_backend/src/**` legacy files (a vendored tree; not the live spine).

## EXCLUDED from this pass — voice-adjacent (hands off)

Voice is owned by a concurrent session (PersonaPlex + refusal-15 TTS guard). **Do not touch**, even where dormant. Re-evaluate only after that session hands off.

- Dormant voice-adjacent: `lib/voice/MaiaRealtimeClientDirect.ts`, `lib/voice/PersonalizedVoiceService.ts`, `lib/services/UnifiedVoiceRouter.ts`, `lib/services/VoiceServiceWithFallback.ts`, `lib/monitoring/MaiaRealtimeMonitor.ts`
- Live voice/TTS (OpenAI TTS or transcribe-era): `lib/voice/maiaVoiceService.ts`, `lib/tts/openaiTts.ts`, `lib/tts/ttsRouter.ts`, `lib/consciousness/OpenAIVoiceSynthesis.ts`, `lib/services/SesameVoiceService.ts`, `lib/voice/streamTranscribe.ts`, `lib/sovereignty/TTSSovereigntyMonitor.ts`

## LIVE — not dormant, NOT quarantined (needs migration, not marking)

Reachable from a production entrypoint; real (or weak-but-real) dependencies. Future work, not this pass:

- **Already sovereign:** `lib/vector-embeddings.ts` — now routes to local nomic via `embedWithOllama`; the OpenAI methods it still contains are **dead** (removal = a later step). Appears in OpenAI greps only because of that dead code.
- **Live OpenAI embedding (dormant-weak surfaces):** `lib/book-knowledge-vectorizer.ts` (founder pipeline), `lib/memory/embeddings/OpenAIEmbedder.ts` + `lib/memory/semantic/LlamaIndexService.ts` (oracle-beta dashboard) — migrate under step 4.2/step 2-followup.
- **Live OpenAI text (secondary traffic):** `lib/ai/openaiClient.ts` + `lib/utils/modelService.ts` (studio/session-followup), `lib/agents/PersonalOracleAgent.ts` / `lib/oracle/PersonalOracleAgent.ts` / `lib/elemental-oracle-2-bridge.ts` (oracle/memory, low traffic), `lib/maia/sessionProcessor.ts`, `lib/consciousness/ProgressiveWisdomInjection.ts` / `lib/maia-consciousness-lattice.ts` (empowerment), `lib/safety/sentiment.ts`.

---

## Standing constraints on the quarantine track
- `OPENAI_API_KEY` **retained** — removal is HELD until TTS + `_backend` are resolved (removing early breaks the presented voice relationship).
- Each cleanup runs in an **isolated pass**: quarantine ≠ dependency removal ≠ key removal ≠ the `jsonb → vector(768)` search migration. Close active capability first, then burn down dormant debt one pass at a time.
