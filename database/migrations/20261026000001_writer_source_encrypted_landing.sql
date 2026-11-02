-- Writer full-feature beta F1/F2 — ciphertext-first Source landing.
--
-- This table is a pre-custody state machine. No row here, by itself, grants
-- author-owned Source custody. The only custody-bearing record remains an
-- immutable manuscript_source_arrivals row created after encrypted bytes have
-- been durably written, independently read back, authenticated and decrypted.
--
-- PENDING_BYTES -> WRITING_BYTES -> BYTES_VERIFIED -> ARRIVAL_RECORDED
--
-- Production intake remains separately server-held. Applying this migration is
-- not permission to enable uploads, certify exports, or admit beta writers.

BEGIN;

CREATE TABLE IF NOT EXISTS writer_source_landing_intents (
  id uuid PRIMARY KEY,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,

  -- A caller-generated UUID may make an HTTP retry idempotent. NULL means the
  -- caller did not supply one; PostgreSQL permits multiple NULL values here.
  idempotency_key uuid,

  -- Server-generated opaque path. Original filename, member identity and file
  -- hash are deliberately absent from the physical object name.
  artifact_ref text NOT NULL UNIQUE
    CHECK (artifact_ref ~ '^manuscript-sources/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[.]source[.]enc$'),

  original_sha256 text NOT NULL CHECK (original_sha256 ~ '^[0-9a-f]{64}$'),
  original_bytes bigint NOT NULL CHECK (original_bytes > 0 AND original_bytes <= 26214400),
  original_format text NOT NULL CHECK (original_format IN ('docx','pdf','epub','text')),

  state text NOT NULL DEFAULT 'PENDING_BYTES'
    CHECK (state IN ('PENDING_BYTES','WRITING_BYTES','BYTES_VERIFIED','ARRIVAL_RECORDED')),
  write_epoch bigint NOT NULL DEFAULT 0 CHECK (write_epoch >= 0),
  lease_token uuid,
  lease_expires_at timestamptz,
  verified_at timestamptz,

  -- AES-256-GCM original-byte envelope. Production wraps each per-arrival DEK
-- under AWS KMS; the local static provider is accepted only by NODE_ENV=test code.
  -- These columns are absent in PENDING_BYTES and complete in every later state.
  encryption_version integer,
  encryption_algorithm text,
  key_provider text,
  key_wrap_algorithm text,
  key_id text,
  cipher_iv text,
  cipher_tag text,
  wrapped_dek text,
  wrap_iv text,
  wrap_tag text,
  ciphertext_sha256 text,
  ciphertext_bytes bigint,

  -- Set in the same transaction that inserts the immutable arrival. Deleting
  -- that arrival (including a governed manuscript-delete cascade) also removes
  -- this wrapped key envelope, while the erasure queue retains the byte path.
  arrival_id uuid UNIQUE REFERENCES manuscript_source_arrivals(id) ON DELETE CASCADE,

  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  modified_at timestamptz NOT NULL DEFAULT clock_timestamp(),

  CONSTRAINT writer_source_landing_idempotency_unique
    UNIQUE (member_id, idempotency_key),

  CONSTRAINT writer_source_landing_consistent_phase CHECK (
    (
      state = 'PENDING_BYTES'
      AND write_epoch = 0
      AND lease_token IS NULL
      AND lease_expires_at IS NULL
      AND verified_at IS NULL
      AND encryption_version IS NULL
      AND encryption_algorithm IS NULL
      AND key_provider IS NULL
      AND key_wrap_algorithm IS NULL
      AND key_id IS NULL
      AND cipher_iv IS NULL
      AND cipher_tag IS NULL
      AND wrapped_dek IS NULL
      AND wrap_iv IS NULL
      AND wrap_tag IS NULL
      AND ciphertext_sha256 IS NULL
      AND ciphertext_bytes IS NULL
      AND arrival_id IS NULL
    ) OR (
      state IN ('WRITING_BYTES','BYTES_VERIFIED','ARRIVAL_RECORDED')
      AND write_epoch > 0
      AND lease_token IS NOT NULL
      AND lease_expires_at IS NOT NULL
      AND encryption_version = 1
      AND encryption_algorithm = 'aes-256-gcm'
      AND key_provider IN ('aws-kms','local-test')
      AND key_id IS NOT NULL
      AND cipher_iv IS NOT NULL
      AND cipher_tag IS NOT NULL
      AND wrapped_dek IS NOT NULL
      AND ciphertext_sha256 ~ '^[0-9a-f]{64}$'
      AND ciphertext_bytes > 0
      AND (
        (key_provider = 'aws-kms'
         AND key_wrap_algorithm = 'aws-kms-generate-data-key-v1'
         AND wrap_iv IS NULL AND wrap_tag IS NULL)
        OR
        (key_provider = 'local-test'
         AND key_wrap_algorithm = 'aes-256-gcm-local-test'
         AND wrap_iv IS NOT NULL AND wrap_tag IS NOT NULL)
      )
      AND (
        (state = 'WRITING_BYTES' AND verified_at IS NULL AND arrival_id IS NULL)
        OR
        (state = 'BYTES_VERIFIED' AND verified_at IS NOT NULL AND arrival_id IS NULL)
        OR
        (state = 'ARRIVAL_RECORDED' AND verified_at IS NOT NULL AND arrival_id IS NOT NULL)
      )
    )
  )

);

CREATE OR REPLACE FUNCTION writer_source_landing_guard()
RETURNS trigger AS $$
DECLARE
  bound RECORD;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.member_id IS DISTINCT FROM OLD.member_id
       OR NEW.idempotency_key IS DISTINCT FROM OLD.idempotency_key
       OR NEW.artifact_ref IS DISTINCT FROM OLD.artifact_ref
       OR NEW.original_sha256 IS DISTINCT FROM OLD.original_sha256
       OR NEW.original_bytes IS DISTINCT FROM OLD.original_bytes
       OR NEW.original_format IS DISTINCT FROM OLD.original_format
       OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'Writer Source landing identity is immutable';
    END IF;

    IF OLD.state = 'ARRIVAL_RECORDED' THEN
      RAISE EXCEPTION 'Recorded Writer Source landing is immutable';
    ELSIF OLD.state = 'PENDING_BYTES' AND NEW.state = 'WRITING_BYTES' THEN
      IF NEW.write_epoch <> OLD.write_epoch + 1 THEN
        RAISE EXCEPTION 'Writer Source initial write epoch must advance exactly once';
      END IF;
    ELSIF OLD.state = 'WRITING_BYTES' AND NEW.state = 'WRITING_BYTES' THEN
      IF NEW.write_epoch <> OLD.write_epoch + 1
         OR ROW(NEW.encryption_version, NEW.encryption_algorithm, NEW.key_provider,
                NEW.key_wrap_algorithm, NEW.key_id, NEW.cipher_iv,
                NEW.cipher_tag, NEW.wrapped_dek, NEW.wrap_iv, NEW.wrap_tag,
                NEW.ciphertext_sha256, NEW.ciphertext_bytes)
            IS DISTINCT FROM
            ROW(OLD.encryption_version, OLD.encryption_algorithm, OLD.key_provider,
                OLD.key_wrap_algorithm, OLD.key_id, OLD.cipher_iv,
                OLD.cipher_tag, OLD.wrapped_dek, OLD.wrap_iv, OLD.wrap_tag,
                OLD.ciphertext_sha256, OLD.ciphertext_bytes)
         OR NEW.verified_at IS DISTINCT FROM OLD.verified_at
         OR NEW.arrival_id IS DISTINCT FROM OLD.arrival_id THEN
        RAISE EXCEPTION 'Writer Source lease renewal may not rewrite the envelope';
      END IF;
    ELSIF OLD.state = 'WRITING_BYTES' AND NEW.state = 'BYTES_VERIFIED' THEN
      IF NEW.write_epoch IS DISTINCT FROM OLD.write_epoch
         OR NEW.lease_token IS DISTINCT FROM OLD.lease_token
         OR NEW.lease_expires_at IS DISTINCT FROM OLD.lease_expires_at
         OR ROW(NEW.encryption_version, NEW.encryption_algorithm, NEW.key_provider,
                NEW.key_wrap_algorithm, NEW.key_id, NEW.cipher_iv,
                NEW.cipher_tag, NEW.wrapped_dek, NEW.wrap_iv, NEW.wrap_tag,
                NEW.ciphertext_sha256, NEW.ciphertext_bytes)
            IS DISTINCT FROM
            ROW(OLD.encryption_version, OLD.encryption_algorithm, OLD.key_provider,
                OLD.key_wrap_algorithm, OLD.key_id, OLD.cipher_iv,
                OLD.cipher_tag, OLD.wrapped_dek, OLD.wrap_iv, OLD.wrap_tag,
                OLD.ciphertext_sha256, OLD.ciphertext_bytes)
         OR NEW.arrival_id IS DISTINCT FROM OLD.arrival_id THEN
        RAISE EXCEPTION 'Writer Source verification may not rewrite the envelope';
      END IF;
    ELSIF OLD.state = 'BYTES_VERIFIED' AND NEW.state = 'ARRIVAL_RECORDED' THEN
      IF NEW.write_epoch IS DISTINCT FROM OLD.write_epoch
         OR NEW.lease_token IS DISTINCT FROM OLD.lease_token
         OR NEW.lease_expires_at IS DISTINCT FROM OLD.lease_expires_at
         OR NEW.verified_at IS DISTINCT FROM OLD.verified_at
         OR ROW(NEW.encryption_version, NEW.encryption_algorithm, NEW.key_provider,
                NEW.key_wrap_algorithm, NEW.key_id, NEW.cipher_iv,
                NEW.cipher_tag, NEW.wrapped_dek, NEW.wrap_iv, NEW.wrap_tag,
                NEW.ciphertext_sha256, NEW.ciphertext_bytes)
            IS DISTINCT FROM
            ROW(OLD.encryption_version, OLD.encryption_algorithm, OLD.key_provider,
                OLD.key_wrap_algorithm, OLD.key_id, OLD.cipher_iv,
                OLD.cipher_tag, OLD.wrapped_dek, OLD.wrap_iv, OLD.wrap_tag,
                OLD.ciphertext_sha256, OLD.ciphertext_bytes) THEN
        RAISE EXCEPTION 'Writer Source arrival binding may not rewrite the envelope';
      END IF;
    ELSE
      RAISE EXCEPTION 'Writer Source landing transition % -> % refused', OLD.state, NEW.state;
    END IF;
  END IF;

  IF NEW.state = 'ARRIVAL_RECORDED' THEN
    SELECT member_id, source_kind, artifact_ref, artifact_hash, artifact_size
      INTO bound
      FROM manuscript_source_arrivals
     WHERE id = NEW.arrival_id;
    IF NOT FOUND
       OR bound.member_id IS DISTINCT FROM NEW.member_id
       OR bound.source_kind IS DISTINCT FROM 'artifact_extraction'
       OR bound.artifact_ref IS DISTINCT FROM NEW.artifact_ref
       OR bound.artifact_hash IS DISTINCT FROM NEW.original_sha256
       OR bound.artifact_size IS DISTINCT FROM NEW.original_bytes THEN
      RAISE EXCEPTION 'Writer Source arrival binding mismatch';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS writer_source_landing_guard_trigger
  ON writer_source_landing_intents;
CREATE TRIGGER writer_source_landing_guard_trigger
  BEFORE INSERT OR UPDATE ON writer_source_landing_intents
  FOR EACH ROW EXECUTE FUNCTION writer_source_landing_guard();

CREATE INDEX IF NOT EXISTS idx_writer_source_landing_recovery
  ON writer_source_landing_intents(state, created_at, id);

CREATE INDEX IF NOT EXISTS idx_writer_source_landing_member
  ON writer_source_landing_intents(member_id, state, created_at, id);

-- Exact member-discard tombstones must refuse both the immutable arrival and
-- its wrapped-key envelope during data-only restore. Full disaster recovery
-- also runs the governed post-restore sweep.
DROP TRIGGER IF EXISTS s5_refuse_tombstoned_trigger
  ON manuscript_source_arrivals;
CREATE TRIGGER s5_refuse_tombstoned_trigger
  BEFORE INSERT ON manuscript_source_arrivals
  FOR EACH ROW EXECUTE FUNCTION s5_refuse_tombstoned();

DROP TRIGGER IF EXISTS s5_refuse_tombstoned_trigger
  ON writer_source_landing_intents;
CREATE TRIGGER s5_refuse_tombstoned_trigger
  BEFORE INSERT ON writer_source_landing_intents
  FOR EACH ROW EXECUTE FUNCTION s5_refuse_tombstoned();

COMMENT ON TABLE writer_source_landing_intents IS
  'DB-first, ciphertext-first original manuscript landing state. No state in this table alone certifies author Work custody, deletion completion, export authority, or member download.';

COMMENT ON COLUMN writer_source_landing_intents.wrapped_dek IS
  'Per-arrival data-encryption key wrapped under the configured Writer Source KEK. Never plaintext key material.';

COMMIT;
