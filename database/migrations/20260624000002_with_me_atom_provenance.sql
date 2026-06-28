-- Structured provenance for practitioner_observation atoms
-- Enables session-scoped queries and complete audit trail without
-- embedding session metadata in the body text.

ALTER TABLE member_memory_atoms
  ADD COLUMN IF NOT EXISTS provenance JSONB;

-- GIN index for session-scoped queries (find atoms from a given session):
--   SELECT * FROM member_memory_atoms WHERE provenance->>'session_id' = $1
CREATE INDEX IF NOT EXISTS idx_memory_atoms_provenance_gin
  ON member_memory_atoms USING GIN (provenance)
  WHERE provenance IS NOT NULL;

COMMENT ON COLUMN member_memory_atoms.provenance IS
  'Structured attribution for non-member-authored atoms. Shape: '
  '{"session_id": UUID, "practitioner_id": UUID, "candidate_id": string, '
  '"candidate_index": int, "written_at": ISO8601}';
