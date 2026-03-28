-- Phase 1.5: Alert state persistence for health monitoring
-- Tracks consecutive failures, suppresses duplicate alerts, records recovery.

CREATE TABLE IF NOT EXISTS alert_state (
  alert_key TEXT PRIMARY KEY,
  severity TEXT NOT NULL DEFAULT 'ok',         -- ok | warning | critical
  consecutive_breaches INT NOT NULL DEFAULT 0,
  last_alerted_at TIMESTAMPTZ,
  last_recovered_at TIMESTAMPTZ,
  suppressed_count INT NOT NULL DEFAULT 0,     -- how many alerts suppressed by cooldown
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
