/**
 * Session Lifecycle Hooks
 * Automatically track session start/end for all MAIA interactions
 */

import { maiaRealtimeMonitor } from './MaiaRealtimeMonitor';
import { maiaMonitoring } from '@/lib/beta/MaiaMonitoring';

export type SessionType = 'chat' | 'journal' | 'voice' | 'oracle';

export interface SessionContext {
  sessionId: string;
  userId: string;
  sessionType: SessionType;
  startTime: Date;
  metadata?: Record<string, any>;
}

class SessionLifecycleManager {
  private activeSessions = new Map<string, SessionContext>();

  /**
   * Start a new session with automatic tracking
   */
  startSession(
    sessionType: SessionType,
    userId: string,
    metadata?: Record<string, any>
  ): string {
    const sessionId = `${sessionType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const context: SessionContext = {
      sessionId,
      userId,
      sessionType,
      startTime: new Date(),
      metadata
    };

    this.activeSessions.set(sessionId, context);

    // Track in realtime monitor
    maiaRealtimeMonitor.startSession(sessionId);

    // Track in MaiaMonitoring if not demo user
    if (userId !== 'demo-user') {
      maiaMonitoring.startSession(userId, metadata?.userName);
    }

    console.log(`📊 Session started: ${sessionId} (${sessionType}) for user ${userId.slice(0, 8)}`);

    return sessionId;
  }

  /**
   * End a session with automatic cleanup
   */
  endSession(sessionId: string, finalMetrics?: {
    success: boolean;
    duration?: number;
    error?: string;
  }): void {
    const context = this.activeSessions.get(sessionId);

    if (!context) {
      console.warn(`⚠️ Attempted to end unknown session: ${sessionId}`);
      return;
    }

    const duration = Date.now() - context.startTime.getTime();

    // Track in realtime monitor
    maiaRealtimeMonitor.endSession(sessionId);

    // Log session completion
    console.log(`📊 Session ended: ${sessionId} (${context.sessionType}) - Duration: ${duration}ms - Success: ${finalMetrics?.success ?? true}`);

    // Clean up
    this.activeSessions.delete(sessionId);
  }

  /**
   * Get active session context
   */
  getSession(sessionId: string): SessionContext | undefined {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): SessionContext[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Get active sessions for a specific user
   */
  getUserSessions(userId: string): SessionContext[] {
    return Array.from(this.activeSessions.values()).filter(
      s => s.userId === userId
    );
  }

  /**
   * End all sessions for a user (cleanup on disconnect)
   */
  endUserSessions(userId: string): void {
    const userSessions = this.getUserSessions(userId);
    userSessions.forEach(session => {
      this.endSession(session.sessionId, { success: false, error: 'User disconnected' });
    });
  }

  /**
   * Middleware wrapper for API routes
   */
  withSessionTracking<T>(
    handler: (sessionId: string, userId: string) => Promise<T>,
    sessionType: SessionType,
    userId: string,
    metadata?: Record<string, any>
  ): () => Promise<T> {
    return async () => {
      const sessionId = this.startSession(sessionType, userId, metadata);

      try {
        const result = await handler(sessionId, userId);
        this.endSession(sessionId, { success: true });
        return result;
      } catch (error) {
        this.endSession(sessionId, {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
      }
    };
  }
}

// Singleton instance
export const sessionLifecycle = new SessionLifecycleManager();

// Convenience hooks for common patterns

export function startChatSession(userId: string, userName?: string): string {
  return sessionLifecycle.startSession('chat', userId, { userName });
}

export function startJournalSession(userId: string, mode?: string): string {
  return sessionLifecycle.startSession('journal', userId, { mode });
}

export function startVoiceSession(userId: string, element?: string): string {
  return sessionLifecycle.startSession('voice', userId, { element });
}

export function startOracleSession(userId: string, context?: Record<string, any>): string {
  return sessionLifecycle.startSession('oracle', userId, context);
}

export function endSession(sessionId: string, success: boolean = true): void {
  sessionLifecycle.endSession(sessionId, { success });
}

// Auto-cleanup for long-running sessions (10 minute timeout)
setInterval(() => {
  const now = Date.now();
  const activeSessions = sessionLifecycle.getActiveSessions();

  activeSessions.forEach(session => {
    const duration = now - session.startTime.getTime();
    const tenMinutes = 10 * 60 * 1000;

    if (duration > tenMinutes) {
      console.warn(`⏰ Auto-ending stale session: ${session.sessionId} (${duration}ms old)`);
      sessionLifecycle.endSession(session.sessionId, {
        success: false,
        error: 'Session timeout'
      });
    }
  });
}, 60 * 1000); // Check every minute