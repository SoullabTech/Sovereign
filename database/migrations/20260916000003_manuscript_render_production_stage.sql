-- Hallmark Book Production 02 — distinguish inspection proofs from final artifacts.
-- Existing historical render rows remain valid; NULL means legacy/unclassified.

ALTER TABLE manuscript_renders
  ADD COLUMN IF NOT EXISTS production_stage text;

ALTER TABLE manuscript_renders
  DROP CONSTRAINT IF EXISTS manuscript_renders_production_stage_check;

ALTER TABLE manuscript_renders
  ADD CONSTRAINT manuscript_renders_production_stage_check
  CHECK (production_stage IS NULL OR production_stage IN ('proof', 'final'));

COMMENT ON COLUMN manuscript_renders.production_stage IS
  'Whether this artifact was an inspection proof or passed the final-production preflight.';

-- ROLLBACK:
-- ALTER TABLE manuscript_renders DROP CONSTRAINT IF EXISTS manuscript_renders_production_stage_check;
-- ALTER TABLE manuscript_renders DROP COLUMN IF EXISTS production_stage;
