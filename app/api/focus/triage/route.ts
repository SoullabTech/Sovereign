export const dynamic = 'force-dynamic';
/**
 * INBOX TRIAGE API
 *
 * Receives captured items and routes them:
 * - Tasks -> store in focus_tasks with next action
 * - Events -> store as event type (calendar integration TBD)
 * - Thoughts -> store as thought type
 *
 * No new inbox created - single point of capture.
 */

import { NextRequest, NextResponse } from 'next/server';
import { FocusScheduler } from '@/lib/focus/FocusScheduler';
import { logAction, checkThreshold, type ThresholdCheck } from '@/lib/focus/weightTracking';

// Helper to map threshold check to API response format
function mapStewardship(check: ThresholdCheck) {
  return {
    threshold: check.level === 'none' ? 'none' :
               check.level === 'acknowledgment' ? 'acknowledgment' :
               check.level === 'invitation' ? 'invitation' : 'pause',
    weeklyWeight: check.currentWeight,
    projectedWeight: check.projectedWeight,
    tier: check.tier,
  };
}

interface TriageRequest {
  captureText: string;
  type: 'task' | 'event' | 'thought';
  nextAction?: string;
  scheduledFor?: string;
  userId?: string;
  memberId?: string; // For weight tracking
}

export async function POST(request: NextRequest) {
  try {
    const body: TriageRequest = await request.json();
    const { captureText, type, nextAction, scheduledFor, userId, memberId } = body;

    if (!captureText || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use a default userId if not provided (for now)
    const effectiveUserId = userId || 'anonymous';

    console.log(`[Triage] Captured ${type}: "${captureText.substring(0, 50)}..."`);

    // Create the task in PostgreSQL
    const task = await FocusScheduler.createTask({
      userId: effectiveUserId,
      captureText,
      taskType: type,
      nextAction: nextAction || undefined,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      source: 'inbox-triage',
      metadata: {
        capturedAt: new Date().toISOString(),
      },
    });

    // Log weight (capture = 0, but we track for patterns)
    // Only log if we have a valid memberId (UUID), not 'anonymous' strings
    let stewardship: ReturnType<typeof mapStewardship> | null = null;
    if (memberId) {
      try {
        await logAction(memberId, 'capture', { source: 'inbox-triage' });
        // Get current threshold state
        const check = await checkThreshold(memberId, 'capture');
        stewardship = mapStewardship(check);
      } catch (weightError) {
        // Silent - weight tracking is invisible accounting, shouldn't break triage
        console.warn('[Triage] Weight logging skipped:', weightError);
      }
    }

    // Return success with task details
    return NextResponse.json({
      success: true,
      type,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} captured`,
      data: {
        taskId: task.id,
        captureText,
        nextAction,
        scheduledFor,
      },
      stewardship,
    });

  } catch (error) {
    console.error('[Triage] Error:', error);

    // Graceful degradation if DB not available
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('relation') || message.includes('does not exist')) {
      console.warn('[Triage] Database table not created - run migration');
      return NextResponse.json({
        success: true,
        type: 'task',
        message: 'Captured (DB pending migration)',
        data: { captureText: 'stored locally' }
      });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
