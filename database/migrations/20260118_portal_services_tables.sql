-- ============================================
-- PORTAL SERVICES & BOOKING TABLES
-- Services, testimonials, sessions, availability
-- ============================================

-- ============== SERVICES ==============

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,

  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  category TEXT,

  -- Pricing & Duration
  duration_minutes INT NOT NULL DEFAULT 60,
  price_cents INT NOT NULL DEFAULT 0,

  -- Display
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INT DEFAULT 0,

  -- What's included
  includes TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_practitioner ON services(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(practitioner_id, is_active);
CREATE INDEX IF NOT EXISTS idx_services_featured ON services(practitioner_id, is_featured);

-- ============== TESTIMONIALS ==============

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,

  -- Client info
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_photo_url TEXT,

  -- Content
  content TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),

  -- Associated service
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,

  -- Status
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_testimonials_practitioner ON testimonials(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(practitioner_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(practitioner_id, is_featured);

-- ============== PRACTITIONER AVAILABILITY ==============

CREATE TABLE IF NOT EXISTS practitioner_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,

  -- Day of week (0=Sunday, 6=Saturday)
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),

  -- Time window
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,

  -- Status
  is_available BOOLEAN NOT NULL DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure end_time > start_time
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_availability_practitioner ON practitioner_availability(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_availability_day ON practitioner_availability(practitioner_id, day_of_week);

-- ============== SESSIONS (BOOKINGS) ==============

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  client_id UUID REFERENCES practitioner_clients(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,

  -- Scheduling
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),

  -- Location
  location_type TEXT DEFAULT 'video'
    CHECK (location_type IN ('video', 'phone', 'in_person', 'async')),
  location_details TEXT,  -- Zoom link, address, etc.

  -- Notes
  notes TEXT,
  practitioner_notes TEXT,

  -- Payment
  price_cents INT,
  payment_status TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'refunded', 'waived')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_practitioner ON sessions(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_sessions_client ON sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled ON sessions(practitioner_id, scheduled_start);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(practitioner_id, status);

-- ============== STELLIUM CLIENTS (ALIAS VIEW) ==============
-- Create a view for stellium_clients that maps to practitioner_clients

CREATE OR REPLACE VIEW stellium_clients AS
SELECT
  id,
  practitioner_id,
  name,
  email,
  birth_data->>'phone' as phone,
  status,
  created_at,
  updated_at
FROM practitioner_clients;

-- ============== ADD MISSING COLUMNS TO PRACTITIONERS ==============

DO $$
BEGIN
  -- Add photo_url if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practitioners' AND column_name = 'photo_url') THEN
    ALTER TABLE practitioners ADD COLUMN photo_url TEXT;
  END IF;

  -- Add specialties if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practitioners' AND column_name = 'specialties') THEN
    ALTER TABLE practitioners ADD COLUMN specialties TEXT[];
  END IF;

  -- Add certifications if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practitioners' AND column_name = 'certifications') THEN
    ALTER TABLE practitioners ADD COLUMN certifications TEXT[];
  END IF;

  -- Add years_experience if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practitioners' AND column_name = 'years_experience') THEN
    ALTER TABLE practitioners ADD COLUMN years_experience INT DEFAULT 0;
  END IF;

  -- Add location if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practitioners' AND column_name = 'location') THEN
    ALTER TABLE practitioners ADD COLUMN location TEXT;
  END IF;

  -- Add long_bio if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practitioners' AND column_name = 'long_bio') THEN
    ALTER TABLE practitioners ADD COLUMN long_bio TEXT;
  END IF;

  -- Add approach if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practitioners' AND column_name = 'approach') THEN
    ALTER TABLE practitioners ADD COLUMN approach TEXT;
  END IF;

  -- Add values if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practitioners' AND column_name = 'values') THEN
    ALTER TABLE practitioners ADD COLUMN values TEXT[];
  END IF;

  -- Add social_links if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practitioners' AND column_name = 'social_links') THEN
    ALTER TABLE practitioners ADD COLUMN social_links JSONB DEFAULT '{}';
  END IF;

  -- Add settings if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practitioners' AND column_name = 'settings') THEN
    ALTER TABLE practitioners ADD COLUMN settings JSONB DEFAULT '{}';
  END IF;
END $$;

-- ============== ADD MISSING COLUMNS TO LEAD_MAGNETS ==============

DO $$
BEGIN
  -- Add long_description if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lead_magnets' AND column_name = 'long_description') THEN
    ALTER TABLE lead_magnets ADD COLUMN long_description TEXT;
  END IF;

  -- Add delivery_type if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lead_magnets' AND column_name = 'delivery_type') THEN
    ALTER TABLE lead_magnets ADD COLUMN delivery_type TEXT DEFAULT 'email';
  END IF;

  -- Add download_url if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lead_magnets' AND column_name = 'download_url') THEN
    ALTER TABLE lead_magnets ADD COLUMN download_url TEXT;
  END IF;

  -- Add thank_you_message if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lead_magnets' AND column_name = 'thank_you_message') THEN
    ALTER TABLE lead_magnets ADD COLUMN thank_you_message TEXT;
  END IF;

  -- Add benefits if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lead_magnets' AND column_name = 'benefits') THEN
    ALTER TABLE lead_magnets ADD COLUMN benefits TEXT[];
  END IF;

  -- Add downloads counter if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lead_magnets' AND column_name = 'downloads') THEN
    ALTER TABLE lead_magnets ADD COLUMN downloads INT DEFAULT 0;
  END IF;

  -- Add is_featured if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lead_magnets' AND column_name = 'is_featured') THEN
    ALTER TABLE lead_magnets ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- ============== LEAD MAGNET CLAIMS ==============

CREATE TABLE IF NOT EXISTS lead_magnet_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_magnet_id UUID NOT NULL REFERENCES lead_magnets(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES marketing_contacts(id) ON DELETE CASCADE,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(lead_magnet_id, contact_id)
);

CREATE INDEX IF NOT EXISTS idx_claims_magnet ON lead_magnet_claims(lead_magnet_id);
CREATE INDEX IF NOT EXISTS idx_claims_contact ON lead_magnet_claims(contact_id);

-- ============== TRIGGERS ==============

CREATE TRIGGER tr_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_practitioner_updated_at();

CREATE TRIGGER tr_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_practitioner_updated_at();

CREATE TRIGGER tr_availability_updated_at
  BEFORE UPDATE ON practitioner_availability
  FOR EACH ROW EXECUTE FUNCTION update_practitioner_updated_at();

-- ============== COMMENTS ==============

COMMENT ON TABLE services IS 'Practitioner service offerings for booking';
COMMENT ON TABLE testimonials IS 'Client testimonials for practitioner portals';
COMMENT ON TABLE sessions IS 'Booked sessions/appointments';
COMMENT ON TABLE practitioner_availability IS 'Weekly availability schedule for booking';
COMMENT ON TABLE lead_magnet_claims IS 'Tracks which contacts claimed which lead magnets';
