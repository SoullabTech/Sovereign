-- Member Memory Atoms: The Keep/Capture Portfolio
--
-- Phase 1 of the Psyche Engagement Layer.
-- Governed by: docs/canon/THE_CLEARING.md, docs/canon/SPIRAL_CONTINUITY_ENGINE.md,
--              docs/canon/RIGHT_TO_REMAIN_UNPOSSESSED.md
-- Spec: docs/specs/PSYCHE_ENGAGEMENT_LAYER_SPEC.md
--
-- Core rule:
--   Material may exist in the field. It becomes portfolio memory only when the
--   member keeps it.
--
-- This table does NOT duplicate source content. It is the registry of what the
-- member has chosen to hold. The source (member_ideas, journal, dream, etc.)
-- remains in its native table. Spontaneous entries store their content here.

CREATE TABLE IF NOT EXISTS member_memory_atoms (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id         UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Source bridge: where this material came from before it was kept.
  -- The atom points at the source; the source remains in its native table.
  source_type       TEXT NOT NULL CHECK (source_type IN (
    'idea',             -- member_ideas
    'idea_block',       -- member_idea_blocks
    'journal',          -- (journal table — source bridge stub for now)
    'dream',            -- (dream table — source bridge stub for now)
    'reflection',       -- (reflection table — source bridge stub for now)
    'decision',         -- decision block within an idea, or standalone
    'change',           -- change block within an idea, or standalone
    'session_excerpt',  -- excerpt from a conversation session
    'spontaneous'       -- member typed directly into Keep (body required)
  )),
  source_id         UUID,  -- NULL only when source_type = 'spontaneous'

  -- Member-given label. Short. Belongs to the member.
  title             TEXT NOT NULL,

  -- Body content. NULL for sourced items (content lives in source table).
  -- Required for spontaneous entries.
  body              TEXT,

  -- ═══════════════════════════════════════════════════════════════════════
  -- Registers and lenses (the webbing)
  --
  -- An atom is NOT placed in a single category. It may live across multiple
  -- registers (Spiral Memory Hierarchy) and be viewed through multiple
  -- elemental lenses. The member places. The system records.
  --
  -- Registers = member-assigned vantage points on what was kept.
  -- Lenses    = ways of seeing the same atom in different moments.
  -- Threads   = connective tissue across atoms.
  --
  -- The system NEVER auto-assigns registers, lenses, or threads.
  -- Same material, different views. The member is the placer.
  -- ═══════════════════════════════════════════════════════════════════════

  -- Optional dominant register if the member declared one.
  primary_register  TEXT CHECK (primary_register IS NULL OR primary_register IN (
    'episodic',         -- individual lived moment
    'thematic',         -- recurring motif
    'developmental',    -- spiral movement
    'archetypal',       -- symbolic pattern
    'relational',       -- attachment dynamics
    'threshold',        -- irreversible transformation
    'witnessed',        -- practitioner co-held
    'sacred_protected'  -- non-inferential, non-circulating
  )),

  -- All registers the member has placed this atom in. May be empty.
  -- An atom can live across multiple registers (webbing).
  registers         TEXT[] NOT NULL DEFAULT '{}',
  CONSTRAINT registers_valid CHECK (
    registers <@ ARRAY[
      'episodic', 'thematic', 'developmental', 'archetypal',
      'relational', 'threshold', 'witnessed', 'sacred_protected'
    ]::TEXT[]
  ),

  -- Member-selected elemental lenses — ways of seeing, not classifications.
  -- The element does NOT classify the member. It determines which dimension
  -- of the material is in view in this moment. Never inferred.
  elemental_lenses  TEXT[] NOT NULL DEFAULT '{}',
  CONSTRAINT elemental_lenses_valid CHECK (
    elemental_lenses <@ ARRAY['fire', 'water', 'earth', 'air', 'aether']::TEXT[]
  ),

  -- Threads this atom belongs to (member-named continuing threads).
  -- Phase 2 will add the threads table; for now UUIDs are stored.
  thread_ids        UUID[] NOT NULL DEFAULT '{}',

  -- Status. Reflects member gestures only. System never infers status.
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active',         -- kept and present
    'still_alive',    -- explicitly marked alive (higher saliency weight)
    'set_aside',      -- parked (lower weight)
    'protected',      -- held without circulation (voice-ineligible)
    'archived'        -- removed from active recall (still preserved)
  )),

  -- The formation moment: when the member CHOSE to keep this.
  -- Distinct from created_at (row creation) and from the source's creation time.
  kept_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Last member interaction with this atom (view, re-tag, status change).
  last_touched_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- ═══════════════════════════════════════════════════════════════════════
  -- Return loop (prepares Phase 2 contextual doorway; safe defaults for P1)
  -- ═══════════════════════════════════════════════════════════════════════

  -- How the member wants this material to return to them.
  -- member_pulled: only when member asks directly (most restrictive; default)
  -- contextual_doorway: MAIA may offer when proximity filter passes
  -- ritual_review_opt_in: appears in member-enabled review surfaces
  return_preference TEXT NOT NULL DEFAULT 'member_pulled' CHECK (return_preference IN (
    'member_pulled',
    'contextual_doorway',
    'ritual_review_opt_in'
  )),

  -- When MAIA last surfaced this atom via doorway offer (NULL = never).
  -- Used by Phase 2 cooldown logic.
  last_surfaced_at  TIMESTAMPTZ,

  -- Count of doorway offers made for this atom.
  -- Phase 2 enforces a maximum; after decline-twice, return_preference
  -- auto-reverts to 'member_pulled' (Phase 2 logic, not Phase 1).
  surface_count     INTEGER NOT NULL DEFAULT 0 CHECK (surface_count >= 0),

  -- Standard
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Canon enforcement at the schema level.
  -- Material in one layer cannot be crossed with material in another to form
  -- higher-order claims without explicit member ratification.
  -- Lifting this requires explicit schema migration — friction by design.
  crossing_allowed  BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT crossing_must_be_false CHECK (crossing_allowed = FALSE),

  -- Sacred-protected register requires protected status (voice-ineligible).
  -- Canon: material the member has placed in the non-inferential, non-circulating
  -- register must be structurally voice-ineligible.
  CONSTRAINT sacred_protected_register_status CHECK (
    NOT ('sacred_protected' = ANY(registers))
    OR status = 'protected'
  ),

  -- Spontaneous entries must have a body; sourced entries must have source_id.
  CONSTRAINT sourcing_discipline CHECK (
    (source_type = 'spontaneous' AND body IS NOT NULL)
    OR (source_type != 'spontaneous' AND source_id IS NOT NULL)
  )
);

-- Query paths
CREATE INDEX IF NOT EXISTS idx_memory_atoms_member_status_touched
  ON member_memory_atoms(member_id, status, last_touched_at DESC);

CREATE INDEX IF NOT EXISTS idx_memory_atoms_primary_register
  ON member_memory_atoms(member_id, primary_register, last_touched_at DESC)
  WHERE primary_register IS NOT NULL;

-- GIN indexes for the webbing arrays — allow efficient "atoms in register X"
-- or "atoms viewed through lens Y" or "atoms in thread Z" queries.
CREATE INDEX IF NOT EXISTS idx_memory_atoms_registers_gin
  ON member_memory_atoms USING GIN (registers);

CREATE INDEX IF NOT EXISTS idx_memory_atoms_lenses_gin
  ON member_memory_atoms USING GIN (elemental_lenses);

CREATE INDEX IF NOT EXISTS idx_memory_atoms_threads_gin
  ON member_memory_atoms USING GIN (thread_ids);

CREATE INDEX IF NOT EXISTS idx_memory_atoms_member_kept
  ON member_memory_atoms(member_id, kept_at DESC);

CREATE INDEX IF NOT EXISTS idx_memory_atoms_source
  ON member_memory_atoms(member_id, source_type, source_id)
  WHERE source_id IS NOT NULL;

-- A given source item can only be kept once per member.
-- (If the member wants to keep it again differently, they archive first.)
CREATE UNIQUE INDEX IF NOT EXISTS idx_memory_atoms_unique_source
  ON member_memory_atoms(member_id, source_type, source_id)
  WHERE source_id IS NOT NULL;

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_member_memory_atoms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_member_memory_atoms_updated_at ON member_memory_atoms;
CREATE TRIGGER trg_member_memory_atoms_updated_at
  BEFORE UPDATE ON member_memory_atoms
  FOR EACH ROW
  EXECUTE FUNCTION update_member_memory_atoms_updated_at();

-- Documentation
COMMENT ON TABLE member_memory_atoms IS
  'Keep/Capture Portfolio: the registry of material the member has explicitly chosen to keep. Material exists in source tables (member_ideas, journals, etc.) and becomes portfolio memory only when the member keeps it. Per The Clearing and Spiral Continuity Engine canons.';

COMMENT ON COLUMN member_memory_atoms.kept_at IS
  'The formation moment: when the member chose to keep this. Distinct from created_at (row creation) and from the source material''s creation time. Arrival and keeping are not the same event.';

COMMENT ON COLUMN member_memory_atoms.crossing_allowed IS
  'Always FALSE. Enforces canon at the type level: material in one layer cannot be crossed with material in another to form higher-order claims without explicit member ratification. A future engineer cannot accidentally enable crossing — it requires explicit schema migration.';

COMMENT ON COLUMN member_memory_atoms.registers IS
  'Member-assigned Spiral Memory Hierarchy registers. An atom may live across multiple registers simultaneously (webbing). System does NOT auto-classify. The member places.';

COMMENT ON COLUMN member_memory_atoms.elemental_lenses IS
  'Member-selected ways of seeing this atom. NOT classifications of the member or the material — vantage points. Same atom may be viewed through Fire one day and Water another. Never inferred by the system.';

COMMENT ON COLUMN member_memory_atoms.thread_ids IS
  'Connective tissue: member-named continuing threads this atom belongs to. Phase 2 will add the threads table.';

COMMENT ON COLUMN member_memory_atoms.status IS
  'Reflects member gestures only: active (kept), still_alive (high saliency), set_aside (parked), protected (held without circulation), archived (removed from active recall). System never infers status.';

COMMENT ON COLUMN member_memory_atoms.source_type IS
  'Where this material originated before being kept. The atom points at the source; it does not duplicate it. spontaneous = member typed directly into Keep.';

-- ═══════════════════════════════════════════════════════════════════════════
-- Observability view (no PII, structural counts only)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW v_member_memory_atoms_summary AS
SELECT
  source_type,
  primary_register,
  status,
  COUNT(*) AS atom_count,
  COUNT(DISTINCT member_id) AS member_count,
  MIN(kept_at) AS earliest_keep,
  MAX(kept_at) AS latest_keep
FROM member_memory_atoms
GROUP BY source_type, primary_register, status
ORDER BY source_type, primary_register, status;

COMMENT ON VIEW v_member_memory_atoms_summary IS
  'Structural summary of the Keep/Capture portfolio across all members. No content, no PII. For operational observability only.';
