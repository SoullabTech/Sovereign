# MAIA-SOVEREIGN: Optimal Prompts for Top 5 Development Processes

**Purpose:** Consistent, high-quality development practices across all architectural work
**Audience:** Engineers, architects, facilitators working on MAIA systems
**Last Updated:** 2025-12-20

---

## How To Use This Guide

When starting ANY new work on MAIA, identify which of these 5 patterns applies, then copy the corresponding **Optimal Prompt** and customize it for your specific feature.

---

## PATTERN 1: Architecture Refinement

### When to Use
- Designing new major systems (agents, skills, consciousness frameworks)
- Refactoring existing architectures to support new capabilities
- Introducing new paradigms (e.g., "invocation" vs "execution")

### Key Characteristics
- Affects multiple teams and subsystems
- Requires philosophical grounding before implementation
- Needs progressive rollout with feature flags
- Documentation-first approach

### Files Typically Involved
```
/Community-Commons/09-Technical/FEATURE_ARCHITECTURE.md
/lib/feature/types.ts
/lib/feature/runtime.ts
/lib/feature/loader.ts
/lib/sovereign/maiaService.ts (integration point)
/supabase/migrations/YYYYMMDD_create_feature.sql
/scripts/test-feature.ts
/Community-Commons/09-Technical/HOW_TO_ADD_NEW_FEATURE.md
```

### OPTIMAL PROMPT

```
You are architecting a new MAIA system feature: [FEATURE_NAME]

FOLLOW THIS EXACT WORKFLOW:

## 1. PHILOSOPHY FIRST (Create Community-Commons/09-Technical/FEATURE_ARCHITECTURE.md)

Write:
- Title + status line (e.g., "Production-ready, pending FEATURE_ENABLED=1")
- What problem does this solve? (2-3 sentences)
- How does it differ from similar systems? (table format: Old vs New)
- What are the 3 core layers/components?
- Include one concrete example showing before/after behavior

Example structure:
```markdown
# FEATURE: Shifting from OLD paradigm to NEW paradigm

## Problem
[2-3 sentences about what's broken or missing]

## The Insight
[What changed our thinking?]

## Core Difference

| Old Approach | New Approach | Why It Matters |
|-------------|-------------|----------------|
| ... | ... | ... |

## Three Core Principles
1. [Principle with rationale]
2. [Principle with rationale]
3. [Principle with rationale]

## Example
Before: [code or behavior]
After: [code or behavior]
```

## 2. TYPE SYSTEM (Create lib/feature/types.ts)

Define:
- All state interfaces with JSDoc comments
- Eligibility gates as explicit requirements
- Contraindication structure (when NOT to use)
- Discriminated unions for outcomes (success | soft_fail | hard_refusal)
- Template variables for prompts

Example:
```typescript
export interface FeatureContext {
  userId: string;
  sessionId: string;
  state: {
    cognitiveLevel?: number;      // Bloom's 1-6
    nervousSystemState?: NervousSystemState;
    bypassingScore?: number;      // 0.0-1.0
    element?: Element;
    realm?: Realm;
  };
}

export interface FeatureResult {
  outcome: 'success' | 'soft_fail' | 'hard_refusal';
  coherence?: 'stable' | 'volatile' | 'fragmenting';
  responseText: string;
  artifacts?: Record<string, unknown>;
}
```

## 3. DATABASE SCHEMA (Create supabase/migrations/YYYYMMDD_create_feature.sql)

Include:
- All tables with IF NOT EXISTS
- Helper functions (log_*, is_*, unlock_*)
- Observability views (v_feature_*)
- Performance indexes
- RLS policies (commented out if using direct Postgres)
- Rollback comments at top

Keep migrations <2KB each for reviewability.

## 4. PROGRESSIVE DISCLOSURE (Create lib/feature/runtime.ts)

Implement three-tier loading:
1. Boot time: Load metadata only (~1KB per item)
2. Selection time: Load definitions on-demand (~5KB per item)
3. Execution time: Load prompts/tools only when used (~2KB per item)

Include:
- Non-blocking error handling
- Feature flag checks (FEATURE_ENABLED=1)
- Shadow mode support (FEATURE_SHADOW_MODE=1)
- Graceful degradation if disabled

## 5. INTEGRATION POINT (Identify in lib/sovereign/maiaService.ts)

Create a separate integration block:
- Find exact line number where feature fits
- Keep integration <150 lines (under review threshold)
- Include feature flag guard
- Test both success and failure paths
- Document with inline comments

Pattern:
```typescript
// FEATURE integration (lines X-Y)
if (process.env.FEATURE_ENABLED === '1') {
  try {
    const result = await runFeature({...});
    if (result.outcome === 'success') {
      return result.responseText;
    }
    if (result.outcome === 'hard_refusal') {
      return getRefusalMessage(result.reason);
    }
    // soft_fail: fall through to normal paths
  } catch (error) {
    logError('feature-runtime-error', error);
    // fall through to normal paths
  }
}
```

## 6. DOCUMENTATION (Create 3 files)

1. **FEATURE_SYSTEM_SHIP_READY.md** (what was built, how to enable)
2. **HOW_TO_ADD_NEW_FEATURE.md** (developer quick reference with checklist)
3. **FEATURE_INTEGRATION_TEAM_MEMO.md** (team alignment, rollout plan)

## COMMIT MESSAGE FORMAT

"🎯 FEATURE: Phase N Complete - [What problem solved]

[2-3 sentence summary of what changed]

Files created/modified:
- lib/feature/*.ts (6 files)
- supabase/migrations/*.sql (2 files)
- Community-Commons/09-Technical/*.md (3 docs)

Tests passing: ✅
Feature flag: FEATURE_ENABLED=0 (default disabled)
Rollout plan: See FEATURE_INTEGRATION_TEAM_MEMO.md"
```

---

## PATTERN 2: Migration & Upgrade Sequencing

### When to Use
- Database schema changes
- Data transformations or backfills
- Deprecating old tables/functions
- Adding new system capabilities that require persistence

### Key Characteristics
- Must be idempotent (safe to run multiple times)
- Requires rollback plan
- Should be incremental (<2KB per migration file)
- Needs verification script to confirm correctness

### Files Typically Involved
```
/supabase/migrations/YYYYMMDD_feature_name.sql
/scripts/apply-feature-migration.ts
/scripts/verify-feature-migration.ts
Community-Commons/09-Technical/README_FEATURE_MIGRATION.md
```

### OPTIMAL PROMPT

```
You're designing a database migration for: [FEATURE_NAME]

WORKFLOW:

## 1. DEPENDENCY ANALYSIS

List all tables/functions this feature depends on (don't create them, assume they exist).

Example:
"Depends on:
- sessions table (id, user_id, created_at)
- user_profiles table (user_id, cognitive_level)
- pgvector extension for embeddings"

## 2. MIGRATION FILE (create supabase/migrations/YYYYMMDD_feature_name.sql)

Name convention: 20251220_feature_name.sql

Structure:
```sql
-- Feature: [What this enables]
-- Dependencies: [What must exist first]
-- Rollback: DROP TABLE feature_table; DROP FUNCTION feature_fn();

-- ===== CORE TABLES =====

CREATE TABLE IF NOT EXISTS feature_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,

  -- Core columns
  feature_data jsonb DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE feature_table IS 'Stores [what data] for [what purpose]';

-- ===== HELPER FUNCTIONS =====

CREATE OR REPLACE FUNCTION log_feature_event(
  p_user_id uuid,
  p_event_type text,
  p_event_data jsonb DEFAULT '{}'::jsonb
) RETURNS bigint AS $$
DECLARE
  v_event_id bigint;
BEGIN
  INSERT INTO feature_events (user_id, event_type, event_data)
  VALUES (p_user_id, p_event_type, p_event_data)
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log_feature_event IS 'Safe, fire-and-forget event logging';

-- ===== OBSERVABILITY VIEWS =====

CREATE OR REPLACE VIEW v_feature_metrics AS
SELECT
  DATE_TRUNC('day', created_at) as day,
  COUNT(*) as total_events,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_duration_sec
FROM feature_events
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY day DESC;

COMMENT ON VIEW v_feature_metrics IS 'Daily rollup of feature usage';

-- ===== PERFORMANCE INDEXES =====

CREATE INDEX IF NOT EXISTS idx_feature_user
  ON feature_table(user_id);

CREATE INDEX IF NOT EXISTS idx_feature_created
  ON feature_table(created_at DESC);

-- Composite index for time-series queries
CREATE INDEX IF NOT EXISTS idx_feature_user_time
  ON feature_table(user_id, created_at DESC);

-- ===== RLS POLICIES (if using Supabase auth) =====

-- Uncomment if deploying to Supabase:
-- ALTER TABLE feature_table ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "Users read own feature data"
--   ON feature_table FOR SELECT
--   TO authenticated
--   USING (auth.uid() = user_id);
```

## 3. APPLY SCRIPT (create scripts/apply-feature-migration.ts)

```typescript
import { readFileSync } from 'fs';
import { query } from '@/lib/db';

async function applyMigration() {
  try {
    console.log("📦 Applying feature migration...\n");

    // Check if already applied
    const check = await query(`
      SELECT migration_name FROM applied_migrations
      WHERE migration_name = '20251220_feature_name';
    `);

    if (check.rows.length > 0) {
      console.log("⏭️  Migration already applied, skipping.");
      return;
    }

    // Read migration file
    const sql = readFileSync(
      './supabase/migrations/20251220_feature_name.sql',
      'utf-8'
    );

    // Execute
    await query(sql);

    // Record application
    await query(`
      INSERT INTO applied_migrations (migration_name, applied_at)
      VALUES ('20251220_feature_name', NOW());
    `);

    console.log("✅ Migration applied successfully");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    console.log("\n💡 To rollback:");
    console.log("   DROP TABLE feature_table;");
    console.log("   DROP FUNCTION log_feature_event();");
    process.exit(1);
  }
}

applyMigration();
```

## 4. VERIFY SCRIPT (create scripts/verify-feature-migration.ts)

Test:
```typescript
async function verifyMigration() {
  console.log("🔍 Verifying migration...\n");

  // 1. Tables exist
  console.log("1. Checking tables...");
  const tables = await query(`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename LIKE 'feature%';
  `);
  console.log(`   ✅ Found ${tables.rows.length} tables`);

  // 2. Functions work
  console.log("2. Testing functions...");
  const testResult = await query(`
    SELECT log_feature_event(
      'test-uuid'::uuid,
      'test_event',
      '{"test": true}'::jsonb
    );
  `);
  console.log("   ✅ Functions callable");

  // 3. Views return data
  console.log("3. Testing views...");
  const metrics = await query(`SELECT * FROM v_feature_metrics LIMIT 1;`);
  console.log("   ✅ Views queryable");

  // 4. Indexes exist
  console.log("4. Checking indexes...");
  const indexes = await query(`
    SELECT indexname FROM pg_indexes
    WHERE tablename = 'feature_table';
  `);
  console.log(`   ✅ Found ${indexes.rows.length} indexes`);

  console.log("\n✅ Migration verified");
}
```

## 5. DOCUMENTATION (create Community-Commons/09-Technical/README_FEATURE_MIGRATION.md)

Include:
- What changed (before/after table structure)
- Breaking changes (if any)
- Rollback procedure (exact SQL commands)
- Performance impact (index overhead, query patterns)
- When to run (before deploying code that depends on schema)

## SAFETY CHECKLIST

- [ ] Migration uses CREATE TABLE IF NOT EXISTS
- [ ] Migration uses CREATE INDEX IF NOT EXISTS
- [ ] Helper functions use CREATE OR REPLACE
- [ ] Rollback commands documented at top
- [ ] Each migration <2KB (reviewable)
- [ ] No destructive operations (DROP, TRUNCATE) unless explicitly needed
- [ ] Apply script checks applied_migrations table
- [ ] Verify script tests tables, functions, views, indexes
- [ ] Documentation includes rollback procedure
```

---

## PATTERN 3: Progressive Disclosure & Future-Proofing

### When to Use
- Building features that could scale to 100+ items (skills, agents, prompts)
- Implementing gradual rollout mechanisms
- Creating backwards-compatible API changes
- Adding experimental features that might be disabled

### Key Characteristics
- Three-tier loading (metadata → definition → execution)
- Feature flags for gradual enablement
- Shadow mode for safe observation
- Backwards compatibility via aliasing

### Files Typically Involved
```
/lib/feature/meta.json (boot-time metadata)
/lib/feature/definition.json (on-demand definition)
/lib/feature/prompts/*.md (execution-time content)
/lib/features/feature-flags.tsx
/lib/feature/runtime.ts
```

### OPTIMAL PROMPT

```
You're implementing progressive disclosure for: [FEATURE_NAME]

## DESIGN PRINCIPLE

Delay loading until needed. Structure data in 3 layers:
1. **Metadata** (always available, <1KB per item)
2. **Definition** (load on-demand, <10KB per item)
3. **Execution** (load on use, prompts/tools/data)

## IMPLEMENTATION

### Layer 1: Metadata File (meta.json)

Create one per feature item (e.g., skills/my-skill/meta.json):

```json
{
  "id": "feature-item-name",
  "version": "0.1.0",
  "tier": "FAST|CORE|DEEP",
  "kind": "prompt|code|hybrid",
  "category": "foundational|lineage|emergent",
  "enabled": true,
  "trustLevel": 3,
  "title": "Short descriptive title",
  "description": "One sentence explaining what this does",
  "triggers": ["keyword1", "keyword2", "phrase to match"],
  "elements": ["water", "earth", "fire", "air", "aether"],
  "realms": ["UNDERWORLD", "MIDDLEWORLD", "UPPERWORLD_SYMBOLIC"]
}
```

**Fields:**
- `tier`: FAST (<2s), CORE (2-6s), DEEP (6-20s) processing time
- `kind`: prompt (LLM-based), code (deterministic), hybrid (both)
- `category`: foundational (always safe), lineage (developmental gates), emergent (requires unlock)
- `trustLevel`: 1 (experimental) to 5 (production-stable)
- `triggers`: Keywords that increase selection score
- `elements`: Elemental attunements this works with
- `realms`: Developmental territories (UNDERWORLD=shadow, MIDDLEWORLD=integration, UPPERWORLD=symbolic)

### Layer 2: Definition File (definition.json)

Load only when feature is shortlisted:

```json
{
  "eligibility": {
    "minCognitiveLevel": 3,
    "maxBypassingScore": 0.5,
    "requiredStability": "stable|developing|volatile|unstable",
    "allowedNervousSystemStates": ["window"],
    "requiresUnlock": false
  },
  "contraindications": {
    "nervousSystemStates": ["dorsal"],
    "shadowRiskFlags": ["spiritual_bypassing", "dissociation"],
    "hardRefusalMessageKey": "REFUSAL_KEY_NAME"
  },
  "promptTemplates": {
    "system": "prompts/system.md",
    "user": "prompts/user.md"
  },
  "nextHints": ["follow-up-item-1", "follow-up-item-2"]
}
```

**Eligibility** (all must pass):
- `minCognitiveLevel`: 1-6 (Bloom's taxonomy)
- `maxBypassingScore`: 0.0-1.0 (blocks premature access)
- `requiredStability`: field stability requirement
- `allowedNervousSystemStates`: window (regulated), sympathetic (activated), dorsal (shutdown)
- `requiresUnlock`: true = check unlock table

**Contraindications** (any blocks):
- `nervousSystemStates`: When feature is unsafe
- `shadowRiskFlags`: Patterns that contraindicate use
- `hardRefusalMessageKey`: Lookup key for refusal message

### Layer 3: Execution Files (prompts/*.md)

Load only when feature is selected:

**prompts/system.md:**
```markdown
You are MAIA's **FEATURE_NAME** capability.

## Purpose
[What this accomplishes]

## Strategy
1. [First step]
2. [Second step]
3. [Third step]

## Voice
[How to communicate: direct, gentle, Socratic, etc.]

## What NOT to do
- Don't give advice
- Don't bypass user's process
- Don't spiritualize prematurely

## Context Available
- Element: {{ELEMENT}}
- Realm: {{REALM}}
- Tier: {{TIER}}
- Cognitive Level: {{COGNITIVE_LEVEL}}
- Nervous System: {{NERVOUS_SYSTEM_STATE}}
```

**prompts/user.md:**
```markdown
**User's query:**
{{QUERY}}

**Context:**
- Current element: {{ELEMENT}}
- Developmental realm: {{REALM}}
- Processing tier: {{TIER}}
- Cognitive level: {{COGNITIVE_LEVEL}}
- Nervous system state: {{NERVOUS_SYSTEM_STATE}}

---

Respond using the FEATURE_NAME strategy from the system prompt.
```

### Runtime Loader (lib/feature/runtime.ts)

```typescript
import { readdirSync, readFileSync } from 'fs';
import path from 'path';

interface FeatureMeta {
  id: string;
  tier: string;
  category: string;
  triggers: string[];
  // ... other meta fields
}

interface FeatureDefinition extends FeatureMeta {
  eligibility: {...};
  contraindications: {...};
  promptTemplates: {...};
}

// Boot time: Load all metadata (~1KB each)
export function loadAllMetadata(featureRoot: string): FeatureMeta[] {
  const dirs = readdirSync(featureRoot);
  return dirs.map(dir => {
    const metaPath = path.join(featureRoot, dir, 'meta.json');
    const meta = JSON.parse(readFileSync(metaPath, 'utf-8'));
    return meta as FeatureMeta;
  });
}

// Selection time: Load definition for shortlisted items
export function loadDefinition(
  featureRoot: string,
  featureId: string
): FeatureDefinition {
  const defPath = path.join(featureRoot, featureId, 'definition.json');
  const metaPath = path.join(featureRoot, featureId, 'meta.json');

  const meta = JSON.parse(readFileSync(metaPath, 'utf-8'));
  const def = JSON.parse(readFileSync(defPath, 'utf-8'));

  return { ...meta, ...def };
}

// Execution time: Load prompts
export function loadPrompts(
  featureRoot: string,
  featureId: string
): { system: string; user: string } {
  const sysPath = path.join(featureRoot, featureId, 'prompts/system.md');
  const usrPath = path.join(featureRoot, featureId, 'prompts/user.md');

  return {
    system: readFileSync(sysPath, 'utf-8'),
    user: readFileSync(usrPath, 'utf-8')
  };
}
```

## ROLLOUT SEQUENCE

### Phase 1: Silent Mode (Code exists, feature disabled)
```bash
# Feature flag disabled by default
FEATURE_ENABLED=0
```
**Purpose:** Integration verification, no user impact

### Phase 2: Shadow Mode (Logs without changing behavior)
```bash
FEATURE_ENABLED=1
FEATURE_SHADOW_MODE=1
```
**Purpose:** Observe selection patterns, success rates, latency

**Metrics to monitor:**
- Which items get selected most?
- What's the success rate?
- Average latency vs baseline?

### Phase 3: Gradual Rollout (Enable for subset of users)
```bash
FEATURE_ENABLED=1
FEATURE_ROLLOUT_PERCENTAGE=10  # Start with 10%
```
**Metrics to compare:**
- User feedback ratings
- Session depth/length
- Feature usage patterns

**Progression:** 10% → 25% → 50% → 100%

### Phase 4: Full Deployment
```bash
FEATURE_ENABLED=1
# Remove FEATURE_ROLLOUT_PERCENTAGE (100% of users)
```
**Criteria for full rollout:**
- Success rate ≥80%
- User ratings ≥4/5
- No performance degradation

## BACKWARDS COMPATIBILITY

```typescript
// In integration code:
export async function processRequest(ctx: Context) {
  // Check feature flag
  if (process.env.FEATURE_ENABLED !== '1') {
    return defaultBehavior(ctx);
  }

  // Shadow mode: run but don't use results
  if (process.env.FEATURE_SHADOW_MODE === '1') {
    const result = await runFeature(ctx);
    logToTelemetry('feature-shadow', result);
    return defaultBehavior(ctx);  // Use old path
  }

  // Full mode: use feature results
  const result = await runFeature(ctx);
  if (result.outcome === 'success') {
    return result.responseText;
  }

  // Fall through to default if feature declines
  return defaultBehavior(ctx);
}

// Alias old function names if renaming
export const oldFunctionName = newFunctionName;  // Backwards compatible
```

## SUCCESS CRITERIA

- ✅ Metadata loads in <100ms (for 100 items)
- ✅ Definition loading adds <50ms per item
- ✅ Prompt loading adds <10ms per item
- ✅ Feature flag toggles without code deploy
- ✅ Shadow mode logs without changing behavior
- ✅ Gradual rollout works (10% see new behavior, 90% see old)
- ✅ Backwards compatibility: old code still works
```

---

## PATTERN 4: Testing & Verification

### When to Use
- Before shipping any new feature
- After database migrations
- When refactoring critical paths
- During architectural changes

### Key Characteristics
- Golden test cases (expected inputs/outputs)
- Integration tests (real database, real functions)
- Smoke tests (simple curl commands, user-facing)
- Refusal path testing (verify safety gates work)

### Files Typically Involved
```
/features/item/tests/cases.json
/scripts/test-feature.ts
/scripts/verify-feature-migration.ts
Community-Commons/09-Technical/TESTING-GUIDE.md
```

### OPTIMAL PROMPT

```
You're writing tests for: [FEATURE_NAME]

STRUCTURE:

## 1. GOLDEN TEST CASES (features/item/tests/cases.json)

Create test cases covering:
- Happy path (normal usage)
- Edge cases (boundary conditions)
- Refusal scenarios (when feature should decline)
- Fallback behavior (when feature unavailable)

Format:
```json
{
  "test_cases": [
    {
      "name": "happy_path_level_3",
      "description": "User at cognitive Level 3, stable state, requesting feature",
      "input": {
        "query": "Help me understand this paradox",
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
          "feature_id": "expected-feature-name",
          "pattern_detected": true
        },
        "responsePattern": "holds complexity.*synthesis"
      }
    },
    {
      "name": "refusal_dorsal_state",
      "description": "User in shutdown state, feature should refuse safely",
      "input": {
        "query": "Guide me through deep symbolic work",
        "state": {
          "cognitiveLevel": 5,
          "tierAllowed": "DEEP",
          "nervousSystemState": "dorsal"
        }
      },
      "expected": {
        "outcome": "hard_refusal",
        "refusalMessageKey": "DEEP_WORK_NOT_SAFE_IN_SHUTDOWN",
        "responsePattern": "not safe.*ground first"
      }
    },
    {
      "name": "edge_case_high_bypassing",
      "description": "High cognitive level but high bypassing score",
      "input": {
        "query": "Explain the cosmic meaning of my struggle",
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
        "query": "Normal query",
        "state": {
          "cognitiveLevel": 3,
          "tierAllowed": "CORE"
        },
        "env": {
          "FEATURE_ENABLED": "0"
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

## 2. INTEGRATION TEST SCRIPT (scripts/test-feature.ts)

```typescript
import { createClient } from '@/lib/db';
import { runFeature } from '@/lib/feature/runtime';
import { readFileSync } from 'fs';

async function testFeature() {
  try {
    console.log("🧪 Testing FEATURE_NAME...\n");

    // Load golden test cases
    const cases = JSON.parse(
      readFileSync('./features/item/tests/cases.json', 'utf-8')
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
        const result = await runFeature({
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

testFeature();
```

## 3. SMOKE TEST (document in TESTING-GUIDE.md)

Simple, user-facing tests (no code knowledge required):

```markdown
# FEATURE Smoke Tests

## Prerequisites
```bash
# Start dev server
npm run dev

# Ensure feature is enabled
export FEATURE_ENABLED=1
```

## Test 1: Happy Path
```bash
curl -X POST http://localhost:3000/api/maia \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session",
    "input": "Help me understand this paradox"
  }'
```

**Expected:**
- Response includes polarity mapping or dialectical framing
- No error messages
- Response time <3 seconds

## Test 2: Refusal Path (Dorsal State)
```bash
curl -X POST http://localhost:3000/api/maia \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session",
    "input": "Guide me through deep symbolic work",
    "meta": {
      "nervousSystemState": "dorsal"
    }
  }'
```

**Expected:**
- Response includes refusal message (not error code)
- Message is mythic/dignified (e.g., "Not safe in shutdown state, let's ground first")
- No stack traces or technical errors

## Test 3: Feature Disabled (Fallback)
```bash
# Disable feature
export FEATURE_ENABLED=0

curl -X POST http://localhost:3000/api/maia \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session",
    "input": "Normal query"
  }'
```

**Expected:**
- Response uses default MAIA path (not feature)
- No errors
- Graceful degradation
```

## 4. DATABASE VERIFICATION (scripts/verify-feature-migration.ts)

Test that database changes work correctly:

```typescript
async function verifyDatabase() {
  console.log("🔍 Verifying database state...\n");

  const db = createClient();

  // 1. Tables exist
  console.log("1. Checking tables exist...");
  const tables = await db.query(`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename LIKE 'feature%';
  `);
  assert(tables.rows.length > 0, "Feature tables should exist");
  console.log(`   ✅ Found ${tables.rows.length} feature table(s)`);

  // 2. Functions work
  console.log("2. Testing helper functions...");
  const fnTest = await db.query(`
    SELECT log_feature_event(
      '00000000-0000-0000-0000-000000000000'::uuid,
      'test_event',
      '{"test": true}'::jsonb
    );
  `);
  assert(fnTest.rows.length > 0, "Function should return event ID");
  console.log("   ✅ Helper functions callable");

  // 3. Views return results
  console.log("3. Testing observability views...");
  const viewTest = await db.query(`SELECT * FROM v_feature_metrics LIMIT 1;`);
  console.log("   ✅ Views queryable");

  // 4. Indexes exist
  console.log("4. Checking performance indexes...");
  const indexes = await db.query(`
    SELECT indexname FROM pg_indexes
    WHERE tablename LIKE 'feature%';
  `);
  assert(indexes.rows.length >= 3, "Should have at least 3 indexes");
  console.log(`   ✅ Found ${indexes.rows.length} indexes`);

  console.log("\n✅ Database verification complete");
}
```

## SUCCESS CRITERIA

- ✅ All golden test cases pass (100% for happy paths)
- ✅ Refusal scenarios return mythic messages (not errors)
- ✅ Integration test runs in <5 seconds
- ✅ Smoke tests documented with exact curl commands
- ✅ Database verification confirms schema correctness
- ✅ Edge cases covered (high bypassing, feature disabled, etc.)
```

---

## PATTERN 5: Documentation as Living Specification

### When to Use
- After completing any feature implementation
- Before team rollout begins
- When architectural decisions need to be preserved
- To enable async collaboration across teams

### Key Characteristics
- Write philosophy before code
- Create 5 types of docs (architecture, quick ref, integration, team memo, status)
- Cross-link all related documents
- Update documentation when code changes

### Files Typically Involved
```
/Community-Commons/09-Technical/FEATURE_ARCHITECTURE.md
/Community-Commons/09-Technical/HOW_TO_ADD_NEW_FEATURE.md
/Community-Commons/09-Technical/FEATURE_INTEGRATION_GUIDE.md
/Community-Commons/09-Technical/FEATURE_INTEGRATION_TEAM_MEMO.md
/FEATURE_SYSTEM_SHIP_READY.md
```

### OPTIMAL PROMPT

```
You're documenting a completed MAIA feature: [FEATURE_NAME]

WRITE THESE 5 DOCUMENTS IN ORDER:

---

### DOCUMENT 1: Philosophy (Community-Commons/09-Technical/FEATURE_ARCHITECTURE.md)

**Length:** 500-1000 words
**Audience:** Decision-makers, architects

Structure:
```markdown
# FEATURE: Shifting from OLD paradigm to NEW paradigm

**Status:** [Production-ready / In development / Planning]
**Last Updated:** YYYY-MM-DD

---

## The Problem

[2-3 sentences about what was broken or missing in the old approach]

Example: "The old skills system executed code based on keywords, with no awareness of user developmental state. This led to inappropriate interventions—offering dialectical work to users in shutdown states, or symbolic material to Level 2 thinkers."

## The Insight

[What changed our thinking? What realization led to this design?]

Example: "MAIA doesn't execute skills—it invokes archetypal coherences. The system is a portal infrastructure, not a code runner. This means we need embodiment gates, not just keyword matching."

## Core Difference

| Old Approach | New Approach | Why It Matters |
|-------------|-------------|----------------|
| Keyword matching | Developmental gating | Prevents overwhelm |
| Execute on match | Invoke with embodiment check | Ensures safety |
| Success/failure | Manifested/declined/refused | Honors readiness |

## Three Core Principles

1. **[Principle Name]**: [What it means + why it's essential]
   - Example: "Gate by coherence, not polarity: We don't ask 'is this good or bad?' but 'does this integrate or fragment?'"

2. **[Principle Name]**: [What it means + why it's essential]
   - Example: "Progressive disclosure: Load metadata at boot, definitions on selection, prompts on execution. Protects context window."

3. **[Principle Name]**: [What it means + why it's essential]
   - Example: "Hard refusals return mythic boundaries: Not 'Error 403' but 'The field isn't ready for this work yet.'"

## Example: Before/After

**Before:**
```typescript
if (query.includes('stuck')) {
  return dialecticalScaffold(query);
}
```

**After:**
```typescript
const invocation = await invokeSkill({
  skillId: 'dialectical-scaffold',
  embodimentCheck: {
    nervousSystemState: ctx.state.nervousSystemState,
    cognitiveLevel: ctx.state.cognitiveLevel,
    bypassingScore: ctx.state.bypassingScore
  }
});

if (invocation.outcome === 'refused') {
  return getRefusalMessage(invocation.reason);
}
```

---

## See Also
- [ARCHITECTURE_PRINCIPLES.md](/lib/ARCHITECTURE_PRINCIPLES.md)
- [Related Feature Documentation]
```

---

### DOCUMENT 2: Quick Reference (Community-Commons/09-Technical/HOW_TO_ADD_NEW_FEATURE.md)

**Length:** 1000-1500 words
**Audience:** Any engineer adding items to this feature

Structure:
```markdown
# How To Add New [FEATURE_ITEM]

Quick reference for creating new MAIA [feature items].

---

## 5-Minute Workflow

### Step 1: Create Directory
```bash
mkdir -p features/my-feature-item
cd features/my-feature-item
```

### Step 2: Create meta.json (Boot-time metadata)
```json
{
  "id": "my-feature-item",
  "version": "0.1.0",
  "tier": "FAST|CORE|DEEP",
  "category": "foundational|lineage|emergent",
  "enabled": true,
  "trustLevel": 3,
  "title": "Short Title",
  "description": "One sentence"
}
```

**Field guide:**
- `tier`: FAST (<2s), CORE (2-6s), DEEP (6-20s)
- `category`: foundational (always available), lineage (gates), emergent (unlock required)
- `trustLevel`: 1-5 (1=experimental, 5=production)

### Step 3: Create definition.json (On-demand)
```json
{
  "eligibility": {
    "minCognitiveLevel": 3,
    "maxBypassingScore": 0.5
  },
  "contraindications": {
    "nervousSystemStates": ["dorsal"],
    "hardRefusalMessageKey": "KEY_NAME"
  }
}
```

### Step 4: Create prompts/system.md
```markdown
You are MAIA's **FEATURE_ITEM** capability.

## Purpose
[What this accomplishes]

## Strategy
1. [Step 1]
2. [Step 2]

## Voice
[How to communicate]
```

### Step 5: Create prompts/user.md
```markdown
**User's query:**
{{QUERY}}

**Context:**
- Element: {{ELEMENT}}
- Cognitive level: {{COGNITIVE_LEVEL}}
```

### Step 6: Test Locally
```bash
DATABASE_URL=postgresql://... \
npx tsx -e "
  import { runFeature } from './lib/feature/runtime';
  const result = await runFeature({...});
  console.log('Selected:', result?.itemId);
"
```

### Step 7: Sync to Database
```bash
npx tsx scripts/sync-feature-registry.ts
```

---

## Complete Example: Shadow Integration Item

[Full working example with all files]

---

## Common Patterns

### Pattern 1: Regulation Item (FAST, Foundational)
[Copy-paste template for regulation work]

### Pattern 2: Developmental Item (CORE, Lineage)
[Copy-paste template for gated work]

### Pattern 3: Initiatory Item (DEEP, Emergent)
[Copy-paste template for advanced work]

---

## Checklist Before Submitting

- [ ] meta.json created with all required fields
- [ ] definition.json defines gates + contraindications
- [ ] prompts/system.md explains strategy clearly
- [ ] prompts/user.md uses template variables
- [ ] Tested locally with runFeature()
- [ ] Synced to registry table
- [ ] End-to-end test with real query
- [ ] Refusal message mapped (if has contraindications)
```

---

### DOCUMENT 3: Integration Guide (Community-Commons/09-Technical/FEATURE_INTEGRATION_GUIDE.md)

**Length:** 1000-1200 words
**Audience:** Engineer integrating feature into getMaiaResponse()

Structure:
```markdown
# FEATURE Integration Guide

This guide shows exactly where and how to wire [FEATURE] into MAIA's request flow.

---

## Current Flow (Before Integration)

```
1. Request arrives at /api/maia
2. Router determines tier (FAST/CORE/DEEP)
3. Cognitive profile fetched
4. Field routing applied
5. [INSERT FEATURE HERE] ← New step
6. Normal response paths (FAST/CORE/DEEP)
7. Response returned
```

## Integration Point

**File:** `lib/sovereign/maiaService.ts`
**Location:** After field routing, before normal response paths
**Approximate line:** 1640

**Why here?**
- After: Routing complete (we know tier, element, realm)
- Before: Normal paths (feature can override or fall through)
- Non-blocking: Errors don't break normal flow

---

## Draft Code (Ready to Paste)

```typescript
// ===== FEATURE INTEGRATION (lines 1640-1751) =====

if (process.env.FEATURE_ENABLED === '1') {
  try {
    const featureResult = await runFeature({
      skillsRoot: path.join(process.cwd(), 'features'),
      ctx: {
        userId: session.userId,
        sessionId: session.id,
        queryText: input,
        state: {
          tierAllowed: determinedTier,
          cognitiveLevel: cognitiveProfile?.currentLevel,
          bypassingScore: cognitiveProfile?.bypassingScore,
          stability: cognitiveProfile?.stability,
          nervousSystemState: meta?.nervousSystemState,
          element: meta?.element,
          realm: meta?.realm,
        }
      },
      renderWithField: async (system: string, user: string) => {
        const result = await generateText({
          systemPrompt: system,
          userInput: user
        });
        return result.text;
      },
      refusalMessage: (keyOrReason: string) => {
        return getFieldSafetyMessage({
          state: 'not_safe',
          bypass: 'none',
          element: meta?.element || 'earth'
        });
      }
    });

    // If feature manifested, return immediately
    if (featureResult?.outcome === 'manifested') {
      return {
        text: featureResult.responseText,
        meta: {
          ...meta,
          featureUsed: featureResult.itemId,
          processingTier: determinedTier
        }
      };
    }

    // If hard refusal, return boundary message
    if (featureResult?.outcome === 'refused') {
      return {
        text: featureResult.responseText,
        meta: {
          ...meta,
          featureRefused: featureResult.itemId,
          refusalReason: featureResult.reason
        }
      };
    }

    // Soft decline: Fall through to normal paths
    logFeatureSoftFail(featureResult);

  } catch (error) {
    // Non-blocking: Log error, continue to normal flow
    logError('feature-runtime-error', error);
  }
}

// Continue with normal FAST/CORE/DEEP paths...
```

---

## Testing Procedure

### Test 1: Happy Path (Feature Manifests)
```bash
curl -X POST http://localhost:3000/api/maia \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test",
    "input": "I feel stuck between two options"
  }'
```

**Expected:**
- Feature selected and manifests
- Response uses feature logic
- Database logs `outcome = 'manifested'`

### Test 2: Refusal Path (Dorsal State)
```bash
curl -X POST http://localhost:3000/api/maia \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test",
    "input": "Guide my shadow work",
    "meta": { "nervousSystemState": "dorsal" }
  }'
```

**Expected:**
- Feature refuses (hard_refusal)
- Response is mythic boundary message
- Database logs `outcome = 'refused'`

### Test 3: Soft Fail (No Match)
```bash
curl -X POST http://localhost:3000/api/maia \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test",
    "input": "Random unrelated query"
  }'
```

**Expected:**
- Feature declines (soft_fail)
- Normal MAIA path handles query
- Database logs `outcome = 'declined'`

---

## Error Handling

All feature errors are **non-blocking**:
- Runtime errors → Log + fall through to normal paths
- Database errors → Log + feature disabled for session
- Missing dependencies → Log + graceful degradation

---

## Feature Flags

- `FEATURE_ENABLED=0` (default): Feature code exists but doesn't run
- `FEATURE_ENABLED=1`: Feature active
- `FEATURE_SHADOW_MODE=1`: Feature runs but doesn't return results (logs only)

---

## See Also
- [FEATURE_ARCHITECTURE.md](./FEATURE_ARCHITECTURE.md)
- [HOW_TO_ADD_NEW_FEATURE.md](./HOW_TO_ADD_NEW_FEATURE.md)
```

---

### DOCUMENT 4: Team Memo (Community-Commons/09-Technical/FEATURE_INTEGRATION_TEAM_MEMO.md)

**Length:** 3000+ words
**Audience:** All teams (Engineering, Facilitation, Data, etc.)

Structure:
```markdown
# FEATURE Integration Team Memo

**To:** Engineering, Facilitation, Data Analysis Teams
**From:** Architecture Team
**Date:** YYYY-MM-DD
**Status:** Pre-Integration — Team Alignment Required

---

## What We're Doing

[2-3 paragraphs in plain English explaining what's changing and why]

Example: "We're evolving the MAIA Skills System into the Invocation Model—a semantic and architectural shift that aligns our system with its actual function: opening portals to archetypal coherences rather than executing code..."

---

## Key Terminology Changes

### Before → After

| Old Language | New Language | Meaning |
|-------------|-------------|---------|
| skill_result | skill_invocation | Result of calling forth coherence |
| success | manifested | Pattern successfully embodied |
| soft_fail | declined | Pattern chose not to manifest |
| hard_refusal | refused | Portal blocked for safety |

### New Core Concepts

- **Invocation**: Calling forth with intention from readiness
- **Embodiment Gates**: Verify vessel (user) readiness
- **Coherence Assessment**: Post-invocation stability evaluation

---

## Integration Plan (6 Phases, 4 Weeks)

### Week 1: [Phase Name]
- **Code changes**: [What files change]
- **Safety**: [How we ensure no breakage]
- **Deliverable**: [What's complete by end of week]

### Week 2: [Phase Name]
[Same structure]

### Week 3: [Phase Name]
[Same structure]

### Week 4: [Phase Name]
[Same structure]

---

## Rollout Priorities

### 1. Anchor Terminology First (Pre-Week 1)
- **Action**: Hold team session on [FEATURE_PHILOSOPHY.md]
- **Goal**: Shared definitions across all teams
- **Why**: Once language is common, technical changes make sense

### 2. Non-Breaking Implementation Order
- **Sequence**: Types → Database → Runtime → Integration → APIs
- **Why**: Interior changes don't break existing users

### 3. Safety & Rollback Plan
- **Flag**: `FEATURE_ENABLED=0` (default disabled)
- **Rollout**: Enable for 10%, monitor metrics
- **Rollback**: If <70% success or >5% errors, disable immediately

### 4. Observation & Review Rhythm
- **Daily**: Pattern miner logs candidates
- **Weekly**: Guardian review of candidates
- **Why**: Detect issues early

### 5. Retire Old Language (Post-Integration Only)
- **Action**: Remove backwards-compatible aliases
- **When**: After Week 4, when metrics confirm stable integration

---

## Success Criteria

### Week 1
- ✅ [Specific measurable outcome]
- ✅ [Specific measurable outcome]

### Week 2
- ✅ [Specific measurable outcome]

[etc.]

---

## What Doesn't Change

[Reassurance section listing what stays the same]

Example:
- Database schema (additive only, no destructive changes)
- Integration point (still lib/sovereign/maiaService.ts)
- Performance (no latency increase)

---

## Questions Before We Start

1. **Engineering**: [Specific question for engineers]
2. **Facilitation**: [Specific question for facilitators]
3. **Data Analysis**: [Specific question for data team]
4. **All**: When should we schedule the kickoff session?

---

## Next Steps

1. **Schedule team kickoff** — 1-hour session this week
2. **Review integration plan** — Any modifications needed?
3. **Assign owners** — Who owns each phase?
4. **Set observation cadence** — Daily/weekly rhythm
5. **Confirm rollback plan** — Who has authority to disable?

---

**Closing metaphor:**
[End with the philosophical principle or metaphor that grounds the work]

Example: "This is a metaphysical precision upgrade, not a rewrite. The technical spine is complete. We're adding the language that matches what the system actually does: invoking archetypal coherences with proper containment and discernment. Let's keep the demons out and invite the guides in. 🌿✨"
```

---

### DOCUMENT 5: Status Report (Root level: FEATURE_SYSTEM_SHIP_READY.md)

**Length:** 1000-1500 words
**Audience:** Stakeholders deciding whether to enable feature

Structure:
```markdown
# FEATURE System — Shippable Spine Complete

**Status:** Production-ready, pending `FEATURE_ENABLED=1`
**Reviewed:** YYYY-MM-DD
**Integration Point:** lib/sovereign/maiaService.ts (lines X-Y)

---

## What We Built

[2-3 paragraphs explaining the complete system]

---

## Stack Delivered

### 1) Filesystem Structure (X files)
- features/item-1/* (meta.json, definition.json, prompts/)
- features/item-2/* (same structure)
[List all items]

### 2) Database Layer (Y files)
- supabase/migrations/YYYYMMDD_create_feature.sql
- Tables: feature_registry, feature_events, feature_unlocks
- Functions: log_feature_event(), is_feature_unlocked()
- Views: v_feature_metrics, v_feature_patterns

### 3) Backend Runtime (Z files)
- lib/feature/types.ts
- lib/feature/loader.ts
- lib/feature/selector.ts
- lib/feature/runtime.ts
- lib/feature/db.ts

### 4) Integration Point
- lib/sovereign/maiaService.ts (lines X-Y, ~111 lines)
- Wired after routing, before normal paths
- Feature flag: FEATURE_ENABLED=1

---

## How To Enable

```bash
# 1. Migrations already applied ✅

# 2. Enable feature runtime
export FEATURE_ENABLED=1

# Optional: Shadow mode (log without changing behavior)
export FEATURE_SHADOW_MODE=1

# 3. Start MAIA
npm run dev
```

---

## Quick Verification (Minimal)

### Test 1: Feature Selection
```bash
curl -X POST http://localhost:3000/api/maia \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test", "input": "Test query here"}'
```

**Expected:** [What should happen]

### Test 2: Database Logging
```sql
SELECT item_id, outcome, created_at
FROM feature_events
ORDER BY created_at DESC
LIMIT 5;
```

**Expected:** New row for each execution

### Test 3: Hard Refusal
```bash
curl -X POST http://localhost:3000/api/maia \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test",
    "input": "Query that should refuse",
    "meta": {"nervousSystemState": "dorsal"}
  }'
```

**Expected:** Mythic refusal message (not error)

---

## Integration Test Results

All X scenarios passing:

1. ✅ Load metadata from filesystem
2. ✅ Sync to database registry
3. ✅ Select correct item for query
4. ✅ Hard refusal when contraindicated
5. ✅ Database logging confirmed

**Run tests:**
```bash
DATABASE_URL=postgresql://... \
npx tsx scripts/test-feature.ts
```

---

## Documentation Artifacts

1. **FEATURE_ARCHITECTURE.md** — Philosophy and core principles
2. **HOW_TO_ADD_NEW_FEATURE.md** — Developer quick reference
3. **FEATURE_INTEGRATION_GUIDE.md** — Technical integration
4. **FEATURE_INTEGRATION_TEAM_MEMO.md** — Team alignment
5. **This document** — Ship-ready summary

---

## What Makes This Different

[Comparison to similar systems, what's novel]

---

## Rollout Plan

### Phase 1: Silent Mode (Current)
- Flag: FEATURE_ENABLED=0
- Behavior: Code exists but doesn't execute
- Purpose: Integration verification

### Phase 2: Shadow Mode (Week 1)
- Flag: FEATURE_ENABLED=1 + FEATURE_SHADOW_MODE=1
- Behavior: Runs and logs, doesn't change output
- Metrics: Selection frequency, success rate, latency

### Phase 3: Gradual Rollout (Week 2-4)
- Progression: 10% → 25% → 50% → 100%
- Rollback: If success <80%, disable for all

---

## Files Created/Modified (N total)

### Core Runtime (X files)
- [List each file]

### Feature Definitions (Y files)
- [List each file]

### Database (Z files)
- [List each file]

[etc.]

---

## Next Steps (Post-Launch)

### Immediate (Week 1)
- [What to do first]

### Week 2-4
- [What comes next]

### Month 2
- [Longer-term plans]

---

## Success Criteria

### Week 1
- ✅ [Specific measurable outcome]

### Month 1
- ✅ [Specific measurable outcome]

[etc.]

---

## The System Is Complete

What was vision [X days] ago is now shippable reality:

✅ [Checklist of what's done]
✅ [Another item]
✅ [Another item]

**The rest is iteration.**

Turn on `FEATURE_ENABLED=1` and [what becomes possible].

---

**[Phase Name]: Complete.** ✅
```

---

## NAMING CONVENTION FOR ALL 5 DOCUMENTS

All documentation follows this pattern:

1. **FEATURE_ARCHITECTURE.md** — Philosophy (why we built this)
2. **HOW_TO_ADD_NEW_FEATURE.md** — Developer guide (how to add items)
3. **FEATURE_INTEGRATION_GUIDE.md** — Technical integration (where to wire)
4. **FEATURE_INTEGRATION_TEAM_MEMO.md** — Team alignment (rollout plan)
5. **FEATURE_SYSTEM_SHIP_READY.md** — Status report (what's done, how to enable)

---

## CROSS-LINKING STRATEGY

In each file, include "See also:" section linking to:
- ARCHITECTURE_PRINCIPLES.md (foundational concepts)
- Other related features (pattern-matching)
- Community-Commons/09-Technical/ index (if part of larger initiative)

Example:
```markdown
---

## See Also

- [ARCHITECTURE_PRINCIPLES.md](/lib/ARCHITECTURE_PRINCIPLES.md) — Core MAIA design principles
- [SKILLS_ARCHITECTURE.md](./SKILLS_ARCHITECTURE.md) — Related skills system
- [Community Commons Index](../README.md) — Full technical documentation
```

---

## SUCCESS CRITERIA FOR DOCUMENTATION

- ✅ Philosophy doc written BEFORE code implementation
- ✅ Quick reference includes copy-paste examples
- ✅ Integration guide specifies exact line numbers
- ✅ Team memo includes success criteria for each phase
- ✅ Status report enables non-engineers to understand what's ready
- ✅ All 5 docs cross-linked
- ✅ Docs updated when code changes
```

---

## Summary Table: When to Use Which Prompt

| Use Case | Pattern to Use | Key Output |
|----------|---------------|------------|
| Building new major system (agents, skills, frameworks) | Architecture Refinement | Philosophy doc, types, progressive disclosure, integration |
| Changing database schema or adding tables | Migration & Upgrade | Idempotent SQL migrations, apply script, verify script |
| Adding feature that could scale to 100+ items | Progressive Disclosure | 3-tier loading, feature flags, shadow mode |
| Shipping any new code | Testing & Verification | Golden test cases, integration tests, smoke tests |
| Completing implementation before rollout | Documentation | 5 docs: philosophy, quick ref, integration, team memo, status |

---

## Meta-Prompt Strategy

When working on ANY MAIA enhancement, use this structure:

```
I'm implementing [FEATURE_NAME] for MAIA.

Based on the MAIA-SOVEREIGN development patterns, I'll follow the [PATTERN_NAME] workflow.

Here's the specific work:
[Describe your feature/change]

Please help me:
1. [Specific design decision you need help with]
2. [Code review point]
3. [Documentation to write]

Follow the optimal prompt format for [PATTERN_NAME] from OPTIMAL_PROMPTS_TOP_5_PROCESSES.md.
```

This ensures:
- Consistency across all work
- Leverages lessons learned from past implementations
- Keeps teammates aligned on what "done" looks like
- Reduces rework and architectural drift

---

**End of guide. Use these prompts to maintain architectural coherence across all MAIA development.**
