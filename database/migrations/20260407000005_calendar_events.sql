-- Calendar Events — Studio-managed canonical events
-- These are manually created events in the Studio calendar, not sessions or external imports.
-- Designed for future CalDAV/Proton sync (provider + sync_status fields).

CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT false,
  location TEXT,

  -- Provider: where this event is managed
  -- 'studio' = created here, canonical
  -- 'caldav' = synced to/from CalDAV (Proton, Nextcloud, etc.)
  -- 'google' = synced to/from Google Calendar
  calendar_provider TEXT NOT NULL DEFAULT 'studio',

  -- External sync tracking
  external_event_id TEXT,                  -- CalDAV UID or Google event ID
  sync_status TEXT NOT NULL DEFAULT 'local_only',  -- 'local_only', 'synced', 'failed'

  -- Trust/disclosure control (aligns with trust layer architecture)
  -- 'private' = never shared externally
  -- 'generic' = shared as "Busy" or generic label
  -- 'full' = shared with full details
  calendar_disclosure TEXT NOT NULL DEFAULT 'generic',

  -- Soft delete
  deleted_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_calendar_events_member_time
  ON calendar_events(member_id, start_time)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_calendar_events_sync
  ON calendar_events(sync_status)
  WHERE deleted_at IS NULL AND sync_status != 'local_only';
