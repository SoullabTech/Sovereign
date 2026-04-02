-- Seed: Week 4 theme — Air / Awareness
-- Tied to Elemental Alchemy Air chapters

DO $$
DECLARE
  v_library_id UUID;
BEGIN
  INSERT INTO prompt_library (slug, title, element, refinement_phase, chapter_ref, orientation, status)
  VALUES (
    'air-awareness',
    'The Breath of Awareness',
    'air',
    'emergence',
    'Elemental Alchemy Ch. 7-8',
    'This week we enter air — the element of thought, perspective, and communication. Air is not about thinking more. It is about seeing clearly. What patterns of thought are running your life right now — and which ones are actually yours?',
    'draft'
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_library_id;

  IF v_library_id IS NOT NULL THEN
    INSERT INTO prompt_library_items (library_id, prompt_text, prompt_type, element_tag, tonal_tag, sort_order) VALUES
    (v_library_id,
     'What thought have you been repeating to yourself this week — and is it true?',
     'reflection', 'air', 'contemplative', 1),
    (v_library_id,
     'If you could see your current situation from ten years in the future, what would you notice that you cannot see now?',
     'inquiry', 'air', 'gentle', 2),
    (v_library_id,
     'Take three slow breaths. On each exhale, release one thought you''ve been carrying. What remains when the noise settles?',
     'grounding', 'air', 'somatic', 3),
    (v_library_id,
     'What is one conversation you need to have that you have been avoiding? What would you say if you trusted yourself to say it clearly?',
     'action', 'air', 'direct', 4),
    (v_library_id,
     'Air teaches us that clarity is not the same as certainty. What would it mean to see your situation clearly without needing to resolve it yet?',
     'integration', 'air', 'contemplative', 5);
  END IF;
END $$;
