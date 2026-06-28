-- Comms spine — restore PRIMARY KEY constraints on the comms_* tables
--
-- WHAT THIS FIXES
-- The unified inbox query in lib/comms/InboxService.ts (getInbox) failed at
-- runtime with Postgres 42803 ("column t.domain must appear in the GROUP BY
-- clause"). Postgres can only let a GROUP BY t.id stand in for the rest of the
-- table's columns when t.id is a PRIMARY KEY — that is what lets it infer the
-- functional dependency. comms_threads had no PRIMARY KEY, so the inbox
-- endpoint 500'd on every call. (The UI had only ever used mock data, so the
-- failure went unnoticed until the read path was wired.)
--
-- ROOT CAUSE (source/database divergence)
-- database/migrations/20260122_comms_spine.sql declares every comms_* table as
-- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` with REFERENCES between them.
-- The live tables carry NONE of those constraints — only CHECK constraints. The
-- tables were created by an earlier (CHECK-only) definition, so by the time the
-- spine file declared the keys, its `CREATE TABLE IF NOT EXISTS` was a no-op
-- against the already-existing tables: editing a `CREATE TABLE IF NOT EXISTS`
-- to add constraints does nothing to a table that already exists. The migration
-- was recorded as applied, so the runner never re-ran it. The only way to add
-- the keys to the existing tables is an explicit ALTER, which is what this does.
--
-- SAFETY
-- Verified before writing: all 14 comms_* tables have a uuid `id` column with a
-- default, zero NULL ids, and zero duplicate ids — so ADD PRIMARY KEY (id)
-- succeeds on every one. ADD PRIMARY KEY also marks the column NOT NULL
-- implicitly. The auto-generated constraint name (<table>_pkey) matches what a
-- clean CREATE TABLE would produce, so environments converge on the same name.
--
-- IDEMPOTENT
-- Guarded per table: on a fresh environment where the spine migration created
-- the tables correctly, the PRIMARY KEY already exists and that table is skipped.
--
-- FOREIGN KEYS (deliberately deferred — documented follow-up, not done here)
-- The same divergence means the live spine also has zero FOREIGN KEY constraints
-- (e.g. comms_messages.thread_id -> comms_threads.id), even though the source
-- declares them. Adding the PRIMARY KEYs here is the prerequisite that makes
-- those FKs addable. They are intentionally NOT added in this migration: each
-- relationship needs an orphan-row check first, and that integrity pass belongs
-- in its own scoped migration rather than riding along with the key restoration.

DO $$
DECLARE
  tbl TEXT;
  comms_tables TEXT[] := ARRAY[
    'comms_analysis_queue',
    'comms_channels',
    'comms_consent',
    'comms_delivery_queue',
    'comms_events',
    'comms_identities',
    'comms_maia_feedback',
    'comms_messages',
    'comms_policies',
    'comms_reply_suggestion_feedback',
    'comms_reply_suggestions',
    'comms_safety_flags',
    'comms_threads',
    'comms_webhooks_log'
  ];
BEGIN
  FOREACH tbl IN ARRAY comms_tables LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = tbl
    ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema = 'public'
        AND table_name = tbl
        AND constraint_type = 'PRIMARY KEY'
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ADD PRIMARY KEY (id)', tbl);
      RAISE NOTICE 'Added PRIMARY KEY (id) to %', tbl;
    ELSE
      RAISE NOTICE 'PRIMARY KEY already present (or table absent) on %, skipping', tbl;
    END IF;
  END LOOP;
END $$;
