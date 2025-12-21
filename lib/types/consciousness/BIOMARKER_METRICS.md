# Biomarker Metrics Contract (Phase 4.2D)

This file defines how numeric metrics in `biomarkers.ts` must be documented and interpreted.

## Required rule

Every `number` field MUST specify its unit or normalized range in a trailing comment or JSDoc.

**Examples:**
```typescript
intensity: number;        // 0-1: Intensity of current phase experience
overall: number;          // 0-100: Composite transformation score
safetySignal: number;     // 0-1: Felt sense of safety
heartRate?: number;       // bpm: Beats per minute
```

## Accepted unit/range hints

The automated validator (`scripts/report-biomarker-metrics.ts`) enforces this via regex:

```regex
/\b(0\s*[-–]\s*1|0\s*\.\.\s*1|0\s*to\s*1|0\s*[-–]\s*100|0\s*to\s*100|%|percent|percentage|ms|millisecond|s\b|sec|second|seconds|hz|bpm|°c|celsius|fahrenheit|ratio|probability|likelihood|score|index|z-score|std)\b/i
```

**Valid patterns:**
- `0-1`, `0–1`, `0 to 1`, `0..1` (normalized range)
- `0-100`, `0–100`, `0 to 100` (percentage range)
- `%`, `percent`, `percentage`
- `ms`, `millisecond`, `milliseconds`
- `s`, `sec`, `second`, `seconds`
- `hz`, `bpm`
- `°c`, `celsius`, `fahrenheit`
- `ratio`, `probability`, `likelihood`, `score`, `index`, `z-score`, `std`

## Convention: 0-1 vs 0-100

**Use 0-1** for:
- Normalized probabilities (e.g., `breakthroughPotential: 0.75`)
- Intensity/activation levels (e.g., `intensity: 0.85`)
- Safety signals (e.g., `safetySignal: 0.9`)
- Correlations/significance (e.g., `significance: 0.92`)

**Use 0-100** for:
- Percentages (e.g., `completionPercentage: 60`)
- Scores (e.g., `overall: 72`)
- Progress metrics (e.g., `elementProgress: 35`)

## Enforcement

Run the automated validator:

```bash
npm run biomarkers:report
```

This generates `artifacts/phase4.2d-metric-doc-report.md` with:
- Total numeric metrics found
- Documented vs undocumented count
- Coverage percentage
- Table of violations (if any)

**Exit code:**
- `0` = 100% coverage ✅
- `1` = Missing documentation 🚨

## Integration with CI/CD

Add to your GitHub Actions workflow:

```yaml
- name: Validate biomarker metric documentation
  run: npm run biomarkers:report
```

This ensures all future numeric fields include proper unit/range hints.

---

**Phase 4.2D Phase 5 — Metrics Validation & Documentation**
**Generated**: 2025-12-21
**Validator**: `scripts/report-biomarker-metrics.ts`
