-- practitioner_comms_* — SCHEMA RECONCILIATION: restore missing PRIMARY KEY + FOREIGN KEY
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
-- Restores the PRIMARY KEY and FOREIGN KEY declared by the source migration but absent
-- from the live database (the UNIQUE constraints were restored separately, by
-- 20260617000004_practitioner_comms_unique_constraints.sql — this file completes the
-- reconciliation that migration explicitly flagged as out of scope):
--
--   1. practitioner_comms_credentials  PRIMARY KEY (id)
--                                      FOREIGN KEY (practitioner_id)
--                                        REFERENCES practitioners(id) ON DELETE CASCADE
--   2. practitioner_comms_settings     PRIMARY KEY (id)
--                                      FOREIGN KEY (practitioner_id)
--                                        REFERENCES practitioners(id) ON DELETE CASCADE
--
-- Without the PK, `id` is neither the table's identity nor a valid ON CONFLICT (id)
-- target. Without the FK, a deleted practitioner leaves orphaned credentials/settings
-- rows (the source declares ON DELETE CASCADE so they are cleaned up automatically).
--
-- ROOT CAUSE (identical to the comms_* spine drift and to the sibling UNIQUE migration):
-- the live tables were created by an earlier definition that carried only the CHECK
-- constraints, so the source file's `CREATE TABLE IF NOT EXISTS` was a no-op against the
-- already-existing tables and the declared PK and FK never landed. The migration was
-- recorded applied, so the runner never re-ran it. Only an explicit ALTER reconciles.
--
-- AUTHORITATIVE SOURCE
--   database/migrations/20260122_comms_delivery_infrastructure.sql
--     practitioner_comms_credentials:
--       id UUID PRIMARY KEY DEFAULT gen_random_uuid()
--       practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE
--     practitioner_comms_settings:
--       id UUID PRIMARY KEY DEFAULT gen_random_uuid()
--       practitioner_id UUID NOT NULL UNIQUE REFERENCES practitioners(id) ON DELETE CASCADE
--
-- ┌─ SCOPE — PK + FK ONLY, two practitioner_comms_* tables (read before extending) ─┐
-- │ This migration restores ONLY the PRIMARY KEY (id) and the FOREIGN KEY            │
-- │ (practitioner_id -> practitioners.id ON DELETE CASCADE) on the two               │
-- │ practitioner_comms_* tables. The UNIQUE constraints were already restored by     │
-- │ 20260617000004. The comms_* tables in the same source file                       │
-- │ (comms_delivery_queue, comms_webhooks_log) are NOT touched here — they belong to │
-- │ the SEPARATE comms-spine reconciliation program. This file adds NO unique         │
-- │ constraint and touches NO comms_* table.                                          │
-- └─────────────────────────────────────────────────────────────────────────────────┘
--
-- ┌─ FAIL-CLOSED CONTRACT ─────────────────────────────────────────────────────────┐
-- │ This migration performs NO data repair. A PRIMARY KEY cannot be added over NULL  │
-- │ or duplicate id values, and a FOREIGN KEY cannot be added while orphan           │
-- │ practitioner_id values (no matching practitioners.id) exist. §0 audits BOTH       │
-- │ preconditions FIRST and, if ANY violation is present, HALTS with a clear          │
-- │ diagnostic and makes NO changes — neither the PK nor the FK is added. (At          │
-- │ authoring both tables were empty — 0 rows — so the adds are zero-risk; the         │
-- │ pre-check exists so this migration stays correct and self-protecting if run later  │
-- │ against data.)                                                                     │
-- └─────────────────────────────────────────────────────────────────────────────────┘
--
-- IDEMPOTENT
-- Each ADD is guarded against pg_constraint (PK by contype 'p'; FK by column set +
-- referenced table) and added UNNAMED so Postgres auto-generates the same constraint
-- names a clean CREATE TABLE would — practitioner_comms_credentials_pkey,
-- practitioner_comms_settings_pkey, and *_practitioner_id_fkey — so fresh and
-- reconciled DBs converge. The PK is added before the FK.
--
-- APPLY  (via runner: `npm run db:migrate`)  or directly:
--   psql -U soullab maia_consciousness -X -v ON_ERROR_STOP=1 \
--     -c "BEGIN;" -f database/migrations/20260617000005_practitioner_comms_pk_fk.sql -c "COMMIT;"
-- VERIFY (expect a 'p' row AND an 'f' row for each table):
--   SELECT conrelid::regclass::text AS tbl, contype, count(*) FROM pg_constraint
--   WHERE conrelid IN ('practitioner_comms_credentials'::regclass,
--                      'practitioner_comms_settings'::regclass)
--   GROUP BY 1,2 ORDER BY 1,2;
-- ═══════════════════════════════════════════════════════════════════════════════


-- ── 0. FAIL-CLOSED PRE-CHECK: refuse to proceed if any PK or FK precondition fails ──
-- PK precondition: no NULL id and no duplicate id (per table).
-- FK precondition: no orphan practitioner_id — every non-null value matches a
-- practitioners.id (per table). On ANY violation, RAISE and make NO changes.
DO $$
DECLARE
  r RECORD;
  n INT;
  report TEXT := '';
  total INT := 0;
BEGIN
  FOR r IN
    SELECT unnest(ARRAY['practitioner_comms_credentials',
                        'practitioner_comms_settings']) AS tbl
  LOOP
    -- PK precondition (a): NULL id values block ADD PRIMARY KEY
    EXECUTE format('SELECT count(*) FROM public.%I WHERE id IS NULL', r.tbl) INTO n;
    IF n > 0 THEN
      report := report || format(E'  - %s: %s row(s) with NULL id (blocks PRIMARY KEY)\n', r.tbl, n);
      total := total + n;
    END IF;

    -- PK precondition (b): duplicate id values block ADD PRIMARY KEY
    EXECUTE format(
      'SELECT count(*) FROM (SELECT 1 FROM public.%I GROUP BY id HAVING count(*) > 1) d',
      r.tbl
    ) INTO n;
    IF n > 0 THEN
      report := report || format(E'  - %s: %s duplicate id group(s) (blocks PRIMARY KEY)\n', r.tbl, n);
      total := total + n;
    END IF;

    -- FK precondition: orphan practitioner_id values block ADD FOREIGN KEY
    EXECUTE format(
      'SELECT count(*) FROM public.%I t WHERE t.practitioner_id IS NOT NULL'
      || ' AND NOT EXISTS (SELECT 1 FROM public.practitioners p WHERE p.id = t.practitioner_id)',
      r.tbl
    ) INTO n;
    IF n > 0 THEN
      report := report || format(E'  - %s: %s orphan practitioner_id value(s) with no practitioners.id (blocks FOREIGN KEY)\n', r.tbl, n);
      total := total + n;
    END IF;
  END LOOP;

  IF total > 0 THEN
    RAISE EXCEPTION
      E'practitioner_comms PK/FK reconciliation HALTED: % blocking condition(s) present; NO changes made.\n\nBlocking:\n%\nRepair the DATA first (assign unique non-null ids; remove or repoint orphan practitioner_id rows), then re-run this migration.',
      total, report;
  END IF;
END $$;


-- ── 1. PRIMARY KEY (contype 'p') — added BEFORE the foreign key ───────────────────
-- Guarded by contype: a table has at most one primary key, so skip if one already
-- exists. Added UNNAMED so the name converges with a clean CREATE TABLE
-- (practitioner_comms_credentials_pkey, practitioner_comms_settings_pkey).
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT unnest(ARRAY['practitioner_comms_credentials',
                        'practitioner_comms_settings']) AS tbl
  LOOP
    IF EXISTS (
      SELECT 1 FROM pg_constraint con
      WHERE con.conrelid = r.tbl::regclass AND con.contype = 'p'
    ) THEN
      RAISE NOTICE 'PRIMARY KEY on % already present, skipping', r.tbl;
    ELSE
      EXECUTE format('ALTER TABLE public.%I ADD PRIMARY KEY (id)', r.tbl);
      RAISE NOTICE 'Added PRIMARY KEY (id) on %', r.tbl;
    END IF;
  END LOOP;
END $$;


-- ── 2. FOREIGN KEY (contype 'f') -> practitioners(id) ON DELETE CASCADE ───────────
-- Guarded by column SET + referenced table: skip if an equivalent FK on
-- (practitioner_id) referencing practitioners already exists. Added UNNAMED so the
-- name converges with a clean CREATE TABLE (*_practitioner_id_fkey).
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT unnest(ARRAY['practitioner_comms_credentials',
                        'practitioner_comms_settings']) AS tbl
  LOOP
    IF EXISTS (
      SELECT 1 FROM pg_constraint con
      WHERE con.conrelid = r.tbl::regclass AND con.contype = 'f'
        AND con.confrelid = 'public.practitioners'::regclass
        AND (SELECT array_agg(a.attname::text ORDER BY a.attname::text)
             FROM unnest(con.conkey) k JOIN pg_attribute a
               ON a.attrelid = con.conrelid AND a.attnum = k)
            = ARRAY['practitioner_id']
    ) THEN
      RAISE NOTICE 'FOREIGN KEY %(practitioner_id) -> practitioners(id) already present, skipping', r.tbl;
    ELSE
      EXECUTE format(
        'ALTER TABLE public.%I ADD FOREIGN KEY (practitioner_id)'
        || ' REFERENCES public.practitioners(id) ON DELETE CASCADE',
        r.tbl
      );
      RAISE NOTICE 'Added FOREIGN KEY %(practitioner_id) -> practitioners(id) ON DELETE CASCADE', r.tbl;
    END IF;
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- COMPLETE: PRIMARY KEY (id) + FOREIGN KEY (practitioner_id -> practitioners.id
--           ON DELETE CASCADE) restored on practitioner_comms_credentials and
--           practitioner_comms_settings. Together with 20260617000004 (UNIQUE), the
--           two practitioner_comms_* tables now match their declared schema in full.
-- ═══════════════════════════════════════════════════════════════════════════════
