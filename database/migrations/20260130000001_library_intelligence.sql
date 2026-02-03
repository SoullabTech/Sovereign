-- Library Intelligence: Behind-the-scenes wisdom archive for MAIA (Jeeves pattern)
-- MAIA remains the only voice; Library provides silent support with provenance

-- =============================================================================
-- LIBRARY SOURCES: One row per ingested document/book/text
-- =============================================================================
CREATE TABLE IF NOT EXISTS library_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source identification
  type TEXT NOT NULL DEFAULT 'txt' CHECK (type IN ('txt', 'book', 'transcript', 'article', 'manual', 'teaching')),
  title TEXT NOT NULL,
  author TEXT,
  file_path TEXT NOT NULL,

  -- Deduplication
  checksum TEXT NOT NULL,  -- SHA256 of file content

  -- Metadata
  meta JSONB DEFAULT '{}'::jsonb,  -- {folder, tags[], date, tradition, lineage, etc.}

  -- Ingestion tracking
  ingestion_status TEXT NOT NULL DEFAULT 'pending' CHECK (ingestion_status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
  ingestion_error TEXT,
  token_count_total INT,
  chunk_count INT,

  -- Consent flag (for user journals - never ingest without explicit consent)
  consent_required BOOLEAN NOT NULL DEFAULT false,
  consent_granted BOOLEAN DEFAULT false,
  consent_granted_at TIMESTAMPTZ,
  consent_granted_by UUID REFERENCES members(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent duplicate ingestion via checksum
CREATE UNIQUE INDEX IF NOT EXISTS idx_library_sources_checksum ON library_sources(checksum);
CREATE INDEX IF NOT EXISTS idx_library_sources_type ON library_sources(type);
CREATE INDEX IF NOT EXISTS idx_library_sources_status ON library_sources(ingestion_status);
CREATE INDEX IF NOT EXISTS idx_library_sources_title ON library_sources(title);
CREATE INDEX IF NOT EXISTS idx_library_sources_author ON library_sources(author);

-- =============================================================================
-- LIBRARY CHUNKS: Searchable units from each source (300-900 tokens each)
-- =============================================================================
CREATE TABLE IF NOT EXISTS library_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES library_sources(id) ON DELETE CASCADE,

  -- Position within source
  chunk_index INT NOT NULL,  -- 0-based position in document

  -- Content
  content TEXT NOT NULL,
  token_count INT NOT NULL,

  -- For semantic search (vector embedding)
  embedding vector(768),  -- Local embedding dimension (matches existing selflet_chain_tables)

  -- Metadata
  meta JSONB DEFAULT '{}'::jsonb,  -- {section_title, page_number, chapter, etc.}

  -- Full-text search support (Phase 1 fallback before embeddings)
  content_tsv tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_library_chunks_source ON library_chunks(source_id);
CREATE INDEX IF NOT EXISTS idx_library_chunks_index ON library_chunks(source_id, chunk_index);
CREATE INDEX IF NOT EXISTS idx_library_chunks_embedding ON library_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_library_chunks_tsv ON library_chunks USING GIN (content_tsv);

-- =============================================================================
-- LIBRARY DISTILLATES: AI-generated summaries and structured wisdom
-- =============================================================================
CREATE TABLE IF NOT EXISTS library_distillates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES library_sources(id) ON DELETE CASCADE,

  -- Distillation level
  level TEXT NOT NULL DEFAULT 'source' CHECK (level IN ('source', 'chapter', 'section', 'theme')),

  -- The distilled wisdom (structured JSON)
  -- Format: {
  --   summary_short: string (1-2 sentences),
  --   summary_long: string (paragraph),
  --   definitions: [{term, meaning, context}],
  --   practices: [{name, description, element, when_to_use}],
  --   warnings: [{condition, contraindication, alternative}],
  --   facet_tags: ['FIRE_1', 'WATER_2', etc.],
  --   archetypes: [{name, description, shadow, integration}],
  --   key_quotes: [{text, location, significance}],
  --   provenance: {source_id, title, author, file_path, chunk_ids_used: []}
  -- }
  payload JSONB NOT NULL,

  -- Distillation metadata
  model_used TEXT,  -- e.g., 'kimi-k2.5', 'claude-opus-4.5'
  distilled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Quality tracking
  quality_score FLOAT,  -- 0-1, assessed by review or automated checks
  reviewed_by UUID REFERENCES members(id),
  reviewed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_library_distillates_source ON library_distillates(source_id);
CREATE INDEX IF NOT EXISTS idx_library_distillates_level ON library_distillates(level);
CREATE INDEX IF NOT EXISTS idx_library_distillates_facets ON library_distillates USING GIN ((payload->'facet_tags'));

-- =============================================================================
-- LIBRARY SEARCH LOG: Track what MAIA consults (for learning and refinement)
-- =============================================================================
CREATE TABLE IF NOT EXISTS library_search_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Context
  member_id UUID REFERENCES members(id),
  session_id UUID,

  -- Query
  query_text TEXT NOT NULL,
  query_type TEXT NOT NULL DEFAULT 'semantic' CHECK (query_type IN ('semantic', 'fulltext', 'hybrid', 'facet')),

  -- Results
  chunks_returned INT,
  distillates_returned INT,
  top_source_ids UUID[],

  -- Usage
  was_used_in_response BOOLEAN DEFAULT false,  -- Did MAIA actually use this in her response?

  -- Timing
  search_duration_ms INT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_library_search_log_member ON library_search_log(member_id);
CREATE INDEX IF NOT EXISTS idx_library_search_log_session ON library_search_log(session_id);
CREATE INDEX IF NOT EXISTS idx_library_search_log_created ON library_search_log(created_at DESC);

-- =============================================================================
-- UPDATE TRIGGERS
-- =============================================================================
CREATE OR REPLACE FUNCTION update_library_sources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS library_sources_updated_at ON library_sources;
CREATE TRIGGER library_sources_updated_at
  BEFORE UPDATE ON library_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_library_sources_updated_at();

CREATE OR REPLACE FUNCTION update_library_distillates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS library_distillates_updated_at ON library_distillates;
CREATE TRIGGER library_distillates_updated_at
  BEFORE UPDATE ON library_distillates
  FOR EACH ROW
  EXECUTE FUNCTION update_library_distillates_updated_at();

-- =============================================================================
-- COMMENTS (for documentation)
-- =============================================================================
COMMENT ON TABLE library_sources IS 'Master index of all ingested wisdom sources (books, texts, teachings)';
COMMENT ON TABLE library_chunks IS 'Searchable chunks from sources, with embeddings for semantic retrieval';
COMMENT ON TABLE library_distillates IS 'AI-distilled summaries, practices, and structured wisdom from sources';
COMMENT ON TABLE library_search_log IS 'Audit log of Library consultations for learning and refinement';

COMMENT ON COLUMN library_sources.consent_required IS 'True for user journals - never ingest without explicit consent';
COMMENT ON COLUMN library_chunks.embedding IS 'Vector embedding for semantic search (768-dim, matches selflet system)';
COMMENT ON COLUMN library_distillates.payload IS 'Structured wisdom JSON: summaries, definitions, practices, warnings, facets, archetypes';
