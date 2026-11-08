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
--   4. ask_turn_reads — which saved sections' text was supplied to MAIA on which
--      turn, with a digest of the bytes supplied, so a later turn can say "that
--      passage has changed since I quoted it". Conversation metadata owned by the
--      member; deliberately NOT on the receipt, which refuses digests.

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

-- ── 3 · the authority a standing crossing was made under ────────────────────
ALTER TABLE context_disclosure_receipts
  ADD COLUMN IF NOT EXISTS scope_event_id UUID REFERENCES work_reading_scope_events(id);

ALTER TABLE context_disclosure_receipts
  DROP CONSTRAINT IF EXISTS context_disclosure_receipts_standing_has_scope;
ALTER TABLE context_disclosure_receipts
  ADD CONSTRAINT context_disclosure_receipts_standing_has_scope
  CHECK ((participation_basis = 'standing_authorization') = (scope_event_id IS NOT NULL));

CREATE OR REPLACE FUNCTION context_disclosure_receipt_scope_immutable() RETURNS trigger AS $$
BEGIN
  IF NEW.scope_event_id IS DISTINCT FROM OLD.scope_event_id THEN
    RAISE EXCEPTION '[DISCLOSURE] scope_event_id is immutable at mint — UPDATE refused';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS context_disclosure_receipt_scope_immutable_trigger ON context_disclosure_receipts;
CREATE TRIGGER context_disclosure_receipt_scope_immutable_trigger
  BEFORE UPDATE ON context_disclosure_receipts
  FOR EACH ROW EXECUTE FUNCTION context_disclosure_receipt_scope_immutable();

-- ── 4 · what was supplied on which turn ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS ask_turn_reads (
  thread_id    UUID NOT NULL REFERENCES ask_threads(id) ON DELETE CASCADE,
  turn_index   INTEGER NOT NULL CHECK (turn_index >= 0),
  section_id   UUID NOT NULL,
  -- sha256 of the exact bytes supplied. A moved-text check, never a locator.
  body_digest  TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (thread_id, turn_index, section_id)
);

CREATE OR REPLACE FUNCTION ask_turn_reads_no_update() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION '[ASK] ask_turn_reads is append-only — UPDATE refused';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ask_turn_reads_no_update_trigger ON ask_turn_reads;
CREATE TRIGGER ask_turn_reads_no_update_trigger
  BEFORE UPDATE ON ask_turn_reads
  FOR EACH ROW EXECUTE FUNCTION ask_turn_reads_no_update();

COMMENT ON TABLE work_reading_scope_events IS
'Append-only member grant/revoke of MAIA''s standing permission to read the saved text of a Work inside the Work conversation. State is derived from the latest event for (member, Work). Nothing inferred, no default grant. Distinct from, and does not mutate, the single-use S3 authorization.';

COMMENT ON COLUMN context_disclosure_receipts.scope_event_id IS
'The standing reading-scope grant under which this crossing was made. Present if and only if participation_basis = standing_authorization. Immutable.';

COMMENT ON TABLE ask_turn_reads IS
'Which saved sections were supplied to MAIA on which Work-conversation turn, with a digest of the supplied bytes. Used only to tell the writer when a passage MAIA quoted earlier has since changed. Not a receipt and not a copy of the text.';

COMMIT;

DO $$
BEGIN
  RAISE NOTICE 'Migration 20261108000001: Work reading scope events, standing receipt vocabulary, ask_turn_reads';
END $$;
