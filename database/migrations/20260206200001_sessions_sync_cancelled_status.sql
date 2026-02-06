-- Add 'cancelled' to calendar_sync_status CHECK constraint
-- Needed for when sessions are cancelled and removed from Google Calendar

DO $$
BEGIN
  -- Drop the old constraint and add a new one with 'cancelled' included
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name LIKE '%calendar_sync_status%'
  ) THEN
    -- Find and drop the constraint by checking pg_constraint
    EXECUTE (
      SELECT 'ALTER TABLE sessions DROP CONSTRAINT ' || conname
      FROM pg_constraint
      WHERE conrelid = 'sessions'::regclass
        AND contype = 'c'
        AND pg_get_constraintdef(oid) LIKE '%calendar_sync_status%'
      LIMIT 1
    );
  END IF;

  -- Add the updated constraint
  ALTER TABLE sessions ADD CONSTRAINT sessions_calendar_sync_status_check
    CHECK (calendar_sync_status IN ('pending', 'synced', 'failed', 'not_connected', 'cancelled'));

EXCEPTION WHEN OTHERS THEN
  -- Constraint might already be correct or column might not exist yet
  RAISE NOTICE 'calendar_sync_status constraint update: %', SQLERRM;
END $$;
