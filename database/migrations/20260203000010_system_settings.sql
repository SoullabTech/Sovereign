-- System-wide settings for admin control
-- Simple key-value store for feature flags and config

CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT 'null'::jsonb,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT -- admin who last changed it
);

-- Insert default settings
INSERT INTO system_settings (key, value, description)
VALUES
  ('limits_disabled', 'false'::jsonb, 'When true, all usage limits are bypassed (for testing)'),
  ('maintenance_mode', '{"enabled": false, "message": "MAIA is taking a brief pause. Back soon."}'::jsonb, 'Block new sessions while allowing existing ones to finish'),
  ('global_banner', '{"enabled": false, "text": "", "level": "info", "dismissible": true}'::jsonb, 'Show announcement banner to all users'),
  ('voice_enabled', 'true'::jsonb, 'Enable/disable voice features globally'),
  ('memory_write_enabled', 'true'::jsonb, 'Enable/disable memory writes (read-only mode when false)'),
  ('journal_enabled', 'true'::jsonb, 'Enable/disable journal saving')
ON CONFLICT (key) DO NOTHING;

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
