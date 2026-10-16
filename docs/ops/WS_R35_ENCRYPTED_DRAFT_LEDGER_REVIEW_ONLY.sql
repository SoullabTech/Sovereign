-- R35 review-only: apply to a brand-new synthetic PostgreSQL 16 fixture.
-- NOT A DEPLOYMENT MIGRATION. Real Writer's Studio routes still use legacy SQL.
-- All text/notes/section content/partition and idempotency tokens are sealed
-- in the Work vault or held only in process memory; SQL stores opaque hashes.
DO $r35$ BEGIN
 IF current_setting('server_version_num')::integer/10000 <> 16 THEN
   RAISE EXCEPTION 'r35_exact_pg16_fixture_required';
 END IF;
END $r35$;

CREATE TABLE writers_studio_r35_draft_heads (
 work_id uuid PRIMARY KEY REFERENCES member_manuscripts(id) ON DELETE RESTRICT,
 member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
 generation bigint NOT NULL CHECK(generation>0),
 checkpoint_count bigint NOT NULL CHECK(checkpoint_count>=0),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(work_id,member_id)
);

CREATE TABLE writers_studio_r35_draft_versions (
 work_id uuid NOT NULL REFERENCES writers_studio_r35_draft_heads(work_id) ON DELETE RESTRICT,
 member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
 generation bigint NOT NULL CHECK(generation>0),
 key_id uuid NOT NULL,
 cipher_ref text UNIQUE NOT NULL
   CHECK (cipher_ref ~ '^ws-beta-r35-held-drafts/[a-f0-9-]{36}\.enc$'),
 cipher_sha256 char(64) NOT NULL CHECK(cipher_sha256 ~ '^[a-f0-9]{64}$'),
 previous_sha256 char(64)
   CHECK(previous_sha256 IS NULL OR previous_sha256 ~ '^[a-f0-9]{64}$'),
 checkpoint_count bigint NOT NULL CHECK(checkpoint_count>=0),
 action text NOT NULL CHECK(action IN ('start','save','checkpoint','restore')),
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(work_id,generation),
 FOREIGN KEY(work_id,member_id)
   REFERENCES writers_studio_r35_draft_heads(work_id,member_id)
);

CREATE TABLE writers_studio_r35_draft_receipts (
 work_id uuid NOT NULL REFERENCES writers_studio_r35_draft_heads(work_id) ON DELETE RESTRICT,
 idem_hmac char(64) NOT NULL CHECK(idem_hmac ~ '^[a-f0-9]{64}$'),
 payload_hmac char(64) NOT NULL CHECK(payload_hmac ~ '^[a-f0-9]{64}$'),
 action text NOT NULL CHECK(action IN ('save','checkpoint','restore')),
 generation bigint NOT NULL,
 checkpoint_count bigint NOT NULL CHECK(checkpoint_count>=0),
 PRIMARY KEY(work_id,idem_hmac),
 FOREIGN KEY(work_id,generation) REFERENCES writers_studio_r35_draft_versions(work_id,generation)
);

CREATE FUNCTION r35_review_immutable_versions() RETURNS trigger
LANGUAGE plpgsql AS $r35$
BEGIN
 IF TG_OP <> 'INSERT' THEN RAISE EXCEPTION 'r35_revisions_are_immutable'; END IF;
 IF NOT EXISTS (
   SELECT 1 FROM member_manuscripts m
   WHERE m.id=NEW.work_id AND m.member_id=NEW.member_id
 ) THEN RAISE EXCEPTION 'r35_foreign_draft_owner_refused'; END IF;
 IF NEW.generation=1 THEN
   IF NEW.previous_sha256 IS NOT NULL OR NEW.action<>'start'
     OR NEW.checkpoint_count<>0 THEN
     RAISE EXCEPTION 'r35_first_revision_invalid';
   END IF;
 ELSE
   IF NOT EXISTS (
     SELECT 1 FROM writers_studio_r35_draft_versions p
     WHERE p.work_id=NEW.work_id AND p.member_id=NEW.member_id
       AND p.generation=NEW.generation-1
       AND p.cipher_sha256=NEW.previous_sha256
   ) THEN RAISE EXCEPTION 'r35_previous_cipher_digest_mismatch'; END IF;
 END IF;
 RETURN NEW;
END $r35$;
CREATE TRIGGER r35_draft_version_immutable
 BEFORE INSERT OR UPDATE OR DELETE
 ON writers_studio_r35_draft_versions
 FOR EACH ROW EXECUTE FUNCTION r35_review_immutable_versions();

CREATE FUNCTION r35_review_head_fence() RETURNS trigger
LANGUAGE plpgsql AS $r35$
BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'r35_head_delete_refused'; END IF;
 IF TG_OP='INSERT' THEN
   IF NOT EXISTS (
     SELECT 1 FROM member_manuscripts m
     WHERE m.id=NEW.work_id AND m.member_id=NEW.member_id
   ) THEN RAISE EXCEPTION 'r35_head_foreign_owner_refused'; END IF;
   IF NEW.generation<>1 OR NEW.checkpoint_count<>0 THEN
     RAISE EXCEPTION 'r35_initial_head_invalid'; END IF;
 ELSE
   IF NEW.work_id<>OLD.work_id OR NEW.member_id<>OLD.member_id OR
      NEW.generation<>OLD.generation+1 OR
      NEW.checkpoint_count NOT IN (OLD.checkpoint_count,OLD.checkpoint_count+1)
   THEN RAISE EXCEPTION 'r35_head_generation_rollback_refused'; END IF;
 END IF;
 RETURN NEW;
END $r35$;
CREATE TRIGGER r35_draft_head_fence
 BEFORE INSERT OR UPDATE OR DELETE
 ON writers_studio_r35_draft_heads
 FOR EACH ROW EXECUTE FUNCTION r35_review_head_fence();

CREATE FUNCTION r35_review_immutable_receipts() RETURNS trigger
LANGUAGE plpgsql AS $r35$
BEGIN
 IF TG_OP <> 'INSERT' THEN RAISE EXCEPTION 'r35_receipts_are_immutable'; END IF;
 RETURN NEW;
END $r35$;
CREATE TRIGGER r35_draft_receipt_immutable
 BEFORE INSERT OR UPDATE OR DELETE
 ON writers_studio_r35_draft_receipts
 FOR EACH ROW EXECUTE FUNCTION r35_review_immutable_receipts();

REVOKE ALL ON writers_studio_r35_draft_heads FROM PUBLIC;
REVOKE ALL ON writers_studio_r35_draft_versions FROM PUBLIC;
REVOKE ALL ON writers_studio_r35_draft_receipts FROM PUBLIC;
COMMENT ON TABLE writers_studio_r35_draft_receipts IS
 'R35 synthetic-only HMAC-bound structural idempotency results, no token/prose/notes.';
