-- W4-S1 · SUBJECT PREPARATION — an Ask thread has EXACTLY ONE subject.
--
-- Design: docs/programme/WS-EDITORIAL-WORKSPACE-01_W4-2_SCHEMA_DESIGN_2026-09-14.md §1, §10
-- Authorized: founder, 2026-09-15, W4-SCHEMA-IMPLEMENTATION, from canonical 348b9e54d.
--
-- ── ⭐⭐ WHY THIS IS A SEPARATE FILE FROM S2 ─────────────────────────────────
--
-- Not tidiness. PostgreSQL holds a table lock until the TRANSACTION that took
-- it ends — not until the statement ends. So `ADD CONSTRAINT … NOT VALID` and
-- `VALIDATE CONSTRAINT` in one file buy nothing: the ACCESS EXCLUSIVE taken by
-- the ADD is still held while the validation scan runs.
--
-- ⚠️ An earlier draft of the design claimed otherwise and was corrected by the
-- founder. Split across two FILES, the runner commits between them, the lock is
-- genuinely released, and the scan in S2 takes only SHARE UPDATE EXCLUSIVE.
--
-- ── ⭐ THE SAFE INTERMEDIATE STATE IS THE POINT ─────────────────────────────
--
-- If S2 refuses — an old two-subject row, or anything else — the database rests
-- at: anchor nullable · both CHECKs present and ENFORCED ON NEW ROWS · the
-- violating row still visible, unrepaired and findable · S1 ledgered · S2 not
-- ledgered and retryable once the row is ruled on.
--
-- ⛔ Nothing destroyed, nothing un-ledgered. Strictly better than a half-applied
-- single file, and the reason to split even though S1 alone buys no guarantee.
--
-- ── ⛔ WHAT THIS FILE DOES NOT DO ───────────────────────────────────────────
--
-- ⛔ NO BACKFILL. A historical thread's absent `proposal_chain_id` is the
-- evidence that it predates the editorial object — the same sentence W5-3 wrote
-- about that column. ⛔ No backfill invents a subject.
--
-- ⛔ NO FREEZE CHANGE. W5-3 already added `proposal_chain_id` to
-- `ask_threads_freeze()`, and `anchor` was already frozen — so a thread cannot
-- acquire an anchor later and break the XOR by mutation. Nothing to add.
--
-- ⛔ The constraints land NOT VALID here ON PURPOSE. A NOT VALID constraint is
-- enforced for new rows and silently unenforced as an invariant over existing
-- ones — the shape of a guarantee that reads true and is not. S2 is where it
-- becomes true, and S2's VALIDATE is the authority: if it refuses, that is a
-- FINDING, not an obstacle. A row carrying both subjects means something wrote
-- one, and the migration must stop rather than repair it.
--
-- ⚠️ IDEMPOTENT BY NECESSITY. A runner that fails after this file succeeds but
-- before its ledger write will re-run it. `DROP NOT NULL` already is idempotent;
-- PostgreSQL has no `ADD CONSTRAINT IF NOT EXISTS`, so the guards below supply
-- one. ⛔ The guards check `pg_constraint` by name — they do not check the
-- constraint's DEFINITION, so renaming a constraint is not a safe edit.
--
-- ROLLBACK: see 20260915000002's footer. ⛔ The two footers must be run in
-- reverse order (S2's, then S1's), and S1's `SET NOT NULL` is ALLOWED TO FAIL.

BEGIN;

-- ⭐ An editorial thread has no anchor. Its subject is a proposal chain.
ALTER TABLE ask_threads ALTER COLUMN anchor DROP NOT NULL;

-- ⭐⭐ EXACTLY ONE SUBJECT. Not "at most one" — a thread about nothing is not a
-- thread. `num_nonnulls(...) = 1` says both halves in one expression.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ask_threads_one_subject'
  ) THEN
    ALTER TABLE ask_threads
      ADD CONSTRAINT ask_threads_one_subject
      CHECK (num_nonnulls(anchor, proposal_chain_id) = 1) NOT VALID;
  END IF;
END $$;

-- ⭐ An editorial thread is not ALSO frozen against a reading.
--
-- `reading_identity` exists so a proposal-dependent anchor can be checked
-- against the StructureInterpretation or DevelopmentalReading it points into.
-- An editorial thread has no anchor and points into neither. A thread carrying
-- both would assert it was about a frozen reading it never addressed.
--
-- ⛔ `canonical_at_open` STAYS, and stays its own fact — the BEFORE of this
-- conversation's own before/after assertion. ⛔ It does NOT become
-- `proposal_chains.base_version`: those are two different moments (when the
-- chain opened against the Work; when this conversation opened), and collapsing
-- them would make the thread's baseline a copy of a fact it does not own.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ask_threads_editorial_has_no_reading'
  ) THEN
    ALTER TABLE ask_threads
      ADD CONSTRAINT ask_threads_editorial_has_no_reading
      CHECK (proposal_chain_id IS NULL OR reading_identity IS NULL) NOT VALID;
  END IF;
END $$;

COMMENT ON CONSTRAINT ask_threads_one_subject ON ask_threads IS
  'Exactly one subject: an anchored Ask thread (anchor) or an editorial thread (proposal_chain_id). Never both, never neither.';
COMMENT ON CONSTRAINT ask_threads_editorial_has_no_reading ON ask_threads IS
  'An editorial thread has no anchor, so it points into no reading; carrying reading_identity would assert it was about a frozen reading it never addressed.';

COMMIT;
