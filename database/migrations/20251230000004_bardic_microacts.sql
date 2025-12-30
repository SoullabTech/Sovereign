-- Migration: Bardic microacts tables
-- Created: 2025-12-30
-- Purpose: Store microacts (tiny embodied practices) and their logs

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Microacts catalog
CREATE TABLE IF NOT EXISTS bardic_microacts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT NOT NULL,
  description  TEXT NOT NULL,              -- What the microact is
  context      TEXT,                       -- When/where to do it
  element_bias TEXT,                       -- e.g. 'fire' | 'water' | 'earth' | 'air'
  metadata     JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Microact logs (when/how microacts were performed or suggested)
CREATE TABLE IF NOT EXISTS bardic_microact_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT NOT NULL,
  microact_id  UUID REFERENCES bardic_microacts(id) ON DELETE CASCADE,
  episode_id   TEXT,                       -- Episode that triggered this microact
  event_type   TEXT NOT NULL,              -- 'suggested' | 'started' | 'completed' | 'skipped'
  notes        TEXT,
  metadata     JSONB NOT NULL DEFAULT '{}'::jsonb,
  timestamp    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bardic_microacts_user
  ON bardic_microacts (user_id);

CREATE INDEX IF NOT EXISTS idx_bardic_microact_logs_user
  ON bardic_microact_logs (user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_bardic_microact_logs_episode
  ON bardic_microact_logs (episode_id);

CREATE INDEX IF NOT EXISTS idx_bardic_microact_logs_microact
  ON bardic_microact_logs (microact_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_bardic_microacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bardic_microacts_updated_at ON bardic_microacts;
CREATE TRIGGER bardic_microacts_updated_at
  BEFORE UPDATE ON bardic_microacts
  FOR EACH ROW
  EXECUTE FUNCTION update_bardic_microacts_updated_at();

COMMIT;
