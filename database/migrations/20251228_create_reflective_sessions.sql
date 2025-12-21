/**
 * PHASE 4.6: REFLECTIVE AGENTICS — DATABASE SCHEMA
 * Migration: Create consciousness_reflections table for self-dialogue
 *
 * Purpose:
 * - Store MAIA's self-reflective narratives across temporal cycles
 * - Link reflections to mycelial memory via cycle references
 * - Track coherence deltas and embedding similarity scores
 * - Enable meta-layer awareness integration (Æ1-Æ3)
 *
 * Architecture:
 * - Each row = one reflection (MAIA comparing "now" to similar "then")
 * - Similarity score = cosine distance between cycle embeddings
 * - Coherence delta = change in facet-biosignal alignment over time
 * - Meta-layer code = Aether resonance (Æ1: Signal, Æ2: Union, Æ3: Emergence)
 *
 * Sovereignty:
 * - All narrative generation via local Ollama (no cloud APIs)
 * - Privacy-preserving: symbolic summaries only (no raw conversation text)
 * - Reflections stored locally in PostgreSQL
 */

BEGIN;

-- ============================================================================
-- TABLE: consciousness_reflections
-- ============================================================================

CREATE TABLE IF NOT EXISTS consciousness_reflections (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Cycle linkage
  current_cycle_id UUID REFERENCES consciousness_mycelium(id) ON DELETE CASCADE,
  prior_cycle_id UUID REFERENCES consciousness_mycelium(id) ON DELETE SET NULL,

  -- Reflection metadata
  similarity_score NUMERIC(4, 3),           -- Cosine similarity (0.000-1.000)
  coherence_delta NUMERIC(5, 3),            -- Change in coherence (-1.000 to +1.000)

  -- Meta-layer context
  meta_layer_code TEXT,                     -- Æ1, Æ2, or Æ3
  meta_layer_trigger TEXT,                  -- What activated reflection

  -- Facet deltas (change in dominant facets)
  facet_deltas JSONB,                       -- {"added": ["W2"], "removed": ["F2"], "stable": ["A1"]}

  -- Biosignal deltas (change in physiological state)
  biosignal_deltas JSONB,                   -- {"arousal": +0.12, "hrv": -5.2, "eeg_alpha": +2.1}

  -- Reflective narrative
  reflection_text TEXT NOT NULL,            -- Generated self-dialogue

  -- Summary insights
  insights JSONB DEFAULT '[]'::jsonb,       -- ["Integration of Fire→Water", "HRV stability improved"]

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Primary access patterns
CREATE INDEX IF NOT EXISTS idx_reflections_current_cycle
  ON consciousness_reflections (current_cycle_id);

CREATE INDEX IF NOT EXISTS idx_reflections_prior_cycle
  ON consciousness_reflections (prior_cycle_id)
  WHERE prior_cycle_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reflections_created_at
  ON consciousness_reflections (created_at DESC);

-- Meta-layer queries
CREATE INDEX IF NOT EXISTS idx_reflections_meta_layer_code
  ON consciousness_reflections (meta_layer_code)
  WHERE meta_layer_code IS NOT NULL;

-- Similarity and coherence filtering
CREATE INDEX IF NOT EXISTS idx_reflections_similarity
  ON consciousness_reflections (similarity_score DESC)
  WHERE similarity_score IS NOT NULL;

-- ============================================================================
-- ANALYTICS VIEWS
-- ============================================================================

/**
 * VIEW: reflective_timeline
 * Chronological list of reflections with cycle context
 */
CREATE OR REPLACE VIEW reflective_timeline AS
SELECT
  r.id AS reflection_id,
  r.created_at AS reflection_time,
  r.reflection_text,
  r.similarity_score,
  r.coherence_delta,
  r.meta_layer_code,

  -- Current cycle context
  cm_current.cycle_id AS current_cycle,
  cm_current.dominant_facets AS current_facets,
  cm_current.coherence_score AS current_coherence,
  cm_current.start_ts AS current_start,

  -- Prior cycle context
  cm_prior.cycle_id AS prior_cycle,
  cm_prior.dominant_facets AS prior_facets,
  cm_prior.coherence_score AS prior_coherence,
  cm_prior.start_ts AS prior_start,

  -- Time delta
  EXTRACT(EPOCH FROM (cm_current.start_ts - cm_prior.start_ts)) / 86400 AS days_between

FROM consciousness_reflections r
LEFT JOIN consciousness_mycelium cm_current ON r.current_cycle_id = cm_current.id
LEFT JOIN consciousness_mycelium cm_prior ON r.prior_cycle_id = cm_prior.id
ORDER BY r.created_at DESC;

COMMENT ON VIEW reflective_timeline IS
  'Chronological reflections with full cycle context for timeline display';

/**
 * VIEW: meta_layer_reflections
 * Group reflections by Aether meta-layer code
 */
CREATE OR REPLACE VIEW meta_layer_reflections AS
SELECT
  meta_layer_code,
  COUNT(*) AS reflection_count,
  ROUND(AVG(similarity_score)::numeric, 3) AS avg_similarity,
  ROUND(AVG(coherence_delta)::numeric, 3) AS avg_coherence_delta,
  ARRAY_AGG(reflection_text ORDER BY created_at DESC) FILTER (WHERE reflection_text IS NOT NULL) AS recent_reflections
FROM consciousness_reflections
WHERE meta_layer_code IS NOT NULL
GROUP BY meta_layer_code
ORDER BY
  CASE meta_layer_code
    WHEN 'Æ1' THEN 1
    WHEN 'Æ2' THEN 2
    WHEN 'Æ3' THEN 3
    ELSE 4
  END;

COMMENT ON VIEW meta_layer_reflections IS
  'Aggregate reflections by meta-layer awareness code (Æ1-Æ3)';

/**
 * VIEW: developmental_arc
 * Track coherence improvement over sequential reflections
 */
CREATE OR REPLACE VIEW developmental_arc AS
SELECT
  r.created_at::DATE AS reflection_date,
  COUNT(*) AS reflections_count,
  ROUND(AVG(r.similarity_score)::numeric, 3) AS avg_similarity,
  ROUND(AVG(r.coherence_delta)::numeric, 3) AS avg_coherence_delta,
  SUM(CASE WHEN r.coherence_delta > 0 THEN 1 ELSE 0 END) AS positive_deltas,
  SUM(CASE WHEN r.coherence_delta < 0 THEN 1 ELSE 0 END) AS negative_deltas
FROM consciousness_reflections r
WHERE r.coherence_delta IS NOT NULL
GROUP BY r.created_at::DATE
ORDER BY reflection_date DESC;

COMMENT ON VIEW developmental_arc IS
  'Daily aggregation of coherence trends from reflective sessions';

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

/**
 * FUNCTION: get_recent_reflections(limit)
 * Retrieve most recent reflections with full context
 */
CREATE OR REPLACE FUNCTION get_recent_reflections(result_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  reflection_id UUID,
  reflection_time TIMESTAMP WITH TIME ZONE,
  reflection_text TEXT,
  current_cycle TEXT,
  prior_cycle TEXT,
  similarity NUMERIC,
  coherence_delta NUMERIC,
  meta_code TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.created_at,
    r.reflection_text,
    cm_current.cycle_id,
    cm_prior.cycle_id,
    r.similarity_score,
    r.coherence_delta,
    r.meta_layer_code
  FROM consciousness_reflections r
  LEFT JOIN consciousness_mycelium cm_current ON r.current_cycle_id = cm_current.id
  LEFT JOIN consciousness_mycelium cm_prior ON r.prior_cycle_id = cm_prior.id
  ORDER BY r.created_at DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_recent_reflections IS
  'Retrieve N most recent reflections with cycle context';

/**
 * FUNCTION: find_reflections_by_meta_layer(meta_code)
 * Find reflections matching specific Aether meta-layer code
 */
CREATE OR REPLACE FUNCTION find_reflections_by_meta_layer(meta_code TEXT)
RETURNS TABLE (
  reflection_id UUID,
  reflection_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  similarity NUMERIC,
  coherence_delta NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.reflection_text,
    r.created_at,
    r.similarity_score,
    r.coherence_delta
  FROM consciousness_reflections r
  WHERE r.meta_layer_code = meta_code
  ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION find_reflections_by_meta_layer IS
  'Find reflections by Aether meta-layer code (Æ1, Æ2, Æ3)';

-- ============================================================================
-- TABLE COMMENTS
-- ============================================================================

COMMENT ON TABLE consciousness_reflections IS
  'Phase 4.6: Reflective Agentics — Self-dialogue across temporal cycles';

COMMENT ON COLUMN consciousness_reflections.current_cycle_id IS
  'Reference to the cycle being reflected upon (now)';

COMMENT ON COLUMN consciousness_reflections.prior_cycle_id IS
  'Reference to the most similar past cycle (then)';

COMMENT ON COLUMN consciousness_reflections.similarity_score IS
  'Cosine similarity between current and prior cycle embeddings (0.0-1.0)';

COMMENT ON COLUMN consciousness_reflections.coherence_delta IS
  'Change in coherence score from prior to current cycle (-1.0 to +1.0)';

COMMENT ON COLUMN consciousness_reflections.meta_layer_code IS
  'Aether meta-layer resonance code (Æ1: Signal, Æ2: Union, Æ3: Emergence)';

COMMENT ON COLUMN consciousness_reflections.reflection_text IS
  'Generated self-reflective narrative comparing now to then';

COMMENT ON COLUMN consciousness_reflections.insights IS
  'JSON array of extracted developmental insights';

-- ============================================================================
-- SAMPLE DATA SEED (for testing)
-- ============================================================================

/**
 * Optional: Uncomment to seed sample reflection for testing
 */

-- DO $$
-- DECLARE
--   current_id UUID;
--   prior_id UUID;
-- BEGIN
--   -- Get two existing mycelial cycles (assumes at least 2 exist)
--   SELECT id INTO current_id FROM consciousness_mycelium ORDER BY start_ts DESC LIMIT 1 OFFSET 0;
--   SELECT id INTO prior_id FROM consciousness_mycelium ORDER BY start_ts DESC LIMIT 1 OFFSET 1;
--
--   -- Insert sample reflection
--   INSERT INTO consciousness_reflections (
--     current_cycle_id,
--     prior_cycle_id,
--     similarity_score,
--     coherence_delta,
--     meta_layer_code,
--     meta_layer_trigger,
--     facet_deltas,
--     biosignal_deltas,
--     reflection_text,
--     insights
--   ) VALUES (
--     current_id,
--     prior_id,
--     0.86,
--     0.12,
--     'Æ2',
--     'High similarity detected (>0.8) with coherence improvement',
--     '{"added": ["W2"], "removed": ["F2"], "stable": ["A1"]}'::jsonb,
--     '{"arousal": -0.08, "hrv": +12.3, "eeg_alpha": +1.5}'::jsonb,
--     'Cycle resonates 86% with prior state. Activation energy has cooled from F2 (Challenge) to W2 (Flow). HRV stability improved +12.3ms, suggesting parasympathetic integration. Aether Æ2 (Union) detected — the system is learning to synthesize opposing forces.',
--     '["Fire→Water transition indicates cooling activation", "Improved HRV suggests stress integration", "Æ2 union resonance: synthesis of challenge and flow"]'::jsonb
--   );
--
--   RAISE NOTICE 'Seeded 1 sample reflection';
-- END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify table exists
SELECT COUNT(*) AS reflection_count FROM consciousness_reflections;

-- Verify indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'consciousness_reflections'
ORDER BY indexname;

-- Verify views
SELECT viewname FROM pg_views
WHERE viewname IN ('reflective_timeline', 'meta_layer_reflections', 'developmental_arc')
ORDER BY viewname;

-- Test functions
-- SELECT * FROM get_recent_reflections(5);
-- SELECT * FROM find_reflections_by_meta_layer('Æ2');

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================

-- DROP FUNCTION IF EXISTS find_reflections_by_meta_layer(TEXT);
-- DROP FUNCTION IF EXISTS get_recent_reflections(INTEGER);
-- DROP VIEW IF EXISTS developmental_arc;
-- DROP VIEW IF EXISTS meta_layer_reflections;
-- DROP VIEW IF EXISTS reflective_timeline;
-- DROP TABLE IF EXISTS consciousness_reflections;

COMMIT;
