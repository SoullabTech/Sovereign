-- R35 REVIEW-ONLY, fictional PostgreSQL 16. NOT production migration.
-- Intent must predate R32 ciphertext publishing in the calling workflow.
-- Everything here is opaque identity, keyed HMAC and encrypted-file digests.
DO $r35$ BEGIN
 IF current_setting('server_version_num')::int/10000<>16
 THEN RAISE EXCEPTION 'r35_postgresql16_required'; END IF;
END $r35$;
CREATE TABLE writers_studio_r35_held_intents (
 intent_id uuid PRIMARY KEY,
 member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
 arrival_id uuid NOT NULL UNIQUE,
 claim_id uuid NOT NULL UNIQUE,
 manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE RESTRICT,
 pending_generation bigint NOT NULL CHECK(pending_generation>0),
 work_generation bigint NOT NULL CHECK(work_generation>0),
 pending_key_id uuid NOT NULL,
 work_key_id uuid NOT NULL,
 source_binding_hmac char(64) NOT NULL
   CHECK(source_binding_hmac ~ '^[0-9a-f]{64}$'),
 state text NOT NULL DEFAULT 'held_intent'
   CHECK(state='held_intent'),
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK(pending_key_id<>work_key_id),
 UNIQUE(intent_id,member_id,manuscript_id,arrival_id,claim_id)
);
CREATE TABLE writers_studio_r35_held_observations (
 observation_id uuid PRIMARY KEY,
 intent_id uuid NOT NULL UNIQUE,
 member_id uuid NOT NULL,
 manuscript_id uuid NOT NULL,
 arrival_id uuid NOT NULL,
 claim_id uuid NOT NULL,
 work_manifest_id uuid NOT NULL UNIQUE
  REFERENCES writers_studio_r32_held_originals(id) ON DELETE RESTRICT,
 work_sha256 char(64) NOT NULL CHECK(work_sha256 ~ '^[0-9a-f]{64}$'),
 metadata_sha256 char(64) NOT NULL CHECK(metadata_sha256 ~ '^[0-9a-f]{64}$'),
 pair_sha256 char(64) NOT NULL CHECK(pair_sha256 ~ '^[0-9a-f]{64}$'),
 state text NOT NULL DEFAULT 'ciphertext_reconciled_retirement_held'
  CHECK(state='ciphertext_reconciled_retirement_held'),
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(intent_id,member_id,manuscript_id,arrival_id,claim_id)
  REFERENCES writers_studio_r35_held_intents(
   intent_id,member_id,manuscript_id,arrival_id,claim_id
  ) ON DELETE RESTRICT
);
CREATE FUNCTION writers_studio_r35_immutable_intent_guard() RETURNS trigger
LANGUAGE plpgsql AS $guard$
BEGIN
 IF TG_OP<>'INSERT' THEN
  RAISE EXCEPTION 'r35_intents_append_only';
 END IF;
 IF NOT EXISTS(SELECT 1 FROM writers_studio_r33_held_pending p
   JOIN member_manuscripts m ON m.id=p.claimed_work_id AND m.member_id=p.member_id
   WHERE p.arrival_id=NEW.arrival_id AND p.member_id=NEW.member_id
     AND p.claim_id=NEW.claim_id AND p.claimed_work_id=NEW.manuscript_id
     AND p.pending_generation=NEW.pending_generation
     AND p.work_generation=NEW.work_generation
     AND p.pending_key_id=NEW.pending_key_id
     AND p.state IN ('claim_committed_awaiting_rewrap',
                     'rewrap_verified_awaiting_retirement'))
 THEN RAISE EXCEPTION 'r35_claim_not_verified_by_database'; END IF;
 RETURN NEW;
END $guard$;
CREATE TRIGGER writers_studio_r35_held_intent_guard
 BEFORE INSERT OR UPDATE OR DELETE ON writers_studio_r35_held_intents
 FOR EACH ROW EXECUTE FUNCTION writers_studio_r35_immutable_intent_guard();
CREATE FUNCTION writers_studio_r35_immutable_observation_guard()
RETURNS trigger LANGUAGE plpgsql AS $guard$
BEGIN
 IF TG_OP<>'INSERT' THEN RAISE EXCEPTION 'r35_observations_append_only'; END IF;
 IF NOT EXISTS(
   SELECT 1 FROM writers_studio_r35_held_intents i
   JOIN writers_studio_r33_held_pending p
    ON p.arrival_id=i.arrival_id AND p.member_id=i.member_id
   JOIN writers_studio_r32_held_originals w
    ON w.id=NEW.work_manifest_id
   WHERE i.intent_id=NEW.intent_id AND
     i.member_id=NEW.member_id AND i.claim_id=NEW.claim_id AND
     i.arrival_id=NEW.arrival_id AND i.manuscript_id=NEW.manuscript_id
     AND w.member_id=i.member_id AND w.manuscript_id=i.manuscript_id
     AND w.arrival_id=i.arrival_id AND w.work_generation=i.work_generation
     AND w.key_id=i.work_key_id AND w.state='held_only'
     AND w.work_sha256=NEW.work_sha256
     AND w.metadata_sha256=NEW.metadata_sha256
     AND w.pair_sha256=NEW.pair_sha256
     AND p.claim_id=i.claim_id AND p.state='rewrap_verified_awaiting_retirement'
     AND p.work_manifest_id=w.id)
 THEN RAISE EXCEPTION 'r35_observation_not_bound_to_verified_work'; END IF;
 RETURN NEW;
END $guard$;
CREATE TRIGGER writers_studio_r35_held_observation_guard
 BEFORE INSERT OR UPDATE OR DELETE ON writers_studio_r35_held_observations
 FOR EACH ROW EXECUTE FUNCTION writers_studio_r35_immutable_observation_guard();
REVOKE ALL ON writers_studio_r35_held_intents FROM PUBLIC;
REVOKE ALL ON writers_studio_r35_held_observations FROM PUBLIC;
COMMENT ON TABLE writers_studio_r35_held_intents IS
 'Held metadata-only intent, not custody or authority to decrypt orphan ciphertext.';
COMMENT ON TABLE writers_studio_r35_held_observations IS
 'Held evidence of a previously authenticated R32 Work; not pending key retirement.';
