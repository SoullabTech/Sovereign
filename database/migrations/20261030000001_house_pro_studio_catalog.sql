-- HOUSE-PRO-STUDIO-01 — admit Pro Studio (the practitioner offering) into member-chosen House
-- placement. Full-catalog idempotent reassertion. Personal Portal/Ganesha is a SEPARATE offering
-- and is NOT admitted here (ADR-010; owner #1807).
BEGIN;

ALTER TABLE house_member_preferences
  DROP CONSTRAINT IF EXISTS house_member_preferences_center_ids_check;
ALTER TABLE house_member_preferences
  ADD CONSTRAINT house_member_preferences_center_ids_check CHECK (
    center_ids IS NULL OR (
      cardinality(center_ids) <= 5
      AND (array_ndims(center_ids) IS NULL OR (array_ndims(center_ids) = 1 AND array_lower(center_ids, 1) = 1))
      AND array_position(center_ids, NULL) IS NULL
      AND center_ids <@ ARRAY[
        'writing','relationships','practices','community','studio','decisions','astrology',
        'journal','dream','reflections','ideas','changes','wisdom','library','divination',
        'living-field','co-lab','anchor','pro-studio'
      ]::text[]
    )
  );

ALTER TABLE house_member_preferences
  DROP CONSTRAINT IF EXISTS house_member_preferences_shortcut_ids_cardinality_check;
ALTER TABLE house_member_preferences
  DROP CONSTRAINT IF EXISTS house_member_preferences_shortcut_ids_catalog_check;

ALTER TABLE house_member_preferences
  ADD CONSTRAINT house_member_preferences_shortcut_ids_cardinality_check
  CHECK (cardinality(shortcut_ids) <= 19);

ALTER TABLE house_member_preferences
  ADD CONSTRAINT house_member_preferences_shortcut_ids_catalog_check
  CHECK (shortcut_ids <@ ARRAY[
    'writing','relationships','practices','community','studio','decisions','astrology',
    'journal','dream','reflections','ideas','changes','wisdom','library','divination',
    'living-field','co-lab','anchor','pro-studio'
  ]::text[]);

COMMENT ON COLUMN house_member_preferences.center_ids IS
  'Optional explicit Center placement. NULL means use the current House default; it is not a member-authored choice. Pro Studio admitted by HOUSE-PRO-STUDIO-01.';

COMMENT ON COLUMN house_member_preferences.shortcut_ids IS
  'Member-chosen HERE NOW placement. IDs must come from the canonical House place catalog; placement never grants access. Pro Studio admitted by HOUSE-PRO-STUDIO-01.';

COMMIT;
