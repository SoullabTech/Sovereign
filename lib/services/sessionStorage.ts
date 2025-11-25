import { createClient } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

interface OracleSession {
  sessionId: string;
  timestamp: string;
  elementalBalance: Record<string, number>;
  spiralStage: { element: string; stage: number };
  reflection: string;
  practice: string;
  archetype: string;
}

interface SessionData {
  user_id: string;
  session_id: string;
  query: string;
  response: string;
  stages?: any[];
  elements?: Record<string, any>;
  spiral_stage?: { element: string; stage: number };
  reflection?: string;
  practice?: string;
  archetype?: string;
  mode?: string;
  metadata?: Record<string, any>;
}

class SessionStorageService {
  private supabase: SupabaseClient | null = null;
  private isInitialized = false;
  private connectionPromise: Promise<boolean> | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if (this.connectionPromise) return this.connectionPromise;

    this.connectionPromise = this.connect();
    return this.connectionPromise;
  }

  private async connect(): Promise<boolean> {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!url || !key) {
        console.warn('[SessionStorage] Missing Supabase credentials');
        return false;
      }

      this.supabase = createClient(url, key, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      });

      // Test connection
      const { error } = await this.supabase.from('oracle_sessions').select('count', { count: 'exact', head: true });

      if (error) {
        console.error('[SessionStorage] Connection test failed:', error);
        return false;
      }

      this.isInitialized = true;
      console.log('[SessionStorage] ✅ Connected to Supabase');
      return true;
    } catch (error) {
      console.error('[SessionStorage] Failed to initialize:', error);
      return false;
    }
  }

  async storeSession(
    userId: string,
    query: string,
    response: OracleSession,
    additionalData?: Partial<SessionData>
  ): Promise<{ success: boolean; error?: string; sessionId?: string }> {
    try {
      await this.initialize();

      if (!this.supabase || !this.isInitialized) {
        console.warn('[SessionStorage] Not connected - session will not be persisted');
        return { success: false, error: 'Storage not available' };
      }

      const sessionData: SessionData = {
        user_id: userId,
        session_id: response.sessionId,
        query,
        response: JSON.stringify(response),
        elements: response.elementalBalance,
        spiral_stage: response.spiralStage,
        reflection: response.reflection,
        practice: response.practice,
        archetype: response.archetype,
        mode: additionalData?.mode || 'beta',
        stages: additionalData?.stages || [],
        metadata: {
          timestamp: response.timestamp,
          version: 'beta-1.0',
          ...additionalData?.metadata
        }
      };

      const { data, error } = await this.supabase
        .from('oracle_sessions')
        .insert(sessionData)
        .select('session_id')
        .single();

      if (error) {
        console.error('[SessionStorage] Failed to store session:', error);
        return { success: false, error: error.message };
      }

      console.log(`[SessionStorage] ✅ Stored session: ${data.session_id}`);
      return { success: true, sessionId: data.session_id };
    } catch (error) {
      console.error('[SessionStorage] Unexpected error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      await this.initialize();

      if (!this.supabase || !this.isInitialized) {
        return null;
      }

      const { data, error } = await this.supabase
        .from('oracle_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error) {
        console.error('[SessionStorage] Failed to retrieve session:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[SessionStorage] Error getting session:', error);
      return null;
    }
  }

  async getUserSessions(
    userId: string,
    limit: number = 10
  ): Promise<SessionData[]> {
    try {
      await this.initialize();

      if (!this.supabase || !this.isInitialized) {
        return [];
      }

      const { data, error } = await this.supabase
        .from('oracle_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[SessionStorage] Failed to get user sessions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[SessionStorage] Error getting user sessions:', error);
      return [];
    }
  }

  async getSessionAnalytics(userId: string): Promise<any> {
    try {
      await this.initialize();

      if (!this.supabase || !this.isInitialized) {
        return null;
      }

      // Get elemental balance across sessions
      const { data: sessions, error } = await this.supabase
        .from('oracle_sessions')
        .select('elements, spiral_stage, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error || !sessions) {
        return null;
      }

      // Calculate aggregated metrics
      const elementCounts: Record<string, number> = {};
      const spiralStages: Record<string, number> = {};

      sessions.forEach(session => {
        // Count elemental appearances
        if (session.elements) {
          Object.entries(session.elements).forEach(([element, value]) => {
            if (typeof value === 'number' && value > 0.2) {
              elementCounts[element] = (elementCounts[element] || 0) + 1;
            }
          });
        }

        // Count spiral stages
        if (session.spiral_stage) {
          const key = `${session.spiral_stage.element}-${session.spiral_stage.stage}`;
          spiralStages[key] = (spiralStages[key] || 0) + 1;
        }
      });

      return {
        totalSessions: sessions.length,
        elementalTendencies: elementCounts,
        spiralJourney: spiralStages,
        lastSession: sessions[0]?.created_at,
        firstSession: sessions[sessions.length - 1]?.created_at
      };
    } catch (error) {
      console.error('[SessionStorage] Error getting analytics:', error);
      return null;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.initialize();
      return this.isInitialized;
    } catch (error) {
      console.error('[SessionStorage] Connection test failed:', error);
      return false;
    }
  }

  isConnected(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const sessionStorage = new SessionStorageService();

// Export type definitions
export type { OracleSession, SessionData };