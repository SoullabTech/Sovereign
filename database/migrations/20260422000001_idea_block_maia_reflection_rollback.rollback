-- Rollback for 20260422000001_idea_block_maia_reflection.sql
--
-- Reverts the CHECK constraint on member_idea_blocks.block_type back to the
-- original 3-value form (note | decision | change) and removes any rows
-- that would violate the tighter constraint.
--
-- IMPORTANT: This is a destructive rollback for any maia_reflection blocks
-- that have already been written. Run it ONLY if you intend to abandon the
-- thread-reflection feature. If you only need to disable the feature
-- temporarily, prefer un-deploying the `/api/ideas/[id]/ask-maia` route
-- (a pure code revert) — the forward constraint is non-breaking for any
-- existing workflow.
--
-- Sequence:
--   1. Delete existing maia_reflection rows (they would fail the tighter CHECK).
--   2. Drop the extended CHECK constraint.
--   3. Re-add the original 3-value CHECK.
--   4. Remove the migration's schema_migrations row.

BEGIN;

-- 1. Remove any maia_reflection blocks that would violate the narrower CHECK
DELETE FROM member_idea_blocks
 WHERE block_type = 'maia_reflection';

-- 2. Drop the extended constraint
ALTER TABLE member_idea_blocks
  DROP CONSTRAINT IF EXISTS member_idea_blocks_block_type_check;

-- 3. Re-add the original 3-value constraint
ALTER TABLE member_idea_blocks
  ADD CONSTRAINT member_idea_blocks_block_type_check
  CHECK (block_type IN ('note', 'decision', 'change'));

-- 4. Deregister the forward migration so re-applying works cleanly
DELETE FROM schema_migrations
 WHERE filename = '20260422000001_idea_block_maia_reflection.sql';

COMMIT;
