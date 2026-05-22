-- Add tester opt-in flag to members
--
-- Governs access to /maia/field-lab — the bounded experimental ecology where
-- emerging functions are offered for member observation, not member adoption.
--
-- Per spec:
--   docs/specs/RELATIONAL_NAVIGATION_ROOM.md
--   doctrine: Surface Typology / Relational Field Design / Interpretive Dialogue
--
-- Core rule:
--   Membership grants access to MAIA. Tester status grants access to
--   observation participation in surfaces still being shaped. It is opt-in,
--   reversible, and carries no special privileges beyond the experimental
--   shelf.
--
-- What this is NOT:
--   - A tier of paid membership
--   - A status badge
--   - A capability unlock that should be visible to other members
--   - A signal used in any way by MAIA's response generation
--
-- The flag is operational only. It governs visibility of /maia/field-lab and
-- nothing else. If you find yourself reading this column from inside any
-- conversation route, oracle pipeline, or interpretation surface — stop.
-- That is a different feature with different governance.

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS tester BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN members.tester IS
  'Opt-in flag for Field Lab access (experimental surfaces). Members toggle this in account settings. Operational only — not read by conversation or interpretation pipelines.';

CREATE INDEX IF NOT EXISTS idx_members_tester
  ON members (tester) WHERE tester = true;
