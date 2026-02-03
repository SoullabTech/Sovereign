-- =====================================================
-- AIN COLLECTIVE WARMUP MODE
-- Improves efferent wisdom retrieval for sparse fields
--
-- Changes:
-- 1. get_active_field_movements: warmup mode (min_count=1 when total < 20)
-- 2. get_relevant_breakthrough_patterns: fallback to recent patterns when no exact match
-- =====================================================

BEGIN;

-- Function 1: Active field movements with warmup mode
CREATE OR REPLACE FUNCTION public.get_active_field_movements(min_count integer DEFAULT 3)
RETURNS TABLE(movement_type text, movement_description text, participant_count bigint)
LANGUAGE plpgsql
AS $function$
DECLARE
  total_breakthroughs bigint;
  effective_min_count integer;
BEGIN
  -- Warmup mode: if field is sparse, lower the threshold
  SELECT COUNT(*) INTO total_breakthroughs FROM collective_breakthroughs WHERE created_at >= NOW() - INTERVAL '30 days';

  -- If total < 20, use min_count of 1 for early responsiveness
  -- Otherwise use the requested min_count (default 3)
  effective_min_count := CASE WHEN total_breakthroughs < 20 THEN 1 ELSE min_count END;

  -- Elemental transitions
  RETURN QUERY
  SELECT
    'elemental_transition'::TEXT,
    elemental_phase_from || ' → ' || elemental_phase_to,
    COUNT(*)
  FROM collective_breakthroughs
  WHERE created_at >= NOW() - INTERVAL '30 days'
    AND elemental_phase_from IS NOT NULL
    AND elemental_phase_to IS NOT NULL
  GROUP BY elemental_phase_from, elemental_phase_to
  HAVING COUNT(*) >= effective_min_count;

  -- Archetypal shifts
  RETURN QUERY
  SELECT
    'archetypal_shift'::TEXT,
    archetype_from || ' → ' || archetype_to,
    COUNT(*)
  FROM collective_breakthroughs
  WHERE created_at >= NOW() - INTERVAL '30 days'
    AND archetype_from IS NOT NULL
    AND archetype_to IS NOT NULL
  GROUP BY archetype_from, archetype_to
  HAVING COUNT(*) >= effective_min_count;
END;
$function$;

-- Function 2: Relevant patterns with fallback for sparse field
CREATE OR REPLACE FUNCTION public.get_relevant_breakthrough_patterns(
  p_phase text,
  p_element text,
  p_archetype text DEFAULT NULL::text,
  p_limit integer DEFAULT 5
)
RETURNS TABLE(
  id uuid,
  catalyst_type text,
  transformation_type text,
  emotional_shift text,
  practice_offered text,
  resonance_strength numeric,
  relevance_score integer
)
LANGUAGE plpgsql
AS $function$
DECLARE
  direct_count integer;
BEGIN
  -- First try: exact phase + element match
  RETURN QUERY
  SELECT
    cb.id,
    cb.catalyst_type,
    cb.transformation_type,
    cb.emotional_shift,
    cb.practice_offered,
    cb.resonance_strength,
    (
      CASE WHEN cb.spiralogic_phase = p_phase THEN 3 ELSE 0 END +
      CASE WHEN cb.dominant_element = p_element THEN 2 ELSE 0 END +
      CASE WHEN p_archetype IS NOT NULL AND (cb.archetype_from = p_archetype OR cb.archetype_to = p_archetype) THEN 3 ELSE 0 END +
      CASE WHEN cb.created_at >= NOW() - INTERVAL '7 days' THEN 2 ELSE 0 END
    )::INTEGER as relevance_score
  FROM collective_breakthroughs cb
  WHERE cb.created_at >= NOW() - INTERVAL '30 days'
    AND (cb.spiralogic_phase = p_phase OR cb.dominant_element = p_element)
  ORDER BY relevance_score DESC, cb.created_at DESC
  LIMIT p_limit;

  -- Check if we found any matches
  GET DIAGNOSTICS direct_count = ROW_COUNT;

  -- Fallback: if no matches, return most recent patterns regardless of phase/element
  -- Label them with lower relevance score (adjacent resonance)
  IF direct_count = 0 THEN
    RETURN QUERY
    SELECT
      cb.id,
      cb.catalyst_type,
      cb.transformation_type,
      cb.emotional_shift,
      cb.practice_offered,
      cb.resonance_strength,
      1::INTEGER as relevance_score  -- Low score = adjacent resonance
    FROM collective_breakthroughs cb
    WHERE cb.created_at >= NOW() - INTERVAL '30 days'
    ORDER BY cb.created_at DESC
    LIMIT p_limit;
  END IF;
END;
$function$;

COMMIT;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'AIN collective warmup mode functions updated successfully';
END $$;
