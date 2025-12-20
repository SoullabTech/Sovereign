# Phase 4.2B Step 6: Import & Path Normalization - EXECUTION PLAN

**Status**: 🚧 IN PROGRESS
**Date**: 2025-12-20
**Baseline**: 6,500 errors (from Step 5)
**Target**: ~6,100–6,200 errors (−300 to −400 reduction)
**Focus**: TS2304 (Cannot find name) + TS2307 (Cannot find module)

---

## Executive Summary

Systematically resolve missing imports and broken module paths through automated pattern analysis and batch fixes. This step continues **Pragmatic Stabilization** by eliminating "mechanical" errors that don't require deep refactoring.

**Strategy**: Fix in order of impact (highest-frequency errors first)

---

## Current Error Profile

### Baseline (Post-Step 5)

| Code | Count | % | Description |
|------|-------|---|-------------|
| **TS2339** | 2,114 | 32.5% | Property does not exist |
| **TS2304** | 1,429 | 22.0% | Cannot find name/module |
| **TS2322** | 552 | 8.5% | Type not assignable |
| **TS2307** | 274 | 4.2% | Cannot find module |
| **TS2353** | 266 | 4.1% | Unknown error |
| **TS2345** | 265 | 4.1% | Argument type mismatch |
| **TS2305** | 199 | 3.1% | Unknown error |

**Target errors**: TS2304 (1,429) + TS2307 (274) = **1,703 errors (26.2%)**

---

## Error Pattern Analysis

### Top TS2304 Patterns (Cannot find name)

| Symbol | Count | Category | Fix Strategy |
|--------|-------|----------|--------------|
| `supabase` | 393 | Supabase legacy | Exclude files or replace with `lib/db/postgres.ts` |
| `createClient` | 102 | Supabase legacy | Exclude files |
| `createClientComponentClient` | 34 | Supabase legacy | Exclude files |
| `SupabaseClient` | 14 | Supabase legacy | Exclude files |
| `useState` | 12 | React import | Add `import { useState } from 'react'` |
| `StatCard` | 11 | Component import | Add component imports |
| `Description` | 10 | Component import | Add component imports |
| `AuthError` | 10 | Type import | Add type imports |
| `ElementalBalance` | 9 | Type import | Import from `@/lib/types` |
| `ConversationContext` | 9 | Type import | Import from `@/lib/types` |

**Key insight**: ~543 errors (38% of TS2304) are Supabase-related → exclude strategy

### Top TS2307 Patterns (Cannot find module)

| Import Pattern | Count | Issue | Fix Strategy |
|----------------|-------|-------|--------------|
| `./maia-discernment-engine` | 11 | Wrong path/missing file | Verify existence or update path |
| `../core/agents/soullabFounderAgent` | 11 | Wrong path | Normalize to `@/app/api/backend/src/core/agents/...` |
| `../memory/SoulMemorySystem.js` | 8 | .js extension | Remove extension or verify file |
| `../dbClient` | 8 | Wrong path | Replace with `@/lib/db/postgres` |
| `../../lib/cognitive-engines/*` | 4 | Path depth mismatch | Normalize to `@/lib/cognitive-engines/*` |

**Key insight**: Most TS2307 errors are **relative path issues** → normalize to barrel imports

---

## Execution Strategy

### Phase 1: Supabase Cleanup (Target: −543 errors)

**Approach**: Exclude remaining Supabase files from type-checking

**Files to exclude** (based on error analysis):
```typescript
// High-frequency Supabase usage (393 + 102 + 34 + 14 = 543 symbol errors)
app/api/backend/src/adapters/memory/SupabaseMemory.ts
app/api/backend/api/oracle-agent/promptLoggingService.ts
app/api/backend/api/oracle-agent/promptUtils.ts
app/api/backend/api/oracle/insightHistory.ts
app/api/backend/api/rituals/progress.ts
app/api/backend/scripts/seed-sample-file.ts
// ... (identify all files with createClient/supabase usage)
```

**Script**: `scripts/analyze-supabase-files.ts`
```typescript
// Find all files with Supabase symbol usage
grep -l "error TS2304.*\(supabase\|createClient\|SupabaseClient\)" artifacts/typecheck-full.log
```

**Action**:
1. Generate list of Supabase-dependent files
2. Add to `tsconfig.json` exclude list
3. Measure impact

**Expected**: ~500-550 error reduction

---

### Phase 2: React Import Fixes (Target: −12 to −20 errors)

**Approach**: Add missing React imports automatically

**Common patterns**:
```typescript
// Missing: import { useState, useEffect, useCallback, useMemo } from 'react'
useState(...)      // 12 errors
useEffect(...)     // Est. 8 errors
useCallback(...)   // Est. 5 errors
```

**Script**: `scripts/add-react-imports.ts`
```typescript
const REACT_HOOKS = ['useState', 'useEffect', 'useCallback', 'useMemo', 'useRef', 'useContext'];

FILES.forEach(file => {
  const errors = findReactHookErrors(file);
  if (errors.length > 0) {
    addReactImport(file, errors);
  }
});
```

**Steps**:
1. Find files with React hook errors: `grep "error TS2304.*useState" artifacts/typecheck-full.log`
2. Analyze which hooks are used
3. Add consolidated import: `import { useState, useEffect } from 'react'`

**Expected**: ~15-20 error reduction

---

### Phase 3: Component Import Fixes (Target: −30 to −40 errors)

**Approach**: Add missing component imports

**Common patterns**:
```typescript
// Missing: import { StatCard } from '@/components/ui/stat-card'
StatCard           // 11 errors
Description        // 10 errors
Tab                // 8 errors
StatValue          // 8 errors
StatLabel          // 8 errors
StatIcon           // 8 errors
ScrollView         // 8 errors
```

**Discovery**:
1. Map component names to file locations:
   ```bash
   grep -r "export.*StatCard" components/ lib/ app/
   ```
2. Identify barrel export paths (prefer `@/components/ui/*`)

**Script**: `scripts/add-component-imports.ts`
```typescript
const COMPONENT_MAP = {
  'StatCard': '@/components/ui/stat-card',
  'Description': '@/components/ui/description',
  'Tab': '@/components/ui/tabs',
  // ...
};

FILES.forEach(file => {
  const missingComponents = findMissingComponents(file);
  addComponentImports(file, missingComponents);
});
```

**Expected**: ~30-40 error reduction

---

### Phase 4: Type Import Fixes (Target: −40 to −60 errors)

**Approach**: Import types from `@/lib/types`

**Missing types** (from error analysis):
```typescript
ElementalBalance        // 9 errors
ConversationContext     // 9 errors
ConsciousnessAnalysis   // 8 errors
SpiritualProfile        // 8 errors
ConversationHistory     // 8 errors
AlchemicalMetal         // 7 errors
MercuryAspect          // 7 errors
SpiralPhase            // 6 errors
ThemeName              // 6 errors
// ... ~20 more types
```

**Discovery**:
1. Check if type exists in `lib/types/`:
   ```bash
   grep -r "export.*ElementalBalance" lib/types/
   ```
2. If exists → add import
3. If not exists → create minimal stub (like Step 5)

**Script**: `scripts/add-type-imports.ts`
```typescript
const TYPE_MAP = {
  'ElementalBalance': '@/lib/types/elemental',
  'ConversationContext': '@/lib/types/conversation',
  'SpiritualProfile': '@/lib/types/spiritual',
  // ...
};

FILES.forEach(file => {
  const missingTypes = findMissingTypes(file);
  addTypeImports(file, missingTypes);
});
```

**Expected**: ~40-60 error reduction

---

### Phase 5: Path Normalization (Target: −100 to −150 errors)

**Approach**: Replace relative paths with barrel imports

**Common issues**:

#### 5.1 Relative Path Depth Mismatch
```typescript
// BEFORE (broken):
import { LidaWorkspace } from '../../lib/cognitive-engines/lida-workspace';

// AFTER (fixed):
import { LidaWorkspace } from '@/lib/cognitive-engines/lida-workspace';
```

**Pattern**: Any `../../lib/*` → `@/lib/*`

#### 5.2 Wrong Barrel Path
```typescript
// BEFORE (broken):
import { dbClient } from '../dbClient';

// AFTER (fixed):
import { db } from '@/lib/db/postgres';
```

**Mapping**:
- `../dbClient` → `@/lib/db/postgres`
- `../memory/SoulMemorySystem.js` → `@/lib/memory/SoulMemorySystem` (remove .js)

#### 5.3 Missing Module Files
```typescript
// Error: Cannot find module './maia-discernment-engine'

// Strategy:
1. Check if file exists: ls ./maia-discernment-engine.ts
2. If exists → verify export
3. If not exists → create stub or remove import
```

**Script**: `scripts/normalize-import-paths.ts`
```typescript
const PATH_REPLACEMENTS = {
  // Cognitive engines
  '../../lib/cognitive-engines': '@/lib/cognitive-engines',
  '../lib/cognitive-engines': '@/lib/cognitive-engines',

  // Database
  '../dbClient': '@/lib/db/postgres',
  '../../src/lib/dbClient': '@/lib/db/postgres',

  // Memory systems
  '../memory/SoulMemorySystem.js': '@/lib/memory/SoulMemorySystem',

  // Agent paths
  '../core/agents': '@/app/api/backend/src/core/agents',
  '../../core/agents': '@/app/api/backend/src/core/agents',
};

FILES.forEach(file => {
  replaceImportPaths(file, PATH_REPLACEMENTS);
});
```

**Expected**: ~100-150 error reduction

---

### Phase 6: Verification & Iteration

After each phase:
1. Run `npm run audit:typehealth`
2. Compare before/after
3. Commit with specific phase message
4. Create checkpoint tag

**Checkpoints**:
- `phase4.2b-step6-supabase-cleanup`
- `phase4.2b-step6-react-imports`
- `phase4.2b-step6-component-imports`
- `phase4.2b-step6-type-imports`
- `phase4.2b-step6-path-normalization`
- `phase4.2b-step6-complete`

---

## Expected Impact Summary

| Phase | Target Errors | Est. Reduction | Cumulative Total |
|-------|---------------|----------------|------------------|
| **Baseline** | - | - | 6,500 |
| 1. Supabase cleanup | TS2304 (supabase/createClient) | −500 to −550 | ~5,950-6,000 |
| 2. React imports | TS2304 (useState, etc.) | −15 to −20 | ~5,930-5,985 |
| 3. Component imports | TS2304 (StatCard, etc.) | −30 to −40 | ~5,890-5,955 |
| 4. Type imports | TS2304 (ElementalBalance, etc.) | −40 to −60 | ~5,830-5,915 |
| 5. Path normalization | TS2307 (module paths) | −100 to −150 | **~5,680-5,815** |
| **Phase 5 buffer** | Cascade effects | −50 to −100 | **~5,580-5,765** |

**Conservative estimate**: 6,500 → ~5,800 errors (−700, −10.8%)
**Optimistic estimate**: 6,500 → ~5,600 errors (−900, −13.8%)

---

## Risk Assessment

### Low Risk
- **Supabase file exclusion**: Clean strategy, no syntax breaks
- **React imports**: Standard pattern, well-tested
- **Component imports**: Straightforward addition

### Medium Risk
- **Type imports for undefined types**: May need stub creation
- **Path normalization**: Could break working imports if mapping is wrong

### Mitigation
1. **Dry-run mode** for all scripts (preview changes before applying)
2. **Git checkpoints** after each phase
3. **Rollback strategy**: `git reset --hard <checkpoint-tag>`
4. **Incremental verification**: Typecheck after each 50-file batch

---

## Implementation Order

### Step 6.1: Baseline Capture
```bash
npm run audit:typehealth > artifacts/typehealth-baseline-step6.log
git tag phase4.2b-pre-step6
```

### Step 6.2: Error Pattern Analysis
```bash
# Create comprehensive error breakdown
tsx scripts/analyze-import-errors.ts > artifacts/import-error-analysis.json

# Expected output:
{
  "supabase_symbols": 543,
  "react_hooks": 20,
  "components": 61,
  "types": 150,
  "module_paths": 274,
  "by_file": { ... }
}
```

### Step 6.3: Script Creation
1. `scripts/analyze-import-errors.ts` - Pattern analyzer
2. `scripts/exclude-supabase-files.ts` - Phase 1
3. `scripts/add-react-imports.ts` - Phase 2
4. `scripts/add-component-imports.ts` - Phase 3
5. `scripts/add-type-imports.ts` - Phase 4
6. `scripts/normalize-import-paths.ts` - Phase 5

### Step 6.4: Phased Execution
Execute phases 1-5 sequentially with verification between each.

### Step 6.5: Results Documentation
Create `artifacts/PHASE_4_2B_STEP6_RESULTS.md` with:
- Before/after metrics
- Detailed breakdown by phase
- Remaining issues analysis
- Lessons learned

---

## Success Criteria

✅ **Must Have**:
1. Total errors ≤ 5,850 (−650 minimum, −10%)
2. TS2304 errors ≤ 900 (−529 minimum, −37%)
3. TS2307 errors ≤ 200 (−74 minimum, −27%)
4. Zero syntax errors introduced
5. All scripts documented and reusable

🎯 **Nice to Have**:
1. Total errors ≤ 5,700 (−800, −12.3%)
2. TS2304 errors ≤ 800 (−629, −44%)
3. Automated import fixing pipeline established
4. Type stub library expanded

---

## Technical Details

### tsconfig.json Path Aliases

Verify these are configured:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/lib/*": ["lib/*"],
      "@/components/*": ["components/*"],
      "@/app/*": ["app/*"],
      "@/api/*": ["api/*"]
    }
  }
}
```

### Import Resolution Order

TypeScript resolves imports in this order:
1. Relative paths (`./`, `../`)
2. Node modules (`node_modules/`)
3. Path mappings (`@/*`)
4. Barrel exports (`index.ts`)

**Strategy**: Prefer path mappings (`@/*`) over relative paths for stability.

### File Extension Handling

- `.ts` / `.tsx` → **omit** extension in imports
- `.js` / `.jsx` → **remove** and replace with `.ts` equivalent
- `.d.ts` → allowed, but prefer source files

---

## Verification Commands

```bash
# Current error counts
grep "error TS2304" artifacts/typecheck-full.log | wc -l  # 1429
grep "error TS2307" artifacts/typecheck-full.log | wc -l  # 274

# Supabase error count
grep "error TS2304.*\(supabase\|createClient\)" artifacts/typecheck-full.log | wc -l  # ~543

# React error count
grep "error TS2304.*useState" artifacts/typecheck-full.log | wc -l  # 12

# Component error count
grep "error TS2304.*\(StatCard\|Description\|Tab\)" artifacts/typecheck-full.log | wc -l  # ~30

# Module path error details
grep "error TS2307" artifacts/typecheck-full.log | sort | uniq -c | sort -rn

# After each phase
npm run audit:typehealth
```

---

## Next Steps After Step 6

After completing import/path normalization, we'll have:
- **~5,600-5,850 errors** (down from 8,621 baseline)
- **−34 to −35% total reduction** from Phase 4.2B
- Clean foundation for Phase 4.2C (deep refactoring)

**Phase 4.2B Step 7** will be final verification:
- Comprehensive comparison report
- Module health analysis
- Handoff documentation for Phase 4.2C

---

**End of Phase 4.2B Step 6 Execution Plan**
