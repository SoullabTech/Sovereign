-- ============================================
-- Migration: Usage Metrics Tables
-- ============================================
-- Tables for tracking usage metrics that inform upgrade prompts.
-- Philosophy: Track enough to be helpful, not enough to be creepy.

-- Practitioner usage metrics (for Earn → Studio prompts)
CREATE TABLE IF NOT EXISTS practitioner_usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Metrics
  sessions_completed INTEGER DEFAULT 0,
  active_clients INTEGER DEFAULT 0,
  revenue_cents INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint for upsert
  UNIQUE(member_id, period_start, period_end)
);

COMMENT ON TABLE practitioner_usage_metrics IS 'Monthly usage metrics for practitioners to inform upgrade prompts';

-- Member usage metrics (for Free → Supporter prompts)
CREATE TABLE IF NOT EXISTS member_usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Metrics
  journal_entries INTEGER DEFAULT 0,
  conversations_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint for upsert
  UNIQUE(member_id, period_start, period_end)
);

COMMENT ON TABLE member_usage_metrics IS 'Monthly usage metrics for members to inform upgrade prompts';

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_practitioner_usage_member
ON practitioner_usage_metrics(member_id, period_start);

CREATE INDEX IF NOT EXISTS idx_member_usage_member
ON member_usage_metrics(member_id, period_start);
