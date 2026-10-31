-- lock-timeout: exempt already applied in production before reaching canonical; SQL left unchanged so the file matches what ran (reconciled 2026-10-31)
-- R20 Writer editorial constitutional erasure.
--
-- Proposal chains, authored versions, directions, insights, authorizations and
-- first-open provenance are intentionally outside ordinary manuscript cascades.
-- That is correct during ordinary lifecycle and incorrect after the verified
-- member has ended Soullab's custody of the manuscript. This function is the
-- separate, narrow constitutional authority those schemas explicitly require.
--
-- It may run only after the SAME transaction has:
--   1. deleted the exact member_manuscripts row;
--   2. created a member_deletion manifest; and
--   3. tombstoned that exact member_manuscripts id under that manifest.
--
-- Foreign-key and constraint triggers remain active. Seven USER triggers that
-- enforce ordinary-history immutability are disabled under AccessExclusive
-- table locks only for the bounded deletion block, then re-enabled before the
-- function returns. The EXCEPTION block makes the block a PostgreSQL
-- subtransaction: any failure rolls back both row deletion and trigger state.

BEGIN;

-- PostgreSQL cannot change a function return type through CREATE OR REPLACE.
-- The production predecessor has the same identity arguments and returns INTEGER;
-- this migration replaces it with the content-free JSONB receipt below. No database
-- object depends on the predecessor, and the enclosing transaction makes the swap atomic.
DROP FUNCTION IF EXISTS public.r20_erase_writer_editorial_history(UUID, UUID, UUID);

CREATE OR REPLACE FUNCTION public.r20_erase_writer_editorial_history(
  p_manifest_id UUID,
  p_member_id UUID,
  p_manuscript_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $fn$
DECLARE
  v_chain_ids UUID[] := ARRAY[]::UUID[];
  v_step INTEGER := 0;
  v_thread_origins INTEGER := 0;
  v_receipts INTEGER := 0;
  v_bindings INTEGER := 0;
  v_chain_origins INTEGER := 0;
  v_recovery INTEGER := 0;
  v_authorizations INTEGER := 0;
  v_insights INTEGER := 0;
  v_directions INTEGER := 0;
  v_versions INTEGER := 0;
  v_chains INTEGER := 0;
BEGIN
  IF p_manifest_id IS NULL OR p_member_id IS NULL OR p_manuscript_id IS NULL THEN
    RAISE EXCEPTION 'r20_writer_editorial_invalid_identity' USING ERRCODE = '22023';
  END IF;

  -- Serialize this exact erasure lineage with any concurrent retry.
  PERFORM pg_advisory_xact_lock(
    hashtextextended(
      'soullab:r20:writer-editorial:' || p_member_id::TEXT || ':' || p_manuscript_id::TEXT,
      0
    )
  );

  -- The ordinary manuscript deletion must already have completed in this exact
  -- transaction. The function never becomes an alternate manuscript delete API.
  IF EXISTS (
    SELECT 1 FROM public.member_manuscripts
     WHERE id = p_manuscript_id
  ) THEN
    RAISE EXCEPTION 'r20_writer_editorial_manuscript_still_present' USING ERRCODE = '23514';
  END IF;

  IF NOT EXISTS (
    SELECT 1
      FROM public.deletion_manifests m
     WHERE m.id = p_manifest_id
       AND m.reason_class = 'member_deletion'
       AND m.executed_at IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'r20_writer_editorial_manifest_required' USING ERRCODE = '23514';
  END IF;

  IF NOT EXISTS (
    SELECT 1
      FROM public.provenance_tombstones t
     WHERE t.manifest_id = p_manifest_id
       AND t.object_kind = 'member_manuscripts'
       AND t.object_id = p_manuscript_id::TEXT
  ) THEN
    RAISE EXCEPTION 'r20_writer_editorial_tombstone_required' USING ERRCODE = '23514';
  END IF;

  -- A bare work_id is deliberate historical architecture. Refuse rather than
  -- erase if the same manuscript id is claimed by another member's chain.
  IF EXISTS (
    SELECT 1 FROM public.proposal_chains
     WHERE work_id = p_manuscript_id
       AND member_id <> p_member_id
  ) THEN
    RAISE EXCEPTION 'r20_writer_editorial_foreign_chain_refused' USING ERRCODE = '23514';
  END IF;

  -- Lock every exact chain before taking the immutable-history table locks.
  PERFORM 1
    FROM public.proposal_chains
   WHERE member_id = p_member_id
     AND work_id = p_manuscript_id
   ORDER BY id
   FOR UPDATE;

  SELECT COALESCE(array_agg(id ORDER BY id), ARRAY[]::UUID[])
    INTO v_chain_ids
    FROM public.proposal_chains
   WHERE member_id = p_member_id
     AND work_id = p_manuscript_id;

  -- Ordinary cascade must have removed the live conversations and A2 container.
  -- Constitutional erasure only removes the retained authored lineage.
  IF EXISTS (
    SELECT 1 FROM public.ask_threads
     WHERE manuscript_id = p_manuscript_id
        OR proposal_chain_id = ANY(v_chain_ids)
  ) THEN
    RAISE EXCEPTION 'r20_writer_editorial_live_thread_refused' USING ERRCODE = '23514';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.writer_editorial_relationships
     WHERE manuscript_id = p_manuscript_id
  ) THEN
    RAISE EXCEPTION 'r20_writer_editorial_live_relationship_refused' USING ERRCODE = '23514';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.manuscript_revision_offers
     WHERE manuscript_id = p_manuscript_id
  ) THEN
    RAISE EXCEPTION 'r20_writer_editorial_live_offer_refused' USING ERRCODE = '23514';
  END IF;

  -- Refuse malformed retained provenance rather than deleting across identities.
  IF EXISTS (
    SELECT 1 FROM public.writer_editorial_chain_origins o
     WHERE o.proposal_chain_id = ANY(v_chain_ids)
       AND (o.member_id <> p_member_id OR o.manuscript_id <> p_manuscript_id)
  ) OR EXISTS (
    SELECT 1 FROM public.writer_editorial_thread_origins o
     WHERE o.proposal_chain_id = ANY(v_chain_ids)
       AND (o.member_id <> p_member_id OR o.manuscript_id <> p_manuscript_id)
  ) THEN
    RAISE EXCEPTION 'r20_writer_editorial_origin_mismatch' USING ERRCODE = '23514';
  END IF;

  BEGIN
    -- USER triggers only. Foreign keys and all constraint triggers stay enabled.
    EXECUTE 'ALTER TABLE public.manuscript_application_recovery DISABLE TRIGGER application_recovery_immutable';
    EXECUTE 'ALTER TABLE public.manuscript_revision_authorizations DISABLE TRIGGER mra_identity_immutable';
    EXECUTE 'ALTER TABLE public.proposal_chain_insights DISABLE TRIGGER proposal_chain_insights_no_delete';
    EXECUTE 'ALTER TABLE public.proposal_chain_directions DISABLE TRIGGER proposal_chain_directions_no_delete';
    EXECUTE 'ALTER TABLE public.proposal_versions DISABLE TRIGGER proposal_versions_immutable';
    EXECUTE 'ALTER TABLE public.proposal_chains DISABLE TRIGGER proposal_chains_immutable';
    EXECUTE 'ALTER TABLE public.writer_editorial_chain_origins DISABLE TRIGGER weco_preserve';

    DELETE FROM public.writer_editorial_save_receipts
     WHERE proposal_chain_id = ANY(v_chain_ids);
    GET DIAGNOSTICS v_receipts = ROW_COUNT;

    DELETE FROM public.editorial_turn_bindings
     WHERE proposal_chain_id = ANY(v_chain_ids);
    GET DIAGNOSTICS v_bindings = ROW_COUNT;

    -- ask_threads is already gone; its origin trigger therefore permits removal.
    DELETE FROM public.writer_editorial_thread_origins
     WHERE proposal_chain_id = ANY(v_chain_ids);
    GET DIAGNOSTICS v_thread_origins = ROW_COUNT;

    DELETE FROM public.manuscript_application_recovery r
     USING public.manuscript_revision_authorizations a
     WHERE r.authorization_id = a.id
       AND a.proposal_chain_id = ANY(v_chain_ids);
    GET DIAGNOSTICS v_recovery = ROW_COUNT;

    DELETE FROM public.manuscript_revision_authorizations
     WHERE proposal_chain_id = ANY(v_chain_ids);
    GET DIAGNOSTICS v_authorizations = ROW_COUNT;

    DELETE FROM public.proposal_chain_insights
     WHERE proposal_chain_id = ANY(v_chain_ids);
    GET DIAGNOSTICS v_insights = ROW_COUNT;

    DELETE FROM public.proposal_chain_directions
     WHERE proposal_chain_id = ANY(v_chain_ids);
    GET DIAGNOSTICS v_directions = ROW_COUNT;

    DELETE FROM public.writer_editorial_chain_origins
     WHERE proposal_chain_id = ANY(v_chain_ids);
    GET DIAGNOSTICS v_chain_origins = ROW_COUNT;

    -- The self-FK is RESTRICT and intentionally non-deferrable. Remove each
    -- current head, then its predecessor, until the chain is empty.
    LOOP
      DELETE FROM public.proposal_versions v
       WHERE v.chain_id = ANY(v_chain_ids)
         AND NOT EXISTS (
           SELECT 1 FROM public.proposal_versions successor
            WHERE successor.chain_id = v.chain_id
              AND successor.supersedes = v.id
         );
      GET DIAGNOSTICS v_step = ROW_COUNT;
      EXIT WHEN v_step = 0;
      v_versions := v_versions + v_step;
    END LOOP;

    IF EXISTS (
      SELECT 1 FROM public.proposal_versions
       WHERE chain_id = ANY(v_chain_ids)
    ) THEN
      RAISE EXCEPTION 'r20_writer_editorial_version_graph_refused' USING ERRCODE = '23514';
    END IF;

    DELETE FROM public.proposal_chains
     WHERE id = ANY(v_chain_ids)
       AND member_id = p_member_id
       AND work_id = p_manuscript_id;
    GET DIAGNOSTICS v_chains = ROW_COUNT;

    EXECUTE 'ALTER TABLE public.writer_editorial_chain_origins ENABLE TRIGGER weco_preserve';
    EXECUTE 'ALTER TABLE public.proposal_chains ENABLE TRIGGER proposal_chains_immutable';
    EXECUTE 'ALTER TABLE public.proposal_versions ENABLE TRIGGER proposal_versions_immutable';
    EXECUTE 'ALTER TABLE public.proposal_chain_directions ENABLE TRIGGER proposal_chain_directions_no_delete';
    EXECUTE 'ALTER TABLE public.proposal_chain_insights ENABLE TRIGGER proposal_chain_insights_no_delete';
    EXECUTE 'ALTER TABLE public.manuscript_revision_authorizations ENABLE TRIGGER mra_identity_immutable';
    EXECUTE 'ALTER TABLE public.manuscript_application_recovery ENABLE TRIGGER application_recovery_immutable';
  EXCEPTION WHEN OTHERS THEN
    -- The EXCEPTION block rolls the inner subtransaction back before rethrowing,
    -- including all row changes and every ALTER TABLE trigger state change.
    RAISE;
  END;

  IF EXISTS (SELECT 1 FROM public.proposal_chains WHERE id = ANY(v_chain_ids))
     OR EXISTS (SELECT 1 FROM public.proposal_versions WHERE chain_id = ANY(v_chain_ids))
     OR EXISTS (SELECT 1 FROM public.proposal_chain_insights WHERE proposal_chain_id = ANY(v_chain_ids))
     OR EXISTS (SELECT 1 FROM public.proposal_chain_directions WHERE proposal_chain_id = ANY(v_chain_ids))
     OR EXISTS (SELECT 1 FROM public.manuscript_revision_authorizations WHERE proposal_chain_id = ANY(v_chain_ids))
     OR EXISTS (SELECT 1 FROM public.manuscript_application_recovery r
                  JOIN public.manuscript_revision_authorizations a ON a.id = r.authorization_id
                 WHERE a.proposal_chain_id = ANY(v_chain_ids))
     OR EXISTS (SELECT 1 FROM public.writer_editorial_chain_origins WHERE proposal_chain_id = ANY(v_chain_ids))
     OR EXISTS (SELECT 1 FROM public.writer_editorial_thread_origins WHERE proposal_chain_id = ANY(v_chain_ids))
     OR EXISTS (SELECT 1 FROM public.writer_editorial_save_receipts WHERE proposal_chain_id = ANY(v_chain_ids))
     OR EXISTS (SELECT 1 FROM public.editorial_turn_bindings WHERE proposal_chain_id = ANY(v_chain_ids)) THEN
    RAISE EXCEPTION 'r20_writer_editorial_postcondition_failed' USING ERRCODE = '23514';
  END IF;

  RETURN jsonb_build_object(
    'chains', v_chains,
    'versions', v_versions,
    'directions', v_directions,
    'insights', v_insights,
    'authorizations', v_authorizations,
    'recovery', v_recovery,
    'chainOrigins', v_chain_origins,
    'threadOrigins', v_thread_origins,
    'saveReceipts', v_receipts,
    'turnBindings', v_bindings
  );
END;
$fn$;

REVOKE ALL ON FUNCTION public.r20_erase_writer_editorial_history(UUID, UUID, UUID) FROM PUBLIC;

-- `soullab` is the canonical database owner/connection and retains owner
-- execution. Some installations use the narrower `maia` or `maia_app` roles;
-- grant only when those exact roles already exist.
DO $grant$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'maia') THEN
    GRANT EXECUTE ON FUNCTION public.r20_erase_writer_editorial_history(UUID, UUID, UUID) TO maia;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'maia_app') THEN
    GRANT EXECUTE ON FUNCTION public.r20_erase_writer_editorial_history(UUID, UUID, UUID) TO maia_app;
  END IF;
END
$grant$;

COMMENT ON FUNCTION public.r20_erase_writer_editorial_history(UUID, UUID, UUID) IS
'R20 constitutional erasure of retained Writer editorial history after exact same-transaction member manuscript deletion manifest+tombstone. Foreign keys remain active; returns content-free counts only.';

COMMIT;
