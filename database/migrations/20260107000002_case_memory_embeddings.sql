-- ================================================
-- CASE MEMORY CHUNKS + PATTERNS (Phase 3)
-- Semantic memory for case context retrieval
-- Migration: 20260107000002_case_memory_embeddings.sql
-- ================================================

-- Ensure vector extension (should already exist)
CREATE EXTENSION IF NOT EXISTS vector;

-- ================================================
-- MEMORY CHUNKS (chunked notes, captures, consultations)
-- ================================================
CREATE TABLE IF NOT EXISTS case_memory_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES practitioner_cases(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id),

  -- Source tracking
  source_type TEXT NOT NULL CHECK (source_type IN ('note', 'capture', 'consultation', 'manual')),
  source_id UUID,                             -- FK to source record

  -- Content
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Embedding (768 dims for nomic-embed-text via Ollama)
  embedding vector(768),
  embedding_model TEXT,
  embedded_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_case_memory_chunks_case_time
  ON case_memory_chunks(case_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_case_memory_chunks_source
  ON case_memory_chunks(case_id, source_type, source_id);

CREATE INDEX IF NOT EXISTS idx_case_memory_chunks_metadata_gin
  ON case_memory_chunks USING gin (metadata);

-- Vector similarity index (IVFFlat for cosine distance)
-- Note: Run ANALYZE after populating data for optimal performance
CREATE INDEX IF NOT EXISTS idx_case_memory_chunks_embedding_ivfflat
  ON case_memory_chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ================================================
-- PRECOMPUTED PATTERNS (aggregated per case)
-- ================================================
CREATE TABLE IF NOT EXISTS case_patterns (
  case_id UUID PRIMARY KEY REFERENCES practitioner_cases(id) ON DELETE CASCADE,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  pattern_version INT NOT NULL DEFAULT 1,
  summary JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Add comment for documentation
COMMENT ON TABLE case_memory_chunks IS 'Chunked text from notes/captures with semantic embeddings for retrieval';
COMMENT ON TABLE case_patterns IS 'Precomputed pattern aggregations per case (themes, interventions, elements)';
