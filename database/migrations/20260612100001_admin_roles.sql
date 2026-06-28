-- Per-user admin roles + audit log

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS admin_role VARCHAR(50)
    CHECK (admin_role IN ('founder', 'cto', 'practitioner_admin', 'operations', 'tester'));

CREATE TABLE IF NOT EXISTS admin_access_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  via         VARCHAR(20) NOT NULL CHECK (via IN ('member', 'password', 'denied')),
  member_id   UUID REFERENCES members(id) ON DELETE SET NULL,
  admin_role  VARCHAR(50),
  route       TEXT NOT NULL,
  ip          TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_access_log_created_at ON admin_access_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_access_log_member_id  ON admin_access_log (member_id);
