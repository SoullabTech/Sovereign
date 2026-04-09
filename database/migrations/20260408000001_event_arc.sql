-- Event Arc: multi-day containers with pre/during/post lifecycle
-- A continuity layer around transformation — not a scheduling variant.
-- Separate primitive from services/sessions. Coexists without entanglement.

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  location_type TEXT NOT NULL DEFAULT 'virtual'
    CHECK (location_type IN ('in_person', 'virtual', 'hybrid')),
  location_details TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  capacity INTEGER,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'open', 'closed', 'archived')),
  visibility TEXT NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('public', 'private', 'invite_only')),
  price_cents INTEGER,
  currency TEXT NOT NULL DEFAULT 'usd',
  requires_application BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT events_date_order CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_events_practitioner_id ON events(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);

CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  status TEXT NOT NULL DEFAULT 'registered'
    CHECK (status IN ('invited', 'registered', 'confirmed', 'cancelled', 'active', 'completed')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  application_data JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_event_attendees_event_email
  ON event_attendees(event_id, email);
CREATE INDEX IF NOT EXISTS idx_event_attendees_member_id ON event_attendees(member_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON event_attendees(event_id);

-- Performance: "what event is this member currently in?" lookup
CREATE INDEX IF NOT EXISTS idx_event_attendees_member_active
  ON event_attendees(member_id, status);

CREATE TABLE IF NOT EXISTS event_phase_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  phase TEXT NOT NULL CHECK (phase IN ('pre', 'during', 'post')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_event_phase_states_unique
  ON event_phase_states(event_id, member_id, phase);
