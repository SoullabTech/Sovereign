-- Center of Inquiry provenance for member_field_note_threads.
--
-- PROVENANCE / INFRASTRUCTURE ONLY — not interpretive. Records which Center of Inquiry
-- a thread was authored under — person (Legacy Field) | project (Vision Studio) — so the
-- two fields do not blur in storage. This is NOT an inferred attribute of the person or
-- the project; it is simply which surface the member authored the recognition in.
--
-- Defaults to 'person' (the original surface), so existing rows remain valid.

ALTER TABLE member_field_note_threads
  ADD COLUMN IF NOT EXISTS center TEXT NOT NULL DEFAULT 'person'
    CHECK (center IN ('person', 'project'));

CREATE INDEX IF NOT EXISTS idx_mfnt_center
  ON member_field_note_threads(member_id, center, created_at DESC);

COMMENT ON COLUMN member_field_note_threads.center IS
  'Center of Inquiry the thread was authored under: person (Legacy Field) | project (Vision Studio). Provenance only — never an inferred attribute of the person or project.';
