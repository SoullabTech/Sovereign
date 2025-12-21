# Module B Launch Checklist — Path Normalization

**Phase:** 4.2C — Type System Harmonization
**Module:** B — Path Normalization
**Status:** 🟢 Ready to Execute
**Created:** 2025-12-21

---

## Pre-Flight Checklist

- [ ] **Module A Complete:** Tag `phase4.2c-A1-complete` exists
- [ ] **Working Tree Clean:** `git status` shows no uncommitted changes
- [ ] **Baseline Metrics Captured:** `artifacts/typehealth-phase4.2c-A1.log` exists
- [ ] **Execution Plan Reviewed:** Read `PHASE_4_2C_MODULE_B_EXECUTION_PLAN.md`
- [ ] **Scripts Directory Ready:** `scripts/` accessible and writable

---

## Phase 1: Analysis & Planning (30 min)

### 1.1 Create Analysis Scripts

- [ ] Create `scripts/analyze-import-paths.ts`
  - Copy template from execution plan Section 8.1
  - Verify syntax: `npx tsx scripts/analyze-import-paths.ts --help`

- [ ] Create `scripts/find-duplicate-types.ts`
  - Copy template from execution plan Section 8.3
  - Verify syntax: `npx tsx scripts/find-duplicate-types.ts --help`

### 1.2 Run Analysis

- [ ] Execute import path analysis
  ```bash
  npx tsx scripts/analyze-import-paths.ts > artifacts/import-path-analysis.json
  ```

- [ ] Execute duplicate type finder
  ```bash
  npx tsx scripts/find-duplicate-types.ts > artifacts/duplicate-types-report.json
  ```

- [ ] Review `artifacts/import-path-analysis.json`
  - Note total patterns found
  - Identify top 5 highest-occurrence patterns
  - Record in notes section below

- [ ] Review `artifacts/duplicate-types-report.json`
  - Note number of interfaces with duplicates
  - Identify safe-to-remove duplicates vs. intentional variations
  - Record in notes section below

### 1.3 Checkpoint: Analysis Complete

- [ ] Both JSON reports generated successfully
- [ ] Findings reviewed and prioritized
- [ ] Ready to proceed to normalization phase

**Notes:**
```
[Record key findings here]
- Total import patterns: ___
- Top pattern: ___ (occurrences: ___)
- Duplicate interfaces: ___
```

---

## Phase 2: Import Path Normalization (90 min)

### 2.1 Create Normalization Script

- [ ] Create `scripts/normalize-import-paths.ts`
  - Copy template from execution plan Section 8.2
  - Customize NORMALIZATION_RULES based on analysis findings
  - Verify syntax: `npx tsx scripts/normalize-import-paths.ts --help`

### 2.2 Dry-Run Validation

- [ ] Execute dry-run
  ```bash
  npx tsx scripts/normalize-import-paths.ts --dry-run | tee artifacts/normalization-preview.log
  ```

- [ ] Review preview log
  - [ ] Verify transformations look correct
  - [ ] No unexpected file modifications
  - [ ] Estimated file count matches expectations

- [ ] Checkpoint decision: Proceed or refine rules?
  - [ ] ✅ Proceed to execution
  - [ ] ⚠️ Refine rules and re-run dry-run

### 2.3 Execute Normalization

- [ ] Run normalization script
  ```bash
  npx tsx scripts/normalize-import-paths.ts --execute
  ```

- [ ] Verify syntax after transformation
  ```bash
  tsc --noEmit 2>&1 | tee artifacts/typecheck-post-normalization.log
  ```

- [ ] **If syntax errors:**
  - [ ] Review `artifacts/typecheck-post-normalization.log`
  - [ ] Identify problematic files
  - [ ] Fix manually and re-verify
  - [ ] Document fixes in notes

- [ ] **If syntax clean:**
  - [ ] ✅ Proceed to commit

### 2.4 Commit Checkpoint

- [ ] Stage changes
  ```bash
  git add .
  ```

- [ ] Commit with descriptive message
  ```bash
  git commit -m "refactor(imports): Normalize type import paths to @/lib/* pattern

  - Replace relative ../../lib/types paths with @/lib/types
  - Standardize to barrel import pattern
  - Fix .js → .ts extension errors
  - Modified [N] files

  Phase 4.2C Module B — Step 2.4"
  ```

- [ ] Verify commit
  ```bash
  git log --oneline -1
  ```

**Notes:**
```
[Record normalization metrics]
- Files modified: ___
- Syntax errors encountered: ___
- Manual fixes applied: ___
```

---

## Phase 3: Duplicate Type Elimination (60 min)

### 3.1 Review Duplicate Report

- [ ] Open `artifacts/duplicate-types-report.json`
- [ ] For each interface with duplicates:
  - [ ] Verify canonical location is correct
  - [ ] Assess each duplicate (safe to remove vs. intentional variation)
  - [ ] Mark safe-to-remove in checklist below

**Duplicate Assessment:**

- [ ] **ConsciousnessProfile**
  - Canonical: `lib/types/cognitive/ConsciousnessProfile.ts`
  - Duplicates found: ___
  - Safe to remove: [ ] File 1, [ ] File 2, [ ] File 3

- [ ] **ChristianFaithContext**
  - Canonical: `lib/types/spiritual/ChristianFaithContext.ts`
  - Duplicates found: ___
  - Safe to remove: [ ] File 1, [ ] File 2, [ ] File 3

- [ ] **ElementalFramework**
  - Canonical: `lib/types/elemental/ElementalFramework.ts`
  - Duplicates found: ___
  - Safe to remove: [ ] File 1, [ ] File 2, [ ] File 3

- [ ] **Other Interfaces**
  - List: ___
  - Safe to remove: [ ] File 1, [ ] File 2, [ ] File 3

### 3.2 Remove Duplicates (File-by-File)

**For each duplicate:**

- [ ] Open file in editor
- [ ] Locate interface definition
- [ ] Replace with import statement:
  ```typescript
  import type { InterfaceName } from '@/lib/types';
  ```
- [ ] Remove local interface definition
- [ ] Save file
- [ ] Verify syntax:
  ```bash
  tsc --noEmit
  ```
- [ ] If errors, adjust imports and re-verify
- [ ] Move to next duplicate

**Progress Tracker:**
```
[ ] Duplicate 1: ___ (file: ___)
[ ] Duplicate 2: ___ (file: ___)
[ ] Duplicate 3: ___ (file: ___)
[ ] Duplicate 4: ___ (file: ___)
[ ] Duplicate 5: ___ (file: ___)
[Add more as needed]
```

### 3.3 Final Syntax Verification

- [ ] Run full typecheck
  ```bash
  tsc --noEmit
  ```

- [ ] **If errors:**
  - [ ] Review and fix
  - [ ] Re-verify until clean

- [ ] **If clean:**
  - [ ] ✅ Proceed to commit

### 3.4 Commit Checkpoint

- [ ] Stage changes
  ```bash
  git add .
  ```

- [ ] Commit with descriptive message
  ```bash
  git commit -m "refactor(types): Deduplicate local type definitions

  - Remove ConsciousnessProfile duplicates in [locations]
  - Remove ChristianFaithContext duplicates in [locations]
  - Remove ElementalFramework duplicates in [locations]
  - Import canonical definitions from @/lib/types
  - Removed [M] duplicate definitions across [N] files

  Phase 4.2C Module B — Step 3.4"
  ```

- [ ] Verify commit
  ```bash
  git log --oneline -1
  ```

**Notes:**
```
[Record deduplication metrics]
- Duplicates removed: ___
- Files modified: ___
- Import adjustments: ___
```

---

## Phase 4: Verification & Metrics (30 min)

### 4.1 Capture Checkpoint Metrics

- [ ] Run type health audit
  ```bash
  npm run audit:typehealth > artifacts/typehealth-phase4.2c-B1.log
  ```

- [ ] Review output
  - [ ] Total diagnostics: ___
  - [ ] TS2307: ___
  - [ ] TS2304: ___
  - [ ] Compare to Module A baseline (6,424 total)

### 4.2 Update Results Document

- [ ] Run results updater
  ```bash
  npx tsx scripts/update-phase-results.ts B
  ```

- [ ] Verify `artifacts/PHASE_4_2C_RESULTS.md` updated
  - [ ] Module B checkpoint table populated
  - [ ] Delta calculations correct
  - [ ] Target met indicators accurate

### 4.3 Run Integrity Validation

- [ ] Execute integrity checker
  ```bash
  npx tsx scripts/verify-harmonization-integrity.ts --module B --strict
  ```

- [ ] Review validation output:
  - [ ] ✅ Import Path Consistency: 100% using @/lib/* pattern
  - [ ] ✅ Zero Syntax Errors: `tsc --noEmit` clean
  - [ ] ✅ Sovereignty Check: No new Supabase imports
  - [ ] ✅ Module Resolution: All imports resolve correctly
  - [ ] ✅ Barrel Export Coverage: All canonical types accessible

- [ ] **If any checks fail:**
  - [ ] Review failure details
  - [ ] Fix issues
  - [ ] Re-run validation
  - [ ] Repeat until all checks pass

### 4.4 Final Commit & Tag

- [ ] Stage all changes (including updated results doc)
  ```bash
  git add .
  ```

- [ ] Commit with comprehensive message
  ```bash
  git commit -m "feat(types): Phase 4.2C Module B — Path Normalization complete

  Normalized import paths and deduplicated type definitions.

  METRICS
    Total diagnostics: 6,424 → [B1 count] ([Δ%])
    TS2307 (Cannot find module): 266 → [B1] ([Δ%])
    TS2304 (Cannot find name): 1,227 → [B1] ([Δ%])

  ACTIONS
    - Normalized [N] import paths to @/lib/* pattern
    - Removed [M] duplicate type definitions
    - Fixed [K] .js → .ts extension errors

  VALIDATION
    ✅ Zero syntax errors
    ✅ Sovereignty preserved
    ✅ All imports resolve
    ✅ Import path consistency: 100%

  ARTIFACTS
    artifacts/import-path-analysis.json
    artifacts/duplicate-types-report.json
    artifacts/typehealth-phase4.2c-B1.log
    artifacts/PHASE_4_2C_RESULTS.md (updated)

  🤖 Generated with Claude Code
  Co-Authored-By: Claude <noreply@anthropic.com>"
  ```

- [ ] Create tag
  ```bash
  git tag -a phase4.2c-B1-complete -m "Phase 4.2C Module B — Path Normalization complete"
  ```

- [ ] Verify tag created
  ```bash
  git tag | grep phase4.2c-B1-complete
  ```

---

## Post-Completion Verification

### Success Criteria Check

**Quantitative Metrics:**

- [ ] Total diagnostics reduced by ≥200 (target: ≤6,200)
- [ ] TS2307 reduced to ≤150 (baseline: 266)
- [ ] TS2304 reduced to ≤1,050 (baseline: 1,227)

**Qualitative Criteria:**

- [ ] Import consistency: ≥90% using `@/lib/types` barrel pattern
- [ ] Zero duplicate type definitions remain
- [ ] Syntax clean: `tsc --noEmit` passes
- [ ] Sovereignty intact: `npm run check:no-supabase` passes
- [ ] All imports resolve correctly

**Strategic Outcomes:**

- [ ] Expanded interfaces (Module A) now accessible throughout codebase
- [ ] Single source of truth for all type definitions established
- [ ] Codebase ready for Module C component cleanup

### Archive & Documentation

- [ ] Results document complete and accurate
- [ ] All artifacts saved in `artifacts/` directory
- [ ] Execution notes recorded in this checklist
- [ ] Ready for Module C initialization

---

## Rollback Instructions (If Needed)

**If Module B introduces regressions:**

```bash
# View commits since Module A
git log --oneline phase4.2c-A1-complete..HEAD

# Revert to Module A completion
git reset --hard phase4.2c-A1-complete

# Review what went wrong
git diff phase4.2c-A1-complete phase4.2c-B1-complete

# Fix automation scripts and re-execute
```

---

## Module B Completion Sign-Off

- [ ] **All phases complete**
- [ ] **All verification checks passed**
- [ ] **All commits and tags created**
- [ ] **Results document updated**
- [ ] **Ready for Module C**

**Completed by:** _______________
**Date:** _______________
**Tag:** `phase4.2c-B1-complete`

---

**END OF MODULE B LAUNCH CHECKLIST**
