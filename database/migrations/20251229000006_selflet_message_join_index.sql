-- Optimize join query for pending messages via from_selflet_id

BEGIN;

CREATE INDEX IF NOT EXISTS idx_selflet_messages_from_delivered_created
  ON selflet_messages (from_selflet_id, delivered_at, created_at DESC);

COMMIT;
