-- Migration: Native biometry support for trusted devices
-- Purpose: Enable Face ID/Touch ID authentication on iOS native apps

-- Add native biometry columns to trusted_devices
ALTER TABLE trusted_devices
ADD COLUMN IF NOT EXISTS native_biometry_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS native_biometry_type VARCHAR(20); -- 'face_id', 'touch_id', 'face', 'fingerprint'

-- Index for finding devices with native biometry
CREATE INDEX IF NOT EXISTS idx_trusted_devices_native_biometry
ON trusted_devices(member_id, native_biometry_enabled)
WHERE native_biometry_enabled = TRUE;

COMMENT ON COLUMN trusted_devices.native_biometry_enabled IS 'Whether native biometry (Face ID/Touch ID) is enabled for this device';
COMMENT ON COLUMN trusted_devices.native_biometry_type IS 'Type of native biometry: face_id, touch_id, face, fingerprint';
