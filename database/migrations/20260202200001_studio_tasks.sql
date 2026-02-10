-- Studio Tasks Schema
-- General task management for practitioners (separate from agent delegation)
-- Supports teams, priorities, projects, subtasks, and assignees

-- ============================================
-- STUDIO TASKS (general task management)
-- ============================================
CREATE TABLE IF NOT EXISTS studio_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    team_id UUID REFERENCES studio_teams(id) ON DELETE SET NULL,

    -- Task content
    title TEXT NOT NULL,
    description TEXT,

    -- Status & Priority
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'delegated', 'completed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

    -- Scheduling
    due_date DATE,
    due_time TIME,

    -- Organization
    project TEXT,
    tags TEXT[] DEFAULT '{}',

    -- Assignment (for delegated tasks)
    assignee TEXT,  -- Can be a team member name or agent type

    -- Subtasks stored as JSONB array
    subtasks JSONB DEFAULT '[]',
    -- Example: [{"id": "uuid", "title": "Write docs", "done": false}]

    -- Timestamps
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_studio_tasks_member ON studio_tasks(member_id);
CREATE INDEX IF NOT EXISTS idx_studio_tasks_team ON studio_tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_studio_tasks_status ON studio_tasks(status);
CREATE INDEX IF NOT EXISTS idx_studio_tasks_priority ON studio_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_studio_tasks_due ON studio_tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_studio_tasks_project ON studio_tasks(project) WHERE project IS NOT NULL;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_studio_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS studio_tasks_updated_at ON studio_tasks;
CREATE TRIGGER studio_tasks_updated_at
  BEFORE UPDATE ON studio_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_studio_tasks_updated_at();

-- ============================================
-- STUDIO PROJECTS (optional organization)
-- ============================================
CREATE TABLE IF NOT EXISTS studio_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    team_id UUID REFERENCES studio_teams(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6366f1',  -- Indigo default
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_studio_projects_member ON studio_projects(member_id);
CREATE INDEX IF NOT EXISTS idx_studio_projects_team ON studio_projects(team_id);
