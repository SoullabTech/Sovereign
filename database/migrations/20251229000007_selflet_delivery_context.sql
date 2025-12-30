-- Phase 2I: store session/turn context for selflet delivery gating
BEGIN;

ALTER TABLE selflet_messages
  ADD COLUMN IF NOT EXISTS delivered_session_id TEXT,
  ADD COLUMN IF NOT EXISTS delivered_turn_id INTEGER;

-- Fast "count delivered this session" per to_selflet_id
CREATE INDEX IF NOT EXISTS idx_selflet_messages_to_session_delivered
  ON selflet_messages (to_selflet_id, delivered_session_id, delivered_at DESC);

-- Fast "last delivered" per to_selflet_id
CREATE INDEX IF NOT EXISTS idx_selflet_messages_to_delivered_at
  ON selflet_messages (to_selflet_id, delivered_at DESC);

COMMIT;
