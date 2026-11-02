-- R20 Writer editorial erasure — constitutional deletion is a separate authority.
-- Ordinary editorial history remains append-only. Only a transaction presenting
-- an actual member-deletion manifest whose tombstone names the chain's manuscript
-- may delete private editorial history. Governed restore uses the same authority.
BEGIN;

CREATE OR REPLACE FUNCTION r20_writer_chain_erasure_allowed(p_chain_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  manifest_text text;
  manifest_id uuid;
BEGIN
  manifest_text := current_setting('soullab.r20.writer_erasure_manifest', true);
  IF manifest_text IS NULL OR manifest_text = '' THEN RETURN false; END IF;
  BEGIN manifest_id := manifest_text::uuid;
  EXCEPTION WHEN invalid_text_representation THEN RETURN false;
  END;

  RETURN EXISTS (
    SELECT 1
      FROM proposal_chains c
      JOIN deletion_manifests m
        ON m.id = manifest_id
       AND m.reason_class = 'member_deletion'
      JOIN provenance_tombstones t
        ON t.manifest_id = m.id
       AND t.object_kind = 'member_manuscripts'
       AND t.object_id = c.work_id::text
     WHERE c.id = p_chain_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION r20_writer_authorization_erasure_allowed(p_authorization_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM manuscript_revision_authorizations a
     WHERE a.id = p_authorization_id
       AND r20_writer_chain_erasure_allowed(a.proposal_chain_id)
  );
$$;

-- Preserve Step-1 append-only law for every ordinary operation. Constitutional
-- erasure is the only DELETE exception and requires the verified R20 authority.
CREATE OR REPLACE FUNCTION refuse_proposal_version_mutation()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' AND r20_writer_chain_erasure_allowed(OLD.chain_id) THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION
    'proposal_versions is append-only: an authored formulation is finished (attempted %)',
    TG_OP
    USING ERRCODE = 'check_violation';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION refuse_proposal_chain_mutation()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' AND r20_writer_chain_erasure_allowed(OLD.id) THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION
    'proposal_chains is append-only: the chain does not evolve, only its versions do (attempted %)',
    TG_OP
    USING ERRCODE = 'check_violation';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION authored_editorial_record_immutable()
RETURNS TRIGGER AS $$
DECLARE
  chain_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    chain_id := (to_jsonb(OLD) ->> 'proposal_chain_id')::uuid;
    IF r20_writer_chain_erasure_allowed(chain_id) THEN RETURN OLD; END IF;
  END IF;
  RAISE EXCEPTION
    'authored editorial record %.% is immutable: a correction is a new record, never a revision of one already authored',
    TG_TABLE_NAME, OLD.id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION refuse_mra_identity_mutation()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF r20_writer_chain_erasure_allowed(OLD.proposal_chain_id) THEN RETURN OLD; END IF;
    RAISE EXCEPTION
      'an authorization is a durable record of a member act and is not deleted'
      USING ERRCODE = 'check_violation';
  END IF;

  IF NEW.id                  IS DISTINCT FROM OLD.id
     OR NEW.member_id           IS DISTINCT FROM OLD.member_id
     OR NEW.proposal_chain_id   IS DISTINCT FROM OLD.proposal_chain_id
     OR NEW.proposal_version_id IS DISTINCT FROM OLD.proposal_version_id
     OR NEW.work_id             IS DISTINCT FROM OLD.work_id
     OR NEW.draft_id            IS DISTINCT FROM OLD.draft_id
     OR NEW.base_version        IS DISTINCT FROM OLD.base_version
     OR NEW.target_section_id   IS DISTINCT FROM OLD.target_section_id
     OR NEW.expected_text       IS DISTINCT FROM OLD.expected_text
     OR NEW.operation           IS DISTINCT FROM OLD.operation
     OR NEW.authorized_at       IS DISTINCT FROM OLD.authorized_at THEN
    RAISE EXCEPTION
      'the identity and execution binding of an authorization are immutable: what the member authorized cannot be relabelled afterwards'
      USING ERRCODE = 'check_violation';
  END IF;
  IF OLD.accepted_at IS NULL AND NEW.accepted_at IS NOT NULL THEN RETURN NEW; END IF;
  RAISE EXCEPTION
    'an authorization permits one change, once: its receipt may only move from unspent to spent (attempted accepted_at % -> %)',
    OLD.accepted_at, NEW.accepted_at
    USING ERRCODE = 'check_violation';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION protect_application_recovery()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF r20_writer_authorization_erasure_allowed(OLD.authorization_id) THEN RETURN OLD; END IF;
    RAISE EXCEPTION 'application recovery is historical';
  END IF;
  IF NEW.authorization_id IS DISTINCT FROM OLD.authorization_id
    OR NEW.before_body IS DISTINCT FROM OLD.before_body
    OR NEW.after_body IS DISTINCT FROM OLD.after_body
    OR OLD.undone_at IS NOT NULL
    OR NEW.undone_at IS NULL OR NEW.resulting_version IS NULL THEN
    RAISE EXCEPTION 'only one complete undo receipt may be added';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION writer_editorial_chain_origin_preserve()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' AND r20_writer_chain_erasure_allowed(OLD.proposal_chain_id) THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'editorial_chain_origin_immutable' USING ERRCODE = '23514';
END;
$$;

-- Delete every private editorial object attached to a manuscript only under a
-- matching manifest+tombstone. The root manuscript may already be gone on live
-- erase; during governed replacement restore it is still present until sweep.
CREATE OR REPLACE FUNCTION r20_erase_writer_editorial_history(
  p_manifest_id uuid,
  p_member_id uuid,
  p_manuscript_id uuid
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  chain record;
  n integer;
  total integer := 0;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM deletion_manifests m
    JOIN provenance_tombstones t
      ON t.manifest_id=m.id
     AND t.object_kind='member_manuscripts'
     AND t.object_id=p_manuscript_id::text
    WHERE m.id=p_manifest_id AND m.reason_class='member_deletion'
  ) THEN
    RAISE EXCEPTION 'r20_writer_erasure_authority_missing' USING ERRCODE='23514';
  END IF;

  IF EXISTS (SELECT 1 FROM member_manuscripts WHERE id=p_manuscript_id)
     AND current_setting('s5.restore_lane', true) IS DISTINCT FROM 'governed' THEN
    RAISE EXCEPTION 'r20_writer_erasure_requires_deleted_root_or_restore_lane' USING ERRCODE='23514';
  END IF;

  PERFORM set_config('soullab.r20.writer_erasure_manifest', p_manifest_id::text, true);

  FOR chain IN
    SELECT id FROM proposal_chains
     WHERE member_id=p_member_id AND work_id=p_manuscript_id
     ORDER BY opened_at, id
     FOR UPDATE
  LOOP
    -- Threads go first: their cascades remove turn bindings, thread origins and
    -- Save receipts. Recovery snapshots may still contain them.
    DELETE FROM ask_threads
     WHERE member_id=p_member_id
       AND manuscript_id=p_manuscript_id
       AND proposal_chain_id=chain.id;
    GET DIAGNOSTICS n = ROW_COUNT; total := total+n;

    -- Private recovery snapshots reference authorizations with RESTRICT.
    DELETE FROM manuscript_application_recovery r
     USING manuscript_revision_authorizations a
     WHERE r.authorization_id=a.id
       AND a.proposal_chain_id=chain.id;
    GET DIAGNOSTICS n = ROW_COUNT; total := total+n;

    DELETE FROM manuscript_revision_authorizations
     WHERE member_id=p_member_id AND proposal_chain_id=chain.id;
    GET DIAGNOSTICS n = ROW_COUNT; total := total+n;

    DELETE FROM proposal_chain_directions
     WHERE member_id=p_member_id AND proposal_chain_id=chain.id;
    GET DIAGNOSTICS n = ROW_COUNT; total := total+n;

    DELETE FROM proposal_chain_insights
     WHERE member_id=p_member_id AND proposal_chain_id=chain.id;
    GET DIAGNOSTICS n = ROW_COUNT; total := total+n;

    DELETE FROM writer_editorial_chain_origins
     WHERE proposal_chain_id=chain.id
       AND member_id=p_member_id
       AND manuscript_id=p_manuscript_id;
    GET DIAGNOSTICS n = ROW_COUNT; total := total+n;

    -- Supersession is a self-RESTRICT FK. Remove leaves until the root remains.
    LOOP
      DELETE FROM proposal_versions v
       WHERE v.chain_id=chain.id
         AND NOT EXISTS (
           SELECT 1 FROM proposal_versions child
            WHERE child.chain_id=chain.id AND child.supersedes=v.id
         );
      GET DIAGNOSTICS n = ROW_COUNT;
      total := total+n;
      EXIT WHEN NOT EXISTS (SELECT 1 FROM proposal_versions WHERE chain_id=chain.id);
      IF n=0 THEN
        RAISE EXCEPTION 'r20_writer_version_erasure_stalled chain=%', chain.id USING ERRCODE='23514';
      END IF;
    END LOOP;

    DELETE FROM proposal_chains
     WHERE id=chain.id AND member_id=p_member_id AND work_id=p_manuscript_id;
    GET DIAGNOSTICS n = ROW_COUNT; total := total+n;
  END LOOP;

  IF EXISTS (
    SELECT 1 FROM proposal_chains
     WHERE member_id=p_member_id AND work_id=p_manuscript_id
  ) THEN
    RAISE EXCEPTION 'r20_writer_editorial_history_remaining' USING ERRCODE='23514';
  END IF;
  RETURN total;
END;
$$;

-- Replacement recovery calls this BEFORE the generic root tombstone sweep. The
-- old database still supplies member identity; the imported external ledger
-- supplies the newer deletion authority.
CREATE OR REPLACE FUNCTION r20_sweep_writer_editorial_tombstones()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  t record;
  member_id uuid;
  n integer;
  total integer := 0;
BEGIN
  IF current_setting('s5.restore_lane', true) IS DISTINCT FROM 'governed' THEN
    RAISE EXCEPTION 'r20_writer_restore_sweep_requires_governed_lane' USING ERRCODE='23514';
  END IF;

  FOR t IN
    SELECT p.manifest_id, p.object_id::uuid AS manuscript_id
      FROM provenance_tombstones p
     WHERE p.object_kind='member_manuscripts'
     ORDER BY p.tombstoned_at, p.object_id
  LOOP
    SELECT m.member_id INTO member_id
      FROM member_manuscripts m WHERE m.id=t.manuscript_id;
    IF member_id IS NULL THEN
      SELECT c.member_id INTO member_id
        FROM proposal_chains c WHERE c.work_id=t.manuscript_id LIMIT 1;
    END IF;
    IF member_id IS NULL THEN CONTINUE; END IF;

    n := r20_erase_writer_editorial_history(
      t.manifest_id, member_id, t.manuscript_id
    );
    total := total+n;
  END LOOP;
  RETURN total;
END;
$$;

COMMENT ON FUNCTION r20_erase_writer_editorial_history(uuid,uuid,uuid) IS
'R20 constitutional erasure of private Writer editorial history. Requires a real member-deletion manifest+tombstone and does not weaken ordinary append-only semantics.';
COMMIT;
