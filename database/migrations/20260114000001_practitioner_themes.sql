-- Migration: Practitioner Themes
-- Description: Theme configuration for practitioner platform customization
-- Version: 1
-- Date: 2026-01-14

-- =============================================================================
-- PRACTITIONERS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS practitioners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Member linkage
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,

  -- Identity
  practice_name VARCHAR(255) NOT NULL,
  practitioner_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,

  -- Subdomain/domain
  slug VARCHAR(100) NOT NULL UNIQUE, -- e.g. "alice" for alice.soullab.life
  custom_domain VARCHAR(255), -- e.g. "aliceastrology.com"

  -- Subscription tier
  tier VARCHAR(20) NOT NULL DEFAULT 'starter' CHECK (tier IN ('starter', 'professional', 'sovereign')),

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'onboarding' CHECK (status IN ('onboarding', 'active', 'suspended', 'churned')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  onboarded_at TIMESTAMPTZ,

  -- Stripe
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_practitioners_member_id ON practitioners(member_id);
CREATE INDEX IF NOT EXISTS idx_practitioners_slug ON practitioners(slug);
CREATE INDEX IF NOT EXISTS idx_practitioners_status ON practitioners(status);

-- =============================================================================
-- PRACTITIONER THEMES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS practitioner_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,

  -- Schema version for migrations
  version INTEGER NOT NULL DEFAULT 1,

  -- Full theme config as JSONB
  theme_json JSONB NOT NULL,

  -- Denormalized fields for querying
  vibe VARCHAR(50),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_practitioner_theme UNIQUE (practitioner_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_practitioner_themes_practitioner_id ON practitioner_themes(practitioner_id);

-- =============================================================================
-- PRACTITIONER THEME HISTORY (for rollback/audit)
-- =============================================================================

CREATE TABLE IF NOT EXISTS practitioner_theme_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,

  -- Snapshot
  version INTEGER NOT NULL,
  theme_json JSONB NOT NULL,

  -- Change context
  changed_by VARCHAR(255), -- 'practitioner', 'admin', 'system'
  change_reason TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for history lookup
CREATE INDEX IF NOT EXISTS idx_theme_history_practitioner_id ON practitioner_theme_history(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_theme_history_created_at ON practitioner_theme_history(created_at DESC);

-- =============================================================================
-- PRACTITIONER CLIENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS practitioner_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,

  -- Client member linkage (if registered)
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,

  -- Client info
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),

  -- Intake data (practitioner-defined questions)
  intake_responses JSONB DEFAULT '{}',

  -- Birth data (for astrologers)
  birth_date DATE,
  birth_time TIME,
  birth_location VARCHAR(255),
  birth_latitude DECIMAL(10, 7),
  birth_longitude DECIMAL(10, 7),

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'paused', 'completed', 'archived')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invited_at TIMESTAMPTZ,
  onboarded_at TIMESTAMPTZ,
  last_session_at TIMESTAMPTZ,

  -- Notes (practitioner-only)
  internal_notes TEXT,

  -- Constraints
  CONSTRAINT unique_practitioner_client_email UNIQUE (practitioner_id, email)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_practitioner_clients_practitioner_id ON practitioner_clients(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_practitioner_clients_member_id ON practitioner_clients(member_id);
CREATE INDEX IF NOT EXISTS idx_practitioner_clients_status ON practitioner_clients(status);

-- =============================================================================
-- PRACTITIONER USAGE METRICS
-- =============================================================================

CREATE TABLE IF NOT EXISTS practitioner_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,

  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Counts
  message_count INTEGER NOT NULL DEFAULT 0,
  voice_minutes INTEGER NOT NULL DEFAULT 0,
  active_clients INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_practitioner_period UNIQUE (practitioner_id, period_start, period_end)
);

-- Index for usage lookups
CREATE INDEX IF NOT EXISTS idx_practitioner_usage_period ON practitioner_usage(practitioner_id, period_start);

-- =============================================================================
-- TRIGGER: Auto-update updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all practitioner tables
DROP TRIGGER IF EXISTS update_practitioners_updated_at ON practitioners;
CREATE TRIGGER update_practitioners_updated_at
  BEFORE UPDATE ON practitioners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_practitioner_themes_updated_at ON practitioner_themes;
CREATE TRIGGER update_practitioner_themes_updated_at
  BEFORE UPDATE ON practitioner_themes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_practitioner_clients_updated_at ON practitioner_clients;
CREATE TRIGGER update_practitioner_clients_updated_at
  BEFORE UPDATE ON practitioner_clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_practitioner_usage_updated_at ON practitioner_usage;
CREATE TRIGGER update_practitioner_usage_updated_at
  BEFORE UPDATE ON practitioner_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TRIGGER: Archive theme on update
-- =============================================================================

CREATE OR REPLACE FUNCTION archive_theme_on_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.theme_json IS DISTINCT FROM NEW.theme_json THEN
    INSERT INTO practitioner_theme_history (
      practitioner_id,
      version,
      theme_json,
      changed_by,
      change_reason
    ) VALUES (
      OLD.practitioner_id,
      OLD.version,
      OLD.theme_json,
      'system',
      'Auto-archived on update'
    );
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS archive_theme_on_update ON practitioner_themes;
CREATE TRIGGER archive_theme_on_update
  BEFORE UPDATE ON practitioner_themes
  FOR EACH ROW EXECUTE FUNCTION archive_theme_on_update();
