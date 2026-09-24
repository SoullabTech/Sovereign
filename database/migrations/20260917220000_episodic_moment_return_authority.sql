-- MAIA-MAVEN-T1A J6 repair — exact Moment idempotency + return authority
-- Governing rulings: R9 exact referent; R10 KEEP != REOPEN; J6 W2 duplicate-persistence STOP.
BEGIN;

ALTER TABLE episodic_memories
  ADD COLUMN IF NOT EXISTS return_preference TEXT NOT NULL DEFAULT 'member_pulled',
  ADD COLUMN IF NOT EXISTS return_authority TEXT NOT NULL DEFAULT 'default_private';

-- Legacy member-marked rows predate explicit per-Moment return authority. Preserve them,
-- but do not infer consent: they fail closed until the member acts again.
UPDATE episodic_memories
   SET return_preference = 'member_pulled',
       return_authority = 'legacy_ambiguous'
 WHERE marked_by_member = TRUE
   AND return_authority = 'default_private';

ALTER TABLE episodic_memories
  DROP CONSTRAINT IF EXISTS episodic_memories_return_preference_check,
  DROP CONSTRAINT IF EXISTS episodic_memories_return_authority_check;

ALTER TABLE episodic_memories
  ADD CONSTRAINT episodic_memories_return_preference_check
    CHECK (return_preference IN ('member_pulled', 'contextual_doorway')),
  ADD CONSTRAINT episodic_memories_return_authority_check
    CHECK (return_authority IN ('legacy_ambiguous', 'default_private', 'member_explicit'));

-- One exact member-authored source message may mint at most one durable Moment.
-- Identical words in different source messages remain distinct because source_turn_id differs.
CREATE UNIQUE INDEX IF NOT EXISTS ux_episodic_member_marked_source
  ON episodic_memories (user_id, source_session_id, source_turn_id)
  WHERE marked_by_member = TRUE
    AND source_session_id IS NOT NULL
    AND source_turn_id IS NOT NULL;

COMMENT ON COLUMN episodic_memories.return_preference IS
  'Per-Moment return preference. Keeping defaults to member_pulled; contextual_doorway requires a separate member act.';
COMMENT ON COLUMN episodic_memories.return_authority IS
  'Authority provenance for per-Moment return. Only member_explicit may authorize ambient return.';

COMMIT;
