-- Migration: Bardic cue tables
-- Created: 2025-12-30
-- Purpose: Postgres-native storage for episode cues (replacing Supabase)

BEGIN;

-- UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Core cue catalog (user-scoped - same cue may mean different things to different users)
CREATE TABLE IF NOT EXISTS bardic_cues (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT NOT NULL,                  -- User who owns this cue
  cue_type     TEXT NOT NULL,                  -- e.g. "place" | "scent" | "music" | "ritual" | "threshold"
  cue_key      TEXT NOT NULL,                  -- normalized key (lowercased, trimmed user_words)
  user_words   TEXT,                           -- original user description
  media_ref    TEXT,                           -- URL or file reference
  metadata     JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT bardic_cues_unique UNIQUE (user_id, cue_type, cue_key)
);

-- Join: which cues belong to which episode (with potency)
CREATE TABLE IF NOT EXISTS bardic_episode_cues (
  episode_id   TEXT NOT NULL,
  cue_id       UUID NOT NULL REFERENCES bardic_cues(id) ON DELETE CASCADE,
  potency      REAL NOT NULL DEFAULT 0.5,      -- 0..1, how strongly this cue evokes the episode
  notes        TEXT,
  metadata     JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (episode_id, cue_id)
);

-- Optional: track cue usage + reentry success (great for later "learning")
CREATE TABLE IF NOT EXISTS bardic_cue_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id   TEXT,
  cue_type     TEXT NOT NULL,
  cue_key      TEXT NOT NULL,
  event_type   TEXT NOT NULL,                  -- e.g. "triggered" | "reentered" | "failed"
  score        REAL,
  metadata     JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_bardic_cues_user
  ON bardic_cues (user_id);

CREATE INDEX IF NOT EXISTS idx_bardic_cues_lookup
  ON bardic_cues (user_id, cue_type, cue_key);

CREATE INDEX IF NOT EXISTS idx_bardic_cues_type
  ON bardic_cues (user_id, cue_type);

CREATE INDEX IF NOT EXISTS idx_bardic_episode_cues_episode
  ON bardic_episode_cues (episode_id);

CREATE INDEX IF NOT EXISTS idx_bardic_episode_cues_cue
  ON bardic_episode_cues (cue_id);

CREATE INDEX IF NOT EXISTS idx_bardic_cue_events_created
  ON bardic_cue_events (created_at DESC);

-- Trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_bardic_cues_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bardic_cues_updated_at ON bardic_cues;
CREATE TRIGGER bardic_cues_updated_at
  BEFORE UPDATE ON bardic_cues
  FOR EACH ROW
  EXECUTE FUNCTION update_bardic_cues_updated_at();

COMMIT;
