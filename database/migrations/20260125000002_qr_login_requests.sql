-- Migration: QR login requests for cross-device authentication
-- Purpose: Enable desktop login by scanning QR code with authenticated phone

CREATE TABLE IF NOT EXISTS qr_login_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Request identification
  request_id VARCHAR(24) NOT NULL UNIQUE, -- 12-char hex, URL-friendly

  -- Status tracking
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'consumed', 'expired'

  -- Approval info (set when phone approves)
  approving_member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  approving_device_id UUID REFERENCES trusted_devices(id) ON DELETE SET NULL,

  -- Session token for desktop (set when approved)
  session_token VARCHAR(128),

  -- Security
  ip_address INET,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  consumed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL
);

-- Index for request lookup by request_id
CREATE INDEX IF NOT EXISTS idx_qr_login_requests_request_id ON qr_login_requests(request_id);

-- Index for finding pending requests (for cleanup)
CREATE INDEX IF NOT EXISTS idx_qr_login_requests_status_expires ON qr_login_requests(status, expires_at)
WHERE status = 'pending';

-- Index for member approval history
CREATE INDEX IF NOT EXISTS idx_qr_login_requests_member ON qr_login_requests(approving_member_id)
WHERE approving_member_id IS NOT NULL;

-- Automatically expire old requests (run via cron or pg_cron)
-- DELETE FROM qr_login_requests WHERE expires_at < NOW() AND status = 'pending';

COMMENT ON TABLE qr_login_requests IS 'QR code login requests for cross-device authentication';
COMMENT ON COLUMN qr_login_requests.request_id IS 'URL-friendly request ID shown in QR code';
COMMENT ON COLUMN qr_login_requests.status IS 'pending = waiting for approval, approved = phone confirmed, consumed = desktop got session, expired = TTL exceeded';
