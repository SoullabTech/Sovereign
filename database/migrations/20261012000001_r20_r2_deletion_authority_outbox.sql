-- R20-R2 — candidate only, never applied automatically.
-- A deletion act and a durable outbound authority obligation must commit together.
-- This table is NOT the independent authority. The externally signed ledger
-- must be witnessed before any historical restore or "total erasure" closure.
-- The identity sequence only orders deletion obligations within this database;
-- across restored databases a signed, independently anchored anti-rollback head
-- is required. Do not treat this sequence alone as a durable external clock.

BEGIN;

CREATE TABLE IF NOT EXISTS r20_deletion_authority_outbox (
  sequence_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  manifest_id UUID NOT NULL UNIQUE
    REFERENCES deletion_manifests(id) ON DELETE RESTRICT,
  subject_kind TEXT NOT NULL
    CHECK (subject_kind IN ('member_manuscripts')),
  minted_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

COMMENT ON TABLE r20_deletion_authority_outbox IS
  'R20-R2: append-only, content-minimal obligation for an independent signed deletion checkpoint. The outbox itself is NOT an authorization to restore.';

-- In ordinary transactions, do not let application code silently erase,
-- rewrite or "acknowledge" deletion obligations inside the restorable database.
CREATE OR REPLACE FUNCTION r20_refuse_outbox_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'R20: deletion authority outbox is append-only';
END $$;

DROP TRIGGER IF EXISTS r20_outbox_append_only ON r20_deletion_authority_outbox;
CREATE TRIGGER r20_outbox_append_only
  BEFORE UPDATE OR DELETE ON r20_deletion_authority_outbox
  FOR EACH ROW EXECUTE FUNCTION r20_refuse_outbox_mutation();

REVOKE UPDATE, DELETE, TRUNCATE ON r20_deletion_authority_outbox FROM PUBLIC;

COMMIT;
