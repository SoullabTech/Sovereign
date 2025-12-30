# ADR-001: Seven-Level Developmental Awareness as Source of Truth

**Status:** Accepted
**Date:** 2024-12-30
**Authors:** SoullabTech Team
**Reviewers:** Kelly Nezat

## Context

The MAIA Sovereign codebase has accumulated multiple awareness/consciousness level implementations over time:

| System | Levels | Location |
|--------|--------|----------|
| Developmental Awareness | 7 levels | `lib/consciousness/awareness-levels.ts` |
| Opus/Sonnet Routing | 7 levels | `lib/ai/claudeClient.ts` |
| Consciousness Router | 6 levels | `lib/consciousness/ConsciousnessRouter.ts` |
| Progressive Wisdom | 5 levels | `lib/consciousness/ProgressiveWisdomInjection.ts` |
| Query Analyzer | 4 levels | `lib/consciousness/QueryAnalyzer.ts` |
| Gathering Mode | 4 levels | `lib/consciousness/gatheringMode.ts` |

This fragmentation creates:
1. **Cognitive overhead** - Developers must understand multiple incompatible scales
2. **Routing inconsistencies** - Different subsystems may route the same user differently
3. **Maintenance burden** - Changes to awareness logic must be propagated to N systems
4. **Testing complexity** - Each system requires separate test coverage

The 7-level developmental system was recently wired to Opus/Sonnet model routing (commit `ccedad788`) and has been thoroughly validated with 18 unit tests and 10 live API tests, all passing.

## Decision

**The 7-level developmental awareness system is the canonical source of truth for MAIA consciousness routing.**

### The Seven Levels

| Level | Name | Description | Model Routing |
|-------|------|-------------|---------------|
| L1 | Newcomer | First contact, building trust | Always Opus |
| L2 | Explorer | Early curiosity, still fragile | Always Opus |
| L3 | Practitioner | Established patterns, can handle routine | Context-dependent |
| L4 | Student | Active learning, teaching moments | Context-dependent |
| L5 | Integrator | Synthesizing insights | Opus for depth, Sonnet for casual |
| L6 | Teacher | Sharing wisdom with others | Opus for depth, Sonnet for casual |
| L7 | Master | Fully self-directed | Opus for depth, Sonnet for casual |

### Canonical Type

```typescript
// lib/consciousness/types/awareness.ts
export type DevelopmentalLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface AwarenessContext {
  level: DevelopmentalLevel;
  name: string;
  description: string;
  routingPolicy: 'always_opus' | 'context_dependent';
}
```

### Adapter Pattern for Legacy Systems

All other awareness systems MUST map to the 7-level scale via adapters:

```typescript
// Example: 4-level system → 7-level
function gatheringModeToDevLevel(gatheringLevel: 1 | 2 | 3 | 4): DevelopmentalLevel {
  const mapping: Record<1 | 2 | 3 | 4, DevelopmentalLevel> = {
    1: 1,  // Gathering L1 → Dev L1 (Newcomer)
    2: 3,  // Gathering L2 → Dev L3 (Practitioner)
    3: 5,  // Gathering L3 → Dev L5 (Integrator)
    4: 7,  // Gathering L4 → Dev L7 (Master)
  };
  return mapping[gatheringLevel];
}
```

## Consequences

### Positive

1. **Single source of truth** - One scale to understand and maintain
2. **Consistent routing** - All subsystems produce compatible awareness assessments
3. **Simpler testing** - Test the canonical system + adapter correctness
4. **Clear mental model** - "Where is this user developmentally?" has one answer

### Negative

1. **Migration effort** - Each legacy system needs an adapter
2. **Potential information loss** - Finer-grained systems may lose nuance when mapped
3. **Coordination required** - Changes to the 7-level system affect all adapters

### Neutral

1. **Adapters are Class B changes** - Require mentor review but not full architectural review
2. **Legacy systems can coexist** - They just MUST output 7-level values for routing decisions

## Migration Plan

### Phase 1: Validation (COMPLETE)
- [x] Wire 7-level system to Opus/Sonnet routing
- [x] Add routing decision logging (MODEL_ROUTING JSON)
- [x] Create test harness (18 unit tests)
- [x] Run live API tests (10/10 passing)
- [x] Create this ADR

### Phase 2: Adapters (Next)
Timeline: 1-2 weeks

1. Define canonical `DevelopmentalLevel` type in `lib/consciousness/types/awareness.ts`
2. Create adapter functions:
   - `gatheringModeToDevLevel()` - 4 → 7
   - `queryAnalyzerToDevLevel()` - 4 → 7
   - `progressiveWisdomToDevLevel()` - 5 → 7
   - `consciousnessRouterToDevLevel()` - 6 → 7
3. Update each system to export mapped values
4. Add guardrail script: `npm run check:awareness-scales`

### Phase 3: Consolidation (Future)
Timeline: After adapters proven stable

1. Evaluate which legacy systems can be deprecated entirely
2. Consider merging subsystems that now have identical outputs
3. Update documentation and developer onboarding

## Guardrails

### No New Scales Rule

**No new awareness/consciousness level scales may be introduced without ADR amendment.**

Enforcement:
```bash
# scripts/check-awareness-scales.ts
# Fails CI if new level type definitions found outside canonical location
```

### Routing Audit

All model routing decisions MUST:
1. Accept `DevelopmentalLevel` (1-7) as input
2. Log decision via MODEL_ROUTING JSON format
3. Be covered by `tests/awareness-routing.test.ts`

## References

- Commit `ccedad788`: Initial 7-level → Opus/Sonnet wiring
- `tests/awareness-routing.test.ts`: 18 automated routing tests
- `scripts/test-routing-live.ts`: Live API test script
- `lib/ai/claudeClient.ts:54-94`: `selectModelByAwareness()` function
