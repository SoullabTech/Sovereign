-- LIVING-ARCHIVE-SOURCE-VAULT-R1 rollback.
--
-- This rollback is valid only while R1 remains empty of historical artifacts,
-- claims, gaps and lineage edges. R1 itself performs no ingestion/backfill.
-- Once later acts admit data, rollback requires a separate custody decision and
-- this script MUST NOT be used as a shortcut around that authority.

BEGIN;
SET LOCAL lock_timeout = '5s';

DO $$
DECLARE
  n BIGINT;
BEGIN
  IF to_regclass('public.living_archive_artifacts') IS NOT NULL THEN
    EXECUTE 'SELECT count(*) FROM living_archive_artifacts' INTO n;
    IF n <> 0 THEN
      RAISE EXCEPTION 'rollback refused: living_archive_artifacts contains % row(s)', n;
    END IF;
  END IF;

  IF to_regclass('public.living_archive_provenance_claims') IS NOT NULL THEN
    EXECUTE 'SELECT count(*) FROM living_archive_provenance_claims' INTO n;
    IF n <> 0 THEN
      RAISE EXCEPTION 'rollback refused: living_archive_provenance_claims contains % row(s)', n;
    END IF;
  END IF;

  IF to_regclass('public.living_archive_known_gaps') IS NOT NULL THEN
    EXECUTE 'SELECT count(*) FROM living_archive_known_gaps' INTO n;
    IF n <> 0 THEN
      RAISE EXCEPTION 'rollback refused: living_archive_known_gaps contains % row(s)', n;
    END IF;
  END IF;

  IF to_regclass('public.living_archive_lineage_edges') IS NOT NULL THEN
    EXECUTE 'SELECT count(*) FROM living_archive_lineage_edges' INTO n;
    IF n <> 0 THEN
      RAISE EXCEPTION 'rollback refused: living_archive_lineage_edges contains % row(s)', n;
    END IF;
  END IF;
END $$;

DROP TABLE IF EXISTS living_archive_lineage_edges;
DROP TABLE IF EXISTS living_archive_provenance_claims;
DROP TABLE IF EXISTS living_archive_known_gaps;
DROP TABLE IF EXISTS living_archive_artifacts;
DROP TABLE IF EXISTS living_archive_catalogue_versions;

COMMIT;
