-- Threshold Passages Schema
-- A discernment passage for helpers entering Soullab as practitioners
-- Not training. Not certification. A structured period of reflection.
--
-- Design: Minimal by intent. The Threshold is relational, not data-intensive.
-- We track state (which week), reflections (owned by the member), and completion.
-- We do not track engagement metrics, scores, or performance indicators.

-- ============================================
-- THRESHOLD PASSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS threshold_passages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

    -- State: where they are in the passage
    -- week_0 = orientation conversation
    -- week_1 through week_6 = the six touchpoints
    -- completed = walked through
    -- withdrew = chose to stop (this is a valid outcome)
    current_week VARCHAR(20) NOT NULL DEFAULT 'not_started'
        CHECK (current_week IN (
            'not_started',
            'week_0', 'week_1', 'week_2', 'week_3',
            'week_4', 'week_5', 'week_6',
            'completed', 'withdrew'
        )),

    -- Which cohort (links to client_groups for the facilitated circles)
    cohort_group_id UUID REFERENCES client_groups(id),

    -- Reflections: owned entirely by the member
    -- Structure: { "week_1": { "text": "...", "saved_at": "..." }, ... }
    -- Exportable. Deletable. Never analyzed without consent.
    reflections JSONB NOT NULL DEFAULT '{}',

    -- The member's own accountability statement (week 6)
    -- Stored separately because it has a distinct function
    accountability_statement TEXT,

    -- Consent: explicit agreement to begin the passage
    consent_given_at TIMESTAMPTZ,

    -- Completion
    completed_at TIMESTAMPTZ,
    withdrew_at TIMESTAMPTZ,
    withdrawal_reason TEXT, -- optional, their words only

    -- Timestamps
    started_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- One passage per member (they don't repeat this)
CREATE UNIQUE INDEX idx_threshold_member ON threshold_passages(member_id);

-- Cohort lookup
CREATE INDEX idx_threshold_cohort ON threshold_passages(cohort_group_id);

-- State lookup (for facilitator dashboard)
CREATE INDEX idx_threshold_state ON threshold_passages(current_week)
    WHERE current_week NOT IN ('completed', 'withdrew', 'not_started');

-- ============================================
-- PRACTITIONER COMMONS TERRITORY
-- ============================================
-- A quiet space for helpers who have walked the Threshold.
-- Gated by threshold completion, not tier.

INSERT INTO community_territories (slug, name, description, icon, sort_order, min_contribution_tier)
VALUES (
    'practitioner-commons',
    'The Practitioner Commons',
    'A quiet space for helpers who have walked the Threshold. Reflection, consultation, and seasonal gathering.',
    '🏠',
    9,
    'threshold_completed'
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- Sub-territories
INSERT INTO community_territories (slug, name, description, icon, parent_id, sort_order) VALUES
    ('commons-reflection', 'Reflection',
     'Share what the work is teaching you. No advice unless asked.',
     '🪞',
     (SELECT id FROM community_territories WHERE slug = 'practitioner-commons'), 1),
    ('commons-consultation', 'Consultation',
     'Bring a question from your practice. Peer support, not supervision.',
     '🤝',
     (SELECT id FROM community_territories WHERE slug = 'practitioner-commons'), 2),
    ('commons-seasonal', 'Seasonal',
     'Gatherings, cohort reflections, and the rhythms of shared practice.',
     '🌿',
     (SELECT id FROM community_territories WHERE slug = 'practitioner-commons'), 3)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_threshold_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS threshold_updated_at ON threshold_passages;
CREATE TRIGGER threshold_updated_at
    BEFORE UPDATE ON threshold_passages
    FOR EACH ROW
    EXECUTE FUNCTION update_threshold_timestamp();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE threshold_passages IS 'Tracks a helper''s passage through the Soullab Threshold — a discernment process, not a certification';
COMMENT ON COLUMN threshold_passages.reflections IS 'JSONB of weekly reflections, owned by the member. Exportable and deletable at any time';
COMMENT ON COLUMN threshold_passages.accountability_statement IS 'The helper''s own words about what they''re willing to be held accountable for. Written in week 6';
COMMENT ON COLUMN threshold_passages.withdrew IS 'Withdrawal is a valid outcome. The passage did its job if someone decides this is not for them';
