-- 016_cognitive_turn_events.sql
-- Dialectical Scaffold: Bloom's Taxonomy cognitive level tracking
-- Created: December 28, 2025
--
-- Enable with: MAIA_ENABLE_COGNITIVE_TURN_EVENTS=1

-- Required for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS cognitive_turn_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- User/session identifiers (text to support both UUID and dev-friendly IDs)
  user_id TEXT,
  session_id TEXT,
  turn_index INTEGER,

  -- Bloom's Taxonomy detection
  bloom_level INTEGER NOT NULL CHECK (bloom_level BETWEEN 1 AND 6),
  bloom_label TEXT NOT NULL,
  bloom_score NUMERIC(4,2) NOT NULL CHECK (bloom_score BETWEEN 0 AND 1),

  -- Bypassing detection (spiritual/intellectual bypassing flags)
  bypassing_spiritual BOOLEAN NOT NULL DEFAULT FALSE,
  bypassing_intellectual BOOLEAN NOT NULL DEFAULT FALSE,

  -- Scaffolding system
  scaffolding_prompt TEXT,
  scaffolding_used BOOLEAN NOT NULL DEFAULT FALSE,

  -- Consciousness context (elemental/mythic layers)
  element TEXT,      -- 'FIRE', 'WATER', 'EARTH', 'AIR', 'VOID'
  facet TEXT,        -- 'FIRE_1', 'WATER_2', etc.
  archetype TEXT     -- 'MYSTIC', 'MENTOR', 'HEALER', etc.
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_cognitive_turn_events_created_at
  ON cognitive_turn_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cognitive_turn_events_user_id
  ON cognitive_turn_events (user_id);

CREATE INDEX IF NOT EXISTS idx_cognitive_turn_events_session_id
  ON cognitive_turn_events (session_id);

CREATE INDEX IF NOT EXISTS idx_cognitive_turn_events_bloom_level
  ON cognitive_turn_events (bloom_level);

-- Composite index for user progression queries
CREATE INDEX IF NOT EXISTS idx_cognitive_turn_events_user_created
  ON cognitive_turn_events (user_id, created_at DESC);

COMMENT ON TABLE cognitive_turn_events IS 'Longitudinal tracking of Bloom''s Taxonomy cognitive levels across MAIA conversations';
