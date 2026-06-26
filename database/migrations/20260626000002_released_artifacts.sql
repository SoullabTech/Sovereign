-- Released Artifacts — Recognition WITHOUT retention.
--
-- When a member RELEASES (deletes) an authored artifact and explicitly chooses to
-- remember the ACT of release, one row is recorded here. The artifact's CONTENT is
-- deleted as normal; this table holds only the FACT of release + the member's own
-- optional note. By construction it has NO column capable of holding the released
-- content — so "recognition without retention" cannot become "retention in disguise."
--
-- Beta-gated at the application layer (labs.preview); recognition is always
-- member-chosen. Remembering an ACT is not retaining its OBJECT.

CREATE TABLE IF NOT EXISTS released_artifacts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     uuid NOT NULL,                              -- the member who authored the release (audit)
  artifact_type text NOT NULL,                              -- e.g. 'journal_entry' — the TYPE only, never the content
  note          text CHECK (note IS NULL OR char_length(note) <= 500),  -- member's OWN optional words about letting go (a reflection, NOT the artifact content)
  released_at   timestamptz NOT NULL DEFAULT now()
  -- Deliberately NO content / title / body / artifact_id column: the released
  -- artifact must not be reconstructable from this record. The member's note is
  -- capped so it stays a reflection rather than a copy of the released content.
);

COMMENT ON TABLE released_artifacts IS
  'Recognition without retention: a member-chosen record of the ACT of releasing an authored artifact. Holds only artifact_type + the member''s optional capped note + timestamp — never the released content, and no reference to the deleted artifact. Structurally incapable of reconstructing what was released.';

CREATE INDEX IF NOT EXISTS idx_released_artifacts_member
  ON released_artifacts (member_id, released_at DESC);
