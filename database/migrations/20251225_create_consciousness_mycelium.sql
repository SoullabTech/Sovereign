/**
 * PHASE 4.5: MYCELIAL MEMORY ENGINE — DATABASE SCHEMA
 * Migration: Create consciousness_mycelium table for temporal memory fusion
 *
 * Purpose:
 * - Store compressed summaries of consciousness cycles (24h windows)
 * - Fuse symbolic traces + biosignal data into unified memory nodes
 * - Track developmental patterns across sessions, days, and phases
 * - Enable temporal continuity and self-reflective intelligence
 *
 * Architecture:
 * - Each row = one "cycle" (default: 24 hours)
 * - Dominant facets = most active facet codes during cycle
 * - Coherence score = alignment between facet patterns and biosignals
 * - Embedding = 256-dim vector encoding symbolic + physiological state
 *
 * Sovereignty:
 * - All data stored locally (no cloud sync)
 * - Embeddings generated via local Ollama (no external APIs)
 * - Privacy-preserving: symbolic compression, no raw conversation text
 */

-- ============================================================================
-- EXTENSION: pgvector (for embedding storage)
-- ============================================================================

-- Enable pgvector extension for vector similarity search
-- Install with: brew install pgvector (macOS) or apt install postgresql-16-pgvector (Linux)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- TABLE: consciousness_mycelium
-- ============================================================================

CREATE TABLE IF NOT EXISTS consciousness_mycelium (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Cycle identification
  cycle_id TEXT NOT NULL UNIQUE,           -- e.g., "cycle_2025-12-25_00"
  user_id TEXT,                            -- Optional: link to user (if multi-user)

  -- Time boundaries
  start_ts TIMESTAMP WITH TIME ZONE NOT NULL,
  end_ts TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Consciousness metrics (aggregated from traces)
  dominant_facets TEXT[] NOT NULL,         -- Top 3-5 facet codes (e.g., ["W1", "F2", "A1"])
  facet_distribution JSONB,                -- Full distribution: {"W1": 12, "F2": 8, ...}
  mean_confidence NUMERIC(3, 2),           -- Avg trace confidence (0.00-1.00)
  total_traces INTEGER DEFAULT 0,          -- Number of traces in cycle

  -- Biosignal metrics (aggregated from biomarkers)
  mean_arousal NUMERIC(4, 3),              -- Avg arousal (0.000-1.000)
  mean_valence NUMERIC(4, 3),              -- Avg valence (-1.000 to +1.000)
  mean_hrv NUMERIC(6, 2),                  -- Avg HRV (ms)
  mean_eeg_alpha NUMERIC(5, 2),            -- Avg EEG alpha power (Hz)
  total_biomarker_samples INTEGER DEFAULT 0,

  -- Coherence (alignment between facets and biosignals)
  coherence_score NUMERIC(4, 3),           -- 0.000-1.000 (higher = better alignment)
  coherence_rationale TEXT,                -- Human-readable explanation

  -- Symbolic summary (compressed representation)
  summary JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Vector embedding (symbolic + biosignal fusion)
  embedding vector(256),                   -- 256-dimensional latent space

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Primary access patterns
CREATE INDEX IF NOT EXISTS idx_mycelium_cycle_id
  ON consciousness_mycelium (cycle_id);

CREATE INDEX IF NOT EXISTS idx_mycelium_user_id
  ON consciousness_mycelium (user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_mycelium_time_range
  ON consciousness_mycelium (start_ts, end_ts);

-- Dominant facet queries (GIN index for array containment)
CREATE INDEX IF NOT EXISTS idx_mycelium_dominant_facets
  ON consciousness_mycelium USING GIN (dominant_facets);

-- Vector similarity search (cosine distance)
CREATE INDEX IF NOT EXISTS idx_mycelium_embedding
  ON consciousness_mycelium USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================================================
-- ANALYTICS VIEWS
-- ============================================================================

/**
 * VIEW: mycelial_growth_timeline
 * Daily aggregation of coherence and activity
 */
CREATE OR REPLACE VIEW mycelial_growth_timeline AS
SELECT
  user_id,
  DATE_TRUNC('day', start_ts) AS day,
  COUNT(*) AS cycle_count,
  ROUND(AVG(coherence_score)::numeric, 3) AS mean_coherence,
  ROUND(AVG(mean_arousal)::numeric, 3) AS mean_arousal,
  ROUND(AVG(mean_valence)::numeric, 3) AS mean_valence,
  SUM(total_traces) AS total_traces,
  SUM(total_biomarker_samples) AS total_biomarker_samples,
  ARRAY_AGG(DISTINCT unnest(dominant_facets)) AS all_dominant_facets
FROM consciousness_mycelium
GROUP BY user_id, DATE_TRUNC('day', start_ts)
ORDER BY day DESC;

COMMENT ON VIEW mycelial_growth_timeline IS
  'Daily aggregation of mycelial memory cycles for growth visualization';

/**
 * VIEW: mycelial_facet_evolution
 * Track how facet usage evolves over time
 */
CREATE OR REPLACE VIEW mycelial_facet_evolution AS
SELECT
  DATE_TRUNC('week', start_ts) AS week,
  unnest(dominant_facets) AS facet_code,
  COUNT(*) AS appearance_count,
  ROUND(AVG(coherence_score)::numeric, 3) AS avg_coherence_when_active
FROM consciousness_mycelium
GROUP BY DATE_TRUNC('week', start_ts), facet_code
ORDER BY week DESC, appearance_count DESC;

COMMENT ON VIEW mycelial_facet_evolution IS
  'Weekly evolution of facet usage patterns across mycelial cycles';

/**
 * VIEW: mycelial_coherence_trends
 * Identify periods of high/low coherence
 */
CREATE OR REPLACE VIEW mycelial_coherence_trends AS
SELECT
  cycle_id,
  start_ts,
  end_ts,
  coherence_score,
  CASE
    WHEN coherence_score >= 0.8 THEN 'high'
    WHEN coherence_score >= 0.5 THEN 'medium'
    ELSE 'low'
  END AS coherence_level,
  dominant_facets,
  coherence_rationale
FROM consciousness_mycelium
ORDER BY start_ts DESC;

COMMENT ON VIEW mycelial_coherence_trends IS
  'Timeline of coherence levels with categorization (high/medium/low)';

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

/**
 * FUNCTION: find_similar_cycles(embedding, limit)
 * Find mycelial cycles similar to a given embedding vector
 */
CREATE OR REPLACE FUNCTION find_similar_cycles(
  query_embedding vector(256),
  result_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  cycle_id TEXT,
  start_ts TIMESTAMP WITH TIME ZONE,
  dominant_facets TEXT[],
  coherence_score NUMERIC,
  distance NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cm.cycle_id,
    cm.start_ts,
    cm.dominant_facets,
    cm.coherence_score,
    ROUND((cm.embedding <=> query_embedding)::numeric, 4) AS distance
  FROM consciousness_mycelium cm
  WHERE cm.embedding IS NOT NULL
  ORDER BY cm.embedding <=> query_embedding
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION find_similar_cycles IS
  'Find mycelial cycles with similar embeddings (cosine distance)';

/**
 * FUNCTION: get_cycle_summary(cycle_id)
 * Retrieve full cycle details with human-readable formatting
 */
CREATE OR REPLACE FUNCTION get_cycle_summary(p_cycle_id TEXT)
RETURNS TABLE (
  summary_text TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    FORMAT(
      E'Cycle: %s\nPeriod: %s to %s\nDominant Facets: %s\nCoherence: %s\nTraces: %s, Biomarkers: %s\n\nSummary:\n%s',
      cm.cycle_id,
      cm.start_ts::TEXT,
      cm.end_ts::TEXT,
      ARRAY_TO_STRING(cm.dominant_facets, ', '),
      cm.coherence_score,
      cm.total_traces,
      cm.total_biomarker_samples,
      cm.summary::TEXT
    ) AS summary_text
  FROM consciousness_mycelium cm
  WHERE cm.cycle_id = p_cycle_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_cycle_summary IS
  'Generate human-readable summary of a mycelial cycle';

-- ============================================================================
-- TABLE COMMENTS
-- ============================================================================

COMMENT ON TABLE consciousness_mycelium IS
  'Phase 4.5: Mycelial Memory Engine — Temporal fusion of consciousness traces + biosignals';

COMMENT ON COLUMN consciousness_mycelium.cycle_id IS
  'Unique identifier for time window (e.g., "cycle_2025-12-25_00" for Dec 25 00:00-23:59)';

COMMENT ON COLUMN consciousness_mycelium.dominant_facets IS
  'Top 3-5 most active facet codes during cycle (e.g., ["W1", "F2", "A1"])';

COMMENT ON COLUMN consciousness_mycelium.coherence_score IS
  'Alignment between facet patterns and biosignals (0.0-1.0, higher = better)';

COMMENT ON COLUMN consciousness_mycelium.embedding IS
  '256-dim vector encoding symbolic + physiological state (generated via Ollama)';

COMMENT ON COLUMN consciousness_mycelium.summary IS
  'Compressed JSON summary of cycle (facets, insights, notable patterns)';

-- ============================================================================
-- SAMPLE DATA SEED (for testing)
-- ============================================================================

/**
 * Optional: Uncomment to seed sample mycelial data for testing
 */

-- DO $$
-- DECLARE
--   sample_embedding vector(256);
-- BEGIN
--   -- Generate random 256-dim embedding
--   sample_embedding := ARRAY(SELECT random() FROM generate_series(1, 256))::vector;
--
--   -- Insert sample cycle
--   INSERT INTO consciousness_mycelium (
--     cycle_id,
--     start_ts,
--     end_ts,
--     dominant_facets,
--     facet_distribution,
--     mean_confidence,
--     total_traces,
--     mean_arousal,
--     mean_valence,
--     mean_hrv,
--     mean_eeg_alpha,
--     total_biomarker_samples,
--     coherence_score,
--     coherence_rationale,
--     summary,
--     embedding
--   ) VALUES (
--     'cycle_2025-12-25_00',
--     '2025-12-25 00:00:00+00',
--     '2025-12-25 23:59:59+00',
--     ARRAY['W1', 'F2', 'A1'],
--     '{"W1": 15, "F2": 12, "A1": 8, "E2": 5}'::jsonb,
--     0.87,
--     40,
--     0.650,
--     0.120,
--     48.50,
--     10.25,
--     2400,
--     0.782,
--     'High coherence: W1 (Safety) correlates with low HRV (autonomic stress). F2 (Challenge) aligns with elevated EEG alpha (focused attention).',
--     '{"insights": ["Safety-seeking pattern with physiological stress", "Cognitive challenge with sustained focus"], "notes": "User navigating W1→F2 transition"}'::jsonb,
--     sample_embedding
--   );
--
--   RAISE NOTICE 'Seeded 1 sample mycelial cycle: cycle_2025-12-25_00';
-- END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify table exists
SELECT COUNT(*) AS mycelium_count FROM consciousness_mycelium;

-- Verify indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'consciousness_mycelium'
ORDER BY indexname;

-- Verify views
SELECT viewname FROM pg_views
WHERE viewname LIKE 'mycelial_%'
ORDER BY viewname;

-- Test vector similarity (requires sample data)
-- SELECT * FROM find_similar_cycles(
--   ARRAY(SELECT random() FROM generate_series(1, 256))::vector,
--   3
-- );

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================

-- DROP FUNCTION IF EXISTS get_cycle_summary(TEXT);
-- DROP FUNCTION IF EXISTS find_similar_cycles(vector, INTEGER);
-- DROP VIEW IF EXISTS mycelial_coherence_trends;
-- DROP VIEW IF EXISTS mycelial_facet_evolution;
-- DROP VIEW IF EXISTS mycelial_growth_timeline;
-- DROP TABLE IF EXISTS consciousness_mycelium;
-- DROP EXTENSION IF EXISTS vector;
