-- ============================================================================
-- ROLLBACK for 20260718000001_s5_provenance_substrate.sql
--
-- The substrate is additive (new tables + columns) and inert without its
-- writers — EXCEPT the strict mint-gate triggers, which refuse INSERTs from
-- pre-S5 code. If the code commit is reverted, run this to drop the gates so
-- pre-S5 writers work again. The governance tables, columns, and the
-- RESTORE-REFUSAL trigger (s5_refuse_tombstoned) are deliberately NOT dropped:
-- R20's deletion guarantees must survive a code rollback (deletion is not
-- complete if a rollback can silently resurrect it).
-- ============================================================================

BEGIN;

DROP TRIGGER IF EXISTS s5_require_minted_provenance_trigger ON conversation_turns;
DROP TRIGGER IF EXISTS s5_require_atom_attestation_trigger ON member_memory_atoms;
DROP TRIGGER IF EXISTS s5_refuse_unknown_collective_trigger ON member_memory_atoms;

COMMIT;

DO $$
BEGIN
  RAISE NOTICE 'S5 mint gates dropped (rollback). Tombstone/scope restore-refusal triggers and governance tables INTENTIONALLY retained (R20).';
END $$;
