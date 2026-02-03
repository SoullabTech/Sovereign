-- Migration: Practitioner FAQs and Enhanced Client Fields
-- Description: Add FAQ management and astrology-enhanced client fields
-- Date: 2026-01-18

-- ============================================
-- PRACTITIONER FAQs TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS practitioner_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general'
    CHECK (category IN (
      'about_sessions',
      'booking_scheduling',
      'astrology_questions',
      'payments',
      'about_practitioner',
      'general'
    )),
  display_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for FAQ queries
CREATE INDEX IF NOT EXISTS idx_practitioner_faqs_practitioner
  ON practitioner_faqs(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_practitioner_faqs_category
  ON practitioner_faqs(practitioner_id, category, display_order);
CREATE INDEX IF NOT EXISTS idx_practitioner_faqs_published
  ON practitioner_faqs(practitioner_id, is_published);

-- ============================================
-- ENHANCED CLIENT FIELDS FOR ASTROLOGY
-- ============================================

-- Birth time accuracy tracking
ALTER TABLE practitioner_clients
ADD COLUMN IF NOT EXISTS birth_time_accuracy VARCHAR(20) DEFAULT 'unknown'
  CHECK (birth_time_accuracy IN ('exact', 'approximate', 'rectified', 'unknown'));

-- Chart image storage
ALTER TABLE practitioner_clients
ADD COLUMN IF NOT EXISTS chart_image_url TEXT;

-- Key astrological placements for quick reference and transit alerts
ALTER TABLE practitioner_clients
ADD COLUMN IF NOT EXISTS key_placements JSONB DEFAULT '{}';
-- Example: { "sun_sign": "Capricorn", "moon_sign": "Pisces", "rising_sign": "Scorpio",
--            "saturn_sign": "Aquarius", "saturn_house": 3, "north_node_sign": "Taurus" }

-- Total revenue tracking for client profiles
ALTER TABLE practitioner_clients
ADD COLUMN IF NOT EXISTS total_revenue DECIMAL(10, 2) DEFAULT 0;

-- ============================================
-- CLIENT RELATIONSHIPS TABLE (for synastry)
-- ============================================

CREATE TABLE IF NOT EXISTS client_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL,
  client_id UUID NOT NULL,
  -- Can be an existing client or just partner info
  partner_client_id UUID REFERENCES practitioner_clients(id),
  partner_name VARCHAR(255),
  partner_birth_date DATE,
  partner_birth_time TIME,
  partner_birth_location VARCHAR(255),
  partner_birth_timezone VARCHAR(50),
  relationship_type VARCHAR(50)
    CHECK (relationship_type IN ('romantic', 'family', 'business', 'friend', 'other')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_relationships_practitioner
  ON client_relationships(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_client_relationships_client
  ON client_relationships(client_id);

-- ============================================
-- PRACTITIONERS TABLE (if not exists)
-- ============================================

CREATE TABLE IF NOT EXISTS practitioners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  modality VARCHAR(50) DEFAULT 'astrology'
    CHECK (modality IN ('astrology', 'therapy', 'bodywork', 'coaching', 'shamanic', 'other')),
  brand JSONB DEFAULT '{}',
  -- Example: { "name": "Stellium by Loralee", "tagline": "Your Cosmic Guide",
  --            "logo_url": "...", "primary_color": "#E5C158" }
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practitioners_member
  ON practitioners(member_id);
CREATE INDEX IF NOT EXISTS idx_practitioners_slug
  ON practitioners(slug);

-- Add member_id to practitioners table if it doesn't exist
ALTER TABLE practitioners
ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES members(id);

-- ============================================
-- MESSAGING TABLE (for Phase 5)
-- ============================================

CREATE TABLE IF NOT EXISTS practitioner_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL,
  client_id UUID REFERENCES practitioner_clients(id),
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  channel VARCHAR(20) DEFAULT 'email'
    CHECK (channel IN ('email', 'portal', 'sms')),
  subject TEXT,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_practitioner_messages_practitioner
  ON practitioner_messages(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_practitioner_messages_client
  ON practitioner_messages(practitioner_id, client_id);
CREATE INDEX IF NOT EXISTS idx_practitioner_messages_unread
  ON practitioner_messages(practitioner_id, is_read) WHERE is_read = false;

-- ============================================
-- UPDATED_AT TRIGGER FOR NEW TABLES
-- ============================================

-- Create the trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to new tables
DROP TRIGGER IF EXISTS update_practitioner_faqs_updated_at ON practitioner_faqs;
CREATE TRIGGER update_practitioner_faqs_updated_at
  BEFORE UPDATE ON practitioner_faqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_relationships_updated_at ON client_relationships;
CREATE TRIGGER update_client_relationships_updated_at
  BEFORE UPDATE ON client_relationships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_practitioners_updated_at ON practitioners;
CREATE TRIGGER update_practitioners_updated_at
  BEFORE UPDATE ON practitioners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE FAQ DATA (for Loralee template)
-- ============================================

-- This can be uncommented to seed initial FAQ data
-- INSERT INTO practitioner_faqs (practitioner_id, question, answer, category, display_order)
-- VALUES
--   ('YOUR_PRACTITIONER_ID', 'What is a natal chart reading?', 'A natal chart reading is a personalized map of the sky at the exact moment of your birth...', 'about_sessions', 0),
--   ('YOUR_PRACTITIONER_ID', 'How do I prepare for my reading?', 'Before our session, I recommend having your exact birth time ready...', 'about_sessions', 1),
--   ('YOUR_PRACTITIONER_ID', 'How do I book a session?', 'You can book directly through my portal by clicking "Book Now"...', 'booking_scheduling', 0),
--   ('YOUR_PRACTITIONER_ID', 'What is my cancellation policy?', 'Sessions can be rescheduled up to 24 hours in advance...', 'booking_scheduling', 1),
--   ('YOUR_PRACTITIONER_ID', 'Do I need my exact birth time?', 'While exact birth time allows for the most accurate reading...', 'astrology_questions', 0),
--   ('YOUR_PRACTITIONER_ID', 'What payment methods do you accept?', 'I accept all major credit cards through Stripe...', 'payments', 0);

COMMENT ON TABLE practitioner_faqs IS 'Frequently asked questions for practitioner portals';
COMMENT ON TABLE client_relationships IS 'Tracks relationships between clients for synastry readings';
COMMENT ON TABLE practitioner_messages IS 'Messaging between practitioners and clients';
