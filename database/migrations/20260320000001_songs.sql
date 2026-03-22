-- Songs: draft persistence for MAIA Songwriter Mode
-- Each row is one songwriter's draft. JSONB columns evolve with the canvas.

CREATE TABLE IF NOT EXISTS songs (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title             TEXT        NOT NULL DEFAULT 'Untitled Song',
  status            TEXT        NOT NULL DEFAULT 'draft'
                                CHECK (status IN ('draft', 'archived')),
  seed_prompt       TEXT,
  seed_payload      JSONB,
  lyrics            JSONB,
  chords            JSONB,
  structure         JSONB,
  canvas            JSONB,
  meta              JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_opened_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS songs_user_id_idx
  ON songs (user_id);

CREATE INDEX IF NOT EXISTS songs_user_updated_at_idx
  ON songs (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS songs_user_last_opened_at_idx
  ON songs (user_id, last_opened_at DESC);
