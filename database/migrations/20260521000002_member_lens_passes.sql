-- Member Lens Passes: the entry-as-practice surface
--
-- Phase 1 of the Psyche Engagement Layer (entry-as-practice extension).
-- Governed by: docs/canon/THE_CLEARING.md
--              docs/canon/SPIRAL_CONTINUITY_ENGINE.md
-- Spec: docs/specs/PSYCHE_ENGAGEMENT_LAYER_SPEC.md
--
-- Architectural rule:
--   The lens is an ACTION, not a LABEL.
--   The member is NEVER stored as a lens-type. There is no member.element.
--   Atoms are encountered through lenses. Multiple passes per atom across
--   time constitute self-encounter (cycling), not self-diagnosis (settling
--   into an identity).
--
-- This is what makes the architecture teach itself through the practice
-- rather than through explanation. The member learns the architecture by
-- moving through it.
--
-- Operational form: "Bring one thing. Look at it five ways."

CREATE TABLE IF NOT EXISTS member_lens_passes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  memory_atom_id  UUID NOT NULL REFERENCES member_memory_atoms(id) ON DELETE CASCADE,

  -- Which elemental lens was used. Member chose; system did NOT classify.
  lens            TEXT NOT NULL CHECK (lens IN (
    'fire', 'water', 'earth', 'air', 'aether'
  )),

  -- The prompt MAIA offered for this lens (e.g., "What wants to move?")
  -- Stored so the practice is traceable: what was asked, what was answered.
  prompt          TEXT NOT NULL,

  -- The member's verbatim response. Stored as-is, never paraphrased.
  -- Per canon: MAIA holds the member's words, not her interpretation of them.
  member_response TEXT NOT NULL,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Query paths
CREATE INDEX IF NOT EXISTS idx_lens_passes_atom_created
  ON member_lens_passes(memory_atom_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lens_passes_member_created
  ON member_lens_passes(member_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lens_passes_atom_lens
  ON member_lens_passes(memory_atom_id, lens);

-- Documentation
COMMENT ON TABLE member_lens_passes IS
  'Lens passes: the record of a member encountering a kept atom through an elemental lens. The lens is an ACTION, not a LABEL. Members are never stored as lens-types — atoms are encountered through lenses. Each pass is a separate act of seeing. Per the entry-as-practice principle: the architecture teaches itself through use, not through explanation.';

COMMENT ON COLUMN member_lens_passes.lens IS
  'Which elemental lens was used in this pass. The member chose. The system did not classify.';

COMMENT ON COLUMN member_lens_passes.prompt IS
  'The prompt MAIA offered for this lens. Stored so the practice is traceable: what was asked, what was answered. Prompts are invitations, not assertions about what the lens "means".';

COMMENT ON COLUMN member_lens_passes.member_response IS
  'The member''s verbatim response. Never paraphrased, never summarized, never interpreted. This is the content of the encounter.';

-- Observability view (no PII, structural counts only)
CREATE OR REPLACE VIEW v_member_lens_passes_summary AS
SELECT
  lens,
  COUNT(*) AS pass_count,
  COUNT(DISTINCT member_id) AS member_count,
  COUNT(DISTINCT memory_atom_id) AS atom_count,
  MIN(created_at) AS earliest_pass,
  MAX(created_at) AS latest_pass
FROM member_lens_passes
GROUP BY lens
ORDER BY lens;

COMMENT ON VIEW v_member_lens_passes_summary IS
  'Structural summary of lens passes across all members. No content, no PII. For operational observability only — what lenses are members actually using.';
