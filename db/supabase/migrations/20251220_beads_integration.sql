-- ==============================================================================
-- BEADS MEMORY INTEGRATION SCHEMA
-- ==============================================================================
-- Migration: Integrate Beads task memory with MAIA consciousness tracking
-- Created: 2025-12-20
-- Description: Bi-directional sync between Beads SQLite and PostgreSQL

-- ==============================================================================
-- 1. BEADS TASKS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS beads_tasks (
    -- Beads identifiers
    beads_id TEXT PRIMARY KEY,
    beads_hash TEXT UNIQUE NOT NULL,  -- SHA-256 of JSONL entry for conflict detection

    -- MAIA user context
    user_id TEXT NOT NULL,
    session_id TEXT,

    -- Task metadata from Beads
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'blocked', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

    -- MAIA Spiral extensions
    element TEXT CHECK (element IN ('earth', 'water', 'fire', 'air', 'aether')),
    phase INTEGER CHECK (phase IN (1, 2, 3)),
    archetype TEXT,
    realm TEXT CHECK (realm IN ('UNDERWORLD', 'MIDDLEWORLD', 'UPPERWORLD_SYMBOLIC')),

    -- Cognitive context
    required_level INTEGER CHECK (required_level BETWEEN 1 AND 6),
    recommended_level INTEGER CHECK (recommended_level BETWEEN 1 AND 6),
    bypass_risk TEXT CHECK (bypass_risk IN ('none', 'spiritual', 'intellectual')),

    -- Somatic context
    body_region TEXT,
    tension_level INTEGER CHECK (tension_level BETWEEN 1 AND 10),
    practice_name TEXT,

    -- Field context
    intensity TEXT CHECK (intensity IN ('low', 'medium', 'high')),
    safety_check BOOLEAN DEFAULT false,
    coherence_required DECIMAL(3,2) CHECK (coherence_required BETWEEN 0 AND 1),

    -- Evolution tracking
    first_appearance TIMESTAMP NOT NULL DEFAULT NOW(),
    last_worked TIMESTAMP,
    completion_count INTEGER DEFAULT 0,
    integration_level INTEGER CHECK (integration_level BETWEEN 1 AND 10),

    -- Experience design
    experience_type TEXT CHECK (experience_type IN ('direct_information', 'somatic_inquiry', 'imaginative_journey', 'reflective_practice', 'personal_quest')),
    readiness_level INTEGER CHECK (readiness_level BETWEEN 1 AND 10),
    layer_depth TEXT CHECK (layer_depth IN ('personal', 'interpersonal', 'transpersonal', 'universal')),

    -- Beads raw data (for full fidelity)
    raw_jsonl JSONB NOT NULL,

    -- Sync metadata
    synced_from_beads TIMESTAMP DEFAULT NOW(),
    synced_to_beads TIMESTAMP,
    sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'conflict', 'error')),

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_beads_tasks_user ON beads_tasks(user_id);
CREATE INDEX idx_beads_tasks_status ON beads_tasks(status);
CREATE INDEX idx_beads_tasks_element ON beads_tasks(element);
CREATE INDEX idx_beads_tasks_phase ON beads_tasks(element, phase);
CREATE INDEX idx_beads_tasks_sync ON beads_tasks(sync_status);
CREATE INDEX idx_beads_tasks_session ON beads_tasks(session_id);

-- ==============================================================================
-- 2. BEADS DEPENDENCIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS beads_dependencies (
    id SERIAL PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES beads_tasks(beads_id) ON DELETE CASCADE,
    depends_on_id TEXT NOT NULL,  -- May not exist yet
    dependency_type TEXT NOT NULL CHECK (dependency_type IN ('blocks', 'depends_on', 'related', 'discovered_from')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    UNIQUE(task_id, depends_on_id, dependency_type)
);

CREATE INDEX idx_beads_deps_task ON beads_dependencies(task_id);
CREATE INDEX idx_beads_deps_depends ON beads_dependencies(depends_on_id);

-- ==============================================================================
-- 3. BEADS LOGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS beads_logs (
    id SERIAL PRIMARY KEY,
    beads_id TEXT NOT NULL REFERENCES beads_tasks(beads_id) ON DELETE CASCADE,

    -- Log entry content
    message TEXT NOT NULL,
    log_metadata JSONB,

    -- Effectiveness tracking
    effectiveness INTEGER CHECK (effectiveness BETWEEN 1 AND 10),
    somatic_before INTEGER CHECK (somatic_before BETWEEN 1 AND 10),
    somatic_after INTEGER CHECK (somatic_after BETWEEN 1 AND 10),
    insight TEXT,
    breakthrough BOOLEAN DEFAULT false,

    -- Timestamps
    logged_at TIMESTAMP NOT NULL DEFAULT NOW(),
    synced_from_beads TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_beads_logs_task ON beads_logs(beads_id);
CREATE INDEX idx_beads_logs_breakthrough ON beads_logs(breakthrough) WHERE breakthrough = true;

-- ==============================================================================
-- 4. BEADS SYNC STATUS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS beads_sync_status (
    id SERIAL PRIMARY KEY,

    -- Sync metadata
    sync_type TEXT NOT NULL CHECK (sync_type IN ('beads_to_postgres', 'postgres_to_beads', 'bidirectional')),
    sync_started TIMESTAMP NOT NULL DEFAULT NOW(),
    sync_completed TIMESTAMP,
    sync_duration_ms INTEGER,

    -- Sync results
    tasks_synced INTEGER DEFAULT 0,
    logs_synced INTEGER DEFAULT 0,
    conflicts_detected INTEGER DEFAULT 0,
    errors_encountered INTEGER DEFAULT 0,

    -- Error details
    error_details JSONB,

    -- Status
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed', 'partial'))
);

CREATE INDEX idx_beads_sync_status_type ON beads_sync_status(sync_type);
CREATE INDEX idx_beads_sync_status_started ON beads_sync_status(sync_started DESC);

-- ==============================================================================
-- 5. CONSCIOUSNESS EVENT TO TASK MAPPING
-- ==============================================================================
-- Links MAIA consciousness events to created Beads tasks
CREATE TABLE IF NOT EXISTS consciousness_event_tasks (
    id SERIAL PRIMARY KEY,

    -- Event context
    user_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    event_data JSONB NOT NULL,

    -- Created task
    beads_task_id TEXT NOT NULL REFERENCES beads_tasks(beads_id),

    -- Creation metadata
    auto_created BOOLEAN DEFAULT true,
    creation_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consciousness_event_tasks_user ON consciousness_event_tasks(user_id);
CREATE INDEX idx_consciousness_event_tasks_session ON consciousness_event_tasks(session_id);
CREATE INDEX idx_consciousness_event_tasks_type ON consciousness_event_tasks(event_type);

-- ==============================================================================
-- 6. TRIGGERS FOR AUTO-UPDATE
-- ==============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_beads_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_beads_tasks_updated_at
    BEFORE UPDATE ON beads_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_beads_tasks_updated_at();

-- ==============================================================================
-- 7. NOTIFICATION TRIGGERS FOR REAL-TIME SYNC
-- ==============================================================================

-- Notify on task changes for real-time sync
CREATE OR REPLACE FUNCTION notify_beads_task_change()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'beads_task_changed',
        json_build_object(
            'operation', TG_OP,
            'beads_id', COALESCE(NEW.beads_id, OLD.beads_id),
            'user_id', COALESCE(NEW.user_id, OLD.user_id),
            'status', COALESCE(NEW.status, OLD.status)
        )::text
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_beads_task_change
    AFTER INSERT OR UPDATE OR DELETE ON beads_tasks
    FOR EACH ROW
    EXECUTE FUNCTION notify_beads_task_change();

-- ==============================================================================
-- 8. VIEWS FOR COMMON QUERIES
-- ==============================================================================

-- Ready tasks view (unblocked, cognitively appropriate)
CREATE OR REPLACE VIEW v_beads_ready_tasks AS
SELECT
    bt.*,
    COALESCE(
        (
            SELECT COUNT(*)
            FROM beads_dependencies bd
            JOIN beads_tasks blocking ON bd.depends_on_id = blocking.beads_id
            WHERE bd.task_id = bt.beads_id
            AND bd.dependency_type = 'depends_on'
            AND blocking.status != 'completed'
        ),
        0
    ) as blocking_count
FROM beads_tasks bt
WHERE bt.status IN ('todo', 'in_progress')
HAVING blocking_count = 0;

-- Task effectiveness summary
CREATE OR REPLACE VIEW v_beads_task_effectiveness AS
SELECT
    bt.beads_id,
    bt.title,
    bt.element,
    bt.phase,
    bt.practice_name,
    COUNT(bl.id) as log_count,
    AVG(bl.effectiveness) as avg_effectiveness,
    AVG(bl.somatic_before - bl.somatic_after) as avg_somatic_improvement,
    COUNT(*) FILTER (WHERE bl.breakthrough = true) as breakthrough_count,
    bt.completion_count,
    bt.integration_level
FROM beads_tasks bt
LEFT JOIN beads_logs bl ON bt.beads_id = bl.beads_id
WHERE bt.status = 'completed'
GROUP BY bt.beads_id, bt.title, bt.element, bt.phase, bt.practice_name, bt.completion_count, bt.integration_level;

-- Element balance view (distribution of active tasks)
CREATE OR REPLACE VIEW v_beads_element_balance AS
SELECT
    user_id,
    element,
    COUNT(*) as active_task_count,
    AVG(integration_level) as avg_integration,
    ARRAY_AGG(beads_id ORDER BY priority DESC, created_at ASC) FILTER (WHERE status IN ('todo', 'in_progress')) as active_task_ids
FROM beads_tasks
WHERE status IN ('todo', 'in_progress')
GROUP BY user_id, element;

-- ==============================================================================
-- 9. HELPER FUNCTIONS
-- ==============================================================================

-- Get ready tasks for a user (with cognitive filtering)
CREATE OR REPLACE FUNCTION get_ready_tasks_for_user(
    p_user_id TEXT,
    p_cognitive_level INTEGER DEFAULT 6,
    p_spiritual_bypassing DECIMAL DEFAULT 0,
    p_intellectual_bypassing DECIMAL DEFAULT 0,
    p_coherence DECIMAL DEFAULT 1
)
RETURNS TABLE (
    beads_id TEXT,
    title TEXT,
    element TEXT,
    phase INTEGER,
    priority TEXT,
    required_level INTEGER,
    integration_level INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        vrt.beads_id,
        vrt.title,
        vrt.element,
        vrt.phase,
        vrt.priority,
        vrt.required_level,
        vrt.integration_level
    FROM v_beads_ready_tasks vrt
    WHERE vrt.user_id = p_user_id
    -- Cognitive level gate
    AND vrt.required_level <= p_cognitive_level
    -- Bypassing gate
    AND NOT (vrt.bypass_risk = 'spiritual' AND p_spiritual_bypassing > 0.3)
    AND NOT (vrt.bypass_risk = 'intellectual' AND p_intellectual_bypassing > 0.3)
    -- Field coherence gate
    AND (vrt.coherence_required IS NULL OR vrt.coherence_required <= p_coherence)
    ORDER BY
        -- Prioritize by match and priority
        CASE
            WHEN vrt.element = (SELECT element FROM beads_tasks WHERE user_id = p_user_id ORDER BY last_worked DESC LIMIT 1) THEN 0
            ELSE 1
        END,
        CASE vrt.priority
            WHEN 'urgent' THEN 4
            WHEN 'high' THEN 3
            WHEN 'medium' THEN 2
            ELSE 1
        END DESC,
        vrt.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Record task completion with effectiveness
CREATE OR REPLACE FUNCTION record_task_completion(
    p_beads_id TEXT,
    p_effectiveness INTEGER,
    p_somatic_before INTEGER DEFAULT NULL,
    p_somatic_after INTEGER DEFAULT NULL,
    p_insight TEXT DEFAULT NULL,
    p_breakthrough BOOLEAN DEFAULT false
)
RETURNS void AS $$
BEGIN
    -- Update task status
    UPDATE beads_tasks
    SET
        status = 'completed',
        last_worked = NOW(),
        completion_count = completion_count + 1,
        integration_level = LEAST(10, integration_level + (p_effectiveness / 10)),
        sync_status = 'pending'  -- Mark for sync to Beads
    WHERE beads_id = p_beads_id;

    -- Insert log entry
    INSERT INTO beads_logs (
        beads_id,
        message,
        effectiveness,
        somatic_before,
        somatic_after,
        insight,
        breakthrough,
        log_metadata
    ) VALUES (
        p_beads_id,
        format('Completed with effectiveness %s/10', p_effectiveness),
        p_effectiveness,
        p_somatic_before,
        p_somatic_after,
        p_insight,
        p_breakthrough,
        json_build_object(
            'completion_timestamp', NOW(),
            'auto_logged', true
        )
    );
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 10. GRANT PERMISSIONS (adjust as needed for your setup)
-- ==============================================================================

-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO maia_service_role;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO maia_service_role;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO maia_service_role;

-- ==============================================================================
-- MIGRATION COMPLETE
-- ==============================================================================

COMMENT ON TABLE beads_tasks IS 'Synchronized Beads tasks with MAIA consciousness extensions';
COMMENT ON TABLE beads_logs IS 'Task completion logs with effectiveness tracking';
COMMENT ON TABLE beads_sync_status IS 'Sync job tracking for Beads <-> PostgreSQL';
COMMENT ON VIEW v_beads_ready_tasks IS 'Tasks ready to work on (no blockers)';
COMMENT ON FUNCTION get_ready_tasks_for_user IS 'Get cognitively-appropriate ready tasks for a user';
