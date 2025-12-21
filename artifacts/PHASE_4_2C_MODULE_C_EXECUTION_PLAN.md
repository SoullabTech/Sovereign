# Phase 4.2C Module C — Component Cleanup • EXECUTION PLAN

**Module:** C — Component Cleanup
**Phase:** 4.2C — Type System Harmonization
**Status:** 🟢 Ready to Execute
**Created:** 2025-12-21
**Prerequisites:** Module A Complete (`phase4.2c-A1-complete`), Module B Complete (`phase4.2c-B1-complete`)

---

## 1  Module C Objective

**Goal:** Resolve component-layer type errors through React import normalization, design mockup cleanup, and prop-type verification.

**Target Impact:** −100 to −150 diagnostics (≈ 1.5–2.3% reduction)

**Primary Error Codes Addressed:**
- TS2304 (Cannot find name): React hooks, component references
- TS2339 (Property does not exist): Component props, design mockup artifacts
- TS2307 (Cannot find module): Component import paths

**Effort Estimate:** 2–3 hours

**Deferred Scope:** Integration of `consciousness-biomarkers.ts` (reserved for Phase 4.2D)

---

## 2  Current State (Post-Module B)

**Baseline Metrics:**
```
Total diagnostics: 6,424
TS2339: 2,186 (34.0%)
TS2304: 1,227 (19.1%)
TS2307: 260 (4.0%)
TS2322: 564 (8.8%)
```

**Module A & B Achievements:**
- ✅ 191 interface properties added (Module A)
- ✅ 100% import path consistency (Module B)
- ✅ Zero syntax errors
- ✅ Sovereignty preserved

**Current Tag:** `phase4.2c-B1-complete`

---

## 3  Module C Scope

### 3.1  In-Scope Actions

1. **React Import Normalization**
   - Identify missing React hook imports (useState, useEffect, useCallback, etc.)
   - Normalize import syntax (named vs. namespace imports)
   - Fix React component type references

2. **Design Mockup Resolution**
   - Identify design mockup files (MobileFirstDesign.tsx, prototypes, etc.)
   - Decision tree: Extract reusable components OR exclude from typecheck
   - Document exclusion rationale

3. **Component Prop Verification**
   - Validate component prop interfaces match usage
   - Fix missing prop definitions
   - Resolve component reference errors

4. **Non-Existent Component Cleanup**
   - Identify imports of deleted/moved components
   - Update import paths or remove dead references

### 3.2  Out-of-Scope (Deferred)

- **Phase 4.2D:** Integration of `consciousness-biomarkers.ts` from alternate session
- **Phase 5:** Supabase migration, runtime validation, production optimization
- **Future:** Design system alignment, comprehensive prop-type overhaul

---

## 4  Automation Stack

### 4.1  React Import Analysis

**Script:** `scripts/analyze-react-imports.ts` (to be created)

**Purpose:** Identify missing or incorrect React imports

**Output:** `artifacts/react-import-analysis.json`

**Sample output:**
```json
{
  "missingImports": [
    {
      "file": "components/FeedbackWidget.tsx",
      "missing": ["useState", "useEffect"],
      "line": 15
    }
  ],
  "incorrectSyntax": [
    {
      "file": "app/demo/page.tsx",
      "current": "import React from 'react'",
      "suggested": "import { useState, useEffect } from 'react'"
    }
  ]
}
```

### 4.2  Design Mockup Detection

**Script:** `scripts/find-design-mockups.ts` (to be created)

**Purpose:** Identify files that are design artifacts vs. production code

**Detection Heuristics:**
- Filename patterns: `*Design.tsx`, `*Mockup.tsx`, `*Prototype.tsx`
- Comment markers: `// DESIGN ONLY`, `// MOCKUP`
- Unused component indicators (no imports from other files)

**Output:** `artifacts/design-mockup-report.json`

### 4.3  Component Reference Validator

**Script:** `scripts/validate-component-refs.ts` (to be created)

**Purpose:** Find broken component imports and references

**Output:** `artifacts/component-reference-report.json`

**Sample output:**
```json
{
  "brokenImports": [
    {
      "file": "app/dashboard/page.tsx",
      "import": "StatCard",
      "source": "@/components/StatCard",
      "issue": "File not found"
    }
  ],
  "suggestions": [
    {
      "file": "app/dashboard/page.tsx",
      "import": "StatCard",
      "possibleMatch": "@/components/stats/StatCard"
    }
  ]
}
```

---

## 5  Execution Workflow

### Phase 1: Analysis & Triage (45 min)

**Step 1.1:** Create analysis scripts
```bash
# Create React import analyzer
touch scripts/analyze-react-imports.ts

# Create design mockup detector
touch scripts/find-design-mockups.ts

# Create component reference validator
touch scripts/validate-component-refs.ts
```

**Step 1.2:** Run analysis
```bash
# Analyze React imports
npx tsx scripts/analyze-react-imports.ts > artifacts/react-import-analysis.json

# Find design mockups
npx tsx scripts/find-design-mockups.ts > artifacts/design-mockup-report.json

# Validate component references
npx tsx scripts/validate-component-refs.ts > artifacts/component-reference-report.json
```

**Step 1.3:** Review findings and categorize
- High-impact fixes (most error reduction)
- Design mockups requiring decision
- Low-risk cleanups

---

### Phase 2: React Import Normalization (45 min)

**Step 2.1:** Fix missing React imports
```bash
# Option A: Manual fixes (if few files)
# Edit each file to add missing imports

# Option B: Automated (if many files)
npx tsx scripts/fix-react-imports.ts --apply
```

**Step 2.2:** Verify syntax
```bash
tsc --noEmit
```

**Step 2.3:** Commit checkpoint
```bash
git add .
git commit -m "fix(react): Normalize React imports across components

- Add missing useState, useEffect, useCallback imports
- Fix React namespace vs. named import patterns
- [N] files updated

Phase 4.2C Module C — Step 2.3"
```

---

### Phase 3: Design Mockup Resolution (30 min)

**Step 3.1:** Review mockup report
```bash
cat artifacts/design-mockup-report.json
```

**Step 3.2:** Make triage decisions

For each mockup file, decide:
- **Option A: Extract** - If contains reusable components, extract to components/
- **Option B: Exclude** - If pure design artifact, add to tsconfig exclude
- **Option C: Delete** - If obsolete, remove entirely

**Step 3.3:** Apply exclusions (if chosen)

Update `tsconfig.json`:
```json
{
  "exclude": [
    "node_modules",
    "components/**/design/*.tsx",
    "components/**/*Mockup.tsx",
    "components/**/*Prototype.tsx"
  ]
}
```

**Step 3.4:** Commit checkpoint
```bash
git add .
git commit -m "refactor(components): Resolve design mockup artifacts

- Exclude [N] design mockup files from typecheck
- Extract [M] reusable components
- Remove [K] obsolete prototypes

Phase 4.2C Module C — Step 3.4"
```

---

### Phase 4: Component Reference Cleanup (30 min)

**Step 4.1:** Review broken references
```bash
cat artifacts/component-reference-report.json
```

**Step 4.2:** Fix broken imports

Pattern:
```typescript
// BEFORE
import { StatCard } from '@/components/StatCard'; // ❌ Not found

// AFTER
import { StatCard } from '@/components/stats/StatCard'; // ✅ Fixed
```

**Step 4.3:** Remove dead code

If a component is genuinely deleted and no longer needed:
```typescript
// Remove import
// import { ObsoleteWidget } from '@/components/ObsoleteWidget';

// Remove usage
// <ObsoleteWidget />
```

**Step 4.4:** Commit checkpoint
```bash
git add .
git commit -m "fix(components): Resolve broken component references

- Fix [N] incorrect import paths
- Remove [M] dead component references
- Update component locations

Phase 4.2C Module C — Step 4.4"
```

---

### Phase 5: Verification & Metrics (30 min)

**Step 5.1:** Capture checkpoint metrics
```bash
npm run audit:typehealth > artifacts/typehealth-phase4.2c-C1.log
```

**Step 5.2:** Update results document
```bash
npx tsx scripts/update-phase-results.ts C artifacts/typehealth-phase4.2c-C1.log
```

**Step 5.3:** Run integrity validation
```bash
# Verify syntax
tsc --noEmit

# Verify sovereignty
npm run check:no-supabase

# Optional: Run build
npm run build
```

**Expected validation output:**
```
✅ Zero Syntax Errors: tsc --noEmit clean
✅ Sovereignty Check: No new Supabase imports
✅ Component Resolution: All imports resolve correctly
✅ React Imports: All hooks properly imported
```

**Step 5.4:** Final commit & tag
```bash
git add .
git commit -m "feat(types): Phase 4.2C Module C — Component Cleanup complete

Component layer type errors resolved through React normalization and mockup cleanup.

METRICS
  Total diagnostics: 6,424 → [C1 count] ([Δ%])
  TS2304 (Cannot find name): 1,227 → [C1] ([Δ%])
  TS2339 (Property does not exist): 2,186 → [C1] ([Δ%])

ACTIONS
  - Normalized [N] React imports
  - Resolved [M] design mockup files
  - Fixed [K] component references

VALIDATION
  ✅ Zero syntax errors
  ✅ Sovereignty preserved
  ✅ All component imports resolve

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

git tag -a phase4.2c-C1-complete -m "Phase 4.2C Module C — Component Cleanup complete"
```

---

## 6  Success Criteria

### 6.1  Quantitative Metrics

| Metric | Post-B1 | Target Post-C1 | Success Threshold |
|:--|--:|--:|:--|
| **Total Diagnostics** | 6,424 | ≤6,300 | Reduction ≥100 |
| TS2304 (Cannot find name) | 1,227 | ≤1,150 | Reduction ≥77 |
| TS2339 (Property not found) | 2,186 | ≤2,140 | Reduction ≥46 |
| Component-related errors | TBD | Reduced | Measurable improvement |

### 6.2  Qualitative Criteria

- ✅ **React Import Consistency:** All React hooks properly imported where used
- ✅ **Design Mockup Clarity:** Clear separation between production code and design artifacts
- ✅ **Component Resolution:** All component imports resolve correctly
- ✅ **Zero Syntax Errors:** `tsc --noEmit` produces zero errors
- ✅ **Sovereignty Intact:** `npm run check:no-supabase` passes

### 6.3  Strategic Outcomes

1. **Component Layer Clean:** React imports normalized, no missing hook references
2. **Design Clarity:** Mockups either extracted, excluded, or removed
3. **Import Integrity:** All component references resolve correctly
4. **Foundation for Phase 5:** Type system ready for production hardening

---

## 7  Risk Mitigation

### 7.1  Identified Risks

| Risk | Probability | Impact | Mitigation |
|:--|:--:|:--:|:--|
| Breaking component functionality during cleanup | Low | High | Test critical components after changes; incremental commits |
| Over-aggressive mockup exclusion | Medium | Medium | Review each mockup individually; document exclusion rationale |
| Introducing new React errors during normalization | Low | Medium | Verify syntax after each batch; use automated analysis |

### 7.2  Rollback Strategy

**If Module C introduces regressions:**

1. Identify problematic commit: `git log --oneline --since="2025-12-21"`
2. Revert to Module B completion: `git reset --hard phase4.2c-B1-complete`
3. Review analysis reports for issues
4. Re-execute Module C with manual oversight

**Checkpoints for safe rollback:**
- `phase4.2c-B1-complete` (Module B baseline)
- After Step 2.3 (React import normalization)
- After Step 3.4 (Design mockup resolution)
- After Step 4.4 (Component reference cleanup)
- `phase4.2c-C1-complete` (Module C completion)

---

## 8  Script Development Guides

### 8.1  `analyze-react-imports.ts` Template

```typescript
#!/usr/bin/env tsx
/**
 * Analyzes React import patterns and identifies missing imports
 * Phase 4.2C Module C automation
 */

import * as fs from 'fs';
import { execSync } from 'child_process';

interface ReactImportIssue {
  file: string;
  line: number;
  hook: string;
  issue: 'missing' | 'incorrect';
}

const REACT_HOOKS = [
  'useState',
  'useEffect',
  'useCallback',
  'useMemo',
  'useRef',
  'useContext',
  'useReducer',
  'useLayoutEffect',
  'useImperativeHandle',
  'useDebugValue',
];

async function analyzeReactImports(): Promise<void> {
  console.log('🔍 Analyzing React imports...\n');

  const issues: ReactImportIssue[] = [];

  // Find all TSX files
  const files = execSync(
    `find app lib components -type f -name "*.tsx" -not -path "*/node_modules/*"`,
    { encoding: 'utf-8' }
  ).split('\n').filter(Boolean);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    // Check if file uses 'use client'
    const isClientComponent = content.includes("'use client'") || content.includes('"use client"');

    if (!isClientComponent) continue;

    // Extract existing React imports
    const importMatch = content.match(/import\s+(?:{([^}]+)}|React)\s+from\s+['"]react['"]/);
    const existingImports = importMatch ? importMatch[1]?.split(',').map(s => s.trim()) || [] : [];

    // Check for hook usage
    for (const hook of REACT_HOOKS) {
      const hookRegex = new RegExp(`\\b${hook}\\b`, 'g');
      if (hookRegex.test(content) && !existingImports.includes(hook)) {
        // Find line number
        const lineIndex = lines.findIndex(line => line.includes(hook));
        issues.push({
          file,
          line: lineIndex + 1,
          hook,
          issue: 'missing'
        });
      }
    }
  }

  // Output report
  const report = {
    totalIssues: issues.length,
    issues,
    generatedAt: new Date().toISOString()
  };

  fs.writeFileSync('artifacts/react-import-analysis.json', JSON.stringify(report, null, 2));

  console.log(`📊 Found ${issues.length} React import issues`);
  console.log(`📁 Report saved to: artifacts/react-import-analysis.json\n`);
}

analyzeReactImports().catch(console.error);
```

### 8.2  `find-design-mockups.ts` Template

```typescript
#!/usr/bin/env tsx
/**
 * Identifies design mockup files vs. production components
 * Phase 4.2C Module C automation
 */

import * as fs from 'fs';
import { execSync } from 'child_process';

interface DesignMockup {
  file: string;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
  recommendation: 'exclude' | 'review' | 'extract';
}

async function findDesignMockups(): Promise<void> {
  console.log('🔍 Searching for design mockup files...\n');

  const mockups: DesignMockup[] = [];

  // Find all TSX files
  const files = execSync(
    `find app lib components -type f -name "*.tsx" -not -path "*/node_modules/*"`,
    { encoding: 'utf-8' }
  ).split('\n').filter(Boolean);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    let isMockup = false;
    let reason = '';
    let confidence: 'high' | 'medium' | 'low' = 'low';

    // Heuristic 1: Filename patterns
    if (file.match(/(Design|Mockup|Prototype|Demo|Example)\.tsx$/i)) {
      isMockup = true;
      reason = 'Filename indicates design artifact';
      confidence = 'high';
    }

    // Heuristic 2: Comment markers
    if (content.match(/\/\/\s*(DESIGN ONLY|MOCKUP|PROTOTYPE|DO NOT USE)/i)) {
      isMockup = true;
      reason = 'Contains design-only comment markers';
      confidence = 'high';
    }

    // Heuristic 3: Not imported anywhere
    const componentName = file.split('/').pop()?.replace('.tsx', '');
    if (componentName) {
      const imports = execSync(
        `grep -r "from.*${componentName}" app lib components --include="*.tsx" --include="*.ts" | wc -l`,
        { encoding: 'utf-8' }
      );
      if (parseInt(imports.trim()) === 0) {
        isMockup = true;
        reason = reason || 'Component not imported anywhere';
        confidence = confidence === 'high' ? 'high' : 'medium';
      }
    }

    if (isMockup) {
      mockups.push({
        file,
        reason,
        confidence,
        recommendation: confidence === 'high' ? 'exclude' : 'review'
      });
    }
  }

  // Output report
  const report = {
    totalMockups: mockups.length,
    mockups,
    generatedAt: new Date().toISOString()
  };

  fs.writeFileSync('artifacts/design-mockup-report.json', JSON.stringify(report, null, 2));

  console.log(`📊 Found ${mockups.length} potential design mockups`);
  console.log(`📁 Report saved to: artifacts/design-mockup-report.json\n`);
}

findDesignMockups().catch(console.error);
```

---

## 9  Expected Outcomes

### 9.1  Before Module C

```
📊 Component Layer Issues
  - React hooks used without imports (TS2304 errors)
  - Design mockup files included in typecheck
  - Broken component imports (moved/deleted components)
  - Component-related TS2304: ~77 errors
  - Component-related TS2339: ~46 errors
```

### 9.2  After Module C

```
📊 Component Layer Clean
  - All React hooks properly imported
  - Design mockups excluded or extracted
  - All component imports resolve correctly
  - Component-related TS2304: ≤10 errors
  - Component-related TS2339: ≤20 errors
  - Total diagnostics: ≤6,300 (−100+ reduction)

✅ React import consistency achieved
✅ Design artifacts properly categorized
✅ Component resolution clean
```

---

## 10  Post-Module C Transition

**Next Phase:** 4.2C Final Verification → Phase 5 (Production Readiness)

**Module C Completion Checklist:**
- [ ] All React imports normalized
- [ ] Design mockups resolved (excluded/extracted/removed)
- [ ] Component references validated
- [ ] Checkpoint metrics captured in `typehealth-phase4.2c-C1.log`
- [ ] Results document updated via `update-phase-results.ts C`
- [ ] Committed with comprehensive message
- [ ] Tagged as `phase4.2c-C1-complete`

**Phase 4.2C Final Validation:**
- Total reduction target: −1,200 ± 150 diagnostics
- Current progress: Module A (0), Module B (−6), Module C (target −100+)
- Remaining work: Phase 4.2D (consciousness-biomarkers integration) deferred

---

## 11  Quick Reference Commands

```bash
# Analysis phase
npx tsx scripts/analyze-react-imports.ts
npx tsx scripts/find-design-mockups.ts
npx tsx scripts/validate-component-refs.ts

# Verification
tsc --noEmit
npm run check:no-supabase
npm run audit:typehealth > artifacts/typehealth-phase4.2c-C1.log

# Results update
npx tsx scripts/update-phase-results.ts C artifacts/typehealth-phase4.2c-C1.log

# Commit & tag
git add .
git commit -m "feat(types): Phase 4.2C Module C — Component Cleanup complete"
git tag -a phase4.2c-C1-complete -m "Module C complete"
```

---

**END OF MODULE C EXECUTION PLAN**
