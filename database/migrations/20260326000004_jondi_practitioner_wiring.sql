-- ═══════════════════════════════════════════════════════════════
-- Jondi Practitioner Wiring
-- ═══════════════════════════════════════════════════════════════
--
-- Wires Jondi Whitis into the existing practitioner infrastructure:
--   1. Create practitioner record
--   2. Seed one bookable EFT service
--   3. Seed one weekly availability window (Tuesdays 10am-3pm ET)
--
-- This gives her a working field with operational capability,
-- not just a voice presence. She becomes a practitioner node
-- with agency inside the system.
-- ═══════════════════════════════════════════════════════════════

-- 1. PRACTITIONER RECORD
-- Using a deterministic UUID so we can reference it in subsequent inserts
-- and in the field config (lib/masters/jondi.ts → practitionerId)
INSERT INTO practitioners (
  id,
  slug,
  name,
  email,
  business_name,
  tagline,
  bio,
  status,
  specialties,
  certifications,
  years_experience,
  location,
  settings
)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-jondiwhitis01'::uuid,
  'jondi',
  'Jondi Whitis',
  'jondi@soullab.life',
  'Spring Energy Event',
  'Precision at the level of the body.',
  'Master EFT Trainer, AAMET International. Founder of Spring Energy Event (SEE). Co-Founder of TapFest. Decades of practice in EFT, energy medicine, and somatic attunement.',
  'active',
  ARRAY['EFT', 'Energy Medicine', 'Somatic Attunement', 'Nervous System Regulation'],
  ARRAY['Master EFT Trainer — AAMET International', 'AAMET International Training Board Member', 'F.A.S.T. Training'],
  25,
  'Northeast US',
  '{}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  status = 'active',
  specialties = EXCLUDED.specialties,
  certifications = EXCLUDED.certifications;

-- 2. ONE BOOKABLE SERVICE — EFT Session
INSERT INTO services (
  id,
  practitioner_id,
  name,
  description,
  long_description,
  category,
  duration_minutes,
  price_cents,
  is_active,
  is_featured,
  display_order,
  includes
)
VALUES (
  gen_random_uuid(),
  'a1b2c3d4-e5f6-7890-abcd-jondiwhitis01'::uuid,
  'EFT Session',
  'A focused tapping session for regulation, release, and integration.',
  'One-on-one work at your pace. We begin where you are — with whatever your body is holding. Using EFT (Emotional Freedom Techniques), we track sensation, release charge, and follow what wants to shift. No rush. No fixing. Just precision and presence.',
  'individual',
  60,
  15000,  -- $150.00
  true,
  true,
  1,
  ARRAY['60-minute session', 'EFT meridian-based tapping', 'Somatic tracking', 'Between-session support notes']
)
ON CONFLICT DO NOTHING;

-- 3. ONE AVAILABILITY WINDOW — Tuesdays 10am-3pm
-- day_of_week: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
INSERT INTO practitioner_availability (
  id,
  practitioner_id,
  day_of_week,
  start_time,
  end_time,
  is_available
)
VALUES (
  gen_random_uuid(),
  'a1b2c3d4-e5f6-7890-abcd-jondiwhitis01'::uuid,
  2,          -- Tuesday
  '10:00:00', -- 10am ET
  '15:00:00', -- 3pm ET
  true
)
ON CONFLICT DO NOTHING;
