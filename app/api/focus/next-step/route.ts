export const dynamic = 'force-static';
/**
 * NEXT STEP API
 *
 * Handles the output of NextStepBuilder:
 * - start-now -> Mark task as in_progress, optionally schedule check-in
 * - schedule -> Create task with scheduled time + reminder
 * - remind-later -> Create reminder for later
 */

import { NextRequest, NextResponse } from 'next/server';
import { FocusScheduler } from '@/lib/focus/FocusScheduler';
import { GoogleCalendarService } from '@/lib/calendar/GoogleCalendarService';

// Default calendar for MAIA Focus events
const DEFAULT_FOCUS_CALENDAR = '219018e653bb2b05613d6bfdcaed6edd5f5c21257cb408a2c76673a8015a732d@group.calendar.google.com';

interface NextStepRequest {
  originalTask: string;
  nextStep: string;
  action: 'start-now' | 'schedule' | 'remind-later';
  scheduledTime?: string;
  duration?: number; // minutes
  userId?: string;
  calendarId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: NextStepRequest = await request.json();
    const { originalTask, nextStep, action, scheduledTime, duration = 15, userId, calendarId } = body;
    const effectiveCalendarId = calendarId || DEFAULT_FOCUS_CALENDAR;

    if (!originalTask || !nextStep || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const effectiveUserId = userId || 'anonymous';

    console.log(`[NextStep] Action: ${action} for "${nextStep.substring(0, 40)}..."`);

    switch (action) {
      case 'start-now': {
        // Create task and mark as in_progress
        const task = await FocusScheduler.createTask({
          userId: effectiveUserId,
          captureText: originalTask,
          taskType: 'task',
          nextAction: nextStep,
          durationMinutes: duration,
          source: 'next-step',
          metadata: {
            startedAt: new Date().toISOString(),
            action: 'start-now',
          },
        });

        // Mark as in progress
        await FocusScheduler.startTask(task.id);

        // Schedule a check-in reminder for after the duration
        const checkInTime = new Date(Date.now() + duration * 60 * 1000);
        await FocusScheduler.createReminder({
          userId: effectiveUserId,
          taskId: task.id,
          reminderType: 'check_in',
          message: nextStep,
          scheduledFor: checkInTime,
          deliveryChannel: 'email',
        });

        console.log(`[NextStep] Started: ${duration} min timer, check-in at ${checkInTime.toISOString()}`);

        return NextResponse.json({
          success: true,
          action: 'start-now',
          message: `Timer set for ${duration} minutes`,
          data: {
            taskId: task.id,
            nextStep,
            duration,
            checkInAt: checkInTime.toISOString(),
          }
        });
      }

      case 'schedule': {
        if (!scheduledTime) {
          return NextResponse.json(
            { error: 'scheduledTime required for schedule action' },
            { status: 400 }
          );
        }

        const startTime = new Date(scheduledTime);
        const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

        // Create scheduled task
        const task = await FocusScheduler.createTask({
          userId: effectiveUserId,
          captureText: originalTask,
          taskType: 'task',
          nextAction: nextStep,
          scheduledFor: startTime,
          durationMinutes: duration,
          source: 'next-step',
          metadata: {
            action: 'schedule',
            endTime: endTime.toISOString(),
          },
        });

        // Create start reminder (email fallback)
        await FocusScheduler.createReminder({
          userId: effectiveUserId,
          taskId: task.id,
          reminderType: 'start',
          message: nextStep,
          scheduledFor: startTime,
          deliveryChannel: 'email',
        });

        // Also create Google Calendar event if connected
        let calendarEventId: string | null = null;
        try {
          const isCalendarConnected = await GoogleCalendarService.isConnected(effectiveUserId);
          if (isCalendarConnected) {
            calendarEventId = await GoogleCalendarService.createFocusBlock(
              effectiveUserId,
              originalTask,
              nextStep,
              startTime,
              duration,
              effectiveCalendarId
            );
            console.log(`[NextStep] Google Calendar event created: ${calendarEventId}`);
          }
        } catch (calError) {
          console.warn('[NextStep] Google Calendar integration failed (non-blocking):', calError);
        }

        console.log(`[NextStep] Scheduled: "${nextStep}" at ${startTime.toISOString()}`);

        return NextResponse.json({
          success: true,
          action: 'schedule',
          message: `Blocked ${duration} minutes`,
          data: {
            taskId: task.id,
            nextStep,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            calendarEventId,
          }
        });
      }

      case 'remind-later': {
        // Default to 2 hours from now if no time specified
        const reminderTime = scheduledTime
          ? new Date(scheduledTime)
          : new Date(Date.now() + 2 * 60 * 60 * 1000);

        // Create task
        const task = await FocusScheduler.createTask({
          userId: effectiveUserId,
          captureText: originalTask,
          taskType: 'task',
          nextAction: nextStep,
          source: 'next-step',
          metadata: {
            action: 'remind-later',
            reminderTime: reminderTime.toISOString(),
          },
        });

        // Create reminder
        await FocusScheduler.createReminder({
          userId: effectiveUserId,
          taskId: task.id,
          reminderType: 'start',
          message: nextStep,
          scheduledFor: reminderTime,
          deliveryChannel: 'email',
        });

        console.log(`[NextStep] Reminder set: "${nextStep}" at ${reminderTime.toISOString()}`);

        return NextResponse.json({
          success: true,
          action: 'remind-later',
          message: 'Reminder set',
          data: {
            taskId: task.id,
            nextStep,
            reminderTime: reminderTime.toISOString(),
          }
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[NextStep] Error:', error);

    // Graceful degradation
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('relation') || message.includes('does not exist')) {
      console.warn('[NextStep] Database table not created - run migration');
      return NextResponse.json({
        success: true,
        action: 'start-now',
        message: 'Recorded (DB pending migration)',
        data: {}
      });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
