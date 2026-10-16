-- R23 REVIEW ONLY. Disposable fictional PostgreSQL 16 fixture.
-- Deliberately kept out of database/migrations: real writer release remains OFF.
-- This table stores references/digests to encrypted file-vault ciphertext ONLY.
DO $r23$
BEGIN
  IF current_setting('server_version_num')::integer / 10000 <> 16 THEN
    RAISE EXCEPTION 'r23_postgres16_required';
  END IF;
END $r23$;

CREATE TABLE writers_studio_r23_held_history (
  id uuid PRIMARY KEY,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE RESTRICT,
  work_generation bigint NOT NULL CHECK (work_generation > 0),
  key_id uuid NOT NULL,
  cipher_ref text NOT NULL UNIQUE
    CHECK (cipher_ref ~ '^ws-beta-r23-held-history/[0-9a-f-]{36}\.enc$'),
  cipher_sha256 char(64) NOT NULL
    CHECK (cipher_sha256 ~ '^[a-f0-9]{64}$'),
  previous_sha256 char(64) CHECK (previous_sha256 IS NULL OR previous_sha256 ~ '^[a-f0-9]{64}$'),
  state text NOT NULL DEFAULT 'held_only'
    CHECK (state='held_only'),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (member_id,manuscript_id,work_generation)
);

CREATE FUNCTION writers_studio_r23_held_guard() RETURNS trigger
LANGUAGE plpgsql AS $r23$
BEGIN
  IF TG_OP <> 'INSERT' THEN RAISE EXCEPTION 'r23_history_immutable'; END IF;
  IF NEW.work_generation=1 AND NEW.previous_sha256 IS NOT NULL THEN
    RAISE EXCEPTION 'r23_first_revision_has_predecessor';
  END IF;
  IF NEW.work_generation>1 AND NOT EXISTS (
    SELECT 1 FROM writers_studio_r23_held_history p
    WHERE p.manuscript_id=NEW.manuscript_id AND p.member_id=NEW.member_id
      AND p.work_generation=NEW.work_generation-1
      AND p.cipher_sha256=NEW.previous_sha256
  ) THEN RAISE EXCEPTION 'r23_missing_or_changed_predecessor'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM member_manuscripts m
      WHERE m.id=NEW.manuscript_id AND m.member_id=NEW.member_id
  ) THEN RAISE EXCEPTION 'r23_history_owner_refused'; END IF;
  RETURN NEW;
END $r23$;
CREATE TRIGGER writers_studio_r23_history_guard
  BEFORE INSERT OR UPDATE OR DELETE
  ON writers_studio_r23_held_history
  FOR EACH ROW EXECUTE FUNCTION writers_studio_r23_held_guard();
REVOKE ALL ON writers_studio_r23_held_history FROM PUBLIC;
COMMENT ON TABLE writers_studio_r23_held_history IS
  'R23 canonical candidate SQL pointer-only vault history, disabled and fictional-only. Prior digest chained.';
