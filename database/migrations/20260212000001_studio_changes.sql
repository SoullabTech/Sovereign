-- Studio Changes — I Ching Oracle + AIN Council for Navigating Life Transitions
--
-- A change is a moment where mystery catches attention and demands
-- conscious awareness. The practitioner or member captures the nature
-- of the change, optionally casts the I Ching, optionally runs the
-- AIN council with hexagram context, and tracks the change over time.
--
-- The chain belongs to the person. MAIA enriches when invited.

-- ─── Primary Change Record ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS studio_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership: practitioner OR member (one must be set)
  practitioner_id UUID REFERENCES practitioners(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  client_id UUID REFERENCES practitioner_clients(id) ON DELETE SET NULL,
  team_id UUID REFERENCES studio_teams(id) ON DELETE SET NULL,

  -- Change context
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  change_type TEXT NOT NULL DEFAULT 'threshold'
    CHECK (change_type IN ('dissolution', 'emergence', 'threshold',
                           'integration', 'upheaval', 'ripening')),
  emotional_state TEXT,
  urgency TEXT DEFAULT 'none'
    CHECK (urgency IN ('none', 'low', 'medium', 'high', 'acute')),

  -- I Ching casting
  hexagram_number INTEGER CHECK (hexagram_number BETWEEN 1 AND 64),
  hexagram_name TEXT,
  relating_hexagram_number INTEGER CHECK (relating_hexagram_number BETWEEN 1 AND 64),
  changing_lines INTEGER[] DEFAULT '{}',
  casting_method TEXT CHECK (casting_method IN ('yarrow', 'coin', 'browsed')),
  cast_at TIMESTAMPTZ,

  -- AIN consultation result
  council_result JSONB,

  -- MAIA's I Ching interpretation
  hexagram_interpretation JSONB,

  -- Notes & questions
  notes TEXT,
  questions TEXT[] DEFAULT '{}',

  -- Mentor reflection
  mentor_reflection JSONB,
  follow_up_intention TEXT,

  -- Status lifecycle
  status TEXT NOT NULL DEFAULT 'naming'
    CHECK (status IN ('naming', 'casting', 'consulting',
                      'active', 'integrating', 'complete', 'archived')),
  iteration_count INTEGER NOT NULL DEFAULT 0,

  -- Change chain (spiral path)
  parent_change_id UUID REFERENCES studio_changes(id) ON DELETE SET NULL,
  root_change_id UUID REFERENCES studio_changes(id) ON DELETE SET NULL,

  -- Timestamps
  consulted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- At least one owner must be set
  CONSTRAINT chk_change_owner CHECK (
    practitioner_id IS NOT NULL OR member_id IS NOT NULL
  ),
  -- Chain consistency: if parent exists, root must exist
  CONSTRAINT chk_change_chain_consistency CHECK (
    (parent_change_id IS NULL)
    OR (parent_change_id IS NOT NULL AND root_change_id IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_studio_changes_practitioner
  ON studio_changes(practitioner_id) WHERE practitioner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_studio_changes_member
  ON studio_changes(member_id) WHERE member_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_studio_changes_client
  ON studio_changes(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_studio_changes_status
  ON studio_changes(status);
CREATE INDEX IF NOT EXISTS idx_studio_changes_created
  ON studio_changes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_studio_changes_hexagram
  ON studio_changes(hexagram_number) WHERE hexagram_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_studio_changes_parent
  ON studio_changes(parent_change_id) WHERE parent_change_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_studio_changes_root
  ON studio_changes(root_change_id) WHERE root_change_id IS NOT NULL;

-- Auto-update timestamp
DROP TRIGGER IF EXISTS tr_studio_changes_updated_at ON studio_changes;
CREATE TRIGGER tr_studio_changes_updated_at
  BEFORE UPDATE ON studio_changes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE studio_changes IS
  'Change navigation records — I Ching oracle + AIN council for navigating life transitions';

-- ─── Change Iterations ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS change_iterations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  change_id UUID NOT NULL REFERENCES studio_changes(id) ON DELETE CASCADE,
  iteration_number INTEGER NOT NULL,

  -- What the person brought to this round
  session_notes TEXT,
  updated_description TEXT,
  emotional_state TEXT,

  -- Optional re-cast for this iteration
  hexagram_number INTEGER CHECK (hexagram_number BETWEEN 1 AND 64),
  relating_hexagram_number INTEGER CHECK (relating_hexagram_number BETWEEN 1 AND 64),
  changing_lines INTEGER[] DEFAULT '{}',

  -- AIN council result
  council_result JSONB NOT NULL,

  -- Synthesis
  notes TEXT,
  questions TEXT[] DEFAULT '{}',

  -- Timestamps
  consulted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(change_id, iteration_number)
);

CREATE INDEX IF NOT EXISTS idx_change_iterations_change
  ON change_iterations(change_id, iteration_number);

COMMENT ON TABLE change_iterations IS
  'Council consultation history for changes — each round preserved with hexagram context';

-- ─── Change Experiences ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS change_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  change_id UUID NOT NULL REFERENCES studio_changes(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,

  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  experience_type TEXT NOT NULL
    CHECK (experience_type IN ('field_event', 'reflection', 'breakthrough',
                                'setback', 'dream', 'synchronicity')),
  content TEXT NOT NULL,

  -- Optional enrichment
  element TEXT CHECK (element IS NULL OR element IN ('fire', 'water', 'earth', 'air', 'aether')),
  hexagram_resonance INTEGER CHECK (hexagram_resonance IS NULL OR hexagram_resonance BETWEEN 1 AND 64),
  tags TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_change_experiences_change
  ON change_experiences(change_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_change_experiences_type
  ON change_experiences(change_id, experience_type);

COMMENT ON TABLE change_experiences IS
  'Field events, dreams, synchronicities between council consultations on a change';
