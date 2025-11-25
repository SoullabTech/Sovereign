/**
 * 🌸 Offering Session Service
 * Service for managing Holoflower offering sessions with Supabase
 */

import { createClientComponentClient } from '@/lib/supabase';
import { 
  OfferingSession, 
  OfferingTimelineItem, 
  OfferingStats,
  CreateOfferingSessionParams,
  OfferingSessionService,
  OfferingStatus
} from '@/lib/types/offering-sessions';

export class SupabaseOfferingService implements OfferingSessionService {
  private supabase = createClientComponentClient();

  async createSession(params: CreateOfferingSessionParams): Promise<OfferingSession> {
    const { data, error } = await this.supabase
      .rpc('upsert_offering_session', {
        p_user_id: params.user_id,
        p_date: params.date || new Date().toISOString().split('T')[0],
        p_status: params.status,
        p_petal_scores: JSON.stringify(params.petal_scores || []),
        p_selected_petals: JSON.stringify(params.selected_petals || []),
        p_oracle_reflection: params.oracle_reflection || null,
        p_journal_prompt: params.journal_prompt || null,
        p_session_metadata: JSON.stringify(params.session_metadata || {})
      });

    if (error) {
      console.error('Error creating offering session:', error);
      throw new Error(`Failed to create offering session: ${error.message}`);
    }

    // Fetch the created session
    const session = await this.getSession(params.user_id, params.date || new Date().toISOString().split('T')[0]);
    if (!session) {
      throw new Error('Failed to retrieve created offering session');
    }

    return session;
  }

  async getSession(userId: string, date: string): Promise<OfferingSession | null> {
    const { data, error } = await this.supabase
      .from('offering_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('session_date', date)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching offering session:', error);
      throw new Error(`Failed to fetch offering session: ${error.message}`);
    }

    return data || null;
  }

  async getUserTimeline(userId: string, limit: number = 30): Promise<OfferingTimelineItem[]> {
    const { data, error } = await this.supabase
      .from('offering_timeline')
      .select('*')
      .eq('user_id', userId)
      .order('session_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching offering timeline:', error);
      throw new Error(`Failed to fetch offering timeline: ${error.message}`);
    }

    return data || [];
  }

  async getUserStats(userId: string): Promise<OfferingStats | null> {
    const { data, error } = await this.supabase
      .from('offering_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching offering stats:', error);
      throw new Error(`Failed to fetch offering stats: ${error.message}`);
    }

    return data || null;
  }

  async getOfferingStreak(userId: string): Promise<number> {
    const { data, error } = await this.supabase
      .rpc('get_offering_streak', { p_user_id: userId });

    if (error) {
      console.error('Error fetching offering streak:', error);
      throw new Error(`Failed to fetch offering streak: ${error.message}`);
    }

    return data || 0;
  }

  // Additional helper methods
  async getTodaysSession(userId: string): Promise<OfferingSession | null> {
    const today = new Date().toISOString().split('T')[0];
    return this.getSession(userId, today);
  }

  async hasOfferedToday(userId: string): Promise<boolean> {
    const session = await this.getTodaysSession(userId);
    return session?.status !== 'rest' && session !== null;
  }

  async hasRestedToday(userId: string): Promise<boolean> {
    const session = await this.getTodaysSession(userId);
    return session?.status === 'rest';
  }

  async createRestSession(userId: string): Promise<OfferingSession> {
    return this.createSession({
      user_id: userId,
      status: 'rest',
      session_metadata: {
        rest_reason: 'user_choice',
        timestamp: new Date().toISOString()
      }
    });
  }

  async createOfferingSession(
    userId: string, 
    petalScores: number[], 
    selectedPetals: string[],
    reflection?: string,
    journalPrompt?: string
  ): Promise<OfferingSession> {
    // Determine status based on petal interaction intensity
    const totalScore = petalScores.reduce((sum, score) => sum + score, 0);
    const averageScore = totalScore / petalScores.length;
    
    let status: OfferingStatus = 'offering';
    if (averageScore >= 8) {
      status = 'transcendent';
    } else if (averageScore >= 6) {
      status = 'bloom';
    }

    return this.createSession({
      user_id: userId,
      status,
      petal_scores: petalScores,
      selected_petals: selectedPetals,
      oracle_reflection: reflection,
      journal_prompt: journalPrompt,
      session_metadata: {
        total_score: totalScore,
        average_score: averageScore,
        selected_count: selectedPetals.length,
        timestamp: new Date().toISOString()
      }
    });
  }
}

// Export singleton instance
let _offeringService: SupabaseOfferingService | null = null;
export const getOfferingService = (): SupabaseOfferingService => {
  if (!_offeringService) {
    _offeringService = new SupabaseOfferingService();
  }
  return _offeringService;
};