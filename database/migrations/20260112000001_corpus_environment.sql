-- Corpus-as-Environment: Structured retrieval boundaries for MAIA
-- Enables scoped, traceable, sovereignty-first knowledge retrieval

-- Enable pgvector if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- 1) Corpora: One row per retrieval environment
CREATE TABLE IF NOT EXISTS corpora (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,  -- e.g., 'commons.manuals', 'codebase.repo'
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  embedding_model TEXT DEFAULT 'nomic-embed-text',
  chunk_strategy JSONB DEFAULT '{"max_chars": 1000, "overlap_chars": 150}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) Corpus Documents: One row per source document
CREATE TABLE IF NOT EXISTS corpus_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corpus_id UUID NOT NULL REFERENCES corpora(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('file', 'page', 'note', 'generated')),
  source_uri TEXT NOT NULL,  -- path or canonical ID
  title TEXT NOT NULL,
  content_hash TEXT NOT NULL,  -- SHA256 for change detection
  version INT DEFAULT 1,
  metadata JSONB DEFAULT '{}',  -- tags, category, audience, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(corpus_id, source_uri)
);

-- 3) Corpus Chunks: Actual retrieval units with embeddings
CREATE TABLE IF NOT EXISTS corpus_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES corpus_documents(id) ON DELETE CASCADE,
  corpus_id UUID NOT NULL REFERENCES corpora(id) ON DELETE CASCADE,  -- denormalized for fast filtering
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  tokens_est INT,
  embedding vector(768),  -- nomic-embed-text dimension
  metadata JSONB DEFAULT '{}',  -- section headers, page refs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, chunk_index)
);

-- 4) Corpus Ingestions: Audit trail for pipeline runs
CREATE TABLE IF NOT EXISTS corpus_ingestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corpus_id UUID NOT NULL REFERENCES corpora(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  summary JSONB DEFAULT '{}',  -- docs_added, docs_updated, chunks_inserted, errors
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5) Corpus Retrievals: Track all queries for analytics
CREATE TABLE IF NOT EXISTS corpus_retrievals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  session_id TEXT,
  corpus_slugs TEXT[] NOT NULL,  -- which environments were searched
  query_text TEXT NOT NULL,
  chunks_returned UUID[],
  similarity_scores REAL[],
  latency_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast retrieval
CREATE INDEX IF NOT EXISTS idx_corpus_chunks_corpus_id ON corpus_chunks(corpus_id);
CREATE INDEX IF NOT EXISTS idx_corpus_chunks_document_id ON corpus_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_corpus_chunks_embedding ON corpus_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_corpus_documents_corpus_id ON corpus_documents(corpus_id);
CREATE INDEX IF NOT EXISTS idx_corpus_documents_hash ON corpus_documents(content_hash);
CREATE INDEX IF NOT EXISTS idx_corpus_retrievals_created ON corpus_retrievals(created_at DESC);

-- Seed initial corpus: Community Commons
INSERT INTO corpora (slug, title, description, chunk_strategy)
VALUES (
  'commons.manuals',
  'Community Commons Manuals',
  'User manuals, guides, and documentation for MAIA members',
  '{"max_chars": 1000, "overlap_chars": 150, "split_on": ["## ", "### ", "\n\n"]}'
) ON CONFLICT (slug) DO NOTHING;

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_corpus_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS corpus_updated_at ON corpora;
CREATE TRIGGER corpus_updated_at
  BEFORE UPDATE ON corpora
  FOR EACH ROW EXECUTE FUNCTION update_corpus_updated_at();

DROP TRIGGER IF EXISTS corpus_documents_updated_at ON corpus_documents;
CREATE TRIGGER corpus_documents_updated_at
  BEFORE UPDATE ON corpus_documents
  FOR EACH ROW EXECUTE FUNCTION update_corpus_updated_at();
