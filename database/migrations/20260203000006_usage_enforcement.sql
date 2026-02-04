-- ============================================
-- Migration: Usage Enforcement Tables
-- ============================================
-- Real-time usage tracking for tier-based limits enforcement.
-- Philosophy: Enforce with dignity, not punishment.

-- Daily usage tracking (resets daily)
CREATE TABLE IF NOT EXISTS usage_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  anon_id TEXT, -- For anonymous/guest users

  -- Date (UTC)
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Text usage
  text_turns INTEGER DEFAULT 0,
  text_tokens_in INTEGER DEFAULT 0,
  text_tokens_out INTEGER DEFAULT 0,

  -- Voice usage (daily portion of monthly budget)
  voice_seconds_stt INTEGER DEFAULT 0,
  voice_seconds_tts INTEGER DEFAULT 0,

  -- Nudge tracking
  nudge_shown BOOLEAN DEFAULT FALSE,
  nudge_type TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One row per member/anon per day
  UNIQUE(member_id, usage_date),
  UNIQUE(anon_id, usage_date),

  -- Must have either member_id or anon_id
  CONSTRAINT usage_daily_identity CHECK (
    (member_id IS NOT NULL AND anon_id IS NULL) OR
    (member_id IS NULL AND anon_id IS NOT NULL)
  )
);

COMMENT ON TABLE usage_daily IS 'Daily usage tracking for real-time limits enforcement';

-- Monthly voice budget tracking (for Member+ 20 min/mo limit)
CREATE TABLE IF NOT EXISTS usage_voice_monthly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Month (first day of month)
  usage_month DATE NOT NULL,

  -- Voice budget (in seconds)
  voice_seconds_used INTEGER DEFAULT 0,
  voice_seconds_limit INTEGER DEFAULT 1200, -- 20 min = 1200 sec
  voice_boost_seconds INTEGER DEFAULT 0, -- Additional purchased seconds

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One row per member per month
  UNIQUE(member_id, usage_month)
);

COMMENT ON TABLE usage_voice_monthly IS 'Monthly voice budget tracking for Member+ tier';

-- Lifetime voice demo tracking (for Free tier 2-3 min lifetime demo)
CREATE TABLE IF NOT EXISTS usage_voice_demo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  anon_id TEXT,

  -- Lifetime demo budget (in seconds)
  voice_seconds_used INTEGER DEFAULT 0,
  voice_seconds_limit INTEGER DEFAULT 180, -- 3 min = 180 sec
  demo_exhausted BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One row per identity
  UNIQUE(member_id),
  UNIQUE(anon_id),

  -- Must have either member_id or anon_id
  CONSTRAINT usage_voice_demo_identity CHECK (
    (member_id IS NOT NULL AND anon_id IS NULL) OR
    (member_id IS NULL AND anon_id IS NOT NULL)
  )
);

COMMENT ON TABLE usage_voice_demo IS 'Lifetime voice demo tracking for Free tier';

-- Indexes for efficient enforcement queries
CREATE INDEX IF NOT EXISTS idx_usage_daily_member_date
ON usage_daily(member_id, usage_date) WHERE member_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_usage_daily_anon_date
ON usage_daily(anon_id, usage_date) WHERE anon_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_usage_voice_monthly_member
ON usage_voice_monthly(member_id, usage_month);

CREATE INDEX IF NOT EXISTS idx_usage_voice_demo_member
ON usage_voice_demo(member_id) WHERE member_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_usage_voice_demo_anon
ON usage_voice_demo(anon_id) WHERE anon_id IS NOT NULL;
