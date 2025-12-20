-- Migration: Add session completion and review functionality for Scribe mode
-- Date: 2025-12-17
-- Purpose: Enable post-session summary generation and conversational interrogation

-- Add session status and completion tracking to maia_sessions
ALTER TABLE maia_sessions
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS session_summary JSONB,
  ADD COLUMN IF NOT EXISTS elemental_final_state JSONB,
  ADD COLUMN IF NOT EXISTS cognitive_final_profile JSONB;

-- Add comment explaining status values
COMMENT ON COLUMN maia_sessions.status IS 'Session status: active (in progress), completed (ended with summary), archived (long-term storage)';

-- Create index for completed sessions lookup
CREATE INDEX IF NOT EXISTS idx_maia_sessions_status_completed
  ON maia_sessions(status, completed_at DESC)
  WHERE status = 'completed';

-- Create index for user's completed sessions
CREATE INDEX IF NOT EXISTS idx_maia_sessions_user_completed
  ON maia_sessions(user_id, completed_at DESC)
  WHERE status = 'completed';

-- Add index for faster session summary retrieval
CREATE INDEX IF NOT EXISTS idx_maia_sessions_summary_exists
  ON maia_sessions(id)
  WHERE session_summary IS NOT NULL;
