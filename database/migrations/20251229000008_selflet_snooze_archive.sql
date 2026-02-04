-- Phase 2J: Snooze/Archive columns for selflet messages
-- Allows member agency over surfaced past-self messages

ALTER TABLE selflet_messages
  ADD COLUMN IF NOT EXISTS snoozed_until timestamptz,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_reason text;

-- Helpful index for pending lookup (undelivered + not archived + not snoozed)
CREATE INDEX IF NOT EXISTS idx_selflet_messages_pending
  ON selflet_messages (from_selflet_id, created_at)
  WHERE delivered_at IS NULL AND archived_at IS NULL;
