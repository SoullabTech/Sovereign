-- WRITERS-STUDIO-NEXT-01 / A2-5R2
-- Scope-identity succession.
--
-- This migration does NOT backfill historical Editorial scope and does NOT
-- reinterpret existing A2 episode rows.
BEGIN;

ALTER TABLE proposal_chains
  ADD COLUMN IF NOT EXISTS locus_scope_kind text
  CHECK (locus_scope_kind IN ('section', 'passage'));

COMMENT ON COLUMN proposal_chains.locus_scope_kind IS
  'Server-authored immutable classification of the chain locus: section or passage. NULL means historical/unmeasured. Full-body selections remain passage.';

-- Fail closed before changing A2 episode semantics.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM writer_editorial_relationship_episodes LIMIT 1
  ) THEN
    RAISE EXCEPTION
      'A2-5R2 refuses scope succession: pre-successor A2 episode rows exist and may not be reinterpreted or backfilled';
  END IF;
END $$;
ALTER TABLE writer_editorial_relationship_episodes
  RENAME COLUMN requested_scope TO manuscript_scope_requested;

ALTER TABLE writer_editorial_relationship_episodes
  RENAME COLUMN executed_scope TO manuscript_scope_executed;

ALTER TABLE writer_editorial_relationship_episodes
  ALTER COLUMN manuscript_scope_requested DROP NOT NULL;

ALTER TABLE writer_editorial_relationship_episodes
  ALTER COLUMN manuscript_scope_executed DROP NOT NULL;

ALTER TABLE writer_editorial_relationship_episodes
  DROP CONSTRAINT IF EXISTS were_scope_exact;

ALTER TABLE writer_editorial_relationship_episodes
  DROP CONSTRAINT IF EXISTS writer_editorial_relationship_episodes_requested_scope_check;

ALTER TABLE writer_editorial_relationship_episodes
  DROP CONSTRAINT IF EXISTS writer_editorial_relationship_episodes_executed_scope_check;

ALTER TABLE writer_editorial_relationship_episodes
  DROP CONSTRAINT IF EXISTS were_child_shape_and_semantics;
ALTER TABLE writer_editorial_relationship_episodes
  ADD CONSTRAINT were_manuscript_scope_values CHECK (
    manuscript_scope_requested IS NULL
    OR manuscript_scope_requested IN ('section', 'passage')
  );

ALTER TABLE writer_editorial_relationship_episodes
  ADD CONSTRAINT were_manuscript_scope_executed_values CHECK (
    manuscript_scope_executed IS NULL
    OR manuscript_scope_executed IN ('section', 'passage')
  );

ALTER TABLE writer_editorial_relationship_episodes
  ADD CONSTRAINT were_child_shape_scope_and_semantics CHECK (
    (
      child_kind = 'EDITORIAL_TURN'
      AND manuscript_scope_requested IS NOT NULL
      AND manuscript_scope_executed IS NOT NULL
      AND manuscript_scope_requested = manuscript_scope_executed
      AND editorial_thread_id IS NOT NULL
      AND editorial_proposal_chain_id IS NOT NULL
      AND editorial_member_turn_index IS NOT NULL
      AND editorial_maia_turn_index IS NOT NULL
      AND review_thread_id IS NULL
      AND review_maia_turn_index IS NULL
      AND review_authorization_id IS NULL
      AND review_reading_id IS NULL
      AND review_observation_key IS NULL
      AND temporal_posture = 'CURRENT_FROZEN_LOCUS'
      AND history_policy = 'CHILD_LOCAL_MULTI_TURN'
      AND continuation_authorized = TRUE
      AND authority_class = 'EDITORIAL_CHAIN'
    )
    OR
    (
      child_kind = 'REVIEW_DISCUSS'
      AND manuscript_scope_requested IS NULL
      AND manuscript_scope_executed IS NULL
      AND review_thread_id IS NOT NULL
      AND review_maia_turn_index IS NOT NULL
      AND review_authorization_id IS NOT NULL
      AND review_reading_id IS NOT NULL
      AND review_observation_key IS NOT NULL
      AND editorial_thread_id IS NULL
      AND editorial_proposal_chain_id IS NULL
      AND editorial_member_turn_index IS NULL
      AND editorial_maia_turn_index IS NULL
      AND temporal_posture = 'AS_READ'
      AND history_policy = 'NONE'
      AND continuation_authorized = FALSE
      AND authority_class = 'R2_DISCLOSURE'
    )
  );

COMMENT ON COLUMN writer_editorial_relationship_episodes.manuscript_scope_requested IS
  'Child-local manuscript locus scope. Required for Editorial section/passage loci; NULL for finding-scoped Review Discuss. Not the A2 relationship frame.';

COMMENT ON COLUMN writer_editorial_relationship_episodes.manuscript_scope_executed IS
  'Executed child-local manuscript locus scope. Required and equal to requested for Editorial; NULL for Review Discuss.';

COMMIT;

-- Historical proposal_chains.locus_scope_kind stays NULL. No backfill.
-- A2 relationship-frame semantics remain outside child authority.
