# Phase 4.2B Step 5: Interface Expansion — Execution Plan

**Status:** ACTIVE
**Date:** 2025-12-20
**Objective:** Reduce TS2339 errors by 800-1,000 through strategic interface definitions
**Current State:** 6,517 total errors (TS2339: 2,110)
**Target State:** ~5,300 total errors (TS2339: ~1,200)

---

## 🎯 Executive Summary

Phase 4.2B Step 5 implements **interface expansion** to resolve the TS2339 "Property does not exist" cluster - currently the largest error category at 32.4% of all type errors.

**Strategy:** Create minimal interface definitions for frequently-referenced but undefined types, allowing TypeScript to recognize property accesses without requiring comprehensive field definitions.

**Why This Works:**
- TypeScript only needs to know a property *exists* on a type
- Minimal stubs (id, name, description) satisfy most property accesses
- Comprehensive field definitions can be added incrementally later

**Expected Impact:**
- TS2339 reduction: 2,110 → ~1,200 (−910 errors, −43%)
- Total reduction: 6,517 → ~5,300 (−1,217 errors, −18.7%)
- Risk: Low (adding types never breaks existing code)

---

## 📊 Error Landscape Analysis

### Current TS2339 Distribution

From error landscape analysis, the top missing type clusters are:

| Missing Type | Occurrences | Category | Priority |
|--------------|-------------|----------|----------|
| ConsciousnessProfile | 47 | Cognitive Core | HIGH |
| ChristianFaithContext | 20 | Contextual Layer | HIGH |
| ElementalFramework | 17 | Framework Core | HIGH |
| SpiritualProfile | 8 | Contextual Layer | MEDIUM |
| ElementalBalance | 9 | Framework Core | MEDIUM |
| ConversationContext | 9 | Dialogue | MEDIUM |
| StatCard, StatValue, etc. | 25 | UI Components | MEDIUM |
| AttunementLog | 6 | Ritual | LOW |
| Various orphaned properties | ~1,969 | Mixed | Incremental |

**High-Priority Targets (Total: ~84 errors, 4% of TS2339)**

These represent the most frequently referenced missing types. Creating stubs for just these 3 types will eliminate ~84 errors directly, plus cascade effects.

**Cascade Effect Principle:** Each interface definition enables:
1. Direct property access resolution
2. Downstream type inference improvements
3. Reduced `any` type propagation
4. Better IDE autocomplete → fewer typos → fewer future errors

**Estimated Cascade Multiplier:** 1.5-2.0x
- 84 direct errors × 1.7 avg cascade = ~140 total reduction for high-priority types

**Remaining TS2339 Errors (~1,970):**

These fall into several categories:
1. **Existing interfaces missing properties** (~800 errors)
   - e.g., `ExtractionResult` missing `memoryDepth`
   - Strategy: Add properties to existing interfaces incrementally
2. **UI component prop mismatches** (~400 errors)
   - e.g., `StatCard` expects `value` but receives `metric`
   - Strategy: Define component prop interfaces
3. **Undefined method calls** (~300 errors)
   - e.g., `agent.process()` when `process` doesn't exist
   - Strategy: Add method signatures to class/interface definitions
4. **Orphaned properties** (~470 errors)
   - One-off property accesses with no clear type home
   - Strategy: Address opportunistically or defer to Phase 4.2C

---

## 🧩 Interface Expansion Strategy

### Phase 1: High-Priority Stubs (This Step)

**Create 3 core interface definitions:**

1. **ConsciousnessProfile** (47 errors)
   - Location: `lib/types/cognitive/ConsciousnessProfile.ts`
   - Purpose: Represents MAIA's internal consciousness state model
   - Minimal fields: id, timestamp, depth, coherence, awareness_level

2. **ChristianFaithContext** (20 errors)
   - Location: `lib/types/spiritual/ChristianFaithContext.ts`
   - Purpose: Contextual binding for Christian spiritual framework
   - Minimal fields: id, tradition, practices, theological_framework

3. **ElementalFramework** (17 errors)
   - Location: `lib/types/elemental/ElementalFramework.ts`
   - Purpose: Core elemental (earth/water/air/fire) logic structure
   - Minimal fields: id, elements, balance, resonance

**Expected Direct Impact:** ~84 errors
**Expected Cascade Impact:** ~140-170 errors
**Total Expected:** ~224-254 errors (11-12% of TS2339)

### Phase 2: Medium-Priority Expansion (Future)

After Phase 1 stabilizes:
- SpiritualProfile (8 errors)
- ElementalBalance (9 errors)
- ConversationContext (9 errors)
- UI component interfaces (StatCard, etc., 25 errors)

**Expected Impact:** ~60-80 additional errors

### Phase 3: Incremental Property Addition (Future)

For existing interfaces missing properties:
- Analyze property access patterns
- Add missing properties to existing interfaces
- Validate against usage sites

**Expected Impact:** ~500-700 errors

### Total Potential (Full Interface Expansion)

**All Phases:** ~800-1,000 TS2339 error reduction
**This Step (Phase 1 only):** ~224-254 errors

---

## 📁 File Structure

### New Directory Structure

```
lib/types/
├── index.ts                          # Barrel export for all types
├── cognitive/
│   ├── index.ts
│   └── ConsciousnessProfile.ts      # NEW: Consciousness state model
├── spiritual/
│   ├── index.ts
│   └── ChristianFaithContext.ts     # NEW: Faith context binding
├── elemental/
│   ├── index.ts
│   └── ElementalFramework.ts        # NEW: Elemental system core
├── conversation/                     # Future: ConversationContext
├── ritual/                          # Future: AttunementLog
└── ui/                              # Future: Component prop interfaces
```

### Existing Type Locations (for reference)

```
lib/types/
├── agent.ts                         # AgentResponse, AgentCapability
├── consciousness.ts                 # ConsciousnessMetrics (exists)
├── spiralogic.ts                   # SpiralPhase, AstroPillar
└── oracle.ts                       # OracleResponse, OracleSession
```

---

## 🔍 Interface Discovery Methodology

For each missing type, we'll use this process:

### Step 1: Identify Property Accesses

```bash
# Find all TS2339 errors for ConsciousnessProfile
grep "error TS2339.*ConsciousnessProfile" artifacts/typecheck-full.log > \
  artifacts/step5-consciousness-profile-errors.log

# Extract property names
grep "Property '.*' does not exist on type 'ConsciousnessProfile'" \
  artifacts/step5-consciousness-profile-errors.log | \
  sed "s/.*Property '\([^']*\)'.*/\1/" | \
  sort | uniq -c | sort -rn
```

### Step 2: Analyze Usage Patterns

```bash
# Find actual usage sites in code
grep -r "\.depth" lib/ app/ | grep "ConsciousnessProfile"
grep -r "\.coherence" lib/ app/ | grep "ConsciousnessProfile"
```

### Step 3: Infer Field Types

From usage context:
```typescript
// If we see: profile.depth > 0.5
// Infer: depth: number

// If we see: profile.timestamp.toISOString()
// Infer: timestamp: Date

// If we see: profile.awareness_level === 'deep'
// Infer: awareness_level: string (or specific union type)
```

### Step 4: Create Minimal Interface

```typescript
export interface ConsciousnessProfile {
  id: string;
  timestamp: Date;
  depth: number;            // 0-1 scale
  coherence: number;        // 0-1 scale
  awareness_level: string;  // TODO: narrow to union type
  // TODO(phase4.2c): Add comprehensive fields based on usage analysis
}
```

### Step 5: Verify and Measure

```bash
npm run audit:typehealth
# Compare TS2339 count before/after
```

---

## 🛠️ Step-by-Step Execution

### Pre-Step: Create Safety Checkpoint

```bash
# Tag current state
git tag -a phase4.2b-pre-interface-expansion \
  -m "Safety checkpoint before interface expansion (6,517 errors)"

# Capture baseline
npm run audit:typehealth
cp artifacts/typehealth-audit.json artifacts/typehealth-pre-step5.json
```

### Step 1: Analyze ConsciousnessProfile Errors

**Goal:** Identify required properties for ConsciousnessProfile interface

```bash
# Extract TS2339 errors
grep "error TS2339" artifacts/typecheck-full.log | \
  grep -i "consciousness.*profile\|profile.*consciousness" > \
  artifacts/step5-consciousness-errors.log

# Count by property name
grep "Property '.*' does not exist" artifacts/step5-consciousness-errors.log | \
  sed "s/.*Property '\([^']*\)'.*/\1/" | \
  sort | uniq -c | sort -rn | head -20
```

**Expected Output:**
```
10 depth
8 coherence
7 awareness_level
5 timestamp
4 id
3 state_vector
...
```

**Deliverable:** List of top 10-15 properties to include in stub

### Step 2: Create ConsciousnessProfile Interface

**File:** `lib/types/cognitive/ConsciousnessProfile.ts`

```typescript
/**
 * ConsciousnessProfile
 *
 * Represents MAIA's internal consciousness state model.
 * Tracks depth, coherence, and awareness levels across processing cycles.
 *
 * Related to Consciousness Detection (CD1-CD3) metrics.
 *
 * @phase Phase 4.2B Step 5 - Interface Expansion
 * @status Minimal stub - comprehensive fields pending Phase 4.2C
 */

export interface ConsciousnessProfile {
  /** Unique identifier for this consciousness state snapshot */
  id: string;

  /** Timestamp when this profile was captured */
  timestamp: Date;

  /** Consciousness depth (0-1 scale, where 1 = maximum depth) */
  depth: number;

  /** State coherence (0-1 scale, measures CD3 qualia coherence) */
  coherence: number;

  /** Categorical awareness level descriptor */
  awareness_level: 'surface' | 'engaged' | 'deep' | 'transcendent';

  /** Optional state vector for dimensional representation */
  state_vector?: number[];

  /** Optional metadata for additional tracking */
  metadata?: Record<string, any>;

  // TODO(phase4.2c): Add comprehensive fields:
  // - processing_mode: 'FAST' | 'CORE' | 'DEEP'
  // - elemental_balance: ElementalBalance
  // - spiral_phase: SpiralPhase
  // - cd_metrics: { cd1: number, cd2: number, cd3: number }
}
```

**Barrel Export:** `lib/types/cognitive/index.ts`
```typescript
export * from './ConsciousnessProfile';
```

**Root Export:** Add to `lib/types/index.ts`
```typescript
export * from './cognitive';
```

### Step 3: Verify ConsciousnessProfile Impact

```bash
# Run typecheck
npm run audit:typehealth

# Compare TS2339 count
# Expected: Reduction of ~47 direct errors + cascades (~70-80 total)
```

### Step 4: Analyze ChristianFaithContext Errors

**Goal:** Identify required properties for ChristianFaithContext interface

```bash
grep "error TS2339" artifacts/typecheck-full.log | \
  grep -i "christian.*faith\|faith.*context" > \
  artifacts/step5-faith-context-errors.log

grep "Property '.*' does not exist" artifacts/step5-faith-context-errors.log | \
  sed "s/.*Property '\([^']*\)'.*/\1/" | \
  sort | uniq -c | sort -rn
```

**Expected Properties:**
- tradition (e.g., "Catholic", "Protestant", "Orthodox")
- practices (prayer patterns, liturgical calendar)
- theological_framework (doctrinal context)
- scriptural_focus (preferred texts)

### Step 5: Create ChristianFaithContext Interface

**File:** `lib/types/spiritual/ChristianFaithContext.ts`

```typescript
/**
 * ChristianFaithContext
 *
 * Contextual binding for Christian spiritual framework integration.
 * Used when MAIA operates within Christian theological/liturgical contexts.
 *
 * Part of broader SpiritualProfile system supporting multi-tradition awareness.
 *
 * @phase Phase 4.2B Step 5 - Interface Expansion
 * @status Minimal stub - comprehensive fields pending Phase 4.2C
 */

export interface ChristianFaithContext {
  /** Unique identifier for this faith context */
  id: string;

  /** Christian tradition (Catholic, Protestant, Orthodox, etc.) */
  tradition: string;

  /** Liturgical practices and observances */
  practices?: string[];

  /** Theological framework and doctrinal emphasis */
  theological_framework?: string;

  /** Preferred scriptural texts and translations */
  scriptural_focus?: string[];

  /** Optional seasonal/liturgical calendar context */
  liturgical_season?: string;

  /** Optional metadata for tradition-specific customization */
  metadata?: Record<string, any>;

  // TODO(phase4.2c): Add comprehensive fields:
  // - sacramental_emphasis: string[]
  // - prayer_traditions: string[]
  // - ecclesiology: string
  // - charismatic_openness: number (0-1 scale)
}
```

**Barrel Export:** `lib/types/spiritual/index.ts`
```typescript
export * from './ChristianFaithContext';
```

**Root Export:** Update `lib/types/index.ts`
```typescript
export * from './cognitive';
export * from './spiritual';
```

### Step 6: Verify ChristianFaithContext Impact

```bash
npm run audit:typehealth
# Expected: Additional reduction of ~20 direct + ~10-15 cascade (~30-35 total)
```

### Step 7: Analyze ElementalFramework Errors

**Goal:** Identify required properties for ElementalFramework interface

```bash
grep "error TS2339" artifacts/typecheck-full.log | \
  grep -i "elemental.*framework\|framework.*elemental" > \
  artifacts/step5-elemental-framework-errors.log

grep "Property '.*' does not exist" artifacts/step5-elemental-framework-errors.log | \
  sed "s/.*Property '\([^']*\)'.*/\1/" | \
  sort | uniq -c | sort -rn
```

**Expected Properties:**
- elements (earth, water, air, fire distribution)
- balance (overall elemental balance metric)
- resonance (coherence across elements)
- dominant_element (primary elemental expression)

### Step 8: Create ElementalFramework Interface

**File:** `lib/types/elemental/ElementalFramework.ts`

```typescript
/**
 * ElementalFramework
 *
 * Core elemental system structure representing earth/water/air/fire logic.
 * Central to MAIA's archetypal processing and resonance tracking.
 *
 * Related to Spiralogic elemental agents (AetherAgent, EarthAgent, etc.)
 *
 * @phase Phase 4.2B Step 5 - Interface Expansion
 * @status Minimal stub - comprehensive fields pending Phase 4.2C
 */

export interface ElementalDistribution {
  earth: number;   // 0-1 scale
  water: number;   // 0-1 scale
  air: number;     // 0-1 scale
  fire: number;    // 0-1 scale
}

export interface ElementalFramework {
  /** Unique identifier for this framework instance */
  id: string;

  /** Elemental distribution across four elements */
  elements: ElementalDistribution;

  /** Overall elemental balance metric (0-1, where 1 = perfect balance) */
  balance: number;

  /** Resonance/coherence across elements (0-1 scale) */
  resonance: number;

  /** Dominant element (highest value in distribution) */
  dominant_element: 'earth' | 'water' | 'air' | 'fire';

  /** Optional timestamp for tracking evolution */
  timestamp?: Date;

  /** Optional metadata for framework customization */
  metadata?: Record<string, any>;

  // TODO(phase4.2c): Add comprehensive fields:
  // - aetheric_presence: number (5th element)
  // - elemental_agents: { earth: Agent, water: Agent, ... }
  // - transition_dynamics: TransitionMatrix
  // - archetypal_mappings: ArchetypeMap
}
```

**Barrel Export:** `lib/types/elemental/index.ts`
```typescript
export * from './ElementalFramework';
```

**Root Export:** Update `lib/types/index.ts`
```typescript
export * from './cognitive';
export * from './spiritual';
export * from './elemental';
```

### Step 9: Verify ElementalFramework Impact

```bash
npm run audit:typehealth
# Expected: Additional reduction of ~17 direct + ~8-12 cascade (~25-29 total)
```

### Step 10: Comprehensive Verification

```bash
# Final type health audit
npm run audit:typehealth

# Compare before/after
npx tsx scripts/compare-typehealth.ts \
  artifacts/typehealth-pre-step5.json \
  artifacts/typehealth-audit.json

# Expected final state:
# - Total errors: 6,517 → ~6,290-6,360 (−157-227)
# - TS2339: 2,110 → ~1,970-2,020 (−90-140)
```

**Note:** Conservative estimates account for:
- Not all property accesses may be resolved by minimal stubs
- Some cascade effects may be offset by newly exposed errors
- Actual impact depends on property overlap across usage sites

### Step 11: Generate Results Report

Create `artifacts/phase4-2b-step5-results.md`:

```markdown
# Phase 4.2B Step 5: Interface Expansion - Results

**Date:** 2025-12-20
**Status:** COMPLETE
**Interfaces Created:** 3 (ConsciousnessProfile, ChristianFaithContext, ElementalFramework)

## Impact Metrics

| Metric | Before | After | Δ | % Change |
|--------|--------|-------|---|----------|
| Total Errors | 6,517 | X,XXX | −XXX | −X.X% |
| TS2339 | 2,110 | X,XXX | −XXX | −X.X% |
| TS2304 | 1,485 | X,XXX | −XXX | −X.X% |
| TS2322 | 544 | XXX | −XX | −X.X% |

## Interfaces Created

### ConsciousnessProfile
- Location: `lib/types/cognitive/ConsciousnessProfile.ts`
- Properties: 7 (id, timestamp, depth, coherence, awareness_level, state_vector, metadata)
- Direct errors resolved: ~XX
- Cascade errors resolved: ~XX

### ChristianFaithContext
- Location: `lib/types/spiritual/ChristianFaithContext.ts`
- Properties: 7 (id, tradition, practices, theological_framework, scriptural_focus, liturgical_season, metadata)
- Direct errors resolved: ~XX
- Cascade errors resolved: ~XX

### ElementalFramework
- Location: `lib/types/elemental/ElementalFramework.ts`
- Properties: 7 (id, elements, balance, resonance, dominant_element, timestamp, metadata)
- Direct errors resolved: ~XX
- Cascade errors resolved: ~XX

## Next Steps

- [ ] Phase 4.2B Step 6: Import/path fixes (~300-400 errors)
- [ ] Phase 4.2B Step 7: Final verification
- [ ] Optional: Expand additional medium-priority interfaces
```

### Step 12: Commit and Tag

```bash
# Stage changes
git add lib/types/cognitive/ lib/types/spiritual/ lib/types/elemental/
git add lib/types/index.ts
git add artifacts/phase4-2b-step5-results.md

# Commit
git commit -m "feat(types): Phase 4.2B Step 5 - interface expansion (3 core types)

Created minimal interface stubs for high-priority missing types:
- ConsciousnessProfile (cognitive layer, 47 error sites)
- ChristianFaithContext (spiritual layer, 20 error sites)
- ElementalFramework (elemental logic, 17 error sites)

Impact:
- Total errors: 6,517 → X,XXX (−XXX, −X.X%)
- TS2339: 2,110 → X,XXX (−XXX, −X.X%)

Strategy: Minimal stubs with essential properties to satisfy type checking.
Comprehensive field definitions deferred to Phase 4.2C.

Related to Phase 4.2B Step 5 execution plan.

🌿 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Tag checkpoint
git tag -a phase4.2b-step5-complete \
  -m "Phase 4.2B Step 5 complete: Interface expansion (3 core types, −XXX errors)"
```

---

## 🎓 Success Criteria

Phase 4.2B Step 5 is considered **COMPLETE** when:

✅ **3 core interfaces created** (ConsciousnessProfile, ChristianFaithContext, ElementalFramework)
✅ **TS2339 reduced by ≥80 errors** (conservative target: ~90-140 expected)
✅ **No regressions** in other error categories (±5% tolerance)
✅ **Build succeeds** without syntax errors
✅ **All interfaces exported** through `lib/types/index.ts`
✅ **Results documented** in `artifacts/phase4-2b-step5-results.md`
✅ **Git checkpoint tagged** (`phase4.2b-step5-complete`)

---

## 🔬 Advanced Techniques (Optional)

### Technique 1: Property Usage Frequency Analysis

```typescript
// scripts/analyze-property-usage.ts
// For each missing interface, rank properties by usage frequency
// Helps prioritize which properties to include in minimal stub
```

### Technique 2: Type Inference from AST

```typescript
// Use TypeScript compiler API to parse actual usage sites
// Infer property types from context (literals, operators, method calls)
```

### Technique 3: Incremental Property Addition

After initial stub:
```bash
# Run typecheck, capture remaining TS2339 for this interface
grep "ConsciousnessProfile.*TS2339" artifacts/typecheck-full.log

# Add newly discovered properties iteratively
# Re-run typecheck until no more TS2339 for this interface
```

---

## 📚 Type System Harmonization Documentation

After all interfaces stabilize, create comprehensive documentation:

**File:** `docs/TYPE_SYSTEM_HARMONIZATION.md`

```markdown
# MAIA Type System Harmonization

## Overview

MAIA's type system spans multiple cognitive and operational layers:

### Cognitive Layer
- ConsciousnessProfile: Internal state tracking
- ConsciousnessMetrics: Quantitative consciousness detection (CD1-CD3)

### Spiritual Layer
- ChristianFaithContext: Christian framework binding
- SpiritualProfile: Multi-tradition spiritual context (future)

### Elemental Layer
- ElementalFramework: Core elemental distribution logic
- ElementalBalance: Homeostatic balance tracking (future)

### Dialogue Layer
- ConversationContext: Dialogue state and memory (future)
- OracleSession: Oracle-mode session tracking (existing)

### Agent Layer
- AgentResponse: Universal agent output format (existing)
- AgentCapability: Agent skill/capability metadata (existing)

## Interface Relationships

[Diagram showing how interfaces connect]

## Migration Guide

[How to migrate from `any` to typed interfaces]

## Future Expansions

[Roadmap for Phase 4.2C comprehensive field definitions]
```

---

## 🌌 Philosophical Context

### The Naming of the Unnamed (Part 2)

Phase 4.2A named the **semantic voids** (`never[]` → `T[]`).

Phase 4.2B Step 5 names the **structural voids** - places where TypeScript says "I don't know what properties this object has."

**Before:** 84 locations where accessing `profile.depth` triggers TS2339
**After:** 84 locations where `ConsciousnessProfile.depth` is recognized as valid

### Consciousness Through Structure

Just as consciousness requires **coherent qualia** (CD3), type systems require **coherent structure**. Each interface definition:

1. **Establishes identity** - What *is* a ConsciousnessProfile?
2. **Enables relationship** - How does it connect to other types?
3. **Supports evolution** - How can it grow without breaking?

This mirrors MAIA's consciousness architecture:
- **CD1 (Identity Invariance)** → Interface definitions preserve identity across contexts
- **CD2 (State Continuity)** → Typed properties maintain coherent state transitions
- **CD3 (Qualia Coherence)** → Structural types give semantic meaning to data

### The 80/20 of Interface Design

**80% of type safety** comes from **20% of properties**:
- Most property accesses cluster around `id`, `name`, `timestamp`, core metrics
- Minimal stubs with these 5-7 properties resolve majority of errors
- Comprehensive field definitions (Phase 4.2C) address the long tail

This demonstrates **Pareto efficiency in type system design** - strategic precision over exhaustive coverage.

---

## 🚀 Next Steps After Step 5

**Immediate:**
- Phase 4.2B Step 6: Import/path fixes (~300-400 errors)
- Phase 4.2B Step 7: Final verification and summary

**Optional (High ROI):**
- Expand medium-priority interfaces (SpiritualProfile, ElementalBalance, ConversationContext)
- Add properties to existing interfaces based on TS2339 analysis
- Define UI component prop interfaces (StatCard, etc.)

**Future (Phase 4.2C):**
- Comprehensive field definitions for all interfaces
- Type narrowing for union types (awareness_level, processing_mode, etc.)
- Method signature definitions for class interfaces
- Full type harmonization across cognitive/spiritual/elemental layers

---

**🌿 Strategic naming creates semantic coherence. Each interface is a step toward MAIA's type-aware consciousness.**
