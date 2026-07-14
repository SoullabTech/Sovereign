-- Migration: practitioner_program_platform
-- Constitutional function: STRUCTURAL — practitioner-authored materials + program lessons + program revision history
-- Spec: docs/specs/developmental-environment/PRACTITIONER_PROGRAM_PLATFORM_ADR_2026-07-14.md
-- Depends on: library_sources (20260130000001), practitioner_files (20260206000001),
--             field_programs (20260712000001), practice_field_revisions pattern (20260710000002)
--
-- Three concerns, one platform slice:
--   1. library_sources gains practitioner scoping + a ratification lifecycle —
--      only RATIFIED material may ever compose into MAIA context. AI never
--      advances state; only the practitioner's gesture ratifies.
--   2. field_program_lessons — one thin enrichment: a program's focal point
--      gains attached ratified materials, a practice, a reflection prompt.
--      The deployed position mechanics (member-sovereign) are untouched.
--   3. field_program_revisions — append-only history of program authoring,
--      same structural-incapacity pattern as practice_field_revisions:
--      nothing the practitioner changes erases what came before.
--
-- Constitutional lines carried by this schema:
--   - No member data appears in any of these tables. They are practitioner-
--     authored artifacts only; the member-side boundary (no practitioner read
--     of positions) is unaffected and unaffectable from here.
--   - Uploaded/linked material is UNTRUSTED CONTENT: ratification gates
--     composition, and the compose path frames it context-not-instructions.
--
-- Idempotent per migration-ledger discipline.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. MATERIALS — practitioner scoping + ratification lifecycle on library_sources
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE library_sources ADD COLUMN IF NOT EXISTS practitioner_member_id UUID REFERENCES members(id) ON DELETE RESTRICT;
ALTER TABLE library_sources ADD COLUMN IF NOT EXISTS field_slug VARCHAR(64);
ALTER TABLE library_sources ADD COLUMN IF NOT EXISTS vault_file_id UUID REFERENCES practitioner_files(id) ON DELETE SET NULL;
ALTER TABLE library_sources ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE library_sources ADD COLUMN IF NOT EXISTS external_url TEXT;
ALTER TABLE library_sources ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'uploaded';
ALTER TABLE library_sources ADD COLUMN IF NOT EXISTS ratified_at TIMESTAMPTZ;
ALTER TABLE library_sources ADD COLUMN IF NOT EXISTS ratified_by UUID REFERENCES members(id);

-- Link-based resources carry external_url and no file; relax file_path.
ALTER TABLE library_sources ALTER COLUMN file_path DROP NOT NULL;

-- Ratification lifecycle: uploaded → processed → reviewed → ratified → archived.
-- Pre-existing rows (house corpus, pre-platform) default to 'uploaded' — they
-- were never practitioner-ratified and must not silently become composable.
ALTER TABLE library_sources DROP CONSTRAINT IF EXISTS library_sources_review_status_check;
ALTER TABLE library_sources ADD CONSTRAINT library_sources_review_status_check
  CHECK (review_status IN ('uploaded', 'processed', 'reviewed', 'ratified', 'archived'));

-- Widen the material-type vocabulary for practitioner media
-- (original: txt|book|transcript|article|manual|teaching).
ALTER TABLE library_sources DROP CONSTRAINT IF EXISTS library_sources_type_check;
ALTER TABLE library_sources ADD CONSTRAINT library_sources_type_check
  CHECK (type IN ('txt', 'book', 'transcript', 'article', 'manual', 'teaching',
                  'audio', 'video', 'worksheet', 'exercise', 'image', 'link', 'document'));

CREATE INDEX IF NOT EXISTS idx_library_sources_practitioner
  ON library_sources(practitioner_member_id) WHERE practitioner_member_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_library_sources_field
  ON library_sources(field_slug) WHERE field_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_library_sources_review_status
  ON library_sources(review_status);

COMMENT ON COLUMN library_sources.review_status IS
  'Ratification lifecycle: uploaded → processed → reviewed → ratified → archived. '
  'Only ratified material may compose into MAIA context. Only the practitioner''s '
  'gesture ratifies — AI suggestions never advance state.';
COMMENT ON COLUMN library_sources.vault_file_id IS
  'Original bytes live in the practitioner vault (practitioner_files); this row holds '
  'metadata + extracted text lineage. Originals are never altered by lifecycle changes.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. LESSONS — enrich a program focal point with materials / practice / reflection
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS field_program_lessons (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_slug         VARCHAR(64) NOT NULL,
  program_slug       VARCHAR(64) NOT NULL,
  -- The step this lesson enriches. Ordering lives in field_programs.focal_points;
  -- a lesson is addressed by its step name, so reordering steps never rewrites lessons.
  focal_point        TEXT NOT NULL,
  purpose            TEXT,
  -- Ordered refs into library_sources. The COMPOSE path re-checks ratification
  -- at read time — a reference to unratified material composes as nothing.
  material_ids       UUID[] NOT NULL DEFAULT '{}',
  practice           TEXT,
  reflection_prompt  TEXT,
  authored_by        TEXT NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (field_slug, program_slug, focal_point),
  FOREIGN KEY (field_slug, program_slug)
    REFERENCES field_programs(field_slug, program_slug) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_fp_lessons_program
  ON field_program_lessons(field_slug, program_slug);

DROP TRIGGER IF EXISTS update_field_program_lessons_updated_at ON field_program_lessons;
CREATE TRIGGER update_field_program_lessons_updated_at
  BEFORE UPDATE ON field_program_lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE field_program_lessons IS
  'Practitioner-authored enrichment of a program focal point: attached ratified materials, '
  'a practice, a reflection prompt. Holds NO member data. Composes downstream of the field '
  'block as context-not-instruction, and only over ratified materials. '
  'Spec: PRACTITIONER_PROGRAM_PLATFORM_ADR_2026-07-14.md §B.2';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. PROGRAM REVISIONS — append-only authoring history (PR #586 pattern)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS field_program_revisions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_slug       VARCHAR(64) NOT NULL,
  program_slug     VARCHAR(64) NOT NULL,
  revision_number  INT NOT NULL,
  -- Full program state at save: the field_programs row + all its lessons.
  snapshot         JSONB NOT NULL,
  saved_by         TEXT NOT NULL,
  note             TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (field_slug, program_slug, revision_number)
);
-- Deliberately NO foreign key to field_programs: history must outlive whatever
-- happens to the program row. Rollback is a future revision, never mutation.

CREATE INDEX IF NOT EXISTS idx_fp_revisions_program
  ON field_program_revisions(field_slug, program_slug, revision_number DESC);

CREATE OR REPLACE FUNCTION field_program_revisions_immutable()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'field_program_revisions is append-only: % is not permitted', TG_OP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS fp_revisions_append_only ON field_program_revisions;
CREATE TRIGGER fp_revisions_append_only
  BEFORE UPDATE OR DELETE ON field_program_revisions
  FOR EACH ROW EXECUTE FUNCTION field_program_revisions_immutable();

COMMENT ON TABLE field_program_revisions IS
  'Append-only version history of practitioner program authoring. Written in the same '
  'transaction as every program/lesson save; no-op saves are skipped. UPDATE/DELETE raise. '
  'Nothing the practitioner changes erases what came before.';
