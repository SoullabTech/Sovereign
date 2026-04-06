// MAIA Ops v1 — Founder Console Database Queries
import { query } from '@/lib/db/postgres';
import type {
  OpsTask, CreateTaskInput, UpdateTaskInput,
  OpsContact, CreateContactInput, UpdateContactInput,
  OpsContentItem, CreateContentInput, UpdateContentInput,
  OpsActivity, ActivityEntityType, ActivityAction,
} from './types';

// ============================================================
// Activity log (used by all mutations)
// ============================================================

export async function logOpsActivity(
  entityType: ActivityEntityType,
  entityId: string,
  action: ActivityAction,
  details: Record<string, unknown> = {},
): Promise<void> {
  try {
    await query(
      `INSERT INTO ops_activity_log (entity_type, entity_id, action, details) VALUES ($1, $2, $3, $4)`,
      [entityType, entityId, action, JSON.stringify(details)],
    );
  } catch (err) {
    console.warn('[founder-ops] activity log write failed:', err);
  }
}

// ============================================================
// Tasks
// ============================================================

const TASK_COLUMNS = `id, title, description, status, priority, category, owner, state_changed_at, due_date, contact_id, metadata, deleted_at, created_by, created_at, updated_at`;

export async function listTasks(filters?: {
  status?: string;
  category?: string;
  owner?: string;
  limit?: number;
}): Promise<OpsTask[]> {
  const conditions = ['deleted_at IS NULL'];
  const params: unknown[] = [];
  let idx = 1;

  if (filters?.status) {
    conditions.push(`status = $${idx++}`);
    params.push(filters.status);
  }
  if (filters?.category) {
    conditions.push(`category = $${idx++}`);
    params.push(filters.category);
  }
  if (filters?.owner) {
    conditions.push(`owner = $${idx++}`);
    params.push(filters.owner);
  }

  const limit = filters?.limit || 100;
  const sql = `SELECT ${TASK_COLUMNS} FROM ops_tasks WHERE ${conditions.join(' AND ')} ORDER BY
    CASE priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'normal' THEN 2 WHEN 'low' THEN 3 END,
    due_date ASC NULLS LAST,
    created_at DESC
    LIMIT $${idx}`;
  params.push(limit);

  const result = await query(sql, params);
  return result.rows as OpsTask[];
}

export async function getTask(id: string): Promise<OpsTask | null> {
  const result = await query(
    `SELECT ${TASK_COLUMNS} FROM ops_tasks WHERE id = $1 AND deleted_at IS NULL`,
    [id],
  );
  return (result.rows[0] as OpsTask) || null;
}

export async function createTask(input: CreateTaskInput): Promise<OpsTask> {
  const result = await query(
    `INSERT INTO ops_tasks (title, description, status, priority, category, owner, due_date, contact_id, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING ${TASK_COLUMNS}`,
    [
      input.title,
      input.description || null,
      input.status || 'todo',
      input.priority || 'normal',
      input.category || 'general',
      input.owner || 'kelly',
      input.due_date || null,
      input.contact_id || null,
      JSON.stringify(input.metadata || {}),
    ],
  );
  const task = result.rows[0] as OpsTask;
  // Fire-and-forget activity log
  logOpsActivity('task', task.id, 'created', { title: task.title });
  return task;
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<OpsTask | null> {
  const existing = await getTask(id);
  if (!existing) return null;

  const sets: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  const fields: (keyof UpdateTaskInput)[] = ['title', 'description', 'priority', 'category', 'owner', 'due_date', 'contact_id'];
  for (const field of fields) {
    if (input[field] !== undefined) {
      sets.push(`${field} = $${idx++}`);
      params.push(input[field]);
    }
  }

  // Status change tracks state_changed_at
  if (input.status !== undefined && input.status !== existing.status) {
    sets.push(`status = $${idx++}`);
    params.push(input.status);
    sets.push(`state_changed_at = NOW()`);
  }

  if (input.metadata !== undefined) {
    sets.push(`metadata = $${idx++}`);
    params.push(JSON.stringify(input.metadata));
  }

  if (sets.length === 0) return existing;

  params.push(id);
  const result = await query(
    `UPDATE ops_tasks SET ${sets.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING ${TASK_COLUMNS}`,
    params,
  );
  const task = result.rows[0] as OpsTask;
  if (task) {
    const action: ActivityAction = input.status && input.status !== existing.status ? 'status_changed' : 'updated';
    logOpsActivity('task', task.id, action, {
      ...(input.status ? { from: existing.status, to: input.status } : {}),
      title: task.title,
    });
  }
  return task || null;
}

export async function softDeleteTask(id: string): Promise<boolean> {
  const result = await query(
    `UPDATE ops_tasks SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
    [id],
  );
  if (result.rows.length > 0) {
    logOpsActivity('task', id, 'deleted', {});
    return true;
  }
  return false;
}

// ============================================================
// Contacts
// ============================================================

const CONTACT_COLUMNS = `id, name, email, contact_type, pipeline_stage, source, intent, member_id, notes, last_contacted, next_action, next_action_date, metadata, deleted_at, created_at, updated_at`;

export async function listContacts(filters?: {
  contact_type?: string;
  pipeline_stage?: string;
  limit?: number;
}): Promise<OpsContact[]> {
  const conditions = ['deleted_at IS NULL'];
  const params: unknown[] = [];
  let idx = 1;

  if (filters?.contact_type) {
    conditions.push(`contact_type = $${idx++}`);
    params.push(filters.contact_type);
  }
  if (filters?.pipeline_stage) {
    conditions.push(`pipeline_stage = $${idx++}`);
    params.push(filters.pipeline_stage);
  }

  const limit = filters?.limit || 100;
  params.push(limit);

  const sql = `SELECT ${CONTACT_COLUMNS} FROM ops_contacts WHERE ${conditions.join(' AND ')}
    ORDER BY
      CASE pipeline_stage WHEN 'new' THEN 0 WHEN 'contacted' THEN 1 WHEN 'exploring' THEN 2 WHEN 'committed' THEN 3 WHEN 'active' THEN 4 WHEN 'churned' THEN 5 END,
      next_action_date ASC NULLS LAST,
      created_at DESC
    LIMIT $${idx}`;

  const result = await query(sql, params);
  return result.rows as OpsContact[];
}

export async function getContact(id: string): Promise<OpsContact | null> {
  const result = await query(
    `SELECT ${CONTACT_COLUMNS} FROM ops_contacts WHERE id = $1 AND deleted_at IS NULL`,
    [id],
  );
  return (result.rows[0] as OpsContact) || null;
}

export async function createContact(input: CreateContactInput): Promise<OpsContact> {
  const result = await query(
    `INSERT INTO ops_contacts (name, email, contact_type, pipeline_stage, source, intent, member_id, notes, next_action, next_action_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING ${CONTACT_COLUMNS}`,
    [
      input.name,
      input.email || null,
      input.contact_type || 'lead',
      input.pipeline_stage || 'new',
      input.source || null,
      input.intent || null,
      input.member_id || null,
      input.notes || null,
      input.next_action || null,
      input.next_action_date || null,
    ],
  );
  const contact = result.rows[0] as OpsContact;
  logOpsActivity('contact', contact.id, 'created', { name: contact.name, type: contact.contact_type });
  return contact;
}

export async function updateContact(id: string, input: UpdateContactInput): Promise<OpsContact | null> {
  const existing = await getContact(id);
  if (!existing) return null;

  const sets: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  const fields: (keyof UpdateContactInput)[] = [
    'name', 'email', 'contact_type', 'pipeline_stage', 'source', 'intent',
    'member_id', 'notes', 'last_contacted', 'next_action', 'next_action_date',
  ];
  for (const field of fields) {
    if (input[field] !== undefined) {
      sets.push(`${field} = $${idx++}`);
      params.push(input[field]);
    }
  }

  if (input.metadata !== undefined) {
    sets.push(`metadata = $${idx++}`);
    params.push(JSON.stringify(input.metadata));
  }

  if (sets.length === 0) return existing;

  params.push(id);
  const result = await query(
    `UPDATE ops_contacts SET ${sets.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING ${CONTACT_COLUMNS}`,
    params,
  );
  const contact = result.rows[0] as OpsContact;
  if (contact) {
    const action: ActivityAction = input.pipeline_stage && input.pipeline_stage !== existing.pipeline_stage ? 'status_changed' : 'updated';
    logOpsActivity('contact', contact.id, action, {
      ...(input.pipeline_stage ? { from: existing.pipeline_stage, to: input.pipeline_stage } : {}),
      name: contact.name,
    });
  }
  return contact || null;
}

// ============================================================
// Content Queue
// ============================================================

const CONTENT_COLUMNS = `id, title, content_type, status, body, target_channel, energy, priority_signal, contact_id, metadata, deleted_at, created_at, updated_at`;

export async function listContent(filters?: {
  content_type?: string;
  status?: string;
  energy?: string;
  priority_signal?: boolean;
  limit?: number;
}): Promise<OpsContentItem[]> {
  const conditions = ['deleted_at IS NULL'];
  const params: unknown[] = [];
  let idx = 1;

  if (filters?.content_type) {
    conditions.push(`content_type = $${idx++}`);
    params.push(filters.content_type);
  }
  if (filters?.status) {
    conditions.push(`status = $${idx++}`);
    params.push(filters.status);
  }
  if (filters?.energy) {
    conditions.push(`energy = $${idx++}`);
    params.push(filters.energy);
  }
  if (filters?.priority_signal !== undefined) {
    conditions.push(`priority_signal = $${idx++}`);
    params.push(filters.priority_signal);
  }

  const limit = filters?.limit || 100;
  params.push(limit);

  const sql = `SELECT ${CONTENT_COLUMNS} FROM ops_content_queue WHERE ${conditions.join(' AND ')}
    ORDER BY
      priority_signal DESC,
      CASE energy WHEN 'high' THEN 0 WHEN 'medium' THEN 1 WHEN 'low' THEN 2 WHEN 'unknown' THEN 3 END,
      created_at DESC
    LIMIT $${idx}`;

  const result = await query(sql, params);
  return result.rows as OpsContentItem[];
}

export async function getContentItem(id: string): Promise<OpsContentItem | null> {
  const result = await query(
    `SELECT ${CONTENT_COLUMNS} FROM ops_content_queue WHERE id = $1 AND deleted_at IS NULL`,
    [id],
  );
  return (result.rows[0] as OpsContentItem) || null;
}

export async function createContent(input: CreateContentInput): Promise<OpsContentItem> {
  const result = await query(
    `INSERT INTO ops_content_queue (title, content_type, status, body, target_channel, energy, priority_signal, contact_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING ${CONTENT_COLUMNS}`,
    [
      input.title,
      input.content_type || 'idea',
      input.status || 'captured',
      input.body || null,
      input.target_channel || null,
      input.energy || 'unknown',
      input.priority_signal || false,
      input.contact_id || null,
    ],
  );
  const item = result.rows[0] as OpsContentItem;
  logOpsActivity('content', item.id, 'created', { title: item.title, type: item.content_type });
  return item;
}

export async function updateContent(id: string, input: UpdateContentInput): Promise<OpsContentItem | null> {
  const existing = await getContentItem(id);
  if (!existing) return null;

  const sets: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  const fields: (keyof UpdateContentInput)[] = [
    'title', 'content_type', 'status', 'body', 'target_channel',
    'energy', 'priority_signal', 'contact_id',
  ];
  for (const field of fields) {
    if (input[field] !== undefined) {
      sets.push(`${field} = $${idx++}`);
      params.push(input[field]);
    }
  }

  if (input.metadata !== undefined) {
    sets.push(`metadata = $${idx++}`);
    params.push(JSON.stringify(input.metadata));
  }

  if (sets.length === 0) return existing;

  params.push(id);
  const result = await query(
    `UPDATE ops_content_queue SET ${sets.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING ${CONTENT_COLUMNS}`,
    params,
  );
  const item = result.rows[0] as OpsContentItem;
  if (item) {
    const action: ActivityAction = input.status && input.status !== existing.status ? 'status_changed' : 'updated';
    logOpsActivity('content', item.id, action, {
      ...(input.status ? { from: existing.status, to: input.status } : {}),
      title: item.title,
    });
  }
  return item || null;
}

// ============================================================
// Activity log reads
// ============================================================

export async function listRecentActivity(limit = 20): Promise<OpsActivity[]> {
  const result = await query(
    `SELECT id, entity_type, entity_id, action, details, created_at
     FROM ops_activity_log ORDER BY created_at DESC LIMIT $1`,
    [limit],
  );
  return result.rows as OpsActivity[];
}
