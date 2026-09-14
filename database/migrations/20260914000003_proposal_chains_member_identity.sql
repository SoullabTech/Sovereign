-- STEP 2 · SUPPORTING RELATIONAL IDENTITY on a STEP 1 TABLE.
--
-- ⭐⭐ FOUNDER RULING, 2026-09-14, matrix §5.2. This adds ONE unique constraint
-- to `proposal_chains` so that another object can state something the DATABASE
-- can prove:
--
--     the member recorded on an authorization is the member who owns the
--     proposal chain it names.
--
-- ⛔ IT CHANGES NOTHING ABOUT STEP 1. `proposal_chains.id` is already the
-- primary key and therefore globally unique, so `UNIQUE (member_id, id)`:
--
--     admits exactly the same rows        it is implied by the PK
--     invents no lifecycle                nothing may now change that could not
--     changes no chain identity           `id` is still the identity
--
-- ⭐ It is a SUPPORTING constraint, not a second identity. Its only purpose is
-- to be the target of a composite foreign key.
--
-- ── ⛔ WHY NOT LEAVE OWNERSHIP TO APPLICATION CODE ────────────────────────
--
-- Because a caller could otherwise assemble
--
--     Kelly  +  Robert's chain  +  Kelly's authorization
--
-- and rely on application code to notice. With this constraint and the
-- composite FK that uses it, THE DATABASE REFUSES THE SHAPE.
--
-- ⚠️ AND IT IS NOT IMPLIED BY THE VERSION RELATIONSHIP. `authorization →
-- version → chain` proves *this version belongs to this chain*. It does NOT
-- prove *this authorization's member owns this chain*. Two different claims,
-- two separate constraints.
--
-- ROLLBACK:
--   ALTER TABLE proposal_chains DROP CONSTRAINT IF EXISTS proposal_chains_member_id_id_key;

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'proposal_chains_member_id_id_key'
  ) THEN
    ALTER TABLE proposal_chains
      ADD CONSTRAINT proposal_chains_member_id_id_key UNIQUE (member_id, id);
  END IF;
END $$;

COMMIT;
