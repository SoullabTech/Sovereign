-- Align house_system DB defaults with the engine default.
--
-- Three places used to disagree:
--   - lib/astrology/ephemerisCalculator.ts interface comment said 'whole-sign'
--   - lib/astrology/ephemerisCalculator.ts function default is 'porphyry'
--   - member_birth_data.house_system DB default was 'placidus'
--   - member_natal_chart.house_system DB default was 'placidus'
--
-- The function is what actually computes charts. All charts in production
-- (including the one stored in members.natal_chart_json) were computed with
-- 'porphyry'. Aligning the schema defaults to match.
--
-- Existing rows are unaffected — this only changes the default for new INSERTs
-- that omit the column. Rows with explicit house_system values keep them.

ALTER TABLE member_birth_data ALTER COLUMN house_system SET DEFAULT 'porphyry';
ALTER TABLE member_natal_chart ALTER COLUMN house_system SET DEFAULT 'porphyry';

COMMENT ON COLUMN member_birth_data.house_system IS
  'House system for chart computation. Canonical default: porphyry (matches engine default in lib/astrology/ephemerisCalculator.ts).';

COMMENT ON COLUMN member_natal_chart.house_system IS
  'House system used when this chart was computed. Default: porphyry.';
