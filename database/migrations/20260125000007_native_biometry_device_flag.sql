-- Migration: Add native biometry tracking to trusted devices
-- Purpose: Track which trusted devices have native Face ID/Touch ID enabled

-- Add biometry tracking columns
ALTER TABLE trusted_devices
ADD COLUMN IF NOT EXISTS biometry_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS biometry_type VARCHAR(50); -- 'faceId', 'touchId', 'fingerprint', etc.

-- Add biometry enabled timestamp
ALTER TABLE trusted_devices
ADD COLUMN IF NOT EXISTS biometry_enabled_at TIMESTAMPTZ;

COMMENT ON COLUMN trusted_devices.biometry_enabled IS 'Whether native biometry (Face ID/Touch ID) is enabled for this device';
COMMENT ON COLUMN trusted_devices.biometry_type IS 'Type of biometry: faceId, touchId, fingerprint, etc.';
COMMENT ON COLUMN trusted_devices.biometry_enabled_at IS 'When biometry was enabled on this device';
