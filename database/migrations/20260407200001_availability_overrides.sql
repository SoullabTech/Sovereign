-- Availability Overrides
-- Date-specific availability exceptions (blocked days, extra hours)
-- Complements practitioner_availability (weekly recurring windows)

CREATE TABLE IF NOT EXISTS availability_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  override_date DATE NOT NULL,
  is_blocked BOOLEAN NOT NULL DEFAULT true,    -- true = unavailable, false = extra availability
  start_time TIME,                             -- NULL if whole day blocked
  end_time TIME,                               -- NULL if whole day blocked
  reason TEXT,                                 -- "Holiday", "Conference", etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(practitioner_id, override_date, start_time)
);

CREATE INDEX IF NOT EXISTS idx_availability_overrides_lookup
  ON availability_overrides(practitioner_id, override_date);
