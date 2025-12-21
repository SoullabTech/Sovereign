# Phase 4.2C Module C – Component Cleanup Mission Brief

**Agent**: Kelly (Claude Code - Type System Harmonization Specialist)
**Mission**: Normalize React component imports, resolve design mockup conflicts, and validate component type references
**Phase**: 4.2C Module C – Component Cleanup
**Duration**: ~180 minutes (~3 hours)
**Priority**: HIGH (Completes Type System Harmonization cycle)

---

## Executive Summary

**Objective**: Achieve 100% React component import consistency and validate all component type references against the canonical type definitions established in Phase 4.2C Modules A & B.

**Current State** (Phase 4.2C Module B Complete):
- ✅ 191 properties added to canonical interfaces (Module A)
- ✅ 100% import path consistency to `@/lib/types` barrel exports (Module B)
- ⚠️ React components still use inconsistent import patterns (relative vs alias)
- ⚠️ Design mockup files conflict with production components
- ⚠️ Some components define local types instead of importing canonical ones
- 📊 Baseline: 6,424 diagnostics, 1,042 files affected

**Target State** (Phase 4.2C Module C Complete):
- ✅ 100% React component import consistency using `@/components` and `@/lib/ui` patterns
- ✅ Zero design mockup conflicts
- ✅ All components reference canonical type definitions from `@/lib/types`
- 📊 Target: 6,400 diagnostics (±20 tolerance), qualitative improvement primary goal

**Scope**:
- IN SCOPE: React import normalization, design mockup resolution, component type validation
- OUT OF SCOPE: Design system alignment (deferred), new component creation, feature additions

---

## Mission Context

### Why This Matters

Phase 4.2C is a **three-module harmonization cycle**:

1. **Module A** (COMPLETE): Expanded canonical interfaces from 7 → 198 properties
2. **Module B** (COMPLETE): Normalized all imports to barrel exports (`@/lib/types`)
3. **Module C** (THIS MISSION): Ensure React components consume these canonical types correctly

**Without Module C**, the harmonization work from Modules A & B remains incomplete — components would continue using:
- Relative imports (`../../components/ui/MaiaCard`)
- Local type redefinitions (duplicating canonical types)
- Design mockups mixed with production code

**Module C closes the loop** by making the canonical type system the single source of truth for all React components.

### Strategic Alignment

- **Immediate Impact**: Completes Phase 4.2C harmonization cycle cleanly
- **Enables Stage 5**: Empirical validation requires stable, consistent type system
- **Future Readiness**: Creates foundation for Phase 4.2D (consciousness-biomarkers integration)
- **Technical Debt Reduction**: Eliminates import inconsistencies and type duplication

---

## Mission Phases

### Phase 1: React Import Analysis (30 min)

**Goal**: Generate complete map of all React component import patterns

**Actions**:
1. Create `scripts/analyze-react-imports.ts` automation script
2. Scan `app/`, `components/`, `lib/` for React imports
3. Categorize patterns: relative-deep, relative-shallow, alias-correct, alias-incorrect
4. Generate `artifacts/react-import-analysis.json` report
5. Identify 5-20 files requiring normalization

**Success Criteria**:
- ✅ Analysis script executes without errors
- ✅ JSON report shows clear categorization
- ✅ Normalization targets identified with file paths

**Automation Script Template**: See `PHASE_4_2C_MODULE_C_EXECUTION_PLAN.md` Section 2.1

---

### Phase 2: React Import Normalization (60 min)

**Goal**: Convert all React component imports to canonical alias patterns

**Actions**:
1. For each file identified in Phase 1:
   - Read file contents
   - Identify current import pattern
   - Determine canonical path (`@/components`, `@/lib/ui`, or local relative)
   - Apply normalization using Edit tool
   - Verify no syntax errors
2. Checkpoint every 5 files with incremental commits
3. Verify 100% normalization with re-run of analysis script

**Example Transformation**:
```typescript
// BEFORE
import { MaiaCard } from '../../components/ui/MaiaCard';
import { ConsciousnessProfile } from '../lib/types/cognitive-types';

// AFTER
import { MaiaCard } from '@/components/ui/MaiaCard';
import { ConsciousnessProfile } from '@/lib/types';
```

**Success Criteria**:
- ✅ All targeted files normalized to canonical patterns
- ✅ No increase in total diagnostics
- ✅ Incremental commits every 5 files
- ✅ Final tag: `phase4.2c-C1-imports-normalized`

**Risk Mitigation**:
- If type errors increase → Revert last commit, re-analyze file
- If build fails → Check build log, identify new vs pre-existing errors

---

### Phase 3: Design Mockup Resolution (40 min)

**Goal**: Eliminate conflicts between design mockups and production components

**Actions**:
1. Create `scripts/find-design-mockups.ts` automation script
2. Detect files with `DESIGN_ONLY` flags or placeholder data
3. For each mockup file:
   - **Delete** if purely visual demo
   - **Refactor** if contains reusable logic
   - **Document** if intentionally deferred
4. Verify no broken imports from deletions
5. Commit mockup cleanup

**Success Criteria**:
- ✅ All design mockups identified and resolved
- ✅ No "Cannot find module" errors introduced
- ✅ Zero design conflicts remaining
- ✅ Final tag: `phase4.2c-C1-mockups-resolved`

**Automation Script Template**: See `PHASE_4_2C_MODULE_C_EXECUTION_PLAN.md` Section 3.1

---

### Phase 4: Component Reference Validation (30 min)

**Goal**: Ensure all components reference canonical type definitions

**Actions**:
1. Create `scripts/validate-component-refs.ts` automation script
2. Analyze all React components for type usage
3. Identify conflicts:
   - Components defining local types that duplicate canonical ones
   - Components using outdated type definitions
   - Components with type inconsistencies
4. For each conflict:
   - Replace with import from `@/lib/types` if canonical exists
   - Rename if intentional variation
   - Keep if legitimately component-specific
5. Commit validation fixes

**Success Criteria**:
- ✅ All components validated
- ✅ Type conflicts resolved
- ✅ 100% canonical type usage where applicable
- ✅ Final tag: `phase4.2c-C1-refs-validated`

**Automation Script Template**: See `PHASE_4_2C_MODULE_C_EXECUTION_PLAN.md` Section 4.1

---

### Phase 5: Final Verification & Documentation (10 min)

**Goal**: Capture metrics, update results, and tag completion

**Actions**:
1. Run final type health audit → `artifacts/typehealth-phase4.2c-C1.log`
2. Extract key metrics (total errors, TS2339, TS2304, TS2322)
3. Calculate delta from baseline
4. Update `artifacts/PHASE_4_2C_RESULTS.md` with:
   - Section 5.1: Actions Completed
   - Section 5.2: Checkpoint Metrics
   - Section 5.3: Component Changes Summary
   - Section 5.4: Commit History
5. Create `MODULE_C_COMPLETION_SUMMARY.md`
6. Final commit with comprehensive message
7. Tag `phase4.2c-C1-complete`

**Success Criteria**:
- ✅ Metrics captured and documented
- ✅ Results document updated
- ✅ Completion summary created
- ✅ Final tag created
- ✅ Build passes
- ✅ Sovereignty check passes

---

## Execution Checklist Reference

**Full checklist**: `artifacts/MODULE_C_LAUNCH_CHECKLIST.md`

**Quick phase sequence**:
1. ☐ Pre-Flight Verification (10 min) — git status, baseline metrics, sovereignty check
2. ☐ Phase 1: React Import Analysis (30 min) — automation script, report generation
3. ☐ Phase 2: React Import Normalization (60 min) — file-by-file normalization, checkpoints
4. ☐ Phase 3: Design Mockup Resolution (40 min) — mockup detection, cleanup
5. ☐ Phase 4: Component Reference Validation (30 min) — type conflict detection, resolution
6. ☐ Phase 5: Final Verification & Documentation (10 min) — metrics, results update, tagging

**Total Duration**: ~180 minutes (~3 hours)

---

## Automation Scripts

### 1. analyze-react-imports.ts

**Purpose**: Generate complete map of React component import patterns

**Input**: Scans `app/`, `components/`, `lib/` directories for React imports

**Output**: `artifacts/react-import-analysis.json` with categorized patterns

**Full code**: See `PHASE_4_2C_MODULE_C_EXECUTION_PLAN.md` Section 2.1

**Run**:
```bash
npx tsx scripts/analyze-react-imports.ts
```

---

### 2. find-design-mockups.ts

**Purpose**: Detect design mockup files that conflict with production components

**Input**: Scans all TypeScript/TSX files for mockup indicators

**Output**: `artifacts/design-mockup-report.json` with identified mockups

**Full code**: See `PHASE_4_2C_MODULE_C_EXECUTION_PLAN.md` Section 3.1

**Run**:
```bash
npx tsx scripts/find-design-mockups.ts
```

---

### 3. validate-component-refs.ts

**Purpose**: Validate component type references against canonical definitions

**Input**: Analyzes all React components for type usage

**Output**: `artifacts/component-validation-report.json` with conflicts

**Full code**: See `PHASE_4_2C_MODULE_C_EXECUTION_PLAN.md` Section 4.1

**Run**:
```bash
npx tsx scripts/validate-component-refs.ts
```

---

## Success Metrics

### Quantitative Targets

| Metric | Baseline (B1) | Target (C1) | Notes |
|--------|---------------|-------------|-------|
| Total diagnostics | 6,424 | 6,400 ±20 | Stable or slight decrease |
| Files affected | 1,042 | 1,030 ±20 | Expect slight decrease |
| TS2339 (Property) | 2,186 | 2,150 ±40 | May decrease with canonical types |
| TS2304 (Name) | 1,227 | 1,200 ±30 | May decrease with import fixes |
| TS2322 (Assignable) | 564 | 550 ±20 | Expect slight improvement |

**Note**: Quantitative improvements are secondary to qualitative consistency. Stable metrics with 100% import consistency = SUCCESS.

### Qualitative Goals

✅ **Primary**:
- 100% React component import consistency using canonical alias patterns
- Zero design mockup conflicts with production code
- All components reference canonical type definitions where applicable

✅ **Secondary**:
- Clear separation between production and design code
- Improved codebase maintainability
- Foundation for future type system evolution

---

## Risk Assessment & Mitigation

### HIGH RISK: Type Errors Increase During Normalization

**Likelihood**: Medium
**Impact**: High (blocks completion)

**Mitigation**:
1. Checkpoint every 5 files with incremental commits
2. If errors increase → Revert immediately with `git reset --hard HEAD~1`
3. Re-analyze file, identify actual type issue
4. Fix properly before re-committing

---

### MEDIUM RISK: Build Fails After Mockup Deletion

**Likelihood**: Low
**Impact**: Medium (requires debugging)

**Mitigation**:
1. Run `npm run typecheck` after each deletion
2. Identify broken imports immediately
3. Either restore file or fix imports
4. Document any pre-existing build issues separately

---

### LOW RISK: Sovereignty Violations Introduced

**Likelihood**: Very Low
**Impact**: High (must fix immediately)

**Mitigation**:
1. Run `npm run check:no-supabase` after each phase
2. Never commit Supabase references
3. If violation detected → Remove immediately, re-run check

---

## Completion Criteria

**Module C is complete when ALL of the following are true**:

1. ✅ All React component imports use canonical alias patterns
2. ✅ All design mockups resolved (deleted, refactored, or documented)
3. ✅ All component type references validated against canonical definitions
4. ✅ Total diagnostics within ±20 of baseline (6,424)
5. ✅ Build passes (warnings acceptable, no errors)
6. ✅ Sovereignty check passes (`npm run check:no-supabase`)
7. ✅ All automation scripts committed and working
8. ✅ `PHASE_4_2C_RESULTS.md` updated with Module C completion
9. ✅ Final git tag `phase4.2c-C1-complete` created
10. ✅ `MODULE_C_COMPLETION_SUMMARY.md` created

---

## Quick Reference Commands

```bash
# Pre-flight
git status
git describe --tags  # Should show: phase4.2c-B1-complete
npm run audit:typehealth | tee artifacts/typehealth-phase4.2c-C0-baseline.log
npm run check:no-supabase

# Phase 1: Analysis
npx tsx scripts/analyze-react-imports.ts
cat artifacts/react-import-analysis.json | jq '.summary'

# Phase 2: Normalization
# (Manual file-by-file using Edit tool)
git add . && git commit -m "refactor(types): Normalize React imports in [files] (Phase 4.2C Module C)"
git tag phase4.2c-C1-imports-normalized

# Phase 3: Mockup Resolution
npx tsx scripts/find-design-mockups.ts
cat artifacts/design-mockup-report.json | jq '.mockups'
# (Manual resolution: delete/refactor/document)
git add . && git commit -m "refactor(types): Resolve design mockup conflicts (Phase 4.2C Module C)"
git tag phase4.2c-C1-mockups-resolved

# Phase 4: Component Validation
npx tsx scripts/validate-component-refs.ts
cat artifacts/component-validation-report.json | jq '.conflicts'
# (Manual fix application)
git add . && git commit -m "refactor(types): Fix component type conflicts (Phase 4.2C Module C)"
git tag phase4.2c-C1-refs-validated

# Phase 5: Final Verification
npm run audit:typehealth | tee artifacts/typehealth-phase4.2c-C1.log
npm run build 2>&1 | tee artifacts/build-phase4.2c-C1.log
npm run check:no-supabase
# (Update PHASE_4_2C_RESULTS.md, create completion summary)
git add . && git commit -m "docs(types): Document Phase 4.2C Module C completion"
git tag phase4.2c-C1-complete

# Verification
git tag -l "phase4.2c-*"
git log --oneline -10
```

---

## Next Steps After Completion

Upon successful completion of Module C:

1. **Immediate**: Present completion summary to user
2. **Review**: User confirms metrics and qualitative improvements
3. **Archive**: Tag and document Module C as final checkpoint
4. **Decision Point**: Proceed to either:
   - **Phase 4.2C Final Review** (consolidate all three modules)
   - **Phase 4.2D** (integrate consciousness-biomarkers.ts from alternate session)
   - **Stage 5: Empirical Validation** (begin production readiness testing)

---

## Mission Authority & Constraints

**Authority**:
- ✅ Create automation scripts in `scripts/`
- ✅ Modify React component imports
- ✅ Delete design mockup files (with verification)
- ✅ Refactor component type references
- ✅ Commit incremental progress with descriptive messages
- ✅ Tag checkpoints at each phase completion

**Constraints**:
- ❌ NO new features or component creation
- ❌ NO design system alignment (deferred to future phase)
- ❌ NO Supabase violations (sovereignty enforced)
- ❌ NO functional changes to component logic
- ❌ NO modifications outside React component layer

---

## Historical Context

**Phase 4.2C Journey**:

- **Module A** (COMPLETE): Interface Expansion
  - Added 191 properties to 7 canonical interfaces
  - Established semantic lattice for consciousness computing
  - Tag: `phase4.2c-A1-complete`

- **Module B** (COMPLETE): Path Normalization
  - Achieved 100% import path consistency
  - Normalized to `@/lib/types` barrel exports
  - Fixed 8 import statements across 7 files
  - Tag: `phase4.2c-B1-complete`

- **Module C** (THIS MISSION): Component Cleanup
  - React import normalization
  - Design mockup resolution
  - Component type validation
  - Target: `phase4.2c-C1-complete`

**Strategic Decision**: Hybrid Approach chosen to complete Phase 4.2C cleanly, deferring consciousness-biomarkers integration to Phase 4.2D.

---

## Ready to Execute?

**Pre-flight checklist**:
- [ ] Read full execution plan: `artifacts/PHASE_4_2C_MODULE_C_EXECUTION_PLAN.md`
- [ ] Review launch checklist: `artifacts/MODULE_C_LAUNCH_CHECKLIST.md`
- [ ] Verify git status clean
- [ ] Confirm baseline metrics captured
- [ ] Understand automation script templates
- [ ] Ready to commit ~180 minutes of focused execution

**When ready**: Begin with Pre-Flight Verification phase in the launch checklist.

---

**Mission Brief Prepared By**: Kelly (Claude Code Agent)
**Mission Brief Version**: 1.0
**Generated**: 2025-12-21
**Status**: Ready for Execution

🎯 **Mission Objective**: Complete Phase 4.2C Type System Harmonization by achieving 100% React component import consistency and validating all component type references against canonical definitions.

**Let's bring this home cleanly.** 🟢
