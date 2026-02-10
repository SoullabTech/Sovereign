-- Migration: Portal Enhancements
-- Description: Add missing columns for portal home API and seed Loralee's data
-- Date: 2026-01-27

-- =============================================================================
-- ADD MISSING COLUMNS TO PRACTITIONERS
-- =============================================================================

-- Add photo_url column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'practitioners' AND column_name = 'photo_url'
  ) THEN
    ALTER TABLE practitioners ADD COLUMN photo_url TEXT;
  END IF;
END $$;

-- Add specialties column (text array — matches earlier migrations 20260118/20260122)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'practitioners' AND column_name = 'specialties'
  ) THEN
    ALTER TABLE practitioners ADD COLUMN specialties TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Add years_experience column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'practitioners' AND column_name = 'years_experience'
  ) THEN
    ALTER TABLE practitioners ADD COLUMN years_experience INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add settings column (JSONB for misc portal settings)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'practitioners' AND column_name = 'settings'
  ) THEN
    ALTER TABLE practitioners ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- =============================================================================
-- CREATE SERVICES TABLE (if not exists)
-- =============================================================================

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,

  -- Service info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price_cents INTEGER NOT NULL DEFAULT 0,

  -- Display
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_practitioner ON services(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(practitioner_id, is_active);

-- =============================================================================
-- CREATE TESTIMONIALS TABLE (if not exists)
-- =============================================================================

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,

  -- Content
  client_name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),

  -- Display
  is_approved BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_practitioner ON testimonials(practitioner_id);

-- =============================================================================
-- CREATE LEAD_MAGNETS TABLE (if not exists)
-- =============================================================================

CREATE TABLE IF NOT EXISTS lead_magnets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,

  -- Content
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL DEFAULT 'pdf' CHECK (type IN ('pdf', 'video', 'audio', 'course', 'guide')),

  -- File/content
  content_url TEXT,

  -- Display
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_magnets_practitioner ON lead_magnets(practitioner_id);

-- =============================================================================
-- SEED LORALEE'S PRACTITIONER DATA
-- =============================================================================

-- Insert Loralee as a practitioner (if not exists)
INSERT INTO practitioners (
  slug,
  name,
  email,
  business_name,
  tagline,
  bio,
  photo_url,
  specialties,
  years_experience,
  status,
  settings
)
SELECT
  'loralee',
  'Loralee Geil',
  'loralee@soullab.life',
  'Stellium by Loralee',
  'Evolutionary Astrology for Soul Growth',
  'I blend evolutionary astrology with music and healing to guide you through life''s transitions. My approach honors the wisdom of the stars while keeping your feet firmly on the ground.

Through natal charts, transits, and synastry, I help you understand your soul''s journey and navigate relationships, career, and personal growth with cosmic clarity.

Whether you''re facing a Saturn return, exploring your life purpose, or seeking guidance through a challenging transit, I''m here to illuminate your path.',
  NULL, -- Photo URL to be added later
  ARRAY['Evolutionary Astrology', 'Natal Charts', 'Transit Analysis', 'Synastry', 'Life Cycles']::text[],
  15,
  'active',
  '{
    "primary_color": "#D4AF37",
    "secondary_color": "#1A1625",
    "accent_color": "#E8B4CB",
    "theme": "starlight-muse"
  }'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM practitioners WHERE slug = 'loralee'
);

-- Get Loralee's ID for related inserts
DO $$
DECLARE
  loralee_id UUID;
BEGIN
  SELECT id INTO loralee_id FROM practitioners WHERE slug = 'loralee';

  IF loralee_id IS NOT NULL THEN
    -- Insert services (if none exist)
    IF NOT EXISTS (SELECT 1 FROM services WHERE practitioner_id = loralee_id) THEN
      INSERT INTO services (practitioner_id, name, description, duration_minutes, price_cents, is_featured, display_order) VALUES
        (loralee_id, 'Natal Chart Reading', 'A deep dive into your birth chart exploring your soul''s blueprint, life themes, and evolutionary journey. We''ll examine planetary placements, aspects, and the story your chart tells about who you came here to become.', 90, 15000, true, 1),
        (loralee_id, 'Transit Consultation', 'Navigate current cosmic energies with clarity. We''ll examine what planets are activating your chart now and how to work with these energies for growth and transformation.', 60, 10000, false, 2),
        (loralee_id, 'Synastry Session', 'Explore the cosmic dynamics between you and another person. Perfect for romantic relationships, family connections, or business partnerships.', 75, 12500, false, 3),
        (loralee_id, 'Saturn Return Guidance', 'Specialized support for this pivotal life transition (ages 28-30 or 57-60). Understand what Saturn is asking of you and how to build the foundations for your next chapter.', 90, 15000, true, 4),
        (loralee_id, 'Year Ahead Forecast', 'A comprehensive look at the transits coming your way in the next 12 months. Know when to push forward, when to rest, and how to make the most of cosmic opportunities.', 75, 12500, false, 5);
    END IF;

    -- Insert testimonials (if none exist)
    IF NOT EXISTS (SELECT 1 FROM testimonials WHERE practitioner_id = loralee_id) THEN
      INSERT INTO testimonials (practitioner_id, client_name, content, rating, is_approved, is_featured) VALUES
        (loralee_id, 'Sarah M.', 'Loralee''s reading was incredibly insightful. She helped me understand patterns I''ve struggled with for years and gave me practical tools for working with my chart.', 5, true, true),
        (loralee_id, 'Michael R.', 'Going through my Saturn return was terrifying until I had a session with Loralee. Her guidance helped me see it as an opportunity rather than a crisis.', 5, true, true),
        (loralee_id, 'Elena K.', 'The synastry reading with my partner opened up conversations we''d been avoiding. Loralee has a gift for translating cosmic wisdom into real-life understanding.', 5, true, false),
        (loralee_id, 'David L.', 'Every year I book a Year Ahead session. It''s become essential for planning and preparation. Loralee''s accuracy is remarkable.', 5, true, false);
    END IF;

    -- Insert lead magnet (if none exists)
    IF NOT EXISTS (SELECT 1 FROM lead_magnets WHERE practitioner_id = loralee_id) THEN
      INSERT INTO lead_magnets (practitioner_id, name, description, type, is_active, is_featured) VALUES
        (loralee_id, 'Understanding Your Saturn Return', 'A free guide to navigating the most significant astrological transit of your late 20s. Learn what Saturn is asking of you and how to build a stronger foundation.', 'guide', true, true);
    END IF;
  END IF;
END $$;

-- =============================================================================
-- ADD UPDATE TRIGGERS
-- =============================================================================

DROP TRIGGER IF EXISTS tr_services_updated_at ON services;
CREATE TRIGGER tr_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_practitioner_updated_at();
