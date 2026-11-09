-- WS-WORK-CONTINUITY · Part B — the standing, revocable Work reading scope.
--
-- Founder ruling 2026-11-08 ("rule yes"): a member-declared, revocable,
-- Work-level standing read scope may stand in for per-Ask single-use
-- authorization for reads INSIDE the Work conversation, with every crossing
-- still receipted. It is a NEW additive instrument. The S3 single-use
-- authorization (ask_authorization_acts) is NOT touched.
--
-- ⛔⛔ CANDIDATE ON A NON-CANONICAL BRANCH. Merging this file is latent
-- schema-deploy authorization (2026-09-07 finding). It does not merge ahead of
-- its witnesses, and applying it is a named founder act.
--
-- Four things, and no more:
--   1. work_reading_scope_events  — append-only grant/revoke events. State is
--      DERIVED from the latest event, never stored as a status column.
--   2. receipt vocabulary widened by exactly one value on each of three axes
--      (boundary, participation_basis, gesture), stated as the UNION of every
--      constituted value (a re-statement that omits one DROPS it).
--   3. context_disclosure_receipts.scope_event_id — the authority a standing
--      crossing was made under; present iff the basis is standing_authorization.
--   4. (no table) which saved sections were supplied on a turn is recorded in that answer's own row
--      (ask_turns.answer_provenance.suppliedSections), saved with the answer or not at all, immutable like it.

BEGIN;
SET LOCAL lock_timeout = '5s';

-- ── 1 · scope events ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS work_reading_scope_events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id      UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  living_work_id UUID NOT NULL REFERENCES living_works(id) ON DELETE CASCADE,
  event          TEXT NOT NULL CHECK (event IN ('grant', 'revoke')),
  -- The member's choice. NULL on revoke. No default, no inference.
  level          TEXT CHECK (level IN ('chapter', 'work')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT work_reading_scope_level_matches_event
    CHECK ((event = 'grant') = (level IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS work_reading_scope_events_latest_idx
  ON work_reading_scope_events (member_id, living_work_id, created_at DESC, id DESC);

CREATE OR REPLACE FUNCTION work_reading_scope_events_no_update() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION '[SCOPE] work_reading_scope_events is append-only — UPDATE refused';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS work_reading_scope_events_no_update_trigger ON work_reading_scope_events;
CREATE TRIGGER work_reading_scope_events_no_update_trigger
  BEFORE UPDATE ON work_reading_scope_events
  FOR EACH ROW EXECUTE FUNCTION work_reading_scope_events_no_update();

-- A direct DELETE or TRUNCATE would resurrect an earlier grant by erasing the
-- revocation that followed it. Deletion is lawful only as the cascade of the
-- Work itself (the parent is already gone when a child trigger fires).
CREATE OR REPLACE FUNCTION work_reading_scope_events_guard_delete() RETURNS trigger AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM living_works WHERE id = OLD.living_work_id) THEN
    RAISE EXCEPTION '[SCOPE] work_reading_scope_events rows are not deleted while their Work exists';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS work_reading_scope_events_guard_delete_trigger ON work_reading_scope_events;
CREATE TRIGGER work_reading_scope_events_guard_delete_trigger
  BEFORE DELETE ON work_reading_scope_events
  FOR EACH ROW EXECUTE FUNCTION work_reading_scope_events_guard_delete();

CREATE OR REPLACE FUNCTION work_reading_scope_events_no_truncate() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION '[SCOPE] work_reading_scope_events cannot be truncated';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS work_reading_scope_events_no_truncate_trigger ON work_reading_scope_events;
CREATE TRIGGER work_reading_scope_events_no_truncate_trigger
  BEFORE TRUNCATE ON work_reading_scope_events
  FOR EACH STATEMENT EXECUTE FUNCTION work_reading_scope_events_no_truncate();

-- ── 2 · receipt vocabulary (UNION of every constituted value + one each) ────
ALTER TABLE context_disclosure_receipts
  DROP CONSTRAINT IF EXISTS context_disclosure_receipts_boundary_check;
ALTER TABLE context_disclosure_receipts
  ADD CONSTRAINT context_disclosure_receipts_boundary_check
  CHECK (boundary IN (
    'writers_studio.focus->maia_cognition',
    'writers_studio.developmental_ask->maia_cognition',
    'writers_studio.review_discuss->maia_cognition',
    'writers_studio.editorial_turn->maia_cognition',
    'writers_studio.work_conversation->maia_cognition'
  ));

ALTER TABLE context_disclosure_receipts
  DROP CONSTRAINT IF EXISTS context_disclosure_receipts_participation_basis_check;
ALTER TABLE context_disclosure_receipts
  ADD CONSTRAINT context_disclosure_receipts_participation_basis_check
  CHECK (participation_basis IN ('member_invoked', 'standing_authorization'));

ALTER TABLE context_disclosure_receipts
  DROP CONSTRAINT IF EXISTS context_disclosure_receipts_gesture_check;
ALTER TABLE context_disclosure_receipts
  ADD CONSTRAINT context_disclosure_receipts_gesture_check
  CHECK (gesture IN (
    'ask_maia',
    'work_with_this',
    'widen_focus',
    'authorize_sections',
    'discuss_finding',
    'standing_read_scope'
  ));

-- ── 3 · the authority a standing crossing was made under ───────────────────
-- ⛔ DELIBERATELY NOT A FOREIGN KEY (independent review, 2026-11-08). Receipts are never pruned (their DELETE is refused without a custody manifest)
-- while scope events cascade away with the Work; a FK would make a Work with any standing-read receipt IMPOSSIBLE TO REMOVE (23503). Receipts already
-- reference Works by plain text (`source_ref`), never by FK, for exactly this reason. So `scope_event_id` is a plain UUID, checked at INSERT by a trigger
-- (the event must exist and belong to the same member) and immutable thereafter. After a Work is removed it dangles by design: the content-free receipt
-- outlives the permission record it was made under.
ALTER TABLE context_disclosure_receipts
  ADD COLUMN IF NOT EXISTS scope_event_id UUID;

ALTER TABLE context_disclosure_receipts
  DROP CONSTRAINT IF EXISTS context_disclosure_receipts_standing_has_scope;
ALTER TABLE context_disclosure_receipts
  ADD CONSTRAINT context_disclosure_receipts_standing_has_scope
  CHECK ((participation_basis = 'standing_authorization') = (scope_event_id IS NOT NULL));

CREATE OR REPLACE FUNCTION context_disclosure_receipt_scope_valid() RETURNS trigger AS $$
BEGIN
  IF NEW.scope_event_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM work_reading_scope_events e
     WHERE e.id = NEW.scope_event_id AND e.event = 'grant' AND e.member_id::text = NEW.member_id) THEN
    RAISE EXCEPTION '[DISCLOSURE] scope_event_id must name a grant by the same member';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS context_disclosure_receipt_scope_valid_trigger ON context_disclosure_receipts;
CREATE TRIGGER context_disclosure_receipt_scope_valid_trigger BEFORE INSERT ON context_disclosure_receipts
  FOR EACH ROW EXECUTE FUNCTION context_disclosure_receipt_scope_valid();

CREATE OR REPLACE FUNCTION context_disclosure_receipt_scope_immutable() RETURNS trigger AS $$
BEGIN
  IF NEW.scope_event_id IS DISTINCT FROM OLD.scope_event_id THEN
    RAISE EXCEPTION '[DISCLOSURE] scope_event_id is immutable at mint — UPDATE refused';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS context_disclosure_receipt_scope_immutable_trigger ON context_disclosure_receipts;
CREATE TRIGGER context_disclosure_receipt_scope_immutable_trigger BEFORE UPDATE ON context_disclosure_receipts
  FOR EACH ROW EXECUTE FUNCTION context_disclosure_receipt_scope_immutable();


COMMENT ON TABLE work_reading_scope_events IS
'Append-only member grant/revoke of MAIA''s standing permission to read the saved text of a Work inside the Work conversation. State is derived from the latest event for (member, Work). Nothing inferred, no default grant. Distinct from, and does not mutate, the single-use S3 authorization.';

COMMENT ON COLUMN context_disclosure_receipts.scope_event_id IS
'The standing reading-scope grant under which this crossing was made. Present if and only if participation_basis = standing_authorization. Immutable. Not a foreign key: it may dangle after the Work is removed, by design.';



COMMIT;

DO $$
BEGIN
  RAISE NOTICE 'Migration 20261108000001: Work reading scope events, standing receipt vocabulary';
END $$;
