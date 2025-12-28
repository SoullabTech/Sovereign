-- 017_add_req_id_to_cognitive_turn_events.sql
-- Add req_id for correlation with [Audit:*] logs
-- Created: December 28, 2025

ALTER TABLE cognitive_turn_events
  ADD COLUMN IF NOT EXISTS req_id TEXT;

CREATE INDEX IF NOT EXISTS idx_cognitive_turn_events_req_id
  ON cognitive_turn_events (req_id);
