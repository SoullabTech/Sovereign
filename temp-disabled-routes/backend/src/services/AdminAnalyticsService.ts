/**
 * Admin Analytics Service - Real-time monitoring and metrics collection
 * Tracks sessions, interactions, files, and system performance for admin dashboard
 */

import { logger } from '../utils/logger';

interface SessionData {
  id: string;
  userId: string;
  username?: string;
  element: string;
  startTime: Date;
  lastActivity: Date;
  interactionCount: number;
  voiceInteractions: number;
  textInteractions: number;
  mode: 'voice' | 'text' | 'mixed';
  status: 'active' | 'completed';
  avgResponseTime: number;
  fileUploads: number;
  citationsGenerated: number;
}

interface SystemMetrics {
  totalSessions: number;
  activeSessions: number;
  sessionsToday: number;
  totalInteractions: number;
  voiceInteractions: number;
  textInteractions: number;
  totalFiles: number;
  filesUploadedToday: number;
  citationsGenerated: number;
  avgResponseTime: number;
  avgSessionLength: number;
}

class AdminAnalyticsService {
  private sessions: Map<string, SessionData> = new Map();
  private dailyMetrics: Map<string, any> = new Map();
  private responseTimeBuffer: number[] = [];
  private readonly BUFFER_SIZE = 100;

  constructor() {
    // Clean up inactive sessions every 5 minutes
    setInterval(() => this.cleanupInactiveSessions(), 5 * 60 * 1000);
    
    // Reset daily metrics at midnight
    this.scheduleDailyReset();
    
    logger.info('AdminAnalyticsService initialized');
  }

  /**
   * Start tracking a new session
   */
  startSession(sessionId: string, userId: string, username: string, element: string): void {
    const session: SessionData = {
      id: sessionId,
      userId,
      username,
      element,
      startTime: new Date(),
      lastActivity: new Date(),
      interactionCount: 0,
      voiceInteractions: 0,
      textInteractions: 0,
      mode: 'text', // Default, will be updated
      status: 'active',
      avgResponseTime: 0,
      fileUploads: 0,
      citationsGenerated: 0
    };

    this.sessions.set(sessionId, session);
    logger.info('Session started for analytics tracking', { 
      sessionId, 
      userId, 
      username,
      element 
    });
  }

  /**
   * Record an interaction (voice or text)
   */
  recordInteraction(
    sessionId: string, 
    type: 'voice' | 'text', 
    responseTimeMs: number,
    citationCount: number = 0
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Update session data
    session.lastActivity = new Date();
    session.interactionCount++;
    session.citationsGenerated += citationCount;
    
    if (type === 'voice') {
      session.voiceInteractions++;
    } else {
      session.textInteractions++;
    }

    // Determine session mode
    if (session.voiceInteractions > 0 && session.textInteractions > 0) {
      session.mode = 'mixed';
    } else if (session.voiceInteractions > 0) {
      session.mode = 'voice';
    } else {
      session.mode = 'text';
    }

    // Track response time
    this.addResponseTime(responseTimeMs);
    session.avgResponseTime = this.calculateSessionAvgResponseTime(sessionId);

    logger.debug('Interaction recorded', { 
      sessionId, 
      type, 
      responseTimeMs, 
      citationCount,
      totalInteractions: session.interactionCount 
    });
  }

  /**
   * Record file upload
   */
  recordFileUpload(sessionId: string, fileName: string, fileSize: number): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.fileUploads++;
      session.lastActivity = new Date();
    }

    const today = new Date().toDateString();
    const dailyData = this.dailyMetrics.get(today) || { filesUploaded: 0 };
    dailyData.filesUploaded++;
    this.dailyMetrics.set(today, dailyData);

    logger.info('File upload recorded', { sessionId, fileName, fileSize });
  }

  /**
   * End session tracking
   */
  endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'completed';
      session.lastActivity = new Date();
      
      logger.info('Session ended', { 
        sessionId, 
        duration: session.lastActivity.getTime() - session.startTime.getTime(),
        interactions: session.interactionCount,
        mode: session.mode
      });
    }
  }

  /**
   * Get current system metrics for admin dashboard
   */
  getSystemMetrics(): SystemMetrics {
    const activeSessions = Array.from(this.sessions.values()).filter(s => s.status === 'active');
    const allSessions = Array.from(this.sessions.values());
    const today = new Date().toDateString();
    const todaySessions = allSessions.filter(s => 
      s.startTime.toDateString() === today
    );

    const totalVoiceInteractions = allSessions.reduce((sum, s) => sum + s.voiceInteractions, 0);
    const totalTextInteractions = allSessions.reduce((sum, s) => sum + s.textInteractions, 0);
    const totalCitations = allSessions.reduce((sum, s) => sum + s.citationsGenerated, 0);
    const totalFiles = allSessions.reduce((sum, s) => sum + s.fileUploads, 0);

    const dailyData = this.dailyMetrics.get(today) || { filesUploaded: 0 };

    // Calculate average session length
    const completedSessions = allSessions.filter(s => s.status === 'completed');
    const avgSessionLength = completedSessions.length > 0 
      ? completedSessions.reduce((sum, s) => 
          sum + (s.lastActivity.getTime() - s.startTime.getTime()), 0
        ) / completedSessions.length / 1000 // Convert to seconds
      : 0;

    return {
      totalSessions: allSessions.length,
      activeSessions: activeSessions.length,
      sessionsToday: todaySessions.length,
      totalInteractions: totalVoiceInteractions + totalTextInteractions,
      voiceInteractions: totalVoiceInteractions,
      textInteractions: totalTextInteractions,
      totalFiles,
      filesUploadedToday: dailyData.filesUploaded,
      citationsGenerated: totalCitations,
      avgResponseTime: this.getAverageResponseTime(),
      avgSessionLength: Math.round(avgSessionLength)
    };
  }

  /**
   * Get active sessions for admin dashboard
   */
  getActiveSessions(): SessionData[] {
    return Array.from(this.sessions.values())
      .filter(session => session.status === 'active')
      .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  }

  /**
   * Get session details by ID
   */
  getSessionDetails(sessionId: string): SessionData | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Force terminate a session (admin action)
   */
  forceTerminateSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session && session.status === 'active') {
      session.status = 'completed';
      session.lastActivity = new Date();
      logger.warn('Session forcefully terminated by admin', { sessionId });
      return true;
    }
    return false;
  }

  // Private helper methods

  private addResponseTime(timeMs: number): void {
    this.responseTimeBuffer.push(timeMs);
    if (this.responseTimeBuffer.length > this.BUFFER_SIZE) {
      this.responseTimeBuffer.shift();
    }
  }

  private getAverageResponseTime(): number {
    if (this.responseTimeBuffer.length === 0) return 0;
    const sum = this.responseTimeBuffer.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.responseTimeBuffer.length);
  }

  private calculateSessionAvgResponseTime(sessionId: string): number {
    const session = this.sessions.get(sessionId);
    if (!session || session.interactionCount === 0) return 0;
    
    // This is simplified - in reality you'd track per-session response times
    return this.getAverageResponseTime();
  }

  private cleanupInactiveSessions(): void {
    const now = new Date();
    const INACTIVE_THRESHOLD = 30 * 60 * 1000; // 30 minutes
    
    let cleanedCount = 0;
    for (const [sessionId, session] of this.sessions) {
      const inactiveTime = now.getTime() - session.lastActivity.getTime();
      if (inactiveTime > INACTIVE_THRESHOLD && session.status === 'active') {
        session.status = 'completed';
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.info('Cleaned up inactive sessions', { count: cleanedCount });
    }
  }

  private scheduleDailyReset(): void {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      this.dailyMetrics.clear();
      logger.info('Daily metrics reset');
      
      // Schedule next reset
      setInterval(() => {
        this.dailyMetrics.clear();
        logger.info('Daily metrics reset');
      }, 24 * 60 * 60 * 1000);
      
    }, msUntilMidnight);
  }
}

// Export singleton instance
export const adminAnalytics = new AdminAnalyticsService();