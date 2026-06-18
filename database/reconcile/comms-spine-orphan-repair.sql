-- Comms spine — ORPHAN DATA REPAIR (reconcile phase; MUTATES DATA; gated + reversible)
--
-- Phase 2 of the observe -> approve -> reconcile discipline (see README.md).
-- This is DATA reconciliation, not schema reconciliation. It is deliberately NOT in
-- database/migrations/ so the migration runner can never apply it automatically.
-- Run it by hand, only after reviewing comms-spine-reconcile-report.sql.
--
-- WHAT IT DOES (two classes, treated differently — this is the governance line):
--   * SET NULL  (nullable, ON DELETE SET NULL columns): runs FREELY. A dangling
--     pointer is equivalent to the parent having been deleted; nulling it is the
--     declared behavior and is NON-DESTRUCTIVE (the row is preserved).
--   * DELETE    (NOT NULL columns whose pointer cannot be nulled): FAIL-CLOSED.
--     Performed ONLY when the operator passes explicit confirmation. Mirrors the
--     declared ON DELETE CASCADE: a row whose required parent does not exist would
--     be cascade-deleted with that parent. A fixed-point loop also removes rows
--     orphaned as a consequence of earlier deletes.
--
-- EVERY change is recorded in spine_fk_repair_audit BEFORE it happens (old value for
-- SET NULL; full row as JSONB for DELETE), so the repair is auditable and reversible.
--
-- CONFIRMATION GATE: deletes require  maia.confirm_orphan_delete = 'yes'.
-- Without it, if any delete-class orphan exists the script RAISEs and makes NO
-- changes (atomic rollback). SET-NULL-only repairs need no confirmation.
--
-- RUN — observe-only / SET NULL only (no deletes will occur; halts if deletes pend):
--   psql -U soullab maia_consciousness -X -v ON_ERROR_STOP=1 \
--     -c "BEGIN;" -f database/reconcile/comms-spine-orphan-repair.sql -c "COMMIT;"
--
-- RUN — with explicit approval to delete unattributable orphan rows:
--   psql -U soullab maia_consciousness -X -v ON_ERROR_STOP=1 \
--     -c "SET maia.confirm_orphan_delete = 'yes';" \
--     -c "BEGIN;" -f database/reconcile/comms-spine-orphan-repair.sql -c "COMMIT;"
--
-- INSPECT / REVERSE later:  SELECT * FROM spine_fk_repair_audit ORDER BY noted_at;
-- ═══════════════════════════════════════════════════════════════════════════════

-- Reversible audit/backup table (shared across reconciliation runs; keyed by migration).
CREATE TABLE IF NOT EXISTS spine_fk_repair_audit (
  id          BIGSERIAL PRIMARY KEY,
  migration   TEXT NOT NULL DEFAULT 'comms-spine-orphan-repair',
  table_name  TEXT NOT NULL,
  action      TEXT NOT NULL CHECK (action IN ('set_null', 'deleted_row')),
  row_id      UUID,
  column_name TEXT,
  old_value   TEXT,
  row_json    JSONB,
  noted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
DECLARE
  r RECORD;
  n INT;
  pass_deleted INT;
  total_deleted INT := 0;
  total_nulled INT := 0;
  delete_pending INT := 0;
  report TEXT := '';
  -- COALESCE is load-bearing: when the GUC is unset, current_setting(...) is NULL, and
  -- (NULL = 'yes') is NULL, not false. Without COALESCE the gate would FAIL OPEN
  -- (NOT NULL -> NULL -> the IF never fires -> deletes without confirmation).
  confirmed BOOLEAN := COALESCE(current_setting('maia.confirm_orphan_delete', true) = 'yes', false);
BEGIN
  -- Spec table with resolved nullability (drives both classes).
  CREATE TEMP TABLE IF NOT EXISTS _repair_specs (
    child text, col text, parent text, nullable boolean
  ) ON COMMIT DROP;
  TRUNCATE _repair_specs;
  INSERT INTO _repair_specs (child, col, parent) VALUES
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
    ('comms_webhooks_log','message_id','comms_messages');
  UPDATE _repair_specs s SET nullable = (
    SELECT (is_nullable = 'YES') FROM information_schema.columns c
    WHERE c.table_schema='public' AND c.table_name=s.child AND c.column_name=s.col);

  -- GATE: detect delete-class orphans (NOT NULL columns) before mutating anything.
  FOR r IN SELECT * FROM _repair_specs WHERE nullable IS FALSE LOOP
    EXECUTE format(
      'SELECT count(*) FROM public.%I c WHERE c.%I IS NOT NULL '
      'AND NOT EXISTS (SELECT 1 FROM public.%I p WHERE p.id=c.%I)',
      r.child, r.col, r.parent, r.col) INTO n;
    IF n > 0 THEN
      delete_pending := delete_pending + n;
      report := report || format(E'  - %s.%s -> %s : %s orphan row(s) would be DELETED\n', r.child, r.col, r.parent, n);
    END IF;
  END LOOP;

  IF delete_pending > 0 AND NOT confirmed THEN
    RAISE EXCEPTION
      E'orphan repair HALTED: % delete-class orphan row(s) require DESTRUCTIVE removal; NO changes made.\n\n%\nReview comms-spine-reconcile-report.sql, then re-run with explicit approval:\n  psql ... -c "SET maia.confirm_orphan_delete = ''yes'';" -c "BEGIN;" -f <this file> -c "COMMIT;"',
      delete_pending, report;
  END IF;

  -- DELETE pass (only reached when confirmed or nothing to delete). Fixed point:
  -- removing a row can orphan another delete-class row; repeat until a pass clears none.
  LOOP
    pass_deleted := 0;
    FOR r IN SELECT * FROM _repair_specs WHERE nullable IS FALSE LOOP
      EXECUTE format(
        'INSERT INTO spine_fk_repair_audit(migration, table_name, action, row_id, row_json) '
        'SELECT ''comms-spine-orphan-repair'', %L, ''deleted_row'', c.id, to_jsonb(c) '
        'FROM public.%I c WHERE c.%I IS NOT NULL '
        'AND NOT EXISTS (SELECT 1 FROM public.%I p WHERE p.id=c.%I)',
        r.child, r.child, r.col, r.parent, r.col);
      EXECUTE format(
        'DELETE FROM public.%I c WHERE c.%I IS NOT NULL '
        'AND NOT EXISTS (SELECT 1 FROM public.%I p WHERE p.id=c.%I)',
        r.child, r.col, r.parent, r.col);
      GET DIAGNOSTICS n = ROW_COUNT;
      pass_deleted := pass_deleted + n;
    END LOOP;
    total_deleted := total_deleted + pass_deleted;
    EXIT WHEN pass_deleted = 0;
  END LOOP;

  -- SET NULL pass (after deletes, so it also clears any delete-induced dangling pointers).
  FOR r IN SELECT * FROM _repair_specs WHERE nullable IS TRUE LOOP
    EXECUTE format(
      'INSERT INTO spine_fk_repair_audit(migration, table_name, action, row_id, column_name, old_value) '
      'SELECT ''comms-spine-orphan-repair'', %L, ''set_null'', c.id, %L, c.%I::text '
      'FROM public.%I c WHERE c.%I IS NOT NULL '
      'AND NOT EXISTS (SELECT 1 FROM public.%I p WHERE p.id=c.%I)',
      r.child, r.col, r.col, r.child, r.col, r.parent, r.col);
    EXECUTE format(
      'UPDATE public.%I c SET %I = NULL WHERE c.%I IS NOT NULL '
      'AND NOT EXISTS (SELECT 1 FROM public.%I p WHERE p.id=c.%I)',
      r.child, r.col, r.col, r.parent, r.col);
    GET DIAGNOSTICS n = ROW_COUNT;
    total_nulled := total_nulled + n;
  END LOOP;

  RAISE NOTICE 'orphan repair complete: % row(s) deleted, % pointer(s) set NULL (all recorded in spine_fk_repair_audit)', total_deleted, total_nulled;
END $$;
