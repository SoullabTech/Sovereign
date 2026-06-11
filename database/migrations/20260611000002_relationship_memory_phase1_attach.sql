-- Relationship Memory v1 — Phase 1: Attach (the edge)
-- Spec: docs/specs/RELATIONSHIP_MEMORY_V1.md §5
--
-- Adds the missing edge from a Session Room session to the person/case graph
-- that ALREADY EXISTS (practitioner_clients / practitioner_cases). This is not
-- new architecture; it is the missing foreign key. Per the diagnosis, sessions
-- linked to a person = 0 (scribe_sessions had no client_id/case_id).
--
-- Phase 1 wires ONLY client_id (the attachment edge + display name). case_id is
-- added now for forward-compatibility (Phase 2 case_memories) but is NOT
-- auto-populated in Phase 1: practitioner_clients and practitioner_cases are
-- separate, unjoined models, and implicit-case creation is deferred to Phase 2
-- alongside the memory layer (working rule: build the attachment edge, not the
-- memory layer).
--
-- Both columns are NULLABLE so today's behavior is preserved when no person is
-- attached (solo, practitioner skips, or the stricter-sanctuary "keep even the
-- client link private" opt-out, which stores neither). ON DELETE SET NULL so a
-- removed client/case never deletes session history.

ALTER TABLE scribe_sessions
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES practitioner_clients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS case_id   UUID REFERENCES practitioner_cases(id)   ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_scribe_sessions_client_id
  ON scribe_sessions(client_id) WHERE client_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_scribe_sessions_case_id
  ON scribe_sessions(case_id) WHERE case_id IS NOT NULL;

COMMENT ON COLUMN scribe_sessions.client_id IS 'Relationship Memory v1 (Phase 1): attaches this session to an existing practitioner_clients person. NULL = no person attached (solo, skipped, or stricter-sanctuary "keep link private").';
COMMENT ON COLUMN scribe_sessions.case_id IS 'Relationship Memory v1: optional practitioner_cases linkage. Added forward-compat in Phase 1; auto-population deferred to Phase 2 (memory layer).';
