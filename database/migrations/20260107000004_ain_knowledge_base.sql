-- AIN Knowledge Base: Embedded source texts for contextual retrieval
-- Supports mode-aware wisdom injection from 108+ source texts

-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Main knowledge chunks table
CREATE TABLE IF NOT EXISTS ain_knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source tracking
  source_file TEXT NOT NULL,           -- Original filename
  source_title TEXT,                    -- Clean title (extracted)
  chunk_index INTEGER NOT NULL,         -- Position in source

  -- Content
  chunk_text TEXT NOT NULL,             -- The actual text chunk
  chunk_tokens INTEGER,                 -- Estimated token count

  -- Embedding (768 dimensions for nomic-embed-text)
  embedding vector(768),

  -- Categorization for mode-aware retrieval
  categories TEXT[] DEFAULT '{}',       -- e.g., {'cbt', 'somatic', 'jungian'}
  domain TEXT,                          -- Primary domain: therapeutic, divination, philosophy, somatic

  -- Metadata
  author TEXT,
  publication_year INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  embedded_at TIMESTAMPTZ
);

-- Indexes for fast retrieval
CREATE INDEX IF NOT EXISTS idx_ain_knowledge_embedding
  ON ain_knowledge_chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_ain_knowledge_domain
  ON ain_knowledge_chunks(domain);

CREATE INDEX IF NOT EXISTS idx_ain_knowledge_categories
  ON ain_knowledge_chunks USING gin(categories);

CREATE INDEX IF NOT EXISTS idx_ain_knowledge_source
  ON ain_knowledge_chunks(source_file);

-- Knowledge retrieval tracking (what MAIA pulls when)
CREATE TABLE IF NOT EXISTS ain_knowledge_retrievals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  session_mode TEXT,                    -- care, talk, scribe, divination
  query_text TEXT,                      -- What triggered retrieval
  chunks_retrieved UUID[],              -- Which chunks were pulled
  retrieval_scores FLOAT[],             -- Similarity scores
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ain_retrievals_user
  ON ain_knowledge_retrievals(user_id);

CREATE INDEX IF NOT EXISTS idx_ain_retrievals_mode
  ON ain_knowledge_retrievals(session_mode);

-- Helpful view for retrieval stats
CREATE OR REPLACE VIEW ain_retrieval_stats AS
SELECT
  session_mode,
  COUNT(*) as retrieval_count,
  COUNT(DISTINCT user_id) as unique_users,
  DATE_TRUNC('day', created_at) as day
FROM ain_knowledge_retrievals
GROUP BY session_mode, DATE_TRUNC('day', created_at);

COMMENT ON TABLE ain_knowledge_chunks IS 'Embedded knowledge chunks from AIN source texts for contextual retrieval';
COMMENT ON TABLE ain_knowledge_retrievals IS 'Tracks which knowledge MAIA retrieves during conversations';
