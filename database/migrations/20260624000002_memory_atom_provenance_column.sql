-- Provenance audit column for member_memory_atoms
-- Stores structured source metadata as JSONB. Used by practitioner_observation
-- atoms to carry session_id, practitioner_id, candidate_id, and write timestamp —
-- making the full chain from witnessed session to memory atom reversible and auditable.
-- Nullable: existing atoms carry no provenance (member-placed, not bridged).

ALTER TABLE member_memory_atoms
  ADD COLUMN IF NOT EXISTS provenance jsonb;
