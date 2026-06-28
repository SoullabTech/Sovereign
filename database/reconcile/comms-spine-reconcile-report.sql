-- Comms spine — RECONCILIATION REPORT (observe phase; READ-ONLY)
--
-- Phase 1 of the observe -> approve -> reconcile discipline (see README.md).
-- Makes NO changes of any kind. Detects and CLASSIFIES the divergence between the
-- declared comms_* schema and the running database, so an operator can decide what
-- to do before anything is mutated. Safe to run anytime, against any environment.
--
-- It answers three questions:
--   1. Which declared UNIQUE / FOREIGN KEY constraints are missing?
--   2. For each missing FK, are there orphan rows blocking it — and is the divergence
--      repairable by SET NULL (nullable column) or only by DELETE (NOT NULL column)?
--   3. For each missing UNIQUE, are there duplicate tuples blocking it?
--
-- RUN:
--   psql -U soullab maia_consciousness -X -f database/reconcile/comms-spine-reconcile-report.sql
-- ═══════════════════════════════════════════════════════════════════════════════

\echo ''
\echo '=== current constraints on comms_* (contype: c=check p=pkey u=unique f=fkey) ==='
SELECT contype, count(*) FROM pg_constraint
WHERE conrelid::regclass::text LIKE 'comms_%' GROUP BY contype ORDER BY contype;

\echo ''
\echo '=== FOREIGN KEY divergence + orphan classification ==='
DO $$
DECLARE
  r RECORD;
  present BOOLEAN;
  nullable BOOLEAN;
  orphans INT;
  needs_delete INT := 0;
  needs_setnull INT := 0;
  missing INT := 0;
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
      ('comms_threads','practitioner_id','members'),
      ('comms_threads','client_id','practitioner_clients'),
      ('comms_threads','case_id','practitioner_cases'),
      ('comms_messages','thread_id','comms_threads'),
      ('comms_messages','reply_to_id','comms_messages'),
      ('comms_events','thread_id','comms_threads'),
      ('comms_events','message_id','comms_messages'),
      ('comms_events','identity_id','comms_identities'),
      ('comms_consent','identity_id','comms_identities'),
      ('comms_policies','practitioner_id','members'),
      ('comms_policies','client_id','practitioner_clients'),
      ('comms_policies','emergency_contact_id','comms_identities'),
      ('comms_safety_flags','message_id','comms_messages'),
      ('comms_safety_flags','thread_id','comms_threads'),
      ('comms_safety_flags','acknowledged_by','members'),
      ('comms_safety_flags','escalated_to','members'),
      ('comms_safety_flags','resolved_by','members'),
      ('comms_maia_feedback','message_id','comms_messages'),
      ('comms_maia_feedback','practitioner_id','members'),
      ('comms_reply_suggestions','thread_id','comms_threads'),
      ('comms_reply_suggestions','message_id','comms_messages'),
      ('comms_reply_suggestions','practitioner_id','members'),
      ('comms_reply_suggestion_feedback','suggestion_id','comms_reply_suggestions'),
      ('comms_reply_suggestion_feedback','practitioner_id','members'),
      ('comms_analysis_queue','message_id','comms_messages'),
      ('comms_analysis_queue','thread_id','comms_threads'),
      ('comms_delivery_queue','message_id','comms_messages'),
      ('comms_delivery_queue','practitioner_id','practitioners'),
      ('comms_webhooks_log','delivery_queue_id','comms_delivery_queue'),
      ('comms_webhooks_log','message_id','comms_messages')
    ) AS t(child, col, parent)
  LOOP
    -- skip-if-absent: a table this environment doesn't have is not divergence to report
    IF to_regclass('public.' || r.child) IS NULL OR to_regclass('public.' || r.parent) IS NULL THEN
      RAISE NOTICE 'SKIP (table absent): FK %.% -> %', r.child, r.col, r.parent;
      CONTINUE;
    END IF;
    present := EXISTS (
      SELECT 1 FROM pg_constraint con
      JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = ANY(con.conkey)
      WHERE con.conrelid = r.child::regclass AND con.contype = 'f'
        AND array_length(con.conkey,1) = 1 AND a.attname = r.col);
    IF present THEN CONTINUE; END IF;
    missing := missing + 1;

    SELECT (is_nullable = 'YES') INTO nullable FROM information_schema.columns
      WHERE table_schema='public' AND table_name=r.child AND column_name=r.col;
    EXECUTE format(
      'SELECT count(*) FROM public.%I c WHERE c.%I IS NOT NULL '
      'AND NOT EXISTS (SELECT 1 FROM public.%I p WHERE p.id = c.%I)',
      r.child, r.col, r.parent, r.col) INTO orphans;

    IF orphans = 0 THEN
      RAISE NOTICE 'MISSING FK %.% -> % : 0 orphans (addable as-is)', r.child, r.col, r.parent;
    ELSIF nullable THEN
      needs_setnull := needs_setnull + orphans;
      RAISE NOTICE 'MISSING FK %.% -> % : % orphan(s)  [REPAIR: SET NULL - nullable, non-destructive]', r.child, r.col, r.parent, orphans;
    ELSE
      needs_delete := needs_delete + orphans;
      RAISE NOTICE 'MISSING FK %.% -> % : % orphan(s)  [REPAIR: DELETE - NOT NULL, destructive, needs confirm]', r.child, r.col, r.parent, orphans;
    END IF;
  END LOOP;

  RAISE NOTICE '----------------------------------------------------------------';
  RAISE NOTICE 'FK summary: % missing | % orphan(s) repairable by SET NULL | % orphan(s) require DELETE', missing, needs_setnull, needs_delete;
  IF needs_delete > 0 THEN
    RAISE NOTICE 'VERDICT: manual data reconciliation REQUIRED (destructive). Review the % delete-class row(s) above,', needs_delete;
    RAISE NOTICE '         then run comms-spine-orphan-repair.sql WITH explicit confirmation.';
  ELSIF needs_setnull > 0 THEN
    RAISE NOTICE 'VERDICT: data reconciliation needed (SET NULL only, non-destructive). Run comms-spine-orphan-repair.sql.';
  ELSIF missing > 0 THEN
    RAISE NOTICE 'VERDICT: no orphans; the schema migration can be applied directly.';
  ELSE
    RAISE NOTICE 'VERDICT: all foreign keys already present.';
  END IF;
END $$;

\echo ''
\echo '=== UNIQUE divergence + duplicate-tuple checks ==='
DO $$
DECLARE
  r RECORD;
  present BOOLEAN;
  dups INT;
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
      ('comms_channels',                  ARRAY['type','provider']::text[]),
      ('comms_identities',                ARRAY['owner_type','owner_id','channel_type','address']::text[]),
      ('comms_consent',                   ARRAY['identity_id','domain','channel_type']::text[]),
      ('comms_safety_flags',              ARRAY['message_id']::text[]),
      ('comms_maia_feedback',             ARRAY['message_id','practitioner_id']::text[]),
      ('comms_reply_suggestion_feedback', ARRAY['suggestion_id','practitioner_id']::text[]),
      ('comms_analysis_queue',            ARRAY['message_id']::text[]),
      ('comms_webhooks_log',              ARRAY['provider','external_event_id']::text[])
    ) AS t(tbl, cols)
  LOOP
    -- skip-if-absent: a table this environment doesn't have is not divergence to report
    IF to_regclass('public.' || r.tbl) IS NULL THEN
      RAISE NOTICE 'SKIP (table absent): UNIQUE %', r.tbl;
      CONTINUE;
    END IF;
    present := EXISTS (
      SELECT 1 FROM pg_constraint con
      WHERE con.conrelid = r.tbl::regclass AND con.contype IN ('u','p')
        AND (SELECT array_agg(a.attname::text ORDER BY a.attname::text)
             FROM unnest(con.conkey) k JOIN pg_attribute a ON a.attrelid=con.conrelid AND a.attnum=k)
            = (SELECT array_agg(c ORDER BY c) FROM unnest(r.cols) AS u(c))
    ) OR EXISTS (
      SELECT 1 FROM pg_index i
      WHERE i.indrelid = r.tbl::regclass AND i.indisunique AND NOT i.indisprimary AND i.indpred IS NULL
        AND (SELECT array_agg(a.attname::text ORDER BY a.attname::text)
             FROM unnest(string_to_array(i.indkey::text,' ')::int[]) AS ik(attnum)
             JOIN pg_attribute a ON a.attrelid=i.indrelid AND a.attnum=ik.attnum)
            = (SELECT array_agg(c ORDER BY c) FROM unnest(r.cols) AS u(c)));
    IF present THEN CONTINUE; END IF;

    EXECUTE format(
      'SELECT count(*) FROM (SELECT 1 FROM public.%I GROUP BY %s HAVING count(*) > 1) z',
      r.tbl, (SELECT string_agg(quote_ident(c), ', ') FROM unnest(r.cols) AS u(c))) INTO dups;
    IF dups = 0 THEN
      RAISE NOTICE 'MISSING UNIQUE %(%) : 0 duplicate tuples (addable as-is)', r.tbl, array_to_string(r.cols, ', ');
    ELSE
      RAISE NOTICE 'MISSING UNIQUE %(%) : % duplicate tuple-group(s) [BLOCKS add - manual de-dup required]', r.tbl, array_to_string(r.cols, ', '), dups;
    END IF;
  END LOOP;
END $$;
\echo ''
