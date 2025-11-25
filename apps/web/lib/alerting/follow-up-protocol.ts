import { DateTime } from 'luxon';
import { RealTimeAlertService, type AlertPayload, type TherapistContact } from './real-time-alerts';

interface FollowUpTask {
  id: string;
  crisis_intervention_id: string;
  user_id: string;
  therapist_id: string;
  task_type: 'automated_checkin' | 'therapist_reminder' | 'assessment_prompt' | 'safety_plan_review';
  scheduled_for: string; // ISO timestamp
  status: 'pending' | 'completed' | 'skipped' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';

  // Task-specific data
  checkin_questions?: string[];
  reminder_message?: string;
  assessment_type?: string;

  // Completion tracking
  completed_at?: string;
  completion_notes?: string;
  user_response?: any;

  // Retry logic
  retry_count: number;
  max_retries: number;
  next_retry?: string;
}

interface FollowUpProtocol {
  crisis_level: 'moderate' | 'high' | 'crisis';
  timeline: FollowUpSchedule[];
}

interface FollowUpSchedule {
  hours_after: number;
  tasks: Omit<FollowUpTask, 'id' | 'crisis_intervention_id' | 'user_id' | 'therapist_id' | 'scheduled_for' | 'status' | 'retry_count'>[];
}

export class FollowUpProtocolManager {
  private alertService: RealTimeAlertService;
  private protocols: Map<string, FollowUpProtocol> = new Map();
  private activeFollowUps: Map<string, FollowUpTask[]> = new Map();
  private taskQueue: FollowUpTask[] = [];

  constructor(alertService: RealTimeAlertService) {
    this.alertService = alertService;
    this.initializeProtocols();
    this.startTaskProcessor();
  }

  private initializeProtocols(): void {
    // 72-hour follow-up protocol for crisis interventions
    this.protocols.set('crisis', {
      crisis_level: 'crisis',
      timeline: [
        {
          hours_after: 1, // 1 hour after crisis
          tasks: [
            {
              task_type: 'therapist_reminder',
              priority: 'critical',
              reminder_message: 'Crisis intervention follow-up required - check in with user within next hour',
              max_retries: 3
            }
          ]
        },
        {
          hours_after: 6, // 6 hours after
          tasks: [
            {
              task_type: 'automated_checkin',
              priority: 'high',
              checkin_questions: [
                'How are you feeling right now on a scale of 1-10?',
                'Are you in a safe place?',
                'Do you have someone you can talk to if needed?'
              ],
              max_retries: 2
            },
            {
              task_type: 'therapist_reminder',
              priority: 'high',
              reminder_message: 'User automated check-in scheduled - review response and consider direct contact',
              max_retries: 2
            }
          ]
        },
        {
          hours_after: 24, // 24 hours after
          tasks: [
            {
              task_type: 'automated_checkin',
              priority: 'high',
              checkin_questions: [
                'How has the past day been for you?',
                'Have you been able to use any coping strategies?',
                'Is there anything specific you need support with right now?'
              ],
              max_retries: 2
            },
            {
              task_type: 'assessment_prompt',
              priority: 'medium',
              assessment_type: 'crisis_followup',
              max_retries: 1
            }
          ]
        },
        {
          hours_after: 48, // 48 hours after
          tasks: [
            {
              task_type: 'therapist_reminder',
              priority: 'medium',
              reminder_message: '48-hour crisis follow-up - schedule direct contact with user',
              max_retries: 1
            }
          ]
        },
        {
          hours_after: 72, // 72 hours after
          tasks: [
            {
              task_type: 'safety_plan_review',
              priority: 'medium',
              max_retries: 1
            },
            {
              task_type: 'automated_checkin',
              priority: 'medium',
              checkin_questions: [
                'Looking back over the past few days, how are you feeling?',
                'What has been most helpful for you during this time?',
                'Do you feel ready to continue with regular MAIA sessions?'
              ],
              max_retries: 1
            }
          ]
        }
      ]
    });

    // High-risk follow-up protocol
    this.protocols.set('high', {
      crisis_level: 'high',
      timeline: [
        {
          hours_after: 2, // 2 hours after
          tasks: [
            {
              task_type: 'therapist_reminder',
              priority: 'high',
              reminder_message: 'High-risk event follow-up - consider reaching out to user',
              max_retries: 2
            }
          ]
        },
        {
          hours_after: 12, // 12 hours after
          tasks: [
            {
              task_type: 'automated_checkin',
              priority: 'medium',
              checkin_questions: [
                'How are you doing today?',
                'Have you had a chance to practice any self-care?'
              ],
              max_retries: 2
            }
          ]
        },
        {
          hours_after: 48, // 48 hours after
          tasks: [
            {
              task_type: 'assessment_prompt',
              priority: 'low',
              assessment_type: 'mood_followup',
              max_retries: 1
            }
          ]
        }
      ]
    });

    // Moderate risk follow-up protocol
    this.protocols.set('moderate', {
      crisis_level: 'moderate',
      timeline: [
        {
          hours_after: 24, // 24 hours after
          tasks: [
            {
              task_type: 'automated_checkin',
              priority: 'low',
              checkin_questions: [
                'How has your day been?',
                'Any insights or reflections since our last conversation?'
              ],
              max_retries: 1
            }
          ]
        }
      ]
    });
  }

  async initiateCrisisFollowUp(
    crisisInterventionId: string,
    userId: string,
    therapistId: string,
    riskLevel: 'moderate' | 'high' | 'crisis'
  ): Promise<string[]> {
    const protocol = this.protocols.get(riskLevel);
    if (!protocol) {
      throw new Error(`No follow-up protocol found for risk level: ${riskLevel}`);
    }

    const followUpTasks: FollowUpTask[] = [];
    const now = DateTime.now();

    // Generate all tasks based on protocol timeline
    for (const scheduleItem of protocol.timeline) {
      const scheduledTime = now.plus({ hours: scheduleItem.hours_after });

      for (const taskTemplate of scheduleItem.tasks) {
        const task: FollowUpTask = {
          id: `followup_${crisisInterventionId}_${scheduleItem.hours_after}h_${taskTemplate.task_type}_${Date.now()}`,
          crisis_intervention_id: crisisInterventionId,
          user_id: userId,
          therapist_id: therapistId,
          scheduled_for: scheduledTime.toISO(),
          status: 'pending',
          retry_count: 0,
          ...taskTemplate
        };

        followUpTasks.push(task);
      }
    }

    // Store follow-up tasks
    this.activeFollowUps.set(crisisInterventionId, followUpTasks);

    // Add to task queue for processing
    for (const task of followUpTasks) {
      this.scheduleTask(task);
    }

    // Log follow-up initiation
    console.log(`Initiated ${riskLevel} follow-up protocol for crisis ${crisisInterventionId}:`, {
      total_tasks: followUpTasks.length,
      timeline_hours: protocol.timeline.map(t => t.hours_after),
      user_id: userId
    });

    return followUpTasks.map(task => task.id);
  }

  private scheduleTask(task: FollowUpTask): void {
    const scheduledTime = DateTime.fromISO(task.scheduled_for);
    const now = DateTime.now();
    const delayMs = scheduledTime.diff(now).toMillis();

    if (delayMs <= 0) {
      // Task is overdue, execute immediately
      this.taskQueue.push(task);
    } else {
      // Schedule for future execution
      setTimeout(() => {
        this.taskQueue.push(task);
      }, delayMs);
    }
  }

  private startTaskProcessor(): void {
    // Process task queue every 30 seconds
    setInterval(async () => {
      await this.processTaskQueue();
    }, 30000);
  }

  private async processTaskQueue(): Promise<void> {
    const tasksToProcess = this.taskQueue.splice(0, 10); // Process up to 10 tasks at a time

    for (const task of tasksToProcess) {
      try {
        await this.executeTask(task);
      } catch (error) {
        console.error(`Failed to execute follow-up task ${task.id}:`, error);
        await this.handleTaskFailure(task, error);
      }
    }
  }

  private async executeTask(task: FollowUpTask): Promise<void> {
    console.log(`Executing follow-up task: ${task.task_type} for user ${task.user_id}`);

    switch (task.task_type) {
      case 'automated_checkin':
        await this.executeAutomatedCheckIn(task);
        break;
      case 'therapist_reminder':
        await this.executeTherapistReminder(task);
        break;
      case 'assessment_prompt':
        await this.executeAssessmentPrompt(task);
        break;
      case 'safety_plan_review':
        await this.executeSafetyPlanReview(task);
        break;
    }

    // Mark task as completed
    task.status = 'completed';
    task.completed_at = DateTime.now().toISO();

    await this.logTaskCompletion(task);
  }

  private async executeAutomatedCheckIn(task: FollowUpTask): Promise<void> {
    if (!task.checkin_questions) return;

    // This would integrate with your chat system to send automated messages
    const checkinData = {
      user_id: task.user_id,
      message_type: 'automated_followup',
      questions: task.checkin_questions,
      priority: task.priority,
      crisis_intervention_id: task.crisis_intervention_id,
      follow_up_task_id: task.id
    };

    // Send check-in message through your chat system
    await this.sendAutomatedMessage(checkinData);

    task.completion_notes = `Automated check-in sent with ${task.checkin_questions.length} questions`;
  }

  private async executeTherapistReminder(task: FollowUpTask): Promise<void> {
    if (!task.reminder_message) return;

    // Get therapist contact info
    const therapist = await this.getTherapistContact(task.therapist_id);
    if (!therapist) {
      throw new Error(`Therapist ${task.therapist_id} not found`);
    }

    // Create alert for therapist reminder
    const reminderAlert: AlertPayload = {
      alert_id: `reminder_${task.id}`,
      user_id: task.user_id,
      therapist_id: task.therapist_id,
      risk_level: 'moderate', // Reminder alerts are always moderate
      trigger_reason: 'Follow-up protocol reminder',
      context: {
        session_id: task.crisis_intervention_id,
        message_count: 0,
        recent_messages: [],
        safety_flags: ['follow_up_required']
      },
      timestamp: DateTime.now().toISO(),
      escalation_level: task.priority === 'critical' ? 'urgent' : 'standard',
      follow_up_required: false
    };

    await this.alertService.sendAlert(therapist, reminderAlert);

    task.completion_notes = `Therapist reminder sent: ${task.reminder_message}`;
  }

  private async executeAssessmentPrompt(task: FollowUpTask): Promise<void> {
    if (!task.assessment_type) return;

    // This would integrate with your assessment system
    const assessmentData = {
      user_id: task.user_id,
      assessment_type: task.assessment_type,
      context: 'crisis_followup',
      crisis_intervention_id: task.crisis_intervention_id,
      follow_up_task_id: task.id
    };

    await this.triggerAssessment(assessmentData);

    task.completion_notes = `Assessment prompt sent: ${task.assessment_type}`;
  }

  private async executeSafetyPlanReview(task: FollowUpTask): Promise<void> {
    // Send safety plan review prompt
    const safetyReviewData = {
      user_id: task.user_id,
      message_type: 'safety_plan_review',
      prompts: [
        'Let\'s review your safety plan together.',
        'Who are your key support people right now?',
        'What coping strategies have been most helpful?',
        'Are there any warning signs we should update in your plan?'
      ],
      crisis_intervention_id: task.crisis_intervention_id,
      follow_up_task_id: task.id
    };

    await this.sendAutomatedMessage(safetyReviewData);

    task.completion_notes = 'Safety plan review initiated';
  }

  private async handleTaskFailure(task: FollowUpTask, error: any): Promise<void> {
    task.retry_count++;

    if (task.retry_count < task.max_retries) {
      // Schedule retry with exponential backoff
      const retryDelayMs = Math.pow(2, task.retry_count) * 60000; // 1min, 2min, 4min
      task.next_retry = DateTime.now().plus({ milliseconds: retryDelayMs }).toISO();

      setTimeout(() => {
        this.taskQueue.push(task);
      }, retryDelayMs);

      console.log(`Scheduled retry ${task.retry_count}/${task.max_retries} for task ${task.id}`);
    } else {
      // Max retries exceeded
      task.status = 'failed';
      task.completion_notes = `Failed after ${task.max_retries} attempts: ${error.message}`;

      // Alert therapist about critical task failure
      if (task.priority === 'critical' || task.priority === 'high') {
        await this.alertCriticalTaskFailure(task, error);
      }

      console.error(`Follow-up task ${task.id} failed permanently:`, error);
    }

    await this.logTaskCompletion(task);
  }

  private async alertCriticalTaskFailure(task: FollowUpTask, error: any): Promise<void> {
    const therapist = await this.getTherapistContact(task.therapist_id);
    if (!therapist) return;

    const failureAlert: AlertPayload = {
      alert_id: `task_failure_${task.id}`,
      user_id: task.user_id,
      therapist_id: task.therapist_id,
      risk_level: 'high',
      trigger_reason: 'Critical follow-up task failure',
      context: {
        session_id: task.crisis_intervention_id,
        message_count: 0,
        recent_messages: [`Task: ${task.task_type}`, `Error: ${error.message}`],
        safety_flags: ['task_failure', 'manual_intervention_required']
      },
      timestamp: DateTime.now().toISO(),
      escalation_level: 'urgent',
      follow_up_required: true
    };

    await this.alertService.sendAlert(therapist, failureAlert);
  }

  // Integration methods (these would connect to your actual systems)
  private async sendAutomatedMessage(data: any): Promise<void> {
    // This would integrate with your chat/messaging system
    console.log('Sending automated message:', data);
  }

  private async triggerAssessment(data: any): Promise<void> {
    // This would integrate with your assessment system
    console.log('Triggering assessment:', data);
  }

  private async getTherapistContact(therapistId: string): Promise<TherapistContact | null> {
    // This would query your therapist database
    // For now, return a mock therapist
    return {
      id: therapistId,
      name: 'Dr. Example',
      email: 'dr.example@therapy.com',
      preferred_alert_method: 'email',
      emergency_only: false,
      timezone: 'America/New_York'
    };
  }

  private async logTaskCompletion(task: FollowUpTask): Promise<void> {
    // This would log to your database
    console.log('Follow-up task logged:', {
      task_id: task.id,
      status: task.status,
      completed_at: task.completed_at,
      retry_count: task.retry_count,
      notes: task.completion_notes
    });
  }

  // Public methods for monitoring and management
  async getActiveFollowUps(userId?: string): Promise<FollowUpTask[]> {
    if (userId) {
      const allTasks: FollowUpTask[] = [];
      for (const tasks of this.activeFollowUps.values()) {
        allTasks.push(...tasks.filter(task => task.user_id === userId));
      }
      return allTasks;
    }

    // Return all active follow-ups
    const allTasks: FollowUpTask[] = [];
    for (const tasks of this.activeFollowUps.values()) {
      allTasks.push(...tasks);
    }
    return allTasks;
  }

  async recordUserResponse(taskId: string, response: any): Promise<void> {
    // Find and update the task with user response
    for (const tasks of this.activeFollowUps.values()) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        task.user_response = response;
        task.completion_notes = `User responded: ${JSON.stringify(response)}`;
        await this.logTaskCompletion(task);
        break;
      }
    }
  }

  async cancelFollowUp(crisisInterventionId: string, reason: string): Promise<void> {
    const tasks = this.activeFollowUps.get(crisisInterventionId);
    if (tasks) {
      for (const task of tasks) {
        if (task.status === 'pending') {
          task.status = 'skipped';
          task.completion_notes = `Cancelled: ${reason}`;
        }
      }
      this.activeFollowUps.delete(crisisInterventionId);
      console.log(`Follow-up cancelled for crisis ${crisisInterventionId}: ${reason}`);
    }
  }
}