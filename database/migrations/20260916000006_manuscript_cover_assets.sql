-- HPB-05 — author-owned print cover assets.
-- Paperback and hardcover wraps are distinct publication assets.
-- Uploading preserves custody; print-readiness is adjudicated separately.
BEGIN;

CREATE TABLE IF NOT EXISTS manuscript_cover_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  edition text NOT NULL CHECK (edition IN ('paperback', 'hardcover')),
  storage_path text NOT NULL,
  original_filename text,
  mime_type text NOT NULL CHECK (mime_type = 'application/pdf'),
  byte_size bigint NOT NULL CHECK (byte_size > 0),
  sha256 text NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),
  page_count integer NOT NULL CHECK (page_count = 1),
  page_width_pt numeric NOT NULL CHECK (page_width_pt > 0),
  page_height_pt numeric NOT NULL CHECK (page_height_pt > 0),
  chosen_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (manuscript_id, edition)
);

CREATE INDEX IF NOT EXISTS idx_manuscript_cover_assets_member
  ON manuscript_cover_assets(member_id, manuscript_id, edition);

COMMENT ON TABLE manuscript_cover_assets IS
  'HPB-05. Author-chosen print cover-wrap PDFs; one independent asset per paperback/hardcover edition.';
COMMENT ON COLUMN manuscript_cover_assets.sha256 IS
  'SHA-256 of the exact uploaded PDF bytes used for custody/provenance.';
COMMENT ON COLUMN manuscript_cover_assets.page_width_pt IS
  'Uploaded PDF page width in PDF points. This is evidence, not print-readiness certification.';
COMMENT ON COLUMN manuscript_cover_assets.page_height_pt IS
  'Uploaded PDF page height in PDF points. This is evidence, not print-readiness certification.';

COMMIT;

-- ROLLBACK:
-- DROP TABLE IF EXISTS manuscript_cover_assets;
