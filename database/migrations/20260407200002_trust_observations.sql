-- Trust Observation Layer v1
-- Lightweight behavioral signals: how users respond to different response modes
-- Fire-and-forget writes from oracle route, no UI, no analytics yet
-- Feeds future symbolic affinity weighting

CREATE TABLE IF NOT EXISTS trust_observations (
  id BIGSERIAL PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  session_id TEXT,
  response_type TEXT CHECK (response_type IN ('evocative', 'interpretive', 'care', 'direct')),
  engagement_proxy FLOAT CHECK (engagement_proxy >= 0 AND engagement_proxy <= 1),
  feedback TEXT CHECK (feedback IN ('positive', 'negative')),
  context JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trust_observations_member
  ON trust_observations(member_id, created_at DESC);
