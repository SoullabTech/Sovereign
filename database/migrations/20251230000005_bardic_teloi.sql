-- Migration: Bardic teloi tables
-- Created: 2025-12-30
-- Purpose: Store teloi (future-pulls) and their alignment logs for Fire intelligence

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Teloi catalog (what wants to become)
CREATE TABLE IF NOT EXISTS bardic_teloi (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        TEXT NOT NULL,
  phrase         TEXT NOT NULL,               -- Concise statement of the telos
  origin_episode TEXT,                        -- Episode where this emerged
  strength       REAL NOT NULL DEFAULT 0.5,   -- Pull intensity (0-1)
  horizon_days   INTEGER,                     -- Temporal horizon (30, 90, 365, etc)
  signals        JSONB NOT NULL DEFAULT '[]'::jsonb, -- Observable markers of convergence
  metadata       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Telos alignment logs (convergence/divergence tracking)
CREATE TABLE IF NOT EXISTS bardic_telos_alignment_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id  TEXT NOT NULL,                  -- Episode being evaluated
  telos_id    UUID REFERENCES bardic_teloi(id) ON DELETE CASCADE,
  delta       REAL NOT NULL,                  -- -1 to +1 (diverging to converging)
  notes       TEXT,
  metadata    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bardic_teloi_user
  ON bardic_teloi (user_id);

CREATE INDEX IF NOT EXISTS idx_bardic_teloi_strength
  ON bardic_teloi (strength DESC);

CREATE INDEX IF NOT EXISTS idx_bardic_telos_alignment_telos
  ON bardic_telos_alignment_log (telos_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bardic_telos_alignment_episode
  ON bardic_telos_alignment_log (episode_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_bardic_teloi_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bardic_teloi_updated_at ON bardic_teloi;
CREATE TRIGGER bardic_teloi_updated_at
  BEFORE UPDATE ON bardic_teloi
  FOR EACH ROW
  EXECUTE FUNCTION update_bardic_teloi_updated_at();

COMMIT;
