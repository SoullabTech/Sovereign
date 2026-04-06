-- =============================================================================
-- TRUST LAYER PHASE 1 — Artifact Shares (split out)
-- Run AFTER 20260406000001_session_artifacts_and_contacts.sql
-- =============================================================================

CREATE TABLE IF NOT EXISTS artifact_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id UUID NOT NULL REFERENCES session_artifacts(id) ON DELETE CASCADE,

  share_scope TEXT NOT NULL DEFAULT 'link'
    CHECK (share_scope IN ('link', 'named_recipient', 'member_and_practitioner')),

  share_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  password_hash TEXT,
  expires_at TIMESTAMPTZ,

  view_count INTEGER NOT NULL DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,

  created_by UUID NOT NULL,
  revoked_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artifact_shares_artifact
  ON artifact_shares(artifact_id) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_artifact_shares_token
  ON artifact_shares(share_token) WHERE revoked_at IS NULL;

COMMENT ON TABLE artifact_shares IS 'Controlled sharing of session artifacts via revocable tokens.';
COMMENT ON COLUMN artifact_shares.share_token IS 'Unique token for link-based access. 32 random bytes, hex-encoded.';
COMMENT ON COLUMN artifact_shares.password_hash IS 'Optional bcrypt password protection. NULL = no password required.';

-- Add share tracking to session_artifacts
ALTER TABLE session_artifacts
  ADD COLUMN IF NOT EXISTS share_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_shared_at TIMESTAMPTZ;

-- updated_at trigger for artifact_shares
DROP TRIGGER IF EXISTS artifact_shares_updated_at ON artifact_shares;
CREATE TRIGGER artifact_shares_updated_at
  BEFORE UPDATE ON artifact_shares
  FOR EACH ROW EXECUTE FUNCTION trust_layer_set_updated_at();
