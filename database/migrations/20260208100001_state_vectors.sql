-- State Vectors Schema
-- Captures a member's consciousness state at any moment across elemental,
-- temporal, and energetic dimensions. This is MAIA's perceptual backbone.
--
-- Design: The state vector describes, it does not prescribe.
-- No engagement metrics. No convergence optimization. No outcome framing.
-- States are not ranked -- survival is not "lower" than unified.
--
-- Dependencies: members table (id)
-- Rollback: DROP TABLE state_vectors; DROP FUNCTION update_state_vector_timestamp(); DROP VIEW v_state_vector_history; DROP VIEW v_state_vector_daily;

-- ============================================
-- STATE VECTORS
-- ============================================
CREATE TABLE IF NOT EXISTS state_vectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    session_id TEXT,

    -- How the state was captured
    source VARCHAR(20) NOT NULL DEFAULT 'conversation'
        CHECK (source IN ('checkin', 'conversation', 'auto-detected', 'voice-analysis', 'journal')),

    -- ── Primary Elemental Reading (indexed for queries) ──────────
    primary_element VARCHAR(10) NOT NULL
        CHECK (primary_element IN ('earth', 'water', 'fire', 'air', 'aether')),

    -- Facet code from 12-facet Spiralogic model (nullable: not always detectable)
    -- FEU, VUNV, ZECH (fire), IEVE, AGHT, NEINE (water),
    -- CHEN, ALVE, ZWOIF (earth), AIN, ZWEI, AIRE (air)
    -- For aether: witnessing, paradox, integration, dissolution, stillness
    primary_facet_code VARCHAR(20),

    -- Phase within elemental cycle (nullable: often requires history)
    primary_phase VARCHAR(10)
        CHECK (primary_phase IS NULL OR primary_phase IN ('entering', 'in', 'exiting')),

    -- Emotional/energetic charge
    primary_intensity VARCHAR(10) NOT NULL DEFAULT 'medium'
        CHECK (primary_intensity IN ('low', 'medium', 'high')),

    -- Polarity: 1 = deeply contractive, 5 = fully expansive
    primary_polarity SMALLINT NOT NULL DEFAULT 3
        CHECK (primary_polarity BETWEEN 1 AND 5),

    -- Stability: 1 = deeply settled, 5 = volatile
    primary_stability SMALLINT NOT NULL DEFAULT 3
        CHECK (primary_stability BETWEEN 1 AND 5),

    -- ── Secondary Elemental Reading (nullable) ───────────────────
    secondary_element VARCHAR(10)
        CHECK (secondary_element IS NULL OR secondary_element IN ('earth', 'water', 'fire', 'air', 'aether')),

    -- Full secondary reading as JSONB (when present)
    secondary_reading JSONB,

    -- ── Confidence ───────────────────────────────────────────────
    -- 0.0 = tentative (sparse signal), 1.0 = high confidence (converging signals)
    confidence NUMERIC(3,2) NOT NULL DEFAULT 0.5
        CHECK (confidence BETWEEN 0.0 AND 1.0),

    -- ── Kairos (temporal quality) ────────────────────────────────
    kairos_assessment VARCHAR(20) NOT NULL DEFAULT 'stable'
        CHECK (kairos_assessment IN ('stable', 'transition', 'threshold', 'integration', 'collapse-risk')),

    kairos_confidence NUMERIC(3,2) NOT NULL DEFAULT 0.5
        CHECK (kairos_confidence BETWEEN 0.0 AND 1.0),

    kairos_description TEXT,

    -- ── Movement (JSONB: entering[], exiting[], trajectory, velocity) ─
    movement JSONB NOT NULL DEFAULT '{
        "entering": [],
        "exiting": [],
        "trajectory": "still",
        "velocity": 0.0
    }',

    -- ── Evidence (JSONB: observations[], contradictions[], gaps[]) ────
    evidence JSONB NOT NULL DEFAULT '{
        "observations": [],
        "contradictions": [],
        "gaps": []
    }',

    -- ── Raw input that produced this vector ──────────────────────
    raw_text TEXT,

    -- ── Timestamps ───────────────────────────────────────────────
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================

-- Member's state history (most common query: "show me my recent states")
CREATE INDEX IF NOT EXISTS idx_sv_member_time
    ON state_vectors(member_id, created_at DESC);

-- Element distribution queries ("how often am I in water?")
CREATE INDEX IF NOT EXISTS idx_sv_element
    ON state_vectors(primary_element);

-- Kairos alerts ("who is at collapse-risk right now?")
CREATE INDEX IF NOT EXISTS idx_sv_kairos
    ON state_vectors(kairos_assessment)
    WHERE kairos_assessment IN ('threshold', 'collapse-risk');

-- Session lookup
CREATE INDEX IF NOT EXISTS idx_sv_session
    ON state_vectors(session_id)
    WHERE session_id IS NOT NULL;

-- Source filtering
CREATE INDEX IF NOT EXISTS idx_sv_source
    ON state_vectors(source);

-- ============================================
-- OBSERVABILITY VIEWS
-- ============================================

-- Member state history: last N vectors for a member
CREATE OR REPLACE VIEW v_state_vector_history AS
SELECT
    sv.id,
    sv.member_id,
    m.name AS member_name,
    sv.source,
    sv.primary_element,
    sv.primary_facet_code,
    sv.primary_phase,
    sv.primary_intensity,
    sv.primary_polarity,
    sv.primary_stability,
    sv.secondary_element,
    sv.confidence,
    sv.kairos_assessment,
    sv.kairos_description,
    sv.movement,
    sv.created_at
FROM state_vectors sv
LEFT JOIN members m ON m.id = sv.member_id
ORDER BY sv.created_at DESC;

-- Daily aggregates: element distribution per day per member
CREATE OR REPLACE VIEW v_state_vector_daily AS
SELECT
    DATE_TRUNC('day', created_at) AS day,
    member_id,
    primary_element,
    COUNT(*) AS readings,
    ROUND(AVG(primary_polarity), 1) AS avg_polarity,
    ROUND(AVG(primary_stability), 1) AS avg_stability,
    ROUND(AVG(confidence), 2) AS avg_confidence,
    MODE() WITHIN GROUP (ORDER BY kairos_assessment) AS dominant_kairos,
    MODE() WITHIN GROUP (ORDER BY primary_intensity) AS dominant_intensity
FROM state_vectors
GROUP BY DATE_TRUNC('day', created_at), member_id, primary_element
ORDER BY day DESC;

-- ============================================
-- TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_state_vector_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS state_vector_updated_at ON state_vectors;
CREATE TRIGGER state_vector_updated_at
    BEFORE UPDATE ON state_vectors
    FOR EACH ROW
    EXECUTE FUNCTION update_state_vector_timestamp();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE state_vectors IS 'Captures consciousness state readings across elemental, temporal, and energetic dimensions. Descriptive, never prescriptive.';
COMMENT ON COLUMN state_vectors.primary_element IS 'Dominant elemental energy: earth (grounding), water (feeling), fire (will), air (mind), aether (integration)';
COMMENT ON COLUMN state_vectors.primary_facet_code IS 'Specific facet within element from 12-facet Spiralogic model (FEU, IEVE, CHEN, AIN, etc.) or aether quality';
COMMENT ON COLUMN state_vectors.primary_polarity IS '1=deeply contractive (withdrawn), 3=neutral, 5=fully expansive (radiating)';
COMMENT ON COLUMN state_vectors.primary_stability IS '1=deeply settled (solid ground), 3=moderate flux, 5=volatile (rapid shifts)';
COMMENT ON COLUMN state_vectors.kairos_assessment IS 'Temporal quality: stable, transition, threshold, integration, or collapse-risk';
COMMENT ON COLUMN state_vectors.evidence IS 'JSONB of observations, contradictions, and gaps. Contradictions are honored, not resolved.';
COMMENT ON COLUMN state_vectors.raw_text IS 'The original text that produced this reading. Stored for calibration and transparency.';
