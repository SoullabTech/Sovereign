-- ═══════════════════════════════════════════════════════════════════════════
-- WHAT EXACT STATE OF THE MANUSCRIPT WAS MAIA LOOKING AT?
--
-- Founder ruling 2026-09-12, on the Act 3 witness failure. FOCUS reads the
-- current, section-addressable WORKING DRAFT at one explicit version — and the
-- act must record WHICH, or the question above has no answer after the fact.
--
--   act begins → resolve draft D at version V → read all authorized members
--     from D@V → one canonical MAIA turn → record D + V with the act
--
-- ⭐ THIS IS WHAT MAKES RevisionProposal POSSIBLE. A proposal built against
-- version 37 may not be silently applied to a Work that has reached 38: it
-- refuses, or it rebases. Without the version on the act, "what was this advice
-- about?" is answerable only by reading the transcript and guessing.
--
-- ⛔ CONTENT-FREE, like every other column on this table. A draft id and an
-- integer. No body, no quotation, no summary, no diff.
--
-- ⛔ NULLABLE BY NECESSITY, NOT BY DESIGN. Acts recorded before this migration
-- cannot be given a version retroactively — inventing one would be the exact
-- untruth this column exists to prevent. NULL means "recorded before the act
-- knew", and it is distinguishable from any version.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE focus_crossing_acts
  ADD COLUMN IF NOT EXISTS working_draft_id      uuid,
  ADD COLUMN IF NOT EXISTS working_draft_version integer;

-- A draft without its version, or a version without its draft, would be a
-- provenance record that cannot say what it read. Either both or neither.
ALTER TABLE focus_crossing_acts
  DROP CONSTRAINT IF EXISTS focus_act_draft_provenance_is_one_fact;
ALTER TABLE focus_crossing_acts
  ADD CONSTRAINT focus_act_draft_provenance_is_one_fact
    CHECK ((working_draft_id IS NULL) = (working_draft_version IS NULL));

-- For "which acts reasoned from the prose as it stood at version V".
CREATE INDEX IF NOT EXISTS focus_crossing_acts_draft_version_idx
  ON focus_crossing_acts (working_draft_id, working_draft_version);
