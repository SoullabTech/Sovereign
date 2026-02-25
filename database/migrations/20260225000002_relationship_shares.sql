-- Relationship Shares
-- Phase 2: Client-facing sharing + exports
--
-- Enables link-based or user-invite sharing of relationship check-in
-- data with configurable permission levels (summary only, selected
-- entries, full read stream, co-author).

CREATE TABLE IF NOT EXISTS relationship_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES studio_relationships(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,

  -- Share mechanism
  share_type TEXT NOT NULL CHECK (share_type IN ('link', 'user')),
  shared_with_user_id UUID REFERENCES members(id) ON DELETE SET NULL,
  token_hash TEXT,                 -- SHA256 hash of link share token

  -- Permission
  permission_level TEXT NOT NULL DEFAULT 'summary_only'
    CHECK (permission_level IN ('summary_only', 'selected_entries', 'read_stream', 'co_author')),

  -- Expiry
  expires_at TIMESTAMPTZ,

  -- Status
  active BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_relationship_shares_relationship
  ON relationship_shares(relationship_id);
CREATE INDEX IF NOT EXISTS idx_relationship_shares_token
  ON relationship_shares(token_hash) WHERE token_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_relationship_shares_active
  ON relationship_shares(relationship_id, active) WHERE active = true;

-- Auto-update updated_at
DROP TRIGGER IF EXISTS tr_relationship_shares_updated_at ON relationship_shares;
CREATE TRIGGER tr_relationship_shares_updated_at
  BEFORE UPDATE ON relationship_shares
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE relationship_shares IS
  'Share permissions for Relationship Flow — link tokens and user invites with permission levels';
