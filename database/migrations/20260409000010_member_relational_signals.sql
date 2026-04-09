-- member_relational_signals
--
-- Lightweight, session-scoped relational signals surfaced from live MAIA
-- conversation (auto-detected) or from labtool completion (manual). Powers
-- the RelationshipFieldCard on /maia.
--
-- Design intent:
--   - NOT a clinical record
--   - NOT a verdict
--   - descriptive, never diagnostic
--   - append-only; the card reads the latest row(s) for the member
--   - explicitly separate from `relationship_field_state` (which holds the
--     authoritative state for each explicit relationship record)
--
-- See: CLAUDE.md §Sovereignty Invariants.

CREATE TABLE IF NOT EXISTS member_relational_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Owner
  member_id UUID NOT NULL,

  -- Optional link to an explicit relationship record. NULL when the signal
  -- was detected from live conversation and no record has been created.
  relationship_id UUID REFERENCES member_relationships(id) ON DELETE SET NULL,

  -- Generic category ('partner', 'mother', 'friend'…). NEVER a name.
  counterpart_label TEXT,

  -- What the bond currently feels like. Matches canonical tones used by
  -- /labtools/relational-field and CheckInFlow. Nullable.
  tone TEXT,

  -- 'none' | 'strained' | 'ruptured' | 'unclear'. Nullable.
  rupture_state TEXT CHECK (
    rupture_state IS NULL
    OR rupture_state IN ('none', 'strained', 'ruptured', 'unclear')
  ),

  -- 0–2 dynamic pattern ids from relationshipResources.ts. Descriptive, not
  -- identifying.
  dynamic_tags TEXT[] NOT NULL DEFAULT '{}',

  -- Framework ids from relationshipResources.ts whose language the detector
  -- recognized in the turn (or that the labtool drew from).
  frameworks_applied TEXT[] NOT NULL DEFAULT '{}',

  -- Where did this signal come from?
  source TEXT NOT NULL CHECK (source IN ('maia_conversation', 'labtool_manual')),

  -- 0–1 detection confidence (labtool_manual signals typically leave this null
  -- since the member explicitly offered them).
  confidence REAL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Primary read path: "latest N signals for this member".
CREATE INDEX IF NOT EXISTS idx_member_relational_signals_member_created
  ON member_relational_signals (member_id, created_at DESC);

-- Secondary: all signals for a specific explicit relationship.
CREATE INDEX IF NOT EXISTS idx_member_relational_signals_relationship
  ON member_relational_signals (relationship_id)
  WHERE relationship_id IS NOT NULL;

COMMENT ON TABLE member_relational_signals IS
  'Lightweight ephemeral relational signals powering the /maia RelationshipFieldCard. Descriptive, never diagnostic. See CLAUDE.md §Sovereignty Invariants.';

COMMENT ON COLUMN member_relational_signals.counterpart_label IS
  'Generic category only (partner, mother, friend). NEVER a proper name.';

COMMENT ON COLUMN member_relational_signals.frameworks_applied IS
  'Framework ids whose language appeared — does not claim the framework describes the member.';
