# LLM Dependency Boundary Audit — 2026-06-02

**Question:** *If Claude disappeared tomorrow, what vanishes?*
**Method:** read-only call-graph, no git history. 137 LLM-calling files enumerated; relational core (`lib/sovereign`, `lib/ai`, `lib/maia`, `lib/consciousness`, `lib/memory`, `lib/oracle`) deep-classified; periphery + routes surveyed for reachability. Hypothesis held provisional — the map writes the constitution, not the reverse.
**Slice detail:** `docs/audit/LLM_DEPENDENCY_SLICE_remaining-lib.md` (adjacent lib), `tsx-501/llm-dependency-route-classification.md` (routes).

---

## Headline (verified)

On the **live relational path, MAIA's intelligence is already sovereign and Claude is already a renderer.** A live turn's differentiated cognition runs in pattern/logic/data services that make **zero LLM calls**; the only LLM contact per turn is the final response generation, which articulates a prompt MAIA has already fully assembled — and it has a local-model fallback wired.

The "Claude took over MAIA's intelligence" narrative is **not borne out by the live code.** The drift it names exists only in **secondary / feature / dormant** surfaces, never the relational core.

**Verified crux:** every corpus-callosum voice/agent file is 0-LLM — `ElementalOracleBridge` (`lib/bridges/elemental-oracle-bridge.ts`), `mythicAtlasService.ts`, `consciousness/WisdomRouter.ts`, `services/corpusCallosumService.ts`, `consciousness/maiaOrchestrator.ts`, `ShadowConversationOrchestrator.ts`. The only LLM calls in `maiaService.ts` are the five `generateText()` render/repair calls (1282 FAST, 1646 CORE, 1685/2136/3358 regen). `logCorpusCallosumTrace` (`maiaService.ts:3254`) + the `agents=atlas+maia+Nelemental` log (`:3285`) show the `agent_runs` "8 voices" are **telemetry of pattern-agents, not parallel inference.**

---

## 1. Already sovereign (survives Claude vanishing)

| Capability | Mechanism | Evidence |
|---|---|---|
| Elemental differentiation | `ElementalOracleBridge.processAll()` — pattern-matching, ~50ms | `elemental-oracle-bridge.ts` (0 LLM); `maiaService.ts:756,1385,1886` |
| Mythic context | `getMythicAtlasContext` — data/pattern | `mythicAtlasService.ts` (0 LLM); `maiaService.ts:2476` |
| Selective integration | `routeWisdom` — logic | `consciousness/WisdomRouter.ts` (0 LLM) |
| Memory recall | local **Ollama** `nomic-embed-text` embeddings + PostgreSQL | `lib/memory/embeddings.ts:17` |
| Routing / element / consent / continuity | services + DB | (sovereign substrate, prior session) |
| Engine selection | `selectClaudeModel` | `claudeClient.ts:84` |
| Atoms / themes writes | `keepSource`, `storeThemeSignal` — SQL | `portfolio.ts:334`, `maiaService.ts:3418` |
| Clinical (supervision/caseload/practice) | local Ollama only, explicit HIPAA "never external" | `ClinicalSupervisionEngine.ts:5`, `CaseConsultationService.ts:219` |
| Live conversation **degradation** | Claude primary → local Ollama/deepseek-r1 fallback (OpenAI hard-blocked) | `modelService.ts:153-192, 89-90` |

## 2. Claude-dependent (what actually uses Claude)

- **Live path (1 call/turn):** `claudeClient.ts:144` (sonnet-4-6; opus-4-6 only for `reasoningMode`) via `modelService.ts:76` → `sovereignRouter.ts:92`. **Role: Rendering** — code comment: *"MAIA's mind has already done the thinking… Claude just needs to articulate it cleanly."*
- **Secondary / feature (reachable, not core conversation):** `sessionProcessor.ts:423` (transcript→themes/episodes), bardic `TeleologyService.ts:69` / `LinkingService.ts:221`, `secondBrainClassifier.ts:137`, `conversationEssenceExtractor.ts:99`, `generatePatternIntelligence.ts:173`, `UnifiedInsightEngine.ts:180,404`, feature routes (`ask`, `guidance`, `studio`, `spiralogic-report`).

## 3. Claude-dependent **by design** (keep model-mediated)

- The live response **rendering** (`generateText` → Sonnet, local fallback). This *is* the boundary you want.
- `portal/[slug]/chat` (intentionally needs `tool_use`).
- High-quality prose/synthesis — the depth layer that does **not** degrade gracefully to a 7B local model.

## 4. Claude-dependent **by accident** (drift)

- `sessionProcessor.ts:423` classification on a reachable route, **no fallback** — feeds memory; intelligence delegated.
- No-fallback feature routes: `maia/relational-navigation` (opus-4-7), studio `interpret`/`mentor`, `scribe/live-prompts` (haiku) — vanish entirely without Claude.
- bardic memory interpretation (vector-replaceable).
- **OpenAI** sites in memory: `MemoryCompressor` (gpt-3.5), `OpenAIEmbedder`, `LlamaIndexService` (ada-002), bardic `EmbeddingService` route — non-sovereign drift (mostly dormant).

## 5. High-risk dependencies

- **Universal voice-quality:** if Claude vanished, *every* live response drops to local-Ollama prose — materially lower quality. By design, but the one universally-felt loss.
- **`sessionProcessor` extraction** feeding atoms/themes (no fallback). *(Note: atom writes are already stalled for an unrelated routing reason — see `project_live_path_model_and_write_reality`.)*
- **Live non-sovereign — voice layer:** **OpenAI TTS is PRIMARY** (`UnifiedVoiceRouter.ts:8,50`; fallbacks `SesameVoiceService.ts:460,495`) + `FileIngestionService.ts:350` (gpt-4) / `:272` (text-embedding-3-small). This is *expression*, not intelligence — and matches your stated "OpenAI TTS preference" — but it is the one live non-Claude/non-local cloud dependency.
- **Dormant landmines (sovereignty violations if revived):** `app/api/_backend/*` (OpenAI clients + `supabase/functions/oracle-ritual-response.ts` = OpenAI **and** Supabase, double canon violation); Moonshot/**Kimi** (China cloud, flag-gated `MAIA_ENABLE_MULTI_ENGINE`); `PersonalOracleAgent` gpt-4 fallback.

## 6. Reclaim plan (provisional — map, not canon)

**Tier A — graceful-degradation gaps (cheap, clear):** add local-model fallback to the no-fallback feature routes (`relational-navigation`, studio, `scribe/live-prompts`) so they *degrade* instead of *vanish*. Move classification/extraction (`sessionProcessor` themes/episodes, `secondBrainClassifier`, `conversationEssenceExtractor`, `generatePatternIntelligence`) to local models — this is exactly the "utility layer" that degrades well.

**Tier B — sovereignty hygiene:** quarantine/remove the dormant OpenAI sites (`MemoryCompressor`, `OpenAIEmbedder`, `LlamaIndexService`) and the `_backend` OpenAI+Supabase function; decide the voice layer (keep OpenAI TTS as stated preference, or move local) **explicitly** rather than by drift.

**Tier C — deliberate, leave alone:** the live response render stays Claude-primary + local fallback. **Don't touch** the elemental bridge, memory recall, routing, consent — already sovereign.

---

## Provisional constitution (NOT canon — the map's verdict)

> **Hypothesis:** *LLMs may render MAIA's voice, but must not replace MAIA's relational intelligence.*

**Verdict:** on the live path this is **already substantially true.** Canonizing it would **ratify reality, not redirect it.** The reclaim work is modest (add fallbacks, relocate a handful of extraction services, clean up dormant violations) — not a ground-up rebuild.

**One residual check before canon:** `runShadowEngines` (`maiaService.ts:3121` → `lib/learning/shadowModeRunner`) is a background learning/engine-comparison path not classified here; confirm it's off the member render path and whether it invokes LLMs. It does not affect the live-turn conclusion.

*Authorship note: this map was produced with Claude. The canon it points toward is Kelly's to write — downstream of this reality, human-pulled. An LLM should not author the rule that constrains LLMs.*
