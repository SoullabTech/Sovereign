# M0 Lane 2 — Services & Code Ecology Inventory (Memory)

**Date**: 2026-08-09 · **Method**: READ-ONLY static analysis (grep import graphs, LOC counts, SQL-string table extraction). No runtime evidence gathered in this lane — proof-ladder rungs above *Reachable* are marked from static evidence + existing project records only.

**Proof ladder key**: Exists → Correct → Secure → Connected → Reachable → Exercised → Observable → Sustained.
Static analysis can establish: Exists (file present), Connected (imported by non-dead code), Reachable (an existing route file imports/calls it). *Exercised/Observable/Sustained require runtime evidence — marked `?` unless project records state otherwise.*

**Route-liveness context used** (from project records, not re-verified here):
- `app/api/sovereign/app/maia/list/route.ts` — the live production conversation route (FAST/CORE/DEEP).
- `app/api/oracle/conversation/route.ts` (3,081 LOC) — exists and is routed, but post-audit records state it receives **~zero live traffic**. Everything reachable *only* through it is "reachable via a dead route."
- `app/api/between/chat/route.ts` — exists; historical typecheck entrypoint; traffic level unknown.

---

## 1. The live memory pathway (Connected + Reachable via the live route)

Imported directly by `app/api/sovereign/app/maia/list/route.ts` or by `lib/sovereign/maiaService.ts` / `maiaVoice.ts` (which that route uses):

| Module | Path | LOC | Persistence (tables in SQL strings) | Consent gate visible |
|---|---|---|---|---|
| memoryAtomsLoader (atoms loader) | `lib/maia/memoryAtomsLoader.ts` | 534 | `member_memory_atoms` | ✅ `return_preference IN ('contextual_doorway','ritual_review_opt_in')` |
| memoryLoaders (conversational + episodic Phase 2) | `lib/maia/memoryLoaders.ts` | 341 | `conversation_turns`, `developmental_memories`, `episodic_memories`, `member_theme_signals`, `members` | ✅ `members.conversational_recall_enabled` + `members.episodic_recall_enabled` (default TRUE, opt-out) |
| memoryHealth | `lib/maia/memoryHealth.ts` | 258 | none (aggregator) | n/a |
| memoryOrchestrator (maia — influence plan) | `lib/maia/memoryOrchestrator.ts` | 341 | none (pure planner) | n/a |
| conversationalRecallBlock / episodicRecallBlock | `lib/maia/…` | 191 / 171 | none (formatters) | n/a |
| conversational-keep | `lib/psyche/conversational-keep.ts` | 573 | none directly (delegates) | member-gesture driven (Keep) |
| MemoryBundle | `lib/memory/MemoryBundle.ts` | 631 | `breakthrough_moments`, `conversation_turns`, `developmental_memories` | not visible in file |
| MemoryGate | `lib/memory/MemoryGate.ts` | 107 | none — resolves memory mode (sanctuary/consent switch point) | ✅ this *is* the gate |
| MemoryWriteback | `lib/memory/MemoryWriteback.ts` | 800 | `breakthrough_moments`, `conversation_insights`, `developmental_memories` | uses `sensitivePatterns` filter |
| MemberLiveContext | `lib/memory/MemberLiveContext.ts` | 520 | none directly (composes loaders incl. spiralStatePersistence, SignificantMomentsService) | inherits |
| ConsciousnessMemoryLattice | `lib/memory/ConsciousnessMemoryLattice.ts` | 1,056 | postgres via `lib/db/postgres` (`developmental_memories`, `lattice_nodes`); logs IDs/counts only, never content | partial (logging discipline visible) |
| MemoryOrchestrator (lib/memory — session recall) | `lib/memory/MemoryOrchestrator.ts` | 707 | none directly | — |
| RelationshipMemoryService | `lib/memory/RelationshipMemoryService.ts` | 575 | postgres (`relationship_essences`, `relationship_patterns`, `conversation_themes`, `breakthrough_moments`) | not visible |
| TurnsStore / ConversationMemoryUsesStore | `lib/memory/stores/` | (stores dir: 11 files, 2,719 LOC) | `conversation_turns`, `turns_to_keep`, `conversation_memory_uses` | — |
| SignificantMomentsService | `lib/memory/SignificantMomentsService.ts` | 363 | `breakthrough_moments`, `capture_notes`, `elemental_journal_entries`, `quick_journal_entries` | — |
| sensitivePatterns | `lib/memory/sensitivePatterns.ts` | 36 | none — PII/sensitivity filter used by writeback + maiaService | protective |
| memoryCanonGuard (`scrubMemoryAmnesia`) | `lib/maia/prompts/memoryCanonGuard.ts` | — | none | protective |

**Ladder**: all of the above = Exists + Connected + Reachable-via-live-route. Exercised/Observable: atoms loader, memoryHealth, conversational block have production log markers per records (`atoms loaded`, `MEMORY_HEALTH`, `[MAIA] conversational-block`) — Observable by design; runtime confirmation out of scope for this lane.

Also reachable-live adjacent:
- **spiralStatePersistence** — `lib/consciousness/spiralStatePersistence.ts` (384 LOC, `member_spiral_state`). Importers: `MemberLiveContext` (live), `oracle/conversation` (dead route), `members/spiral-state` + `spiralogic-report` routes, `living-field/encounterContext`. Connected + Reachable live via MemberLiveContext.
- **loadRecentAnchors** — `lib/anchor/loadRecentAnchors.ts` (85 LOC, `member_daily_anchors`, gated by `surface_preference IN ('contextual_doorway','ritual_review_opt_in')` ✅). Importers: `buildAnchorContextBlock` (77 LOC) and **only `app/api/oracle/conversation/route.ts`** — i.e. the anchor context block is wired into the ~zero-traffic route, **not** the live sovereign route. Combined with the 2026-08-09 founder correction (0 rows in `member_daily_anchors`), anchor surfacing is: Exists + Connected + Reachable-via-dead-route only. **Surprise: the record says "loader gate live"; statically, no live-traffic route imports it.**
- **bardic subsystem** — `lib/memory/bardic/` (20 files, **4,759 LOC**). Imported by `components/OracleConversation.tsx` (live UI component, `ConversationMemoryIntegration.captureEpisode()`), `app/api/bardic/capture-episode/route.ts`, `app/api/consciousness/memory/episodes/route.ts`. Connected + Reachable through live UI. Not named in any project-record category — **inverse-drift candidate (Cat-6-shaped but unnamed)**.
- **maiaNotesLoader** — `lib/memory/maiaNotesLoader.ts` (433 LOC) → `lib/services/ClaudeService.ts` → oracle/agent stack (8 importers). Connected; reachability depends on oracle stack liveness (?).

## 2. The Memory Palace family (Connected, Reachable ONLY via the dead oracle route)

`lib/consciousness/memory/MemoryPalaceOrchestrator.ts` (406 LOC) is imported and **called** by `app/api/oracle/conversation/route.ts` (retrieve L902, store L1499, prompt-inject L2780). Its only importer is that route. Since that route has ~zero traffic, the entire family below is effectively **dormant-with-schema**:

| Service | LOC | Table (SQL present) | Notes |
|---|---|---|---|
| EpisodicMemoryService | 283 | `episodic_memories` | ⚠️ Same table also read by live `memoryLoaders.ts` (marked-episodes path) — two writers/readers, different philosophies |
| CoherenceFieldService | 403 | `coherence_field_readings` | Frozen per Cat 5 spec |
| MorphicPatternService | 402 | `morphic_pattern_memories` | 🚩 logs "Integration level updated" (L213) — progression language |
| SomaticMemoryService | 329 | `somatic_memories` | Cat 4 "Later" per records |
| AchievementService | 319 | `consciousness_achievements` | 🚩 "Unlocks consciousness development milestones", rarity tiers `common/uncommon/rare/legendary` — gamification of development |
| ConsciousnessEvolutionService | 448 | `consciousness_evolution` | 🚩 "Tracks 7-stage consciousness development journey", `currentStage`, `stageProgression` — system-asserted developmental staging |
| SemanticMemoryService (consciousness) | 328 | `semantic_memories` | The postgres duplicate |

**Correction to project records**: these were recorded as "service + migration, **0 live callers**". Statically they *do* have a caller (MemoryPalaceOrchestrator ← oracle route); it is the route that is dead, not the import chain. Also **records claimed EpisodicMemoryService/CoherenceFieldService lacked persistence wiring — false: both contain live SQL against their tables.** No consent gate is visible in any of the seven services' write paths (storeConversationMemory at oracle route L1499 stores without a visible member-consent check in the orchestrator itself — flag for Lane review).

## 3. QuantumFieldMemory & the "enhanced consciousness" cluster

- **QuantumFieldMemory** — `lib/consciousness/memory/QuantumFieldMemory.ts`, **811 LOC, in-memory Maps only, zero SQL** (confirms record: 810 LOC / 0 persistence). Importers: `EnhancedMAIAFieldIntegration.ts` (1,096 LOC), `spiral-aware-response.ts`, `lib/services/core-member-profile.ts`, `app/api/maia/enhanced-consciousness/route.ts`. So it is Reachable via `enhanced-consciousness` and `consciousness/spiral-aware` routes (traffic unknown, presumed dead). Cat 4 rename/gut candidate — confirmed.
- **MAIAMemoryArchitecture** — `lib/consciousness/memory/MAIAMemoryArchitecture.ts`, **2,352 LOC, in-memory Maps only, zero SQL**. Importers: only `lib/memory/beads-sync/*` (3 files) — and **beads-sync itself has 0 external importers** (6 files, 2,765 LOC). ⇒ MAIAMemoryArchitecture is **transitively orphaned**: a 2.3k-LOC architecture reachable from nothing. 🚩 also matched the inferred-emotional-state grep.

## 4. Duplicates & competing implementations

1. **SemanticMemoryService ×2** — `lib/consciousness/memory/SemanticMemoryService.ts` (328 LOC, postgres, `semantic_memories`) vs `lib/memory/SemanticMemoryService.ts` (793 LOC, **Supabase client**). Import split: MemoryPalaceOrchestrator + MAIAUnifiedConsciousness → consciousness copy; UnifiedMemoryInterface + **PersonalOracleAgent** (`@/lib/memory/SemanticMemoryService`) → **the Supabase copy**. 🚩 The Supabase copy calls `createClient` (resolving to the `lib/db/legacy/supabase/*` shim layer, which still exists) and self-describes "degraded mode without persistent memory" when creds missing. CLAUDE.md says "if you see Supabase, remove it" — this survives because the legacy shim satisfies `check:no-supabase`. Recommendation input for M1: consciousness copy is the real one; lib/memory copy is the deletion candidate.
2. **Three MemoryOrchestrators**: `lib/memory/MemoryOrchestrator.ts` (707 LOC, session recall, live via maiaService) vs `lib/maia/memoryOrchestrator.ts` (341 LOC, influence planner, live via sovereign route) vs `MemoryPalaceOrchestrator` (dead route). Same conceptual name, three implementations, two simultaneously live.
3. **Two UnifiedMemoryInterfaces**: `lib/memory/UnifiedMemoryInterface.ts` (388 LOC) and `lib/anamnesis/UnifiedMemoryInterface.ts` (557 LOC).
4. **episodic_memories table contested**: written by dead-route EpisodicMemoryService, read by live memoryLoaders marked-episodes path, plus `app/api/sovereign/episodes/mark/route.ts` writes **raw SQL directly** (imports only `lib/db/postgres`, not the service). Three access idioms, one table.
5. **Capture services ×3**: `lib/services/live-memory-capture.ts` (414 LOC, 0 importers), `simple-memory-capture.ts` (0 importers), bardic `captureEpisode` (live). First two are orphans.

## 5. Orphaned / never-imported (Exists only)

| Module | LOC | Status |
|---|---|---|
| `lib/memory/beads-sync/` (incl. MaiaBeadsPlugin) | 2,765 | 0 external importers — orphan subsystem |
| `lib/memory/MemoryManager.ts` | 136 | 0 importers |
| `lib/memory/VaultSymbolIndex.ts` | 423 | 0 importers |
| `lib/services/live-memory-capture.ts` | 414 | 0 importers |
| `lib/services/simple-memory-capture.ts` | — | 0 importers |
| `lib/integrated-oracle-system.ts` | — | 0 importers (drags MemoryCore/LlamaIndex/anamnesis with it) |
| `lib/memory/mem0.ts` | 303 | imported only by `lib/vectors/soulIndex.ts` + `lib/semantic/index.ts`, which themselves have 0 importers — transitively dead |

**Anamnesis cluster** (`lib/anamnesis/` 6,402 LOC incl. bardic figure above; MemoryCoreIndex 460, UnifiedMemoryInterface 557 + `lib/memory/core/MemoryCore.ts` 403 + `semantic/LlamaIndexService.ts` 428): imported by `sacred-oracle-core*`, `maia-consciousness-lattice`, `witness-paradigm-orchestrator` — a legacy "sacred oracle" stack whose own reachability terminates in 0-importer roots. Effectively a **dead continent** (~2k+ LOC) pending route-level confirmation.

**Selflet** (`lib/memory/selflet/`, 8 files, 2,840 LOC): imported by `app/api/selflet/*` routes + `between/chat` — Reachable; traffic unknown.

**memoryService** (`lib/services/memoryService.ts`, 70 LOC): 39 importers (beta/, elemental agents, UnifiedMemoryInterface) — a widely-imported thin shim; classify with the oracle-stack liveness question.

## 6. Observability meta-layer

`lib/maia/substrateMap.ts` (451 LOC) — hand-maintained static inventory of this exact ecology, feeding `app/api/admin/maia/substrate/route.ts`; static half of the substrate monitor. It is why every known service name greps to it. This lane's findings should be reconciled against it in M1 (it may itself have drifted — it lists consumers this audit found dead).

## 7. Constitutional risk flags (static)

1. 🚩 **ConsciousnessEvolutionService**: 7-stage system-asserted development staging (`currentStage`, `stageProgression`) — system-inferred psychological state; violates "no system-asserted maturation" if ever wired live.
2. 🚩 **AchievementService**: consciousness milestones with game-rarity tiers — engagement-mechanics shape.
3. 🚩 **MorphicPatternService**: "Integration level updated" progression logging.
4. 🚩 **MemoryPalaceOrchestrator write path** (oracle route L1499): no visible consent gate at `storeConversationMemory` — contrast with live path where MemoryGate/sanctuary + `*_recall_enabled` gates are explicit.
5. 🚩 **Supabase in `lib/memory/SemanticMemoryService.ts`** via legacy shim — sovereignty invariant leak (dormant but imported by PersonalOracleAgent).
6. 🚩 **Inferred emotional/psychological state fields** present in: `AINMemoryPayload`, `MemoryUpdater`, `MemoryOrchestrator` (lib/memory), `MemberLiveContext`, `UnifiedMemoryInterface`, `MAIAMemoryArchitecture` — needs per-field review in a later lane (some may be member-authored; grep cannot distinguish authorship).
7. ✅ **Positive findings**: consent gates are real and legible in the live path (memoryLoaders opt-outs, atoms `return_preference`, anchors `surface_preference`, MemoryGate/sanctuary, sensitivePatterns filter, ConsciousnessMemoryLattice's "never log content" discipline).

## 8. Counts

- **Memory-related modules inventoried**: ~60 distinct (lib/memory 23 top-level + 9 subdirs ≈ 16.6k LOC beyond top-level 10k; lib/consciousness/memory 10+; lib/maia 8; lib/anchor 3; lib/services 6; anamnesis cluster).
- **Live-path (Connected + Reachable via live route)**: ~20 modules.
- **Dormant (Reachable only via dead/low-traffic routes)**: ~12 (Memory Palace family ×8, QuantumFieldMemory cluster, anchor context block, spiral-aware, enhanced-consciousness).
- **Orphaned (0 importers or transitively dead)**: ~10 subsystems ≈ 8–10k LOC (beads-sync, MAIAMemoryArchitecture, MemoryManager, VaultSymbolIndex, capture ×2, mem0 chain, integrated-oracle-system, most of anamnesis).
- **Duplicate/competing capability sets**: 5 (semantic ×2, orchestrators ×3, unified interface ×2, episodic-table access ×3, capture ×3).
