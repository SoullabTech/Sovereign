-- COLAB-BETA-01 · make an invitation name the Co-Lab it is for.
--
-- Before this, `team_invites` carried no destination. The emailing path
-- (/api/team/invite) inferred one with resolveTeamIdForInviter(), which falls
-- back to the OLDEST studio_team — so a tester invited to a new cohort could
-- land in the original shared workspace. A separate table, studio_team_invites,
-- did carry team_id but had no email path and its tokens are not accepted by
-- /team/invite/[token] at all.
--
-- Additive and nullable: legacy rows keep NULL and continue to resolve by
-- inference. New invites created through the team-scoped path carry an explicit
-- destination, and acceptance joins THAT team — never an inferred one.

ALTER TABLE team_invites
  ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES studio_teams(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_team_invites_team_id ON team_invites(team_id);

COMMENT ON COLUMN team_invites.team_id IS
  'Destination Co-Lab. NULL only for rows created before COLAB-BETA-01, which fall back to inference. Acceptance adds the member to THIS team with the invite''s role.';
