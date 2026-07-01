-- Bug Reports: preserve source Co-Lab context
--
-- Problem: bug reports currently route mirror messages (#bugs, #bug-log)
-- through getDefaultTeamId() — implicitly Team Soullab (first team created).
-- This is brittle: "default" is order-dependent and invisible.
--
-- Fix (two parts):
--
--   1. source_team_id — records which Co-Lab workspace the bug was filed from.
--      Existing rows: NULL (unknown origin). Future rows: set by the API route
--      from the reporter's active Co-Lab cookie.
--
--   2. admin_team designation — a boolean flag on studio_teams that marks the
--      workspace where platform-level channels (#bugs, #bug-log) live.
--      Set to true for Team Soullab. The mirror service reads this instead of
--      relying on "first team created" ordering.
--
-- No destructive changes. All columns are nullable or have safe defaults.

-- ── bug_reports: source Co-Lab context ───────────────────────────────────────

ALTER TABLE bug_reports
  ADD COLUMN IF NOT EXISTS source_team_id UUID REFERENCES studio_teams(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bug_reports_source_team
  ON bug_reports(source_team_id)
  WHERE source_team_id IS NOT NULL;

COMMENT ON COLUMN bug_reports.source_team_id IS
  'The Co-Lab workspace the reporter was active in when filing this report. '
  'NULL for pre-migration reports and reports filed outside a Co-Lab context.';

-- ── studio_teams: mark the admin/ops workspace ────────────────────────────────

ALTER TABLE studio_teams
  ADD COLUMN IF NOT EXISTS is_admin_workspace BOOLEAN NOT NULL DEFAULT false;

-- Mark the earliest team (Team Soullab) as the admin workspace.
-- This makes the mirror channel destination explicit and order-independent.
UPDATE studio_teams
SET is_admin_workspace = true
WHERE id = (SELECT id FROM studio_teams ORDER BY created_at ASC, id ASC LIMIT 1);

CREATE INDEX IF NOT EXISTS idx_studio_teams_admin_workspace
  ON studio_teams(is_admin_workspace)
  WHERE is_admin_workspace = true;

COMMENT ON COLUMN studio_teams.is_admin_workspace IS
  'True for the platform ops workspace (Team Soullab). Only one team should have '
  'this flag. Platform-level channels (#bugs, #bug-log) are resolved through this team.';
