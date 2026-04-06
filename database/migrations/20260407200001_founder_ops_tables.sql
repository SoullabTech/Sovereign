-- MAIA Ops v1: Founder operational tables
-- Purpose: Task tracking, CRM/pipeline, content queue, activity log
-- Part of: /founder/* operational command center

-- Ensure updated_at trigger function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ops_contacts (create first — tasks and content reference it)
-- ============================================================
CREATE TABLE IF NOT EXISTS ops_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  contact_type TEXT NOT NULL DEFAULT 'lead'
    CHECK (contact_type IN ('lead','beta_tester','practitioner','partner','press','other')),
  pipeline_stage TEXT NOT NULL DEFAULT 'new'
    CHECK (pipeline_stage IN ('new','contacted','exploring','committed','active','churned')),
  source TEXT,          -- 'inbound', 'referral', 'event', 'cold', 'platform'
  intent TEXT,          -- 'curious', 'evaluating', 'ready', 'unclear'
  member_id UUID REFERENCES members(id),
  notes TEXT,
  last_contacted TIMESTAMPTZ,
  next_action TEXT,
  next_action_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ops_contacts_pipeline ON ops_contacts(pipeline_stage) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ops_contacts_type ON ops_contacts(contact_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ops_contacts_member ON ops_contacts(member_id) WHERE member_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ops_contacts_next_action ON ops_contacts(next_action_date) WHERE deleted_at IS NULL AND next_action_date IS NOT NULL;

CREATE TRIGGER ops_contacts_updated_at
  BEFORE UPDATE ON ops_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ops_tasks
-- ============================================================
CREATE TABLE IF NOT EXISTS ops_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo'
    CHECK (status IN ('todo','in_progress','done','cancelled')),
  priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('urgent','high','normal','low')),
  category TEXT NOT NULL DEFAULT 'general'
    CHECK (category IN ('general','beta','marketing','sales','content','rollout','ops')),
  owner TEXT DEFAULT 'kelly',
  state_changed_at TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  contact_id UUID REFERENCES ops_contacts(id),
  metadata JSONB DEFAULT '{}',
  deleted_at TIMESTAMPTZ,
  created_by TEXT DEFAULT 'kelly',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ops_tasks_status ON ops_tasks(status, priority) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ops_tasks_category ON ops_tasks(category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ops_tasks_due ON ops_tasks(due_date) WHERE deleted_at IS NULL AND status NOT IN ('done','cancelled');
CREATE INDEX IF NOT EXISTS idx_ops_tasks_owner ON ops_tasks(owner) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ops_tasks_state_age ON ops_tasks(state_changed_at) WHERE deleted_at IS NULL AND status = 'in_progress';

CREATE TRIGGER ops_tasks_updated_at
  BEFORE UPDATE ON ops_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ops_content_queue
-- ============================================================
CREATE TABLE IF NOT EXISTS ops_content_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'idea'
    CHECK (content_type IN ('idea','draft','email','post','substack','social','invitation','sales_page')),
  status TEXT NOT NULL DEFAULT 'captured'
    CHECK (status IN ('captured','drafting','review','approved','published','archived')),
  body TEXT,
  target_channel TEXT,
  energy TEXT DEFAULT 'unknown'
    CHECK (energy IN ('high','medium','low','unknown')),
  priority_signal BOOLEAN DEFAULT false,
  contact_id UUID REFERENCES ops_contacts(id),
  metadata JSONB DEFAULT '{}',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ops_content_status ON ops_content_queue(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ops_content_type ON ops_content_queue(content_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ops_content_energy ON ops_content_queue(energy) WHERE deleted_at IS NULL AND energy = 'high';
CREATE INDEX IF NOT EXISTS idx_ops_content_priority ON ops_content_queue(priority_signal) WHERE deleted_at IS NULL AND priority_signal = true;

CREATE TRIGGER ops_content_queue_updated_at
  BEFORE UPDATE ON ops_content_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ops_activity_log (audit trail for all ops mutations)
-- ============================================================
CREATE TABLE IF NOT EXISTS ops_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL
    CHECK (entity_type IN ('task','contact','content')),
  entity_id UUID NOT NULL,
  action TEXT NOT NULL
    CHECK (action IN ('created','updated','status_changed','deleted')),
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ops_activity_entity ON ops_activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_ops_activity_recent ON ops_activity_log(created_at DESC);
