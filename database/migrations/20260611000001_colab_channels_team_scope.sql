-- Co-Lab multi-team workspaces: scope channels + roster to a team.
--
-- Provenance: drafted (uncommitted) in the parked worktree feat/colab-multi-team-workspaces
-- on 2026-06-11; adopted verbatim here as the first owned artifact of feat/colab-team-switcher.
--
-- Background: team CRUD (studio_teams / studio_team_members) already exists and teams can be
-- created via Studio, but Co-Lab was team-UNAWARE — team_channels had no team_id (channels were
-- global) and the Co-Lab roster reads the global `members` table. This migration makes channels
-- team-scoped and seeds the existing population + channels into the default ("Team Soullab")
-- workspace, so today's behavior is preserved exactly while new teams become real workspaces.
--
-- Idempotent, env-portable, transactional (all-or-nothing). Destroys no data.
-- The default workspace = the earliest-created team (prod: "Team Soullab", 2026-05-19).

BEGIN;

-- 0) Ensure a default team exists. No-op in prod (Team Soullab already earliest).
--    On a fresh env with members but no teams, create one so the backfill has a target.
INSERT INTO studio_teams (id, name, description, owner_id)
SELECT gen_random_uuid(), 'Team Soullab', 'Default Co-Lab workspace',
       (SELECT id FROM members ORDER BY created_at ASC LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM studio_teams)
  AND EXISTS (SELECT 1 FROM members);

-- 1) Add team_id to team_channels (nullable first so existing rows survive).
--    No ON DELETE CASCADE on purpose: deleting a team that still owns channels is BLOCKED
--    (data-protective). A deliberate team-archive/delete flow can revisit this later.
ALTER TABLE team_channels
  ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES studio_teams(id);

-- 2) Backfill existing (global) channels -> the default (earliest) team.
UPDATE team_channels
   SET team_id = (SELECT id FROM studio_teams ORDER BY created_at ASC LIMIT 1)
 WHERE team_id IS NULL;

-- 3) Enforce NOT NULL once backfilled (guarded: only if no nulls remain — safe on empty envs).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM team_channels WHERE team_id IS NULL) THEN
    ALTER TABLE team_channels ALTER COLUMN team_id SET NOT NULL;
  END IF;
END $$;

-- 4) Slug uniqueness: global UNIQUE(slug) -> per-team UNIQUE(team_id, slug).
--    Confirmed constraint name: team_channels_slug_key. Dropping it drops its backing index.
ALTER TABLE team_channels DROP CONSTRAINT IF EXISTS team_channels_slug_key;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conrelid = 'team_channels'::regclass
       AND conname  = 'team_channels_team_id_slug_key'
  ) THEN
    ALTER TABLE team_channels
      ADD CONSTRAINT team_channels_team_id_slug_key UNIQUE (team_id, slug);
  END IF;
END $$;

-- 5) Index for team-scoped channel queries.
CREATE INDEX IF NOT EXISTS idx_team_channels_team ON team_channels(team_id);

-- 6) Backfill the existing Co-Lab population into the default team's membership, so the default
--    workspace roster equals today's global roster. Existing rows (incl. the owner) are preserved.
--    NEW teams get explicit membership only — they do NOT inherit this seed.
INSERT INTO studio_team_members (team_id, member_id, role)
SELECT (SELECT id FROM studio_teams ORDER BY created_at ASC LIMIT 1), m.id, 'member'
  FROM members m
 WHERE EXISTS (SELECT 1 FROM studio_teams)
ON CONFLICT (team_id, member_id) DO NOTHING;

COMMIT;
