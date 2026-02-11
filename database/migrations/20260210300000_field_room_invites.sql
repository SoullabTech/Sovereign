-- Field Room Invites — token-based contextual invitations
-- Separate from passkey-based `invites` table (onboarding invites).
-- Named `resource_invites` to avoid table name collision.

CREATE TABLE IF NOT EXISTS resource_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,

  created_by_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  target_type TEXT NOT NULL,            -- 'field_room' for v1
  target_id UUID NOT NULL,              -- rooms.id

  role TEXT NOT NULL DEFAULT 'witness', -- witness | participant | quiet

  expires_at TIMESTAMPTZ NOT NULL,
  max_uses INT NOT NULL DEFAULT 1,
  uses_count INT NOT NULL DEFAULT 0,

  revoked_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS resource_invites_target_idx
  ON resource_invites (target_type, target_id);

CREATE INDEX IF NOT EXISTS resource_invites_creator_idx
  ON resource_invites (created_by_member_id);

CREATE INDEX IF NOT EXISTS resource_invites_token_idx
  ON resource_invites (token);

COMMENT ON TABLE resource_invites IS 'Token-based invitations scoped to resources (field rooms, etc). Separate from passkey invites table.';
COMMENT ON COLUMN resource_invites.target_type IS 'Resource type: field_room for v1';
COMMENT ON COLUMN resource_invites.role IS 'Role granted on accept: witness | participant | quiet';
