-- ============================================
-- CLIENT INVITES + PORTAL AUTH
-- One-time claim codes for client portal access
-- ============================================

-- client_invites: one-time claim codes
CREATE TABLE IF NOT EXISTS client_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unused' CHECK (status IN ('unused', 'claimed', 'revoked', 'expired')),
  expires_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_client_invites_practitioner_id ON client_invites(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_client_invites_client_id ON client_invites(client_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_client_invites_code_hash_unique ON client_invites(code_hash);
CREATE INDEX IF NOT EXISTS idx_client_invites_status ON client_invites(status);

-- Extend practitioner_clients for portal auth identity
ALTER TABLE practitioner_clients
  ADD COLUMN IF NOT EXISTS portal_email TEXT,
  ADD COLUMN IF NOT EXISTS portal_password_hash TEXT,
  ADD COLUMN IF NOT EXISTS portal_claimed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_practitioner_clients_portal_email
  ON practitioner_clients(portal_email);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE client_invites IS 'One-time invite codes for clients to claim portal access';
COMMENT ON COLUMN client_invites.code_hash IS 'SHA256 hash of invite code - never store plaintext';
COMMENT ON COLUMN client_invites.status IS 'unused=fresh, claimed=used, revoked=cancelled, expired=past expiry';
COMMENT ON COLUMN practitioner_clients.portal_email IS 'Client email for portal login (separate from contact email)';
COMMENT ON COLUMN practitioner_clients.portal_password_hash IS 'Scrypt hash of client portal password';
COMMENT ON COLUMN practitioner_clients.portal_claimed_at IS 'When client claimed their portal access';
