-- ============================================
-- BOOKING ENHANCEMENTS
-- Availability overrides, service booking fields, min notice
-- ============================================

-- Availability date overrides (unavailable days, custom hours)
CREATE TABLE IF NOT EXISTS availability_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  override_date DATE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT false,
  start_time TIME,        -- NULL if unavailable
  end_time TIME,          -- NULL if unavailable
  reason TEXT,            -- "Holiday", "Conference", etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(practitioner_id, override_date)
);

CREATE INDEX IF NOT EXISTS idx_overrides_practitioner_date
  ON availability_overrides(practitioner_id, override_date);

-- Service booking fields
ALTER TABLE services ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_bookable BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE services ADD COLUMN IF NOT EXISTS confirmation_instructions TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_services_slug
  ON services(practitioner_id, slug)
  WHERE slug IS NOT NULL;

-- Min notice (hours before a slot can be booked)
ALTER TABLE practitioner_settings
  ADD COLUMN IF NOT EXISTS min_notice_hours INT NOT NULL DEFAULT 2;

-- Booking source tracking on sessions
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS booking_source TEXT DEFAULT 'portal'
    CHECK (booking_source IS NULL OR booking_source IN ('portal', 'studio', 'manual'));

-- Service snapshot (frozen record of what was booked)
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS service_snapshot JSONB;

COMMENT ON TABLE availability_overrides IS 'Date-specific availability overrides (holidays, custom hours, blocked days)';
COMMENT ON COLUMN services.slug IS 'URL-safe slug for direct booking links (/portal/kelly/book/clarity-session)';
COMMENT ON COLUMN services.is_bookable IS 'Whether this service appears on the public booking page';
COMMENT ON COLUMN services.confirmation_instructions IS 'Instructions shown to client after booking this service';
COMMENT ON COLUMN practitioner_settings.min_notice_hours IS 'Minimum hours of notice required before a slot can be booked';
COMMENT ON COLUMN sessions.booking_source IS 'Where the booking originated: portal (public), studio (practitioner), manual';
COMMENT ON COLUMN sessions.service_snapshot IS 'Frozen copy of service details at time of booking';
