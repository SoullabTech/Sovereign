-- HOUSE-PREFERENCES-01/P1. Candidate only; requires explicit migration authorization.
-- Separate from legacy member_settings readers; no consent, role, membership or content fields.
BEGIN;
CREATE TABLE house_member_preferences (
  member_id uuid PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
  version smallint NOT NULL DEFAULT 1 CHECK (version = 1),
  shortcut_ids text[] NOT NULL,
  passing_through boolean NOT NULL,
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CHECK (cardinality(shortcut_ids) <= 9),
  CHECK (array_ndims(shortcut_ids) IS NULL OR (array_ndims(shortcut_ids) = 1 AND array_lower(shortcut_ids, 1) = 1)),
  CHECK (array_position(shortcut_ids, NULL) IS NULL),
  CHECK (shortcut_ids <@ ARRAY['journal','ideas','reflections','changes','decisions','relationships','writing','community','astrology']::text[])
);
COMMENT ON TABLE house_member_preferences IS 'Member-owned House presentation choices only. Authentication and scoped queries govern access. Preferences never grant destination access.';
COMMIT;
