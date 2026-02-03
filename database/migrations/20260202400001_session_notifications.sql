-- Session Notifications Tracking
-- Tracks all notifications sent for sessions (confirmations, reminders, cancellations)
-- Supports dual-channel delivery (WhatsApp + SMS for US clients)

CREATE TABLE IF NOT EXISTS session_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,  -- References sessions.id
  notification_type TEXT NOT NULL,  -- 'booking_confirmation', 'reminder_24h_whatsapp', 'reminder_24h_sms', 'reminder_1h_whatsapp', 'reminder_1h_sms', etc.
  channel TEXT NOT NULL,  -- 'whatsapp', 'sms', 'email', 'telegram'
  external_id TEXT,  -- Message ID from provider (Twilio SID, etc.)
  status TEXT DEFAULT 'sent',  -- 'sent', 'delivered', 'failed', 'read'
  error_message TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Allow multiple channels for same reminder type (WhatsApp + SMS)
  UNIQUE(session_id, notification_type)
);

-- Index for looking up notifications by session
CREATE INDEX IF NOT EXISTS idx_session_notifications_session_id ON session_notifications(session_id);

-- Index for finding pending reminders to send
CREATE INDEX IF NOT EXISTS idx_session_notifications_type ON session_notifications(notification_type, sent_at);

-- Add phone column to practitioner_clients if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'practitioner_clients' AND column_name = 'phone'
  ) THEN
    ALTER TABLE practitioner_clients ADD COLUMN phone TEXT;
  END IF;
END $$;

-- Add notification preferences to practitioners
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'practitioners' AND column_name = 'notification_settings'
  ) THEN
    ALTER TABLE practitioners ADD COLUMN notification_settings JSONB DEFAULT '{
      "booking_confirmation": true,
      "reminder_24h": true,
      "reminder_1h": true,
      "preferred_channel": "whatsapp"
    }'::jsonb;
  END IF;
END $$;

COMMENT ON TABLE session_notifications IS 'Tracks all notifications sent for session events';
COMMENT ON COLUMN session_notifications.notification_type IS 'Type: booking_confirmation, reminder_24h, reminder_1h, cancellation, reschedule';
COMMENT ON COLUMN session_notifications.channel IS 'Delivery channel: whatsapp, sms, email, telegram';
