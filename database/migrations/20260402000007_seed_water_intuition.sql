-- Seed: Week 2 theme — Water / Intuition
-- Tied to Elemental Alchemy Water chapters

DO $$
DECLARE
  v_library_id UUID;
BEGIN
  INSERT INTO prompt_library (slug, title, element, refinement_phase, chapter_ref, orientation, status)
  VALUES (
    'water-intuition',
    'The Spring of Intuition',
    'water',
    'emergence',
    'Elemental Alchemy Ch. 3-4',
    'This week we turn toward water — the intelligence that moves beneath the surface. Intuition is not mystical guessing. It is the body and soul knowing something before the mind has words for it. What have you been sensing but not yet saying?',
    'draft'
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_library_id;

  IF v_library_id IS NOT NULL THEN
    INSERT INTO prompt_library_items (library_id, prompt_text, prompt_type, element_tag, tonal_tag, sort_order) VALUES
    (v_library_id,
     'What do you know in your body that you haven''t yet allowed yourself to think?',
     'reflection', 'water', 'contemplative', 1),
    (v_library_id,
     'When was the last time you trusted a feeling before you could explain it — and what happened?',
     'inquiry', 'water', 'gentle', 2),
    (v_library_id,
     'Close your eyes. Place your attention in your belly. What is the quality of what you find there — still, moving, heavy, light?',
     'grounding', 'water', 'somatic', 3),
    (v_library_id,
     'Name one decision you are currently overthinking. What does your gut already know?',
     'action', 'water', 'direct', 4),
    (v_library_id,
     'Water teaches us that depth is not the same as darkness. What lives in your depths that you have been avoiding — not because it is dangerous, but because it is real?',
     'integration', 'water', 'contemplative', 5);
  END IF;
END $$;
