-- PROPOSAL-AUTHORIZATION-MIGRATION-STATE-01 — READ-ONLY environment census.
--
-- ⛔ THIS FILE MUTATES NOTHING. Every statement is a SELECT against catalogs and
-- two row counts. No DDL, no DML, no temp objects, no session settings.
-- ⛔ It reads NO manuscript prose and NO proposal content — shapes and counts
-- only.
--
-- ⭐ THE TABLE IS CLASSIFIED FROM THE TABLE, NEVER FROM MIGRATION FILENAMES.
-- Finding 0 of the identity census is precisely that the filenames and the
-- resulting shape disagree.
--
-- RUN:  psql "<connection>" -f scripts/witness/proposal-authorization-migration-state.sql
-- Safe against production. Add -v ON_ERROR_STOP=1 if you want it to halt early.

\pset pager off
\echo '════════ ENVIRONMENT ════════'
SELECT current_database() AS database, version() AS server, now() AS read_at;

\echo ''
\echo '════════ 1 · MIGRATION LEDGER ════════'
\echo '-------- 1a · the ledger shape, DISCOVERED not assumed --------'
-- ⚠️ THE FIRST DRAFT ASSUMED A COLUMN NAMED `version` AND ERRORED. The walk
-- database's ledger is (filename, checksum, applied_at). An instrument that
-- assumes the shape of the thing it censuses is not censusing it.
-- ⛔ An ABSENT ledger is a real finding, never reportable as "no migrations".
SELECT table_name,
       string_agg(column_name, ', ' ORDER BY ordinal_position) AS columns
  FROM information_schema.columns
 WHERE table_schema = 'public'
   AND table_name IN ('schema_migrations','migrations','_migrations','_prisma_migrations')
 GROUP BY table_name;

\echo '-------- 1b · the four migrations of interest --------'
-- ⭐ The identifier column is resolved from the catalog, then the real query is
-- generated and run with \gexec. Matching is by SUBSTRING, so a stored path or
-- a stripped `.sql` both hit.
SELECT format($f$
SELECT m.want AS migration,
       CASE WHEN l.%1$I IS NULL THEN 'ABSENT' ELSE 'PRESENT' END AS state,
       %2$s AS applied_at
  FROM (VALUES
    ('20260910000004_manuscript_revision_proposals'),
    ('20260913000002_manuscript_revision_proposals'),
    ('20260913000003_revision_proposal_execution_authority'),
    ('20260914000001_proposal_succession')
  ) AS m(want)
  LEFT JOIN public.schema_migrations l ON l.%1$I LIKE '%%' || m.want || '%%'
 ORDER BY 1 $f$,
  (SELECT column_name FROM information_schema.columns
    WHERE table_schema='public' AND table_name='schema_migrations'
      AND column_name IN ('filename','version','name') ORDER BY 1 LIMIT 1),
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
         WHERE table_schema='public' AND table_name='schema_migrations'
           AND column_name='applied_at') THEN 'l.applied_at::text' ELSE 'NULL::text' END)
 WHERE to_regclass('public.schema_migrations') IS NOT NULL
\gexec

\echo ''
\echo '════════ 2 · TABLE PRESENCE ════════'
SELECT t.want AS table_name,
       CASE WHEN c.oid IS NULL THEN 'ABSENT' ELSE 'PRESENT' END AS state
  FROM (VALUES ('manuscript_revision_proposals'),
               ('proposal_chains'), ('proposal_versions')) AS t(want)
  LEFT JOIN pg_class c ON c.relname = t.want AND c.relkind = 'r'
       AND c.relnamespace = 'public'::regnamespace
 ORDER BY t.want;

\echo ''
\echo '════════ 3 · manuscript_revision_proposals · SHAPE VERDICT ════════'
-- ⭐ MECHANICAL. Marker columns decide, and HYBRID is a first-class answer:
--   COLLABORATIVE  proposed_text / reason / based_on / read_state / origin
--   AUTHORIZATION  expected_text / replacement_text / accepted_at / operation
WITH cols AS (
  SELECT column_name FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'manuscript_revision_proposals'
), m AS (
  SELECT
    (SELECT count(*) FROM cols WHERE column_name IN
       ('proposed_text','reason','based_on','read_state','origin','producer')) AS collab,
    (SELECT count(*) FROM cols WHERE column_name IN
       ('expected_text','replacement_text','accepted_at','resulting_version','operation')) AS authz,
    (SELECT count(*) FROM cols) AS total
)
SELECT collab AS collaborative_markers, authz AS authorization_markers, total AS columns,
       CASE WHEN total = 0            THEN 'ABSENT'
            WHEN collab > 0 AND authz > 0 THEN 'HYBRID'
            WHEN collab > 0            THEN 'COLLABORATIVE'
            WHEN authz  > 0            THEN 'AUTHORIZATION'
            ELSE 'OTHER' END AS shape_verdict
  FROM m;

\echo ''
\echo '-------- columns (all three tables) --------'
SELECT table_name, ordinal_position AS pos, column_name, data_type,
       is_nullable, column_default
  FROM information_schema.columns
 WHERE table_schema = 'public'
   AND table_name IN ('manuscript_revision_proposals','proposal_chains','proposal_versions')
 ORDER BY table_name, ordinal_position;

\echo ''
\echo '════════ 4 · CONSTRAINTS (with FK delete behaviour) ════════'
SELECT c.conrelid::regclass::text AS table_name, c.conname AS constraint_name,
       CASE c.contype WHEN 'p' THEN 'PRIMARY KEY' WHEN 'f' THEN 'FOREIGN KEY'
                      WHEN 'u' THEN 'UNIQUE' WHEN 'c' THEN 'CHECK'
                      ELSE c.contype::text END AS kind,
       CASE WHEN c.contype = 'f' THEN
         CASE c.confdeltype WHEN 'a' THEN 'NO ACTION' WHEN 'r' THEN 'RESTRICT'
              WHEN 'c' THEN 'CASCADE' WHEN 'n' THEN 'SET NULL'
              WHEN 'd' THEN 'SET DEFAULT' END END AS on_delete,
       c.condeferrable AS deferrable, pg_get_constraintdef(c.oid) AS definition
  FROM pg_constraint c
 WHERE c.conrelid::regclass::text IN
       ('manuscript_revision_proposals','proposal_chains','proposal_versions')
 ORDER BY 1, 3, 2;

\echo ''
\echo '════════ 5 · INDEXES ════════'
SELECT tablename AS table_name, indexname, indexdef
  FROM pg_indexes
 WHERE schemaname = 'public'
   AND tablename IN ('manuscript_revision_proposals','proposal_chains','proposal_versions')
 ORDER BY 1, 2;

\echo ''
\echo '════════ 6 · TRIGGERS ════════'
SELECT c.relname AS table_name, t.tgname AS trigger_name,
       t.tgenabled AS enabled, pg_get_triggerdef(t.oid) AS definition
  FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid
 WHERE NOT t.tgisinternal
   AND c.relname IN ('manuscript_revision_proposals','proposal_chains','proposal_versions')
 ORDER BY 1, 2;

\echo ''
\echo '════════ 7 · ROW COUNTS ════════'
-- ⛔ Counts only. No content. Absent tables are reported as ABSENT, never as 0 —
-- "the query ran and found nothing" is not "the object does not exist".
SELECT t.want AS table_name,
       CASE WHEN c.oid IS NULL THEN 'ABSENT'
            ELSE (SELECT count(*)::text FROM pg_class x WHERE x.oid = c.oid) END AS present,
       CASE WHEN c.oid IS NULL THEN NULL
            ELSE (xpath('/row/c/text()', query_to_xml(
                    format('SELECT count(*) AS c FROM public.%I', t.want),
                    false, true, '')))[1]::text::bigint END AS rows
  FROM (VALUES ('manuscript_revision_proposals'),
               ('proposal_chains'), ('proposal_versions')) AS t(want)
  LEFT JOIN pg_class c ON c.relname = t.want AND c.relkind = 'r'
       AND c.relnamespace = 'public'::regnamespace
 ORDER BY t.want;

\echo ''
\echo '════════ 8 · AUTHORIZATION-SHAPED ROWS (only if that shape exists) ════════'
-- ⭐ The single most decisive number for the migration ruling: whether any
-- environment already carries accepted authorizations. ⛔ Counts only.
SELECT CASE WHEN to_regclass('public.manuscript_revision_proposals') IS NULL
            THEN 'table ABSENT'
            WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'manuscript_revision_proposals'
                     AND column_name = 'accepted_at')
            THEN 'no accepted_at column — not the authorization shape'
            ELSE (xpath('/row/c/text()', query_to_xml(
                   'SELECT count(*) AS c FROM public.manuscript_revision_proposals
                     WHERE accepted_at IS NOT NULL', false, true, '')))[1]::text
            END AS accepted_rows;

\echo ''
\echo '════════ END · nothing was written ════════'
