-- ============================================
-- PRACTITIONER SETTINGS
-- Session defaults, notifications, and practice settings
-- ============================================

-- Practitioner settings table
CREATE TABLE IF NOT EXISTS practitioner_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,

  -- Session defaults
  default_duration_minutes INT NOT NULL DEFAULT 60,
  default_location_type VARCHAR(20) NOT NULL DEFAULT 'video'
    CHECK (default_location_type IN ('video', 'phone', 'in_person', 'async')),
  default_session_type VARCHAR(100) DEFAULT 'consultation',
  default_fee DECIMAL(10, 2),
  buffer_between_sessions INT NOT NULL DEFAULT 15,  -- minutes
  booking_advance_days INT NOT NULL DEFAULT 30,
  cancellation_policy TEXT,
  confirmation_template TEXT,
  follow_up_template TEXT,

  -- Notification preferences
  email_new_booking BOOLEAN NOT NULL DEFAULT true,
  email_booking_reminder BOOLEAN NOT NULL DEFAULT true,
  email_follow_up_reminder BOOLEAN NOT NULL DEFAULT true,
  email_payment_received BOOLEAN NOT NULL DEFAULT true,
  reminder_hours_before INT NOT NULL DEFAULT 24,
  follow_up_days_after INT NOT NULL DEFAULT 3,

  -- Practice settings
  timezone VARCHAR(100) NOT NULL DEFAULT 'America/New_York',
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  working_hours JSONB DEFAULT '{
    "monday": {"start": "09:00", "end": "17:00"},
    "tuesday": {"start": "09:00", "end": "17:00"},
    "wednesday": {"start": "09:00", "end": "17:00"},
    "thursday": {"start": "09:00", "end": "17:00"},
    "friday": {"start": "09:00", "end": "17:00"},
    "saturday": null,
    "sunday": null
  }'::jsonb,
  booking_enabled BOOLEAN NOT NULL DEFAULT false,
  payments_enabled BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(practitioner_id)
);

CREATE INDEX IF NOT EXISTS idx_practitioner_settings_practitioner
  ON practitioner_settings(practitioner_id);

-- Update trigger
DROP TRIGGER IF EXISTS tr_practitioner_settings_updated_at ON practitioner_settings;
CREATE TRIGGER tr_practitioner_settings_updated_at
  BEFORE UPDATE ON practitioner_settings
  FOR EACH ROW EXECUTE FUNCTION update_practitioner_updated_at();

-- Initialize settings for existing practitioners
INSERT INTO practitioner_settings (practitioner_id)
SELECT id FROM practitioners
WHERE id NOT IN (SELECT practitioner_id FROM practitioner_settings)
ON CONFLICT (practitioner_id) DO NOTHING;

COMMENT ON TABLE practitioner_settings IS 'Practitioner session defaults, notification preferences, and practice settings';
