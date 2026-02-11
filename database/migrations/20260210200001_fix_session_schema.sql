-- ============================================================================
-- Fix Session Schema - Align maia_sessions with active_sessions
-- ============================================================================
-- The session_summary_queue references maia_sessions which doesn't exist.
-- This migration creates maia_sessions as the canonical session table for
-- MAIA conversations, replacing the need for separate active_sessions tracking.
--
-- Session ID format: TEXT (e.g., "session_1770727521118")
-- ============================================================================

-- 1. Create maia_sessions table (the canonical session table)
CREATE TABLE IF NOT EXISTS maia_sessions (
  id TEXT PRIMARY KEY,  -- Client-generated: session_<timestamp>
  member_id TEXT,       -- Can be NULL for anonymous/guest sessions
  anon_id TEXT,         -- Anonymous identifier when member_id is null

  -- Session lifecycle
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Privacy & mode
  privacy_mode TEXT NOT NULL DEFAULT 'standard'
    CHECK (privacy_mode IN ('sanctuary', 'standard', 'full')),
  mode TEXT NOT NULL DEFAULT 'continuity'
    CHECK (mode IN ('continuity', 'sanctuary')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'closing', 'completed', 'failed')),

  -- Session metadata
  message_count INTEGER DEFAULT 0,
  maia_mode TEXT DEFAULT 'normal',  -- talk, care, note
  voice_enabled BOOLEAN DEFAULT false,

  -- Summary (populated by worker after session ends)
  summary JSONB,
  themes TEXT[],
  completed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_maia_sessions_member_recent
  ON maia_sessions (member_id, started_at DESC)
  WHERE member_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_maia_sessions_active
  ON maia_sessions (last_activity_at DESC)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_maia_sessions_completed
  ON maia_sessions (member_id, completed_at DESC)
  WHERE status = 'completed' AND summary IS NOT NULL;

-- 3. Migrate existing active_sessions data if the table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'active_sessions') THEN
    INSERT INTO maia_sessions (id, member_id, anon_id, started_at, last_activity_at, created_at)
    SELECT session_id, member_id, anon_id, created_at, last_seen_at, created_at
    FROM active_sessions
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- 4. Update trigger for updated_at
CREATE OR REPLACE FUNCTION fn_maia_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_maia_sessions_updated ON maia_sessions;
CREATE TRIGGER tr_maia_sessions_updated
  BEFORE UPDATE ON maia_sessions
  FOR EACH ROW
  EXECUTE FUNCTION fn_maia_sessions_updated_at();

-- 5. Recreate session_summary_queue with proper FK (if it exists with wrong FK)
-- First check if we need to recreate it
DO $$
BEGIN
  -- Drop and recreate if FK constraint doesn't match
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'session_summary_queue' AND constraint_type = 'FOREIGN KEY'
  ) THEN
    -- Table exists, check if we need to fix it
    DROP TABLE IF EXISTS session_summary_queue CASCADE;
  END IF;

  -- Create/recreate the table
  CREATE TABLE IF NOT EXISTS session_summary_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL UNIQUE REFERENCES maia_sessions(id) ON DELETE CASCADE,
    member_id TEXT,
    mode_used TEXT NOT NULL DEFAULT 'continuity',
    ended_at TIMESTAMPTZ,

    status TEXT NOT NULL DEFAULT 'queued'
      CHECK (status IN ('queued', 'processing', 'done', 'failed')),
    attempts INT NOT NULL DEFAULT 0,
    last_error TEXT,

    queued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    claimed_by TEXT,
    claimed_at TIMESTAMPTZ,
    heartbeat_at TIMESTAMPTZ
  );
END $$;

-- 6. Indexes for queue processing
CREATE INDEX IF NOT EXISTS idx_ssq_queued
  ON session_summary_queue (queued_at ASC)
  WHERE status = 'queued';

CREATE INDEX IF NOT EXISTS idx_ssq_processing
  ON session_summary_queue (claimed_at ASC)
  WHERE status = 'processing';

-- 7. Stale job reaper function
CREATE OR REPLACE FUNCTION fn_requeue_stale_summary_jobs(stale_after INTERVAL)
RETURNS INT AS $$
DECLARE
  requeued INT;
BEGIN
  WITH stale AS (
    UPDATE session_summary_queue
    SET status = 'queued',
        claimed_by = NULL,
        claimed_at = NULL,
        heartbeat_at = NULL,
        started_at = NULL
    WHERE status = 'processing'
      AND claimed_at < NOW() - stale_after
    RETURNING id
  )
  SELECT COUNT(*) INTO requeued FROM stale;
  RETURN requeued;
END;
$$ LANGUAGE plpgsql;

-- 8. Add session_id to member_sessions for linking (if not exists)
-- This allows member_sessions to reference maia_sessions via TEXT session_id
ALTER TABLE member_sessions
  ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Create unique partial index for upsert on session_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_member_sessions_session_id
  ON member_sessions (session_id)
  WHERE session_id IS NOT NULL;
