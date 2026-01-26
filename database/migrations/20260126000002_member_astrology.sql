-- Member Astrology Tables
-- Birth data + computed charts + cache

-- Birth data (single source of truth)
CREATE TABLE IF NOT EXISTS member_birth_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  birth_date DATE NOT NULL,
  birth_time TIME, -- nullable if unknown
  birth_location_name TEXT NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  timezone TEXT NOT NULL,
  house_system TEXT DEFAULT 'placidus',
  consent_astrology BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id)
);

-- Computed natal charts (cached)
CREATE TABLE IF NOT EXISTS member_natal_chart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  house_system TEXT DEFAULT 'placidus',
  chart_json JSONB NOT NULL,
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, house_system)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_birth_data_member ON member_birth_data(member_id);
CREATE INDEX IF NOT EXISTS idx_natal_chart_member ON member_natal_chart(member_id);
