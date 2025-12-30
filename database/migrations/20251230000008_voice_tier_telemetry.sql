-- Voice Tier Telemetry
-- Tracks Opus/Sonnet model routing decisions for analysis and optimization
-- Sovereignty-aligned: no user content, just routing metadata

CREATE TABLE IF NOT EXISTS voice_tier_telemetry (
  id BIGSERIAL PRIMARY KEY,
  formed_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- routing decision
  tier TEXT NOT NULL CHECK (tier IN ('opus', 'sonnet')),
  reason TEXT NOT NULL,
  model TEXT NOT NULL,

  -- context that influenced decision (no user content)
  user_id_hash TEXT,           -- SHA256 of userId for anonymous tracking
  message_count INTEGER,
  mode TEXT,
  awareness_level SMALLINT,
  has_deep_pattern BOOLEAN NOT NULL DEFAULT FALSE,
  is_opus_tier_user BOOLEAN NOT NULL DEFAULT FALSE,

  -- session context
  session_id TEXT,
  processing_profile TEXT,
  latency_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_voice_tier_telemetry_formed_at
  ON voice_tier_telemetry (formed_at DESC);

CREATE INDEX IF NOT EXISTS idx_voice_tier_telemetry_tier_reason
  ON voice_tier_telemetry (tier, reason);

CREATE INDEX IF NOT EXISTS idx_voice_tier_telemetry_awareness
  ON voice_tier_telemetry (awareness_level)
  WHERE awareness_level IS NOT NULL;
