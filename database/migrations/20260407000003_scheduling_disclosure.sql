-- =============================================================================
-- SCHEDULING DISCLOSURE — Phase 2 Trust Layer
-- Controls what external calendars see when sessions are synced.
-- =============================================================================

-- Disclosure mode enum
DO $$ BEGIN
  CREATE TYPE calendar_disclosure AS ENUM (
    'busy_only',    -- external sees "Busy" only
    'generic',      -- external sees session type, no client name
    'full'          -- external sees full client + service details
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Per-session override (nullable — falls back to practitioner default)
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS calendar_disclosure calendar_disclosure;

COMMENT ON COLUMN sessions.calendar_disclosure IS 'Per-session calendar disclosure override. NULL = use practitioner default from studio_settings.';

-- Practitioner default lives in studio_settings (key-value store).
-- No ALTER TABLE needed — just insert the default row if not present.
-- Key: calendar_disclosure_default, Value: 'generic'
