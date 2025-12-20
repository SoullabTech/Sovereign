-- Migration: Multi-Spiral States with Validation
-- Date: 2025-12-18
-- Purpose: Add multi-spiral support (7+ simultaneous spirals) with integrity constraints
-- Hardening: Prevents duplicate ranks, duplicate keys, invalid active ranks

-- Add spiral_states column (array of spiral states)
ALTER TABLE user_relationship_context
ADD COLUMN IF NOT EXISTS spiral_states JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS spiral_states_updated_at TIMESTAMPTZ DEFAULT NULL;

-- Create GIN index for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_user_relationship_spiral_states
ON user_relationship_context USING GIN (spiral_states);

-- Create validation function
CREATE OR REPLACE FUNCTION validate_spiral_states(states jsonb)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  WITH safe AS (
    SELECT CASE
      WHEN states IS NULL THEN '[]'::jsonb
      WHEN jsonb_typeof(states) = 'array' THEN states
      ELSE '[]'::jsonb
    END AS arr
  ),
  elems AS (
    SELECT
      COALESCE(
        CASE
          WHEN lower(btrim(e->>'activeNow')) IN ('true','false') THEN (btrim(e->>'activeNow'))::boolean
          ELSE NULL
        END,
        false
      ) AS active,
      (e->>'spiralKey') AS key,
      COALESCE(
        CASE
          WHEN btrim(e->>'priorityRank') ~ '^[0-9]+$' THEN (btrim(e->>'priorityRank'))::int
          ELSE NULL
        END,
        999
      ) AS rank
    FROM safe, jsonb_array_elements(safe.arr) AS e
  )
  SELECT
    -- 1) spiralKey present, non-empty, unique
    (SELECT count(*) = count(DISTINCT key) FROM elems)
    AND (SELECT COALESCE(bool_and(key IS NOT NULL AND btrim(key) <> ''), true) FROM elems)

    -- 2) Active ranks unique
    AND (SELECT count(*) = count(DISTINCT rank) FROM elems WHERE active)

    -- 3) Active ranks must be >=1 and must NOT be 999
    AND (SELECT COALESCE(bool_and(rank >= 1 AND rank <> 999), true) FROM elems WHERE active)

    -- 4) Inactive ranks must be exactly 999
    AND (SELECT COALESCE(bool_and(rank = 999), true) FROM elems WHERE NOT active);
$$;

-- Lift legacy single spiral_state into spiral_states (if exists and spiral_states is empty)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_relationship_context'
      AND column_name = 'spiral_state'
  ) THEN
    UPDATE user_relationship_context
    SET spiral_states = jsonb_build_array(
      jsonb_build_object(
        'spiralKey', 'general',
        'element', NULLIF(spiral_state->>'element', ''),
        'phase', CASE
          WHEN (spiral_state->>'phase') ~ '^[0-9]+$' THEN (spiral_state->>'phase')::int
          ELSE NULL
        END,
        'facet', NULLIF(spiral_state->>'facet', ''),
        'arc', NULLIF(spiral_state->>'arc', ''),
        'confidence', CASE
          WHEN (spiral_state->>'confidence') ~ '^[0-9]+\.?[0-9]*$' THEN (spiral_state->>'confidence')::numeric
          ELSE 0.75
        END,
        'source', 'migration',
        'updatedAt', COALESCE(
          NULLIF(spiral_state->>'updatedAt', ''),
          to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
        ),
        'activeNow', true,
        'priorityRank', 1
      )
    ),
    spiral_states_updated_at = now()
    WHERE spiral_state IS NOT NULL
      AND spiral_state <> '{}'::jsonb
      AND spiral_state <> 'null'::jsonb
      AND (spiral_states IS NULL OR spiral_states = '[]'::jsonb);
  END IF;
END $$;

-- Add CHECK constraint to enforce validation
ALTER TABLE user_relationship_context
ADD CONSTRAINT spiral_states_valid
CHECK (validate_spiral_states(spiral_states));

-- Add comments
COMMENT ON COLUMN user_relationship_context.spiral_states IS
'Array of spiral states. Each element: { spiralKey, element, phase, facet, arc, confidence, source, updatedAt, activeNow, priorityRank }. Top 3 active (activeNow=true, lowest priorityRank) are injected into prompts.';

COMMENT ON COLUMN user_relationship_context.spiral_states_updated_at IS
'Timestamp of last spiral_states update (for staleness detection and tie-breaking)';

COMMENT ON FUNCTION validate_spiral_states(jsonb) IS
'Validates spiral_states integrity: unique spiralKey, unique active priorityRank, active ranks >= 1';

-- Example spiral_states structure:
-- [
--   {
--     "spiralKey": "work",
--     "element": "Fire",
--     "phase": 3,
--     "facet": "Fire 3",
--     "arc": "expansion",
--     "confidence": 0.82,
--     "source": "user_checkin",
--     "updatedAt": "2025-12-18T18:12:00Z",
--     "activeNow": true,
--     "priorityRank": 1
--   },
--   {
--     "spiralKey": "relationship",
--     "element": "Water",
--     "phase": 2,
--     "facet": "Water 2",
--     "arc": "dissolution",
--     "confidence": 0.74,
--     "source": "soul_mirror",
--     "updatedAt": "2025-12-18T17:45:00Z",
--     "activeNow": true,
--     "priorityRank": 2
--   },
--   {
--     "spiralKey": "health",
--     "element": "Earth",
--     "phase": 0,
--     "facet": "Earth 0",
--     "arc": "grounding",
--     "confidence": 0.65,
--     "source": "inferred",
--     "updatedAt": "2025-12-17T12:00:00Z",
--     "activeNow": false,
--     "priorityRank": 999
--   }
-- ]

-- Migration completed
SELECT 'Multi-spiral states with validation added successfully!' as result;
