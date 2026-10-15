-- ASTRO-R4G isolated additive derivative ancestry. NOT installed or deployed.
-- A source_exchange_id with NULL means ancestry was not recorded; it does not
-- grant authority or imply that historical records are safe.
--
-- Beta bootstrap compatibility: the committed canonical baseline contains no
-- semantic_memory_vectors table and the repository has no genesis migration
-- for that sink. Do NOT invent one: creating it would enable a previously
-- failing content-persistence path. Protect the sink if it already exists;
-- otherwise retain its absence. Any future creation needs its own reviewed
-- provenance/schema contract, not an assumption that this branch created it.
--
-- This corrects a held migration. Already-applied different checksums must
-- still be refused by the existing migration runner, never restamped here.
BEGIN;
SET LOCAL lock_timeout = '5s';

ALTER TABLE breakthrough_moments
  ADD COLUMN IF NOT EXISTS source_exchange_id UUID;

-- A retained origin tag must survive removal of the source conversation turn.
-- Existing rows stay 'unknown', never silently reclassified as ordinary.
ALTER TABLE developmental_memories
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
CREATE INDEX IF NOT EXISTS r4g_breakthrough_exchange_ancestry_idx
  ON breakthrough_moments (source_exchange_id)
  WHERE source_exchange_id IS NOT NULL;

-- The absence branch creates no table, no row and no permission. Deliberately
-- no EXCEPTION handler: an existing but incompatible relation must fail.
DO $r4g_optional_existing_vector_sink$
BEGIN
  IF to_regclass('public.semantic_memory_vectors') IS NULL THEN
    RAISE NOTICE 'R4G: semantic_memory_vectors absent; no store created or activated';
  ELSE
    ALTER TABLE public.semantic_memory_vectors
      ADD COLUMN IF NOT EXISTS source_exchange_id UUID,
      ADD COLUMN IF NOT EXISTS source_session_id TEXT,
      ADD COLUMN IF NOT EXISTS origin_scope TEXT NOT NULL DEFAULT 'unknown'
        CHECK (origin_scope IN ('ordinary', 'conversation_only', 'unknown'));
    CREATE INDEX IF NOT EXISTS r4g_semantic_memory_exchange_ancestry_idx
      ON public.semantic_memory_vectors (source_exchange_id)
      WHERE source_exchange_id IS NOT NULL;
    COMMENT ON COLUMN public.semantic_memory_vectors.source_exchange_id IS
      'Exact conversation exchange which generated this vector; NULL denotes unknown lineage and must not be silently declared consent-safe.';
  END IF;
END;
$r4g_optional_existing_vector_sink$;

COMMENT ON COLUMN breakthrough_moments.source_exchange_id IS
  'Exact conversation exchange lineage; NULL is historical/unknown origin, not a transfer grant.';
COMMIT;
