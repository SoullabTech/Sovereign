-- Practitioner Observation Provenance
-- Extends member_memory_atoms to support facilitator-authored observations
-- from With Me sessions. Adds provenance columns and a new source_type.
--
-- Constitutional intent: approved practitioner observations enter memory as
-- "witnessed" — a distinct register that preserves their epistemic standing
-- (facilitator saw this, not: this is unquestioned truth about the member).
-- Reversible by design: atoms can be set_aside or archived without affecting
-- member-authored atoms.

-- 1. Facilitator who authored the observation (nullable — existing atoms have none)
ALTER TABLE member_memory_atoms
  ADD COLUMN IF NOT EXISTS facilitator_id uuid
  REFERENCES members(id) ON DELETE SET NULL;

-- 2. Epistemological status — how was this known?
ALTER TABLE member_memory_atoms
  ADD COLUMN IF NOT EXISTS epistemological_status text
  CONSTRAINT member_memory_atoms_epistemological_status_check
  CHECK (epistemological_status IS NULL OR epistemological_status = ANY (ARRAY[
    'observed',    -- witnessed directly by a facilitator in session
    'reported',    -- shared by the member in their own words
    'inferred',    -- derived from patterns (system-generated)
    'provisional', -- low confidence or flagged for member review
    'claimed'      -- asserted by the member as their truth
  ]));

-- 3. Add practitioner_observation to allowed source types
-- (requires drop + recreate; Postgres does not support ALTER CHECK inline)
ALTER TABLE member_memory_atoms
  DROP CONSTRAINT member_memory_atoms_source_type_check;

ALTER TABLE member_memory_atoms
  ADD CONSTRAINT member_memory_atoms_source_type_check
  CHECK (source_type = ANY (ARRAY[
    'idea',
    'idea_block',
    'journal',
    'dream',
    'reflection',
    'decision',
    'change',
    'session_excerpt',
    'spontaneous',
    'practitioner_observation'
  ]));

-- Index for facilitator-scoped queries
CREATE INDEX IF NOT EXISTS idx_memory_atoms_facilitator
  ON member_memory_atoms (facilitator_id)
  WHERE facilitator_id IS NOT NULL;
