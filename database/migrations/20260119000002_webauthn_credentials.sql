-- Migration: WebAuthn credential storage for passkeys/biometrics
-- Purpose: Store WebAuthn public keys for Face ID, Touch ID, Windows Hello

CREATE TABLE IF NOT EXISTS webauthn_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- WebAuthn credential data
  credential_id TEXT UNIQUE NOT NULL,
  public_key TEXT NOT NULL,
  counter BIGINT DEFAULT 0,

  -- Device metadata
  device_type VARCHAR(50) NOT NULL DEFAULT 'platform', -- 'platform' (built-in) | 'cross-platform' (USB key)
  transports TEXT[], -- ['internal', 'usb', 'ble', 'nfc', 'hybrid']
  aaguid TEXT, -- Authenticator Attestation GUID

  -- User-friendly info
  device_name VARCHAR(255),

  -- Lifecycle
  last_used_at TIMESTAMPTZ,
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for credential lookup during authentication
CREATE INDEX IF NOT EXISTS idx_webauthn_credential_id ON webauthn_credentials(credential_id) WHERE revoked = FALSE;

-- Index for finding credentials by member
CREATE INDEX IF NOT EXISTS idx_webauthn_member ON webauthn_credentials(member_id) WHERE revoked = FALSE;

COMMENT ON TABLE webauthn_credentials IS 'WebAuthn/passkey credentials for biometric authentication (Face ID, Touch ID, etc.)';
