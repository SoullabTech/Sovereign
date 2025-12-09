-- backend: db/migrations/20251208_create_navigator_decisions.sql

-- If you don't already have this:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core table: one row per navigator decision
CREATE TABLE IF NOT EXISTS navigator_decisions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- identity
    member_id           TEXT NOT NULL,
    session_id          TEXT,
    decision_id         UUID NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- summary from SoulState
    awareness_level                 INTEGER,
    awareness_confidence            NUMERIC,
    nervous_system_load             TEXT,
    life_domain                     TEXT,
    spiral_phase                    TEXT,
    spiral_intensity                NUMERIC,
    detected_facet                  TEXT,
    harmony_index                   NUMERIC,
    total_intensity_load            NUMERIC,
    field_primary_theme             TEXT,
    field_similarity_percentile     NUMERIC,

    -- summary from NavigatorDecision
    recommended_protocol_id     TEXT,
    secondary_protocol_ids      TEXT[],
    guidance_tone               TEXT,
    depth_level                 TEXT,
    risk_flags                  TEXT[],
    requires_facilitator        BOOLEAN,

    -- full JSON for later introspection
    raw_soul_state      JSONB NOT NULL,
    raw_decision        JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_navigator_decisions_member_id
    ON navigator_decisions (member_id);

CREATE INDEX IF NOT EXISTS idx_navigator_decisions_created_at
    ON navigator_decisions (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_navigator_decisions_detected_facet
    ON navigator_decisions (detected_facet);

CREATE INDEX IF NOT EXISTS idx_navigator_decisions_life_domain
    ON navigator_decisions (life_domain);


-- Optional: feedback table, one row per feedback entry for a decision
CREATE TABLE IF NOT EXISTS navigator_feedback (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    decision_id     UUID NOT NULL REFERENCES navigator_decisions(decision_id) ON DELETE CASCADE,
    member_id       TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    rating          INTEGER,      -- e.g. 1–5
    source          TEXT,         -- 'member' | 'facilitator' | 'system'
    notes           TEXT
);

CREATE INDEX IF NOT EXISTS idx_navigator_feedback_decision_id
    ON navigator_feedback (decision_id);

CREATE INDEX IF NOT EXISTS idx_navigator_feedback_member_id
    ON navigator_feedback (member_id);