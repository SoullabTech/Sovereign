-- Library ingestion integrity (Class A defect remediation)
-- docs/defects/LIBRARY_INGESTION_IDENTITY_DEFECT_2026-07-27.md
--
-- D1 (identity): sources must carry a validated identity; identity-invalid
-- sources are never eligible for retrieval.
-- D2 (completeness): expected vs actual chunk count is recorded; partial
-- ingests are never eligible for retrieval.
--
-- Columns only — no data mutation. The corrective sweep over the historical
-- corpus is a separate, explicitly-run tool (scripts/library/repairIdentity.ts).
-- identity_valid semantics: TRUE = validated · FALSE = invalid (blocked from
-- retrieval) · NULL = legacy/unevaluated (retains existing behavior until the
-- corrective sweep evaluates it).

ALTER TABLE library_sources
  ADD COLUMN IF NOT EXISTS expected_chunk_count integer,
  ADD COLUMN IF NOT EXISTS identity_valid boolean,
  ADD COLUMN IF NOT EXISTS identity_invalid_reason text;

COMMENT ON COLUMN library_sources.expected_chunk_count IS
  'Chunk count planned from the full source content before writing; compared against chunk_count to detect partial ingestion (D2).';
COMMENT ON COLUMN library_sources.identity_valid IS
  'TRUE = title/author passed identity validation; FALSE = invalid, never retrievable; NULL = legacy row not yet evaluated (D1).';
COMMENT ON COLUMN library_sources.identity_invalid_reason IS
  'Machine-readable reason when identity_valid = FALSE (e.g. junk_title, junk_author, source_file_unlocated).';
