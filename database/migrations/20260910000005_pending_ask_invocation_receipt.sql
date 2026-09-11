-- RC-GEN-01 · 3C — invocation identity and the outcome receipt.
--
-- CONSTITUTIONAL POSITION:
--
--   - IDENTITY IS BOUND AT CLAIM. OUTCOME IS BOUND AT COMPLETION. `actId` alone
--     could not tell a transport retry from a materially different member
--     invocation carrying the same id, so the second invocation silently
--     disappeared. `request_digest` is part of the IDENTITY claim and is stored
--     when the act is first consumed, so a second presentation is classifiable
--     even while the original is still in flight.
--
--   - ⛔ THIS IS NOT A SECOND RESULT STORE. `outcome_kind` says WHICH
--     authoritative outcome occurred; `produced_in_turn_index` says where to
--     recover it. NO PROPOSED TEXT, no target, no reason. 3B established where
--     canonical wording lives, and a receipt that repeated it would create a
--     second answer to "what did MAIA propose".
--
--   - ⭐ `outcome_kind` GIVES no_change A POSITIVE ONTOLOGY. Absence of a
--     proposal row collapses at least three states — lawful restraint, a failed
--     act, and damaged history — so restraint is recorded rather than inferred.
--
--   - TARGET IDENTITY IS DELIBERATELY ABSENT. Each act appends its own MAIA
--     turn, so (thread_id, produced_in_turn_index) already identifies the act
--     1:1 and locates its proposals. Carrying the target here would be
--     redundant denormalization with two things to keep true.
--
--   - HALF A RECEIPT IS NOT REPRESENTABLE. The CHECKs below make completion and
--     its evidence inseparable in both directions.
--
-- Additive. No existing row is read, moved or rewritten; every column is
-- nullable so rows written before this migration remain lawful.
--
-- Authority: docs/programme/REVISION-COLLABORATION-01_FOUNDER_RULINGS_2026-09-10.md

BEGIN;

ALTER TABLE pending_ask_claims
  ADD COLUMN IF NOT EXISTS request_digest text,
  ADD COLUMN IF NOT EXISTS outcome_kind text,
  ADD COLUMN IF NOT EXISTS produced_in_turn_index integer;

DO $$
BEGIN
  -- A digest belongs to a consumption. It cannot precede one.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pending_ask_claims_digest_requires_consumption') THEN
    ALTER TABLE pending_ask_claims ADD CONSTRAINT pending_ask_claims_digest_requires_consumption
      CHECK (request_digest IS NULL OR consumed_at IS NOT NULL);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pending_ask_claims_digest_shape') THEN
    ALTER TABLE pending_ask_claims ADD CONSTRAINT pending_ask_claims_digest_shape
      CHECK (request_digest IS NULL OR length(btrim(request_digest)) BETWEEN 8 AND 200);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pending_ask_claims_outcome_kind_vocabulary') THEN
    ALTER TABLE pending_ask_claims ADD CONSTRAINT pending_ask_claims_outcome_kind_vocabulary
      CHECK (outcome_kind IS NULL OR outcome_kind IN ('proposals', 'no_change'));
  END IF;

  -- ⭐ Half a receipt is not representable, in BOTH directions.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pending_ask_claims_receipt_complete') THEN
    ALTER TABLE pending_ask_claims ADD CONSTRAINT pending_ask_claims_receipt_complete
      CHECK ((completed_at IS NOT NULL)
             = (outcome_kind IS NOT NULL AND produced_in_turn_index IS NOT NULL));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pending_ask_claims_receipt_halves_agree') THEN
    ALTER TABLE pending_ask_claims ADD CONSTRAINT pending_ask_claims_receipt_halves_agree
      CHECK ((outcome_kind IS NULL) = (produced_in_turn_index IS NULL));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pending_ask_claims_turn_index_nonnegative') THEN
    ALTER TABLE pending_ask_claims ADD CONSTRAINT pending_ask_claims_turn_index_nonnegative
      CHECK (produced_in_turn_index IS NULL OR produced_in_turn_index >= 0);
  END IF;
END $$;

-- ⭐ The digest is identity, so it is as immutable as the act it identifies.
-- Rebinding one would let a later request claim an earlier act's standing.
CREATE OR REPLACE FUNCTION pending_ask_claims_digest_immutable()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.request_digest IS NOT NULL AND NEW.request_digest IS DISTINCT FROM OLD.request_digest THEN
    RAISE EXCEPTION
      'pending ask % already bound request digest %: an invocation''s substantive identity cannot be rebound',
      OLD.ref, OLD.request_digest;
  END IF;
  IF OLD.outcome_kind IS NOT NULL AND NEW.outcome_kind IS DISTINCT FROM OLD.outcome_kind THEN
    RAISE EXCEPTION
      'pending ask % already recorded outcome %: a completed act cannot change what it was',
      OLD.ref, OLD.outcome_kind;
  END IF;
  IF OLD.produced_in_turn_index IS NOT NULL
     AND NEW.produced_in_turn_index IS DISTINCT FROM OLD.produced_in_turn_index THEN
    RAISE EXCEPTION
      'pending ask % already located its producer turn: a completed act cannot be relocated', OLD.ref;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pending_ask_claims_receipt_immutable ON pending_ask_claims;
CREATE TRIGGER pending_ask_claims_receipt_immutable
  BEFORE UPDATE ON pending_ask_claims
  FOR EACH ROW EXECUTE FUNCTION pending_ask_claims_digest_immutable();

COMMENT ON COLUMN pending_ask_claims.request_digest IS
  'RC-GEN-01 3C-1. The canonical SEMANTIC invocation digest, bound when the act is consumed. Same actId + same digest = replay; same actId + different digest = HARD CONFLICT.';
COMMENT ON COLUMN pending_ask_claims.outcome_kind IS
  'RC-GEN-01 3C-2. Which authoritative outcome occurred. Gives no_change a positive ontology; absence of a proposal row is NOT evidence of restraint.';
COMMENT ON COLUMN pending_ask_claims.produced_in_turn_index IS
  'RC-GEN-01 3C-2. Where to recover the act. NOT a copy of the result - the proposal row remains the answer authority.';

COMMIT;

-- ROLLBACK (manual):
--   DROP TRIGGER IF EXISTS pending_ask_claims_receipt_immutable ON pending_ask_claims;
--   DROP FUNCTION IF EXISTS pending_ask_claims_digest_immutable();
--   ALTER TABLE pending_ask_claims
--     DROP CONSTRAINT IF EXISTS pending_ask_claims_digest_requires_consumption,
--     DROP CONSTRAINT IF EXISTS pending_ask_claims_digest_shape,
--     DROP CONSTRAINT IF EXISTS pending_ask_claims_outcome_kind_vocabulary,
--     DROP CONSTRAINT IF EXISTS pending_ask_claims_receipt_complete,
--     DROP CONSTRAINT IF EXISTS pending_ask_claims_receipt_halves_agree,
--     DROP CONSTRAINT IF EXISTS pending_ask_claims_turn_index_nonnegative,
--     DROP COLUMN IF EXISTS request_digest,
--     DROP COLUMN IF EXISTS outcome_kind,
--     DROP COLUMN IF EXISTS produced_in_turn_index;
