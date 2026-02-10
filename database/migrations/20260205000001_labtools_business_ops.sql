-- =============================================================================
-- LABTOOLS BUSINESS OPERATIONS SCHEMA
-- Practitioner OS Business Operations Extension
-- Migration: 20260205000001_labtools_business_ops.sql
-- =============================================================================
--
-- Philosophy: Labtools extends the relational ledger for business operations:
-- ventures, network relationships, meetings, and pipeline tracking.
-- This is complementary to the clinical/coaching container system.
--
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ENUMS
-- -----------------------------------------------------------------------------

-- Venture types (categories of business initiatives)
DO $$ BEGIN
  CREATE TYPE venture_type AS ENUM (
    'maia_rd',        -- MAIA research & development
    'soullab_rd',     -- SoulLab research & development
    'marketing',      -- Marketing initiatives
    'sales',          -- Sales initiatives
    'partnerships',   -- Partnership development
    'operations',     -- Operational improvements
    'content',        -- Content creation
    'events'          -- Events & workshops
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Opportunity stages (pipeline progression)
DO $$ BEGIN
  CREATE TYPE opportunity_stage AS ENUM (
    'lead',           -- Initial contact/interest
    'qualified',      -- Qualified prospect
    'proposal',       -- Proposal sent
    'negotiation',    -- In negotiation
    'closed_won',     -- Deal closed - won
    'closed_lost'     -- Deal closed - lost
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Meeting types
DO $$ BEGIN
  CREATE TYPE meeting_type AS ENUM (
    'internal',       -- Team/internal meetings
    'external',       -- External meetings
    'discovery',      -- Discovery calls
    'followup',       -- Follow-up meetings
    'review'          -- Review meetings
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Meeting status
DO $$ BEGIN
  CREATE TYPE meeting_status AS ENUM (
    'scheduled',
    'completed',
    'canceled',
    'no_show'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Person relationship type (business context)
DO $$ BEGIN
  CREATE TYPE person_relationship_type AS ENUM (
    'client',
    'prospect',
    'partner',
    'vendor',
    'team_member',
    'advisor',
    'investor',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- -----------------------------------------------------------------------------
-- TABLES
-- -----------------------------------------------------------------------------

-- =============================================================================
-- VENTURES
-- Business initiatives and projects
-- =============================================================================

CREATE TABLE IF NOT EXISTS rl_ventures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership
  practice_id UUID NOT NULL REFERENCES rl_practices(id) ON DELETE CASCADE,

  -- Identity
  name VARCHAR(255) NOT NULL,
  type venture_type NOT NULL,
  description TEXT,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rl_ventures_practice ON rl_ventures(practice_id);

-- Index on type column — handle schema variant where column may be 'type' or 'venture_type'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rl_ventures' AND column_name = 'type') THEN
    CREATE INDEX IF NOT EXISTS idx_rl_ventures_type ON rl_ventures(practice_id, type);
  END IF;
END $$;

-- is_active index — handle schema variant where column may not exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rl_ventures' AND column_name = 'is_active') THEN
    CREATE INDEX IF NOT EXISTS idx_rl_ventures_active ON rl_ventures(practice_id, is_active) WHERE is_active = TRUE;
  END IF;
END $$;

COMMENT ON TABLE rl_ventures IS 'Business initiatives and projects. The organizing container for business operations.';


-- =============================================================================
-- OPPORTUNITIES
-- Pipeline/deals tracking
-- =============================================================================

CREATE TABLE IF NOT EXISTS rl_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership
  practice_id UUID NOT NULL REFERENCES rl_practices(id) ON DELETE CASCADE,

  -- Optional relationships
  venture_id UUID REFERENCES rl_ventures(id) ON DELETE SET NULL,
  person_id UUID REFERENCES rl_people(id) ON DELETE SET NULL,

  -- Opportunity details
  title VARCHAR(500) NOT NULL,
  description TEXT,
  stage opportunity_stage NOT NULL DEFAULT 'lead',

  -- Value tracking
  value_cents INTEGER DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',

  -- Timeline
  expected_close_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT positive_value CHECK (value_cents >= 0)
);

CREATE INDEX IF NOT EXISTS idx_rl_opportunities_practice ON rl_opportunities(practice_id);
CREATE INDEX IF NOT EXISTS idx_rl_opportunities_venture ON rl_opportunities(venture_id) WHERE venture_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rl_opportunities_person ON rl_opportunities(person_id) WHERE person_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rl_opportunities_stage ON rl_opportunities(practice_id, stage);
-- Guard: enum values may be 'closed_won'/'closed_lost' or 'won'/'lost' depending on schema version
DO $$
BEGIN
  BEGIN
    CREATE INDEX IF NOT EXISTS idx_rl_opportunities_active ON rl_opportunities(practice_id, stage)
      WHERE stage NOT IN ('closed_won', 'closed_lost');
  EXCEPTION WHEN invalid_text_representation THEN
    CREATE INDEX IF NOT EXISTS idx_rl_opportunities_active ON rl_opportunities(practice_id, stage)
      WHERE stage NOT IN ('won', 'lost');
  END;
END $$;

COMMENT ON TABLE rl_opportunities IS 'Pipeline tracking for business opportunities and deals.';


-- =============================================================================
-- MEETINGS
-- Business meetings (distinct from clinical sessions)
-- =============================================================================

CREATE TABLE IF NOT EXISTS rl_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership
  practice_id UUID NOT NULL REFERENCES rl_practices(id) ON DELETE CASCADE,

  -- Optional relationships
  venture_id UUID REFERENCES rl_ventures(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES rl_opportunities(id) ON DELETE SET NULL,

  -- Meeting details
  title VARCHAR(500) NOT NULL,
  meeting_type meeting_type NOT NULL DEFAULT 'internal',
  status meeting_status NOT NULL DEFAULT 'scheduled',

  -- Schedule
  scheduled_start_at TIMESTAMPTZ NOT NULL,
  scheduled_end_at TIMESTAMPTZ NOT NULL,

  -- Location (URL or address)
  location TEXT,

  -- Notes
  agenda TEXT,
  notes TEXT,
  outcomes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_meeting_time CHECK (scheduled_end_at > scheduled_start_at)
);

CREATE INDEX IF NOT EXISTS idx_rl_meetings_practice ON rl_meetings(practice_id);
CREATE INDEX IF NOT EXISTS idx_rl_meetings_venture ON rl_meetings(venture_id) WHERE venture_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rl_meetings_opportunity ON rl_meetings(opportunity_id) WHERE opportunity_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rl_meetings_scheduled ON rl_meetings(scheduled_start_at);
CREATE INDEX IF NOT EXISTS idx_rl_meetings_upcoming ON rl_meetings(scheduled_start_at, status)
  WHERE status = 'scheduled';

COMMENT ON TABLE rl_meetings IS 'Business meetings. Distinct from clinical sessions in rl_sessions.';


-- =============================================================================
-- MEETING ATTENDEES
-- Junction table for meeting participants
-- =============================================================================

CREATE TABLE IF NOT EXISTS rl_meeting_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  meeting_id UUID NOT NULL REFERENCES rl_meetings(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES rl_people(id) ON DELETE CASCADE,

  -- Role
  is_organizer BOOLEAN NOT NULL DEFAULT FALSE,
  attendance_status VARCHAR(20) DEFAULT 'invited', -- invited, accepted, declined, tentative, attended, no_show

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(meeting_id, person_id)
);

CREATE INDEX IF NOT EXISTS idx_rl_meeting_attendees_meeting ON rl_meeting_attendees(meeting_id);
CREATE INDEX IF NOT EXISTS idx_rl_meeting_attendees_person ON rl_meeting_attendees(person_id);

COMMENT ON TABLE rl_meeting_attendees IS 'Links people to meetings as attendees.';


-- -----------------------------------------------------------------------------
-- EXTEND EXISTING TABLES
-- -----------------------------------------------------------------------------

-- =============================================================================
-- Extend rl_tasks with venture/opportunity/meeting relationships
-- =============================================================================

-- Add venture_id column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rl_tasks' AND column_name = 'venture_id'
  ) THEN
    ALTER TABLE rl_tasks
    ADD COLUMN venture_id UUID REFERENCES rl_ventures(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add opportunity_id column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rl_tasks' AND column_name = 'opportunity_id'
  ) THEN
    ALTER TABLE rl_tasks
    ADD COLUMN opportunity_id UUID REFERENCES rl_opportunities(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add meeting_id column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rl_tasks' AND column_name = 'meeting_id'
  ) THEN
    ALTER TABLE rl_tasks
    ADD COLUMN meeting_id UUID REFERENCES rl_meetings(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for new task FK columns
CREATE INDEX IF NOT EXISTS idx_rl_tasks_venture ON rl_tasks(venture_id) WHERE venture_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rl_tasks_opportunity ON rl_tasks(opportunity_id) WHERE opportunity_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rl_tasks_meeting ON rl_tasks(meeting_id) WHERE meeting_id IS NOT NULL;


-- =============================================================================
-- Extend rl_people with business context
-- =============================================================================

-- Add company column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rl_people' AND column_name = 'company'
  ) THEN
    ALTER TABLE rl_people ADD COLUMN company VARCHAR(255);
  END IF;
END $$;

-- Add role column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rl_people' AND column_name = 'role'
  ) THEN
    ALTER TABLE rl_people ADD COLUMN role VARCHAR(255);
  END IF;
END $$;

-- Add relationship_type column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rl_people' AND column_name = 'relationship_type'
  ) THEN
    ALTER TABLE rl_people ADD COLUMN relationship_type person_relationship_type;
  END IF;
END $$;

-- Create index for relationship type
CREATE INDEX IF NOT EXISTS idx_rl_people_relationship_type ON rl_people(practice_id, relationship_type)
  WHERE relationship_type IS NOT NULL;


-- -----------------------------------------------------------------------------
-- TRIGGERS: Updated At
-- -----------------------------------------------------------------------------

DROP TRIGGER IF EXISTS rl_ventures_updated_at ON rl_ventures;
CREATE TRIGGER rl_ventures_updated_at BEFORE UPDATE ON rl_ventures
  FOR EACH ROW EXECUTE FUNCTION update_rl_updated_at();

DROP TRIGGER IF EXISTS rl_opportunities_updated_at ON rl_opportunities;
CREATE TRIGGER rl_opportunities_updated_at BEFORE UPDATE ON rl_opportunities
  FOR EACH ROW EXECUTE FUNCTION update_rl_updated_at();

DROP TRIGGER IF EXISTS rl_meetings_updated_at ON rl_meetings;
CREATE TRIGGER rl_meetings_updated_at BEFORE UPDATE ON rl_meetings
  FOR EACH ROW EXECUTE FUNCTION update_rl_updated_at();


-- -----------------------------------------------------------------------------
-- VIEWS: Labtools Dashboard Support
-- -----------------------------------------------------------------------------

-- =============================================================================
-- Venture Dashboard View
-- =============================================================================

-- Views are created conditionally to handle schema variants
-- The venture dashboard view references columns that may differ between schema versions
DO $$
BEGIN
  EXECUTE '
  CREATE OR REPLACE VIEW v_rl_venture_dashboard AS
  SELECT
    v.id as venture_id,
    v.practice_id,
    v.name,
    v.venture_type,
    v.description,
    v.created_at,
    v.updated_at,
    COALESCE(t.open_tasks, 0) as open_tasks,
    COALESCE(m.upcoming_meetings, 0) as upcoming_meetings,
    COALESCE(o.active_opportunities, 0) as active_opportunities,
    COALESCE(o.pipeline_value_cents, 0) as pipeline_value_cents
  FROM rl_ventures v
  LEFT JOIN (
    SELECT venture_id, COUNT(*) as open_tasks
    FROM rl_tasks
    WHERE status = ''open'' AND venture_id IS NOT NULL
    GROUP BY venture_id
  ) t ON t.venture_id = v.id
  LEFT JOIN (
    SELECT venture_id, COUNT(*) as upcoming_meetings
    FROM rl_meetings
    WHERE status = ''scheduled''
      AND scheduled_start_at BETWEEN NOW() AND NOW() + INTERVAL ''14 days''
      AND venture_id IS NOT NULL
    GROUP BY venture_id
  ) m ON m.venture_id = v.id
  LEFT JOIN (
    SELECT venture_id,
           COUNT(*) as active_opportunities,
           SUM(estimated_value_cents) as pipeline_value_cents
    FROM rl_opportunities
    WHERE stage NOT IN (''won'', ''lost'')
      AND venture_id IS NOT NULL
    GROUP BY venture_id
  ) o ON o.venture_id = v.id';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'v_rl_venture_dashboard view creation skipped: %', SQLERRM;
END $$;

COMMENT ON VIEW v_rl_venture_dashboard IS 'Labtools Dashboard: Venture summary with tasks, meetings, opportunities.';


-- =============================================================================
-- Labtools Pipeline Summary View
-- =============================================================================

DO $$
BEGIN
  EXECUTE '
  CREATE OR REPLACE VIEW v_rl_pipeline_summary AS
  SELECT
    practice_id,
    COUNT(*) FILTER (WHERE stage = ''lead'') as lead_count,
    COUNT(*) FILTER (WHERE stage = ''qualified'') as qualified_count,
    COUNT(*) FILTER (WHERE stage = ''proposal'') as proposal_count,
    COUNT(*) FILTER (WHERE stage = ''negotiation'') as negotiation_count,
    COUNT(*) FILTER (WHERE stage = ''won'') as won_count,
    COUNT(*) FILTER (WHERE stage = ''lost'') as lost_count,
    SUM(estimated_value_cents) FILTER (WHERE stage NOT IN (''won'', ''lost'')) as active_pipeline_value_cents,
    SUM(estimated_value_cents) FILTER (WHERE stage = ''won'' AND actual_close_date >= DATE_TRUNC(''month'', NOW())) as won_this_month_cents
  FROM rl_opportunities
  GROUP BY practice_id';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'v_rl_pipeline_summary view creation skipped: %', SQLERRM;
END $$;

COMMENT ON VIEW v_rl_pipeline_summary IS 'Labtools Dashboard: Pipeline stage summary.';


-- =============================================================================
-- Upcoming Business Meetings View
-- =============================================================================

CREATE OR REPLACE VIEW v_rl_upcoming_meetings AS
SELECT
  m.id as meeting_id,
  m.practice_id,
  m.title,
  m.meeting_type,
  m.scheduled_start_at,
  m.scheduled_end_at,
  m.location,
  m.venture_id,
  v.name as venture_name,
  m.opportunity_id,
  o.title as opportunity_title,
  (
    SELECT COUNT(*)
    FROM rl_meeting_attendees ma
    WHERE ma.meeting_id = m.id
  ) as attendee_count
FROM rl_meetings m
LEFT JOIN rl_ventures v ON v.id = m.venture_id
LEFT JOIN rl_opportunities o ON o.id = m.opportunity_id
WHERE m.status = 'scheduled'
  AND m.scheduled_start_at >= NOW()
ORDER BY m.scheduled_start_at ASC;

COMMENT ON VIEW v_rl_upcoming_meetings IS 'Labtools Dashboard: Upcoming business meetings.';


-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
