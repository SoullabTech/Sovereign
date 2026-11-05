-- WRITERS-STUDIO-CONVERSATION-STAGE / R2 + O1(a) — MAIA OPENS.
-- Founder ruling 2026-11-05 (option 1): relationship custody gets an honest
-- record of a MAIA-first opening. The writer side of an opening is a TYPED
-- GESTURE, never a turn and never words the writer said.
--
-- Additive: one new child_kind 'EDITORIAL_OPENING' and one nullable gesture
-- column. Every existing EDITORIAL_TURN / REVIEW_DISCUSS invariant is kept
-- exactly as in 20260925000006 (EDITORIAL_TURN still REQUIRES a member turn).
-- No existing row is rewritten or backfilled.
BEGIN;
SET LOCAL lock_timeout = '5s';

ALTER TABLE writer_editorial_relationship_episodes
  ADD COLUMN IF NOT EXISTS editorial_opening_gesture text;

ALTER TABLE writer_editorial_relationship_episodes
  DROP CONSTRAINT IF EXISTS were_child_shape_scope_and_semantics;

ALTER TABLE writer_editorial_relationship_episodes
  DROP CONSTRAINT IF EXISTS writer_editorial_relationship_episodes_child_kind_check;

ALTER TABLE writer_editorial_relationship_episodes
  ADD CONSTRAINT writer_editorial_relationship_episodes_child_kind_check
  CHECK (child_kind IN ('EDITORIAL_TURN', 'EDITORIAL_OPENING', 'REVIEW_DISCUSS'));

ALTER TABLE writer_editorial_relationship_episodes
  ADD CONSTRAINT were_child_shape_scope_and_semantics CHECK (
    (
      child_kind = 'EDITORIAL_TURN'
      AND editorial_opening_gesture IS NULL
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
      -- MAIA-first opening: the writer side is a typed gesture, not a turn.
      child_kind = 'EDITORIAL_OPENING'
      AND editorial_opening_gesture = 'opened_conversation_on_passage'
      AND manuscript_scope_requested IS NOT NULL
      AND manuscript_scope_executed IS NOT NULL
      AND manuscript_scope_requested = manuscript_scope_executed
      AND editorial_thread_id IS NOT NULL
      AND editorial_proposal_chain_id IS NOT NULL
      AND editorial_member_turn_index IS NULL
      AND editorial_maia_turn_index = 0
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
      AND editorial_opening_gesture IS NULL
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

-- One opening per thread, ever.
CREATE UNIQUE INDEX IF NOT EXISTS were_editorial_opening_once
  ON writer_editorial_relationship_episodes(editorial_thread_id)
  WHERE child_kind = 'EDITORIAL_OPENING';

COMMENT ON COLUMN writer_editorial_relationship_episodes.editorial_opening_gesture IS
  'Typed writer gesture for a MAIA-first opening (EDITORIAL_OPENING only). Never words the writer said; the opening has no writer turn.';

COMMIT;
