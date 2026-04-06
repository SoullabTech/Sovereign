-- Add sync tracking columns to calendar_events
-- Provides operational visibility for CalDAV/Proton sync status

ALTER TABLE calendar_events
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_sync_error TEXT;
