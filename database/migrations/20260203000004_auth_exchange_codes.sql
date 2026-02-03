-- OAuth Exchange Codes Table
-- Used for secure token exchange after OAuth callbacks
-- Codes are single-use and short-lived (5 minutes)

CREATE TABLE IF NOT EXISTS auth_exchange_codes (
  code TEXT PRIMARY KEY,
  session_token TEXT NOT NULL,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for expiry-based cleanup
CREATE INDEX IF NOT EXISTS auth_exchange_codes_expires_idx
  ON auth_exchange_codes (expires_at);

-- Index for member lookups
CREATE INDEX IF NOT EXISTS auth_exchange_codes_member_idx
  ON auth_exchange_codes (member_id);

-- Cleanup old codes (can be run periodically)
-- DELETE FROM auth_exchange_codes WHERE expires_at < NOW() - INTERVAL '1 hour';
