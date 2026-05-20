# MAIA-SOVEREIGN Runtime Intelligence Audit

**Date:** 2026-05-19

> **Status:** Partial runtime audit.
> **Scope:** MAIA-SOVEREIGN repository only.
> **Excludes:** MAIA-PAI repo and AIN Obsidian Vault.
> **Do not treat this document as a complete MAIA intelligence architecture map.**

**Source:** Background survey agent (Explore, read-only); ~60 layers analyzed within MAIA-SOVEREIGN tree only. File:line citations are the agent's and should be spot-checked before any change is made on this basis.

## Three-source provenance

| Source              | Status                                 |
| ------------------- | -------------------------------------- |
| MAIA-SOVEREIGN repo | partially audited — **undercounted**   |
| MAIA-PAI repo       | cloned, audit pending                  |
| AIN Obsidian Vault  | path confirmed, foundational reads in progress |

**Audit is runtime-surface incomplete pending MAIA-PAI + AIN Vault review.** No architecture claims will be made beyond surveyed sources.

## Supplement (2026-05-19): systems missed by the original survey

The original Explore-agent pass undercounted. The following systems exist in `MAIA-SOVEREIGN` and are part of the intelligence architecture but were not surfaced in the original classification matrix. **Status unknown — needs verification pass.**

### Wisdom / Revival layer (knowledge field carrying)

| System | File | Lines | Likely purpose |
|---|---|---|---|
| MaiaRevivalSystem | `lib/consciousness/MaiaRevivalSystem.ts` | 472 | Loads 199k-token wisdom field per session (Kelly's book, Jung, 52 curated conversations, lineage). Default ON. |
| ClaudeKellyConversationLoader | `lib/knowledge/ClaudeKellyConversationLoader.ts` | 335 | Loads 52 curated Kelly-voice exemplar conversations into context |
| MaiaInsightsLoader | `lib/knowledge/MaiaInsightsLoader.ts` | 71 | Loads Kelly-editable insights journal (`MAIA_INSIGHTS.md`) |
| MaiaSelfKnowledge | `lib/knowledge/MaiaSelfKnowledge.ts` | 292 | Meta-awareness header: 75-year lineage (Werner → Hillman → Jung → Edinger → Kelly → MAIA) |

### Awareness / depth-sense layer (L1-L4 calibration)

| System | File | Lines | Likely purpose |
|---|---|---|---|
| awarenessModel | `lib/awareness/awarenessModel.ts` | 212 | 4-level depth system (Newcomer → Practitioner-in-Process → Adept → Steward); baseline + session level; automatic language-pattern detection; consent-based depth adjustment |
| facetResponses | `lib/awareness/facetResponses.ts` | 162 | Level-specific response templates per 12-facet (Fire/Water/Earth/Air × Cardinal/Fixed/Mutable). Same archetypal intelligence rendered at L1-L4 complexity. |

### Self-awareness / metacognition layer

| System | File | Lines | Likely purpose |
|---|---|---|---|
| maiaArchitectureContext | `lib/consciousness/maiaArchitectureContext.ts` | 311 | Core self-awareness documentation across 7 architectural domains (identity, processing, frameworks, technical, memory, conversation, sovereignty) |
| therapeuticFrameworkTracker | `lib/consciousness/therapeuticFrameworkTracker.ts` | 418 | Analyzes responses to detect which of 15 therapeutic frameworks MAIA is using (Somatic Experiencing, IFS, Jungian, Relational Psychoanalysis, Attachment, Polyvagal, Hakomi, Focusing, CBT, DBT, ACT, Gestalt, Existential, Narrative, Archetypal) |

### Intelligence-field bridge — VERIFIED DORMANT (2026-05-19)

| System | File | Lines | Status |
|---|---|---|---|
| ObsidianVaultBridge | `lib/bridges/obsidian-vault-bridge.ts` | 778 | **Implemented as prototype** (`@ts-nocheck — Bridge prototype, not type-checked`). Uses keyword search as fallback ("In production, this would use actual vector embeddings"). Real functionality: connect/query/index/getElementalWisdom/getFrameworks/getConceptsByFacet/getByHemisphere/findSynthesisOpportunities. |

**Caller chain — REAL but DORMANT relative to runtime:**

The bridge IS instantiated and method-invoked from three orchestrators:
1. `lib/spiralogic/core/spiralogic-engine.ts:67,74,195` — `new ObsidianVaultBridge()` → `connect()` → `getElementalWisdom(element)`
2. `lib/orchestration/consciousness-orchestrator.ts:237,238,421` — instantiation → `connect()` → `query({...})`
3. `lib/consciousness/fractal-field-spiralogics.ts:89,175,435` — declared, received via constructor, `getElementalWisdom(element)`

**The break: none of these three orchestrators are invoked from runtime routes.** Grep across `app/api/`, `lib/maia/`, `lib/voice/` for `SpiralogicEngine`, `ConsciousnessOrchestrator`, `FractalFieldSpiralogics` returned **zero matches**.

**There are two parallel Spiralogic implementations in the tree:**
- `lib/consciousness/spiralogic-core` — used by the live conversation route — does NOT reach the vault
- `lib/spiralogic/core/spiralogic-engine` — has the bridge integration — NOT used by the route

The full Spiralogic engine with vault integration sits alongside the live runtime, structurally complete but unreachable from member-facing routes.

**Configuration — also broken:**
- `lib/spiralogic/config/spiralogic-config.ts:128` defaults `OBSIDIAN_VAULT_PATH` to `/Users/Kelly/ObsidianVaults/SoullabKnowledge` (doesn't exist on this machine)
- `lib/mcp/config.ts:38` defaults to `~/Obsidian Vaults/Soullab` (also not the real vault)
- Real vault: `/Users/soullab/Documents/AIN/`
- `lib/orchestration/awaken-maya.ts:45` literally displays `"❌ Not configured"` as fallback

**Verdict — the vault is dormant because the route doesn't call the connector, not because the connector is missing.**

Recovery breakdown:
- **Reconnection (primary)**: wire one of the three bridge-using orchestrators into the conversation/voice route — OR have the route call the bridge directly. This is the architectural break.
- **Configuration**: set `OBSIDIAN_VAULT_PATH=/Users/soullab/Documents/AIN/` (or canonical path) in production env.
- **Implementation polish (downstream)**: upgrade keyword fallback to vector embeddings; remove `@ts-nocheck`; formalize as production.

This confirms the user's earlier prediction: *"the runtime architecture has become increasingly substrate-centric in practice even while field-centric structures remained present underneath."* The field-centric structures (`SpiralogicEngine`, `ConsciousnessOrchestrator`, `FractalFieldSpiralogics`, `ObsidianVaultBridge`) exist as a complete chain. The conversation route bypasses the entire chain by importing a different, lighter `spiralogic-core` from `lib/consciousness/` instead of the bridge-integrated engine from `lib/spiralogic/core/`.

### Three-source picture coming

The MAIA-PAI repo and the foundational AIN Vault docs ("Field Intelligence System paper", "Deploying Spiralogic as Maya's Core Engine", "Constitution of post-AI consciousness systems") describe an architecture with:
- **FIS 4-layer:** Field Awareness → Master Influences (gravitational) → Mycelial Governor → Response Emergence
- **6-layer MAIA:** Conversational Skills → Spiral Tracking → 8-Agent Council → AIN Collective → Adaptive Learning → Worldview Plurality
- **8-Agent Council with weighted voting:** Mythic Atlas (1.2), Spiralogic Kernel (1.2), Shadow Agent (1.0), Guide/Mentor/Dream/Relationship/CBT (0.8-1.0)
- **Three Vows:** Non-Extraction, Sovereignty, Service to Evolution
- **Substrate = one possible manifestation**, invoked only when intervention requires generative text. SilenceResponse and SimplePresence don't need substrate at all.

The SOVEREIGN audit's "asymmetric topology" finding (16 layers fire before substrate, 0 after) maps to a runtime that partially implements field-sensing pre-processing but does NOT implement Mycelial-governed emergence — instead it shortcuts to substrate and treats output as final. **That is the drift, more precisely named.**

---

## MAIA-PAI (correction)

MAIA-PAI was not audited in this pass. Any MAIA-PAI references in MAIA-SOVEREIGN should be treated as unresolved integration pointers until the separate MAIA-PAI repo is reviewed.

**A prior version of this document contained an invented definition of MAIA-PAI synthesized by the survey agent from a single grep hit on `lib/consciousness/LLMProvider.ts:53`. That definition has been removed as architecturally false.** MAIA-PAI is a separate GitHub build, not a designation within MAIA-SOVEREIGN.

---

## Headline counts

| Status | Count |
|---|---|
| LIVE / LOAD-BEARING | 32 layers actively wired |
| WIRED BUT BYPASSED | 7 critical layers delegating core logic to Anthropic |
| DORMANT / RECOVERABLE | 5 layers with complete symbolic definition, unused |
| SPEC / PROTOTYPE | 3–4 interface-only layers |

**Total analyzed: ~60 layers.**

---

## The 7 Hollowed-Out Layers (the critical finding)

These layers exist in the code path and are invoked at runtime — but delegate their core reasoning directly to Anthropic instead of executing their own designed logic. Each is a load-bearing intelligence layer outsourced.

| # | Layer | File:line | Was supposed to | Actually does |
|---|---|---|---|---|
| 1 | **LinkingService (Bardic Memory)** | `lib/memory/bardic/LinkingService.ts:221` | Apply symbolic memory linking algorithm to connect narrative episodes | `anthropic.messages.create()` (haiku) does the linking |
| 2 | **TeleologyService (Bardic Memory)** | `lib/memory/bardic/TeleologyService.ts:69` | Detect narrative arc and teleological patterns via symbolic analysis | Delegates to `anthropic.messages.create()` |
| 3 | **MAIAUnifiedConsciousness** | `lib/consciousness/MAIAUnifiedConsciousness.ts:382, 687, 791` | Integrate all consciousness streams; apply unified field logic | **Three** direct `new Anthropic().messages.create()` call sites; entire reasoning outsourced |
| 4 | **Elemental Agent Network** | `lib/agents/elemental/{Fire,Water,Air,Earth,Aether}Agent.ts` | Each agent execute element-specific reasoning | All call `claudeService.generateOracleResponse()` — wrapped Anthropic — Anthropic decides what "fire" or "water" means |
| 5 | **Dialectical AI Core** | `lib/dialectical-ai/core.ts:215` | Apply dialectical framework (thesis-antithesis-synthesis) | Calls `anthropic.messages.create()` to "apply dialectic" |
| 6 | **Pattern Intelligence Generator** | `lib/patterns/generatePatternIntelligence.ts:140` | Extract and synthesize cross-conversation patterns | Direct Anthropic call delegates pattern extraction |
| 7 | **Relational Checkin** | `lib/consciousness/relationalCheckin.ts:203` | Apply own relational safety and emotional state evaluation | Calls `anthropic.messages.create()` — Anthropic decides relational safety |

---

## Dormant But Recoverable (5 layers)

1. **Panconscious Field Service** (`lib/consciousness/panconscious-field.ts`) — Axis mundi centering logic defined; methods (`connectToArchetypalRealm`, `mapManifestationRealm`, `scanUnconsciousPatterns`) are placeholder stubs.
2. **Adaptive Consciousness Learning** (`lib/consciousness/AdaptiveConsciousnessLearning.ts`) — Ready to learn from sessions for adaptive consciousness calibration; not invoked in main route.
3. **Interactive Council Facilitation** (`lib/consciousness/maia-council-facilitation.ts`) — Multi-perspective archetypal dialogue; defined but not invoked.
4. **Resonant Field Orchestrator** (`lib/maia/resonance-field-system.ts`) — Field coherence logic across relational vectors; defined but bypassed in main route.
5. **Wisdom Synthesis Engine** (`lib/consciousness/wisdom-synthesis-engine.ts`) — Structure exists; currently delegates final synthesis to Anthropic; could be reactivated to synthesize wisdom layers natively.

---

## Runtime Topology — the asymmetry that matters

**Entry point:** `POST /api/oracle/conversation` in `app/api/oracle/conversation/route.ts`

### BEFORE substrate (rich pre-processing — 16 MAIA layers fire)

1. Load session & member context (sessionMemoryService)
2. Get cognitive profile → determine consciousness level
3. Infer spiralogic cell (12-phase, element, context)
4. Select frameworks via `chooseFrameworksForCell()`
5. Choose canonical question
6. Load astrology context (lunar phase, element timing)
7. Load relationship anamnesis (past continuity)
8. Build memory influence plan
9. Load recent developmental memories & theme signals
10. Detect idea candidate
11. Build active theme block & knowledge field block
12. Enforce field safety check
13. Detect tool suggestions
14. Re-check cognitive profile
15. Log trust observation
16. Build system prompt with all blocks
17. **→ ANTHROPIC SUBSTRATE INVOCATION**

### AFTER substrate (logging only — no validation/refinement through MAIA layers)

1. Stream response back to client
2. Extract conversation insights
3. Log Maia turn
4. Log Opus axioms evaluation
5. Log oracle usage
6. Evaluate Socratic quality
7. Persist trace
8. Persist spiral state
9. Update session memory

**Critical finding (agent text, with the agent's MAIA-PAI mislabeling corrected — see correction note at top):**

> *"MAIA-SOVEREIGN's pre-processing is robust (16 intelligence layers fire), but post-response, the architecture does NOT re-apply its own layers to validate/refine the Anthropic output. The response is treated as final, not as a candidate subject to MAIA-SOVEREIGN's own axioms, field safety, or synthesis layers."*

This is structural. The substrate response goes to the member **without passing back through MAIA-SOVEREIGN's own intelligence for validation or refinement.** The opus-axioms evaluator and Socratic validator run but as logging/telemetry, not as gates that can reshape the response. Whether MAIA-PAI provides any such post-substrate validation in its own runtime is unknown until the MAIA-PAI repo is reviewed.

---

## Notable Gaps

- **No real-time field feedback loop**: Field coherence detected but doesn't adjust Anthropic prompt mid-generation.
- **Memory layers not load-bearing for response generation**: Memories loaded for context, but LinkingService/TeleologyService don't use their own logic — they ask Anthropic.
- **Panconscious field not wired**: Axis mundi centering logic exists but placeholder methods; three-world orchestration dormant.
- **Elemental reasoning hollowed**: Fire/Water/Earth/Air/Aether agents exist but delegate to ClaudeService instead of executing element-specific logic.
- **Wisdom synthesis deferred**: Wisdom layers loaded but final synthesis outsourced to Anthropic.
- **No symbolic orchestration closure**: Response doesn't flow back through spiralogic validators or archetypal confirmation; treated as final once Anthropic returns.

---

## Audit's own diagnostic line

> *"The architecture is not hollowed from absent code — it's hollowed by in-place delegation. The symptom is: Anthropic is called 29+ times across lib/, often from inside orchestrators that were designed to execute their own logic. Every delegation is a load-bearing layer outsourced."*

---

## What this map IS and IS NOT

**IS:**
- Evidence-cited inventory of the current runtime intelligence architecture
- Classification of which layers execute their own logic vs delegate
- Specific file:line locations of the 7 hollowing delegations
- Topology trace showing the structural asymmetry (rich input, no output validation)

**IS NOT:**
- The intended architecture (that lives in the canon docs and needs to be read separately)
- A redesign proposal
- A refactor sequence
- A model/provider recommendation
- Personally verified by me (line citations are from the agent and should be spot-checked before committing changes)

---

## Pending next moves (per user directive, no autonomous progression)

1. **Receive MAIA-PAI repo location** (GitHub URL or local clone path). Audit MAIA-PAI as second-source review with same classification schema.
2. **Receive AIN Obsidian Vault path**. Scan vault for foundational architectural design (the vault likely holds the design intent that the repos implement).
3. **Only after all three sources are surveyed**: read the load-bearing canon docs in this repo to reconstruct intended intelligence hierarchy. Candidates within MAIA-SOVEREIGN:
   - `docs/canon/MAIA_SYSTEM_MAP.md` (168 lines)
   - `docs/canon/MAIA_WIRING_AUDIT_v1.0.md` (411 lines) — a prior wiring audit, important precedent
   - `docs/canon/MAIA_IDENTITY_ONTOLOGY.md` (415 lines)
   - `docs/canon/MAIA_CANON_v1.1.md` (322 lines)
   - `docs/canon/MAIA_CURRENT_STATE_v1.0.md` (212 lines)
   - `docs/canon/MAIA_MEMORY_CANON_v1.0.md` (179 lines)
   - `docs/canon/FIELD_GRAVITY_ARCHITECTURE.md` (265 lines)
4. Cross-reference all three sources to identify intended hierarchy vs runtime drift.
5. Only then: propose the intelligence-hierarchy-first routing redesign.

**All substrate work remains blocked behind this. No further architecture claims will be made beyond surveyed sources.**
