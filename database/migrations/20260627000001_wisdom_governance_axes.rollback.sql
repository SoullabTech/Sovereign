-- Rollback for 20260627000001_wisdom_governance_axes.sql
-- Additive migration → rollback simply drops the added columns + indexes.
-- Safe: no existing code depended on these columns before increment 1.

DROP INDEX IF EXISTS idx_library_sources_scope_owner;
DROP INDEX IF EXISTS idx_library_sources_owner;

ALTER TABLE library_sources
  DROP COLUMN IF EXISTS provenance,
  DROP COLUMN IF EXISTS lifecycle_state,
  DROP COLUMN IF EXISTS usage_authority,
  DROP COLUMN IF EXISTS visibility,
  DROP COLUMN IF EXISTS owner_id,
  DROP COLUMN IF EXISTS owner_type,
  DROP COLUMN IF EXISTS scope;
