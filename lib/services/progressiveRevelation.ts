// Progressive Revelation System
// Maps to the Hero's Journey and Inner Gold reclamation process
// Gradually introduces complexity as users demonstrate readiness
// Supports the natural spiral: Known → Unknown → New Known
// See: INNER_GOLD_FRAMEWORK.md for complete theoretical foundation

export type ContentLevel =
  | 'companion'           // Day 1-3: Simple, human connection
  | 'pattern_noter'       // Day 3-7: Gentle pattern observation
  | 'gentle_guide'        // Week 2: Supportive guidance
  | 'experiment_partner'  // Week 3-4: Testing ideas together
  | 'lab_collaborator'    // Month 2+: Full mythic lab language
  | 'adaptive';           // Fluid between levels

export type VocabularyComfort =
  | 'basic'      // Prefers simple, everyday language
  | 'exploring'  // Open to some complexity
  | 'advanced';  // Embraces full depth

export interface UserReadiness {
  userId: string;
  daysActive: number;
  sessionCount: number;
  totalMinutesEngaged: number;
  engagementDepth: number; // 0-1
  vocabularyComfort: VocabularyComfort;
  conceptsIntroduced: string[];
  conceptsEmbraced: string[];
  conceptsRejected: string[];
  resistancePoints: string[];
  currentLevel: ContentLevel;
  languageBlend: number; // Current blend ratio
  lastSessionDate: Date;
}

export interface ReadinessSignal {
  signal: string;
  detected: boolean;
  strength: number; // 0-1
  timestamp: Date;
}

export class ProgressiveRevelationService {

  /**
   * Determine appropriate content level for user
   */
  getContentLevel(readiness: UserReadiness): ContentLevel {
    // Safety first - if showing resistance, pull back
    if (this.detectOverwhelm(readiness)) {
      return this.pullBackLevel(readiness.currentLevel);
    }

    // Early days - always start simple
    if (readiness.daysActive < 3) return 'companion';

    // Gradual progression based on engagement
    if (readiness.daysActive < 7) {
      return readiness.engagementDepth > 0.6 ? 'pattern_noter' : 'companion';
    }

    if (readiness.daysActive < 14) {
      return readiness.engagementDepth > 0.6 ? 'gentle_guide' : 'pattern_noter';
    }

    if (readiness.daysActive < 30) {
      if (readiness.engagementDepth > 0.7 && readiness.vocabularyComfort !== 'basic') {
        return 'experiment_partner';
      }
      return 'gentle_guide';
    }

    // Month+ users with high engagement can access full depth
    if (readiness.engagementDepth > 0.75 && readiness.vocabularyComfort === 'advanced') {
      return 'lab_collaborator';
    }

    // Adaptive mode - fluid between levels
    return 'adaptive';
  }

  /**
   * Check if user is ready for a specific concept
   */
  shouldIntroduceConcept(concept: string, readiness: UserReadiness): boolean {
    // Never introduce if previously rejected
    if (readiness.conceptsRejected.includes(concept)) {
      return false;
    }

    // Already introduced and embraced - can use freely
    if (readiness.conceptsEmbraced.includes(concept)) {
      return true;
    }

    // Check prerequisites and readiness
    const readinessMap: Record<string, boolean> = {
      // Week 1 concepts
      'patterns': readiness.daysActive >= 3 && readiness.sessionCount >= 2,
      'observation': readiness.daysActive >= 3,

      // Week 2 concepts
      'experiments': readiness.daysActive >= 7 && readiness.engagementDepth > 0.5,
      'tracking': readiness.conceptsEmbraced.includes('patterns'),

      // Week 3-4 concepts
      'alchemy': readiness.daysActive >= 21 && readiness.vocabularyComfort !== 'basic',
      'transformation': readiness.conceptsEmbraced.includes('experiments'),

      // Month+ concepts
      'archetypes': readiness.daysActive >= 30 && readiness.conceptsEmbraced.includes('patterns'),
      'collective_field': readiness.daysActive >= 30 && readiness.engagementDepth > 0.7,
      'reality_creation': readiness.daysActive >= 21 && readiness.conceptsEmbraced.includes('experiments'),
      'shadow_work': readiness.daysActive >= 30 && readiness.vocabularyComfort === 'advanced',

      // Advanced concepts (require foundation)
      'nigredo': readiness.conceptsEmbraced.includes('alchemy'),
      'lab_metaphor': readiness.daysActive >= 30 && readiness.engagementDepth > 0.75,
      'council': readiness.conceptsEmbraced.includes('archetypes')
    };

    return readinessMap[concept] || false;
  }

  /**
   * Detect readiness signals in user behavior
   */
  detectReadinessSignals(
    messages: string[],
    sessionMetrics: { length: number; depth: number }
  ): ReadinessSignal[] {
    const signals: ReadinessSignal[] = [];

    // Signal: Seeking patterns
    const patternWords = ['always', 'never', 'every time', 'why does this keep', 'pattern'];
    const seekingPatterns = messages.some(m =>
      patternWords.some(word => m.toLowerCase().includes(word))
    );
    if (seekingPatterns) {
      signals.push({
        signal: 'seeking_patterns',
        detected: true,
        strength: 0.8,
        timestamp: new Date()
      });
    }

    // Signal: Openness to growth
    const growthWords = ['want to change', 'ready to', 'help me', 'how can i'];
    const openToGrowth = messages.some(m =>
      growthWords.some(word => m.toLowerCase().includes(word))
    );
    if (openToGrowth) {
      signals.push({
        signal: 'open_to_growth',
        detected: true,
        strength: 0.7,
        timestamp: new Date()
      });
    }

    // Signal: Asking deeper questions
    const deeperWords = ['why', 'meaning', 'purpose', 'what does this mean'];
    const asksDeeper = messages.some(m =>
      deeperWords.some(word => m.toLowerCase().includes(word))
    );
    if (asksDeeper) {
      signals.push({
        signal: 'asks_deeper',
        detected: true,
        strength: 0.6,
        timestamp: new Date()
      });
    }

    // Signal: Trust established (behavioral)
    if (sessionMetrics.length > 10 && sessionMetrics.depth > 0.6) {
      signals.push({
        signal: 'trust_established',
        detected: true,
        strength: 0.9,
        timestamp: new Date()
      });
    }

    // Signal: Embracing complexity
    const complexWords = ['interesting', 'fascinating', 'tell me more about'];
    const embracingComplexity = messages.some(m =>
      complexWords.some(word => m.toLowerCase().includes(word))
    );
    if (embracingComplexity) {
      signals.push({
        signal: 'embracing_complexity',
        detected: true,
        strength: 0.7,
        timestamp: new Date()
      });
    }

    return signals;
  }

  /**
   * Detect overwhelm signals
   */
  detectOverwhelm(readiness: UserReadiness): boolean {
    const overwhelmSignals = [
      // Engagement dropping
      readiness.engagementDepth < 0.4,

      // Vocabulary simplifying (if was higher before)
      readiness.vocabularyComfort === 'basic' && readiness.conceptsIntroduced.length > 3,

      // Multiple rejections
      readiness.conceptsRejected.length > 2,

      // Resistance points accumulating
      readiness.resistancePoints.length > 1
    ];

    const overwhelmCount = overwhelmSignals.filter(Boolean).length;
    return overwhelmCount >= 2;
  }

  /**
   * Pull back complexity level
   */
  pullBackLevel(currentLevel: ContentLevel): ContentLevel {
    const levelHierarchy: ContentLevel[] = [
      'companion',
      'pattern_noter',
      'gentle_guide',
      'experiment_partner',
      'lab_collaborator'
    ];

    const currentIndex = levelHierarchy.indexOf(currentLevel);
    const pulledBackIndex = Math.max(0, currentIndex - 1);

    return levelHierarchy[pulledBackIndex];
  }

  /**
   * Get language adjustments for content level
   */
  getLanguageAdjustments(level: ContentLevel): {
    blendAdjustment: number;
    conceptsAllowed: string[];
    tone: string;
  } {
    const adjustments = {
      companion: {
        blendAdjustment: -0.3, // Pull toward simple/scientific
        conceptsAllowed: ['basic_reflection', 'simple_questions'],
        tone: 'warm, human, simple'
      },
      pattern_noter: {
        blendAdjustment: -0.2,
        conceptsAllowed: ['patterns', 'observation', 'noticing'],
        tone: 'curious, gentle, observant'
      },
      gentle_guide: {
        blendAdjustment: -0.1,
        conceptsAllowed: ['patterns', 'experiments', 'tracking', 'guidance'],
        tone: 'supportive, encouraging, collaborative'
      },
      experiment_partner: {
        blendAdjustment: 0, // Honor user preference
        conceptsAllowed: ['experiments', 'tracking', 'correlation', 'hypothesis'],
        tone: 'collaborative, curious, experimental'
      },
      lab_collaborator: {
        blendAdjustment: 0.1, // Allow slightly more depth
        conceptsAllowed: ['all_concepts', 'alchemy', 'archetypes', 'lab_language'],
        tone: 'co-creative, deep, sacred-scientific'
      },
      adaptive: {
        blendAdjustment: 0,
        conceptsAllowed: ['adaptive_to_moment'],
        tone: 'fluid, responsive, attuned'
      }
    };

    return adjustments[level];
  }

  /**
   * Log concept introduction attempt
   */
  logConceptIntroduction(
    userId: string,
    concept: string,
    userResponse: 'embraced' | 'neutral' | 'rejected'
  ): void {
    console.log(`[Progressive Revelation] User ${userId}: ${concept} → ${userResponse}`);
    // TODO: Store in database for learning
  }

  /**
   * Adapt based on user's response to new concept
   */
  async adaptToResponse(
    userId: string,
    concept: string,
    userMessage: string
  ): Promise<'embraced' | 'neutral' | 'rejected'> {
    const lowerMessage = userMessage.toLowerCase();

    // Embrace signals
    const embraceWords = ['yes', 'interesting', 'tell me more', 'i like', 'that resonates'];
    if (embraceWords.some(word => lowerMessage.includes(word))) {
      this.logConceptIntroduction(userId, concept, 'embraced');
      return 'embraced';
    }

    // Rejection signals
    const rejectWords = ['confused', 'don\'t understand', 'too much', 'complicated', 'weird'];
    if (rejectWords.some(word => lowerMessage.includes(word))) {
      this.logConceptIntroduction(userId, concept, 'rejected');
      return 'rejected';
    }

    // Neutral - continue observing
    this.logConceptIntroduction(userId, concept, 'neutral');
    return 'neutral';
  }

  /**
   * Generate appropriate greeting for content level
   */
  getGreeting(level: ContentLevel, userName: string, timeOfDay: string): string {
    const greetings = {
      companion: [
        `Hi ${userName}. How are you today?`,
        `Hello ${userName}. What's on your mind?`,
        `Hey ${userName}. Good to see you.`
      ],
      pattern_noter: [
        `Welcome back, ${userName}. What's present for you today?`,
        `Hi ${userName}. I've been thinking about what you shared last time.`,
        `Hello ${userName}. Ready to explore more?`
      ],
      gentle_guide: [
        `${timeOfDay}, ${userName}. How did things unfold since we last spoke?`,
        `Welcome back, ${userName}. Shall we pick up where we left off?`,
        `Hi ${userName}. What patterns are you noticing today?`
      ],
      experiment_partner: [
        `${timeOfDay}, ${userName}. How's our experiment going?`,
        `Welcome back to the work, ${userName}. What data points emerged?`,
        `Hey ${userName}. Ready to test another hypothesis?`
      ],
      lab_collaborator: [
        `${timeOfDay}, sacred scientist. What are we exploring today?`,
        `Welcome back to the lab, ${userName}. Your field shows interesting dynamics.`,
        `Morning, ${userName}. The alchemical work continues.`
      ],
      adaptive: [
        `${timeOfDay}, ${userName}.`,
        `Welcome back, ${userName}.`,
        `Hi ${userName}.`
      ]
    };

    const options = greetings[level];
    return options[Math.floor(Math.random() * options.length)];
  }
}

export const progressiveRevelation = new ProgressiveRevelationService();