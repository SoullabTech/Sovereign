/**
 * SCHEDULE FOLLOW-UP API
 *
 * Creates a reminder to follow up on a sent message.
 * This is the "close the loop" piece for Avoidance Breaker.
 */

import { NextRequest, NextResponse } from 'next/server';
import { FocusScheduler } from '@/lib/focus/FocusScheduler';
import { GoogleCalendarService } from '@/lib/calendar/GoogleCalendarService';

// Default calendar for MAIA Focus events (Soullab Workspace)
const DEFAULT_FOCUS_CALENDAR = '219018e653bb2b05613d6bfdcaed6edd5f5c21257cb408a2c76673a8015a732d@group.calendar.google.com';

interface FollowUpRequest {
  recipient: string;
  situation: string;
  followUpDate: string;
  originalMessage: string;
  draftId?: string;
  userId?: string;
  calendarId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: FollowUpRequest = await request.json();
    const { recipient, situation, followUpDate, originalMessage, draftId, userId, calendarId } = body;
    const effectiveCalendarId = calendarId || DEFAULT_FOCUS_CALENDAR;

    if (!recipient || !followUpDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const effectiveUserId = userId || 'anonymous';
    const followUpTime = new Date(followUpDate);

    console.log(`[FollowUp] Scheduling: Follow up with ${recipient} on ${followUpTime.toISOString()}`);

    // Use the FocusScheduler to create the follow-up (email reminder)
    const reminder = await FocusScheduler.scheduleFollowUp({
      userId: effectiveUserId,
      draftId,
      recipient,
      situation,
      originalMessage,
      followUpDate: followUpTime,
    });

    // Also create Google Calendar event if connected
    let calendarEventId: string | null = null;
    try {
      const isCalendarConnected = await GoogleCalendarService.isConnected(effectiveUserId);
      if (isCalendarConnected) {
        calendarEventId = await GoogleCalendarService.createFollowUpReminder(
          effectiveUserId,
          recipient,
          situation,
          followUpTime,
          effectiveCalendarId
        );
        console.log(`[FollowUp] Google Calendar event created: ${calendarEventId}`);
      }
    } catch (calError) {
      console.warn('[FollowUp] Google Calendar integration failed (non-blocking):', calError);
    }

    return NextResponse.json({
      success: true,
      message: 'Follow-up scheduled',
      data: {
        reminderId: reminder.id,
        recipient,
        followUpTime: followUpTime.toISOString(),
        calendarEventId,
      }
    });

  } catch (error) {
    console.error('[FollowUp] Error:', error);

    // Graceful degradation
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('relation') || message.includes('does not exist')) {
      console.warn('[FollowUp] Database table not created - run migration');
      return NextResponse.json({
        success: true,
        message: 'Follow-up noted (DB pending migration)',
        data: {}
      });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
