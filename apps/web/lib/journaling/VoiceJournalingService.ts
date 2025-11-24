"use client";

import { JournalingMode, JournalingResponse } from './JournalingPrompts';

/**
 * Voice Journaling Service
 * Connects Maya voice transcripts to journaling analysis and soulprint updates
 */

export interface VoiceJournalSession {
  id: string;
  userId: string;
  mode: JournalingMode;
  transcript: string;
  analysis?: JournalingResponse;
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  startTime: Date;
  endTime?: Date;
  duration?: number; // seconds
  wordCount: number;
}

export interface VoiceJournalMetrics {
  totalSessions: number;
  totalWords: number;
  totalDuration: number;
  favoriteMode: JournalingMode;
  elementUsage: Record<string, number>;
  averageSessionLength: number;
}

export class VoiceJournalingService {
  private sessions: Map<string, VoiceJournalSession> = new Map();

  /**
   * Start a new voice journaling session
   */
  startSession(
    userId: string,
    mode: JournalingMode,
    element: 'fire' | 'water' | 'earth' | 'air' | 'aether'
  ): VoiceJournalSession {
    const session: VoiceJournalSession = {
      id: Date.now().toString(),
      userId,
      mode,
      transcript: '',
      element,
      startTime: new Date(),
      wordCount: 0,
    };

    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Update session with transcript
   */
  updateTranscript(sessionId: string, transcript: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.error('Session not found:', sessionId);
      return;
    }

    session.transcript = transcript;
    session.wordCount = transcript.split(/\s+/).filter(w => w.length > 0).length;
  }

  /**
   * Finalize session and analyze
   */
  async finalizeSession(sessionId: string): Promise<VoiceJournalSession | null> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.error('Session not found:', sessionId);
      return null;
    }

    session.endTime = new Date();
    session.duration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000);

    // Only analyze if there's meaningful content
    if (session.wordCount > 10) {
      try {
        const analysis = await this.analyzeJournal(session);
        session.analysis = analysis;

        // Save to persistent storage
        await this.saveSession(session);
      } catch (error) {
        console.error('Failed to analyze journal:', error);
      }
    }

    return session;
  }

  /**
   * Analyze journal entry via API
   */
  private async analyzeJournal(session: VoiceJournalSession): Promise<JournalingResponse> {
    const response = await fetch('/api/journal/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entry: session.transcript,
        mode: session.mode,
        userId: session.userId,
        element: session.element,
      }),
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.status}`);
    }

    const data = await response.json();
    return data.reflection;
  }

  /**
   * Save session to timeline/storage
   */
  private async saveSession(session: VoiceJournalSession): Promise<void> {
    try {
      // Save to timeline API
      await fetch('/api/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.userId,
          type: 'voice_journal',
          content: {
            mode: session.mode,
            transcript: session.transcript,
            analysis: session.analysis,
            element: session.element,
            duration: session.duration,
            wordCount: session.wordCount,
          },
          timestamp: session.startTime.toISOString(),
        }),
      });

      // Also save to localStorage as backup
      this.saveToLocalStorage(session);
    } catch (error) {
      console.error('Failed to save session:', error);
      // Still save to localStorage as fallback
      this.saveToLocalStorage(session);
    }
  }

  /**
   * Save to localStorage
   */
  private saveToLocalStorage(session: VoiceJournalSession): void {
    try {
      const key = `voice_journal_${session.userId}`;
      const existing = localStorage.getItem(key);
      const sessions = existing ? JSON.parse(existing) : [];

      sessions.push({
        id: session.id,
        mode: session.mode,
        transcript: session.transcript,
        analysis: session.analysis,
        element: session.element,
        startTime: session.startTime.toISOString(),
        endTime: session.endTime?.toISOString(),
        duration: session.duration,
        wordCount: session.wordCount,
      });

      // Keep only last 50 sessions
      if (sessions.length > 50) {
        sessions.shift();
      }

      localStorage.setItem(key, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  /**
   * Get session history from localStorage
   */
  getSessionHistory(userId: string): VoiceJournalSession[] {
    try {
      const key = `voice_journal_${userId}`;
      const data = localStorage.getItem(key);
      if (!data) return [];

      const sessions = JSON.parse(data);
      return sessions.map((s: any) => ({
        ...s,
        startTime: new Date(s.startTime),
        endTime: s.endTime ? new Date(s.endTime) : undefined,
      }));
    } catch (error) {
      console.error('Failed to load session history:', error);
      return [];
    }
  }

  /**
   * Get metrics for user
   */
  getMetrics(userId: string): VoiceJournalMetrics {
    const sessions = this.getSessionHistory(userId);

    const metrics: VoiceJournalMetrics = {
      totalSessions: sessions.length,
      totalWords: sessions.reduce((sum, s) => sum + s.wordCount, 0),
      totalDuration: sessions.reduce((sum, s) => sum + (s.duration || 0), 0),
      favoriteMode: 'freewrite', // Default
      elementUsage: {},
      averageSessionLength: 0,
    };

    if (sessions.length > 0) {
      // Calculate favorite mode
      const modeCounts: Record<string, number> = {};
      sessions.forEach(s => {
        modeCounts[s.mode] = (modeCounts[s.mode] || 0) + 1;
      });
      metrics.favoriteMode = Object.entries(modeCounts)
        .sort(([, a], [, b]) => b - a)[0][0] as JournalingMode;

      // Calculate element usage
      sessions.forEach(s => {
        metrics.elementUsage[s.element] = (metrics.elementUsage[s.element] || 0) + 1;
      });

      // Average session length
      metrics.averageSessionLength = metrics.totalDuration / sessions.length;
    }

    return metrics;
  }

  /**
   * Clear session from memory
   */
  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * Get active session
   */
  getSession(sessionId: string): VoiceJournalSession | undefined {
    return this.sessions.get(sessionId);
  }
}

// Singleton instance
export const voiceJournalingService = new VoiceJournalingService();