-- Flip the default return_preference for newly kept atoms.
--
-- Doctrine:
--   Keeping is the consent act.
--   Return is the default meaning of keeping.
--   Sealing is the exception.
--   Resealing remains member-controlled.
--
-- Existing rows are NOT backfilled. Some current `member_pulled` rows reflect
-- a deliberate sealed choice from the conversational keep-time consent prompt
-- introduced in commit 74b401383. The per-row [Allow return] affordance on
-- /maia/keep-capture (commit 81e97f106) remains the member-driven migration
-- path for pre-existing material.
--
-- Forward: new atoms ship as `contextual_doorway`. Members may reseal
-- individually at any time via the per-row gesture.

ALTER TABLE member_memory_atoms
  ALTER COLUMN return_preference SET DEFAULT 'contextual_doorway';
