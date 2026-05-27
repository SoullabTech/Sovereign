# Memory Substrate Divergence Map

**Purpose:** Identify which memory modules exist, which routes consume them, and where the architectural divergence lies.

---

## 1. Active Memory Substrate (In Use)

### Consciousness Memory Layer
- `lib/consciousness/memory/SessionMemoryServicePostgres.ts` — PostgreSQL persistence
- `lib/consciousness/memory/MemoryPalaceOrchestrator.ts` — Multi-memory orchestration **[ACTIVE]**
- `lib/consciousness/spiralStatePersistence.ts` — Spiral state tracking **[ACTIVE]**

### MAIA Orchestration
- `lib/maia/memoryOrchestrator.ts` — buildMemoryInfluencePlan() **[ACTIVE]**
- `lib/maia/memoryAtomsLoader.ts` — Memory atom loading
- `lib/maia/memoryHealth.ts` — Memory health scoring
- `lib/maia/memoryLoaders.ts` — Recent memory utilities
- `lib/maia/prompts/memoryCanonGuard.ts` — Amnesia scrubbing

### Support Infrastructure
- `lib/memory/MemberLiveContext.ts` — Runtime member context
- `lib/consciousness/spiralogic-core.ts` — Spiral core orchestration

---

## 2. Preserved but Bypassed Substrate

### Backend Service Layer (ORPHANED)
```
app/api/_backend/src/
  ├── services/
  │   ├── memoryService.ts
  │   └── memoryIntegrationService.ts
  ├── routes/
  │   ├── memory.routes.ts
  │   └── orchestrator.routes.ts
  ├── controllers/
  │   └── memory.controller.ts
  └── lib/
      └── memorySpiral.ts (shadowed by spiralStatePersistence)
```
**Status:** Completely bypassed by Next.js route migration.

### Consciousness Memory Services (UNDERUTILIZED)
- `lib/consciousness/memory/EpisodicMemoryService.ts` — Event memory (unmapped)
- `lib/consciousness/memory/SemanticMemoryService.ts` — Knowledge (unmapped)
- `lib/consciousness/memory/SomaticMemoryService.ts` — Somatic (unmapped)
- `lib/consciousness/memory/QuantumFieldMemory.ts` — Field memory (unmapped)
- `lib/consciousness/memory/CoherenceFieldService.ts` — Field coherence (unmapped)
- `lib/consciousness/memory/MAIAMemoryArchitecture.ts` — Topology (unmapped)
- `lib/consciousness/memory/ConsciousnessEvolutionService.ts` — Growth tracking (unmapped)
- `lib/consciousness/memory/AchievementService.ts` — Mastery (unmapped)
- `lib/consciousness/memory/MorphicPatternService.ts` — Patterns (unmapped)

### Legacy & Test Phase
- `lib/memory/beads-sync/` — Maia Beads (test phase)
- `lib/memory/mem0.ts` — Legacy mem0 integration

---

## 3. Choke Point: Oracle/Conversation Route

**File:** `app/api/oracle/conversation/route.ts`

**Status:** SOLE SUBSTANTIVE CONSUMER of memory substrate

**Consumed Substrate:**
```typescript
// Active imports:
sessionMemoryServicePostgres       → lib/consciousness/memory
memoryPalaceOrchestrator          → lib/consciousness/memory
spiralStatePersistence            → lib/consciousness
buildMemberLiveContext            → lib/memory
buildMemoryInfluencePlan          → lib/maia/memoryOrchestrator
loadMemberMemoryAtomsForPrompt    → lib/maia/memoryAtomsLoader
buildMemoryHealth                 → lib/maia/memoryHealth
loadRecentDevelopmentalMemories   → lib/maia/memoryLoaders
scrubMemoryAmnesia                → lib/maia/prompts
spiralogic-core                   → lib/consciousness
```

---

## 4. Memory-Named Routes (Impoverished)

Routes that claim to handle memory but are not yet mapped to active substrate:

| Route | Status |
|-------|--------|
| `app/api/consciousness/memory/episodes/route.ts` | ⚠️ Unmapped |
| `app/api/consciousness/memory/integrate/route.ts` | ⚠️ Unmapped |
| `app/api/consciousness/memory/recall/route.ts` | ⚠️ Unmapped |
| `app/api/consciousness/memory/wisdom/route.ts` | ⚠️ Unmapped |
| `app/api/maia/memory/ingest/route.ts` | ⚠️ Unmapped |
| `app/api/maia/memory/resonance/route.ts` | ⚠️ Unmapped |
| `app/api/oracle/memory/route.ts` | ⚠️ Separate from /conversation |

---

## 5. Secondary Consumers (Rely on Oracle)

Routes that use memory but do not import substrate directly:
- `app/api/between/chat/route.ts`
- `app/api/between/consciousness-bridge/route.ts`
- `app/api/maia/chat/route.ts`
- `app/api/ask-maia/ask/route.ts`

---

## 6. Restoration Path

**Phase 1: Map Impoverished Routes**
- Inspect consciousness/memory/* routes
- Verify they delegate to oracle/conversation or have stubs
- Document actual usage pattern

**Phase 2: Integrate Backend Services**
- Reconnect backend memoryService to Next.js routes
- Evaluate memoryIntegrationService for cross-system sync
- Migrate orchestrator.routes.ts logic to route.ts

**Phase 3: Activate Underutilized Services**
- Route EpisodicMemoryService calls from consciousness/memory/episodes
- Wire SemanticMemoryService into knowledge extraction
- Integrate ConsciousnessEvolutionService into health route

**Phase 4: Consolidate Spiral**
- Choose: spiralStatePersistence vs memorySpiral
- Unify spiralogic-core with spiralCore.ts
- Remove redundancy

---

**Generated:** 2026-05-23  
**Codebase:** /Users/soullab/MAIA-SOVEREIGN
