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

\echo ''
\echo '── 3b. §VI — EVERY ARRIVAL of every multi-arrival Work, one row each ────'
\echo '   Preserved individually rather than summarised: the ambiguity IS the finding, and a'
\echo '   count would hide which candidates the old ordering was choosing between.'
\echo '   would_have_been_selected marks the row pre-migration runtime would have read.'
SELECT
  a.manuscript_id,
  a.id                                                     AS arrival_id,
  a.created_at,
  a.source_kind,
  left(a.source_text_hash, 12)                             AS source_text_hash,
  length(a.source_text)                                    AS source_chars,
  a.original_filename,
  (row_number() OVER (PARTITION BY a.manuscript_id ORDER BY a.created_at ASC, a.id ASC) = 1)
                                                           AS would_have_been_selected
FROM manuscript_source_arrivals a
WHERE a.manuscript_id IN (
  SELECT manuscript_id FROM manuscript_source_arrivals
   WHERE manuscript_id IS NOT NULL GROUP BY manuscript_id HAVING count(*) > 1)
ORDER BY a.manuscript_id, a.created_at ASC, a.id ASC;

\echo ''
\echo '── 3c. §VII.8 — which of those need FOUNDER RECONCILIATION, by predeclared rule ──'
\echo '   The rule is written before the data is read, so the reading cannot invent it:'
\echo '     IDENTICAL  every arrival carries the same source_text_hash. The ordering chose among'
\echo '                copies of one text, so no authorial question is at stake — deterministic.'
\echo '     DIVERGENT  the arrivals differ. The old ordering silently preferred one text over'
\echo '                another; only the member can say which is their Source. FOUNDER/MEMBER.'
SELECT
  a.manuscript_id,
  count(*)                                   AS arrivals,
  count(DISTINCT a.source_text_hash)         AS distinct_texts,
  CASE WHEN count(DISTINCT a.source_text_hash) = 1
       THEN 'IDENTICAL — deterministic, no authorial question'
       ELSE 'DIVERGENT — requires member/founder reconciliation' END AS disposition
FROM manuscript_source_arrivals a
WHERE a.manuscript_id IS NOT NULL
GROUP BY a.manuscript_id
HAVING count(*) > 1
ORDER BY count(DISTINCT a.source_text_hash) DESC, count(*) DESC;

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

\echo ''
\echo '── 9. §VII.7 — shapes the tested backfill has NOT been exercised against ─'
\echo '   Each row returned here is a production shape the simulation did not cover. A non-zero'
\echo '   count does not condemn the backfill; it names what must be simulated before cutover.'
SELECT 'sections whose manuscript has no owner row' AS shape, count(*) AS n
  FROM manuscript_sections s
 WHERE NOT EXISTS (SELECT 1 FROM member_manuscripts m WHERE m.id = s.manuscript_id)
UNION ALL
SELECT 'arrivals claimed by a Work owned by a different member', count(*)
  FROM manuscript_source_arrivals a JOIN member_manuscripts m ON m.id = a.manuscript_id
 WHERE a.member_id <> m.member_id
UNION ALL
SELECT 'Works with sections but zero-length bodies', count(DISTINCT manuscript_id)
  FROM manuscript_sections WHERE length(trim(body)) = 0
UNION ALL
SELECT 'Works with more than 2000 sections', count(*) FROM (
  SELECT manuscript_id FROM manuscript_sections GROUP BY manuscript_id HAVING count(*) > 2000) t
UNION ALL
SELECT 'duplicate (manuscript_id, position) pairs', count(*) FROM (
  SELECT manuscript_id, position FROM manuscript_sections
   GROUP BY manuscript_id, position HAVING count(*) > 1) d
UNION ALL
SELECT 'arrivals with an artifact_ref but no artifact_hash', count(*)
  FROM manuscript_source_arrivals WHERE artifact_ref IS NOT NULL AND artifact_hash IS NULL;

ROLLBACK;
