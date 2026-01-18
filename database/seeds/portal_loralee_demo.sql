-- ============================================
-- LORALEE PORTAL DEMO DATA
-- Seeds the practitioners table and related portal data
-- ============================================

-- Create Loralee's practitioner profile
INSERT INTO practitioners (
  id,
  slug,
  name,
  email,
  business_name,
  tagline,
  bio,
  long_bio,
  photo_url,
  specialties,
  certifications,
  years_experience,
  location,
  approach,
  values,
  social_links,
  settings,
  status
) VALUES (
  'a0000001-0001-0001-0001-000000000001',
  'loralee',
  'Loralee Starweaver',
  'loralee@stellium.demo',
  'Stellium Astrology',
  'Evolutionary Astrology for Soul Growth',
  'I help seekers understand their cosmic blueprint and navigate life''s transitions with grace. Through the lens of evolutionary astrology, we explore your soul''s journey and uncover the wisdom written in the stars.',
  'For over 15 years, I''ve been honored to guide thousands of souls through their astrological journeys. My approach blends the depth of evolutionary astrology with the archetypal wisdom of Jungian psychology, creating a framework that honors both the mystical and the practical.

I believe that astrology, at its best, is a tool for self-understanding and empowerment—not prediction or fate. Your chart is a map of potentials, not a prison of predetermined outcomes. Every placement holds medicine, every transit offers an invitation to grow.

My training includes certification from Steven Forrest''s Evolutionary Astrology program, studies with Liz Greene at the Centre for Psychological Astrology, and ongoing exploration of the intersection between astrology and depth psychology.

When I''m not reading charts, you''ll find me tending my garden, writing poetry, or hiking the Pacific Northwest trails with my dog Luna.',
  NULL,
  ARRAY['Natal Chart Interpretation', 'Transit Readings', 'Synastry & Relationship Astrology', 'Solar Returns', 'Evolutionary Astrology'],
  ARRAY['Certified Evolutionary Astrologer - Steven Forrest Program', 'Centre for Psychological Astrology - Diploma', 'NCGR Level IV Certification'],
  15,
  'Portland, OR',
  'I practice soul-centered astrology focused on growth and integration rather than prediction. We work together to understand your chart as a map of your soul''s intentions and evolutionary journey. I blend evolutionary astrology with archetypal psychology, creating space for both cosmic insight and practical application. Every reading is a conversation between you and the cosmos—I''m simply here to translate.',
  ARRAY['Soul growth over prediction', 'Honoring client agency', 'Integration of shadow material', 'The mystery is sacred', 'Astrology as a tool for empowerment'],
  '{
    "instagram": "https://instagram.com/stelliumastrology",
    "website": "https://loralee.soullab.life"
  }'::jsonb,
  '{
    "accent_color": "#B794F4",
    "primary_color": "#1A1A2E",
    "secondary_color": "#16213E",
    "default_hours": {"start": "09:00", "end": "17:00"}
  }'::jsonb,
  'active'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  business_name = EXCLUDED.business_name,
  tagline = EXCLUDED.tagline,
  bio = EXCLUDED.bio,
  long_bio = EXCLUDED.long_bio,
  specialties = EXCLUDED.specialties,
  certifications = EXCLUDED.certifications,
  years_experience = EXCLUDED.years_experience,
  location = EXCLUDED.location,
  approach = EXCLUDED.approach,
  values = EXCLUDED.values,
  social_links = EXCLUDED.social_links,
  settings = EXCLUDED.settings,
  status = EXCLUDED.status;

-- Create MAIA Persona configuration
INSERT INTO maia_personas (
  id,
  practitioner_id,
  name,
  voice_style,
  brand_colors
) VALUES (
  'aa000001-0001-0001-0001-000000000001',
  'a0000001-0001-0001-0001-000000000001',
  'Stellium',
  'warm',
  '{
    "primary": "#1A1A2E",
    "secondary": "#16213E",
    "accent": "#B794F4"
  }'::jsonb
)
ON CONFLICT DO NOTHING;

-- Create Services
INSERT INTO services (id, practitioner_id, name, description, long_description, category, duration_minutes, price_cents, is_active, is_featured, display_order, includes) VALUES
  ('ab000001-0001-0001-0001-000000000001', 'a0000001-0001-0001-0001-000000000001',
   'Natal Chart Reading',
   'A deep dive into your birth chart, exploring your soul''s blueprint and life themes.',
   'Your birth chart is a cosmic snapshot of the sky at the moment you took your first breath. In this comprehensive reading, we explore your Sun, Moon, and Rising signs, along with the major planetary placements and aspects that shape your personality, relationships, and life path. Perfect for those new to astrology or seeking a fresh perspective on their cosmic blueprint.',
   'readings', 90, 22500, true, true, 1,
   ARRAY['90-minute video session', 'PDF chart with notes', 'Recording of session', 'Follow-up email support']),

  ('ab000002-0001-0001-0001-000000000002', 'a0000001-0001-0001-0001-000000000001',
   'Transit Reading',
   'Understand the current cosmic weather and how it''s affecting your life.',
   'Transits are the ongoing dialogue between the current sky and your birth chart. In this reading, we explore the major transits affecting you now and in the coming months, helping you understand the themes arising and how to work with this energy consciously. Ideal for navigating life transitions, understanding challenging periods, or optimizing timing for important decisions.',
   'readings', 60, 17500, true, true, 2,
   ARRAY['60-minute video session', 'Transit chart PDF', 'Recording of session', 'Key dates summary']),

  ('ab000003-0001-0001-0001-000000000003', 'a0000001-0001-0001-0001-000000000001',
   'Synastry & Relationship Reading',
   'Explore the astrological dynamics between you and a partner, friend, or family member.',
   'Every relationship has its own cosmic signature. In this reading, we explore the astrological dynamics between you and another person—romantic partner, friend, family member, or business associate. We look at how your charts interact, where you complement each other, where challenges arise, and how to work consciously with the energy between you.',
   'relationships', 90, 27500, true, true, 3,
   ARRAY['90-minute video session', 'Synastry chart PDF', 'Composite chart analysis', 'Recording of session', 'Relationship themes summary']),

  ('ab000004-0001-0001-0001-000000000004', 'a0000001-0001-0001-0001-000000000001',
   'Solar Return Reading',
   'Your personal new year forecast based on your birthday chart.',
   'Your Solar Return chart, cast for the moment the Sun returns to its exact natal position each year, offers insight into the themes and opportunities of your coming year. This reading explores the major energies at play in your personal new year and how to work with them intentionally. Best scheduled within a month of your birthday.',
   'readings', 60, 17500, true, false, 4,
   ARRAY['60-minute video session', 'Solar Return chart PDF', 'Recording of session', 'Year ahead themes summary']),

  ('ab000005-0001-0001-0001-000000000005', 'a0000001-0001-0001-0001-000000000001',
   'Astrology Mentorship Package',
   'Deep ongoing support for those ready to work with their chart over time.',
   'For those seeking sustained astrological guidance, this package offers three sessions over three months. We begin with a comprehensive natal reading, then track transits and progressions as they unfold. This is ideal for those navigating major life transitions or seeking to deepen their self-understanding through the astrological lens.',
   'packages', 270, 55000, true, false, 5,
   ARRAY['Three 90-minute sessions over 3 months', 'All chart PDFs and recordings', 'Email support between sessions', 'Priority scheduling', 'Custom transit calendar'])
ON CONFLICT DO NOTHING;

-- Create Testimonials
INSERT INTO testimonials (id, practitioner_id, client_name, content, rating, service_id, is_approved, is_featured) VALUES
  ('ac000001-0001-0001-0001-000000000001', 'a0000001-0001-0001-0001-000000000001',
   'Maya C.',
   'Working with Loralee has been transformative. She has a gift for holding space while delivering profound insights. My natal reading gave me language for experiences I''d never been able to articulate.',
   5, 'ab000001-0001-0001-0001-000000000001', true, true),

  ('ac000002-0001-0001-0001-000000000002', 'a0000001-0001-0001-0001-000000000001',
   'Sarah M.',
   'The synastry reading Loralee did for my partner and me was incredibly helpful as we prepared for our wedding. She helped us understand our dynamics with such compassion and depth.',
   5, 'ab000003-0001-0001-0001-000000000003', true, true),

  ('ac000003-0001-0001-0001-000000000003', 'a0000001-0001-0001-0001-000000000001',
   'James R.',
   'As someone new to astrology, I was nervous about my first reading. Loralee made it accessible and meaningful. I walked away with practical insights I''m still processing months later.',
   5, 'ab000001-0001-0001-0001-000000000001', true, false),

  ('ac000004-0001-0001-0001-000000000004', 'a0000001-0001-0001-0001-000000000001',
   'Alex T.',
   'Loralee''s transit readings have become an essential part of my business planning. Her insights on timing have been remarkably accurate and practical.',
   5, 'ab000002-0001-0001-0001-000000000002', true, true)
ON CONFLICT DO NOTHING;

-- Create Lead Magnets
INSERT INTO lead_magnets (id, practitioner_id, name, description, long_description, type, delivery_type, benefits, is_active, is_featured) VALUES
  ('ad000001-0001-0001-0001-000000000001', 'a0000001-0001-0001-0001-000000000001',
   'Understanding Your Big Three',
   'A beginner''s guide to your Sun, Moon, and Rising signs',
   'Your Sun, Moon, and Rising signs form the foundation of your astrological identity. This free guide breaks down what each of these placements means, how they work together, and how to begin interpreting their influence in your life. Perfect for astrology beginners or those wanting to deepen their self-understanding.',
   'guide',
   'email',
   ARRAY['Learn what your Sun sign really means', 'Discover your emotional nature through your Moon', 'Understand how others see you via your Rising', 'Practical reflection prompts', 'Easy-to-follow explanations'],
   true, true)
ON CONFLICT DO NOTHING;

-- Create Availability (Mon-Fri 9-5, some flexibility)
INSERT INTO practitioner_availability (practitioner_id, day_of_week, start_time, end_time, is_available) VALUES
  ('a0000001-0001-0001-0001-000000000001', 1, '09:00', '17:00', true),  -- Monday
  ('a0000001-0001-0001-0001-000000000001', 2, '09:00', '17:00', true),  -- Tuesday
  ('a0000001-0001-0001-0001-000000000001', 3, '09:00', '17:00', true),  -- Wednesday
  ('a0000001-0001-0001-0001-000000000001', 4, '09:00', '17:00', true),  -- Thursday
  ('a0000001-0001-0001-0001-000000000001', 5, '09:00', '12:00', true)   -- Friday (half day)
ON CONFLICT DO NOTHING;

-- Create AI Companion Config
INSERT INTO ai_companion_configs (
  practitioner_id,
  name,
  pronouns,
  voice_style,
  tone,
  frameworks,
  primary_framework,
  specialties,
  boundaries,
  knowledge_base
) VALUES (
  'a0000001-0001-0001-0001-000000000001',
  'Stellium',
  'they/them',
  'warm',
  '{"formality": 3, "warmth": 5, "depth": 4, "directness": 3}'::jsonb,
  '["evolutionary", "archetypal", "psychological"]'::jsonb,
  'evolutionary',
  '["natal interpretation", "transits", "synastry", "solar returns"]'::jsonb,
  '{
    "noPredictions": true,
    "noMedicalAdvice": true,
    "noTherapy": true,
    "noRelationshipAdvice": false,
    "crisisReferral": true,
    "practitionerReferral": [],
    "customBoundaries": ["Frame all insights as potential energy, not fate", "Encourage client agency always"]
  }'::jsonb,
  '{
    "ownMaterials": ["Voice Samples 2024", "Session Transcripts", "Newsletter Archive"],
    "referencedAuthors": ["Steven Forrest", "Liz Greene", "Richard Tarnas"],
    "customInterpretations": {}
  }'::jsonb
)
ON CONFLICT (practitioner_id) DO UPDATE SET
  name = EXCLUDED.name,
  voice_style = EXCLUDED.voice_style,
  tone = EXCLUDED.tone,
  frameworks = EXCLUDED.frameworks,
  primary_framework = EXCLUDED.primary_framework,
  specialties = EXCLUDED.specialties,
  boundaries = EXCLUDED.boundaries,
  knowledge_base = EXCLUDED.knowledge_base;

-- Verification
DO $$
DECLARE
  p_count INT;
  s_count INT;
  t_count INT;
  l_count INT;
BEGIN
  SELECT COUNT(*) INTO p_count FROM practitioners WHERE slug = 'loralee';
  SELECT COUNT(*) INTO s_count FROM services WHERE practitioner_id = 'a0000001-0001-0001-0001-000000000001';
  SELECT COUNT(*) INTO t_count FROM testimonials WHERE practitioner_id = 'a0000001-0001-0001-0001-000000000001';
  SELECT COUNT(*) INTO l_count FROM lead_magnets WHERE practitioner_id = 'a0000001-0001-0001-0001-000000000001';

  RAISE NOTICE '';
  RAISE NOTICE '══════════════════════════════════════════';
  RAISE NOTICE 'LORALEE PORTAL SEEDED';
  RAISE NOTICE '══════════════════════════════════════════';
  RAISE NOTICE 'Practitioner profile: %', CASE WHEN p_count > 0 THEN 'Created' ELSE 'Failed' END;
  RAISE NOTICE 'Services: %', s_count;
  RAISE NOTICE 'Testimonials: %', t_count;
  RAISE NOTICE 'Lead magnets: %', l_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Portal URL: loralee.soullab.life';
  RAISE NOTICE '══════════════════════════════════════════';
END $$;
