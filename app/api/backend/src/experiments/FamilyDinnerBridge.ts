/**
 * Family Dinner Bridge Experiment
 * The first SoulLab experiment - transforming dinner chaos into connection
 */

import { logger } from '../utils/logger';
import { storeMemoryItem, getRelevantMemories } from '../services/memoryService';
import { mayaOrchestrator } from '../oracle/core/MayaOrchestrator';

interface BridgeQuestion {
  day: number;
  question: string;
  category: 'playful' | 'reflective' | 'imaginative' | 'gratitude' | 'dreams';
  ageVariants: {
    child: string;      // 5-11 years
    teen: string;       // 12-17 years
    adult: string;      // 18+ years
  };
  followUps: string[];
}

interface DinnerSession {
  experimentId: string;
  familyId: string;
  day: number;
  date: string;
  question: BridgeQuestion;
  responses: FamilyResponse[];
  metrics: SessionMetrics;
  insights: string[];
  timestamp: number;
}

interface FamilyResponse {
  memberId: string;
  memberAge: number;
  response: string;
  emotionalTone: 'engaged' | 'resistant' | 'neutral' | 'enthusiastic';
  surpriseLevel: number;  // 1-5
  connectionMoments: string[];
}

interface SessionMetrics {
  conflictLevel: number;       // 0-10 scale
  genuineLaughs: number;       // Count
  voluntarySharing: number;    // Beyond the question
  teenEngagement: number;      // 0-10 scale
  overallConnection: number;   // 0-10 scale
  dinnerDuration: number;      // Minutes
  phonesPresent: boolean;
  tvOn: boolean;
}

interface ExperimentProgress {
  familyId: string;
  startDate: string;
  currentDay: number;
  sessionsCompleted: number;
  patterns: EmergingPattern[];
  breakthroughs: string[];
  challenges: string[];
  mayaInsights: string[];
}

interface EmergingPattern {
  type: 'connection' | 'resistance' | 'growth' | 'surprise';
  description: string;
  frequency: number;
  members: string[];
}

export class FamilyDinnerBridge {
  private readonly EXPERIMENT_DURATION = 21; // days
  private readonly questions: BridgeQuestion[] = this.generateQuestions();
  private activeExperiments: Map<string, ExperimentProgress> = new Map();

  /**
   * Start a new Family Dinner Bridge experiment
   */
  async startExperiment(
    familyId: string,
    familyMembers: Array<{ id: string; name: string; age: number; role: string }>
  ): Promise<{
    experimentId: string;
    welcomeMessage: string;
    firstQuestion: BridgeQuestion;
    setupInstructions: string[];
  }> {
    const experimentId = `FDB_${familyId}_${Date.now()}`;

    logger.info('Starting Family Dinner Bridge experiment', {
      experimentId,
      familyId,
      memberCount: familyMembers.length
    });

    // Initialize experiment progress
    const progress: ExperimentProgress = {
      familyId,
      startDate: new Date().toISOString(),
      currentDay: 1,
      sessionsCompleted: 0,
      patterns: [],
      breakthroughs: [],
      challenges: [],
      mayaInsights: []
    };

    this.activeExperiments.set(experimentId, progress);

    // Store in memory
    await storeMemoryItem(familyId, 'EXPERIMENT_START', {
      type: 'family_dinner_bridge',
      experimentId,
      familyMembers,
      startDate: progress.startDate
    });

    // Get Maya's welcome
    const welcomeMessage = await this.getMayaWelcome(familyMembers);
    const firstQuestion = this.questions[0];
    const setupInstructions = this.getSetupInstructions();

    return {
      experimentId,
      welcomeMessage,
      firstQuestion,
      setupInstructions
    };
  }

  /**
   * Record tonight's dinner session
   */
  async recordDinnerSession(
    experimentId: string,
    responses: FamilyResponse[],
    metrics: SessionMetrics
  ): Promise<{
    insights: string[];
    mayaReflection: string;
    tomorrowsQuestion: BridgeQuestion | null;
    emergingPattern: string | null;
  }> {
    const progress = this.activeExperiments.get(experimentId);
    if (!progress) {
      throw new Error('Experiment not found');
    }

    const session: DinnerSession = {
      experimentId,
      familyId: progress.familyId,
      day: progress.currentDay,
      date: new Date().toISOString(),
      question: this.questions[progress.currentDay - 1],
      responses,
      metrics,
      insights: [],
      timestamp: Date.now()
    };

    // Analyze session
    const insights = await this.analyzeSession(session, progress);
    session.insights = insights;

    // Update progress
    progress.sessionsCompleted++;
    progress.currentDay++;

    // Detect patterns
    const emergingPattern = await this.detectPatterns(experimentId, session);
    if (emergingPattern) {
      progress.patterns.push(emergingPattern);
    }

    // Get Maya's reflection
    const mayaReflection = await this.getMayaReflection(session, progress);
    progress.mayaInsights.push(mayaReflection);

    // Store session
    await storeMemoryItem(progress.familyId, 'DINNER_SESSION', session);

    // Get tomorrow's question
    const tomorrowsQuestion = progress.currentDay <= this.EXPERIMENT_DURATION
      ? this.questions[progress.currentDay - 1]
      : null;

    return {
      insights,
      mayaReflection,
      tomorrowsQuestion,
      emergingPattern: emergingPattern?.description || null
    };
  }

  /**
   * Generate 21 days of bridge questions
   */
  private generateQuestions(): BridgeQuestion[] {
    return [
      // Week 1: Playful Connection
      {
        day: 1,
        question: "What made you laugh today?",
        category: 'playful',
        ageVariants: {
          child: "What was the funniest thing that happened today?",
          teen: "What made you laugh or roll your eyes today?",
          adult: "What brought you joy or amusement today?"
        },
        followUps: ["Who was there?", "What made it funny?"]
      },
      {
        day: 2,
        question: "If you could have any superpower just for tomorrow, what would it be?",
        category: 'imaginative',
        ageVariants: {
          child: "What superpower would you pick for tomorrow?",
          teen: "What ability would make tomorrow easier?",
          adult: "What power would transform your tomorrow?"
        },
        followUps: ["How would you use it?", "Who would you help?"]
      },
      {
        day: 3,
        question: "What's something you're secretly good at?",
        category: 'reflective',
        ageVariants: {
          child: "What are you really good at that people don't know?",
          teen: "What hidden talent do you have?",
          adult: "What skill do you rarely show others?"
        },
        followUps: ["How did you discover it?", "When do you use it?"]
      },
      {
        day: 4,
        question: "What small thing made today better?",
        category: 'gratitude',
        ageVariants: {
          child: "What tiny thing was nice today?",
          teen: "What random thing improved your day?",
          adult: "What unexpected moment brightened today?"
        },
        followUps: ["Why did it matter?", "Who noticed?"]
      },
      {
        day: 5,
        question: "If our family was a team, what would we be called?",
        category: 'playful',
        ageVariants: {
          child: "What's our family team name?",
          teen: "What would our family squad be called?",
          adult: "What name captures our family spirit?"
        },
        followUps: ["What's our team cheer?", "What's our mission?"]
      },
      {
        day: 6,
        question: "What's something you want to learn but haven't started?",
        category: 'dreams',
        ageVariants: {
          child: "What do you really want to learn how to do?",
          teen: "What skill are you putting off learning?",
          adult: "What have you always wanted to master?"
        },
        followUps: ["What's stopping you?", "Who could help?"]
      },
      {
        day: 7,
        question: "When did you feel proud of someone at this table?",
        category: 'gratitude',
        ageVariants: {
          child: "When was someone here really awesome?",
          teen: "When did someone here surprise you in a good way?",
          adult: "What moment made you proud of someone here?"
        },
        followUps: ["Did you tell them?", "How did it feel?"]
      },

      // Week 2: Deeper Connection
      {
        day: 8,
        question: "What's a rule you think our family should break?",
        category: 'playful',
        ageVariants: {
          child: "What family rule is silly?",
          teen: "What family rule needs updating?",
          adult: "What tradition might we reconsider?"
        },
        followUps: ["What would happen?", "What would be better?"]
      },
      {
        day: 9,
        question: "If you could pause time today, when would you have done it?",
        category: 'reflective',
        ageVariants: {
          child: "When would you have stopped time today?",
          teen: "What moment would you have frozen?",
          adult: "What instant deserved more time?"
        },
        followUps: ["Why that moment?", "What would you do?"]
      },
      {
        day: 10,
        question: "What's something you worry about that you've never said?",
        category: 'reflective',
        ageVariants: {
          child: "What worry is in your head?",
          teen: "What's been on your mind?",
          adult: "What concern sits quietly with you?"
        },
        followUps: ["How long has it been there?", "What would help?"]
      },
      {
        day: 11,
        question: "If you could give everyone here one gift (not things), what would it be?",
        category: 'gratitude',
        ageVariants: {
          child: "What special thing would you give everyone?",
          teen: "What would you want everyone to have?",
          adult: "What quality would you bestow on each person?"
        },
        followUps: ["Why that gift?", "How would it help them?"]
      },
      {
        day: 12,
        question: "What's your favorite memory of this kitchen/dining room?",
        category: 'reflective',
        ageVariants: {
          child: "What fun thing happened in this room?",
          teen: "What moment stands out in this space?",
          adult: "What memory lives in these walls?"
        },
        followUps: ["Who was there?", "What made it special?"]
      },
      {
        day: 13,
        question: "If you could change one thing about how our family talks, what would it be?",
        category: 'reflective',
        ageVariants: {
          child: "How could we talk better?",
          teen: "What would make family conversations easier?",
          adult: "What shift in communication would you welcome?"
        },
        followUps: ["What difference would it make?", "How do we start?"]
      },
      {
        day: 14,
        question: "What adventure should our family go on?",
        category: 'dreams',
        ageVariants: {
          child: "Where should we go on an adventure?",
          teen: "What epic trip should we take?",
          adult: "What journey calls to our family?"
        },
        followUps: ["When should we go?", "What would we discover?"]
      },

      // Week 3: Integration
      {
        day: 15,
        question: "What strength does each person bring to our family?",
        category: 'gratitude',
        ageVariants: {
          child: "What makes each person special?",
          teen: "What's everyone's superpower?",
          adult: "What gift does each person offer?"
        },
        followUps: ["How do they show it?", "When do we need it most?"]
      },
      {
        day: 16,
        question: "If our family had a motto, what would it be?",
        category: 'reflective',
        ageVariants: {
          child: "What's our family saying?",
          teen: "What's our family tagline?",
          adult: "What words capture our essence?"
        },
        followUps: ["Why those words?", "How do we live it?"]
      },
      {
        day: 17,
        question: "What's something you've learned from someone at this table?",
        category: 'gratitude',
        ageVariants: {
          child: "What did someone here teach you?",
          teen: "What wisdom did you gain from someone here?",
          adult: "What lesson came from someone at this table?"
        },
        followUps: ["When did you learn it?", "How do you use it?"]
      },
      {
        day: 18,
        question: "If we could add one tradition to our family, what would it be?",
        category: 'dreams',
        ageVariants: {
          child: "What fun thing should we always do?",
          teen: "What tradition would actually be cool?",
          adult: "What ritual would enrich our family?"
        },
        followUps: ["When would we do it?", "Why would it matter?"]
      },
      {
        day: 19,
        question: "What do you hope everyone here remembers about you?",
        category: 'reflective',
        ageVariants: {
          child: "What do you want us to remember?",
          teen: "What mark do you want to leave?",
          adult: "What legacy sits in these hearts?"
        },
        followUps: ["Why that?", "How do you show it?"]
      },
      {
        day: 20,
        question: "What impossible thing should our family try anyway?",
        category: 'dreams',
        ageVariants: {
          child: "What crazy thing should we try?",
          teen: "What impossible mission should we attempt?",
          adult: "What audacious goal should we pursue?"
        },
        followUps: ["What's the first step?", "What would we learn?"]
      },
      {
        day: 21,
        question: "How has our family changed in these three weeks?",
        category: 'reflective',
        ageVariants: {
          child: "What's different about our family now?",
          teen: "What shifted in our family?",
          adult: "What transformation occurred here?"
        },
        followUps: ["What surprised you?", "What should we keep?"]
      }
    ];
  }

  /**
   * Analyze tonight's session for insights
   */
  private async analyzeSession(
    session: DinnerSession,
    progress: ExperimentProgress
  ): Promise<string[]> {
    const insights: string[] = [];

    // Connection quality
    if (session.metrics.overallConnection >= 7) {
      insights.push("Strong connection tonight. The bridge is working.");
    }

    // Teen engagement breakthrough
    if (session.metrics.teenEngagement >= 7 && progress.sessionsCompleted > 0) {
      insights.push("Teen barrier dissolving. Authentic sharing emerging.");
    }

    // Laughter as medicine
    if (session.metrics.genuineLaughs >= 3) {
      insights.push("Laughter created safety. Hearts opened.");
    }

    // Voluntary sharing
    if (session.metrics.voluntarySharing >= 2) {
      insights.push("Beyond the question - spontaneous connection flowing.");
    }

    // Conflict transformation
    if (session.metrics.conflictLevel <= 2) {
      insights.push("Peaceful waters. The question held the space.");
    }

    // Surprise discoveries
    const highSurprise = session.responses.filter(r => r.surpriseLevel >= 4);
    if (highSurprise.length >= 2) {
      insights.push("New facets revealed. Family members seeing each other fresh.");
    }

    // Device freedom
    if (!session.metrics.phonesPresent && !session.metrics.tvOn) {
      insights.push("Full presence achieved. Devices didn't steal the moment.");
    }

    return insights;
  }

  /**
   * Detect emerging patterns across sessions
   */
  private async detectPatterns(
    experimentId: string,
    currentSession: DinnerSession
  ): Promise<EmergingPattern | null> {
    const progress = this.activeExperiments.get(experimentId);
    if (!progress || progress.sessionsCompleted < 3) {
      return null; // Need at least 3 sessions for patterns
    }

    // Get recent sessions from memory
    const recentSessions = await getRelevantMemories(
      progress.familyId,
      `experiment ${experimentId}`,
      5
    );

    // Look for patterns
    if (currentSession.metrics.teenEngagement > 5) {
      const teenEngaging = recentSessions.filter(s =>
        s.content?.metrics?.teenEngagement > 5
      );

      if (teenEngaging.length >= 3) {
        return {
          type: 'growth',
          description: 'Teen opening up consistently. Trust building.',
          frequency: teenEngaging.length,
          members: ['teen']
        };
      }
    }

    // Check for connection momentum
    const avgConnection = recentSessions.reduce((sum, s) =>
      sum + (s.content?.metrics?.overallConnection || 0), 0
    ) / recentSessions.length;

    if (avgConnection >= 6 && currentSession.metrics.overallConnection >= 7) {
      return {
        type: 'connection',
        description: 'Family connection deepening. Sacred space forming.',
        frequency: progress.sessionsCompleted,
        members: ['all']
      };
    }

    // Resistance patterns
    const resistantResponses = currentSession.responses.filter(
      r => r.emotionalTone === 'resistant'
    );
    if (resistantResponses.length >= 2) {
      return {
        type: 'resistance',
        description: 'Protection patterns active. Gentle persistence needed.',
        frequency: 1,
        members: resistantResponses.map(r => r.memberId)
      };
    }

    return null;
  }

  /**
   * Get Maya's reflection on tonight's session
   */
  private async getMayaReflection(
    session: DinnerSession,
    progress: ExperimentProgress
  ): Promise<string> {
    // Determine which aspect to reflect on
    const focus = this.choosReflectionFocus(session);

    const reflections = {
      connection: [
        "Beautiful bridges built tonight. <PAUSE:600> Each answer a thread in the family tapestry.",
        "The question held you all. <PAUSE:800> Notice how presence creates magic.",
        "Connection doesn't need perfection. Tonight proved that."
      ],
      breakthrough: [
        "Something shifted tonight. <PAUSE:600> Did you feel it?",
        "New territory discovered. The familiar became fresh.",
        "Walls became windows. <PAUSE:800> Keep going."
      ],
      challenge: [
        "Resistance is information. <PAUSE:600> What's being protected?",
        "Not every night blooms. Seeds were still planted.",
        "The bridge stands even when crossing feels hard."
      ],
      surprise: [
        "You thought you knew each other. <PAUSE:800> Tonight said otherwise.",
        "Surprises live in simple questions. What else waits?",
        "Family mysteries revealed. <PAUSE:600> There's always more."
      ],
      completion: [
        "21 days complete. <PAUSE:800> You're different now.",
        "The experiment ends. The practice continues. <PAUSE:600> You know how.",
        "From chaos to connection. You built the bridge."
      ]
    };

    // Choose appropriate reflection
    if (progress.currentDay >= 21) {
      return reflections.completion[0];
    }

    const categoryReflections = reflections[focus] || reflections.connection;
    const index = Math.floor(Math.random() * categoryReflections.length);

    return categoryReflections[index];
  }

  /**
   * Choose what Maya should reflect on
   */
  private choosReflectionFocus(session: DinnerSession): string {
    if (session.metrics.overallConnection >= 8) return 'connection';
    if (session.responses.some(r => r.surpriseLevel >= 4)) return 'surprise';
    if (session.metrics.voluntarySharing >= 3) return 'breakthrough';
    if (session.metrics.conflictLevel >= 5) return 'challenge';
    return 'connection';
  }

  /**
   * Get Maya's welcome message
   */
  private async getMayaWelcome(
    familyMembers: Array<{ name: string; age: number; role: string }>
  ): Promise<string> {
    const hasTeens = familyMembers.some(m => m.age >= 12 && m.age < 18);
    const hasYoungKids = familyMembers.some(m => m.age < 12);

    if (hasTeens && hasYoungKids) {
      return "Welcome, family. <PAUSE:800> 21 days of questions. One each dinner. Watch what happens when you simply listen. <PAUSE:600> Ready?";
    } else if (hasTeens) {
      return "Family experiment begins. <PAUSE:600> One question. Everyone answers. Even the eye-rollers. <PAUSE:800> Let's see what emerges.";
    } else if (hasYoungKids) {
      return "Magic questions for 21 dinners. <PAUSE:600> Everyone gets to answer. Even grown-ups. <PAUSE:600> Let the adventure begin.";
    } else {
      return "21 days. One question each dinner. <PAUSE:800> Simple structure. Profound possibility. Begin.";
    }
  }

  /**
   * Get setup instructions for the family
   */
  private getSetupInstructions(): string[] {
    return [
      "Choose a consistent dinner time for 21 days",
      "Phones off or in another room (emergency exceptions okay)",
      "TV and music off during the question",
      "Everyone answers - no skipping (can say 'pass' and come back)",
      "No commenting on others' answers during sharing",
      "After everyone shares, natural conversation can flow",
      "Track what you notice - even tiny shifts matter",
      "If someone misses dinner, ask them the question later",
      "It's okay if some nights feel awkward - keep going",
      "Celebrate making it to day 21 together"
    ];
  }

  /**
   * Get progress summary for a family
   */
  async getProgressSummary(experimentId: string): Promise<{
    daysCompleted: number;
    patternsFound: EmergingPattern[];
    topInsights: string[];
    recommendation: string;
    nextMilestone: string;
  }> {
    const progress = this.activeExperiments.get(experimentId);
    if (!progress) {
      throw new Error('Experiment not found');
    }

    // Get top insights from Maya
    const topInsights = progress.mayaInsights.slice(-3);

    // Generate recommendation
    const recommendation = this.generateRecommendation(progress);

    // Determine next milestone
    const nextMilestone = this.getNextMilestone(progress);

    return {
      daysCompleted: progress.sessionsCompleted,
      patternsFound: progress.patterns,
      topInsights,
      recommendation,
      nextMilestone
    };
  }

  /**
   * Generate recommendation based on progress
   */
  private generateRecommendation(progress: ExperimentProgress): string {
    if (progress.sessionsCompleted < 7) {
      return "Keep going. Week one is about establishing rhythm.";
    } else if (progress.sessionsCompleted < 14) {
      return "Entering deeper territory. Trust the process.";
    } else if (progress.sessionsCompleted < 21) {
      return "Final week. Integration happening. Stay consistent.";
    } else {
      return "Experiment complete! Consider making this a weekly tradition.";
    }
  }

  /**
   * Get next milestone
   */
  private getNextMilestone(progress: ExperimentProgress): string {
    const remaining = this.EXPERIMENT_DURATION - progress.sessionsCompleted;

    if (remaining > 14) {
      return "Complete first week - establish the ritual";
    } else if (remaining > 7) {
      return "Reach day 14 - halfway transformation point";
    } else if (remaining > 0) {
      return `${remaining} days to completion - finish strong`;
    } else {
      return "Experiment complete - choose your next adventure";
    }
  }

  /**
   * Export family's experiment data
   */
  async exportExperimentData(experimentId: string): Promise<{
    summary: any;
    sessions: DinnerSession[];
    patterns: EmergingPattern[];
    transformation: string;
  }> {
    const progress = this.activeExperiments.get(experimentId);
    if (!progress) {
      throw new Error('Experiment not found');
    }

    // Retrieve all sessions from memory
    const sessions = await getRelevantMemories(
      progress.familyId,
      `DINNER_SESSION ${experimentId}`,
      21
    );

    // Create transformation summary
    const transformation = this.summarizeTransformation(progress, sessions);

    return {
      summary: {
        experimentId,
        familyId: progress.familyId,
        duration: this.EXPERIMENT_DURATION,
        completed: progress.sessionsCompleted,
        startDate: progress.startDate,
        endDate: progress.currentDay >= 21 ? new Date().toISOString() : null
      },
      sessions: sessions.map(s => s.content),
      patterns: progress.patterns,
      transformation
    };
  }

  /**
   * Summarize the family transformation
   */
  private summarizeTransformation(
    progress: ExperimentProgress,
    sessions: any[]
  ): string {
    if (progress.sessionsCompleted < 21) {
      return "Transformation in progress. Each dinner adds a thread.";
    }

    // Calculate metrics change
    const firstWeek = sessions.slice(0, 7);
    const lastWeek = sessions.slice(-7);

    const firstWeekConnection = firstWeek.reduce((sum, s) =>
      sum + (s.content?.metrics?.overallConnection || 0), 0
    ) / firstWeek.length;

    const lastWeekConnection = lastWeek.reduce((sum, s) =>
      sum + (s.content?.metrics?.overallConnection || 0), 0
    ) / lastWeek.length;

    const connectionGrowth = ((lastWeekConnection - firstWeekConnection) / firstWeekConnection * 100).toFixed(0);

    return `Family connection increased ${connectionGrowth}%. ` +
           `${progress.patterns.length} patterns discovered. ` +
           `${progress.breakthroughs.length} breakthrough moments. ` +
           `The dinner table became sacred space.`;
  }
}

// Export singleton
export const familyDinnerBridge = new FamilyDinnerBridge();