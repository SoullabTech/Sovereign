-- =============================================================================
-- LABTOOLS BUSINESS OPERATIONS SCHEMA
-- Extends Relational Ledger for Business Management
-- Migration: 20260205000001_labtools_business_ops.sql
-- =============================================================================
--
-- Philosophy: Extends the relational ledger to support business operations
-- while maintaining the same container-first, ethical design principles.
--
-- This adds: Ventures, Meetings, Opportunities (Pipeline), Business Contacts
--
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ENUMS
-- -----------------------------------------------------------------------------

-- Person types (extending rl_people for business contacts)
DO $$ BEGIN
  CREATE TYPE person_type AS ENUM (
    'client',           -- Existing client (default)
    'prospect',         -- Potential client
    'partner',          -- Business partner / collaborator
    'vendor',           -- Service provider
    'investor',         -- Investor / funder
    'team',             -- Internal team member
    'contact'           -- General business contact
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Venture types (business initiatives)
DO $$ BEGIN
  CREATE TYPE venture_type AS ENUM (
    'maia_rd',          -- MAIA R&D
    'soullab_rd',       -- Soullab R&D
    'marketing',        -- Marketing initiatives
    'sales',            -- Sales projects
    'partnership',      -- Partnerships/Alliances
    'operations',       -- Operations/Admin
    'content',          -- Content/Media
    'events'            -- Events/Workshops
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Venture status (state machine)
DO $$ BEGIN
  CREATE TYPE venture_status AS ENUM (
    'idea',             -- Just an idea
    'planning',         -- Being planned
    'active',           -- In progress
    'on_hold',          -- Paused
    'completed',        -- Done
    'archived'          -- No longer relevant
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Meeting types (distinct from client sessions)
DO $$ BEGIN
  CREATE TYPE meeting_type AS ENUM (
    'internal',         -- Team meetings
    'partner',          -- Partner/collaboration meetings
    'prospect',         -- Sales/biz dev meetings
    'vendor',           -- Vendor meetings
    'advisory',         -- Advisory board / mentorship
    'presentation',     -- Pitches, demos
    'workshop',         -- Workshops, trainings
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Meeting status
DO $$ BEGIN
  CREATE TYPE meeting_status AS ENUM (
    'scheduled',
    'completed',
    'cancelled',
    'rescheduled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Opportunity types (pipeline)
DO $$ BEGIN
  CREATE TYPE opportunity_type AS ENUM (
    'sale',             -- Product/service sale
    'partnership',      -- Business partnership
    'investment',       -- Funding/investment
    'referral',         -- Referral arrangement
    'collaboration'     -- Joint venture / collab
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Opportunity stage (Kanban stages)
DO $$ BEGIN
  CREATE TYPE opportunity_stage AS ENUM (
    'lead',             -- Initial interest
    'qualified',        -- Validated fit
    'proposal',         -- Proposal sent
    'negotiation',      -- In negotiation
    'won',              -- Closed won
    'lost',             -- Closed lost
    'nurturing'         -- Long-term nurture
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- -----------------------------------------------------------------------------
-- ALTER EXISTING TABLES
-- -----------------------------------------------------------------------------

-- Extend rl_people with business contact fields
ALTER TABLE rl_people
  ADD COLUMN IF NOT EXISTS person_type person_type DEFAULT 'client',
  ADD COLUMN IF NOT EXISTS company VARCHAR(255),
  ADD COLUMN IF NOT EXISTS role_title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS website_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS source VARCHAR(100);

-- Create index for person_type filtering
CREATE INDEX IF NOT EXISTS idx_rl_people_type ON rl_people(practice_id, person_type);
CREATE INDEX IF NOT EXISTS idx_rl_people_company ON rl_people(practice_id, company) WHERE company IS NOT NULL;

-- -----------------------------------------------------------------------------
-- VENTURES TABLE
-- Business initiatives: R&D, marketing, sales, operations, partnerships
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS rl_ventures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership
  practice_id UUID NOT NULL REFERENCES rl_practices(id) ON DELETE CASCADE,

  -- Venture definition
  name VARCHAR(500) NOT NULL,
  description TEXT,
  venture_type venture_type NOT NULL,
  status venture_status NOT NULL DEFAULT 'idea',

  -- Priority (1 = highest)
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),

  -- Timeline
  target_start_date DATE,
  target_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,

  -- Resources
  estimated_hours INTEGER,
  actual_hours INTEGER DEFAULT 0,
  budget_cents INTEGER,
  spent_cents INTEGER DEFAULT 0,

  -- Hierarchy (sub-ventures)
  parent_venture_id UUID REFERENCES rl_ventures(id) ON DELETE SET NULL,

  -- Tags for flexible categorization
  tags TEXT[] DEFAULT '{}',

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rl_ventures_practice ON rl_ventures(practice_id);
CREATE INDEX IF NOT EXISTS idx_rl_ventures_type ON rl_ventures(practice_id, venture_type);
CREATE INDEX IF NOT EXISTS idx_rl_ventures_status ON rl_ventures(practice_id, status);
CREATE INDEX IF NOT EXISTS idx_rl_ventures_active ON rl_ventures(practice_id) WHERE status IN ('planning', 'active');
CREATE INDEX IF NOT EXISTS idx_rl_ventures_tags ON rl_ventures USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_rl_ventures_parent ON rl_ventures(parent_venture_id) WHERE parent_venture_id IS NOT NULL;

COMMENT ON TABLE rl_ventures IS 'Business initiatives: R&D, marketing, sales, operations, partnerships.';

-- -----------------------------------------------------------------------------
-- VENTURE COLLABORATORS TABLE
-- People working on ventures
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS rl_venture_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  venture_id UUID NOT NULL REFERENCES rl_ventures(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES rl_people(id) ON DELETE CASCADE,

  -- Role in this venture
  role VARCHAR(100) DEFAULT 'contributor',  -- 'lead', 'contributor', 'advisor', 'stakeholder'

  -- Time allocation
  allocated_hours_per_week NUMERIC(4,1),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(venture_id, person_id)
);

CREATE INDEX IF NOT EXISTS idx_rl_venture_collaborators_venture ON rl_venture_collaborators(venture_id);
CREATE INDEX IF NOT EXISTS idx_rl_venture_collaborators_person ON rl_venture_collaborators(person_id);

COMMENT ON TABLE rl_venture_collaborators IS 'People working on ventures with roles and time allocation.';

-- -----------------------------------------------------------------------------
-- OPPORTUNITIES TABLE
-- Sales pipeline / partnership opportunities
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS rl_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership
  practice_id UUID NOT NULL REFERENCES rl_practices(id) ON DELETE CASCADE,

  -- Opportunity definition
  title VARCHAR(500) NOT NULL,
  description TEXT,
  opportunity_type opportunity_type NOT NULL DEFAULT 'sale',

  -- Pipeline stage (Kanban)
  stage opportunity_stage NOT NULL DEFAULT 'lead',

  -- Value
  estimated_value_cents INTEGER,
  currency VARCHAR(3) DEFAULT 'USD',
  probability INTEGER DEFAULT 50 CHECK (probability BETWEEN 0 AND 100),

  -- Timeline
  expected_close_date DATE,
  actual_close_date DATE,

  -- Source
  source VARCHAR(100),  -- 'referral', 'website', 'conference', 'cold_outreach', etc.

  -- Related person (primary contact)
  person_id UUID REFERENCES rl_people(id) ON DELETE SET NULL,

  -- Related venture (if this opp feeds into a venture)
  venture_id UUID REFERENCES rl_ventures(id) ON DELETE SET NULL,

  -- Lost reason (if stage = 'lost')
  lost_reason TEXT,

  -- Notes
  notes TEXT,

  -- Stage tracking
  stage_changed_at TIMESTAMPTZ DEFAULT NOW(),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rl_opportunities_practice ON rl_opportunities(practice_id);
CREATE INDEX IF NOT EXISTS idx_rl_opportunities_stage ON rl_opportunities(practice_id, stage);
CREATE INDEX IF NOT EXISTS idx_rl_opportunities_type ON rl_opportunities(practice_id, opportunity_type);
CREATE INDEX IF NOT EXISTS idx_rl_opportunities_person ON rl_opportunities(person_id) WHERE person_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rl_opportunities_venture ON rl_opportunities(venture_id) WHERE venture_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rl_opportunities_active ON rl_opportunities(practice_id) WHERE stage NOT IN ('won', 'lost');

COMMENT ON TABLE rl_opportunities IS 'Pipeline: sales, partnerships, investments, collaborations.';

-- -----------------------------------------------------------------------------
-- MEETINGS TABLE
-- Business meetings (separate from client sessions)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS rl_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership
  practice_id UUID NOT NULL REFERENCES rl_practices(id) ON DELETE CASCADE,

  -- Meeting details
  title VARCHAR(500) NOT NULL,
  meeting_type meeting_type NOT NULL DEFAULT 'other',
  status meeting_status NOT NULL DEFAULT 'scheduled',

  -- Timing
  scheduled_start_at TIMESTAMPTZ NOT NULL,
  scheduled_end_at TIMESTAMPTZ NOT NULL,
  actual_start_at TIMESTAMPTZ,
  actual_end_at TIMESTAMPTZ,

  -- Location
  location VARCHAR(100) DEFAULT 'video',  -- 'video', 'phone', 'in_person', 'async'
  location_details TEXT,                   -- Zoom link, address, etc.

  -- Context linking
  venture_id UUID REFERENCES rl_ventures(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES rl_opportunities(id) ON DELETE SET NULL,

  -- Notes
  agenda TEXT,
  notes TEXT,
  action_items TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_meeting_time CHECK (scheduled_end_at > scheduled_start_at)
);

CREATE INDEX IF NOT EXISTS idx_rl_meetings_practice ON rl_meetings(practice_id);
CREATE INDEX IF NOT EXISTS idx_rl_meetings_scheduled ON rl_meetings(scheduled_start_at);
CREATE INDEX IF NOT EXISTS idx_rl_meetings_upcoming ON rl_meetings(practice_id, status, scheduled_start_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_rl_meetings_venture ON rl_meetings(venture_id) WHERE venture_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rl_meetings_opportunity ON rl_meetings(opportunity_id) WHERE opportunity_id IS NOT NULL;

COMMENT ON TABLE rl_meetings IS 'Business meetings (not client sessions): internal, partner, prospect, vendor.';

-- -----------------------------------------------------------------------------
-- MEETING ATTENDEES TABLE
-- Who attends each meeting
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS rl_meeting_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  meeting_id UUID NOT NULL REFERENCES rl_meetings(id) ON DELETE CASCADE,
  person_id UUID REFERENCES rl_people(id) ON DELETE SET NULL,  -- nullable for external attendees

  -- Attendee info (if not in rl_people)
  external_name VARCHAR(255),
  external_email VARCHAR(255),

  -- Status
  is_organizer BOOLEAN DEFAULT FALSE,
  rsvp_status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'accepted', 'declined', 'tentative'
  attended BOOLEAN,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT has_attendee_info CHECK (person_id IS NOT NULL OR external_name IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_rl_meeting_attendees_meeting ON rl_meeting_attendees(meeting_id);
CREATE INDEX IF NOT EXISTS idx_rl_meeting_attendees_person ON rl_meeting_attendees(person_id) WHERE person_id IS NOT NULL;

COMMENT ON TABLE rl_meeting_attendees IS 'Meeting participants with RSVP and attendance tracking.';

-- -----------------------------------------------------------------------------
-- EXTEND RL_TASKS
-- Add venture/opportunity/meeting links
-- -----------------------------------------------------------------------------

ALTER TABLE rl_tasks
  ADD COLUMN IF NOT EXISTS venture_id UUID REFERENCES rl_ventures(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS opportunity_id UUID REFERENCES rl_opportunities(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS meeting_id UUID REFERENCES rl_meetings(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_rl_tasks_venture ON rl_tasks(venture_id) WHERE venture_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rl_tasks_opportunity ON rl_tasks(opportunity_id) WHERE opportunity_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rl_tasks_meeting ON rl_tasks(meeting_id) WHERE meeting_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- TRIGGERS
-- -----------------------------------------------------------------------------

-- Update timestamps trigger (reuse existing or create)
CREATE OR REPLACE FUNCTION update_labtools_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to new tables
DROP TRIGGER IF EXISTS rl_ventures_updated_at ON rl_ventures;
CREATE TRIGGER rl_ventures_updated_at BEFORE UPDATE ON rl_ventures
  FOR EACH ROW EXECUTE FUNCTION update_labtools_updated_at();

DROP TRIGGER IF EXISTS rl_opportunities_updated_at ON rl_opportunities;
CREATE TRIGGER rl_opportunities_updated_at BEFORE UPDATE ON rl_opportunities
  FOR EACH ROW EXECUTE FUNCTION update_labtools_updated_at();

DROP TRIGGER IF EXISTS rl_meetings_updated_at ON rl_meetings;
CREATE TRIGGER rl_meetings_updated_at BEFORE UPDATE ON rl_meetings
  FOR EACH ROW EXECUTE FUNCTION update_labtools_updated_at();

-- Track stage changes for opportunities
CREATE OR REPLACE FUNCTION track_opportunity_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    NEW.stage_changed_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS rl_opportunity_stage_change ON rl_opportunities;
CREATE TRIGGER rl_opportunity_stage_change
  BEFORE UPDATE ON rl_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION track_opportunity_stage_change();

-- -----------------------------------------------------------------------------
-- VIEWS FOR DASHBOARD
-- -----------------------------------------------------------------------------

-- Venture summary by type and status
CREATE OR REPLACE VIEW v_rl_venture_summary AS
SELECT
  practice_id,
  venture_type,
  COUNT(*) FILTER (WHERE status = 'active') as active_count,
  COUNT(*) FILTER (WHERE status = 'planning') as planning_count,
  COUNT(*) FILTER (WHERE status = 'on_hold') as on_hold_count,
  COUNT(*) FILTER (WHERE status = 'idea') as idea_count,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_count
FROM rl_ventures
GROUP BY practice_id, venture_type;

COMMENT ON VIEW v_rl_venture_summary IS 'Labtools Dashboard: Ventures by type and status.';

-- Pipeline summary by stage
CREATE OR REPLACE VIEW v_rl_pipeline_summary AS
SELECT
  practice_id,
  stage,
  COUNT(*) as count,
  SUM(estimated_value_cents) as total_value_cents,
  SUM(estimated_value_cents * probability / 100) as weighted_value_cents
FROM rl_opportunities
WHERE stage NOT IN ('won', 'lost')
GROUP BY practice_id, stage;

COMMENT ON VIEW v_rl_pipeline_summary IS 'Labtools Pipeline: Opportunities by stage with weighted values.';

-- Upcoming meetings (next 14 days)
CREATE OR REPLACE VIEW v_rl_upcoming_meetings AS
SELECT
  m.practice_id,
  m.id as meeting_id,
  m.title,
  m.meeting_type,
  m.scheduled_start_at,
  m.scheduled_end_at,
  m.location,
  m.venture_id,
  v.name as venture_name,
  m.opportunity_id,
  o.title as opportunity_title,
  (SELECT COUNT(*) FROM rl_meeting_attendees ma WHERE ma.meeting_id = m.id) as attendee_count
FROM rl_meetings m
LEFT JOIN rl_ventures v ON v.id = m.venture_id
LEFT JOIN rl_opportunities o ON o.id = m.opportunity_id
WHERE m.status = 'scheduled'
  AND m.scheduled_start_at BETWEEN NOW() AND NOW() + INTERVAL '14 days'
ORDER BY m.scheduled_start_at;

COMMENT ON VIEW v_rl_upcoming_meetings IS 'Labtools: Upcoming business meetings (14 days).';

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
