-- R47 REVIEW ONLY. Disposable PostgreSQL 16, NEVER production migrations.
-- A separately approved Undo attempt, encrypted prior version authenticated
-- by R35 and HMAC-bound to R37 Apply provenance. NO author prose or token.
DO $r47$ BEGIN
 IF current_setting('server_version_num')::int / 10000 <> 16
 THEN RAISE EXCEPTION 'r47_exact_pg16_required'; END IF;
END $r47$;
CREATE TABLE writers_studio_r47_held_undo(
 token_hmac char(64) PRIMARY KEY CHECK(token_hmac ~ '^[a-f0-9]{64}$'),
 member_id uuid NOT NULL,
 work_id uuid NOT NULL,
 applied_generation bigint NOT NULL CHECK(applied_generation>=2),
 prior_generation bigint NOT NULL CHECK(prior_generation>=1),
 section_id uuid NOT NULL, alternative_id uuid NOT NULL,
 session_binding_sha256 char(64) NOT NULL
   CHECK(session_binding_sha256 ~ '^[a-f0-9]{64}$'),
 notice_sha256 char(64) NOT NULL
   CHECK(notice_sha256 ~ '^[a-f0-9]{64}$'),
 consent_sequence bigint NOT NULL CHECK(consent_sequence>0),
 undo_binding_hmac char(64) NOT NULL
   CHECK(undo_binding_hmac ~ '^[a-f0-9]{64}$'),
 issued_at_ms bigint NOT NULL CHECK(issued_at_ms>0),
 expires_at_ms bigint NOT NULL,
 state text NOT NULL DEFAULT 'prepared' CHECK(state IN ('prepared','spent')),
 spent_at_ms bigint,
 created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT r47_immediate_prior CHECK(prior_generation=applied_generation-1),
 CONSTRAINT r47_expiry CHECK(expires_at_ms>issued_at_ms AND
   expires_at_ms-issued_at_ms<=120000),
 CONSTRAINT r47_spent_timing CHECK(
  (state='prepared' AND spent_at_ms IS NULL) OR
  (state='spent' AND spent_at_ms>=issued_at_ms AND
    spent_at_ms<expires_at_ms)),
 CONSTRAINT r47_owner FOREIGN KEY(work_id,member_id)
  REFERENCES member_manuscripts(id,member_id) ON DELETE RESTRICT,
 CONSTRAINT r47_applied FOREIGN KEY(work_id,applied_generation)
  REFERENCES writers_studio_r35_draft_versions(work_id,generation) ON DELETE RESTRICT,
 CONSTRAINT r47_previous FOREIGN KEY(work_id,prior_generation)
  REFERENCES writers_studio_r35_draft_versions(work_id,generation) ON DELETE RESTRICT
);
CREATE FUNCTION writers_studio_r47_immutability() RETURNS trigger
LANGUAGE plpgsql AS $r47$
BEGIN
 IF TG_OP='DELETE' THEN
  RAISE EXCEPTION 'r47_undo_never_delete';
 END IF;
 IF TG_OP='UPDATE' THEN
  IF OLD.state<>'prepared' OR NEW.state<>'spent' OR
     NEW.spent_at_ms IS NULL OR
     (to_jsonb(NEW)-'state'-'spent_at_ms') IS DISTINCT FROM
     (to_jsonb(OLD)-'state'-'spent_at_ms')
  THEN RAISE EXCEPTION 'r47_undo_immutable'; END IF;
 END IF;
 RETURN NEW;
END $r47$;
CREATE TRIGGER writers_studio_r47_guard
 BEFORE UPDATE OR DELETE ON writers_studio_r47_held_undo
 FOR EACH ROW EXECUTE FUNCTION writers_studio_r47_immutability();
REVOKE ALL ON writers_studio_r47_held_undo FROM PUBLIC;
COMMENT ON TABLE writers_studio_r47_held_undo IS
 'Held fictional Undo. A spent attempt is NOT a proven completed encrypted restore.';
