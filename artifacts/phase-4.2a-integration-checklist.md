# Stage 4.2a Integration Checklist
## One-Page Operational Reference

**Version:** v0.9.5-type-guard-integration
**Target:** 5 files, 31 patches, ~200 error reduction
**Risk Level:** Low (zero regression expected)

---

## Pre-Integration (5 min)

```bash
# 1. Create safety checkpoint
git tag -a v0.9.5-phase4.2a-preintegration -m "Before hasRows guard integration"

# 2. Verify clean working tree
git status  # Should show no uncommitted changes

# 3. Capture baseline metrics
npm run audit:typehealth | tee artifacts/typehealth-pre-integration.log
# Expected: TS2339: 2113, TS2345: 265

# 4. Export the guard function
# Edit lib/utils/type-guards.ts - change line 15 to:
# export function hasRows(obj: unknown): obj is { rows: unknown } {
```

---

## Integration Workflow (Sequential)

### File 1: `lib/learning/engineComparisonService.ts` (1 patch)
```bash
# Add import after line 3
# Apply patch at line 113
npm run typecheck  # Verify no new errors
```

### File 2: `lib/learning/interactionFeedbackService.ts` (3 patches)
```bash
# Add import after line 3
# Apply patches at lines 114, 176, 192
npm run typecheck
```

### File 3: `lib/learning/conversationTurnService.ts` (8 patches)
```bash
# Add import after line 4
# Apply patches at lines 79, 104, 138, 170, 190, 220, 229, 237
npm run typecheck
```

### File 4: `lib/learning/goldResponseService.ts` (8 patches)
```bash
# Add import after line 3
# Apply patches at lines 102, 215, 251, 316, 326, 339, 351
npm run typecheck
```

### File 5: `lib/learning/misattunementTrackingService.ts` (11 patches)
```bash
# Add import after line 3
# Apply patches at lines 116, 272, 307, 347, 360, 374, 388, 409, 430, 496
npm run typecheck
```

---

## Post-Integration Verification (10 min)

```bash
# 1. Full type health audit
npm run audit:typehealth | tee artifacts/typehealth-post-integration.log

# 2. Compare results
diff artifacts/typehealth-pre-integration.log artifacts/typehealth-post-integration.log

# Expected delta:
# TS2339: 2113 → ~1900 (≈200 reduction, 10%)
# TS2345: 265 → 265 (unchanged)
# New errors: 0

# 3. Build verification
npm run build

# 4. Runtime tests (if available)
npm run test:learning  # Or manual verification via dev server
```

---

## Success Criteria

| Metric | Target | Status |
|--------|--------|--------|
| TS2339 reduction | ≥ 200 errors | ⬜ |
| TS2345 change | 0 (no impact) | ⬜ |
| New errors | 0 | ⬜ |
| Build success | Pass | ⬜ |
| Runtime tests | Pass | ⬜ |

**Success:** All checkboxes ✅
**Partial:** TS2339 reduction < 200 but > 100
**Failure:** Any new errors or runtime regressions

---

## Rollback (if needed)

```bash
# Immediate rollback
git reset --hard v0.9.5-phase4.2a-preintegration

# Verify rollback
npm run audit:typehealth
# Should match baseline: TS2339: 2113, TS2345: 265

# Investigate
git diff v0.9.5-phase4.2a-preintegration HEAD

# Optional: Cherry-pick successful patches
git checkout -b phase4.2a-integration-fix
# Manually reapply patches that worked
```

---

## Commit & Tag (on success)

```bash
git add lib/utils/type-guards.ts
git add lib/learning/engineComparisonService.ts
git add lib/learning/interactionFeedbackService.ts
git add lib/learning/conversationTurnService.ts
git add lib/learning/goldResponseService.ts
git add lib/learning/misattunementTrackingService.ts

git commit -m "feat(stage4.2a): integrate hasRows guard across learning services

- Export hasRows type guard from lib/utils/type-guards.ts
- Apply runtime validation at 31 database query boundaries
- Resolve ~200 TS2339 errors (type narrowing collapse)
- Zero regression risk (guard adds safety, preserves logic)

Stage 4.2a Integration Complete
- Files modified: 5
- Patches applied: 31
- Error reduction: ~10% TS2339
- Pattern: Property access on 'never' type at query boundaries

Related artifacts:
- artifacts/phase-4.2a-integration-guide.md (detailed patches)
- artifacts/phase-4.2a-results.md (orchestration results)
- artifacts/type-guard-templates.json (guard metadata)
"

git tag -a v0.9.5-phase4.2a-integration -m "Stage 4.2a: hasRows guard integration complete"
```

---

## Quick Reference: Guard Pattern

```typescript
// BEFORE (unsafe)
const result = await pool.query(query);
const data = result.rows[0];  // TS2339 error

// AFTER (safe)
const result = await pool.query(query);
if (!hasRows(result) || result.rows.length === 0) {
  throw new Error('Query returned no results');
}
const data = result.rows[0];  // ✅ Type-safe
```

---

## Detailed Guide Reference

For complete patch listings with line numbers and context:
📘 `artifacts/phase-4.2a-integration-guide.md`

For orchestration results and metrics:
📊 `artifacts/phase-4.2a-results.md`

For guard metadata and confidence scores:
📋 `artifacts/type-guard-templates.json`

---

*Stage 4.2a Integration - MAIA Sovereign Type Health Initiative*
