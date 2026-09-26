---
level: architecture
---

# MAIA WIRING AUDIT v1.0

**Status:** Diagnostic companion to `MAIA_CURRENT_STATE_v1.0.md`
**Scope:** Phase A.5 — read-only import-graph trace from live entry points through `lib/memory`, `lib/consciousness`, `lib/spiralogic`, `lib/oracle`, `lib/services`, `lib/maia`, `lib/sovereign`, and `app/api/ain/`
**Excluded:** `app/api/_backend/**` (legacy Maia-Pai tree), `components/**` (UI), tests, scripts, migrations
**Rule:** Every classification cites a file:line import chain, a gate, or a documented grep result. No speculation.
**Date:** 2026-04-09
**Companion canons:** `MAIA_CURRENT_STATE_v1.0.md`, `MAIA_MEMORY_CANON_v1.0.md`

---

## Classification labels

| Label | Meaning |
|---|---|
| **ACTIVE** | Reachable from a live entry point AND executed during a normal turn |
| **REACHABLE_NOT_INVOKED** | Imported by a reachable file but gated off (env var, feature flag, specific input pattern, rare branch) |
| **ORPHAN** | File exists in tree but is not referenced by any entry-point import chain |
| **PROTOTYPE** | File marked `@ts-nocheck`, explicit `prototype` / `experimental` / `draft` comment, or otherwise not production-ready |

## Entry points traced

1. `app/api/between/chat/route.ts` — primary member chat path
2. `app/api/oracle/conversation/route.ts` — alternate oracle path
3. `lib/consciousness/maiaOrchestrator.ts` — orchestration hub (called by both routes)
4. `lib/sovereign/maiaService.ts` — sovereign service layer (`getMaiaResponse`)
5. `lib/memory/MemoryWriteback.ts` — verified-active writeback path
6. `lib/memory/MemoryBundle.ts` — verified-active retrieval path

## Production environment facts (gate conditions)

**Set in production:**
```
ALLOW_ANTHROPIC_CHAT=true
ALLOW_ANTHROPIC_CONSCIOUSNESS=false
MAIA_SAFE_MODE=false
MAIA_PFI_FULL_INTEGRATION=true
MAIA_PFI_MIND=true
MAIA_LONGTERM_WRITEBACK=1
MAIA_SELFLET_ALLOW_ANON=0
MAIA_SELFLET_WRITE_ENABLED=0
MAIA_EMBEDDINGS_MODE=queue
```

**Not set (feature off):**
```
AIN_KNOWLEDGE_GATE_ENABLED
AIN_CONSULTATION_ENABLED
```

---

## Section 1 — Entry-point import summary

### 1.1 `app/api/between/chat/route.ts` (primary member chat)

In-scope imports:
- `@/lib/consciousness/maiaOrchestrator` — `generateMaiaTurn`, `generateSimpleMaiaResponse`
- `@/lib/consciousness/intentRouter` — `detectIntent`, `getIntentRoute`, `buildUiAction`
- `@/lib/consciousness/awareness-levels` — `inferAwarenessFromRelationship`
- `@/lib/consciousness/WisdomFieldPrimer` — `getWisdomPrimerForUser`
- `@/lib/consciousness/epistemicPathPrompt` — `buildEpistemicPathAddendum`
- `@/lib/consciousness/therapeuticFrameworks` — `getFrameworkPromptAddendum`
- `@/lib/consciousness/nameChangeDetection` — `processNameChangeIfDetected`
- `@/lib/consciousness/relationshipPolicy` — `buildRelationshipAddendumForUser`
- `@/lib/consciousness/participatoryRealityHelper` — `detectThemes`, `storeThemeSignal`
- `@/lib/consciousness/ideaDetection` — `detectIdeaCandidate`
- `@/lib/consciousness/spiralSnapshot` — `computeMemberSpiralState`
- `@/lib/consciousness/wuxingSnapshot` — `computeWuXingMoment`
- `@/lib/consciousness/bridgedSnapshot` — `buildBridgedSnapshot`
- `@/lib/consciousness/integrityCheck` — `checkResponseIntegrity`
- `@/lib/maia/state-vector/stateDefaults` — `inferStateVector`
- `@/lib/memory/RelationshipMemoryService` — `loadRelationshipMemory`
- `@/lib/memory/SignificantMomentsService` — `loadSignificantMoments`
- `@/lib/memory/DevelopmentalMemory` — `developmentalMemory`
- `@/lib/memory/selflet` — `loadSelfletContext`
- `@/lib/sovereign/sessionManager` — `getConversationHistory`
- `@/lib/sovereign/decisionGovernor` — `decisionPreflight`
- `@/lib/sovereign/http/canonHeaders` — `makeCanonHeaders`

### 1.2 `app/api/oracle/conversation/route.ts` (alternate oracle path)

In-scope imports:
- `@/lib/consciousness/panconscious-field` — `PanconsciousFieldService`
- `@/lib/consciousness/spiralogic-core` — `inferSpiralogicCell`, `chooseFrameworksForCell`
- `@/lib/consciousness/cognitiveProfileService` — `getCognitiveProfile`
- `@/lib/consciousness/LLMProvider` — `MultiLLMProvider`
- `@/lib/consciousness/processingProfiles` — `profileToConsciousnessLevel`
- `@/lib/consciousness/RelationshipAnamnesisPostgres` — `getRelationshipAnamnesis`
- `@/lib/consciousness/memory/MemoryPalaceOrchestrator` — `memoryPalaceOrchestrator`
- `@/lib/consciousness/innerGuideField` — `detectFacet`, `getFacet`
- `@/lib/consciousness/innerGuideFieldPrompt` — `buildInnerGuideFieldPrompt`
- `@/lib/consciousness/cmPractitionerEnvironment` — `getCMEnvironmentBlock`
- `@/lib/consciousness/ideaDetection` — `detectIdeaCandidate`
- `@/lib/consciousness/spiralStatePersistence` — `loadSpiralState`
- `@/lib/maia/prompts/activeThemeBlock` — `buildActiveThemeBlock`
- `@/lib/memory/MemberLiveContext` — `buildMemberLiveContext`
- `@/lib/oracle/iching` — `buildReflectionFromConductor`
- `@/lib/services/maiaAstrologyContextService` — `getAstrologyContextForUser`
- `@/lib/sovereign/http/canonHeaders` — `makeCanonHeaders`

### 1.3 `lib/consciousness/maiaOrchestrator.ts` (orchestration hub)

In-scope imports:
- `@/lib/consciousness/safe-gebser` — `safeGebserAnalysis`
- `@/lib/consciousness/safe-elemental-field` — `safeElementalFieldState`, `safeElementalFieldSummary`
- `@/lib/consciousness/conversational-elemental-intelligence` — `ConversationalElementalIntelligence`
- `@/lib/consciousness/FacetDecisionLoop` — `computeFacetDecision`
- `@/lib/consciousness/conversationContext` — `getConversationContext`
- `@/lib/memory/MemoryBundle` — `MemoryBundleService`
- `@/lib/memory/MemoryWriteback` — `MemoryWritebackService`
- `@/lib/memory/MemoryGate` — `resolveMemoryMode`
- `@/lib/memory/sensitivePatterns` — `containsSensitiveData`
- `@/lib/sovereign/maiaService` — `getMaiaResponse`
- `@/lib/ain/knowledge/RetrievalService` — `retrieveForMode`, `formatForPrompt`
- `@/lib/services/corpusCallosumService` — `logAgentRun`, `logIntegrationPass`

### 1.4 `lib/sovereign/maiaService.ts` (sovereign service layer)

In-scope imports:
- `@/lib/consciousness/awareness-levels` — `inferAwarenessLevel`, `createConsciousnessPolicy`
- `@/lib/consciousness/cognitiveProfileService` — `getCognitiveProfile`
- `@/lib/consciousness/participatoryRealityHelper` — `detectThemes`, `storeThemeSignal`
- `@/lib/consciousness/WisdomRouter` — `routeWisdom`
- `@/lib/consciousness/activeThread` — `deriveActiveThread`
- `@/lib/memory/RelationshipMemoryService` — `loadRelationshipMemory`
- `@/lib/memory/ConsciousnessMemoryLattice` — `lattice`
- `@/lib/memory/sensitivePatterns` — `containsSensitiveData`
- `@/lib/memory/stores/TurnsStore` — `TurnsStore`
- `@/lib/memory/stores/ConversationMemoryUsesStore` — `ConversationMemoryUsesStore`
- `@/lib/memory/MemoryOrchestrator` — `memoryOrchestrator`
- `@/lib/maia/state-vector` — `parseStateVector`, `storeStateVector`

### 1.5 `lib/memory/MemoryWriteback.ts`

Leaf service. No in-scope outbound imports.

### 1.6 `lib/memory/MemoryBundle.ts`

In-scope imports:
- `@/lib/memory/stores/TurnsStore` — `TurnsStore`
- `@/lib/memory/embeddings` — `generateLocalEmbedding`
- `@/lib/memory/confidenceDecay` — `calculateDecayedConfidence`
- `@/lib/memory/stores/ConversationMemoryUsesStore` — `ConversationMemoryUsesStore`

---

## Section 2 — Classification tables

### Table 1: `lib/memory/`

| File | Classification | Evidence | Notes |
|---|---|---|---|
| `AINMemoryPayload.ts` | ACTIVE | Imported by 11 modules (ain/routes, services) | Rich memory format |
| `ConsciousnessMemoryLattice.ts` | PROTOTYPE | `@ts-nocheck` line 1; imported by `maiaService.ts:39` | Prototype in active path |
| `DevelopmentalMemory.ts` | ACTIVE | Imported by `chat/route.ts:37` | Called in route handler |
| `ElementalState.ts` | ACTIVE | 1 importer | Elemental tracking |
| `MemberLiveContext.ts` | ACTIVE | Imported by `oracle/route.ts:57` | Build live context |
| `MemoryBundle.ts` | ACTIVE | Imported by `maiaOrchestrator.ts:25` | Verified live (Phase A) |
| `MemoryGate.ts` | ACTIVE | Imported by `maiaOrchestrator.ts:27` | `resolveMemoryMode` at line 357 |
| `MemoryManager.ts` | ORPHAN | Zero in-scope importers | Duplicate of orchestrator pattern |
| `MemoryOrchestrator.ts` | PROTOTYPE | `@ts-nocheck`; imported by `maiaService.ts:57` | Parallel recall path — see §3 finding #3 |
| `MemoryUpdater.ts` | PROTOTYPE | `@ts-nocheck`; never imported | Dead prototype |
| `MemoryWriteback.ts` | ACTIVE | Imported by `maiaOrchestrator.ts:26` | Verified live (Phase A) |
| `RelationshipMemoryService.ts` | ACTIVE | `chat/route.ts:27`, `maiaService.ts:50-54` | Both routes |
| `SemanticMemoryService.ts` | PROTOTYPE | `@ts-nocheck`; never imported | Dead prototype |
| `SignificantMomentsService.ts` | ACTIVE | Imported by `chat/route.ts:28` | Used in prompt assembly |
| `SymbolicPredictor.ts` | ACTIVE | 2 importers | Pattern prediction |
| `UnifiedMemoryInterface.ts` | PROTOTYPE | `@ts-nocheck`; never imported | Legacy abstraction |
| `VaultSymbolIndex.ts` | ORPHAN | Zero in-scope importers | Replaced by SymbolicPredictor |
| `bardic/**` | ORPHAN | No entry-path references | Legacy holoflower memory system |
| `beads-sync/**` | ORPHAN | No route references | Example integration code |
| `compression/**` | ORPHAN | No route references | Future candidate |
| `confidenceDecay.ts` | ORPHAN | Only used internally by MemoryBundle via relative path | Helper, not re-exported |
| `core/MemoryCore.ts` | ORPHAN | No imports | Abstraction layer |
| `embeddings.ts` | ACTIVE | Imported by `MemoryBundle.ts:15` | `generateLocalEmbedding` |
| `embeddings/OpenAIEmbedder.ts` | ORPHAN | Not directly imported | Unused variant |
| `embeddings/SimpleEmbedder.ts` | ORPHAN | Not directly imported | Unused variant |
| `integration/MemoryIntegration.ts` | ORPHAN | No imports | Legacy layer |
| `maiaNotesLoader.ts` | ORPHAN | Zero importers | Prototype loader |
| `mem0.ts` | ORPHAN | Zero importers | Mem0 integration stub |
| `selflet/*` | REACHABLE_NOT_INVOKED | `chat/route.ts:44` → `selflet/index.ts` | Gated: `MAIA_SELFLET_ALLOW_ANON=0`, `MAIA_SELFLET_WRITE_ENABLED=0` |
| `sensitivePatterns.ts` | ACTIVE | `maiaOrchestrator.ts:28`, `maiaService.ts:41` | Content filter |
| `soulprint.ts` | ACTIVE | 6 importers | Soulprint recognition |
| `stores/BreakthroughStore.ts` | ORPHAN | No imports | **Note: breakthroughs write via MemoryWriteback, not this store** |
| `stores/ConversationMemoryUsesStore.ts` | ACTIVE | `MemoryBundle.ts:17`, `maiaService.ts:56` | Ranking/tracking |
| `stores/JournalStore.ts` | ORPHAN | No imports | Unused journal persistence |
| `stores/MemoryLinksStore.ts` | ORPHAN | No imports | Unused linking |
| `stores/PatternMemoryStore.ts` | ORPHAN | No imports | Unused pattern storage |
| `stores/PreferenceConfirmationStore.ts` | ORPHAN | No imports | Unused preferences |
| `stores/RelationshipContextStore.ts` | ORPHAN | No imports | Unused context |
| `stores/SessionSummaryStore.ts` | ORPHAN | No imports | Unused summaries |
| `stores/SimpleMemoryStore.ts` | ORPHAN | No imports | Example store |
| `stores/SQLiteMemoryStore.ts` | ORPHAN | No imports | Unused SQLite layer |
| `stores/TurnsStore.ts` | ACTIVE | `MemoryBundle.ts:14`, `maiaService.ts:55` | Turn retrieval |
| `semantic/LlamaIndexService.ts` | ORPHAN | No imports | Unused semantic layer |

### Table 2: `lib/consciousness/` (active and gated files; ~160 ORPHAN files not enumerated individually)

| File | Classification | Evidence | Notes |
|---|---|---|---|
| `maiaOrchestrator.ts` | **PROTOTYPE + ACTIVE** | `@ts-nocheck` line 1; called by both routes | **High-risk: deep in live path, type-unchecked** |
| `safe-gebser.ts` | ACTIVE | `maiaOrchestrator.ts:19` → line 558 | `safeGebserAnalysis` |
| `safe-elemental-field.ts` | ACTIVE | `maiaOrchestrator.ts:20` → line 608 | `safeElementalFieldState` |
| `conversational-elemental-intelligence.ts` | **PROTOTYPE + ACTIVE** | `@ts-nocheck`; singleton at `maiaOrchestrator.ts:150`; called at 702, 1096, 1191 | **High-risk: core consciousness, type-unchecked** |
| `FacetDecisionLoop.ts` | ACTIVE | `maiaOrchestrator.ts:31` → line 286 | `computeFacetDecision` |
| `conversationContext.ts` | ACTIVE | `maiaOrchestrator.ts:23` → line 250 | `getConversationContext` |
| `awareness-levels.ts` | ACTIVE | `chat/route.ts:29`, `maiaService.ts:42-49` | `inferAwarenessLevel` |
| `cognitiveProfileService.ts` | ACTIVE | `oracle/route.ts:19`, `maiaService.ts:24` | Profile users |
| `processingProfiles.ts` | ACTIVE | `oracle/route.ts:32` | `profileToConsciousnessLevel` |
| `WisdomFieldPrimer.ts` | ACTIVE | `chat/route.ts:35` | `getWisdomPrimerForUser` |
| `epistemicPathPrompt.ts` | ACTIVE | `chat/route.ts:39` | `buildEpistemicPathAddendum` |
| `therapeuticFrameworks.ts` | ACTIVE | `chat/route.ts:40` | Care lens framework |
| `intentRouter.ts` | ACTIVE | `chat/route.ts:19` | `detectIntent` |
| `nameChangeDetection.ts` | ACTIVE | `chat/route.ts:47` | `processNameChangeIfDetected` |
| `relationshipPolicy.ts` | ACTIVE | `chat/route.ts:49` | `buildRelationshipAddendumForUser` |
| `participatoryRealityHelper.ts` | ACTIVE | `chat/route.ts:86`, `maiaService.ts:62` | `detectThemes` |
| `ideaDetection.ts` | ACTIVE | `chat/route.ts:88`, `oracle/route.ts:74` | `detectIdeaCandidate` |
| `spiralSnapshot.ts` | ACTIVE | `chat/route.ts:57-61` | `computeMemberSpiralState` |
| `wuxingSnapshot.ts` | ACTIVE | `chat/route.ts:74-78` | `computeWuXingMoment` |
| `bridgedSnapshot.ts` | ACTIVE | `chat/route.ts:80-84` | `buildBridgedSnapshot` |
| `integrityCheck.ts` | ACTIVE | `chat/route.ts:65-70` | `checkResponseIntegrity` |
| `spiralStatePersistence.ts` | ACTIVE | `oracle/route.ts:48` | `loadSpiralState` |
| `innerGuideField.ts` | ACTIVE | `oracle/route.ts:54` | `detectFacet` |
| `innerGuideFieldPrompt.ts` | ACTIVE | `oracle/route.ts:55` | `buildInnerGuideFieldPrompt` |
| `innerGuideFieldPersistence.ts` | ACTIVE | `oracle/route.ts:56` | `loadFacetState` |
| `cmPractitionerEnvironment.ts` | ACTIVE | `oracle/route.ts:71` | `getCMEnvironmentBlock` |
| `cmLayerDetector.ts` | ACTIVE | `oracle/route.ts:72` | `detectLayerIntent` |
| `panconscious-field.ts` | ACTIVE | `oracle/route.ts:7` | `PanconsciousFieldService` |
| `spiralogic-core.ts` | ACTIVE | `oracle/route.ts:10-18` | **Primary Spiralogic intelligence in live path** |
| `RelationshipAnamnesisPostgres.ts` | ACTIVE | `oracle/route.ts:38` | `getRelationshipAnamnesis` |
| `memory/MemoryPalaceOrchestrator.ts` | ACTIVE | `oracle/route.ts:39` | `memoryPalaceOrchestrator` |
| `memory/MAIAMemoryArchitecture.ts` | **PROTOTYPE** | `// @ts-nocheck - Prototype file, not type-checked` line 1; zero importers | 2,351 lines of interface-only spec for 5-Layer Memory Palace |
| `LLMProvider.ts` | ACTIVE | `oracle/route.ts:29` | `MultiLLMProvider` |
| `ConversationPatternAnalyzer.ts` | REACHABLE_NOT_INVOKED | Present in tree, some references in non-entry paths | Pattern analysis candidate |
| `AdaptiveConsciousnessLearning.ts` | ORPHAN | Zero entry-path imports | Growth model scaffold |
| `AdaptiveLanguageGenerator.ts` | ORPHAN | Zero entry-path imports | Language adaptation scaffold |
| `CollectiveIntelligenceMemory.ts` | ORPHAN | Zero entry-path imports | Collective scaffold |
| `CollectiveIntelligenceProtocols.ts` | ORPHAN | Zero entry-path imports | Collective scaffold |
| `CollectiveWisdomField.ts` | ORPHAN | Zero entry-path imports | Collective scaffold |
| `ArchetypalFieldResonance.ts` | ORPHAN | Zero entry-path imports | Archetypal scaffold |
| `ArchetypalConstellation.ts` | ORPHAN | Zero entry-path imports | Archetypal scaffold |
| `BrainTrustOrchestrator.ts` | ORPHAN | Zero entry-path imports | Orchestrator scaffold |
| `maia-personalization-engine.ts` | ORPHAN | Zero entry-path imports | Personalization scaffold |
| `maia-spiralogic-oracle.ts` | ORPHAN | Zero entry-path imports | Duplicate oracle scaffold |
| `maia-memory-palace.ts` | ORPHAN | Zero entry-path imports | Memory palace scaffold |
| `(~150 more consciousness/*.ts files)` | **ORPHAN** | Zero entry-path imports | **See §3 finding #10 — consciousness module explosion** |

### Table 3: `lib/spiralogic/`

| File | Classification | Evidence | Notes |
|---|---|---|---|
| `PhaseDetector.ts` | ACTIVE | 10 importers across scope | **Only active module in `lib/spiralogic/` root** |
| `CollectiveWisdomLayer.ts` | **ORPHAN** | Zero importers | **Kelly asked — confirmed dead** |
| `SpiralogicOrchestrator.ts` | ORPHAN | Zero importers | Replaced by `lib/consciousness/spiralogic-core.ts` in oracle route |
| `CrossSpiralPatternRecognizer.ts` | **ORPHAN** | Zero importers | **Pattern extraction scaffold, not wired** |
| `SpiralogicIntelligenceLayer.ts` | ORPHAN | Zero importers | Prototype layer |
| `RitualEngine.ts` | ORPHAN | Zero importers | Unused |
| `Aether.ts` | ORPHAN | Zero importers | Element definition |
| `Agents.ts` | ORPHAN | Zero importers | Agent collection |
| `Separator.ts` | ORPHAN | Zero importers | Separator logic |
| `TriadicPhaseDetector.ts` | ORPHAN | Zero importers | Redundant to PhaseDetector |
| `VoiceDistinctionScorer.ts` | ORPHAN | Zero importers | Unused scoring |
| `SpiralogicDataModel.ts` | ORPHAN | Zero importers | Data schema |
| `pathwayData.ts` | ORPHAN | Zero importers | Static data |
| `spiralogic-interface.ts` | ORPHAN | Zero importers | Types only |
| `core/**` | ORPHAN | No route imports | Engine/operator modules |
| `config/spiralogic-config.ts` | ORPHAN | No route imports | Unused config |
| `modes/gameplay-modes.ts` | ORPHAN | No route imports | Unused modes |
| `types/LongitudinalTypes.ts` | ORPHAN | No route imports | Types |
| `integration/SpiralogicOrchestrator.ts` | ORPHAN | Duplicate of root; no imports | Shadowed |
| `agents/MaiaAgent.ts` | ORPHAN | No route imports | Agent definition |

### Table 4: `lib/oracle/`, `lib/services/` (pattern/memory), `lib/maia/`, `lib/sovereign/`

| File | Classification | Evidence | Notes |
|---|---|---|---|
| `lib/oracle/iching/buildIchingReflection.ts` | ACTIVE | `oracle/route.ts:75` | Only live oracle helper |
| `lib/oracle/**` (other) | ORPHAN | Zero entry imports | Legacy oracle system |
| `lib/services/patternService.ts` | **ORPHAN** | Zero importers | **No active pattern extraction service** |
| `lib/services/maiaAstrologyContextService.ts` | ACTIVE | `oracle/route.ts:43` | `getAstrologyContextForUser` |
| `lib/services/memoryService.ts` | ORPHAN | Zero importers | Abstraction layer |
| `lib/services/community-field-memory.ts` | ORPHAN | Zero importers | Unused |
| `lib/services/conversation-analytics-service.ts` | ORPHAN | Zero importers | Unused analytics |
| `lib/services/conversationStorageService.ts` | ORPHAN | Zero importers | Duplicate storage |
| `lib/services/live-memory-capture.ts` | ORPHAN | Zero importers | Unused capture |
| `lib/services/simple-memory-capture.ts` | ORPHAN | Zero importers | Capture stub |
| `lib/services/corpusCallosumService.ts` | ACTIVE | `maiaOrchestrator.ts:32` | `logAgentRun`, `logIntegrationPass` |
| `lib/maia/state-vector/stateDefaults.ts` | ACTIVE | `chat/route.ts:36` | `inferStateVector` |
| `lib/maia/state-vector/index.ts` | ACTIVE | `maiaService.ts:79-87` | Parsing/routing |
| `lib/maia/prompts/activeThemeBlock.ts` | ACTIVE | `oracle/route.ts:73` | `buildActiveThemeBlock` |
| `lib/maia/**` (other) | MIXED | Many ACTIVE support files, many ORPHAN | Needs narrower scoping if deep cleanup planned |
| `lib/sovereign/maiaService.ts` | ACTIVE | Called by `maiaOrchestrator.ts:22` | Core response generator |
| `lib/sovereign/sessionManager.ts` | ACTIVE | `chat/route.ts:25`, `maiaService.ts:3` | Session CRUD |
| `lib/sovereign/decisionGovernor.ts` | ACTIVE | `chat/route.ts:48` | `decisionPreflight` |
| `lib/sovereign/http/canonHeaders.ts` | ACTIVE | `chat/route.ts:46`, `oracle/route.ts:41` | Provenance stamps |
| `lib/sovereign/maiaVoice.ts` | ACTIVE | `maiaService.ts:4` | Voice prompt building |
| `lib/sovereign/presenceMode.ts` | ACTIVE | `maiaService.ts:32-37` | `determineResponseMode` |
| `lib/sovereign/pfiMindEntrypoint.ts` | ACTIVE | `maiaService.ts:25-31`; gated by `MAIA_PFI_MIND=true` (set in prod) | `generatePFIMindState` |
| `lib/sovereign/**` (other) | MIXED | See evidence | Mostly active |

### Table 5: `app/api/ain/`

| File | Classification | Evidence | Notes |
|---|---|---|---|
| `activate/route.ts` | REACHABLE_NOT_INVOKED | Imports `GlobalAINActivator`; gate unclear | Admin activation |
| `collective/breakthrough/route.ts` | REACHABLE_NOT_INVOKED | Gated: `AIN_KNOWLEDGE_GATE_ENABLED` unset | **Collective breakthroughs dormant** |
| `control/route.ts` | REACHABLE_NOT_INVOKED | Admin control; not in chat path | Admin route |
| `digest/route.ts` | REACHABLE_NOT_INVOKED | Digest generation; not in chat path | Async digest |
| `knowledge/route.ts` | ACTIVE | Called by `RetrievalService` from `maiaOrchestrator.ts` | Knowledge API |
| `process/route.ts` | REACHABLE_NOT_INVOKED | Async processing; not in chat path | Async |
| `telemetry/route.ts` | REACHABLE_NOT_INVOKED | Telemetry logging; not critical path | Observability |

---

## Section 3 — High-signal findings

### 1. `CollectiveWisdomLayer` is ORPHAN (confirmed)
Kelly has asked about this module by name. It has **zero importers** across the entire in-scope codebase. It is dead code relative to the live path. Any future collective-intelligence work must either activate this module deliberately or build a replacement. Do not assume it is load-bearing.

### 2. `maiaOrchestrator.ts` is PROTOTYPE in the critical path
The central orchestrator called by both entry routes carries `@ts-nocheck` on line 1. It is type-unchecked and deeply embedded in live traffic. Null inferences are not caught at compile time. **This is a standing silent-failure surface** — the same class of risk as the schema drift we just fixed. Refactor target for Phase B.

### 3. `MemoryOrchestrator.ts` and `MemoryBundle.ts` are parallel memory recall pipelines
Both exist. `MemoryBundle.ts` is ACTIVE and non-prototype (verified live via Phase A). `MemoryOrchestrator.ts` is PROTOTYPE (`@ts-nocheck`) but imported by `maiaService.ts:57`. Two parallel recall paths with unclear division of responsibility. Candidate for consolidation — **but not until we trace which one actually influences the final prompt in which code path**.

### 4. `ConversationalElementalIntelligence` is PROTOTYPE in the critical path
Second high-risk prototype in live traffic. Singleton instantiated at `maiaOrchestrator.ts:150`, called at lines 702, 1096, 1191 during normal turns. Type-unchecked. Refactor target alongside `maiaOrchestrator.ts`.

### 5. Selflet subsystem is loaded but not writing
`loadSelfletContext` is called from `chat/route.ts:44`. Write operations are gated off by `MAIA_SELFLET_ALLOW_ANON=0` and `MAIA_SELFLET_WRITE_ENABLED=0`. Result: the load path runs every turn (some cost) but nothing ever persists. Either enable selflet writes deliberately (Phase C candidate) or remove the load call. **Half-enabled subsystems accumulate confusion.**

### 6. `lib/spiralogic/` is almost entirely ORPHAN except `PhaseDetector`
Only `PhaseDetector.ts` is reachable (10 importers). Every other file in `lib/spiralogic/` root — including `CollectiveWisdomLayer`, `SpiralogicOrchestrator`, `CrossSpiralPatternRecognizer`, `SpiralogicIntelligenceLayer`, `RitualEngine`, `Aether`, `Agents` — is orphaned. **The active Spiralogic intelligence moved to `lib/consciousness/spiralogic-core.ts`** which is used by `oracle/route.ts`. The `lib/spiralogic/` directory should be marked REFERENCE or relocated to `archive/`.

### 7. No dedicated pattern-extraction module exists
- `lib/services/patternService.ts` is ORPHAN.
- `lib/consciousness/CrossSpiralPatternRecognizer.ts` is ORPHAN.
- `lib/consciousness/ConversationPatternAnalyzer.ts` is REACHABLE_NOT_INVOKED.
- Pattern-like detection is **fragmented across three active modules**: `participatoryRealityHelper` (theme detection), `ideaDetection` (idea candidates), and distributed consciousness heuristics.
- **No module produces the `[core movement]; [direction of shift]; [tone/quality]` format we're about to build.**
- When we build the distillation in Storage X4, we are not duplicating existing work — we are filling a real gap. **Confirmed: build, do not wire.**

### 8. Memory stores — 8 of 10 are ORPHAN
Active: `TurnsStore`, `ConversationMemoryUsesStore`.
Orphan: `BreakthroughStore`, `JournalStore`, `MemoryLinksStore`, `PatternMemoryStore`, `PreferenceConfirmationStore`, `RelationshipContextStore`, `SessionSummaryStore`, `SimpleMemoryStore`, `SQLiteMemoryStore`.
**Critical: `BreakthroughStore` is ORPHAN even though breakthroughs ARE written.** The actual writer is `MemoryWriteback.writeBreakthroughMoment` which does a direct `INSERT INTO breakthrough_moments`. `BreakthroughStore.ts` is a duplicate abstraction that was never wired. Same pattern likely applies to the others — they're over-designed alternatives to the direct-SQL path that won.

### 9. Consciousness module explosion — ~160 of ~268 are ORPHAN
`lib/consciousness/` contains 268 `.ts` files. Approximately 100 are reachable from entry points. **Approximately 160 are ORPHAN.** This includes most of the "collective," "adaptive," "archetypal," and "personalization" scaffolding Kelly has been asking about (`AdaptiveConsciousnessLearning`, `CollectiveIntelligenceMemory`, `CollectiveWisdomField`, `ArchetypalFieldResonance`, `BrainTrustOrchestrator`, `maia-personalization-engine`, `maia-spiralogic-oracle`, `maia-memory-palace`). None of these fire during a live turn. **The vision architecture exists as scaffold. The live metabolism does not touch it.** This is the single most important finding of the audit.

### 10. `MAIAMemoryArchitecture.ts` is PROTOTYPE with zero importers
2,351 lines of interface definitions for a 5-Layer Memory Palace (Episodic / Semantic / Somatic / Morphic / Soul). `@ts-nocheck` header. **Not referenced anywhere in the import graph.** This is a design document in code form. It is not the shape of what's running. Reference only.

---

## Section 4 — Open questions

### Q1. MemoryOrchestrator vs MemoryBundle — which one wins at prompt time?
Both are imported by different entry points. `maiaService.ts` imports `MemoryOrchestrator` (line 57). `maiaOrchestrator.ts` imports `MemoryBundle` (line 25). Both feed into `getMaiaResponse`. The verified-active row from Phase A came from `MemoryBundle` / `MemoryWriteback` chain. **But `MemoryOrchestrator` may still influence the prompt through `maiaService`.** Needs a targeted trace: for a single real turn, which bundle's output reaches `finalSystemPrompt`? Blocking for clean signal-injection design.

### Q2. Why is `BreakthroughStore` orphaned if breakthroughs get written?
`MemoryWriteback.writeBreakthroughMoment` does direct SQL against `breakthrough_moments`. `BreakthroughStore.ts` is a parallel abstraction that was never adopted. Was the direct-SQL path intentional, or is it a leftover from before `BreakthroughStore` existed? Determines whether we should consolidate toward the store or kill the store.

### Q3. Selflet subsystem — still active development or abandoned?
`loadSelfletContext` runs every turn. Writes are gated off. No rows in `selflet_*` tables except for Kelly's single `selflet_nodes` entry. Is selflet a planned future feature blocked on policy, or abandoned experimental work? Affects whether we complete Phase C activation or retire the subsystem.

### Q4. `ConversationPatternAnalyzer` — reachable-not-invoked, but from where?
The classification says REACHABLE_NOT_INVOKED but the import path wasn't fully traced in this audit. Needs a direct grep to confirm whether its invocation conditions match a plausible production turn. If yes, it may be the "already-exists pattern extraction module" we're looking for — saving us from building a new one. **Worth a 5-minute follow-up trace before we write the distillation patch.**

### Q5. Active consciousness modules that we built for but don't call
Some consciousness files are imported but the specific functions aren't invoked in normal turns (e.g., `safeElementalFieldSummary` from `maiaOrchestrator.ts:20` but only used in one rare branch). The line between ACTIVE and REACHABLE_NOT_INVOKED gets blurry for these. Phase A.5 classified them as ACTIVE when the import chain existed; a stricter audit would require runtime evidence. **Not blocking for Storage X4 but noted for Phase B telemetry design.**

---

## Section 5 — Recommended next actions

**Not philosophy. Strictly factual derivations from the classification above.**

### Immediate (before Storage X4 distillation patch)
1. **Resolve Q1 and Q4** — ~15 minutes combined. Confirm which memory recall path is load-bearing, and whether `ConversationPatternAnalyzer` is already producing something distillation-adjacent. This prevents building a second orphan alongside existing ones.

### Near term (after Storage X4 ships)
2. **Refactor `maiaOrchestrator.ts` off `@ts-nocheck`** — high-value target. Central to live path. Type-unchecked code in critical paths is the same failure class as schema drift.
3. **Refactor `conversational-elemental-intelligence.ts` off `@ts-nocheck`** — same reasoning.
4. **Selflet decision** — either enable `MAIA_SELFLET_WRITE_ENABLED=1` as a deliberate Phase C move, or remove the `loadSelfletContext` call from `chat/route.ts:44`. Do not leave it half-on.

### Medium term (Phase B+)
5. **Archive `lib/spiralogic/` root modules** — move to `lib/_archive/spiralogic/` or similar with a README explaining that live Spiralogic intelligence is in `lib/consciousness/spiralogic-core.ts`.
6. **Decide on `BreakthroughStore` and the other 7 orphaned stores** — consolidate toward direct SQL in `MemoryWriteback` (kill the stores) or migrate `MemoryWriteback` onto the stores (kill the direct SQL). Do not keep both shapes.
7. **Mark `MAIAMemoryArchitecture.ts`** with a header comment making clear it is a specification document, not a live module. Or move to `docs/spec/`.

### Longer term (Phase D)
8. **Consciousness module triage** — ~160 orphan files in `lib/consciousness/`. Split into `_active/`, `_experimental/`, `_archive/` subtrees. Add a CI check that prevents new orphans from accumulating without explicit tagging.
9. **Collective layer** — the modules Kelly has been asking about (`CollectiveWisdomLayer`, `CollectiveIntelligenceMemory`, etc.) are all ORPHAN. Any collective-intelligence work in the future must either activate these modules deliberately (with canon-constrained consent gating per `MAIA_MEMORY_CANON §IV`) or build a replacement. **Do not assume the collective layer exists in any operational sense today.**

---

## Appendix — Memo cross-reference

Updates required to `MAIA_CURRENT_STATE_v1.0.md §6` based on this audit:

- **Pattern extraction row** in §6 "UNKNOWN" section: classify as **ORPHAN** for `patternService`, `CrossSpiralPatternRecognizer`. Classify as **REACHABLE_NOT_INVOKED** for `ConversationPatternAnalyzer` pending Q4 resolution.
- **Collective intelligence row** in §6 "UNKNOWN" section: classify as **ORPHAN** for `CollectiveWisdomLayer`, `CollectiveIntelligenceMemory`, `CollectiveIntelligenceProtocols`, `CollectiveWisdomField`. Classify `/api/ain/collective/breakthrough/route.ts` as **REACHABLE_NOT_INVOKED** (gated by `AIN_KNOWLEDGE_GATE_ENABLED`).
- **Consciousness module list** in §6 "UNKNOWN" section: all but `ConversationPatternAnalyzer` classify as **ORPHAN**. Update the memo with the per-file classifications from §2 Table 2 here.

These cross-reference updates should be applied as a second commit after this audit is accepted.

---

**End of audit.**
