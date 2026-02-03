-- ============================================
-- Migration: Upgrade Prompts & Helper Fund
-- ============================================
-- Tables for tracking upgrade prompts shown to users
-- and managing the Helper Fund scholarship system.

-- Upgrade prompts tracking
CREATE TABLE IF NOT EXISTS upgrade_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Prompt details
  prompt_type VARCHAR(50) NOT NULL,
  prompt_trigger VARCHAR(100) NOT NULL,
  prompt_context JSONB DEFAULT '{}',

  -- Timing
  shown_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Response
  response VARCHAR(50) DEFAULT NULL,
  response_at TIMESTAMPTZ DEFAULT NULL,

  -- Cooldown (when can we show another prompt)
  cooldown_until TIMESTAMPTZ DEFAULT NULL,

  CONSTRAINT valid_prompt_type CHECK (
    prompt_type IN ('supporter', 'earn_to_studio', 'annual_checkin', 'feature_gate', 'threshold', 'helper_fund')
  ),

  CONSTRAINT valid_response CHECK (
    response IS NULL OR response IN ('upgraded', 'dismissed', 'later', 'not_interested')
  )
);

COMMENT ON TABLE upgrade_prompts IS 'Tracks upgrade prompts shown to users and their responses';

-- Index for checking cooldown
CREATE INDEX IF NOT EXISTS idx_upgrade_prompts_cooldown
ON upgrade_prompts(member_id, cooldown_until);

-- Index for analyzing prompt effectiveness
CREATE INDEX IF NOT EXISTS idx_upgrade_prompts_type_response
ON upgrade_prompts(prompt_type, response);

-- ============================================
-- Helper Fund Applications
-- ============================================

CREATE TABLE IF NOT EXISTS helper_fund_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Application details
  situation TEXT NOT NULL,
  duration_requested VARCHAR(20) NOT NULL,
  support_type VARCHAR(30) NOT NULL,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending',

  -- Review
  reviewed_by UUID REFERENCES members(id),
  reviewed_at TIMESTAMPTZ DEFAULT NULL,
  review_notes TEXT DEFAULT NULL,

  -- Scholarship period (if approved)
  scholarship_start DATE DEFAULT NULL,
  scholarship_end DATE DEFAULT NULL,

  -- Timestamps
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_duration CHECK (
    duration_requested IN ('3_months', '6_months', 'ongoing')
  ),

  CONSTRAINT valid_support_type CHECK (
    support_type IN ('waived', 'reduced', 'full_scholarship')
  ),

  CONSTRAINT valid_status CHECK (
    status IN ('pending', 'approved', 'declined', 'expired')
  )
);

COMMENT ON TABLE helper_fund_applications IS 'Scholarship applications for the Helper Fund';

-- Index for pending applications
CREATE INDEX IF NOT EXISTS idx_helper_applications_pending
ON helper_fund_applications(status)
WHERE status = 'pending';

-- Index for active scholarships
CREATE INDEX IF NOT EXISTS idx_helper_applications_active
ON helper_fund_applications(member_id, scholarship_end)
WHERE status = 'approved';

-- ============================================
-- Helper Fund Contributions
-- ============================================

CREATE TABLE IF NOT EXISTS helper_fund_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Amount
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',

  -- Source
  source VARCHAR(30) NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT false,

  -- Stripe references
  stripe_payment_id VARCHAR(255) DEFAULT NULL,
  stripe_subscription_id VARCHAR(255) DEFAULT NULL,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  paused_until TIMESTAMPTZ DEFAULT NULL,
  cancelled_at TIMESTAMPTZ DEFAULT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_source CHECK (
    source IN ('practitioner', 'client_roundup', 'direct')
  ),

  CONSTRAINT valid_status CHECK (
    status IN ('active', 'paused', 'cancelled')
  ),

  CONSTRAINT positive_amount CHECK (amount_cents > 0)
);

COMMENT ON TABLE helper_fund_contributions IS 'Contributions to the Helper Fund from practitioners and community members';

-- Index for active contributions
CREATE INDEX IF NOT EXISTS idx_helper_contributions_active
ON helper_fund_contributions(status)
WHERE status = 'active';

-- Index for member contributions
CREATE INDEX IF NOT EXISTS idx_helper_contributions_member
ON helper_fund_contributions(member_id, status);
