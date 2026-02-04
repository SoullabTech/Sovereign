-- Add voice interrupt feature flag (default OFF for beta)
INSERT INTO system_settings (key, value, description)
VALUES
  ('voice_interrupt_enabled', 'false'::jsonb, 'Allow users to interrupt MAIA mid-speech (barge-in). Default OFF for smoother beta experience.')
ON CONFLICT (key) DO NOTHING;
