# Memory Service Status Matrix — 2026-05-24

Audit of nine services in `lib/consciousness/memory/`. Grounded in actual import sites, DB activity, migration tables, and test coverage. Numbers from grep, not adjective.

## Canon (governs this matrix)

> **Dormant consciousness-memory services must not be promoted by name or aspiration. A memory service earns runtime authority only by having a defined input, provenance boundary, write target, retrieval contract, and failure mode.**

## Framing correction

These are **not** "underutilized." They are **dormant prototypes**, and several are unsafe to wire without renaming or reconciliation.

- All nine services are dormant on the live MAIA path: zero direct imports from `app/api/oracle/*`, `app/api/sovereign/*`, `lib/maia/*`, or `lib/memory/*`.
- The 4 `MAIAMemoryArchitecture` hits are type-only re-exports through `lib/memory/beads-sync/*`.
- The 1 `QuantumFieldMemory` hit is the labtool route `/api/maia/enhanced-consciousness`, not the Cut-1 path.
- Tables for six of them exist in migrations (Jan 2026); the feeders never landed.
- The live `SemanticMemoryService` lives at `lib/memory/SemanticMemoryService.ts` — a **different class** than the one being audited. Do not confuse the two. **Protect the live one.** Treat `lib/consciousness/memory/*` as a separate experimental layer.

## Five-point runtime authority contract

Before any service in this folder is wired into the turn path, the PR must declare in code:

1. **Defined input** — what triggers a write, from where, with what shape
2. **Provenance boundary** — source ref stored in the row; no synthesis without trace
3. **Write target** — single canonical table; no shadow stores
4. **Retrieval contract** — turn-time read budget; when it's consulted; what it returns
5. **Failure mode** — what the system does when the service is unavailable, and what the user sees (must not produce relational language masking infrastructure — see `project_infrastructure_failure_disguised_as_relational`)

Absent any of the five, the service stays dormant.

## Matrix

| File (lib/consciousness/memory/) | LOC | Live-path callers | DB writes | DB reads | Table | Test | Risk | Recommended |
|---|--:|--:|--:|--:|---|---|---|---|
| EpisodicMemoryService.ts | 283 | 0 | 1 | 4 | `episodic_memories` ✓ | none | low | **Wire 1st** |
| CoherenceFieldService.ts | 403 | 0 | 1 | 3 | `coherence_field_readings` ✓ | none | low | **Wire 2nd** |
| SemanticMemoryService.ts | 328 | 0 | 1 | 5 | none in migrations | none | med | **Reconcile** with `lib/memory/SemanticMemoryService.ts` (live sibling) before wiring; do not run two |
| ConsciousnessEvolutionService.ts | 448 | 0 | 1 | 1 | `consciousness_evolution` ✓ | none | high (name) | **Rename** → `DevelopmentalTrajectoryService`. No "level increased" claims. |
| QuantumFieldMemory.ts | 810 | 1 (labtool only) | **0** | **0** | none | none | high (claim) | **Rename + gut** → `FieldPatternMemoryService`. In-memory only today. 810 lines of metaphor, no persistence. |
| MorphicPatternService.ts | 402 | 0 | 1 | 3 | `morphic_pattern_memories` ✓ | none | high (cross-member leakage) | **Later.** Needs consent boundary + aggregation-only enforcement before wiring. |
| SomaticMemoryService.ts | 329 | 0 | 1 | 4 | `somatic_memories` ✓ | none | high (inference) | **Later.** Only wire when explicit somatic input source exists (check-in / HRV / breath / self-report). No inference from text. |
| AchievementService.ts | 319 | 0 | 1 | 4 | `consciousness_achievements` ✓ | none | med (gamification) | **Later.** Reframe as practice/commitment tracking, not "achievement." |
| MAIAMemoryArchitecture.ts | 2351 | 4 (type-only via beads-sync) | **0** | **0** | none | indirect | med (size) | **Observe only.** Treat as topology + type surface. Do not promote to runtime. 2351 lines is a design document in code shape. |

## Sequencing (one at a time, not "wire all nine")

### Cut 2A — Episodic only
Wire `EpisodicMemoryService` first because it is concrete:

> event happened → provenance known → memory written → retrievable later.

No field claims. No consciousness claims. Low metaphysical risk. Table `episodic_memories` already exists.

Five-point contract for Cut 2A:
- **Input**: explicit member-significant events (decisions, thresholds, commitments) emitted by the live turn path
- **Provenance**: turn id + source ref + timestamp; no synthesized rows
- **Write**: `episodic_memories` only
- **Retrieval**: read at turn start alongside atoms; bounded by memory budget
- **Failure**: turn proceeds without episodic context; log `[MAIA/runtime] episodic: unavailable`; no relational language

### Cut 2B — Coherence only
Then wire `CoherenceFieldService`, framed **operationally**:

> continuity / contradiction / drift / provenance scoring.

Not "field coherence" in a metaphysical sense. Score is for the substrate monitor and forbidden-register check, not for prose surfaces. Table `coherence_field_readings` already exists.

### Hold (do not wire in this cut)
- `QuantumFieldMemory` → rename / shrink / quarantine. 810 LOC, zero persistence, `🔮` log line.
- `MAIAMemoryArchitecture` → topology reference only. 2351 LOC of types; not runtime.
- `lib/consciousness/memory/SemanticMemoryService` → reconcile with the live `lib/memory/SemanticMemoryService.ts` **before any wiring**. Two services with the same name cannot both run.
- `SomaticMemoryService` → wait for actual somatic input source (check-in / HRV / breath / self-report). No inference from text.
- `MorphicPatternService` → federation / collective layer. Later. Needs cross-member consent boundary and aggregation-only views.
- `ConsciousnessEvolutionService` → rename to `DevelopmentalTrajectoryService` before use. No "consciousness level" claims.
- `AchievementService` → reframe as integration milestones / practices honored, not mastery gamification.

## Drift canaries specific to this batch
- `console.log('🔮 quantum consciousness …')` — currently in `QuantumFieldMemory.ts:103`. Forbidden register; remove on rename.
- Any service writing "consciousness level" / "evolution stage" / "becoming coherent" as durable row values. Forbidden register from substrate monitor doctrine applies.
- `MorphicPatternService` reading rows scoped to other members. Must enforce member-scoped aggregation or aggregation-only views.
- Any PR that wires more than one service in a single cut. Cut 2A is Episodic alone. Cut 2B is Coherence alone.

## Closing
The largest surprise: `QuantumFieldMemory` has **zero** persistence — it's an in-memory pattern detector dressed in physics vocabulary. That's a rename-and-shrink job, not a wire-up. The rest of the "consciousness memory" folder is a separate experimental layer; runtime authority must be earned per the five-point contract above, not inherited from the folder name.
