-- Migration: Server-side authentication sessions
-- Purpose: Store sessions in PostgreSQL instead of localStorage-only

CREATE TABLE IF NOT EXISTS auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  session_token VARCHAR(64) UNIQUE NOT NULL,
  device_id UUID,  -- Will reference trusted_devices once that table exists
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMPTZ,
  revoked_reason VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast session lookups by token
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth_sessions(session_token) WHERE revoked = FALSE;

-- Index for finding sessions by member
CREATE INDEX IF NOT EXISTS idx_auth_sessions_member ON auth_sessions(member_id) WHERE revoked = FALSE;

-- Index for cleanup of expired sessions
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires ON auth_sessions(expires_at) WHERE revoked = FALSE;

-- Function to clean up expired sessions (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions() RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM auth_sessions
  WHERE expires_at < NOW() OR revoked = TRUE AND revoked_at < NOW() - INTERVAL '7 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE auth_sessions IS 'Server-side session storage for secure authentication';
