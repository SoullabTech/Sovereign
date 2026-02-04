-- Add Google Calendar sync columns to sessions table
-- DB is canon, Google Calendar is execution

-- Add calendar sync columns if they don't exist
DO $$
BEGIN
  -- Google event ID
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'google_event_id') THEN
    ALTER TABLE sessions ADD COLUMN google_event_id TEXT;
  END IF;

  -- Google calendar ID (default 'primary')
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'google_calendar_id') THEN
    ALTER TABLE sessions ADD COLUMN google_calendar_id TEXT DEFAULT 'primary';
  END IF;

  -- Sync status: pending, synced, failed, not_connected
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'calendar_sync_status') THEN
    ALTER TABLE sessions ADD COLUMN calendar_sync_status TEXT DEFAULT 'pending'
      CHECK (calendar_sync_status IN ('pending', 'synced', 'failed', 'not_connected'));
  END IF;

  -- Sync error message
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'calendar_sync_error') THEN
    ALTER TABLE sessions ADD COLUMN calendar_sync_error TEXT;
  END IF;
END $$;

-- Index for finding unsynced bookings
CREATE INDEX IF NOT EXISTS idx_sessions_calendar_sync ON sessions(calendar_sync_status) WHERE calendar_sync_status = 'pending';

COMMENT ON COLUMN sessions.google_event_id IS 'Google Calendar event ID if synced';
COMMENT ON COLUMN sessions.calendar_sync_status IS 'Calendar sync status: pending, synced, failed, not_connected';
