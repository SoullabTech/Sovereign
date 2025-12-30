-- Migration: Teleology tables (teloi + alignment tracking)
-- Created: 2025-12-30
-- Purpose: Store telos emergence and alignment history for Fire intelligence

BEGIN;

-- Ensure gen_random_uuid() is available (built-in on PostgreSQL 13+, needs pgcrypto on older)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Teloi table: tracks "what wants to become"
CREATE TABLE IF NOT EXISTS teloi (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          TEXT NOT NULL,
  phrase           TEXT NOT NULL,                    -- Concise statement of the telos
  origin_episode   UUID,                             -- Episode where this emerged (optional)
  strength         REAL NOT NULL DEFAULT 0.5,        -- 0..1 pull intensity
  horizon_days     INTEGER,                          -- Temporal horizon (30, 90, 365, etc)
  signals          JSONB DEFAULT '[]'::jsonb,        -- Observable markers of convergence
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Telos alignment log: tracks how episodes relate to teloi
CREATE TABLE IF NOT EXISTS telos_alignment_log (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id       UUID NOT NULL,
  telos_id         UUID NOT NULL REFERENCES teloi(id) ON DELETE CASCADE,
  delta            REAL NOT NULL,                    -- -1..+1 (diverging to converging)
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for teloi
CREATE INDEX IF NOT EXISTS idx_teloi_user_id
  ON teloi (user_id);

CREATE INDEX IF NOT EXISTS idx_teloi_user_strength
  ON teloi (user_id, strength DESC);

CREATE INDEX IF NOT EXISTS idx_teloi_origin
  ON teloi (origin_episode)
  WHERE origin_episode IS NOT NULL;

-- Indexes for alignment log
CREATE INDEX IF NOT EXISTS idx_telos_alignment_telos_id
  ON telos_alignment_log (telos_id);

CREATE INDEX IF NOT EXISTS idx_telos_alignment_episode_id
  ON telos_alignment_log (episode_id);

CREATE INDEX IF NOT EXISTS idx_telos_alignment_created
  ON telos_alignment_log (telos_id, created_at DESC);

COMMIT;
