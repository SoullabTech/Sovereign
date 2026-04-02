-- Seed: Week 3 theme — Earth / Grounding
-- Tied to Elemental Alchemy Earth chapters

DO $$
DECLARE
  v_library_id UUID;
BEGIN
  INSERT INTO prompt_library (slug, title, element, refinement_phase, chapter_ref, orientation, status)
  VALUES (
    'earth-grounding',
    'The Seed of Grounding',
    'earth',
    'emergence',
    'Elemental Alchemy Ch. 5-6',
    'This week we come to earth — the element of the body, the practical, the real. Not ideas about life, but life itself: what you eat, where you sleep, how you move, what you build with your hands. Where does your life need more ground beneath it?',
    'draft'
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_library_id;

  IF v_library_id IS NOT NULL THEN
    INSERT INTO prompt_library_items (library_id, prompt_text, prompt_type, element_tag, tonal_tag, sort_order) VALUES
    (v_library_id,
     'What part of your daily life feels most solid and reliable right now? What feels least grounded?',
     'reflection', 'earth', 'contemplative', 1),
    (v_library_id,
     'Where are you living in your head about something that actually needs your hands?',
     'inquiry', 'earth', 'direct', 2),
    (v_library_id,
     'Feel your feet on the ground. Feel the weight of your body in the chair. What does it feel like to arrive here, now, in this body?',
     'grounding', 'earth', 'somatic', 3),
    (v_library_id,
     'What is one practical thing you have been neglecting that would immediately make your life feel more stable?',
     'action', 'earth', 'direct', 4),
    (v_library_id,
     'Earth teaches us that nothing grows without roots. What are you trying to grow that has not yet been planted — and what would planting actually look like?',
     'integration', 'earth', 'contemplative', 5);
  END IF;
END $$;
