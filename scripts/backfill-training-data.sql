-- BACKFILL: Migrate conversation_turns to maia_turns for training system
-- This script copies existing conversation data into the learning infrastructure
-- Run: docker exec maia-postgres psql -U soullab -d maia_consciousness -f /scripts/backfill-training-data.sql

BEGIN;

-- 1. Create maia_sessions for unique session_ids that don't exist
INSERT INTO maia_sessions (id, created_at, updated_at, turn_count, conversation_history)
SELECT DISTINCT
  session_id,
  MIN(created_at),
  MAX(created_at),
  COUNT(*) / 2,  -- Divide by 2 since user+assistant are separate rows
  '[]'::jsonb
FROM conversation_turns
WHERE session_id IS NOT NULL
  AND session_id NOT IN (SELECT id FROM maia_sessions)
GROUP BY session_id
ON CONFLICT (id) DO NOTHING;

-- 2. Backfill maia_turns from conversation_turns
-- Pair up user/assistant messages into single turns
WITH paired_turns AS (
  SELECT
    u.session_id,
    u.user_id,
    ROW_NUMBER() OVER (PARTITION BY u.session_id ORDER BY u.created_at) - 1 as turn_index,
    u.content as user_text,
    a.content as maia_text,
    u.created_at
  FROM conversation_turns u
  JOIN conversation_turns a
    ON u.session_id = a.session_id
    AND u.role = 'user'
    AND a.role = 'assistant'
    AND a.created_at > u.created_at
    AND a.created_at < u.created_at + INTERVAL '5 minutes'
  WHERE u.session_id IS NOT NULL
)
INSERT INTO maia_turns (
  session_id,
  turn_index,
  user_text,
  maia_text,
  processing_profile,
  primary_engine,
  used_claude_consult,
  rupture_flag,
  repair_flag,
  created_at
)
SELECT
  session_id,
  turn_index::integer,
  user_text,
  maia_text,
  'CORE',  -- Default to CORE since we don't know original profile
  'claude-sonnet-4-20250514',  -- Default engine
  true,  -- Assume Claude was consulted
  false,
  false,
  created_at
FROM paired_turns
WHERE NOT EXISTS (
  SELECT 1 FROM maia_turns mt
  WHERE mt.session_id = paired_turns.session_id
    AND mt.turn_index = paired_turns.turn_index
)
ON CONFLICT DO NOTHING;

-- 3. Report results
SELECT
  'conversation_turns' as source_table,
  COUNT(*) as total_rows
FROM conversation_turns
UNION ALL
SELECT
  'maia_turns (after backfill)' as source_table,
  COUNT(*) as total_rows
FROM maia_turns
UNION ALL
SELECT
  'maia_sessions (after backfill)' as source_table,
  COUNT(*) as total_rows
FROM maia_sessions;

COMMIT;

-- 4. Show sample of backfilled data
SELECT
  id,
  session_id,
  turn_index,
  LEFT(user_text, 50) as user_preview,
  LEFT(maia_text, 50) as maia_preview,
  processing_profile,
  created_at
FROM maia_turns
ORDER BY created_at DESC
LIMIT 5;
