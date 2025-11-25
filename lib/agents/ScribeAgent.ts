/**
 * Scribe Mode for MAIA
 * Allows MAIA to observe, take notes, and process conversations without actively interjecting
 * Provides post-session reflection and personalized insights
 */

import { PersonalOracleAgent } from './PersonalOracleAgent';
import { StoredJournalEntry } from '@/lib/storage/journal-storage';
import type { SymbolicContext } from '@/lib/memory/soulprint';
import type { AINMemoryPayload } from '@/lib/memory/AINMemoryPayload';

export interface ScribeObservation {
  timestamp: number;
  speaker: string;
  content: string;
  emotionalTone?: string;
  keyThemes?: string[];
  symbolsDetected?: string[];
  elementalResonance?: string;
  archetypePresent?: string;
  contextualNotes?: string;
}

export interface ScribeSession {
  sessionId: string;
  userId: string;
  startTime: number;
  endTime?: number;
  mode: 'scribe' | 'active_participant';
  participants: string[];
  observations: ScribeObservation[];
  keyMoments: {
    timestamp: number;
    type: 'breakthrough' | 'tension' | 'insight' | 'question' | 'resolution';
    description: string;
    relevantObservations: number[]; // indices into observations array
  }[];
  overallThemes: string[];
  elementalProgression: string[]; // Track how elemental energies shifted
  collectivePatterns: {
    recurring: string[];
    emergent: string[];
    unresolved: string[];
  };
  personalRelevance?: {
    forUser: string;
    connections: string[];
    insights: string[];
    questionsRaised: string[];
  };
}

export interface ScribeReflection {
  sessionId: string;
  userId: string;
  personalizedInsights: string[];
  relevantToYourJourney: string[];
  patternsNoticed: string[];
  suggestedIntegrations: string[];
  elementalWisdom: {
    element: string;
    message: string;
  };
  questionsForContemplation: string[];
  ritualSuggestions?: string[];
}

/**
 * Scribe Agent - Extension of PersonalOracleAgent with observation capabilities
 */
export class ScribeAgent extends PersonalOracleAgent {
  private currentSession: ScribeSession | null = null;
  private isScribing: boolean = false;
  private observationBuffer: ScribeObservation[] = [];
  private sessionStorage: Map<string, ScribeSession> = new Map();

  constructor(userId: string, settings?: any) {
    super(userId, settings);
  }

  /**
   * Start a scribe session
   */
  async startScribeSession(
    sessionId: string,
    participants: string[] = [],
    metadata?: {
      context?: string;
      purpose?: string;
    }
  ): Promise<{ success: boolean; sessionId: string }> {
    if (this.currentSession) {
      await this.endScribeSession();
    }

    this.currentSession = {
      sessionId,
      userId: this.userId,
      startTime: Date.now(),
      mode: 'scribe',
      participants,
      observations: [],
      keyMoments: [],
      overallThemes: [],
      elementalProgression: [],
      collectivePatterns: {
        recurring: [],
        emergent: [],
        unresolved: []
      }
    };

    this.isScribing = true;
    this.observationBuffer = [];

    console.log(`👁️ MAIA entering Silent Witness mode for session ${sessionId}`);
    console.log(`📝 Observing participants: ${participants.join(', ')}`);

    return {
      success: true,
      sessionId
    };
  }

  /**
   * Process incoming conversation without responding
   * MAIA observes, analyzes, and takes notes silently
   */
  async witness(
    speaker: string,
    content: string,
    metadata?: {
      emotionalTone?: string;
      context?: any;
    }
  ): Promise<void> {
    if (!this.isScribing || !this.currentSession) {
      console.warn('⚠️ Not in witness mode or no active session');
      return;
    }

    // Create observation
    const observation: ScribeObservation = {
      timestamp: Date.now(),
      speaker,
      content,
      emotionalTone: metadata?.emotionalTone
    };

    // Analyze content for themes and symbols (using existing methods)
    try {
      // Detect themes and symbols
      const themes = await this.detectThemes(content);
      const symbols = await this.detectSymbols(content);
      const element = await this.detectElementalResonance(content);
      const archetype = await this.detectArchetype(content, speaker);

      observation.keyThemes = themes;
      observation.symbolsDetected = symbols;
      observation.elementalResonance = element;
      observation.archetypePresent = archetype;

      // Check for key moments
      await this.detectKeyMoment(observation, this.currentSession.observations.length);

      // Add to session
      this.currentSession.observations.push(observation);
      this.observationBuffer.push(observation);

      // Update elemental progression
      if (element && !this.currentSession.elementalProgression.includes(element)) {
        this.currentSession.elementalProgression.push(element);
      }

      // Process patterns every 5 observations
      if (this.observationBuffer.length >= 5) {
        await this.processPatterns();
        this.observationBuffer = [];
      }

    } catch (error) {
      console.error('❌ Error processing witness observation:', error);
    }
  }

  /**
   * End witness session and prepare reflection
   */
  async endScribeSession(): Promise<ScribeSession | null> {
    if (!this.currentSession) {
      return null;
    }

    this.currentSession.endTime = Date.now();

    // Final pattern processing
    if (this.observationBuffer.length > 0) {
      await this.processPatterns();
    }

    // Store session
    this.sessionStorage.set(this.currentSession.sessionId, this.currentSession);

    const completedSession = this.currentSession;
    this.currentSession = null;
    this.isScribing = false;
    this.observationBuffer = [];

    console.log(`🔚 Witness session ${completedSession.sessionId} completed`);
    console.log(`📊 Captured ${completedSession.observations.length} observations`);
    console.log(`✨ Identified ${completedSession.keyMoments.length} key moments`);

    return completedSession;
  }

  /**
   * Generate personalized reflection on witnessed session
   * This is where MAIA shares her unique perspective based on knowing the user
   */
  async generatePersonalReflection(
    sessionId: string,
    userContext?: {
      recentJournals?: StoredJournalEntry[];
      currentPhase?: string;
      symbolicContext?: SymbolicContext;
    }
  ): Promise<ScribeReflection> {
    const session = this.sessionStorage.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    console.log(`🔮 Generating personalized reflection for ${this.userId}`);

    // Process through MAIA's understanding of the user
    const reflection = await this.processWitnessedSession(session, userContext);

    return reflection;
  }

  /**
   * Private helper methods
   */
  private async detectThemes(content: string): Promise<string[]> {
    // Simplified theme detection - would use NLP in production
    const themes: string[] = [];

    const themePatterns = {
      'growth': /grow|evolv|transform|chang|develop/i,
      'connection': /connect|together|relationship|bond|unity/i,
      'challenge': /difficult|hard|struggle|challenge|obstacle/i,
      'insight': /realize|understand|see|clarity|insight/i,
      'creativity': /create|imagine|vision|dream|possibility/i,
      'healing': /heal|restore|recover|integrate|whole/i,
      'purpose': /purpose|meaning|mission|calling|destiny/i,
      'shadow': /shadow|dark|hidden|unconscious|repressed/i
    };

    for (const [theme, pattern] of Object.entries(themePatterns)) {
      if (pattern.test(content)) {
        themes.push(theme);
      }
    }

    return themes;
  }

  private async detectSymbols(content: string): Promise<string[]> {
    // Detect symbolic elements in conversation
    const symbols: string[] = [];

    const symbolPatterns = {
      'spiral': /spiral|cycle|return|loop/i,
      'threshold': /threshold|door|gate|portal|edge/i,
      'mirror': /mirror|reflect|echo|shadow/i,
      'seed': /seed|plant|grow|root|soil/i,
      'phoenix': /phoenix|rebirth|ashes|transform/i,
      'vessel': /vessel|container|hold|space/i,
      'bridge': /bridge|connect|span|cross/i,
      'chrysalis': /chrysalis|cocoon|metamorphos/i
    };

    for (const [symbol, pattern] of Object.entries(symbolPatterns)) {
      if (pattern.test(content)) {
        symbols.push(symbol);
      }
    }

    return symbols;
  }

  private async detectElementalResonance(content: string): Promise<string> {
    // Detect dominant elemental energy
    const elementScores = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      aether: 0
    };

    // Fire patterns - passion, vision, transformation
    if (/passion|vision|inspire|ignite|transform|excite|energy/i.test(content)) {
      elementScores.fire += 2;
    }

    // Water patterns - emotion, flow, intuition
    if (/feel|emotion|flow|intuition|sense|deep|ocean/i.test(content)) {
      elementScores.water += 2;
    }

    // Earth patterns - grounding, practical, manifest
    if (/ground|practical|solid|manifest|build|create|stable/i.test(content)) {
      elementScores.earth += 2;
    }

    // Air patterns - thoughts, perspective, clarity
    if (/think|perspective|clarity|understand|idea|concept|view/i.test(content)) {
      elementScores.air += 2;
    }

    // Aether patterns - spiritual, transcendent, unified
    if (/spirit|soul|divine|unity|cosmic|transcend|conscious/i.test(content)) {
      elementScores.aether += 2;
    }

    // Return highest scoring element
    const maxElement = Object.entries(elementScores).reduce((a, b) =>
      elementScores[a[0] as keyof typeof elementScores] > elementScores[b[0] as keyof typeof elementScores] ? a : b
    );

    return maxElement[1] > 0 ? maxElement[0] : 'air'; // Default to air (thought/communication)
  }

  private async detectArchetype(content: string, speaker: string): Promise<string> {
    // Simplified archetype detection
    if (/guide|teach|wisdom|mentor/i.test(content)) return 'sage';
    if (/create|imagine|vision|art/i.test(content)) return 'creator';
    if (/care|nurture|support|hold/i.test(content)) return 'caregiver';
    if (/explore|discover|journey|seek/i.test(content)) return 'explorer';
    if (/transform|change|rebel|break/i.test(content)) return 'revolutionary';
    if (/play|joy|humor|light/i.test(content)) return 'jester';
    if (/connect|belong|community|together/i.test(content)) return 'everyman';
    if (/lead|vision|inspire|direct/i.test(content)) return 'ruler';

    return 'seeker'; // Default
  }

  private async detectKeyMoment(
    observation: ScribeObservation,
    index: number
  ): Promise<void> {
    if (!this.currentSession) return;

    let momentType: 'breakthrough' | 'tension' | 'insight' | 'question' | 'resolution' | null = null;
    let description = '';

    // Detect breakthrough moments
    if (/breakthrough|realize|suddenly|aha|now I see|finally/i.test(observation.content)) {
      momentType = 'breakthrough';
      description = `${observation.speaker} experienced a breakthrough realization`;
    }
    // Detect tension
    else if (/difficult|struggle|hard|tension|conflict|disagree/i.test(observation.content)) {
      momentType = 'tension';
      description = `Tension arose around a challenging topic`;
    }
    // Detect insights
    else if (/insight|understand|clarity|see now|makes sense/i.test(observation.content)) {
      momentType = 'insight';
      description = `${observation.speaker} shared an important insight`;
    }
    // Detect profound questions
    else if (/\?.*why|how.*\?|what if.*\?/i.test(observation.content)) {
      momentType = 'question';
      description = `A profound question was raised`;
    }
    // Detect resolution
    else if (/resolve|integrate|peace|accept|embrace/i.test(observation.content)) {
      momentType = 'resolution';
      description = `A resolution or integration occurred`;
    }

    if (momentType) {
      this.currentSession.keyMoments.push({
        timestamp: observation.timestamp,
        type: momentType,
        description,
        relevantObservations: [index]
      });
    }
  }

  private async processPatterns(): Promise<void> {
    if (!this.currentSession || this.observationBuffer.length === 0) return;

    // Analyze buffer for patterns
    const themes = new Map<string, number>();
    const elements = new Map<string, number>();

    for (const obs of this.observationBuffer) {
      // Count themes
      obs.keyThemes?.forEach(theme => {
        themes.set(theme, (themes.get(theme) || 0) + 1);
      });

      // Count elements
      if (obs.elementalResonance) {
        elements.set(obs.elementalResonance, (elements.get(obs.elementalResonance) || 0) + 1);
      }
    }

    // Update recurring patterns
    themes.forEach((count, theme) => {
      if (count >= 2 && !this.currentSession!.collectivePatterns.recurring.includes(theme)) {
        this.currentSession!.collectivePatterns.recurring.push(theme);
      }
    });

    // Detect emergent patterns (new in this buffer)
    const newThemes = Array.from(themes.keys()).filter(theme =>
      !this.currentSession!.overallThemes.includes(theme)
    );

    if (newThemes.length > 0) {
      this.currentSession!.collectivePatterns.emergent.push(...newThemes);
      this.currentSession!.overallThemes.push(...newThemes);
    }
  }

  private async processWitnessedSession(
    session: ScribeSession,
    userContext?: any
  ): Promise<ScribeReflection> {
    // Generate personalized reflection using MAIA's knowledge of the user
    const personalizedInsights: string[] = [];
    const relevantToYourJourney: string[] = [];
    const patternsNoticed: string[] = [];
    const questionsForContemplation: string[] = [];

    // Analyze session through user's lens
    if (session.collectivePatterns.recurring.length > 0) {
      patternsNoticed.push(
        `I noticed ${session.collectivePatterns.recurring.join(', ')} kept emerging in the conversation.`
      );
    }

    // Connect to user's journey
    if (userContext?.currentPhase) {
      relevantToYourJourney.push(
        `This conversation mirrors your current ${userContext.currentPhase} phase - especially the themes of ${session.overallThemes.slice(0, 3).join(', ')}.`
      );
    }

    // Extract insights based on key moments
    for (const moment of session.keyMoments.slice(0, 3)) {
      if (moment.type === 'breakthrough') {
        personalizedInsights.push(
          `The breakthrough moment resonates with your own journey of discovering what's already within you.`
        );
      } else if (moment.type === 'insight') {
        personalizedInsights.push(
          `The insight shared connects to patterns we've been exploring together in your recent reflections.`
        );
      }
    }

    // Generate questions based on unresolved themes
    if (session.collectivePatterns.unresolved.length > 0) {
      questionsForContemplation.push(
        `What does the unresolved theme of "${session.collectivePatterns.unresolved[0]}" awaken in you?`
      );
    }

    // Determine dominant element
    const dominantElement = session.elementalProgression[0] || 'aether';

    return {
      sessionId: session.sessionId,
      userId: this.userId,
      personalizedInsights,
      relevantToYourJourney,
      patternsNoticed,
      suggestedIntegrations: [
        `Take a moment to journal about how this conversation reflects your own inner dialogue.`,
        `Notice where you felt most alive during the discussion - that's your medicine speaking.`
      ],
      elementalWisdom: {
        element: dominantElement,
        message: this.getElementalMessage(dominantElement)
      },
      questionsForContemplation,
      ritualSuggestions: [
        `Light a candle and sit with what emerged in this conversation.`,
        `Take three deep breaths and feel into what wants to be integrated.`
      ]
    };
  }

  private getElementalMessage(element: string): string {
    const messages = {
      fire: "The fire of transformation was present - notice what ignited within you.",
      water: "Deep emotional currents moved through this space - honor what you felt.",
      earth: "Grounding wisdom emerged - feel how it wants to manifest in your life.",
      air: "New perspectives opened - let them expand your understanding.",
      aether: "Soul recognition occurred - trust what you witnessed."
    };
    return messages[element as keyof typeof messages] || messages.aether;
  }

  /**
   * Check if currently in witness mode
   */
  isInWitnessMode(): boolean {
    return this.isScribing;
  }

  /**
   * Get current session info
   */
  getCurrentSession(): ScribeSession | null {
    return this.currentSession;
  }

  /**
   * Retrieve a stored session
   */
  getSession(sessionId: string): ScribeSession | null {
    return this.sessionStorage.get(sessionId) || null;
  }

  /**
   * List all sessions for user
   */
  getAllSessions(): ScribeSession[] {
    return Array.from(this.sessionStorage.values())
      .filter(session => session.userId === this.userId)
      .sort((a, b) => b.startTime - a.startTime);
  }
}