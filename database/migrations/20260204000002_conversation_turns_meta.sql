-- Migration: Add meta column to conversation_turns
-- Created: 2026-02-04
-- Purpose: Store metadata for translations, citations, and other turn types

BEGIN;

-- Add JSONB meta column for storing turn metadata
ALTER TABLE conversation_turns
  ADD COLUMN IF NOT EXISTS meta JSONB DEFAULT '{}'::jsonb;

-- Add parent_message_id for translation threading
ALTER TABLE conversation_turns
  ADD COLUMN IF NOT EXISTS parent_turn_id UUID REFERENCES conversation_turns(id);

-- Index for finding child turns (translations, etc.)
CREATE INDEX IF NOT EXISTS idx_conversation_turns_parent
  ON conversation_turns(parent_turn_id) WHERE parent_turn_id IS NOT NULL;

-- Index for filtering by turn kind (translation, normal, etc.)
CREATE INDEX IF NOT EXISTS idx_conversation_turns_kind
  ON conversation_turns((meta->>'kind')) WHERE meta->>'kind' IS NOT NULL;

COMMENT ON COLUMN conversation_turns.meta IS
'JSONB metadata for turn type (kind: translation|normal), toSystem, fromSystem, lens, style, etc.';

COMMENT ON COLUMN conversation_turns.parent_turn_id IS
'Links translation turns to their parent message for nested display';

COMMIT;

DO $$
BEGIN
  RAISE NOTICE 'Migration 20260204000002: conversation_turns meta columns added successfully';
END $$;
