-- case_memories: DB-level enforcement for crossing_allowed on MAIA-originated representations.
--
-- The member side (member_memory_atoms) already enforces this as a hard schema constraint:
--   CONSTRAINT crossing_must_be_false CHECK (crossing_allowed = FALSE)
-- The client side (case_memories) had only DEFAULT FALSE — application-convention only.
-- This migration gives the client side the same DB-level guarantee.
--
-- Rule: MAIA-inferred and MAIA-suggested representations cannot have crossing_allowed = TRUE.
-- practitioner_authored notes are excluded — those represent the practitioner's own work.
--
-- If a future steward authorization workflow needs to allow explicit crossings for
-- maia_inferred rows, this constraint must be dropped and replaced with a more
-- nuanced mechanism (e.g., an authorized_crossings table with a separate write path).
-- Do not silently bypass it.
--
-- ─────────────────────────────────────────────────────────────────────────────
-- Prerequisite columns (added here — no prior migration defined them on
-- case_memories). The crossing constraint below references `authorship` and
-- `crossing_allowed`, but neither column existed on case_memories:
--   * the base table (20260107000001_practitioner_caseload.sql) omits both;
--   * only member_memory_atoms (20260521000001) ever defined crossing_allowed.
-- Applying the constraint without them fails ("column ... does not exist"), so
-- they are created first — mirroring member_memory_atoms — to give the CHECK its
-- dependencies. Defaults are the protective (held) case: authorship='maia_inferred'
-- + crossing_allowed=FALSE satisfy the constraint for every pre-existing row.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE case_memories
  ADD COLUMN IF NOT EXISTS authorship       TEXT    NOT NULL DEFAULT 'maia_inferred',
  ADD COLUMN IF NOT EXISTS crossing_allowed BOOLEAN NOT NULL DEFAULT FALSE;

-- Constrain authorship to the known provenance vocabulary — the three origins the
-- crossing rule distinguishes. DROP-then-ADD keeps this migration re-runnable.
ALTER TABLE case_memories DROP CONSTRAINT IF EXISTS case_memories_authorship_valid;
ALTER TABLE case_memories
  ADD CONSTRAINT case_memories_authorship_valid
  CHECK (authorship IN ('practitioner_authored', 'maia_inferred', 'maia_suggested'));

COMMENT ON COLUMN case_memories.authorship IS
  'Provenance of the memory: practitioner_authored (the practitioner''s own work, '
  'exempt from the crossing hold) vs maia_inferred / maia_suggested (MAIA-originated, '
  'permanently held). Mirrors the member-side authorship discipline.';
COMMENT ON COLUMN case_memories.crossing_allowed IS
  'DB-level parity with member_memory_atoms.crossing_allowed. Held FALSE for '
  'MAIA-originated rows by the case_memories_maia_held constraint below.';

-- The crossing-hold parity constraint (the original intent of this migration).
ALTER TABLE case_memories DROP CONSTRAINT IF EXISTS case_memories_maia_held;
ALTER TABLE case_memories
  ADD CONSTRAINT case_memories_maia_held
  CHECK (
    authorship = 'practitioner_authored'
    OR crossing_allowed = FALSE
  );

COMMENT ON CONSTRAINT case_memories_maia_held ON case_memories IS
  'DB-level parity with member_memory_atoms.crossing_must_be_false. '
  'MAIA-inferred and MAIA-suggested representations are permanently held (crossing_allowed=FALSE) '
  'until this constraint is deliberately revised by a steward migration.';
