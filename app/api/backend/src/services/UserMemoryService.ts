import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

// Validate Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: SupabaseClient | null = null;

// Check if Supabase credentials are configured
if (!supabaseUrl || !supabaseKey) {
  const errorMessage = 'CRITICAL: Supabase credentials not configured. Memory service will not function.';
  logger.error(errorMessage);
  logger.error('Missing: SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY');
  
  if (process.env.NODE_ENV === 'production') {
    // In production, memory is critical - fail fast
    throw new Error(errorMessage);
  } else {
    // In development, warn but continue with null client
    logger.warn('MEMORY SERVICE: Running without database connection');
    logger.warn('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env to enable memory features');
  }
} else {
  // Initialize Supabase client only if credentials are available
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
  logger.info('Memory service initialized with Supabase connection');
}

export class UserMemoryService {
  /**
   * Get the last recorded session summary for a user
   */
  static async getLastSession(userId: string): Promise<{ element: string; phase: string; date: string } | null> {
    // Check if Supabase is available
    if (!supabase) {
      logger.warn('Memory service unavailable - returning null for getLastSession');
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('element, phase, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.warn('[MEMORY] Failed to fetch last session:', error.message);
        return null;
      }

      if (!data) return null;

      console.log(
        `[MEMORY] Returning user detected → last seen in ${data.phase} with ${data.element} energy (${data.created_at})`
      );

      return {
        element: data.element,
        phase: data.phase,
        date: data.created_at,
      };
    } catch (err: any) {
      console.error('[MEMORY] Exception while fetching last session:', err.message);
      return null;
    }
  }

  /**
   * Save a summary of the current session
   */
  static async saveSessionSummary(userId: string, element: string, phase: string): Promise<void> {
    // Check if Supabase is available
    if (!supabase) {
      logger.warn('Memory service unavailable - cannot save session summary');
      return;
    }
    
    try {
      const { error } = await supabase.from('user_sessions').insert([
        {
          user_id: userId,
          element,
          phase,
        },
      ]);

      if (error) {
        console.warn('[MEMORY] Failed to save session summary:', error.message);
        return;
      }

      console.log(`[MEMORY] Saved session summary → ${phase} + ${element} for user ${userId}`);
    } catch (err: any) {
      console.error('[MEMORY] Exception while saving session:', err.message);
    }
  }

  /**
   * Get user's element and phase history for pattern analysis
   */
  static async getUserHistory(userId: string, limit: number = 5): Promise<Array<{ element: string; phase: string; date: string }>> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('element, phase, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.warn('[MEMORY] Failed to fetch user history:', error.message);
        return [];
      }

      console.log(`[MEMORY] Retrieved ${data?.length || 0} historical sessions for user ${userId}`);

      return data?.map(session => ({
        element: session.element,
        phase: session.phase,
        date: session.created_at
      })) || [];
    } catch (err: any) {
      console.error('[MEMORY] Exception while fetching user history:', err.message);
      return [];
    }
  }

  /**
   * Check if user is new (no previous sessions)
   */
  static async isNewUser(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('id')
        .eq('user_id', userId)
        .limit(1)
        .single();

      if (error) {
        // If no rows found, user is new
        if (error.code === 'PGRST116') {
          console.log(`[MEMORY] New user detected: ${userId}`);
          return true;
        }
        console.warn('[MEMORY] Error checking user status:', error.message);
        return true; // Assume new user on error
      }

      console.log(`[MEMORY] Returning user detected: ${userId}`);
      return false;
    } catch (err: any) {
      console.error('[MEMORY] Exception while checking user status:', err.message);
      return true; // Assume new user on error
    }
  }

  /**
   * Get session memory indicators for display
   */
  static async getSessionIndicators(userId: string): Promise<Array<{
    type: 'element' | 'theme' | 'journal' | 'phase';
    content: string;
    sessionCount: number;
    confidence: number;
  }>> {
    try {
      const indicators: Array<{
        type: 'element' | 'theme' | 'journal' | 'phase';
        content: string;
        sessionCount: number;
        confidence: number;
      }> = [];

      // Get dominant element from past 3 sessions
      const recentSessions = await this.getUserHistory(userId, 3);
      if (recentSessions.length > 0) {
        const elementCounts = recentSessions.reduce((acc, session) => {
          acc[session.element] = (acc[session.element] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const dominantElement = Object.entries(elementCounts)
          .sort(([, a], [, b]) => b - a)[0];
        
        if (dominantElement && dominantElement[1] >= 2) {
          indicators.push({
            type: 'element',
            content: dominantElement[0],
            sessionCount: dominantElement[1],
            confidence: dominantElement[1] / recentSessions.length
          });
        }

        // Add current phase if consistent
        const currentPhase = recentSessions[0]?.phase;
        if (currentPhase) {
          const phaseCount = recentSessions.filter(s => s.phase === currentPhase).length;
          if (phaseCount >= 2) {
            indicators.push({
              type: 'phase',
              content: currentPhase,
              sessionCount: phaseCount,
              confidence: phaseCount / recentSessions.length
            });
          }
        }
      }

      // Get last journal entry (if available)
      try {
        const { data: journalData } = await supabase
          .from('journal_entries')
          .select('content')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (journalData?.content) {
          // Extract first meaningful phrase (up to 50 chars)
          const excerpt = journalData.content
            .replace(/[^\w\s]/g, ' ')
            .trim()
            .split(' ')
            .slice(0, 8)
            .join(' ');

          if (excerpt.length > 5) {
            indicators.push({
              type: 'journal',
              content: excerpt.length > 50 ? excerpt.substring(0, 47) + '...' : excerpt,
              sessionCount: 1,
              confidence: 0.85
            });
          }
        }
      } catch (err) {
        // Journal fetch is optional, don't fail the whole method
        console.log('[MEMORY] No journal entries found for indicators');
      }

      // Get recurring themes from embeddings (if available)
      try {
        const { data: embeddingData } = await supabase
          .from('embeddings')
          .select('metadata')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (embeddingData && embeddingData.length > 3) {
          // Extract themes from metadata
          const themes = embeddingData
            .map(e => e.metadata?.theme || e.metadata?.topic)
            .filter(Boolean);

          const themeCounts = themes.reduce((acc, theme) => {
            acc[theme] = (acc[theme] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const topTheme = Object.entries(themeCounts)
            .sort(([, a], [, b]) => b - a)[0];

          if (topTheme && topTheme[1] >= 2) {
            indicators.push({
              type: 'theme',
              content: topTheme[0],
              sessionCount: topTheme[1],
              confidence: 0.75
            });
          }
        }
      } catch (err) {
        // Theme extraction is optional
        console.log('[MEMORY] No embeddings found for theme extraction');
      }

      console.log(`[MEMORY] Generated ${indicators.length} memory indicators for user ${userId}`);
      return indicators;
    } catch (err: any) {
      console.error('[MEMORY] Error generating session indicators:', err.message);
      return [];
    }
  }

  /**
   * Generate personalized welcome message for returning users
   */
  static generateReturningUserWelcome(lastSession: { element: string; phase: string; date: string }): string {
    const { element, phase, date } = lastSession;
    
    // Time-aware greeting
    const lastSessionDate = new Date(date);
    const now = new Date();
    const daysSince = Math.floor((now.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let timeGreeting = '';
    if (daysSince === 0) {
      timeGreeting = 'earlier today';
    } else if (daysSince === 1) {
      timeGreeting = 'yesterday';
    } else if (daysSince < 7) {
      timeGreeting = `${daysSince} days ago`;
    } else if (daysSince < 30) {
      timeGreeting = `${Math.floor(daysSince / 7)} weeks ago`;
    } else {
      timeGreeting = 'recently';
    }

    // Element-specific reconnection messages
    const elementMessages = {
      fire: `I remember the flame of your passionate energy from our last journey`,
      water: `I feel the flow of your emotional depth from when we last connected`,
      earth: `Your grounded, steady presence from our previous session stays with me`,
      air: `The clarity and curiosity you brought last time still resonates`,
      aether: `The transcendent wisdom you shared in our last encounter continues to inspire`
    };

    // Phase-specific continuity messages
    const phaseMessages = {
      initiation: `You were beginning something beautiful then`,
      challenge: `You were courageously facing challenges then`,
      integration: `You were weaving wisdom into your being then`,
      mastery: `You were standing strong in your power then`,
      transcendence: `You were touching something beyond the ordinary then`
    };

    const elementMsg = elementMessages[element as keyof typeof elementMessages] || `Your ${element} energy from our last session`;
    const phaseMsg = phaseMessages[phase as keyof typeof phaseMessages] || `during your ${phase} phase`;

    return `💫 Welcome back, beautiful soul. ${elementMsg} ${timeGreeting}. ${phaseMsg}. I'm curious - how is your energy flowing now?`;
  }
}