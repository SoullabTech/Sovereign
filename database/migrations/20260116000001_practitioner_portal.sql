-- Practitioner Portal Schema
-- Multi-tenant system for astrology practitioners to have their own branded apps

-- ============== PRACTITIONERS ==============

CREATE TABLE IF NOT EXISTS practitioners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,           -- URL slug: "loralee" → loralee.soullab.life
  name VARCHAR(255) NOT NULL,                  -- Display name
  email VARCHAR(255) UNIQUE NOT NULL,

  -- Business info
  business_name VARCHAR(255),                  -- "Loralee Astrology"
  tagline TEXT,                                -- "Evolutionary Astrology for Soul Growth"
  bio TEXT,                                    -- About page content

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'onboarding'
    CHECK (status IN ('onboarding', 'building', 'active', 'paused', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  launched_at TIMESTAMPTZ,

  -- Stripe Connect
  stripe_account_id VARCHAR(255),              -- Their connected Stripe account
  revenue_share_percent NUMERIC(5,2) NOT NULL DEFAULT 12
    CHECK (revenue_share_percent >= 0 AND revenue_share_percent <= 100)
);

-- Add columns if they don't exist (for idempotent migrations)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practitioners' AND column_name = 'stripe_account_id') THEN
    ALTER TABLE practitioners ADD COLUMN stripe_account_id VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practitioners' AND column_name = 'revenue_share_percent') THEN
    ALTER TABLE practitioners ADD COLUMN revenue_share_percent NUMERIC(5,2) NOT NULL DEFAULT 12 CHECK (revenue_share_percent >= 0 AND revenue_share_percent <= 100);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_practitioners_slug ON practitioners(slug);
CREATE INDEX IF NOT EXISTS idx_practitioners_status ON practitioners(status);
CREATE INDEX IF NOT EXISTS idx_practitioners_stripe ON practitioners(stripe_account_id) WHERE stripe_account_id IS NOT NULL;

-- ============== AI COMPANION CONFIG ==============

CREATE TABLE IF NOT EXISTS ai_companion_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,

  -- Identity
  name VARCHAR(100) NOT NULL,                  -- "Stellium", "Luna", "Astria"
  pronouns VARCHAR(20) NOT NULL DEFAULT 'they/them'
    CHECK (pronouns IN ('she/her', 'he/him', 'they/them')),

  -- Voice & Personality
  voice_style VARCHAR(50) NOT NULL DEFAULT 'warm'
    CHECK (voice_style IN ('warm', 'poetic', 'direct', 'clinical', 'mystical', 'grounded')),
  tone JSONB NOT NULL DEFAULT '{"formality": 3, "warmth": 4, "depth": 3, "directness": 3}'::jsonb,

  -- Framework & Methodology
  frameworks JSONB NOT NULL DEFAULT '["psychological"]'::jsonb,
  primary_framework VARCHAR(50) NOT NULL DEFAULT 'psychological'
    CHECK (primary_framework IN ('evolutionary', 'archetypal', 'psychological', 'traditional', 'vedic', 'humanistic', 'esoteric', 'medical', 'horary', 'electional', 'mundane')),
  specialties JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Boundaries
  boundaries JSONB NOT NULL DEFAULT '{
    "noPredictions": true,
    "noMedicalAdvice": true,
    "noTherapy": true,
    "noRelationshipAdvice": false,
    "crisisReferral": true,
    "practitionerReferral": [],
    "customBoundaries": []
  }'::jsonb,

  -- Knowledge Base
  knowledge_base JSONB NOT NULL DEFAULT '{
    "ownMaterials": [],
    "referencedAuthors": [],
    "customInterpretations": {}
  }'::jsonb,

  -- System prompt (generated or custom override)
  system_prompt_template TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(practitioner_id)
);

CREATE INDEX IF NOT EXISTS idx_ai_configs_practitioner ON ai_companion_configs(practitioner_id);

-- ============== PRACTITIONER THEMES ==============

CREATE TABLE IF NOT EXISTS practitioner_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,

  -- Branding
  logo TEXT,                                   -- URL to logo
  favicon TEXT,                                -- URL to favicon
  hero_image TEXT,                             -- Hero/banner image

  -- Colors (stored as JSON)
  color_palette JSONB NOT NULL DEFAULT '{
    "primary": "#8B5CF6",
    "secondary": "#D946EF",
    "background": "#0f0d1a",
    "surface": "#1a1625",
    "text": "#e8e6f0",
    "textSecondary": "#a09cb0",
    "accent": "#FBBF24",
    "border": "#2d2640"
  }'::jsonb,

  -- Typography
  typography JSONB NOT NULL DEFAULT '{
    "headingFont": "Cormorant Garamond",
    "bodyFont": "Inter",
    "fontSize": "base"
  }'::jsonb,

  -- Vibe preset as starting point
  vibe_preset VARCHAR(50)
    CHECK (vibe_preset IS NULL OR vibe_preset IN ('celestial', 'mystical', 'warm', 'earthy', 'minimal', 'clinical')),

  -- Custom CSS (Sovereign tier)
  custom_css TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(practitioner_id)
);

CREATE INDEX IF NOT EXISTS idx_themes_practitioner ON practitioner_themes(practitioner_id);

-- ============== PRACTITIONER DOMAINS ==============

CREATE TABLE IF NOT EXISTS practitioner_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,

  -- Subdomain (always available)
  subdomain VARCHAR(100) NOT NULL,             -- "loralee" → loralee.soullab.life

  -- Custom domain (Sovereign tier)
  custom_domain VARCHAR(255),                  -- "stelliumbyloralee.com"
  custom_domain_verified BOOLEAN NOT NULL DEFAULT false,
  custom_domain_ssl BOOLEAN NOT NULL DEFAULT false,

  -- DNS records needed (stored as JSON)
  dns_records JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(practitioner_id),
  UNIQUE(subdomain),
  UNIQUE(custom_domain)
);

CREATE INDEX IF NOT EXISTS idx_domains_practitioner ON practitioner_domains(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_domains_subdomain ON practitioner_domains(subdomain);
CREATE INDEX IF NOT EXISTS idx_domains_custom ON practitioner_domains(custom_domain) WHERE custom_domain IS NOT NULL;

-- ============== PRACTITIONER FEATURES ==============

CREATE TABLE IF NOT EXISTS practitioner_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,

  -- Core features (always on)
  birth_chart BOOLEAN NOT NULL DEFAULT true,
  transits BOOLEAN NOT NULL DEFAULT true,
  synastry BOOLEAN NOT NULL DEFAULT true,
  ai_companion BOOLEAN NOT NULL DEFAULT true,

  -- Optional features
  chinese_astrology BOOLEAN NOT NULL DEFAULT false,
  mayan_astrology BOOLEAN NOT NULL DEFAULT false,
  life_cycles BOOLEAN NOT NULL DEFAULT false,
  dream_journal BOOLEAN NOT NULL DEFAULT false,
  session_notes BOOLEAN NOT NULL DEFAULT false,
  resource_library BOOLEAN NOT NULL DEFAULT false,

  -- Advanced features
  progressed_charts BOOLEAN NOT NULL DEFAULT false,
  solar_returns BOOLEAN NOT NULL DEFAULT false,
  composite_charts BOOLEAN NOT NULL DEFAULT false,
  horary BOOLEAN NOT NULL DEFAULT false,
  electional BOOLEAN NOT NULL DEFAULT false,

  -- Business features
  booking BOOLEAN NOT NULL DEFAULT false,
  payments BOOLEAN NOT NULL DEFAULT false,
  packages BOOLEAN NOT NULL DEFAULT false,
  gift_certificates BOOLEAN NOT NULL DEFAULT false,
  email_sequences BOOLEAN NOT NULL DEFAULT false,
  crm BOOLEAN NOT NULL DEFAULT false,

  -- Sovereign-only
  custom_domain BOOLEAN NOT NULL DEFAULT false,
  custom_css BOOLEAN NOT NULL DEFAULT false,
  white_label BOOLEAN NOT NULL DEFAULT false,   -- Remove Soullab branding
  api_access BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(practitioner_id)
);

CREATE INDEX IF NOT EXISTS idx_features_practitioner ON practitioner_features(practitioner_id);

-- ============== PRACTITIONER ONBOARDING ==============

CREATE TABLE IF NOT EXISTS practitioner_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,

  -- Progress
  current_step VARCHAR(50) NOT NULL DEFAULT 'profile_created'
    CHECK (current_step IN (
      'profile_created', 'spiral_session_1', 'spiral_session_2', 'spiral_session_3',
      'voice_extracted', 'framework_defined', 'aesthetics_chosen', 'materials_uploaded',
      'ai_configured', 'theme_applied', 'domain_setup', 'stripe_connected', 'ready_for_launch'
    )),
  completed_steps JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Spiral session data
  spiral_sessions JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Extracted insights
  extracted_voice JSONB,
  extracted_framework JSONB,
  extracted_aesthetics JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(practitioner_id)
);

CREATE INDEX IF NOT EXISTS idx_onboarding_practitioner ON practitioner_onboarding(practitioner_id);

-- ============== PRACTITIONER CLIENTS ==============

CREATE TABLE IF NOT EXISTS practitioner_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,

  -- Identity
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,

  -- Birth data (stored as JSON)
  birth_data JSONB,

  -- Relationship
  status VARCHAR(50) NOT NULL DEFAULT 'invited'
    CHECK (status IN ('invited', 'active', 'paused', 'archived')),
  tier VARCHAR(50) NOT NULL DEFAULT 'free'
    CHECK (tier IN ('free', 'subscriber', 'vip')),
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Engagement
  first_session_at TIMESTAMPTZ,
  last_session_at TIMESTAMPTZ,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  total_ai_conversations INTEGER NOT NULL DEFAULT 0,

  -- Subscription
  stripe_customer_id VARCHAR(255),
  subscription_id VARCHAR(255),
  subscription_status VARCHAR(50)
    CHECK (subscription_status IS NULL OR subscription_status IN ('active', 'past_due', 'canceled')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(practitioner_id, email)
);

-- Add columns if they don't exist (for idempotent migrations)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practitioner_clients' AND column_name = 'tier') THEN
    ALTER TABLE practitioner_clients ADD COLUMN tier VARCHAR(50) NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'subscriber', 'vip'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practitioner_clients' AND column_name = 'status') THEN
    ALTER TABLE practitioner_clients ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'paused', 'archived'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practitioner_clients' AND column_name = 'tags') THEN
    ALTER TABLE practitioner_clients ADD COLUMN tags JSONB NOT NULL DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practitioner_clients' AND column_name = 'stripe_customer_id') THEN
    ALTER TABLE practitioner_clients ADD COLUMN stripe_customer_id VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practitioner_clients' AND column_name = 'subscription_id') THEN
    ALTER TABLE practitioner_clients ADD COLUMN subscription_id VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practitioner_clients' AND column_name = 'subscription_status') THEN
    ALTER TABLE practitioner_clients ADD COLUMN subscription_status VARCHAR(50) CHECK (subscription_status IS NULL OR subscription_status IN ('active', 'past_due', 'canceled'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_clients_practitioner ON practitioner_clients(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON practitioner_clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON practitioner_clients(practitioner_id, status);
CREATE INDEX IF NOT EXISTS idx_clients_tier ON practitioner_clients(practitioner_id, tier);
CREATE INDEX IF NOT EXISTS idx_clients_stripe ON practitioner_clients(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- ============== REVENUE RECORDS ==============

CREATE TABLE IF NOT EXISTS revenue_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,

  -- Transaction
  type VARCHAR(50) NOT NULL
    CHECK (type IN ('session', 'subscription', 'package', 'product', 'gift')),
  amount INTEGER NOT NULL,                     -- In cents
  currency VARCHAR(3) NOT NULL DEFAULT 'usd',

  -- Revenue share
  platform_share INTEGER NOT NULL,             -- Amount to Soullab (cents)
  practitioner_share INTEGER NOT NULL,         -- Amount to practitioner (cents)
  share_percent NUMERIC(5,2) NOT NULL,         -- 12 or 10

  -- Stripe
  stripe_payment_id VARCHAR(255) NOT NULL,
  stripe_transfer_id VARCHAR(255),             -- Transfer to practitioner

  -- Client
  client_id UUID REFERENCES practitioner_clients(id) ON DELETE SET NULL,
  client_email VARCHAR(255),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_revenue_practitioner ON revenue_records(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_revenue_status ON revenue_records(status);
CREATE INDEX IF NOT EXISTS idx_revenue_created ON revenue_records(created_at);
CREATE INDEX IF NOT EXISTS idx_revenue_stripe_payment ON revenue_records(stripe_payment_id);

-- ============== KNOWLEDGE BASE MATERIALS ==============

CREATE TABLE IF NOT EXISTS practitioner_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,

  -- Material info
  type VARCHAR(50) NOT NULL
    CHECK (type IN ('pdf', 'doc', 'audio', 'video', 'text', 'url')),
  title VARCHAR(500) NOT NULL,
  description TEXT,

  -- Storage
  source_url TEXT,                             -- S3/storage URL
  file_size INTEGER,                           -- In bytes
  mime_type VARCHAR(100),

  -- Processing
  indexed_at TIMESTAMPTZ,
  vector_store_id VARCHAR(255),                -- For RAG retrieval
  processing_status VARCHAR(50) DEFAULT 'pending'
    CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  processing_error TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_materials_practitioner ON practitioner_materials(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_materials_type ON practitioner_materials(practitioner_id, type);
CREATE INDEX IF NOT EXISTS idx_materials_processing ON practitioner_materials(processing_status);

-- ============== AI CONVERSATION LOGS (for practitioner's clients) ==============

CREATE TABLE IF NOT EXISTS practitioner_ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,

  -- Conversation
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  message_count INTEGER NOT NULL DEFAULT 0,

  -- Context
  context_summary TEXT,                        -- AI-generated summary for practitioner review
  topics JSONB DEFAULT '[]'::jsonb,           -- Main topics discussed

  -- Flags
  flagged_for_review BOOLEAN NOT NULL DEFAULT false,
  practitioner_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_convos_practitioner ON practitioner_ai_conversations(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_ai_convos_client ON practitioner_ai_conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_ai_convos_flagged ON practitioner_ai_conversations(practitioner_id, flagged_for_review) WHERE flagged_for_review = true;

-- ============== TRIGGER FOR UPDATED_AT ==============

CREATE OR REPLACE FUNCTION update_practitioner_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at (idempotent with DROP IF EXISTS)
DROP TRIGGER IF EXISTS tr_practitioners_updated_at ON practitioners;
CREATE TRIGGER tr_practitioners_updated_at
  BEFORE UPDATE ON practitioners
  FOR EACH ROW EXECUTE FUNCTION update_practitioner_updated_at();

DROP TRIGGER IF EXISTS tr_ai_configs_updated_at ON ai_companion_configs;
CREATE TRIGGER tr_ai_configs_updated_at
  BEFORE UPDATE ON ai_companion_configs
  FOR EACH ROW EXECUTE FUNCTION update_practitioner_updated_at();

DROP TRIGGER IF EXISTS tr_themes_updated_at ON practitioner_themes;
CREATE TRIGGER tr_themes_updated_at
  BEFORE UPDATE ON practitioner_themes
  FOR EACH ROW EXECUTE FUNCTION update_practitioner_updated_at();

DROP TRIGGER IF EXISTS tr_domains_updated_at ON practitioner_domains;
CREATE TRIGGER tr_domains_updated_at
  BEFORE UPDATE ON practitioner_domains
  FOR EACH ROW EXECUTE FUNCTION update_practitioner_updated_at();

DROP TRIGGER IF EXISTS tr_features_updated_at ON practitioner_features;
CREATE TRIGGER tr_features_updated_at
  BEFORE UPDATE ON practitioner_features
  FOR EACH ROW EXECUTE FUNCTION update_practitioner_updated_at();

DROP TRIGGER IF EXISTS tr_onboarding_updated_at ON practitioner_onboarding;
CREATE TRIGGER tr_onboarding_updated_at
  BEFORE UPDATE ON practitioner_onboarding
  FOR EACH ROW EXECUTE FUNCTION update_practitioner_updated_at();

DROP TRIGGER IF EXISTS tr_clients_updated_at ON practitioner_clients;
CREATE TRIGGER tr_clients_updated_at
  BEFORE UPDATE ON practitioner_clients
  FOR EACH ROW EXECUTE FUNCTION update_practitioner_updated_at();

DROP TRIGGER IF EXISTS tr_materials_updated_at ON practitioner_materials;
CREATE TRIGGER tr_materials_updated_at
  BEFORE UPDATE ON practitioner_materials
  FOR EACH ROW EXECUTE FUNCTION update_practitioner_updated_at();

-- ============== COMMENTS ==============

COMMENT ON TABLE practitioners IS 'Astrology practitioners who have their own branded portals';
COMMENT ON TABLE ai_companion_configs IS 'Configuration for each practitioner''s AI companion (voice, framework, boundaries)';
COMMENT ON TABLE practitioner_themes IS 'Visual branding and styling for each practitioner''s portal';
COMMENT ON TABLE practitioner_domains IS 'Domain routing configuration for subdomains and custom domains';
COMMENT ON TABLE practitioner_features IS 'Feature flags controlling what functionality each practitioner has access to';
COMMENT ON TABLE practitioner_onboarding IS 'Onboarding progress and extracted insights from spiral sessions';
COMMENT ON TABLE practitioner_clients IS 'Clients who use a specific practitioner''s portal';
COMMENT ON TABLE revenue_records IS 'Revenue tracking for revenue share calculation';
COMMENT ON TABLE practitioner_materials IS 'Uploaded materials for knowledge base (PDFs, recordings, etc.)';
COMMENT ON TABLE practitioner_ai_conversations IS 'Logs of AI conversations between practitioner''s AI and their clients';
