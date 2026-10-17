-- R66 REVIEW ONLY: isolated fictional PostgreSQL16, NOT a production migration.
-- Links one R44 durable author-attempt token HMAC to ONE verified R47
-- encrypted private editorial proposal and its immutable ciphertext digest.
-- No plaintext, raw tokens, signers, KMS keys or member-consent text in SQL.
DO $r66$ BEGIN
 IF current_setting('server_version_num')::int / 10000 <> 16
 THEN RAISE EXCEPTION 'r66_exact_postgresql16_required'; END IF;
END $r66$;

CREATE TABLE writers_studio_r66_held_private_approval_link (
 token_hmac char(64) PRIMARY KEY
   REFERENCES writers_studio_r44_held_approval(token_hmac) ON DELETE RESTRICT,
 review_id uuid NOT NULL UNIQUE
   REFERENCES writers_studio_r47_private_review(review_id) ON DELETE RESTRICT,
 member_id uuid NOT NULL,
 work_id uuid NOT NULL,
 draft_generation bigint NOT NULL CHECK (draft_generation>0),
 section_id uuid NOT NULL,
 alternative_id uuid NOT NULL,
 consent_sequence bigint NOT NULL CHECK (consent_sequence>0),
 approval_review_hmac char(64) NOT NULL
   CHECK (approval_review_hmac ~ '^[a-f0-9]{64}$'),
 private_review_hmac char(64) NOT NULL
   CHECK (private_review_hmac ~ '^[a-f0-9]{64}$'),
 private_consent_hmac char(64) NOT NULL
   CHECK (private_consent_hmac ~ '^[a-f0-9]{64}$'),
 private_cipher_sha256 char(64) NOT NULL
   CHECK (private_cipher_sha256 ~ '^[a-f0-9]{64}$'),
 link_hmac char(64) NOT NULL CHECK (link_hmac ~ '^[a-f0-9]{64}$'),
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY (work_id,member_id)
   REFERENCES member_manuscripts(id,member_id) ON DELETE RESTRICT
);

CREATE FUNCTION r66_exact_private_approval_guard() RETURNS trigger
LANGUAGE plpgsql AS $r66$
BEGIN
 IF TG_OP <> 'INSERT' THEN
  RAISE EXCEPTION 'r66_immutable_link_cannot_change';
 END IF;
 IF NOT EXISTS (
  SELECT 1
  FROM writers_studio_r44_held_approval a
  JOIN writers_studio_r47_private_review p
    ON p.review_id=NEW.review_id
  WHERE a.token_hmac=NEW.token_hmac AND a.state='prepared'
    AND a.member_id=NEW.member_id AND a.work_id=NEW.work_id
    AND a.section_id=NEW.section_id AND a.alternative_id=NEW.alternative_id
    AND a.expected_generation=NEW.draft_generation
    AND a.consent_sequence=NEW.consent_sequence
    AND a.review_binding_hmac=NEW.approval_review_hmac
    AND p.state='verified' AND p.member_id=NEW.member_id
    AND p.work_id=NEW.work_id AND p.draft_generation=NEW.draft_generation
    AND p.section_id=NEW.section_id AND p.alternative_id=NEW.alternative_id
    AND p.review_hmac=NEW.private_review_hmac
    AND p.consent_hmac=NEW.private_consent_hmac
    AND p.cipher_sha256=NEW.private_cipher_sha256
 ) THEN
  RAISE EXCEPTION 'r66_not_a_verified_exact_prepared_pair';
 END IF;
 RETURN NEW;
END $r66$;
CREATE TRIGGER writers_studio_r66_immutable_link_guard
 BEFORE INSERT OR UPDATE OR DELETE
 ON writers_studio_r66_held_private_approval_link
 FOR EACH ROW EXECUTE FUNCTION r66_exact_private_approval_guard();

REVOKE ALL ON writers_studio_r66_held_private_approval_link FROM PUBLIC;
COMMENT ON TABLE writers_studio_r66_held_private_approval_link IS
 'Held fictional R44 one-use approval to R47 AES-GCM private proposal immutable link; not live writing authorization nor an independent KMS lease.';
