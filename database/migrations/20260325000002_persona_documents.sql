-- V2 Knowledge Layer: Document storage for persona training
-- Source texts (books, transcripts, papers) are ingested here,
-- processed into knowledge statements, then synthesized into knowledge_block.

CREATE TABLE IF NOT EXISTS persona_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID NOT NULL REFERENCES practitioner_personas(id) ON DELETE CASCADE,

  -- Document identity
  title TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('md', 'txt', 'pdf', 'transcript')),
  content_hash TEXT NOT NULL,

  -- Raw content (stored for reprocessing)
  raw_content TEXT NOT NULL,
  char_count INT NOT NULL DEFAULT 0,

  -- Processing state
  processing_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  processing_error TEXT,

  -- Extracted knowledge (populated by processor)
  chunks_count INT DEFAULT 0,
  knowledge_statements JSONB DEFAULT '[]',
  knowledge_summary TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_persona_documents_persona
  ON persona_documents(persona_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_persona_documents_hash
  ON persona_documents(persona_id, content_hash);

-- Track migration
INSERT INTO schema_migrations (filename, applied_at)
VALUES ('20260325000002_persona_documents.sql', NOW())
ON CONFLICT (filename) DO NOTHING;
