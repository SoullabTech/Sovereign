-- R44 REVIEW ONLY: disposable PostgreSQL 16; NOT a production migration.
-- One-use server-prepared review token; no writing, key, filename, prose,
-- browser session token or raw author approval token may be stored here.
DO $r44$ BEGIN
 IF current_setting('server_version_num')::int / 10000 <> 16
 THEN RAISE EXCEPTION 'r44_exact_postgres16_required'; END IF;
END $r44$;
CREATE TABLE writers_studio_r44_held_approval(
 token_hmac char(64) PRIMARY KEY CHECK(token_hmac ~ '^[a-f0-9]{64}$'),
 member_id uuid NOT NULL,
 work_id uuid NOT NULL,
 section_id uuid NOT NULL,
 alternative_id uuid NOT NULL,
 expected_generation bigint NOT NULL CHECK(expected_generation>0),
 session_binding_sha256 char(64) NOT NULL
   CHECK(session_binding_sha256 ~ '^[a-f0-9]{64}$'),
 notice_sha256 char(64) NOT NULL CHECK(notice_sha256 ~ '^[a-f0-9]{64}$'),
 consent_sequence bigint NOT NULL CHECK(consent_sequence>0),
 review_binding_hmac char(64) NOT NULL
   CHECK(review_binding_hmac ~ '^[a-f0-9]{64}$'),
 issued_at_ms bigint NOT NULL CHECK(issued_at_ms>0),
 expires_at_ms bigint NOT NULL,
 state text NOT NULL DEFAULT 'prepared'
   CHECK(state IN ('prepared','spent')),
 spent_at_ms bigint,
 created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT r44_fictional_owner_reference FOREIGN KEY(work_id,member_id)
   REFERENCES member_manuscripts(id,member_id) ON DELETE RESTRICT,
 CONSTRAINT r44_bounded_expiry CHECK(
   expires_at_ms>issued_at_ms AND
   expires_at_ms-issued_at_ms<=120000),
 CONSTRAINT r44_monotonic_status CHECK(
   (state='prepared' AND spent_at_ms IS NULL) OR
   (state='spent' AND spent_at_ms>=issued_at_ms AND
    spent_at_ms<expires_at_ms))
);
CREATE FUNCTION writers_studio_r44_guard() RETURNS trigger
LANGUAGE plpgsql AS $r44$
BEGIN
 IF TG_OP='DELETE' THEN
  RAISE EXCEPTION 'r44_approval_never_delete';
 END IF;
 IF TG_OP='UPDATE' THEN
   IF OLD.state<>'prepared' OR NEW.state<>'spent' OR
      NEW.spent_at_ms IS NULL OR
      (to_jsonb(NEW)-'state'-'spent_at_ms') IS DISTINCT FROM
      (to_jsonb(OLD)-'state'-'spent_at_ms')
   THEN RAISE EXCEPTION 'r44_approval_immutable';
   END IF;
 END IF;
 RETURN NEW;
END $r44$;
CREATE TRIGGER writers_studio_r44_approval_guard
 BEFORE UPDATE OR DELETE ON writers_studio_r44_held_approval
 FOR EACH ROW EXECUTE FUNCTION writers_studio_r44_guard();
REVOKE ALL ON writers_studio_r44_held_approval FROM PUBLIC;
COMMENT ON TABLE writers_studio_r44_held_approval IS
 'Held fictional-only one-use approval; HMAC token and reviewed choice only, not live author authority.';
