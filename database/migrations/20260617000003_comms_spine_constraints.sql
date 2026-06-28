-- Comms spine — SCHEMA RECONCILIATION: restore UNIQUE + FOREIGN KEY constraints
--
-- ┌─ CATEGORY: schema reconciliation migration ───────────────────────────────────┐
-- │ This is NOT a feature migration. Its purpose is to reconcile the RUNNING        │
-- │ database with the schema this project already declares — nothing more. It adds  │
-- │ no design, changes no data, and is safe to re-run. See database/reconcile/      │
-- │ README.md for the observe → approve → reconcile discipline this belongs to.     │
-- └─────────────────────────────────────────────────────────────────────────────────┘
--
-- WHAT THIS FIXES
-- Follow-up to 20260617000002_comms_spine_primary_keys.sql (which restored the
-- PRIMARY KEYs — the prerequisite for foreign keys). The same source/database
-- divergence left the live comms_* tables with ZERO foreign keys and ZERO unique
-- constraints, even though the source migrations declare both. This restores them:
--
--   1. UNIQUE constraints  (resolves Postgres 42P10 on two ON CONFLICT upserts:
--        app/api/comms/messages/[messageId]/feedback/route.ts:86  and
--        lib/comms/ReplySuggestionService.ts:425)
--   2. FOREIGN KEY constraints  (referential-integrity hardening)
--
-- ROOT CAUSE (identical to the PK migration): the live tables were created by an
-- earlier CHECK-only definition, so the source files' CREATE TABLE IF NOT EXISTS was
-- a no-op against the already-existing tables. The migrations were recorded applied,
-- so the runner never re-ran them. Only an explicit ALTER adds the constraints.
--
-- AUTHORITATIVE SOURCES
--   20260122_comms_spine.sql .............. channels, identities, threads, messages,
--                                           events, consent, policies, safety_flags
--   20260121_comms_maia_feedback.sql ...... comms_maia_feedback
--   20260121_comms_reply_suggestions.sql .. comms_reply_suggestions (+ _feedback)
--   20260122_comms_analysis_queue.sql ..... comms_analysis_queue
--   20260122_comms_delivery_infrastructure.sql  comms_delivery_queue, comms_webhooks_log
-- (comms_maia_feedback's source declares uniqueness as a unique INDEX; we add it as a
--  UNIQUE CONSTRAINT so it satisfies ON CONFLICT *and* shows as contype 'u'. The
--  guard skips if an equivalent unique constraint OR full unique index already exists.)
--
-- ┌─ FAIL-CLOSED CONTRACT (the governance boundary) ──────────────────────────────┐
-- │ This migration performs NO data repair. A FOREIGN KEY cannot be added while     │
-- │ orphan rows violate it, so if ANY FK-blocking orphan is present this migration  │
-- │ HALTS with a clear diagnostic and makes NO changes — it never deletes or nulls  │
-- │ data. Data reconciliation is a separate, deliberate, operator-run step:         │
-- │     database/reconcile/comms-spine-reconcile-report.sql   (observe, read-only)  │
-- │     database/reconcile/comms-spine-orphan-repair.sql      (repair, gated)        │
-- │ Run those (after review) to clean orphans, then re-run this migration.          │
-- │ NOTE: scripts/apply-migrations.sh runs all migrations in one locked txn with    │
-- │ ON_ERROR_STOP — so on a deploy that still has un-reconciled comms orphans, this  │
-- │ HALT stops the whole migration run by design, rather than mutating data.        │
-- └─────────────────────────────────────────────────────────────────────────────────┘
--
-- IDEMPOTENT
-- Every ADD is guarded by COLUMN SET (not by name) against pg_constraint / pg_index,
-- and constraints are added UNNAMED so Postgres auto-generates the same names (and
-- applies the same >63-byte truncation) a clean CREATE TABLE would — environments
-- converge on identical names.
--
-- APPLY  (via runner: `npm run db:migrate`)  or directly:
--   psql -U soullab maia_consciousness -X -v ON_ERROR_STOP=1 \
--     -c "BEGIN;" -f database/migrations/20260617000003_comms_spine_constraints.sql -c "COMMIT;"
-- VERIFY (expect rows for both 'f' and 'u'):
--   SELECT contype, count(*) FROM pg_constraint
--   WHERE conrelid::regclass::text LIKE 'comms_%' GROUP BY contype;
-- ═══════════════════════════════════════════════════════════════════════════════


-- ── 0. FAIL-CLOSED PRE-CHECK: refuse to proceed if any FK-blocking orphan exists ──
DO $$
DECLARE
  r RECORD;
  n INT;
  report TEXT := '';
  total INT := 0;
BEGIN
  CREATE TEMP TABLE IF NOT EXISTS _comms_spine_fk_specs (
    child text, col text, parent text, ondel text
  );  -- session-temp (NO "ON COMMIT DROP"): the migration runner is autocommit, so the
      -- spec table must survive across this migration's separate DO blocks; auto-drops at session end.
  TRUNCATE _comms_spine_fk_specs;
  INSERT INTO _comms_spine_fk_specs (child, col, parent, ondel) VALUES
    ('comms_threads',                  'practitioner_id',     'members',                 'SET NULL'),
    ('comms_threads',                  'client_id',           'practitioner_clients',    'SET NULL'),
    ('comms_threads',                  'case_id',             'practitioner_cases',      'SET NULL'),
    ('comms_messages',                 'thread_id',           'comms_threads',           'CASCADE'),
    ('comms_messages',                 'reply_to_id',         'comms_messages',          'SET NULL'),
    ('comms_events',                   'thread_id',           'comms_threads',           'SET NULL'),
    ('comms_events',                   'message_id',          'comms_messages',          'SET NULL'),
    ('comms_events',                   'identity_id',         'comms_identities',        'SET NULL'),
    ('comms_consent',                  'identity_id',         'comms_identities',        'CASCADE'),
    ('comms_policies',                 'practitioner_id',     'members',                 'CASCADE'),
    ('comms_policies',                 'client_id',           'practitioner_clients',    'CASCADE'),
    ('comms_policies',                 'emergency_contact_id','comms_identities',        'NO ACTION'),
    ('comms_safety_flags',             'message_id',          'comms_messages',          'CASCADE'),
    ('comms_safety_flags',             'thread_id',           'comms_threads',           'CASCADE'),
    ('comms_safety_flags',             'acknowledged_by',     'members',                 'NO ACTION'),
    ('comms_safety_flags',             'escalated_to',        'members',                 'NO ACTION'),
    ('comms_safety_flags',             'resolved_by',         'members',                 'NO ACTION'),
    ('comms_maia_feedback',            'message_id',          'comms_messages',          'CASCADE'),
    ('comms_maia_feedback',            'practitioner_id',     'members',                 'CASCADE'),
    ('comms_reply_suggestions',        'thread_id',           'comms_threads',           'CASCADE'),
    ('comms_reply_suggestions',        'message_id',          'comms_messages',          'CASCADE'),
    ('comms_reply_suggestions',        'practitioner_id',     'members',                 'CASCADE'),
    ('comms_reply_suggestion_feedback','suggestion_id',       'comms_reply_suggestions', 'CASCADE'),
    ('comms_reply_suggestion_feedback','practitioner_id',     'members',                 'CASCADE'),
    ('comms_analysis_queue',           'message_id',          'comms_messages',          'CASCADE'),
    ('comms_analysis_queue',           'thread_id',           'comms_threads',           'CASCADE'),
    ('comms_delivery_queue',           'message_id',          'comms_messages',          'CASCADE'),
    ('comms_delivery_queue',           'practitioner_id',     'practitioners',           'CASCADE'),
    ('comms_webhooks_log',             'delivery_queue_id',   'comms_delivery_queue',    'SET NULL'),
    ('comms_webhooks_log',             'message_id',          'comms_messages',          'SET NULL');

  FOR r IN SELECT * FROM _comms_spine_fk_specs LOOP
    -- skip-if-absent: a table this environment doesn't have can't have orphans or get an FK
    CONTINUE WHEN to_regclass('public.' || r.child) IS NULL OR to_regclass('public.' || r.parent) IS NULL;
    EXECUTE format(
      'SELECT count(*) FROM public.%I c WHERE c.%I IS NOT NULL '
      'AND NOT EXISTS (SELECT 1 FROM public.%I p WHERE p.id = c.%I)',
      r.child, r.col, r.parent, r.col) INTO n;
    IF n > 0 THEN
      report := report || format(E'  - %s.%s -> %s : %s orphan row(s)\n', r.child, r.col, r.parent, n);
      total := total + n;
    END IF;
  END LOOP;

  IF total > 0 THEN
    RAISE EXCEPTION
      E'comms spine schema reconciliation HALTED: % FK-blocking orphan row(s) present; NO changes made.\n\nBlocking relationships:\n%\nReconcile the DATA first (see database/reconcile/):\n  1. comms-spine-reconcile-report.sql   (observe - read-only)\n  2. comms-spine-orphan-repair.sql      (repair - explicit confirm required for deletes)\nThen re-run this migration.',
      total, report;
  END IF;
END $$;


-- ── 1. UNIQUE constraints (contype 'u') ──────────────────────────────────────────
-- Guarded by column SET: skip if an equivalent unique/pk constraint OR an equivalent
-- full (non-partial) unique index already exists. Added UNNAMED for name convergence.
DO $$
DECLARE
  r RECORD;
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
    IF to_regclass('public.' || r.tbl) IS NULL THEN  -- skip-if-absent (not fatal)
      RAISE NOTICE 'table % absent, skipping UNIQUE', r.tbl;
      CONTINUE;
    END IF;
    IF EXISTS (  -- equivalent unique/primary-key constraint already present?
      SELECT 1 FROM pg_constraint con
      WHERE con.conrelid = r.tbl::regclass AND con.contype IN ('u','p')
        AND (SELECT array_agg(a.attname::text ORDER BY a.attname::text)
             FROM unnest(con.conkey) k JOIN pg_attribute a
               ON a.attrelid = con.conrelid AND a.attnum = k)
            = (SELECT array_agg(c ORDER BY c) FROM unnest(r.cols) AS u(c))
    ) OR EXISTS (  -- equivalent full (non-partial) unique index already present?
      SELECT 1 FROM pg_index i
      WHERE i.indrelid = r.tbl::regclass AND i.indisunique AND NOT i.indisprimary
        AND i.indpred IS NULL
        AND (SELECT array_agg(a.attname::text ORDER BY a.attname::text)
             FROM unnest(string_to_array(i.indkey::text,' ')::int[]) AS ik(attnum)
             JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ik.attnum)
            = (SELECT array_agg(c ORDER BY c) FROM unnest(r.cols) AS u(c))
    ) THEN
      RAISE NOTICE 'UNIQUE on %(%) already present, skipping', r.tbl, array_to_string(r.cols, ', ');
    ELSE
      EXECUTE format('ALTER TABLE public.%I ADD UNIQUE (%s)', r.tbl,
        (SELECT string_agg(quote_ident(c), ', ') FROM unnest(r.cols) AS u(c)));
      RAISE NOTICE 'Added UNIQUE on %(%)', r.tbl, array_to_string(r.cols, ', ');
    END IF;
  END LOOP;
END $$;


-- ── 2. comms_policies partial UNIQUE indexes (source declares these as indexes) ───
-- Partial uniqueness (WHERE ...) cannot be a table UNIQUE constraint, so these stay
-- indexes and will NOT appear in pg_constraint contype 'u'. IF NOT EXISTS = idempotent.
CREATE UNIQUE INDEX IF NOT EXISTS idx_comms_policies_unique_client
  ON comms_policies(practitioner_id, client_id, domain) WHERE client_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_comms_policies_unique_default
  ON comms_policies(practitioner_id, domain) WHERE client_id IS NULL;


-- ── 3. FOREIGN KEY constraints (contype 'f') ─────────────────────────────────────
-- Reuses the spec table from the pre-check. All FKs are single-column; guarded by
-- column. Added UNNAMED for name convergence. Parent column is id.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT * FROM _comms_spine_fk_specs LOOP
    IF to_regclass('public.' || r.child) IS NULL OR to_regclass('public.' || r.parent) IS NULL THEN  -- skip-if-absent (not fatal)
      RAISE NOTICE 'table % or parent % absent, skipping FK %.%', r.child, r.parent, r.child, r.col;
      CONTINUE;
    END IF;
    IF EXISTS (
      SELECT 1 FROM pg_constraint con
      JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = ANY(con.conkey)
      WHERE con.conrelid = r.child::regclass AND con.contype = 'f'
        AND array_length(con.conkey, 1) = 1 AND a.attname = r.col
    ) THEN
      RAISE NOTICE 'FK %.% already present, skipping', r.child, r.col;
    ELSE
      EXECUTE format('ALTER TABLE public.%I ADD FOREIGN KEY (%I) REFERENCES public.%I(id) ON DELETE %s',
                     r.child, r.col, r.parent, r.ondel);
      RAISE NOTICE 'Added FK %.% -> %(id) ON DELETE %', r.child, r.col, r.parent, r.ondel;
    END IF;
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- COMPLETE: 8 UNIQUE constraints + 2 partial UNIQUE indexes + 30 FOREIGN KEYs.
-- OUT OF SCOPE (flagged): practitioner_comms_credentials needs UNIQUE(practitioner_id,
--   provider) for DeliveryService.ts:224 — same 42P10 class, separate non-comms_ table.
-- ═══════════════════════════════════════════════════════════════════════════════
