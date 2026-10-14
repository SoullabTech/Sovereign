-- ASTRO-R4G isolated additive derivative ancestry. NOT installed or deployed.
-- A source_exchange_id with NULL means ancestry was not recorded; it does not
-- grant authority or imply that historical records are safe.
BEGIN;
SET LOCAL lock_timeout = '5s';

ALTER TABLE semantic_memory_vectors
  ADD COLUMN IF NOT EXISTS source_exchange_id UUID;
ALTER TABLE breakthrough_moments
  ADD COLUMN IF NOT EXISTS source_exchange_id UUID;

-- A retained origin tag must survive removal of the source conversation turn.
-- Existing rows stay 'unknown', never silently reclassified as ordinary.
ALTER TABLE developmental_memories
  ADD COLUMN IF NOT EXISTS source_session_id TEXT,
  ADD COLUMN IF NOT EXISTS origin_scope TEXT NOT NULL DEFAULT 'unknown'
    CHECK (origin_scope IN ('ordinary', 'conversation_only', 'unknown'));
ALTER TABLE semantic_memory_vectors
  ADD COLUMN IF NOT EXISTS source_session_id TEXT,
  ADD COLUMN IF NOT EXISTS origin_scope TEXT NOT NULL DEFAULT 'unknown'
    CHECK (origin_scope IN ('ordinary', 'conversation_only', 'unknown'));
ALTER TABLE breakthrough_moments
  ADD COLUMN IF NOT EXISTS source_session_id TEXT,
  ADD COLUMN IF NOT EXISTS origin_scope TEXT NOT NULL DEFAULT 'unknown'
    CHECK (origin_scope IN ('ordinary', 'conversation_only', 'unknown'));

CREATE INDEX IF NOT EXISTS r4g_dev_source_session_idx
  ON developmental_memories (source_session_id)
  WHERE source_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS r4g_semantic_memory_exchange_ancestry_idx
  ON semantic_memory_vectors (source_exchange_id)
  WHERE source_exchange_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS r4g_breakthrough_exchange_ancestry_idx
  ON breakthrough_moments (source_exchange_id)
  WHERE source_exchange_id IS NOT NULL;

COMMENT ON COLUMN semantic_memory_vectors.source_exchange_id IS
  'Exact conversation exchange which generated this vector; NULL denotes unknown lineage and must not be silently declared consent-safe.';
COMMENT ON COLUMN breakthrough_moments.source_exchange_id IS
  'Exact conversation exchange lineage; NULL is historical/unknown origin, not a transfer grant.';
COMMIT;
