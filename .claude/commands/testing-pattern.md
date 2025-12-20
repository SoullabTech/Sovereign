---
description: "Create comprehensive tests for new feature"
argument-hint: "feature-name"
allowed-tools: "Read,Write,Bash"
---

# Testing & Verification Pattern

You're writing tests for: **$1**

## 1. GOLDEN TEST CASES

Create `features/$1/tests/cases.json`:

```json
{
  "test_cases": [
    {
      "name": "happy_path_level_3",
      "description": "User at cognitive Level 3, stable state, requesting $1",
      "input": {
        "query": "[Typical user query for this feature]",
        "state": {
          "cognitiveLevel": 3,
          "tierAllowed": "CORE",
          "nervousSystemState": "window",
          "element": "air",
          "bypassingScore": 0.2
        }
      },
      "expected": {
        "outcome": "success",
        "artifacts": {
          "feature_id": "$1",
          "pattern_detected": true
        },
        "responsePattern": "[regex pattern for expected response]"
      }
    },
    {
      "name": "refusal_dorsal_state",
      "description": "User in shutdown state, $1 should refuse safely",
      "input": {
        "query": "[Query that would work if not in dorsal]",
        "state": {
          "cognitiveLevel": 5,
          "tierAllowed": "DEEP",
          "nervousSystemState": "dorsal"
        }
      },
      "expected": {
        "outcome": "hard_refusal",
        "refusalMessageKey": "$1_NOT_SAFE_IN_SHUTDOWN",
        "responsePattern": "not safe.*ground first"
      }
    },
    {
      "name": "edge_case_high_bypassing",
      "description": "High cognitive level but high bypassing score",
      "input": {
        "query": "[Bypassing-style query]",
        "state": {
          "cognitiveLevel": 5,
          "tierAllowed": "DEEP",
          "nervousSystemState": "window",
          "bypassingScore": 0.8
        }
      },
      "expected": {
        "outcome": "hard_refusal",
        "refusalMessageKey": "BYPASSING_DETECTED",
        "responsePattern": "spiritual bypassing.*embodiment first"
      }
    },
    {
      "name": "fallback_feature_disabled",
      "description": "Feature disabled, should fall through gracefully",
      "input": {
        "query": "[Normal query]",
        "state": {
          "cognitiveLevel": 3,
          "tierAllowed": "CORE"
        },
        "env": {
          "$1_ENABLED": "0"
        }
      },
      "expected": {
        "outcome": "fallback",
        "usedDefaultPath": true
      }
    }
  ]
}
```

## 2. INTEGRATION TEST SCRIPT

Create `scripts/test-$1.ts`:

```typescript
import { createClient } from '@/lib/db';
import { run$1 } from '@/lib/$1/runtime';
import { readFileSync } from 'fs';

async function test$1() {
  try {
    console.log("🧪 Testing $1...\n");

    // Load golden test cases
    const cases = JSON.parse(
      readFileSync('./features/$1/tests/cases.json', 'utf-8')
    );

    const db = createClient();
    let passCount = 0;
    let failCount = 0;

    // Run each test case
    for (const testCase of cases.test_cases) {
      console.log(`\n📝 Test: ${testCase.name}`);
      console.log(`   ${testCase.description}`);

      try {
        // Set environment variables if specified
        if (testCase.input.env) {
          Object.entries(testCase.input.env).forEach(([k, v]) => {
            process.env[k] = v as string;
          });
        }

        // Run feature
        const result = await run$1({
          queryText: testCase.input.query,
          state: testCase.input.state
        });

        // Check outcome
        if (result.outcome !== testCase.expected.outcome) {
          console.log(`   ❌ Expected outcome: ${testCase.expected.outcome}`);
          console.log(`   ❌ Got outcome: ${result.outcome}`);
          failCount++;
          continue;
        }

        // Check response pattern (if specified)
        if (testCase.expected.responsePattern) {
          const regex = new RegExp(testCase.expected.responsePattern, 'i');
          if (!regex.test(result.responseText)) {
            console.log(`   ❌ Response doesn't match pattern: ${testCase.expected.responsePattern}`);
            console.log(`   ❌ Got: ${result.responseText.slice(0, 100)}...`);
            failCount++;
            continue;
          }
        }

        // Check artifacts (if specified)
        if (testCase.expected.artifacts) {
          for (const [key, value] of Object.entries(testCase.expected.artifacts)) {
            if (result.artifacts?.[key] !== value) {
              console.log(`   ❌ Expected artifact.${key}: ${value}`);
              console.log(`   ❌ Got artifact.${key}: ${result.artifacts?.[key]}`);
              failCount++;
              continue;
            }
          }
        }

        console.log(`   ✅ Passed`);
        passCount++;

      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        failCount++;
      }
    }

    // Summary
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`✅ Passed: ${passCount}/${cases.test_cases.length}`);
    console.log(`❌ Failed: ${failCount}/${cases.test_cases.length}`);

    if (failCount === 0) {
      console.log("\n🎉 All tests passed!");
    } else {
      console.log("\n⚠️  Some tests failed. Review output above.");
      process.exit(1);
    }

  } catch (error) {
    console.error("❌ Test suite failed:", error);
    process.exit(1);
  }
}

test$1();
```

## 3. SMOKE TEST

Document in `Community-Commons/09-Technical/$1_TESTING_GUIDE.md`:

```markdown
# $1 Smoke Tests

## Prerequisites
\`\`\`bash
npm run dev
export $1_ENABLED=1
\`\`\`

## Test 1: Happy Path
\`\`\`bash
curl -X POST http://localhost:3000/api/maia \\
  -H "Content-Type: application/json" \\
  -d '{
    "sessionId": "test-session",
    "input": "[Typical query for $1]"
  }'
\`\`\`

**Expected:** Response includes $1 patterns, no errors, <3s response time

## Test 2: Refusal Path (Dorsal State)
\`\`\`bash
curl -X POST http://localhost:3000/api/maia \\
  -H "Content-Type: application/json" \\
  -d '{
    "sessionId": "test-session",
    "input": "[Query that requires safety]",
    "meta": {
      "nervousSystemState": "dorsal"
    }
  }'
\`\`\`

**Expected:** Mythic refusal message (not error code), no stack traces

## Test 3: Feature Disabled (Fallback)
\`\`\`bash
export $1_ENABLED=0

curl -X POST http://localhost:3000/api/maia \\
  -H "Content-Type: application/json" \\
  -d '{
    "sessionId": "test-session",
    "input": "[Normal query]"
  }'
\`\`\`

**Expected:** Uses default MAIA path, no errors, graceful degradation
```

## 4. DATABASE VERIFICATION

Create `scripts/verify-$1-db.ts`:

```typescript
async function verifyDatabase() {
  console.log("🔍 Verifying $1 database state...\n");

  const db = createClient();

  // 1. Tables exist
  console.log("1. Checking tables exist...");
  const tables = await db.query(`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename LIKE '$1%';
  `);
  assert(tables.rows.length > 0, "$1 tables should exist");
  console.log(`   ✅ Found ${tables.rows.length} table(s)`);

  // 2. Functions work
  console.log("2. Testing helper functions...");
  const fnTest = await db.query(`
    SELECT log_$1_event(
      '00000000-0000-0000-0000-000000000000'::uuid,
      'test_event',
      '{"test": true}'::jsonb
    );
  `);
  assert(fnTest.rows.length > 0, "Function should return event ID");
  console.log("   ✅ Helper functions callable");

  // 3. Views return results
  console.log("3. Testing observability views...");
  const viewTest = await db.query(`SELECT * FROM v_$1_metrics LIMIT 1;`);
  console.log("   ✅ Views queryable");

  // 4. Indexes exist
  console.log("4. Checking performance indexes...");
  const indexes = await db.query(`
    SELECT indexname FROM pg_indexes
    WHERE tablename LIKE '$1%';
  `);
  assert(indexes.rows.length >= 3, "Should have at least 3 indexes");
  console.log(`   ✅ Found ${indexes.rows.length} indexes`);

  console.log("\n✅ Database verification complete");
}
```

## SUCCESS CRITERIA

- [ ] All golden test cases pass (100% for happy paths)
- [ ] Refusal scenarios return mythic messages (not errors)
- [ ] Integration test runs in <5 seconds
- [ ] Smoke tests documented with exact curl commands
- [ ] Database verification confirms schema correctness
- [ ] Edge cases covered (high bypassing, feature disabled, etc.)

---

**Now create the test files in order: golden cases → integration test → smoke test → db verification.**
