-- MAIA Memory Architecture Enhancements
-- Adds: conversation_memory_uses, memory_links, visibility columns, confidence decay support
--
-- Purpose:
-- 1. Track which memories MAIA used in each response (explainability + debugging)
-- 2. Enable typed relationships between memories (supports, contradicts, evolves, etc.)
-- 3. Add visibility controls for commons/sharing features
-- 4. Support confidence decay calculations

-- =============================================================================
-- 1. CONVERSATION MEMORY USES (Audit Trail)
-- =============================================================================
-- Tracks which memories were retrieved and used for each response.
-- Essential for debugging wrong recalls and user transparency.

CREATE TABLE IF NOT EXISTS conversation_memory_uses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         TEXT NOT NULL,
    session_id      TEXT NOT NULL,
    message_id      TEXT NOT NULL,           -- The response message where memory was used

    -- Memory reference (polymorphic - can point to different memory tables)
    memory_table    TEXT NOT NULL,           -- 'developmental_memories', 'episodic_memories', etc.
    memory_id       TEXT NOT NULL,           -- UUID or ID from the source table

    -- How the memory was used
    used_as         TEXT NOT NULL CHECK (used_as IN (
        'preference',      -- User preference applied
        'evidence',        -- Supporting evidence for insight
        'pattern',         -- Derived pattern referenced
        'counterexample',  -- Contrasting memory for nuance
        'context',         -- Background context
        'breakthrough'     -- Referenced breakthrough moment
    )),

    -- Retrieval scoring (for debugging and improvement)
    retrieval_score NUMERIC(4,3),            -- 0.000 to 1.000 - how highly it ranked
    semantic_score  NUMERIC(4,3),            -- Vector similarity component
    recency_score   NUMERIC(4,3),            -- Time decay component
    confidence_score NUMERIC(4,3),           -- Memory's confidence at time of use

    -- Did it help?
    user_feedback   TEXT CHECK (user_feedback IN ('helpful', 'irrelevant', 'wrong', NULL)),
    feedback_note   TEXT,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_conv_mem_uses_user_session
    ON conversation_memory_uses(user_id, session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conv_mem_uses_memory
    ON conversation_memory_uses(memory_table, memory_id);
CREATE INDEX IF NOT EXISTS idx_conv_mem_uses_message
    ON conversation_memory_uses(message_id);
CREATE INDEX IF NOT EXISTS idx_conv_mem_uses_used_as
    ON conversation_memory_uses(used_as);

-- =============================================================================
-- 2. MEMORY LINKS (Cross-Memory Relationships)
-- =============================================================================
-- Enables explicit relationships between memories:
-- - Pattern beads linking to supporting evidence
-- - Contradiction detection
-- - Evolution chains (how understanding developed)

CREATE TABLE IF NOT EXISTS memory_links (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         TEXT NOT NULL,

    -- Source memory (polymorphic)
    from_table      TEXT NOT NULL,
    from_id         TEXT NOT NULL,

    -- Target memory (polymorphic)
    to_table        TEXT NOT NULL,
    to_id           TEXT NOT NULL,

    -- Relationship type
    link_type       TEXT NOT NULL CHECK (link_type IN (
        'supports',        -- Memory A supports/evidences Memory B
        'contradicts',     -- Memory A contradicts Memory B
        'evolves',         -- Memory A is an evolution/update of Memory B
        'repeats',         -- Memory A is a recurrence of Memory B pattern
        'triggers',        -- Memory A triggered Memory B (causal)
        'derives_from'     -- Memory A was derived/synthesized from Memory B
    )),

    -- Link strength/confidence
    weight          NUMERIC(3,2) NOT NULL DEFAULT 1.0 CHECK (weight >= 0 AND weight <= 5),
    confidence      NUMERIC(3,2) NOT NULL DEFAULT 0.8 CHECK (confidence >= 0 AND confidence <= 1),

    -- Provenance
    created_by      TEXT NOT NULL DEFAULT 'system' CHECK (created_by IN (
        'system',          -- Automatic detection
        'user',            -- User-confirmed link
        'synthesis_job',   -- Pattern synthesis process
        'maia'             -- MAIA inferred during conversation
    )),

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Prevent duplicate links
    UNIQUE(from_table, from_id, to_table, to_id, link_type)
);

-- Indexes for graph traversal
CREATE INDEX IF NOT EXISTS idx_memory_links_from
    ON memory_links(user_id, from_table, from_id);
CREATE INDEX IF NOT EXISTS idx_memory_links_to
    ON memory_links(user_id, to_table, to_id);
CREATE INDEX IF NOT EXISTS idx_memory_links_type
    ON memory_links(link_type);

-- =============================================================================
-- 3. VISIBILITY COLUMNS (for Commons/Sharing)
-- =============================================================================
-- Add visibility controls to existing memory tables

-- Add to developmental_memories
ALTER TABLE developmental_memories
    ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private', 'shared', 'commons', 'anonymized'));

ALTER TABLE developmental_memories
    ADD COLUMN IF NOT EXISTS share_scope JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Add to user_relationship_context
ALTER TABLE user_relationship_context
    ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private', 'shared', 'commons', 'anonymized'));

-- Add to conversation_turns (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversation_turns') THEN
        ALTER TABLE conversation_turns
            ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'private';
    END IF;
END $$;

-- Index for visibility filtering
CREATE INDEX IF NOT EXISTS idx_dev_memories_visibility
    ON developmental_memories(user_id, visibility);

-- =============================================================================
-- 4. CONFIDENCE DECAY SUPPORT
-- =============================================================================
-- Add columns needed for confidence decay calculations

-- Add last_confirmed_at for preference drift handling
ALTER TABLE developmental_memories
    ADD COLUMN IF NOT EXISTS last_confirmed_at TIMESTAMPTZ;

-- Add valid_from/valid_to for time-bounded memories
ALTER TABLE developmental_memories
    ADD COLUMN IF NOT EXISTS valid_from TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE developmental_memories
    ADD COLUMN IF NOT EXISTS valid_to TIMESTAMPTZ;

-- Add confirmed_by_user flag
ALTER TABLE developmental_memories
    ADD COLUMN IF NOT EXISTS confirmed_by_user BOOLEAN NOT NULL DEFAULT false;

-- Index for active memories (supports validity filtering)
-- Note: Cannot use NOW() in partial index; use valid_to directly
CREATE INDEX IF NOT EXISTS idx_dev_memories_valid_to
    ON developmental_memories(user_id, valid_to)
    WHERE valid_to IS NULL;

-- =============================================================================
-- 5. HELPER FUNCTION: Calculate Decayed Confidence
-- =============================================================================
-- Returns confidence adjusted for time since last confirmation
-- Half-lives: preferences=365d, events=90d, dreams=60d, patterns=180d

CREATE OR REPLACE FUNCTION calculate_decayed_confidence(
    base_confidence NUMERIC,
    memory_type TEXT,
    last_confirmed TIMESTAMPTZ,
    formed_at TIMESTAMPTZ
) RETURNS NUMERIC AS $$
DECLARE
    half_life_days INTEGER;
    reference_date TIMESTAMPTZ;
    days_elapsed NUMERIC;
    decay_factor NUMERIC;
BEGIN
    -- Determine half-life based on memory type
    half_life_days := CASE memory_type
        WHEN 'preference' THEN 365
        WHEN 'boundary' THEN 365
        WHEN 'event' THEN 90
        WHEN 'dream' THEN 60
        WHEN 'pattern' THEN 180
        WHEN 'effective_practice' THEN 120
        WHEN 'ineffective_practice' THEN 60
        WHEN 'breakthrough_emergence' THEN 180
        ELSE 90
    END;

    -- Use last_confirmed if available, otherwise formed_at
    reference_date := COALESCE(last_confirmed, formed_at);

    -- Calculate days since reference
    days_elapsed := EXTRACT(EPOCH FROM (NOW() - reference_date)) / 86400.0;

    -- Exponential decay: confidence * 2^(-days/half_life)
    decay_factor := POWER(2, -days_elapsed / half_life_days);

    -- Minimum confidence floor of 0.3 (never forget completely)
    RETURN GREATEST(0.3, base_confidence * decay_factor);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================================================
-- 6. VIEW: Memories with Decayed Confidence
-- =============================================================================
-- Convenience view that shows memories with their current effective confidence

CREATE OR REPLACE VIEW developmental_memories_with_decay AS
SELECT
    dm.*,
    calculate_decayed_confidence(
        dm.significance,
        dm.memory_type,
        dm.last_confirmed_at,
        dm.formed_at
    ) AS effective_confidence
FROM developmental_memories dm
WHERE dm.valid_to IS NULL OR dm.valid_to > NOW();

-- =============================================================================
-- 7. PREFERENCE CONFIRMATION TRACKING
-- =============================================================================
-- Table to track when preferences were confirmed/updated by user

CREATE TABLE IF NOT EXISTS preference_confirmations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         TEXT NOT NULL,
    memory_id       TEXT NOT NULL,           -- Reference to developmental_memories.id

    -- Confirmation details
    action          TEXT NOT NULL CHECK (action IN (
        'confirmed',       -- User confirmed preference is still accurate
        'updated',         -- User updated the preference content
        'expired',         -- User marked preference as no longer relevant
        'restored'         -- User restored a previously expired preference
    )),

    previous_content TEXT,                   -- For 'updated' - what it was before
    new_content     TEXT,                    -- For 'updated' - what it became

    -- Context
    triggered_by    TEXT NOT NULL DEFAULT 'manual' CHECK (triggered_by IN (
        'manual',          -- User initiated
        'prompt',          -- MAIA asked "is this still true?"
        'drift_detected',  -- System detected possible drift
        'session_start'    -- Routine confirmation at session start
    )),

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pref_confirms_user_memory
    ON preference_confirmations(user_id, memory_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pref_confirms_action
    ON preference_confirmations(action);

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE conversation_memory_uses IS
    'Audit trail of which memories MAIA used in each response. Essential for debugging and transparency.';

COMMENT ON TABLE memory_links IS
    'Cross-memory relationships enabling pattern derivation and contradiction detection.';

COMMENT ON TABLE preference_confirmations IS
    'Tracks user confirmations/updates to preferences for drift handling.';

COMMENT ON FUNCTION calculate_decayed_confidence IS
    'Calculates effective confidence with exponential decay based on memory type half-lives.';
