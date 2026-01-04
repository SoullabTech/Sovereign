/**
 * FOCUS SCHEDULER
 *
 * Stores and manages focus tasks - the backend for Inbox Triage,
 * Next Step Builder, and Avoidance Breaker.
 *
 * Philosophy: Reduce friction. Store and forget. Act when ready.
 */

import { query, insertOne, findMany, findOne, updateOne } from '@/lib/db/postgres';

// ============================================================================
// Types
// ============================================================================

export interface FocusTask {
  id: string;
  user_id: string;
  capture_text: string;
  task_type: 'task' | 'event' | 'thought';
  next_action?: string;
  scheduled_for?: Date;
  duration_minutes: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completed_at?: Date;
  source: string;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface FocusReminder {
  id: string;
  user_id: string;
  task_id?: string;
  reminder_type: 'follow_up' | 'start' | 'check_in';
  message: string;
  scheduled_for: Date;
  delivery_channel: 'email' | 'push' | 'in_app';
  delivered: boolean;
  delivered_at?: Date;
  recipient?: string;
  original_message?: string;
  created_at: Date;
}

export interface MessageDraft {
  id: string;
  user_id: string;
  message_type: 'text' | 'email';
  recipient: string;
  situation: string;
  draft_text: string;
  subject?: string;
  sent: boolean;
  sent_at?: Date;
  follow_up_scheduled: boolean;
  follow_up_date?: Date;
  created_at: Date;
}

// ============================================================================
// Task Operations
// ============================================================================

/**
 * Create a new focus task from Inbox Triage
 */
export async function createTask(data: {
  userId: string;
  captureText: string;
  taskType: 'task' | 'event' | 'thought';
  nextAction?: string;
  scheduledFor?: Date;
  durationMinutes?: number;
  source?: string;
  metadata?: Record<string, any>;
}): Promise<FocusTask> {
  const task = await insertOne<FocusTask>('focus_tasks', {
    user_id: data.userId,
    capture_text: data.captureText,
    task_type: data.taskType,
    next_action: data.nextAction || null,
    scheduled_for: data.scheduledFor || null,
    duration_minutes: data.durationMinutes || 15,
    status: 'pending',
    source: data.source || 'inbox-triage',
    metadata: JSON.stringify(data.metadata || {}),
  });

  console.log(`[Focus] Task created: ${task.id} (${data.taskType})`);
  return task;
}

/**
 * Get pending tasks for a user
 */
export async function getPendingTasks(userId: string): Promise<FocusTask[]> {
  const result = await query<FocusTask>(
    `SELECT * FROM focus_tasks
     WHERE user_id = $1 AND status IN ('pending', 'in_progress')
     ORDER BY scheduled_for ASC NULLS LAST, created_at DESC`,
    [userId]
  );
  return result.rows;
}

/**
 * Get a single task
 */
export async function getTask(taskId: string): Promise<FocusTask | null> {
  return findOne<FocusTask>('focus_tasks', 'id', taskId);
}

/**
 * Update task status
 */
export async function updateTaskStatus(
  taskId: string,
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
): Promise<FocusTask | null> {
  const updates: Record<string, any> = { status };

  if (status === 'completed') {
    updates.completed_at = new Date();
  }

  return updateOne<FocusTask>('focus_tasks', taskId, updates);
}

/**
 * Start a task (mark as in_progress)
 */
export async function startTask(taskId: string): Promise<FocusTask | null> {
  return updateTaskStatus(taskId, 'in_progress');
}

/**
 * Complete a task
 */
export async function completeTask(taskId: string): Promise<FocusTask | null> {
  return updateTaskStatus(taskId, 'completed');
}

// ============================================================================
// Reminder Operations
// ============================================================================

/**
 * Create a reminder (for follow-ups, start times, check-ins)
 */
export async function createReminder(data: {
  userId: string;
  taskId?: string;
  reminderType: 'follow_up' | 'start' | 'check_in';
  message: string;
  scheduledFor: Date;
  deliveryChannel?: 'email' | 'push' | 'in_app';
  recipient?: string;
  originalMessage?: string;
}): Promise<FocusReminder> {
  const reminder = await insertOne<FocusReminder>('focus_reminders', {
    user_id: data.userId,
    task_id: data.taskId || null,
    reminder_type: data.reminderType,
    message: data.message,
    scheduled_for: data.scheduledFor,
    delivery_channel: data.deliveryChannel || 'email',
    delivered: false,
    recipient: data.recipient || null,
    original_message: data.originalMessage || null,
  });

  console.log(`[Focus] Reminder scheduled: ${reminder.id} for ${data.scheduledFor.toISOString()}`);
  return reminder;
}

/**
 * Get pending reminders that are due
 */
export async function getDueReminders(): Promise<FocusReminder[]> {
  const result = await query<FocusReminder>(
    `SELECT * FROM focus_reminders
     WHERE delivered = FALSE AND scheduled_for <= NOW()
     ORDER BY scheduled_for ASC`,
    []
  );
  return result.rows;
}

/**
 * Get upcoming reminders for a user
 */
export async function getUpcomingReminders(userId: string): Promise<FocusReminder[]> {
  const result = await query<FocusReminder>(
    `SELECT * FROM focus_reminders
     WHERE user_id = $1 AND delivered = FALSE
     ORDER BY scheduled_for ASC
     LIMIT 10`,
    [userId]
  );
  return result.rows;
}

/**
 * Mark a reminder as delivered
 */
export async function markReminderDelivered(reminderId: string): Promise<FocusReminder | null> {
  return updateOne<FocusReminder>('focus_reminders', reminderId, {
    delivered: true,
    delivered_at: new Date(),
  });
}

// ============================================================================
// Message Draft Operations (Avoidance Breaker)
// ============================================================================

/**
 * Save a message draft
 */
export async function saveDraft(data: {
  userId: string;
  messageType: 'text' | 'email';
  recipient: string;
  situation: string;
  draftText: string;
  subject?: string;
}): Promise<MessageDraft> {
  const draft = await insertOne<MessageDraft>('focus_message_drafts', {
    user_id: data.userId,
    message_type: data.messageType,
    recipient: data.recipient,
    situation: data.situation,
    draft_text: data.draftText,
    subject: data.subject || null,
    sent: false,
    follow_up_scheduled: false,
  });

  console.log(`[Focus] Draft saved: ${draft.id} to ${data.recipient}`);
  return draft;
}

/**
 * Mark a draft as sent and schedule follow-up
 */
export async function markDraftSent(
  draftId: string,
  followUpDate?: Date
): Promise<MessageDraft | null> {
  const updates: Record<string, any> = {
    sent: true,
    sent_at: new Date(),
  };

  if (followUpDate) {
    updates.follow_up_scheduled = true;
    updates.follow_up_date = followUpDate;
  }

  return updateOne<MessageDraft>('focus_message_drafts', draftId, updates);
}

/**
 * Get recent drafts for a user
 */
export async function getRecentDrafts(userId: string, limit = 5): Promise<MessageDraft[]> {
  const result = await query<MessageDraft>(
    `SELECT * FROM focus_message_drafts
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

// ============================================================================
// Convenience: Schedule Follow-Up (combines reminder + draft update)
// ============================================================================

/**
 * Schedule a follow-up reminder for a message
 */
export async function scheduleFollowUp(data: {
  userId: string;
  draftId?: string;
  recipient: string;
  situation: string;
  originalMessage: string;
  followUpDate: Date;
}): Promise<FocusReminder> {
  // Create the reminder
  const reminder = await createReminder({
    userId: data.userId,
    reminderType: 'follow_up',
    message: `Follow up with ${data.recipient}: ${data.situation.substring(0, 50)}...`,
    scheduledFor: data.followUpDate,
    deliveryChannel: 'email',
    recipient: data.recipient,
    originalMessage: data.originalMessage,
  });

  // Update the draft if provided
  if (data.draftId) {
    await markDraftSent(data.draftId, data.followUpDate);
  }

  return reminder;
}

// ============================================================================
// Export
// ============================================================================

export const FocusScheduler = {
  // Tasks
  createTask,
  getPendingTasks,
  getTask,
  updateTaskStatus,
  startTask,
  completeTask,

  // Reminders
  createReminder,
  getDueReminders,
  getUpcomingReminders,
  markReminderDelivered,

  // Drafts
  saveDraft,
  markDraftSent,
  getRecentDrafts,

  // Convenience
  scheduleFollowUp,
};

export default FocusScheduler;
