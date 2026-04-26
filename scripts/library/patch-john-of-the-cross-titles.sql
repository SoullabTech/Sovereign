-- Title and author patches for the John of the Cross corpus.
--
-- Generated 2026-04-26 against the dev DB at
--   postgresql://soullab@localhost:5432/maia_consciousness
--
-- Each UPDATE is dual-keyed on (id, checksum) so it cannot accidentally
-- match a different row even if IDs are recycled or rows are re-imported.
--
-- Wrap in a transaction so any error rolls back all three patches.

BEGIN;

-- 1. Dark Night of the Soul
UPDATE library_sources
SET title  = 'Dark Night of the Soul',
    author = 'St. John of the Cross',
    updated_at = NOW()
WHERE id       = '670d7d2f-53db-48eb-808e-3fc6e16358cf'
  AND checksum = '2c21dacf50c7660e01eaad9afe612d6254d047145d39d8d7e34b79957866bbdc';

-- 2. Saint John of the Cross — Paschasius (1919)
UPDATE library_sources
SET title  = 'Saint John of the Cross — Paschasius (1919)',
    author = 'Paschasius Heriz, O.C.D.',
    updated_at = NOW()
WHERE id       = 'a4376357-c529-4904-acf9-05e00a408feb'
  AND checksum = '0bfaebf0a611fe68690b9333e1a90cbf9831220563ca32da293bb3fd974f5184';

-- 3. Complete Works of Saint John of the Cross, Volume I
UPDATE library_sources
SET title  = 'Complete Works of Saint John of the Cross, Volume I',
    author = 'St. John of the Cross; translated by E. Allison Peers',
    updated_at = NOW()
WHERE id       = 'ba9a1b04-db94-446d-8c95-beb393a194cd'
  AND checksum = '4e39649e8950d4d02448aa979d6e8048586b0818414c7c0547c7dd2a3df626ad';

-- Verify all three updated exactly one row each before commit
DO $$
DECLARE
  hit_count INT;
BEGIN
  SELECT COUNT(*) INTO hit_count
  FROM library_sources
  WHERE id IN (
    '670d7d2f-53db-48eb-808e-3fc6e16358cf',
    'a4376357-c529-4904-acf9-05e00a408feb',
    'ba9a1b04-db94-446d-8c95-beb393a194cd'
  )
  AND title IN (
    'Dark Night of the Soul',
    'Saint John of the Cross — Paschasius (1919)',
    'Complete Works of Saint John of the Cross, Volume I'
  );
  IF hit_count <> 3 THEN
    RAISE EXCEPTION 'Expected 3 patched rows, found %', hit_count;
  END IF;
END $$;

COMMIT;

-- Verify post-commit
SELECT id, title, author, file_path
FROM library_sources
WHERE id IN (
  '670d7d2f-53db-48eb-808e-3fc6e16358cf',
  'a4376357-c529-4904-acf9-05e00a408feb',
  'ba9a1b04-db94-446d-8c95-beb393a194cd'
)
ORDER BY title;
