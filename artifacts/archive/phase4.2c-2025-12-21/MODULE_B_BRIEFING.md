# Module B Operational Briefing — Path Normalization

**For:** Kelly Soullab / Execution Agent
**Phase:** 4.2C — Type System Harmonization
**Module:** B — Path Normalization
**Status:** 🟢 Ready to Execute
**Duration:** 3–4 hours

---

## Mission Summary

**What:** Connect Module A's expanded semantic interfaces to all consuming modules by normalizing import paths and eliminating duplicate type definitions.

**Why:** Module A created comprehensive type definitions, but they're not yet consumed throughout the codebase. Module B establishes the "plumbing" to make those types accessible everywhere.

**Target Impact:** −200 to −300 diagnostics (≈ 4–5% reduction)

---

## Quick Start

### If you want to dive straight in:

```bash
# 1. Verify you're on the right tag
git describe --tags
# Should show: phase4.2c-A1-complete

# 2. Create and run analysis scripts
npx tsx scripts/analyze-import-paths.ts
npx tsx scripts/find-duplicate-types.ts

# 3. Review findings
cat artifacts/import-path-analysis.json
cat artifacts/duplicate-types-report.json

# 4. Create and run normalization (dry-run first!)
npx tsx scripts/normalize-import-paths.ts --dry-run
npx tsx scripts/normalize-import-paths.ts --execute

# 5. Manually deduplicate types (file-by-file)
# Review duplicate-types-report.json and remove duplicates

# 6. Capture metrics and validate
npm run audit:typehealth > artifacts/typehealth-phase4.2c-B1.log
npx tsx scripts/verify-harmonization-integrity.ts --module B --strict

# 7. Commit and tag
git commit -m "feat(types): Phase 4.2C Module B complete"
git tag -a phase4.2c-B1-complete -m "Module B complete"
```

---

## The Three Big Wins

### Win 1: Import Path Consistency

**Problem:**
```typescript
// File A
import { ConsciousnessProfile } from '../../lib/types/cognitive/ConsciousnessProfile';

// File B
import type { ConsciousnessProfile } from '../types/cognitive/ConsciousnessProfile';

// File C
import { ConsciousnessProfile } from '@/lib/types/cognitive/ConsciousnessProfile';
```

**Solution:**
```typescript
// All files
import type { ConsciousnessProfile } from '@/lib/types';
```

**Impact:** Eliminates TS2307 "Cannot find module" errors caused by brittle relative paths.

---

### Win 2: Single Source of Truth

**Problem:**
```typescript
// lib/types/cognitive/ConsciousnessProfile.ts (canonical)
export interface ConsciousnessProfile {
  depth?: number;
  coherence?: number;
  // ... 67 more properties
}

// app/api/consciousness/types.ts (duplicate!)
export interface ConsciousnessProfile {
  depth?: number;
  coherence?: number;
  // ... only 12 properties (incomplete!)
}
```

**Solution:**
```typescript
// app/api/consciousness/types.ts
import type { ConsciousnessProfile } from '@/lib/types';
// Interface definition removed, imports canonical version
```

**Impact:** Eliminates TS2304 "Cannot find name" and TS2339 "Property does not exist" errors caused by incomplete local definitions.

---

### Win 3: Type Propagation

**Before Module B:** Module A's 140 new properties sit unused because consuming modules don't know about them.

**After Module B:** All 140 properties accessible throughout codebase via consistent imports.

**Impact:** Unlocks the value created in Module A, sets foundation for Module C component cleanup.

---

## The Four-Phase Workflow

### Phase 1: Analysis (30 min)

**What you're doing:** Understanding the current state of import chaos.

**Key artifacts:**
- `import-path-analysis.json` — Every import pattern in the codebase
- `duplicate-types-report.json` — Every interface defined multiple times

**Success criteria:**
- [ ] Know how many files need path normalization
- [ ] Know which interfaces have duplicates and where
- [ ] Have a prioritized plan for deduplication

---

### Phase 2: Normalization (90 min)

**What you're doing:** Automated refactoring of import paths to use `@/lib/types` barrel pattern.

**Key script:** `normalize-import-paths.ts`

**Safety protocol:**
1. Always dry-run first (`--dry-run`)
2. Review preview log carefully
3. Execute only after verification
4. Run `tsc --noEmit` after execution
5. Commit checkpoint immediately

**Success criteria:**
- [ ] 100% of type imports use `@/lib/types` barrel pattern
- [ ] Zero syntax errors after normalization
- [ ] Checkpoint committed

---

### Phase 3: Deduplication (60 min)

**What you're doing:** Manually removing duplicate type definitions file-by-file.

**Why manual?** This requires human judgment to distinguish intentional variations from true duplicates.

**Pattern:**
```typescript
// 1. Open file with duplicate
// 2. Remove interface definition
export interface ConsciousnessProfile { ... } // DELETE THIS

// 3. Add import statement
import type { ConsciousnessProfile } from '@/lib/types'; // ADD THIS

// 4. Verify syntax
tsc --noEmit

// 5. Move to next file
```

**Success criteria:**
- [ ] Zero duplicate definitions remain
- [ ] All files still compile
- [ ] Checkpoint committed

---

### Phase 4: Verification (30 min)

**What you're doing:** Measuring impact and validating integrity.

**Key checks:**
1. **Metrics:** Run `npm run audit:typehealth` → Compare to Module A baseline
2. **Results:** Update `PHASE_4_2C_RESULTS.md` with Module B checkpoint
3. **Integrity:** Run `verify-harmonization-integrity.ts --module B --strict`

**Success criteria:**
- [ ] Total diagnostics reduced by ≥200
- [ ] TS2307 ≤150 (baseline: 266)
- [ ] TS2304 ≤1,050 (baseline: 1,227)
- [ ] All integrity checks pass
- [ ] Tagged as `phase4.2c-B1-complete`

---

## Common Pitfalls & How to Avoid Them

### Pitfall 1: Breaking Imports During Normalization

**Risk:** Automated path replacement breaks valid imports.

**Prevention:**
- Always dry-run first
- Review preview log carefully
- Test syntax after execution
- Commit incrementally (normalization separate from deduplication)

**Recovery:** Rollback to previous commit, refine rules, re-execute.

---

### Pitfall 2: Removing Intentional Type Variations

**Risk:** Not all duplicate-named interfaces are true duplicates. Some are intentional local variations.

**Prevention:**
- Review each duplicate manually before removal
- Check if local version has different properties
- Preserve if it's a legitimate specialization

**Recovery:** Restore from git history, re-assess.

---

### Pitfall 3: Missing Barrel Export Coverage

**Risk:** Normalizing to `@/lib/types` assumes all types are exported from barrel. If they're not, imports break.

**Prevention:**
- Module A already updated barrel exports
- Verify `lib/types/index.ts` includes all canonical interfaces
- Test import in one file before mass normalization

**Recovery:** Update barrel export, re-run normalization.

---

## Scripts You'll Create

### 1. `analyze-import-paths.ts`

**Purpose:** Find all import patterns referencing `lib/types`.

**Input:** Codebase (via grep)

**Output:** `artifacts/import-path-analysis.json`

**Template:** See execution plan Section 8.1

**Usage:**
```bash
npx tsx scripts/analyze-import-paths.ts
cat artifacts/import-path-analysis.json
```

---

### 2. `find-duplicate-types.ts`

**Purpose:** Identify interfaces defined in multiple locations.

**Input:** Codebase (via grep for `interface <name>`)

**Output:** `artifacts/duplicate-types-report.json`

**Template:** See execution plan Section 8.3

**Usage:**
```bash
npx tsx scripts/find-duplicate-types.ts
cat artifacts/duplicate-types-report.json
```

---

### 3. `normalize-import-paths.ts`

**Purpose:** Automated refactoring of import paths.

**Input:** All `.ts` and `.tsx` files

**Output:** Modified files (in-place)

**Template:** See execution plan Section 8.2

**Modes:**
- `--dry-run`: Preview changes without modifying
- `--execute`: Apply transformations

**Usage:**
```bash
# Always dry-run first!
npx tsx scripts/normalize-import-paths.ts --dry-run | tee artifacts/normalization-preview.log

# Review preview, then execute
npx tsx scripts/normalize-import-paths.ts --execute
```

---

## Validation Commands

```bash
# Syntax check
tsc --noEmit

# Sovereignty check
npm run check:no-supabase

# Type health audit
npm run audit:typehealth > artifacts/typehealth-phase4.2c-B1.log

# Integrity validation
npx tsx scripts/verify-harmonization-integrity.ts --module B --strict

# Working tree status
git status
```

---

## Success Indicators

### Quantitative

| Metric | Baseline (Post-A1) | Target (Post-B1) | Success? |
|:--|--:|--:|:--:|
| Total Diagnostics | 6,424 | ≤6,200 | ☐ |
| TS2307 (Cannot find module) | 266 | ≤150 | ☐ |
| TS2304 (Cannot find name) | 1,227 | ≤1,050 | ☐ |

### Qualitative

- [ ] ≥90% of type imports use `@/lib/types` barrel pattern
- [ ] Zero duplicate type definitions
- [ ] `tsc --noEmit` produces zero errors
- [ ] `npm run check:no-supabase` passes
- [ ] All imports resolve correctly

### Strategic

- [ ] Module A interfaces now accessible throughout codebase
- [ ] Single source of truth for all types established
- [ ] Foundation laid for Module C component cleanup

---

## Time Budget

| Phase | Estimated | Actual | Notes |
|:--|--:|--:|:--|
| 1. Analysis | 30 min | ___ | |
| 2. Normalization | 90 min | ___ | |
| 3. Deduplication | 60 min | ___ | |
| 4. Verification | 30 min | ___ | |
| **Total** | **210 min (3.5 hrs)** | ___ | |

---

## Rollback Plan

**If things go wrong:**

```bash
# View recent commits
git log --oneline phase4.2c-A1-complete..HEAD

# Revert to Module A completion
git reset --hard phase4.2c-A1-complete

# Review what went wrong
git diff phase4.2c-A1-complete <problematic-commit>

# Fix automation scripts, re-execute
```

**Safe rollback points:**
- `phase4.2c-A1-complete` — Module A baseline
- After Phase 2 normalization commit
- After Phase 3 deduplication commit
- `phase4.2c-B1-complete` — Module B completion

---

## What Comes Next

**Module C — Component Cleanup**

**Objective:** Resolve design mockup component issues and React import normalization

**Target:** −100 ± 20 diagnostics

**Key actions:**
- Extract valid reusable components from design mockups
- Exclude non-functional mockup files from typecheck
- Normalize React imports (useState, useEffect, etc.)
- Clean up non-existent component references

**Estimated effort:** 2–3 hours

---

## Module B Completion Criteria

Before tagging `phase4.2c-B1-complete`, verify:

- [ ] All import paths normalized
- [ ] All duplicates removed
- [ ] Checkpoint metrics captured
- [ ] Results document updated
- [ ] Integrity validation passed
- [ ] Committed with comprehensive message
- [ ] Tagged successfully

**Then:** Initialize Module C launch package or pause for archival.

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│ MODULE B — PATH NORMALIZATION                           │
├─────────────────────────────────────────────────────────┤
│ Goal: Connect Module A types to consuming modules       │
│ Target: −200 to −300 diagnostics (≈ 4–5%)              │
│ Duration: 3–4 hours                                     │
├─────────────────────────────────────────────────────────┤
│ PHASE 1: Analysis (30 min)                             │
│   • analyze-import-paths.ts                            │
│   • find-duplicate-types.ts                            │
│                                                         │
│ PHASE 2: Normalization (90 min)                        │
│   • normalize-import-paths.ts --dry-run                │
│   • normalize-import-paths.ts --execute                │
│   • tsc --noEmit (verify)                              │
│   • git commit (checkpoint)                            │
│                                                         │
│ PHASE 3: Deduplication (60 min)                        │
│   • Manual file-by-file removal                        │
│   • Add imports from @/lib/types                       │
│   • tsc --noEmit (verify each)                         │
│   • git commit (checkpoint)                            │
│                                                         │
│ PHASE 4: Verification (30 min)                         │
│   • npm run audit:typehealth                           │
│   • update-phase-results.ts B                          │
│   • verify-harmonization-integrity.ts --module B       │
│   • git tag phase4.2c-B1-complete                      │
├─────────────────────────────────────────────────────────┤
│ SUCCESS CRITERIA                                        │
│   ✓ Total diagnostics ≤6,200 (−200+)                  │
│   ✓ TS2307 ≤150 (−116+)                                │
│   ✓ TS2304 ≤1,050 (−177+)                              │
│   ✓ Zero duplicates                                    │
│   ✓ Zero syntax errors                                 │
│   ✓ 100% import consistency                            │
└─────────────────────────────────────────────────────────┘
```

---

**END OF MODULE B BRIEFING**
