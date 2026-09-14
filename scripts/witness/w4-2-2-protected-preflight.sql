-- W4-2.2 · PROTECTED SCHEMA PREFLIGHT — READ ONLY.
--
-- ⭐⭐ WHAT THIS ANSWERS, AND NOTHING ELSE:
--
--     what schema is actually on the protected database, and how expensive
--     would it be to make W4-2's additional proofs structural?
--
-- ⛔ IT WRITES NOTHING, AND THAT IS STRUCTURAL RATHER THAN PROMISED. The whole
-- run happens inside a READ ONLY transaction, so an INSERT/UPDATE/DELETE/DDL
-- statement — added later by anyone, for any reason — is refused by the server
-- rather than by this comment.
--
-- ⛔ NO REPAIR. If it finds a violating row it REPORTS it. A preflight that
-- fixed what it found would destroy the evidence it exists to gather.
--
-- ── ⭐ THE ORDER IS THE POINT ──────────────────────────────────────────────
--
-- Identity and ledger FIRST, invariants only where the substrate exists.
-- `20260914000005` is custody-held and may be genuinely unexecuted here; a
-- query against `proposal_chain_id` would then error, or — far worse under a
-- careless reader — be reported as "0 violations".
--
--     ⛔ AN ABSENT SCHEMA IS `NOT MEASURABLE`. IT IS NEVER ZERO.
--
-- Usage (the founder runs this; this session cannot reach the protected host):
--     psql "$PROTECTED_DATABASE_URL" -X -f scripts/witness/w4-2-2-protected-preflight.sql

\set ON_ERROR_STOP on
\pset pager off

-- ⭐ THE READ-ONLY MEMBRANE. Set before anything is read.
BEGIN READ ONLY;

\echo ''
\echo '══════════════════════════════════════════════════════════════════'
\echo ' W4-2.2 · PROTECTED SCHEMA PREFLIGHT — READ ONLY'
\echo '══════════════════════════════════════════════════════════════════'
\echo ''
\echo '── 1 · DATABASE IDENTITY ─────────────────────────────────────────'

SELECT current_database()                       AS db,
       inet_server_addr()                       AS host,
       inet_server_port()                       AS port,
       current_user                             AS role,
       current_setting('transaction_read_only')  AS read_only,
       version()                                AS server;

\echo ''
\echo '── 2 · LEDGER · the migrations this act depends on ───────────────'

-- ⚠️ THE LEDGER ITSELF MAY BE ABSENT, and an instrument that DIES on that has
-- reported nothing about the database it was pointed at. Gated for the same
-- reason §4 is gated: an absent thing is a FINDING, never an error and never a
-- zero. (Found immediately — the disposable witness databases are built by
-- applying migration files directly and carry no ledger at all.)
SELECT (to_regclass('public.schema_migrations') IS NOT NULL) AS ledger_present \gset

\if :ledger_present
SELECT m.filename,
       CASE WHEN s.filename IS NULL THEN 'ABSENT FROM LEDGER' ELSE 'applied' END AS ledger
  FROM (VALUES
          ('20260901000001_ask_threads.sql'),
          ('20260914000001_proposal_succession.sql'),
          ('20260914000005_editorial_ontology.sql')
       ) AS m(filename)
  LEFT JOIN schema_migrations s ON s.filename = m.filename
 ORDER BY m.filename;
\else
  \echo '   ⛔ schema_migrations ABSENT on this database.'
  \echo '   ⛔ Ledger state NOT MEASURABLE. ⭐ The catalogue below is unaffected'
  \echo '      and is the stronger evidence anyway — see the §3 note.'
\endif

\echo ''
\echo '── 3 · CATALOGUE · what is actually here, ledger or not ──────────'
\echo '   ⚠️ The ledger is a claim; the catalogue is the fact. They can'
\echo '      disagree — that disagreement is itself a finding.'

SELECT 'ask_threads'                   AS object,
       (to_regclass('public.ask_threads') IS NOT NULL)::text        AS present
UNION ALL SELECT 'ask_turns',
       (to_regclass('public.ask_turns') IS NOT NULL)::text
UNION ALL SELECT 'ask_threads.proposal_chain_id',
       EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_schema='public' AND table_name='ask_threads'
                  AND column_name='proposal_chain_id')::text
UNION ALL SELECT 'ask_threads.anchor IS NOT NULL',
       COALESCE((SELECT (NOT is_nullable::boolean)::text
                   FROM (SELECT (is_nullable='NO') AS is_nullable
                           FROM information_schema.columns
                          WHERE table_schema='public' AND table_name='ask_threads'
                            AND column_name='anchor') q), 'COLUMN ABSENT')
UNION ALL SELECT 'proposal_chains',
       (to_regclass('public.proposal_chains') IS NOT NULL)::text
UNION ALL SELECT 'proposal_versions',
       (to_regclass('public.proposal_versions') IS NOT NULL)::text
UNION ALL SELECT 'proposal_chain_directions',
       (to_regclass('public.proposal_chain_directions') IS NOT NULL)::text
UNION ALL SELECT 'proposal_chain_insights',
       (to_regclass('public.proposal_chain_insights') IS NOT NULL)::text
UNION ALL SELECT 'editorial_turn_bindings (W4, must be ABSENT)',
       (to_regclass('public.editorial_turn_bindings') IS NOT NULL)::text;

-- ⭐ THE GATE. Everything downstream is conditional on the substrate existing.
SELECT EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_schema='public' AND table_name='ask_threads'
                  AND column_name='proposal_chain_id') AS w5_present \gset

\echo ''
\echo '── 4 · INVARIANTS ────────────────────────────────────────────────'

\if :w5_present
  \echo '   W5-3 substrate PRESENT — the three counts are measurable.'
  SELECT count(*) FILTER (WHERE anchor IS NOT NULL AND proposal_chain_id IS NOT NULL)
           AS xor_violations,
         count(*) FILTER (WHERE proposal_chain_id IS NOT NULL AND reading_identity IS NOT NULL)
           AS editorial_reading_collisions,
         count(*) FILTER (WHERE proposal_chain_id IS NOT NULL)
           AS existing_editorial_threads,
         count(*) AS total_threads
    FROM ask_threads;
\else
  \echo '   ⛔ W5-3 substrate ABSENT on this database.'
  \echo '   ⛔ xor_violations                 NOT MEASURABLE  (never "0")'
  \echo '   ⛔ editorial_reading_collisions   NOT MEASURABLE'
  \echo '   ⛔ existing_editorial_threads     NOT MEASURABLE'
  \echo '   ⭐ ask_threads total is still measurable, and is reported below.'
  SELECT count(*) AS total_threads FROM ask_threads;
\endif

\echo ''
\echo '── 5 · SIZE · for the unique-build lock ruling (§11) ─────────────'
\echo '   ⭐ pg_total_relation_size and the planner estimate are the sizing'
\echo '      instruments; COUNT(*) is the INTEGRITY instrument above and is'
\echo '      deliberately not reused here.'
\echo '   ⚠️ reltuples is -1 on a relation ANALYZE has never seen; that is'
\echo '      "unknown", not "empty".'

SELECT c.relname                                            AS relation,
       CASE WHEN c.reltuples < 0 THEN NULL ELSE c.reltuples::bigint END
                                                            AS est_live_rows,
       CASE WHEN c.reltuples < 0 THEN 'NEVER ANALYZED' ELSE 'estimate' END
                                                            AS est_quality,
       pg_size_pretty(pg_relation_size(c.oid))              AS heap,
       pg_size_pretty(pg_total_relation_size(c.oid))        AS total_with_indexes,
       s.last_analyze, s.last_autoanalyze
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = 'public'
  LEFT JOIN pg_stat_user_tables s ON s.relid = c.oid
 WHERE c.relname IN ('ask_threads','ask_turns',
                     'proposal_chain_directions','proposal_versions')
 ORDER BY pg_total_relation_size(c.oid) DESC;

\echo ''
\echo '── 6 · DRIFT · does a required UNIQUE target already exist? ──────'
\echo '   ⚠️ Source not containing one does not prove the protected database'
\echo '      lacks it. This is the same class as the 2026-09-07 schema drift.'

SELECT t.relname AS relation, i.relname AS index_name,
       idx.indisunique AS is_unique, idx.indisvalid AS is_valid,
       pg_get_indexdef(idx.indexrelid) AS definition
  FROM pg_index idx
  JOIN pg_class i ON i.oid = idx.indexrelid
  JOIN pg_class t ON t.oid = idx.indrelid
  JOIN pg_namespace n ON n.oid = t.relnamespace AND n.nspname='public'
 WHERE t.relname IN ('ask_threads','ask_turns',
                     'proposal_chain_directions','proposal_versions')
   AND idx.indisunique
 ORDER BY t.relname, i.relname;

\echo ''
\echo '   ⛔ INVALID indexes, if any (a failed CONCURRENTLY leaves these):'
SELECT t.relname AS relation, i.relname AS index_name
  FROM pg_index idx
  JOIN pg_class i ON i.oid = idx.indexrelid
  JOIN pg_class t ON t.oid = idx.indrelid
  JOIN pg_namespace n ON n.oid = t.relnamespace AND n.nspname='public'
 WHERE NOT idx.indisvalid
 ORDER BY 1, 2;

\echo ''
\echo '── 7 · WHAT THIS RUN DOES NOT AUTHORIZE ──────────────────────────'
\echo '   protected read            ✅ this'
\echo '   migration implementation  ⛔'
\echo '   migration execution       ⛔'
\echo '   canonical merge           ⛔'
\echo '   deployment                ⛔'
\echo '   data repair               ⛔'
\echo ''

COMMIT;
