-- Migration: Selflet embedding dimension (local) 1536 -> 768
-- Created: 2025-12-29
-- Purpose: Align selflet_nodes.essence_embedding with local embedding dim (768)

BEGIN;

-- Drop any existing index that depended on the old column/dim
DROP INDEX IF EXISTS idx_selflet_essence_vector;

-- Recreate the column with the correct dim
ALTER TABLE selflet_nodes
  DROP COLUMN IF EXISTS essence_embedding;

ALTER TABLE selflet_nodes
  ADD COLUMN essence_embedding vector(768);

-- Recreate the index (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_selflet_essence_vector
ON selflet_nodes
USING ivfflat (essence_embedding vector_cosine_ops)
WITH (lists = 100);

COMMIT;
