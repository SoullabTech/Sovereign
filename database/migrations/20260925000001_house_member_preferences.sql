-- HOUSE-PREFERENCES-01/P1. Candidate only; requires explicit migration authorization.
-- Prefix-safe for the live House reader: create the complete current preference shape atomically.
BEGIN;
CREATE TABLE IF NOT EXISTS house_member_preferences (
  member_id uuid PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
  version smallint NOT NULL DEFAULT 1
    CONSTRAINT house_member_preferences_version_check CHECK (version = 1),
  center_ids text[],
  shortcut_ids text[] NOT NULL,
  passing_through boolean NOT NULL,
  revision integer NOT NULL DEFAULT 1
    CONSTRAINT house_member_preferences_revision_check CHECK (revision > 0),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT house_member_preferences_center_ids_check CHECK (
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
  ),
  CONSTRAINT house_member_preferences_shortcut_ids_cardinality_check
    CHECK (cardinality(shortcut_ids) <= 18),
  CONSTRAINT house_member_preferences_shortcut_ids_dimensions_check
    CHECK (array_ndims(shortcut_ids) IS NULL OR (array_ndims(shortcut_ids) = 1 AND array_lower(shortcut_ids, 1) = 1)),
  CONSTRAINT house_member_preferences_shortcut_ids_no_nulls_check
    CHECK (array_position(shortcut_ids, NULL) IS NULL),
  CONSTRAINT house_member_preferences_shortcut_ids_catalog_check
    CHECK (shortcut_ids <@ ARRAY[
      'writing','relationships','practices','community','studio','decisions','astrology',
      'journal','dream','reflections','ideas','changes','wisdom','library','divination',
      'living-field','co-lab','anchor'
    ]::text[])
);
COMMENT ON TABLE house_member_preferences IS 'Member-owned House presentation choices only. Authentication and scoped queries govern access. Preferences never grant destination access.';
COMMENT ON COLUMN house_member_preferences.center_ids IS
  'Optional explicit Center placement. NULL means use the current House default; it is not a member-authored choice.';
COMMENT ON COLUMN house_member_preferences.shortcut_ids IS
  'Member-chosen HERE NOW placement. IDs must come from the canonical House place catalog; placement never grants access.';
COMMIT;
