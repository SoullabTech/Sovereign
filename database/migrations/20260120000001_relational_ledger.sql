-- =============================================================================
-- RELATIONAL LEDGER SCHEMA
-- Practitioner OS Core Data Model
-- Migration: 20260120000001_relational_ledger.sql
-- =============================================================================
--
-- Philosophy: The primary object is the Container (Relationship Container),
-- not the person. People move through containers; containers begin/end cleanly.
--
-- This is NOT a CRM. It is a relational ledger for ethical practice management.
--
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ENUMS
-- -----------------------------------------------------------------------------

-- Practice modes (what kind of work this practice does)
DO $$ BEGIN
  CREATE TYPE practice_mode AS ENUM (
    'clinical',
    'coaching',
    'facilitation',
    'education',
    'guidance',
    'hybrid'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Container types (the shape of the relational work)
DO $$ BEGIN
  CREATE TYPE container_type AS ENUM (
    '1:1',
    'couple',
    'family',
    'group',
    'cohort'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Container status (with enforced state machine)
DO $$ BEGIN
  CREATE TYPE container_status AS ENUM (
    'inquiry',
    'active',
    'paused',
    'closing',
    'completed',
    'referred_out',
    'declined'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Participant roles within a container
DO $$ BEGIN
  CREATE TYPE participant_role AS ENUM (
    'client',
    'participant',
    'guardian',
    'collaborator'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Agreement kinds
DO $$ BEGIN
  CREATE TYPE agreement_kind AS ENUM (
    'informed_consent',
    'agreement',
    'disclaimer',
    'group_agreement',
    'scope_of_work'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Agreement status
DO $$ BEGIN
  CREATE TYPE agreement_status AS ENUM (
    'draft',
    'sent',
    'accepted',
    'declined',
    'expired'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Session types
DO $$ BEGIN
  CREATE TYPE rl_session_type AS ENUM (
    'session',
    'intake',
    'check_in',
    'group',
    'closing',
    'consultation'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Session status
DO $$ BEGIN
  CREATE TYPE rl_session_status AS ENUM (
    'scheduled',
    'completed',
    'canceled',
    'no_show'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Session location
DO $$ BEGIN
  CREATE TYPE session_location AS ENUM (
    'in_person',
    'video',
    'phone',
    'async'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Note visibility
DO $$ BEGIN
  CREATE TYPE note_visibility AS ENUM (
    'private_practitioner',
    'shared_with_participant'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Billing item kinds
DO $$ BEGIN
  CREATE TYPE billing_kind AS ENUM (
    'invoice',
    'receipt',
    'package',
    'adjustment'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Billing status
DO $$ BEGIN
  CREATE TYPE billing_status AS ENUM (
    'draft',
    'sent',
    'paid',
    'void'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Task status (prefixed to avoid collision)
DO $$ BEGIN
  CREATE TYPE rl_task_status AS ENUM (
    'open',
    'done'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Container visibility
DO $$ BEGIN
  CREATE TYPE container_visibility AS ENUM (
    'private',
    'shared_portal'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- -----------------------------------------------------------------------------
-- TABLES
-- -----------------------------------------------------------------------------

-- =============================================================================
-- PRACTICES
-- A practitioner's operating container
-- =============================================================================

CREATE TABLE IF NOT EXISTS rl_practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership (links to MAIA members table)
  owner_user_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Identity
  name VARCHAR(255) NOT NULL,
  modes practice_mode[] NOT NULL DEFAULT '{}',

  -- Operations
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  capacity_policy JSONB DEFAULT '{
    "max_sessions_per_week": null,
    "buffer_minutes": 15,
    "blackout_days": []
  }'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rl_practices_owner ON rl_practices(owner_user_id);

COMMENT ON TABLE rl_practices IS 'A practitioner''s operating container. One practitioner may have multiple practices.';
COMMENT ON COLUMN rl_practices.capacity_policy IS 'JSON: max_sessions_per_week, buffer_minutes, blackout_days[]';


-- =============================================================================
-- PEOPLE
-- Humans in your world (clients, participants, collaborators)
-- NOT leads. NOT prospects.
-- =============================================================================

CREATE TABLE IF NOT EXISTS rl_people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership
  practice_id UUID NOT NULL REFERENCES rl_practices(id) ON DELETE CASCADE,

  -- Identity (minimal)
  display_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),

  -- Practitioner's private context
  notes_private TEXT,
  tags TEXT[] DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rl_people_practice ON rl_people(practice_id);
CREATE INDEX IF NOT EXISTS idx_rl_people_email ON rl_people(practice_id, email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rl_people_tags ON rl_people USING GIN(tags);

COMMENT ON TABLE rl_people IS 'Humans in the practitioner''s world. Not leads, not prospects—people.';
COMMENT ON COLUMN rl_people.notes_private IS 'Practitioner''s private notes about this person (never shared).';


-- =============================================================================
-- RELATIONSHIP_CONTAINERS
-- The ethical unit of work. The primary object in the system.
-- =============================================================================

CREATE TABLE IF NOT EXISTS rl_containers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership
  practice_id UUID NOT NULL REFERENCES rl_practices(id) ON DELETE CASCADE,

  -- Container definition
  type container_type NOT NULL DEFAULT '1:1',
  status container_status NOT NULL DEFAULT 'inquiry',
  scope TEXT, -- What this container is for (brief)

  -- Timeline
  start_at TIMESTAMPTZ, -- Null until active
  end_at TIMESTAMPTZ,   -- Null until completed/referred

  -- Access
  visibility container_visibility NOT NULL DEFAULT 'private',

  -- Safety (manual flags only, never computed)
  risk_flags TEXT[] DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_timeline CHECK (end_at IS NULL OR start_at IS NULL OR end_at >= start_at)
);

CREATE INDEX IF NOT EXISTS idx_rl_containers_practice ON rl_containers(practice_id);
CREATE INDEX IF NOT EXISTS idx_rl_containers_status ON rl_containers(practice_id, status);
CREATE INDEX IF NOT EXISTS idx_rl_containers_active ON rl_containers(practice_id, status)
  WHERE status IN ('active', 'paused', 'closing');

COMMENT ON TABLE rl_containers IS 'The ethical unit of work. The ledger entry. Containers begin and end cleanly.';
COMMENT ON COLUMN rl_containers.scope IS 'Brief description of what this container is for.';
COMMENT ON COLUMN rl_containers.risk_flags IS 'Manual safety flags. Never auto-computed from behavior.';


-- =============================================================================
-- CONTAINER_PARTICIPANTS
-- Joins people to containers with roles
-- =============================================================================

CREATE TABLE IF NOT EXISTS rl_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  container_id UUID NOT NULL REFERENCES rl_containers(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES rl_people(id) ON DELETE CASCADE,

  -- Role in this container
  role participant_role NOT NULL DEFAULT 'client',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(container_id, person_id)
);

CREATE INDEX IF NOT EXISTS idx_rl_participants_container ON rl_participants(container_id);
CREATE INDEX IF NOT EXISTS idx_rl_participants_person ON rl_participants(person_id);

COMMENT ON TABLE rl_participants IS 'Joins people to containers. One person can be in multiple containers.';


-- =============================================================================
-- AGREEMENTS
-- Consent, boundaries, scope clarity (versioned)
-- =============================================================================

CREATE TABLE IF NOT EXISTS rl_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationship
  container_id UUID NOT NULL REFERENCES rl_containers(id) ON DELETE CASCADE,

  -- Agreement details
  kind agreement_kind NOT NULL,
  status agreement_status NOT NULL DEFAULT 'draft',
  version INTEGER NOT NULL DEFAULT 1,
  content TEXT NOT NULL,

  -- Acceptance
  accepted_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rl_agreements_container ON rl_agreements(container_id);
CREATE INDEX IF NOT EXISTS idx_rl_agreements_status ON rl_agreements(container_id, status);
CREATE INDEX IF NOT EXISTS idx_rl_agreements_pending ON rl_agreements(status) WHERE status IN ('draft', 'sent');

COMMENT ON TABLE rl_agreements IS 'Consent forms, agreements, disclaimers. Versioned for audit trail.';


-- =============================================================================
-- SESSIONS
-- Events that happen inside containers
-- =============================================================================

CREATE TABLE IF NOT EXISTS rl_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationship
  container_id UUID NOT NULL REFERENCES rl_containers(id) ON DELETE CASCADE,

  -- Session details
  session_type rl_session_type NOT NULL DEFAULT 'session',
  scheduled_start_at TIMESTAMPTZ NOT NULL,
  scheduled_end_at TIMESTAMPTZ NOT NULL,
  status rl_session_status NOT NULL DEFAULT 'scheduled',
  location session_location NOT NULL DEFAULT 'video',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_session_time CHECK (scheduled_end_at > scheduled_start_at)
);

CREATE INDEX IF NOT EXISTS idx_rl_sessions_container ON rl_sessions(container_id);
CREATE INDEX IF NOT EXISTS idx_rl_sessions_scheduled ON rl_sessions(scheduled_start_at);
CREATE INDEX IF NOT EXISTS idx_rl_sessions_upcoming ON rl_sessions(scheduled_start_at, status)
  WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_rl_sessions_practice ON rl_sessions(container_id, scheduled_start_at);

COMMENT ON TABLE rl_sessions IS 'Events that happen inside containers. The unit of work.';


-- =============================================================================
-- NOTES
-- Split private vs shareable intentionally
-- =============================================================================

CREATE TABLE IF NOT EXISTS rl_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships (exactly one required)
  session_id UUID REFERENCES rl_sessions(id) ON DELETE CASCADE,
  container_id UUID REFERENCES rl_containers(id) ON DELETE CASCADE,

  -- Note details
  visibility note_visibility NOT NULL DEFAULT 'private_practitioner',
  content TEXT NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints: exactly one of session_id or container_id must be set
  CONSTRAINT note_has_parent CHECK (
    (session_id IS NOT NULL AND container_id IS NULL) OR
    (session_id IS NULL AND container_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_rl_notes_session ON rl_notes(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rl_notes_container ON rl_notes(container_id) WHERE container_id IS NOT NULL;

COMMENT ON TABLE rl_notes IS 'Practitioner notes. Private by default. Sharing is explicit.';
COMMENT ON COLUMN rl_notes.visibility IS 'private_practitioner = never shared. shared_with_participant = client can see.';


-- =============================================================================
-- BILLING_ITEMS
-- Minimal financial tracking (don't overbuild)
-- =============================================================================

CREATE TABLE IF NOT EXISTS rl_billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationship
  container_id UUID NOT NULL REFERENCES rl_containers(id) ON DELETE CASCADE,

  -- Billing details
  kind billing_kind NOT NULL,
  status billing_status NOT NULL DEFAULT 'draft',
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',

  -- Timeline
  due_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT positive_amount CHECK (amount_cents >= 0)
);

CREATE INDEX IF NOT EXISTS idx_rl_billing_container ON rl_billing(container_id);
CREATE INDEX IF NOT EXISTS idx_rl_billing_status ON rl_billing(status);
CREATE INDEX IF NOT EXISTS idx_rl_billing_outstanding ON rl_billing(status, due_at)
  WHERE status IN ('draft', 'sent');

COMMENT ON TABLE rl_billing IS 'Minimal billing. Invoices, receipts, packages. Not a full accounting system.';


-- =============================================================================
-- TASKS
-- The "care horizon" tool
-- =============================================================================

CREATE TABLE IF NOT EXISTS rl_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships (both nullable for practice-level tasks)
  container_id UUID REFERENCES rl_containers(id) ON DELETE CASCADE,
  person_id UUID REFERENCES rl_people(id) ON DELETE SET NULL,
  practice_id UUID NOT NULL REFERENCES rl_practices(id) ON DELETE CASCADE,

  -- Task details
  title VARCHAR(500) NOT NULL,
  due_at TIMESTAMPTZ,
  status rl_task_status NOT NULL DEFAULT 'open',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rl_tasks_practice ON rl_tasks(practice_id);
CREATE INDEX IF NOT EXISTS idx_rl_tasks_container ON rl_tasks(container_id) WHERE container_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rl_tasks_person ON rl_tasks(person_id) WHERE person_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rl_tasks_open ON rl_tasks(practice_id, status, due_at) WHERE status = 'open';

COMMENT ON TABLE rl_tasks IS 'Care horizon tool. What needs attention? Not a productivity system.';


-- -----------------------------------------------------------------------------
-- FUNCTIONS: State Machine Enforcement
-- -----------------------------------------------------------------------------

-- =============================================================================
-- Container Status Transitions
-- Enforces: inquiry → active|declined|referred_out
--           active → paused|closing
--           paused → active|closing
--           closing → completed|referred_out
--           completed = terminal (no re-opening)
-- =============================================================================

CREATE OR REPLACE FUNCTION enforce_rl_container_status_transition()
RETURNS TRIGGER AS $$
DECLARE
  valid_transitions JSONB := '{
    "inquiry": ["active", "declined", "referred_out"],
    "active": ["paused", "closing"],
    "paused": ["active", "closing"],
    "closing": ["completed", "referred_out"],
    "completed": [],
    "referred_out": [],
    "declined": []
  }'::jsonb;
  allowed TEXT[];
BEGIN
  -- Skip if status unchanged
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Get allowed transitions
  SELECT ARRAY(SELECT jsonb_array_elements_text(valid_transitions->OLD.status::text))
  INTO allowed;

  -- Check if transition is allowed
  IF NOT (NEW.status::text = ANY(allowed)) THEN
    RAISE EXCEPTION 'Invalid status transition: % → %. Allowed: %',
      OLD.status, NEW.status, allowed;
  END IF;

  -- Auto-set start_at when moving to active
  IF NEW.status = 'active' AND OLD.status = 'inquiry' AND NEW.start_at IS NULL THEN
    NEW.start_at := NOW();
  END IF;

  -- Auto-set end_at when completing or referring out
  IF NEW.status IN ('completed', 'referred_out') AND NEW.end_at IS NULL THEN
    NEW.end_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS rl_container_status_transition ON rl_containers;
CREATE TRIGGER rl_container_status_transition
  BEFORE UPDATE ON rl_containers
  FOR EACH ROW
  EXECUTE FUNCTION enforce_rl_container_status_transition();


-- -----------------------------------------------------------------------------
-- FUNCTIONS: Updated At Triggers
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_rl_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DROP TRIGGER IF EXISTS rl_practices_updated_at ON rl_practices;
CREATE TRIGGER rl_practices_updated_at BEFORE UPDATE ON rl_practices
  FOR EACH ROW EXECUTE FUNCTION update_rl_updated_at();

DROP TRIGGER IF EXISTS rl_people_updated_at ON rl_people;
CREATE TRIGGER rl_people_updated_at BEFORE UPDATE ON rl_people
  FOR EACH ROW EXECUTE FUNCTION update_rl_updated_at();

DROP TRIGGER IF EXISTS rl_containers_updated_at ON rl_containers;
CREATE TRIGGER rl_containers_updated_at BEFORE UPDATE ON rl_containers
  FOR EACH ROW EXECUTE FUNCTION update_rl_updated_at();

DROP TRIGGER IF EXISTS rl_agreements_updated_at ON rl_agreements;
CREATE TRIGGER rl_agreements_updated_at BEFORE UPDATE ON rl_agreements
  FOR EACH ROW EXECUTE FUNCTION update_rl_updated_at();

DROP TRIGGER IF EXISTS rl_sessions_updated_at ON rl_sessions;
CREATE TRIGGER rl_sessions_updated_at BEFORE UPDATE ON rl_sessions
  FOR EACH ROW EXECUTE FUNCTION update_rl_updated_at();

DROP TRIGGER IF EXISTS rl_notes_updated_at ON rl_notes;
CREATE TRIGGER rl_notes_updated_at BEFORE UPDATE ON rl_notes
  FOR EACH ROW EXECUTE FUNCTION update_rl_updated_at();

DROP TRIGGER IF EXISTS rl_billing_updated_at ON rl_billing;
CREATE TRIGGER rl_billing_updated_at BEFORE UPDATE ON rl_billing
  FOR EACH ROW EXECUTE FUNCTION update_rl_updated_at();

DROP TRIGGER IF EXISTS rl_tasks_updated_at ON rl_tasks;
CREATE TRIGGER rl_tasks_updated_at BEFORE UPDATE ON rl_tasks
  FOR EACH ROW EXECUTE FUNCTION update_rl_updated_at();


-- -----------------------------------------------------------------------------
-- VIEWS: Stewardship Dashboard Support
-- -----------------------------------------------------------------------------

-- =============================================================================
-- Active Commitments View
-- =============================================================================

CREATE OR REPLACE VIEW v_rl_practice_commitments AS
SELECT
  practice_id,
  COUNT(*) FILTER (WHERE status = 'active') as active_containers,
  COUNT(*) FILTER (WHERE status = 'paused') as paused_containers,
  COUNT(*) FILTER (WHERE status = 'closing') as closing_containers,
  COUNT(*) FILTER (WHERE status = 'inquiry') as inquiry_containers
FROM rl_containers
WHERE status IN ('active', 'paused', 'closing', 'inquiry')
GROUP BY practice_id;

COMMENT ON VIEW v_rl_practice_commitments IS 'Stewardship Dashboard: Current commitments count.';


-- =============================================================================
-- Care Horizon View (next 14 days)
-- =============================================================================

CREATE OR REPLACE VIEW v_rl_care_horizon AS
SELECT
  p.id as practice_id,
  s.id as item_id,
  s.scheduled_start_at,
  s.session_type::text as item_subtype,
  rc.id as container_id,
  rc.scope as container_scope,
  'session' as item_type
FROM rl_sessions s
JOIN rl_containers rc ON s.container_id = rc.id
JOIN rl_practices p ON rc.practice_id = p.id
WHERE s.status = 'scheduled'
  AND s.scheduled_start_at BETWEEN NOW() AND NOW() + INTERVAL '14 days'

UNION ALL

SELECT
  t.practice_id,
  t.id as item_id,
  t.due_at as scheduled_start_at,
  NULL as item_subtype,
  t.container_id,
  t.title as container_scope,
  'task' as item_type
FROM rl_tasks t
WHERE t.status = 'open'
  AND t.due_at BETWEEN NOW() AND NOW() + INTERVAL '14 days'

ORDER BY scheduled_start_at;

COMMENT ON VIEW v_rl_care_horizon IS 'Stewardship Dashboard: Upcoming sessions and tasks (14 days).';


-- =============================================================================
-- Containers Needing Attention
-- =============================================================================

CREATE OR REPLACE VIEW v_rl_containers_needing_attention AS
SELECT
  rc.practice_id,
  rc.id as container_id,
  rc.status,
  rc.scope,
  rc.updated_at,
  MAX(s.scheduled_start_at) as last_session,
  CASE
    WHEN rc.status = 'closing' AND NOT EXISTS (
      SELECT 1 FROM rl_sessions s2
      WHERE s2.container_id = rc.id
        AND s2.status = 'scheduled'
        AND s2.scheduled_start_at > NOW()
    ) THEN 'closing_no_next_session'
    WHEN rc.status = 'active' AND (
      MAX(s.scheduled_start_at) IS NULL OR
      MAX(s.scheduled_start_at) < NOW() - INTERVAL '30 days'
    ) THEN 'no_recent_session'
    ELSE NULL
  END as attention_reason
FROM rl_containers rc
LEFT JOIN rl_sessions s ON s.container_id = rc.id AND s.status = 'completed'
WHERE rc.status IN ('active', 'paused', 'closing')
GROUP BY rc.id
HAVING
  -- Closing with no scheduled session
  (rc.status = 'closing' AND NOT EXISTS (
    SELECT 1 FROM rl_sessions s2
    WHERE s2.container_id = rc.id
      AND s2.status = 'scheduled'
      AND s2.scheduled_start_at > NOW()
  ))
  OR
  -- Active with no session in 30 days
  (rc.status = 'active' AND (
    MAX(s.scheduled_start_at) IS NULL OR
    MAX(s.scheduled_start_at) < NOW() - INTERVAL '30 days'
  ));

COMMENT ON VIEW v_rl_containers_needing_attention IS 'Stewardship Dashboard: Containers that need review.';


-- =============================================================================
-- Billing Summary View
-- =============================================================================

CREATE OR REPLACE VIEW v_rl_billing_summary AS
SELECT
  p.id as practice_id,
  SUM(CASE WHEN b.status = 'paid' AND b.paid_at >= DATE_TRUNC('month', NOW())
      THEN b.amount_cents ELSE 0 END) as paid_this_month_cents,
  SUM(CASE WHEN b.status IN ('draft', 'sent')
      THEN b.amount_cents ELSE 0 END) as pending_cents,
  COUNT(*) FILTER (WHERE b.status IN ('draft', 'sent')) as outstanding_count
FROM rl_practices p
LEFT JOIN rl_containers rc ON rc.practice_id = p.id
LEFT JOIN rl_billing b ON b.container_id = rc.id
GROUP BY p.id;

COMMENT ON VIEW v_rl_billing_summary IS 'Stewardship Dashboard: Simple billing overview.';


-- =============================================================================
-- Agreements Pending View
-- =============================================================================

CREATE OR REPLACE VIEW v_rl_agreements_pending AS
SELECT
  p.id as practice_id,
  COUNT(*) as pending_agreements
FROM rl_practices p
JOIN rl_containers rc ON rc.practice_id = p.id
JOIN rl_agreements a ON a.container_id = rc.id
WHERE a.status IN ('draft', 'sent')
GROUP BY p.id;

COMMENT ON VIEW v_rl_agreements_pending IS 'Stewardship Dashboard: Agreements awaiting acceptance.';


-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
