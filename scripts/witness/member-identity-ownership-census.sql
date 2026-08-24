-- MEMBER IDENTITY OWNERSHIP CENSUS — pure SQL, read-only, zero dependencies.
--
-- Twin of scripts/witness/member-identity-ownership-census.ts. Runs entirely inside
-- maia-postgres via psql: no node, no tsx, no node_modules, no deploy, and nothing copied
-- into the running application container. The deployed image and the production application
-- filesystem are both left exactly as they were.
--
-- WHAT THIS WITNESSES
--   For every column that references (or plausibly holds) a member id: how many rows sit
--   under candidate A, how many under candidate B, and — for columns inside a unique index —
--   whether rebinding B to A would violate that uniqueness.
--
-- WHAT THIS DOES NOT WITNESS
--   Which identity should be canonical. Semantic equivalence of rows. Whether history rows
--   may be rewritten at all (append-only ledgers: no). This is corroboration and boundary-
--   checking. It is not permission to act.
--
-- DATA DISCIPLINE
--   No arbitrary member-scoped content is read. Output is limited to schema/count information
--   plus account metadata for the two explicitly supplied candidate member ids. No other
--   member is named: non-candidate portrait owners appear by uuid prefix only.
--
-- STRUCTURAL GUARANTEES
--   * READ ONLY transaction — a write is refused by the server, not by this file's manners.
--   * No INSERT/UPDATE/DELETE, no DDL, no temp tables, no sequence use, no VACUUM/ANALYZE.
--   * Dynamic probing uses EXECUTE inside a plpgsql BEGIN/EXCEPTION block, which opens an
--     internal subtransaction per probe. One failing column therefore cannot abort the
--     transaction and turn every later result into a false zero.
--   * Statements outside the DO block are individually savepoint-isolated at the psql level.
--   * Comparison types come from the catalog. UUID is never assumed.
--   LIMIT, stated rather than hidden: per-probe isolation covers ERRORS, not CANCELS. A
--   statement_timeout fires against the top-level statement (the DO block), so a cancel can
--   end the run rather than a single probe. Any status containing 'canceling' means the run
--   was cut short there — re-probe that column narrowed; do not read the rest as complete.
--
-- THE STATES ARE KEPT DISTINCT — a count column shows '-' whenever it is not a count:
--   0                        status OK                          measured, genuinely zero
--   N                        status OK                          measured
--   '-'                      status UNCOUNTED_LARGE             heap larger than :maxmb and no
--                                                               usable index — size KNOWN, scan
--                                                               declined. NOT a zero.
--   '-'                      status UNCOUNTED_UNANALYZED        size could not be established at
--                                                               all. NOT a zero.
--   '-'                      status UNCOUNTED_TYPE_INCOMPATIBLE cannot compare a member id to
--                                                               this column type. NOT a zero.
--   '-'                      status ERROR:…                     probe failed. NOT a zero.
--
-- SIZE IS MEASURED, NOT ESTIMATED (repaired 2026-08-24)
--   The first production run bucketed 86 relations as UNCOUNTED_LARGE_NO_INDEX, which conflated
--   two different epistemic states: a genuinely large relation, and a relation whose reltuples
--   is -1 because it has never been ANALYZEd — size simply unknown. soul_portrait_consents, a
--   9-row table, landed in that bucket. The gate now reads pg_relation_size(), which is exact
--   and cheap and does not depend on analyze state, so 'never analyzed' no longer implies
--   'assume large'. reltuples is retained only as a reported fact (the anlz column), never as a
--   gate.
--
-- Run (from the Mac Studio checkout; nothing is written to the shared worktree):
--   git fetch origin claude/member-identity-portrait-split-y4zhaq && \
--   git show origin/claude/member-identity-portrait-split-y4zhaq:scripts/witness/member-identity-ownership-census.sql | \
--   ssh soullab@minisforum "docker exec -i maia-postgres psql -U soullab -d maia_consciousness \
--     -v a=ce284751-e457-42f6-89b6-bc07d0876682 \
--     -v b=49ae4717-2b3a-4189-b25d-2bef95b1a45a" \
--   2>&1 | sed -E 's/^psql:[^:]*:[0-9]+: NOTICE:  ?//'
--
--   The census table is emitted as NOTICEs (the only way a plpgsql block with per-probe
--   exception handling can stream output). The trailing sed strips psql's file:line prefix;
--   drop it if you would rather see the raw stream. NOTICEs already emitted survive a
--   cancel, so partial output is real output.
--
--   :a = canonical candidate.  :b = legacy candidate.  Labels only; this file makes no ruling.
--   Optional: -v maxmb=64   (heap-size ceiling, in MB, for scanning a column with no usable
--                            index; relations above it are reported UNCOUNTED_LARGE with their
--                            actual size, never silently skipped)
--
-- VALIDATED BEFORE FIRST PRODUCTION USE
--   Run against a synthetic Postgres 16 fixture built to fire every branch: FK→members.id,
--   FK→members.email (correctly NOT counted as an id reference), an un-FK'd member-shaped
--   column, one-row-per-member unique collision, composite unique with and without overlap,
--   expression unique index, partial unique index, ledger table, session table, both-zero,
--   domain-typed column (UNCOUNTED_TYPE_INCOMPATIBLE), a never-analyzed table (which must now be
--   COUNTED, not bucketed as large), and an over-ceiling relation (UNCOUNTED_LARGE with its
--   measured size).
--   Per-probe isolation separately proven: a probe against a nonexistent relation reports
--   ERROR while the probes on either side of it return real counts and the transaction stays
--   usable. The instrument was not handed over untested.

\pset pager off
\pset format aligned
\set ON_ERROR_STOP 0
\set VERBOSITY terse
\timing off

\if :{?maxmb}
\else
\set maxmb 64
\endif

BEGIN;
SET TRANSACTION READ ONLY;
SET LOCAL statement_timeout = '900s';   -- bounds the whole run; the index/size gate below is
                                        -- what actually keeps it short. NOTICEs already
                                        -- emitted survive a timeout, so partial output is real.
SET LOCAL census.a     = :'a';
SET LOCAL census.b     = :'b';
SET LOCAL census.maxmb = :'maxmb';

\echo ''
\echo '════════ 1. THE TWO CANDIDATE IDENTITIES ════════'
SAVEPOINT p;
SELECT id::text, username, email, name, onboarded, onboarding_step, created_at, last_sign_in
  FROM members
 WHERE id IN (:'a'::uuid, :'b'::uuid)
 ORDER BY created_at;
ROLLBACK TO SAVEPOINT p;   -- unconditional: harmless after success, recovery after an error
RELEASE SAVEPOINT p;

\echo ''
\echo '════════ 2. OWNERSHIP CENSUS — every discovered member-referencing column ════════'
\echo 'A = canonical candidate   B = legacy candidate   "-" is NEVER a zero (see status)'
\echo ''

SAVEPOINT p;
DO $CENSUS$
DECLARE
  v_a        text   := current_setting('census.a');
  v_b        text   := current_setting('census.b');
  v_maxbytes bigint := current_setting('census.maxmb')::bigint * 1024 * 1024;
  r          record;
  ur         record;
  na         bigint;
  nb         bigint;
  overlap    bigint;
  status     text;
  rule       text;
  coll       text;
  othercols  text;
  cmptype    text;
  n_total    int := 0;
  n_error    int := 0;
  n_uncnt    int := 0;
  tally      jsonb := '{}'::jsonb;
  -- NOT named `t`: a plpgsql record variable shadows a same-named SQL alias, and the discovery
  -- query below aliases information_schema.tables as t. That collision fails the whole block
  -- with "record t is not assigned yet".
  tally_row  record;
BEGIN
  RAISE NOTICE '%', rpad('table',30) || ' | ' || rpad('column',24) || ' | ' || rpad('fk→id',5)
                 || ' | ' || rpad('type',18) || ' | ' || lpad('A',8) || ' | ' || lpad('B',8)
                 || ' | ' || rpad('collision evidence',36) || ' | ' || rpad('status',30)
                 || ' | ' || rpad('anlz',5) || ' | ' || lpad('heap',9) || ' | ' || 'rule';
  RAISE NOTICE '%', repeat('-', 200);

  FOR r IN
    WITH fk AS (
      -- declared FKs whose REFERENCED attribute is members.id specifically. A FK pointing at
      -- another unique member column (email, username, passkey) is a different relationship.
      SELECT cl.relname::text AS tbl, att.attname::text AS col, TRUE AS declared
        FROM pg_constraint con
        JOIN pg_class cl     ON cl.oid = con.conrelid
        JOIN pg_namespace n  ON n.oid = cl.relnamespace AND n.nspname = 'public'
        JOIN unnest(con.conkey, con.confkey) WITH ORDINALITY AS k(attnum, fattnum, ord) ON TRUE
        JOIN pg_attribute att  ON att.attrelid  = con.conrelid  AND att.attnum  = k.attnum
        JOIN pg_attribute fatt ON fatt.attrelid = con.confrelid AND fatt.attnum = k.fattnum
       WHERE con.contype = 'f'
         AND con.confrelid = 'public.members'::regclass
         AND fatt.attname = 'id'
    ),
    heur AS (
      -- member-shaped columns carrying NO declared FK — the silent ones
      SELECT c.table_name::text, c.column_name::text, FALSE
        FROM information_schema.columns c
        JOIN information_schema.tables t
          ON t.table_schema = c.table_schema AND t.table_name = c.table_name
         AND t.table_type = 'BASE TABLE'
       WHERE c.table_schema = 'public'
         AND c.table_name <> 'members'
         AND c.data_type IN ('uuid','text','character varying')
         AND ( c.column_name ~ '(^|_)(member|user|owner|practitioner|actor|author|subject|recipient|sender|guardian|steward|participant|client|reviewer|uploader|arranger|witness)(_?id)?$'
            OR c.column_name IN ('created_by','updated_by','invited_by','authored_by','resolved_by',
                                 'reviewed_by','redeemed_by','acknowledged_by','saved_by','used_by',
                                 'witnessed_by','safety_reviewed_by','target_id') )
    ),
    cands AS (
      SELECT tbl, col, bool_or(declared) AS declared_fk
        FROM (SELECT * FROM fk UNION ALL SELECT * FROM heur) u(tbl, col, declared)
       GROUP BY tbl, col
    )
    SELECT c.tbl, c.col, c.declared_fk,
           cl.oid                                        AS reloid,
           format_type(a.atttypid, a.atttypmod)          AS coltype,
           ty.typname::text                              AS base_type,
           (ty.typname = 'uuid')                         AS is_uuid,
           (ty.typname IN ('uuid','text','varchar','bpchar')) AS comparable,
           cl.reltuples::bigint                          AS est_rows,
           (cl.reltuples >= 0)                           AS analyzed,
           pg_relation_size(cl.oid)                      AS heap_bytes,
           EXISTS (SELECT 1 FROM pg_index ix
                    WHERE ix.indrelid = cl.oid AND ix.indkey[0] = a.attnum) AS leading_indexed
      FROM cands c
      JOIN pg_class cl    ON cl.relname = c.tbl
                         AND cl.relnamespace = 'public'::regnamespace
                         AND cl.relkind IN ('r','p')
      JOIN pg_attribute a ON a.attrelid = cl.oid AND a.attname = c.col
                         AND a.attnum > 0 AND NOT a.attisdropped
      JOIN pg_type ty     ON ty.oid = a.atttypid
     ORDER BY c.tbl, c.col
  LOOP
    n_total := n_total + 1;
    na := NULL; nb := NULL; coll := NULL; status := 'OK';
    cmptype := CASE WHEN r.is_uuid THEN 'uuid' ELSE 'text' END;

    IF NOT r.comparable THEN
      status := 'UNCOUNTED_TYPE_INCOMPATIBLE';    -- cannot compare a member id to this type
      n_uncnt := n_uncnt + 1;
    ELSIF r.heap_bytes IS NULL THEN
      status := 'UNCOUNTED_UNANALYZED';           -- size could not be established at all
      n_uncnt := n_uncnt + 1;
    ELSIF NOT (r.leading_indexed OR r.heap_bytes <= v_maxbytes) THEN
      -- size is KNOWN (measured, not estimated) and the scan is declined on cost
      status := 'UNCOUNTED_LARGE(' || pg_size_pretty(r.heap_bytes) || ')';
      n_uncnt := n_uncnt + 1;
    ELSE
      -- Each probe gets its own subtransaction: a failure here cannot abort the census.
      BEGIN
        EXECUTE format('SELECT count(*) FROM public.%I WHERE %I = %L::%s',
                       r.tbl, r.col, v_a, cmptype) INTO na;
        EXECUTE format('SELECT count(*) FROM public.%I WHERE %I = %L::%s',
                       r.tbl, r.col, v_b, cmptype) INTO nb;
      EXCEPTION WHEN OTHERS THEN
        na := NULL; nb := NULL;
        status := 'ERROR: ' || left(replace(SQLERRM, E'\n', ' '), 40);
        n_error := n_error + 1;
      END;
    END IF;

    -- collision analysis only where BOTH identities hold rows
    IF na IS NOT NULL AND nb IS NOT NULL AND na > 0 AND nb > 0 THEN
      FOR ur IN
        SELECT i.relname::text                     AS index_name,
               ix.indpred IS NOT NULL              AS partial,
               bool_or(k.attnum = 0)               AS has_expression,
               array_agg(a2.attname::text ORDER BY k.ord)
                 FILTER (WHERE a2.attname IS NOT NULL) AS cols
          FROM pg_index ix
          JOIN pg_class i ON i.oid = ix.indexrelid
          JOIN unnest(ix.indkey) WITH ORDINALITY AS k(attnum, ord) ON TRUE
          LEFT JOIN pg_attribute a2 ON a2.attrelid = ix.indrelid AND a2.attnum = k.attnum
         WHERE ix.indrelid = r.reloid AND ix.indisunique
         GROUP BY 1, 2
        HAVING r.col = ANY(array_agg(a2.attname::text) FILTER (WHERE a2.attname IS NOT NULL))
      LOOP
        IF ur.has_expression THEN
          coll := concat_ws(' ', coll, ur.index_name || '=EXPRESSION_MANUAL');
          CONTINUE;
        END IF;
        -- '1' when the unique key is the member column alone: the INTERSECT then yields a row
        -- iff both identities are present, which is exactly the one-row-per-member collision.
        SELECT coalesce(string_agg(quote_ident(x), ', '), '1')
          INTO othercols
          FROM unnest(ur.cols) AS x
         WHERE x <> r.col;
        BEGIN
          EXECUTE format(
            'SELECT count(*) FROM (SELECT %s FROM public.%I WHERE %I = %L::%s
              INTERSECT SELECT %s FROM public.%I WHERE %I = %L::%s) z',
            othercols, r.tbl, r.col, v_a, cmptype,
            othercols, r.tbl, r.col, v_b, cmptype) INTO overlap;
          IF overlap > 0 THEN
            coll := concat_ws(' ', coll, ur.index_name || '=' || overlap
                                      || CASE WHEN ur.partial THEN '(partial)' ELSE '' END);
          END IF;
        EXCEPTION WHEN OTHERS THEN
          coll := concat_ws(' ', coll, ur.index_name || '=PROBE_ERROR');
        END;
      END LOOP;
    END IF;

    rule := CASE
      WHEN status <> 'OK'                          THEN 'NO_RULE_WITHOUT_COUNT'
      WHEN na = 0 AND nb = 0                       THEN 'NO_OP'
      WHEN r.tbl ~ '(^auth_|_sessions$|^sessions$|_tokens$|^refresh_)'
                                                   THEN 'SESSION_NO_REBIND'
      WHEN r.tbl ~ '(_events?|_ledger|_logs?|_audit|_history|_consents|_runs|_passes|_receipts)$'
                                                   THEN 'PROVENANCE_PRESERVE'
      WHEN nb = 0                                  THEN 'CANONICAL_ONLY'
      WHEN na = 0                                  THEN 'REBIND_CLEAN'
      WHEN coll IS NOT NULL                        THEN 'COLLISION_MANUAL'
      ELSE                                              'REBIND_CHECK'
    END;
    tally := tally || jsonb_build_object(rule, coalesce((tally ->> rule)::int, 0) + 1);

    -- every field is truncated and '|'-separated: a long index name must never bleed into the
    -- next column and make a status unreadable
    RAISE NOTICE '%', rpad(left(r.tbl, 30), 30) || ' | ' || rpad(left(r.col, 24), 24)
                   || ' | ' || rpad(CASE WHEN r.declared_fk THEN 'YES' ELSE 'no' END, 5)
                   || ' | ' || rpad(left(r.coltype, 18), 18)
                   || ' | ' || lpad(coalesce(na::text, '-'), 8)
                   || ' | ' || lpad(coalesce(nb::text, '-'), 8)
                   || ' | ' || rpad(left(coalesce(coll, '-'), 36), 36)
                   || ' | ' || rpad(left(status, 30), 30)
                   || ' | ' || rpad(CASE WHEN r.analyzed THEN 'anlz' ELSE '-' END, 5)
                   || ' | ' || lpad(pg_size_pretty(r.heap_bytes), 9)
                   || ' | ' || rule;
  END LOOP;

  RAISE NOTICE '%', repeat('-', 190);
  RAISE NOTICE 'relations examined: %   UNCOUNTED: %   ERROR: %', n_total, n_uncnt, n_error;
  RAISE NOTICE 'tally by rule:';
  FOR tally_row IN SELECT key, value::int AS n FROM jsonb_each_text(tally) ORDER BY 2 DESC, 1 LOOP
    RAISE NOTICE '    % : %', rpad(tally_row.key, 24), tally_row.n;
  END LOOP;
  RAISE NOTICE 'UNCOUNTED and ERROR are NOT zeros. Re-probe them narrowed before any ruling.';
END
$CENSUS$;
ROLLBACK TO SAVEPOINT p;
RELEASE SAVEPOINT p;

\echo ''
\echo '════════ 3. OPEN QUESTION (NOT part of the census): soul_portraits delete trace ════════'

SAVEPOINT p;
SELECT relname, n_tup_ins, n_tup_upd, n_tup_del, n_live_tup
  FROM pg_stat_user_tables
 WHERE relname IN ('soul_portraits','soul_portrait_consents','member_guardians');
ROLLBACK TO SAVEPOINT p;
RELEASE SAVEPOINT p;

SAVEPOINT p;
-- non-candidate owners by uuid prefix only: a diagnostic must not spill other members' names
SELECT left(owner_member_id::text, 8) || '…' AS owner_prefix,
       (owner_member_id = :'a'::uuid)        AS is_candidate_a,
       (owner_member_id = :'b'::uuid)        AS is_candidate_b,
       count(*)                              AS portraits
  FROM soul_portraits
 GROUP BY 1, 2, 3
 ORDER BY 4 DESC
 LIMIT 20;
ROLLBACK TO SAVEPOINT p;
RELEASE SAVEPOINT p;

SAVEPOINT p;
SELECT count(*) AS consent_rows_for_portraits_that_no_longer_exist
  FROM soul_portrait_consents sc
 WHERE sc.portrait_id IS NOT NULL   -- a NULL reference is not an orphan; NOT EXISTS would say it is
   AND NOT EXISTS (SELECT 1 FROM soul_portraits p WHERE p.id = sc.portrait_id);
ROLLBACK TO SAVEPOINT p;
RELEASE SAVEPOINT p;

SAVEPOINT p;
SELECT sc.portrait_id::text, min(sc.created_at) AS first_event,
       max(sc.created_at) AS last_event, count(*) AS events
  FROM soul_portrait_consents sc
 WHERE sc.portrait_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM soul_portraits p WHERE p.id = sc.portrait_id)
 GROUP BY 1 ORDER BY 2;
ROLLBACK TO SAVEPOINT p;
RELEASE SAVEPOINT p;

ROLLBACK;

\echo ''
\echo 'NO WRITES WERE PERFORMED — the whole run executed inside a READ ONLY transaction,'
\echo 'and ended in ROLLBACK. The deployed image and the application filesystem are untouched.'
\echo 'This census is corroboration and boundary-checking. It authorizes no consolidation,'
\echo 'no portrait movement, no ledger rebinding, and no session cleanup.'
