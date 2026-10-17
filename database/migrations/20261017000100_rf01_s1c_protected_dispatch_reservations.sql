-- RF01 S1-C · one-use protected model-processing dispatch reservation.
--
-- Held-only schema candidate. No production migration, data, or paid provider.
-- A five-minute one-turn Anthropic grant is not a reusable right to send
-- arbitrary strings. This claim is minted atomically before any provider
-- attempt; conflicting retry is refused, never silently sent a second time.
-- Abandoned claims remain held for manual review (no automatic replay).\n-- Privileged deletion/erasure requires later R1 governance qualification;\n-- immutability below prohibits UPDATE, not privileged DELETE.
-- Store NO member prompt, reply, content hash, sensitive filename or IP.
BEGIN;

CREATE TABLE IF NOT EXISTS runtime_processing_dispatch_reservations (
  request_id TEXT PRIMARY KEY
    REFERENCES runtime_processing_grants(request_id) ON DELETE RESTRICT,
  member_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  processor TEXT NOT NULL CHECK (processor = 'anthropic'),
  purpose TEXT NOT NULL CHECK (purpose = 'turn_text_generation'),
  dispatch_contract TEXT NOT NULL
    CHECK (dispatch_contract = 'rf01-s1c-protected-text-once-v1'),
  reserved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rf01_s1c_dispatch_owner
  ON runtime_processing_dispatch_reservations(member_id,session_id,reserved_at DESC);

COMMENT ON TABLE runtime_processing_dispatch_reservations IS
  'RF01 S1-C one-use provider dispatch boundary. Immutable, content-free. '
  'Failure before/after network may leave a reserved attempt; manual review '
  'required rather than replaying private content or risking duplicate egress.';

CREATE OR REPLACE FUNCTION rf01_processing_dispatch_immutable() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'RF01 protected dispatch reservation immutable';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS rf01_processing_dispatch_immutable_trg
  ON runtime_processing_dispatch_reservations;
CREATE TRIGGER rf01_processing_dispatch_immutable_trg
  BEFORE UPDATE ON runtime_processing_dispatch_reservations
  FOR EACH ROW EXECUTE FUNCTION rf01_processing_dispatch_immutable();

COMMIT;
