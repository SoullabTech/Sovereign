-- SLIDING SCALE ENGINE
-- Dignified affordability system for practitioners
-- "No income verification. No uploads. No power games."

-- 1) SLIDING SCALE POLICIES
-- One policy per practitioner (v1 constraint)
CREATE TABLE IF NOT EXISTS sliding_scale_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Toggle
  is_enabled BOOLEAN NOT NULL DEFAULT false,

  -- Public-facing copy
  public_label TEXT DEFAULT 'Sliding scale availability',
  public_description TEXT,

  -- Rate bounds
  min_rate_cents INTEGER NOT NULL DEFAULT 0,
  max_rate_cents INTEGER NOT NULL DEFAULT 0,
  session_length_minutes INTEGER NOT NULL DEFAULT 60,
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Capacity management
  spots_total INTEGER NOT NULL DEFAULT 0,
  spots_filled INTEGER NOT NULL DEFAULT 0,

  -- Form settings
  request_form_enabled BOOLEAN NOT NULL DEFAULT true,
  auto_close_when_full BOOLEAN NOT NULL DEFAULT true,
  intake_prompt TEXT DEFAULT 'If cost is a barrier, share what feels sustainable right now—briefly is fine.',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT positive_rates CHECK (min_rate_cents >= 0 AND max_rate_cents >= 0),
  CONSTRAINT rate_order CHECK (min_rate_cents <= max_rate_cents),
  CONSTRAINT positive_spots CHECK (spots_total >= 0 AND spots_filled >= 0),
  CONSTRAINT spots_not_overfilled CHECK (spots_filled <= spots_total)
);

-- One policy per practitioner (v1)
CREATE UNIQUE INDEX IF NOT EXISTS idx_sliding_scale_policies_practitioner
  ON sliding_scale_policies(practitioner_id);

-- 2) SLIDING SCALE REQUESTS
-- Queue of client requests for sliding scale spots
CREATE TABLE IF NOT EXISTS sliding_scale_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Client info (nullable - can be existing client or portal lead)
  client_id UUID REFERENCES practitioner_clients(id) ON DELETE SET NULL,
  portal_token_id UUID,
  client_email TEXT,
  client_name TEXT,

  -- Request details
  requested_rate_cents INTEGER,
  preferred_range_min_cents INTEGER,
  preferred_range_max_cents INTEGER,
  message TEXT,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'declined', 'withdrawn', 'expired')),
  decision_note TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES members(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Efficient queries for practitioner inbox
CREATE INDEX IF NOT EXISTS idx_sliding_scale_requests_practitioner_status
  ON sliding_scale_requests(practitioner_id, status, created_at DESC);

-- Fast pending count
CREATE INDEX IF NOT EXISTS idx_sliding_scale_requests_pending
  ON sliding_scale_requests(practitioner_id)
  WHERE status = 'pending';

-- 3) SLIDING SCALE AWARDS
-- Approved requests become awards (attached to billing/booking)
CREATE TABLE IF NOT EXISTS sliding_scale_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES sliding_scale_requests(id) ON DELETE CASCADE,
  client_id UUID REFERENCES practitioner_clients(id) ON DELETE SET NULL,

  -- Award details
  rate_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'ended')),

  -- Duration
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,

  -- Private notes (de-identified)
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One award per request
CREATE UNIQUE INDEX IF NOT EXISTS idx_sliding_scale_awards_request
  ON sliding_scale_awards(request_id);

-- Efficient practitioner queries
CREATE INDEX IF NOT EXISTS idx_sliding_scale_awards_practitioner_status
  ON sliding_scale_awards(practitioner_id, status);

-- Active awards for a client
CREATE INDEX IF NOT EXISTS idx_sliding_scale_awards_client
  ON sliding_scale_awards(client_id)
  WHERE status = 'active';

-- Update trigger for policies
CREATE OR REPLACE FUNCTION update_sliding_scale_policy_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_sliding_scale_policy_timestamp ON sliding_scale_policies;
CREATE TRIGGER trigger_update_sliding_scale_policy_timestamp
  BEFORE UPDATE ON sliding_scale_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_sliding_scale_policy_timestamp();

-- Comments for documentation
COMMENT ON TABLE sliding_scale_policies IS 'Practitioner sliding scale policy configuration';
COMMENT ON TABLE sliding_scale_requests IS 'Client requests for sliding scale spots';
COMMENT ON TABLE sliding_scale_awards IS 'Approved sliding scale awards attached to clients';
COMMENT ON COLUMN sliding_scale_policies.spots_filled IS 'Denormalized count - keep consistent via transactions';
COMMENT ON COLUMN sliding_scale_requests.decision_note IS 'Private, de-identified note about the decision';
COMMENT ON COLUMN sliding_scale_awards.notes IS 'Private, de-identified notes about the award';
