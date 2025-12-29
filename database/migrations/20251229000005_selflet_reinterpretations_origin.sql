-- Add origin column for idempotent reinterpretation writes
-- Allows 'auto_delivery' vs 'manual' distinction

BEGIN;

ALTER TABLE selflet_reinterpretations
  ADD COLUMN IF NOT EXISTS origin TEXT NOT NULL DEFAULT 'auto_delivery';

-- Make auto-delivery idempotent per message
CREATE UNIQUE INDEX IF NOT EXISTS ux_selflet_reinterpretations_msg_origin
  ON selflet_reinterpretations (source_message_id, origin);

COMMIT;
