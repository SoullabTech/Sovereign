-- Extend member_idea_blocks to carry MAIA-generated thread reflections
--
-- Purpose:
--   Ask MAIA becomes a one-click in-thread action instead of a route push to /maia.
--   The reflection is generated server-side and persisted as a new block type
--   alongside the member's own notes / decisions / shifts.
--
-- Trust boundary:
--   This block type is ONLY writable by the dedicated endpoint
--   POST /api/ideas/[id]/ask-maia — the general /blocks route continues to
--   accept only member-authored types ('note', 'decision', 'change').
--   See maiaThreadReflection.ts for how context is composed and bounded.
--
-- Metadata shape written by the endpoint:
--   { "source": "maia", "invoked_from": "idea_thread" }

ALTER TABLE member_idea_blocks
  DROP CONSTRAINT IF EXISTS member_idea_blocks_block_type_check;

ALTER TABLE member_idea_blocks
  ADD CONSTRAINT member_idea_blocks_block_type_check
  CHECK (block_type IN ('note', 'decision', 'change', 'maia_reflection'));
