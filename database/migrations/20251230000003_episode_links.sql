-- Migration: Episode links table
-- Created: 2025-12-30
-- Purpose: Store graph edges between episodes (echoes, contrasts, fulfills, co_occurs)
--
-- GUARD: This migration only runs if episode_links doesn't exist OR is a table.
-- If episode_links is already a VIEW (from later migrations), we skip entirely.
-- The canonical end-state is: episode_links = VIEW over bardic_links (see 000006).

BEGIN;

-- Ensure gen_random_uuid() is available (built-in on PostgreSQL 13+, needs pgcrypto on older)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- GUARD: Only create table/indexes if episode_links doesn't exist or is a table (not a view)
DO $$
BEGIN
  -- Check if episode_links exists as a VIEW - if so, skip this migration entirely
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'episode_links'
      AND c.relkind = 'v'  -- 'v' = view
  ) THEN
    RAISE NOTICE 'episode_links is already a VIEW - skipping table creation (canonical state)';
    RETURN;
  END IF;

  -- episode_links doesn't exist or is a table - safe to proceed

  -- Create table (IF NOT EXISTS handles the "already a table" case)
  EXECUTE '
    CREATE TABLE IF NOT EXISTS episode_links (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      src_episode_id   UUID NOT NULL,
      dst_episode_id   UUID NOT NULL,
      relation         TEXT NOT NULL,
      weight           REAL NOT NULL DEFAULT 0.5,
      reasoning        TEXT,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT episode_links_unique UNIQUE (src_episode_id, dst_episode_id, relation)
    )
  ';

  -- Create indexes (only valid on tables, not views)
  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_episode_links_src ON episode_links (src_episode_id)';
  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_episode_links_dst ON episode_links (dst_episode_id)';
  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_episode_links_relation ON episode_links (relation)';
  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_episode_links_src_relation ON episode_links (src_episode_id, relation)';

  RAISE NOTICE 'episode_links table and indexes created successfully';
END $$;

COMMIT;
