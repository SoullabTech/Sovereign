/**
 * TRUSTED COLLEAGUES - WARM HANDOFF SYSTEM
 *
 * "Not a social network. A guild layer with dignity and containment."
 *
 * Three tables:
 * 1. practitioner_directory_profiles - opt-in listing (private by default)
 * 2. practitioner_connections - mutual trust handshake
 * 3. referral_requests - de-identified packets between colleagues
 */

-- ============================================
-- 1. DIRECTORY PROFILES (OPT-IN LISTING)
-- ============================================

CREATE TABLE IF NOT EXISTS practitioner_directory_profiles (
  practitioner_id UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,

  -- Visibility (INVARIANT #1: private by default)
  is_listed BOOLEAN NOT NULL DEFAULT false,
  accepting_referrals BOOLEAN NOT NULL DEFAULT true,

  -- Profile content
  display_name TEXT,
  location TEXT,                -- Broad, e.g., "Bay Area" not exact address
  bio TEXT,

  -- Searchable facets
  modalities TEXT[],            -- e.g., ['somatic', 'IFS', 'EMDR']
  tags TEXT[],                  -- e.g., ['grief', 'anxiety', 'transitions', 'couples']
  languages TEXT[],

  -- Sliding scale indicator (links to sliding scale engine)
  accepts_sliding_scale BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for directory search
CREATE INDEX IF NOT EXISTS idx_directory_listed
  ON practitioner_directory_profiles(is_listed) WHERE is_listed = true;
CREATE INDEX IF NOT EXISTS idx_directory_modalities
  ON practitioner_directory_profiles USING GIN(modalities);
CREATE INDEX IF NOT EXISTS idx_directory_tags
  ON practitioner_directory_profiles USING GIN(tags);

-- ============================================
-- 2. CONNECTIONS (MUTUAL TRUST HANDSHAKE)
-- ============================================

CREATE TABLE IF NOT EXISTS practitioner_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The two practitioners (requester initiates, recipient accepts)
  requester_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Status (INVARIANT #3: mutual acceptance required)
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),

  -- Timestamps
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent self-connections and duplicates
  CONSTRAINT no_self_connection CHECK (requester_id != recipient_id),
  CONSTRAINT unique_connection UNIQUE (requester_id, recipient_id)
);

-- Indexes for connection queries
CREATE INDEX IF NOT EXISTS idx_connections_requester
  ON practitioner_connections(requester_id, status);
CREATE INDEX IF NOT EXISTS idx_connections_recipient
  ON practitioner_connections(recipient_id, status);

-- ============================================
-- 3. REFERRAL REQUESTS (WARM HANDOFFS)
-- ============================================

CREATE TABLE IF NOT EXISTS referral_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The practitioners involved
  from_practitioner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  to_practitioner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- INVARIANT #5: hard-enforced colleagues-only
  connection_id UUID NOT NULL REFERENCES practitioner_connections(id) ON DELETE CASCADE,

  -- Referral status
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'received', 'accepted', 'declined', 'closed')),

  -- De-identified client descriptors (DEFAULT PATH - no names)
  client_age_range TEXT,        -- e.g., "30-40"
  client_pronouns TEXT,
  presenting_themes TEXT[],     -- What they're working on
  urgency TEXT NOT NULL DEFAULT 'routine'
    CHECK (urgency IN ('routine', 'soon', 'time_sensitive')),
  constraints TEXT[],           -- e.g., ['telehealth', 'evenings', 'sliding scale']

  -- INVARIANT #4: requester note is private to requester
  requester_note TEXT NOT NULL,

  -- CONSENT + IDENTIFYING INFO (EXPLICIT UNLOCK ONLY)
  -- INVARIANT #2: no client exposure without explicit consent
  client_consent_given BOOLEAN NOT NULL DEFAULT false,
  client_name_shared BOOLEAN NOT NULL DEFAULT false,
  client_name TEXT,
  client_contact TEXT,
  consent_recorded_at TIMESTAMPTZ,

  -- INVARIANT #4: recipient note is private to recipient
  recipient_note TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,

  -- CRITICAL CHECK: name/contact cannot exist without both consent flags
  -- This is the "hard to accidentally break later" piece
  CONSTRAINT consent_required_for_identity CHECK (
    (client_consent_given = true AND client_name_shared = true)
    OR (client_name IS NULL AND client_contact IS NULL)
  )
);

-- Indexes for referral queries
CREATE INDEX IF NOT EXISTS idx_referrals_from
  ON referral_requests(from_practitioner_id, status);
CREATE INDEX IF NOT EXISTS idx_referrals_to
  ON referral_requests(to_practitioner_id, status);
CREATE INDEX IF NOT EXISTS idx_referrals_themes
  ON referral_requests USING GIN(presenting_themes);

-- ============================================
-- HELPER FUNCTION: Check if connection is accepted
-- ============================================

CREATE OR REPLACE FUNCTION is_colleague(practitioner_a UUID, practitioner_b UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM practitioner_connections
    WHERE status = 'accepted'
      AND (
        (requester_id = practitioner_a AND recipient_id = practitioner_b)
        OR (requester_id = practitioner_b AND recipient_id = practitioner_a)
      )
  );
END;
$$ LANGUAGE plpgsql STABLE;
