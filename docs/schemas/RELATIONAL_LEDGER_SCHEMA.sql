-- =============================================================================
-- RELATIONAL LEDGER SCHEMA
-- Practitioner OS Core Data Model
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
CREATE TYPE practice_mode AS ENUM (
  'clinical',
  'coaching',
  'facilitation',
  'education',
  'guidance',
  'hybrid'
);

-- Container types (the shape of the relational work)
CREATE TYPE container_type AS ENUM (
  '1:1',
  'couple',
  'family',
  'group',
  'cohort'
);

-- Container status (with enforced state machine)
CREATE TYPE container_status AS ENUM (
  'inquiry',
  'active',
  'paused',
  'closing',
  'completed',
  'referred_out',
  'declined'
);

-- Participant roles within a container
CREATE TYPE participant_role AS ENUM (
  'client',
  'participant',
  'guardian',
  'collaborator'
);

-- Agreement kinds
CREATE TYPE agreement_kind AS ENUM (
  'informed_consent',
  'agreement',
  'disclaimer',
  'group_agreement',
  'scope_of_work'
);

-- Agreement status
CREATE TYPE agreement_status AS ENUM (
  'draft',
  'sent',
  'accepted',
  'declined',
  'expired'
);

-- Session types
CREATE TYPE session_type AS ENUM (
  'session',
  'intake',
  'check_in',
  'group',
  'closing',
  'consultation'
);

-- Session status
CREATE TYPE session_status AS ENUM (
  'scheduled',
  'completed',
  'canceled',
  'no_show'
);

-- Session location
CREATE TYPE session_location AS ENUM (
  'in_person',
  'video',
  'phone',
  'async'
);

-- Note visibility
CREATE TYPE note_visibility AS ENUM (
  'private_practitioner',
  'shared_with_participant'
);

-- Billing item kinds
CREATE TYPE billing_kind AS ENUM (
  'invoice',
  'receipt',
  'package',
  'adjustment'
);

-- Billing status
CREATE TYPE billing_status AS ENUM (
  'draft',
  'sent',
  'paid',
  'void'
);

-- Task status
CREATE TYPE task_status AS ENUM (
  'open',
  'done'
);

-- Container visibility
CREATE TYPE container_visibility AS ENUM (
  'private',
  'shared_portal'
);

-- -----------------------------------------------------------------------------
-- TABLES
-- -----------------------------------------------------------------------------

-- =============================================================================
-- PRACTICES
-- A practitioner's operating container
-- =============================================================================

CREATE TABLE practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership (links to MAIA members table)
  owner_user_id UUID NOT NULL,

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

CREATE INDEX idx_practices_owner ON practices(owner_user_id);

COMMENT ON TABLE practices IS 'A practitioner''s operating container. One practitioner may have multiple practices.';
COMMENT ON COLUMN practices.capacity_policy IS 'JSON: max_sessions_per_week, buffer_minutes, blackout_days[]';


-- =============================================================================
-- PEOPLE
-- Humans in your world (clients, participants, collaborators)
-- NOT leads. NOT prospects.
-- =============================================================================

CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,

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

CREATE INDEX idx_people_practice ON people(practice_id);
CREATE INDEX idx_people_email ON people(practice_id, email) WHERE email IS NOT NULL;
CREATE INDEX idx_people_tags ON people USING GIN(tags);

COMMENT ON TABLE people IS 'Humans in the practitioner''s world. Not leads, not prospects—people.';
COMMENT ON COLUMN people.notes_private IS 'Practitioner''s private notes about this person (never shared).';


-- =============================================================================
-- RELATIONSHIP_CONTAINERS
-- The ethical unit of work. The primary object in the system.
-- =============================================================================

CREATE TABLE relationship_containers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,

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

CREATE INDEX idx_containers_practice ON relationship_containers(practice_id);
CREATE INDEX idx_containers_status ON relationship_containers(practice_id, status);
CREATE INDEX idx_containers_active ON relationship_containers(practice_id, status)
  WHERE status IN ('active', 'paused', 'closing');

COMMENT ON TABLE relationship_containers IS 'The ethical unit of work. The ledger entry. Containers begin and end cleanly.';
COMMENT ON COLUMN relationship_containers.scope IS 'Brief description of what this container is for.';
COMMENT ON COLUMN relationship_containers.risk_flags IS 'Manual safety flags. Never auto-computed from behavior.';


-- =============================================================================
-- CONTAINER_PARTICIPANTS
-- Joins people to containers with roles
-- =============================================================================

CREATE TABLE container_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  container_id UUID NOT NULL REFERENCES relationship_containers(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,

  -- Role in this container
  role participant_role NOT NULL DEFAULT 'client',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(container_id, person_id)
);

CREATE INDEX idx_participants_container ON container_participants(container_id);
CREATE INDEX idx_participants_person ON container_participants(person_id);

COMMENT ON TABLE container_participants IS 'Joins people to containers. One person can be in multiple containers.';


-- =============================================================================
-- AGREEMENTS
-- Consent, boundaries, scope clarity (versioned)
-- =============================================================================

CREATE TABLE agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationship
  container_id UUID NOT NULL REFERENCES relationship_containers(id) ON DELETE CASCADE,

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

CREATE INDEX idx_agreements_container ON agreements(container_id);
CREATE INDEX idx_agreements_status ON agreements(container_id, status);
CREATE INDEX idx_agreements_pending ON agreements(status) WHERE status IN ('draft', 'sent');

COMMENT ON TABLE agreements IS 'Consent forms, agreements, disclaimers. Versioned for audit trail.';


-- =============================================================================
-- SESSIONS
-- Events that happen inside containers
-- =============================================================================

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationship
  container_id UUID NOT NULL REFERENCES relationship_containers(id) ON DELETE CASCADE,

  -- Session details
  session_type session_type NOT NULL DEFAULT 'session',
  scheduled_start_at TIMESTAMPTZ NOT NULL,
  scheduled_end_at TIMESTAMPTZ NOT NULL,
  status session_status NOT NULL DEFAULT 'scheduled',
  location session_location NOT NULL DEFAULT 'video',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_session_time CHECK (scheduled_end_at > scheduled_start_at)
);

CREATE INDEX idx_sessions_container ON sessions(container_id);
CREATE INDEX idx_sessions_scheduled ON sessions(scheduled_start_at);
CREATE INDEX idx_sessions_upcoming ON sessions(scheduled_start_at, status)
  WHERE status = 'scheduled';
CREATE INDEX idx_sessions_practice ON sessions(container_id, scheduled_start_at);

COMMENT ON TABLE sessions IS 'Events that happen inside containers. The unit of work.';


-- =============================================================================
-- NOTES
-- Split private vs shareable intentionally
-- =============================================================================

CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships (exactly one required)
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  container_id UUID REFERENCES relationship_containers(id) ON DELETE CASCADE,

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

CREATE INDEX idx_notes_session ON notes(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_notes_container ON notes(container_id) WHERE container_id IS NOT NULL;

COMMENT ON TABLE notes IS 'Practitioner notes. Private by default. Sharing is explicit.';
COMMENT ON COLUMN notes.visibility IS 'private_practitioner = never shared. shared_with_participant = client can see.';


-- =============================================================================
-- BILLING_ITEMS
-- Minimal financial tracking (don't overbuild)
-- =============================================================================

CREATE TABLE billing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationship
  container_id UUID NOT NULL REFERENCES relationship_containers(id) ON DELETE CASCADE,

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

CREATE INDEX idx_billing_container ON billing_items(container_id);
CREATE INDEX idx_billing_status ON billing_items(status);
CREATE INDEX idx_billing_outstanding ON billing_items(status, due_at)
  WHERE status IN ('draft', 'sent');

COMMENT ON TABLE billing_items IS 'Minimal billing. Invoices, receipts, packages. Not a full accounting system.';


-- =============================================================================
-- TASKS
-- The "care horizon" tool
-- =============================================================================

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships (both nullable for practice-level tasks)
  container_id UUID REFERENCES relationship_containers(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,

  -- Task details
  title VARCHAR(500) NOT NULL,
  due_at TIMESTAMPTZ,
  status task_status NOT NULL DEFAULT 'open',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_practice ON tasks(practice_id);
CREATE INDEX idx_tasks_container ON tasks(container_id) WHERE container_id IS NOT NULL;
CREATE INDEX idx_tasks_person ON tasks(person_id) WHERE person_id IS NOT NULL;
CREATE INDEX idx_tasks_open ON tasks(practice_id, status, due_at) WHERE status = 'open';

COMMENT ON TABLE tasks IS 'Care horizon tool. What needs attention? Not a productivity system.';


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

CREATE OR REPLACE FUNCTION enforce_container_status_transition()
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

CREATE TRIGGER container_status_transition
  BEFORE UPDATE ON relationship_containers
  FOR EACH ROW
  EXECUTE FUNCTION enforce_container_status_transition();


-- -----------------------------------------------------------------------------
-- FUNCTIONS: Updated At Triggers
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER practices_updated_at BEFORE UPDATE ON practices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER people_updated_at BEFORE UPDATE ON people
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER containers_updated_at BEFORE UPDATE ON relationship_containers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER agreements_updated_at BEFORE UPDATE ON agreements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER billing_updated_at BEFORE UPDATE ON billing_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- -----------------------------------------------------------------------------
-- VIEWS: Stewardship Dashboard Support
-- -----------------------------------------------------------------------------

-- =============================================================================
-- Active Commitments View
-- =============================================================================

CREATE OR REPLACE VIEW v_practice_commitments AS
SELECT
  practice_id,
  COUNT(*) FILTER (WHERE status = 'active') as active_containers,
  COUNT(*) FILTER (WHERE status = 'paused') as paused_containers,
  COUNT(*) FILTER (WHERE status = 'closing') as closing_containers,
  COUNT(*) FILTER (WHERE status = 'inquiry') as inquiry_containers
FROM relationship_containers
WHERE status IN ('active', 'paused', 'closing', 'inquiry')
GROUP BY practice_id;

COMMENT ON VIEW v_practice_commitments IS 'Stewardship Dashboard: Current commitments count.';


-- =============================================================================
-- Care Horizon View (next 14 days)
-- =============================================================================

CREATE OR REPLACE VIEW v_care_horizon AS
SELECT
  p.id as practice_id,
  s.id as session_id,
  s.scheduled_start_at,
  s.session_type,
  rc.id as container_id,
  rc.scope as container_scope,
  'session' as item_type
FROM sessions s
JOIN relationship_containers rc ON s.container_id = rc.id
JOIN practices p ON rc.practice_id = p.id
WHERE s.status = 'scheduled'
  AND s.scheduled_start_at BETWEEN NOW() AND NOW() + INTERVAL '14 days'

UNION ALL

SELECT
  t.practice_id,
  t.id as task_id,
  t.due_at as scheduled_start_at,
  NULL as session_type,
  t.container_id,
  t.title as container_scope,
  'task' as item_type
FROM tasks t
WHERE t.status = 'open'
  AND t.due_at BETWEEN NOW() AND NOW() + INTERVAL '14 days'

ORDER BY scheduled_start_at;

COMMENT ON VIEW v_care_horizon IS 'Stewardship Dashboard: Upcoming sessions and tasks (14 days).';


-- =============================================================================
-- Containers Needing Attention
-- =============================================================================

CREATE OR REPLACE VIEW v_containers_needing_attention AS
SELECT
  rc.practice_id,
  rc.id as container_id,
  rc.status,
  rc.scope,
  rc.updated_at,
  MAX(s.scheduled_start_at) as last_session,
  CASE
    WHEN rc.status = 'closing' AND NOT EXISTS (
      SELECT 1 FROM sessions s2
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
FROM relationship_containers rc
LEFT JOIN sessions s ON s.container_id = rc.id AND s.status = 'completed'
WHERE rc.status IN ('active', 'paused', 'closing')
GROUP BY rc.id
HAVING
  -- Closing with no scheduled session
  (rc.status = 'closing' AND NOT EXISTS (
    SELECT 1 FROM sessions s2
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

COMMENT ON VIEW v_containers_needing_attention IS 'Stewardship Dashboard: Containers that need review.';


-- =============================================================================
-- Billing Summary View
-- =============================================================================

CREATE OR REPLACE VIEW v_billing_summary AS
SELECT
  p.id as practice_id,
  SUM(CASE WHEN b.status = 'paid' AND b.paid_at >= DATE_TRUNC('month', NOW())
      THEN b.amount_cents ELSE 0 END) as paid_this_month_cents,
  SUM(CASE WHEN b.status IN ('draft', 'sent')
      THEN b.amount_cents ELSE 0 END) as pending_cents,
  COUNT(*) FILTER (WHERE b.status IN ('draft', 'sent')) as outstanding_count
FROM practices p
LEFT JOIN relationship_containers rc ON rc.practice_id = p.id
LEFT JOIN billing_items b ON b.container_id = rc.id
GROUP BY p.id;

COMMENT ON VIEW v_billing_summary IS 'Stewardship Dashboard: Simple billing overview.';


-- =============================================================================
-- Agreements Pending View
-- =============================================================================

CREATE OR REPLACE VIEW v_agreements_pending AS
SELECT
  p.id as practice_id,
  COUNT(*) as pending_agreements
FROM practices p
JOIN relationship_containers rc ON rc.practice_id = p.id
JOIN agreements a ON a.container_id = rc.id
WHERE a.status IN ('draft', 'sent')
GROUP BY p.id;

COMMENT ON VIEW v_agreements_pending IS 'Stewardship Dashboard: Agreements awaiting acceptance.';


-- -----------------------------------------------------------------------------
-- COMMENTS: Table-Level Documentation
-- -----------------------------------------------------------------------------

COMMENT ON SCHEMA public IS 'Relational Ledger: Ethical practice management for practitioners.';


-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
