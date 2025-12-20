# Type Integrity Transition Roadmap

**Status:** Syntax Clean → Type Integrity In Progress
**Baseline Tag:** `v0.9.0-syntax-clean`
**Date:** 2025-12-20

---

## Current State (As of v0.9.0-syntax-clean)

### ✅ Completed: Parser-Level Compilation

**Syntax Errors:** 0 (was 14)

All syntax-blocking errors eliminated:
- Fixed unterminated string literals (maia-knowledge-base.ts)
- Fixed spaces in identifiers (3 files)
- Fixed audit script paths (package.json)
- All files now parse correctly

**Supabase Removal:** Complete
- ✅ No Supabase imports detected
- ✅ No Supabase packages in dependencies
- ✅ Pre-commit enforcement active
- ✅ 199 files cleaned, 6 legacy files deleted
- ✅ Type placeholders centralized in `lib/types/dbPlaceholders.ts`

**Sovereignty Checks:** Active
- Pre-commit hook: `.githooks/pre-commit` (versioned, ships with repo)
- Fast check: `npm run check:no-supabase` (<2s)
- Full audit: `npm run audit:sovereignty` (comprehensive)

---

## Type Health Baseline (8,624 errors)

### Error Distribution by Type

| Error Code | Count | % | Description | Priority |
|------------|-------|---|-------------|----------|
| TS2339 | 2,587 | 30.0% | Property does not exist on type | HIGH |
| TS2304 | 1,610 | 18.7% | Cannot find name | HIGH |
| TS2345 | 1,390 | 16.1% | Argument type mismatch | MEDIUM |
| TS2322 | 581 | 6.7% | Type not assignable | MEDIUM |
| TS2307 | 473 | 5.5% | Cannot find module | **IMMEDIATE** |
| TS2353 | 287 | 3.3% | Object member not allowed | LOW |
| TS2305 | 213 | 2.5% | Module has no exported member | MEDIUM |
| TS18048 | 153 | 1.8% | Possibly undefined | LOW |
| Other | 1,370 | 15.9% | Various | LOW |

### Top 20 Offender Files

| Rank | Errors | File | Primary Issue |
|------|--------|------|---------------|
| 1 | 179 | `lib/oracle/dashboard/mobile/MobileFirstDesign.tsx` | TS2304 (173) |
| 2 | 148 | `lib/intelligence/AdvancedSynergyEngine.ts` | TS2339 (146) |
| 3 | 132 | `lib/oracle/admin/archetypes/NovelArchetypeDiscovery.tsx` | TS2304 (127) |
| 4 | 127 | `lib/consciousness/next-gen-conversational-intelligence.ts` | TS2304 (89) |
| 5 | 121 | `lib/consciousness/multi-modal-consciousness-detection.ts` | TS2304 (93) |
| 6 | 97 | `lib/intelligence/CrossFrameworkSynergyEngine.ts` | TS2339 (87) |
| 7 | 95 | `lib/consciousness/AccountabilityResponsibilityProtocols.ts` | TS2339 (41) |
| 8 | 78 | `lib/prompts/maya-intelligence-governor.ts` | TS2304 (41) |
| 9 | 62 | `components/OracleConversation.tsx` | TS2339 (35) |
| 10 | 58 | `app/api/backend/src/services/ConversationalPipeline.ts` | TS2339 (17) |
| 11 | 58 | `lib/cognitive-engines/soar-planner.ts` | TS2322 (27) |
| 12 | 56 | `app/api/oracle/conversation/route.ts` | TS2339 (24) |
| 13 | 54 | `app/api/backend/src/services/participantContextService.ts` | TS2339 (46) |
| 14 | 52 | `app/api/backend/src/services/archive/comprehensiveAstrologicalService.ts` | TS2339 (48) |
| 15 | 52 | `lib/voice/consciousness/CollectiveIntelligenceProtocols.ts` | TS2345 (48) |
| 16 | 47 | `app/api/backend/src/ain/collective/NeuralReservoir.ts` | TS2339 (30) |
| 17 | 47 | `lib/theme/soullabGradients.ts` | TS2339 (47) |
| 18 | 46 | `lib/ganesha/contacts.ts` | TS2353 (46) |
| 19 | 46 | `lib/intelligence/ElementalBalanceEngine.ts` | TS2339 (46) |
| 20 | 44 | `app/api/backend/src/services/retreatSupportService.ts` | TS2304 (29) |

**Top 20 files account for:** 1,698 errors (19.7% of total)

### Missing Modules (301 total)

**Categories:**
- External modules (need npm install): 123
- Internal modules (broken import paths): 178

**Most Common External:**
- `@/components/*` - UI component imports
- `@/lib/*` - Library module imports
- `@/app/*` - App-level imports
- `@/agents/*` - Agent system imports

**Most Common Internal:**
- `../../lib/maya/*` - Maya orchestration system
- `../../../lib/consciousness/*` - Consciousness framework
- `../../api/*` - API route imports

---

## Triage Strategy: 5-Stage Surgical Repair

### Stage 1: Missing External Dependencies (IMMEDIATE)

**Target:** Fix TS2307 errors (473 total)
**Expected reduction:** ~500 errors
**Timeline:** 1 commit

**Actions:**
```bash
# Install common missing @types packages
npm i -D @types/node@latest
npm i -D @types/uuid
npm i -D @types/express
npm i -D @types/fft-js

# Re-audit
npm run audit:typehealth
```

**Success Criteria:** TS2307 count < 100

---

### Stage 2: Fix Core Runtime Types (HIGH)

**Target:** Resolve type definitions in core consciousness/skill systems
**Expected reduction:** ~1,000 errors
**Timeline:** 2-3 commits

**Focus Files (in order):**
1. `lib/types/dbPlaceholders.ts` - Generate real DB types from schema
2. `lib/consciousness/SkillInvocationTypes.ts` - Core skill system types
3. `lib/field/types.ts` - Field state types
4. `lib/maya/types.ts` - Maya orchestration types

**Actions:**
```bash
# Generate DB types from PostgreSQL schema
npx prisma generate

# Or use pg-to-ts for direct schema introspection
npm i -D @types/pg pg-to-ts
npx pg-to-ts -c postgresql://soullab@localhost:5432/maia_consciousness -o lib/types/database.ts
```

**Success Criteria:** Total errors < 6,000

---

### Stage 3: Consolidate Import Paths (MEDIUM)

**Target:** Fix broken internal module imports (TS2307)
**Expected reduction:** ~300 errors
**Timeline:** 1-2 commits

**Common Issues:**
- Incorrect relative paths (`../../../../../../lib/maya/*`)
- Missing path aliases in `tsconfig.json`
- Moved/renamed files

**Actions:**
```typescript
// Add to tsconfig.json paths:
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./"],
      "@/lib/*": ["./lib/*"],
      "@/components/*": ["./components/*"],
      "@/app/*": ["./app/*"]
    }
  }
}
```

**Success Criteria:** Internal TS2307 errors < 50

---

### Stage 4: Interface Updates (MEDIUM)

**Target:** Fix TS2339 (property not found) errors
**Expected reduction:** ~1,500 errors
**Timeline:** 3-5 commits

**Strategy:**
1. Focus on top offender files first (MobileFirstDesign.tsx, AdvancedSynergyEngine.ts)
2. Add missing properties to interfaces
3. Make optional properties explicit with `?`
4. Update deprecated property names

**Actions:**
```bash
# Fix top offender
code lib/oracle/dashboard/mobile/MobileFirstDesign.tsx

# Re-audit after each file
npm run audit:typehealth
```

**Success Criteria:** Total errors < 3,000

---

### Stage 5: Type Safety Hardening (LOW)

**Target:** Tighten tsconfig strictness gradually
**Expected reduction:** Prevent future regressions
**Timeline:** 1 commit per strictness flag

**Gradual Strictness Increase:**
```json
// tsconfig.json - enable one at a time
{
  "compilerOptions": {
    "strict": false,  // Don't enable all at once
    "strictNullChecks": true,      // Stage 5a
    "noImplicitAny": true,         // Stage 5b
    "strictFunctionTypes": true,   // Stage 5c
    "strictPropertyInitialization": true  // Stage 5d
  }
}
```

**Success Criteria:** Zero new errors introduced by strictness flags

---

## Progress Tracking

### Commands

```bash
# Run type health audit (captures baseline comparison)
npm run audit:typehealth

# Set new baseline after improvements
npm run audit:typehealth -- --set-baseline

# View full error breakdown
cat artifacts/typehealth-report.json | jq '.errorsByType'

# Track progress over time
git log --oneline --grep="type\|fix" -- artifacts/typehealth-baseline.json
```

### Milestones

| Milestone | Target Errors | Status | Tag |
|-----------|---------------|--------|-----|
| Syntax Clean | 0 syntax errors | ✅ DONE | `v0.9.0-syntax-clean` |
| Dependencies Resolved | < 8,000 | 🔄 IN PROGRESS | - |
| Core Types Fixed | < 6,000 | ⏳ PENDING | - |
| Imports Consolidated | < 5,500 | ⏳ PENDING | - |
| Interfaces Updated | < 3,000 | ⏳ PENDING | - |
| Beta Spine Ready | < 500 | ⏳ PENDING | `v0.9.5-type-stable` |
| Production Ready | 0 errors | ⏳ PENDING | `v1.0.0` |

---

## Verification Gates

Before advancing to next stage, all checks must pass:

```bash
# Gate 1: Syntax clean
npm run typecheck 2>&1 | grep -c "error TS1"  # Must be 0

# Gate 2: Supabase clean
npm run check:no-supabase  # Must pass

# Gate 3: Type health improving
npm run audit:typehealth  # Delta must be negative

# Gate 4: Build succeeds
npm run build  # Must complete

# Gate 5: Sovereignty audit stable
npm run audit:sovereignty | grep "CRITICAL" | wc -l  # Should not increase
```

---

## Anti-Patterns to Avoid

### ❌ Don't Do This

1. **Blanket `any` types** - Defeats type safety, hides real issues
   ```typescript
   // BAD
   const config: any = getConfig();
   ```

2. **`@ts-ignore` without explanation** - Technical debt marker
   ```typescript
   // BAD
   // @ts-ignore
   const result = brokenFunction();
   ```

3. **Over-strict too fast** - Enables all strict flags at once, breaks build
   ```json
   // BAD - don't do all at once
   { "strict": true }
   ```

4. **Fixing high-churn files first** - Wastes effort on moving targets
   ```bash
   # BAD - unstable file, will break again
   code lib/experimental/bleeding-edge-feature.ts
   ```

### ✅ Do This Instead

1. **Specific placeholder types** - Clear migration path
   ```typescript
   // GOOD - centralized, documented
   import type { DBClient } from '@/lib/types/dbPlaceholders';
   const client: DBClient = createClient();
   ```

2. **TODOs with context** - Trackable technical debt
   ```typescript
   // GOOD
   // TODO(typefix): Generate from schema - see TYPE_INTEGRITY_ROADMAP.md
   type UserProfile = Record<string, unknown>;
   ```

3. **Gradual strictness** - One flag at a time, measure impact
   ```json
   // GOOD
   { "strictNullChecks": true }  // Enable, test, commit, repeat
   ```

4. **Fix stable core first** - High impact, low churn
   ```bash
   # GOOD - stable file, fixes cascade to many dependents
   code lib/types/core.ts
   ```

---

## Tools & Scripts

### Type Health Audit
```bash
npm run audit:typehealth
```

**Output:**
- Total error count with delta from baseline
- Error distribution by type (TS2339, TS2304, etc.)
- Top 20 offender files
- Missing module list (external vs internal)
- Actionable recommendations

### Quick Checks
```bash
# Count errors by type
npm run typecheck 2>&1 | grep "error TS" | cut -d':' -f2 | sort | uniq -c

# Find files with most errors
npm run typecheck 2>&1 | grep "error TS" | cut -d'(' -f1 | sort | uniq -c | sort -nr | head -20

# Check specific error type
npm run typecheck 2>&1 | grep "TS2307"  # Missing modules
```

### Baseline Management
```bash
# Set new baseline after improvements
npm run audit:typehealth -- --set-baseline

# Compare current vs baseline
cat artifacts/typehealth-baseline.json | jq '.baseline'
```

---

## Communication & Documentation

### Team Briefing

**For developers joining the codebase:**

> We're transitioning from syntax-clean (parser compiles) to type-safe (runtime guarantees). The codebase now parses correctly but has 8,624 type errors to resolve. We're using a 5-stage surgical repair strategy, starting with missing external dependencies (Stage 1) and progressing through core types, imports, interfaces, and strictness hardening.
>
> **Current priority:** Stage 1 (install missing @types packages)
> **Baseline tag:** `v0.9.0-syntax-clean`
> **Progress tracking:** `npm run audit:typehealth`

### Beta Spine Validation Report (Target: < 500 errors)

When type errors drop below 500, create `artifacts/BETA_SPINE_TYPE_VALIDATION.md`:

```markdown
# Beta Spine Type Validation Report

**Date:** [When milestone reached]
**Baseline:** 8,624 errors (v0.9.0-syntax-clean)
**Current:** < 500 errors
**Reduction:** ~93%

## Validation Metrics

- ✅ All core runtime types defined
- ✅ External dependencies resolved
- ✅ Import paths consolidated
- ✅ Critical interfaces updated
- ✅ Build succeeds without warnings
- ✅ Sovereignty checks green

## Remaining Work

[List of known issues, acceptable technical debt]

## Sign-off

Ready for beta deployment.
```

---

## Recovery & Rollback

### If Stage Fails

1. **Identify regression point:**
   ```bash
   git log --oneline --grep="type" -10
   ```

2. **Revert to last good baseline:**
   ```bash
   git checkout v0.9.0-syntax-clean
   git checkout -b recovery-branch
   ```

3. **Re-apply changes incrementally:**
   ```bash
   git cherry-pick <safe-commits>
   npm run audit:typehealth  # Verify after each
   ```

### Baseline Anchors

- `v0.9.0-syntax-clean` - Syntax errors eliminated (current)
- `v0.9.1-deps-resolved` - External dependencies installed (target)
- `v0.9.2-core-types` - Core runtime types defined (target)
- `v0.9.3-imports-fixed` - Import paths consolidated (target)
- `v0.9.4-interfaces-updated` - Critical interfaces complete (target)
- `v0.9.5-type-stable` - Beta spine ready (target)
- `v1.0.0` - Production ready, zero type errors (target)

---

## Next Immediate Actions

1. **Install missing @types packages** (Stage 1)
   ```bash
   npm i -D @types/node@latest @types/uuid @types/express @types/fft-js
   npm run audit:typehealth
   git add package.json package-lock.json
   git commit -m "chore(deps): install missing @types packages (Stage 1)"
   git tag v0.9.1-deps-resolved
   ```

2. **Generate DB types from schema** (Stage 2 prep)
   ```bash
   npx prisma generate
   # Or if Prisma types incomplete:
   npm i -D pg-to-ts
   npx pg-to-ts -c postgresql://soullab@localhost:5432/maia_consciousness -o lib/types/database.ts
   ```

3. **Update type placeholders** (Stage 2)
   ```bash
   # Replace lib/types/dbPlaceholders.ts imports with real DB types
   code lib/types/dbPlaceholders.ts
   ```

4. **Re-audit and commit**
   ```bash
   npm run audit:typehealth
   git commit -am "feat(types): replace placeholders with generated DB types (Stage 2)"
   ```

---

**Status:** Ready to begin Stage 1 (Missing Dependencies)
**Next Milestone:** v0.9.1-deps-resolved (< 8,000 errors)
