-- ============================================
-- SAFETY CONCERN LOGS
-- Audit trail for safety concern notifications
-- Part of the Between-Session Container feature
-- ============================================

CREATE TABLE IF NOT EXISTS safety_concern_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES client_messages(id) ON DELETE CASCADE,

  -- When the safety concern was logged
  logged_at TIMESTAMPTZ DEFAULT NOW(),

  -- Email notification tracking
  email_status TEXT DEFAULT 'pending' CHECK (email_status IN ('pending', 'sent', 'failed')),
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,
  email_error TEXT,

  -- Practitioner acknowledgment
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES members(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRITICAL: Unique constraint on message_id prevents duplicate logs/emails
-- This is the idempotency key - ON CONFLICT (message_id) DO NOTHING
CREATE UNIQUE INDEX IF NOT EXISTS idx_safety_concern_logs_message_id
  ON safety_concern_logs(message_id);

-- Index for practitioner dashboard
CREATE INDEX IF NOT EXISTS idx_safety_concern_logs_practitioner
  ON safety_concern_logs(practitioner_id, logged_at DESC);

-- Index for unacknowledged concerns (dashboard alert)
CREATE INDEX IF NOT EXISTS idx_safety_concern_logs_unacknowledged
  ON safety_concern_logs(practitioner_id)
  WHERE acknowledged_at IS NULL;

-- Index for pending emails (if implementing a worker/retry)
CREATE INDEX IF NOT EXISTS idx_safety_concern_logs_pending_email
  ON safety_concern_logs(email_status)
  WHERE email_status = 'pending';

-- Comments
COMMENT ON TABLE safety_concern_logs IS 'Audit trail for safety concern notifications sent to practitioners';
COMMENT ON COLUMN safety_concern_logs.message_id IS 'Reference to the message flagged as safety concern - UNIQUE for idempotency';
COMMENT ON COLUMN safety_concern_logs.email_status IS 'pending = not yet attempted, sent = success, failed = error occurred';
COMMENT ON COLUMN safety_concern_logs.email_sent IS 'TRUE if notification email was sent successfully';
COMMENT ON COLUMN safety_concern_logs.acknowledged_at IS 'When practitioner acknowledged the safety concern';
