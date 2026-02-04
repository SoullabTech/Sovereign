-- Microsoft 365 Calendar Integration Schema
-- Enables Microsoft Graph API calendar sync alongside Google Calendar
-- Sovereignty maintained: credentials stored locally, external services are sync targets only

-- ============================================
-- UNIFIED CALENDAR CREDENTIALS
-- Supports multiple providers (Google, Microsoft) per member
-- ============================================
CREATE TABLE IF NOT EXISTS calendar_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('google', 'microsoft')),
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    calendar_email TEXT,
    default_calendar_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(member_id, provider)
);

CREATE INDEX idx_calendar_credentials_member ON calendar_credentials(member_id);
CREATE INDEX idx_calendar_credentials_provider ON calendar_credentials(provider);

-- ============================================
-- ADD MICROSOFT CALENDAR FIELDS TO SESSIONS
-- ============================================

-- Add Microsoft-specific event tracking to sessions table
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS microsoft_event_id TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS microsoft_calendar_id TEXT;

-- Create index for Microsoft event lookups
CREATE INDEX IF NOT EXISTS idx_sessions_microsoft_event ON sessions(microsoft_event_id) WHERE microsoft_event_id IS NOT NULL;

-- ============================================
-- MIGRATION: Copy existing google_calendar_credentials to unified table
-- This preserves existing Google integrations
-- ============================================
DO $$
BEGIN
    -- Check if google_calendar_credentials table exists and has data
    IF EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'google_calendar_credentials'
    ) THEN
        -- Copy existing Google credentials to unified table
        INSERT INTO calendar_credentials (member_id, provider, access_token, refresh_token, token_expires_at, created_at, updated_at)
        SELECT
            user_id,
            'google',
            access_token,
            refresh_token,
            to_timestamp(expiry_date / 1000),
            created_at,
            updated_at
        FROM google_calendar_credentials
        ON CONFLICT (member_id, provider) DO NOTHING;
    END IF;
END $$;
