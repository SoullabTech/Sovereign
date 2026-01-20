-- Migration: Authentication rate limiting
-- Purpose: Protect against brute force attacks

CREATE TABLE IF NOT EXISTS auth_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What we're rate limiting
  identifier VARCHAR(255) NOT NULL, -- IP address, email, or member_id
  identifier_type VARCHAR(20) NOT NULL, -- 'ip' | 'email' | 'member_id'
  endpoint VARCHAR(100) NOT NULL, -- '/api/members/signin', '/api/auth/webauthn/authenticate', etc.

  -- Rate limit tracking
  attempts INTEGER DEFAULT 1,
  first_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  last_attempt_at TIMESTAMPTZ DEFAULT NOW(),

  -- Blocking
  blocked_until TIMESTAMPTZ,
  block_count INTEGER DEFAULT 0, -- Number of times blocked (for exponential backoff)

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint to prevent duplicate entries
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_unique
ON auth_rate_limits(identifier, identifier_type, endpoint);

-- Index for finding blocked entries
CREATE INDEX IF NOT EXISTS idx_rate_limits_blocked
ON auth_rate_limits(blocked_until) WHERE blocked_until IS NOT NULL;

-- Function to check and update rate limit
-- Returns: TRUE if allowed, FALSE if blocked
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier VARCHAR(255),
  p_identifier_type VARCHAR(20),
  p_endpoint VARCHAR(100),
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 15
) RETURNS BOOLEAN AS $$
DECLARE
  v_record auth_rate_limits%ROWTYPE;
  v_backoff_minutes INTEGER;
BEGIN
  -- Get or create record
  SELECT * INTO v_record
  FROM auth_rate_limits
  WHERE identifier = p_identifier
    AND identifier_type = p_identifier_type
    AND endpoint = p_endpoint;

  IF NOT FOUND THEN
    -- First attempt, create record
    INSERT INTO auth_rate_limits (identifier, identifier_type, endpoint)
    VALUES (p_identifier, p_identifier_type, p_endpoint);
    RETURN TRUE;
  END IF;

  -- Check if currently blocked
  IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > NOW() THEN
    RETURN FALSE;
  END IF;

  -- Reset if window expired
  IF v_record.first_attempt_at < NOW() - (p_window_minutes || ' minutes')::INTERVAL THEN
    UPDATE auth_rate_limits
    SET attempts = 1,
        first_attempt_at = NOW(),
        last_attempt_at = NOW(),
        blocked_until = NULL,
        updated_at = NOW()
    WHERE id = v_record.id;
    RETURN TRUE;
  END IF;

  -- Increment attempts
  UPDATE auth_rate_limits
  SET attempts = attempts + 1,
      last_attempt_at = NOW(),
      updated_at = NOW()
  WHERE id = v_record.id
  RETURNING * INTO v_record;

  -- Check if should block
  IF v_record.attempts >= p_max_attempts THEN
    -- Exponential backoff: 15min, 30min, 1hr, 2hr, 4hr...
    v_backoff_minutes := p_window_minutes * POWER(2, v_record.block_count);
    IF v_backoff_minutes > 240 THEN v_backoff_minutes := 240; END IF; -- Max 4 hours

    UPDATE auth_rate_limits
    SET blocked_until = NOW() + (v_backoff_minutes || ' minutes')::INTERVAL,
        block_count = block_count + 1,
        attempts = 0,
        first_attempt_at = NOW() + (v_backoff_minutes || ' minutes')::INTERVAL,
        updated_at = NOW()
    WHERE id = v_record.id;
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to reset rate limit (on successful auth)
CREATE OR REPLACE FUNCTION reset_rate_limit(
  p_identifier VARCHAR(255),
  p_identifier_type VARCHAR(20),
  p_endpoint VARCHAR(100)
) RETURNS VOID AS $$
BEGIN
  DELETE FROM auth_rate_limits
  WHERE identifier = p_identifier
    AND identifier_type = p_identifier_type
    AND endpoint = p_endpoint;
END;
$$ LANGUAGE plpgsql;

-- Cleanup old rate limit records (run periodically)
CREATE OR REPLACE FUNCTION cleanup_rate_limits() RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM auth_rate_limits
  WHERE updated_at < NOW() - INTERVAL '24 hours'
    AND (blocked_until IS NULL OR blocked_until < NOW());
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE auth_rate_limits IS 'Rate limiting for authentication endpoints to prevent brute force attacks';
