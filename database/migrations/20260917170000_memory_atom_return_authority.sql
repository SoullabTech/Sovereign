-- MAIA-MAVEN-T1A R10 — KEEP does not grant REOPEN.
--
-- Historical state:
--   return_preference alone could not tell whether `contextual_doorway` came
--   from the database default or from the member's explicit Allow return act.
--   The value therefore could not prove reopening authority.
--
-- Repair:
--   * all rows that predate this migration are `legacy_ambiguous`;
--   * new rows default `default_private` + member_pulled;
--   * only the member's set_return_preference gesture may write
--     `member_explicit` (enforced in the service layer and loader tests);
--   * ambient readers require member_explicit in addition to an eligible value.
--
-- No legacy row is rewritten as consented or unconsented. Ambiguity fails closed.

BEGIN;

ALTER TABLE member_memory_atoms
  ADD COLUMN IF NOT EXISTS return_authority TEXT NOT NULL DEFAULT 'legacy_ambiguous';

ALTER TABLE member_memory_atoms
  DROP CONSTRAINT IF EXISTS member_memory_atoms_return_authority_check;

ALTER TABLE member_memory_atoms
  ADD CONSTRAINT member_memory_atoms_return_authority_check
  CHECK (return_authority IN ('legacy_ambiguous', 'default_private', 'member_explicit'));

-- ADD COLUMN above assigns legacy_ambiguous to pre-existing rows. From this point
-- forward omission means private, never ambient return authority.
ALTER TABLE member_memory_atoms
  ALTER COLUMN return_authority SET DEFAULT 'default_private';

ALTER TABLE member_memory_atoms
  ALTER COLUMN return_preference SET DEFAULT 'member_pulled';

COMMENT ON COLUMN member_memory_atoms.return_authority IS
'Authority provenance for return_preference. legacy_ambiguous = predates explicit provenance and cannot ambiently return; default_private = created private without REOPEN grant; member_explicit = current preference was set by a member return-preference gesture.';

COMMIT;
