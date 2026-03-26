-- ============================================
-- SESSION CANCEL / RESCHEDULE SUPPORT
-- Adds tracking columns for cancellations and reschedule chains
-- ============================================

-- Cancel tracking
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS cancelled_reason TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS cancelled_by TEXT
  CHECK (cancelled_by IS NULL OR cancelled_by IN ('client', 'practitioner'));

-- Reschedule chain
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS rescheduled_from_id UUID REFERENCES sessions(id);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS rescheduled_to_id UUID REFERENCES sessions(id);

-- Cancel/reschedule token (for email links — no auth required)
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS manage_token TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_manage_token ON sessions(manage_token) WHERE manage_token IS NOT NULL;

COMMENT ON COLUMN sessions.cancelled_at IS 'When the session was cancelled';
COMMENT ON COLUMN sessions.cancelled_reason IS 'Client or practitioner reason for cancellation';
COMMENT ON COLUMN sessions.cancelled_by IS 'Who cancelled: client or practitioner';
COMMENT ON COLUMN sessions.rescheduled_from_id IS 'If this session was created by rescheduling, points to the original';
COMMENT ON COLUMN sessions.rescheduled_to_id IS 'If this session was rescheduled, points to the replacement';
COMMENT ON COLUMN sessions.manage_token IS 'Token for unauthenticated cancel/reschedule links in emails';
