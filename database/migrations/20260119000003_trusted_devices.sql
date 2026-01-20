-- Migration: Trusted device tracking
-- Purpose: Remember devices for "stay signed in" functionality

CREATE TABLE IF NOT EXISTS trusted_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Device identification (hashed fingerprint, never raw)
  device_fingerprint VARCHAR(64) NOT NULL,

  -- Device metadata
  device_name VARCHAR(255),
  device_type VARCHAR(50), -- 'mobile', 'desktop', 'tablet'
  browser VARCHAR(100),
  os VARCHAR(100),

  -- Trust configuration
  trust_level VARCHAR(20) DEFAULT 'standard', -- 'standard' | 'high' | 'temporary'
  expires_at TIMESTAMPTZ, -- NULL = permanent until revoked

  -- Activity tracking
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_ip INET,
  sign_in_count INTEGER DEFAULT 1,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for device lookup
CREATE INDEX IF NOT EXISTS idx_trusted_devices_fingerprint ON trusted_devices(device_fingerprint);

-- Index for finding devices by member
CREATE INDEX IF NOT EXISTS idx_trusted_devices_member ON trusted_devices(member_id);

-- Add foreign key to auth_sessions now that trusted_devices exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'auth_sessions_device_id_fkey'
  ) THEN
    ALTER TABLE auth_sessions
    ADD CONSTRAINT auth_sessions_device_id_fkey
    FOREIGN KEY (device_id) REFERENCES trusted_devices(id) ON DELETE SET NULL;
  END IF;
END $$;

COMMENT ON TABLE trusted_devices IS 'Trusted devices for "remember me" functionality';
