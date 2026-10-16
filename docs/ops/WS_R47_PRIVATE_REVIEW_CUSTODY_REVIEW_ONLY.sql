-- R47: FICTIONAL PG16 ONLY. Never apply to production migrations.
-- Exact private author proposal/selection is in a separate AES-GCM sealed
-- immutable vault, NOT in this database or any SQL logs.
DO $r47$ BEGIN
 IF current_setting('server_version_num')::int / 10000 <> 16
 THEN RAISE EXCEPTION 'r47_pg16_only'; END IF;
END $r47$;

CREATE TABLE writers_studio_r47_private_review (
 review_id uuid PRIMARY KEY,
 member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
 work_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE RESTRICT,
 draft_generation bigint NOT NULL CHECK(draft_generation>0),
 section_id uuid NOT NULL,
 alternative_id uuid NOT NULL,
 key_id uuid NOT NULL,
 idem_hmac char(64) NOT NULL CHECK(idem_hmac ~ '^[a-f0-9]{64}$'),
 review_hmac char(64) NOT NULL CHECK(review_hmac ~ '^[a-f0-9]{64}$'),
 consent_hmac char(64) NOT NULL CHECK(consent_hmac ~ '^[a-f0-9]{64}$'),
 cipher_ref text UNIQUE NOT NULL CHECK(
   cipher_ref ~ '^ws-beta-r47-private-review/[a-f0-9-]{36}\.enc$'),
 cipher_sha256 char(64) CHECK(cipher_sha256 IS NULL OR cipher_sha256 ~ '^[a-f0-9]{64}$'),
 state text NOT NULL DEFAULT 'reserved' CHECK(state IN ('reserved','verified')),
 created_at timestamptz NOT NULL DEFAULT now(),
 verified_at timestamptz,
 UNIQUE(work_id,idem_hmac),
 FOREIGN KEY(work_id,draft_generation)
  REFERENCES writers_studio_r35_draft_versions(work_id,generation) ON DELETE RESTRICT,
 CONSTRAINT r47_single_direction_state CHECK(
   (state='reserved' AND cipher_sha256 IS NULL AND verified_at IS NULL)
   OR (state='verified' AND cipher_sha256 IS NOT NULL AND verified_at IS NOT NULL)
 )
);

CREATE FUNCTION r47_review_guard() RETURNS trigger LANGUAGE plpgsql AS $r47$
BEGIN
 IF TG_OP='DELETE' THEN
  RAISE EXCEPTION 'r47_review_delete_forbidden'; END IF;
 IF TG_OP='INSERT' THEN
  IF NOT EXISTS(SELECT 1 FROM member_manuscripts m
    WHERE m.id=NEW.work_id AND m.member_id=NEW.member_id)
  THEN RAISE EXCEPTION 'r47_foreign_author_refused'; END IF;
  IF NOT EXISTS(SELECT 1 FROM writers_studio_r35_draft_versions v
    WHERE v.work_id=NEW.work_id AND v.member_id=NEW.member_id
      AND v.generation=NEW.draft_generation)
  THEN RAISE EXCEPTION 'r47_invalid_draft_revision'; END IF;
 ELSE
  IF OLD.state<>'reserved' OR NEW.state<>'verified'
     OR NEW.cipher_sha256 IS NULL OR NEW.verified_at IS NULL
     OR (to_jsonb(OLD)-'state'-'cipher_sha256'-'verified_at') IS DISTINCT FROM
        (to_jsonb(NEW)-'state'-'cipher_sha256'-'verified_at')
  THEN RAISE EXCEPTION 'r47_review_metadata_immutable'; END IF;
 END IF;
 RETURN NEW;
END $r47$;
CREATE TRIGGER writers_studio_r47_review_guard
 BEFORE INSERT OR UPDATE OR DELETE ON writers_studio_r47_private_review
 FOR EACH ROW EXECUTE FUNCTION r47_review_guard();

REVOKE ALL ON writers_studio_r47_private_review FROM PUBLIC;
COMMENT ON TABLE writers_studio_r47_private_review IS
 'Fictional-only private encrypted editorial review, intent before ciphertext, no prose in SQL; not author approval or production migration.';
