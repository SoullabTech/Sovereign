---
level: architecture
---

# MAIA CURRENT STATE v1.0

**Status:** Ground truth contract between the system and reality
**Scope:** Operational state of MAIA as of 2026-04-09 23:00 UTC, post Phase A + A.1
**Rule:** Every claim in this document must be backed by a direct artifact — a table count, a log line, a code path, a successful probe, or a failed probe. No inferred states. No aspirations.
**Companion canons:** `MAIA_OATH.md`, `MAIA_CANON_v1.1.md`, `MAIA_MEMORY_CANON_v1.0.md`

---

## 1. System Identity

> A relationally continuous Oracle system whose memory substrate is real, whose developmental layer is only now being brought into contact with production truth, and whose deeper Spiralogic/collective intelligence architecture exists more as scaffold than as verified live metabolism.

---

## 2. Layer Status Matrix

| Layer | Component(s) | Status | Evidence |
|---|---|---|---|
| Conversation engine | `app/api/between/chat/route.ts`, `lib/consciousness/maiaOrchestrator.ts`, `lib/sovereign/maiaService.ts` | ACTIVE | Live exchange on 2026-04-09 22:47 UTC generated response + elemental shift indicator visible in UI |
| Raw turn storage | `conversation_turns` table | ACTIVE | `COUNT(*) = 17,885` at 2026-04-09 23:00 UTC |
| Cross-session recall | `MemoryBundle.getRecentTurns` → `conversation_turns` | ACTIVE | Log: `📦 [Route/MemoryBundle] Turns: 12 (same-session: 0, cross: 12)`; behavior: MAIA reconstructed "boundary / transference / secondary gain / victim story" specifics from prior sessions |
| Episodic memory (present) | `episodic_memories` table | PRESENT | `COUNT(*) = 69` (50 rows for user `ce284751-...`). Read path not exercised this session. |
| Relationship memory | `RelationshipMemoryService.loadRelationshipMemory` | ACTIVE | Log: `🌊 [Relationship Memory CORE] Loaded: 379 encounters, deep phase, 0 themes` |
| Significant moments | `SignificantMomentsService.loadSignificantMoments` | ACTIVE | Log: `📌 [Chat API] Significant moments loaded` |
| **Developmental memory (write)** | `MemoryWriteback.writeDevelopmentalMemory` → `developmental_memories` | **VERIFIED** (2026-04-09) | Log: `[MemoryWriteback] success { significance: 0.45 }` → `✅ Promoted to developmental_memories: 135ebeb3-b8b2-42ae-8d20-14ab131007d9` |
| **Developmental memory (read)** | `MemoryBundle.getSemanticMemories` (non-vector path) | **VERIFIED** (2026-04-09) | Layer 1 SQL probe INSERT/SELECT/DELETE against production schema, all four steps returned expected results |
| Breakthrough memory | `MemoryWriteback.writeBreakthroughMoment` → `breakthrough_moments` | REACHABLE / UNFIRED | Code path present in `MemoryWriteback.writeBack:139`, fires at `significance >= 0.5 OR isBreakthroughPattern`. `COUNT(*) = 0`. Schema clean (verified via `\d breakthrough_moments`). |
| Spiralogic orchestrator | `lib/spiralogic/*` | PARTIALLY ACTIVE | UI artifact during Kelly's exchange: shift indicator "entering earth / leaving water" and facet label "Integrating / decision has landed". Exact module path pending Phase A.5. |
| Pattern extraction | `ConversationPatternAnalyzer`, `CrossSpiralPatternRecognizer`, `AdaptiveConsciousnessLearning`, `patternService`, `conversationEssenceExtractor` | UNKNOWN | Files exist (confirmed via glob). No execution evidence observed this session. Classification pending Phase A.5. |
| Collective intelligence | `CollectiveWisdomLayer`, `CollectiveIntelligenceMemory`, `CollectiveIntelligenceProtocols`, `CollectiveWisdomField`, `app/api/ain/collective/breakthrough/route.ts` | UNKNOWN | Files and route exist (confirmed via glob). No execution evidence observed. No writes observed to any aggregation table. Classification pending Phase A.5. |
| Conversation themes | `conversation_themes` table | DORMANT | `COUNT(*) = 0` platform-wide |
| Somatic memory | `somatic_memories` table | DORMANT | `COUNT(*) = 0` platform-wide |
| Morphic patterns | `morphic_pattern_memories` table | DORMANT | `COUNT(*) = 0` platform-wide |
| Journal memory packets | `journal_memory_packets` table | DORMANT | `COUNT(*) = 0` platform-wide |
| Semantic embeddings | Vector path in `MemoryBundle.getSemanticMemories`, embedding writer in `[SEMANTIC]` path | NOT GENERATING | Log: `[SEMANTIC] Skipping insert: embedding.length=0 (expected 768)` and `[MemoryBundle] No embedding generated, returning empty`. Non-vector fallback is the active retrieval path. |
| 5-Layer Memory Palace | `lib/consciousness/memory/MAIAMemoryArchitecture.ts` | PROTOTYPE / NOT COMPILED | File header: `// @ts-nocheck - Prototype file, not type-checked` (line 1). 2,351 lines of interface definitions, no live call sites. |
| Legacy Spiralogic Oracle System | `app/api/_backend/src/*` (incl. `agents/PersonalOracleAgent`, `soullab/ConsciousnessResearchEngine`, `services/ConversationalPipeline`, `oracle/*`, `memory/*`) | DORMANT / LEGACY | Present in tree as reference. Not wired to live Next.js routes. Preserved as institutional memory from pre-Next.js Maia-Pai architecture. |

---

## 3. Known Drifts (Historical + Fixed)

### Drift 1 — Column-level schema drift on `developmental_memories`

| Field | Value |
|---|---|
| Introduced | 2025-12-28 in commit `fa58d1dd3` ("feat(memory): Cross-session memory system with TurnsStore and canon bypass") |
| Duration | ~3 months 12 days (2025-12-28 → 2026-04-09) |
| Broken columns referenced by code | `scope`, `authority`, `source`, `immutable`, `updated_at` |
| Actual production schema | None of these columns exist. Actual columns: `visibility`, `share_scope`, `confirmed_by_user`, plus others. No `authority`. No `source`. No `immutable`. No `updated_at`. |
| Silent-failure path | `try/catch/return []` in `MemoryBundle.getSemanticMemories` (line ~305); error caught by outer `try/catch` in `MemoryWriteback.writeBack` (line ~151) |
| Fixed in commit | `f2323ac0e` (2026-04-09, this session) — removed `scope`/`authority` WHERE clauses from `MemoryBundle.ts` (lines 232-235, 283-286), dropped `authority/scope/source/immutable/updated_at` from `MemoryWriteback.ts` INSERT (lines 346-355, 369-377) |
| Consequence during drift window | `developmental_memories` held **0 rows platform-wide** for 3+ months despite live traffic. Every semantic retrieval silently returned empty. Every significant writeback silently failed. |

### Drift 2 — CHECK constraint drift on `memory_type`

| Field | Value |
|---|---|
| Introduced | 2025-12-28 in commit `fa58d1dd3` (same commit as Drift 1) |
| Hidden by | Drift 1 (column error fired before check constraint could evaluate) |
| Discovered | 2026-04-09 ~22:30 UTC, after Phase A made errors loud |
| Discovery log line | `[MemoryWriteback] Write failed: error: new row for relation "developmental_memories" violates check constraint "developmental_memories_memory_type_check"` |
| Invalid value in code | `'turn_capsule'` (hardcoded in `MemoryWriteback.writeDevelopmentalMemory`) |
| CHECK constraint allows | `effective_practice`, `ineffective_practice`, `spiral_transition`, `breakthrough_emergence`, `ain_deliberation`, `correction`, `pattern`, `emergent_pattern` |
| Fixed in commit | `9dcb36817` (2026-04-09, this session) — changed hardcoded `'turn_capsule'` → `'pattern'` (closest semantic match from allowed enum) |

---

## 4. Current Risks (Strictly Factual)

1. **Pattern extraction modules not verified in execution path.** Files exist in `lib/consciousness/` and `lib/spiralogic/` (glob confirmed). No execution trace observed in this session's logs. Classification pending Phase A.5.

2. **Collective intelligence flow not verified.** `CollectiveWisdomLayer`, `/api/ain/collective/breakthrough`, and related modules have no confirmed data flow. No aggregation tables growing. Classification pending Phase A.5.

3. **Entity extraction is noisy (memory quality limitation, not survival failure).** The first developmental memory row (`id: 135ebeb3-b8b2-42ae-8d20-14ab131007d9`) has `content_text` beginning `"Entities: [Kelly, You, ve been sitting with this for a while, and it sounds like something has settled in you. What"`. The `entity_tags` column contains the same noisy extractions. Root cause: regex in `MemoryWriteback.extractEntities` (pattern `/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g`) matches capitalized sentence fragments as entities. Memory is alive; memory quality needs tightening. Deferred to Phase B.

4. **Vector/semantic embedding pipeline not generating.** Log shows repeatedly: `[SEMANTIC] Skipping insert: embedding.length=0 (expected 768)`. Embedding model service not producing output. Non-vector retrieval is the active fallback. Semantic similarity search is not currently operational.

5. **`breakthrough_moments` has never received a row platform-wide.** Code path is present and schema is clean. Kelly's 2026-04-09 exchanges scored `0.30` and `0.45`, neither crossing the `>= 0.5` breakthrough threshold. Single-session data point — not yet a defect, but warrants observation.

6. **Writeback gate calibration unreviewed.** The first successful live write had `significance = 0.44999999999999996` — narrow margin above the `0.35` promotion gate. The gate filters the majority of casual exchanges as designed. Calibration against real volume is open.

7. **`MemoryWriteback.writeBack` has an early-return on `memoryMode === 'continuity'` (lines ~92-95) that should have prevented the first successful write, yet the write succeeded.** Production logs show `mode="continuity"` at `MemoryBundle` retrieval but `[MemoryWriteback] success` and `✅ Promoted to developmental_memories` log lines fired regardless on the same exchange. This implies either: (a) the `memoryMode` passed to `writeBack` differs from the mode passed to `MemoryBundle` within the same turn, or (b) a second writeback path bypasses the continuity gate. Needs investigation in Phase A.5. Not currently blocking — the write succeeded.

---

## 5. Verified Data State (snapshot, 2026-04-09 23:00 UTC)

```
conversation_turns              17,885    (14,041 for user ce284751-...)
episodic_memories                   69    (50 for user ce284751-...)
developmental_memories               1    ← first row platform-wide, 2026-04-09 22:47:49 UTC
breakthrough_moments                 0
conversation_themes                  0
somatic_memories                     0
morphic_pattern_memories             0
journal_memory_packets               0
selflet_nodes (for ce284751-...)     1
```

**The first developmental memory row (historical record):**
```
id            135ebeb3-b8b2-42ae-8d20-14ab131007d9
user_id       ce284751-e457-42f6-89b6-bc07d0876682  (founder)
memory_type   pattern
significance  0.44999999999999996
formed_at     2026-04-09 22:47:49.064139 UTC
route         sovereign
```

---

## 6. Module Classification (Phase A.5 precursor)

**Classification rule:** A module is `ACTIVE` only if there is a log line, successful probe, behavioral artifact, or DB-state change from this session that proves it was invoked during live traffic. Anything else is `UNKNOWN` until Phase A.5 performs the full wiring audit.

### ACTIVE — verified via direct artifact this session

| Module | Artifact |
|---|---|
| `lib/memory/MemoryWriteback.writeBack` | Log: `[MemoryWriteback] Analyzing exchange for user: ce284751-...` |
| `lib/memory/MemoryWriteback.writeDevelopmentalMemory` | Log: `[MemoryWriteback] success { significance: 0.45 }` + row `135ebeb3-...` in `developmental_memories` |
| `lib/memory/MemoryBundle.build` | Log: `📦 [MemoryBundle] Built: 2 bullets, 12 recent turns (12 cross-session)` |
| `lib/memory/MemoryBundle.getRecentTurns` | Log: `📦 [Route/MemoryBundle] Turns: 12 (same-session: 0, cross: 12)` |
| `lib/memory/MemoryBundle.getSemanticMemories` (non-vector path) | Layer 1 SQL probe: INSERT → SELECT → DELETE all green |
| `lib/memory/RelationshipMemoryService.loadRelationshipMemory` | Log: `🌊 [Relationship Memory CORE] Loaded: 379 encounters, deep phase, 0 themes` |
| `lib/memory/SignificantMomentsService` | Log: `📌 [Chat API] Significant moments loaded` |
| `lib/memory/stores/TurnsStore` | Log: `Loaded N conversation turns (source: cross-session)` |
| `lib/consciousness/maiaOrchestrator` | Called `writeBack` this session (confirmed via import trace + successful write) |
| `lib/sovereign/maiaService` | Log: `✅ [Sovereign/Writeback] Memory formed: 135ebeb3-...` |
| Spiralogic phase/element detection (exact module pending audit) | UI artifact: "entering earth / leaving water" + "Integrating / decision has landed" shift indicator during live exchange |
| `app/api/between/chat/route.ts` | Request-response cycle confirmed via log chain `[Chat API] ... [MemoryBundle] ... [MemoryWriteback]` |

### REACHABLE BUT NOT FIRED — code path present, condition not met this session

| Module | Reason unfired |
|---|---|
| `lib/memory/MemoryWriteback.writeBreakthroughMoment` | Called only when `significance >= 0.5 OR isBreakthroughPattern`. Exchanges this session scored 0.30 and 0.45. |
| `MemoryBundle.getSemanticMemories` vector path | Requires 768-dim embedding; embedding generation returns `length=0`. Always falls through to non-vector path. |

### UNKNOWN — files exist, execution not verified (Phase A.5 targets)

**`lib/consciousness/`:**
- `ConversationPatternAnalyzer.ts`
- `AdaptiveConsciousnessLearning.ts`
- `CollectiveIntelligenceMemory.ts`
- `CollectiveIntelligenceProtocols.ts`
- `CollectiveWisdomField.ts`
- `ArchetypalFieldResonance.ts`
- `ArchetypalConstellation.ts`
- `BrainTrustOrchestrator.ts`
- `maia-personalization-engine.ts`
- `maia-spiralogic-oracle.ts`
- `maia-memory-palace.ts`

**`lib/spiralogic/`:**
- `CollectiveWisdomLayer.ts`
- `CrossSpiralPatternRecognizer.ts`
- `SpiralogicIntelligenceLayer.ts`
- `SpiralogicOrchestrator.ts`
- `SpiralogicDataModel.ts`
- `PhaseDetector.ts`, `TriadicPhaseDetector.ts`
- `RitualEngine.ts`
- `agents/MaiaAgent.ts`

**`lib/oracle/` and `lib/services/`:**
- `MaiaTrainingLogger.ts`
- `MaiaKnowledgeBase.ts`
- `patternService.ts`
- `conversationEssenceExtractor.ts`
- `CommunityWitnessing.ts`
- `community-field-memory.ts`

**API routes:**
- `app/api/ain/collective/breakthrough/route.ts`

### PROTOTYPE / NOT COMPILED

| Module | Reason |
|---|---|
| `lib/consciousness/memory/MAIAMemoryArchitecture.ts` | File header marks `// @ts-nocheck - Prototype file, not type-checked`. 2,351 lines of interface definitions for 5-Layer Memory Palace (Episodic / Semantic / Somatic / Morphic / Soul). No live call sites found via grep. |

### LEGACY / DORMANT

| Module | Status |
|---|---|
| `app/api/_backend/src/*` | Pre-Next.js Spiralogic Oracle System / Maia-Pai lineage. Present in tree as reference. Includes `agents/PersonalOracleAgent`, `oracle/*`, `memory/*`, `soullab/ConsciousnessResearchEngine`, `services/ConversationalPipeline`. Not wired to live Next.js routes. Institutional memory preserved. |

---

## 7. What This Document Commits To

This memo is verification crystallized. Every claim above has been traced to an artifact observed or produced in this session. No aspiration. No architecture-in-intent. Only what is.

The document establishes the baseline against which Phase A.5 (wiring audit), Phase B (memoryHealth telemetry + silent-failure elimination), Phase C (backfill + pattern extraction activation), and Phase D (collective canon + CI schema-drift gate) will be measured.

The next legitimate update to this document is after Phase A.5 produces the full wiring audit. At that point, every `UNKNOWN` row in §6 becomes either `ACTIVE`, `REACHABLE`, `ORPHAN`, or `PROTOTYPE`, each with its own artifact.

---

## 8. Historical Record — First Developmental Memory

For the record:

On **2026-04-09 at 22:47:49 UTC**, after ~3 months 12 days of silent schema drift that had kept `developmental_memories` empty platform-wide, the first row in the platform's live history was metabolized from a real exchange through the live MAIA path.

The exchange: Kelly, founder, after multiple sessions of working with a challenging client relationship involving boundary dynamics and transference, decided to propose ending the therapeutic relationship. She said so to MAIA. MAIA responded with recognition and a clarifying question about how she wanted to frame the decision.

That moment became `135ebeb3-b8b2-42ae-8d20-14ab131007d9` — the first proof that a meaningful moment can become developmental memory through this platform's live metabolism.

This is the line between **stored experience** and **metabolized experience**. Everything built from here forward operates on the far side of that line.
