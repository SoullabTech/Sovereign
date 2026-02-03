-- ============================================
-- PRACTITIONER SETTINGS TABLE
-- ============================================
-- Stores configuration for practitioners: session defaults, notifications, practice settings
-- Created: 2026-01-22

-- Create practitioner_settings table
CREATE TABLE IF NOT EXISTS practitioner_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL UNIQUE REFERENCES practitioners(id) ON DELETE CASCADE,

    -- Session defaults
    default_duration_minutes INTEGER NOT NULL DEFAULT 60,
    default_location_type VARCHAR(50) NOT NULL DEFAULT 'video',
    default_session_type VARCHAR(100) NOT NULL DEFAULT 'consultation',
    default_fee DECIMAL(10,2),
    buffer_between_sessions INTEGER NOT NULL DEFAULT 15,
    booking_advance_days INTEGER NOT NULL DEFAULT 30,
    cancellation_policy TEXT,
    confirmation_template TEXT,
    follow_up_template TEXT,

    -- Notification settings
    email_new_booking BOOLEAN NOT NULL DEFAULT true,
    email_booking_reminder BOOLEAN NOT NULL DEFAULT true,
    email_follow_up_reminder BOOLEAN NOT NULL DEFAULT true,
    email_payment_received BOOLEAN NOT NULL DEFAULT true,
    reminder_hours_before INTEGER NOT NULL DEFAULT 24,
    follow_up_days_after INTEGER NOT NULL DEFAULT 3,

    -- Practice settings
    timezone VARCHAR(100) NOT NULL DEFAULT 'America/Chicago',
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    working_hours JSONB,
    booking_enabled BOOLEAN NOT NULL DEFAULT true,
    payments_enabled BOOLEAN NOT NULL DEFAULT false,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_practitioner_settings_practitioner_id
    ON practitioner_settings(practitioner_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_practitioner_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_practitioner_settings_updated_at ON practitioner_settings;
CREATE TRIGGER trg_practitioner_settings_updated_at
    BEFORE UPDATE ON practitioner_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_practitioner_settings_updated_at();

-- Initialize settings for any existing practitioners who don't have them
INSERT INTO practitioner_settings (practitioner_id)
SELECT id FROM practitioners p
WHERE NOT EXISTS (
    SELECT 1 FROM practitioner_settings ps WHERE ps.practitioner_id = p.id
)
ON CONFLICT (practitioner_id) DO NOTHING;

COMMENT ON TABLE practitioner_settings IS 'Configuration settings for Stellium practitioners';
