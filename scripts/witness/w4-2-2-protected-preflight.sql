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
-- ── USAGE ─────────────────────────────────────────────────────────────────
--
-- ⚠️ THE PROTECTED DATABASE IS `maia-postgres`, IN DOCKER, ON MINISFORUM.
-- It is not reachable from the Mac Studio by socket or by TCP. An earlier
-- version of this line said `psql "$PROTECTED_DATABASE_URL"` — a variable that
-- EXISTS NOWHERE IN THIS PROJECT — so psql silently fell back to its defaults
-- (local socket, database = $USER) and reported `database "soullab" does not
-- exist`. ⛔ A usage line naming an undefined variable is a usage line that
-- points at the wrong machine.
--
-- Run from the Mac Studio. The script is read locally and piped in:
--
--     git fetch origin claude/w4-2-schema-design
--     git show origin/claude/w4-2-schema-design:scripts/witness/w4-2-2-protected-preflight.sql \
--       > /tmp/w4-preflight.sql
--     ssh soullab@minisforum \
--       'docker exec -i maia-postgres psql -U soullab -d maia_consciousness -X' \
--       < /tmp/w4-preflight.sql
--
-- ⭐ SECTION 1 IS THE FIRST THING TO READ, and it is first for this reason:
-- it prints the database, host, port, role and read-only state actually
-- connected to. ⛔ If it does not name the protected database, nothing below it
-- is a protected reading — whatever it says.

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
-- reported nothing about the database it was pointed at. An absent thing is a
-- FINDING, never an error and never a zero.
--
-- ⚠️⚠️ AND "PRESENT" IS NOT ENOUGH. `run-sql-migrations.sh` carries migration
-- logic for a LEGACY `schema_migrations` that has `version` and no `filename`,
-- so the table can exist while the column this query reads does not — the same
-- death, one level deeper. Three states, not two.
SELECT (to_regclass('public.schema_migrations') IS NOT NULL) AS ledger_table,
       EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_schema='public' AND table_name='schema_migrations'
                  AND column_name='filename') AS ledger_readable \gset

\if :ledger_readable
SELECT m.filename,
       CASE WHEN s.filename IS NULL THEN 'ABSENT FROM LEDGER' ELSE 'applied' END AS ledger
  FROM (VALUES
          ('20260901000001_ask_threads.sql'),
          ('20260914000001_proposal_succession.sql'),
          ('20260914000005_editorial_ontology.sql')
       ) AS m(filename)
  LEFT JOIN schema_migrations s ON s.filename = m.filename
 ORDER BY m.filename;
\elif :ledger_table
  \echo '   ⚠️ schema_migrations PRESENT but carries NO `filename` column —'
  \echo '      the LEGACY shape (`version`) that run-sql-migrations.sh migrates.'
  \echo '   ⛔ Ledger state NOT MEASURABLE by filename. ⭐ Not an error, and not'
  \echo '      an empty ledger: a ledger in a vocabulary this query cannot read.'
\else
  \echo '   ⛔ schema_migrations ABSENT on this database.'
  \echo '   ⛔ Ledger state NOT MEASURABLE.'
\endif
\echo '   ⭐ The catalogue below is unaffected by all three states, and is the'
\echo '      stronger evidence anyway — see the §3 note.'

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
-- ⚠️⚠️ THIS LINE WAS REPORTED BACKWARDS, AND IT IS THE EXACT COLUMN W4-S1
-- CHANGES. It read `(NOT (is_nullable='NO'))`, so a genuinely NOT NULL column
-- printed `false` under a label that says IS NOT NULL. ⛔ The double negation
-- was the whole defect; the inner test alone is the answer.
UNION ALL SELECT 'ask_threads.anchor IS NOT NULL',
       COALESCE((SELECT (is_nullable = 'NO')::text
                   FROM information_schema.columns
                  WHERE table_schema='public' AND table_name='ask_threads'
                    AND column_name='anchor'), 'COLUMN ABSENT')
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

-- ⭐⭐ THE GATE — THREE STATES, NOT TWO.
--
-- ⚠️ It used to mean only *`proposal_chain_id` exists*, and the gated query then
-- required `ask_threads`, `anchor`, `proposal_chain_id` AND `reading_identity`.
-- ⛔ Assuming the rest of a migration from ONE column is exactly the inference a
-- DRIFT DETECTOR may not make — the 2026-09-07 finding was a partially applied
-- lane. A half-present substrate must report NOT MEASURABLE, never an SQL error
-- and never a zero.
SELECT (to_regclass('public.ask_threads') IS NOT NULL)                  AS t_threads,
       EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_schema='public' AND table_name='ask_threads'
                  AND column_name='anchor')                             AS c_anchor,
       EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_schema='public' AND table_name='ask_threads'
                  AND column_name='proposal_chain_id')                  AS c_chain,
       EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_schema='public' AND table_name='ask_threads'
                  AND column_name='reading_identity')                   AS c_reading,
       (to_regclass('public.proposal_chains') IS NOT NULL)              AS t_chains,
       (to_regclass('public.proposal_chain_directions') IS NOT NULL)    AS t_dirs
  \gset

SELECT (:'t_threads'::boolean AND :'c_anchor'::boolean AND :'c_chain'::boolean
        AND :'c_reading'::boolean AND :'t_chains'::boolean AND :'t_dirs'::boolean)
         AS w5_complete,
       (:'c_chain'::boolean OR :'t_dirs'::boolean) AS w5_any \gset

\echo ''
\echo '── 4 · INVARIANTS ────────────────────────────────────────────────'

\if :w5_complete
  \echo '   ⭐ W5 substrate COMPLETE — the three counts are measurable.'
  SELECT count(*) FILTER (WHERE anchor IS NOT NULL AND proposal_chain_id IS NOT NULL)
           AS xor_violations,
         count(*) FILTER (WHERE proposal_chain_id IS NOT NULL AND reading_identity IS NOT NULL)
           AS editorial_reading_collisions,
         count(*) FILTER (WHERE proposal_chain_id IS NOT NULL)
           AS existing_editorial_threads
    FROM ask_threads;
\elif :w5_any
  \echo '   ⚠️⚠️ W5 substrate PARTIAL — some required objects exist and some do not.'
  \echo '   ⛔ xor_violations                 NOT MEASURABLE  (never "0")'
  \echo '   ⛔ editorial_reading_collisions   NOT MEASURABLE'
  \echo '   ⛔ existing_editorial_threads     NOT MEASURABLE'
  \echo '   ⭐ PARTIAL IS ITSELF THE FINDING. See §3 for which objects are missing.'
\else
  \echo '   ⛔ W5 substrate ABSENT on this database.'
  \echo '   ⛔ xor_violations                 NOT MEASURABLE  (never "0")'
  \echo '   ⛔ editorial_reading_collisions   NOT MEASURABLE'
  \echo '   ⛔ existing_editorial_threads     NOT MEASURABLE'
\endif

-- ⭐ The thread total is a different question and survives all three states —
-- ⛔ but only where the table exists at all.
\if :t_threads
  SELECT count(*) AS total_threads FROM ask_threads;
\else
  \echo '   ⛔ ask_threads itself is ABSENT — total_threads NOT MEASURABLE.'
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
