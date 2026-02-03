-- Consciousness Achievements Table
-- Tracks user accomplishments in their consciousness journey
-- Part of MAIA's Memory Palace - Achievement system

CREATE TABLE IF NOT EXISTS consciousness_achievements (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  rarity TEXT NOT NULL DEFAULT 'common',
  unlock_conditions JSONB DEFAULT '{}'::jsonb,
  unlock_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unlocked_during_session TEXT,
  spiral_stage_at_unlock TEXT,
  significance_score NUMERIC(4,3) DEFAULT 0.5,
  celebration_message TEXT,
  user_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate achievements for same user+type
  UNIQUE(user_id, achievement_type)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON consciousness_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON consciousness_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_achievements_rarity ON consciousness_achievements(rarity);
CREATE INDEX IF NOT EXISTS idx_achievements_timestamp ON consciousness_achievements(unlock_timestamp DESC);

COMMENT ON TABLE consciousness_achievements IS 'User consciousness journey achievements (MAIA achievement system)';
