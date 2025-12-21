# Module A Launch Checklist — Interface Expansion
**Phase:** 4.2C Type System Harmonization
**Module:** A (Interface Expansion)
**Target:** −900 ± 100 diagnostics
**Effort:** 6–8 hours
**Status:** 🚀 Ready for execution

---

## 📋 Pre-Launch Verification

- [x] Baseline captured: `typehealth-phase4.2c-baseline.log` (6,424 diagnostics)
- [x] Execution plan committed: `PHASE_4_2C_EXECUTION_PLAN.md`
- [x] Results template ready: `PHASE_4_2C_RESULTS.md`
- [x] Automation scripts tested and committed
- [x] Repository tagged: `phase4.2c-start`
- [x] Sovereignty verified: Zero Supabase violations
- [x] Runtime stable: Zero syntax errors

**Status:** ✅ All pre-launch checks passed

---

## 🎯 Module A Objectives

**Primary Goal:** Expand type system vocabulary for consciousness, spiritual, and elemental domains.

**Success Metrics:**
- Total diagnostics: 6,424 → ~5,520 (−900, −14%)
- TS2339 reduction: ~500–600 errors
- TS2304 reduction: ~200–300 errors

**Deliverables:**
1. Expand `ConsciousnessProfile` from 18 → ≥20 properties (target: ~80–100)
2. Create `ChristianFaithContext` with ≥10 properties (target: ~40–50)
3. Create `ElementalFramework` with ≥12 properties (target: ~50–60)
4. Generate 15–20 supporting interfaces from TS2339 patterns
5. Zero unreferenced interfaces (validated by integrity checker)

---

## 🔬 Stage 1: Discovery & Analysis

### 1.1 Run Interface Stub Generator (Dry Run)

```bash
npx tsx scripts/generate-interface-stubs.ts --min-count 5 --dry-run
```

**Purpose:** Preview what interfaces would be generated from recurring TS2339 patterns.

**Expected Output:**
- 4–6 interface categories identified
- 20–30 properties with ≥5 occurrences
- Semantic clusters: consciousness, spiritual, elemental, wisdom, reflection, etc.

**Checkpoint:**
- [ ] Dry run completed successfully
- [ ] Categories align with domain architecture
- [ ] No unexpected property clusters

### 1.2 Review Current Interface Stubs

```bash
# ConsciousnessProfile (current: 18 properties)
cat lib/types/cognitive/ConsciousnessProfile.ts

# ChristianFaithContext (may not exist yet)
cat lib/types/spiritual/ChristianFaithContext.ts 2>/dev/null || echo "To be created"

# ElementalFramework (may not exist yet)
cat lib/types/elemental/ElementalFramework.ts 2>/dev/null || echo "To be created"
```

**Checkpoint:**
- [ ] Current state of core interfaces documented
- [ ] Property expansion targets confirmed

### 1.3 Analyze TS2339 Error Patterns

```bash
# Find most common missing properties in consciousness domain
grep "TS2339" artifacts/typecheck-full.log | grep -i "consciousness\|cognitive\|awareness" | head -20

# Find most common missing properties in spiritual domain
grep "TS2339" artifacts/typecheck-full.log | grep -i "faith\|christian\|pastoral\|spiritual" | head -20

# Find most common missing properties in elemental domain
grep "TS2339" artifacts/typecheck-full.log | grep -i "elemental\|earth\|water\|fire\|air" | head -20
```

**Checkpoint:**
- [ ] Top 10 consciousness properties identified
- [ ] Top 10 spiritual properties identified
- [ ] Top 10 elemental properties identified

---

## ✏️ Stage 2: Interface Expansion (Manual Work)

### 2.1 Expand ConsciousnessProfile

**File:** `lib/types/cognitive/ConsciousnessProfile.ts`
**Current:** 18 properties
**Target:** ≥20 properties (recommended: 80–100 for comprehensive coverage)

**Properties to add (from TS2339 analysis):**
- [ ] `coherence?: number` (35 occurrences)
- [ ] `integrationLevel?: 'nascent' | 'developing' | 'stable' | 'transcendent'`
- [ ] `awarenessDepth?: number` (0–100 scale)
- [ ] `perceptualClarity?: number`
- [ ] `cognitiveFlexibility?: number`
- [ ] Add 15+ domain-specific properties based on error analysis

**Quality Standards:**
- Each property has JSDoc comment explaining purpose
- Types are specific (avoid `any`)
- Optional (`?:`) unless universally required
- Group related properties with comment headers

**Checkpoint:**
- [ ] Interface expanded to ≥20 properties
- [ ] All properties documented
- [ ] No `any` types used
- [ ] File saved and syntax-checked

### 2.2 Create/Expand ChristianFaithContext

**File:** `lib/types/spiritual/ChristianFaithContext.ts`
**Current:** May not exist
**Target:** ≥10 properties (recommended: 40–50)

**Core properties to include:**
- [ ] `denominationTradition?: string`
- [ ] `spiritualPractices?: string[]`
- [ ] `prayerFrequency?: 'daily' | 'weekly' | 'occasional' | 'rare'`
- [ ] `scriptureEngagement?: 'regular' | 'occasional' | 'minimal'`
- [ ] `communityInvolvement?: 'active' | 'moderate' | 'minimal'`
- [ ] `faithJourneyStage?: string`
- [ ] `pastoralNeeds?: string[]`
- [ ] `theologicalConcerns?: string[]`
- [ ] Add 10+ properties based on pastoral care patterns

**Checkpoint:**
- [ ] Interface created with ≥10 properties
- [ ] Pastoral care semantics captured
- [ ] All properties documented
- [ ] File saved and syntax-checked

### 2.3 Create/Expand ElementalFramework

**File:** `lib/types/elemental/ElementalFramework.ts`
**Current:** May not exist
**Target:** ≥12 properties (recommended: 50–60)

**Core properties to include:**
- [ ] `earth?: ElementalState` (grounding, stability, embodiment)
- [ ] `water?: ElementalState` (flow, emotion, intuition)
- [ ] `fire?: ElementalState` (transformation, passion, will)
- [ ] `air?: ElementalState` (clarity, thought, communication)
- [ ] `balance?: number` (inter-elemental harmony)
- [ ] `dominantElement?: 'earth' | 'water' | 'fire' | 'air'`
- [ ] `elementalHistory?: ElementalEvent[]`
- [ ] Add 10+ properties for alchemical integration patterns

**Supporting type needed:**
```typescript
interface ElementalState {
  intensity?: number;        // 0–100
  coherence?: number;        // 0–100
  lastActivation?: Date;
  qualities?: string[];
}
```

**Checkpoint:**
- [ ] Interface created with ≥12 properties
- [ ] Supporting types defined
- [ ] Alchemical semantics captured
- [ ] File saved and syntax-checked

### 2.4 Generate Supporting Interfaces

```bash
# Generate stubs from TS2339 patterns (actual run, not dry-run)
npx tsx scripts/generate-interface-stubs.ts --min-count 5
```

**Expected Output:**
- `lib/types/generated/` directory created
- 15–20 interface stub files generated
- Barrel export `lib/types/generated/index.ts` created

**Manual refinement required:**
- [ ] Review each generated interface
- [ ] Replace `any` types with specific types
- [ ] Add JSDoc documentation
- [ ] Merge similar interfaces if >90% overlap detected

**Checkpoint:**
- [ ] All generated stubs reviewed
- [ ] Types refined (no `any` remaining)
- [ ] Documentation added
- [ ] Barrel export verified

---

## 🔗 Stage 3: Propagation & Integration

### 3.1 Add Type Imports to Consuming Files

```bash
npx tsx scripts/add-missing-type-imports.ts
```

**Purpose:** Automatically add import statements for new types to files that reference them.

**Expected Changes:**
- 200–400 files updated with new import statements
- Imports inserted after existing imports, before code

**Checkpoint:**
- [ ] Import propagation completed
- [ ] No syntax errors introduced
- [ ] Sample files spot-checked for correct imports

### 3.2 Update Barrel Exports

**File:** `lib/types/index.ts`

**Add exports for new interfaces:**
```typescript
// Cognitive interfaces
export type { ConsciousnessProfile } from './cognitive/ConsciousnessProfile';

// Spiritual interfaces
export type { ChristianFaithContext } from './spiritual/ChristianFaithContext';

// Elemental interfaces
export type { ElementalFramework, ElementalState } from './elemental/ElementalFramework';

// Generated interfaces
export * from './generated';
```

**Checkpoint:**
- [ ] All new interfaces exported from barrel
- [ ] Barrel export syntax valid
- [ ] No duplicate exports

---

## 📊 Stage 4: Measurement & Validation

### 4.1 Capture Checkpoint Metrics

```bash
npm run audit:typehealth > artifacts/typehealth-phase4.2c-A1.log
```

**Expected Duration:** 2–3 minutes

**Checkpoint:**
- [ ] Audit completed successfully
- [ ] Log file created: `typehealth-phase4.2c-A1.log`

### 4.2 Update Results Document

```bash
npx tsx scripts/update-phase-results.ts A artifacts/typehealth-phase4.2c-A1.log
```

**Expected Output:**
```
📊 Module A Checkpoint Summary:
   Previous:  6,424 errors
   Current:   5,520 errors  (target)
   Delta:     -904 (-14.1%)

📄 Updated: artifacts/PHASE_4_2C_RESULTS.md
```

**Checkpoint:**
- [ ] Results document updated with A1 metrics
- [ ] Delta within target range (−900 ± 100)
- [ ] Metrics table populated with checkmarks

### 4.3 Validate Integration Integrity

```bash
npx tsx scripts/verify-harmonization-integrity.ts --module A --strict
```

**Expected Report:**
```
📊 HARMONIZATION INTEGRITY REPORT
✅ ConsciousnessProfile: 85 properties (target: ≥20) ✓
✅ ChristianFaithContext: 42 properties (target: ≥10) ✓
✅ ElementalFramework: 58 properties (target: ≥12) ✓
✅ No unreferenced interfaces
✅ No duplicate interfaces
✅ All barrel exports valid
```

**Checkpoint:**
- [ ] All core interfaces meet property thresholds
- [ ] Zero unreferenced generated interfaces
- [ ] Zero duplicate interface names
- [ ] Exit code 0 (strict mode passed)

---

## 📝 Stage 5: Documentation & Commit

### 5.1 Review Results

```bash
# View updated results
cat artifacts/PHASE_4_2C_RESULTS.md | grep -A 20 "Module A"

# View integrity report summary
npx tsx scripts/verify-harmonization-integrity.ts | tail -20
```

**Checkpoint:**
- [ ] Results document shows target achievement
- [ ] All validation checks passed
- [ ] Ready for commit

### 5.2 Commit Changes

```bash
git add lib/types/ artifacts/

git commit -m "checkpoint: Phase 4.2C Module A complete – Interface Expansion

Module A expands MAIA type vocabulary for consciousness, spiritual, and
elemental domains through comprehensive interface definitions.

CORE INTERFACES EXPANDED
  ConsciousnessProfile: 18 → [X] properties
  ChristianFaithContext: Created with [X] properties
  ElementalFramework: Created with [X] properties

GENERATED INTERFACES
  [X] supporting interfaces from TS2339 pattern analysis
  All stubs refined with specific types (zero 'any' remaining)

METRICS
  Total diagnostics: 6,424 → [X] ([Δ%])
  TS2339 reduction: [X] errors
  TS2304 reduction: [X] errors

VALIDATION
  ✅ All core interfaces meet property thresholds
  ✅ Zero unreferenced interfaces
  ✅ Zero duplicate definitions
  ✅ All barrel exports valid
  ✅ Integrity validation passed (strict mode)

ARTIFACTS
  lib/types/cognitive/ConsciousnessProfile.ts (expanded)
  lib/types/spiritual/ChristianFaithContext.ts (created)
  lib/types/elemental/ElementalFramework.ts (created)
  lib/types/generated/* ([X] interfaces)
  artifacts/typehealth-phase4.2c-A1.log
  artifacts/PHASE_4_2C_RESULTS.md (updated)

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Checkpoint:**
- [ ] Commit created with complete summary
- [ ] All changed files staged

### 5.3 Tag Checkpoint

```bash
git tag -a phase4.2c-A1-complete -m "Phase 4.2C Module A – Interface Expansion complete

Expanded type vocabulary for consciousness, spiritual, and elemental domains.

Diagnostics: 6,424 → [X] (−[X], −[X]%)
Interfaces: 3 core + [X] generated
Validation: All integrity checks passed"
```

**Checkpoint:**
- [ ] Tag created: `phase4.2c-A1-complete`
- [ ] Tag message includes final metrics

### 5.4 Verify Tag

```bash
git log --oneline -1
git tag -l "phase4.2c-A1*"
git show phase4.2c-A1-complete --stat
```

**Checkpoint:**
- [ ] Tag verified and visible
- [ ] Commit shows correct file changes

---

## ✅ Module A Completion Criteria

**All criteria must be met:**

### Quantitative Metrics
- [ ] Total diagnostics reduced by 800–1,000 (−12% to −16%)
- [ ] TS2339 errors reduced by ≥500
- [ ] TS2304 errors reduced by ≥200
- [ ] Final count: 5,300–5,700 diagnostics

### Qualitative Metrics
- [ ] ConsciousnessProfile has ≥20 properties (all documented)
- [ ] ChristianFaithContext has ≥10 properties (all documented)
- [ ] ElementalFramework has ≥12 properties (all documented)
- [ ] All generated interfaces refined (zero `any` types)
- [ ] 15–20 supporting interfaces created

### Validation Metrics
- [ ] Integrity validator passes in strict mode
- [ ] Zero unreferenced interfaces
- [ ] Zero duplicate interface definitions
- [ ] All barrel exports valid and complete
- [ ] No syntax errors (`tsc --noEmit` passes)

### Documentation Metrics
- [ ] Results document updated with checkpoint metrics
- [ ] Commit message includes complete summary
- [ ] Tag created with final metrics
- [ ] All artifacts committed

---

## 🚨 Troubleshooting

### Issue: Integrity validator reports unreferenced interfaces

**Solution:**
```bash
# Find files that should import the interface
grep -r "propertyName" lib/ app/ components/ --include="*.ts" --include="*.tsx"

# Add import manually or re-run import propagation
npx tsx scripts/add-missing-type-imports.ts
```

### Issue: Generated interfaces have >90% overlap

**Solution:**
- Merge similar interfaces into one comprehensive definition
- Update references to use unified interface
- Delete redundant interface file
- Update barrel export

### Issue: Delta not meeting target (less than −800)

**Solution:**
- Review TS2339 errors for additional property patterns
- Expand core interfaces with more properties
- Lower `--min-count` threshold on generator (try `--min-count 3`)
- Add more properties to generated stubs

### Issue: Syntax errors after import propagation

**Solution:**
```bash
# Find syntax errors
npm run typecheck 2>&1 | grep "error TS1"

# Check specific file
cat [file-with-error]

# Common issues:
# - Import inserted inside comment block
# - Import inserted inside export declaration
# - Re-run import script or fix manually
```

---

## 📈 Post-Module A Next Steps

**After Module A completion:**
1. Review Module B execution plan (Path Normalization)
2. Prepare for Module B launch (3–4 hour effort)
3. Expected Module B target: 5,300 → 5,100 (−200, −4%)

**Module A establishes semantic foundation for:**
- Module B: Import path consistency
- Module C: Component architecture cleanup
- Phase 5: Production readiness and Supabase migration

---

## 🎯 Module A Summary

**What Module A achieves:**
- Comprehensive type vocabulary for consciousness computing domains
- Foundation for all subsequent type system work
- 70% of Phase 4.2C total error reduction goal
- Scientific baseline for semantic harmonization

**Time investment:** 6–8 hours
**ROI:** ~120–150 errors reduced per hour
**Risk:** Low (pure TypeScript, zero runtime changes)
**Reversibility:** Complete (`git reset --hard phase4.2c-start`)

---

**Ready to begin Module A execution.** 🚀

**Launch command:**
```bash
npx tsx scripts/generate-interface-stubs.ts --min-count 5 --dry-run
```
