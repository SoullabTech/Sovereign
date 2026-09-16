-- Hallmark Book Production 01 — physical-production provenance.
--
-- `source_hash` continues to identify the manuscript words + stored structure.
-- These fields identify the authority/revision those words came from and the
-- versioned physical-composition rules that turned them into an artifact.
-- Existing renders remain valid historical rows; NULL means legacy/unversioned.

ALTER TABLE manuscript_renders
  ADD COLUMN IF NOT EXISTS production_profile text,
  ADD COLUMN IF NOT EXISTS source_authority text,
  ADD COLUMN IF NOT EXISTS source_revision bigint;

ALTER TABLE manuscript_renders
  DROP CONSTRAINT IF EXISTS manuscript_renders_source_authority_check;

ALTER TABLE manuscript_renders
  ADD CONSTRAINT manuscript_renders_source_authority_check
  CHECK (source_authority IS NULL OR source_authority IN ('working_draft', 'source'));

COMMENT ON COLUMN manuscript_renders.production_profile IS
  'Versioned physical composition profile used to make this artifact; NULL for legacy renders.';
COMMENT ON COLUMN manuscript_renders.source_authority IS
  'Whether render content came from current section-addressable working draft or immutable imported source.';
COMMENT ON COLUMN manuscript_renders.source_revision IS
  'Working-draft revision rendered, when source_authority=working_draft; NULL for source/legacy renders.';
