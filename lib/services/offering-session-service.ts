/**
 * 🌸 Offering Session Service
 * Sovereignty mode: Service disabled (Supabase removed)
 */

import {
  OfferingSession,
  OfferingTimelineItem,
  OfferingStats,
  CreateOfferingSessionParams,
  OfferingSessionService,
  OfferingStatus
} from '@/lib/types/offering-sessions';

export class SupabaseOfferingService implements OfferingSessionService {
  async createSession(params: CreateOfferingSessionParams): Promise<OfferingSession> {
    console.log('[offeringService] Sovereignty mode: Session creation disabled');

    // Return minimal mock session
    return {
      id: 'local-session',
      user_id: params.user_id,
      date: params.date || new Date().toISOString().split('T')[0],
      status: params.status,
      petal_scores: params.petal_scores || [],
      selected_petals: params.selected_petals || [],
      oracle_reflection: params.oracle_reflection || null,
      journal_prompt: params.journal_prompt || null,
      session_metadata: params.session_metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as OfferingSession;
  }

  async getSession(user_id: string, date: string): Promise<OfferingSession | null> {
    console.log('[offeringService] Sovereignty mode: Session retrieval disabled');
    return null;
  }

  async getTimeline(user_id: string, days = 7): Promise<OfferingTimelineItem[]> {
    console.log('[offeringService] Sovereignty mode: Timeline disabled');
    return [];
  }

  async getStats(user_id: string, days = 30): Promise<OfferingStats> {
    console.log('[offeringService] Sovereignty mode: Stats disabled');
    return {
      total_sessions: 0,
      completion_rate: 0,
      current_streak: 0,
      longest_streak: 0,
      total_petals_offered: 0,
      petal_frequency: {}
    };
  }

  async updateSession(
    user_id: string,
    date: string,
    updates: Partial<OfferingSession>
  ): Promise<OfferingSession> {
    console.log('[offeringService] Sovereignty mode: Session update disabled');
    return this.createSession({ user_id, date, status: 'completed' as OfferingStatus });
  }
}

export function getOfferingService(): OfferingSessionService {
  return new SupabaseOfferingService();
}
