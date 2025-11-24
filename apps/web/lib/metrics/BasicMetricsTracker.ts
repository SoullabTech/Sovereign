export interface UserMetrics {
  userId: string;
  sessionCount: number;
  messageCount: number;
  lastActiveTimestamp: number;
  averageSessionDuration: number;
  topTopics: string[];
  engagementScore: number;
  growthTrend: 'up' | 'down' | 'stable';
}

export interface SessionMetrics {
  sessionId: string;
  userId: string;
  startTime: number;
  endTime?: number;
  messageCount: number;
  userSatisfaction?: number;
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

export class BasicMetricsTracker {
  private static metrics = new Map<string, UserMetrics>();
  private static sessions = new Map<string, SessionMetrics>();

  static trackUser(userId: string): UserMetrics {
    const existing = this.metrics.get(userId);
    
    if (existing) {
      return existing;
    }

    const newMetrics: UserMetrics = {
      userId,
      sessionCount: 0,
      messageCount: 0,
      lastActiveTimestamp: Date.now(),
      averageSessionDuration: 0,
      topTopics: [],
      engagementScore: 0,
      growthTrend: 'stable'
    };

    this.metrics.set(userId, newMetrics);
    return newMetrics;
  }

  static startSession(userId: string, sessionId: string): SessionMetrics {
    const session: SessionMetrics = {
      sessionId,
      userId,
      startTime: Date.now(),
      messageCount: 0,
      topics: [],
      sentiment: 'neutral'
    };

    this.sessions.set(sessionId, session);
    
    // Update user metrics
    const userMetrics = this.trackUser(userId);
    userMetrics.sessionCount += 1;
    userMetrics.lastActiveTimestamp = Date.now();

    return session;
  }

  static endSession(sessionId: string): SessionMetrics | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    session.endTime = Date.now();
    
    // Update user metrics with session data
    const userMetrics = this.metrics.get(session.userId);
    if (userMetrics) {
      const sessionDuration = (session.endTime - session.startTime) / 1000; // in seconds
      userMetrics.averageSessionDuration = 
        (userMetrics.averageSessionDuration * (userMetrics.sessionCount - 1) + sessionDuration) / 
        userMetrics.sessionCount;
      
      userMetrics.messageCount += session.messageCount;
      
      // Update topics
      session.topics.forEach(topic => {
        if (!userMetrics.topTopics.includes(topic)) {
          userMetrics.topTopics.push(topic);
        }
      });

      // Keep only top 10 topics
      userMetrics.topTopics = userMetrics.topTopics.slice(0, 10);
      
      // Calculate simple engagement score
      userMetrics.engagementScore = Math.min(100, 
        (userMetrics.messageCount * 2) + 
        (userMetrics.sessionCount * 5) + 
        (userMetrics.averageSessionDuration / 60 * 3)
      );
    }

    return session;
  }

  static trackMessage(sessionId: string, content: string, topics: string[] = []) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.messageCount += 1;
    session.topics.push(...topics);

    // Simple sentiment analysis based on keywords
    const positiveKeywords = ['thank', 'great', 'helpful', 'amazing', 'love', 'perfect'];
    const negativeKeywords = ['bad', 'terrible', 'hate', 'awful', 'wrong', 'disappointed'];
    
    const contentLower = content.toLowerCase();
    const positiveCount = positiveKeywords.filter(word => contentLower.includes(word)).length;
    const negativeCount = negativeKeywords.filter(word => contentLower.includes(word)).length;

    if (positiveCount > negativeCount) {
      session.sentiment = 'positive';
    } else if (negativeCount > positiveCount) {
      session.sentiment = 'negative';
    } else {
      session.sentiment = 'neutral';
    }
  }

  static getUserMetrics(userId: string): UserMetrics | null {
    return this.metrics.get(userId) || null;
  }

  static getSessionMetrics(sessionId: string): SessionMetrics | null {
    return this.sessions.get(sessionId) || null;
  }

  static getAllUserMetrics(): UserMetrics[] {
    return Array.from(this.metrics.values());
  }

  static getTopUsers(limit: number = 10): UserMetrics[] {
    return Array.from(this.metrics.values())
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, limit);
  }

  static generateSummary() {
    const allUsers = this.getAllUserMetrics();
    const totalUsers = allUsers.length;
    const totalSessions = allUsers.reduce((sum, user) => sum + user.sessionCount, 0);
    const totalMessages = allUsers.reduce((sum, user) => sum + user.messageCount, 0);
    const averageEngagement = totalUsers > 0 
      ? allUsers.reduce((sum, user) => sum + user.engagementScore, 0) / totalUsers 
      : 0;

    return {
      totalUsers,
      totalSessions,
      totalMessages,
      averageEngagement: Math.round(averageEngagement),
      activeUsers: allUsers.filter(user => 
        Date.now() - user.lastActiveTimestamp < 7 * 24 * 60 * 60 * 1000 // 7 days
      ).length
    };
  }
}

export default BasicMetricsTracker;