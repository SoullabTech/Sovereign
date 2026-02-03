-- Migration: Bardic episode embeddings table
-- Created: 2025-12-30
-- Purpose: Postgres-native storage for episode vector embeddings (replacing Supabase)

BEGIN;

-- Ensure pgvector is enabled (should already be from 0000_enable_pgvector.sql)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the bardic episode embeddings table
CREATE TABLE IF NOT EXISTS bardic_episode_embeddings (
  episode_id        TEXT PRIMARY KEY,
  model             TEXT NOT NULL DEFAULT 'text-embedding-ada-002',
  embedding         VECTOR(1536) NOT NULL,
  similarity_hash   TEXT,
  content_hash      TEXT,
  metadata          JSONB NOT NULL DEFAULT '{}'::jsonb,
  decay_rate        REAL NOT NULL DEFAULT 0.0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- HNSW index for fast approximate nearest neighbor search (cosine distance)
CREATE INDEX IF NOT EXISTS bardic_episode_embeddings_hnsw_cosine
  ON bardic_episode_embeddings
  USING hnsw (embedding vector_cosine_ops);

-- Index on similarity_hash for fast exact matching
CREATE INDEX IF NOT EXISTS bardic_episode_embeddings_similarity_hash
  ON bardic_episode_embeddings (similarity_hash)
  WHERE similarity_hash IS NOT NULL;

-- Trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_bardic_embeddings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bardic_embeddings_updated_at ON bardic_episode_embeddings;
CREATE TRIGGER bardic_embeddings_updated_at
  BEFORE UPDATE ON bardic_episode_embeddings
  FOR EACH ROW
  EXECUTE FUNCTION update_bardic_embeddings_updated_at();

COMMIT;
