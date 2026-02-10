-- Studio Schema for Solo Operator Command Center
-- Tracks delegated work, agent tasks, triage queue, and operator decisions

-- ============================================
-- TRIAGE QUEUE (incoming fires/bugs/requests)
-- ============================================
CREATE TABLE IF NOT EXISTS studio_triage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

    -- What came in
    title TEXT NOT NULL,
    description TEXT,
    source TEXT NOT NULL DEFAULT 'manual', -- 'manual', 'user_report', 'monitoring', 'agent'
    source_ref TEXT, -- external reference (github issue, user email, etc)

    -- Triage decision (Operator Gate 1)
    priority TEXT DEFAULT 'unset', -- 'unset', 'urgent', 'today', 'this_week', 'backlog', 'wont_fix'
    triaged_at TIMESTAMPTZ,

    -- Status
    status TEXT DEFAULT 'pending', -- 'pending', 'delegated', 'in_review', 'shipped', 'rejected'

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_studio_triage_member ON studio_triage(member_id);
CREATE INDEX IF NOT EXISTS idx_studio_triage_status ON studio_triage(status);
CREATE INDEX IF NOT EXISTS idx_studio_triage_priority ON studio_triage(priority);

-- ============================================
-- AGENT TASKS (delegated work)
-- ============================================
CREATE TABLE IF NOT EXISTS studio_agent_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    triage_id UUID REFERENCES studio_triage(id) ON DELETE SET NULL,

    -- Task definition
    title TEXT NOT NULL,
    prompt TEXT NOT NULL, -- the actual delegation prompt
    agent_type TEXT NOT NULL DEFAULT 'maia-dev', -- 'maia-dev', 'explore', 'maia-ops', etc

    -- Agent output
    status TEXT DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
    output TEXT, -- agent's response/work
    artifacts JSONB DEFAULT '[]', -- files changed, commands run, etc

    -- Review (Operator Gate 2)
    review_status TEXT, -- 'pending_review', 'approved', 'rejected', 'needs_changes'
    review_notes TEXT,
    reviewed_at TIMESTAMPTZ,

    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_studio_agent_tasks_member ON studio_agent_tasks(member_id);
CREATE INDEX IF NOT EXISTS idx_studio_agent_tasks_status ON studio_agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_studio_agent_tasks_review ON studio_agent_tasks(review_status);

-- ============================================
-- SHIPMENTS (things that went live)
-- ============================================
CREATE TABLE IF NOT EXISTS studio_shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    agent_task_id UUID REFERENCES studio_agent_tasks(id) ON DELETE SET NULL,
    triage_id UUID REFERENCES studio_triage(id) ON DELETE SET NULL,

    -- What shipped
    title TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'fix', -- 'fix', 'feature', 'content', 'deployment'

    -- Ship decision (Operator Gate 3)
    decision TEXT NOT NULL, -- 'shipped', 'rejected', 'deferred'
    decision_notes TEXT,

    -- Outcome tracking (proof signals)
    outcome_verified BOOLEAN DEFAULT FALSE,
    outcome_notes TEXT,

    shipped_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_studio_shipments_member ON studio_shipments(member_id);
CREATE INDEX IF NOT EXISTS idx_studio_shipments_type ON studio_shipments(type);

-- ============================================
-- DAILY LOG (operator time tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS studio_daily_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Time tracking (proof signal: <8 hrs)
    hours_at_computer DECIMAL(4,2),
    hours_debugging DECIMAL(4,2),
    hours_strategic DECIMAL(4,2),
    hours_content DECIMAL(4,2),
    hours_support DECIMAL(4,2),

    -- Counts (proof signals)
    fires_fought INTEGER DEFAULT 0,
    tasks_delegated INTEGER DEFAULT 0,
    tasks_reviewed INTEGER DEFAULT 0,
    shipments INTEGER DEFAULT 0,

    -- Notes
    notes TEXT,
    wins TEXT, -- what went well
    blocks TEXT, -- what blocked progress

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(member_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_studio_daily_log_member ON studio_daily_log(member_id);
CREATE INDEX IF NOT EXISTS idx_studio_daily_log_date ON studio_daily_log(log_date);

-- ============================================
-- PROOF SIGNALS (weekly/monthly aggregates)
-- ============================================
CREATE TABLE IF NOT EXISTS studio_proof_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    period_type TEXT NOT NULL, -- 'week', 'month'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Aggregated metrics
    avg_hours_per_day DECIMAL(4,2),
    total_fires_fought INTEGER DEFAULT 0,
    total_delegated INTEGER DEFAULT 0,
    total_shipped INTEGER DEFAULT 0,
    zero_debugging_days INTEGER DEFAULT 0,

    -- Computed proof
    target_hours_met BOOLEAN, -- was <8 hrs/day achieved?
    delegation_ratio DECIMAL(4,2), -- delegated / (delegated + self-done)

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(member_id, period_type, period_start)
);

CREATE INDEX IF NOT EXISTS idx_studio_proof_signals_member ON studio_proof_signals(member_id);
CREATE INDEX IF NOT EXISTS idx_studio_proof_signals_period ON studio_proof_signals(period_start);

-- ============================================
-- CLARITY GATE ARTIFACTS (saved orchestration plans)
-- ============================================
CREATE TABLE IF NOT EXISTS studio_clarity_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

    -- The artifact
    title TEXT NOT NULL,
    goal TEXT NOT NULL,
    target_who TEXT,
    proof_signals JSONB DEFAULT '[]',
    pipeline_steps JSONB DEFAULT '[]',
    operator_gates JSONB DEFAULT '[]',
    first_action TEXT,

    -- Status
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'archived'

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_studio_clarity_artifacts_member ON studio_clarity_artifacts(member_id);
CREATE INDEX IF NOT EXISTS idx_studio_clarity_artifacts_status ON studio_clarity_artifacts(status);
