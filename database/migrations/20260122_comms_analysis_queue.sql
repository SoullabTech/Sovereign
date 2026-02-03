-- ============================================
-- COMMS SPINE: MAIA Analysis Queue
--
-- Durable async queue for message analysis.
-- Queue work in DB, process via worker script.
--
-- Why not setTimeout() in route handlers?
-- Node runtime can kill background work mid-flight.
-- "Sometimes works" is worse than "doesn't exist."
-- ============================================

CREATE TABLE IF NOT EXISTS comms_analysis_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL UNIQUE REFERENCES comms_messages(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL REFERENCES comms_threads(id) ON DELETE CASCADE,

  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'done', 'failed')),
  attempts INT NOT NULL DEFAULT 0,
  last_error TEXT,

  queued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);

-- Index for worker to find next job
CREATE INDEX IF NOT EXISTS idx_comms_analysis_queue_status
  ON comms_analysis_queue(status, queued_at);

-- Index for checking if message already queued
CREATE INDEX IF NOT EXISTS idx_comms_analysis_queue_message
  ON comms_analysis_queue(message_id);

-- Comments
COMMENT ON TABLE comms_analysis_queue IS 'Durable queue for async MAIA message analysis';
COMMENT ON COLUMN comms_analysis_queue.status IS 'queued=waiting, processing=claimed by worker, done=complete, failed=error';
COMMENT ON COLUMN comms_analysis_queue.attempts IS 'Number of processing attempts (for retry logic)';


-- ============================================
-- AUTO-ENQUEUE TRIGGER
-- When a message is created, queue it for analysis
-- ============================================

CREATE OR REPLACE FUNCTION enqueue_comms_analysis()
RETURNS TRIGGER AS $$
BEGIN
  -- Only analyze inbound client messages
  -- (practitioners don't need safety analysis on their own replies)
  IF NEW.sender_type = 'client' THEN
    INSERT INTO comms_analysis_queue (message_id, thread_id)
    VALUES (NEW.id, NEW.thread_id)
    ON CONFLICT (message_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enqueue_comms_analysis ON comms_messages;

CREATE TRIGGER trg_enqueue_comms_analysis
  AFTER INSERT ON comms_messages
  FOR EACH ROW
  EXECUTE FUNCTION enqueue_comms_analysis();

COMMENT ON FUNCTION enqueue_comms_analysis IS 'Auto-queue client messages for MAIA analysis';


-- ============================================
-- HELPER: Reset failed jobs for retry
-- ============================================

CREATE OR REPLACE FUNCTION reset_failed_analysis_jobs(max_attempts INT DEFAULT 3)
RETURNS INT AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE comms_analysis_queue
  SET status = 'queued',
      started_at = NULL,
      finished_at = NULL
  WHERE status = 'failed'
    AND attempts < max_attempts;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION reset_failed_analysis_jobs IS 'Reset failed jobs for retry (up to max_attempts)';


-- ============================================
-- HELPER: Clean up old completed jobs
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_old_analysis_jobs(days_old INT DEFAULT 7)
RETURNS INT AS $$
DECLARE
  v_count INT;
BEGIN
  DELETE FROM comms_analysis_queue
  WHERE status = 'done'
    AND finished_at < NOW() - (days_old || ' days')::INTERVAL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_analysis_jobs IS 'Delete completed jobs older than N days';


-- ============================================
-- VIEW: Queue status dashboard
-- ============================================

CREATE OR REPLACE VIEW v_comms_analysis_queue_status AS
SELECT
  status,
  COUNT(*) as count,
  MIN(queued_at) as oldest_queued,
  MAX(queued_at) as newest_queued,
  AVG(EXTRACT(EPOCH FROM (finished_at - started_at)))::NUMERIC(10,2) as avg_processing_seconds
FROM comms_analysis_queue
GROUP BY status;

COMMENT ON VIEW v_comms_analysis_queue_status IS 'Dashboard view of queue status by state';


-- ============================================
-- END OF MIGRATION
-- ============================================
