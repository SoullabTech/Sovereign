// MAIA Ops v1 — Founder Console Types

// ============================================================
// ops_tasks
// ============================================================

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';
export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low';
export type TaskCategory = 'general' | 'beta' | 'marketing' | 'sales' | 'content' | 'rollout' | 'ops';

export interface OpsTask {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  owner: string;
  state_changed_at: string;
  due_date: string | null;
  contact_id: string | null;
  metadata: Record<string, unknown>;
  deleted_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  owner?: string;
  due_date?: string;
  contact_id?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  owner?: string;
  due_date?: string | null;
  contact_id?: string | null;
  metadata?: Record<string, unknown>;
}

// ============================================================
// ops_contacts
// ============================================================

export type ContactType = 'lead' | 'beta_tester' | 'practitioner' | 'partner' | 'press' | 'other';
export type PipelineStage = 'new' | 'contacted' | 'exploring' | 'committed' | 'active' | 'churned';

export interface OpsContact {
  id: string;
  name: string;
  email: string | null;
  contact_type: ContactType;
  pipeline_stage: PipelineStage;
  source: string | null;
  intent: string | null;
  member_id: string | null;
  notes: string | null;
  last_contacted: string | null;
  next_action: string | null;
  next_action_date: string | null;
  metadata: Record<string, unknown>;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateContactInput {
  name: string;
  email?: string;
  contact_type?: ContactType;
  pipeline_stage?: PipelineStage;
  source?: string;
  intent?: string;
  member_id?: string;
  notes?: string;
  next_action?: string;
  next_action_date?: string;
}

export interface UpdateContactInput {
  name?: string;
  email?: string;
  contact_type?: ContactType;
  pipeline_stage?: PipelineStage;
  source?: string;
  intent?: string;
  member_id?: string;
  notes?: string;
  last_contacted?: string;
  next_action?: string | null;
  next_action_date?: string | null;
  metadata?: Record<string, unknown>;
}

// ============================================================
// ops_content_queue
// ============================================================

export type ContentType = 'idea' | 'draft' | 'email' | 'post' | 'substack' | 'social' | 'invitation' | 'sales_page';
export type ContentStatus = 'captured' | 'drafting' | 'review' | 'approved' | 'published' | 'archived';
export type EnergyLevel = 'high' | 'medium' | 'low' | 'unknown';

export interface OpsContentItem {
  id: string;
  title: string;
  content_type: ContentType;
  status: ContentStatus;
  body: string | null;
  target_channel: string | null;
  energy: EnergyLevel;
  priority_signal: boolean;
  contact_id: string | null;
  metadata: Record<string, unknown>;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateContentInput {
  title: string;
  content_type?: ContentType;
  status?: ContentStatus;
  body?: string;
  target_channel?: string;
  energy?: EnergyLevel;
  priority_signal?: boolean;
  contact_id?: string;
}

export interface UpdateContentInput {
  title?: string;
  content_type?: ContentType;
  status?: ContentStatus;
  body?: string;
  target_channel?: string;
  energy?: EnergyLevel;
  priority_signal?: boolean;
  contact_id?: string | null;
  metadata?: Record<string, unknown>;
}

// ============================================================
// ops_activity_log
// ============================================================

export type ActivityEntityType = 'task' | 'contact' | 'content';
export type ActivityAction = 'created' | 'updated' | 'status_changed' | 'deleted';

export interface OpsActivity {
  id: string;
  entity_type: ActivityEntityType;
  entity_id: string;
  action: ActivityAction;
  details: Record<string, unknown>;
  created_at: string;
}

// ============================================================
// Aggregation types (Today, Rollout, Signals)
// ============================================================

export interface TodaySummary {
  overdue_tasks: OpsTask[];
  today_tasks: OpsTask[];
  followups_due: OpsContact[];
  vitals: {
    total_conversations_24h: number;
    active_members_7d: number;
    error_count_24h: number;
  };
  recent_activity: OpsActivity[];
}

export interface RolloutSummary {
  funnel: {
    stage: PipelineStage;
    count: number;
  }[];
  stalled: OpsContact[];
  recent_activations: OpsContact[];
}

export interface Signal {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  category: string;
  message: string;
  value: number | null;
  trend: 'up' | 'down' | 'flat' | null;
}

export interface SignalsSummary {
  signals: Signal[];
  stuck_tasks: OpsTask[];
  stale_contacts: OpsContact[];
}
