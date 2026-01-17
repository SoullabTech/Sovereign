-- 20260116_seed_academy_domains_and_loralee_paths.sql
-- Seeds canonical Academy domains + 3 pilot paths for a practitioner.
-- Safe to re-run (UPSERT-based via ON CONFLICT).

BEGIN;

-- Ensure UUID function support
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================
-- 1) Canonical Academy Domains (6 domains)
-- =========================

INSERT INTO academy_domains (number, slug, name, description, elemental_weight)
VALUES
  (1, 'perception-awareness', 'Perception & Awareness',
   'Attention training, discernment, presence before interpretation. The foundation: noticing what is actually here.',
   '{"earth": 0.1, "water": 0.1, "fire": 0.1, "air": 0.5, "aether": 0.2}'::jsonb),

  (2, 'emotional-intelligence', 'Emotional Intelligence',
   'Emotional literacy, regulation, nervous-system awareness. Learning the language of feeling and body wisdom.',
   '{"earth": 0.2, "water": 0.5, "fire": 0.1, "air": 0.1, "aether": 0.1}'::jsonb),

  (3, 'psychology-shadow', 'Psychology & Shadow',
   'Patterns, projection, integration, honest seeing. Working with the parts of ourselves we disown or repeat.',
   '{"earth": 0.1, "water": 0.35, "fire": 0.1, "air": 0.35, "aether": 0.1}'::jsonb),

  (4, 'meaning-myth-soul', 'Meaning, Myth & Soul',
   'Orientation, mythic literacy, vocation, meaning-making. Finding your story within the larger story.',
   '{"earth": 0.1, "water": 0.15, "fire": 0.25, "air": 0.15, "aether": 0.35}'::jsonb),

  (5, 'relational-intelligence', 'Relational Intelligence & Ethics',
   'Relational field awareness, ethics, power literacy, stewardship. What happens between us matters.',
   '{"earth": 0.3, "water": 0.2, "fire": 0.25, "air": 0.15, "aether": 0.1}'::jsonb),

  (6, 'integration-worldcraft', 'Integration & Worldcraft',
   'Embodiment, integration, creative manifestation, service without depletion. Bringing coherence into form.',
   '{"earth": 0.35, "water": 0.1, "fire": 0.15, "air": 0.1, "aether": 0.3}'::jsonb)

ON CONFLICT (number) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  elemental_weight = EXCLUDED.elemental_weight,
  updated_at = NOW();

-- =========================
-- 2) Practitioner Pilot Paths
-- =========================
-- Replace PRACTITIONER_UUID below with the actual practitioner ID
-- Run: SELECT id, name, slug FROM practitioners WHERE slug = 'loralee';

DO $$
DECLARE
  p_id UUID;
BEGIN
  -- Try to find Loralee's practitioner ID
  -- If not found, we'll skip path creation (domains still get seeded)
  SELECT id INTO p_id FROM practitioners WHERE slug = 'loralee' LIMIT 1;

  IF p_id IS NULL THEN
    RAISE NOTICE 'Practitioner "loralee" not found. Skipping path seeds. Create the practitioner first.';
    RETURN;
  END IF;

  RAISE NOTICE 'Found practitioner loralee with ID: %', p_id;

  -- Path 1: Start Here (Domain 1 focus)
  INSERT INTO academy_paths (
    practitioner_id, slug, title, description,
    recommended_pace, elemental_mood, is_public, is_featured
  ) VALUES (
    p_id,
    'start-here',
    'Start Here: Seeing What Is Already Here',
    'A gentle entry into perception before meaning. Good for anyone beginning their journey with MAIA. Focus on noticing without immediately interpreting.',
    'self-paced',
    'air',
    true,
    true
  )
  ON CONFLICT (practitioner_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    recommended_pace = EXCLUDED.recommended_pace,
    elemental_mood = EXCLUDED.elemental_mood,
    is_public = EXCLUDED.is_public,
    is_featured = EXCLUDED.is_featured,
    updated_at = NOW();

  -- Path 2: Regulation & Clarity (Domain 2 + 1)
  INSERT INTO academy_paths (
    practitioner_id, slug, title, description,
    recommended_pace, elemental_mood, is_public, is_featured
  ) VALUES (
    p_id,
    'regulation-and-clarity',
    'Regulation & Clarity',
    'Stabilize the nervous system and restore clear seeing. Great for between sessions when you need grounding. Combines emotional intelligence with perceptual awareness.',
    'weekly',
    'water',
    true,
    false
  )
  ON CONFLICT (practitioner_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    recommended_pace = EXCLUDED.recommended_pace,
    elemental_mood = EXCLUDED.elemental_mood,
    is_public = EXCLUDED.is_public,
    is_featured = EXCLUDED.is_featured,
    updated_at = NOW();

  -- Path 3: Service Without Depletion (Domain 5 + 6)
  INSERT INTO academy_paths (
    practitioner_id, slug, title, description,
    recommended_pace, elemental_mood, is_public, is_featured
  ) VALUES (
    p_id,
    'service-without-depletion',
    'Service Without Depletion',
    'Relational maturity + integration practices for people moving toward contribution and care. For those ready to give without losing themselves.',
    'weekly',
    'earth',
    true,
    false
  )
  ON CONFLICT (practitioner_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    recommended_pace = EXCLUDED.recommended_pace,
    elemental_mood = EXCLUDED.elemental_mood,
    is_public = EXCLUDED.is_public,
    is_featured = EXCLUDED.is_featured,
    updated_at = NOW();

  RAISE NOTICE 'Successfully seeded 3 paths for practitioner loralee';
END $$;

COMMIT;
