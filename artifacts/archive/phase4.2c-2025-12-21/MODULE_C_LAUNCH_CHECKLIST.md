# Phase 4.2C Module C – Component Cleanup Launch Checklist

**Objective**: Normalize React component imports, resolve design mockup conflicts, and verify all component references use canonical type definitions from Phase 4.2C Modules A & B.

**Scope**: React Component Cleanup & Prop-Type Normalization (Design System Alignment deferred to future phase)

**Baseline**: Phase 4.2C Module B Complete (6,424 diagnostics, 100% import path consistency)

**Duration**: ~180 minutes (~3 hours)

---

## Pre-Flight Verification (10 min)

- [ ] **Verify git status clean**
  ```bash
  git status
  ```
  Expected: `nothing to commit, working tree clean`

- [ ] **Confirm current tag**
  ```bash
  git describe --tags
  ```
  Expected: `phase4.2c-B1-complete`

- [ ] **Verify baseline diagnostics**
  ```bash
  npm run audit:typehealth | tee artifacts/typehealth-phase4.2c-C0-baseline.log
  ```
  Expected: `Total errors: 6424` (or within ±20 of Module B endpoint)

- [ ] **Verify sovereignty compliance**
  ```bash
  npm run check:no-supabase
  ```
  Expected: `✅ No Supabase violations found`

- [ ] **Read execution plan**
  ```bash
  cat artifacts/PHASE_4_2C_MODULE_C_EXECUTION_PLAN.md
  ```
  Expected: 550+ line detailed workflow

---

## Phase 1: React Import Analysis (30 min)

### 1.1 Create Automation Script

- [ ] **Create `scripts/analyze-react-imports.ts`**
  ```bash
  npx tsx scripts/analyze-react-imports.ts
  ```
  Expected output:
  ```
  🔍 Analyzing React component imports...

  📊 IMPORT PATTERN SUMMARY
  ════════════════════════════════════════════════════════════
  Total patterns: ~X
  Total occurrences: ~Y

  Categories:
    relative-deep:     N (Z%)
    relative-shallow:  N (Z%)
    alias-correct:     N (Z%)
    alias-incorrect:   N (Z%)
    other:             N (Z%)

  📁 Report saved to: artifacts/react-import-analysis.json
  ```

- [ ] **Review analysis report**
  ```bash
  cat artifacts/react-import-analysis.json | jq '.summary'
  ```
  Expected: Clear categorization of all React component import patterns

### 1.2 Identify Normalization Targets

- [ ] **Extract files needing normalization**
  ```bash
  cat artifacts/react-import-analysis.json | jq -r '.patterns[] | select(.category != "alias-correct") | .occurrences[].file' | sort -u
  ```
  Expected: 5-20 files with non-canonical React imports

- [ ] **Estimate normalization effort**
  - Count unique files needing changes
  - Estimate ~5 min per file for manual review
  - Document in `artifacts/PHASE_4_2C_RESULTS.md` Section 5.1

---

## Phase 2: React Import Normalization (60 min)

### 2.1 Normalize Component Imports

For each file identified in Phase 1.2:

- [ ] **Read the file**
  ```bash
  # Example
  cat components/SomeComponent.tsx
  ```

- [ ] **Identify current import pattern**
  - Deep relative? (`../../components/...`)
  - Shallow relative? (`../ui/...`)
  - Barrel import from wrong location? (`@/app/components/...`)

- [ ] **Determine canonical path**
  - For `components/*` → `@/components`
  - For `lib/ui/*` → `@/lib/ui`
  - For `app/(authenticated)/_components/*` → Use local relative imports within app directory

- [ ] **Apply normalization using Edit tool**
  ```typescript
  // BEFORE
  import { MaiaCard } from '../../components/ui/MaiaCard';

  // AFTER
  import { MaiaCard } from '@/components/ui/MaiaCard';
  ```

- [ ] **Verify no syntax errors**
  ```bash
  npx tsc --noEmit components/SomeComponent.tsx
  ```

### 2.2 Checkpoint After Every 5 Files

- [ ] **Commit incremental progress**
  ```bash
  git add .
  git commit -m "refactor(types): Normalize React imports in [component names] (Phase 4.2C Module C step 2.1)"
  ```

- [ ] **Run type health check**
  ```bash
  npm run audit:typehealth | head -20
  ```
  Expected: No increase in total errors

### 2.3 Complete Normalization

- [ ] **Verify all files processed**
  ```bash
  npx tsx scripts/analyze-react-imports.ts
  ```
  Expected: `alias-correct: 100%` or very close

- [ ] **Commit final normalization**
  ```bash
  git add .
  git commit -m "refactor(types): Complete React component import normalization (Phase 4.2C Module C)"
  ```

- [ ] **Tag checkpoint**
  ```bash
  git tag phase4.2c-C1-imports-normalized
  ```

---

## Phase 3: Design Mockup Resolution (40 min)

### 3.1 Detect Design Mockups

- [ ] **Create `scripts/find-design-mockups.ts`**
  ```bash
  npx tsx scripts/find-design-mockups.ts
  ```
  Expected output:
  ```
  🔍 Scanning for design mockup conflicts...

  📊 MOCKUP DETECTION SUMMARY
  ════════════════════════════════════════════════════════════
  Total mockup files found: ~X
  Files with "DESIGN_ONLY" flags: ~Y
  Files with placeholder data: ~Z

  📁 Full report saved to: artifacts/design-mockup-report.json
  ```

- [ ] **Review mockup report**
  ```bash
  cat artifacts/design-mockup-report.json | jq '.mockups[] | {file, reason}'
  ```

### 3.2 Resolve Mockup Conflicts

For each mockup file identified:

- [ ] **Determine resolution strategy**
  - **Delete** if purely visual demo with no production use
  - **Refactor** if contains reusable component logic
  - **Document** if intentionally deferred

- [ ] **Apply resolution**
  - Use git rm for deletions
  - Use Edit tool for refactoring
  - Add TODO comments for documented deferrals

- [ ] **Verify no broken imports**
  ```bash
  npm run typecheck 2>&1 | grep -i "cannot find module"
  ```
  Expected: No new "Cannot find module" errors

### 3.3 Checkpoint Mockup Resolution

- [ ] **Commit mockup cleanup**
  ```bash
  git add .
  git commit -m "refactor(types): Resolve design mockup conflicts (Phase 4.2C Module C step 3.2)"
  ```

- [ ] **Tag checkpoint**
  ```bash
  git tag phase4.2c-C1-mockups-resolved
  ```

---

## Phase 4: Component Reference Validation (30 min)

### 4.1 Validate Component References

- [ ] **Create `scripts/validate-component-refs.ts`**
  ```bash
  npx tsx scripts/validate-component-refs.ts
  ```
  Expected output:
  ```
  🔍 Validating component type references...

  📊 VALIDATION SUMMARY
  ════════════════════════════════════════════════════════════
  Total components analyzed: ~X
  Components using canonical types: ~Y (Z%)
  Components with local type definitions: ~N
  Components with type conflicts: ~M

  📁 Full report saved to: artifacts/component-validation-report.json
  ```

- [ ] **Review validation report**
  ```bash
  cat artifacts/component-validation-report.json | jq '.conflicts'
  ```

### 4.2 Fix Component Type Conflicts

For each conflict identified:

- [ ] **Read component file**
- [ ] **Identify conflicting type**
  - Is it a duplicate of a canonical type?
  - Is it a local variation that should be renamed?
  - Is it a legitimate component-specific type?

- [ ] **Apply fix**
  - Replace with import from `@/lib/types` if canonical exists
  - Rename if it's an intentional variation
  - Keep if legitimately component-specific

- [ ] **Verify resolution**
  ```bash
  npx tsc --noEmit path/to/component.tsx
  ```

### 4.3 Checkpoint Component Validation

- [ ] **Commit validation fixes**
  ```bash
  git add .
  git commit -m "refactor(types): Fix component type conflicts (Phase 4.2C Module C step 4.2)"
  ```

- [ ] **Tag checkpoint**
  ```bash
  git tag phase4.2c-C1-refs-validated
  ```

---

## Phase 5: Final Verification & Documentation (10 min)

### 5.1 Capture Final Metrics

- [ ] **Run final type health audit**
  ```bash
  npm run audit:typehealth | tee artifacts/typehealth-phase4.2c-C1.log
  ```

- [ ] **Extract key metrics**
  ```bash
  cat artifacts/typehealth-phase4.2c-C1.log | grep "Total errors:"
  cat artifacts/typehealth-phase4.2c-C1.log | grep "Files affected:"
  cat artifacts/typehealth-phase4.2c-C1.log | grep "TS2339"
  cat artifacts/typehealth-phase4.2c-C1.log | grep "TS2304"
  cat artifacts/typehealth-phase4.2c-C1.log | grep "TS2322"
  ```

- [ ] **Calculate delta from baseline**
  ```bash
  # Baseline (C0): 6424 errors
  # Final (C1): [record actual value]
  # Delta: [calculate difference]
  ```

### 5.2 Update Results Document

- [ ] **Add Module C completion section to `artifacts/PHASE_4_2C_RESULTS.md`**
  - Section 5.1: Actions Completed
  - Section 5.2: Checkpoint Metrics
  - Section 5.3: Component Changes Summary
  - Section 5.4: Commit History

- [ ] **Document qualitative improvements**
  - React import consistency achieved
  - Design mockups resolved
  - Component type references validated

### 5.3 Final Commit & Tag

- [ ] **Commit results update**
  ```bash
  git add artifacts/PHASE_4_2C_RESULTS.md
  git commit -m "docs(types): Document Phase 4.2C Module C completion

📊 Module C – Component Cleanup Complete

Import Normalization:
- [X] files normalized to canonical @/components paths
- [Y] React component imports updated
- Achieved [Z]% import consistency

Design Mockup Resolution:
- [N] mockup files identified
- [M] files deleted/refactored
- Zero design conflicts remaining

Component Validation:
- [P] components validated
- [Q] type conflicts resolved
- All components reference canonical types

Checkpoint Metrics:
- Total diagnostics: 6424 → [actual final count]
- TS2339: [baseline] → [final]
- TS2304: [baseline] → [final]
- Files affected: 1042 → [final]

Tags:
- phase4.2c-C1-imports-normalized
- phase4.2c-C1-mockups-resolved
- phase4.2c-C1-refs-validated
- phase4.2c-C1-complete (this commit)

🟢 Ready for Phase 4.2C Final Review
"
  ```

- [ ] **Tag final completion**
  ```bash
  git tag phase4.2c-C1-complete
  ```

- [ ] **Verify tag history**
  ```bash
  git tag -l "phase4.2c-*"
  ```
  Expected:
  ```
  phase4.2c-A1-complete
  phase4.2c-B1-complete
  phase4.2c-C1-imports-normalized
  phase4.2c-C1-mockups-resolved
  phase4.2c-C1-refs-validated
  phase4.2c-C1-complete
  ```

---

## Verification & Handoff (10 min)

### Final Checks

- [ ] **Verify sovereignty compliance**
  ```bash
  npm run check:no-supabase
  ```
  Expected: `✅ No Supabase violations found`

- [ ] **Verify build passes**
  ```bash
  npm run build 2>&1 | tee artifacts/build-phase4.2c-C1.log
  ```
  Expected: Build succeeds (warnings acceptable, no errors)

- [ ] **Verify all automation scripts committed**
  ```bash
  git ls-files scripts/ | grep -E "(analyze-react-imports|find-design-mockups|validate-component-refs)"
  ```
  Expected: All three scripts present

- [ ] **Create completion summary**
  ```bash
  cat > artifacts/MODULE_C_COMPLETION_SUMMARY.md <<'EOF'
  # Phase 4.2C Module C – Component Cleanup Completion Summary

  **Status**: ✅ Complete
  **Duration**: [actual time] min
  **Final Metrics**: [from artifacts/typehealth-phase4.2c-C1.log]

  ## Actions Completed

  1. React Import Normalization: [X files, Y imports]
  2. Design Mockup Resolution: [N files resolved]
  3. Component Reference Validation: [P components validated]

  ## Quantitative Impact

  - Total diagnostics: 6424 → [final]
  - TS2339 (Property errors): [baseline] → [final]
  - TS2304 (Name errors): [baseline] → [final]
  - Files affected: 1042 → [final]

  ## Qualitative Impact

  - ✅ 100% React component import consistency
  - ✅ Zero design mockup conflicts
  - ✅ All components reference canonical types
  - ✅ Clean separation between production & design code

  ## Next Steps

  → Phase 4.2C Final Review
  → Phase 4.2D (consciousness-biomarkers.ts integration) [deferred]
  → Stage 5: Empirical Validation [ready when approved]
  EOF
  ```

---

## Risk Mitigation

### If Type Errors Increase

1. **Stop immediately** and review the last file changed
2. **Revert the last commit**:
   ```bash
   git reset --hard HEAD~1
   ```
3. **Re-read the file** and identify the actual type issue
4. **Fix properly** before re-committing

### If Build Fails

1. **Check the build log** for specific errors:
   ```bash
   cat artifacts/build-phase4.2c-C1.log | grep -A 5 "error"
   ```
2. **Identify if it's a new error** or pre-existing
3. **If new**: Revert the commit that introduced it
4. **If pre-existing**: Document in `PHASE_4_2C_RESULTS.md` Section 5.5 "Known Issues"

### If Sovereignty Check Fails

1. **Identify the violation**:
   ```bash
   npm run check:no-supabase 2>&1 | grep "Found"
   ```
2. **Remove the Supabase reference** immediately
3. **Re-run check** to verify
4. **Never commit** Supabase violations

---

## Success Criteria

✅ **Module C is complete when**:

1. All React component imports use canonical `@/components` or `@/lib/ui` paths
2. All design mockups are resolved (deleted, refactored, or documented)
3. All component type references validated against canonical definitions
4. Total diagnostics decreased or remained stable (±20 tolerance)
5. Build passes (warnings acceptable)
6. Sovereignty check passes
7. All automation scripts committed and working
8. `PHASE_4_2C_RESULTS.md` updated with Module C completion
9. Final git tag `phase4.2c-C1-complete` created

**Estimated Total Time**: 180 minutes (~3 hours)

**Actual Time**: ________ minutes (record at completion)

---

**Ready to execute Module C? Confirm pre-flight checks pass, then begin Phase 1.**
