-- HOUSE-PLACE-CATALOG-01 — idempotently align saved HERE · NOW with the full canonical House catalog.
BEGIN;
ALTER TABLE house_member_preferences
  DROP CONSTRAINT IF EXISTS house_member_preferences_shortcut_ids_check;
ALTER TABLE house_member_preferences
  DROP CONSTRAINT IF EXISTS house_member_preferences_shortcut_ids_check3;
ALTER TABLE house_member_preferences
  DROP CONSTRAINT IF EXISTS house_member_preferences_shortcut_ids_cardinality_check;
ALTER TABLE house_member_preferences
  DROP CONSTRAINT IF EXISTS house_member_preferences_shortcut_ids_catalog_check;

ALTER TABLE house_member_preferences
  ADD CONSTRAINT house_member_preferences_shortcut_ids_cardinality_check
  CHECK (cardinality(shortcut_ids) <= 18);

ALTER TABLE house_member_preferences
  ADD CONSTRAINT house_member_preferences_shortcut_ids_catalog_check
  CHECK (shortcut_ids <@ ARRAY[
    'writing','relationships','practices','community','studio','decisions','astrology',
    'journal','dream','reflections','ideas','changes','wisdom','library','divination',
    'living-field','co-lab','anchor'
  ]::text[]);

COMMENT ON COLUMN house_member_preferences.shortcut_ids IS
  'Member-chosen HERE NOW placement. IDs must come from the canonical House place catalog; placement never grants access. Dream is a first-class House facet.';
COMMIT;
