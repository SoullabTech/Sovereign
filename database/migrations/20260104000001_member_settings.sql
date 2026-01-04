-- Member Settings & Preferences
-- Extends member data with configurable settings

-- Add profile fields to members table
ALTER TABLE members ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'America/Los_Angeles';

-- Member settings table for preferences
CREATE TABLE IF NOT EXISTS member_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- MAIA Interaction Settings (synced from localStorage)
  default_memory_mode VARCHAR(20) DEFAULT 'continuity',
  voice_model VARCHAR(20) DEFAULT 'shimmer',
  voice_speed DECIMAL(3,2) DEFAULT 0.95,
  memory_depth VARCHAR(20) DEFAULT 'moderate',
  archetype VARCHAR(50) DEFAULT 'AUTO',
  conversation_mode VARCHAR(20) DEFAULT 'her',

  -- Notification Preferences
  email_weekly_digest BOOLEAN DEFAULT true,
  email_breakthrough_moments BOOLEAN DEFAULT true,
  email_community_updates BOOLEAN DEFAULT false,
  email_product_updates BOOLEAN DEFAULT true,

  -- Privacy Settings
  share_anonymous_insights BOOLEAN DEFAULT false,
  allow_research_participation BOOLEAN DEFAULT false,

  -- Membership/Circle
  circle_tier VARCHAR(50) DEFAULT 'explorer', -- explorer, sustainer, guardian, elder, pioneer
  circle_amount INTEGER DEFAULT 0,
  circle_joined_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(member_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_member_settings_member_id ON member_settings(member_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_member_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS member_settings_updated_at ON member_settings;
CREATE TRIGGER member_settings_updated_at
  BEFORE UPDATE ON member_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_member_settings_updated_at();

-- Session history table for non-sanctuary conversations
CREATE TABLE IF NOT EXISTS member_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  mode VARCHAR(20) DEFAULT 'continuity', -- continuity or sanctuary
  message_count INTEGER DEFAULT 0,
  summary TEXT, -- AI-generated summary of the session
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_member_sessions_member_id ON member_sessions(member_id);
CREATE INDEX IF NOT EXISTS idx_member_sessions_started_at ON member_sessions(started_at DESC);

COMMENT ON TABLE member_settings IS 'User preferences and notification settings';
COMMENT ON TABLE member_sessions IS 'Session history for continuity mode (not sanctuary)';
