-- Migration: Add step-up authentication timestamp to sessions
-- Purpose: Track when a session last completed step-up authentication (passkey re-auth)

ALTER TABLE auth_sessions
ADD COLUMN IF NOT EXISTS last_step_up_at TIMESTAMPTZ;

COMMENT ON COLUMN auth_sessions.last_step_up_at IS 'When the session last completed step-up authentication (passkey re-auth)';
