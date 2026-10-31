-- lock-timeout: exempt already applied in production before reaching canonical; SQL left unchanged so the file matches what ran (reconciled 2026-10-31)
-- Writer Gate 2 — one-time retirement of pre-encryption Source arrivals.
--
-- This table records only content-free binding facts. The legacy vault path is
-- never retained here: while physical erasure is owed, vault_erasure_queue is
-- the sole path-bearing obligation; after success, only its SHA-256 survives.
--
-- Applying this migration does not authorize a production census, migration,
-- upload release, export certification or permanent-erasure claim.

BEGIN;

CREATE TABLE IF NOT EXISTS writer_source_legacy_retirements (
  id uuid PRIMARY KEY,
  legacy_arrival_id uuid NOT NULL UNIQUE,
  replacement_arrival_id uuid NOT NULL UNIQUE,
  replacement_landing_id uuid NOT NULL UNIQUE,

  -- Stable relational identities survive later Work/account deletion so a
  -- stale recovery generation cannot quietly become authoritative again.
  member_id uuid NOT NULL,
  manuscript_id uuid,

  legacy_artifact_ref_sha256 text NOT NULL
    CHECK (legacy_artifact_ref_sha256 ~ '^[0-9a-f]{64}$'),
  replacement_artifact_ref_sha256 text NOT NULL
    CHECK (replacement_artifact_ref_sha256 ~ '^[0-9a-f]{64}$'),
  original_sha256 text NOT NULL CHECK (original_sha256 ~ '^[0-9a-f]{64}$'),
  original_bytes bigint NOT NULL CHECK (original_bytes > 0 AND original_bytes <= 26214400),
  ciphertext_sha256 text NOT NULL CHECK (ciphertext_sha256 ~ '^[0-9a-f]{64}$'),
  ciphertext_bytes bigint NOT NULL CHECK (ciphertext_bytes > 0),

  -- Digest of the private, content-free migration statement. A separate signed
  -- recovery authority admits or retires recovery-set manifests; this row does
  -- not pretend to be that independent authority.
  migration_manifest_sha256 text NOT NULL
    CHECK (migration_manifest_sha256 ~ '^[0-9a-f]{64}$'),

  state text NOT NULL CHECK (state IN ('ERASURE_OWED','RETIRED')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  retired_at timestamptz,

  CONSTRAINT writer_source_legacy_retirement_state CHECK (
    (state = 'ERASURE_OWED' AND retired_at IS NULL)
    OR (state = 'RETIRED' AND retired_at IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_writer_source_legacy_retirement_state
  ON writer_source_legacy_retirements(state, created_at, id);

CREATE OR REPLACE FUNCTION writer_source_legacy_retirement_guard()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.id IS DISTINCT FROM OLD.id
       OR NEW.legacy_arrival_id IS DISTINCT FROM OLD.legacy_arrival_id
       OR NEW.replacement_arrival_id IS DISTINCT FROM OLD.replacement_arrival_id
       OR NEW.replacement_landing_id IS DISTINCT FROM OLD.replacement_landing_id
       OR NEW.member_id IS DISTINCT FROM OLD.member_id
       OR NEW.manuscript_id IS DISTINCT FROM OLD.manuscript_id
       OR NEW.legacy_artifact_ref_sha256 IS DISTINCT FROM OLD.legacy_artifact_ref_sha256
       OR NEW.replacement_artifact_ref_sha256 IS DISTINCT FROM OLD.replacement_artifact_ref_sha256
       OR NEW.original_sha256 IS DISTINCT FROM OLD.original_sha256
       OR NEW.original_bytes IS DISTINCT FROM OLD.original_bytes
       OR NEW.ciphertext_sha256 IS DISTINCT FROM OLD.ciphertext_sha256
       OR NEW.ciphertext_bytes IS DISTINCT FROM OLD.ciphertext_bytes
       OR NEW.migration_manifest_sha256 IS DISTINCT FROM OLD.migration_manifest_sha256
       OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'Writer legacy Source retirement identity is immutable';
    END IF;

    IF OLD.state = 'ERASURE_OWED' AND NEW.state = 'RETIRED'
       AND OLD.retired_at IS NULL AND NEW.retired_at IS NOT NULL THEN
      RETURN NEW;
    END IF;
    IF NEW IS NOT DISTINCT FROM OLD THEN RETURN NEW; END IF;
    RAISE EXCEPTION 'Writer legacy Source retirement transition % -> % refused',
      OLD.state, NEW.state;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS writer_source_legacy_retirement_guard_trigger
  ON writer_source_legacy_retirements;
CREATE TRIGGER writer_source_legacy_retirement_guard_trigger
  BEFORE INSERT OR UPDATE ON writer_source_legacy_retirements
  FOR EACH ROW EXECUTE FUNCTION writer_source_legacy_retirement_guard();

COMMENT ON TABLE writer_source_legacy_retirements IS
  'Content-free, durable proof that a pre-encryption Source arrival was replaced by an authenticated ciphertext-first arrival. RETIRED means the currently mounted legacy bytes were durably absent; it does not certify historical backup erasure.';

COMMENT ON COLUMN writer_source_legacy_retirements.legacy_artifact_ref_sha256 IS
  'SHA-256 of the retired opaque vault-relative path. The path itself exists only in the transient owed-erasure queue.';

COMMIT;
