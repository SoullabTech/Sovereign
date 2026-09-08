-- PT-3 §VIII.C — production legacy census. READ ONLY.
--
-- AUTHORITY. Founder ruling, Writer's Studio, 2026-09-08 §VIII.C.
--
-- Run against PRODUCTION before any cutover. It mutates nothing: every statement is a SELECT, and
-- the whole file runs inside a read-only transaction so that is structural rather than promised.
--
--   ssh soullab@minisforum 'docker exec -i maia-postgres \
--     psql -U soullab maia_consciousness' < scripts/witness/pt3-production-legacy-census.sql
--
-- What it answers is exactly §VIII.C's list, plus §VI's special witness for Works carrying more
-- than one Historical Arrival — the category the migration deliberately REFUSES to resolve.

BEGIN;
SET TRANSACTION READ ONLY;

\echo '── 1. Works, and whether they have a Historical Source ──────────────────'
SELECT
  count(*)                                                            AS works_total,
  count(*) FILTER (WHERE a.n > 0)                                     AS works_with_source,
  count(*) FILTER (WHERE a.n = 0)                                     AS works_without_source,
  count(*) FILTER (WHERE m.source_custody = 'source_custodied')       AS custody_claimed,
  count(*) FILTER (WHERE m.source_custody = 'legacy_interpreted_import') AS custody_legacy_default
FROM member_manuscripts m
LEFT JOIN LATERAL (
  SELECT count(*) AS n FROM manuscript_source_arrivals x WHERE x.manuscript_id = m.id
) a ON true;

\echo '── 2. Arrivals ─────────────────────────────────────────────────────────'
SELECT
  count(*)                                        AS arrivals_total,
  count(*) FILTER (WHERE manuscript_id IS NULL)    AS unclaimed,
  count(*) FILTER (WHERE source_kind = 'artifact_extraction')   AS artifact_backed,
  count(*) FILTER (WHERE source_kind = 'member_supplied_text')  AS member_supplied,
  count(*) FILTER (WHERE artifact_ref IS NOT NULL AND artifact_hash IS NULL) AS ref_without_hash
FROM manuscript_source_arrivals;

\echo '── 3. §VI — Works with MORE THAN ONE arrival (migration will NOT resolve these) ──'
SELECT count(*) AS works_with_multiple_arrivals FROM (
  SELECT manuscript_id FROM manuscript_source_arrivals
   WHERE manuscript_id IS NOT NULL GROUP BY manuscript_id HAVING count(*) > 1
) t;

\echo '   per Work: what pre-migration runtime WOULD have selected (ORDER BY created_at ASC),'
\echo '   and whether a later arrival differs from it. Ordering is not authority — this is'
\echo '   recorded so the implicit machine choice becomes explicit and attributable.'
SELECT
  a.manuscript_id,
  count(*)                                            AS arrival_count,
  min(a.created_at)                                   AS earliest_at,
  max(a.created_at)                                   AS latest_at,
  count(DISTINCT a.source_text_hash)                  AS distinct_source_texts,
  count(DISTINCT a.source_kind)                       AS distinct_source_kinds,
  (count(DISTINCT a.source_text_hash) > 1)            AS later_arrival_contradicts_earliest
FROM manuscript_source_arrivals a
WHERE a.manuscript_id IS NOT NULL
GROUP BY a.manuscript_id
HAVING count(*) > 1
ORDER BY count(*) DESC, min(a.created_at) ASC;

\echo '── 4. Sections — the Source Representation, before it had an identity ──'
SELECT
  count(*)                                            AS sections_total,
  count(DISTINCT manuscript_id)                       AS works_with_sections,
  count(*) FILTER (WHERE heading IS NULL)             AS sections_without_heading,
  count(*) FILTER (WHERE heading_depth IS NOT NULL)   AS sections_with_depth
FROM manuscript_sections;

\echo '── 5. Works whose sections exist with NO arrival behind them ───────────'
\echo '   (genuine legacy_interpreted_import: a representation with no Historical Source)'
SELECT count(DISTINCT s.manuscript_id) AS representations_without_arrival
FROM manuscript_sections s
WHERE NOT EXISTS (
  SELECT 1 FROM manuscript_source_arrivals a WHERE a.manuscript_id = s.manuscript_id);

\echo '── 6. Orphans and contradictions ───────────────────────────────────────'
SELECT
  (SELECT count(*) FROM manuscript_sections s
    WHERE NOT EXISTS (SELECT 1 FROM member_manuscripts m WHERE m.id = s.manuscript_id))
                                                      AS sections_without_work,
  (SELECT count(*) FROM manuscript_source_arrivals a
    WHERE a.manuscript_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM member_manuscripts m WHERE m.id = a.manuscript_id))
                                                      AS arrivals_pointing_at_missing_work,
  (SELECT count(*) FROM member_manuscripts m
    WHERE m.source_custody = 'source_custodied'
      AND NOT EXISTS (SELECT 1 FROM manuscript_source_arrivals a WHERE a.manuscript_id = m.id))
                                                      AS custody_claimed_without_arrival,
  (SELECT count(*) FROM manuscript_working_drafts d
    WHERE NOT EXISTS (SELECT 1 FROM manuscript_sections s WHERE s.manuscript_id = d.manuscript_id))
                                                      AS drafts_without_sections;

\echo '── 7. Where old query-order behaviour currently determines apparent currency ──'
\echo '   verifyCustody read ORDER BY created_at ASC LIMIT 1. Every Work below has its custody'
\echo '   answer decided by that clause rather than by any recorded act.'
SELECT count(*) AS works_whose_currency_is_decided_by_sort_order FROM (
  SELECT manuscript_id FROM manuscript_source_arrivals
   WHERE manuscript_id IS NOT NULL GROUP BY manuscript_id HAVING count(*) > 1
) t;

\echo '── 8. Migration attribution already present in the ledger ──────────────'
-- Guarded: the ledger's shape has changed over this project's life, and a census must not fail
-- on the thing it is measuring. Reports what is there, names what is missing.
DO $$
DECLARE total int; no_sum int; no_commit int; has_commit bool;
BEGIN
  IF to_regclass('public.schema_migrations') IS NULL THEN
    RAISE NOTICE 'schema_migrations: ABSENT';
    RETURN;
  END IF;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name = 'schema_migrations' AND column_name = 'applied_by_commit')
    INTO has_commit;
  EXECUTE 'SELECT count(*), count(*) FILTER (WHERE checksum IS NULL) FROM schema_migrations'
    INTO total, no_sum;
  IF has_commit THEN
    EXECUTE 'SELECT count(*) FILTER (WHERE applied_by_commit IS NULL) FROM schema_migrations'
      INTO no_commit;
    RAISE NOTICE 'schema_migrations: % rows, % without checksum, % without commit', total, no_sum, no_commit;
  ELSE
    RAISE NOTICE 'schema_migrations: % rows, % without checksum, attribution columns NOT PRESENT '
                 '(every applied migration to date is unattributable)', total, no_sum;
  END IF;
END $$;

ROLLBACK;
