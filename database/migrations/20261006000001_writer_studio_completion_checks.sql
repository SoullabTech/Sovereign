-- WRITERS-STUDIO-EA-COMPLETION-01
-- Durable, append-only writer adjudication for Ready the Work.
-- A missing row means NOT RUN. No system inference may silently create green.

BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS writer_studio_completion_checks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     UUID NOT NULL,
  manuscript_id UUID NOT NULL,
  dimension     TEXT NOT NULL CHECK (dimension IN (
    'editorial-integrity','continuity','recovery','source-provenance',
    'permissions-rights','page-proof','front-back-matter','publication-target'
  )),
  standing      TEXT NOT NULL CHECK (standing IN ('clear','open','blocked')),
  note          TEXT CHECK (note IS NULL OR length(note) <= 2000),
  provenance    TEXT NOT NULL DEFAULT 'writer' CHECK (provenance = 'writer'),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT wscc_manuscript_member_fk
    FOREIGN KEY (manuscript_id, member_id)
    REFERENCES member_manuscripts(id, member_id)
    ON UPDATE RESTRICT ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS wscc_current_idx
  ON writer_studio_completion_checks(member_id, manuscript_id, dimension, created_at DESC);

CREATE OR REPLACE FUNCTION writer_studio_completion_checks_append_only()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION
    'writer studio completion check % is append-only: a new adjudication must be inserted', OLD.id;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS writer_studio_completion_checks_no_update
  ON writer_studio_completion_checks;
CREATE TRIGGER writer_studio_completion_checks_no_update
  BEFORE UPDATE ON writer_studio_completion_checks
  FOR EACH ROW EXECUTE FUNCTION writer_studio_completion_checks_append_only();

COMMENT ON TABLE writer_studio_completion_checks IS
  'Append-only writer adjudication for Ready the Work. Absence remains NOT RUN; clear/open/blocked are explicit writer acts and never inferred from tool availability.';

COMMIT;
