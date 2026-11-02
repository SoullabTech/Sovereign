-- LOCAL CANDIDATE: first-open editorial Work provenance. Not deployed.
-- Apply only together with the qualified first-open constructor. Older writers
-- cannot create new editorial threads after this migration; they fail closed.
-- Existing threads are NOT backfilled, reparented, or deleted.
-- Origin metadata is neither current consent nor Source/disclosure authority.
BEGIN;

ALTER TABLE ask_threads ADD COLUMN IF NOT EXISTS editorial_origin_id UUID;
ALTER TABLE ask_threads ADD CONSTRAINT ask_threads_editorial_origin_binding_key
  UNIQUE (id, member_id, manuscript_id, proposal_chain_id, editorial_origin_id);
-- Redundant with id's primary key for uniqueness, but required as an exact
-- relational target for content-free Save receipts that bind thread + chain.
ALTER TABLE ask_threads ADD CONSTRAINT ask_threads_editorial_thread_chain_key
  UNIQUE (id, proposal_chain_id);
ALTER TABLE ask_threads ADD CONSTRAINT ask_threads_editorial_origin_shape
  CHECK (editorial_origin_id IS NULL OR
    (proposal_chain_id IS NOT NULL AND manuscript_id IS NOT NULL AND living_work_id IS NULL));

-- One proposal chain may own many editorial threads, but all of them must
-- share this one immutable content-free Work/A2/declaration origin. Locking the
-- proposal_chains row in the insert trigger serializes concurrent first claims.
CREATE TABLE writer_editorial_chain_origins (
  proposal_chain_id UUID PRIMARY KEY,
  member_id UUID NOT NULL,
  living_work_id UUID NOT NULL,
  manuscript_id UUID NOT NULL,
  relationship_id UUID NOT NULL,
  creation_expression_id UUID NOT NULL,
  draft_id UUID NOT NULL,
  target_section_id UUID NOT NULL,
  draft_version BIGINT NOT NULL CHECK (draft_version >= 0),
  draft_revision_count INTEGER NOT NULL CHECK (draft_revision_count >= 0),
  locus_scope_kind TEXT NOT NULL CHECK (locus_scope_kind IN ('section', 'passage')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT weco_exact_chain_fk
    FOREIGN KEY (member_id, manuscript_id, proposal_chain_id)
    REFERENCES proposal_chains (member_id, work_id, id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT weco_identity_key UNIQUE
    (proposal_chain_id, member_id, living_work_id, manuscript_id,
     relationship_id, creation_expression_id, draft_id, target_section_id,
     draft_version, draft_revision_count, locus_scope_kind)
);

CREATE INDEX weco_member_work_idx
  ON writer_editorial_chain_origins (member_id, living_work_id, manuscript_id);

CREATE TABLE writer_editorial_thread_origins (
  id UUID PRIMARY KEY,
  thread_id UUID NOT NULL UNIQUE,
  proposal_chain_id UUID NOT NULL,
  member_id UUID NOT NULL,
  living_work_id UUID NOT NULL,
  manuscript_id UUID NOT NULL,
  relationship_id UUID NOT NULL,
  creation_expression_id UUID NOT NULL,
  draft_id UUID NOT NULL,
  target_section_id UUID NOT NULL,
  draft_version BIGINT NOT NULL CHECK (draft_version >= 0),
  draft_revision_count INTEGER NOT NULL CHECK (draft_revision_count >= 0),
  locus_scope_kind TEXT NOT NULL CHECK (locus_scope_kind IN ('section', 'passage')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT weto_thread_identity_key
    UNIQUE (thread_id, member_id, manuscript_id, proposal_chain_id, id),
  CONSTRAINT weto_exact_thread_fk
    FOREIGN KEY (thread_id, member_id, manuscript_id, proposal_chain_id, id)
    REFERENCES ask_threads (id, member_id, manuscript_id, proposal_chain_id, editorial_origin_id)
    ON UPDATE RESTRICT ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT weto_exact_chain_origin_fk
    FOREIGN KEY (proposal_chain_id, member_id, living_work_id, manuscript_id,
      relationship_id, creation_expression_id, draft_id, target_section_id,
      draft_version, draft_revision_count, locus_scope_kind)
    REFERENCES writer_editorial_chain_origins
      (proposal_chain_id, member_id, living_work_id, manuscript_id,
       relationship_id, creation_expression_id, draft_id, target_section_id,
       draft_version, draft_revision_count, locus_scope_kind)
    ON UPDATE RESTRICT ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED
);

-- The two references close at COMMIT: a new thread and its exact origin either
-- both exist or neither can commit. A chain remains governed by its existing FK.
ALTER TABLE ask_threads ADD CONSTRAINT ask_threads_exact_origin_fk
  FOREIGN KEY (id, member_id, manuscript_id, proposal_chain_id, editorial_origin_id)
  REFERENCES writer_editorial_thread_origins
    (thread_id, member_id, manuscript_id, proposal_chain_id, id)
  MATCH SIMPLE ON UPDATE RESTRICT ON DELETE NO ACTION
  DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX weto_member_work_idx
  ON writer_editorial_thread_origins (member_id, living_work_id, manuscript_id);

CREATE FUNCTION writer_editorial_thread_origin_link_guard()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.editorial_origin_id IS DISTINCT FROM OLD.editorial_origin_id THEN
      RAISE EXCEPTION 'editorial_origin_link_immutable' USING ERRCODE = '23514';
    END IF;
  ELSIF NEW.proposal_chain_id IS NOT NULL AND NEW.editorial_origin_id IS NULL THEN
    RAISE EXCEPTION 'editorial_origin_required_at_first_open' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER ask_threads_editorial_origin_link_guard
  BEFORE INSERT OR UPDATE ON ask_threads
  FOR EACH ROW EXECUTE FUNCTION writer_editorial_thread_origin_link_guard();

CREATE FUNCTION writer_editorial_thread_origin_validate_insert()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  chain_origin writer_editorial_chain_origins%ROWTYPE;
BEGIN
  -- Same ordering as current relationship custody: Work, manuscript,
  -- exact original declaration, A2 parent. SHARE also fences non-key edits.
  PERFORM 1 FROM living_works
    WHERE id = NEW.living_work_id AND member_id = NEW.member_id FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'editorial_origin_unavailable' USING ERRCODE = '23514';
  END IF;
  PERFORM 1 FROM member_manuscripts
    WHERE id = NEW.manuscript_id AND member_id = NEW.member_id FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'editorial_origin_unavailable' USING ERRCODE = '23514';
  END IF;
  PERFORM 1 FROM living_work_expressions
    WHERE id = NEW.creation_expression_id
      AND living_work_id = NEW.living_work_id
      AND expression_type = 'manuscript' AND expression_id = NEW.manuscript_id
      AND declared_by = NEW.member_id FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'editorial_origin_unavailable' USING ERRCODE = '23514';
  END IF;
  PERFORM 1 FROM writer_editorial_relationships
    WHERE id = NEW.relationship_id AND member_id = NEW.member_id
      AND living_work_id = NEW.living_work_id AND manuscript_id = NEW.manuscript_id
      AND creation_expression_id = NEW.creation_expression_id
      AND contract_version = 'A2-1' FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'editorial_origin_unavailable' USING ERRCODE = '23514';
  END IF;

  -- Serialize every first or later origin claim for this immutable chain.
  -- No author text, model text, expected_text, consent body or provider data is
  -- selected. Concurrent Work A/Work B claims cannot both observe no parent.
  PERFORM 1 FROM proposal_chains pc
    WHERE pc.id = NEW.proposal_chain_id
      AND pc.member_id = NEW.member_id AND pc.work_id = NEW.manuscript_id
      AND pc.draft_id = NEW.draft_id AND pc.target_section_id = NEW.target_section_id
      AND pc.base_version = NEW.draft_revision_count
      AND pc.locus_scope_kind = NEW.locus_scope_kind
    FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'editorial_origin_unavailable' USING ERRCODE = '23514';
  END IF;

  INSERT INTO writer_editorial_chain_origins
    (proposal_chain_id, member_id, living_work_id, manuscript_id,
     relationship_id, creation_expression_id, draft_id, target_section_id,
     draft_version, draft_revision_count, locus_scope_kind)
  VALUES
    (NEW.proposal_chain_id, NEW.member_id, NEW.living_work_id, NEW.manuscript_id,
     NEW.relationship_id, NEW.creation_expression_id, NEW.draft_id,
     NEW.target_section_id, NEW.draft_version, NEW.draft_revision_count,
     NEW.locus_scope_kind)
  ON CONFLICT (proposal_chain_id) DO NOTHING;

  SELECT * INTO chain_origin
    FROM writer_editorial_chain_origins
    WHERE proposal_chain_id = NEW.proposal_chain_id
    FOR UPDATE;
  IF NOT FOUND
     OR chain_origin.member_id IS DISTINCT FROM NEW.member_id
     OR chain_origin.living_work_id IS DISTINCT FROM NEW.living_work_id
     OR chain_origin.manuscript_id IS DISTINCT FROM NEW.manuscript_id
     OR chain_origin.relationship_id IS DISTINCT FROM NEW.relationship_id
     OR chain_origin.creation_expression_id IS DISTINCT FROM NEW.creation_expression_id
     OR chain_origin.draft_id IS DISTINCT FROM NEW.draft_id
     OR chain_origin.target_section_id IS DISTINCT FROM NEW.target_section_id
     OR chain_origin.draft_version IS DISTINCT FROM NEW.draft_version
     OR chain_origin.draft_revision_count IS DISTINCT FROM NEW.draft_revision_count
     OR chain_origin.locus_scope_kind IS DISTINCT FROM NEW.locus_scope_kind THEN
    RAISE EXCEPTION 'editorial_chain_origin_mismatch' USING ERRCODE = '23514';
  END IF;

  PERFORM 1 FROM ask_threads th
    WHERE th.id = NEW.thread_id AND th.member_id = NEW.member_id
      AND th.manuscript_id = NEW.manuscript_id AND th.living_work_id IS NULL
      AND th.proposal_chain_id = NEW.proposal_chain_id AND th.editorial_origin_id = NEW.id
    FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'editorial_origin_unavailable' USING ERRCODE = '23514';
  END IF;
  PERFORM 1 FROM manuscript_working_drafts d
    JOIN manuscript_draft_sections s ON s.draft_id = d.id
    WHERE d.id = NEW.draft_id AND d.member_id = NEW.member_id
      AND d.manuscript_id = NEW.manuscript_id AND s.id = NEW.target_section_id
      AND d.version = NEW.draft_version AND d.revision_count = NEW.draft_revision_count
    FOR SHARE OF d, s;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'editorial_origin_unavailable' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER weto_validate_insert BEFORE INSERT ON writer_editorial_thread_origins
  FOR EACH ROW EXECUTE FUNCTION writer_editorial_thread_origin_validate_insert();

CREATE FUNCTION writer_editorial_chain_origin_preserve()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'editorial_chain_origin_immutable' USING ERRCODE = '23514';
END;
$$;
CREATE TRIGGER weco_preserve BEFORE UPDATE OR DELETE ON writer_editorial_chain_origins
  FOR EACH ROW EXECUTE FUNCTION writer_editorial_chain_origin_preserve();

CREATE FUNCTION writer_editorial_thread_origin_preserve()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'editorial_origin_immutable' USING ERRCODE = '23514';
  END IF;
  -- Delete the governed thread first. Its cascade removes metadata, never
  -- another conversation. Direct delete/reinsert cannot rewrite a live origin.
  IF EXISTS (SELECT 1 FROM ask_threads WHERE id = OLD.thread_id) THEN
    RAISE EXCEPTION 'editorial_origin_live_thread_retained' USING ERRCODE = '23514';
  END IF;
  RETURN OLD;
END;
$$;
CREATE TRIGGER weto_preserve BEFORE UPDATE OR DELETE ON writer_editorial_thread_origins
  FOR EACH ROW EXECUTE FUNCTION writer_editorial_thread_origin_preserve();

-- Content-free durable idempotency receipt for the writer's explicit Save.
-- The authored wording remains only in proposal_versions; replay compares that
-- canonical row under current Work/A2 authority instead of storing a digest of
-- private prose here.
CREATE TABLE writer_editorial_save_receipts (
  member_id UUID NOT NULL,
  idempotency_key UUID NOT NULL,
  relationship_id UUID NOT NULL
    REFERENCES writer_editorial_relationships(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL,
  proposal_chain_id UUID NOT NULL,
  proposal_version_id UUID NOT NULL,
  target_section_id UUID NOT NULL,
  supersedes UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (member_id, idempotency_key),
  CONSTRAINT wesr_thread_chain_fk
    FOREIGN KEY (thread_id, proposal_chain_id)
    REFERENCES ask_threads(id, proposal_chain_id)
    ON UPDATE RESTRICT ON DELETE CASCADE,
  CONSTRAINT wesr_chain_version_fk
    FOREIGN KEY (proposal_chain_id, proposal_version_id)
    REFERENCES proposal_versions(chain_id, id)
    ON UPDATE RESTRICT ON DELETE CASCADE,
  CONSTRAINT wesr_one_receipt_per_version UNIQUE (proposal_version_id),
  CONSTRAINT wesr_not_self_superseding CHECK (supersedes IS NULL OR supersedes <> proposal_version_id)
);

CREATE FUNCTION writer_editorial_save_receipt_preserve()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'editorial_save_receipt_immutable' USING ERRCODE = '23514';
END;
$$;
CREATE TRIGGER wesr_preserve BEFORE UPDATE ON writer_editorial_save_receipts
  FOR EACH ROW EXECUTE FUNCTION writer_editorial_save_receipt_preserve();

COMMENT ON TABLE writer_editorial_chain_origins IS
  'Content-free immutable proposal-chain to first Work/A2/declaration provenance. One chain may have many threads only inside this exact origin.';
COMMENT ON COLUMN writer_editorial_chain_origins.creation_expression_id IS
  'Original declaration epoch. Retained provenance; never a standing grant after withdrawal or redeclaration.';
COMMENT ON TABLE writer_editorial_save_receipts IS
  'Content-free idempotency receipts for explicit member-authored editorial Save; private wording remains in proposal_versions.';
COMMENT ON COLUMN writer_editorial_save_receipts.idempotency_key IS
  'Client-stable UUID for one explicit Save gesture. Reuse is lawful only when canonical stored wording and coordinates match exactly.';
COMMENT ON TABLE writer_editorial_thread_origins IS
  'Content-free immutable first-open editorial provenance. Not consent, Source access, model dispatch or restore authority. No legacy backfill.';
COMMENT ON COLUMN ask_threads.editorial_origin_id IS
  'First-open-only editorial origin. NULL historical threads stay unproved; never attach them to a Work later.';
COMMENT ON COLUMN writer_editorial_thread_origins.creation_expression_id IS
  'Original declaration identity, not a current grant. No FK: withdrawal/redeclaration must remain possible without rewriting retained origin.';
COMMENT ON COLUMN writer_editorial_thread_origins.living_work_id IS
  'Originating LivingWork, not proposal_chains.work_id (which denotes manuscript). No Work/A2 cascade can reparent retained conversation history.';
COMMENT ON COLUMN writer_editorial_thread_origins.draft_version IS
  'Verified working-draft version at first open. Not an encrypted Source artifact receipt or permission for later reads.';
COMMIT;

-- Pre-admission rehearsal rollback ONLY when the origin table is empty:
-- BEGIN;
-- DROP TRIGGER ask_threads_editorial_origin_link_guard ON ask_threads;
-- ALTER TABLE ask_threads DROP CONSTRAINT ask_threads_exact_origin_fk;
-- DROP TABLE writer_editorial_thread_origins;
-- DROP TRIGGER wesr_preserve ON writer_editorial_save_receipts;
-- DROP FUNCTION writer_editorial_save_receipt_preserve();
-- DROP TABLE writer_editorial_save_receipts;
-- DROP TRIGGER weco_preserve ON writer_editorial_chain_origins;
-- DROP TABLE writer_editorial_chain_origins;
-- ALTER TABLE ask_threads DROP CONSTRAINT ask_threads_editorial_origin_shape;
-- ALTER TABLE ask_threads DROP CONSTRAINT ask_threads_editorial_thread_chain_key;
-- ALTER TABLE ask_threads DROP CONSTRAINT ask_threads_editorial_origin_binding_key;
-- ALTER TABLE ask_threads DROP COLUMN editorial_origin_id;
-- DROP FUNCTION writer_editorial_thread_origin_link_guard();
-- DROP FUNCTION writer_editorial_thread_origin_validate_insert();
-- DROP FUNCTION writer_editorial_chain_origin_preserve();
-- DROP FUNCTION writer_editorial_thread_origin_preserve();
-- COMMIT;
-- After admission, retain schema/origins on application rollback. Do not erase
-- provenance to make an older writer run. R20 restore/tombstones remain separate.
