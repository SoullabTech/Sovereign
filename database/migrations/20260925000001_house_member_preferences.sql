-- HOUSE-PREFERENCES-01/P1. Candidate only; requires explicit migration authorization.
-- Separate from legacy member_settings readers; no consent, role, membership or content fields.
BEGIN;
CREATE TABLE IF NOT EXISTS house_member_preferences (
  member_id uuid PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
  version smallint NOT NULL DEFAULT 1
    CONSTRAINT house_member_preferences_version_check CHECK (version = 1),
  shortcut_ids text[] NOT NULL,
  passing_through boolean NOT NULL,
  revision integer NOT NULL DEFAULT 1
    CONSTRAINT house_member_preferences_revision_check CHECK (revision > 0),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT house_member_preferences_shortcut_ids_cardinality_check
    CHECK (cardinality(shortcut_ids) <= 9),
  CONSTRAINT house_member_preferences_shortcut_ids_dimensions_check
    CHECK (array_ndims(shortcut_ids) IS NULL OR (array_ndims(shortcut_ids) = 1 AND array_lower(shortcut_ids, 1) = 1)),
  CONSTRAINT house_member_preferences_shortcut_ids_no_nulls_check
    CHECK (array_position(shortcut_ids, NULL) IS NULL),
  CONSTRAINT house_member_preferences_shortcut_ids_catalog_check
    CHECK (shortcut_ids <@ ARRAY['journal','ideas','reflections','changes','decisions','relationships','writing','community','astrology']::text[])
);
COMMENT ON TABLE house_member_preferences IS 'Member-owned House presentation choices only. Authentication and scoped queries govern access. Preferences never grant destination access.';
COMMIT;
