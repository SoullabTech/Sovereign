-- WS-01 — Source custody for manuscript arrivals.
--
-- Governing distinction (Writer's Studio master brief §4, founder 2026-08-24):
--
--   SOURCE ARTIFACT  →  SOURCE TEXT  →  INTERPRETATION  →  WORK STRUCTURE
--
-- Before this migration the system had no Source layer at all. `manuscript_sections`
-- fuses regex-derived headings with the text that fell between them, and
-- `manuscript_working_drafts.base_source_hash` hashes THAT cut — so what the product
-- called "source" was already an interpretation, and arriving lines could be discarded
-- before the member ever opened the Work.
--
-- This migration adds the two immutable witnesses beside the existing tables. It is
-- ADDITIVE ONLY: no existing row is rewritten, `manuscript_sections` is untouched, and
-- its CHECK (length(body) > 0) is deliberately NOT relaxed — a heading with no body is
-- an interpretation fact, not a malformed section.
--
-- Bytes live in the shared file vault (lib/storage/fileVault.ts, the same mechanism the
-- studio vault and bug attachments use); this table holds identity, provenance and
-- governance. Relational data governs the source; durable storage holds the bytes.

CREATE TABLE IF NOT EXISTS manuscript_source_arrivals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,

  -- Linked when the member confirms the import. NULL while an arrival is still
  -- unclaimed (the member uploaded, then abandoned before saving).
  manuscript_id uuid REFERENCES member_manuscripts(id) ON DELETE CASCADE,

  -- Files have artifacts. Pasted words do not. Neither is given provenance it
  -- never had — see the CHECK below, which makes that structural rather than a
  -- convention downstream code must remember.
  source_kind text NOT NULL CHECK (source_kind IN ('artifact_extraction', 'member_supplied_text')),

  -- ── The immutable artifact (file-backed arrivals only) ────────────────────
  artifact_ref text,            -- vault-relative storage path
  artifact_hash text,           -- sha256 of the exact bytes that arrived
  artifact_size bigint CHECK (artifact_size IS NULL OR artifact_size >= 0),
  original_filename text,
  mime_type text,

  -- ── The immutable source text (every arrival) ─────────────────────────────
  source_text text NOT NULL,
  source_text_hash text NOT NULL CHECK (length(source_text_hash) > 0),
  extraction_method text NOT NULL CHECK (length(extraction_method) > 0),
  extractor_version text NOT NULL CHECK (length(extractor_version) > 0),

  created_at timestamptz NOT NULL DEFAULT now(),

  -- A hash without recoverable bytes is not custody, and a paste must never be
  -- able to claim an artifact. Both directions enforced in one constraint.
  CONSTRAINT manuscript_source_arrivals_kind_fields CHECK (
    (source_kind = 'artifact_extraction'
       AND artifact_ref IS NOT NULL
       AND artifact_hash IS NOT NULL
       AND artifact_size IS NOT NULL
       AND original_filename IS NOT NULL)
    OR
    (source_kind = 'member_supplied_text'
       AND artifact_ref IS NULL
       AND artifact_hash IS NULL
       AND artifact_size IS NULL
       AND original_filename IS NULL
       AND mime_type IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_manuscript_source_arrivals_member
  ON manuscript_source_arrivals(member_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_manuscript_source_arrivals_manuscript
  ON manuscript_source_arrivals(manuscript_id);

COMMENT ON TABLE manuscript_source_arrivals IS
  'Immutable witnesses of what arrived: the artifact (bytes in the file vault) and the source text extracted from it. Never interpretation. Rows are not updated after creation except to claim manuscript_id at the confirmation act.';

COMMENT ON COLUMN manuscript_source_arrivals.source_kind IS
  'artifact_extraction = a durable original artifact exists and source_text derives from it. member_supplied_text = the member supplied the text directly; NO recoverable upstream artifact is claimed. Downstream code must never infer an artifact for member_supplied_text.';

-- ── Honest labelling of everything that came before ─────────────────────────
-- Existing manuscripts cannot be retrospectively certified: where the empty-body
-- skip in segment.ts dropped a heading, those characters are not in the database
-- to recover. They are labelled, not rewritten, and "Restore original import"
-- must not be offered for them as though an original were available.
ALTER TABLE member_manuscripts
  ADD COLUMN IF NOT EXISTS source_custody text NOT NULL DEFAULT 'legacy_interpreted_import';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'member_manuscripts_source_custody_check'
  ) THEN
    ALTER TABLE member_manuscripts
      ADD CONSTRAINT member_manuscripts_source_custody_check
      CHECK (source_custody IN ('legacy_interpreted_import', 'source_custodied'));
  END IF;
END $$;

COMMENT ON COLUMN member_manuscripts.source_custody IS
  'legacy_interpreted_import = imported before WS-01; its manuscript_sections are an interpretation of unknown fidelity and are NOT a certified source. source_custodied = a manuscript_source_arrivals row holds the immutable arrival.';
