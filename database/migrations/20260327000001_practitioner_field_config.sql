-- Migration: Practitioner Field Config
-- Adds field_config JSONB to practitioners and seeds Kelly + Jondi
-- Date: 2026-03-27

-- ---------------------------------------------------------------------------
-- 1. Add column
-- ---------------------------------------------------------------------------

ALTER TABLE practitioners ADD COLUMN IF NOT EXISTS field_config JSONB;

CREATE INDEX IF NOT EXISTS idx_practitioners_field_config
  ON practitioners USING gin(field_config)
  WHERE field_config IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 2. Seed Kelly Nezat (slug: kelly-nezat)
-- ---------------------------------------------------------------------------

UPDATE practitioners
SET field_config = '{
  "fieldType": "practitioner",
  "shortName": "Kelly",
  "practiceType": "guide",
  "presence": {
    "openingLine": "Welcome to Soullab",
    "subLine": "Sovereign infrastructure for the people who hold others.",
    "backgroundDescription": "Warm parchment. Deep amber. Espresso. Grounded, alive, unhurried."
  },
  "story": {
    "headline": "Infrastructure as a practice of care.",
    "lead": "Kelly Nezat is the founder of Soullab and the architect of MAIA. Her work begins with a simple observation: the tools practitioners use to hold others rarely honor what those practitioners actually know.",
    "paragraphs": [
      "The question that started Soullab was not a business question. It was a sovereignty question: what would it look like for a person to have a digital presence that actually reflected who they were — not a performance, not a brand, but a field?",
      "Those questions led to MAIA. Not a chatbot. Not a productivity tool. A sovereign companion — oriented by consent, bounded by ethics, incapable of claiming authority it does not have.",
      "Her work now is at the intersection of three things that rarely meet: digital sovereignty, AI ethics, and inner development."
    ],
    "lineage": [
      "Founder, Soullab",
      "Founder and Architect, MAIA Sovereign AI Companion",
      "AIN Framework — participatory intelligence architecture",
      "Spiralogic — mapping layer for state, process, and orientation"
    ]
  },
  "cta": {
    "label": "Begin",
    "href": "/book",
    "style": "invitation"
  },
  "modules": [
    { "id": "threshold",    "enabled": true, "label": "Threshold",    "order": 1 },
    { "id": "presence",     "enabled": true, "label": "Presence",     "order": 2 },
    { "id": "work-with-me", "enabled": true, "label": "Work With Me", "order": 3 },
    { "id": "booking",      "enabled": true, "label": "Booking",      "order": 4 },
    { "id": "maia",         "enabled": true, "label": "MAIA",         "order": 5 },
    { "id": "resources",    "enabled": true, "label": "Resources",    "order": 6 }
  ]
}'::jsonb
WHERE slug = 'kelly-nezat';

-- ---------------------------------------------------------------------------
-- 3. Seed Jondi Whitis (create practitioner row if not exists)
-- ---------------------------------------------------------------------------

INSERT INTO practitioners (id, slug, name, email, business_name, tagline, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'jondi',
  'Jondi Whitis',
  'jondi@soullab.life',
  'Spring Energy',
  'Master EFT trainer. Precision at the level of the body.',
  'active',
  NOW(), NOW()
)
ON CONFLICT (slug) DO NOTHING;

UPDATE practitioners
SET field_config = '{
  "fieldType": "master",
  "shortName": "Jondi",
  "practiceType": "healer",
  "presence": {
    "openingLine": "The body knows what it needs.",
    "subLine": "We can start with what you are feeling right now.",
    "backgroundDescription": "Warm linen. Deep sage. Clean, organic, spacious."
  },
  "story": {
    "headline": "Precision at the level of the body.",
    "lead": "Jondi Whitis has spent decades learning to follow what the nervous system already knows. Her work is not about fixing what is broken. It is about removing what is in the way.",
    "paragraphs": [
      "She trained as a master EFT practitioner at a time when energy medicine was still finding its language. She stayed because the results were undeniable — not in theory, but in the body.",
      "Over the years her practice deepened into somatic attunement: the discipline of tracking not the story a person tells, but the signal beneath it.",
      "She founded the Spring Energy Event to bring this work into community — because transformation that happens in isolation rarely holds."
    ],
    "lineage": [
      "Master EFT Trainer — AAMET International",
      "Founder, Spring Energy Event (SEE)",
      "Co-Founder, TapFest",
      "AAMET International Training Board Member",
      "F.A.S.T. Training"
    ]
  },
  "cta": {
    "label": "Begin here",
    "href": "/book",
    "style": "direct"
  },
  "modules": [
    { "id": "threshold",    "enabled": true, "label": "Threshold",    "order": 1 },
    { "id": "presence",     "enabled": true, "label": "Presence",     "order": 2 },
    { "id": "work-with-me", "enabled": true, "label": "Work With Me", "order": 3 },
    { "id": "groups",       "enabled": true, "label": "Groups",       "order": 4 },
    { "id": "booking",      "enabled": true, "label": "Booking",      "order": 5 },
    { "id": "maia",         "enabled": true, "label": "MAIA",         "order": 6 },
    { "id": "testimonials", "enabled": true, "label": "Testimonials", "order": 7 }
  ]
}'::jsonb
WHERE slug = 'jondi';
