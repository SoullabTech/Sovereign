/**
 * STELLIUM DASHBOARD API
 *
 * The practitioner's sanctuary - everything they need at a glance
 * This aggregates client stats, upcoming sessions, and actionable items
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getClientStats } from '@/lib/stellium/clients';
import {
  getSessionStats,
  getUpcomingSessions,
  getSessionsNeedingFollowUp,
} from '@/lib/stellium/sessions';
import { getPersona, generatePersonaPrompt } from '@/lib/stellium/personas';
import { getTierPricing } from '@/lib/practitioner/tierPricing';

const isDev = process.env.NODE_ENV === 'development';

// Mock data for development when database is unavailable
const DEV_MOCK_RESPONSE = {
  today: {
    date: new Date().toISOString().split('T')[0],
    sessionsToday: 2,
    sessionsThisWeek: 4,
    pendingFollowUps: 1,
  },
  clients: { total: 12, active: 8, new_this_month: 2 },
  sessions: { this_week: 4, this_month: 14, completed: 52 },
  upcomingSessions: [
    {
      id: 'mock-session-1',
      practitioner_id: 'dev-practitioner',
      client_id: 'mock-client-1',
      status: 'scheduled',
      session_type: 'natal_reading',
      scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      duration_minutes: 60,
      client: {
        id: 'mock-client-1',
        practitioner_id: 'dev-practitioner',
        name: 'Sarah Martinez',
        preferred_name: 'Sarah',
        sun_sign: 'Aquarius',
      },
    },
    {
      id: 'mock-session-2',
      practitioner_id: 'dev-practitioner',
      client_id: 'mock-client-2',
      status: 'scheduled',
      session_type: 'transit_reading',
      scheduled_at: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
      duration_minutes: 45,
      client: {
        id: 'mock-client-2',
        practitioner_id: 'dev-practitioner',
        name: 'James Kendrick',
        preferred_name: 'James',
        sun_sign: 'Scorpio',
      },
    },
    {
      id: 'mock-session-3',
      practitioner_id: 'dev-practitioner',
      client_id: 'mock-client-3',
      status: 'scheduled',
      session_type: 'solar_return',
      scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      duration_minutes: 90,
      client: {
        id: 'mock-client-3',
        practitioner_id: 'dev-practitioner',
        name: 'Lisa Park',
        sun_sign: 'Taurus',
      },
    },
  ],
  actionItems: [],
  persona: null,
  onboarding: {
    isComplete: false,
    steps: [
      { id: 'add-client', title: 'Add your first client', description: 'Invite someone to your practice', completed: true, href: '/stellium/clients' },
      { id: 'connect-stripe', title: 'Connect payments', description: 'Set up Stripe to receive payments', completed: false, href: '/stellium/settings?tab=payouts' },
      { id: 'set-pricing', title: 'Set your pricing', description: 'Configure subscription tiers', completed: false, href: '/stellium/settings?tab=pricing' },
      { id: 'train-maia', title: 'Train your MAIA', description: 'Teach MAIA your voice and approach', completed: false, href: '/stellium/persona' },
    ],
  },
};

interface OnboardingStatus {
  isComplete: boolean;
  steps: {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    href: string;
  }[];
}

/**
 * Get onboarding checklist status for a practitioner
 */
async function getOnboardingStatus(
  practitionerId: string,
  clientCount: number,
  hasPersona: boolean
): Promise<OnboardingStatus> {
  // Check Stripe connection from practitioners table
  const practitionerResult = await query<{
    stripe_account_id: string | null;
  }>(
    `SELECT stripe_account_id FROM practitioners WHERE id = $1`,
    [practitionerId]
  );

  const hasStripe = !!practitionerResult.rows[0]?.stripe_account_id;

  // Check if pricing tiers are configured (any active tier, including $0 scholarship tiers)
  const tierPricing = await getTierPricing(practitionerId);
  const hasPricing = tierPricing.some(t => t.is_active);

  // Build the checklist
  const steps = [
    {
      id: 'add-client',
      title: 'Add your first client',
      description: 'Invite someone to your practice',
      completed: clientCount > 0,
      href: '/stellium/clients',
    },
    {
      id: 'connect-stripe',
      title: 'Connect payments',
      description: 'Set up Stripe to receive payments',
      completed: hasStripe,
      href: '/stellium/settings?tab=payouts',
    },
    {
      id: 'set-pricing',
      title: 'Set your pricing',
      description: 'Configure subscription tiers',
      completed: hasPricing,
      href: '/stellium/settings?tab=pricing',
    },
    {
      id: 'train-maia',
      title: 'Train your MAIA',
      description: 'Teach MAIA your voice and approach',
      completed: hasPersona,
      href: '/stellium/persona',
    },
  ];

  const isComplete = steps.every(s => s.completed);

  return { isComplete, steps };
}

/**
 * GET /api/stellium/dashboard
 * Get complete dashboard data for a practitioner
 *
 * Query params:
 * - practitionerId: required
 * - upcomingDays: days to look ahead (default 7)
 */
export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
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
    const personaIsReady = (persona?.training_transcripts || 0) >= 3;
    const personaSummary = persona
      ? {
          name: persona.persona_name,
          modality: persona.modality,
          trainingTranscripts: persona.training_transcripts,
          materialsIndexed: persona.materials_indexed?.length || 0,
          booksReferenced: persona.books_referenced?.length || 0,
          lastTrained: persona.last_trained_at,
          isReady: personaIsReady,
        }
      : null;

    // Get onboarding checklist status
    const onboarding = await getOnboardingStatus(
      practitionerId,
      clientStats.total,
      personaIsReady
    );

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
      onboarding,
    });
  } catch (error) {
    console.error('[Stellium Dashboard API] Error:', error);

    // Dev bypass: return mock data when database unavailable
    if (isDev) {
      console.log('[Stellium Dashboard API] Using mock data for development');
      return NextResponse.json(DEV_MOCK_RESPONSE);
    }

    return NextResponse.json(
      { error: 'Failed to load dashboard' },
      { status: 500 }
    );
  }
}
