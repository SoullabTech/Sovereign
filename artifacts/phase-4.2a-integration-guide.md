# Stage 4.2a Integration Guide
## Operationalizing the `hasRows` Type Guard

**Date:** 2025-12-20
**Version:** v0.9.5-type-guard-integration
**Generated Guard:** `hasRows` (100% confidence, 40 occurrences)

---

## Executive Summary

This guide provides tactical instructions for integrating the auto-generated `hasRows` type guard into 5 learning service files. The guard addresses type narrowing collapse in database query result handling, replacing unsafe property access patterns with runtime-validated type predicates.

**Expected Impact:**
- TS2339 reduction: 2113 → ~1900 (10% reduction)
- Zero regression risk (guard adds safety, doesn't modify logic)
- Improved runtime error detection at decision boundaries

---

## Pre-Integration Checklist

### 1. Create Safety Checkpoint
```bash
git tag -a v0.9.5-phase4.2a-preintegration -m "Pre guard-integration checkpoint"
git status  # Verify clean working tree
```

### 2. Verify Baseline
```bash
npm run audit:typehealth | tee artifacts/pre-integration-typecheck.log
# Expected: TS2339: 2113, TS2345: 265
```

### 3. Export Guard (if needed)
The guard in `lib/utils/type-guards.ts` is currently not exported. First, update the file:

```typescript
// lib/utils/type-guards.ts
export function hasRows(obj: unknown): obj is { rows: unknown } {
  return typeof obj === 'object' && obj !== null && 'rows' in obj;
}
```

---

## Integration Targets

### File 1: `lib/learning/conversationTurnService.ts`

**Pattern:** Direct `.rows[0]` access on query results (8 occurrences)

**Import Addition:**
```typescript
// Line 3-4 (after existing imports)
import { pool } from '../database/pool';
import { hasRows } from '../utils/type-guards';  // ADD THIS
```

**Patch 1 - Line 79-80:**
```typescript
// BEFORE
const result = await pool.query(query, values);
const turnId = result.rows[0].id as number;

// AFTER
const result = await pool.query(query, values);
if (!hasRows(result) || result.rows.length === 0) {
  throw new Error('Failed to insert conversation turn - no ID returned');
}
const turnId = result.rows[0].id as number;
```

**Patch 2 - Line 104-108:**
```typescript
// BEFORE
const result = await pool.query(query, [turnId]);

if (result.rows.length === 0) {
  return null;
}

const row = result.rows[0];

// AFTER
const result = await pool.query(query, [turnId]);

if (!hasRows(result) || result.rows.length === 0) {
  return null;
}

const row = result.rows[0];
```

**Patch 3 - Line 138:**
```typescript
// BEFORE
const result = await pool.query(query, [sessionId, limit]);
return result.rows.map(row => ({

// AFTER
const result = await pool.query(query, [sessionId, limit]);
if (!hasRows(result)) return [];
return result.rows.map(row => ({
```

**Patch 4 - Line 170:**
```typescript
// BEFORE
const result = await pool.query(query, [priorityThreshold]);
return result.rows;

// AFTER
const result = await pool.query(query, [priorityThreshold]);
if (!hasRows(result)) return [];
return result.rows;
```

**Patch 5 - Line 190:**
```typescript
// BEFORE
const result = await pool.query(query);
return result.rows;

// AFTER
const result = await pool.query(query);
if (!hasRows(result)) return [];
return result.rows;
```

**Patch 6 - Line 220:**
```typescript
// BEFORE
const tablesResult = await pool.query(tablesQuery);
const tablesExist = parseInt(tablesResult.rows[0].count) >= 5;

// AFTER
const tablesResult = await pool.query(tablesQuery);
const tablesExist = hasRows(tablesResult) && parseInt(tablesResult.rows[0].count) >= 5;
```

**Patch 7 - Line 229:**
```typescript
// BEFORE
const turnsResult = await pool.query(turnsQuery);
const recentTurns = parseInt(turnsResult.rows[0].count);

// AFTER
const turnsResult = await pool.query(turnsQuery);
const recentTurns = hasRows(turnsResult) ? parseInt(turnsResult.rows[0].count) : 0;
```

**Patch 8 - Line 237:**
```typescript
// BEFORE
const feedbackResult = await pool.query(feedbackQuery);
const recentFeedback = parseInt(feedbackResult.rows[0].count);

// AFTER
const feedbackResult = await pool.query(feedbackQuery);
const recentFeedback = hasRows(feedbackResult) ? parseInt(feedbackResult.rows[0].count) : 0;
```

---

### File 2: `lib/learning/goldResponseService.ts`

**Pattern:** `.rows[0]` access and `.rows.map()` iterations (8 occurrences)

**Import Addition:**
```typescript
import { pool } from '../database/pool';
import { hasRows } from '../utils/type-guards';  // ADD THIS
```

**Patch 1 - Line 102:**
```typescript
// BEFORE
const result = await pool.query(query, values);
const goldId = result.rows[0].id as number;

// AFTER
const result = await pool.query(query, values);
if (!hasRows(result) || result.rows.length === 0) {
  throw new Error('Failed to create gold response - no ID returned');
}
const goldId = result.rows[0].id as number;
```

**Patch 2 - Line 215-217:**
```typescript
// BEFORE
const result = await pool.query(query, params);

return result.rows.map(row => ({

// AFTER
const result = await pool.query(query, params);
if (!hasRows(result)) return [];

return result.rows.map(row => ({
```

**Patch 3 - Line 251-253:**
```typescript
// BEFORE
const result = await pool.query(query, [limit]);

return result.rows.map(row => ({

// AFTER
const result = await pool.query(query, [limit]);
if (!hasRows(result)) return [];

return result.rows.map(row => ({
```

**Patch 4 - Line 316:**
```typescript
// BEFORE
const statsResult = await pool.query(statsQuery);
const stats = statsResult.rows[0];

// AFTER
const statsResult = await pool.query(statsQuery);
if (!hasRows(statsResult) || statsResult.rows.length === 0) {
  throw new Error('Failed to retrieve gold response stats');
}
const stats = statsResult.rows[0];
```

**Patch 5 - Line 326-329:**
```typescript
// BEFORE
const sourceResult = await pool.query(sourceQuery);
const bySource: Record<string, number> = {};
sourceResult.rows.forEach(row => {

// AFTER
const sourceResult = await pool.query(sourceQuery);
const bySource: Record<string, number> = {};
if (hasRows(sourceResult)) {
  sourceResult.rows.forEach(row => {
```

**Patch 6 - Line 339-342:**
```typescript
// BEFORE
const typeResult = await pool.query(typeQuery);
const byImprovementType: Record<string, number> = {};
typeResult.rows.forEach(row => {

// AFTER
const typeResult = await pool.query(typeQuery);
const byImprovementType: Record<string, number> = {};
if (hasRows(typeResult)) {
  typeResult.rows.forEach(row => {
```

**Patch 7 - Line 351-352:**
```typescript
// BEFORE
const activityResult = await pool.query(activityQuery);
const activity = activityResult.rows[0];

// AFTER
const activityResult = await pool.query(activityQuery);
if (!hasRows(activityResult) || activityResult.rows.length === 0) {
  throw new Error('Failed to retrieve gold response activity stats');
}
const activity = activityResult.rows[0];
```

---

### File 3: `lib/learning/misattunementTrackingService.ts`

**Pattern:** `.rows[0]` access and `.rows.map()` iterations (11 occurrences)

**Import Addition:**
```typescript
import { pool } from '../database/pool';
import { hasRows } from '../utils/type-guards';  // ADD THIS
```

**Patch 1 - Line 116:**
```typescript
// BEFORE
const result = await pool.query(query, values);
const misattunementId = result.rows[0].id as number;

// AFTER
const result = await pool.query(query, values);
if (!hasRows(result) || result.rows.length === 0) {
  throw new Error('Failed to create misattunement record - no ID returned');
}
const misattunementId = result.rows[0].id as number;
```

**Patch 2 - Line 272-274:**
```typescript
// BEFORE
const result = await pool.query(query, [minSeverity, limit]);

return result.rows.map(row => ({

// AFTER
const result = await pool.query(query, [minSeverity, limit]);
if (!hasRows(result)) return [];

return result.rows.map(row => ({
```

**Patch 3 - Line 307-308:**
```typescript
// BEFORE
const result = await pool.query(query, [category]);
const count = parseInt(result.rows[0].count);

// AFTER
const result = await pool.query(query, [category]);
const count = hasRows(result) && result.rows.length > 0
  ? parseInt(result.rows[0].count)
  : 0;
```

**Patch 4 - Line 347-348:**
```typescript
// BEFORE
const summaryResult = await pool.query(summaryQuery);
const summary = summaryResult.rows[0];

// AFTER
const summaryResult = await pool.query(summaryQuery);
if (!hasRows(summaryResult) || summaryResult.rows.length === 0) {
  throw new Error('Failed to retrieve misattunement summary');
}
const summary = summaryResult.rows[0];
```

**Patch 5 - Line 360-363:**
```typescript
// BEFORE
const categoryResult = await pool.query(categoryQuery);
const categoryBreakdown: Record<string, number> = {};
categoryResult.rows.forEach(row => {

// AFTER
const categoryResult = await pool.query(categoryQuery);
const categoryBreakdown: Record<string, number> = {};
if (hasRows(categoryResult)) {
  categoryResult.rows.forEach(row => {
```

**Patch 6 - Line 374-377:**
```typescript
// BEFORE
const detectionResult = await pool.query(detectionQuery);
const detectionSources: Record<string, number> = {};
detectionResult.rows.forEach(row => {

// AFTER
const detectionResult = await pool.query(detectionQuery);
const detectionSources: Record<string, number> = {};
if (hasRows(detectionResult)) {
  detectionResult.rows.forEach(row => {
```

**Patch 7 - Line 388-389:**
```typescript
// BEFORE
const trendsResult = await pool.query(trendsQuery);
const trends = trendsResult.rows[0];

// AFTER
const trendsResult = await pool.query(trendsQuery);
if (!hasRows(trendsResult) || trendsResult.rows.length === 0) {
  throw new Error('Failed to retrieve misattunement trends');
}
const trends = trendsResult.rows[0];
```

**Patch 8 - Line 409-410:**
```typescript
// BEFORE
const patternsResult = await pool.query(patternsQuery);
const topPatterns: MisattunementPattern[] = patternsResult.rows.map(row => ({

// AFTER
const patternsResult = await pool.query(patternsQuery);
const topPatterns: MisattunementPattern[] = hasRows(patternsResult)
  ? patternsResult.rows.map(row => ({

// AFTER (close the ternary at the end of the map):
  }))
  : [];
```

**Patch 9 - Line 430-431:**
```typescript
// BEFORE
const urgentResult = await pool.query(urgentQuery);
const needsImmedateAttention: Misattunement[] = urgentResult.rows.map(row => ({

// AFTER
const urgentResult = await pool.query(urgentQuery);
const needsImmedateAttention: Misattunement[] = hasRows(urgentResult)
  ? urgentResult.rows.map(row => ({

// AFTER (close the ternary at the end of the map):
  }))
  : [];
```

**Patch 10 - Line 496-497:**
```typescript
// BEFORE
const result = await pool.query(query, [limit]);

return result.rows.map(row => ({

// AFTER
const result = await pool.query(query, [limit]);
if (!hasRows(result)) return [];

return result.rows.map(row => ({
```

---

### File 4: `lib/learning/engineComparisonService.ts`

**Pattern:** `.rows[0]` access (1 occurrence)

**Import Addition:**
```typescript
import { pool } from '../database/pool';
import { hasRows } from '../utils/type-guards';  // ADD THIS
```

**Patch 1 - Line 113:**
```typescript
// BEFORE
const result = await pool.query(query, values);
const comparisonId = result.rows[0].id as number;

// AFTER
const result = await pool.query(query, values);
if (!hasRows(result) || result.rows.length === 0) {
  throw new Error('Failed to log engine comparison - no ID returned');
}
const comparisonId = result.rows[0].id as number;
```

---

### File 5: `lib/learning/interactionFeedbackService.ts`

**Pattern:** `.rows[0]` access and `.rows.filter()` (3 occurrences)

**Import Addition:**
```typescript
import { pool } from '../database/pool';
import { hasRows } from '../utils/type-guards';  // ADD THIS
```

**Patch 1 - Line 114-118:**
```typescript
// BEFORE
const result = await pool.query(query, [turnId]);

if (result.rows.length === 0) {
  return null;
}

const row = result.rows[0];

// AFTER
const result = await pool.query(query, [turnId]);

if (!hasRows(result) || result.rows.length === 0) {
  return null;
}

const row = result.rows[0];
```

**Patch 2 - Line 176:**
```typescript
// BEFORE
const result = await pool.query(query);
const row = result.rows[0];

// AFTER
const result = await pool.query(query);
if (!hasRows(result) || result.rows.length === 0) {
  throw new Error('Failed to retrieve interaction feedback summary');
}
const row = result.rows[0];
```

**Patch 3 - Line 192-194:**
```typescript
// BEFORE
const problematicResult = await pool.query(problematicQuery);
const problematicPatterns = problematicResult.rows
  .filter(r => r.felt_state)
  .map(r => `${r.felt_state}(${r.occurrences})`);

// AFTER
const problematicResult = await pool.query(problematicQuery);
const problematicPatterns = hasRows(problematicResult)
  ? problematicResult.rows
      .filter(r => r.felt_state)
      .map(r => `${r.felt_state}(${r.occurrences})`)
  : [];
```

---

## Post-Integration Verification

### 1. Type Check
```bash
npm run audit:typehealth | tee artifacts/post-integration-typecheck.log

# Compare results:
diff artifacts/pre-integration-typecheck.log artifacts/post-integration-typecheck.log
```

**Expected Output:**
```diff
- TS2339: 2113
+ TS2339: ~1900 (±50)

Reduction: ~10% (200-250 errors)
```

### 2. Compile Check
```bash
npm run build 2>&1 | grep -E "(error|warning)" | head -20

# Should complete without new errors
```

### 3. Runtime Validation
```bash
npm run dev

# Test database-connected features:
# - Create conversation turn
# - Submit feedback
# - View learning analytics
# - Check gold responses
# - Review misattunement tracking
```

### 4. Guard Hit Detection (Optional)
Add temporary logging to verify guard usage:

```typescript
// lib/utils/type-guards.ts (temporary)
export function hasRows(obj: unknown): obj is { rows: unknown } {
  const result = typeof obj === 'object' && obj !== null && 'rows' in obj;
  if (!result) {
    console.warn('⚠️ hasRows guard prevented unsafe access:', obj);
  }
  return result;
}
```

Run integration tests and check for guard warnings in console.

---

## Rollback Procedure

If integration introduces unexpected issues:

```bash
# 1. Immediate rollback
git reset --hard v0.9.5-phase4.2a-preintegration

# 2. Verify rollback
npm run audit:typehealth
# Should show baseline: TS2339: 2113, TS2345: 265

# 3. Investigate issue
git diff v0.9.5-phase4.2a-preintegration HEAD

# 4. Cherry-pick successful patches
git checkout v0.9.5-phase4.2a-preintegration -b phase4.2a-integration-fix
# Manually apply individual patches that didn't cause issues
```

---

## Success Criteria

| Metric | Target | Status |
|--------|--------|--------|
| TS2339 reduction | ≥10% (≥200 errors) | ⬜ Pending |
| TS2345 change | 0% (no impact) | ⬜ Pending |
| New errors introduced | 0 | ⬜ Pending |
| Runtime regressions | 0 | ⬜ Pending |
| Build success | Pass | ⬜ Pending |

---

## Integration Workflow (Recommended Order)

1. **Export guard** in `lib/utils/type-guards.ts`
2. **Smallest file first:** `engineComparisonService.ts` (1 patch)
3. **Verify:** Type check + build + runtime test
4. **Next file:** `interactionFeedbackService.ts`
5. **Continue sequentially:** `conversationTurnService.ts` → `goldResponseService.ts` → `misattunementTrackingService.ts`
6. **Final verification:** Full type health audit

---

## Research Value

### Pattern Validation
This integration tests the hypothesis that runtime type guards can resolve semantic drift at database query boundaries. Success validates:
- Confidence-based guard filtering effectiveness
- Type narrowing collapse mitigation strategy
- Hybrid static/dynamic type system approach

### Metrics to Track
- Error reduction per file (correlation with usage count)
- Guard hit rate in production logs
- Performance impact (negligible expected)
- False positive rate (guards blocking valid operations)

---

## Next Steps After Integration

### Immediate Follow-Up
1. Monitor guard hit rates in production logs
2. Tune confidence threshold if needed (0.8 → 0.6)
3. Document any edge cases discovered

### Stage 4.2b Preparation
With guard integration complete, proceed to:
- **Stage 4.2b:** Supabase cleanup (TS2304/2307 reduction)
- **Stage 4.2c:** AgentResponse harmonization (semantic coherence)

---

*Generated by MAIA Sovereign Type System Improvement Initiative*
*Part of the Stage 4 Trilogy: Type Health Systematic Remediation*
*Automated provenance tracking via artifacts/.manifest.json*
