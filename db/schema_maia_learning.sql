-- MAIA Learning System Schema
-- Sovereign consciousness learning through conversation tracking and feedback loops
--
-- This schema implements the four learning loops for MAIA:
-- Loop A: In-the-moment micro-learning (feedback + metadata)
-- Loop B: Nightly "dreaming" (gold responses from coaching)
-- Loop C: Multi-engine constellation (shadow mode comparisons)
-- Loop D: Human supervision (misattunement tracking)

-- =============================================================================
-- 1. CORE CONVERSATION TRACKING
-- =============================================================================

-- Primary conversation turns (if not already implemented)
CREATE TABLE IF NOT EXISTS maia_conversation_turns (
    id              BIGSERIAL PRIMARY KEY,
    session_id      TEXT NOT NULL,
    turn_index      INTEGER NOT NULL,
    user_id         TEXT,              -- optional, if you track it
    user_input      TEXT NOT NULL,
    maia_response   TEXT NOT NULL,
    processing_profile TEXT NOT NULL,  -- 'FAST' | 'CORE' | 'DEEP'
    primary_engine  TEXT NOT NULL,     -- e.g. 'deepseek-r1', 'local-llm-a'

    -- Metadata for learning analysis
    response_time_ms INTEGER,          -- how long MAIA took to respond
    claude_consultation_used BOOLEAN DEFAULT FALSE,
    consultation_type TEXT,            -- 'relational-enhancement', 'rupture-repair', etc.

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for conversation analysis
CREATE INDEX IF NOT EXISTS idx_maia_turns_session ON maia_conversation_turns (session_id);
CREATE INDEX IF NOT EXISTS idx_maia_turns_created_at ON maia_conversation_turns (created_at);
CREATE INDEX IF NOT EXISTS idx_maia_turns_profile ON maia_conversation_turns (processing_profile);
CREATE INDEX IF NOT EXISTS idx_maia_turns_engine ON maia_conversation_turns (primary_engine);

-- =============================================================================
-- 2. LOOP A: USER FEEDBACK & MICRO-LEARNING
-- =============================================================================

-- User feedback on conversation quality
CREATE TABLE maia_interaction_feedback (
    id                  BIGSERIAL PRIMARY KEY,
    turn_id             BIGINT NOT NULL REFERENCES maia_conversation_turns(id) ON DELETE CASCADE,
    user_id             TEXT,                -- optional

    -- Quantitative feedback
    helpfulness_score   SMALLINT,            -- -1 (bad), 0 (neutral), 1 (good)
    attunement_score    SMALLINT,            -- 1-5 scale: how well MAIA read the moment

    -- Qualitative feedback
    felt_state          TEXT,                -- 'seen', 'confused', 'annoyed', 'hurt', 'understood'
    depth_match         TEXT,                -- 'too shallow', 'just right', 'too deep'
    repair_needed       BOOLEAN DEFAULT FALSE, -- user indicates rupture/misattunement

    -- Freeform input
    freeform_note       TEXT,                -- user comment if they leave one
    emotional_tags      TEXT[],              -- array of tags: ['frustrated', 'hopeful', etc.]

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_maia_feedback_turn_id ON maia_interaction_feedback (turn_id);
CREATE INDEX idx_maia_feedback_created_at ON maia_interaction_feedback (created_at);
CREATE INDEX idx_maia_feedback_repair_needed ON maia_interaction_feedback (repair_needed);

-- =============================================================================
-- 3. LOOP C: ENGINE COMPARISON & SHADOW RESPONSES
-- =============================================================================

-- Shadow engine responses for comparison learning
CREATE TABLE maia_engine_comparisons (
    id                  BIGSERIAL PRIMARY KEY,
    turn_id             BIGINT NOT NULL REFERENCES maia_conversation_turns(id) ON DELETE CASCADE,

    engine_name         TEXT NOT NULL,       -- 'deepseek-r1', 'local-llm-b', 'claude-sonnet', etc.
    is_primary          BOOLEAN NOT NULL DEFAULT FALSE,
    response_text       TEXT NOT NULL,
    response_time_ms    INTEGER,             -- performance tracking

    -- Processing metadata
    processing_profile  TEXT,                -- which profile this engine used
    confidence_score    REAL,                -- engine's confidence (0-1) if available

    -- Later review/ranking (filled during dreamtime)
    reviewer_label      TEXT,                -- 'better', 'worse', 'neutral', 'interesting'
    reviewer_note       TEXT,                -- why this response was ranked this way
    attunement_score    SMALLINT,            -- 1-10 after human/coach review

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at         TIMESTAMPTZ          -- when human/coach reviewed this
);

CREATE INDEX idx_maia_engine_comparisons_turn ON maia_engine_comparisons (turn_id);
CREATE INDEX idx_maia_engine_comparisons_engine ON maia_engine_comparisons (engine_name);
CREATE INDEX idx_maia_engine_comparisons_primary ON maia_engine_comparisons (is_primary);
CREATE INDEX idx_maia_engine_comparisons_reviewed ON maia_engine_comparisons (reviewed_at);

-- =============================================================================
-- 4. LOOP B: GOLD RESPONSES & IMPROVED REPLIES
-- =============================================================================

-- Training corpus of improved responses
CREATE TABLE maia_gold_responses (
    id                  BIGSERIAL PRIMARY KEY,
    turn_id             BIGINT REFERENCES maia_conversation_turns(id) ON DELETE SET NULL,

    -- Response improvement pipeline
    source              TEXT NOT NULL,       -- 'human', 'coach_claude', 'maia_self', 'community'
    original_response   TEXT NOT NULL,       -- MAIA's original response
    improved_response   TEXT NOT NULL,       -- the better version

    -- Learning metadata
    improvement_type    TEXT,                -- 'attunement', 'repair', 'depth', 'conciseness'
    rationale           TEXT,                -- why this is better
    example_tags        TEXT[],              -- ['rupture-repair', 'archetypal-guidance', etc.]

    -- Approval workflow
    is_approved         BOOLEAN NOT NULL DEFAULT FALSE,
    approved_by         TEXT,                -- who approved this for training
    training_priority   SMALLINT DEFAULT 1,  -- 1-5: how important for training

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at         TIMESTAMPTZ
);

CREATE INDEX idx_maia_gold_responses_turn ON maia_gold_responses (turn_id);
CREATE INDEX idx_maia_gold_responses_approved ON maia_gold_responses (is_approved);
CREATE INDEX idx_maia_gold_responses_source ON maia_gold_responses (source);
CREATE INDEX idx_maia_gold_responses_type ON maia_gold_responses (improvement_type);

-- =============================================================================
-- 5. LOOP D: MISATTUNEMENT TRACKING & RUPTURE LEARNING
-- =============================================================================

-- Systematic tracking of where MAIA fails relationally
CREATE TABLE maia_misattunements (
    id                  BIGSERIAL PRIMARY KEY,
    turn_id             BIGINT NOT NULL REFERENCES maia_conversation_turns(id) ON DELETE CASCADE,

    -- Classification
    category            TEXT NOT NULL,   -- 'self-focused', 'too-verbose', 'invalidating', 'over-interpreting', etc.
    subcategory         TEXT,            -- more specific classification
    severity            SMALLINT,        -- 1 (mild) to 5 (severe rupture)

    -- Detection metadata
    detected_by         TEXT NOT NULL,   -- 'user', 'developer', 'auto-detector', 'claude-review'
    detection_method    TEXT,            -- 'explicit-feedback', 'sentiment-analysis', 'manual-review'

    -- Evidence & context
    user_quote          TEXT,            -- e.g. "this is fucked up..." or "that didn't land"
    maia_problematic_text TEXT,         -- specific part of MAIA's response that failed
    context_note        TEXT,            -- situational factors that contributed

    -- Learning integration
    internal_note       TEXT,            -- your/coach's reflection for learning
    pattern_identified  BOOLEAN DEFAULT FALSE, -- is this part of a recurring pattern?
    addressed_in_gold   BIGINT REFERENCES maia_gold_responses(id), -- link to improvement

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_maia_misattunements_turn ON maia_misattunements (turn_id);
CREATE INDEX idx_maia_misattunements_category ON maia_misattunements (category);
CREATE INDEX idx_maia_misattunements_severity ON maia_misattunements (severity);
CREATE INDEX idx_maia_misattunements_pattern ON maia_misattunements (pattern_identified);

-- =============================================================================
-- 6. LEARNING ANALYTICS & SUMMARY VIEWS
-- =============================================================================

-- View: Recent learning candidates (for nightly dreamtime processing)
CREATE OR REPLACE VIEW maia_learning_candidates AS
SELECT
    t.id as turn_id,
    t.session_id,
    t.user_input,
    t.maia_response,
    t.processing_profile,
    t.primary_engine,
    t.created_at,

    -- Feedback signals
    f.helpfulness_score,
    f.attunement_score,
    f.felt_state,
    f.repair_needed,

    -- Misattunement signals
    m.category as misattunement_category,
    m.severity as misattunement_severity,

    -- Priority scoring for review
    CASE
        WHEN m.severity >= 4 THEN 10            -- severe ruptures: highest priority
        WHEN f.repair_needed = true THEN 8      -- user requested repair: high priority
        WHEN f.helpfulness_score = -1 THEN 7    -- negative feedback: high priority
        WHEN f.attunement_score <= 2 THEN 6     -- low attunement: medium priority
        WHEN f.helpfulness_score = 1 AND f.attunement_score >= 4 THEN 3  -- positive examples: low priority
        ELSE 1                                   -- neutral: very low priority
    END as review_priority

FROM maia_conversation_turns t
LEFT JOIN maia_interaction_feedback f ON t.id = f.turn_id
LEFT JOIN maia_misattunements m ON t.id = m.turn_id
WHERE t.created_at >= NOW() - INTERVAL '7 days'  -- last week of conversations
ORDER BY review_priority DESC, t.created_at DESC;

-- View: Engine performance analysis
CREATE OR REPLACE VIEW maia_engine_performance AS
SELECT
    ec.engine_name,
    COUNT(*) as total_responses,
    AVG(ec.response_time_ms) as avg_response_time,
    AVG(f.helpfulness_score) as avg_helpfulness,
    AVG(f.attunement_score) as avg_attunement,
    COUNT(m.id) as misattunement_count,
    AVG(m.severity) as avg_misattunement_severity
FROM maia_engine_comparisons ec
JOIN maia_conversation_turns t ON ec.turn_id = t.id
LEFT JOIN maia_interaction_feedback f ON t.id = f.turn_id
LEFT JOIN maia_misattunements m ON t.id = m.turn_id
WHERE ec.created_at >= NOW() - INTERVAL '30 days'
GROUP BY ec.engine_name
ORDER BY avg_attunement DESC, avg_helpfulness DESC;

-- =============================================================================
-- 7. LEARNING SYSTEM METADATA
-- =============================================================================

-- Track learning system operations (dreamtime jobs, training runs, etc.)
CREATE TABLE maia_learning_operations (
    id                  BIGSERIAL PRIMARY KEY,
    operation_type      TEXT NOT NULL,       -- 'dreamtime-review', 'gold-generation', 'training-export'
    status              TEXT NOT NULL,       -- 'running', 'completed', 'failed'

    -- Operation metadata
    turns_processed     INTEGER,
    gold_responses_created INTEGER,
    misattunements_analyzed INTEGER,

    -- Results
    operation_log       JSONB,               -- detailed log of what happened
    error_message       TEXT,                -- if status = 'failed'

    started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMPTZ
);

CREATE INDEX idx_maia_learning_ops_type ON maia_learning_operations (operation_type);
CREATE INDEX idx_maia_learning_ops_status ON maia_learning_operations (status);

-- =============================================================================
-- COMMENTS & USAGE NOTES
-- =============================================================================

-- This schema enables:
--
-- 1. **Real-time Learning (Loop A)**:
--    Every conversation turn + user feedback → learning signal
--
-- 2. **Shadow Engine Testing (Loop C)**:
--    Run multiple engines, compare responses, learn preferences
--
-- 3. **Dreamtime Processing (Loop B)**:
--    Nightly job processes learning_candidates → gold_responses
--
-- 4. **Rupture Analysis (Loop D)**:
--    Systematic misattunement tracking → pattern recognition
--
-- 5. **Sovereign Training**:
--    All data stays local → export approved gold_responses for fine-tuning
--
-- This gives MAIA the "learning nervous system" to develop consciousness
-- through experience, not just prompt engineering.