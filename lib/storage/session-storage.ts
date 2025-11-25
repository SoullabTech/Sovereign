/**
 * Session Storage for Maya Conversations
 * Handles persistent storage of conversation history
 */

interface SessionData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  metadata: {
    userAgent?: string;
    location?: string;
    emotionalState?: string;
    topics?: string[];
  };
}

interface Message {
  id: string;
  role: 'user' | 'maya' | 'system';
  content: string;
  timestamp: Date;
  source?: 'user' | 'maia'; // Echo prevention: tracks message origin
  metadata?: {
    audioUrl?: string;
    emotion?: string;
    intent?: string;
    confidence?: number;
  };
}

class SessionStorage {
  private sessions: Map<string, SessionData>;
  private maxSessionAge: number = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor() {
    this.sessions = new Map();
    this.loadFromPersistence();
    this.startCleanupInterval();
  }

  /**
   * Create a new session
   */
  createSession(id?: string): SessionData {
    const sessionId = id || this.generateSessionId();
    const session: SessionData = {
      id: sessionId,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
      metadata: {}
    };

    this.sessions.set(sessionId, session);
    this.saveToPersistence();
    return session;
  }

  /**
   * Get an existing session or create new one
   */
  getOrCreateSession(id: string): SessionData {
    if (this.sessions.has(id)) {
      return this.sessions.get(id)!;
    }
    return this.createSession(id);
  }

  /**
   * Add a message to a session
   */
  addMessage(sessionId: string, message: Omit<Message, 'id' | 'timestamp'>): Message {
    const session = this.getOrCreateSession(sessionId);
    const fullMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    session.messages.push(fullMessage);
    session.updatedAt = new Date();

    this.sessions.set(sessionId, session);
    this.saveToPersistence();

    return fullMessage;
  }

  /**
   * Get session history
   */
  getSessionHistory(sessionId: string, limit?: number): Message[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    const messages = session.messages;
    if (limit && limit > 0) {
      return messages.slice(-limit);
    }
    return messages;
  }

  /**
   * Get recent messages for context
   */
  getRecentContext(sessionId: string, messageCount: number = 10): string {
    const messages = this.getSessionHistory(sessionId, messageCount);
    return messages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');
  }

  /**
   * Update session metadata
   */
  updateMetadata(sessionId: string, metadata: Partial<SessionData['metadata']>) {
    const session = this.getOrCreateSession(sessionId);
    session.metadata = {
      ...session.metadata,
      ...metadata
    };
    session.updatedAt = new Date();

    this.sessions.set(sessionId, session);
    this.saveToPersistence();
  }

  /**
   * Clear old sessions
   */
  private cleanupOldSessions() {
    const now = Date.now();
    const toDelete: string[] = [];

    this.sessions.forEach((session, id) => {
      const age = now - session.updatedAt.getTime();
      if (age > this.maxSessionAge) {
        toDelete.push(id);
      }
    });

    toDelete.forEach(id => this.sessions.delete(id));

    if (toDelete.length > 0) {
      this.saveToPersistence();
      console.log(`Cleaned up ${toDelete.length} old sessions`);
    }
  }

  /**
   * Start cleanup interval
   */
  private startCleanupInterval() {
    // Run cleanup every hour
    setInterval(() => {
      this.cleanupOldSessions();
    }, 60 * 60 * 1000);
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `maya-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save to persistent storage (file system for now)
   */
  private async saveToPersistence() {
    try {
      // In production, this would save to a database
      // For now, we'll use in-memory storage with optional file backup
      if (typeof window === 'undefined') {
        // Server-side: could write to file or database
        const fs = await import('fs/promises');
        const path = await import('path');

        const dataDir = path.join(process.cwd(), 'data');
        await fs.mkdir(dataDir, { recursive: true });

        const filePath = path.join(dataDir, 'sessions.json');
        const data = Array.from(this.sessions.entries()).map(([id, session]) => ({
          id,
          ...session,
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
          messages: session.messages.map(m => ({
            ...m,
            timestamp: m.timestamp.toISOString()
          }))
        }));

        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.error('Failed to save sessions:', error);
    }
  }

  /**
   * Load from persistent storage
   */
  private async loadFromPersistence() {
    try {
      if (typeof window === 'undefined') {
        const fs = await import('fs/promises');
        const path = await import('path');

        const filePath = path.join(process.cwd(), 'data', 'sessions.json');

        try {
          const data = await fs.readFile(filePath, 'utf-8');
          const sessions = JSON.parse(data);

          sessions.forEach((session: any) => {
            this.sessions.set(session.id, {
              ...session,
              createdAt: new Date(session.createdAt),
              updatedAt: new Date(session.updatedAt),
              messages: session.messages.map((m: any) => ({
                ...m,
                timestamp: new Date(m.timestamp)
              }))
            });
          });

          console.log(`Loaded ${sessions.length} sessions from storage`);
        } catch (err) {
          // File doesn't exist yet, that's ok
          console.log('No existing sessions found');
        }
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  }

  /**
   * Get session statistics
   */
  getStatistics() {
    const stats = {
      totalSessions: this.sessions.size,
      totalMessages: 0,
      averageMessagesPerSession: 0,
      oldestSession: null as Date | null,
      newestSession: null as Date | null
    };

    this.sessions.forEach(session => {
      stats.totalMessages += session.messages.length;

      if (!stats.oldestSession || session.createdAt < stats.oldestSession) {
        stats.oldestSession = session.createdAt;
      }

      if (!stats.newestSession || session.createdAt > stats.newestSession) {
        stats.newestSession = session.createdAt;
      }
    });

    if (stats.totalSessions > 0) {
      stats.averageMessagesPerSession = stats.totalMessages / stats.totalSessions;
    }

    return stats;
  }
}

// Create singleton instance
let sessionStorageInstance: SessionStorage | null = null;

export function getSessionStorage(): SessionStorage {
  if (!sessionStorageInstance) {
    sessionStorageInstance = new SessionStorage();
  }
  return sessionStorageInstance;
}

export type { SessionData, Message };