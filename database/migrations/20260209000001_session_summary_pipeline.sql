-- ============================================================================
-- Session Summary Pipeline
-- ============================================================================
-- Adds summary infrastructure to maia_sessions and creates the
-- session_summary_queue for async background processing.
--
-- Sovereignty invariant: Sanctuary sessions are NEVER summarized.
-- The queue enforces this at the application layer; the schema
-- stores the mode so it can be verified at every step.
-- ============================================================================

-- 1. Extend maia_sessions with summary + mode columns
ALTER TABLE maia_sessions
  ADD COLUMN IF NOT EXISTS member_id TEXT,
  ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'continuity'
    CHECK (mode IN ('continuity', 'sanctuary')),
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'closing', 'completed', 'failed')),
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS summary JSONB,
  ADD COLUMN IF NOT EXISTS themes TEXT[];

-- Index for member lookups (recent sessions)
CREATE INDEX IF NOT EXISTS idx_maia_sessions_member_recent
  ON maia_sessions (member_id, created_at DESC)
  WHERE member_id IS NOT NULL;

-- Index for completed sessions with summaries
CREATE INDEX IF NOT EXISTS idx_maia_sessions_completed
  ON maia_sessions (member_id, completed_at DESC)
  WHERE status = 'completed' AND summary IS NOT NULL;

-- 2. Session Summary Queue
CREATE TABLE IF NOT EXISTS session_summary_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE REFERENCES maia_sessions(id) ON DELETE CASCADE,
  member_id TEXT,

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

-- Fast worker polling: grab oldest queued job
CREATE INDEX IF NOT EXISTS idx_ssq_queued
  ON session_summary_queue (queued_at ASC)
  WHERE status = 'queued';

-- Stale job detection
CREATE INDEX IF NOT EXISTS idx_ssq_processing
  ON session_summary_queue (claimed_at ASC)
  WHERE status = 'processing';

-- 3. Stale job reaper function (mirrors comms pattern)
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
