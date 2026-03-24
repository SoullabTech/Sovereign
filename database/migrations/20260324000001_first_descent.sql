-- First Descent: threshold experience for new members
-- Stores the origin input and MAIA's constrained reply as a seed for continuity

CREATE TABLE IF NOT EXISTS member_first_descent (
    member_id       UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
    origin_input    TEXT NOT NULL,
    maia_reply      TEXT NOT NULL,
    prompt_version  TEXT,
    model_used      TEXT,
    completed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_first_descent_completed_at
    ON member_first_descent (completed_at);

-- Fast lookup flag on members table
ALTER TABLE members
    ADD COLUMN IF NOT EXISTS first_descent_completed BOOLEAN DEFAULT FALSE;
