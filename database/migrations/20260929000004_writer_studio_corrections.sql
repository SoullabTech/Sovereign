-- WRITERS-STUDIO-SMALL-BETA-01 / B2 — CORRECTION SUCCESSION
-- A writer may correct a specific MAIA turn without rewriting what MAIA said.
-- The historical turn remains in ask_turns; each correction is an append-only act.
-- Current working understanding is the newest correction for that exact MAIA turn.

BEGIN;

CREATE TABLE IF NOT EXISTS writer_studio_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL,
  living_work_id UUID NOT NULL REFERENCES living_works(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL,
  maia_turn_index INTEGER NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN (
    'fact',
    'intent',
    'interpretation_rejection',
    'intentional_ambiguity',
    'developmental_revision',
    'preference'
  )),
  correction_text TEXT NOT NULL CHECK (char_length(correction_text) BETWEEN 1 AND 4000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (thread_id, maia_turn_index)
    REFERENCES ask_turns(thread_id, turn_index) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS writer_studio_corrections_work_idx
  ON writer_studio_corrections (member_id, living_work_id, created_at DESC);
CREATE INDEX IF NOT EXISTS writer_studio_corrections_turn_idx
  ON writer_studio_corrections (thread_id, maia_turn_index, created_at DESC);

CREATE OR REPLACE FUNCTION writer_studio_corrections_append_only()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION
    'writer correction % is append-only: a changed correction is a new correction act', OLD.id;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS writer_studio_corrections_no_update ON writer_studio_corrections;
CREATE TRIGGER writer_studio_corrections_no_update
  BEFORE UPDATE ON writer_studio_corrections
  FOR EACH ROW EXECUTE FUNCTION writer_studio_corrections_append_only();

COMMENT ON TABLE writer_studio_corrections IS
  'SMALL-BETA-01/B2: append-only writer corrections of specific MAIA turns. The MAIA turn is never rewritten; newest correction per turn is the current working understanding.';
COMMENT ON COLUMN writer_studio_corrections.correction_text IS
  'The writer-authored understanding MAIA should carry forward for this Work. It is not manuscript prose and grants no editing authority.';

COMMIT;
