-- ============================================
-- CIRCLES COMMONS — Phase 1
-- Adds community circles with sovereignty-preserving
-- consent, manual sharing, and revocation cascades.
--
-- Design law: "Nothing in a circle is implied.
-- Everything is invited."
-- ============================================

-- 1) Circles
CREATE TABLE IF NOT EXISTS circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  visibility TEXT NOT NULL DEFAULT 'invite_only'
    CHECK (visibility IN ('invite_only', 'open')),
  invite_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_circles_created_by ON circles(created_by);

COMMENT ON TABLE circles IS 'Community circles — member-organized groups, distinct from practitioner client_groups';
COMMENT ON COLUMN circles.visibility IS 'invite_only = requires token to join; open = anyone can join (future)';

-- 2) Circle memberships (includes consent mode — Phase 1)
CREATE TABLE IF NOT EXISTS circle_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  member_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('member', 'helper', 'facilitator')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'left', 'removed')),
  consent_mode TEXT NOT NULL DEFAULT 'manual'
    CHECK (consent_mode IN ('manual', 'not_now')),
  consented_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(circle_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_circle_memberships_circle ON circle_memberships(circle_id, status);
CREATE INDEX IF NOT EXISTS idx_circle_memberships_member ON circle_memberships(member_id, status);

COMMENT ON TABLE circle_memberships IS 'Many-to-many membership linking members to circles with roles and consent';
COMMENT ON COLUMN circle_memberships.role IS 'member=participant, helper=wider lens (consented), facilitator=leads sessions';
COMMENT ON COLUMN circle_memberships.consent_mode IS 'manual=member shares explicitly, not_now=opted out of sharing';

-- 3) Invite tokens (regenerable — old tokens auto-revoked)
CREATE TABLE IF NOT EXISTS circle_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_circle_invites_circle ON circle_invites(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_invites_token ON circle_invites(token) WHERE revoked_at IS NULL;

COMMENT ON TABLE circle_invites IS 'Invite tokens for joining circles — regenerating revokes all previous tokens';

-- 4) Shared artifacts (the sovereignty seam)
CREATE TABLE IF NOT EXISTS shared_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL,
  artifact_type TEXT NOT NULL,
  artifact_ref TEXT NOT NULL,
  content_mode TEXT NOT NULL DEFAULT 'summary_only'
    CHECK (content_mode IN ('summary_only', 'full_text')),
  shared_title TEXT,
  shared_summary TEXT,
  shared_text TEXT,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shared_artifacts_circle ON shared_artifacts(circle_id, created_at DESC) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_shared_artifacts_shared_by ON shared_artifacts(shared_by);

COMMENT ON TABLE shared_artifacts IS 'Items explicitly shared into a circle feed — wrapper only, not raw private objects';
COMMENT ON COLUMN shared_artifacts.content_mode IS 'summary_only=title/summary only, full_text=complete content shared';
COMMENT ON COLUMN shared_artifacts.revoked_at IS 'Non-null = removed from feed. Original source item untouched.';

-- ============================================
-- updated_at trigger (shared across all tables)
-- ============================================
CREATE OR REPLACE FUNCTION circles_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS circles_updated_at ON circles;
CREATE TRIGGER circles_updated_at
  BEFORE UPDATE ON circles
  FOR EACH ROW EXECUTE FUNCTION circles_set_updated_at();

DROP TRIGGER IF EXISTS circle_memberships_updated_at ON circle_memberships;
CREATE TRIGGER circle_memberships_updated_at
  BEFORE UPDATE ON circle_memberships
  FOR EACH ROW EXECUTE FUNCTION circles_set_updated_at();

DROP TRIGGER IF EXISTS circle_invites_updated_at ON circle_invites;
CREATE TRIGGER circle_invites_updated_at
  BEFORE UPDATE ON circle_invites
  FOR EACH ROW EXECUTE FUNCTION circles_set_updated_at();

DROP TRIGGER IF EXISTS shared_artifacts_updated_at ON shared_artifacts;
CREATE TRIGGER shared_artifacts_updated_at
  BEFORE UPDATE ON shared_artifacts
  FOR EACH ROW EXECUTE FUNCTION circles_set_updated_at();
