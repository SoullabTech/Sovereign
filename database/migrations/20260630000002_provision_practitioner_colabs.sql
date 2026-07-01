-- Provision sovereign Co-Labs for all practitioners who do not yet own one.
--
-- Constitutional invariant: every practitioner should inhabit their own
-- sovereign relational workspace, not a shared global commons.
--
-- This migration is idempotent: it skips any practitioner who already owns
-- a team (role = 'owner'), so it is safe to re-run.
--
-- Name pattern: "[Member name]'s Co-Lab"
-- Role: owner
-- Scope: all current practitioners without an owned studio_team

DO $$
DECLARE
  r RECORD;
  new_team_id UUID;
BEGIN
  FOR r IN
    SELECT m.id AS member_id, m.name AS member_name
    FROM practitioners p
    JOIN members m ON m.id = p.member_id
    WHERE NOT EXISTS (
      SELECT 1 FROM studio_team_members stm
      WHERE stm.member_id = m.id AND stm.role = 'owner'
    )
    ORDER BY m.name
  LOOP
    -- Create the Co-Lab
    INSERT INTO studio_teams (name, owner_id)
    VALUES (r.member_name || '''s Co-Lab', r.member_id)
    RETURNING id INTO new_team_id;

    -- Add the practitioner as owner
    INSERT INTO studio_team_members (team_id, member_id, role, invited_by)
    VALUES (new_team_id, r.member_id, 'owner', r.member_id);

    RAISE NOTICE 'Created Co-Lab "%" for member %', r.member_name || '''s Co-Lab', r.member_name;
  END LOOP;
END $$;
