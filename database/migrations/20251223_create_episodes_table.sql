-- Episodes Table Migration (Bardic Memory)
-- Migrated from MAIA-PAI to MAIA-SOVEREIGN (Postgres)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  place_cue text,
  sense_cues jsonb,
  affect_valence integer,
  affect_arousal integer,
  elemental_state jsonb,
  scene_stanza text,
  sacred_flag boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS episodes_user_id_idx ON episodes(user_id);
CREATE INDEX IF NOT EXISTS episodes_user_occurred_at_idx ON episodes(user_id, occurred_at DESC);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_episodes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
