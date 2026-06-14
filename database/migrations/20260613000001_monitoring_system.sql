CREATE TABLE IF NOT EXISTS monitoring_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('external', 'service', 'database', 'worker')),
  check_url TEXT,
  check_type TEXT NOT NULL CHECK (check_type IN ('http', 'postgres')),
  expected_status INTEGER DEFAULT 200,
  timeout_ms INTEGER DEFAULT 10000,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS monitoring_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES monitoring_services(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('up', 'down', 'degraded')),
  response_ms INTEGER,
  http_status INTEGER,
  error TEXT,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS monitoring_checks_service_time
  ON monitoring_checks (service_id, checked_at DESC);

CREATE TABLE IF NOT EXISTS monitoring_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES monitoring_services(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  downtime_seconds INTEGER,
  error TEXT
);

CREATE INDEX IF NOT EXISTS monitoring_incidents_service_time
  ON monitoring_incidents (service_id, started_at DESC);

INSERT INTO monitoring_services (name, display_name, category, check_url, check_type, sort_order)
VALUES
  ('soullab-public', 'soullab.life (Public)', 'external', 'https://soullab.life/api/health', 'http', 1),
  ('maia-app', 'MAIA App', 'service', 'https://soullab.life/api/health', 'http', 2),
  ('maia-api', 'MAIA API Backend', 'service', 'http://localhost:3001/health', 'http', 3),
  ('maia-database', 'PostgreSQL', 'database', NULL, 'postgres', 4)
ON CONFLICT (name) DO NOTHING;
