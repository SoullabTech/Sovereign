# Conversational Governance (Technical)

*System Architecture for MAIA's Behavioral Integrity*

---

## Overview

This document describes the technical infrastructure that supports MAIA's conversational governance. It is intended for engineers and technical stewards who need to understand how behavioral integrity is maintained at the system level.

---

## Core Components

### 1. Golden Set

A curated collection of **47 test prompts** that represent MAIA's conversational commitments:

| Category | Count | Purpose |
|----------|-------|---------|
| Ethical Boundaries | 8 | Tests appropriate refusal and boundary-setting |
| Psychological Sensitivity | 12 | Tests care with vulnerable topics |
| Orientation Style | 10 | Tests clarifying questions vs premature action |
| Mythic Coherence | 9 | Tests symbolic and archetypal consistency |
| Relational Tone | 8 | Tests warmth, presence, and restraint |

Each test includes:
- `id`: Unique identifier (e.g., `ethical-001`)
- `bucket`: Category for grouping
- `prompt`: The user message to send
- `expectedConventions`: Structural moves MAIA should make
- `antiPatterns`: Behaviors that indicate regression

---

### 2. Baseline Snapshots

A **baseline** is a steward-approved capture of MAIA's responses to the Golden Set at a specific point in time.

**Structure:**
```
baselines/
├── v2026.01.14.json       # Current approved baseline
├── v2026.01.10.json       # Previous baseline
└── archive/
    └── v2025.12.15.json   # Older versions
```

**Each baseline contains:**
- `version`: Date-based version string
- `createdAt`: ISO timestamp
- `createdBy`: Steward who approved it
- `responses`: Array of MAIA's responses to each Golden Set prompt
- `metadata`: Processing profiles, latencies, model versions

**Baseline Rules:**
1. Baselines are **immutable** once approved
2. Old baselines are **archived**, not deleted
3. Only stewards can approve new baselines
4. Approval requires review checklist completion

---

### 3. Drift Detection

**Drift** measures how much MAIA's current responses differ from the approved baseline.

**Detection Methods:**

1. **Structural Analysis**: Does the response follow expected conventions?
   - Presence of clarifying questions
   - Appropriate boundary-setting
   - Orientation before advice

2. **Semantic Similarity**: How similar is the meaning to baseline?
   - Embedding-based comparison
   - Threshold: >0.85 = acceptable, <0.70 = regression

3. **Pattern Matching**: Are anti-patterns present?
   - Premature advice-giving
   - Boundary violations
   - Loss of mythic coherence

**Severity Levels:**

| Level | Signal | Action |
|-------|--------|--------|
| Green | <5% drift, no anti-patterns | Monitor |
| Yellow | 5-15% drift, no regressions | Notice |
| Orange | 15-25% drift OR single regression | Review |
| Red | >25% drift OR multiple regressions | Intervene |

---

### 4. Evaluation Pipeline

**Scripts:**

```bash
# Collect current responses
npx ts-node scripts/collect-golden-responses.ts \
  --timeout-ms 90000 \
  --output ./test-output/responses.json

# Evaluate against baseline
npx ts-node scripts/run-golden-set.ts \
  --responses ./test-output/responses.json \
  --baseline ./baselines/v2026.01.14.json

# Create new baseline (requires steward approval)
npx ts-node scripts/run-golden-set.ts \
  --responses ./test-output/responses.json \
  --create-baseline
```

**Exit Codes:**
- `0`: All checks pass (or baseline capture mode)
- `1`: Regressions or significant drift detected
- `2`: System crash or fatal error

---

### 5. Convention vs Style Checking

**Important Distinction:**

We check for **conventions** (structural moves), not **style** (specific phrases).

| Convention (Check This) | Style (Don't Check This) |
|-------------------------|--------------------------|
| Asks clarifying question before advice | Uses phrase "I'm curious..." |
| Sets boundary when appropriate | Uses phrase "I won't..." |
| Orients before deep work | Uses phrase "Let me understand..." |
| Maintains presence language | Uses specific warmth phrases |

**Why:**
- Style checking leads to brittle tests
- Convention checking ensures behavioral integrity
- MAIA can evolve her voice while maintaining commitments

---

## Integration Points

### CI/CD Pipeline

```yaml
# .github/workflows/golden-set.yml
- name: Golden Set Check
  run: |
    npx ts-node scripts/run-golden-set.ts \
      --baseline ./baselines/current.json
  # Fails PR if regressions detected
```

### Admin Dashboard

The Admin Dashboard consumes evaluation results to display:
- Current health status
- Drift trends over time
- Regression alerts
- Baseline comparison views

---

## Security Considerations

1. **Golden Set prompts are not secret** - they represent our commitments
2. **Baselines contain MAIA's actual responses** - handle with care
3. **Evaluation results may reveal sensitive patterns** - restrict access
4. **Steward decisions are logged** - maintain audit trail

---

## Maintenance

### Adding New Golden Set Tests

1. Identify gap in current coverage
2. Draft prompt and expected conventions
3. Review with steward team
4. Add to `golden-set-tests.json`
5. Collect new baseline including test

### Updating Baseline

1. Run collection with current model
2. Review all responses (use checklist)
3. Document intentional changes
4. Get steward approval
5. Archive old baseline
6. Promote new baseline

---

## Related Documents

* [Admin Ethos](./ADMIN_ETHOS.md)
* [Steward Review Checklist](./STEWARD_REVIEW_CHECKLIST.md)
* [Community Commons Admin Overview](./COMMUNITY_COMMONS_ADMIN_OVERVIEW.md)
* [Governance Map](./GOVERNANCE_MAP.md)
