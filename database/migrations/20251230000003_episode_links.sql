-- Migration: Episode links table
-- Created: 2025-12-30
-- Purpose: Store graph edges between episodes (echoes, contrasts, fulfills, co_occurs)

BEGIN;

-- Episode links table for the mycelial memory graph
CREATE TABLE IF NOT EXISTS episode_links (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  src_episode_id   UUID NOT NULL,
  dst_episode_id   UUID NOT NULL,
  relation         TEXT NOT NULL,                -- 'echoes' | 'contrasts' | 'fulfills' | 'co_occurs'
  weight           REAL NOT NULL DEFAULT 0.5,    -- 0..1 strength of connection
  reasoning        TEXT,                         -- optional explanation
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Prevent duplicate links (same src → dst with same relation)
  CONSTRAINT episode_links_unique UNIQUE (src_episode_id, dst_episode_id, relation)
);

-- Indexes for graph traversal
CREATE INDEX IF NOT EXISTS idx_episode_links_src
  ON episode_links (src_episode_id);

CREATE INDEX IF NOT EXISTS idx_episode_links_dst
  ON episode_links (dst_episode_id);

CREATE INDEX IF NOT EXISTS idx_episode_links_relation
  ON episode_links (relation);

-- Composite index for finding all links for an episode
CREATE INDEX IF NOT EXISTS idx_episode_links_src_relation
  ON episode_links (src_episode_id, relation);

COMMIT;
