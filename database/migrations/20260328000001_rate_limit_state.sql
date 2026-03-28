-- Phase 1 hardening: Persistent rate limiting
-- Replaces in-memory Map that is lost on container restart
--
-- Uses atomic INSERT ... ON CONFLICT for lock-free concurrent updates.
-- Rows auto-expire via periodic cleanup (not a cron — inline on every Nth check).

CREATE TABLE IF NOT EXISTS rate_limit_state (
  key TEXT PRIMARY KEY,
  window_start BIGINT NOT NULL,
  count INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for cleanup queries (prune rows older than 2h)
CREATE INDEX IF NOT EXISTS idx_rate_limit_state_updated ON rate_limit_state(updated_at);
