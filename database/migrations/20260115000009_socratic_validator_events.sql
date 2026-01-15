-- Socratic Validator Events Table
-- Tracks validation decisions and ruptures per conversation
-- Part of MAIA's quality assurance system

CREATE TABLE IF NOT EXISTS socratic_validator_events (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  session_id TEXT,
  route TEXT,
  decision TEXT,
  is_gold BOOLEAN DEFAULT FALSE,
  passes BOOLEAN DEFAULT TRUE,
  ruptures JSONB DEFAULT '[]'::jsonb,
  rupture_count INTEGER DEFAULT 0,
  critical_count INTEGER DEFAULT 0,
  violation_count INTEGER DEFAULT 0,
  warning_count INTEGER DEFAULT 0,
  element TEXT,
  facet TEXT,
  phase INTEGER,
  confidence NUMERIC(4,3),
  is_uncertain BOOLEAN DEFAULT FALSE,
  regenerated BOOLEAN DEFAULT FALSE,
  regeneration_attempt INTEGER DEFAULT 0,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_socratic_user_id ON socratic_validator_events(user_id);
CREATE INDEX IF NOT EXISTS idx_socratic_session_id ON socratic_validator_events(session_id);
CREATE INDEX IF NOT EXISTS idx_socratic_is_gold ON socratic_validator_events(is_gold);
CREATE INDEX IF NOT EXISTS idx_socratic_created_at ON socratic_validator_events(created_at);

COMMENT ON TABLE socratic_validator_events IS 'Socratic validator quality decisions per conversation';
