-- WRITERS-STUDIO-WORK-MATURITY-LAW-01
-- The writer declares what kind of manuscript state this Work is in.
-- Text extent is observed separately and never promoted into this declaration.

ALTER TABLE living_works
  ADD COLUMN IF NOT EXISTS manuscript_state TEXT;

ALTER TABLE living_works
  DROP CONSTRAINT IF EXISTS living_works_manuscript_state_known;

ALTER TABLE living_works
  ADD CONSTRAINT living_works_manuscript_state_known
  CHECK (
    manuscript_state IS NULL
    OR manuscript_state IN ('pre-manuscript','partial-manuscript','existing-manuscript')
  );

COMMENT ON COLUMN living_works.manuscript_state IS
  'Writer-declared manuscript maturity: pre-manuscript, partial-manuscript, or existing-manuscript. Never inferred from word count or system observation.';
