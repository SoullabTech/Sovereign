-- HOUSE-DECISIONS-01 — one decision store, explicit personal/practice/team membranes.
BEGIN;

ALTER TABLE studio_decisions
  ADD COLUMN IF NOT EXISTS decision_scope text,
  ADD COLUMN IF NOT EXISTS personal_member_id uuid REFERENCES members(id) ON DELETE CASCADE;

UPDATE studio_decisions
SET decision_scope = CASE
  WHEN source_channel_id IS NOT NULL THEN 'team'
  ELSE 'practice'
END
WHERE decision_scope IS NULL;

ALTER TABLE studio_decisions
  ALTER COLUMN decision_scope SET DEFAULT 'practice',
  ALTER COLUMN decision_scope SET NOT NULL;

ALTER TABLE studio_decisions
  DROP CONSTRAINT IF EXISTS studio_decisions_scope_check;

ALTER TABLE studio_decisions
  ADD CONSTRAINT studio_decisions_scope_check CHECK (
    (decision_scope = 'personal'
      AND personal_member_id IS NOT NULL
      AND practitioner_id IS NULL
      AND client_id IS NULL
      AND team_id IS NULL
      AND source_channel_id IS NULL
      AND source_message_id IS NULL)
    OR
    (decision_scope = 'practice'
      AND personal_member_id IS NULL
      AND practitioner_id IS NOT NULL
      AND source_channel_id IS NULL)
    OR
    (decision_scope = 'team'
      AND personal_member_id IS NULL
      AND source_channel_id IS NOT NULL)
  );

CREATE INDEX IF NOT EXISTS idx_studio_decisions_personal_member
  ON studio_decisions(personal_member_id, status, created_at DESC)
  WHERE decision_scope = 'personal';

COMMENT ON COLUMN studio_decisions.decision_scope IS
  'Ownership membrane: personal member reflection, professional practice, or channel-scoped team capture.';
COMMENT ON COLUMN studio_decisions.personal_member_id IS
  'Owner only for personal decisions. NULL for practice/team. Does not imply practitioner identity.';

ALTER TABLE decision_experiences
  ADD COLUMN IF NOT EXISTS member_id uuid REFERENCES members(id) ON DELETE CASCADE;
ALTER TABLE decision_experiences
  ALTER COLUMN practitioner_id DROP NOT NULL;
ALTER TABLE decision_experiences
  DROP CONSTRAINT IF EXISTS decision_experiences_owner_check;
ALTER TABLE decision_experiences
  ADD CONSTRAINT decision_experiences_owner_check CHECK (
    (member_id IS NOT NULL AND practitioner_id IS NULL)
    OR (member_id IS NULL AND practitioner_id IS NOT NULL)
  );
CREATE INDEX IF NOT EXISTS idx_decision_experiences_member
  ON decision_experiences(member_id, occurred_at DESC)
  WHERE member_id IS NOT NULL;

COMMIT;
