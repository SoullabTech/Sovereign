-- Track active sessions so maintenance mode can block NEW sessions
-- while letting existing sessions finish.

CREATE TABLE IF NOT EXISTS active_sessions (
  session_id TEXT PRIMARY KEY,
  member_id TEXT,
  anon_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_active_sessions_last_seen
  ON active_sessions (last_seen_at DESC);
