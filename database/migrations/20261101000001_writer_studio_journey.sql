-- WRITERS-STUDIO-SEMANTIC-FIELD-01 — TESTER JOURNEY FIELD
-- Founder ruling 2026-11-01 (design accepted as drafted; build authorized).
--
-- A returnable place where beta writers answer a small thread of experience
-- questions. Explicit writer-authored answers only: no passive session, dwell,
-- engagement, manuscript-body or behavioural telemetry (same law as
-- SMALL-BETA-01 / B3). Questions are defined in code (lib/writersStudio/journey.ts),
-- so a prompt_key is only a stable identifier, never free text.
--
-- Custody: the writer sees, revises (a new version superseding the old, the old
-- kept) and withdraws their own answers. Withdrawal is a recorded fact, never a
-- delete. Erasing the member erases their answers (ON DELETE CASCADE).
--
-- Co-Lab report-back: only by the writer's explicit per-answer act. The shared
-- copy is an ordinary team_messages row in the configured Beta Co-Lab channel;
-- this table keeps only its id and kind.

BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS writer_studio_journey_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  prompt_key TEXT NOT NULL CHECK (prompt_key ~ '^[a-z0-9][a-z0-9_]{0,63}$'),
  choice TEXT CHECK (choice IS NULL OR choice ~ '^[a-z0-9][a-z0-9_]{0,63}$'),
  answer TEXT NOT NULL CHECK (char_length(btrim(answer)) BETWEEN 1 AND 2000),
  manuscript_id UUID REFERENCES member_manuscripts(id) ON DELETE SET NULL,
  supersedes UUID REFERENCES writer_studio_journey_answers(id) ON DELETE CASCADE,
  withdrawn_at TIMESTAMPTZ,
  colab_message_id UUID REFERENCES team_messages(id) ON DELETE SET NULL,
  colab_kind TEXT CHECK (colab_kind IS NULL OR colab_kind IN ('problem', 'question', 'suggestion')),
  colab_shared_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((colab_message_id IS NULL) OR (colab_kind IS NOT NULL AND colab_shared_at IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS writer_studio_journey_answers_member_idx
  ON writer_studio_journey_answers (member_id, prompt_key, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS writer_studio_journey_answers_supersedes_once
  ON writer_studio_journey_answers (supersedes) WHERE supersedes IS NOT NULL;

-- Answers are append-only. Only the custody facts may change after insert:
-- withdrawal (once) and the Co-Lab share record (set once; cleared only by the
-- message being removed, via ON DELETE SET NULL).
CREATE OR REPLACE FUNCTION writer_studio_journey_answers_guard()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.member_id IS DISTINCT FROM OLD.member_id
     OR NEW.prompt_key IS DISTINCT FROM OLD.prompt_key
     OR NEW.choice IS DISTINCT FROM OLD.choice
     OR NEW.answer IS DISTINCT FROM OLD.answer
     OR NEW.supersedes IS DISTINCT FROM OLD.supersedes
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
     OR (NEW.manuscript_id IS DISTINCT FROM OLD.manuscript_id AND NEW.manuscript_id IS NOT NULL) THEN
    RAISE EXCEPTION 'writer_studio_journey_answers is append-only; revise by inserting a new version';
  END IF;
  IF OLD.withdrawn_at IS NOT NULL AND NEW.withdrawn_at IS DISTINCT FROM OLD.withdrawn_at THEN
    RAISE EXCEPTION 'a withdrawn journey answer stays withdrawn';
  END IF;
  IF OLD.colab_message_id IS NOT NULL AND NEW.colab_message_id IS NOT NULL
     AND NEW.colab_message_id IS DISTINCT FROM OLD.colab_message_id THEN
    RAISE EXCEPTION 'a journey answer is shared to Co-Lab at most once';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS writer_studio_journey_answers_guard ON writer_studio_journey_answers;
CREATE TRIGGER writer_studio_journey_answers_guard
  BEFORE UPDATE ON writer_studio_journey_answers
  FOR EACH ROW EXECUTE FUNCTION writer_studio_journey_answers_guard();

COMMENT ON TABLE writer_studio_journey_answers IS
  'SEMANTIC-FIELD-01 tester journey: explicit writer-authored answers only. No passive telemetry. Revisions are new rows; withdrawal is recorded, never deleted. Co-Lab share only by explicit writer act.';

COMMIT;
