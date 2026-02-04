-- ENGINE COMPARISONS: Shadow mode learning infrastructure
-- Tracks parallel responses from multiple engines for comparison learning

-- Engine comparisons table
CREATE TABLE IF NOT EXISTS maia_engine_comparisons (
  id BIGSERIAL PRIMARY KEY,
  turn_id BIGINT NOT NULL REFERENCES maia_turns(id) ON DELETE CASCADE,
  engine_name TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  response_text TEXT NOT NULL,
  response_time_ms INTEGER,
  processing_profile TEXT CHECK (processing_profile IN ('FAST', 'CORE', 'DEEP')),
  confidence_score NUMERIC(4,3),
  reviewer_label TEXT CHECK (reviewer_label IN ('better', 'worse', 'neutral', 'interesting')),
  reviewer_note TEXT,
  attunement_score SMALLINT CHECK (attunement_score >= 1 AND attunement_score <= 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- Indexes for common queries
CREATE INDEX idx_engine_comparisons_turn ON maia_engine_comparisons(turn_id);
CREATE INDEX idx_engine_comparisons_engine ON maia_engine_comparisons(engine_name);
CREATE INDEX idx_engine_comparisons_unreviewed ON maia_engine_comparisons(reviewed_at) WHERE reviewed_at IS NULL;
CREATE INDEX idx_engine_comparisons_created ON maia_engine_comparisons(created_at);

-- Engine performance view
CREATE OR REPLACE VIEW maia_engine_performance AS
SELECT
  ec.engine_name,
  COUNT(*) as total_responses,
  AVG(ec.response_time_ms) as avg_response_time,
  AVG(ec.attunement_score) as avg_attunement,
  AVG(CASE WHEN f.felt_seen_score IS NOT NULL THEN f.felt_seen_score END) as avg_helpfulness,
  COUNT(CASE WHEN me.id IS NOT NULL THEN 1 END) as misattunement_count,
  AVG(CASE WHEN me.id IS NOT NULL THEN me.severity END) as avg_misattunement_severity
FROM maia_engine_comparisons ec
LEFT JOIN maia_turn_feedback f ON ec.turn_id = f.turn_id
LEFT JOIN maia_misattunements me ON ec.turn_id = me.turn_id
WHERE ec.created_at >= NOW() - INTERVAL '30 days'
GROUP BY ec.engine_name;

-- Misattunements table (if not exists)
CREATE TABLE IF NOT EXISTS maia_misattunements (
  id BIGSERIAL PRIMARY KEY,
  turn_id BIGINT NOT NULL REFERENCES maia_turns(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  severity SMALLINT CHECK (severity >= 1 AND severity <= 5),
  user_quote TEXT,
  maia_quote TEXT,
  detected_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_misattunements_turn ON maia_misattunements(turn_id);
CREATE INDEX IF NOT EXISTS idx_misattunements_category ON maia_misattunements(category);

COMMENT ON TABLE maia_engine_comparisons IS 'Shadow mode: stores parallel responses from multiple engines for comparison learning';
COMMENT ON TABLE maia_misattunements IS 'Loop D: tracks misattunement events for rupture learning';
