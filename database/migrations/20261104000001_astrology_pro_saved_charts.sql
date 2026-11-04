-- ASTRO-PRO-SAVED-CHARTS-01 — a Pro member's saved charts for other people.
--
-- Owner-only. Each row holds the birth details the owner typed for someone
-- else, plus the owner's attestation that they have that person's permission
-- to keep them. No computed chart, interpretation, note or free text is
-- stored: the chart is recalculated from these fields on every open.
-- Deleting a row is a hard delete; deleting the owner removes every row.
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS astrology_pro_saved_charts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  label text NOT NULL CHECK (char_length(btrim(label)) BETWEEN 1 AND 80),
  birth_date date NOT NULL,
  birth_time time NOT NULL,
  latitude double precision NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude double precision NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  timezone text NOT NULL CHECK (char_length(timezone) BETWEEN 1 AND 64),
  place_label text NULL CHECK (place_label IS NULL OR char_length(place_label) <= 160),
  permission_attested_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_astrology_pro_saved_charts_owner
  ON astrology_pro_saved_charts (owner_member_id, created_at DESC);

COMMENT ON TABLE astrology_pro_saved_charts IS
  'Pro saved charts for other people. Owner-only; birth details plus permission attestation; no computed chart or notes; hard delete.';

COMMIT;
