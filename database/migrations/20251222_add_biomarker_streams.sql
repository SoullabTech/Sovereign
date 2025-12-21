/**
 * PHASE 4.4-C: NEUROPOD BRIDGE — BIOMARKER STREAMS
 * Migration: Add consciousness_biomarkers table for biosignal ingestion
 *
 * Purpose:
 * - Store real-time biosignals (EEG, HRV, GSR, breath) from Neuropod devices
 * - Link biomarker data to consciousness traces via foreign key
 * - Enable neuro-trace correlation analysis (arousal → facet transitions)
 *
 * Schema Design:
 * - trace_id: Links biomarker spike to consciousness event (nullable for pre-trace signals)
 * - source: Device identifier (e.g., "muse-s-001", "polar-h10-002")
 * - signal_type: Biomarker category (EEG/HRV/GSR/Breath)
 * - value: Normalized signal reading (0.0-1.0 or raw sensor value)
 * - units: Measurement unit (Hz, ms, μS, bpm, etc.)
 * - sample_ts: High-precision timestamp (microsecond resolution)
 * - metadata: Sensor-specific data (electrode positions, quality scores)
 *
 * Performance:
 * - Composite index on (trace_id, sample_ts) for time-window queries
 * - Index on sample_ts for time-series analysis
 * - Index on signal_type for filtering by biomarker category
 *
 * Sovereignty:
 * - All data stored locally in PostgreSQL (no cloud sync)
 * - No external analytics services
 * - User controls retention policy via manual cleanup
 */

-- ============================================================================
-- TABLE: consciousness_biomarkers
-- ============================================================================

CREATE TABLE IF NOT EXISTS consciousness_biomarkers (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to consciousness trace (nullable for pre-trace signals)
  trace_id UUID REFERENCES consciousness_traces(id) ON DELETE CASCADE,

  -- Device and signal metadata
  source VARCHAR(100) NOT NULL,           -- Device ID (e.g., "muse-s-001")
  signal_type VARCHAR(50) NOT NULL,       -- EEG, HRV, GSR, Breath
  channel VARCHAR(50),                    -- Optional: EEG channel (TP9, AF7, etc.)

  -- Signal data
  value NUMERIC(12, 4) NOT NULL,          -- Raw or normalized value
  units VARCHAR(20),                      -- Hz, ms, μS, bpm, %
  quality_score NUMERIC(3, 2),            -- 0.00-1.00 signal quality indicator

  -- Timestamps
  sample_ts TIMESTAMP WITH TIME ZONE NOT NULL,  -- When sample was captured
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Metadata (JSON for extensibility)
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Composite index for trace-correlated time-window queries
-- Use case: "Find all biomarkers within ±5s of trace X"
CREATE INDEX IF NOT EXISTS idx_biomarkers_trace_sample_ts
  ON consciousness_biomarkers (trace_id, sample_ts DESC)
  WHERE trace_id IS NOT NULL;

-- Time-series index for analytics queries
-- Use case: "Show HRV trend over last 24 hours"
CREATE INDEX IF NOT EXISTS idx_biomarkers_sample_ts
  ON consciousness_biomarkers (sample_ts DESC);

-- Signal type filter index
-- Use case: "Find all EEG alpha-wave events"
CREATE INDEX IF NOT EXISTS idx_biomarkers_signal_type
  ON consciousness_biomarkers (signal_type);

-- Source device index for multi-device scenarios
-- Use case: "Compare Muse-S vs Polar H10 data"
CREATE INDEX IF NOT EXISTS idx_biomarkers_source
  ON consciousness_biomarkers (source);

-- ============================================================================
-- ANALYTICS VIEW: biomarker_facet_correlation
-- ============================================================================

/**
 * Aggregates biomarker data by facet and signal type.
 * Use this view for dashboard visualizations showing which facets
 * correlate with specific biosignal patterns.
 */
CREATE OR REPLACE VIEW biomarker_facet_correlation AS
SELECT
  ct.facet,
  cb.signal_type,
  COUNT(*) AS sample_count,
  ROUND(AVG(cb.value)::numeric, 3) AS avg_value,
  ROUND(STDDEV(cb.value)::numeric, 3) AS stddev_value,
  MIN(cb.value) AS min_value,
  MAX(cb.value) AS max_value,
  ROUND(AVG(cb.quality_score)::numeric, 3) AS avg_quality
FROM consciousness_biomarkers cb
INNER JOIN consciousness_traces ct ON cb.trace_id = ct.id
WHERE ct.facet IS NOT NULL
  AND cb.quality_score >= 0.7  -- Filter low-quality signals
GROUP BY ct.facet, cb.signal_type
ORDER BY sample_count DESC;

COMMENT ON VIEW biomarker_facet_correlation IS
  'Aggregates biomarker samples by facet code and signal type for correlation analysis';

-- ============================================================================
-- ANALYTICS VIEW: biomarker_time_series
-- ============================================================================

/**
 * Hourly time-series aggregation for trend analysis.
 * Use this for line charts showing biosignal patterns over time.
 */
CREATE OR REPLACE VIEW biomarker_time_series AS
SELECT
  DATE_TRUNC('hour', sample_ts) AS hour,
  signal_type,
  source,
  COUNT(*) AS sample_count,
  ROUND(AVG(value)::numeric, 3) AS avg_value,
  ROUND(AVG(quality_score)::numeric, 3) AS avg_quality
FROM consciousness_biomarkers
WHERE quality_score >= 0.7
GROUP BY DATE_TRUNC('hour', sample_ts), signal_type, source
ORDER BY hour DESC, signal_type;

COMMENT ON VIEW biomarker_time_series IS
  'Hourly aggregated biomarker data for time-series trend analysis';

-- ============================================================================
-- TABLE COMMENTS
-- ============================================================================

COMMENT ON TABLE consciousness_biomarkers IS
  'Phase 4.4-C: Real-time biosignal data from Neuropod devices (EEG, HRV, GSR, breath)';

COMMENT ON COLUMN consciousness_biomarkers.trace_id IS
  'Links biomarker to consciousness trace (nullable for pre-trace signals)';

COMMENT ON COLUMN consciousness_biomarkers.source IS
  'Device identifier (e.g., "muse-s-001", "polar-h10-002")';

COMMENT ON COLUMN consciousness_biomarkers.signal_type IS
  'Biomarker category: EEG, HRV, GSR, Breath, Temperature, etc.';

COMMENT ON COLUMN consciousness_biomarkers.channel IS
  'Optional EEG channel (TP9, AF7, TP10, AF8) or sensor position';

COMMENT ON COLUMN consciousness_biomarkers.value IS
  'Raw or normalized signal reading (interpretation depends on signal_type + units)';

COMMENT ON COLUMN consciousness_biomarkers.units IS
  'Measurement unit: Hz (EEG), ms (HRV), μS (GSR), bpm (breath), °C, etc.';

COMMENT ON COLUMN consciousness_biomarkers.quality_score IS
  'Signal quality indicator (0.0-1.0); filter samples below 0.7 for analytics';

COMMENT ON COLUMN consciousness_biomarkers.sample_ts IS
  'High-precision timestamp when biosignal sample was captured (sensor time)';

COMMENT ON COLUMN consciousness_biomarkers.metadata IS
  'Extensible JSON field for device-specific metadata (electrode impedance, battery level, etc.)';

-- ============================================================================
-- SAMPLE DATA SEED (for testing)
-- ============================================================================

/**
 * Optional: Uncomment to seed sample biomarker data for testing
 */

-- DO $$
-- DECLARE
--   test_trace_id UUID;
-- BEGIN
--   -- Get a recent trace (or create one if none exist)
--   SELECT id INTO test_trace_id
--   FROM consciousness_traces
--   ORDER BY created_at DESC
--   LIMIT 1;
--
--   IF test_trace_id IS NULL THEN
--     RAISE NOTICE 'No traces found. Skipping biomarker seed data.';
--     RETURN;
--   END IF;
--
--   -- Insert sample biomarker data (HRV spike during W1 trace)
--   INSERT INTO consciousness_biomarkers
--     (trace_id, source, signal_type, value, units, quality_score, sample_ts)
--   VALUES
--     (test_trace_id, 'polar-h10-001', 'HRV', 45.2, 'ms', 0.95, NOW() - INTERVAL '3 seconds'),
--     (test_trace_id, 'polar-h10-001', 'HRV', 48.7, 'ms', 0.97, NOW() - INTERVAL '2 seconds'),
--     (test_trace_id, 'polar-h10-001', 'HRV', 52.1, 'ms', 0.98, NOW() - INTERVAL '1 second'),
--     (test_trace_id, 'muse-s-001', 'EEG', 12.5, 'Hz', 0.89, NOW() - INTERVAL '2 seconds'),
--     (test_trace_id, 'muse-s-001', 'EEG', 13.2, 'Hz', 0.91, NOW() - INTERVAL '1 second');
--
--   RAISE NOTICE 'Seeded 5 sample biomarker records linked to trace %', test_trace_id;
-- END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify table exists
SELECT COUNT(*) AS biomarker_count FROM consciousness_biomarkers;

-- Verify indexes
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'consciousness_biomarkers'
ORDER BY indexname;

-- Verify views
SELECT facet, signal_type, sample_count, avg_value
FROM biomarker_facet_correlation
LIMIT 5;

SELECT hour, signal_type, sample_count, avg_value
FROM biomarker_time_series
ORDER BY hour DESC
LIMIT 5;

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================

-- DROP VIEW IF EXISTS biomarker_time_series;
-- DROP VIEW IF EXISTS biomarker_facet_correlation;
-- DROP TABLE IF EXISTS consciousness_biomarkers;
