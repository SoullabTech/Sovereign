-- Admin role grant/revoke audit — durable provenance for platform-authority changes.
--
-- Records WHO changed WHOSE admin_role, from what to what, and when. This is
-- distinct from admin_access_log (which records access *attempts*): this table
-- records changes to *who holds authority*. A change to platform authority must
-- leave a queryable trail — the constitutional provenance requirement for the
-- Studio admin-management surface.

CREATE TABLE IF NOT EXISTS admin_role_grants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID REFERENCES members(id) ON DELETE SET NULL,   -- who granted/revoked (NULL = via shared password)
  actor_via   VARCHAR(20) NOT NULL CHECK (actor_via IN ('member', 'password')),
  target_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,  -- whose admin_role changed
  old_role    VARCHAR(50),                                       -- role before (NULL = was not an admin)
  new_role    VARCHAR(50),                                       -- role after  (NULL = revoked)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_role_grants_target     ON admin_role_grants (target_id);
CREATE INDEX IF NOT EXISTS idx_admin_role_grants_actor      ON admin_role_grants (actor_id);
CREATE INDEX IF NOT EXISTS idx_admin_role_grants_created_at ON admin_role_grants (created_at DESC);
