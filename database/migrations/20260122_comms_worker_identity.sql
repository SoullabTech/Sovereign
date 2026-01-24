-- ============================================
-- COMMS WORKER IDENTITY TRACKING
-- Enables debugging and multi-worker safety
-- ============================================

BEGIN;

ALTER TABLE comms_analysis_queue
  ADD COLUMN IF NOT EXISTS claimed_by TEXT,
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS heartbeat_at TIMESTAMPTZ;

COMMENT ON COLUMN comms_analysis_queue.claimed_by IS 'Worker identity (hostname:pid) that claimed this job';
COMMENT ON COLUMN comms_analysis_queue.claimed_at IS 'When the job was first claimed (preserved across retries)';
COMMENT ON COLUMN comms_analysis_queue.heartbeat_at IS 'Last heartbeat from processing worker (for stale detection)';

CREATE INDEX IF NOT EXISTS idx_comms_analysis_queue_claimed_by
  ON comms_analysis_queue (claimed_by);

CREATE INDEX IF NOT EXISTS idx_comms_analysis_queue_stale
  ON comms_analysis_queue (status, heartbeat_at)
  WHERE status = 'processing';

COMMIT;
