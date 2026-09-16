-- WS-CHAPTER-REVIEW-CONTINUITY-01
-- One explicit Chapter Review gesture, one durable manifest.
-- The readings remain immutable in developmental_readings; this table only
-- records which exact frozen readings were produced by the same member act.
BEGIN;

CREATE TABLE IF NOT EXISTS writer_studio_chapter_review_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,
  chapter_root_section_id uuid NOT NULL,
  section_ids jsonb NOT NULL CHECK (jsonb_typeof(section_ids) = 'array' AND jsonb_array_length(section_ids) > 0),
  draft_revision integer NOT NULL CHECK (draft_revision >= 0),
  reading_ids jsonb NOT NULL CHECK (jsonb_typeof(reading_ids) = 'array'),
  failures jsonb NOT NULL CHECK (jsonb_typeof(failures) = 'array'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ws_chapter_review_runs_latest
  ON writer_studio_chapter_review_runs
     (member_id, manuscript_id, chapter_root_section_id, created_at DESC);

COMMIT;

-- ROLLBACK:
-- DROP TABLE IF EXISTS writer_studio_chapter_review_runs;
