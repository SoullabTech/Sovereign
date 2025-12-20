# Phase 4.2C — Type System Harmonization • EXECUTION PLAN
**Status:** 🚧 In Progress
**Date:** 2025-12-20
**Current Baseline:** 6,428 diagnostics (8,621 → 6,428 = −25.4%)
**Target:** ≈ 5,200 diagnostics (−1,200 ± 150 ≈ 19% reduction)
**Phase Lead:** Kelly Soullab
**Previous Tag:** `phase4.2b-complete`
**Next Tag:** `phase4.2c-complete`
---

## 1  Executive Summary
Phase 4.2C advances the MAIA Sovereign Type System from **stabilized** to **harmonized**.
Where Phase 4.2B established mechanical stability and sovereignty, 4.2C aligns semantic,
architectural, and component layers for consistent type behavior across the entire codebase.
Supabase migration is **deferred to Phase 5** to protect runtime sovereignty.

**Primary Goals**
1. Expand and refine core interfaces (ConsciousnessProfile etc.).
2. Normalize module paths to barrel imports (`@/lib/*`).
3. Clean and modularize component architecture.
4. Deliver quantified error reduction ≈ −1,200 diagnostics.

---

## 2  Objectives & Success Metrics
| Metric | Baseline | Target | Δ (Goal) |
|:--|:--:|:--:|:--:|
| Total Diagnostics | 6,428 | 5,200 ± 100 | −1,200 (−19%) |
| TS2304 (Cannot find name) | 1,227 | ≤ 700 | −527 |
| TS2307 (Cannot find module) | 266 | ≤ 150 | −116 |
| TS2339 (Property not found) | 2,747 | ≤ 2,500 | −247 |
| Syntax Errors | 0 | 0 | Maintain 0 |

Verification uses `npm run audit:typehealth` and automated diff scripts.

---

## 3  Scope & Boundaries
**In Scope**
- TypeScript interface creation and expansion.
- Import path refactoring (`@/lib` aliases only).
- Component file organization and cleanup.
- Documentation artifacts under `artifacts/` and `Community-Commons/`.

**Out of Scope**
- Any runtime logic change.
- Database or Supabase migrations (Phase 5).
- Security infrastructure (modules frozen at v0.9.6).

---

## 4  Phase Structure (Three Modules)
### 4.1 Module A — Interface Expansion (6–8 h)
**Objective:** Create and extend core semantic interfaces.
**Actions**
- Expand `ConsciousnessProfile` → ~300 lines.
- Expand `ChristianFaithContext` → ~150 lines.
- Expand `ElementalFramework` → ~180 lines.
- Generate 15–20 new interfaces from TS2339 clusters.
**Tools:** `analyze-ts-errors.ts`, `generate-interface-stubs.ts`.
**Expected Δ:** −900 ± 100 diagnostics (≈ 70% of phase gain).

### 4.2 Module B — Path Normalization (3–4 h)
**Objective:** Standardize import routes and remove broken relatives.
**Actions**
- Replace `../../lib/...` with `@/lib/...`.
- Fix incorrect extensions (.js → .ts).
- Update `tsconfig.json` paths map.
**Expected Δ:** −225 ± 25 diagnostics.

### 4.3 Module C — Component Cleanup (2–3 h)
**Objective:** Resolve undefined design-mockup components.
**Actions**
- Review `MobileFirstDesign.tsx` and similar files.
- Extract valid sub-components or exclude mockups.
- Normalize React imports (useState etc.).
**Expected Δ:** −100 ± 20 diagnostics.

---

## 5  Methodology & Workflow
1. **Baseline Capture**
   ```bash
   npm run audit:typehealth > artifacts/typehealth-phase4.2c-baseline.log
   git tag -a phase4.2c-start -m "Begin Phase 4.2C – Harmonization Baseline"
   ```

2. **Iterative Execution**
   - Run each module independently.
   - Commit and tag after each checkpoint.

3. **Quantitative Validation**
   - Run audit again; compare Δ.
   - Record results in `artifacts/PHASE_4_2C_RESULTS.md`.

4. **Rollback Strategy**
   - Use previous tag to restore (`git reset --hard phase4.2c-start`).

---

## 6  Verification Checkpoints
| Checkpoint | Trigger | Verification | Artifact |
|:--|:--|:--|:--|
| A-1 | Post-Interface expansion | Error count < 5,700 | `typehealth-phase4.2c-A1.log` |
| B-1 | Post-Path normalization | Imports resolve + error count < 5,400 | `typehealth-phase4.2c-B1.log` |
| C-1 | Post-Component cleanup | Error count ≈ 5,200 | `typehealth-phase4.2c-C1.log` |
| F-1 | Final Verification | All tests pass + docs updated | `PHASE_4_2C_RESULTS.md` |

---

## 7  Risk & Mitigation Matrix
| Risk | Likelihood | Impact | Mitigation |
|:--|:--|:--|:--|
| Over-expansion of interfaces | M | M | Use incremental commits + `tsc --noEmit` dry runs. |
| Alias path conflicts | M | L | Centralize in `tsconfig.json`. |
| Component exclusion breaks imports | L | M | Run `find-unused-imports.ts` after cleanup. |
| Regression of security scripts | L | L | No touch to `scripts/security-*.sh`. |
| Fatigue / context loss | M | H | Document after each sub-module before pause. |

---

## 8  Documentation Integration Plan
| Artifact | Purpose | Linked Docs |
|:--|:--|:--|
| `PHASE_4_2C_EXECUTION_PLAN.md` | Operational guide | — (this file) |
| `PHASE_4_2C_RESULTS.md` | Post-execution metrics | ✅ to be created |
| `PHASE_4_2B_COMPLETION_SUMMARY.md` | Historical context | reference |
| `DOCUMENTATION_INDEX.md` | Navigation update | add Phase 4.2C link |
| `TYPE_SYSTEM_IMPROVEMENT_LOG.md` | Continuity record | append Phase 4.2C entries |

---

## 9  Commit & Tag Discipline
| Stage | Commit Message Pattern | Tag |
|:--|:--|:--|
| Module A | `feat(types): Phase 4.2C Module A – Interface Expansion complete` | `phase4.2c-A1-complete` |
| Module B | `refactor(paths): Phase 4.2C Module B – Path Normalization done` | `phase4.2c-B1-complete` |
| Module C | `cleanup(components): Phase 4.2C Module C – Design cleanup done` | `phase4.2c-C1-complete` |
| Phase End | `docs(types): Phase 4.2C Complete – Harmonization achieved` | `phase4.2c-complete` |

---

## 10  Closure Criteria
✅ All checkpoints pass with target Δ reached.
✅ No syntax errors or security violations.
✅ All artifacts documented and indexed.
✅ Tag `phase4.2c-complete` created and verified.

---

## 11  Appendix — CLI Reference
```bash
# Baseline capture
npm run audit:typehealth > artifacts/typehealth-phase4.2c-baseline.log

# Run interface module
npx tsx scripts/generate-interface-stubs.ts
npm run audit:typehealth > artifacts/typehealth-phase4.2c-A1.log

# Run path normalization
npx tsx scripts/fix-imports.ts
npm run audit:typehealth > artifacts/typehealth-phase4.2c-B1.log

# Run component cleanup
npx tsx scripts/find-unused-components.ts --fix
npm run audit:typehealth > artifacts/typehealth-phase4.2c-C1.log

# Compare metrics
tsx scripts/compare-typehealth.ts artifacts/typehealth-phase4.2b-complete.log artifacts/typehealth-phase4.2c-C1.log

# Final verification
bash scripts/security-audit.sh
npm test
```

---

## 12  Notes for Future Phases
- Phase 5 (Production Readiness) will include Supabase migration, runtime validation, and performance profiling.
- Phase 4.2C results will serve as empirical type baseline for kernel integration.
- Security systems remain active and must be verified at each major tag.

---

## 13  Sign-Off
**Prepared by:** Kelly Soullab
**Reviewed by:** MAIA System Architect (Autonomous Oversight)
**Version:** v0.9.7-phase4.2c-plan
**Signature:** `sha256(phase4.2b-complete → phase4.2c-plan)`

> *"Harmony is not the absence of difference, but the synchronization of distinct intelligences within a sovereign whole."*

---
