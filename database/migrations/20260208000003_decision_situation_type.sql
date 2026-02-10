-- Decision Council: Situation Type Field Orientation
-- Adds field orientation to decisions so the council can tune
-- its framings to the practitioner's field of responsibility.

ALTER TABLE studio_decisions
  ADD COLUMN IF NOT EXISTS situation_type TEXT DEFAULT 'leadership';

COMMENT ON COLUMN studio_decisions.situation_type IS
  'Field orientation: individual, relational, group, leadership, self';
