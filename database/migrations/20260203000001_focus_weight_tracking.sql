-- Focus Weight Tracking for Stewardship Thresholds
-- Cost-bearing thresholds system: track action weights to surface stewardship invitations

-- Weight log table - tracks every cost-bearing action
CREATE TABLE IF NOT EXISTS focus_weight_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Action details
  action_type TEXT NOT NULL,
  weight INTEGER NOT NULL,

  -- Context (optional)
  source TEXT, -- 'inbox-triage', 'next-step', 'avoidance-breaker', 'focus-garden', 'maia-integration'
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for weekly weight calculations
CREATE INDEX IF NOT EXISTS idx_focus_weight_log_member_date
  ON focus_weight_log(member_id, created_at DESC);

-- Index for action type analytics
CREATE INDEX IF NOT EXISTS idx_focus_weight_log_action
  ON focus_weight_log(action_type, created_at DESC);

-- Function to calculate weekly weight for a member
CREATE OR REPLACE FUNCTION weekly_weight(member_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(SUM(weight), 0)::INTEGER
  FROM focus_weight_log
  WHERE member_id = member_uuid
    AND created_at > NOW() - INTERVAL '7 days';
$$ LANGUAGE SQL STABLE;

-- Function to calculate monthly weight for a member
CREATE OR REPLACE FUNCTION monthly_weight(member_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(SUM(weight), 0)::INTEGER
  FROM focus_weight_log
  WHERE member_id = member_uuid
    AND created_at > NOW() - INTERVAL '30 days';
$$ LANGUAGE SQL STABLE;

-- Add stewardship tier to members table
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS stewardship_tier TEXT DEFAULT 'witness'
  CHECK (stewardship_tier IN ('witness', 'holder', 'steward', 'sustainer', 'sponsored'));

-- Add sponsored access tracking
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS sponsored_until TIMESTAMPTZ;

-- Sponsorship pool table - tracks contributions for sponsored access
CREATE TABLE IF NOT EXISTS sponsorship_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID NOT NULL REFERENCES members(id) ON DELETE SET NULL,

  -- Contribution tracking
  amount_cents INTEGER NOT NULL,
  remaining_cents INTEGER NOT NULL,

  -- Stripe reference (for refunds/tracking)
  stripe_payment_id TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  depleted_at TIMESTAMPTZ -- When fully used
);

-- Index for finding available sponsorship funds
CREATE INDEX IF NOT EXISTS idx_sponsorship_pool_available
  ON sponsorship_pool(remaining_cents DESC)
  WHERE remaining_cents > 0;

-- Sponsored access grants table - tracks who received sponsored access
CREATE TABLE IF NOT EXISTS sponsored_access_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  pool_contribution_id UUID REFERENCES sponsorship_pool(id) ON DELETE SET NULL,

  -- Grant details
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,

  -- No record of who contributed to whom - privacy preserved
  -- No record of why they needed it - dignity preserved

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for checking active grants
CREATE INDEX IF NOT EXISTS idx_sponsored_grants_active
  ON sponsored_access_grants(recipient_id, expires_at DESC);

-- Focus Garden sessions table - Ganesha wisdom practice
CREATE TABLE IF NOT EXISTS focus_garden_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE SET NULL, -- Nullable for anonymous sessions

  -- Obstacle
  obstacle_name TEXT NOT NULL,
  obstacle_reframe TEXT,

  -- Three gates
  gate_protecting TEXT, -- What is this obstacle protecting you from?
  gate_accept TEXT,     -- What would you have to accept if it dissolved?
  gate_small_action TEXT, -- What small action honors both?

  -- Outcome
  chosen_action TEXT,
  pattern_saved BOOLEAN DEFAULT FALSE, -- Steward+ feature: save for continuity

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for member pattern retrieval
CREATE INDEX IF NOT EXISTS idx_focus_garden_member
  ON focus_garden_sessions(member_id, created_at DESC)
  WHERE member_id IS NOT NULL;

-- Index for pattern analysis (saved patterns only)
CREATE INDEX IF NOT EXISTS idx_focus_garden_patterns
  ON focus_garden_sessions(member_id)
  WHERE pattern_saved = TRUE;

-- Comments for documentation
COMMENT ON TABLE focus_weight_log IS 'Tracks cost-bearing actions for stewardship threshold system';
COMMENT ON COLUMN focus_weight_log.weight IS 'Action weight: capture=0, next_step=1, ai_draft=3, gmail_send=5, reminder=2, pattern_query=2, focus_garden_visit=1, focus_garden_complete=3';
COMMENT ON COLUMN members.stewardship_tier IS 'Stewardship tier: witness (free), holder ($9), steward ($19), sustainer ($49+), sponsored (gifted)';
COMMENT ON COLUMN members.sponsored_until IS 'If sponsored, when does sponsored access expire';
COMMENT ON TABLE sponsorship_pool IS 'Funds contributed by sustainers for sponsored access';
COMMENT ON TABLE sponsored_access_grants IS 'Records of sponsored access grants - privacy-preserving, no attribution';
COMMENT ON TABLE focus_garden_sessions IS 'Ganesha Focus Garden wisdom sessions - obstacle transformation records';
