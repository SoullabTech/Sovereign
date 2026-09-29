-- WRITERS-STUDIO-WORK-FIRST-DEVELOP-01
-- Allow the existing durable Ask spine to belong to a Living Work before a
-- manuscript exists. No duplicate conversation table is introduced.

BEGIN;

ALTER TABLE ask_threads
  ADD COLUMN IF NOT EXISTS living_work_id UUID REFERENCES living_works(id) ON DELETE CASCADE;

ALTER TABLE ask_threads
  ALTER COLUMN manuscript_id DROP NOT NULL;

ALTER TABLE ask_threads
  DROP CONSTRAINT IF EXISTS ask_threads_one_container;

ALTER TABLE ask_threads
  ADD CONSTRAINT ask_threads_one_container
  CHECK (num_nonnulls(manuscript_id, living_work_id) = 1) NOT VALID;

-- A pre-manuscript Living Work thread is only the ordinary Work conversation.
-- It cannot masquerade as a structure/developmental Ask or editorial chain.
ALTER TABLE ask_threads
  DROP CONSTRAINT IF EXISTS ask_threads_living_work_subject_shape;

ALTER TABLE ask_threads
  ADD CONSTRAINT ask_threads_living_work_subject_shape
  CHECK (
    living_work_id IS NULL
    OR (
      proposal_chain_id IS NULL
      AND reading_identity IS NULL
      AND anchor IS NOT NULL
      AND anchor = '{"on":"work"}'::jsonb
    )
  ) NOT VALID;

CREATE INDEX IF NOT EXISTS idx_ask_threads_living_work
  ON ask_threads(living_work_id, opened_at DESC)
  WHERE living_work_id IS NOT NULL;

CREATE OR REPLACE FUNCTION ask_threads_freeze()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.manuscript_id IS DISTINCT FROM OLD.manuscript_id
     OR NEW.living_work_id IS DISTINCT FROM OLD.living_work_id
     OR NEW.member_id IS DISTINCT FROM OLD.member_id
     OR NEW.anchor IS DISTINCT FROM OLD.anchor
     OR NEW.reading_identity IS DISTINCT FROM OLD.reading_identity
     OR NEW.canonical_at_open IS DISTINCT FROM OLD.canonical_at_open
     OR NEW.initiated_by IS DISTINCT FROM OLD.initiated_by
     OR NEW.proposal_chain_id IS DISTINCT FROM OLD.proposal_chain_id THEN
    RAISE EXCEPTION
      'ask thread % is immutable in container, ownership, anchor, reading reference, canonical baseline and editorial parent',
      OLD.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE ask_threads VALIDATE CONSTRAINT ask_threads_one_container;
ALTER TABLE ask_threads VALIDATE CONSTRAINT ask_threads_living_work_subject_shape;

COMMENT ON COLUMN ask_threads.living_work_id IS
  'Living Work subject for ordinary Work conversation before a manuscript exists. Mutually exclusive with manuscript_id.';
COMMENT ON CONSTRAINT ask_threads_one_container ON ask_threads IS
  'Exactly one conversation container: manuscript or Living Work.';
COMMENT ON CONSTRAINT ask_threads_living_work_subject_shape ON ask_threads IS
  'A Living Work thread is only the ordinary work anchor and carries no reading or editorial proposal chain.';

COMMIT;
