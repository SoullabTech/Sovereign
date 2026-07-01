-- Sessions + Encounters: Co-Lab scoping
--
-- An Encounter belongs to one Co-Lab unless explicitly shared later.
-- A session (booking) belongs to the practitioner's active Co-Lab.
--
-- Backfill strategy: assign to the practitioner's owned Co-Lab (earliest
-- team where role = 'owner'). Practitioners without an owned team fall back
-- to the default workspace — all have owned teams after migration 20260630000002.

-- ── encounters ────────────────────────────────────────────────────────────────

ALTER TABLE encounters
  ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES studio_teams(id) ON DELETE RESTRICT;

UPDATE encounters e
SET team_id = COALESCE(
  (SELECT stm.team_id
   FROM studio_team_members stm
   WHERE stm.member_id = (SELECT p.member_id FROM practitioners p WHERE p.id = e.practitioner_id)
     AND stm.role = 'owner'
   ORDER BY stm.joined_at ASC LIMIT 1),
  (SELECT id FROM studio_teams ORDER BY created_at ASC, id ASC LIMIT 1)
)
WHERE team_id IS NULL;

ALTER TABLE encounters ALTER COLUMN team_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_encounters_team_id ON encounters(team_id);

COMMENT ON COLUMN encounters.team_id IS
  'Co-Lab this encounter belongs to. Primary scope for all reads and writes.';

-- ── sessions (portal bookings) ────────────────────────────────────────────────

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES studio_teams(id) ON DELETE RESTRICT;

UPDATE sessions s
SET team_id = COALESCE(
  (SELECT stm.team_id
   FROM studio_team_members stm
   WHERE stm.member_id = (SELECT p.member_id FROM practitioners p WHERE p.id = s.practitioner_id)
     AND stm.role = 'owner'
   ORDER BY stm.joined_at ASC LIMIT 1),
  (SELECT id FROM studio_teams ORDER BY created_at ASC, id ASC LIMIT 1)
)
WHERE team_id IS NULL;

ALTER TABLE sessions ALTER COLUMN team_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_team_id ON sessions(team_id);

COMMENT ON COLUMN sessions.team_id IS
  'Co-Lab this session booking belongs to. Primary scope for all reads and writes.';
