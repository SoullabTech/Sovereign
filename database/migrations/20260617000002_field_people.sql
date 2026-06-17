-- Field People — people the person is tending (authored, Oath-safe)
-- Backs the Personal Studio home "People" panel. Person-authored: YOU name who you
-- are tending. The system deliberately does NOT infer "who keeps returning" — that
-- would be the system authoring your relationships (a held, gated enhancement, not
-- this). Mirrors field_notes scope.

CREATE TABLE IF NOT EXISTS field_people (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id uuid NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  team_id         uuid REFERENCES studio_teams(id) ON DELETE SET NULL,
  name            text NOT NULL CHECK (length(btrim(name)) > 0),
  note            text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE field_people IS
  'People the person is tending, for the Personal Studio "People" panel. Person-authored (YOU name who you tend; the system never infers "who keeps returning" — that stays a gated enhancement). Scope: personal = team_id NULL; co-lab = team_id set.';

CREATE INDEX IF NOT EXISTS idx_field_people_practitioner ON field_people(practitioner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_field_people_team ON field_people(team_id) WHERE team_id IS NOT NULL;
