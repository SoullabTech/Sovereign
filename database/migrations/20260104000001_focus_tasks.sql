-- Focus Tasks & Reminders
-- Supports the ADHD focus tools: Inbox Triage, Next Step Builder, Avoidance Breaker

-- Focus tasks table - captures from Inbox Triage
CREATE TABLE IF NOT EXISTS focus_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,

  -- From triage
  capture_text TEXT NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('task', 'event', 'thought')),
  next_action TEXT, -- The very next physical action

  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 15,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,

  -- Metadata
  source TEXT DEFAULT 'inbox-triage', -- inbox-triage, next-step, avoidance-breaker
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Focus reminders table - for follow-ups
CREATE TABLE IF NOT EXISTS focus_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  task_id UUID REFERENCES focus_tasks(id) ON DELETE CASCADE,

  -- Reminder details
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('follow_up', 'start', 'check_in')),
  message TEXT NOT NULL,

  -- Scheduling
  scheduled_for TIMESTAMPTZ NOT NULL,

  -- Delivery
  delivery_channel TEXT DEFAULT 'email' CHECK (delivery_channel IN ('email', 'push', 'in_app')),
  delivered BOOLEAN DEFAULT FALSE,
  delivered_at TIMESTAMPTZ,

  -- For avoidance breaker follow-ups
  recipient TEXT, -- Who they were messaging
  original_message TEXT, -- What they sent

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Message drafts table - for avoidance breaker
CREATE TABLE IF NOT EXISTS focus_message_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,

  -- Message details
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'email')),
  recipient TEXT NOT NULL,
  situation TEXT NOT NULL,
  draft_text TEXT NOT NULL,
  subject TEXT, -- For emails

  -- Status
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,

  -- Follow-up
  follow_up_scheduled BOOLEAN DEFAULT FALSE,
  follow_up_date TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_focus_tasks_user_status ON focus_tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_focus_tasks_scheduled ON focus_tasks(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_focus_reminders_pending ON focus_reminders(scheduled_for) WHERE delivered = FALSE;
CREATE INDEX IF NOT EXISTS idx_focus_reminders_user ON focus_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_drafts_user ON focus_message_drafts(user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_focus_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS focus_tasks_updated_at ON focus_tasks;
CREATE TRIGGER focus_tasks_updated_at
  BEFORE UPDATE ON focus_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_focus_tasks_updated_at();
