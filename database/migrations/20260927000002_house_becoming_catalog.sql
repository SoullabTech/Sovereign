-- BECOMING-HOUSE-01 — admit Becoming into member-chosen House placement.
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
        'journal','dream','becoming','reflections','ideas','changes','wisdom','library',
        'divination','living-field','co-lab','anchor'
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
    'journal','dream','becoming','reflections','ideas','changes','wisdom','library',
    'divination','living-field','co-lab','anchor'
  ]::text[]);

COMMENT ON COLUMN house_member_preferences.center_ids IS
  'Optional explicit Center placement. NULL means use the current House default; it is not a member-authored choice. Becoming admitted by BECOMING-HOUSE-01.';

COMMENT ON COLUMN house_member_preferences.shortcut_ids IS
  'Member-chosen HERE NOW placement. IDs must come from the canonical House place catalog; placement never grants access. Becoming admitted by BECOMING-HOUSE-01.';

COMMIT;
