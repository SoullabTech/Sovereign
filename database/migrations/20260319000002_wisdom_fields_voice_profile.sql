-- ============================================
-- WISDOM FIELDS — voice_profile column
-- Adds a voice profile identifier to wisdom_fields
-- that shapes MAIA's contextual engagement posture
-- within Wisdom Keeper fields.
--
-- Examples:
--   symbolic_depth_psychology        (Jung)
--   hemispheric_philosophical_precision (McGilchrist)
--   archetypal_imaginal_poetic       (Hillman)
-- ============================================

ALTER TABLE wisdom_fields
  ADD COLUMN IF NOT EXISTS voice_profile TEXT;

COMMENT ON COLUMN wisdom_fields.voice_profile IS
  'Shapes MAIA''s contextual prompt posture in Wisdom Keeper fields. Null = no special voice constraint.';
