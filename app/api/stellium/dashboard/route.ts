/**
 * STELLIUM DASHBOARD API
 *
 * The practitioner's sanctuary - everything they need at a glance
 * This aggregates client stats, upcoming sessions, and actionable items
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getClientStats } from '@/lib/stellium/clients';
import {
  getSessionStats,
  getUpcomingSessions,
  getSessionsNeedingFollowUp,
} from '@/lib/stellium/sessions';
import { getPersona, generatePersonaPrompt } from '@/lib/stellium/personas';

/**
 * GET /api/stellium/dashboard
 * Get complete dashboard data for a practitioner
 *
 * Query params:
 * - practitionerId: required
 * - upcomingDays: days to look ahead (default 7)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const practitionerId = searchParams.get('practitionerId');

    if (!practitionerId) {
      return NextResponse.json(
        { error: 'Practitioner ID required' },
        { status: 400 }
      );
    }

    const upcomingDays = parseInt(searchParams.get('upcomingDays') || '7', 10);

    // Fetch all dashboard data in parallel
    const [
      clientStats,
      sessionStats,
      upcomingSessions,
      needsFollowUp,
      persona,
    ] = await Promise.all([
      getClientStats(practitionerId),
      getSessionStats(practitionerId),
      getUpcomingSessions(practitionerId, upcomingDays),
      getSessionsNeedingFollowUp(practitionerId),
      getPersona(practitionerId),
    ]);

    // Build actionable items
    const actionItems: Array<{
      type: 'follow_up' | 'upcoming' | 'persona_setup';
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      data?: unknown;
    }> = [];

    // Sessions needing follow-up (high priority)
    for (const session of needsFollowUp) {
      actionItems.push({
        type: 'follow_up',
        priority: 'high',
        title: `Send follow-up to ${session.client?.preferred_name || session.client?.name || 'client'}`,
        description: `Session completed - no follow-up sent yet`,
        data: {
          sessionId: session.id,
          clientId: session.client_id,
          clientName: session.client?.name,
          completedAt: session.completed_at,
        },
      });
    }

    // Upcoming sessions today (high priority)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySessions = upcomingSessions.filter(s => {
      const sessionDate = new Date(s.scheduled_at!);
      return sessionDate >= today && sessionDate < tomorrow;
    });

    for (const session of todaySessions) {
      actionItems.push({
        type: 'upcoming',
        priority: 'high',
        title: `Session with ${session.client?.preferred_name || session.client?.name || 'client'} today`,
        description: new Date(session.scheduled_at!).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        data: {
          sessionId: session.id,
          clientId: session.client_id,
          scheduledAt: session.scheduled_at,
          sessionType: session.session_type,
        },
      });
    }

    // Persona setup needed (medium priority)
    if (!persona) {
      actionItems.push({
        type: 'persona_setup',
        priority: 'medium',
        title: 'Set up your MAIA persona',
        description: 'Train MAIA to speak in your voice and hold your framework',
      });
    }

    // Build today's context
    const todayContext = {
      date: today.toISOString().split('T')[0],
      sessionsToday: todaySessions.length,
      sessionsThisWeek: sessionStats.this_week,
      pendingFollowUps: needsFollowUp.length,
    };

    // Build persona summary
    const personaSummary = persona
      ? {
          name: persona.persona_name,
          modality: persona.modality,
          trainingTranscripts: persona.training_transcripts,
          materialsIndexed: persona.materials_indexed?.length || 0,
          booksReferenced: persona.books_referenced?.length || 0,
          lastTrained: persona.last_trained_at,
          isReady: (persona.training_transcripts || 0) >= 3, // Minimum viable training
        }
      : null;

    return NextResponse.json({
      today: todayContext,
      clients: clientStats,
      sessions: sessionStats,
      upcomingSessions,
      actionItems: actionItems.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }),
      persona: personaSummary,
    });
  } catch (error) {
    console.error('[Stellium Dashboard API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard' },
      { status: 500 }
    );
  }
}
