-- Flow telemetry columns for ain_shape_telemetry
-- Tracks Layer 0 (state resolver) decisions and downstream flow quality per turn.
--
-- Resolver success rate query:
--   SELECT ROUND(100.0 * AVG(CASE WHEN flow_outcome = 'smooth' THEN 1 ELSE 0 END), 1) AS smooth_rate
--   FROM ain_shape_telemetry WHERE state_resolver_fired = TRUE AND formed_at > NOW() - INTERVAL '7 days';

ALTER TABLE ain_shape_telemetry
  ADD COLUMN IF NOT EXISTS flow_outcome         TEXT,
  ADD COLUMN IF NOT EXISTS flow_confidence      NUMERIC(4,3),
  ADD COLUMN IF NOT EXISTS flow_reason          TEXT,
  ADD COLUMN IF NOT EXISTS state_resolver_fired BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS resolver_rule        TEXT,
  ADD COLUMN IF NOT EXISTS resolver_confidence  NUMERIC(4,3),
  ADD COLUMN IF NOT EXISTS clarification_blocked        BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS model_asked_clarification    BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS clarification_was_needed     BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS repair_signal                BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_ain_shape_flow_outcome
  ON ain_shape_telemetry (flow_outcome, formed_at DESC);

CREATE INDEX IF NOT EXISTS idx_ain_shape_resolver_fired
  ON ain_shape_telemetry (state_resolver_fired, formed_at DESC);

INSERT INTO schema_migrations (filename, applied_at)
  VALUES ('20260316000004_add_flow_telemetry_to_turns.sql', NOW())
  ON CONFLICT (filename) DO NOTHING;
