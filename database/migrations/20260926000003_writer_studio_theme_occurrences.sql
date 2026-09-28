-- WRITERS-STUDIO-FLAGSHIP-ROADMAP-01 / D5C3
-- Durable evidence-derived occurrence addresses for governed Work Themes.
--
-- Occurrences carry NO manuscript prose. They point back into one immutable
-- developmental reading: draft-section identity, optional section-relative
-- Unicode code-point range, source reading/observation, and frozen revision.
-- Presence/trajectory are deliberately NOT stored here; D5C4 derives them.

BEGIN;

-- The composite key lets the occurrence table prove that one theme, member and
-- Work identity belong together without trusting application joins.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'writer_studio_work_themes_owner_work_key'
       AND conrelid = 'writer_studio_work_themes'::regclass
  ) THEN
    ALTER TABLE writer_studio_work_themes
      ADD CONSTRAINT writer_studio_work_themes_owner_work_key
      UNIQUE (id, member_id, manuscript_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS writer_studio_work_theme_occurrences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id uuid NOT NULL,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,

  -- Historical draft-section identity from the frozen reading. Intentionally
  -- no FK to the current mutable section table: recoverability is through the
  -- source reading/revision, not through whatever section is current today.
  section_id uuid NOT NULL,

  -- Relative to the frozen section body, in Unicode code points.
  -- NULL/NULL means the evidence names the whole section.
  code_point_start integer,
  code_point_end integer,

  source_reading_id uuid NOT NULL REFERENCES developmental_readings(id) ON DELETE CASCADE,
  source_observation_id text NOT NULL CHECK (length(trim(source_observation_id)) > 0),
  source_revision_number integer NOT NULL CHECK (source_revision_number >= 1),
  provenance_kind text NOT NULL CHECK (provenance_kind = 'maia-observation'),
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT writer_studio_work_theme_occurrence_owner_work_fkey
    FOREIGN KEY (theme_id, member_id, manuscript_id)
    REFERENCES writer_studio_work_themes(id, member_id, manuscript_id)
    ON DELETE CASCADE,

  CONSTRAINT writer_studio_work_theme_occurrence_range_shape CHECK (
    (code_point_start IS NULL AND code_point_end IS NULL)
    OR
    (code_point_start IS NOT NULL AND code_point_end IS NOT NULL
      AND code_point_start >= 0 AND code_point_end > code_point_start)
  )
);

-- Replaying the same member governance act over one frozen source cannot mint
-- duplicate occurrence evidence. NULL whole-section ranges are normalized only
-- for uniqueness; -1 is not a legal stored code-point offset.
CREATE UNIQUE INDEX IF NOT EXISTS uq_writer_studio_work_theme_occurrence_source
  ON writer_studio_work_theme_occurrences(
    theme_id, source_reading_id, source_observation_id, section_id,
    COALESCE(code_point_start, -1), COALESCE(code_point_end, -1)
  );

CREATE INDEX IF NOT EXISTS idx_writer_studio_work_theme_occurrences_theme
  ON writer_studio_work_theme_occurrences(member_id, manuscript_id, theme_id, created_at, id);

CREATE INDEX IF NOT EXISTS idx_writer_studio_work_theme_occurrences_section
  ON writer_studio_work_theme_occurrences(member_id, manuscript_id, section_id);

-- Evidence coordinates are historical facts. They may be removed by an owning
-- account/Work deletion through FK cascade, but they are never edited in place.
CREATE OR REPLACE FUNCTION writer_studio_work_theme_occurrence_no_update()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION
    'writer studio theme occurrence % is immutable; derive a successor from a new reading',
    OLD.id;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS writer_studio_work_theme_occurrence_no_update_check
  ON writer_studio_work_theme_occurrences;

CREATE TRIGGER writer_studio_work_theme_occurrence_no_update_check
  BEFORE UPDATE ON writer_studio_work_theme_occurrences
  FOR EACH ROW EXECUTE FUNCTION writer_studio_work_theme_occurrence_no_update();

COMMIT;
