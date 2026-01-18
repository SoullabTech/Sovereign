-- ============================================
-- STELLIUM PRACTITIONER LAYER
-- Practice management for healers, astrologers, therapists
-- ============================================

-- Practitioner's clients (not members - these are the practitioner's clients)
CREATE TABLE IF NOT EXISTS practitioner_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Basic info
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  preferred_name TEXT,
  pronouns TEXT,

  -- Birth data (for astrology - optional for other modalities)
  birth_date DATE,
  birth_time TIME,
  birth_location TEXT,
  birth_latitude DECIMAL(10, 7),
  birth_longitude DECIMAL(10, 7),
  birth_timezone TEXT,
  has_chart BOOLEAN DEFAULT FALSE,

  -- Intake and notes
  intake_data JSONB DEFAULT '{}',
  private_notes TEXT,
  themes TEXT[],  -- Recurring themes across sessions

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived', 'waitlist')),
  tags TEXT[],

  -- Relationship
  first_session DATE,
  last_session DATE,
  total_sessions INT DEFAULT 0,
  next_session TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for practitioner lookup
CREATE INDEX IF NOT EXISTS idx_practitioner_clients_practitioner
  ON practitioner_clients(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_practitioner_clients_status
  ON practitioner_clients(practitioner_id, status);

-- Practitioner sessions (readings, appointments, ceremonies)
CREATE TABLE IF NOT EXISTS practitioner_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,

  -- Session type (modality-specific)
  session_type TEXT NOT NULL,  -- 'natal_reading', 'transit_reading', 'synastry', 'therapy', 'bodywork', 'coaching', etc.
  modality TEXT,  -- 'astrology', 'therapy', 'bodywork', 'coaching', 'shamanic'

  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  duration_minutes INT DEFAULT 60,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),

  -- Location
  location_type TEXT DEFAULT 'video' CHECK (location_type IN ('video', 'phone', 'in_person', 'async')),
  location_details TEXT,  -- Zoom link, address, etc.

  -- MAIA preparation
  maia_prep JSONB DEFAULT '{}',  -- MAIA's session preparation summary
  prep_generated_at TIMESTAMPTZ,

  -- Practitioner notes
  prep_notes TEXT,  -- Practitioner's own prep notes
  session_notes TEXT,  -- Notes from the session

  -- Follow-up
  follow_up_notes TEXT,
  follow_up_sent BOOLEAN DEFAULT FALSE,
  follow_up_sent_at TIMESTAMPTZ,

  -- Themes and insights (for pattern tracking)
  themes TEXT[],
  insights TEXT[],

  -- Payment
  fee DECIMAL(10, 2),
  paid BOOLEAN DEFAULT FALSE,
  payment_method TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for session lookup
CREATE INDEX IF NOT EXISTS idx_practitioner_sessions_practitioner
  ON practitioner_sessions(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_practitioner_sessions_client
  ON practitioner_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_practitioner_sessions_scheduled
  ON practitioner_sessions(practitioner_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_practitioner_sessions_status
  ON practitioner_sessions(practitioner_id, status);

-- Practitioner MAIA personas (the "ensouled intelligence" layer)
CREATE TABLE IF NOT EXISTS practitioner_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Identity
  persona_name TEXT NOT NULL,  -- 'Loralee', 'Soma', custom name
  modality TEXT NOT NULL,  -- 'astrology', 'bodywork', 'coaching', 'therapy', 'shamanic'

  -- Voice patterns (extracted from training)
  voice_patterns JSONB DEFAULT '{}',
  -- e.g., { "tone": "warm, poetic", "phrases": ["let's explore...", "I sense..."], "avoids": ["you should", "must"] }

  -- Framework (how they read/interpret)
  framework JSONB DEFAULT '{}',
  -- e.g., { "primary": "evolutionary", "secondary": "archetypal", "authors": ["Steven Forrest", "Liz Greene"] }

  -- Boundaries (what MAIA will/won't do)
  boundaries JSONB DEFAULT '{}',
  -- e.g., { "no_predictions": true, "no_diagnosis": true, "escalate_crisis": true }

  -- Knowledge base
  materials_indexed TEXT[],  -- List of uploaded/processed materials
  books_referenced TEXT[],  -- Books MAIA can draw from
  training_transcripts INT DEFAULT 0,  -- Number of spiral sessions processed

  -- Active status
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_trained_at TIMESTAMPTZ
);

-- Index for persona lookup
CREATE INDEX IF NOT EXISTS idx_practitioner_personas_practitioner
  ON practitioner_personas(practitioner_id);

-- Client portal access tokens (for client-facing portal)
CREATE TABLE IF NOT EXISTS client_portal_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Token
  token TEXT NOT NULL UNIQUE,
  token_hash TEXT NOT NULL,  -- For secure lookup

  -- Access control
  permissions JSONB DEFAULT '{"view_chart": true, "view_sessions": true, "view_resources": true, "message": false}',

  -- Expiry
  expires_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_portal_tokens_hash
  ON client_portal_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_client_portal_tokens_client
  ON client_portal_tokens(client_id);

-- Shared resources (documents, files practitioner shares with clients)
CREATE TABLE IF NOT EXISTS practitioner_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Resource info
  name TEXT NOT NULL,
  description TEXT,
  resource_type TEXT CHECK (resource_type IN ('pdf', 'video', 'audio', 'link', 'document', 'image')),
  url TEXT,
  file_path TEXT,

  -- Access control
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'all_clients', 'specific_clients')),
  shared_with UUID[],  -- Array of client_ids if specific_clients

  -- Metadata
  tags TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practitioner_resources_practitioner
  ON practitioner_resources(practitioner_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_stellium_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_practitioner_clients_timestamp ON practitioner_clients;
CREATE TRIGGER update_practitioner_clients_timestamp
  BEFORE UPDATE ON practitioner_clients
  FOR EACH ROW EXECUTE FUNCTION update_stellium_timestamp();

DROP TRIGGER IF EXISTS update_practitioner_sessions_timestamp ON practitioner_sessions;
CREATE TRIGGER update_practitioner_sessions_timestamp
  BEFORE UPDATE ON practitioner_sessions
  FOR EACH ROW EXECUTE FUNCTION update_stellium_timestamp();

DROP TRIGGER IF EXISTS update_practitioner_personas_timestamp ON practitioner_personas;
CREATE TRIGGER update_practitioner_personas_timestamp
  BEFORE UPDATE ON practitioner_personas
  FOR EACH ROW EXECUTE FUNCTION update_stellium_timestamp();

DROP TRIGGER IF EXISTS update_practitioner_resources_timestamp ON practitioner_resources;
CREATE TRIGGER update_practitioner_resources_timestamp
  BEFORE UPDATE ON practitioner_resources
  FOR EACH ROW EXECUTE FUNCTION update_stellium_timestamp();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE practitioner_clients IS 'Clients belonging to a practitioner (not members of the system)';
COMMENT ON TABLE practitioner_sessions IS 'Sessions/readings/appointments between practitioner and client';
COMMENT ON TABLE practitioner_personas IS 'MAIA persona configuration for each practitioner';
COMMENT ON TABLE client_portal_tokens IS 'Access tokens for client-facing portal';
COMMENT ON TABLE practitioner_resources IS 'Documents and resources shared with clients';
