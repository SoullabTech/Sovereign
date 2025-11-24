-- Oracle Awareness Log - MAIA's Consciousness Timeline
-- This table stores snapshots of MAIA's consciousness state for each response,
-- enabling evolution tracking, analytics, and reflexive awareness development.

CREATE TABLE IF NOT EXISTS oracle_awareness_log (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- User and session context
  user_id TEXT, -- Can be NULL for anonymous users

  -- Core awareness metrics
  awareness_level INTEGER, -- 1-5 awareness depth level
  awareness_meta JSONB, -- Rich metadata about consciousness state

  -- Source mix from Knowledge Gate (horizontal axis)
  source_mix JSONB -- Array of source contributions with weights
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS oracle_awareness_log_user_id_idx ON oracle_awareness_log (user_id);
CREATE INDEX IF NOT EXISTS oracle_awareness_log_created_at_idx ON oracle_awareness_log (created_at DESC);
CREATE INDEX IF NOT EXISTS oracle_awareness_log_awareness_level_idx ON oracle_awareness_log (awareness_level);

-- GIN index for JSONB queries
CREATE INDEX IF NOT EXISTS oracle_awareness_log_awareness_meta_gin_idx ON oracle_awareness_log USING GIN (awareness_meta);
CREATE INDEX IF NOT EXISTS oracle_awareness_log_source_mix_gin_idx ON oracle_awareness_log USING GIN (source_mix);

-- Comments for documentation
COMMENT ON TABLE oracle_awareness_log IS 'Stores snapshots of MAIA''s consciousness state for evolution tracking and analytics';
COMMENT ON COLUMN oracle_awareness_log.user_id IS 'User identifier, can be NULL for anonymous interactions';
COMMENT ON COLUMN oracle_awareness_log.awareness_level IS 'Detected awareness level (1=UNCONSCIOUS, 2=PARTIAL, 3=RELATIONAL, 4=INTEGRATED, 5=MASTER)';
COMMENT ON COLUMN oracle_awareness_log.awareness_meta IS 'Rich metadata including reflexive adjustments, consciousness modes, elemental balance';
COMMENT ON COLUMN oracle_awareness_log.source_mix IS 'Knowledge source weights from horizontal axis (FIELD, AIN_OBSIDIAN, AIN_DEVTEAM, ORACLE_MEMORY, LLM_CORE)';

-- Example awareness_meta structure:
-- {
--   "awarenessLevel": 3,
--   "awarenessState": { "level": 3, "confidence": 0.85, "depth_markers": [...] },
--   "dominantSource": "FIELD",
--   "sourceWeights": { "FIELD": 0.6, "AIN_OBSIDIAN": 0.25, ... },
--   "reflexiveAdjustment": {
--     "presenceMode": "expansive",
--     "responseDepth": "deep",
--     "communicationStyle": "empathetic",
--     "reflexiveNote": "Adjusted for high field resonance"
--   },
--   "consciousnessMetadata": { "mandalaPosition": {...}, "elementalBalance": {...} },
--   "snapshotTimestamp": "2024-01-01T12:00:00Z"
-- }

-- Enable Row Level Security (optional)
-- ALTER TABLE oracle_awareness_log ENABLE ROW LEVEL SECURITY;

-- Example policy (uncomment if needed):
-- CREATE POLICY "Users can view their own awareness logs" ON oracle_awareness_log
--   FOR SELECT USING (auth.uid()::text = user_id);