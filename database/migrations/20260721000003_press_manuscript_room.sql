-- Soullab Press — Manuscript Room (v1)
--
-- CONSTITUTIONAL POSITION (load-bearing):
--   - member_uploaded provenance is MEMBER-ASSERTED authorship ("this is mine,
--     I wrote it"). The system records the assertion; it never verifies,
--     doubts, or upgrades it. The class travels with the material forever.
--   - No interpretive columns exist ANYWHERE in these tables — by construction
--     there is nothing the system could annotate. Titles, headings, collection
--     names are member-authored (headings may be mechanically detected from
--     the document's own structure, member-confirmed before save).
--   - Keeps store the member's exact source characters (verbatim; no trim,
--     no normalization — mark-route discipline). A keep is written only by an
--     explicit member gesture; no detector or background job may write one.
--   - Collections: the system may NEVER create or name one. Placement rows
--     record member acts only.
--   - Deletion is the member's, total, hard (ON DELETE CASCADE from the
--     manuscript down). Withdrawal removes access and content she owns;
--     nothing here is shared in v1, so no witness questions arise yet.
--
-- Authority: docs/specs/MANUSCRIPT_INGEST_SPEC_2026-07-21.md
--            docs/specs/BOOK_STUDIO_SOULBOOK_EXPLORATION_2026-07-13.md (§0, §9)

BEGIN;

CREATE TABLE IF NOT EXISTS member_manuscripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(trim(title)) > 0),
  provenance text NOT NULL DEFAULT 'member_uploaded'
    CHECK (provenance = 'member_uploaded'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_member_manuscripts_member
  ON member_manuscripts(member_id, created_at DESC);

CREATE TABLE IF NOT EXISTS manuscript_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,
  position int NOT NULL,
  heading text,
  body text NOT NULL CHECK (length(body) > 0),
  UNIQUE (manuscript_id, position)
);

CREATE TABLE IF NOT EXISTS manuscript_keeps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,
  section_id uuid NOT NULL REFERENCES manuscript_sections(id) ON DELETE CASCADE,
  verbatim_text text NOT NULL CHECK (length(trim(verbatim_text)) > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_manuscript_keeps_member
  ON manuscript_keeps(member_id, manuscript_id, created_at DESC);

CREATE TABLE IF NOT EXISTS manuscript_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(trim(name)) > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS manuscript_collection_items (
  collection_id uuid NOT NULL REFERENCES manuscript_collections(id) ON DELETE CASCADE,
  keep_id uuid NOT NULL REFERENCES manuscript_keeps(id) ON DELETE CASCADE,
  placed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (collection_id, keep_id)
);

COMMIT;

-- ROLLBACK (manual, in reverse order):
--   DROP TABLE IF EXISTS manuscript_collection_items;
--   DROP TABLE IF EXISTS manuscript_collections;
--   DROP TABLE IF EXISTS manuscript_keeps;
--   DROP TABLE IF EXISTS manuscript_sections;
--   DROP TABLE IF EXISTS member_manuscripts;
