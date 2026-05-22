-- Align house_system DB defaults with the engine default ('porphyry').
--
-- Three places used to disagree:
--   - lib/astrology/ephemerisCalculator.ts interface comment said 'whole-sign'
--   - lib/astrology/ephemerisCalculator.ts function default is 'porphyry'
--   - member_birth_data.house_system DB default was 'placidus' (if table exists)
--   - member_natal_chart.house_system DB default was 'placidus' (if table exists)
--
-- The function is what actually runs. The canonical store for chart data is
-- members.natal_chart_json (see migration 20260522000002). The member_birth_data
-- and member_natal_chart tables exist in some environments but are dormant —
-- no application code reads from or writes to them. Aligning their defaults
-- here too, but conditionally — they may not exist on every deploy.
--
-- Existing rows are unaffected — this only changes the default for new INSERTs
-- that omit the column.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'member_birth_data') THEN
    ALTER TABLE member_birth_data ALTER COLUMN house_system SET DEFAULT 'porphyry';
    COMMENT ON COLUMN member_birth_data.house_system IS
      'House system for chart computation. Canonical default: porphyry (matches engine default in lib/astrology/ephemerisCalculator.ts). Note: this table is dormant; canonical store is members.natal_chart_json.';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'member_natal_chart') THEN
    ALTER TABLE member_natal_chart ALTER COLUMN house_system SET DEFAULT 'porphyry';
    COMMENT ON COLUMN member_natal_chart.house_system IS
      'House system used when this chart was computed. Default: porphyry. Note: this table is dormant; canonical store is members.natal_chart_json.';
  END IF;
END $$;
