-- Migration: Conversation Turns Table
-- Created: 2025-12-28
-- Purpose: Store conversation turns for session recall

BEGIN;

CREATE TABLE IF NOT EXISTS conversation_turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  session_id TEXT,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast user lookup (most recent first)
CREATE INDEX IF NOT EXISTS idx_conversation_turns_user_recent
  ON conversation_turns(user_id, created_at DESC);

-- Index for session lookup
CREATE INDEX IF NOT EXISTS idx_conversation_turns_session
  ON conversation_turns(session_id) WHERE session_id IS NOT NULL;

COMMENT ON TABLE conversation_turns IS
'Stores conversation turns for cross-session recall. Enables MAIA to remember recent exchanges.';

COMMIT;

DO $$
BEGIN
  RAISE NOTICE 'Migration 015: conversation_turns table created successfully';
END $$;
