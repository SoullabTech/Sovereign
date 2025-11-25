/**
 * MAIA Dual-Track Beta Monitoring
 * Tracks both Sesame Hybrid (baseline) and Field System (experimental) performance
 *
 * Architecture:
 * - Track 1: Sesame Hybrid (reliable, always responds)
 * - Track 2: Field System (experimental, can emit silence)
 *
 * Monitors:
 * 1. User Identity & Continuity (name retention, session linking, context memory)
 * 2. Elemental & Spiralogic Phase Tracking
 * 3. Memory Depth and Evolution
 * 4. Archetypal & Emotional Awareness
 * 5. Technical Flow (API health, context passing)
 * 6. A/B Comparison (Sesame vs Field performance)
 */

export type SystemMode = 'sesame_hybrid' | 'field_system' | 'unknown';

export interface MaiaSessionContext {
  sessionId: string;
  userId: string;
  userName?: string;
  timestamp: Date;

  // Dual-Track Beta
  systemMode: SystemMode; // Which system generated this response?
  userSelectedMode: boolean; // Did user explicitly choose, or was it assigned?

  // Identity & Continuity
  userNameUsed: boolean;
  userNameAskedFor: boolean; // CRITICAL: Should be false for returning users
  sessionLinked: boolean; // Did MAIA recognize returning user?
  priorContextRecalled: boolean;

  // Elemental & Spiralogic
  elementalMode?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  spiralogicPhase?: string;
  elementalAdaptation: boolean; // Did MAIA adapt tone/practices to element?

  // Memory & Evolution
  memoryDepth: {
    recalledThemes: string[]; // e.g., ['self-worth', 'grief', 'transformation']
    recalledSymbols: string[]; // e.g., ['White Stag', 'Labyrinth']
    recalledGoals: string[];
    priorSessionSummary?: string;
  };
  evolutionTracking: {
    toneAdaptation: boolean;
    recommendationEvolution: boolean;
    patternRecognition: string[];
  };

  // Archetypal & Emotional
  archetypeDetected?: string;
  shadowMaterialDetected: boolean;
  resistancePatternDetected: boolean;
  breakthroughMoment: boolean;
  emotionalTone?: 'joy' | 'grief' | 'anger' | 'fear' | 'peace' | 'mixed';

  // Beta Validation Metrics
  conversationalRestraint: {
    responseWordCount: number;
    wasIntentionalSilence: boolean;
    fragmentedResponse: boolean; // "Mm." vs paragraph
    brevityScore: number; // 0-1, higher = more restrained
  };
  perceivedAuthenticity: {
    userRating?: number; // 1-5 scale
    feltGenuine: boolean;
    feltPerformative: boolean;
    comparisonToBaseline?: 'more_authentic' | 'same' | 'less_authentic';
  };

  // Technical Flow
  apiHealth: {
    responseTimeMs: number;
    contextPayloadComplete: boolean;
    memoryInjectionSuccess: boolean;
    claudePromptQuality: 'excellent' | 'good' | 'poor';
  };

  // Field Intelligence Metadata
  fieldMetadata?: {
    interventionType: string;
    fieldResonance: number;
    emergenceSource: string;
    sacredThreshold?: number;
  };
}

export interface MaiaUserProfile {
  userId: string;
  userName?: string;
  firstSeen: Date;
  lastSeen: Date;
  totalSessions: number;

  // Identity Tracking
  nameRetentionScore: number; // 0-1: How often MAIA uses their name correctly
  nameAskedForCount: number; // Should be 1 for first session, 0 after

  // Elemental Journey
  elementalHistory: Array<{
    date: Date;
    element: string;
    duration: number;
  }>;
  currentSpiralogicPhase?: string;

  // Memory Persistence
  narrativeThreads: string[]; // Ongoing themes across sessions
  archivedInsights: Array<{
    date: Date;
    insight: string;
    archetype?: string;
  }>;
  goalEvolution: Array<{
    date: Date;
    goal: string;
    status: 'active' | 'completed' | 'evolved';
  }>;

  // Archetypal Journey
  archetypeHistory: Array<{
    date: Date;
    archetype: string;
    shadowWork?: boolean;
  }>;
  breakthroughMoments: Array<{
    date: Date;
    description: string;
    context: string;
  }>;

  // Quality Metrics
  averageResponseQuality: number; // 0-1 based on context quality
  memoryDepthScore: number; // 0-1 based on recall accuracy
  adaptationScore: number; // 0-1 based on tone/element adaptation

  // Beta Validation Aggregates
  conversationalRestraintScore: number; // 0-1 average brevity
  authenticityScore: number; // 0-1 based on user ratings
  baselineComparison?: {
    moreAuthenticCount: number;
    sameCount: number;
    lessAuthenticCount: number;
  };

  // Dual-Track Comparison
  sesameHybridSessions: number;
  fieldSystemSessions: number;
  modeSwitchCount: number; // How often did user switch tracks?
  preferredMode?: SystemMode; // Which mode does this user prefer?
}

export interface MaiaSystemMetrics {
  // Identity & Continuity Health
  nameRetentionRate: number; // % of sessions where name is used correctly
  nameReaskRate: number; // % of sessions where name is asked again (should be ~0%)
  sessionLinkingRate: number; // % of returning users recognized

  // Memory Performance
  averageMemoryDepth: number; // Average themes/symbols recalled per session
  contextRecallRate: number; // % of sessions with prior context recalled
  narrativeConsistency: number; // How consistent are narrative threads?

  // Adaptation Quality
  elementalAdaptationRate: number; // % of sessions with proper elemental adaptation
  archetypeDetectionRate: number; // % of sessions with archetype detected
  toneEvolutionScore: number; // How well MAIA evolves tone over time

  // Technical Health
  averageResponseTime: number;
  contextPayloadCompleteness: number; // % of complete context payloads
  memoryInjectionSuccessRate: number;
  apiHealthScore: number;

  // Field Intelligence Quality
  fieldResonanceAverage: number;
  sacredThresholdTriggered: number;
  emergenceSourceDistribution: Record<string, number>;

  // Beta Validation Metrics (Overall)
  averageConversationalRestraint: number; // 0-1 brevity score
  intentionalSilenceRate: number; // % of responses that were silence
  averageWordCount: number;
  averageAuthenticityRating: number; // 1-5 scale
  authenticityVsBaseline: {
    moreAuthenticPercent: number;
    samePercent: number;
    lessAuthenticPercent: number;
  };
  breakthroughRate: number; // Breakthroughs per session

  // Dual-Track A/B Comparison
  sesameHybrid: {
    sessionCount: number;
    averageRestraint: number;
    averageAuthenticity: number;
    breakthroughRate: number;
    averageWordCount: number;
    userSatisfaction: number;
  };
  fieldSystem: {
    sessionCount: number;
    averageRestraint: number;
    averageAuthenticity: number;
    breakthroughRate: number;
    averageWordCount: number;
    silenceRate: number;
    fieldCollapseRate: number; // How often does coherence fail?
    userSatisfaction: number;
  };
  modeSwitchingBehavior: {
    usersSwitched: number;
    averageSwitchesPerUser: number;
    sesameToFieldSwitches: number;
    fieldToSesameSwitches: number;
  };
  userPreference: {
    preferSesame: number;
    preferField: number;
    noPreference: number;
  };
}

export class MaiaMonitoring {
  private sessions = new Map<string, MaiaSessionContext[]>();
  private profiles = new Map<string, MaiaUserProfile>();
  private systemMetrics: MaiaSystemMetrics | null = null;

  // === SESSION TRACKING ===

  startSession(userId: string, userName?: string, systemMode: SystemMode = 'unknown', userSelected: boolean = false): string {
    const sessionId = `maia_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const session: MaiaSessionContext = {
      sessionId,
      userId,
      userName,
      timestamp: new Date(),
      systemMode,
      userSelectedMode: userSelected,
      userNameUsed: false,
      userNameAskedFor: false,
      sessionLinked: false,
      priorContextRecalled: false,
      elementalAdaptation: false,
      memoryDepth: {
        recalledThemes: [],
        recalledSymbols: [],
        recalledGoals: []
      },
      evolutionTracking: {
        toneAdaptation: false,
        recommendationEvolution: false,
        patternRecognition: []
      },
      shadowMaterialDetected: false,
      resistancePatternDetected: false,
      breakthroughMoment: false,
      conversationalRestraint: {
        responseWordCount: 0,
        wasIntentionalSilence: false,
        fragmentedResponse: false,
        brevityScore: 0
      },
      perceivedAuthenticity: {
        feltGenuine: false,
        feltPerformative: false
      },
      apiHealth: {
        responseTimeMs: 0,
        contextPayloadComplete: false,
        memoryInjectionSuccess: false,
        claudePromptQuality: 'good'
      }
    };

    const userSessions = this.sessions.get(userId) || [];
    userSessions.push(session);
    this.sessions.set(userId, userSessions);

    // Update or create user profile
    this.updateUserProfile(userId, userName);

    console.log(`🤖 MAIA session started: ${sessionId} for user ${userId}${userName ? ` (${userName})` : ''}`);
    return sessionId;
  }

  updateSession(userId: string, updates: Partial<MaiaSessionContext>): void {
    const userSessions = this.sessions.get(userId);
    if (!userSessions || userSessions.length === 0) return;

    const currentSession = userSessions[userSessions.length - 1];
    Object.assign(currentSession, updates);

    // CRITICAL CHECK: Flag if name was asked for returning user
    if (updates.userNameAskedFor && userSessions.length > 1) {
      console.error(`🚨 CRITICAL: MAIA asked for name from returning user ${userId}`);
      this.flagCriticalIssue(userId, 'name-re-ask', currentSession);
    }

    this.sessions.set(userId, userSessions);
  }

  private updateUserProfile(userId: string, userName?: string): void {
    let profile = this.profiles.get(userId);

    if (!profile) {
      profile = {
        userId,
        userName,
        firstSeen: new Date(),
        lastSeen: new Date(),
        totalSessions: 1,
        nameRetentionScore: 0,
        nameAskedForCount: userName ? 1 : 0,
        elementalHistory: [],
        narrativeThreads: [],
        archivedInsights: [],
        goalEvolution: [],
        archetypeHistory: [],
        breakthroughMoments: [],
        averageResponseQuality: 0,
        memoryDepthScore: 0,
        adaptationScore: 0,
        conversationalRestraintScore: 0,
        authenticityScore: 0,
        sesameHybridSessions: 0,
        fieldSystemSessions: 0,
        modeSwitchCount: 0
      };
    } else {
      profile.lastSeen = new Date();
      profile.totalSessions += 1;
      if (userName && !profile.userName) {
        profile.userName = userName;
      }

      // Track mode switches
      const userSessions = this.sessions.get(userId) || [];
      if (userSessions.length > 0) {
        const lastSession = userSessions[userSessions.length - 1];
        if (lastSession.systemMode !== systemMode && systemMode !== 'unknown') {
          profile.modeSwitchCount++;
        }
      }

      // Track mode usage
      if (systemMode === 'sesame_hybrid') profile.sesameHybridSessions++;
      else if (systemMode === 'field_system') profile.fieldSystemSessions++;

      // Update preferred mode (simple heuristic: whichever they've used more)
      if (profile.sesameHybridSessions > profile.fieldSystemSessions * 1.5) {
        profile.preferredMode = 'sesame_hybrid';
      } else if (profile.fieldSystemSessions > profile.sesameHybridSessions * 1.5) {
        profile.preferredMode = 'field_system';
      } else {
        profile.preferredMode = undefined; // No clear preference
      }
    }

    this.profiles.set(userId, profile);
  }

  // === MEMORY TRACKING ===

  trackMemoryRecall(userId: string, recall: {
    themes?: string[];
    symbols?: string[];
    goals?: string[];
    sessionSummary?: string;
  }): void {
    const userSessions = this.sessions.get(userId);
    if (!userSessions || userSessions.length === 0) return;

    const currentSession = userSessions[userSessions.length - 1];

    if (recall.themes) currentSession.memoryDepth.recalledThemes.push(...recall.themes);
    if (recall.symbols) currentSession.memoryDepth.recalledSymbols.push(...recall.symbols);
    if (recall.goals) currentSession.memoryDepth.recalledGoals.push(...recall.goals);
    if (recall.sessionSummary) currentSession.memoryDepth.priorSessionSummary = recall.sessionSummary;

    currentSession.priorContextRecalled =
      currentSession.memoryDepth.recalledThemes.length > 0 ||
      currentSession.memoryDepth.recalledSymbols.length > 0 ||
      currentSession.memoryDepth.recalledGoals.length > 0;

    this.sessions.set(userId, userSessions);

    console.log(`🧠 Memory recall tracked for ${userId}:`, recall);
  }

  // === ARCHETYPAL TRACKING ===

  trackArchetypeDetection(userId: string, archetype: string, shadowWork: boolean = false): void {
    const userSessions = this.sessions.get(userId);
    if (!userSessions || userSessions.length === 0) return;

    const currentSession = userSessions[userSessions.length - 1];
    currentSession.archetypeDetected = archetype;
    currentSession.shadowMaterialDetected = shadowWork;

    this.sessions.set(userId, userSessions);

    // Update user profile
    const profile = this.profiles.get(userId);
    if (profile) {
      profile.archetypeHistory.push({
        date: new Date(),
        archetype,
        shadowWork
      });
      this.profiles.set(userId, profile);
    }

    console.log(`🎭 Archetype detected for ${userId}: ${archetype}${shadowWork ? ' (shadow work)' : ''}`);
  }

  trackBreakthrough(userId: string, description: string, context: string): void {
    const profile = this.profiles.get(userId);
    if (!profile) return;

    profile.breakthroughMoments.push({
      date: new Date(),
      description,
      context
    });

    const userSessions = this.sessions.get(userId);
    if (userSessions && userSessions.length > 0) {
      const currentSession = userSessions[userSessions.length - 1];
      currentSession.breakthroughMoment = true;
    }

    this.profiles.set(userId, profile);
    console.log(`✨ Breakthrough moment for ${userId}: ${description}`);
  }

  // === ELEMENTAL TRACKING ===

  trackElementalAdaptation(userId: string, element: string, adapted: boolean): void {
    const userSessions = this.sessions.get(userId);
    if (!userSessions || userSessions.length === 0) return;

    const currentSession = userSessions[userSessions.length - 1];
    currentSession.elementalMode = element as any;
    currentSession.elementalAdaptation = adapted;

    this.sessions.set(userId, userSessions);

    // Update user profile
    const profile = this.profiles.get(userId);
    if (profile) {
      profile.elementalHistory.push({
        date: new Date(),
        element,
        duration: 0 // Will be updated when session ends
      });
      this.profiles.set(userId, profile);
    }

    console.log(`🔥 Elemental adaptation for ${userId}: ${element} (${adapted ? 'adapted' : 'not adapted'})`);
  }

  // === TECHNICAL HEALTH ===

  trackApiHealth(userId: string, health: {
    responseTimeMs: number;
    contextPayloadComplete: boolean;
    memoryInjectionSuccess: boolean;
    claudePromptQuality?: 'excellent' | 'good' | 'poor';
  }): void {
    const userSessions = this.sessions.get(userId);
    if (!userSessions || userSessions.length === 0) return;

    const currentSession = userSessions[userSessions.length - 1];
    Object.assign(currentSession.apiHealth, health);

    this.sessions.set(userId, userSessions);

    if (health.responseTimeMs > 3000) {
      console.warn(`⚠️ Slow response for ${userId}: ${health.responseTimeMs}ms`);
    }

    if (!health.contextPayloadComplete) {
      console.error(`🚨 Incomplete context payload for ${userId}`);
      this.flagCriticalIssue(userId, 'incomplete-context', currentSession);
    }
  }

  // === BETA VALIDATION TRACKING ===

  trackConversationalRestraint(userId: string, restraint: {
    responseText: string | null;
    wasIntentionalSilence: boolean;
  }): void {
    const userSessions = this.sessions.get(userId);
    if (!userSessions || userSessions.length === 0) return;

    const currentSession = userSessions[userSessions.length - 1];

    // Calculate word count
    const wordCount = responseText ? responseText.trim().split(/\s+/).length : 0;

    // Determine if fragmented (very short, non-sentence responses like "Mm." or "Tell me.")
    const fragmentedResponse = wordCount > 0 && wordCount <= 3 && !responseText?.endsWith('?');

    // Calculate brevity score (0-1, higher = more restrained)
    // Silence = 1.0, 1-3 words = 0.9, 4-10 words = 0.7, 11-30 = 0.5, 31-50 = 0.3, 50+ = 0.1
    let brevityScore = 0.5;
    if (restraint.wasIntentionalSilence) brevityScore = 1.0;
    else if (wordCount <= 3) brevityScore = 0.9;
    else if (wordCount <= 10) brevityScore = 0.7;
    else if (wordCount <= 30) brevityScore = 0.5;
    else if (wordCount <= 50) brevityScore = 0.3;
    else brevityScore = 0.1;

    currentSession.conversationalRestraint = {
      responseWordCount: wordCount,
      wasIntentionalSilence: restraint.wasIntentionalSilence,
      fragmentedResponse,
      brevityScore
    };

    this.sessions.set(userId, userSessions);

    console.log(`📏 Conversational restraint for ${userId}: ${wordCount} words, brevity ${brevityScore.toFixed(2)}`);
  }

  trackPerceivedAuthenticity(userId: string, authenticity: {
    userRating?: number; // 1-5 scale
    feltGenuine?: boolean;
    feltPerformative?: boolean;
    comparisonToBaseline?: 'more_authentic' | 'same' | 'less_authentic';
  }): void {
    const userSessions = this.sessions.get(userId);
    if (!userSessions || userSessions.length === 0) return;

    const currentSession = userSessions[userSessions.length - 1];

    Object.assign(currentSession.perceivedAuthenticity, authenticity);

    this.sessions.set(userId, userSessions);

    // Update user profile aggregate
    const profile = this.profiles.get(userId);
    if (profile && authenticity.userRating) {
      // Recalculate average authenticity score
      const allSessions = this.sessions.get(userId) || [];
      const ratingsCount = allSessions.filter(s => s.perceivedAuthenticity.userRating).length;
      const ratingsSum = allSessions.reduce((sum, s) =>
        sum + (s.perceivedAuthenticity.userRating || 0), 0
      );
      profile.authenticityScore = ratingsCount > 0 ? ratingsSum / ratingsCount / 5 : 0; // Normalize to 0-1

      // Track baseline comparison
      if (authenticity.comparisonToBaseline) {
        if (!profile.baselineComparison) {
          profile.baselineComparison = { moreAuthenticCount: 0, sameCount: 0, lessAuthenticCount: 0 };
        }
        if (authenticity.comparisonToBaseline === 'more_authentic') profile.baselineComparison.moreAuthenticCount++;
        else if (authenticity.comparisonToBaseline === 'same') profile.baselineComparison.sameCount++;
        else if (authenticity.comparisonToBaseline === 'less_authentic') profile.baselineComparison.lessAuthenticCount++;
      }

      this.profiles.set(userId, profile);
    }

    console.log(`✨ Authenticity tracked for ${userId}:`, authenticity);
  }

  // === FIELD INTELLIGENCE ===

  trackFieldIntelligence(userId: string, fieldMetadata: {
    interventionType: string;
    fieldResonance: number;
    emergenceSource: string;
    sacredThreshold?: number;
  }): void {
    const userSessions = this.sessions.get(userId);
    if (!userSessions || userSessions.length === 0) return;

    const currentSession = userSessions[userSessions.length - 1];
    currentSession.fieldMetadata = fieldMetadata;

    this.sessions.set(userId, userSessions);

    console.log(`🌀 Field intelligence for ${userId}:`, fieldMetadata);
  }

  // === CRITICAL ISSUE FLAGGING ===

  private flagCriticalIssue(userId: string, issueType: string, session: MaiaSessionContext): void {
    console.error(`🚨 CRITICAL MAIA ISSUE [${issueType}] for user ${userId} in session ${session.sessionId}`);
    // TODO: Send to monitoring dashboard, Slack, etc.
  }

  // === ANALYTICS & REPORTING ===

  generateSystemMetrics(): MaiaSystemMetrics {
    const allSessions = Array.from(this.sessions.values()).flat();
    const allProfiles = Array.from(this.profiles.values());

    // Identity & Continuity
    const totalSessions = allSessions.length;
    const nameUsedCount = allSessions.filter(s => s.userNameUsed).length;
    const nameReaskCount = allSessions.filter(s => s.userNameAskedFor && s.timestamp > s.timestamp).length; // Rough heuristic
    const sessionLinkedCount = allSessions.filter(s => s.sessionLinked).length;

    // Memory Performance
    const contextRecallCount = allSessions.filter(s => s.priorContextRecalled).length;
    const totalThemesRecalled = allSessions.reduce((sum, s) =>
      sum + s.memoryDepth.recalledThemes.length, 0
    );
    const totalSymbolsRecalled = allSessions.reduce((sum, s) =>
      sum + s.memoryDepth.recalledSymbols.length, 0
    );

    // Adaptation Quality
    const elementalAdaptationCount = allSessions.filter(s => s.elementalAdaptation).length;
    const archetypeDetectedCount = allSessions.filter(s => s.archetypeDetected).length;

    // Technical Health
    const avgResponseTime = allSessions.reduce((sum, s) =>
      sum + s.apiHealth.responseTimeMs, 0
    ) / totalSessions;
    const contextCompleteCount = allSessions.filter(s => s.apiHealth.contextPayloadComplete).length;
    const memoryInjectionCount = allSessions.filter(s => s.apiHealth.memoryInjectionSuccess).length;

    // Field Intelligence
    const fieldSessions = allSessions.filter(s => s.fieldMetadata);
    const avgFieldResonance = fieldSessions.length > 0
      ? fieldSessions.reduce((sum, s) => sum + (s.fieldMetadata?.fieldResonance || 0), 0) / fieldSessions.length
      : 0;

    const emergenceSources: Record<string, number> = {};
    fieldSessions.forEach(s => {
      if (s.fieldMetadata) {
        emergenceSources[s.fieldMetadata.emergenceSource] =
          (emergenceSources[s.fieldMetadata.emergenceSource] || 0) + 1;
      }
    });

    // Beta Validation Metrics
    const totalBrevityScore = allSessions.reduce((sum, s) =>
      sum + s.conversationalRestraint.brevityScore, 0
    );
    const intentionalSilenceCount = allSessions.filter(s =>
      s.conversationalRestraint.wasIntentionalSilence
    ).length;
    const totalWordCount = allSessions.reduce((sum, s) =>
      sum + s.conversationalRestraint.responseWordCount, 0
    );

    const authenticityRatings = allSessions.filter(s =>
      s.perceivedAuthenticity.userRating !== undefined
    );
    const avgAuthenticityRating = authenticityRatings.length > 0
      ? authenticityRatings.reduce((sum, s) => sum + (s.perceivedAuthenticity.userRating || 0), 0) / authenticityRatings.length
      : 0;

    const moreAuthenticCount = allSessions.filter(s =>
      s.perceivedAuthenticity.comparisonToBaseline === 'more_authentic'
    ).length;
    const sameCount = allSessions.filter(s =>
      s.perceivedAuthenticity.comparisonToBaseline === 'same'
    ).length;
    const lessAuthenticCount = allSessions.filter(s =>
      s.perceivedAuthenticity.comparisonToBaseline === 'less_authentic'
    ).length;
    const totalComparisons = moreAuthenticCount + sameCount + lessAuthenticCount;

    const totalBreakthroughs = allProfiles.reduce((sum, p) =>
      sum + p.breakthroughMoments.length, 0
    );

    // Dual-Track Comparison Metrics
    const sesameSessions = allSessions.filter(s => s.systemMode === 'sesame_hybrid');
    const fieldSessions2 = allSessions.filter(s => s.systemMode === 'field_system');

    const calculateModeMetrics = (sessions: MaiaSessionContext[]) => {
      if (sessions.length === 0) return {
        sessionCount: 0,
        averageRestraint: 0,
        averageAuthenticity: 0,
        breakthroughRate: 0,
        averageWordCount: 0,
        userSatisfaction: 0
      };

      const restraint = sessions.reduce((sum, s) => sum + s.conversationalRestraint.brevityScore, 0) / sessions.length;
      const authRatings = sessions.filter(s => s.perceivedAuthenticity.userRating);
      const avgAuth = authRatings.length > 0
        ? authRatings.reduce((sum, s) => sum + (s.perceivedAuthenticity.userRating || 0), 0) / authRatings.length / 5
        : 0;
      const breakthroughs = sessions.filter(s => s.breakthroughMoment).length / sessions.length;
      const wordCount = sessions.reduce((sum, s) => sum + s.conversationalRestraint.responseWordCount, 0) / sessions.length;
      const satisfaction = authRatings.reduce((sum, s) => sum + (s.perceivedAuthenticity.userRating || 0), 0) / Math.max(authRatings.length, 1);

      return {
        sessionCount: sessions.length,
        averageRestraint: restraint,
        averageAuthenticity: avgAuth,
        breakthroughRate: breakthroughs,
        averageWordCount: wordCount,
        userSatisfaction: satisfaction
      };
    };

    const sesameMetrics = calculateModeMetrics(sesameSessions);
    const fieldMetrics = {
      ...calculateModeMetrics(fieldSessions2),
      silenceRate: fieldSessions2.length > 0
        ? fieldSessions2.filter(s => s.conversationalRestraint.wasIntentionalSilence).length / fieldSessions2.length
        : 0,
      fieldCollapseRate: 0 // TODO: Track this explicitly when coherence gate fails
    };

    // Mode switching behavior
    const usersSwitched = allProfiles.filter(p => p.modeSwitchCount > 0).length;
    const totalSwitches = allProfiles.reduce((sum, p) => sum + p.modeSwitchCount, 0);

    const sesameToField = allProfiles.reduce((count, p) => {
      const userSessions = this.sessions.get(p.userId) || [];
      let switches = 0;
      for (let i = 1; i < userSessions.length; i++) {
        if (userSessions[i-1].systemMode === 'sesame_hybrid' && userSessions[i].systemMode === 'field_system') {
          switches++;
        }
      }
      return count + switches;
    }, 0);

    const fieldToSesame = allProfiles.reduce((count, p) => {
      const userSessions = this.sessions.get(p.userId) || [];
      let switches = 0;
      for (let i = 1; i < userSessions.length; i++) {
        if (userSessions[i-1].systemMode === 'field_system' && userSessions[i].systemMode === 'sesame_hybrid') {
          switches++;
        }
      }
      return count + switches;
    }, 0);

    const preferSesame = allProfiles.filter(p => p.preferredMode === 'sesame_hybrid').length;
    const preferField = allProfiles.filter(p => p.preferredMode === 'field_system').length;
    const noPreference = allProfiles.filter(p => !p.preferredMode).length;

    this.systemMetrics = {
      nameRetentionRate: totalSessions > 0 ? nameUsedCount / totalSessions : 0,
      nameReaskRate: totalSessions > 0 ? nameReaskCount / totalSessions : 0,
      sessionLinkingRate: totalSessions > 0 ? sessionLinkedCount / totalSessions : 0,
      averageMemoryDepth: totalSessions > 0
        ? (totalThemesRecalled + totalSymbolsRecalled) / totalSessions
        : 0,
      contextRecallRate: totalSessions > 0 ? contextRecallCount / totalSessions : 0,
      narrativeConsistency: this.calculateNarrativeConsistency(allProfiles),
      elementalAdaptationRate: totalSessions > 0 ? elementalAdaptationCount / totalSessions : 0,
      archetypeDetectionRate: totalSessions > 0 ? archetypeDetectedCount / totalSessions : 0,
      toneEvolutionScore: this.calculateToneEvolution(allSessions),
      averageResponseTime: avgResponseTime,
      contextPayloadCompleteness: totalSessions > 0 ? contextCompleteCount / totalSessions : 0,
      memoryInjectionSuccessRate: totalSessions > 0 ? memoryInjectionCount / totalSessions : 0,
      apiHealthScore: this.calculateApiHealthScore(allSessions),
      fieldResonanceAverage: avgFieldResonance,
      sacredThresholdTriggered: fieldSessions.filter(s =>
        s.fieldMetadata?.sacredThreshold && s.fieldMetadata.sacredThreshold > 0.8
      ).length,
      emergenceSourceDistribution: emergenceSources,
      // Beta Validation
      averageConversationalRestraint: totalSessions > 0 ? totalBrevityScore / totalSessions : 0,
      intentionalSilenceRate: totalSessions > 0 ? intentionalSilenceCount / totalSessions : 0,
      averageWordCount: totalSessions > 0 ? totalWordCount / totalSessions : 0,
      averageAuthenticityRating: avgAuthenticityRating,
      authenticityVsBaseline: {
        moreAuthenticPercent: totalComparisons > 0 ? (moreAuthenticCount / totalComparisons) * 100 : 0,
        samePercent: totalComparisons > 0 ? (sameCount / totalComparisons) * 100 : 0,
        lessAuthenticPercent: totalComparisons > 0 ? (lessAuthenticCount / totalComparisons) * 100 : 0
      },
      breakthroughRate: totalSessions > 0 ? totalBreakthroughs / totalSessions : 0,
      // Dual-Track A/B Comparison
      sesameHybrid: sesameMetrics,
      fieldSystem: fieldMetrics,
      modeSwitchingBehavior: {
        usersSwitched,
        averageSwitchesPerUser: usersSwitched > 0 ? totalSwitches / usersSwitched : 0,
        sesameToFieldSwitches: sesameToField,
        fieldToSesameSwitches: fieldToSesame
      },
      userPreference: {
        preferSesame,
        preferField,
        noPreference
      }
    };

    return this.systemMetrics;
  }

  private calculateNarrativeConsistency(profiles: MaiaUserProfile[]): number {
    // Measure how consistent narrative threads are across sessions
    let consistencySum = 0;
    let profileCount = 0;

    profiles.forEach(profile => {
      if (profile.narrativeThreads.length > 0) {
        // Simple heuristic: more threads = more consistent narrative
        consistencySum += Math.min(profile.narrativeThreads.length / 5, 1);
        profileCount++;
      }
    });

    return profileCount > 0 ? consistencySum / profileCount : 0;
  }

  private calculateToneEvolution(sessions: MaiaSessionContext[]): number {
    // Measure how well MAIA evolves tone over time
    let evolutionSum = 0;
    let sessionCount = 0;

    sessions.forEach(session => {
      if (session.evolutionTracking.toneAdaptation) {
        evolutionSum += 1;
      }
      sessionCount++;
    });

    return sessionCount > 0 ? evolutionSum / sessionCount : 0;
  }

  private calculateApiHealthScore(sessions: MaiaSessionContext[]): number {
    // Composite score based on response time, context quality, memory injection
    let healthSum = 0;

    sessions.forEach(session => {
      let score = 1;

      // Response time penalty
      if (session.apiHealth.responseTimeMs > 3000) score -= 0.3;
      else if (session.apiHealth.responseTimeMs > 2000) score -= 0.1;

      // Context payload penalty
      if (!session.apiHealth.contextPayloadComplete) score -= 0.3;

      // Memory injection penalty
      if (!session.apiHealth.memoryInjectionSuccess) score -= 0.2;

      // Prompt quality bonus/penalty
      if (session.apiHealth.claudePromptQuality === 'excellent') score += 0.1;
      else if (session.apiHealth.claudePromptQuality === 'poor') score -= 0.2;

      healthSum += Math.max(0, score);
    });

    return sessions.length > 0 ? healthSum / sessions.length : 0;
  }

  // === USER INSIGHTS ===

  getUserInsights(userId: string): any {
    const profile = this.profiles.get(userId);
    const sessions = this.sessions.get(userId) || [];

    if (!profile) return null;

    const recentSessions = sessions.slice(-5);
    const latestSession = sessions[sessions.length - 1];

    return {
      userId: profile.userId,
      userName: profile.userName,
      totalSessions: profile.totalSessions,
      firstSeen: profile.firstSeen,
      lastSeen: profile.lastSeen,

      // Identity Health
      nameRetention: {
        score: profile.nameRetentionScore,
        timesAskedFor: profile.nameAskedForCount,
        currentlyUsing: latestSession?.userNameUsed || false
      },

      // Memory Performance
      narrativeThreads: profile.narrativeThreads,
      recentInsights: profile.archivedInsights.slice(-3),
      memoryDepthScore: profile.memoryDepthScore,

      // Archetypal Journey
      currentArchetype: latestSession?.archetypeDetected,
      archetypeEvolution: profile.archetypeHistory.slice(-5),
      breakthroughs: profile.breakthroughMoments.length,

      // Elemental Journey
      currentElement: latestSession?.elementalMode,
      elementalHistory: profile.elementalHistory.slice(-7),
      currentPhase: profile.currentSpiralogicPhase,

      // Recent Session Quality
      recentSessions: recentSessions.map(s => ({
        date: s.timestamp,
        contextRecalled: s.priorContextRecalled,
        archetypeDetected: s.archetypeDetected,
        responseTime: s.apiHealth.responseTimeMs,
        breakthrough: s.breakthroughMoment
      })),

      // Quality Scores
      responseQuality: profile.averageResponseQuality,
      adaptationScore: profile.adaptationScore,

      // Recommendations
      suggestions: this.generateSuggestions(profile, recentSessions)
    };
  }

  private generateSuggestions(profile: MaiaUserProfile, recentSessions: MaiaSessionContext[]): string[] {
    const suggestions: string[] = [];

    // Name retention check
    if (profile.nameAskedForCount > 1) {
      suggestions.push('🚨 CRITICAL: MAIA is re-asking for name - fix userName passing');
    }

    // Memory depth check
    const avgMemoryRecall = recentSessions.reduce((sum, s) =>
      sum + s.memoryDepth.recalledThemes.length + s.memoryDepth.recalledSymbols.length, 0
    ) / recentSessions.length;

    if (avgMemoryRecall < 1) {
      suggestions.push('⚠️ Low memory recall - enhance context injection');
    }

    // Archetype detection
    const archetypeDetectionRate = recentSessions.filter(s => s.archetypeDetected).length / recentSessions.length;
    if (archetypeDetectionRate < 0.3) {
      suggestions.push('💡 Low archetype detection - consider enhancing archetypal awareness');
    }

    // Response time
    const avgResponseTime = recentSessions.reduce((sum, s) =>
      sum + s.apiHealth.responseTimeMs, 0
    ) / recentSessions.length;

    if (avgResponseTime > 2500) {
      suggestions.push('⏱️ Slow response times - optimize API calls');
    }

    // Breakthrough moments
    if (profile.breakthroughMoments.length === 0 && profile.totalSessions > 5) {
      suggestions.push('✨ No breakthroughs detected - may need deeper exploration prompts');
    }

    return suggestions;
  }

  // === EXPORT ===

  exportMaiaReport(): string {
    const metrics = this.generateSystemMetrics();
    const date = new Date().toISOString().split('T')[0];

    return `# MAIA Functionality Report - ${date}

## 🎯 Identity & Continuity
- **Name Retention Rate**: ${(metrics.nameRetentionRate * 100).toFixed(1)}%
- **Name Re-ask Rate**: ${(metrics.nameReaskRate * 100).toFixed(1)}% ${metrics.nameReaskRate > 0.01 ? '🚨 CRITICAL' : '✅'}
- **Session Linking Rate**: ${(metrics.sessionLinkingRate * 100).toFixed(1)}%

## 🧠 Memory Performance
- **Average Memory Depth**: ${metrics.averageMemoryDepth.toFixed(2)} items per session
- **Context Recall Rate**: ${(metrics.contextRecallRate * 100).toFixed(1)}%
- **Narrative Consistency**: ${(metrics.narrativeConsistency * 100).toFixed(1)}%

## 🎭 Adaptation & Awareness
- **Elemental Adaptation Rate**: ${(metrics.elementalAdaptationRate * 100).toFixed(1)}%
- **Archetype Detection Rate**: ${(metrics.archetypeDetectionRate * 100).toFixed(1)}%
- **Tone Evolution Score**: ${(metrics.toneEvolutionScore * 100).toFixed(1)}%

## ⚙️ Technical Health
- **Average Response Time**: ${metrics.averageResponseTime.toFixed(0)}ms
- **Context Payload Completeness**: ${(metrics.contextPayloadCompleteness * 100).toFixed(1)}%
- **Memory Injection Success**: ${(metrics.memoryInjectionSuccessRate * 100).toFixed(1)}%
- **Overall API Health**: ${(metrics.apiHealthScore * 100).toFixed(1)}%

## 🌀 Field Intelligence
- **Field Resonance Average**: ${metrics.fieldResonanceAverage.toFixed(2)}
- **Sacred Threshold Triggered**: ${metrics.sacredThresholdTriggered} times
- **Emergence Sources**:
${Object.entries(metrics.emergenceSourceDistribution)
  .map(([source, count]) => `  - ${source}: ${count}`)
  .join('\n')}

## 🎯 Beta Validation Metrics (Overall)
- **Conversational Restraint Score**: ${(metrics.averageConversationalRestraint * 100).toFixed(1)}%
- **Intentional Silence Rate**: ${(metrics.intentionalSilenceRate * 100).toFixed(1)}%
- **Average Word Count**: ${metrics.averageWordCount.toFixed(1)} words
- **Average Authenticity Rating**: ${metrics.averageAuthenticityRating.toFixed(2)}/5
- **Authenticity vs Baseline**:
  - More Authentic: ${metrics.authenticityVsBaseline.moreAuthenticPercent.toFixed(1)}%
  - Same: ${metrics.authenticityVsBaseline.samePercent.toFixed(1)}%
  - Less Authentic: ${metrics.authenticityVsBaseline.lessAuthenticPercent.toFixed(1)}%
- **Breakthrough Rate**: ${metrics.breakthroughRate.toFixed(2)} per session

## 🔬 Dual-Track A/B Comparison

### Sesame Hybrid (Baseline)
- **Sessions**: ${metrics.sesameHybrid.sessionCount}
- **Restraint Score**: ${(metrics.sesameHybrid.averageRestraint * 100).toFixed(1)}%
- **Authenticity**: ${(metrics.sesameHybrid.averageAuthenticity * 100).toFixed(1)}%
- **Breakthrough Rate**: ${metrics.sesameHybrid.breakthroughRate.toFixed(2)} per session
- **Avg Word Count**: ${metrics.sesameHybrid.averageWordCount.toFixed(1)} words
- **User Satisfaction**: ${metrics.sesameHybrid.userSatisfaction.toFixed(2)}/5

### Field System (Experimental)
- **Sessions**: ${metrics.fieldSystem.sessionCount}
- **Restraint Score**: ${(metrics.fieldSystem.averageRestraint * 100).toFixed(1)}%
- **Authenticity**: ${(metrics.fieldSystem.averageAuthenticity * 100).toFixed(1)}%
- **Breakthrough Rate**: ${metrics.fieldSystem.breakthroughRate.toFixed(2)} per session
- **Avg Word Count**: ${metrics.fieldSystem.averageWordCount.toFixed(1)} words
- **Silence Rate**: ${(metrics.fieldSystem.silenceRate * 100).toFixed(1)}%
- **Field Collapse Rate**: ${(metrics.fieldSystem.fieldCollapseRate * 100).toFixed(1)}%
- **User Satisfaction**: ${metrics.fieldSystem.userSatisfaction.toFixed(2)}/5

### Performance Delta (Field vs Sesame)
- **Restraint**: ${metrics.fieldSystem.sessionCount > 0 ? ((metrics.fieldSystem.averageRestraint - metrics.sesameHybrid.averageRestraint) * 100).toFixed(1) : '0.0'}% ${metrics.fieldSystem.averageRestraint > metrics.sesameHybrid.averageRestraint ? '📈' : '📉'}
- **Authenticity**: ${metrics.fieldSystem.sessionCount > 0 ? ((metrics.fieldSystem.averageAuthenticity - metrics.sesameHybrid.averageAuthenticity) * 100).toFixed(1) : '0.0'}% ${metrics.fieldSystem.averageAuthenticity > metrics.sesameHybrid.averageAuthenticity ? '📈' : '📉'}
- **Breakthroughs**: ${metrics.fieldSystem.sessionCount > 0 ? ((metrics.fieldSystem.breakthroughRate / Math.max(metrics.sesameHybrid.breakthroughRate, 0.001) - 1) * 100).toFixed(1) : '0.0'}% ${metrics.fieldSystem.breakthroughRate > metrics.sesameHybrid.breakthroughRate ? '📈' : '📉'}

## 🔀 Mode Switching Behavior
- **Users Who Switched**: ${metrics.modeSwitchingBehavior.usersSwitched}
- **Avg Switches per User**: ${metrics.modeSwitchingBehavior.averageSwitchesPerUser.toFixed(2)}
- **Sesame → Field**: ${metrics.modeSwitchingBehavior.sesameToFieldSwitches}
- **Field → Sesame**: ${metrics.modeSwitchingBehavior.fieldToSesameSwitches}

## 👥 User Preference
- **Prefer Sesame**: ${metrics.userPreference.preferSesame} users
- **Prefer Field**: ${metrics.userPreference.preferField} users
- **No Preference**: ${metrics.userPreference.noPreference} users

---
Generated: ${new Date().toISOString()}

## 🎯 Action Items
${this.generateActionItems(metrics)}
`;
  }

  private generateActionItems(metrics: MaiaSystemMetrics): string {
    const items: string[] = [];

    if (metrics.nameReaskRate > 0.01) {
      items.push('🚨 CRITICAL: Fix userName passing in API - users being asked for name repeatedly');
    }

    if (metrics.contextRecallRate < 0.5) {
      items.push('⚠️ Enhance memory injection - context recall below 50%');
    }

    if (metrics.elementalAdaptationRate < 0.6) {
      items.push('💡 Improve elemental adaptation logic');
    }

    if (metrics.averageResponseTime > 2500) {
      items.push('⏱️ Optimize API response time');
    }

    if (metrics.apiHealthScore < 0.8) {
      items.push('🔧 Investigate API health issues - score below 80%');
    }

    return items.length > 0 ? items.join('\n') : '✅ All systems operating within acceptable parameters';
  }
}

// Singleton instance
export const maiaMonitoring = new MaiaMonitoring();