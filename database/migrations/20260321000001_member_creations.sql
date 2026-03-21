-- Member Creations
-- Stores songwriter and poetry drafts — the writer's working surface across sessions.
-- A creation captures what was seeded and what the writer shaped it into.

CREATE TABLE IF NOT EXISTS member_creations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('song', 'poem')),
  title       TEXT NOT NULL DEFAULT 'Untitled',
  input_echo  TEXT NOT NULL DEFAULT '',
  -- Full seed JSON (SongSeed or PoemSeed depending on type)
  seed        JSONB NOT NULL DEFAULT '{}',
  -- Current draft text — editable by the writer, decoupled from the seed
  draft       TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS member_creations_member_idx
  ON member_creations (member_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS member_creations_type_idx
  ON member_creations (member_id, type, updated_at DESC);

COMMENT ON TABLE member_creations IS
  'Songwriter and poetry drafts — seeded by MAIA, shaped by the writer. Persists across sessions.';
