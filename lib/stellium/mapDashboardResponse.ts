/**
 * MAP STELLIUM DASHBOARD API RESPONSE
 *
 * The /api/stellium/dashboard endpoint returns a modern flat shape:
 *   { clients, sessions, upcomingSessions, actionItems, persona, onboarding, today }
 *
 * The PractitionerDashboard type expects a different shape with snake_case names.
 * This helper bridges the gap so portal and practitioner pages stay in sync.
 */

import type { PractitionerDashboard, PractitionerClient } from '@/lib/stellium/types';

/**
 * Raw shape returned by /api/stellium/dashboard
 */
export interface DashboardApiResponse {
  today?: {
    date: string;
    sessionsToday: number;
    sessionsThisWeek: number;
    pendingFollowUps: number;
  };
  clients?: {
    total: number;
    active: number;
    inactive: number;
    by_tier: Record<string, number>;
  };
  sessions?: {
    total: number;
    this_week: number;
    this_month: number;
    completed: number;
    revenue_this_month?: number;
  };
  upcomingSessions?: Array<{
    id: string;
    client_id: string;
    practitioner_id: string;
    session_type: string;
    status: string;
    scheduled_at?: string;
    duration_minutes: number;
    client?: {
      id: string;
      name: string;
      preferred_name?: string;
    };
  }>;
  actionItems?: Array<{
    type: 'follow_up' | 'upcoming' | 'persona_setup';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    data?: {
      sessionId?: string;
      clientId?: string;
      clientName?: string;
      completedAt?: string;
      scheduledAt?: string;
      sessionType?: string;
    };
  }>;
  persona?: {
    name: string;
    modality: string;
    trainingTranscripts: number;
    materialsIndexed: number;
    booksReferenced: number;
    lastTrained?: string;
    isReady: boolean;
  } | null;
  onboarding?: {
    isComplete: boolean;
    steps: Array<{
      id: string;
      title: string;
      description: string;
      completed: boolean;
      href: string;
    }>;
  };
}

/**
 * Maps the API response to the PractitionerDashboard type expected by UI components.
 *
 * @param data - Raw response from /api/stellium/dashboard
 * @param practitionerId - Current practitioner's ID (for constructing client records)
 * @returns PractitionerDashboard compatible with portal + practitioner admin pages
 */
export function mapDashboardResponse(
  data: DashboardApiResponse,
  practitionerId: string
): PractitionerDashboard {
  return {
    total_clients: data.clients?.total ?? 0,
    active_clients: data.clients?.active ?? 0,
    sessions_this_week: data.sessions?.this_week ?? 0,
    sessions_this_month: data.sessions?.this_month ?? 0,
    revenue_this_month: data.sessions?.revenue_this_month,
    upcoming_sessions: data.upcomingSessions || [],
    recent_sessions: data.upcomingSessions?.slice(0, 5) || [],
    // Transform actionItems follow_ups to PractitionerClient shape for UI compatibility
    // Filter requires clientId to avoid dead links to /clients/undefined
    clients_needing_follow_up: (data.actionItems || [])
      .filter((a) => a.type === 'follow_up' && a.data?.clientId)
      .map((a) => ({
        id: a.data!.clientId!,
        practitioner_id: practitionerId,
        name: a.data!.clientName || 'Client',
        preferred_name: a.data!.clientName,
        status: 'active' as const,
        total_sessions: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })),
    draft_sessions: [],
  };
}
