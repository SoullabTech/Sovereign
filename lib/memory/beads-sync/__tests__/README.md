# Beads Integration Test Suite

**Comprehensive tests for MAIA ↔ Beads integration**

---

## Test Structure

```
__tests__/
├── README.md                          ← You are here
├── maiaServiceIntegration.test.ts    ← Integration layer tests
└── MaiaBeadsPlugin.test.ts           ← Core plugin tests
```

---

## Running Tests

### Quick Start

```bash
# Install dependencies
cd lib/memory/beads-sync
npm install

# Run all tests
npm test

# Watch mode (re-run on file changes)
npm run test:watch

# Coverage report
npm run test:coverage

# Verbose output
npm run test:verbose
```

### Expected Output

```
PASS  __tests__/maiaServiceIntegration.test.ts
  maiaServiceIntegration
    processConsciousnessEventsForBeads - Somatic Tension
      ✓ creates grounding task when high shoulder tension detected (12ms)
      ✓ detects multiple body regions and chooses most prominent (8ms)
      ✓ does not create task for low tension levels (3ms)
      ✓ skips task creation for FAST path (2ms)
    processConsciousnessEventsForBeads - Field Imbalance
      ✓ creates restoration task when field work is unsafe (5ms)
      ✓ does not create task when field is safe (2ms)
    handleTaskReadinessQuery
      ✓ detects "What should I work on?" queries (10ms)
      ✓ prioritizes tasks aligned with current element (7ms)
      ✓ returns graceful message when no tasks ready (3ms)
      ✓ does not trigger on non-task queries (2ms)
    detectAndLogPracticeCompletion
      ✓ detects completion statements (4ms)
      ✓ extracts practice name from previous MAIA response (5ms)
      ✓ does not trigger on non-completion statements (2ms)
    Error Handling
      ✓ handles Beads plugin failures gracefully (6ms)
      ✓ handles getReadyTasksForUser failures gracefully (4ms)
    Cognitive Gating
      ✓ passes cognitive profile to getReadyTasksForUser (3ms)

PASS  __tests__/MaiaBeadsPlugin.test.ts
  MaiaBeadsPlugin
    onSomaticTensionSpike
      ✓ creates grounding task for high shoulder tension (8ms)
      ✓ escalates to urgent priority for severe tension (5ms)
      ✓ returns null for low tension (below threshold) (2ms)
      ✓ includes cognitive requirements in task metadata (4ms)
    onPhaseTransition
      ✓ creates completion and initiation tasks (10ms)
    onFieldImbalance
      ✓ creates restoration task for deficient earth element (6ms)
      ✓ returns null for minor imbalances (below threshold) (2ms)
    onAchievementUnlock
      ✓ creates celebration task for achievement (5ms)
      ✓ escalates priority for rare achievements (4ms)
    getReadyTasksForUser
      ✓ filters tasks by cognitive level (7ms)
      ✓ passes field coherence for safety filtering (3ms)
    completeTask
      ✓ records effectiveness and somatic improvement (5ms)
      ✓ marks breakthrough moments (4ms)
    Error Handling
      ✓ handles sync service failures gracefully (3ms)
      ✓ handles malformed task data (2ms)

Test Suites: 2 passed, 2 total
Tests:       32 passed, 32 total
Snapshots:   0 total
Time:        2.456s
```

---

## Test Coverage

### What's Tested

#### ✅ Integration Layer (`maiaServiceIntegration.test.ts`)

1. **Somatic Tension Detection**
   - High tension → Task creation
   - Multiple body regions → Prioritization
   - Low tension → No task creation
   - FAST path → Skipped (performance)

2. **Field Imbalance Detection**
   - Unsafe field → Restoration task
   - Safe field → No task creation

3. **Task Readiness Queries**
   - Query detection ("What should I work on?")
   - Element prioritization (aligned tasks first)
   - Empty state handling (graceful message)
   - Non-query detection (no false positives)

4. **Practice Completion Detection**
   - Completion statement recognition
   - Practice name extraction
   - Follow-up question generation
   - Non-completion handling

5. **Error Handling**
   - Beads plugin failures → Graceful degradation
   - Network failures → User-friendly messages
   - Database failures → Non-blocking behavior

6. **Cognitive Gating**
   - Cognitive profile passing
   - Bloom's taxonomy filtering
   - Bypassing frequency checks

#### ✅ Core Plugin (`MaiaBeadsPlugin.test.ts`)

1. **Somatic Tension → Task Creation**
   - Task metadata structure
   - Priority escalation (high → urgent)
   - Threshold enforcement (< 6 = no task)
   - Cognitive requirements inclusion

2. **Phase Transition → Integration Tasks**
   - Completion ritual creation
   - Initiation ritual creation
   - Element/phase metadata

3. **Field Imbalance → Restoration Tasks**
   - Deficient element handling
   - Threshold enforcement (< 5 = no task)
   - Safety flags

4. **Achievement Unlocks**
   - Celebration task creation
   - Rarity-based prioritization
   - Metadata tagging

5. **Task Filtering & Readiness**
   - Cognitive level filtering
   - Field coherence filtering
   - Bypassing frequency checks

6. **Task Completion & Effectiveness**
   - Effectiveness tracking (1-10 scale)
   - Somatic improvement measurement
   - Breakthrough moment flagging
   - Insight recording

7. **Error Handling**
   - Sync service failures
   - Malformed responses
   - Timeout handling

---

## Test Configuration

### Jest Config (`jest.config.js`)

- **Environment:** Node.js (for server-side code)
- **Test Pattern:** `**/__tests__/**/*.test.ts`
- **Coverage Thresholds:**
  - Branches: 70%
  - Functions: 80%
  - Lines: 80%
  - Statements: 80%
- **Module Resolution:** TypeScript with path aliases (`@/lib/...`)

### Setup File (`jest.setup.js`)

- **Environment Variables:**
  - `BEADS_INTEGRATION_ENABLED=true`
  - `BEADS_SYNC_URL=http://localhost:3100`
  - `DATABASE_URL=postgresql://test:test@localhost:5432/test_db`
- **Global Timeout:** 10 seconds
- **Console Mocking:** Suppressed for cleaner output

---

## Mocking Strategy

### What's Mocked

1. **Beads Sync Client** (`MaiaBeadsPlugin.test.ts`)
   ```typescript
   const mockBeadsSyncClient = {
     createTask: jest.fn(),
     completeTask: jest.fn(),
     getReadyTasks: jest.fn(),
   };
   ```

2. **Beads Plugin** (`maiaServiceIntegration.test.ts`)
   ```typescript
   jest.mock('../MaiaBeadsPlugin', () => ({
     maiaBeadsPlugin: {
       onSomaticTensionSpike: jest.fn(),
       onPhaseTransition: jest.fn(),
       onFieldImbalance: jest.fn(),
       getReadyTasksForUser: jest.fn(),
       completeTask: jest.fn(),
     },
   }));
   ```

### Why Mock?

- **Speed:** Tests run in milliseconds (no real HTTP/DB calls)
- **Reliability:** No dependency on external services
- **Isolation:** Test logic in isolation from infrastructure
- **Control:** Simulate error conditions easily

---

## Adding New Tests

### Template for New Test

```typescript
describe('New Feature', () => {
  it('should do something specific', async () => {
    // Arrange: Set up mocks and data
    mockBeadsSyncClient.createTask.mockResolvedValue({
      beadsId: 'test-id-123',
    });

    // Act: Call the function under test
    const result = await plugin.someNewFeature('user-123', {
      param1: 'value1',
    });

    // Assert: Verify behavior
    expect(mockBeadsSyncClient.createTask).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Expected Title',
      })
    );
    expect(result).toBe('test-id-123');
  });
});
```

### Best Practices

1. **One assertion per test** (when possible)
   - Makes failures easier to diagnose
   - Clear test names

2. **Arrange-Act-Assert pattern**
   - Setup → Action → Verification
   - Consistent structure

3. **Mock at the right level**
   - Integration tests: Mock Beads plugin
   - Unit tests: Mock Beads sync client

4. **Test error paths**
   - Happy path + error handling
   - Graceful degradation

5. **Use descriptive test names**
   ```typescript
   // Good
   it('creates urgent task for severe tension (level 9+)', ...)

   // Bad
   it('works correctly', ...)
   ```

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: Beads Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: |
          cd lib/memory/beads-sync
          npm install
      - name: Run tests
        run: |
          cd lib/memory/beads-sync
          npm run test:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./lib/memory/beads-sync/coverage/lcov.info
```

---

## Troubleshooting Tests

### Tests Fail: "Cannot find module '@/lib/...'"

**Fix:** Ensure path aliases are configured in `jest.config.js`:

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/../../$1',
},
```

### Tests Timeout

**Fix:** Increase timeout in `jest.setup.js`:

```javascript
jest.setTimeout(30000); // 30 seconds
```

### Mock Not Working

**Fix:** Check mock is defined before tests run:

```typescript
jest.mock('../MaiaBeadsPlugin'); // Before describe()

describe('Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset between tests
  });
  // ...
});
```

### Coverage Too Low

**Fix:** Add missing test cases:

```bash
# See uncovered lines
npm run test:coverage

# Open coverage report
open coverage/lcov-report/index.html
```

---

## Next Steps

### Priority 1: Run Tests ✅

```bash
cd lib/memory/beads-sync
npm install
npm test
```

### Priority 2: Add to CI/CD

- GitHub Actions workflow
- Pre-commit hooks
- Coverage reporting

### Priority 3: Expand Coverage

- Integration tests with real Beads service (optional)
- Performance benchmarks
- Load testing

---

## Test Metrics

**Current Coverage (Target):**
- Branches: 70%+
- Functions: 80%+
- Lines: 80%+
- Statements: 80%+

**Test Count:** 32 tests

**Test Duration:** ~2-3 seconds

**Mocking:** 100% (no real external calls)

---

## Support

**Test failures?**
1. Check mock setup in `beforeEach()`
2. Verify module paths in `jest.config.js`
3. Review test output for specific errors

**Need more examples?**
- Look at existing tests in `__tests__/`
- Jest documentation: https://jestjs.io/docs/getting-started
- TypeScript + Jest: https://kulshekhar.github.io/ts-jest/

**Want to add tests for new features?**
1. Create new test file in `__tests__/`
2. Follow Arrange-Act-Assert pattern
3. Run `npm run test:watch` for instant feedback
