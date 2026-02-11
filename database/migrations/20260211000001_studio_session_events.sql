-- Studio Session Events: markers + live prompts for interactive Scribe
-- These tables support the interactive rail during live recording sessions.

-- 1A) Studio session markers (quick-tap moments during recording)
CREATE TABLE IF NOT EXISTS studio_session_markers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES scribe_sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ts_ms INT NOT NULL,
  marker_type TEXT NOT NULL,
  note TEXT,
  chair TEXT,
  created_by UUID NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_studio_markers_session_created
  ON studio_session_markers (session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_studio_markers_session_ts
  ON studio_session_markers (session_id, ts_ms);

-- 1B) Studio session live prompts (mid-session MAIA questions)
CREATE TABLE IF NOT EXISTS studio_session_live_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES scribe_sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ts_ms INT NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  model TEXT,
  created_by UUID NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_studio_prompts_session_created
  ON studio_session_live_prompts (session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_studio_prompts_session_ts
  ON studio_session_live_prompts (session_id, ts_ms);
