-- ═══════════════════════════════════════════════════════════════════════════
-- Breakthrough flag on member_memory_atoms
--
-- Adds a member-marked breakthrough signal to existing atoms. The substrate is
-- the same as semantic memory — no new table — because a breakthrough is a
-- property of *significance* a member places on material they have already
-- kept, not a separate kind of material.
--
-- Canon discipline (also see member_memory_atoms.crossing_must_be_false):
--   - The system NEVER auto-sets is_breakthrough. Default is FALSE.
--   - The flag flips only via an explicit member action against a route that
--     requires authenticated ownership of the atom
--     (POST /api/sovereign/atoms/[id]/breakthrough).
--   - There is no inferential path. detectBreakthrough() in
--     lib/utils/breakthroughDetection.ts contributes to the *collective*
--     anonymized field and MUST NOT write into this column.
--
-- Substrate monitor: lib/maia/substrateMap.ts CAPABILITY_CLAIMS row
-- "Breakthrough memory" points at this column via memoryAtomsLoader.
--
-- Authority: docs/canon/MAIA_MEMORY_CANON_v1.0.md §VII (12-layer health),
--            docs/canon/THE_CLEARING.md (member places; system does not classify).
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

ALTER TABLE member_memory_atoms
  ADD COLUMN IF NOT EXISTS is_breakthrough BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS marked_breakthrough_at TIMESTAMPTZ;

-- Coherence: flag and timestamp move together.
-- If is_breakthrough = TRUE then marked_breakthrough_at must be set.
-- If is_breakthrough = FALSE then marked_breakthrough_at must be NULL.
-- This makes "when was this marked" recoverable and makes orphaned timestamps
-- impossible.
ALTER TABLE member_memory_atoms
  DROP CONSTRAINT IF EXISTS breakthrough_flag_timestamp_coherent;

ALTER TABLE member_memory_atoms
  ADD CONSTRAINT breakthrough_flag_timestamp_coherent CHECK (
    (is_breakthrough = TRUE  AND marked_breakthrough_at IS NOT NULL)
    OR
    (is_breakthrough = FALSE AND marked_breakthrough_at IS NULL)
  );

-- Partial index — only carries the rows that matter for breakthrough queries.
CREATE INDEX IF NOT EXISTS idx_memory_atoms_breakthrough
  ON member_memory_atoms(member_id, marked_breakthrough_at DESC)
  WHERE is_breakthrough = TRUE;

COMMENT ON COLUMN member_memory_atoms.is_breakthrough IS
  'Member-marked breakthrough flag. Default FALSE. System NEVER sets this column — it flips only via authenticated member action through POST /api/sovereign/atoms/[id]/breakthrough. detectBreakthrough() in lib/utils/breakthroughDetection.ts contributes to the *collective* field and must not write here.';

COMMENT ON COLUMN member_memory_atoms.marked_breakthrough_at IS
  'When the member marked this atom as a breakthrough. Coherence-bound to is_breakthrough via breakthrough_flag_timestamp_coherent CHECK constraint.';

COMMIT;
