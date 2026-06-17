-- Field Events — the person's day calendar (authored, Oath-safe)
-- Backs the Personal Studio home "Today" panel. Person-authored: you add your own
-- day's events; the system never schedules or infers them (Permission ≠ Obligation;
-- the person authors their time). Mirrors field_notes scope.

CREATE TABLE IF NOT EXISTS field_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id uuid NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  team_id         uuid REFERENCES studio_teams(id) ON DELETE SET NULL,
  title           text NOT NULL CHECK (length(btrim(title)) > 0),
  event_at        timestamptz NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE field_events IS
  'Personal day-calendar events for the Personal Studio "Today" panel. Person-authored (you add your day; the system never schedules/infers it). Scope: personal = team_id NULL; co-lab = team_id set (mirrors field_notes/changes/decisions).';

CREATE INDEX IF NOT EXISTS idx_field_events_practitioner_at ON field_events(practitioner_id, event_at);
CREATE INDEX IF NOT EXISTS idx_field_events_team ON field_events(team_id) WHERE team_id IS NOT NULL;
