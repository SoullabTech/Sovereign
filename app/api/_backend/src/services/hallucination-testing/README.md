# MAIA Hallucination Testing Framework

Comprehensive, randomized, automation-ready testing framework to detect and measure hallucinations in MAIA's responses.

## Features

- **Multi-domain coverage**: Math, citations, wisdom facts, history, geography, science
- **Randomization engine**: Seeded RNG for reproducible yet diverse test runs
- **Confidence calibration**: Measures Expected Calibration Error (ECE) and overconfidence
- **Quality gates**: Automated pass/fail based on accuracy, ECE, and overconfidence thresholds
- **Detailed reporting**: Markdown and JSON reports with failure analysis

## Quick Start

### Via API

```bash
# Run quick test (3 cases per domain)
curl http://localhost:3000/api/hallucination-test

# Run custom test
curl -X POST http://localhost:3000/api/hallucination-test \
  -H "Content-Type: application/json" \
  -d '{
    "domains": ["math", "citation", "wisdom"],
    "countPerDomain": 10,
    "format": "markdown"
  }'
```

### Programmatically

```typescript
import { HallucinationTestRunner } from '@/apps/api/backend/src/services/hallucination-testing';
import { createMaiaModelRunner } from '@/apps/api/backend/src/services/hallucination-testing/maiaModelRunner';

const config = {
  seed: 'test-2025-01-15',
  domains: ['math', 'citation', 'wisdom'],
  countPerDomain: 10,
  gates: {
    minAccuracy: 0.85,
    minDomainAccuracy: 0.80,
    maxOverconfidence: 0.15,
    maxEce: 0.10
  }
};

const modelRunner = createMaiaModelRunner();
const runner = new HallucinationTestRunner(config, modelRunner);

const { results, summary } = await runner.run();
console.log(`Accuracy: ${(summary.overallAccuracy * 100).toFixed(1)}%`);
console.log(`Gates passed: ${summary.gates.passed}`);
```

## Test Domains

### Math
- Basic arithmetic (addition, subtraction, multiplication, division)
- Tests logic fallacies and calculation errors
- Difficulty levels: easy, medium, hard

### Citation
- Real quotes with verifiable sources (Socrates, Jung, Frankl, etc.)
- Trap questions designed to catch fabricated citations
- Tests for unsupported specificity (fake page numbers, etc.)

### Wisdom
- Facts about wisdom traditions (Maslow, Frankl, Jung, Nietzsche, Buddhism, etc.)
- Tests knowledge accuracy and trap questions for unknowable specifics
- Ensures system doesn't fabricate details about philosophers/traditions

## Metrics

### Correctness
Binary or continuous score (0-1) measuring answer accuracy.

### Confidence
Extracted from model response (required JSON field: `"confidence": 0-1`).

### Expected Calibration Error (ECE)
Measures gap between confidence and accuracy across 10 bins. Lower is better.

### Overconfidence Rate
Percentage of high-confidence (>0.7) responses that are incorrect.

### Quality Gates
- Overall accuracy ≥ 85%
- Domain accuracy ≥ 80%
- Overconfidence ≤ 15%
- ECE ≤ 0.10

## Architecture

```
hallucination-testing/
├── seed.ts                    # Seeded RNG for reproducibility
├── types.ts                   # TypeScript interfaces
├── testRunner.ts              # Main orchestrator
├── grading.ts                 # Scoring and metrics
├── reporter.ts                # Markdown/JSON report generation
├── maiaModelRunner.ts         # Claude API adapter
├── generators/
│   ├── math.ts               # Math test generation
│   ├── citation.ts           # Citation test generation
│   └── wisdom.ts             # Wisdom test generation
└── validators/
    ├── schema.ts             # JSON validation
    ├── math.ts               # Math answer validation
    ├── citation.ts           # Citation validation
    └── wisdom.ts             # Wisdom answer validation
```

## Adding New Domains

1. Create generator in `generators/<domain>.ts`:
```typescript
export function generateDomainCases(rng: SeededRng, count: number): TestCase[] {
  // Generate test cases...
}
```

2. Create validator in `validators/<domain>.ts`:
```typescript
export function validateDomainAnswer(parsed: any, expected: any, context: any) {
  // Validate answer...
}
```

3. Add to test runner in `testRunner.ts`:
```typescript
case 'domain':
  cases.push(...generateDomainCases(rng, this.config.countPerDomain));
  break;
```

4. Add to grading in `grading.ts`:
```typescript
case 'domain': {
  const validation = validateDomainAnswer(parsed, testCase.expected, testCase.context);
  correctness = validation.score;
  break;
}
```

## CI/CD Integration

### GitHub Actions (example)

```yaml
name: Hallucination Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:hallucination
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

### Package.json script

```json
{
  "scripts": {
    "test:hallucination": "tsx apps/api/backend/scripts/runHallucinationTests.ts"
  }
}
```

## Hallucination Taxonomy

Tests are tagged with one or more categories:

- **fact_error**: Plain wrong claims
- **fabricated_citation**: Non-existent sources, wrong authors
- **unsupported_specificity**: Precise numbers/dates without evidence
- **logic_fallacy**: Invalid deductions, arithmetic mistakes
- **speculative_masquerade**: Speculation framed as certainty
- **instruction_drift**: Ignores constraints
- **contradiction**: Contradicts own statements
- **retrieval_leakage**: Asserts knowledge absent from context
- **hedging_pathology**: Evasive non-answers

## Future Enhancements

- [ ] History domain (chronology, events)
- [ ] Geography domain (capitals, borders)
- [ ] Science domain (definitions, relationships)
- [ ] Adaptive difficulty based on performance
- [ ] External API validation for citations
- [ ] Pattern detection for fabrication signatures
- [ ] Dashboard UI for viewing trends
- [ ] Prisma integration for persistent storage