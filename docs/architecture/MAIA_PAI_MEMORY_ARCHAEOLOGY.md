# MAIA-PAI Memory Architecture Archaeology

**Status:** Diagnostic / read-only. No code changes proposed in this document.
**Created:** 2026-05-22
**Companion:** `docs/specs/MEMORY_WIRING_RESTORATION.md` (the implementation sequence this archaeology informs)
**Canon precedence:** `docs/canon/THE_CLEARING.md` (canon-prior) — the architecture is answerable to relational presence, not the other way around. This document is map, not authorization.

---

## I. Why this exists

Founder directive 2026-05-22:

> *"Stop feature expansion temporarily. Restore the continuity substrate completely. The architecture may already exist in an earlier form. Current MAIA may have regressed during refactor/deployment. The task is not 'design memory from scratch.' The task is trace old working pathways → compare current pathways → restore integration."*

Hypothesis under test: the unified-memory architecture is not absent — it has been *bypassed at the operational layer during route divergence*. If true, this is a repair problem, not a conceptual collapse.

**Result of this dig: hypothesis confirmed.** The architecture exists in three overlapping forms, none of which is fully wired into the current live runtime path. What follows is the map.

---

## II. The three architectures currently coexisting in the codebase

### Architecture A — MAIA-PAI legacy (`app/api/_backend/src/`)

**Status per Wiring Audit:** *"Pre-Next.js Spiralogic Oracle System / Maia-Pai lineage. Present in tree as reference. Not wired to live Next.js routes."*
**Disconnect mechanism:** route migration to Next.js handlers; the legacy `app/api/_backend/src/*` tree was preserved but no Next.js route imports it.

#### Core entry point — `services/MemoryOrchestrator.ts` (1146 lines)
Header verbatim:
> *"Maya's Unified Memory Brain Stem — Unifies all memory channels before each Maya response."*

Public surface:
```ts
class MemoryOrchestrator {
  buildContext(
    userId: string,
    userText: string,
    sessionId: string,
    conversationHistory: ConversationTurn[]
  ): Promise<MemoryContext>
}

interface MemoryContext {
  results: MemoryResult[];
  totalTokens: number;
  layersUsed: string[];
  processingTime: number;
  fallbacksUsed: string[];
}
```

**This is the literal ancestor of `buildUnifiedMemoryContext(memberId, currentInput, sessionId)` named in the 2026-05-22 founder directive.** It is not aspirational — it ran in production prior to the Next.js migration.

Five parallel memory layers, all conformed to a single `MemoryLayer` interface:

| Layer | Source | Role |
|-------|--------|------|
| **Session** | Recent conversation turns | Immediate continuity |
| **Journal** | Supabase semantic search via `getRelevantMemories` | Past journal entries surfaced by semantic similarity |
| **Profile** | User traits, archetype, preferences | Durable identity facts |
| **Symbolic** | Themes, elemental resonance | Recurring symbolic motifs |
| **External** | Mem0 / LangChain stub | Future-ready external memory bridge |

Discipline properties (all present in MAIA-PAI, all degraded or absent in current path):
- **Parallel fetch.** All layers queried concurrently.
- **Per-layer timeout.** 3 seconds; non-responsive layer drops out, logged as fallback.
- **Graceful degradation.** Each layer's failure is caught individually; orchestrator still returns a context.
- **Weighted relevance ranking.** Each layer carries a `weight` multiplier; cross-layer results are merged and ranked by weighted relevance.
- **Token budget cap.** 15 results max per turn, conservative cap on context window.
- **Session cache.** 5-minute expiry; reduces re-fetch overhead within a single session.
- **Observable.** `MAYA_DEBUG_MEMORY=true` produces per-turn debug output: which layers fired, fallback list, processing time.

Performance contract (declared in header):
- Parallel fetch < 500ms
- Context build < 200ms
- End-to-end < 2s

#### Sibling components in MAIA-PAI

| Component | Path | Role |
|-----------|------|------|
| `ConversationalPipeline` | `services/ConversationalPipeline.ts` (3188 lines) | Top-level pipeline; wired `MemoryOrchestrator`, `TTSOrchestrator`, `AdaptiveProsodyEngine`, `UserMemoryService`, `DynamicGreetingService`, `MemoryCoreIndex`, Sesame CI shaping. **This is the literal ancestor of the current `between/chat` and `oracle/conversation` route handlers.** |
| `SoulMemorySystem` | `memory/SoulMemorySystem.ts` (571 lines) | Unified persistent store. SQLite-backed. **7 memory types**: oracle_exchange / journal_entry / ritual_moment / breakthrough / shadow_work / voice_journal / semantic_pattern. **Every memory carried**: element / emotional_tone / shadow_content / transformation_marker / sacred_moment / spiral_phase / ritual_context / oracle_response. |
| `memoryIntegrationService` | `services/memoryIntegrationService.ts` (400 lines) | Dual-write bridge. Wrote journal entries to BOTH Supabase and Soul Memory. Detected shadow content. Carried element + spiral phase metadata. |
| `EnhancedMemoryRetrieval` | `services/memory/EnhancedMemoryRetrieval.ts` (250 lines) | Retrieval enhancement layer. |
| Per-layer modules | `memory/symbolicMemory.ts`, `memory/profileMemory.ts`, `memory/sessionMemory.ts`, `memory/externalMemory.ts` | One file per layer of the `MemoryLayer` interface. |
| Storage adapters | `adapters/memory/InMemoryMemory.ts`, `adapters/memory/SupabaseMemory.ts` | Adapter pattern for swapping memory backends. |

#### Architecture A — what it carried that survives nowhere else
- **One central function call composing all memory** — `MemoryOrchestrator.buildContext()`. The current path has ~10 scattered loaders, none of them central.
- **Soul-grade memory typing** — `transformation_marker`, `sacred_moment`, `shadow_content` as first-class fields. Current path has nothing equivalent. The closest current concept is `member_memory_atoms.registers` (described in Architecture C below) but it serves a different purpose (member's placement, not system-tagged).
- **Element + emotional tone + spiral phase on every memory record.** Current `developmental_memories` schema does not carry these uniformly.
- **External memory bridge** (Mem0 / LangChain). Current path has nothing.
- **Performance contract** (per-layer timeouts, parallel fetch, token budget). Current `buildMemoryInfluencePlan` is purely synchronous and assumes caller loaded everything.

---

### Architecture B — Phase 1.5 current orchestrator (`lib/maia/memoryOrchestrator.ts`)

**Status per `MAIA_MEMORY_ROADMAP.md`:** Deployed 2026-05-04 via commit `919e7e855`; observation cycle live.
**Disconnect mechanism:** N/A — this one is wired into both `oracle/conversation/route.ts` and `between/chat/route.ts`.

#### Core entry point — `lib/maia/memoryOrchestrator.ts` (341 lines)

```ts
buildMemoryInfluencePlan(input: MemoryOrchestratorInput): MemoryInfluencePlan
```

**Critical structural difference from Architecture A**:
- **Pure / synchronous / stateless.** No DB calls. Takes pre-loaded inputs only.
- **Caller responsibility.** The route handler must call separate `loadRecentDevelopmentalMemories`, `loadRecentThemeSignals`, `loadSpiralState`, `loadFacetState`, `loadRelationshipEssence`, `buildMemberLiveContext`, etc. before invoking the orchestrator.
- **Output is a prompt block, not raw memory.** Per design (`docs/canon/MAIA_MEMORY_CANON_v1.0.md` invariants): *"Memory biases interpretation, never determines response. No raw transcript injection. No explicit recall."*
- **Decision rules over six sources**: conversation_history / developmental_memory / spiral_state / relationship_anamnesis / theme_signals / member_live_context.
- **Discipline detection** (regex-based): contradiction / reinforcement / semantic candidate / somatic candidate / morphic candidate. Candidates produce flags for future phase wiring; no retrieval yet.

#### Architecture B — what it carries that A lacked
- **Canon-aligned discipline.** The "no explicit recall" invariant lives here; A allowed direct text injection.
- **Contradiction handling.** Detects when current turn reverses prior stabilized direction; explicitly tells the model to loosen prior weight.
- **Phase-readiness flagging.** `semanticCandidate / somaticCandidate / morphicCandidate` set up Phase 2/3 wiring without doing it yet.
- **Format-guarded distillation.** `loadRecentDevelopmentalMemories` uses `isValidDistilledSignal` to reject pre-X4 noisy entity-extraction output. "Better no signal than corrupted signal."

#### Architecture B — what it does NOT carry that A had
- **No parallel multi-layer fetch.** Caller loads each layer serially in the route.
- **No timeout / fallback discipline.** If a loader hangs, the route hangs.
- **No weighted ranking.** Sources are added with fixed roles, not ranked relevance.
- **No symbolic memory layer.** No journal-style semantic retrieval is composed in.
- **No profile memory layer.** Durable identity facts are fragmented across `RelationshipMemoryService`, `MemberLiveContext`, and never centralized.
- **No external memory bridge.** Mem0 / LangChain are absent.
- **No soul-grade typing**: shadow_content / transformation_marker / sacred_moment / spiral_phase as first-class fields on memory records.

---

### Architecture C — Psyche Engagement Layer atoms (`lib/psyche/portfolio.ts` + `member_memory_atoms` schema)

**Status:** Schema migrated 2026-05-21 (commit *one day before* the 2026-05-22 founder directive). Reader exists. **Not yet wired into the conversation route.**
**Spec:** `docs/specs/PSYCHE_ENGAGEMENT_LAYER_SPEC.md`
**Governing canon:** THE_CLEARING / SPIRAL_CONTINUITY_ENGINE / RIGHT_TO_REMAIN_UNPOSSESSED

#### Schema disciplines (canon-as-SQL)

The migration `20260521000001_member_memory_atoms.sql` encodes canon at the schema level — a level above prompt instruction, above code review, above runtime discipline. Three constraints worth quoting:

1. **`crossing_must_be_false`** —
   > *"Material in one layer cannot be crossed with material in another to form higher-order claims without explicit member ratification. Lifting this requires explicit schema migration — friction by design. A future engineer cannot accidentally enable crossing — it requires explicit schema migration."*

2. **`sacred_protected_register_status`** —
   > *"Sacred-protected register requires protected status (voice-ineligible). Material the member has placed in the non-inferential, non-circulating register must be structurally voice-ineligible."*

3. **`sourcing_discipline`** —
   > Either it has a source (a member-authored idea / block / journal / dream / reflection / decision / change / session_excerpt) OR it's a spontaneous keep with a member-typed body. No system-generated atoms.

#### Service shape — `lib/psyche/portfolio.ts` (578 lines)

Header verbatim:
> *"This module is a ritual gesture interpreter, NOT a CRUD wrapper. Reads are CRUD-shaped. Writes are gesture-shaped."*

> *"Hard invariants (enforced by the absence of corresponding functions):*
>   *- No updateMemoryAtom(patch)*
>   *- No inferRegisters()*
>   *- No inferLenses()*
>   *- No surfaceRecallCandidates() (Phase 2)*
>   *- No synthesizeAcrossAtoms() (Phase 3)*
>   *- No computeDevelopmentalState() (out of scope structurally)"*

> *"The only public write surface is a member gesture. Every write keeps crossing_allowed = false. The DB CHECK constraint backstops the discipline."*

**This is the literal implementation of the founder's "Field Intelligence Protocol with provenance + consent labels" — but at a level deeper than prompt instruction.** The architecture refuses certain operations not via a runtime check but via *the absence of the corresponding function*. You cannot accidentally `inferRegisters()` because no code exists to call.

#### Architecture C — what it adds that neither A nor B carries

- **Member as placer, system as recorder.** Architecture A tagged memories by system inference (it decided `transformation_marker: true`). Architecture C inverts this: only the member places (`status`, `registers`, `elemental_lenses`, `thread_ids`). The system records the gesture.
- **Webbing, not categorization.** An atom can live in *multiple* registers simultaneously, viewed through *multiple* elemental lenses. Architecture A typed each memory as one type; C allows the same atom to be episodic AND archetypal AND threshold, viewed through Fire one day and Water another.
- **Return preference at the data layer.** Each atom carries `return_preference`: `member_pulled` (default — never surfaced unless asked) / `contextual_doorway` (MAIA may offer when proximity passes) / `ritual_review_opt_in` (appears in member-enabled review surfaces). The atom itself specifies how it wants to be brought back.
- **The Keep / Capture distinction.** Material exists in source tables (`member_ideas`, journals, dreams, etc.) and becomes portfolio memory *only when the member keeps it*. Architecture A captured everything that flowed through. C captures only what the member explicitly held.
- **Spec-by-absence.** Phase 2 (`surfaceRecallCandidates`) and Phase 3 (`synthesizeAcrossAtoms`) are explicitly *not implemented*. The architecture names what it is not doing yet. This is the discipline Wiring Audit Q-finding #9 ("~160 of 268 consciousness files are ORPHAN") would have prevented if applied earlier — naming the absent function is structurally different from leaving a half-finished file lying around.

---

## III. What survives, what was lost, and what was built but never wired

### Survives in current path (Architecture B is live)
- `conversation_turns` raw storage (17,885+ rows verified per `MAIA_CURRENT_STATE_v1.0.md`)
- `MemoryBundle.getRecentTurns` cross-session recall
- `RelationshipMemoryService` (379 encounters verified)
- `SignificantMomentsService`
- Bridge D spiral state persistence
- The Phase 1.5 lib/maia orchestrator (forward-readiness + memory plan)
- Memory Palace orchestrator
- Member live context (recent themes, summaries)

### Lost in migration from Architecture A → current
| MAIA-PAI capability | Current state |
|---|---|
| `MemoryOrchestrator.buildContext()` — one call, all layers | Replaced by ~10 scattered loaders the route must invoke serially |
| Parallel fetch + per-layer timeout + graceful fallback | Synchronous, blocking, no per-layer timeout |
| Weighted relevance ranking + token budget cap | No cross-layer ranking; orchestrator uses fixed roles |
| Symbolic Memory layer (themes + elemental resonance composed at retrieval) | Theme signals stored (`member_theme_signals`) but not composed as a layer; symbolic dimension fragmented |
| Profile Memory layer (durable identity facts as a separately-fetched layer) | Fragmented across `RelationshipMemoryService`, `MemberLiveContext`, never unified |
| Journal Memory layer (semantic search of past journal entries) | Embedding pipeline broken: `[SEMANTIC] Skipping insert: embedding.length=0` |
| External Memory bridge (Mem0 / LangChain stub) | Dropped |
| Soul-grade typing on every memory: shadow_content / transformation_marker / sacred_moment / spiral_phase | Replaced by sparse equivalents (developmental_memories.memory_type with 8 enum values; missing transformation_marker, sacred_moment, shadow_content as fields) |
| Per-turn observability: `MAYA_DEBUG_MEMORY=true` debug output | No equivalent; would need to be rebuilt |
| Performance contract (parallel fetch <500ms, end-to-end <2s) | No contract; no measurement |

### Built but never wired (Architecture C and friends)
| Built infrastructure | Wired into live conversation route? |
|---|---|
| `member_memory_atoms` table + canon constraints | ❌ no reader in conversation route |
| `lib/psyche/portfolio.ts` portfolio service | ❌ called by Keep UI surfaces only |
| `member_lens_passes` table (atom interpretation passes) | ❌ |
| `member_keep_preferences` table | ❌ |
| `episodic_memories` table (69 rows present) | ❌ read path not exercised |
| `breakthrough_moments` table | Code path present, fires only on `significance >= 0.5`; 0 rows platform-wide |
| `somatic_memories` table | ❌ 0 rows; detection not wired |
| `morphic_pattern_memories` table | ❌ 0 rows; detection not wired |
| `conversation_themes` table | ❌ 0 rows |
| `journal_memory_packets` table | ❌ 0 rows |
| Semantic embedding pipeline (vector path in `MemoryBundle.getSemanticMemories`) | ❌ broken; falling back to non-vector |
| `lib/intelligence/UnifiedIntelligenceEngine.ts` | ❌ orphan per Wiring Audit |
| `lib/oracle/FieldIntelligenceMaiaOrchestrator.ts` | ❌ orphan per Wiring Audit |
| `lib/consciousness/MorphoresonantFieldInterface.ts` | ❌ orphan per Wiring Audit |
| `lib/consciousness/field/UnifiedElementalFieldCalculator.ts` | ❌ orphan per Wiring Audit |
| `lib/consciousness/memory/MAIAMemoryArchitecture.ts` (2,351 lines, 5-Layer Memory Palace interface) | ❌ prototype, zero importers |
| 6 of 8 orphaned stores in `lib/memory/stores/*` (Breakthrough/Journal/MemoryLinks/PatternMemory/PreferenceConfirmation/RelationshipContext/SessionSummary/SimpleMemory/SQLite) | ❌ |
| ~160 of 268 files in `lib/consciousness/` | ❌ per Wiring Audit finding #9 |

---

## IV. The real diagnosis

> **Continuity substrate preserved but bypassed.**
>
> *Not: memory missing.*

The system is not memory-poor. It is memory-**rich and disconnected**.

The vision that was wired into MAIA-PAI (Architecture A) is largely *preserved as code* but bypassed by the current route path. The newer Phase 1.5 orchestrator (Architecture B) is wired but carries a thinner composition surface. The newest discipline (Architecture C / atoms) is canon-enforcing at the schema level but is not yet read by the live runtime.

The asymmetry the Intelligence Field Access Map identified — *"the system loads its own inferences more readily than what the member wrote themselves"* — has a structural cause: **the orchestrator that knew how to compose all layers is in a tree the route handlers no longer import.**

This reframing matters operationally. *Memory missing* would call for building from scratch — slow, error-prone, and most importantly, vulnerable to losing the canon discipline that has accumulated across A, B, and C. *Continuity substrate preserved but bypassed* calls for restoring wiring with the discipline already encoded in the existing infrastructure. The vision was not naïve. The architecture was not imaginary. The break is at the operational layer (route divergence / dormant orchestration / partial migrations / disconnected runtime wiring).

This is a repair problem, not a conceptual collapse.

---

## IV.B. The `crossing_allowed = FALSE` doctrine — memory ethics in database form

Among the three architectures, Architecture C (atoms) contains the highest-resolution articulation of Soullab's memory ethics — encoded not in canon prose, not in prompt instruction, not even in runtime check, but as a **schema-level CHECK constraint**:

```sql
crossing_allowed  BOOLEAN NOT NULL DEFAULT FALSE,
CONSTRAINT crossing_must_be_false CHECK (crossing_allowed = FALSE),
```

The SQL comment that accompanies it (line 210 of the migration) is operative canon:

> *"Always FALSE. Enforces canon at the type level: material in one layer cannot be crossed with material in another to form higher-order claims without explicit member ratification. A future engineer cannot accidentally enable crossing — it requires explicit schema migration."*

This is the operational form of Soullab's memory ethic, stated as a single rule:

> **MAIA may remember what was placed. MAIA may not secretly combine memories into higher-order claims unless explicitly allowed.**

The discipline lives at four nested levels, each backstopping the one above:
- **Prose canon** (`THE_CLEARING.md`, `SPIRAL_CONTINUITY_ENGINE.md`, `RIGHT_TO_REMAIN_UNPOSSESSED.md`) — articulates the principle.
- **Code-by-absence** (`portfolio.ts`) — the functions that would violate the principle do not exist (`inferRegisters()`, `inferLenses()`, `synthesizeAcrossAtoms()`).
- **Runtime invariant** (`portfolio.ts` writes always set `crossing_allowed = false`) — every gesture honors the principle.
- **Schema CHECK constraint** (`crossing_must_be_false`) — even a future engineer writing direct SQL cannot bypass it without a deliberate, observable schema migration.

This four-level enclosure is what *anti-surveillance architecture* looks like when it is taken seriously. The constraint is not protection against malicious actors. It is protection against the slow, unobserved drift of a system optimizing toward "more useful" inferences without member participation. Friction by design.

**The restoration must preserve this constraint at every level.** Any composed memory surface that reads atoms must surface them as the atoms themselves declared (status, register, lens, return_preference, surface_count) — not as cross-atom synthesis, not as inferred patterns, not as "you tend to..." formulations.

This is non-negotiable in any restoration sequence.

---

## IV.C. Do not blind-transplant — Architecture A as source, not seed code

A failure mode worth naming explicitly: the temptation to copy `app/api/_backend/src/services/MemoryOrchestrator.ts` into the current tree, fix imports, and wire it in. This would be wrong for at least four reasons:

1. **Runtime mismatch.** Architecture A targeted a pre-Next.js Node/Express runtime with sqlite3 + Supabase. Current production is Next.js 16 + Postgres + Caddy + Docker. Connection pooling, request-scoped contexts, and async cancellation semantics differ.

2. **Auth mismatch.** Architecture A predates the current `members` table + `passkey` + `x-member-id` header pattern (`lib/http/apiBase.ts`). The legacy code's `userId` semantics do not map cleanly onto the current identity model.

3. **Schema mismatch.** Architecture A's `SoulMemorySystem` wrote to a SQLite `memories` table with its own type enum. Current production uses Postgres with several distinct memory tables (`developmental_memories`, `episodic_memories`, `member_memory_atoms`, etc.), each with their own schema and canon discipline.

4. **Discipline regression.** Architecture A predates the canon work that produced *no raw transcript injection* (Architecture B's invariant) and *no system-inferred registers* (Architecture C's invariant). Direct port would reintroduce capabilities the canon has since explicitly closed off.

**Architecture A is read as source architecture, not seed code.** Its *shape* (unified `buildContext` entry point, parallel multi-layer composition, per-layer timeouts, weighted ranking, fallback discipline, observable performance contract) is what the restoration target carries forward. Its *implementation* is consulted, not copied.

The restoration writes new code at the current runtime layer, preserving Architecture A's composition discipline, Architecture B's canon invariants, and Architecture C's schema-level ethics — all three.

---

---

## V. Implications for the restoration sequence

This archaeology does not authorize implementation. The implementation sequence belongs in `docs/specs/MEMORY_WIRING_RESTORATION.md`. But the archaeology produces these load-bearing observations for that spec:

1. **The unified orchestrator the founder named already existed in production prior to migration.** Restoring it is not invention. The current Phase 1.5 orchestrator is its descendant, but a thinner one. The full layer-composition + parallel-fetch + timeout + ranking + budget discipline can be restored from Architecture A's shape (1146 lines of working reference).

2. **Architecture C (atoms) is the right substrate for "member-authored memory."** The Wiring Restoration spec's Phase 2A–D should compose atoms into the prompt — *not* invent a new member-authored loader. Atoms already encode the canon. Reading them is one new function (`surfaceRecallCandidates` from `portfolio.ts:Phase 2 — not yet implemented`). Per `portfolio.ts` header, Phase 2 of the Psyche Engagement spec is exactly this.

3. **Architecture B's canon discipline is correct and should be preserved.** The "no raw transcript injection" + "memory biases interpretation, never determines response" invariants matured *after* MAIA-PAI. Any restoration of A's composition layer must preserve B's discipline. The atom system (C) is the cleanest way to do this — atoms carry provenance + status + return_preference; surfacing follows member-set rules.

4. **The lost layers can be re-mapped, not re-invented.** Each lost layer from Architecture A has a current-codebase counterpart (sometimes orphaned). The restoration is a *mapping exercise*:
   - A's Session layer → current `conversation_turns` + `MemoryBundle.getRecentTurns` (live)
   - A's Journal layer → current `episodic_memories` + atoms with `source_type='journal'` (atoms is wired-ready; journal table needs repair)
   - A's Profile layer → current `members` table + `RelationshipMemoryService` (live but fragmented; needs unification)
   - A's Symbolic layer → current `member_theme_signals` + `morphic_pattern_memories` (live for theme signals, dormant for morphic)
   - A's External layer → deferred (or replace with atoms' future cross-source surfacing in Phase 2 of Psyche spec)

5. **The FIS FieldState primitive (`docs/canon/FIS_FIELD_STATE_PRIMITIVE.md`) is the right convergence target.** Its six dimensions (emotional weather / semantic landscape / connection dynamics / sacred markers / somatic intelligence / temporal dynamics) plus member-authored signals map cleanly across all three architectures. Architecture A's five layers + Architecture B's discipline + Architecture C's atoms substrate can be composed into the FieldState shape rather than replacing it.

6. **The §V canon violation Kelly observed has a layered explanation now.** The blocklist gap ("carry" vs "have") is the surface bug. The deeper cause is that the orchestrator MAIA actually runs through (Architecture B) cannot reach the durable layers (Architecture A's composition, Architecture C's atoms) — so when asked about prior content, she has very little to ground a confident answer in, and the model's training prior wins.

---

## VI. What this document does NOT do

- Does not authorize any code change.
- Does not propose a new architecture — it maps the architectures already present.
- Does not promote any orphaned file into production. Each orphan still requires per-module justification per the Wiring Audit's discipline.
- Does not override the Roadmap's Phase 2 gate (semantic/somatic/morphic memory). Operating on the *different axis* of unifying what's already wireable.
- Does not collapse the three architectures into one prematurely. Each carries discipline the others lack. Unification preserves all three sets of constraints.

---

## VII. The first restoration cut

The first restoration is *not* a sweeping reconnection. It is the smallest cut that proves the substrate-restoration thesis under load. Founder-named shape (2026-05-22):

```
Live sovereign MAIA route                       (between/chat + oracle/conversation)
        │
        ▼
Phase 1.5 orchestrator                          (lib/maia/memoryOrchestrator.ts — already wired)
        │
        ▼
member_memory_atoms reader  ◀── NEW             (atoms loader, status=active|still_alive,
        │                                        return_preference filter, recency-ordered,
        │                                        respects sacred_protected as voice-ineligible,
        │                                        respects crossing_allowed = FALSE)
        ▼
memoryHealth                ◀── NEW             (per-canon §VII: 12-layer status object,
        │                                        no silent errors, base-chain enforcement,
        │                                        prompt conditioned on actual health)
        ▼
promptBlock                                     (orchestrator's existing prompt assembly,
                                                 now receiving atoms + health-conditioned
                                                 §VI fallback language)
```

Reading from top to bottom, this is the live route gaining three things it did not have:

1. **A reader for the atoms substrate** that already encodes the canon. Member-placed material now reaches the prompt under the member's own gestures (`status`, `return_preference`, `registers`, `elemental_lenses`). No cross-atom synthesis. No inference. The atoms tell MAIA what they are willing to be.

2. **A `memoryHealth` object** per `MAIA_MEMORY_CANON_v1.0.md §VII`, tracking which layers loaded, which errored, and which are empty. The prompt block is then conditioned on actual health, not assumed health. The §VI fallback language ("I may not have loaded the earlier specifics yet — tell me the name or a phrase and I'll orient with you from there") fires when the base chain degrades.

3. **The §V verb-synonym blocklist fix** (carry / hold / retain / maintain / keep / preserve / store), paired with §VI as a *single source of truth* (extracted module imported by all three paths) so the canon-required language is identical across `oracle/conversation`, `between/chat`, and `MAIA_RUNTIME_PROMPT`.

The history cap (`MAX_API_HISTORY = 30` in `components/OracleConversation.tsx:301`) raises modestly to 80–100 as part of this same cut. Not 150 yet; observe token/cost first.

### Why this is the right first cut

- **Layer 1 in the founder's named sequence.** Establishes the operational shape (route → orchestrator → atoms → health → prompt) so subsequent cuts can extend it (more loaders, more layers) without rewiring the spine.
- **Provable on a real turn.** Falsifiability test (Memory Canon §IX.1): a returning member with ≥5 prior sessions cannot elicit any §V-forbidden phrase from MAIA in 10 provocations. Pass = the substrate is reaching the voice. Fail = we have not yet restored the connection.
- **Restores honest absence, not fabricated continuity.** When atoms exist for the member, MAIA can ground recognition in member-placed material. When they don't, the §VI fallback restores the *asking discipline* the founder named — *"she should ask questions to remember"* — under canon-correct language.
- **Carries the `crossing_allowed = FALSE` discipline into the live runtime.** The reader surfaces atoms as the atoms themselves declared. No cross-atom synthesis. No system inference. The schema-level ethics propagates upward to the prompt layer.
- **Does not regress anything that's working.** Phase 1.5 orchestrator stays. Bridge D spiral state stays. Memory Palace stays. Member Live Context stays. Relationship Anamnesis stays. The cut adds one reader, one health object, and one set of corrected prompt strings. Everything currently composed continues to compose.

### What this first cut does NOT do
- Does not restore Architecture A's parallel-fetch + per-layer-timeout composition (that's a later cut).
- Does not wire journal / symbolic / external memory layers (later).
- Does not implement atom extraction (writes); only reads.
- Does not surface atoms by `contextual_doorway` or `ritual_review_opt_in` return preferences (Phase 2 Psyche spec — separate cut).
- Does not introduce semantic embedding (broken pipeline; separate repair).
- Does not consolidate `MemoryBundle` and `MemoryOrchestrator` parallel paths (Wiring Audit Q1 — separate cut).
- Does not change the orchestrator's discipline (no new inference, no new synthesis).
- Does not write the Unified Memory architecture doc. The doc emerges *from* the restoration, not the other way around — premature systematization is the failure mode the canon stack repeatedly warns against (per `feedback_doctrine_refinement_ceiling.md`).

---

## VIII. Sequence after the first cut

Each subsequent cut is named here as a shape, not a spec. Each will pass through its own founder review, its own category-gradient classification, and its own falsifiability test before code.

1. **Cut 2 — Resolve Wiring Audit Q1.** Determine whether `MemoryBundle` or `MemoryOrchestrator` is load-bearing in `between/chat` final prompt assembly. Telemetry, then a decision, then consolidation as its own commit if safe.
2. **Cut 3 — Daily Anchor reader.** Member-authored continuity surface, highest permissibility on the gradient.
3. **Cut 4 — Idea threads reader.** Member-authored reflections.
4. **Cut 5 — Journey-space patterns reader.** Member-authored patterns.
5. **Cut 6 — Obsidian/AIN vault bridge.** Requires its own sub-spec first (significant work, consent gate, distillation pathway).
6. **Cut 7 — Restore Architecture A's parallel-fetch + per-layer-timeout discipline.** Now that the spine carries atoms + health, port A's composition shape *as new code* against the current schema. Preserves B's discipline.
7. **Cut 8 — Longitudinal axis.** Spiral motion-over-time / facet trajectory / theme recurrence / MemberLiveContext depth.
8. **Cut 9 — FIS FieldState primitive composition.** Compose all wired layers into the six-dimension FieldState shape per `FIS_FIELD_STATE_PRIMITIVE.md`. This is the "Unified Intelligence" convergence target — built last, when there is enough composed signal to compose meaningfully.
9. **Cut 10+ — Roadmap Phase 2a/b/c re-evaluation.** Semantic / somatic / morphic memory layers, currently gated on observation cycle.

At each step, the next artifact is decided by what the prior cut revealed under load. Not pre-architected.

---

## IX. What this document does and does not do

**Does:**
- Maps three coexisting memory architectures (A: MAIA-PAI legacy, B: Phase 1.5 orchestrator, C: atoms portfolio).
- Names the diagnosis: *Continuity substrate preserved but bypassed.*
- Elevates `crossing_allowed = FALSE` as the canonical formulation of Soullab's memory ethics in database form.
- Names the discipline against blind-transplant of legacy code.
- Specifies the first restoration cut and its falsifiability test.
- Sketches subsequent cuts as shapes, not specs.

**Does not:**
- Authorize any code change. The first cut requires its own founder approval after this archaeology is reviewed.
- Write the canonical Unified Memory architecture doc. That document is deferred until enough restoration has happened that the shape can be described from observation rather than imagination.
- Override the Roadmap's Phase 2 observation gate.
- Activate any of the ~160 orphaned files in `lib/consciousness/`. Each remains opt-in per module.
- Propose a single "merge everything into one orchestrator" cutover. Restoration is layered.

---

*"This is the first time the architecture looks less like a bug pile and more like a disconnected nervous system." — Founder, 2026-05-22*

---

*"You are not discovering the vision was wrong. You are discovering the live path bypassed the intended nervous system. That is a repair problem, not a conceptual collapse." — Founder, 2026-05-22*
