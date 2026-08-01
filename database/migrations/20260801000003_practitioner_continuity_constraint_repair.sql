-- ================================================
-- PRACTITIONER CONTINUITY v1 — CONSTRAINT REPAIR
-- Migration: 20260801000003_practitioner_continuity_constraint_repair.sql
--
-- Repairs two defects in 20260731000001 found by validating that migration
-- against a production-shaped database before it reached production. Neither
-- defect is a design error — in both cases the migration's stated intent is
-- right and its SQL does not enforce it.
--
-- MUST be applied together with 20260731000001, in the same deploy. The
-- original has never reached production, so there is no window in which the
-- defective constraints are live.
-- ================================================

-- ---------- DEFECT 1: a commitment could be created with NO status ----------
-- 20260731000001 says, correctly: "status is meaningful ONLY for commitments:
-- required there, forbidden elsewhere. Both halves matter — a commitment with
-- no status has no answer to 'is this still alive?', which is the whole
-- question the object exists to hold."
--
-- The constraint enforced only the second half. For kind='commitment' with
-- status NULL:
--     (TRUE  AND NULL IN (...))  ->  TRUE AND NULL  ->  NULL
--  OR (FALSE AND ...)            ->  FALSE
--     NULL OR FALSE              ->  NULL
-- A CHECK constraint rejects only FALSE. NULL passes. So the "required there"
-- half was never enforced and a status-less commitment was accepted — verified
-- empirically, not inferred.
--
-- `status IS NOT NULL` makes that branch FALSE rather than NULL, so the whole
-- expression is FALSE and the row is refused.
ALTER TABLE practitioner_client_notes
  DROP CONSTRAINT IF EXISTS practitioner_client_notes_status_check;

ALTER TABLE practitioner_client_notes
  ADD CONSTRAINT practitioner_client_notes_status_check
  CHECK (
    (kind =  'commitment' AND status IS NOT NULL
                          AND status IN ('alive', 'completed', 'released'))
    OR
    (kind <> 'commitment' AND status IS NULL)
  );

-- ---------- DEFECT 2: a carried-forward note could never be deleted ----------
-- The composite FK (promoted_from, client_id, practitioner_id) correctly forces
-- a promotion source to belong to the same client AND the same practitioner.
-- But ON DELETE SET NULL without a column list nulls EVERY referencing column:
--
--   UPDATE practitioner_client_notes
--      SET promoted_from = NULL, client_id = NULL, practitioner_id = NULL ...
--
-- client_id and practitioner_id are NOT NULL, so the cascade violates them and
-- the DELETE fails outright:
--   ERROR: null value in column "client_id" ... violates not-null constraint
--
-- Consequence: once a practitioner carries anything forward from a session
-- note, that note becomes permanently undeletable, and the refusal surfaces as
-- a raw not-null violation rather than a plain, explainable answer.
--
-- Postgres 15+ accepts a column list on SET NULL, so only the provenance
-- pointer is cleared. Scope enforcement is unchanged: the FK still requires a
-- source in the same client and practitioner scope.
ALTER TABLE practitioner_client_notes
  DROP CONSTRAINT IF EXISTS practitioner_client_notes_promoted_from_fkey;

ALTER TABLE practitioner_client_notes
  ADD CONSTRAINT practitioner_client_notes_promoted_from_fkey
  FOREIGN KEY (promoted_from, client_id, practitioner_id)
  REFERENCES practitioner_client_notes (id, client_id, practitioner_id)
  ON DELETE SET NULL (promoted_from);

COMMENT ON CONSTRAINT practitioner_client_notes_status_check
  ON practitioner_client_notes IS
  'A commitment must carry a status: alive | completed | released. Chosen, never defaulted. Non-commitments must carry none. The IS NOT NULL is load-bearing — without it the commitment branch evaluates to NULL and CHECK passes.';

COMMENT ON CONSTRAINT practitioner_client_notes_promoted_from_fkey
  ON practitioner_client_notes IS
  'Carry Forward provenance, scoped to the same client and practitioner. SET NULL names promoted_from explicitly so deleting a source clears the pointer and leaves the promoted item intact — the item outlives its source, which is the point of carrying it forward.';
