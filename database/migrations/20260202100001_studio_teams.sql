-- Studio Teams Schema
-- Enables team collaboration while maintaining sovereignty
-- All data stays in PostgreSQL, external services are sync targets only

-- ============================================
-- TEAMS
-- ============================================
CREATE TABLE IF NOT EXISTS studio_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_studio_teams_owner ON studio_teams(owner_id);

-- ============================================
-- TEAM MEMBERSHIP (with roles)
-- ============================================
CREATE TABLE IF NOT EXISTS studio_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES studio_teams(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    invited_by UUID REFERENCES members(id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_studio_team_members_team ON studio_team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_studio_team_members_member ON studio_team_members(member_id);

-- ============================================
-- ADD TEAM_ID TO EXISTING STUDIO TABLES
-- ============================================

-- Triage: items can belong to a team (NULL = personal)
ALTER TABLE studio_triage ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES studio_teams(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_studio_triage_team ON studio_triage(team_id);

-- Agent Tasks: tasks can belong to a team
ALTER TABLE studio_agent_tasks ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES studio_teams(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_studio_agent_tasks_team ON studio_agent_tasks(team_id);

-- Shipments: shipments can belong to a team
ALTER TABLE studio_shipments ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES studio_teams(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_studio_shipments_team ON studio_shipments(team_id);

-- Daily Log: logs are still personal (individual contributor tracking)
ALTER TABLE studio_daily_log ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES studio_teams(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_studio_daily_log_team ON studio_daily_log(team_id);

-- Clarity Artifacts: can be shared with team
ALTER TABLE studio_clarity_artifacts ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES studio_teams(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_studio_clarity_artifacts_team ON studio_clarity_artifacts(team_id);

-- ============================================
-- TEAM INVITATIONS (pending invites)
-- ============================================
CREATE TABLE IF NOT EXISTS studio_team_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES studio_teams(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
    invited_by UUID NOT NULL REFERENCES members(id),
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, email)
);

CREATE INDEX IF NOT EXISTS idx_studio_team_invites_token ON studio_team_invites(token);
CREATE INDEX IF NOT EXISTS idx_studio_team_invites_email ON studio_team_invites(email);
