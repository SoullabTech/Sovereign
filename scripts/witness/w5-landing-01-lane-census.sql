-- W5-LANDING-01 · PROTECTED SUCCESSION-LANE CENSUS — READ ONLY.
--
-- ⭐⭐ THE QUESTION:
--
--     what is the EXACT pending set on the protected database, for the five
--     migrations W4's schema depends on?
--
-- ⛔ AND THE PROHIBITION THAT SHAPES IT: no inference. `…000001 absent,
-- therefore …000002–000004 absent` is forbidden even though the dependency
-- graph makes it likely. Each migration is measured on its own, twice — once
-- against the LEDGER and once against the CATALOGUE — and the two answers are
-- reported side by side rather than reconciled.
--
--     ⭐ The ledger is a claim. The catalogue is the fact.
--     ⛔ Where they disagree, the disagreement IS the finding. 2026-09-07.
--
-- ⛔ WRITES NOTHING, STRUCTURALLY: the whole run is inside `BEGIN READ ONLY`,
-- so any statement added later is refused by the server rather than by this
-- comment. ⛔ No repair, no backfill, no ANALYZE.
--
-- ── USAGE ─────────────────────────────────────────────────────────────────
--
-- ⚠️ The protected database is `maia-postgres`, in Docker, ON MINISFORUM. It is
-- not reachable from the Mac Studio by socket or TCP. Run from the Mac Studio:
--
--     git fetch origin claude/w4-2-schema-design
--     git show origin/claude/w4-2-schema-design:scripts/witness/w5-landing-01-lane-census.sql \
--       > /tmp/w5-lane-census.sql
--     ssh soullab@minisforum \
--       'docker exec -i maia-postgres psql -U soullab -d maia_consciousness -X' \
--       < /tmp/w5-lane-census.sql
--
-- ⭐ SECTION 1 FIRST. If it does not name the protected database, nothing below
-- it is a protected reading, whatever it says.

\set ON_ERROR_STOP on
\pset pager off

BEGIN READ ONLY;

\echo ''
\echo '══════════════════════════════════════════════════════════════════'
\echo ' W5-LANDING-01 · PROTECTED SUCCESSION-LANE CENSUS — READ ONLY'
\echo '══════════════════════════════════════════════════════════════════'
\echo ''
\echo '── 1 · DATABASE IDENTITY ─────────────────────────────────────────'

SELECT current_database()                      AS db,
       inet_server_addr()                      AS host,
       inet_server_port()                      AS port,
       current_user                            AS role,
       current_setting('transaction_read_only') AS read_only;

\echo ''
\echo '── 2 · LEDGER · all five, by exact filename ──────────────────────'

-- ⚠️ Three ledger states, not two: `run-sql-migrations.sh` carries logic for a
-- LEGACY `schema_migrations` with `version` and no `filename`, so the table can
-- exist while the column this query reads does not.
SELECT (to_regclass('public.schema_migrations') IS NOT NULL) AS ledger_table,
       EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_schema='public' AND table_name='schema_migrations'
                  AND column_name='filename') AS ledger_readable \gset

\if :ledger_readable
SELECT m.filename,
       CASE WHEN s.filename IS NULL THEN 'ABSENT FROM LEDGER' ELSE 'applied' END AS ledger
  FROM (VALUES
          ('20260914000001_proposal_succession.sql'),
          ('20260914000002_manuscript_revision_offers.sql'),
          ('20260914000003_proposal_chains_member_identity.sql'),
          ('20260914000004_manuscript_revision_authorizations.sql'),
          ('20260914000005_editorial_ontology.sql')
       ) AS m(filename)
  LEFT JOIN schema_migrations s ON s.filename = m.filename
 ORDER BY m.filename;
\elif :ledger_table
  \echo '   ⚠️ schema_migrations PRESENT but carries NO `filename` column — the'
  \echo '      LEGACY (`version`) shape. ⛔ Ledger state NOT MEASURABLE by name.'
\else
  \echo '   ⛔ schema_migrations ABSENT. ⛔ Ledger state NOT MEASURABLE.'
\endif

\echo ''
\echo '── 3 · CATALOGUE · every object, one migration at a time ─────────'
\echo '   ⛔ NO INFERENCE. Each row is measured on its own; an absent'
\echo '      predecessor never decides a successor.'

-- ⚠️ THE OBJECT LIST APPEARS TWICE, AND THE DUPLICATION IS DELIBERATE.
--
-- The first draft held it in a `CREATE TEMP VIEW`, and the read-only membrane
-- refused that outright:
--     ERROR: cannot execute CREATE VIEW in a read-only transaction
-- ⭐ The property that makes this instrument safe caught its own author. A
-- read-only transaction admits no temp object to hold the list, and a psql
-- variable cannot carry a quoted SQL literal list safely.
--
-- ⛔ SO THE TWO COPIES ARE GUARDED RATHER THAN TRUSTED: the seal harness
-- asserts they are byte-identical. A copy that drifted would make the detail
-- and the rollup describe different databases.

WITH lane_objects(migration, kind, name, col) AS (VALUES
  ('000001','table',     'proposal_chains',                   NULL),
  ('000001','table',     'proposal_versions',                 NULL),
  ('000001','index',     'proposal_versions_one_successor',   NULL),
  ('000001','index',     'proposal_versions_one_root',        NULL),
  ('000001','constraint','proposal_versions_chain_id_id_key', NULL),
  ('000001','constraint','proposal_versions_predecessor_same_chain', NULL),
  ('000001','function',  'refuse_proposal_version_mutation',  NULL),
  ('000001','function',  'refuse_proposal_chain_mutation',    NULL),
  ('000001','trigger',   'proposal_versions_immutable',       NULL),
  ('000001','trigger',   'proposal_chains_immutable',         NULL),
  ('000002','table',     'manuscript_revision_offers',        NULL),
  ('000002','function',  'manuscript_revision_offers_freeze', NULL),
  ('000002','function',  'manuscript_revision_offers_producer_required', NULL),
  ('000002','trigger',   'manuscript_revision_offers_producer_check', NULL),
  ('000002','trigger',   'manuscript_revision_offers_freeze_check',   NULL),
  ('000003','constraint','proposal_chains_member_id_id_key',  NULL),
  ('000004','table',     'manuscript_revision_authorizations', NULL),
  ('000004','index',     'uq_mra_one_unspent_permission',     NULL),
  ('000004','function',  'refuse_mra_identity_mutation',      NULL),
  ('000004','trigger',   'mra_identity_immutable',            NULL),
  ('000005','constraint','proposal_chains_member_work_id_key', NULL),
  ('000005','column',    'ask_threads',                       'proposal_chain_id'),
  ('000005','constraint','ask_threads_proposal_chain_fkey',   NULL),
  ('000005','table',     'proposal_chain_insights',           NULL),
  ('000005','table',     'proposal_chain_directions',         NULL),
  ('000005','function',  'authored_editorial_record_immutable', NULL),
  ('000005','trigger',   'proposal_chain_insights_no_update', NULL),
  ('000005','trigger',   'proposal_chain_directions_no_delete', NULL)
),
lane_state AS (
SELECT o.migration, o.kind, o.name, o.col,
       CASE o.kind
         WHEN 'table'  THEN (to_regclass('public.'||o.name) IS NOT NULL)
         WHEN 'index'  THEN (to_regclass('public.'||o.name) IS NOT NULL)
         WHEN 'constraint' THEN EXISTS (
              SELECT 1 FROM pg_constraint c
                JOIN pg_namespace n ON n.oid=c.connamespace AND n.nspname='public'
               WHERE c.conname = o.name)
         WHEN 'column' THEN EXISTS (
              SELECT 1 FROM information_schema.columns
               WHERE table_schema='public' AND table_name=o.name
                 AND column_name=o.col)
         WHEN 'function' THEN EXISTS (
              SELECT 1 FROM pg_proc p
                JOIN pg_namespace n ON n.oid=p.pronamespace AND n.nspname='public'
               WHERE p.proname = o.name)
         WHEN 'trigger' THEN EXISTS (
              SELECT 1 FROM pg_trigger g
               WHERE g.tgname = o.name AND NOT g.tgisinternal)
       END AS present
  FROM lane_objects o
)
SELECT migration, kind,
       name || COALESCE('.'||col, '') AS object,
       present,
       CASE WHEN bool_and(present) OVER (PARTITION BY migration) THEN 'PRESENT'
            WHEN NOT bool_or(present) OVER (PARTITION BY migration) THEN 'ABSENT'
            ELSE 'PARTIAL' END AS migration_state
  FROM lane_state
 ORDER BY migration, kind, object;

\echo ''
\echo '── 4 · CATALOGUE ROLLUP · per migration ──────────────────────────'
\echo '   PARTIAL is first-class: never reported as pending, never as'
\echo '   landed. It is its own finding.'

-- ⚠️ THE LEDGER JOIN CANNOT LIVE IN THIS QUERY. A `CASE WHEN <false> THEN
-- (SELECT … FROM schema_migrations)` still RESOLVES the relation at PARSE time,
-- so on a database without the ledger the statement dies before the CASE is
-- ever evaluated — `ERROR: relation "schema_migrations" does not exist`.
-- ⛔ A SQL-level gate is not a gate. The ledger join is therefore in §5, behind
-- a psql `\if`, which decides whether the statement is SENT AT ALL.
--
-- ⭐ This rollup is captured into psql variables so §5 needs no third copy of
-- the object list.
SELECT max(CASE WHEN migration='000001' THEN state END) AS cat1,
       max(CASE WHEN migration='000002' THEN state END) AS cat2,
       max(CASE WHEN migration='000003' THEN state END) AS cat3,
       max(CASE WHEN migration='000004' THEN state END) AS cat4,
       max(CASE WHEN migration='000005' THEN state END) AS cat5
  FROM (
WITH lane_objects(migration, kind, name, col) AS (VALUES
  ('000001','table',     'proposal_chains',                   NULL),
  ('000001','table',     'proposal_versions',                 NULL),
  ('000001','index',     'proposal_versions_one_successor',   NULL),
  ('000001','index',     'proposal_versions_one_root',        NULL),
  ('000001','constraint','proposal_versions_chain_id_id_key', NULL),
  ('000001','constraint','proposal_versions_predecessor_same_chain', NULL),
  ('000001','function',  'refuse_proposal_version_mutation',  NULL),
  ('000001','function',  'refuse_proposal_chain_mutation',    NULL),
  ('000001','trigger',   'proposal_versions_immutable',       NULL),
  ('000001','trigger',   'proposal_chains_immutable',         NULL),
  ('000002','table',     'manuscript_revision_offers',        NULL),
  ('000002','function',  'manuscript_revision_offers_freeze', NULL),
  ('000002','function',  'manuscript_revision_offers_producer_required', NULL),
  ('000002','trigger',   'manuscript_revision_offers_producer_check', NULL),
  ('000002','trigger',   'manuscript_revision_offers_freeze_check',   NULL),
  ('000003','constraint','proposal_chains_member_id_id_key',  NULL),
  ('000004','table',     'manuscript_revision_authorizations', NULL),
  ('000004','index',     'uq_mra_one_unspent_permission',     NULL),
  ('000004','function',  'refuse_mra_identity_mutation',      NULL),
  ('000004','trigger',   'mra_identity_immutable',            NULL),
  ('000005','constraint','proposal_chains_member_work_id_key', NULL),
  ('000005','column',    'ask_threads',                       'proposal_chain_id'),
  ('000005','constraint','ask_threads_proposal_chain_fkey',   NULL),
  ('000005','table',     'proposal_chain_insights',           NULL),
  ('000005','table',     'proposal_chain_directions',         NULL),
  ('000005','function',  'authored_editorial_record_immutable', NULL),
  ('000005','trigger',   'proposal_chain_insights_no_update', NULL),
  ('000005','trigger',   'proposal_chain_directions_no_delete', NULL)
),
lane_state AS (
SELECT o.migration,
       CASE o.kind
         WHEN 'table'  THEN (to_regclass('public.'||o.name) IS NOT NULL)
         WHEN 'index'  THEN (to_regclass('public.'||o.name) IS NOT NULL)
         WHEN 'constraint' THEN EXISTS (
              SELECT 1 FROM pg_constraint c
                JOIN pg_namespace n ON n.oid=c.connamespace AND n.nspname='public'
               WHERE c.conname = o.name)
         WHEN 'column' THEN EXISTS (
              SELECT 1 FROM information_schema.columns
               WHERE table_schema='public' AND table_name=o.name
                 AND column_name=o.col)
         WHEN 'function' THEN EXISTS (
              SELECT 1 FROM pg_proc p
                JOIN pg_namespace n ON n.oid=p.pronamespace AND n.nspname='public'
               WHERE p.proname = o.name)
         WHEN 'trigger' THEN EXISTS (
              SELECT 1 FROM pg_trigger g
               WHERE g.tgname = o.name AND NOT g.tgisinternal)
       END AS present
  FROM lane_objects o
),
rolled AS (
  SELECT migration,
         CASE WHEN bool_and(present) THEN 'PRESENT'
              WHEN NOT bool_or(present) THEN 'ABSENT'
              ELSE 'PARTIAL' END AS state
    FROM lane_state GROUP BY migration
)
SELECT * FROM rolled
  ) r \gset

SELECT '20260914000001_proposal_succession.sql'            AS migration, :'cat1' AS catalogue
UNION ALL SELECT '20260914000002_manuscript_revision_offers.sql',        :'cat2'
UNION ALL SELECT '20260914000003_proposal_chains_member_identity.sql',   :'cat3'
UNION ALL SELECT '20260914000004_manuscript_revision_authorizations.sql',:'cat4'
UNION ALL SELECT '20260914000005_editorial_ontology.sql',                :'cat5'
ORDER BY 1;

\echo ''
\echo '── 5 · THE EXACT PENDING SET ─────────────────────────────────────'
\echo '   Derived from BOTH readings. Where they disagree the row says'
\echo '   DRIFT and it is NOT resolved here.'

\if :ledger_readable
WITH led(tag, filename, catalogue) AS (VALUES
  ('000001','20260914000001_proposal_succession.sql',             :'cat1'),
  ('000002','20260914000002_manuscript_revision_offers.sql',      :'cat2'),
  ('000003','20260914000003_proposal_chains_member_identity.sql', :'cat3'),
  ('000004','20260914000004_manuscript_revision_authorizations.sql', :'cat4'),
  ('000005','20260914000005_editorial_ontology.sql',              :'cat5')
)
SELECT led.filename,
       CASE WHEN a.applied THEN 'applied' ELSE 'absent' END AS ledger,
       led.catalogue,
       CASE
         WHEN led.catalogue = 'PARTIAL'                          THEN 'PARTIAL - ruling owed'
         WHEN a.applied     AND led.catalogue = 'PRESENT'        THEN 'LANDED'
         WHEN NOT a.applied AND led.catalogue = 'ABSENT'         THEN 'PENDING'
         WHEN a.applied     AND led.catalogue = 'ABSENT'         THEN 'DRIFT - ledger claims it, database lacks it'
         WHEN NOT a.applied AND led.catalogue = 'PRESENT'        THEN 'DRIFT - present but unledgered (2026-09-07 shape)'
       END AS state
  FROM led
  CROSS JOIN LATERAL (
    SELECT EXISTS (SELECT 1 FROM schema_migrations s WHERE s.filename = led.filename) AS applied
  ) a
 ORDER BY led.filename;
\else
  \echo '   The ledger is NOT MEASURABLE, so NO pending set can be derived.'
  \echo '   The catalogue rollup in section 4 stands on its own and is'
  \echo '   unaffected - but it is not a pending set and must not be read'
  \echo '   as one.'
\endif

\echo ''
\echo '── 6 · WHAT THIS RUN DOES NOT AUTHORIZE ──────────────────────────'
\echo '   protected read            ✅ this'
\echo '   landing package design    ⛔ W5-LANDING-02'
\echo '   migration execution       ⛔'
\echo '   canonical merge           ⛔'
\echo '   deployment                ⛔'
\echo '   data repair               ⛔'
\echo ''

COMMIT;
