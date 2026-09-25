-- WRITERS-STUDIO-NEXT-01 / A2-4
-- Durable custody for the A2 parent editorial relationship.
--
-- Content-free and non-authorizing:
--   * no manuscript prose
--   * no child reply/finding/proposal text
--   * no disclosure/cognition/mutation/place authority
--   * no Focus child in v1
--
-- Parent identity is member + Living Work + manuscript bound, but plural:
-- there is deliberately NO unique constraint on that triple.
--
-- Child references are deliberately NOT foreign keys. A lawful child deletion
-- must not be blocked, cascade relationship history away, or null/repoint it.

BEGIN;

-- Composite FK targets. These add no new uniqueness beyond the existing PK;
-- they exist only so one FK can prove id + member in a single constraint.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'living_works_id_member_a2_key') THEN
    ALTER TABLE living_works
      ADD CONSTRAINT living_works_id_member_a2_key UNIQUE (id, member_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'member_manuscripts_id_member_a2_key') THEN
    ALTER TABLE member_manuscripts
      ADD CONSTRAINT member_manuscripts_id_member_a2_key UNIQUE (id, member_id);
  END IF;
END $$;
CREATE TABLE IF NOT EXISTS writer_editorial_relationships (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id              UUID NOT NULL,
  living_work_id         UUID NOT NULL,
  manuscript_id          UUID NOT NULL,
  creation_expression_id UUID NOT NULL,
  contract_version       TEXT NOT NULL CHECK (contract_version = 'A2-1'),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT wer_work_member_fk
    FOREIGN KEY (living_work_id, member_id)
    REFERENCES living_works(id, member_id)
    ON UPDATE RESTRICT ON DELETE CASCADE,

  CONSTRAINT wer_manuscript_member_fk
    FOREIGN KEY (manuscript_id, member_id)
    REFERENCES member_manuscripts(id, member_id)
    ON UPDATE RESTRICT ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS wer_member_work_idx
  ON writer_editorial_relationships(member_id, living_work_id, manuscript_id, created_at DESC);

CREATE TABLE IF NOT EXISTS writer_editorial_relationship_episodes (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id          UUID NOT NULL
    REFERENCES writer_editorial_relationships(id) ON DELETE CASCADE,
  sequence                 INTEGER NOT NULL CHECK (sequence >= 1),

  child_kind               TEXT NOT NULL
    CHECK (child_kind IN ('EDITORIAL_TURN', 'REVIEW_DISCUSS')),

  requested_scope          TEXT NOT NULL CHECK (requested_scope IN ('passage', 'section')),
  executed_scope           TEXT NOT NULL CHECK (executed_scope IN ('passage', 'section')),
  temporal_posture         TEXT NOT NULL,
  history_policy           TEXT NOT NULL,
  continuation_authorized  BOOLEAN NOT NULL,
  authority_class          TEXT NOT NULL,
  carry_policy             TEXT NOT NULL CHECK (carry_policy = 'PRESENTATION_ONLY'),
  admitted_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  editorial_thread_id         UUID,
  editorial_proposal_chain_id UUID,
  editorial_member_turn_index INTEGER CHECK (editorial_member_turn_index IS NULL OR editorial_member_turn_index >= 0),
  editorial_maia_turn_index   INTEGER CHECK (editorial_maia_turn_index IS NULL OR editorial_maia_turn_index >= 0),

  review_thread_id             UUID,
  review_maia_turn_index       INTEGER CHECK (review_maia_turn_index IS NULL OR review_maia_turn_index >= 0),
  review_authorization_id      UUID,
  review_reading_id            UUID,
  review_observation_key       TEXT CHECK (review_observation_key IS NULL OR length(review_observation_key) > 0),

  CONSTRAINT were_relationship_sequence_key UNIQUE (relationship_id, sequence),
  CONSTRAINT were_scope_exact CHECK (requested_scope = executed_scope),

  CONSTRAINT were_child_shape_and_semantics CHECK (
    (
      child_kind = 'EDITORIAL_TURN'
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
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS were_editorial_child_once
  ON writer_editorial_relationship_episodes(editorial_thread_id, editorial_maia_turn_index)
  WHERE child_kind = 'EDITORIAL_TURN';

CREATE UNIQUE INDEX IF NOT EXISTS were_review_child_once
  ON writer_editorial_relationship_episodes(review_authorization_id)
  WHERE child_kind = 'REVIEW_DISCUSS';

CREATE INDEX IF NOT EXISTS were_relationship_order_idx
  ON writer_editorial_relationship_episodes(relationship_id, sequence);
CREATE OR REPLACE FUNCTION writer_editorial_custody_refuse_update()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION
    'writer editorial custody row is immutable: corrections are new acts, never UPDATE';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS wer_no_update ON writer_editorial_relationships;
CREATE TRIGGER wer_no_update
  BEFORE UPDATE ON writer_editorial_relationships
  FOR EACH ROW EXECUTE FUNCTION writer_editorial_custody_refuse_update();

DROP TRIGGER IF EXISTS were_no_update ON writer_editorial_relationship_episodes;
CREATE TRIGGER were_no_update
  BEFORE UPDATE ON writer_editorial_relationship_episodes
  FOR EACH ROW EXECUTE FUNCTION writer_editorial_custody_refuse_update();

COMMENT ON TABLE writer_editorial_relationships IS
  'A2 parent editorial relationship custody. Content-free, plural per Work/manuscript, member-bound, immutable, and non-authorizing. creation_expression_id is historical provenance and deliberately not an FK.';

COMMENT ON TABLE writer_editorial_relationship_episodes IS
  'A2 append-only content-free episode references. V1 admits only completed EDITORIAL_TURN and REVIEW_DISCUSS child acts. Child refs are intentionally non-FK so child deletion cannot rewrite or erase relationship history.';

COMMENT ON COLUMN writer_editorial_relationships.creation_expression_id IS
  'The exact living_work_expressions row verified at relationship creation. Deliberately no FK: later declaration removal must remain lawful and must not repoint or erase history.';

COMMENT ON COLUMN writer_editorial_relationship_episodes.carry_policy IS
  'Presentation relationship continuity only. Row existence never authorizes cognition carry, disclosure, reread, comparison, memory, or Work mutation.';

COMMIT;

-- Rehearsal-only rollback, safe only before any A2 custody data is admitted:
--   DROP TABLE writer_editorial_relationship_episodes;
--   DROP TABLE writer_editorial_relationships;
--   DROP FUNCTION writer_editorial_custody_refuse_update();
--   ALTER TABLE member_manuscripts DROP CONSTRAINT member_manuscripts_id_member_a2_key;
--   ALTER TABLE living_works DROP CONSTRAINT living_works_id_member_a2_key;
-- After admitted A2 data exists, ordinary application rollback MUST retain schema/data.
