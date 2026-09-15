-- W4-S1 · THREAD SUBJECT — PREPARATION PHASE.
--
-- ⭐⭐ THE BAR (carrier §0): a binding must not merely preserve a claimed
-- relationship; the database must make the WRONG TURN, WRONG CHAIN, WRONG ACT
-- and WRONG AUTHOR UNREPRESENTABLE. This file does none of that yet. It makes
-- the subject column nullable and installs both CHECKs UNVALIDATED, and stops.
--
-- Governed by docs/programme/WS-EDITORIAL-WORKSPACE-01_W4-2_SCHEMA_DESIGN_2026-09-14.md
--   reconciled carrier  b52807fa   (design §8–§51 · custody §52 · reconciliation §53)
--   lawful shape        §10 — two migration files, two ledger acts
--
-- ⭐⭐ WHY THIS IS ITS OWN FILE, AND NOT ITS OWN TRANSACTION IN A LARGER ONE.
-- PostgreSQL holds a table lock until the transaction that took it ENDS, so
-- "two statements" buys nothing — only two TRANSACTIONS do (§8). And a single
-- file carrying two transactions has a decisive failure mode: `schema_migrations`
-- records a FILENAME, once, after the whole file succeeds. If phase 2 refused,
-- phase 1 would already be committed and NOTHING would be ledgered — a live
-- table altered with no record that it was, and a retry re-running phase 1
-- against its own result (§10). Two files, two ledger rows.
--
-- ⭐ THE SAFE INTERMEDIATE STATE IS THE POINT. If W4-S2 refuses, the database
-- rests at: anchor nullable · both CHECKs present and ENFORCED ON NEW ROWS ·
-- any violating row still visible, unrepaired, findable · runtime still creates
-- no editorial threads · S1 ledgered · S2 not ledgered, retryable once the row
-- is ruled on. ⛔ Nothing destroyed, nothing un-ledgered.

BEGIN;

-- Already idempotent: DROP NOT NULL on a nullable column is a no-op.
-- ⛔ NO BACKFILL. A historical thread's absent proposal_chain_id is the evidence
-- that it predates the editorial object.
ALTER TABLE ask_threads ALTER COLUMN anchor DROP NOT NULL;

-- ⚠️ IDEMPOTENCE IS REQUIRED HERE AND POSTGRESQL GIVES NO `IF NOT EXISTS` FOR
-- `ADD CONSTRAINT` (§10). A runner that fails AFTER this file succeeds but
-- BEFORE its ledger write would re-run it, and an unguarded ADD would then
-- abort the retry on a constraint that is already correct.
DO $w4s1$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ask_threads_one_subject'
      AND conrelid = 'ask_threads'::regclass
  ) THEN
    -- The XOR. An anchored Ask thread carries an anchor; an editorial thread
    -- carries a chain; neither carries both, and nothing carries neither.
    ALTER TABLE ask_threads
      ADD CONSTRAINT ask_threads_one_subject
      CHECK (num_nonnulls(anchor, proposal_chain_id) = 1) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ask_threads_editorial_has_no_reading'
      AND conrelid = 'ask_threads'::regclass
  ) THEN
    -- ⭐ An editorial thread is not ALSO frozen against a reading.
    -- `reading_identity` exists so a proposal-dependent anchor can be checked
    -- against the reading it points into; an editorial thread has no anchor and
    -- points into neither. A thread carrying both would assert it was about a
    -- frozen reading it never addressed.
    ALTER TABLE ask_threads
      ADD CONSTRAINT ask_threads_editorial_has_no_reading
      CHECK (proposal_chain_id IS NULL OR reading_identity IS NULL) NOT VALID;
  END IF;
END
$w4s1$;

-- ⛔ NO `VALIDATE` IN THIS FILE. That is W4-S2's first act, and it is the
-- boundary this split exists to create: the lock taken above is released at
-- THIS COMMIT, before any table scan begins.
--
-- ⭐ canonical_at_open is UNTOUCHED and stays its own fact — the BEFORE of the
-- conversation's own before/after assertion. ⛔ It does not become
-- proposal_chains.base_version.
--
-- ⭐ The freeze needs NO change: W5-3 already added proposal_chain_id to
-- ask_threads_freeze(), and anchor was already frozen — so a thread cannot
-- acquire an anchor later and break the XOR by mutation.

COMMIT;

-- ══════════════════════════════════════════════════════════════════════════
-- ROLLBACK — W4-S1
--
-- ⛔⛔ ORDER: this footer runs only AFTER W4-S2's, never before. Rolling back
-- S1 while S2's objects stand would drop the CHECKs that S2's binding assumes,
-- and `editorial_turn_bindings` would still reference `ask_threads (id,
-- proposal_chain_id)` — a UNIQUE constraint S2's footer removes, not this one.
--
-- ⭐⭐ `SET NOT NULL` FAILS IF ANY EDITORIAL THREAD EXISTS, and it must be
-- allowed to. Rollback is clean while this refinement has been applied and NOT
-- YET USED. Once a writer has held one editorial conversation, rolling back is
-- no longer a schema operation — it is a decision about their record.
--
-- ⛔ THE ROLLBACK MUST NOT DELETE EDITORIAL THREADS TO MAKE ITSELF SUCCEED. If
-- SET NOT NULL fails, the correct outcome is that the rollback STOPS and the
-- founder rules on those rows — the 2026-09-07 "reconcile forward" reasoning.
--
-- ⛔ And W5-3's own rollback footer restores the PRE-W5 ask_threads_freeze().
-- Running this one alone leaves the W5-3 freeze in place, which is correct —
-- ⛔ but the footers must not be run out of order: W4-S2, then W4-S1, then W5-3.
--
-- BEGIN;
--   ALTER TABLE ask_threads
--     DROP CONSTRAINT IF EXISTS ask_threads_editorial_has_no_reading;
--   ALTER TABLE ask_threads
--     DROP CONSTRAINT IF EXISTS ask_threads_one_subject;
--
--   -- ⭐⭐ THE ONE STEP THAT CAN FAIL, AND IT MUST BE ALLOWED TO.
--   ALTER TABLE ask_threads ALTER COLUMN anchor SET NOT NULL;
-- COMMIT;
