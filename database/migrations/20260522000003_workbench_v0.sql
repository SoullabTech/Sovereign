-- Book Studio Workbench — v0 schema
-- The arrangement surface between captures and form.
--
-- Spec:         docs/book-studio/WORKBENCH_SPEC_v0.md
-- Architecture: docs/book-studio/WORKBENCH_ARCHITECTURE_v0.md
--
-- Two tables, covering Slices 1 and 2 of the v0 build:
--   workbench_uploads — files (typed and handwritten) entering the Workbench
--                       from outside MAIA's existing capture surfaces
--   workbench_tables  — per-arranger arrangement state (groups, ordered cards)
--
-- Sovereignty invariants enforced at the schema layer:
--   - Sanctuary uploads excluded from Shelf queries (sanctuary boolean + Shelf WHERE clause)
--   - Cards are pointers, not copies (layout JSON stores {source, ref}; content resolved at read)
--   - Review before indexing (FTS index built on transcription_reviewed only, never on draft)
--   - Hard delete by design (no soft-delete column; DELETE removes the row)
--
-- Slice 3 (cross-source Shelf reads) needs no schema — adapters read existing capture tables.

-- ═══════════════════════════════════════════════════════════════
-- workbench_uploads — material entering from outside MAIA
-- ═══════════════════════════════════════════════════════════════
-- One row per uploaded file. The file itself lives on the host filesystem at:
--   uploads/workbench/<arranger_id>/<id>/original.<ext>
--   uploads/workbench/<arranger_id>/<id>/draft.txt        (OCR/extract output, pre-review)
--   uploads/workbench/<arranger_id>/<id>/reviewed.txt     (canonical, indexed)
--
-- transcription_status lifecycle:
--   extracting → draft → reviewed
--   any state → error  (recorded in error_message)
--
-- Only `reviewed` content is full-text-indexed and surfaceable on the Shelf.
-- Drafts never enter the Shelf — this is enforced by the FTS index definition below,
-- which references transcription_reviewed only.

CREATE TABLE IF NOT EXISTS workbench_uploads (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  arranger_id             UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- File metadata
  original_name           TEXT NOT NULL,
  mime_type               TEXT NOT NULL,
  size_bytes              BIGINT NOT NULL CHECK (size_bytes >= 0),
  storage_path            TEXT NOT NULL,  -- relative to uploads/workbench/

  -- What kind of material this is (drives extraction pipeline)
  source_kind             TEXT NOT NULL CHECK (source_kind IN (
                            'typed_text',         -- .txt, .md
                            'typed_doc',          -- .docx, text-extractable .pdf
                            'handwritten_image',  -- .jpg, .png, .heic
                            'scanned_pdf'         -- image-based .pdf
                          )),

  -- Transcription lifecycle
  transcription_status    TEXT NOT NULL DEFAULT 'extracting'
                            CHECK (transcription_status IN ('extracting', 'draft', 'reviewed', 'error')),
  transcription_draft     TEXT,  -- raw OCR/extract output, never indexed
  transcription_reviewed  TEXT,  -- canonical, FTS-indexed, the only content the Shelf sees

  -- Sovereignty
  sanctuary               BOOLEAN NOT NULL DEFAULT FALSE,

  -- Operational
  error_message           TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Per-arranger lookup (the Shelf query path)
CREATE INDEX IF NOT EXISTS idx_workbench_uploads_arranger
  ON workbench_uploads (arranger_id, created_at DESC);

-- Worker queue path: "find uploads still being extracted"
CREATE INDEX IF NOT EXISTS idx_workbench_uploads_status
  ON workbench_uploads (transcription_status)
  WHERE transcription_status IN ('extracting', 'error');

-- Full-text search index — REVIEWED text only.
-- This is the enforcement point for the "review before indexing" invariant.
-- Drafts are deliberately not in this index. Sanctuary uploads still appear
-- here (cheap to index) but are filtered out at the Shelf query layer.
CREATE INDEX IF NOT EXISTS idx_workbench_uploads_fts
  ON workbench_uploads
  USING GIN (to_tsvector('english', COALESCE(transcription_reviewed, '')));


-- ═══════════════════════════════════════════════════════════════
-- workbench_tables — per-arranger arrangement state
-- ═══════════════════════════════════════════════════════════════
-- v0 ships with a single persistent Table per arranger, but the schema
-- supports many (so adding multi-table later costs nothing — just UI).
--
-- layout JSON shape:
--   {
--     "groups": [
--       {
--         "id": "g_<uuid>",
--         "name": "Cardamom dishes",
--         "cards": [
--           { "id": "c_<uuid>", "source": "uploaded", "ref": "<workbench_uploads.id>" },
--           { "id": "c_<uuid>", "source": "ideas",    "ref": "<idea_id>" }
--         ]
--       }
--     ]
--   }
--
-- Cards are pointers. Resolved content is fetched per source adapter at read time.
-- Deleting an underlying capture means the card resolves to null and is shown as
-- "(removed)" — the layout is not silently rewritten.

CREATE TABLE IF NOT EXISTS workbench_tables (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  arranger_id  UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  name         TEXT NOT NULL DEFAULT 'Untitled table',
  layout       JSONB NOT NULL DEFAULT '{"groups": []}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workbench_tables_arranger
  ON workbench_tables (arranger_id, updated_at DESC);


-- ═══════════════════════════════════════════════════════════════
-- updated_at maintenance
-- ═══════════════════════════════════════════════════════════════
-- Both tables track updated_at. We rely on application-layer UPDATE statements
-- to set this column rather than a trigger — explicit writes are easier to
-- reason about than implicit side effects, and the application already has
-- the timestamp at the moment of write.

COMMENT ON TABLE workbench_uploads IS
  'Files entering the Workbench from outside MAIA. Filesystem stores the original; this table stores metadata, transcription state, and the reviewed (indexable) text.';

COMMENT ON TABLE workbench_tables IS
  'Per-arranger arrangement state. layout JSON holds groups and ordered card pointers; content is resolved at read time via source adapters.';
