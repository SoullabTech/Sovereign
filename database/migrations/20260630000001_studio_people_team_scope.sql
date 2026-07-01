-- Studio People — Co-Lab (team) scoping
--
-- Adds team_id to studio_people so that every person record belongs to a
-- specific Co-Lab workspace rather than to the platform globally.
--
-- Constitutional invariant: a Co-Lab is a sovereign relational workspace.
-- Its clients, members, DMs, and permissions belong to that workspace.
-- A member list belongs to a Co-Lab, not the whole platform.
--
-- Migration strategy (safe, idempotent):
--   1. Add team_id column (nullable initially).
--   2. Backfill: assign all existing rows to the default workspace (the
--      earliest-created studio_team). This is correct — all practitioners
--      were implicitly operating inside that single workspace before this
--      migration.
--   3. Drop the old unique constraint (practitioner_id, lower(email)).
--   4. Add the new unique constraint (team_id, lower(email)).
--   5. Enforce NOT NULL on team_id.
-- ============================================================================

-- Step 1: Add the column
ALTER TABLE studio_people
  ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES studio_teams(id) ON DELETE CASCADE;

-- Step 2: Backfill existing rows → default workspace (earliest team by created_at, then id)
UPDATE studio_people sp
SET team_id = (
  SELECT id FROM studio_teams ORDER BY created_at ASC, id ASC LIMIT 1
)
WHERE sp.team_id IS NULL;

-- Step 3: Drop old unique constraint (name from 20260627000001_studio_people.sql)
DROP INDEX IF EXISTS uq_studio_people_practitioner_email;

-- Step 4: New constraint — one identity per human per Co-Lab
CREATE UNIQUE INDEX IF NOT EXISTS uq_studio_people_team_email
  ON studio_people (team_id, lower(email))
  WHERE email IS NOT NULL;

-- Step 5: Enforce NOT NULL now that every row is backfilled
ALTER TABLE studio_people ALTER COLUMN team_id SET NOT NULL;

-- Step 6: Index for the common query pattern (list all people in a Co-Lab)
CREATE INDEX IF NOT EXISTS idx_studio_people_team ON studio_people(team_id);

-- Retain practitioner_id as audit/provenance — it records who added this person,
-- which matters for permission checks inside the Co-Lab. It is no longer the
-- primary scoping key; team_id is.
COMMENT ON COLUMN studio_people.team_id IS
  'Co-Lab (studio_teams) this person belongs to. Primary scope for all queries — a person record is owned by the workspace, not the platform.';
COMMENT ON COLUMN studio_people.practitioner_id IS
  'Practitioner who created/imported this person. Provenance only — not the scoping key.';
