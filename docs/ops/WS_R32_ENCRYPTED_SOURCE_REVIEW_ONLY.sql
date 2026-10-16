-- R32 REVIEW ONLY: a synthetic owner-locked encrypted Source manifest.
-- DO NOT install into database/migrations or any production database.
-- Original DOCX/PDF/TXT/MD bytes, source prose, private filename, MIME and
-- extractor provenance are sealed inside immutable file vault, never SQL.
DO $r32$
BEGIN
 IF current_setting('server_version_num')::integer / 10000 <> 16 THEN
  RAISE EXCEPTION 'r32_pg16_fixture_required';
 END IF;
END $r32$;

CREATE TABLE writers_studio_r32_held_sources (
 id uuid PRIMARY KEY,
 member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
 work_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE RESTRICT,
 key_id uuid NOT NULL,
 cipher_ref text UNIQUE NOT NULL
   CHECK (cipher_ref ~ '^ws-beta-r32-held-source/[0-9a-f-]{36}\.enc$'),
 cipher_digest char(64) NOT NULL CHECK (cipher_digest ~ '^[a-f0-9]{64}$'),
 state text NOT NULL CHECK (state='fictional_encrypted_source_only'),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(member_id,work_id)
);

CREATE FUNCTION r32_guard_source_owner_immutability() RETURNS trigger
LANGUAGE plpgsql AS $r32$
BEGIN
 IF TG_OP <> 'INSERT' THEN RAISE EXCEPTION 'r32_held_source_immutable'; END IF;
 IF NOT EXISTS (SELECT 1 FROM member_manuscripts m
   WHERE m.id=NEW.work_id AND m.member_id=NEW.member_id FOR KEY SHARE)
 THEN RAISE EXCEPTION 'r32_foreign_work_refused'; END IF;
 RETURN NEW;
END $r32$;

CREATE TRIGGER r32_held_source_owner_immutability
 BEFORE INSERT OR UPDATE OR DELETE ON writers_studio_r32_held_sources
 FOR EACH ROW EXECUTE FUNCTION r32_guard_source_owner_immutability();

REVOKE ALL ON writers_studio_r32_held_sources FROM PUBLIC;
COMMENT ON TABLE writers_studio_r32_held_sources IS
 'R32 fictional-only encrypted Source reference and digest; no filename, author text, bytes or extractor metadata.';
