-- Soullab Press — Manuscript render provenance (author-ready, Phase 1)
--
-- CONSTITUTIONAL POSITION (load-bearing):
--   - A render turns the member's OWN manuscript (member_uploaded provenance,
--     verbatim sections) into a book they can hold — PDF or EPUB. The rendered
--     bytes are streamed to the author and never stored server-side.
--   - This table records only the ACT of authorizing a render: which manuscript,
--     which member, which format, a content hash of the source sections
--     (version/provenance), and when the member authorized it. It is an approval
--     + provenance ledger, not the artifact and not interpretation.
--   - No interpretive columns, by construction — nothing the system could
--     annotate about what the book "means". Mirrors the manuscript_room tables.
--   - source_hash is the sha256 of the exact sections rendered (see
--     lib/manuscript/render/renderMemberBook.ts computeSourceHash). It records
--     "which words became this book", never their meaning.
--
-- Authority: docs/press/MANUSCRIPT_AUTHOR_READY_PHASE1.md
--            docs/specs/BOOK_STUDIO_SOULBOOK_EXPLORATION_2026-07-13.md

BEGIN;

CREATE TABLE IF NOT EXISTS manuscript_renders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  format text NOT NULL CHECK (format IN ('pdf', 'epub')),
  source_section_count int NOT NULL CHECK (source_section_count > 0),
  source_hash text NOT NULL CHECK (length(source_hash) > 0),
  page_count int,
  authorized_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_manuscript_renders_manuscript
  ON manuscript_renders(manuscript_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_manuscript_renders_member
  ON manuscript_renders(member_id, created_at DESC);

COMMIT;

-- ROLLBACK (manual):
--   DROP TABLE IF EXISTS manuscript_renders;
