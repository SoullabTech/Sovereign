ALTER TABLE monitoring_services DROP CONSTRAINT IF EXISTS monitoring_services_check_type_check;
ALTER TABLE monitoring_services ADD CONSTRAINT monitoring_services_check_type_check
  CHECK (check_type IN ('http', 'postgres', 'ollama'));

INSERT INTO monitoring_services (name, display_name, category, check_url, check_type, sort_order)
VALUES
  ('maia-voice', 'Voice / Whisper', 'worker', 'https://soullab.life/api/voice/health', 'http', 5),
  ('maia-ollama', 'Ollama (Local AI)', 'worker', NULL, 'ollama', 6)
ON CONFLICT (name) DO NOTHING;
