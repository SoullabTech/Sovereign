-- EW-F1a · INSPECTION-ONLY IS A PROPERTY OF THE PROPOSAL, NOT A PROMISE.
--
-- ⭐⭐ WHY THIS MIGRATION EXISTS, stated as the incident that caused it.
--
-- Twice on 2026-09-13 a proposal staged for inspection was accepted, and the
-- manuscript moved: v34 → v35 (b18272d5) and v35 → v36 (42ff8f5c). The second
-- has NO corresponding authorial act anywhere in the record — the founder did
-- not press the control, and the route records the acceptance without enough to
-- reconstruct its origin. Classified by the founder as:
--
--   SYSTEM ACCEPTANCE RECORD  REAL
--   AUTHORIAL RATIFICATION    UNRESOLVED
--
-- ⛔ THE FINDING IS ARCHITECTURAL, NOT BEHAVIOURAL. Every other constraint in
-- this lane is structural: the write flag, the staging script's refusal to
-- touch any database without `witness` in its name, the exactly-once guard, the
-- one-live-proposal guard. "This one is for inspection only" was the single
-- constraint held by discipline alone, and it is the one that gave way — twice.
-- A rule that exists only in a conversation is not a constraint.
--
-- ── THE TWO LAWS THIS ENCODES ──────────────────────────────────────────────
--
-- 1. THE UI HIDING THE BUTTON IS NOT THE PROTECTION. The refusal lives at the
--    boundary that writes. Here that is stronger than the store: the CHECK
--    below makes an accepted inspection_only row UNREPRESENTABLE, so even a
--    defect in application code cannot record one.
--
-- 2. INSPECTION-ONLY CANNOT BE PROMOTED IN PLACE. The trigger refuses any
--    UPDATE that changes this column. If the same editorial idea later becomes
--    executable, that is a NEW proposal in a recorded relationship to this one
--    — never the quiet re-labelling of an authority the member never granted.

ALTER TABLE manuscript_revision_proposals
  ADD COLUMN IF NOT EXISTS execution_authority text;

-- ⛔ EXISTING ROWS ARE BACKFILLED HONESTLY, NOT FLATTERINGLY. They were created
-- under a regime with no such column and two of them were accepted; recording
-- them as inspection_only would make the record claim a protection that did not
-- exist, and would contradict their own accepted_at.
UPDATE manuscript_revision_proposals
   SET execution_authority = 'member_acceptance'
 WHERE execution_authority IS NULL;

-- ⭐ THE DEFAULT IS THE SAFE ONE. A proposal that nobody deliberately marked
-- executable is not executable. Creating one that can cross into the Work is an
-- act somebody performs on purpose.
ALTER TABLE manuscript_revision_proposals
  ALTER COLUMN execution_authority SET DEFAULT 'inspection_only',
  ALTER COLUMN execution_authority SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'mrp_execution_authority_vocabulary'
  ) THEN
    ALTER TABLE manuscript_revision_proposals
      ADD CONSTRAINT mrp_execution_authority_vocabulary
      CHECK (execution_authority IN ('inspection_only', 'member_acceptance'));
  END IF;

  -- ⭐⭐ THE LOAD-BEARING ONE. An acceptance on an inspection-only proposal is
  -- not merely refused by the application — it cannot be written down.
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'mrp_inspection_only_never_accepted'
  ) THEN
    ALTER TABLE manuscript_revision_proposals
      ADD CONSTRAINT mrp_inspection_only_never_accepted
      CHECK (accepted_at IS NULL OR execution_authority = 'member_acceptance');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION mrp_execution_authority_is_immutable()
RETURNS trigger AS $$
BEGIN
  IF NEW.execution_authority IS DISTINCT FROM OLD.execution_authority THEN
    RAISE EXCEPTION
      'execution_authority is immutable (% -> %); a proposal that may cross into the Work is a new proposal, not a relabelled one',
      OLD.execution_authority, NEW.execution_authority
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS mrp_execution_authority_immutable
  ON manuscript_revision_proposals;
CREATE TRIGGER mrp_execution_authority_immutable
  BEFORE UPDATE ON manuscript_revision_proposals
  FOR EACH ROW EXECUTE FUNCTION mrp_execution_authority_is_immutable();
