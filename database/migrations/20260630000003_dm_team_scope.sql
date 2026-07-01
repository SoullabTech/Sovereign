-- DM thread Co-Lab scoping
--
-- Adds team_id to team_dm_threads so DMs are sovereign to the Co-Lab
-- in which they were initiated. A member can only DM others who belong
-- to the same active Co-Lab; the thread itself carries that boundary.
--
-- Backfill: existing threads → default workspace (Team Soullab). These
-- predate Co-Lab sovereignty and are legitimately shared.

ALTER TABLE team_dm_threads
  ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES studio_teams(id) ON DELETE CASCADE;

-- Backfill existing threads to the default (earliest) team
UPDATE team_dm_threads
SET team_id = (SELECT id FROM studio_teams ORDER BY created_at ASC, id ASC LIMIT 1)
WHERE team_id IS NULL;

ALTER TABLE team_dm_threads ALTER COLUMN team_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_team_dm_threads_team ON team_dm_threads(team_id);

COMMENT ON COLUMN team_dm_threads.team_id IS
  'Co-Lab this DM thread belongs to. Only members of this Co-Lab may participate.';
