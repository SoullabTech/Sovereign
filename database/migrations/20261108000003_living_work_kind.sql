-- WS-DEVELOP-STUDIO — the kind of Work, DECLARED BY THE WRITER (never inferred).
--
-- Founder (2026-11-09): most writers will be fiction and nonfiction, and the primary member is a helper writing nonfiction out of their own practice.
-- The Develop studio's vocabulary (what chapters relate by, what starters ask) and one gentle, once-only offer about case stories follow the DECLARED kind.
-- NULL means undeclared, and undeclared gets neutral wording. ⛔ Nothing in the system ever writes this column except the writer's own gesture.
--
-- ⛔⛔ CANDIDATE ON A NON-CANONICAL BRANCH. Merging this file is latent schema-deploy authorization (2026-09-07 finding). Additive, nullable, no backfill.

BEGIN;
SET LOCAL lock_timeout = '5s';

ALTER TABLE living_works ADD COLUMN IF NOT EXISTS kind TEXT;
ALTER TABLE living_works DROP CONSTRAINT IF EXISTS living_works_kind_check;
ALTER TABLE living_works ADD CONSTRAINT living_works_kind_check
  CHECK (kind IS NULL OR kind IN ('fiction', 'nonfiction', 'practitioner'));

COMMENT ON COLUMN living_works.kind IS
'What the writer says this Work is: fiction, nonfiction, or practitioner (a helper''s book out of their own practice). NULL = undeclared. Written only by the writer''s own gesture; never inferred from the text.';

COMMIT;
DO $$ BEGIN RAISE NOTICE 'Migration 20261108000003: living_works.kind (declared, nullable)'; END $$;
