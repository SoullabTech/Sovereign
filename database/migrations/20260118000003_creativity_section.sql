-- Creativity Section - Mathematics of Creativity
-- Based on: Law of Large Numbers, Zipf's Law, Combinatorial Creativity,
-- Exponential Growth, and Edge of Chaos frameworks

-- Creative Attempts - Core capture table (Law of Large Numbers)
CREATE TABLE IF NOT EXISTS creative_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Attempt type and content
  type TEXT NOT NULL DEFAULT 'idea', -- idea, draft, experiment, prototype
  content_text TEXT,
  content_voice_url TEXT,
  content_image_url TEXT,

  -- Status tracking
  status TEXT DEFAULT 'raw', -- raw, developed, shipped, archived
  quality_rating INT, -- 1-5, self-rated (optional)

  -- Outlier detection (Zipf's Law)
  outlier_score INT DEFAULT 0,
  is_outlier BOOLEAN DEFAULT FALSE,
  outlier_reasons TEXT[] DEFAULT '{}',

  -- Engagement metrics (passive tracking)
  view_count INT DEFAULT 0,
  edit_count INT DEFAULT 0,
  total_time_spent INT DEFAULT 0, -- seconds
  engagement_score REAL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_creative_attempts_member_id ON creative_attempts(member_id);
CREATE INDEX IF NOT EXISTS idx_creative_attempts_created_at ON creative_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_creative_attempts_status ON creative_attempts(status);
CREATE INDEX IF NOT EXISTS idx_creative_attempts_is_outlier ON creative_attempts(is_outlier);
CREATE INDEX IF NOT EXISTS idx_creative_attempts_type ON creative_attempts(type);

-- Creative Attempt Events - Track engagement
CREATE TABLE IF NOT EXISTS creative_attempt_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES creative_attempts(id) ON DELETE CASCADE,
  member_id UUID NOT NULL,
  event_type TEXT NOT NULL, -- view, edit, time_spent, share, export
  value_int INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creative_attempt_events_attempt_id ON creative_attempt_events(attempt_id);
CREATE INDEX IF NOT EXISTS idx_creative_attempt_events_created_at ON creative_attempt_events(created_at);
CREATE INDEX IF NOT EXISTS idx_creative_attempt_events_event_type ON creative_attempt_events(event_type);

-- Building Blocks - Extracted elements for combinatorial creativity
CREATE TABLE IF NOT EXISTS building_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Block content
  content_text TEXT NOT NULL,
  source_attempt_id UUID REFERENCES creative_attempts(id) ON DELETE SET NULL,
  domain TEXT, -- technology, philosophy, design, etc.
  tags TEXT[] DEFAULT '{}',

  -- Usage tracking
  usage_count INT DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  UNIQUE(member_id, content_text)
);

CREATE INDEX IF NOT EXISTS idx_building_blocks_member_id ON building_blocks(member_id);
CREATE INDEX IF NOT EXISTS idx_building_blocks_domain ON building_blocks(domain);
CREATE INDEX IF NOT EXISTS idx_building_blocks_usage_count ON building_blocks(usage_count);

-- Attempt Lineage - Track idea genealogy
CREATE TABLE IF NOT EXISTS attempt_lineage (
  parent_attempt_id UUID NOT NULL REFERENCES creative_attempts(id) ON DELETE CASCADE,
  child_attempt_id UUID NOT NULL REFERENCES creative_attempts(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL, -- remix, evolution, fusion
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (parent_attempt_id, child_attempt_id)
);

CREATE INDEX IF NOT EXISTS idx_attempt_lineage_parent ON attempt_lineage(parent_attempt_id);
CREATE INDEX IF NOT EXISTS idx_attempt_lineage_child ON attempt_lineage(child_attempt_id);

-- Creative Practice Log - Track hours invested (Exponential Growth)
CREATE TABLE IF NOT EXISTS creative_practice_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  skill_domain TEXT NOT NULL, -- writing, code, design, music, etc.
  duration_minutes INT NOT NULL,
  activity_type TEXT NOT NULL, -- learning, creating, refining
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creative_practice_logs_member_id ON creative_practice_logs(member_id);
CREATE INDEX IF NOT EXISTS idx_creative_practice_logs_date ON creative_practice_logs(date);
CREATE INDEX IF NOT EXISTS idx_creative_practice_logs_skill_domain ON creative_practice_logs(skill_domain);

-- Creative Sessions - Structured creative work sessions (Edge of Chaos)
CREATE TABLE IF NOT EXISTS creative_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,

  -- Session configuration
  mode TEXT NOT NULL, -- diverge, converge, edge
  structure_level INT DEFAULT 50, -- 0-100 (chaos to order)

  -- Session metrics
  duration_minutes INT,
  output_count INT DEFAULT 0,
  quality_self_rating INT, -- 1-5

  -- Notes
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_creative_sessions_member_id ON creative_sessions(member_id);
CREATE INDEX IF NOT EXISTS idx_creative_sessions_created_at ON creative_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_creative_sessions_mode ON creative_sessions(mode);

-- Skill Domains - Member's creative focus areas
CREATE TABLE IF NOT EXISTS skill_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE, -- NULL for system defaults
  name TEXT NOT NULL,
  icon TEXT, -- emoji or icon name
  color TEXT, -- hex color
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, name)
);

CREATE INDEX IF NOT EXISTS idx_skill_domains_member_id ON skill_domains(member_id);
CREATE INDEX IF NOT EXISTS idx_skill_domains_is_active ON skill_domains(is_active);

-- Practice Streaks - Track consistency
CREATE TABLE IF NOT EXISTS practice_streaks (
  member_id UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_practice_date DATE,
  streak_minimum_minutes INT DEFAULT 15,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chaos Profile - Personal chaos/order calibration
CREATE TABLE IF NOT EXISTS chaos_profiles (
  member_id UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
  optimal_structure_level INT DEFAULT 50, -- 0-100
  optimal_range_min INT DEFAULT 35,
  optimal_range_max INT DEFAULT 65,
  best_hour_for_chaos INT, -- 0-23
  best_hour_for_structure INT, -- 0-23
  best_day_for_creative INT, -- 0-6 (Sunday-Saturday)
  confidence REAL DEFAULT 0, -- 0-1
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creativity Journey - Member progression through features
CREATE TABLE IF NOT EXISTS creativity_journeys (
  member_id UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
  current_stage INT DEFAULT 1, -- 1-7
  completed_stages INT[] DEFAULT '{1}',
  unlocked_features TEXT[] DEFAULT '{"capture", "attempt_count"}',
  last_stage_change TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member Achievements - Milestones and celebrations
CREATE TABLE IF NOT EXISTS member_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL, -- attempt_count, streak, combination, hours
  achievement_key TEXT NOT NULL, -- attempts_100, streak_30, etc.
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, achievement_key)
);

CREATE INDEX IF NOT EXISTS idx_member_achievements_member_id ON member_achievements(member_id);
CREATE INDEX IF NOT EXISTS idx_member_achievements_type ON member_achievements(achievement_type);

-- Insert default skill domains (system-wide, member_id NULL)
INSERT INTO skill_domains (id, member_id, name, icon, color, display_order) VALUES
  (gen_random_uuid(), NULL, 'Writing', '1F4DD', '#3B82F6', 1),
  (gen_random_uuid(), NULL, 'Code', '1F4BB', '#10B981', 2),
  (gen_random_uuid(), NULL, 'Design', '1F3A8', '#8B5CF6', 3),
  (gen_random_uuid(), NULL, 'Music', '1F3B5', '#F59E0B', 4),
  (gen_random_uuid(), NULL, 'Video', '1F3AC', '#EF4444', 5),
  (gen_random_uuid(), NULL, 'Photography', '1F4F7', '#EC4899', 6),
  (gen_random_uuid(), NULL, 'Strategy', '1F9E0', '#6366F1', 7),
  (gen_random_uuid(), NULL, 'Speaking', '1F3A4', '#14B8A6', 8)
ON CONFLICT DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_creativity_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_creative_attempts_updated_at ON creative_attempts;
CREATE TRIGGER update_creative_attempts_updated_at
  BEFORE UPDATE ON creative_attempts
  FOR EACH ROW EXECUTE FUNCTION update_creativity_updated_at();

DROP TRIGGER IF EXISTS update_building_blocks_updated_at ON building_blocks;
CREATE TRIGGER update_building_blocks_updated_at
  BEFORE UPDATE ON building_blocks
  FOR EACH ROW EXECUTE FUNCTION update_creativity_updated_at();

DROP TRIGGER IF EXISTS update_practice_streaks_updated_at ON practice_streaks;
CREATE TRIGGER update_practice_streaks_updated_at
  BEFORE UPDATE ON practice_streaks
  FOR EACH ROW EXECUTE FUNCTION update_creativity_updated_at();

DROP TRIGGER IF EXISTS update_chaos_profiles_updated_at ON chaos_profiles;
CREATE TRIGGER update_chaos_profiles_updated_at
  BEFORE UPDATE ON chaos_profiles
  FOR EACH ROW EXECUTE FUNCTION update_creativity_updated_at();
