-- Seed: First weekly theme — Fire / Initiation
-- Tied to Elemental Alchemy opening chapters

DO $$
DECLARE
  v_library_id UUID;
BEGIN
  INSERT INTO prompt_library (slug, title, element, refinement_phase, chapter_ref, orientation, status)
  VALUES (
    'fire-initiation',
    'The Spark of Initiation',
    'fire',
    'emergence',
    'Elemental Alchemy Ch. 1-2',
    'This week we sit with the first fire — the impulse that begins everything. Not the sustained flame, but the initial spark: the moment something in you says yes before the mind catches up. What is trying to ignite in your life right now?',
    'active'
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_library_id;

  -- Only insert items if the library entry was created (idempotent)
  IF v_library_id IS NOT NULL THEN
    INSERT INTO prompt_library_items (library_id, prompt_text, prompt_type, element_tag, tonal_tag, sort_order) VALUES
    (v_library_id,
     'What is the last thing that made you feel genuinely alive — even briefly?',
     'reflection', 'fire', 'contemplative', 1),
    (v_library_id,
     'Where in your body do you feel the difference between obligation and desire?',
     'inquiry', 'fire', 'somatic', 2),
    (v_library_id,
     'Place one hand on your chest. Breathe. Ask: what wants to begin?',
     'grounding', 'fire', 'gentle', 3),
    (v_library_id,
     'Name one thing you have been postponing that still carries heat. What is the smallest first step?',
     'action', 'fire', 'direct', 4),
    (v_library_id,
     'Fire teaches us that beginnings are not chosen — they are recognized. What beginning have you already been inside without naming it?',
     'integration', 'fire', 'contemplative', 5);
  END IF;
END $$;
