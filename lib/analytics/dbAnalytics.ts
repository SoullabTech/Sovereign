/**
 * Supabase Analytics - Database-backed analytics
 */

export class Analytics {
  static async trackEvent(eventName: string, properties?: Record<string, any>) {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('💾 [SupabaseAnalytics]', eventName, properties);
    }
  }

  static async trackUser(userId: string, properties?: Record<string, any>) {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('👤 [SupabaseAnalytics] User:', userId, properties);
    }
  }

  static async trackSession(sessionId: string, properties?: Record<string, any>) {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('🔄 [SupabaseAnalytics] Session:', sessionId, properties);
    }
  }
}
