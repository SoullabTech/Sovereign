-- R79 DISPOSABLE FICTIONAL ONLY: immutable exact source span for a sealed
-- pending candidate. Never a production migration or a proposal publication.
-- No manuscript prose appears in this table, only byte-derived SHA-256.
BEGIN;
CREATE TABLE ws_r79_fixture_private_passage (
 pending_version_id uuid PRIMARY KEY REFERENCES
   ws_r76_fixture_pending_private(reserved_version_id) ON DELETE RESTRICT,
 member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
 manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,
 draft_id uuid NOT NULL REFERENCES manuscript_working_drafts(id) ON DELETE CASCADE,
 section_id uuid NOT NULL REFERENCES manuscript_draft_sections(id) ON DELETE CASCADE,
 base_version bigint NOT NULL CHECK(base_version>=1),
 passage_start integer NOT NULL CHECK(passage_start>=0),
 passage_end integer NOT NULL CHECK(passage_end>passage_start
   AND passage_end-passage_start<=1200),
 passage_sha256 char(64) NOT NULL CHECK(passage_sha256~'^[a-f0-9]{64}$'),
 section_body_sha256 char(64) NOT NULL CHECK(section_body_sha256~'^[a-f0-9]{64}$'),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE OR REPLACE FUNCTION ws_r79_immutable_exact_locus()
RETURNS trigger LANGUAGE plpgsql AS $r79$
BEGIN
 IF TG_OP <> 'INSERT' THEN
   RAISE EXCEPTION 'R79 fictional exact passage binding immutable';
 END IF;
 IF NOT EXISTS (
  SELECT 1 FROM ws_r76_fixture_pending_private p
    JOIN manuscript_working_drafts d ON d.id=p.draft_id
    JOIN manuscript_draft_sections s ON s.id=p.section_id AND s.draft_id=d.id
   WHERE p.reserved_version_id=NEW.pending_version_id
     AND p.member_id=NEW.member_id AND p.manuscript_id=NEW.manuscript_id
     AND p.draft_id=NEW.draft_id AND p.section_id=NEW.section_id
     AND p.base_version=NEW.base_version AND d.version=NEW.base_version
 ) THEN
   RAISE EXCEPTION 'R79 pending proposal is not bound to exact owned current section';
 END IF;
 RETURN NEW;
END $r79$;
CREATE TRIGGER ws_r79_exact_passage_immutable
 BEFORE INSERT OR UPDATE OR DELETE ON ws_r79_fixture_private_passage
 FOR EACH ROW EXECUTE FUNCTION ws_r79_immutable_exact_locus();
REVOKE ALL ON ws_r79_fixture_private_passage FROM PUBLIC;
COMMENT ON TABLE ws_r79_fixture_private_passage IS
 'Synthetic only, no plaintext, never Apply authority; authenticates an exact current source locus for a server-sealed candidate.';
COMMIT;
