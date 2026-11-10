-- WS-DECISION-CONTINUITY — the writer's settled decisions, one member-visible, revocable record.
--
-- Founder ruling 2026-11-08: a settled decision binds MAIA to KNOW AND SAY that the writer settled it and not re-offer it
-- unprompted; never to refuse to discuss it, never to treat it as a fact about the text. One record of the writer's own acts,
-- shared by the Work conversation, the passage turn and Develop.
--
-- ⛔⛔ CANDIDATE ON A NON-CANONICAL BRANCH. Merging this file is latent schema-deploy authorization (2026-09-07 finding);
-- applying it is a named founder act.
--
-- Append-only events. State is DERIVED (a settle not later withdrawn). A withdrawn id is never revived; re-settling is a NEW event.
-- `said_in` holds the writer's OWN words — never MAIA's paraphrase and never an inference. Nothing here is ever created by the system.

BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS writer_decision_events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id      UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  living_work_id UUID NOT NULL REFERENCES living_works(id) ON DELETE CASCADE,
  event          TEXT NOT NULL CHECK (event IN ('settle', 'withdraw')),
  -- settle only
  room           TEXT CHECK (room IN ('work_conversation', 'passage_desk', 'develop')),
  subject_kind   TEXT CHECK (subject_kind IN ('note', 'observation', 'wording', 'proposal')),
  subject_ref    TEXT,
  said_in        TEXT CHECK (said_in IS NULL OR (length(said_in) BETWEEN 1 AND 1000)),
  -- the saved version a wording decision was made against; NULL for decisions not bound to wording
  version_ref    TEXT,
  -- withdraw only
  target_id      UUID REFERENCES writer_decision_events(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT writer_decision_settle_shape
    CHECK (event <> 'settle' OR (room IS NOT NULL AND subject_kind IS NOT NULL AND said_in IS NOT NULL AND target_id IS NULL)),
  CONSTRAINT writer_decision_withdraw_shape
    CHECK (event <> 'withdraw' OR (target_id IS NOT NULL AND room IS NULL AND subject_kind IS NULL AND subject_ref IS NULL
                                   AND said_in IS NULL AND version_ref IS NULL))
);

CREATE INDEX IF NOT EXISTS writer_decision_events_work_idx
  ON writer_decision_events (member_id, living_work_id, created_at, id);

CREATE OR REPLACE FUNCTION writer_decision_events_no_update() RETURNS trigger AS $$
BEGIN RAISE EXCEPTION '[DECISION] writer_decision_events is append-only — UPDATE refused'; END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS writer_decision_events_no_update_trigger ON writer_decision_events;
CREATE TRIGGER writer_decision_events_no_update_trigger BEFORE UPDATE ON writer_decision_events
  FOR EACH ROW EXECUTE FUNCTION writer_decision_events_no_update();

-- A withdraw must target a settle of the SAME member and Work (isolation enforced by the database, not only the application).
CREATE OR REPLACE FUNCTION writer_decision_events_withdraw_scope() RETURNS trigger AS $$
BEGIN
  IF NEW.event = 'withdraw' AND NOT EXISTS (
    SELECT 1 FROM writer_decision_events t
     WHERE t.id = NEW.target_id AND t.event = 'settle'
       AND t.member_id = NEW.member_id AND t.living_work_id = NEW.living_work_id) THEN
    RAISE EXCEPTION '[DECISION] a withdraw must target a settle of the same member and Work';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS writer_decision_events_withdraw_scope_trigger ON writer_decision_events;
CREATE TRIGGER writer_decision_events_withdraw_scope_trigger BEFORE INSERT ON writer_decision_events
  FOR EACH ROW EXECUTE FUNCTION writer_decision_events_withdraw_scope();

-- Deleting events directly would revive a withdrawn decision; lawful only as the cascade of the Work itself.
CREATE OR REPLACE FUNCTION writer_decision_events_guard_delete() RETURNS trigger AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM living_works WHERE id = OLD.living_work_id) THEN
    RAISE EXCEPTION '[DECISION] writer_decision_events rows are not deleted while their Work exists';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS writer_decision_events_guard_delete_trigger ON writer_decision_events;
CREATE TRIGGER writer_decision_events_guard_delete_trigger BEFORE DELETE ON writer_decision_events
  FOR EACH ROW EXECUTE FUNCTION writer_decision_events_guard_delete();

CREATE OR REPLACE FUNCTION writer_decision_events_no_truncate() RETURNS trigger AS $$
BEGIN RAISE EXCEPTION '[DECISION] writer_decision_events cannot be truncated'; END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS writer_decision_events_no_truncate_trigger ON writer_decision_events;
CREATE TRIGGER writer_decision_events_no_truncate_trigger BEFORE TRUNCATE ON writer_decision_events
  FOR EACH STATEMENT EXECUTE FUNCTION writer_decision_events_no_truncate();

COMMENT ON TABLE writer_decision_events IS
'Append-only record of what the WRITER settled about their Work, in their own words, shared across rooms. Derived state: a settle not later withdrawn. Never created by the system or inferred from silence or unchanged wording. Orients MAIA; is not a criterion for the text and not a fact about it.';

COMMIT;

DO $$ BEGIN RAISE NOTICE 'Migration 20261108000002: writer_decision_events'; END $$;
