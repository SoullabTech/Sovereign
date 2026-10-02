-- HOUSE-NAVIGATION-01 — idempotently assert member-chosen Center on the full current House catalog.
BEGIN;
ALTER TABLE house_member_preferences
  ADD COLUMN IF NOT EXISTS center_ids text[];

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
        'living-field','co-lab','anchor'
      ]::text[]
    )
  );
COMMENT ON COLUMN house_member_preferences.center_ids IS
  'Optional explicit Center placement. NULL means use the current House default; it is not a member-authored choice. Dream is a first-class House facet.';
COMMIT;
