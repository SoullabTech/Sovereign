-- ASTRO-R4H source-only proposed migration. NOT APPLIED to a real member DB.
-- Historical theme signals stay UNKNOWN and unavailable to ordinary MAIA
-- prompts until an independently governed, evidence-based lineage review.
BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE member_theme_signals
  ADD COLUMN IF NOT EXISTS origin_scope TEXT NOT NULL DEFAULT 'unknown'
    CHECK (origin_scope IN ('ordinary', 'conversation_only', 'unknown'));
ALTER TABLE member_theme_signals
  ADD COLUMN IF NOT EXISTS source_exchange_id UUID;
CREATE INDEX IF NOT EXISTS idx_r4h_theme_member_origin_scope
  ON member_theme_signals (member_id, origin_scope, detected_at DESC);
COMMENT ON COLUMN member_theme_signals.origin_scope IS
 'R4H forward provenance: unknown historical signal is not proof of ordinary recall permission.';
COMMIT;
