-- Feedback Inbox lifecycle — expand platform_feedback from a flat submission into a workflow.
--
-- Status grows from the original 4 values to a 7-stage lifecycle:
--   New → Triaged → Planned → Active → Fixed → Verified → Closed
-- "reviewed" stops being a *status* and becomes an orthogonal flag (reviewed_at / reviewed_by),
-- so a report at any stage can be marked reviewed. Adds assigned_owner + linked_pr for triage.
--
-- Existing rows are remapped BEFORE the CHECK is swapped so none is left violating it:
--   reviewed  → triaged + reviewed flag    addressed → fixed    archived → closed
--
-- Reversible in principle (drop the new columns, restore the old 4-value CHECK), but the
-- old→new status remap is one-way once applied.

BEGIN;

-- New lifecycle columns (additive).
ALTER TABLE platform_feedback
  ADD COLUMN IF NOT EXISTS reviewed_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by    TEXT,
  ADD COLUMN IF NOT EXISTS assigned_owner TEXT,
  ADD COLUMN IF NOT EXISTS linked_pr      TEXT;

-- Drop the old constraint, remap legacy rows, then install the 7-stage constraint.
ALTER TABLE platform_feedback DROP CONSTRAINT IF EXISTS platform_feedback_status_check;

UPDATE platform_feedback
   SET status      = 'triaged',
       reviewed_at = COALESCE(reviewed_at, updated_at, NOW()),
       reviewed_by = COALESCE(reviewed_by, 'migration')
 WHERE status = 'reviewed';
UPDATE platform_feedback SET status = 'fixed'  WHERE status = 'addressed';
UPDATE platform_feedback SET status = 'closed' WHERE status = 'archived';

ALTER TABLE platform_feedback
  ADD CONSTRAINT platform_feedback_status_check
  CHECK (status IN ('new','triaged','planned','active','fixed','verified','closed'));

CREATE INDEX IF NOT EXISTS idx_platform_feedback_reviewed_at
  ON platform_feedback(reviewed_at) WHERE reviewed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_platform_feedback_assigned_owner
  ON platform_feedback(assigned_owner) WHERE assigned_owner IS NOT NULL;

COMMIT;

DO $$
BEGIN
  RAISE NOTICE 'Migration 20260611000002: platform_feedback lifecycle (7-stage status + reviewed flag + owner/PR) applied';
END $$;
