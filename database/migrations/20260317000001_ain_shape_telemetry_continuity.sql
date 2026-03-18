-- AIN Shape Telemetry — Continuity Extension
-- Additive only: new nullable columns for continuity-stack metrics.
-- Measures thread tracking, option resolution, rupture events, and turn
-- classification so we can evaluate whether the continuity layer is
-- improving conversational trust and reducing thread drops.
--
-- All columns nullable — older rows carry NULL for new fields.
-- No existing column changes. No NOT NULL constraints on new columns.
--
-- Useful queries:
--   -- Thread detection rate
--   SELECT ROUND(100.0 * AVG(CASE WHEN active_thread_present THEN 1 ELSE 0 END), 1) AS thread_rate
--   FROM ain_shape_telemetry WHERE formed_at > NOW() - INTERVAL '7 days';
--
--   -- Rupture frequency by mode
--   SELECT mode, COUNT(*) FILTER (WHERE rupture_flag) AS ruptures, COUNT(*) AS total
--   FROM ain_shape_telemetry WHERE formed_at > NOW() - INTERVAL '7 days'
--   GROUP BY mode;
--
--   -- Turn type distribution
--   SELECT assistant_turn_type, COUNT(*) AS n
--   FROM ain_shape_telemetry WHERE formed_at > NOW() - INTERVAL '7 days'
--   GROUP BY assistant_turn_type ORDER BY n DESC;

ALTER TABLE ain_shape_telemetry
  ADD COLUMN IF NOT EXISTS turn_index               INTEGER,
  ADD COLUMN IF NOT EXISTS mode                     TEXT,
  ADD COLUMN IF NOT EXISTS active_thread_present    BOOLEAN,
  ADD COLUMN IF NOT EXISTS active_thread_confidence NUMERIC(4,3),
  ADD COLUMN IF NOT EXISTS correction_detected      BOOLEAN,
  ADD COLUMN IF NOT EXISTS option_resolution_matched   BOOLEAN,
  ADD COLUMN IF NOT EXISTS option_resolution_near_miss BOOLEAN,
  ADD COLUMN IF NOT EXISTS rupture_flag             BOOLEAN,
  ADD COLUMN IF NOT EXISTS rupture_type             TEXT,
  ADD COLUMN IF NOT EXISTS assistant_turn_type      TEXT;

-- Index: continuity health by session (join with session_id already indexed)
CREATE INDEX IF NOT EXISTS idx_ast_rupture_flag
  ON ain_shape_telemetry (rupture_flag, formed_at DESC)
  WHERE rupture_flag = TRUE;

CREATE INDEX IF NOT EXISTS idx_ast_turn_type
  ON ain_shape_telemetry (assistant_turn_type, formed_at DESC);

CREATE INDEX IF NOT EXISTS idx_ast_mode_formed
  ON ain_shape_telemetry (mode, formed_at DESC);

-- Register migration
INSERT INTO schema_migrations (filename, applied_at)
  VALUES ('20260317000001_ain_shape_telemetry_continuity.sql', NOW())
  ON CONFLICT (filename) DO NOTHING;
