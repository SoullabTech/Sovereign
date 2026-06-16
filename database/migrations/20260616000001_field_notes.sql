-- Field Notes — authored attentions in the Personal Field
-- Design: docs/specs/PERSONAL_FIELD_REDESIGN_2026-06-15.md §0.5 (Field as Orientation Space)
--
-- The Personal Field is both DERIVED (from studio_changes / studio_decisions) and
-- AUTHORED. A Field Note is "a small authored attention" the person places directly
-- into one of the four orientation questions (alive / asking / emerging / tending).
--
-- Deliberately minimal: NO status, owner, due date, or completion columns. The schema
-- itself is the guardrail — if a thing needs those, it is a task, not a Field Note.
-- (See the placement test in the redesign spec.) Authorship is the act; placement is the meaning.
--
-- Scope mirrors studio_changes / studio_decisions: personal = team_id NULL; co-lab = team_id set.

CREATE TABLE IF NOT EXISTS field_notes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id uuid NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  team_id         uuid REFERENCES studio_teams(id) ON DELETE SET NULL,
  section         text NOT NULL CHECK (section IN ('alive','asking','emerging','tending')),
  body            text NOT NULL CHECK (length(btrim(body)) > 0),
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE field_notes IS
  'Authored attentions in the Personal Field — a small note the person places into one of the four orientation questions (alive/asking/emerging/tending). Deliberately no status/owner/due/completion: if it needs those it is a task, not a Field Note. Scope: personal = team_id NULL; co-lab = team_id set (mirrors studio_changes/decisions).';

CREATE INDEX IF NOT EXISTS idx_field_notes_practitioner ON field_notes(practitioner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_field_notes_team ON field_notes(team_id) WHERE team_id IS NOT NULL;
