-- Capture Mode: Session-based note capture for devlogs and content creation
-- Enables timestamp-based markers for Descript chapters + Patreon drafts

CREATE TABLE IF NOT EXISTS capture_sessions (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL DEFAULT 'soullab',
  user_id TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  auto_started BOOLEAN NOT NULL DEFAULT FALSE,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_capture_sessions_org_user_started
  ON capture_sessions (org_id, user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_capture_sessions_user_active
  ON capture_sessions (user_id)
  WHERE ended_at IS NULL;

CREATE TABLE IF NOT EXISTS capture_notes (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES capture_sessions(id) ON DELETE CASCADE,
  org_id TEXT NOT NULL DEFAULT 'soullab',
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  offset_ms INTEGER NOT NULL DEFAULT 0,
  tag TEXT NOT NULL CHECK (tag IN ('ship', 'fix', 'decision', 'blocked', 'next')),
  text TEXT NOT NULL,
  meta JSONB NOT NULL DEFAULT '{}'::JSONB
);

CREATE INDEX IF NOT EXISTS idx_capture_notes_session_created
  ON capture_notes (session_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_capture_notes_org_user_created
  ON capture_notes (org_id, user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_capture_notes_tag
  ON capture_notes (session_id, tag);

COMMENT ON TABLE capture_sessions IS 'Capture Mode sessions for devlog/content creation';
COMMENT ON TABLE capture_notes IS 'Timestamped notes within capture sessions';
COMMENT ON COLUMN capture_notes.offset_ms IS 'Milliseconds since session start (for Descript chapters)';
COMMENT ON COLUMN capture_notes.tag IS 'Category: ship, fix, decision, blocked, next';
