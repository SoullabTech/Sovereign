-- R21 REVIEW ONLY. Apply ONLY to fresh disposable fictional PG16 fixture.
-- Not a release migration: legacy SQL columns still contain reconstructive text.
CREATE TABLE writers_studio_r21_held_revisions (
 member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
 work_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE RESTRICT,
 generation integer NOT NULL CHECK(generation >= 1),
 key_id uuid NOT NULL,
 envelope jsonb NOT NULL,
 cipher_digest text NOT NULL CHECK(cipher_digest ~ '^[0-9a-f]{64}$'),
 previous_digest text,
 state text NOT NULL CHECK(state='fictional_held_only'),
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(work_id,generation),
 CONSTRAINT r21_previous_hash_shape CHECK(previous_digest IS NULL OR
   previous_digest ~ '^[0-9a-f]{64}$'),
 CONSTRAINT r21_no_unencrypted_metadata CHECK(
   jsonb_typeof(envelope)='object' AND
   envelope ?& ARRAY['protocol','keyId','iv','tag','ciphertext']
 )
);
CREATE INDEX r21_member_work_history ON writers_studio_r21_held_revisions(member_id,work_id,generation);
CREATE FUNCTION r21_enforce_owned_immutable() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE owner_ok boolean; envelope_keys integer;
BEGIN
 IF TG_OP <> 'INSERT' THEN RAISE EXCEPTION 'r21_revision_immutable'; END IF;
 SELECT count(*) INTO envelope_keys FROM jsonb_object_keys(NEW.envelope);
 IF envelope_keys <> 5 OR
   NOT (NEW.envelope ?& ARRAY['protocol','keyId','iv','tag','ciphertext']) THEN
   RAISE EXCEPTION 'r21_unreviewed_ciphertext_metadata';
 END IF;
 SELECT true INTO owner_ok FROM member_manuscripts m
  WHERE m.id=NEW.work_id AND m.member_id=NEW.member_id
  FOR KEY SHARE;
 IF owner_ok IS NOT TRUE THEN RAISE EXCEPTION 'r21_cross_member_history'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER r21_immutable_owner BEFORE INSERT OR UPDATE OR DELETE
ON writers_studio_r21_held_revisions
FOR EACH ROW EXECUTE FUNCTION r21_enforce_owned_immutable();
REVOKE ALL ON writers_studio_r21_held_revisions FROM PUBLIC;
COMMENT ON TABLE writers_studio_r21_held_revisions IS
'Fictional R21 held-only encrypted historical writer snapshots; never authorized for real member data.';
