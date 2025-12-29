-- Selflet indexes for fast surfacing and boundary queries
-- Phase 2D: Performance optimization

BEGIN;

-- Messages: fast "latest undelivered for user"
-- Note: selflet_messages doesn't have user_id directly, so we join via selflet_nodes
-- Create index on the join path instead
CREATE INDEX IF NOT EXISTS idx_selflet_messages_delivered_created
  ON selflet_messages (delivered_at, created_at DESC);

-- Themes overlap (array operator &&)
CREATE INDEX IF NOT EXISTS gin_selflet_messages_relevance_themes
  ON selflet_messages USING GIN (relevance_themes);

-- Boundaries: fast recent boundaries per user
CREATE INDEX IF NOT EXISTS idx_selflet_boundaries_user_detected
  ON selflet_boundaries (user_id, detected_at DESC);

-- Nodes: fast current selflet lookup (already have idx_selflet_active but let's ensure it)
CREATE INDEX IF NOT EXISTS idx_selflet_nodes_user_active
  ON selflet_nodes (user_id, active_until) WHERE active_until IS NULL;

COMMIT;
