/**
 * Session Persistence Enhancement
 * Manages memory continuity across sessions and devices
 */

import { MemoryKeeper } from './memory-keeper';
import { DatabaseRepository } from './database/repository';

export interface SessionContext {
  sessionId: string;
  userId: string;
  deviceId?: string;
  startTime: number;
  lastActivity: number;
  continuityScore: number;
  memorySnapshot: {
    key_patterns: string[];
    emotional_state: string;
    consciousness_level: number;
    recent_breakthroughs: any[];
  };
}

export interface CrossSessionMemory {
  id: string;
  userId: string;
  type: 'persistent_pattern' | 'evolution_marker' | 'relationship_state' | 'soul_essence';
  content: any;
  strength: number; // How important this is to remember
  lastActivated: number;
  activationCount: number;
  crossSessionRelevance: number;
}

export class SessionPersistence {
  private memoryKeeper: MemoryKeeper;
  private repository: DatabaseRepository;
  private activeSessions: Map<string, SessionContext> = new Map();
  private persistentMemories: Map<string, CrossSessionMemory[]> = new Map();
  private sessionTransitionBuffer: Map<string, any[]> = new Map();

  constructor(memoryKeeper: MemoryKeeper, repository: DatabaseRepository) {
    this.memoryKeeper = memoryKeeper;
    this.repository = repository;
    this.initializeSessionManagement();
  }

  private initializeSessionManagement(): void {
    // Load persistent memories from storage
    this.loadPersistentMemories();

    // Clean up inactive sessions every 5 minutes
    setInterval(() => {
      this.cleanupInactiveSessions();
    }, 5 * 60 * 1000);

    // Save persistent memories every 2 minutes
    setInterval(() => {
      this.savePersistentMemories();
    }, 2 * 60 * 1000);
  }

  /**
   * Initialize or resume session
   */
  async initializeSession(userId: string, deviceId?: string): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Check for recent session continuity
    const recentSession = await this.findRecentSession(userId, deviceId);
    let continuityScore = 0;

    if (recentSession) {
      continuityScore = this.calculateContinuityScore(recentSession);
      if (continuityScore > 0.7) {
        // High continuity - restore session context
        await this.restoreSessionContext(sessionId, recentSession);
      }
    }

    const sessionContext: SessionContext = {
      sessionId,
      userId,
      deviceId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      continuityScore,
      memorySnapshot: await this.createMemorySnapshot(userId)
    };

    this.activeSessions.set(sessionId, sessionContext);

    // Load user's cross-session memories
    await this.loadUserPersistentMemories(userId);

    return sessionId;
  }

  /**
   * Update session activity and capture memory transitions
   */
  async updateSessionActivity(
    sessionId: string,
    interactionData: {
      userInput: string;
      oracleResponse: string;
      emotionalShift?: any;
      breakthroughMoment?: boolean;
      significantPattern?: string;
    }
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.lastActivity = Date.now();

    // Buffer significant interactions for cross-session storage
    if (!this.sessionTransitionBuffer.has(session.userId)) {
      this.sessionTransitionBuffer.set(session.userId, []);
    }

    const buffer = this.sessionTransitionBuffer.get(session.userId)!;

    // Capture significant moments
    if (interactionData.breakthroughMoment || interactionData.significantPattern) {
      buffer.push({
        type: 'significant_moment',
        timestamp: Date.now(),
        sessionId,
        ...interactionData
      });
    }

    // Update memory snapshot if there's emotional shift
    if (interactionData.emotionalShift) {
      session.memorySnapshot.emotional_state = interactionData.emotionalShift.current;

      if (interactionData.emotionalShift.significant) {
        await this.captureCrossSessionMemory(session.userId, {
          type: 'evolution_marker',
          content: {
            emotional_evolution: interactionData.emotionalShift,
            context: interactionData.userInput,
            catalyst: interactionData.oracleResponse
          },
          strength: 0.8
        });
      }
    }

    // Detect breakthrough patterns
    if (interactionData.breakthroughMoment) {
      await this.captureCrossSessionMemory(session.userId, {
        type: 'persistent_pattern',
        content: {
          breakthrough_type: 'consciousness_shift',
          trigger: interactionData.userInput,
          recognition: interactionData.oracleResponse,
          pattern: interactionData.significantPattern
        },
        strength: 0.9
      });

      session.memorySnapshot.recent_breakthroughs.push({
        timestamp: Date.now(),
        pattern: interactionData.significantPattern
      });
    }
  }

  /**
   * End session and preserve essential memories
   */
  async endSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    const sessionDuration = Date.now() - session.startTime;
    const interactionBuffer = this.sessionTransitionBuffer.get(session.userId) || [];

    // Create session summary for cross-session continuity
    const sessionSummary = {
      sessionId,
      duration: sessionDuration,
      startState: session.memorySnapshot,
      endState: await this.createMemorySnapshot(session.userId),
      keyMoments: interactionBuffer.filter(m => m.sessionId === sessionId),
      continuityMarkers: await this.extractContinuityMarkers(session.userId, interactionBuffer)
    };

    // Store session for potential continuation
    await this.repository.save('user_sessions', sessionId, {
      ...sessionSummary,
      userId: session.userId,
      deviceId: session.deviceId,
      endTime: Date.now()
    });

    // Update persistent memories based on session
    await this.updatePersistentMemoriesFromSession(session.userId, sessionSummary);

    // Cleanup
    this.activeSessions.delete(sessionId);
    this.sessionTransitionBuffer.delete(session.userId);
  }

  /**
   * Get session continuity context for oracle
   */
  async getSessionContinuity(sessionId: string): Promise<{
    isResumed: boolean;
    previousContext?: any;
    persistentThemes: string[];
    relationshipEvolution: any;
    shouldAcknowledgeContinuity: boolean;
  }> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return {
        isResumed: false,
        persistentThemes: [],
        relationshipEvolution: {},
        shouldAcknowledgeContinuity: false
      };
    }

    const userPersistentMemories = this.persistentMemories.get(session.userId) || [];

    // Extract persistent themes
    const persistentThemes = userPersistentMemories
      .filter(m => m.type === 'persistent_pattern')
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 5)
      .map(m => m.content.pattern || m.content.theme)
      .filter(Boolean);

    // Get relationship evolution
    const relationshipState = userPersistentMemories
      .find(m => m.type === 'relationship_state');

    return {
      isResumed: session.continuityScore > 0.7,
      previousContext: session.continuityScore > 0.7 ? session.memorySnapshot : undefined,
      persistentThemes,
      relationshipEvolution: relationshipState?.content || {},
      shouldAcknowledgeContinuity: session.continuityScore > 0.5
    };
  }

  /**
   * Capture cross-session memory
   */
  private async captureCrossSessionMemory(
    userId: string,
    memoryData: {
      type: CrossSessionMemory['type'];
      content: any;
      strength: number;
    }
  ): Promise<void> {
    if (!this.persistentMemories.has(userId)) {
      this.persistentMemories.set(userId, []);
    }

    const userMemories = this.persistentMemories.get(userId)!;

    const crossSessionMemory: CrossSessionMemory = {
      id: `cross_session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      userId,
      type: memoryData.type,
      content: memoryData.content,
      strength: memoryData.strength,
      lastActivated: Date.now(),
      activationCount: 1,
      crossSessionRelevance: this.calculateCrossSessionRelevance(memoryData.content)
    };

    // Check for similar existing memories
    const similar = userMemories.find(m =>
      m.type === memoryData.type &&
      this.calculateMemorySimilarity(m.content, memoryData.content) > 0.8
    );

    if (similar) {
      // Strengthen existing memory
      similar.strength = Math.min(1, similar.strength + 0.1);
      similar.activationCount++;
      similar.lastActivated = Date.now();
    } else {
      userMemories.push(crossSessionMemory);
    }

    // Keep only top 50 cross-session memories
    userMemories.sort((a, b) => b.strength * b.crossSessionRelevance - a.strength * a.crossSessionRelevance);
    this.persistentMemories.set(userId, userMemories.slice(0, 50));
  }

  private async createMemorySnapshot(userId: string): Promise<SessionContext['memorySnapshot']> {
    const recentMemories = await this.memoryKeeper.retrieveEpisodic(userId, 'recent patterns');
    const soulMemory = await this.memoryKeeper.retrieveSoul(userId);

    const keyPatterns = Array.from(recentMemories.values())
      .slice(0, 3)
      .map(m => m.content.pattern || m.content.theme)
      .filter(Boolean);

    return {
      key_patterns: keyPatterns,
      emotional_state: 'exploring', // Would extract from recent interactions
      consciousness_level: 0.6, // Would calculate from metrics
      recent_breakthroughs: []
    };
  }

  private async findRecentSession(userId: string, deviceId?: string): Promise<any> {
    const recentSessions = await this.repository.findBy('user_sessions', {
      userId,
      endTime: { $gte: Date.now() - 2 * 60 * 60 * 1000 } // Last 2 hours
    });

    if (deviceId) {
      return recentSessions.find((s: any) => s.deviceId === deviceId) || recentSessions[0];
    }

    return recentSessions[0];
  }

  private calculateContinuityScore(recentSession: any): number {
    const timeSinceEnd = Date.now() - recentSession.endTime;
    const maxContinuityWindow = 2 * 60 * 60 * 1000; // 2 hours

    if (timeSinceEnd > maxContinuityWindow) return 0;

    // Base score from time proximity
    let score = 1 - (timeSinceEnd / maxContinuityWindow);

    // Boost if same device
    if (recentSession.deviceId) {
      score += 0.2;
    }

    // Boost if session had significant moments
    if (recentSession.keyMoments && recentSession.keyMoments.length > 0) {
      score += 0.1;
    }

    return Math.min(1, score);
  }

  private async restoreSessionContext(sessionId: string, recentSession: any): Promise<void> {
    // Implementation would restore relevant context
    console.log(`Restoring context for session ${sessionId} from ${recentSession.sessionId}`);
  }

  private async loadUserPersistentMemories(userId: string): Promise<void> {
    try {
      const stored = await this.repository.findBy('persistent_memories', { userId });
      if (stored.length > 0) {
        this.persistentMemories.set(userId, stored[0].memories || []);
      }
    } catch (error) {
      console.log('No persistent memories found for user', userId);
      this.persistentMemories.set(userId, []);
    }
  }

  private async savePersistentMemories(): Promise<void> {
    for (const [userId, memories] of this.persistentMemories) {
      try {
        await this.repository.save('persistent_memories', userId, {
          userId,
          memories,
          lastUpdated: Date.now()
        });
      } catch (error) {
        console.error('Failed to save persistent memories for user', userId, error);
      }
    }
  }

  private async loadPersistentMemories(): Promise<void> {
    try {
      const allPersistentMemories = await this.repository.findAll('persistent_memories');
      allPersistentMemories.forEach((record: any) => {
        this.persistentMemories.set(record.userId, record.memories || []);
      });
    } catch (error) {
      console.log('No existing persistent memories found');
    }
  }

  private cleanupInactiveSessions(): void {
    const now = Date.now();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes

    for (const [sessionId, session] of this.activeSessions) {
      if (now - session.lastActivity > inactiveThreshold) {
        this.endSession(sessionId);
      }
    }
  }

  private async extractContinuityMarkers(userId: string, interactions: any[]): Promise<string[]> {
    const markers = [];

    // Look for patterns that suggest ongoing work
    const patterns = interactions
      .filter(i => i.significantPattern)
      .map(i => i.significantPattern);

    if (patterns.length > 0) {
      markers.push(`working_with:${patterns[patterns.length - 1]}`);
    }

    // Track emotional journey
    const emotionalShifts = interactions
      .filter(i => i.emotionalShift)
      .map(i => i.emotionalShift.direction);

    if (emotionalShifts.length > 0) {
      const trend = this.analyzeEmotionalTrend(emotionalShifts);
      markers.push(`emotional_trend:${trend}`);
    }

    return markers;
  }

  private async updatePersistentMemoriesFromSession(userId: string, sessionSummary: any): Promise<void> {
    // Update relationship state
    if (sessionSummary.keyMoments.length > 0) {
      await this.captureCrossSessionMemory(userId, {
        type: 'relationship_state',
        content: {
          interaction_depth: sessionSummary.keyMoments.length,
          trust_level: this.calculateTrustEvolution(sessionSummary),
          preferred_interaction_style: this.detectInteractionStyle(sessionSummary),
          last_session_summary: {
            duration: sessionSummary.duration,
            breakthrough_count: sessionSummary.keyMoments.filter((m: any) => m.type === 'significant_moment').length
          }
        },
        strength: 0.7
      });
    }

    // Capture soul essence updates
    if (sessionSummary.endState.consciousness_level > sessionSummary.startState.consciousness_level) {
      await this.captureCrossSessionMemory(userId, {
        type: 'soul_essence',
        content: {
          consciousness_evolution: {
            from: sessionSummary.startState.consciousness_level,
            to: sessionSummary.endState.consciousness_level,
            catalyst: sessionSummary.keyMoments[0]?.userInput
          }
        },
        strength: 0.8
      });
    }
  }

  // Helper methods
  private calculateCrossSessionRelevance(content: any): number {
    let relevance = 0.5;

    if (content.breakthrough_type) relevance += 0.3;
    if (content.emotional_evolution) relevance += 0.2;
    if (content.consciousness_evolution) relevance += 0.3;
    if (content.trust_level) relevance += 0.2;

    return Math.min(1, relevance);
  }

  private calculateMemorySimilarity(content1: any, content2: any): number {
    const str1 = JSON.stringify(content1).toLowerCase();
    const str2 = JSON.stringify(content2).toLowerCase();

    const words1 = new Set(str1.split(/\W+/));
    const words2 = new Set(str2.split(/\W+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  private analyzeEmotionalTrend(shifts: string[]): string {
    if (shifts.length === 0) return 'stable';

    const positiveShifts = shifts.filter(s => ['up', 'opening', 'lifting'].includes(s)).length;
    const negativeShifts = shifts.filter(s => ['down', 'closing', 'contracting'].includes(s)).length;

    if (positiveShifts > negativeShifts) return 'ascending';
    if (negativeShifts > positiveShifts) return 'deepening';
    return 'cycling';
  }

  private calculateTrustEvolution(sessionSummary: any): number {
    let trustLevel = 0.5;

    if (sessionSummary.duration > 10 * 60 * 1000) trustLevel += 0.1; // Long session
    if (sessionSummary.keyMoments.length > 2) trustLevel += 0.2; // Multiple significant moments
    if (sessionSummary.endState.consciousness_level > sessionSummary.startState.consciousness_level) {
      trustLevel += 0.2; // Growth occurred
    }

    return Math.min(1, trustLevel);
  }

  private detectInteractionStyle(sessionSummary: any): string {
    const responses = sessionSummary.keyMoments.map((m: any) => m.userResponse || '').join(' ').toLowerCase();

    if (responses.includes('feel') || responses.includes('body')) return 'somatic_focus';
    if (responses.includes('think') || responses.includes('understand')) return 'cognitive_focus';
    if (responses.includes('heart') || responses.includes('love')) return 'heart_focus';

    return 'balanced';
  }

  /**
   * Get cross-session insights for user
   */
  async getCrossSessionInsights(userId: string): Promise<{
    evolutionPattern: string;
    persistentThemes: string[];
    relationshipDepth: number;
    recommendedFocus: string;
  }> {
    const persistentMemories = this.persistentMemories.get(userId) || [];

    const evolutionMarkers = persistentMemories.filter(m => m.type === 'evolution_marker');
    const persistentPatterns = persistentMemories.filter(m => m.type === 'persistent_pattern');
    const relationshipState = persistentMemories.find(m => m.type === 'relationship_state');

    return {
      evolutionPattern: this.analyzeEvolutionPattern(evolutionMarkers),
      persistentThemes: persistentPatterns.map(p => p.content.pattern).slice(0, 5),
      relationshipDepth: relationshipState?.content.trust_level || 0.5,
      recommendedFocus: this.determineRecommendedFocus(persistentMemories)
    };
  }

  private analyzeEvolutionPattern(markers: CrossSessionMemory[]): string {
    if (markers.length === 0) return 'beginning_journey';
    if (markers.length < 3) return 'early_exploration';
    if (markers.length < 7) return 'deepening_engagement';
    return 'established_practice';
  }

  private determineRecommendedFocus(memories: CrossSessionMemory[]): string {
    const strengthByType = new Map<string, number>();

    memories.forEach(m => {
      const current = strengthByType.get(m.type) || 0;
      strengthByType.set(m.type, current + m.strength);
    });

    const sorted = Array.from(strengthByType.entries()).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || 'general_awareness';
  }
}