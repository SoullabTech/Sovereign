-- ============================================================================
-- AUTHORIZED CROSSINGS — append-only admissibility ledger for case→field crossings
-- Migration: 20260708000001_authorized_crossings.sql
--
-- Completes the pathway foreseen in 20260626000002_case_memories_crossing_check.sql:11-14
--   ("a future steward authorization workflow ... an authorized_crossings table with a
--    separate write path. Do not silently bypass it.")
--
-- Spec:  docs/specs/PRACTITIONER_KNOWLEDGE_PROVENANCE_GATE_CANDIDATE_2026-07-08.md (B')
-- Plan:  docs/specs/AUTHORIZED_CROSSINGS_IMPLEMENTATION_PLAN_2026-07-08.md (Step 2)
--
-- This migration is BEHAVIOR-NEUTRAL: it creates the ledger + derived status view only.
-- No prompt / field / Context Assembly path reads it yet (the loader is Step 3).
--
-- Two guarantees are enforced at the DB, not by convention:
--   1. APPEND-ONLY   — no UPDATE / DELETE; `revoked` is a new row, never an edit.
--   2. REVIEWER = PRACTITIONER — the reviewer must be the case's own practitioner;
--      a Studio Steward cannot authorize a crossing (STUDIO_STEWARD_MODEL §3.A:
--      a steward cannot read client data, so cannot judge de-individuation).
--
-- De-individuation is NOT a stored boolean. It is the OUTCOME of an accountable
-- review event: who decided, on what basis, when. Admissibility is DERIVED from the
-- latest event; the origin case_memories row is never mutated.
-- ============================================================================

CREATE TABLE IF NOT EXISTS authorized_crossings (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seq                    BIGINT GENERATED ALWAYS AS IDENTITY,   -- monotonic; "latest event" is unambiguous
  memory_id              UUID NOT NULL REFERENCES case_memories(id) ON DELETE CASCADE,

  decision               TEXT NOT NULL CHECK (decision IN ('approved', 'refused', 'revoked')),
  decision_reason        TEXT NOT NULL,                         -- every decision must be reasoned
  de_individuation_basis TEXT,                                  -- HOW it was judged no longer to encode one person
  consent_basis          TEXT,                                  -- present iff transformation incomplete (MAIA_MEMORY_CANON:61)

  reviewed_by            UUID NOT NULL REFERENCES members(id),  -- must be the case practitioner (trigger below)
  reviewed_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- An 'approved' crossing MUST state its de-individuation basis. Refused / revoked
  -- need only a reason. This is the anti-authorship-laundering guard: you cannot
  -- approve a crossing on the authorship label alone.
  CONSTRAINT authorized_crossings_approved_requires_basis
    CHECK (decision <> 'approved' OR de_individuation_basis IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_authorized_crossings_memory
  ON authorized_crossings(memory_id, seq DESC);

COMMENT ON TABLE authorized_crossings IS
  'Append-only ledger of admissibility decisions for crossing a case_memory into field context. '
  'Origin case_memories is never mutated; admissibility is derived from the latest event.';
COMMENT ON COLUMN authorized_crossings.de_individuation_basis IS
  'Reviewer''s accountable basis that the recognition no longer encodes a single client''s experience. '
  'Required for approved decisions (see authorized_crossings_approved_requires_basis).';
COMMENT ON COLUMN authorized_crossings.reviewed_by IS
  'Must equal the practitioner_id of the memory''s case (enforced by trigger). '
  'Stewards cannot authorize crossings — they cannot read client data.';

-- ─────────────────────────────────────────────────────────────────────────────
-- Guarantee 1: append-only (block UPDATE and DELETE at the DB)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION authorized_crossings_no_mutate()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION
    'authorized_crossings is append-only: % is not permitted. Record a new event (e.g. revoked) instead.',
    TG_OP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_authorized_crossings_append_only ON authorized_crossings;
CREATE TRIGGER trg_authorized_crossings_append_only
  BEFORE UPDATE OR DELETE ON authorized_crossings
  FOR EACH ROW EXECUTE FUNCTION authorized_crossings_no_mutate();

-- ─────────────────────────────────────────────────────────────────────────────
-- Guarantee 2: reviewer must be the case's own practitioner
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION authorized_crossings_reviewer_is_practitioner()
RETURNS TRIGGER AS $$
DECLARE
  mem_practitioner UUID;
BEGIN
  SELECT practitioner_id INTO mem_practitioner
    FROM case_memories WHERE id = NEW.memory_id;

  IF mem_practitioner IS NULL THEN
    RAISE EXCEPTION 'authorized_crossings: memory_id % has no case_memory', NEW.memory_id;
  END IF;

  IF NEW.reviewed_by <> mem_practitioner THEN
    RAISE EXCEPTION
      'authorized_crossings: reviewed_by (%) must be the case practitioner (%). Stewards cannot authorize crossings.',
      NEW.reviewed_by, mem_practitioner;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_authorized_crossings_reviewer ON authorized_crossings;
CREATE TRIGGER trg_authorized_crossings_reviewer
  BEFORE INSERT ON authorized_crossings
  FOR EACH ROW EXECUTE FUNCTION authorized_crossings_reviewer_is_practitioner();

-- ─────────────────────────────────────────────────────────────────────────────
-- Derived status (read-only). Admissibility = latest decision per memory = 'approved'.
-- No event  → 'none' (held). Latest 'revoked'/'refused' → held. Origin never mutated.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW case_memory_crossing_status AS
SELECT
  cm.id AS memory_id,
  COALESCE(latest.decision, 'none') AS crossing_status,
  (latest.decision = 'approved')    AS admissible,
  latest.reviewed_at                AS decided_at
FROM case_memories cm
LEFT JOIN LATERAL (
  SELECT ac.decision, ac.reviewed_at
  FROM authorized_crossings ac
  WHERE ac.memory_id = cm.id
  ORDER BY ac.seq DESC
  LIMIT 1
) latest ON TRUE;

COMMENT ON VIEW case_memory_crossing_status IS
  'Derived current admissibility per case_memory from the append-only authorized_crossings ledger. '
  'admissible = latest decision is approved. Read path for the Step-3 loader.';
