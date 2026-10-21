-- CORPUS-BUILD-EA-01 · persistent provenance for newly written AIN knowledge rows.
-- Existing historical rows may predate this law, so the required-provenance
-- constraint is NOT VALID: PostgreSQL still enforces it for all new/updated rows
-- without pretending legacy rows were previously governed this way.

ALTER TABLE ain_knowledge_chunks
  ADD COLUMN IF NOT EXISTS source_checksum TEXT,
  ADD COLUMN IF NOT EXISTS content_checksum TEXT,
  ADD COLUMN IF NOT EXISTS normalization_id TEXT,
  ADD COLUMN IF NOT EXISTS authority_ref TEXT,
  ADD COLUMN IF NOT EXISTS corpus_build_id TEXT;

ALTER TABLE ain_knowledge_chunks
  ADD CONSTRAINT ain_knowledge_new_rows_require_provenance
  CHECK (
    source_checksum IS NOT NULL
    AND content_checksum IS NOT NULL
    AND normalization_id IS NOT NULL
    AND authority_ref IS NOT NULL
    AND corpus_build_id IS NOT NULL
  ) NOT VALID;

ALTER TABLE ain_knowledge_chunks
  ADD CONSTRAINT ain_knowledge_source_checksum_shape
  CHECK (
    (source_checksum IS NULL OR source_checksum ~ '^[0-9a-f]{64}$')
    AND (content_checksum IS NULL OR content_checksum ~ '^[0-9a-f]{64}$')
  ) NOT VALID;
CREATE INDEX IF NOT EXISTS idx_ain_knowledge_source_checksum
  ON ain_knowledge_chunks(source_checksum);

CREATE INDEX IF NOT EXISTS idx_ain_knowledge_build_id
  ON ain_knowledge_chunks(corpus_build_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ain_knowledge_provenance_chunk
  ON ain_knowledge_chunks(source_file, source_checksum, content_checksum, normalization_id, chunk_index)
  WHERE source_checksum IS NOT NULL;

COMMENT ON COLUMN ain_knowledge_chunks.source_checksum IS
  'SHA-256 of the exact governed source revision that produced this chunk.';
COMMENT ON COLUMN ain_knowledge_chunks.content_checksum IS
  'SHA-256 of the deterministic text derivative actually chunked and embedded.';
COMMENT ON COLUMN ain_knowledge_chunks.normalization_id IS
  'Named deterministic transform from authorized source to embedded content.';
COMMENT ON COLUMN ain_knowledge_chunks.authority_ref IS
  'Governed repository authority record authorizing this exact source revision.';
COMMENT ON COLUMN ain_knowledge_chunks.corpus_build_id IS
  'Governed build act responsible for this knowledge row.';
