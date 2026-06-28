# MAIA-SOVEREIGN — State & Roadmap (2026-05-24, evening)

> **Posture:** localized verbs only. Built ≠ wired; wired ≠ surfacing; surfacing ≠ verified. This document is a state map and a fork, not a forward march.

## §1. Honest framing of the week's vocabulary

The acronyms in the framing need to be returned to their documented epistemic altitude before any roadmap reads correctly.

| Term | Documented status | Where |
|---|---|---|
| **FIS — Field State Primitive** | **Working doctrine / interface target. No runtime authority.** Names the *shape* of the field state every agent must read before manifesting. `FieldDimension`, `MemberAuthoredSignal`, composition logic — all undefined; each is a future cut. | [docs/canon/FIS_FIELD_STATE_PRIMITIVE.md](docs/canon/FIS_FIELD_STATE_PRIMITIVE.md) (2026-05-20) |
| **RFI — Resonant Field Intelligence** | ❌ **Not built.** The phrase *"we have proven RFI"* is used in the coherence spec as the **example** of ontological-inflation framing to refuse. | [docs/architecture/SOVEREIGNTY_LAYER_STATE_2026_05_23.md](docs/architecture/SOVEREIGNTY_LAYER_STATE_2026_05_23.md), [docs/specs/COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md](docs/specs/COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md) |
| **UFI — orchestration brain stem** | ❌ **Not built.** | Same sovereignty-layer-state doc. |
| **"Full memory field"** | **9-layer activation *plan*.** §5 of the plan explicitly *does not authorize* lifting the freeze beyond conversational, does not authorize cross-layer synthesis, does not authorize semantic/vector ranking, does not authorize member-facing UI. | [docs/architecture/MEMORY_EXPANSION_PLAN_2026-05-24.md](docs/architecture/MEMORY_EXPANSION_PLAN_2026-05-24.md) |

What the week actually was: **doctrine consolidation + one prompt-influencing layer wired to a branch + observability scaffolding + governance matrices that hold the rest under explicit freeze.** That is substantial — and it is not "FIS, RFI, UFI built."

## §2. What shipped this week (operational, not architectural)

Sorted by *what now runs in production* vs *what runs on a branch* vs *what's a document only*.

### 2.A. Shipped to `clean-main-no-secrets`
- **Atoms breakthrough flag** ([58d374334](commit)) — `is_breakthrough` schema-bound, member-marked only, `crossing_must_be_false` sibling. Surfaces ordered.
- **Substrate monitor** ([fffb9559f](commit), [3820ab186](commit), [645e9c4b6](commit)) — `runtime_events` DB, schema-gate enforced, `deriveStatus` fall-through (registry shape cannot inflate into liveness).
- **Spiral Orientation Cut 2** ([6932a5481](commit), [e340a1921](commit)) — read-only developmental context, API + surface, all 6 domains quiet, page reports honestly.
- **Memory indicator** — strict removal ([f21a8cb35](commit)); dedicated band in normal flow; no static UI may claim continuity.
- **Atoms (Layer 5) + memoryHealth (Layer 15)** wired into canonical route ([08bc4c876](commit)).
- **Contextual return default** ([0fa544bc4](commit)) — kept atoms default to contextual return.
- **Daily Anchor** ([5c3b4b233](commit), [001d80554](commit), [cca210582](commit)) — minimal continuity instrument.
- **Field context adapter** ([a4ec21b3b](commit), [66db1f743](commit)) — wired feature-flagged into oracle/conversation.
- **Field Lab + tester opt-in gate** ([a757ddcac](commit)) — bounded experimental ecology, opt-in only.
- **Relational Navigation Room** ([a194a5590](commit)) — prepare-for / integrate-after surface.
- **Learning Spine Move 2** ([df0dc1816](commit), [f95dd5fd7](commit), [619644048](commit), [2cb29b359](commit)) — engine comparison reviewer (Loop C), paired comparison capture, shadow-target rationale externalized.
- **Anti-drift CI cuts** — direct `@anthropic-ai/sdk` import guard ([ff267a740](commit)); MAIA route guard.

### 2.B. On branch `feature/conversational-memory-phase2`, **not merged, not deployed**
- **Conversational layer Phase 1 + Phase 2** ([3f0191231](commit), [987b3ff28](commit), [f74ab4204](commit), [3ca80a78d](commit)).
  - FAST + CORE tiers extract `conversationalRecallAddendum` and reach the prompt ✓
  - DEEP tier carries the addendum on context + observability only — **prompt injection blocked** at `buildComprehensiveVoicePrompt` per [docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md](docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md) §II.B.
  - `[MAIA] conversational-block` log marker; `PROMPT_BLOCK_CHARS` + `layers.conversational` observability complete.

### 2.C. Document only (architecture / governance / canon — no runtime)
- **MAIA Foundational Context** ([docs/canon/MAIA_FOUNDATIONAL_CONTEXT.md](docs/canon/MAIA_FOUNDATIONAL_CONTEXT.md)) — orienting scaffold, not doctrine.
- **FIS / Pattern Primitive / Four-Layer Substitution** ([docs/canon/FIS_FIELD_STATE_PRIMITIVE.md](docs/canon/FIS_FIELD_STATE_PRIMITIVE.md), [docs/canon/PATTERN_PRIMITIVE.md](docs/canon/PATTERN_PRIMITIVE.md), [docs/canon/FOUR_LAYER_SUBSTITUTION.md](docs/canon/FOUR_LAYER_SUBSTITUTION.md)).
- **The Clearing + Spiral Continuity Engine canons** ([0f4545303](commit)).
- **Recognition Integrity** ([cec1cc859](commit)) — do not optimize for felt recognition.
- **Media Field / Relational Field boundaries** ([f537ac1ae](commit), [80427c5dd](commit)) — ethical boundary, not infrastructure boundary.
- **Memory Service Status Matrix** ([docs/architecture/MEMORY_SERVICE_STATUS_MATRIX_2026-05-24.md](docs/architecture/MEMORY_SERVICE_STATUS_MATRIX_2026-05-24.md)) — 9 services classified.
- **Memory Expansion Plan** ([docs/architecture/MEMORY_EXPANSION_PLAN_2026-05-24.md](docs/architecture/MEMORY_EXPANSION_PLAN_2026-05-24.md)) — 9-layer activation map (governance, not implementation).
- **Memory Substrate Divergence Map** ([docs/architecture/MEMORY_SUBSTRATE_DIVERGENCE_MAP_2026-05-23.md](docs/architecture/MEMORY_SUBSTRATE_DIVERGENCE_MAP_2026-05-23.md)).
- **Addenda Channel Divergence finding** ([docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md](docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md)).
- **Coherence Field wire-up spec** ([docs/specs/COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md](docs/specs/COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md)) — *frozen reference architecture, not invitation to implementation* per §0.C.
- **Conversational Layer Phase 2 spec** ([docs/specs/CONVERSATIONAL_LAYER_PHASE_2_SPEC_2026-05-24.md](docs/specs/CONVERSATIONAL_LAYER_PHASE_2_SPEC_2026-05-24.md)).
- **Relational Intelligence Directions** ([docs/architecture/RELATIONAL_INTELLIGENCE_DIRECTIONS_2026-05-24.md](docs/architecture/RELATIONAL_INTELLIGENCE_DIRECTIONS_2026-05-24.md)) — 8 directions sketched, only structural humility is *new*; tact-first sequencing instinct *held, not committed*.
- **Participation Without Foreclosure** ([docs/architecture/PARTICIPATION_WITHOUT_FORECLOSURE_2026-05-24.md](docs/architecture/PARTICIPATION_WITHOUT_FORECLOSURE_2026-05-24.md)) — directional architecture paper; §10 explicit *held directions, not authorized arcs*.
- **Lab posture MCP scenarios** ([docs/field-lab/LAB_POSTURE_MCP_SCENARIOS_2026-05-24.md](docs/field-lab/LAB_POSTURE_MCP_SCENARIOS_2026-05-24.md)).

## §3. Current memory-layer status (per matrix)

| Layer | Service file | State | Recommended |
|---|---|---|---|
| Semantic (atoms) | `lib/maia/memoryAtomsLoader.ts` | **observed-runtime** (prompt-influencing) | refinements only; cross-atom synthesis explicitly refused |
| Conversational | `lib/maia/conversationalRecallBlock.ts` | **wired-unmerged** (branch, FAST+CORE prompt; DEEP blocked) | decide §4 fork |
| Episodic | `lib/consciousness/memory/EpisodicMemoryService.ts` | **architected, 0 live consumers** | **Wire 1st** per matrix Cut 2A |
| Field / Coherence | `lib/consciousness/memory/CoherenceFieldService.ts` | architected, 0 live consumers | Wire 2nd per Cut 2B *(deferred under freeze)* |
| Semantic (older) | `lib/consciousness/memory/SemanticMemoryService.ts` | duplicate of live sibling in `lib/memory/` | **Reconcile** before any wire |
| Developmental | `lib/consciousness/memory/ConsciousnessEvolutionService.ts` | **wrong name** ("level increased" claims) | **Rename** → `DevelopmentalTrajectoryService` |
| Field-pattern | `lib/consciousness/memory/QuantumFieldMemory.ts` | 810 LOC metaphor, 0 persistence | **Rename + gut** → `FieldPatternMemoryService` |
| Morphic | `lib/consciousness/memory/MorphicPatternService.ts` | cross-member leakage risk | **Later** — consent + aggregation gate first |
| Somatic | `lib/consciousness/memory/SomaticMemoryService.ts` | inference-from-text risk | **Later** — explicit somatic input source required |
| Achievements | `lib/consciousness/memory/AchievementService.ts` | gamification risk | **Later** — reframe as practice/commitment |
| Architecture (whole) | `lib/consciousness/memory/MAIAMemoryArchitecture.ts` | 2351 LOC design doc in code shape | **Observe only**, do not promote |

## §4. The fork (already in [CLAUDE.md](CLAUDE.md))

Before any next-arena work, the conversational Phase 2 fork must be decided.

- **Option A (fix DEEP first)** — extract shared `appendAllContextAddenda(context, prompt)` helper per addenda-divergence §V; fix `buildComprehensiveVoicePrompt` to iterate `MaiaContext` addenda; wire atoms end-to-end; then merge + deploy + verify §IV gate across **all three tiers**.
- **Option B (verify FAST+CORE only, scoped)** — merge branch → deploy → verify `[MAIA] conversational-block { emitted: true, surfacedCount: N }` on `sovereign/app/maia/list` across **FAST + CORE only**; DEEP explicitly excluded from the §IV gate; verification claim must name the FAST+CORE scope.

Either path ships before:
- Settings toggle UI for `conversational_recall_enabled` (opt-out surface)
- Next-arena work (Episodic Phase 2 spec per matrix)

## §5. Proposed sequencing — *held, not authorized*

Following the memory entries on *least-replaceable beats most-actionable* and *one nervous system at a time*:

1. **Resolve §4 fork** (Kelly directive).
2. **Settings toggle UI** for conversational opt-out (smallest possible surface; consent affordance).
3. **Episodic Phase 2 spec** ([docs/specs/EPISODIC_LAYER_PHASE_2_SPEC.md](docs/specs/EPISODIC_LAYER_PHASE_2_SPEC.md) — not yet written) — follow conversational pattern: Phase 1 observability before Phase 2 prompt influence; locked-answer table; 4-safeguard set; consent gate `episodic_recall_enabled DEFAULT TRUE`. Episodic is *the threshold layer where "MAIA remembers a life unfolding" becomes operationally testable rather than architecturally aspirational.*
4. **Reconcile** `lib/consciousness/memory/SemanticMemoryService.ts` against live `lib/memory/` sibling. Choose one, delete the other. Must precede any further consciousness-memory wiring.
5. **Rename + gut** `QuantumFieldMemory.ts` → `FieldPatternMemoryService.ts` *or* delete entirely. The 810 LOC carry no runtime, do carry doctrinal violation surface area.
6. **Rename** `ConsciousnessEvolutionService.ts` → `DevelopmentalTrajectoryService.ts`. Strip any "level increased" semantics.
7. **Tact calibration sketch** ([docs/architecture/TACT_CALIBRATION_SKETCH.md](docs/architecture/TACT_CALIBRATION_SKETCH.md) — not yet written) — first new direction per *Relational Intelligence Directions* held sequencing. Sketch only; *not* an implementation arc.

**Held under freeze, do not propose to lift:**
- Coherence/Field layer wire-up (Coherence Field wire-up spec is frozen reference architecture; freeze conditions in §0.C unmet)
- Morphic, Somatic, Achievements (matrix says Later with named gates)
- Pattern Attunement (must emerge *downstream* of episodic + tact, not be prematurely architected)
- Any cross-layer synthesis
- Any member-facing "field state" / "coherence" / "RFI" / "UFI" surface

## §6. Deploy hygiene

The minisforum-side deploy state was not reachable from the current environment (`ssh -o ConnectTimeout=3 -o BatchMode=yes soullab@minisforum` failed). Before §4 decision, run the canonical diagnostic from a terminal that has the key:

```bash
ssh soullab@minisforum 'docker inspect maia-sovereign --format "{{.Created}} {{.Image}}"'
ssh soullab@minisforum 'docker logs maia-sovereign --since 1h 2>&1 | grep -E "MAIA/runtime|atoms loaded|MEMORY_HEALTH|conversational-block"'
```

If `[MAIA] conversational-block` does not appear, the branch genuinely is not deployed and Option B's verification gate has nothing to verify yet.

## §7. Closing

The week's substance is real: three canon doctrines, one paper at directional altitude, two governance matrices, one prompt-influencing layer wired (branch), substrate monitor with honest fall-through, breakthrough flag with schema-enforced sovereignty, learning spine reviewer, field lab with tester gate, daily anchor.

The week's *framing risk* is naming this as "FIS, RFI, UFI, full memory field built." That sentence inverts every state column above. FIS is a primitive shape. RFI is not built. UFI is not built. The memory field is a 9-layer plan with most layers explicitly held under freeze.

The discipline holds the difference. The roadmap above is a fork, a sequencing instinct, and a freeze — in that order.

## §8. The actual achievement (compression, 2026-05-24 evening)

> *Rescued MAIA's legacy from inflation by separating preserved direction, canonical primitive, built substrate, dormant service, frozen plan, and live runtime authority.*

That sentence is the architecturally mature re-statement of the week. Each of the six categories is legitimate work. None of them is category-6 "we built X" when X is actually category 1-5. The week moved artifacts cleanly between categories; the discipline was naming which category each one occupies.

**Headline:** *MAIA's memory field has been clarified, bounded, partially operationalized, and protected from premature ontological claims — not completed.*

**Strategic read (load-bearing):** *You are not behind because RFI/UFI are not built. You are safer because you now know they are not built. That distinction may be the most important outcome of the week.*

A system that ships RFI as category 6 before it has earned category 6 is *worse off* than a system that holds RFI as category 1 and knows it. The discipline preserves the option to do the work correctly later, which is the actual asset.

## §9. Refined roadmap priority (2026-05-24 evening, post-articulation)

Replaces §5 sequencing; same content, sharper edges.

1. **Resolve the Phase 2 fork.** Prefer **Option A** if a generalizable foundation matters (fix DEEP addenda-channel divergence before merging/deploying). Option B is acceptable *only* if verification explicitly excludes DEEP from the §IV gate.
2. **Member-facing recall toggle** — `conversational_recall_enabled`. This is consent infrastructure, not polish. Ships with §1 regardless of fork outcome.
3. **Verify production reality.** Confirm deploy state on minisforum (see §6); confirm `[MAIA] conversational-block` emits across FAST/CORE; verify DEEP only after §V fix.
4. **Episodic Phase 2 spec** — and only then. This is where *"life unfolding"* becomes operationally testable without jumping into field ontology. Follow conversational pattern (Phase 1 observability → Phase 2 prompt influence; locked-answer table; 4-safeguard set; `episodic_recall_enabled DEFAULT TRUE` consent gate).
5. **Dormant service cleanup** — *after* episodic ships, not before:
   - `QuantumFieldMemory.ts` → rename/gut → `FieldPatternMemoryService.ts` *or* delete
   - `ConsciousnessEvolutionService.ts` → `DevelopmentalTrajectoryService.ts` (strip "level increased")
   - Reconcile duplicate `SemanticMemoryService` (consciousness/ vs memory/) — pick one, delete the other

**Still held under freeze, no proposal to lift in this roadmap:**
- Coherence/Field layer wire-up (frozen reference architecture; lift conditions in COHERENCE_FIELD_WIRE_UP_SPEC §0.C unmet)
- Morphic, Somatic, Achievements (matrix Later with named gates)
- Pattern Attunement (must emerge downstream of episodic + tact)
- Tact calibration (sketch only after episodic ships, not before)
- Any cross-layer synthesis
- Any member-facing "field state" / "coherence" / "RFI" / "UFI" surface
