---
description: "Create database migration for new feature"
argument-hint: "feature-name"
allowed-tools: "Read,Write,Bash"
---

# Migration & Upgrade Pattern

You're designing a database migration for: **$1**

## 1. DEPENDENCY ANALYSIS

List all tables/functions this feature depends on (don't create them, assume they exist).

Example:
```
Depends on:
- sessions table (id, user_id, created_at)
- user_profiles table (user_id, cognitive_level)
- pgvector extension for embeddings
```

## 2. MIGRATION FILE

Create `supabase/migrations/YYYYMMDD_$1.sql`:

```sql
-- Feature: [What this enables]
-- Dependencies: [What must exist first]
-- Rollback: DROP TABLE $1_table; DROP FUNCTION $1_fn();

-- ===== CORE TABLES =====

CREATE TABLE IF NOT EXISTS $1_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,

  -- Core columns
  data jsonb DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE $1_table IS 'Stores [what data] for [what purpose]';

-- ===== HELPER FUNCTIONS =====

CREATE OR REPLACE FUNCTION log_$1_event(
  p_user_id uuid,
  p_event_type text,
  p_event_data jsonb DEFAULT '{}'::jsonb
) RETURNS bigint AS $$
DECLARE
  v_event_id bigint;
BEGIN
  INSERT INTO $1_events (user_id, event_type, event_data)
  VALUES (p_user_id, p_event_type, p_event_data)
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- ===== OBSERVABILITY VIEWS =====

CREATE OR REPLACE VIEW v_$1_metrics AS
SELECT
  DATE_TRUNC('day', created_at) as day,
  COUNT(*) as total_events,
  COUNT(DISTINCT user_id) as unique_users
FROM $1_events
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY day DESC;

-- ===== PERFORMANCE INDEXES =====

CREATE INDEX IF NOT EXISTS idx_$1_user ON $1_table(user_id);
CREATE INDEX IF NOT EXISTS idx_$1_created ON $1_table(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_$1_user_time ON $1_table(user_id, created_at DESC);
```

## 3. APPLY SCRIPT

Create `scripts/apply-$1-migration.ts`:

```typescript
import { readFileSync } from 'fs';
import { query } from '@/lib/db';

async function applyMigration() {
  try {
    console.log("📦 Applying $1 migration...\n");

    // Check if already applied
    const check = await query(`
      SELECT migration_name FROM applied_migrations
      WHERE migration_name = 'YYYYMMDD_$1';
    `);

    if (check.rows.length > 0) {
      console.log("⏭️  Migration already applied, skipping.");
      return;
    }

    // Read migration file
    const sql = readFileSync(
      './supabase/migrations/YYYYMMDD_$1.sql',
      'utf-8'
    );

    // Execute
    await query(sql);

    // Record application
    await query(`
      INSERT INTO applied_migrations (migration_name, applied_at)
      VALUES ('YYYYMMDD_$1', NOW());
    `);

    console.log("✅ Migration applied successfully");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    console.log("\n💡 To rollback:");
    console.log("   DROP TABLE $1_table;");
    console.log("   DROP FUNCTION log_$1_event();");
    process.exit(1);
  }
}

applyMigration();
```

## 4. VERIFY SCRIPT

Create `scripts/verify-$1-migration.ts`:

```typescript
async function verifyMigration() {
  console.log("🔍 Verifying $1 migration...\n");

  // 1. Tables exist
  console.log("1. Checking tables...");
  const tables = await query(`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename LIKE '$1%';
  `);
  console.log(`   ✅ Found ${tables.rows.length} tables`);

  // 2. Functions work
  console.log("2. Testing functions...");
  const testResult = await query(`
    SELECT log_$1_event(
      'test-uuid'::uuid,
      'test_event',
      '{"test": true}'::jsonb
    );
  `);
  console.log("   ✅ Functions callable");

  // 3. Views return data
  console.log("3. Testing views...");
  const metrics = await query(`SELECT * FROM v_$1_metrics LIMIT 1;`);
  console.log("   ✅ Views queryable");

  // 4. Indexes exist
  console.log("4. Checking indexes...");
  const indexes = await query(`
    SELECT indexname FROM pg_indexes
    WHERE tablename = '$1_table';
  `);
  console.log(`   ✅ Found ${indexes.rows.length} indexes`);

  console.log("\n✅ Migration verified");
}
```

## 5. DOCUMENTATION

Create `Community-Commons/09-Technical/README_$1_MIGRATION.md`:

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
- [ ] No destructive operations unless explicitly needed
- [ ] Apply script checks applied_migrations table
- [ ] Verify script tests tables, functions, views, indexes
- [ ] Documentation includes rollback procedure

---

**Now create the migration file, then the apply and verify scripts.**
