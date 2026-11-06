-- ASTRO-PRO-BIRTH-REVISION-01 — the revision counter the Pro chart routes read.
--
-- app/api/astrology/pro/my-chart/route.ts and lib/astrology/proSubjectBirth.ts
-- read members.astrology_birth_revision to detect birth details that changed
-- while a chart was being calculated. The code reached canonical on
-- 2026-10-30 (79575c33f, "No migrations") without the column, so every
-- "Open my chart" request failed with 42703 (undefined column).
--
-- The counter starts at 0 and goes up by one whenever a birth field changes.
-- The trigger owns it: a write that sets the column directly is overridden,
-- so no route can move the revision without moving the birth details.
-- Adding a column with a constant default is a metadata-only change.
BEGIN;
SET LOCAL lock_timeout = '5s';

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS astrology_birth_revision bigint NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION members_bump_astrology_birth_revision()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (NEW.birth_date, NEW.birth_time, NEW.birth_location_lat, NEW.birth_location_lng,
      NEW.birth_location_name, NEW.birth_timezone)
     IS DISTINCT FROM
     (OLD.birth_date, OLD.birth_time, OLD.birth_location_lat, OLD.birth_location_lng,
      OLD.birth_location_name, OLD.birth_timezone) THEN
    NEW.astrology_birth_revision := OLD.astrology_birth_revision + 1;
  ELSE
    NEW.astrology_birth_revision := OLD.astrology_birth_revision;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS members_astrology_birth_revision ON members;
CREATE TRIGGER members_astrology_birth_revision
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION members_bump_astrology_birth_revision();

COMMENT ON COLUMN members.astrology_birth_revision IS
  'Increments when birth details change; the Pro chart routes use it to refuse a chart calculated from superseded details.';

COMMIT;
