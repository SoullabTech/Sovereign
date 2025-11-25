/**
 * User Session Coordinator
 * Detects and manages multiple sessions for the same user across devices
 */

interface UserSession {
  sessionId: string;
  userId: string;
  deviceFingerprint: string;
  lastActivity: Date;
  isActive: boolean;
  userAgent: string;
  ipAddress?: string;
}

interface UserFingerprint {
  userId: string;
  browserFingerprint: string;
  patterns: {
    typingStyle: string[];
    commonPhrases: string[];
    conversationTiming: number[];
  };
}

export class UserSessionCoordinator {
  private activeSessions = new Map<string, UserSession>();
  private userFingerprints = new Map<string, UserFingerprint>();
  private sessionsByUser = new Map<string, Set<string>>();

  // Generate device fingerprint from browser characteristics
  generateDeviceFingerprint(request: Request): string {
    const userAgent = request.headers.get('user-agent') || '';
    const acceptLanguage = request.headers.get('accept-language') || '';
    const acceptEncoding = request.headers.get('accept-encoding') || '';

    // Simple fingerprint based on headers
    const fingerprint = Buffer.from(
      `${userAgent}:${acceptLanguage}:${acceptEncoding}`
    ).toString('base64').slice(0, 16);

    return fingerprint;
  }

  // Register a new session
  registerSession(sessionId: string, userId: string, request: Request): void {
    const deviceFingerprint = this.generateDeviceFingerprint(request);
    const userAgent = request.headers.get('user-agent') || '';

    const session: UserSession = {
      sessionId,
      userId,
      deviceFingerprint,
      lastActivity: new Date(),
      isActive: true,
      userAgent
    };

    this.activeSessions.set(sessionId, session);

    // Track sessions by user
    if (!this.sessionsByUser.has(userId)) {
      this.sessionsByUser.set(userId, new Set());
    }
    this.sessionsByUser.get(userId)!.add(sessionId);
  }

  // Update session activity
  updateActivity(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
    }
  }

  // Get active sessions for a user
  getActiveSessionsForUser(userId: string): UserSession[] {
    const userSessions = this.sessionsByUser.get(userId);
    if (!userSessions) return [];

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    return Array.from(userSessions)
      .map(sessionId => this.activeSessions.get(sessionId))
      .filter(session =>
        session &&
        session.isActive &&
        session.lastActivity > fiveMinutesAgo
      ) as UserSession[];
  }

  // Check if user has multiple active sessions
  hasMultipleActiveSessions(userId: string): boolean {
    const activeSessions = this.getActiveSessionsForUser(userId);
    return activeSessions.length > 1;
  }

  // Detect potential Maya-Maya conversation
  detectPotentialLoop(sessionId: string, input: string): {
    isLikelyLoop: boolean;
    suggestion: string;
  } {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return { isLikelyLoop: false, suggestion: '' };
    }

    const activeSessions = this.getActiveSessionsForUser(session.userId);

    if (activeSessions.length > 1) {
      // Maya-style response patterns
      const mayaPatterns = [
        /^(I hear|I sense|I'm noticing|I feel|Mmm|Ah|Yeah that)/i,
        /well tuned to|attuning|holding space|feeling into/i,
        /(gentle|soft|warm) presence/i,
        /what wants to|what's alive|what's stirring/i
      ];

      const matchesMayaPattern = mayaPatterns.some(pattern => pattern.test(input));

      if (matchesMayaPattern) {
        return {
          isLikelyLoop: true,
          suggestion: `I notice you have ${activeSessions.length} active Maya sessions. To prevent conversation loops, please close other tabs/devices and use one session at a time.`
        };
      }
    }

    return { isLikelyLoop: false, suggestion: '' };
  }

  // Clean up old sessions
  cleanupOldSessions(): void {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.lastActivity < thirtyMinutesAgo) {
        session.isActive = false;

        // Remove from user sessions
        const userSessions = this.sessionsByUser.get(session.userId);
        if (userSessions) {
          userSessions.delete(sessionId);
          if (userSessions.size === 0) {
            this.sessionsByUser.delete(session.userId);
          }
        }
      }
    }
  }

  // Get session info for debugging
  getSessionInfo(sessionId: string): UserSession | undefined {
    return this.activeSessions.get(sessionId);
  }
}

// Singleton instance
let instance: UserSessionCoordinator | null = null;

export function getUserSessionCoordinator(): UserSessionCoordinator {
  if (!instance) {
    instance = new UserSessionCoordinator();

    // Clean up old sessions every 5 minutes
    setInterval(() => {
      instance?.cleanupOldSessions();
    }, 5 * 60 * 1000);
  }
  return instance;
}