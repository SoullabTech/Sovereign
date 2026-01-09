-- RLM Audit Log
-- Track all RLM/RCN recursive operations for security and debugging

CREATE TABLE IF NOT EXISTS rlm_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  session_id TEXT,

  -- Action type
  action TEXT NOT NULL CHECK (action IN ('request', 'tool_call', 'completion', 'error', 'rate_limit')),

  -- Tool call details
  tool_name TEXT,
  tool_input TEXT,  -- Truncated to 1000 chars

  -- Corpus info
  corpus_type TEXT,

  -- Budget usage (at completion)
  budget_recursions INTEGER,
  budget_tool_calls INTEGER,
  budget_chunks_read INTEGER,
  budget_elapsed_ms INTEGER,

  -- Outcome
  completed_normally BOOLEAN,
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for querying
CREATE INDEX IF NOT EXISTS idx_rlm_audit_user_id ON rlm_audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rlm_audit_request_id ON rlm_audit_log(request_id);
CREATE INDEX IF NOT EXISTS idx_rlm_audit_action ON rlm_audit_log(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rlm_audit_errors ON rlm_audit_log(created_at DESC) WHERE action = 'error';

-- Cleanup old logs (keep 30 days)
CREATE INDEX IF NOT EXISTS idx_rlm_audit_cleanup ON rlm_audit_log(created_at) WHERE created_at < NOW() - INTERVAL '30 days';

-- Grant permissions
GRANT SELECT, INSERT ON rlm_audit_log TO soullab;

COMMENT ON TABLE rlm_audit_log IS 'Audit log for RLM/RCN recursive operations (security and debugging)';
COMMENT ON COLUMN rlm_audit_log.tool_input IS 'Truncated to 1000 chars for storage';
