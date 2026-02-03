-- Reflection Capsules (Conversation Encapsulation)
-- MAIA Sovereign - Phase 1 MVP
-- Date: 2026-01-22
--
-- Philosophy: MAIA does not store experience as the primary object.
-- MAIA witnesses experience and remembers what mattered.
-- Capsules are distilled artifacts that capture the spirit of a conversation.

-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- TABLE: reflection_capsules
-- ============================================================================
-- A Capsule is a distilled artifact from chat/voice/text. It contains summary,
-- gold line(s), practices, decisions, next steps, patterns, and optional
-- elemental signals. The raw source is secondary and collapsible.

CREATE TABLE IF NOT EXISTS reflection_capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership (scoped to user)
  user_id TEXT NOT NULL,

  -- Source tracking
  source_type TEXT NOT NULL,              -- 'chat' | 'voice' | 'transcript' | 'note' | 'journal'
  source_id TEXT,                         -- Optional reference to source (e.g., session_id)

  -- Core content
  title TEXT NOT NULL DEFAULT 'Untitled',
  summary TEXT NOT NULL,                  -- The "spirit" - 2-5 lines distilled essence

  -- Structured insights (JSONB arrays)
  gold_lines JSONB NOT NULL DEFAULT '[]', -- Array of verbatim quotes that landed
  decisions JSONB NOT NULL DEFAULT '[]',  -- Array of { text: string }
  next_steps JSONB NOT NULL DEFAULT '[]', -- Array of { text: string, due?: string }
  practices JSONB NOT NULL DEFAULT '[]',  -- Array of { name: string, steps: string[] }
  patterns JSONB NOT NULL DEFAULT '[]',   -- Array of { name: string, description?: string }

  -- Elemental/consciousness signals (optional)
  signals JSONB,                          -- { element?, facet?, tone?, archetype?, intensity? }

  -- Organization
  tags JSONB NOT NULL DEFAULT '[]',       -- Array of strings

  -- Source context (collapsed, not primary)
  source_excerpt TEXT,                    -- Short excerpt/window from original, collapsible

  -- State management
  draft BOOLEAN NOT NULL DEFAULT true,    -- Drafts are captured but not yet "brought into the Lab"
  pinned BOOLEAN NOT NULL DEFAULT false,  -- Quick access
  archived BOOLEAN NOT NULL DEFAULT false,-- Hidden from main feed

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Primary query pattern: user's capsules by recency
CREATE INDEX IF NOT EXISTS idx_capsules_user_created
  ON reflection_capsules (user_id, created_at DESC);

-- Filter by archived status
CREATE INDEX IF NOT EXISTS idx_capsules_user_archived
  ON reflection_capsules (user_id, archived);

-- Filter by draft status (for "Bring into Lab" flow)
CREATE INDEX IF NOT EXISTS idx_capsules_user_draft
  ON reflection_capsules (user_id, draft);

-- Filter by pinned (quick access)
CREATE INDEX IF NOT EXISTS idx_capsules_user_pinned
  ON reflection_capsules (user_id, pinned)
  WHERE pinned = true;

-- GIN index for JSONB tag searches
CREATE INDEX IF NOT EXISTS idx_capsules_tags_gin
  ON reflection_capsules USING GIN (tags);

-- ============================================================================
-- TRIGGER: Auto-update updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_capsules_updated_at ON reflection_capsules;

CREATE TRIGGER trg_capsules_updated_at
BEFORE UPDATE ON reflection_capsules
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS (for documentation)
-- ============================================================================

COMMENT ON TABLE reflection_capsules IS 'Distilled artifacts from conversations - captures spirit, not raw history';
COMMENT ON COLUMN reflection_capsules.summary IS 'The essence of what mattered - 2-5 lines distilled by MAIA';
COMMENT ON COLUMN reflection_capsules.gold_lines IS 'Verbatim quotes that landed - moments of clarity or breakthrough';
COMMENT ON COLUMN reflection_capsules.draft IS 'true = captured but not yet reviewed; false = brought into the Lab';
COMMENT ON COLUMN reflection_capsules.source_excerpt IS 'Collapsed source window - secondary to the distilled content';
