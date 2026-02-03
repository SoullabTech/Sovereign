-- ============================================================
-- Create conversation_memory_uses table
-- Tracks which memories MAIA used in each response
-- Required before 20260113000004_ain_intelligence_views.sql
-- ============================================================
BEGIN;

CREATE TABLE IF NOT EXISTS conversation_memory_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  message_id TEXT NOT NULL,
  memory_table TEXT NOT NULL,
  memory_id TEXT NOT NULL,
  used_as TEXT NOT NULL,
  retrieval_score NUMERIC,
  semantic_score NUMERIC,
  recency_score NUMERIC,
  confidence_score NUMERIC,
  user_feedback TEXT,
  feedback_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_cmu_user_id ON conversation_memory_uses (user_id);
CREATE INDEX IF NOT EXISTS idx_cmu_session_id ON conversation_memory_uses (session_id);
CREATE INDEX IF NOT EXISTS idx_cmu_created_at ON conversation_memory_uses (created_at);

COMMENT ON TABLE conversation_memory_uses IS 'Tracks which memories MAIA used in each response for debugging, transparency, and analytics';

COMMIT;
