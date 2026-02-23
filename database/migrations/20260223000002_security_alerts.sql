-- Migration: Security alerts table
-- Purpose: Persist triggered security alerts for history, deduplication (cooldown),
--          and display in the admin security monitor.

CREATE TABLE IF NOT EXISTS security_alerts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  severity     VARCHAR(10)  NOT NULL CHECK (severity IN ('CRITICAL', 'WARNING', 'INFO')),
  alert_type   VARCHAR(50)  NOT NULL, -- brute_force | auth_spike | session_revoke_spike | env_missing
  title        TEXT         NOT NULL,
  message      TEXT         NOT NULL,
  metadata     JSONB        NOT NULL DEFAULT '{}',
  notified     BOOLEAN      NOT NULL DEFAULT FALSE,  -- true once email sent
  acknowledged BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_alerts_created  ON security_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_type     ON security_alerts(alert_type, created_at DESC);

COMMENT ON TABLE security_alerts IS 'Triggered security alerts for admin monitoring and email dispatch';
COMMENT ON COLUMN security_alerts.notified IS 'TRUE once an email has been sent for this alert';
COMMENT ON COLUMN security_alerts.metadata IS 'Supporting data: ip counts, thresholds, etc.';
