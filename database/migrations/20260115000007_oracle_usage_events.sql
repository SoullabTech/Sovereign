-- Oracle Usage Events Table
-- Tracks API usage for quotas and analytics
-- Part of MAIA's telemetry system (graceful degradation)

CREATE TABLE IF NOT EXISTS oracle_usage_events (
  id SERIAL PRIMARY KEY,
  request_id TEXT,
  user_id TEXT,
  session_id TEXT,
  ip TEXT,
  level INTEGER,
  model TEXT,
  status TEXT NOT NULL,
  duration_ms INTEGER,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for quota checks and analytics
CREATE INDEX IF NOT EXISTS idx_oracle_usage_user_id ON oracle_usage_events(user_id);
CREATE INDEX IF NOT EXISTS idx_oracle_usage_created_at ON oracle_usage_events(created_at);
CREATE INDEX IF NOT EXISTS idx_oracle_usage_status ON oracle_usage_events(status);

COMMENT ON TABLE oracle_usage_events IS 'API usage tracking for quotas and analytics';
