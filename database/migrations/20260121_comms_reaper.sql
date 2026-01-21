-- ============================================
-- COMMS STALE JOB REAPER
-- Auto-requeue jobs stuck in processing
-- ============================================

BEGIN;

-- Requeue jobs stuck in processing past a threshold (default 5 minutes)
CREATE OR REPLACE FUNCTION fn_requeue_stale_comms_jobs(p_stale_after INTERVAL DEFAULT INTERVAL '5 minutes')
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_requeued INTEGER := 0;
BEGIN
  UPDATE comms_analysis_queue
  SET status = 'queued',
      started_at = NULL,
      finished_at = NULL,
      heartbeat_at = NULL,
      claimed_by = NULL,
      claimed_at = NULL
  WHERE status = 'processing'
    AND COALESCE(heartbeat_at, started_at, queued_at) < NOW() - p_stale_after;

  GET DIAGNOSTICS v_requeued = ROW_COUNT;
  RETURN v_requeued;
END;
$$;

COMMENT ON FUNCTION fn_requeue_stale_comms_jobs IS
'Requeues comms_analysis_queue jobs stuck in processing beyond a threshold. Clears claim + timing fields.';

COMMIT;
