-- practitioner_comms_* — SCHEMA RECONCILIATION: restore missing UNIQUE constraints
--
-- ┌─ CATEGORY: schema reconciliation migration ───────────────────────────────────┐
-- │ This is NOT a feature migration. Its only purpose is to reconcile the RUNNING   │
-- │ database with the schema this project already declares — nothing more. It adds  │
-- │ no design, changes no data, and is safe to re-run. Same discipline (observe →   │
-- │ confirm → reconcile) as the comms_* spine constraint migrations; this is a       │
-- │ DIFFERENT, non-comms_ pair of tables, kept as a deliberately separate small PR.  │
-- └─────────────────────────────────────────────────────────────────────────────────┘
--
-- WHAT THIS FIXES
-- Restores the two UNIQUE constraints declared by the source migration but absent
-- from the live database:
--
--   1. practitioner_comms_credentials  UNIQUE (practitioner_id, provider)
--        Resolves Postgres 42P10 ("no unique or exclusion constraint matching the
--        ON CONFLICT specification") raised by the upsert at
--        lib/comms/DeliveryService.ts:224 —
--          INSERT INTO practitioner_comms_credentials (...)
--          ON CONFLICT (practitioner_id, provider) DO UPDATE ...
--        ON CONFLICT requires a matching unique constraint; without it every call
--        to storeCredentials() errors.
--   2. practitioner_comms_settings     UNIQUE (practitioner_id)
--        Source declares this column-level ("practitioner_id ... NOT NULL UNIQUE").
--        Restored for parity so a one-settings-row-per-practitioner upsert is sound.
--
-- ROOT CAUSE (identical to the comms_* spine drift): the live tables were created by
-- an earlier definition that carried only the CHECK constraints, so the source file's
-- `CREATE TABLE IF NOT EXISTS` was a no-op against the already-existing tables and the
-- declared UNIQUE (and PK, and FK — see SCOPE below) never landed. The migration was
-- recorded applied, so the runner never re-ran it. Only an explicit ALTER reconciles.
--
-- AUTHORITATIVE SOURCE
--   database/migrations/20260122_comms_delivery_infrastructure.sql
--     line ~40 : UNIQUE(practitioner_id, provider)   on practitioner_comms_credentials
--     line ~55 : practitioner_id ... NOT NULL UNIQUE  on practitioner_comms_settings
--
-- ┌─ SCOPE — UNIQUE ONLY (read before extending) ─────────────────────────────────┐
-- │ Observed on the live DB (2026-06-17): BOTH tables carry ONLY their CHECK         │
-- │ constraints — they are ALSO missing their PRIMARY KEY (id) and FOREIGN KEY       │
-- │ (practitioner_id -> practitioners.id), not just the UNIQUE. This migration       │
-- │ DELIBERATELY restores the UNIQUE constraints ONLY — that is what unblocks the     │
-- │ 42P10 upsert. PK + FK restoration is a SEPARATE crossing (own migration, like    │
-- │ the comms spine split PK into 20260617000002 ahead of UNIQUE+FK), left for an     │
-- │ explicit follow-up. This file adds NO primary key and NO foreign key.            │
-- └─────────────────────────────────────────────────────────────────────────────────┘
--
-- ┌─ FAIL-CLOSED CONTRACT ─────────────────────────────────────────────────────────┐
-- │ This migration performs NO data repair. A UNIQUE constraint cannot be added      │
-- │ while duplicate key rows exist, so §0 first audits for duplicates and, if ANY    │
-- │ are present, HALTS with a clear diagnostic and makes NO changes. (At authoring    │
-- │ both tables were empty — 0 rows — so the add is zero-risk; the pre-check exists   │
-- │ so this migration stays correct and self-protecting if run later against data.)  │
-- └─────────────────────────────────────────────────────────────────────────────────┘
--
-- IDEMPOTENT
-- Each ADD is guarded by COLUMN SET (not by name) against pg_constraint / pg_index,
-- and added UNNAMED so Postgres auto-generates the same constraint names a clean
-- CREATE TABLE would (practitioner_comms_credentials_practitioner_id_provider_key,
-- practitioner_comms_settings_practitioner_id_key) — fresh and reconciled DBs converge.
--
-- APPLY  (via runner: `npm run db:migrate`)  or directly:
--   psql -U soullab maia_consciousness -X -v ON_ERROR_STOP=1 \
--     -c "BEGIN;" -f database/migrations/20260617000004_practitioner_comms_unique_constraints.sql -c "COMMIT;"
-- VERIFY (expect a 'u' row for each table):
--   SELECT conrelid::regclass::text AS tbl, contype, count(*) FROM pg_constraint
--   WHERE conrelid IN ('practitioner_comms_credentials'::regclass,
--                      'practitioner_comms_settings'::regclass)
--   GROUP BY 1,2 ORDER BY 1,2;
-- ═══════════════════════════════════════════════════════════════════════════════


-- ── 0. FAIL-CLOSED PRE-CHECK: refuse to proceed if any duplicate key row exists ──
DO $$
DECLARE
  r RECORD;
  n INT;
  report TEXT := '';
  total INT := 0;
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
      ('practitioner_comms_credentials', ARRAY['practitioner_id','provider']::text[]),
      ('practitioner_comms_settings',    ARRAY['practitioner_id']::text[])
    ) AS t(tbl, cols)
  LOOP
    EXECUTE format(
      'SELECT count(*) FROM (SELECT 1 FROM public.%I GROUP BY %s HAVING count(*) > 1) d',
      r.tbl,
      (SELECT string_agg(quote_ident(c), ', ') FROM unnest(r.cols) AS u(c))
    ) INTO n;
    IF n > 0 THEN
      report := report || format(E'  - %s(%s): %s duplicate key group(s)\n',
        r.tbl, array_to_string(r.cols, ', '), n);
      total := total + n;
    END IF;
  END LOOP;

  IF total > 0 THEN
    RAISE EXCEPTION
      E'practitioner_comms UNIQUE reconciliation HALTED: % duplicate key group(s) present; NO changes made.\n\nBlocking duplicates:\n%\nDeduplicate the DATA first (keep one row per key), then re-run this migration.',
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
      ('practitioner_comms_credentials', ARRAY['practitioner_id','provider']::text[]),
      ('practitioner_comms_settings',    ARRAY['practitioner_id']::text[])
    ) AS t(tbl, cols)
  LOOP
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

-- ═══════════════════════════════════════════════════════════════════════════════
-- COMPLETE: 2 UNIQUE constraints restored (practitioner_comms_credentials,
--           practitioner_comms_settings).
-- OUT OF SCOPE (flagged, NOT done here): both tables are still missing their
--   PRIMARY KEY (id) and FOREIGN KEY (practitioner_id -> practitioners.id) per the
--   same CHECK-only drift. Restore those in a separate follow-up migration.
-- ═══════════════════════════════════════════════════════════════════════════════
