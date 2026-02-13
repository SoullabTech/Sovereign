-- Migration: Add indexes for echo detection on field_records
-- Created: 2026-02-12
-- Purpose: Make sourceRef-based echo queries fast
--
-- Echo queries match on:
--   observation->'sourceRef'->>'oracleKey'   (exact hexagram/card)
--   observation->'sourceRef'->>'elementHint'  (element family)
--   observation->'sourceRef'->>'keyword'      (thematic echo)
--   tags ?| ARRAY[...]                        (tag overlap — already indexed via GIN)

BEGIN;

-- Expression indexes for sourceRef JSONB fields
-- These enable btree lookups on the most common echo query patterns

CREATE INDEX IF NOT EXISTS idx_field_records_sourceref_oracle_key
  ON field_records ((observation->'sourceRef'->>'oracleKey'))
  WHERE observation->'sourceRef' IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_field_records_sourceref_element
  ON field_records ((observation->'sourceRef'->>'elementHint'))
  WHERE observation->'sourceRef' IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_field_records_sourceref_keyword
  ON field_records ((observation->'sourceRef'->>'keyword'))
  WHERE observation->'sourceRef' IS NOT NULL;

-- Composite index for user + sourceRef queries (most common echo pattern)
CREATE INDEX IF NOT EXISTS idx_field_records_user_sourceref_oracle
  ON field_records (user_id, (observation->'sourceRef'->>'oracleKey'))
  WHERE observation->'sourceRef' IS NOT NULL;

COMMIT;
