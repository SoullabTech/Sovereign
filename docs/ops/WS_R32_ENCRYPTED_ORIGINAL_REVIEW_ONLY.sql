-- R32 REVIEW ONLY — apply solely to a newly disposable fictional PostgreSQL 16 database.
-- NOT in database/migrations; no real writer route, approval, or default rollout.
-- Source text, original bytes, filename, MIME and extractor MUST NOT appear here.
DO $r32$ BEGIN
 IF current_setting('server_version_num')::integer / 10000 <> 16
 THEN RAISE EXCEPTION 'r32_pg16_required'; END IF;
END $r32$;
CREATE TABLE writers_studio_r32_held_originals (
 id uuid PRIMARY KEY,
 member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
 manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE RESTRICT,
 arrival_id uuid NOT NULL UNIQUE,
 work_generation bigint NOT NULL CHECK(work_generation>0),
 key_id uuid NOT NULL,
 work_ref text NOT NULL UNIQUE
   CHECK(work_ref ~ '^ws-beta-r32-held-source/[0-9a-f-]{36}\.enc$'),
 metadata_ref text NOT NULL UNIQUE
   CHECK(metadata_ref ~ '^ws-beta-r32-held-source/[0-9a-f-]{36}\.enc$'),
 work_sha256 char(64) NOT NULL CHECK(work_sha256 ~ '^[0-9a-f]{64}$'),
 metadata_sha256 char(64) NOT NULL CHECK(metadata_sha256 ~ '^[0-9a-f]{64}$'),
 pair_sha256 char(64) NOT NULL CHECK(pair_sha256 ~ '^[0-9a-f]{64}$'),
 state text NOT NULL DEFAULT 'held_only' CHECK(state='held_only'),
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK(work_ref<>metadata_ref),
 UNIQUE(member_id,manuscript_id,work_generation)
);
CREATE FUNCTION writers_studio_r32_owned_immutable() RETURNS trigger
LANGUAGE plpgsql AS $guard$
BEGIN
 IF TG_OP<>'INSERT' THEN RAISE EXCEPTION 'r32_immutable_source_arrival'; END IF;
 IF NOT EXISTS (SELECT 1 FROM member_manuscripts m
   WHERE m.id=NEW.manuscript_id AND m.member_id=NEW.member_id)
 THEN RAISE EXCEPTION 'r32_foreign_original_refused'; END IF;
 RETURN NEW;
END $guard$;
CREATE TRIGGER writers_studio_r32_original_immutability
 BEFORE INSERT OR UPDATE OR DELETE ON writers_studio_r32_held_originals
 FOR EACH ROW EXECUTE FUNCTION writers_studio_r32_owned_immutable();
REVOKE ALL ON writers_studio_r32_held_originals FROM PUBLIC;
COMMENT ON TABLE writers_studio_r32_held_originals IS
'Fictional-only encrypted original Source and private provenance pointers. Do not deploy.';
