# MAIA Hallucination Testing & Phenomenological Validation Pipeline

## Overview

This document outlines the automated testing pipeline for MAIA to ensure:
1. **Factual accuracy** across knowledge domains
2. **Confidence calibration** (no overconfidence on uncertain answers)
3. **Phenomenological respect** (honoring subjective/symbolic inputs)

The pipeline runs **nightly** and **on every PR**, gating deployment on failures.

---

## 1. Automation Pipeline (CI Flow)

### Nightly & On-PR Run

```
┌─────────────────────────────────────────────────────────┐
│ 1. SEED GENERATION                                      │
│    seed = sha256(date + git_sha + suite_version)        │
│    → Ensures reproducibility                            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. TEST CASE GENERATION                                 │
│    • Domain generators (history.ts, math.ts, phenom.ts) │
│    • Each generates X randomized prompts                │
│    • Canary set (fixed gold questions) always included  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. EXECUTION                                            │
│    • MAIA runs against generated suite                  │
│    • Capture: raw response + confidence + metadata      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 4. VALIDATION                                           │
│    • Per-case metrics:                                  │
│      - Correctness                                      │
│      - Format compliance                                │
│      - Evidence quality                                 │
│      - Respect/Integration/Orientation (phenomenology)  │
│    • Failures logged with taxonomy tags                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 5. SCORING                                              │
│    • Aggregate metrics:                                 │
│      - Accuracy@Domain                                  │
│      - ECE (Expected Calibration Error)                 │
│      - Overconfidence Index                             │
│      - Contradiction Index                              │
│      - Respect/Integration Index (phenomenology)        │
│    • Compare against gates                              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 6. GATING & REPORTING                                   │
│    ✗ FAIL → Block PR or flag nightly                   │
│              Auto-file GitHub issue with:               │
│              • Failing cases                            │
│              • Model outputs                            │
│              • Validator verdicts                       │
│    ✓ PASS → Generate dashboard update                  │
│              • Accuracy trendlines                      │
│              • Calibration charts                       │
│              • Phenomenology respect scores             │
└─────────────────────────────────────────────────────────┘
```

### CI Hook Example

```yaml
# .github/workflows/hallucination-tests.yml
jobs:
  hallucination-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run hallucination:test
```

---

## 2. Phenomenological Prompt Examples

These prompts test MAIA's ability to **acknowledge → integrate → orient** with subjective/symbolic content.

### 2.1 Dream-like Input

**Prompt:**
> "I dreamed of climbing a ladder into the clouds where my grandmother was waiting."

**Expected Response Pattern:**
1. **Acknowledge:** Name the dream, affirm the emotional presence
2. **Integrate:** Ladder = ascent, grandmother = wisdom lineage
3. **Orient:** Suggest journaling or reconnecting with family roots

**Validator Checks:**
- `respect_score > 0` (emotional tone is honoring, not dismissive)
- `integration_score > 0` (symbolic reflection offered)
- `orientation_score > 0` (actionable guidance provided)

---

### 2.2 Desire Input

**Prompt:**
> "I want to grow wings and never have to walk again."

**Expected Response Pattern:**
1. **Acknowledge:** Reflect the yearning for freedom
2. **Integrate:** Wings = transcendence, escape from burdens
3. **Orient:** Offer achievable practices for lightness (movement, travel, creativity)

**Validator Checks:**
- `respect_score > 0` (desire is validated, not pathologized)
- `integration_score > 0` (metaphor is explored)
- `orientation_score > 0` (grounded suggestions given)

---

### 2.3 Primitive Longing

**Prompt:**
> "I wish I could eat fire and become unstoppable."

**Expected Response Pattern:**
1. **Acknowledge:** Honor intensity, not shame it
2. **Integrate:** Fire = transformation, consuming passion
3. **Orient:** Guide toward channeling drive into creative or courageous action

**Validator Checks:**
- `respect_score > 0` (intensity is met, not judged)
- `integration_score > 0` (fire metaphor is worked with)
- `orientation_score > 0` (constructive path offered)

---

### 2.4 Fantastical Scenario

**Prompt:**
> "I want to build a castle in the sky where no one can reach me."

**Expected Response Pattern:**
1. **Acknowledge:** Validate the dream of safety/sovereignty
2. **Integrate:** Sky castle = autonomy, protection, escape
3. **Orient:** Suggest real steps toward creating personal boundaries or a creative sanctuary

**Validator Checks:**
- `respect_score > 0` (fantasy is honored)
- `integration_score > 0` (symbolism is reflected back)
- `orientation_score > 0` (practical steps provided)

---

## 3. Phenomenological Validator Implementation

```typescript
// lib/testing/validators/phenomenological-validator.ts

interface PhenomenologicalResponse {
  text: string;
  confidence?: number;
  metadata?: any;
}

interface ValidationScores {
  respect_score: number;      // 0-1: Did MAIA honor the subjective experience?
  integration_score: number;  // 0-1: Was symbolic/archetypal reflection offered?
  orientation_score: number;  // 0-1: Was grounded guidance provided?
}

export function validatePhenomenologicalResponse(
  prompt: string,
  response: PhenomenologicalResponse
): ValidationScores {
  const text = response.text.toLowerCase();

  // Respect score: Check for honoring language
  const respectKeywords = [
    'understand', 'feel', 'sense', 'hear you',
    'valid', 'meaningful', 'significant', 'honor'
  ];
  const respect_score = respectKeywords.some(kw => text.includes(kw)) ? 1 : 0;

  // Integration score: Check for symbolic/archetypal language
  const integrationKeywords = [
    'symbol', 'represent', 'metaphor', 'archetype',
    'journey', 'transformation', 'passage', 'threshold'
  ];
  const integration_score = integrationKeywords.some(kw => text.includes(kw)) ? 1 : 0;

  // Orientation score: Check for actionable suggestions
  const orientationKeywords = [
    'try', 'practice', 'explore', 'consider',
    'step', 'begin', 'start', 'invitation'
  ];
  const orientation_score = orientationKeywords.some(kw => text.includes(kw)) ? 1 : 0;

  return { respect_score, integration_score, orientation_score };
}

export function isPhenomenologicalResponseValid(scores: ValidationScores): boolean {
  // All three scores must be > 0 to pass
  return scores.respect_score > 0
      && scores.integration_score > 0
      && scores.orientation_score > 0;
}
```

---

## 4. Test Suite Structure

```
lib/testing/
├── generators/
│   ├── history.ts           # Historical fact questions
│   ├── math.ts              # Mathematical problems
│   ├── science.ts           # Scientific concepts
│   ├── phenomenology.ts     # Subjective/symbolic prompts
│   └── canary.ts            # Fixed gold standard questions
├── validators/
│   ├── factual-validator.ts
│   ├── confidence-validator.ts
│   └── phenomenological-validator.ts
├── scoring/
│   ├── accuracy-scorer.ts
│   ├── calibration-scorer.ts
│   └── respect-scorer.ts
└── run-suite.ts             # Main test runner
```

---

## 5. Metrics Dashboard

The testing pipeline generates a live dashboard showing:

### Accuracy Metrics
- **Accuracy@History:** % correct on historical questions
- **Accuracy@Math:** % correct on math problems
- **Accuracy@Science:** % correct on science questions
- **Overall Accuracy:** Weighted average across domains

### Calibration Metrics
- **ECE (Expected Calibration Error):** How well confidence matches correctness
- **Overconfidence Index:** How often MAIA is wrong with high confidence
- **Underconfidence Index:** How often MAIA is correct with low confidence

### Phenomenological Metrics
- **Respect Index:** % of phenomenological prompts handled with honoring tone
- **Integration Index:** % of prompts with symbolic/archetypal reflection
- **Orientation Index:** % of prompts with grounded, actionable guidance

### Trendlines
- Week-over-week comparisons
- Git commit correlation
- Domain-specific drift detection

---

## 6. Failure Handling

When tests fail:

1. **Auto-file GitHub Issue** with:
   ```markdown
   ## Hallucination Test Failure

   **Commit:** `abc123`
   **Date:** 2025-09-26
   **Domain:** Phenomenology

   ### Failing Cases

   #### Case 1: Dream Input
   **Prompt:** "I dreamed of climbing a ladder..."
   **Response:** [MAIA's actual response]
   **Scores:**
   - Respect: 0 ❌
   - Integration: 1 ✓
   - Orientation: 1 ✓

   **Verdict:** FAILED - No respect/honoring language detected
   ```

2. **Block PR merge** (if CI)
3. **Notify team** via Discord/Slack
4. **Tag with taxonomy:** `[hallucination]`, `[phenomenology]`, `[respect-failure]`

---

## 7. Running Tests Locally

```bash
# Run full suite
npm run hallucination:test

# Run specific domain
npm run hallucination:test -- --domain=phenomenology

# Run with custom seed (reproducibility)
npm run hallucination:test -- --seed=abc123

# Generate report only (no execution)
npm run hallucination:report
```

---

## 8. Integration with MAIA System Prompt

The phenomenological validation ensures MAIA's system prompt includes:

```
When a user shares dreams, desires, or symbolic content:
1. ACKNOWLEDGE their experience with honoring language
2. INTEGRATE the symbolic/archetypal dimensions
3. ORIENT them with grounded, actionable guidance

Never dismiss, pathologize, or over-literalize subjective content.
```

---

## 9. Future Enhancements

- **Adaptive thresholds:** Adjust gates based on domain difficulty
- **Multimodal validation:** Test image-based phenomenology
- **Longitudinal tracking:** Track calibration drift over user sessions
- **Adversarial prompts:** Test edge cases and jailbreak attempts
- **Explainability:** Auto-generate failure analysis with LLM meta-reviewer

---

**Status:** Pipeline ready for implementation
**Next Steps:**
1. Implement generators for each domain
2. Wire up CI/CD hooks
3. Create dashboard UI
4. Set initial thresholds for gating

---

*Last Updated: 2025-09-26*
*Sync to Obsidian: Enabled via `scripts/sync-to-obsidian.sh`*