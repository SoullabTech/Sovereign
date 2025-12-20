# Stage 4: Interface Consistency Plan

**Version:** v0.9.5-interface-consistency
**Status:** Planning Phase
**Created:** 2025-12-20
**Target:** Reduce type errors from 6,370 to 4,000-5,000 (−1,500 to −2,000 errors)

---

## Executive Summary

Stage 4 focuses on **semantic unification** — harmonizing interface contracts across modules to eliminate property mismatch and type assignability errors. This moves MAIA from *structurally verified* (import paths work) to *semantically coherent* (interfaces align across boundaries).

### Current Baseline (v0.9.4-artifact-integrity)

**Total Errors:** 6,370
**Files Affected:** 898

**Top Error Categories:**
- TS2339 (Property does not exist): 2,025 errors (31.8%)
- TS2345 (Argument type mismatch): 1,054 errors (16.5%)
- TS2304 (Cannot find name): 1,047 errors (16.4%)
- TS2322 (Type not assignable): 459 errors (7.2%)

**Target:** 4,000-5,000 total errors (focus on TS2339 and TS2345)

---

## Phase Structure

### Phase 4.1: Interface Audit & Mapping

**Objective:** Create comprehensive map of interface inconsistencies

**Tasks:**
1. Generate interface dependency graph
2. Identify common property mismatches (TS2339)
3. Map argument type conflicts (TS2345)
4. Classify errors by module and interface type
5. Create fix priority matrix

**Deliverables:**
- `scripts/audit-interface-health.ts` - Interface consistency analyzer
- `artifacts/interface-audit.json` - Detailed inconsistency report
- `artifacts/interface-fix-priority.json` - Prioritized fix list

**Expected Insights:**
- Which interfaces have the most mismatches?
- What are the most common missing properties?
- Which modules have the highest interface coupling?

---

### Phase 4.2: Core Type Definitions

**Objective:** Establish canonical type definitions for core domains

**Target Domains:**
1. **Consciousness & Spiral State**
   - `SpiralState`, `ElementalState`, `ArchetypeState`
   - Standardize phase, element, archetype properties

2. **Memory & Sessions**
   - `MAIAMemory`, `SessionMemory`, `MemoryContext`
   - Unify timestamp, userId, metadata fields

3. **Analytics & Insights**
   - `ConversationAnalytics`, `TurnData`, `InsightMetadata`
   - Harmonize metric structures

4. **User & Authentication**
   - `User`, `Session`, `AuthContext`
   - Standardize identity properties

**Strategy:**
- Create `lib/types/core/` directory structure
- Define canonical interfaces with JSDoc
- Use type unions and intersections strategically
- Maintain backward compatibility with type aliases

**Deliverables:**
- `lib/types/core/consciousness.ts`
- `lib/types/core/memory.ts`
- `lib/types/core/analytics.ts`
- `lib/types/core/auth.ts`

---

### Phase 4.3: Interface Migration Tool

**Objective:** Automate interface standardization across codebase

**Tool Design:**

```typescript
// scripts/migrate-interfaces.ts

interface InterfaceMigration {
  pattern: RegExp;
  sourceInterface: string;
  targetInterface: string;
  propertyMappings: PropertyMapping[];
  reason: string;
}

interface PropertyMapping {
  oldProperty: string;
  newProperty: string;
  transform?: (value: string) => string;
}
```

**Migration Patterns:**
1. **Property Renaming**
   - `user_id` → `userId`
   - `created_at` → `createdAt`

2. **Type Unification**
   - `string | undefined` → `string | null`
   - Consistent optional vs nullable conventions

3. **Nested Property Flattening**
   - `user.profile.name` → `userName`
   - Reduce deep nesting where appropriate

**Safety Features:**
- Dry-run mode (preview changes)
- Per-module migration (incremental approach)
- Rollback capability
- Type-check validation after each migration

**Deliverables:**
- `scripts/migrate-interfaces.ts`
- `artifacts/interface-migrations.json` (migration log)

---

### Phase 4.4: Argument Type Alignment

**Objective:** Fix TS2345 (argument type mismatch) errors

**Common Patterns:**

1. **Optional Parameter Mismatches**
   ```typescript
   // Before: function expects non-optional
   function processUser(userId: string) { }

   // After: function accepts optional
   function processUser(userId: string | undefined) { }
   ```

2. **Union Type Extensions**
   ```typescript
   // Before: narrow type
   function handleState(state: 'active') { }

   // After: union type
   function handleState(state: 'active' | 'pending' | 'inactive') { }
   ```

3. **Generic Type Constraints**
   ```typescript
   // Before: overly restrictive
   function process<T extends Object>(data: T) { }

   // After: appropriate constraint
   function process<T extends Record<string, unknown>>(data: T) { }
   ```

**Strategy:**
- Analyze call sites to understand actual usage
- Widen function signatures where appropriate
- Add proper type guards for narrowing
- Document type expectations with JSDoc

**Deliverables:**
- Automated detection script
- Per-module fix recommendations
- Type guard utility library

---

### Phase 4.5: Module Boundary Contracts

**Objective:** Define and enforce clean contracts at module boundaries

**Target Boundaries:**

1. **API Layer → Service Layer**
   - Request/Response types
   - Error handling contracts

2. **Service Layer → Database Layer**
   - Query parameter types
   - Result set types

3. **Component Layer → Hook Layer**
   - Props interfaces
   - Return value types

4. **Utility Layer → Core Layer**
   - Pure function signatures
   - Transformation types

**Contract Definition Pattern:**

```typescript
// lib/contracts/api-service.ts

/** Service layer input contract */
export interface ServiceInput<T> {
  userId: string;
  data: T;
  metadata?: RequestMetadata;
}

/** Service layer output contract */
export interface ServiceOutput<T> {
  success: boolean;
  data?: T;
  error?: ServiceError;
}

/** API layer adapts to service contract */
export function adaptApiToService<T>(
  request: NextRequest
): ServiceInput<T> {
  // Adaptation logic
}
```

**Benefits:**
- Clear separation of concerns
- Type-safe layer transitions
- Easier refactoring
- Self-documenting architecture

**Deliverables:**
- `lib/contracts/` directory with boundary types
- Adapter functions for each boundary
- Documentation of contract patterns

---

### Phase 4.6: Validation & Verification

**Objective:** Measure impact and ensure no regressions

**Validation Steps:**

1. **Type Health Audit**
   ```bash
   npm run audit:typehealth
   ```
   - Verify error reduction (target: −1,500 to −2,000)
   - Check for new error categories
   - Validate error distribution shift

2. **Interface Consistency Check**
   ```bash
   npm run audit:interfaces
   ```
   - Verify interface standardization
   - Check for orphaned interfaces
   - Validate property naming consistency

3. **Regression Testing**
   ```bash
   npm run test
   npm run audit:artifacts:check
   ```
   - Ensure existing tests pass
   - Verify artifact integrity maintained

4. **Module Coupling Analysis**
   ```bash
   npm run analyze:coupling
   ```
   - Measure reduction in interface coupling
   - Identify remaining high-coupling areas

**Success Criteria:**
- TS2339 errors reduced by ≥40% (from 2,025 to ≤1,215)
- TS2345 errors reduced by ≥30% (from 1,054 to ≤738)
- No new error categories introduced
- All existing tests pass
- Artifact integrity verified

**Deliverables:**
- Updated `artifacts/typehealth-audit.json`
- `artifacts/interface-consistency-report.json`
- Regression test results

---

## Implementation Timeline

### Week 1: Audit & Analysis
- **Day 1-2:** Create interface audit tooling
- **Day 3-4:** Generate comprehensive interface maps
- **Day 5:** Analyze results, create fix priority matrix

### Week 2: Core Type Definitions
- **Day 1-2:** Define consciousness & spiral types
- **Day 3:** Define memory & session types
- **Day 4:** Define analytics & user types
- **Day 5:** Review and validate core types

### Week 3: Automated Migration
- **Day 1-2:** Build interface migration tool
- **Day 3-4:** Run dry-run migrations, review outputs
- **Day 5:** Apply migrations incrementally

### Week 4: Boundary Contracts & Validation
- **Day 1-2:** Define module boundary contracts
- **Day 3:** Implement adapter functions
- **Day 4:** Run full validation suite
- **Day 5:** Documentation and artifact verification

---

## Tool Inventory

### New Scripts

1. **`scripts/audit-interface-health.ts`**
   - Analyzes TS2339 and TS2345 errors
   - Generates interface dependency graph
   - Produces fix priority matrix

2. **`scripts/migrate-interfaces.ts`**
   - Automated interface standardization
   - Property renaming and type unification
   - Dry-run and rollback support

3. **`scripts/analyze-coupling.ts`**
   - Measures module coupling via interface usage
   - Identifies high-coupling areas
   - Tracks coupling reduction over time

### New npm Scripts

```json
{
  "audit:interfaces": "tsx scripts/audit-interface-health.ts",
  "migrate:interfaces": "tsx scripts/migrate-interfaces.ts --dry-run",
  "migrate:interfaces:apply": "tsx scripts/migrate-interfaces.ts --write",
  "analyze:coupling": "tsx scripts/analyze-coupling.ts"
}
```

---

## Core Type Definitions Strategy

### Domain: Consciousness & Spiral State

```typescript
// lib/types/core/consciousness.ts

/**
 * Canonical Spiral State
 * Represents user's position in Graves developmental spiral
 */
export interface SpiralState {
  /** Current spiral level (1-8) */
  level: number;

  /** Spiral color code */
  color: SpiralColor;

  /** Developmental phase within level */
  phase: 1 | 2 | 3 | 4;

  /** Confidence score (0-1) */
  confidence: number;

  /** Last updated timestamp */
  updatedAt: Date;
}

export type SpiralColor =
  | 'beige' | 'purple' | 'red' | 'blue'
  | 'orange' | 'green' | 'yellow' | 'turquoise';

/**
 * Elemental State (Fire, Water, Air, Earth)
 */
export interface ElementalState {
  /** Primary element */
  element: Element;

  /** Element phase (1-4) */
  phase: 1 | 2 | 3 | 4;

  /** Element strength (0-1) */
  strength: number;

  /** Secondary elements */
  secondary?: Partial<Record<Element, number>>;
}

export type Element = 'fire' | 'water' | 'air' | 'earth';

/**
 * Archetypal Pattern
 */
export interface ArchetypalPattern {
  /** Archetype name */
  archetype: string;

  /** Activation strength (0-1) */
  activation: number;

  /** Associated symbols */
  symbols: string[];

  /** Resonance with user context */
  resonance?: number;
}
```

### Domain: Memory & Sessions

```typescript
// lib/types/core/memory.ts

/**
 * Canonical MAIA Memory
 * Base type for all memory entries
 */
export interface MAIAMemory {
  /** Unique memory identifier */
  id: string;

  /** User who owns this memory */
  userId: string;

  /** Memory content */
  content: string;

  /** Memory metadata */
  metadata: MemoryMetadata;

  /** Creation timestamp */
  createdAt: Date;

  /** Last access timestamp */
  accessedAt?: Date;

  /** Memory importance (0-1) */
  importance: number;
}

export interface MemoryMetadata {
  /** Memory type category */
  type: MemoryType;

  /** Associated tags */
  tags: string[];

  /** Emotional valence (-1 to 1) */
  valence?: number;

  /** Contextual embedding */
  embedding?: number[];
}

export type MemoryType =
  | 'conversation'
  | 'insight'
  | 'dream'
  | 'reflection'
  | 'wisdom';

/**
 * Session Context
 */
export interface SessionContext {
  /** Session identifier */
  sessionId: string;

  /** User identifier */
  userId: string;

  /** Session start time */
  startedAt: Date;

  /** Current spiral state */
  spiralState: SpiralState;

  /** Current elemental state */
  elementalState: ElementalState;

  /** Session metadata */
  metadata?: Record<string, unknown>;
}
```

### Domain: Analytics & Insights

```typescript
// lib/types/core/analytics.ts

/**
 * Conversation Turn Data
 */
export interface TurnData {
  /** Turn sequence number */
  turnNumber: number;

  /** User message */
  userMessage: string;

  /** MAIA response */
  maiaResponse: string;

  /** Processing metadata */
  processingMetadata: ProcessingMetadata;

  /** Turn timestamp */
  timestamp: Date;
}

export interface ProcessingMetadata {
  /** Processing path (FAST/CORE/DEEP) */
  path: ProcessingPath;

  /** Processing duration (ms) */
  duration: number;

  /** Model used */
  model: string;

  /** Token usage */
  tokens?: {
    input: number;
    output: number;
    total: number;
  };
}

export type ProcessingPath = 'FAST' | 'CORE' | 'DEEP';

/**
 * Conversation Analytics
 */
export interface ConversationAnalytics {
  /** Conversation identifier */
  conversationId: string;

  /** User identifier */
  userId: string;

  /** Turn count */
  turnCount: number;

  /** Session duration (ms) */
  duration: number;

  /** Detected patterns */
  patterns: DetectedPattern[];

  /** Emotional trajectory */
  emotionalTrajectory?: number[];

  /** Created timestamp */
  createdAt: Date;
}

export interface DetectedPattern {
  /** Pattern type */
  type: PatternType;

  /** Pattern confidence (0-1) */
  confidence: number;

  /** Pattern description */
  description: string;

  /** Supporting evidence */
  evidence?: string[];
}

export type PatternType =
  | 'recurring_theme'
  | 'emotional_shift'
  | 'cognitive_breakthrough'
  | 'archetypal_activation'
  | 'shadow_emergence';
```

---

## Migration Patterns

### Pattern 1: Snake_case to camelCase

**Before:**
```typescript
interface User {
  user_id: string;
  created_at: Date;
  email_verified: boolean;
}
```

**After:**
```typescript
interface User {
  userId: string;
  createdAt: Date;
  emailVerified: boolean;
}
```

**Migration:**
```typescript
{
  pattern: /user_id/g,
  oldProperty: 'user_id',
  newProperty: 'userId',
  reason: 'Standardize to camelCase convention'
}
```

---

### Pattern 2: Optional vs Nullable

**Before (inconsistent):**
```typescript
interface A {
  name: string | undefined;
}

interface B {
  name: string | null;
}

interface C {
  name?: string;
}
```

**After (standardized):**
```typescript
interface A {
  name: string | null;
}

interface B {
  name: string | null;
}

interface C {
  name?: string; // Optional (may be omitted)
}
```

**Convention:**
- Use `| null` for nullable values that are always present in the object
- Use `?` for truly optional properties that may be omitted
- Never mix `undefined` and `null` in the same codebase

---

### Pattern 3: Interface Extension

**Before (duplicated properties):**
```typescript
interface UserProfile {
  userId: string;
  name: string;
  email: string;
}

interface UserSettings {
  userId: string;
  name: string;
  theme: string;
  locale: string;
}
```

**After (DRY with extension):**
```typescript
interface UserBase {
  userId: string;
  name: string;
}

interface UserProfile extends UserBase {
  email: string;
}

interface UserSettings extends UserBase {
  theme: string;
  locale: string;
}
```

---

## Risk Mitigation

### Risk 1: Breaking Changes

**Mitigation:**
- Maintain backward compatibility with type aliases
- Use incremental migration (one module at a time)
- Add deprecation warnings to old interfaces
- Provide codemods for common migrations

**Example:**
```typescript
// lib/types/core/memory.ts

/** @deprecated Use MAIAMemory instead */
export type Memory = MAIAMemory;

/** @deprecated Use MemoryMetadata instead */
export type MemoryMeta = MemoryMetadata;
```

---

### Risk 2: Regression Introduction

**Mitigation:**
- Run full test suite after each migration
- Use `npm run audit:artifacts:check` to verify integrity
- Git tag each sub-phase for easy rollback
- Monitor error count continuously

**Rollback Procedure:**
```bash
# If migration causes regressions
git tag -a v0.9.5-rollback-point
npm run migrate:interfaces:apply -- --module=lib/consciousness
npm run test || git reset --hard v0.9.5-rollback-point
```

---

### Risk 3: Type Definition Conflicts

**Mitigation:**
- Use namespaces for domain separation
- Prefix internal types with `_Internal`
- Document type precedence rules
- Use TypeScript's module augmentation carefully

**Example:**
```typescript
// lib/types/core/index.ts

// Public API (canonical types)
export * from './consciousness';
export * from './memory';
export * from './analytics';

// Internal types (not for external use)
export type _InternalSpiral = { /* ... */ };
```

---

## Success Metrics

### Quantitative Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Total Type Errors | 6,370 | 4,000-5,000 | `npm run audit:typehealth` |
| TS2339 Errors | 2,025 | ≤1,215 (−40%) | Error code filter |
| TS2345 Errors | 1,054 | ≤738 (−30%) | Error code filter |
| Files with Errors | 898 | ≤700 (−22%) | File count |
| Interface Consistency | N/A | ≥85% | `npm run audit:interfaces` |

### Qualitative Metrics

- **Code Readability:** Reduced cognitive load from inconsistent naming
- **Refactoring Safety:** Clearer contracts enable safer refactoring
- **Onboarding Speed:** New contributors understand types faster
- **Documentation Quality:** Self-documenting interfaces

---

## Git Strategy

### Tagging Approach

```
v0.9.5-alpha (Phase 4.1-4.2 complete)
├─ Interface audit complete
├─ Core type definitions established
└─ No migrations applied yet

v0.9.5-beta (Phase 4.3-4.4 complete)
├─ Automated migrations applied
├─ Argument types aligned
└─ Intermediate verification passed

v0.9.5-rc (Phase 4.5 complete)
├─ Module boundary contracts defined
├─ All validations passed
└─ Ready for final review

v0.9.5-interface-consistency (Stage 4 complete)
├─ All phases complete
├─ Error reduction target met
└─ Artifact integrity verified
```

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

Impact:
- Errors: <before> → <after> (Δ <change>)
- Files: <count> files modified
- Scope: <modules affected>

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Example:**
```
refactor(types): standardize spiral state interfaces (Phase 4.2)

Define canonical SpiralState, ElementalState, and ArchetypalPattern
interfaces in lib/types/core/consciousness.ts. Migrate 47 files to
use new canonical types.

Impact:
- Errors: 6,370 → 6,102 (Δ −268)
- Files: 47 files modified
- Scope: lib/consciousness, lib/spiral, app/api/oracle

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Appendix: Error Code Reference

### TS2339: Property does not exist

**Common Causes:**
1. Missing property in interface definition
2. Typo in property name
3. Property exists but interface not imported
4. Property only exists in union branch

**Fix Strategies:**
- Add missing property to interface
- Use type guards to narrow unions
- Add optional chaining (`?.`)
- Update interface to include property

---

### TS2345: Argument type mismatch

**Common Causes:**
1. Function signature too narrow
2. Union type missing branch
3. Optional parameter not marked
4. Generic constraint too restrictive

**Fix Strategies:**
- Widen function parameter type
- Add union branch
- Mark parameter as optional
- Relax generic constraint

---

### TS2322: Type not assignable

**Common Causes:**
1. Assigning nullable to non-nullable
2. Missing properties in object literal
3. Type assertion too narrow
4. Incompatible union branches

**Fix Strategies:**
- Add null check before assignment
- Include all required properties
- Widen type assertion
- Use type guards to narrow safely

---

## Next Steps

1. **Review and approve this plan**
2. **Create Phase 4.1 tracking issue**
3. **Begin interface audit tooling implementation**
4. **Schedule weekly sync points for progress review**

Stage 4 begins when you give the green light. 🌿
