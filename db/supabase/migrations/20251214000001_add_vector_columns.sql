-- Add vector embedding columns to Memory Palace tables
-- Now that pgvector is installed, we can add semantic search capabilities

-- Add vector columns to episodic_memories for multi-modal memory search
ALTER TABLE episodic_memories
  ADD COLUMN IF NOT EXISTS semantic_vector VECTOR(768),
  ADD COLUMN IF NOT EXISTS emotional_vector VECTOR(768),
  ADD COLUMN IF NOT EXISTS somatic_vector VECTOR(768);

-- Create indexes for vector similarity search
CREATE INDEX IF NOT EXISTS idx_episodic_semantic_vector
  ON episodic_memories USING ivfflat (semantic_vector vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_episodic_emotional_vector
  ON episodic_memories USING ivfflat (emotional_vector vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_episodic_somatic_vector
  ON episodic_memories USING ivfflat (somatic_vector vector_cosine_ops)
  WITH (lists = 100);

-- Add vector columns to user_relationship_context for relationship pattern matching
ALTER TABLE user_relationship_context
  ADD COLUMN IF NOT EXISTS relationship_embedding VECTOR(1536),
  ADD COLUMN IF NOT EXISTS personality_embedding VECTOR(1536);

-- Create indexes for relationship vector search
CREATE INDEX IF NOT EXISTS idx_relationship_embedding
  ON user_relationship_context USING ivfflat (relationship_embedding vector_cosine_ops)
  WITH (lists = 50);

CREATE INDEX IF NOT EXISTS idx_personality_embedding
  ON user_relationship_context USING ivfflat (personality_embedding vector_cosine_ops)
  WITH (lists = 50);

-- Comment the additions
COMMENT ON COLUMN episodic_memories.semantic_vector IS 'Semantic embedding for conceptual/meaning-based memory retrieval';
COMMENT ON COLUMN episodic_memories.emotional_vector IS 'Emotional signature embedding for affect-based memory retrieval';
COMMENT ON COLUMN episodic_memories.somatic_vector IS 'Somatic/body-based embedding for embodied memory retrieval';
COMMENT ON COLUMN user_relationship_context.relationship_embedding IS 'Embedding of relational patterns and dynamics';
COMMENT ON COLUMN user_relationship_context.personality_embedding IS 'Embedding of consciousness profile and personality traits';
