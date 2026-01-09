-- Elemental Practice Completions
-- Track when users complete practices with duration and impact

CREATE TABLE IF NOT EXISTS ea_practice_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  practice_id TEXT NOT NULL,
  element TEXT CHECK (element IN ('fire', 'water', 'earth', 'air', 'aether', 'all')),

  -- Session metrics
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  steps_completed INTEGER NOT NULL DEFAULT 0,
  total_steps INTEGER NOT NULL DEFAULT 0,

  -- User feedback
  impact_rating INTEGER CHECK (impact_rating >= 1 AND impact_rating <= 5),
  reflection_saved BOOLEAN DEFAULT FALSE,

  -- Spiralogic integration
  spiralogic_facet INTEGER,  -- 1-12 current facet when practice was done
  journey_context TEXT,       -- 'morning_ritual', 'shadow_work', 'integration', etc.

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_epc_user_id ON ea_practice_completions(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_epc_practice ON ea_practice_completions(practice_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_epc_element ON ea_practice_completions(user_id, element);
CREATE INDEX IF NOT EXISTS idx_epc_facet ON ea_practice_completions(user_id, spiralogic_facet) WHERE spiralogic_facet IS NOT NULL;

-- Summary view for user practice stats
CREATE OR REPLACE VIEW ea_practice_stats AS
SELECT
  user_id,
  practice_id,
  element,
  COUNT(*) as completion_count,
  SUM(duration_seconds) as total_duration_seconds,
  AVG(impact_rating)::NUMERIC(3,2) as avg_impact,
  MAX(completed_at) as last_completed
FROM ea_practice_completions
GROUP BY user_id, practice_id, element;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON ea_practice_completions TO soullab;
GRANT SELECT ON ea_practice_stats TO soullab;

COMMENT ON TABLE ea_practice_completions IS 'Tracks elemental practice completions with duration and impact';
COMMENT ON VIEW ea_practice_stats IS 'Aggregated practice stats per user/practice';
