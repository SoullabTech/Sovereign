-- Symbolic Telemetry Attribution — Phase 23
-- Adds route, mode, and request_id to symbolic_telemetry_events.
--
-- Purpose: enable calibration queries segmented by:
--   - route: which oracle path produced the events
--   - mode: element/mode active during the call (fire/water/earth/air/aether)
--   - request_id: tie all items in a single oracle call together
--
-- Design: nullable — existing rows retain NULL, new rows carry attribution.
-- Indexes added for the two most common filter patterns.

ALTER TABLE symbolic_telemetry_events
  ADD COLUMN IF NOT EXISTS route      TEXT,
  ADD COLUMN IF NOT EXISTS mode       TEXT,
  ADD COLUMN IF NOT EXISTS request_id TEXT;

COMMENT ON COLUMN symbolic_telemetry_events.route IS
  'Oracle route identifier (e.g. oracle/conversation). Allows cross-route calibration.';

COMMENT ON COLUMN symbolic_telemetry_events.mode IS
  'Active element/mode during the call (fire|water|earth|air|aether). Null = unknown.';

COMMENT ON COLUMN symbolic_telemetry_events.request_id IS
  'UUID per oracle POST call. Groups all items from the same request together.';

-- Route breakdown queries
CREATE INDEX IF NOT EXISTS idx_syte_route
  ON symbolic_telemetry_events (route, created_at DESC)
  WHERE route IS NOT NULL;

-- Mode breakdown queries (most useful for Care vs Talk vs Note analysis)
CREATE INDEX IF NOT EXISTS idx_syte_mode
  ON symbolic_telemetry_events (mode, domain, created_at DESC)
  WHERE mode IS NOT NULL;

-- Request-level inspection (tie all items from one oracle call)
CREATE INDEX IF NOT EXISTS idx_syte_request_id
  ON symbolic_telemetry_events (request_id)
  WHERE request_id IS NOT NULL;
