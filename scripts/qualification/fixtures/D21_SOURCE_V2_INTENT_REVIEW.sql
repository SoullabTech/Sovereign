-- Writer's Studio Source V2 — D21 GOVERNED REVIEW CANDIDATE. DO NOT APPLY.
-- Entirely new forward-only schema. NEVER edit or replay an older applied CREATE.
-- Intended for one admitted Writer image ONLY after source owner + independent
-- Class A/R20 + actual target migration history + rollback approval.
--
-- These are LOCAL content-free coordination records, NOT the authority ledger.
-- A separate-admin R20 broker must attest signed-current member/Work/deletion,
-- durable prewrite intent, key release, physical vault object and PostgreSQL
-- commit outcome before any user-visible "imported" acknowledgment.
-- Legacy full-text `manuscript_source_arrivals.source_text` and
-- `manuscript_sections.body` are NOT populated by this schema. Those plaintext
-- routes need their own encrypted-projection read/write cutover and old-image
-- antirollback; their existence is not proof that this schema is deployable.

BEGIN;

CREATE TABLE writer_source_v2_import_intents (
  arrival_id uuid PRIMARY KEY,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  gesture_id uuid NOT NULL,
  living_work_id uuid NOT NULL,
  -- A not-yet-created Work ID may be author-reserved. Not a derived manuscript ID.
  work_decision text NOT NULL CHECK (work_decision IN ('add_existing', 'create_new')),
  declaration_epoch bigint NOT NULL CHECK (declaration_epoch > 0),
  manuscript_id uuid NOT NULL,
  object_id uuid NOT NULL,
  key_id uuid NOT NULL,
  generation bigint NOT NULL CHECK (generation > 0),
  expected_original_bytes bigint NOT NULL CHECK (expected_original_bytes > 0),
  expected_original_sha256 text CHECK (
    expected_original_sha256 IS NULL OR expected_original_sha256 ~ '^[0-9a-f]{64}$'
  ),
  -- Digest of AUTHOR-confirmed Work decision and intended identity, not title/text.
  author_action_sha256 text NOT NULL CHECK (author_action_sha256 ~ '^[0-9a-f]{64}$'),
  -- Broker-issued durable-intention reference digest; SQL cannot certify signer.
  intent_receipt_sha256 text NOT NULL CHECK (intent_receipt_sha256 ~ '^[0-9a-f]{64}$'),
  -- Canonical digest of this entire immutable reservation excluding timestamps.
  reservation_sha256 text NOT NULL CHECK (reservation_sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT writer_source_v2_distinct_work_manuscript CHECK (living_work_id <> manuscript_id),
  CONSTRAINT writer_source_v2_one_gesture_per_author UNIQUE (member_id, gesture_id),
  CONSTRAINT writer_source_v2_unique_object UNIQUE (object_id),
  CONSTRAINT writer_source_v2_unique_manuscript UNIQUE (manuscript_id),
  CONSTRAINT writer_source_v2_intent_scope UNIQUE (arrival_id, member_id, living_work_id, manuscript_id),
  CONSTRAINT writer_source_v2_intent_object UNIQUE (arrival_id, object_id)
);

-- The completed manifest must have been independently verified in the real
-- immutable snapshot actor. A LOCAL row or hash is not that verification.
CREATE TABLE writer_source_v2_completed_originals (
  arrival_id uuid PRIMARY KEY,
  object_id uuid NOT NULL,
  original_sha256 text NOT NULL CHECK (original_sha256 ~ '^[0-9a-f]{64}$'),
  manifest_sha256 text NOT NULL CHECK (manifest_sha256 ~ '^[0-9a-f]{64}$'),
  total_plaintext_bytes bigint NOT NULL CHECK (total_plaintext_bytes > 0),
  -- Matches the EXISTING D18C 4 MiB authenticated chunk plan, no new cap.
  chunk_count bigint NOT NULL CHECK (
    chunk_count > 0 AND chunk_count = ((total_plaintext_bytes - 1) / 4194304 + 1)
  ),
  immutable_version_id text NOT NULL CHECK (length(immutable_version_id) BETWEEN 12 AND 256),
  external_snapshot_witness_sha256 text NOT NULL CHECK (
    external_snapshot_witness_sha256 ~ '^[0-9a-f]{64}$'),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT writer_source_v2_original_scope_fk
    FOREIGN KEY (arrival_id, object_id)
    REFERENCES writer_source_v2_import_intents(arrival_id, object_id) ON DELETE RESTRICT
);

-- This is a locally committed PENDING publication record, never itself a
-- certified R20/PG COMMIT acknowledgement. The real one-publisher transaction
-- must additionally include Source-backed encrypted sections/first revision,
-- author declaration and Work binding under the same verified gesture.
-- A durable independent COMMIT attestation is mandatory before disclosure.
CREATE TABLE writer_source_v2_pending_publications (
  arrival_id uuid PRIMARY KEY REFERENCES writer_source_v2_completed_originals(arrival_id)
    ON DELETE RESTRICT,
  member_id uuid NOT NULL,
  living_work_id uuid NOT NULL,
  manuscript_id uuid NOT NULL,
  declaration_id uuid NOT NULL,
  first_revision_id uuid NOT NULL,
  section_count integer NOT NULL CHECK (section_count > 0),
  figure_reference_count integer NOT NULL CHECK (figure_reference_count >= 0),
  confirmed_cuts_sha256 text NOT NULL CHECK (confirmed_cuts_sha256 ~ '^[0-9a-f]{64}$'),
  figure_anchors_sha256 text NOT NULL CHECK (figure_anchors_sha256 ~ '^[0-9a-f]{64}$'),
  encrypted_derived_text_sha256 text NOT NULL CHECK (
    encrypted_derived_text_sha256 ~ '^[0-9a-f]{64}$'),
  local_publication_receipt_sha256 text NOT NULL CHECK (
    local_publication_receipt_sha256 ~ '^[0-9a-f]{64}$'),
  local_committed_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT writer_source_v2_publication_scope_fk
    FOREIGN KEY (arrival_id, member_id, living_work_id, manuscript_id)
    REFERENCES writer_source_v2_import_intents(
      arrival_id, member_id, living_work_id, manuscript_id
    ) ON DELETE RESTRICT,
  CONSTRAINT writer_source_v2_publication_one_manuscript UNIQUE (manuscript_id)
);

-- Updates could relabel evidence after an author's gesture. Refuse.
-- DELETE is NOT evidence of completed erasure; approved erasure must be
-- separately fenced/attested per object across old images and backup restores.
CREATE FUNCTION writer_source_v2_refuse_update() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'writer_source_v2_immutable_record';
END $$;

CREATE TRIGGER writer_source_v2_immutable_intent
  BEFORE UPDATE ON writer_source_v2_import_intents
  FOR EACH ROW EXECUTE FUNCTION writer_source_v2_refuse_update();
CREATE TRIGGER writer_source_v2_immutable_original
  BEFORE UPDATE ON writer_source_v2_completed_originals
  FOR EACH ROW EXECUTE FUNCTION writer_source_v2_refuse_update();
CREATE TRIGGER writer_source_v2_immutable_publication
  BEFORE UPDATE ON writer_source_v2_pending_publications
  FOR EACH ROW EXECUTE FUNCTION writer_source_v2_refuse_update();

CREATE INDEX writer_source_v2_author_intents
  ON writer_source_v2_import_intents(member_id, created_at DESC);
CREATE INDEX writer_source_v2_staged_originals
  ON writer_source_v2_completed_originals(recorded_at DESC);

COMMENT ON TABLE writer_source_v2_import_intents IS
  'Source V2 content-free local reservation; cannot replace independent prewrite/R20 signer.';
COMMENT ON TABLE writer_source_v2_pending_publications IS
  'Locally committed pending result; independent PostgreSQL COMMIT and current R20 attestation required before successful replay.';

COMMIT;
-- No automatic rollback. Source custody/erasure/restore must be independently
-- reconciled before any governance-approved compensating schema action.
