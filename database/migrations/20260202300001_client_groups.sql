-- Client Groups Schema
-- Formal groups for structured cohorts, workshops, and group sessions
-- Tags remain for ad-hoc categorization on individual clients

-- ============================================
-- CLIENT GROUPS (formal named groups)
-- ============================================
CREATE TABLE IF NOT EXISTS client_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL,  -- References practitioners.id (no FK constraint to match existing pattern)

    -- Group identity
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6366f1',  -- For UI display (indigo default)

    -- Group type
    group_type TEXT NOT NULL DEFAULT 'cohort' CHECK (group_type IN (
        'cohort',       -- Time-bound group (e.g., "Spring 2026 Workshop")
        'ongoing',      -- Ongoing group (e.g., "Monday Evening Group")
        'program',      -- Multi-session program (e.g., "12-Week Transformation")
        'category'      -- Business category (e.g., "Corporate Clients")
    )),

    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),

    -- Optional scheduling (for ongoing groups)
    meeting_day INT CHECK (meeting_day IS NULL OR (meeting_day >= 0 AND meeting_day <= 6)),  -- 0=Sunday
    meeting_time TIME,
    meeting_duration_minutes INT DEFAULT 90,
    meeting_location_type TEXT CHECK (meeting_location_type IS NULL OR meeting_location_type IN ('video', 'phone', 'in_person')),
    meeting_link TEXT,

    -- Program details (for cohort/program types)
    start_date DATE,
    end_date DATE,
    total_sessions INT,

    -- Capacity
    max_members INT,

    -- Notes
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_groups_practitioner ON client_groups(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_client_groups_status ON client_groups(practitioner_id, status);
CREATE INDEX IF NOT EXISTS idx_client_groups_type ON client_groups(practitioner_id, group_type);

-- ============================================
-- CLIENT GROUP MEMBERSHIP (many-to-many)
-- ============================================
CREATE TABLE IF NOT EXISTS client_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL,   -- References client_groups.id
    client_id UUID NOT NULL,  -- References practitioner_clients.id

    -- Membership status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped', 'waitlist')),

    -- Role within group (optional)
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'facilitator', 'observer')),

    -- Tracking
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    sessions_attended INT DEFAULT 0,

    -- Notes specific to this client in this group
    notes TEXT,

    UNIQUE(group_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_client_group_members_group ON client_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_client_group_members_client ON client_group_members(client_id);
CREATE INDEX IF NOT EXISTS idx_client_group_members_status ON client_group_members(group_id, status);

-- ============================================
-- GROUP SESSIONS (scheduled meetings for groups)
-- ============================================
CREATE TABLE IF NOT EXISTS group_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL,  -- References client_groups.id

    -- Session details
    title TEXT,  -- Optional override, defaults to group name + date
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,

    -- Status
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'
    )),

    -- Location
    location_type TEXT DEFAULT 'video' CHECK (location_type IN ('video', 'phone', 'in_person', 'async')),
    location_details TEXT,  -- Meeting link or address

    -- Session number (for programs)
    session_number INT,  -- e.g., "Session 3 of 12"

    -- Notes
    prep_notes TEXT,
    session_notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_group_sessions_group ON group_sessions(group_id);
CREATE INDEX IF NOT EXISTS idx_group_sessions_scheduled ON group_sessions(group_id, scheduled_start);
CREATE INDEX IF NOT EXISTS idx_group_sessions_status ON group_sessions(group_id, status);

-- ============================================
-- GROUP SESSION ATTENDANCE
-- ============================================
CREATE TABLE IF NOT EXISTS group_session_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,  -- References group_sessions.id
    client_id UUID NOT NULL,   -- References practitioner_clients.id

    -- Attendance status
    status TEXT NOT NULL DEFAULT 'expected' CHECK (status IN (
        'expected', 'confirmed', 'attended', 'absent', 'excused', 'cancelled'
    )),

    -- Notes for this attendance
    notes TEXT,

    UNIQUE(session_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_group_attendance_session ON group_session_attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_group_attendance_client ON group_session_attendance(client_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_client_groups_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS client_groups_updated_at ON client_groups;
CREATE TRIGGER client_groups_updated_at
  BEFORE UPDATE ON client_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_client_groups_timestamp();

DROP TRIGGER IF EXISTS group_sessions_updated_at ON group_sessions;
CREATE TRIGGER group_sessions_updated_at
  BEFORE UPDATE ON group_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_client_groups_timestamp();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE client_groups IS 'Formal client groups for cohorts, workshops, ongoing groups, and categories';
COMMENT ON TABLE client_group_members IS 'Many-to-many membership linking clients to groups';
COMMENT ON TABLE group_sessions IS 'Scheduled sessions for group meetings';
COMMENT ON TABLE group_session_attendance IS 'Track attendance for group sessions';

COMMENT ON COLUMN client_groups.group_type IS 'cohort=time-bound, ongoing=recurring, program=multi-session, category=business segmentation';
COMMENT ON COLUMN client_group_members.role IS 'member=participant, facilitator=co-facilitates, observer=auditing';
