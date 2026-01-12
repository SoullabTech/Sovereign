-- Migration: Platform Feedback Table
-- Created: 2026-01-12
-- Purpose: Store general user feedback about the platform

BEGIN;

CREATE TABLE IF NOT EXISTS platform_feedback (
  id BIGSERIAL PRIMARY KEY,

  -- Feedback content
  category TEXT NOT NULL CHECK (category IN ('problem', 'challenge', 'strength', 'feature', 'question')),
  message TEXT NOT NULL,

  -- User context
  user_id TEXT,
  user_name TEXT,

  -- Technical context
  user_agent TEXT,
  url TEXT,

  -- Metadata
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'addressed', 'archived')),
  notes TEXT,  -- Internal notes from team
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_platform_feedback_category ON platform_feedback(category);
CREATE INDEX IF NOT EXISTS idx_platform_feedback_status ON platform_feedback(status);
CREATE INDEX IF NOT EXISTS idx_platform_feedback_created_at ON platform_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_feedback_user_id ON platform_feedback(user_id) WHERE user_id IS NOT NULL;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_platform_feedback_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER platform_feedback_updated_at
  BEFORE UPDATE ON platform_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_feedback_timestamp();

COMMIT;

DO $$
BEGIN
  RAISE NOTICE 'Migration 20260112000004: platform_feedback table created successfully';
END $$;
