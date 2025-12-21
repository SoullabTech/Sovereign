# Phase 4.2C Module B — Path Normalization • EXECUTION PLAN

**Module:** B — Path Normalization
**Phase:** 4.2C — Type System Harmonization
**Status:** 🟢 Ready to Execute
**Created:** 2025-12-21
**Prerequisite:** Module A Complete (`phase4.2c-A1-complete`)

---

## 1  Module B Objective

**Goal:** Connect the expanded semantic interfaces (Module A) to all consuming modules by normalizing import paths, deduplicating local type definitions, and refactoring to canonical barrel exports.

**Target Impact:** −200 to −300 diagnostics (≈ 4–5% reduction)

**Primary Error Codes Addressed:**
- TS2307 (Cannot find module): 266 → ≤150 (−116 target)
- TS2304 (Cannot find name): 1,227 → ≤1,050 (−177 target)
- Indirect reduction in TS2339 through better type propagation

**Effort Estimate:** 3–4 hours

---

## 2  Current State (Post-Module A)

**Baseline Metrics:**
```
Total diagnostics: 6,424
TS2339: 2,186 (34.0%)
TS2304: 1,227 (19.1%)
TS2307: 266 (4.1%)
TS2322: 564 (8.8%)
```

**Module A Achievements:**
- ✅ ConsciousnessProfile: 69 properties (+51)
- ✅ ChristianFaithContext: 60 properties (+47)
- ✅ ElementalFramework: 53 properties (+42)
- ✅ 4 generated interfaces (SystemContext, WisdomOracleContext, AstrologyContext, ReflectionContext)
- ✅ All barrel exports updated

**Current Tag:** `phase4.2c-A1-complete`

---

## 3  Module B Scope

### 3.1  In-Scope Actions

1. **Import Path Normalization**
   - Replace relative `../../lib/types/...` with `@/lib/types/...`
   - Replace `../types/...` with `@/lib/types/...`
   - Standardize to barrel import pattern (`@/lib/types` instead of `@/lib/types/cognitive/ConsciousnessProfile`)

2. **Type Source Consolidation**
   - Identify locally-defined types that duplicate canonical interfaces
   - Remove duplicates and import from `@/lib/types` instead
   - Focus on ConsciousnessProfile, ChristianFaithContext, ElementalFramework duplicates

3. **File Extension Corrections**
   - Fix incorrect `.js` extensions in imports (should be `.ts`)
   - Verify all module resolution paths

4. **TSConfig Verification**
   - Confirm `tsconfig.json` paths configuration supports `@/lib/*` aliases
   - Ensure all consuming modules inherit correct path mappings

### 3.2  Out-of-Scope (Deferred)

- Component design mockup cleanup (Module C)
- Supabase migration (Phase 5)
- Runtime validation (Phase 5)
- New interface creation (already done in Module A)

---

## 4  Automation Stack

### 4.1  Pre-Execution Analysis

**Script:** `scripts/analyze-import-paths.ts` (to be created)

**Purpose:** Identify all import path patterns that need normalization

**Output:** `artifacts/import-path-analysis.json`

**Sample output structure:**
```json
{
  "patterns": [
    {
      "pattern": "../../lib/types/cognitive/ConsciousnessProfile",
      "occurrences": 47,
      "files": ["app/api/consciousness/route.ts", ...]
    },
    {
      "pattern": "../types/spiritual/ChristianFaithContext",
      "occurrences": 23,
      "files": ["lib/services/faith-integration.ts", ...]
    }
  ],
  "recommendations": [
    {
      "from": "../../lib/types/cognitive/ConsciousnessProfile",
      "to": "@/lib/types",
      "named_import": "ConsciousnessProfile"
    }
  ]
}
```

### 4.2  Automated Refactoring

**Script:** `scripts/normalize-import-paths.ts` (to be created)

**Modes:**
- `--dry-run`: Show what would change without modifying files
- `--execute`: Apply all transformations
- `--pattern <regex>`: Target specific import patterns only

**Safety Features:**
- Backup files before transformation
- Syntax validation after each file change
- Rollback capability if errors introduced

### 4.3  Duplicate Detection

**Script:** `scripts/find-duplicate-types.ts` (to be created)

**Purpose:** Identify local type definitions that duplicate canonical interfaces

**Output:** `artifacts/duplicate-types-report.json`

**Sample output:**
```json
{
  "duplicates": [
    {
      "canonical": "lib/types/cognitive/ConsciousnessProfile.ts",
      "duplicates": [
        {
          "file": "app/api/consciousness/types.ts",
          "lines": "15-47",
          "properties_overlap": 12,
          "recommendation": "Remove and import from @/lib/types"
        }
      ]
    }
  ]
}
```

### 4.4  Verification & Metrics

**Checkpoint Script:** `scripts/update-phase-results.ts B`

**Actions:**
- Run `npm run audit:typehealth > artifacts/typehealth-phase4.2c-B1.log`
- Calculate delta from Module A checkpoint
- Update `artifacts/PHASE_4_2C_RESULTS.md` Module B section
- Validate target metrics achieved

**Integrity Validation:** `scripts/verify-harmonization-integrity.ts --module B --strict`

**Checks:**
- No broken imports after normalization
- Zero syntax errors (`tsc --noEmit`)
- No new Supabase imports (`npm run check:no-supabase`)
- Import path consistency (all use `@/lib/*` pattern)

---

## 5  Execution Workflow

### Phase 1: Analysis & Planning (30 min)

**Step 1.1:** Create analysis scripts
```bash
# Create import path analyzer
touch scripts/analyze-import-paths.ts

# Create duplicate type finder
touch scripts/find-duplicate-types.ts
```

**Step 1.2:** Run analysis
```bash
# Analyze import patterns
npx tsx scripts/analyze-import-paths.ts > artifacts/import-path-analysis.json

# Find duplicate type definitions
npx tsx scripts/find-duplicate-types.ts > artifacts/duplicate-types-report.json
```

**Step 1.3:** Review findings and prioritize
- Identify highest-impact import patterns (most occurrences)
- Categorize duplicates by severity
- Create refactoring plan

---

### Phase 2: Import Path Normalization (90 min)

**Step 2.1:** Create normalization script
```bash
touch scripts/normalize-import-paths.ts
```

**Step 2.2:** Dry-run validation
```bash
# Preview changes without applying
npx tsx scripts/normalize-import-paths.ts --dry-run | tee artifacts/normalization-preview.log

# Manually review preview
```

**Step 2.3:** Execute normalization
```bash
# Apply transformations
npx tsx scripts/normalize-import-paths.ts --execute

# Verify syntax
tsc --noEmit

# If errors, review and fix manually
```

**Step 2.4:** Commit checkpoint
```bash
git add .
git commit -m "refactor(imports): Normalize type import paths to @/lib/* pattern

- Replace relative ../../lib/types paths with @/lib/types
- Standardize to barrel import pattern
- Fix .js → .ts extension errors

Phase 4.2C Module B — Step 2.4"
```

---

### Phase 3: Duplicate Type Elimination (60 min)

**Step 3.1:** Review duplicate report
```bash
# Examine artifacts/duplicate-types-report.json
# Identify safe-to-remove duplicates
```

**Step 3.2:** Remove duplicates manually (file-by-file)
```typescript
// BEFORE (app/api/consciousness/types.ts):
export interface ConsciousnessProfile {
  depth?: number;
  coherence?: number;
  // ... 12 more properties
}

// AFTER:
import type { ConsciousnessProfile } from '@/lib/types';
// (interface definition removed)
```

**Step 3.3:** Verify after each removal
```bash
# After each file change
tsc --noEmit

# If errors, adjust imports
```

**Step 3.4:** Commit checkpoint
```bash
git add .
git commit -m "refactor(types): Deduplicate local type definitions

- Remove ConsciousnessProfile duplicates in app/api/*
- Remove ChristianFaithContext duplicates in lib/services/*
- Import canonical definitions from @/lib/types

Phase 4.2C Module B — Step 3.4"
```

---

### Phase 4: Verification & Metrics (30 min)

**Step 4.1:** Capture checkpoint metrics
```bash
npm run audit:typehealth > artifacts/typehealth-phase4.2c-B1.log
```

**Step 4.2:** Update results document
```bash
npx tsx scripts/update-phase-results.ts B
```

**Step 4.3:** Run integrity validation
```bash
npx tsx scripts/verify-harmonization-integrity.ts --module B --strict
```

**Expected validation output:**
```
✅ Import Path Consistency: 100% using @/lib/* pattern
✅ Zero Syntax Errors: tsc --noEmit clean
✅ Sovereignty Check: No new Supabase imports
✅ Module Resolution: All imports resolve correctly
✅ Barrel Export Coverage: All canonical types accessible
```

**Step 4.4:** Final commit & tag
```bash
git add .
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

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

git tag -a phase4.2c-B1-complete -m "Phase 4.2C Module B — Path Normalization complete"
```

---

## 6  Success Criteria

### 6.1  Quantitative Metrics

| Metric | Post-A1 | Target Post-B1 | Success Threshold |
|:--|--:|--:|:--|
| **Total Diagnostics** | 6,424 | ≤6,200 | Reduction ≥200 |
| TS2307 (Cannot find module) | 266 | ≤150 | Reduction ≥116 |
| TS2304 (Cannot find name) | 1,227 | ≤1,050 | Reduction ≥177 |
| TS2339 (Property not found) | 2,186 | ≤2,100 | Indirect improvement |

### 6.2  Qualitative Criteria

- ✅ **Import Consistency:** ≥90% of type imports use `@/lib/types` barrel pattern
- ✅ **Zero Duplicates:** No local type definitions that mirror canonical interfaces
- ✅ **Syntax Clean:** `tsc --noEmit` produces zero errors
- ✅ **Sovereignty Intact:** `npm run check:no-supabase` passes
- ✅ **Module Resolution:** All imports resolve correctly (zero TS2307 in core modules)

### 6.3  Strategic Outcomes

1. **Type Propagation:** Expanded interfaces (Module A) now accessible throughout codebase
2. **Consistency:** Single source of truth for all type definitions
3. **Maintainability:** Future type changes only require updating canonical definitions
4. **Foundation for Module C:** Clean import structure enables component cleanup

---

## 7  Risk Mitigation

### 7.1  Identified Risks

| Risk | Probability | Impact | Mitigation |
|:--|:--:|:--:|:--|
| Breaking imports during refactoring | Medium | High | Dry-run preview + incremental commits + syntax validation after each change |
| Subtle type mismatches after deduplication | Low | Medium | Manual review of each duplicate before removal + test imports |
| Path alias misconfiguration | Low | High | Verify tsconfig.json before starting + test imports in multiple modules |
| Over-zealous deduplication | Low | Medium | Only remove exact duplicates, preserve intentional variations |

### 7.2  Rollback Strategy

**If Module B introduces regressions:**

1. Identify problematic commit: `git log --oneline --since="2025-12-21"`
2. Revert to Module A completion: `git reset --hard phase4.2c-A1-complete`
3. Review automation scripts for bugs
4. Re-execute Module B with manual oversight

**Checkpoints for safe rollback:**
- `phase4.2c-A1-complete` (Module A baseline)
- After Step 2.4 (import normalization)
- After Step 3.4 (duplicate elimination)
- `phase4.2c-B1-complete` (Module B completion)

---

## 8  Script Development Guides

### 8.1  `analyze-import-paths.ts` Template

```typescript
/**
 * Analyzes import path patterns across the codebase
 * Identifies normalization opportunities for Module B
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface ImportPattern {
  pattern: string;
  occurrences: number;
  files: string[];
  suggestedFix?: string;
}

async function analyzeImportPaths(): Promise<void> {
  // Use grep to find all import statements referencing lib/types
  const grepResults = execSync(
    `grep -r "from ['\"].*lib/types" --include="*.ts" --include="*.tsx" apps/ lib/ components/`,
    { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
  ).split('\n');

  const patterns: Map<string, ImportPattern> = new Map();

  for (const line of grepResults) {
    if (!line.trim()) continue;

    const match = line.match(/from ['"](.+lib\/types[^'"]+)['"]/);
    if (!match) continue;

    const importPath = match[1];
    const file = line.split(':')[0];

    if (!patterns.has(importPath)) {
      patterns.set(importPath, {
        pattern: importPath,
        occurrences: 0,
        files: [],
      });
    }

    const p = patterns.get(importPath)!;
    p.occurrences++;
    if (!p.files.includes(file)) {
      p.files.push(file);
    }
  }

  // Generate recommendations
  const results = Array.from(patterns.values()).map(p => {
    let suggestedFix = p.pattern;

    // Normalize to @/lib/types barrel pattern
    if (p.pattern.includes('../../lib/types')) {
      suggestedFix = '@/lib/types';
    } else if (p.pattern.includes('../types')) {
      suggestedFix = '@/lib/types';
    } else if (!p.pattern.startsWith('@/')) {
      suggestedFix = `@/lib/types`;
    }

    return { ...p, suggestedFix };
  });

  // Sort by occurrence count (descending)
  results.sort((a, b) => b.occurrences - a.occurrences);

  // Output JSON report
  const report = {
    totalPatterns: results.length,
    totalOccurrences: results.reduce((sum, p) => sum + p.occurrences, 0),
    patterns: results,
    generatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    'artifacts/import-path-analysis.json',
    JSON.stringify(report, null, 2)
  );

  console.log(`📊 Analysis complete: ${results.length} patterns found`);
  console.log(`📁 Report saved to: artifacts/import-path-analysis.json`);
}

analyzeImportPaths();
```

### 8.2  `normalize-import-paths.ts` Template

```typescript
/**
 * Normalizes import paths to use @/lib/types barrel pattern
 * Phase 4.2C Module B automation
 */

import * as fs from 'fs';
import * as path from 'path';

interface NormalizationRule {
  pattern: RegExp;
  replacement: string;
}

const NORMALIZATION_RULES: NormalizationRule[] = [
  // Relative paths to barrel imports
  {
    pattern: /from ['"]\.\.\/\.\.\/lib\/types\/[^'"]+['"]/g,
    replacement: `from '@/lib/types'`,
  },
  {
    pattern: /from ['"]\.\.\/types\/[^'"]+['"]/g,
    replacement: `from '@/lib/types'`,
  },
  // Fix .js extensions
  {
    pattern: /from (['"]@\/lib\/types[^'"]*)(\.js)(['"]\s*;?)/g,
    replacement: `from $1.ts$3`,
  },
];

async function normalizeFile(filePath: string, dryRun: boolean): Promise<boolean> {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  for (const rule of NORMALIZATION_RULES) {
    if (rule.pattern.test(content)) {
      content = content.replace(rule.pattern, rule.replacement);
      modified = true;
    }
  }

  if (modified) {
    if (dryRun) {
      console.log(`[DRY RUN] Would modify: ${filePath}`);
    } else {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ Normalized: ${filePath}`);
    }
  }

  return modified;
}

async function normalizeImportPaths(dryRun: boolean): Promise<void> {
  const { execSync } = require('child_process');

  // Find all TypeScript files
  const files = execSync(
    `find apps lib components -type f \\( -name "*.ts" -o -name "*.tsx" \\)`,
    { encoding: 'utf-8' }
  ).split('\n').filter(Boolean);

  let modifiedCount = 0;

  for (const file of files) {
    const wasModified = await normalizeFile(file, dryRun);
    if (wasModified) modifiedCount++;
  }

  console.log(`\n📊 Summary: ${modifiedCount} files ${dryRun ? 'would be' : 'were'} modified`);
}

// Parse CLI args
const dryRun = process.argv.includes('--dry-run');
normalizeImportPaths(dryRun);
```

### 8.3  `find-duplicate-types.ts` Template

```typescript
/**
 * Identifies local type definitions that duplicate canonical interfaces
 * Phase 4.2C Module B automation
 */

import * as fs from 'fs';
import { execSync } from 'child_process';

const CANONICAL_INTERFACES = [
  'ConsciousnessProfile',
  'ChristianFaithContext',
  'ElementalFramework',
  'SystemContext',
  'WisdomOracleContext',
  'AstrologyContext',
  'ReflectionContext',
];

interface DuplicateReport {
  interface: string;
  canonical: string;
  duplicates: Array<{
    file: string;
    lineStart: number;
    lineEnd: number;
  }>;
}

async function findDuplicateTypes(): Promise<void> {
  const reports: DuplicateReport[] = [];

  for (const iface of CANONICAL_INTERFACES) {
    // Find all files that define this interface
    const grepResults = execSync(
      `grep -rn "interface ${iface}" --include="*.ts" --include="*.tsx" apps/ lib/ components/ || true`,
      { encoding: 'utf-8' }
    ).split('\n').filter(Boolean);

    if (grepResults.length <= 1) continue; // Only canonical definition exists

    const canonical = `lib/types/cognitive/${iface}.ts`; // Adjust based on actual location
    const duplicates = grepResults
      .filter(line => !line.includes(canonical))
      .map(line => {
        const [file, lineNum] = line.split(':');
        return {
          file,
          lineStart: parseInt(lineNum, 10),
          lineEnd: parseInt(lineNum, 10) + 10, // Estimate
        };
      });

    if (duplicates.length > 0) {
      reports.push({
        interface: iface,
        canonical,
        duplicates,
      });
    }
  }

  fs.writeFileSync(
    'artifacts/duplicate-types-report.json',
    JSON.stringify({ reports, generatedAt: new Date().toISOString() }, null, 2)
  );

  console.log(`📊 Found ${reports.length} interfaces with duplicates`);
  console.log(`📁 Report saved to: artifacts/duplicate-types-report.json`);
}

findDuplicateTypes();
```

---

## 9  Expected Outcomes

### 9.1  Before Module B

```
📊 Import Path Chaos
  - 47 files use ../../lib/types/cognitive/ConsciousnessProfile
  - 23 files use ../types/spiritual/ChristianFaithContext
  - 15 files define local ConsciousnessProfile duplicates
  - TS2307 errors: 266
  - TS2304 errors: 1,227
```

### 9.2  After Module B

```
📊 Import Path Harmony
  - 100% of files use @/lib/types barrel imports
  - 0 local type duplicates remain
  - TS2307 errors: ≤150 (−43% reduction)
  - TS2304 errors: ≤1,050 (−14% reduction)
  - Total diagnostics: ≤6,200 (−3.5% reduction)

✅ Single source of truth for all types established
✅ Codebase ready for Module C component cleanup
```

---

## 10  Post-Module B Transition

**Next Module:** C — Component Cleanup
**Target:** −100 ± 20 diagnostics
**Focus:** Design mockup resolution, React import normalization

**Module B Completion Checklist:**
- [ ] All import paths normalized to `@/lib/types` pattern
- [ ] All duplicate type definitions removed
- [ ] Checkpoint metrics captured in `typehealth-phase4.2c-B1.log`
- [ ] Results document updated via `update-phase-results.ts B`
- [ ] Integrity validation passed (`verify-harmonization-integrity.ts --module B`)
- [ ] Committed with comprehensive message
- [ ] Tagged as `phase4.2c-B1-complete`
- [ ] Ready for Module C initialization

---

## 11  Quick Reference Commands

```bash
# Analysis phase
npx tsx scripts/analyze-import-paths.ts
npx tsx scripts/find-duplicate-types.ts

# Normalization (dry-run first!)
npx tsx scripts/normalize-import-paths.ts --dry-run
npx tsx scripts/normalize-import-paths.ts --execute

# Verification
tsc --noEmit
npm run check:no-supabase
npm run audit:typehealth > artifacts/typehealth-phase4.2c-B1.log

# Results update
npx tsx scripts/update-phase-results.ts B

# Integrity check
npx tsx scripts/verify-harmonization-integrity.ts --module B --strict

# Commit & tag
git add .
git commit -m "feat(types): Phase 4.2C Module B — Path Normalization complete"
git tag -a phase4.2c-B1-complete -m "Module B complete"
```

---

**END OF MODULE B EXECUTION PLAN**
