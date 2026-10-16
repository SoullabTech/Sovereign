-- R33 REVIEW-ONLY fictional PostgreSQL 16 custody tables.
-- Apply ONLY to fresh isolated PG16 with R32 review schema, NEVER production.
-- No pending or original prose, filename, MIME or extractor stored in SQL.
DO $r33$ BEGIN
 IF current_setting('server_version_num')::int / 10000<>16
 THEN RAISE EXCEPTION 'r33_pg16_required'; END IF;
END $r33$;
CREATE TABLE writers_studio_r33_held_pending (
 arrival_id uuid PRIMARY KEY,
 member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
 pending_generation bigint NOT NULL CHECK(pending_generation>0),
 pending_key_id uuid NOT NULL,
 envelope_ref text NOT NULL UNIQUE
   CHECK(envelope_ref ~ '^ws-beta-r33-held-pending/[0-9a-f-]{36}\.enc$'),
 metadata_ref text NOT NULL UNIQUE
   CHECK(metadata_ref ~ '^ws-beta-r33-held-pending/[0-9a-f-]{36}\.enc$'),
 envelope_sha256 char(64) NOT NULL CHECK(envelope_sha256 ~ '^[0-9a-f]{64}$'),
 metadata_sha256 char(64) NOT NULL CHECK(metadata_sha256 ~ '^[0-9a-f]{64}$'),
 pair_sha256 char(64) NOT NULL CHECK(pair_sha256 ~ '^[0-9a-f]{64}$'),
 state text NOT NULL DEFAULT 'pending'
   CHECK(state IN ('pending','claim_committed_awaiting_rewrap',
     'rewrap_verified_awaiting_retirement')),
 claimed_work_id uuid NULL REFERENCES member_manuscripts(id) ON DELETE RESTRICT,
 claim_epoch bigint NULL CHECK(claim_epoch>0),
 claim_id uuid NULL UNIQUE,
 work_generation bigint NULL CHECK(work_generation>0),
 work_manifest_id uuid NULL REFERENCES writers_studio_r32_held_originals(id) ON DELETE RESTRICT,
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK(envelope_ref<>metadata_ref),
 CHECK(
  (state='pending' AND claim_id IS NULL AND claimed_work_id IS NULL AND claim_epoch IS NULL
     AND work_generation IS NULL AND work_manifest_id IS NULL)
  OR
  (state='claim_committed_awaiting_rewrap' AND claim_id IS NOT NULL AND claimed_work_id IS NOT NULL
     AND claim_epoch IS NOT NULL AND work_generation IS NOT NULL
     AND work_manifest_id IS NULL)
  OR
  (state='rewrap_verified_awaiting_retirement' AND claim_id IS NOT NULL AND claimed_work_id IS NOT NULL
     AND claim_epoch IS NOT NULL AND work_generation IS NOT NULL
     AND work_manifest_id IS NOT NULL)
 )
);
CREATE FUNCTION writers_studio_r33_transition_guard() RETURNS trigger
LANGUAGE plpgsql AS $guard$
BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'r33_pending_original_immutable'; END IF;
 IF TG_OP='INSERT' THEN
  IF NEW.state<>'pending' THEN RAISE EXCEPTION 'r33_must_begin_pending'; END IF;
  RETURN NEW;
 END IF;
 IF ROW(NEW.arrival_id,NEW.member_id,NEW.pending_generation,
        NEW.pending_key_id,NEW.envelope_ref,NEW.metadata_ref,
        NEW.envelope_sha256,NEW.metadata_sha256,NEW.pair_sha256)
    IS DISTINCT FROM
    ROW(OLD.arrival_id,OLD.member_id,OLD.pending_generation,
        OLD.pending_key_id,OLD.envelope_ref,OLD.metadata_ref,
        OLD.envelope_sha256,OLD.metadata_sha256,OLD.pair_sha256)
 THEN RAISE EXCEPTION 'r33_immutable_ciphertext_owner_or_identity'; END IF;
 IF OLD.state='pending' AND
    NEW.state='claim_committed_awaiting_rewrap' THEN
  IF NEW.work_manifest_id IS NOT NULL OR NEW.claim_id IS NULL OR NEW.claimed_work_id IS NULL
     OR NEW.claim_epoch IS NULL OR NEW.work_generation IS NULL
  THEN RAISE EXCEPTION 'r33_invalid_claim_transition'; END IF;
  IF NOT EXISTS(SELECT 1 FROM member_manuscripts m
      WHERE m.id=NEW.claimed_work_id AND m.member_id=NEW.member_id)
  THEN RAISE EXCEPTION 'r33_foreign_work_claim'; END IF;
  RETURN NEW;
 END IF;
 IF OLD.state='claim_committed_awaiting_rewrap' AND
    NEW.state='rewrap_verified_awaiting_retirement' THEN
  IF NEW.claim_id IS DISTINCT FROM OLD.claim_id OR
     NEW.claimed_work_id IS DISTINCT FROM OLD.claimed_work_id
     OR NEW.claim_epoch IS DISTINCT FROM OLD.claim_epoch
     OR NEW.work_generation IS DISTINCT FROM OLD.work_generation
  THEN RAISE EXCEPTION 'r33_claim_scope_mutated'; END IF;
  IF NOT EXISTS(SELECT 1 FROM writers_studio_r32_held_originals w
    WHERE w.id=NEW.work_manifest_id AND w.member_id=NEW.member_id
      AND w.manuscript_id=NEW.claimed_work_id
      AND w.arrival_id=NEW.arrival_id
      AND w.work_generation=NEW.work_generation AND w.state='held_only')
  THEN RAISE EXCEPTION 'r33_rewrap_ciphertext_unverified'; END IF;
  RETURN NEW;
 END IF;
 RAISE EXCEPTION 'r33_unauthorized_pending_state_mutation';
END $guard$;
CREATE TRIGGER writers_studio_r33_immutable_pending
 BEFORE INSERT OR UPDATE OR DELETE ON writers_studio_r33_held_pending
 FOR EACH ROW EXECUTE FUNCTION writers_studio_r33_transition_guard();
REVOKE ALL ON writers_studio_r33_held_pending FROM PUBLIC;
COMMENT ON TABLE writers_studio_r33_held_pending IS
 'Fictional-only encrypted pending original. Rewrap verified is NOT key retirement or final custody.';
