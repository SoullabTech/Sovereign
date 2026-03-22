-- Identity Audit Results
-- Stores structured audit outputs from the Identity Audit product.
-- member_id is nullable — anonymous audits (marketing entry point) are supported.
-- intake and result stored as JSONB for full queryability.

CREATE TABLE IF NOT EXISTS audit_results (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id        UUID REFERENCES members(id) ON DELETE SET NULL,
  intake           JSONB    NOT NULL,
  result           JSONB    NOT NULL,
  summary_signal   TEXT,
  element_dominant TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_audit_results_member_id
  ON audit_results (member_id)
  WHERE member_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_results_element_dominant
  ON audit_results (element_dominant)
  WHERE element_dominant IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_results_created_at
  ON audit_results (created_at DESC);

-- Register in schema_migrations
INSERT INTO schema_migrations (filename, applied_at)
VALUES ('20260322000004_identity_audit_results.sql', NOW())
ON CONFLICT (filename) DO NOTHING;
