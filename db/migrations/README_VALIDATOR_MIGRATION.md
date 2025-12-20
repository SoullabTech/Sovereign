# Socratic Validator Events Migration

## Overview

This migration creates the `socratic_validator_events` table for Phase 3 of the Three-Layer Conscience Architecture.

**Migration file:** `20251214_socratic_validator_events.sql`

## What This Creates

- **Table:** `socratic_validator_events` - Stores all Socratic Validator decisions
- **Indexes:** Optimized for analytics queries on decision, element, date, and rupture patterns
- **RLS Policies:**
  - Service role: Full access
  - Authenticated users: Can view their own validator events

## How to Apply

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `20251214_socratic_validator_events.sql`
4. Paste and run in the SQL editor
5. Verify success (no errors)

### Option 2: Supabase CLI

```bash
cd /path/to/MAIA-SOVEREIGN
npx supabase db push
```

**Note:** Requires `supabase link` to be configured first.

### Option 3: Direct psql Connection

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  -f supabase/migrations/20251214_socratic_validator_events.sql
```

## Verification

After applying the migration, verify the table exists:

```sql
-- Check table exists
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'socratic_validator_events';

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'socratic_validator_events';

-- Check indexes
SELECT indexname
FROM pg_indexes
WHERE tablename = 'socratic_validator_events';
```

Expected indexes:
- `idx_socratic_validator_events_created_at`
- `idx_socratic_validator_events_user_id`
- `idx_socratic_validator_events_decision`
- `idx_socratic_validator_events_element`
- `idx_socratic_validator_events_is_gold`
- `idx_socratic_validator_events_ruptures` (GIN index)

## Integration Status

✅ **TypeScript Validator:** `lib/validation/socraticValidator.ts`
✅ **Oracle Route:** Integrated with regeneration capability
✅ **MAIA Service:** Integrated into FAST/CORE/DEEP paths
✅ **Opus Pulse Dashboard:** `/app/steward/opus-pulse` shows validator metrics

## What Happens Without This Migration?

The Socratic Validator will still run and log to console, but:
- ❌ No telemetry stored in database
- ❌ Opus Pulse won't show validator metrics
- ❌ Can't analyze rupture patterns over time
- ❌ Can't track gold rate improvements

The validator is designed to be **non-blocking** - if the database insert fails, it logs an error but continues serving the response.

## Support

For questions, see:
- `Community-Commons/09-Technical/PHASE3_SOCRATIC_VALIDATOR_COMPLETE.md`
- `Community-Commons/09-Technical/THREE_LAYER_CONSCIENCE_ARCHITECTURE_COMPLETE.md`
