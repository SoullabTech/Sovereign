-- MEMBER-ACK-01 · TEEN-CLOSED-01 (founder ruling 2026-10-01)
--
-- A member's own recorded statement, one row per statement. First kind:
-- 'age_18_plus' — "I'm 18 or older", required at every registration that
-- creates a member. The row is written in the SAME statement that creates the
-- member (CTE), so a member never exists without the statement it was admitted on.
--
-- Additive: new table only. No existing table, column or row is touched.
-- Holds no content beyond the fact, its copy version and the path that recorded it.

BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS member_acknowledgments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  kind            TEXT NOT NULL CHECK (kind IN ('age_18_plus')),
  copy_version    TEXT NOT NULL CHECK (length(copy_version) BETWEEN 1 AND 64),
  source          TEXT NOT NULL CHECK (length(source) BETWEEN 1 AND 64),
  acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (member_id, kind, copy_version)
);

COMMENT ON TABLE member_acknowledgments IS
  'A member''s own recorded statements (e.g. age_18_plus). Written atomically with member creation. Never inferred.';

COMMIT;
