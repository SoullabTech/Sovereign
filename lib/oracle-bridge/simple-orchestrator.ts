/**
 * Simple Orchestrator - Lightweight version for API routes
 * Provides core orchestration without heavy dependencies
 */

export interface SimpleOrchestratorConfig {
  name: string;
  userId: string;
  sessionId: string;
}

export class SimpleOrchestrator {
  private name: string;
  private userId: string;
  private sessionId: string;
  private conversationHistory: Array<{ role: string; content: string }> = [];

  constructor(config: SimpleOrchestratorConfig) {
    this.name = config.name;
    this.userId = config.userId;
    this.sessionId = config.sessionId;
  }

  /**
   * Analyze input for various signals
   */
  analyzeInput(input: string): {
    input: string;
    hasCrisis: boolean;
    hasUrgency: boolean;
    hasBoundary: boolean;
    needsLooping: boolean;
    element: string;
  } {
    const lower = input.toLowerCase();

    // Crisis detection
    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'want to die', 'can\'t go on'];
    const hasCrisis = crisisKeywords.some(keyword => lower.includes(keyword));

    // Urgency detection
    const urgencyKeywords = ['urgent', 'emergency', 'help now', 'quickly', 'asap', 'immediately'];
    const hasUrgency = urgencyKeywords.some(keyword => lower.includes(keyword));

    // Boundary detection
    const boundaryKeywords = ['stop', 'don\'t', 'no more', 'enough', 'leave me alone'];
    const hasBoundary = boundaryKeywords.some(keyword => lower.includes(keyword));

    // Looping need (ambiguity)
    const ambiguityKeywords = ['maybe', 'not sure', 'confused', 'don\'t know', 'unclear'];
    const needsLooping = ambiguityKeywords.some(keyword => lower.includes(keyword));

    // Elemental detection
    const element = this.detectElement(input);

    return {
      input,
      hasCrisis,
      hasUrgency,
      hasBoundary,
      needsLooping,
      element
    };
  }

  /**
   * Detect dominant element
   */
  private detectElement(input: string): string {
    const lower = input.toLowerCase();
    const elements = {
      fire: ['passion', 'energy', 'action', 'transform', 'burn', 'drive'],
      water: ['feel', 'emotion', 'flow', 'intuition', 'deep', 'vulnerable'],
      earth: ['ground', 'stable', 'practical', 'build', 'solid', 'real'],
      air: ['think', 'idea', 'perspective', 'understand', 'clarity', 'connect'],
      aether: ['spirit', 'essence', 'whole', 'sacred', 'divine', 'transcend']
    };

    let maxScore = 0;
    let dominantElement = 'water';

    Object.entries(elements).forEach(([element, keywords]) => {
      const score = keywords.filter(keyword => lower.includes(keyword)).length;
      if (score > maxScore) {
        maxScore = score;
        dominantElement = element;
      }
    });

    return dominantElement;
  }

  /**
   * Generate appropriate response prefix based on analysis
   */
  generateResponseContext(analysis: ReturnType<typeof this.analyzeInput>): {
    systemPrompt: string;
    responseStyle: string;
  } {
    // Crisis takes priority
    if (analysis.hasCrisis) {
      return {
        systemPrompt: 'CRITICAL: User may be in crisis. Respond with immediate support and resources.',
        responseStyle: 'supportive_immediate'
      };
    }

    // Boundary respect
    if (analysis.hasBoundary) {
      return {
        systemPrompt: 'User is setting boundaries. Be minimal and respectful.',
        responseStyle: 'minimal_presence'
      };
    }

    // Urgency
    if (analysis.hasUrgency) {
      return {
        systemPrompt: 'User needs quick, direct response. Be brief and clear.',
        responseStyle: 'direct_brief'
      };
    }

    // Looping for clarity
    if (analysis.needsLooping) {
      return {
        systemPrompt: 'User seems uncertain. Use paraphrase and checking for clarity.',
        responseStyle: 'clarifying_loop'
      };
    }

    // Check for greetings
    const inputText = analysis.input || '';
    if (inputText && inputText.toLowerCase().match(/^(hi|hello|hey|good morning|good evening|greetings)/)) {
      return {
        systemPrompt: 'User is greeting. Return greeting warmly and establish rapport. Do NOT immediately ask how they are. Let them share what brings them here. You might say "Hello. It\'s good to see you." or simply "Hello." and wait.',
        responseStyle: 'warm_greeting'
      };
    }

    // Default witness
    return {
      systemPrompt: 'Witness and reflect with presence and depth.',
      responseStyle: 'witness_presence'
    };
  }

  /**
   * Add to conversation history
   */
  addToHistory(role: string, content: string): void {
    this.conversationHistory.push({ role, content });
    // Keep only last 20 exchanges
    if (this.conversationHistory.length > 40) {
      this.conversationHistory = this.conversationHistory.slice(-40);
    }
  }

  /**
   * Get conversation context for LLM
   */
  getConversationContext(): Array<{ role: string; content: string }> {
    return this.conversationHistory;
  }

  /**
   * Process orchestrated response
   */
  async orchestrateResponse(input: string): Promise<{
    analysis: ReturnType<typeof this.analyzeInput>;
    context: ReturnType<typeof this.generateResponseContext>;
    priority: string;
  }> {
    const analysis = this.analyzeInput(input);
    const context = this.generateResponseContext(analysis);

    // Determine priority system
    let priority = 'witness';
    if (analysis.hasCrisis) priority = 'crisis';
    else if (analysis.hasBoundary) priority = 'boundary';
    else if (analysis.hasUrgency) priority = 'urgency';
    else if (analysis.needsLooping) priority = 'looping';

    // Add to history
    this.addToHistory('user', input);

    return {
      analysis,
      context,
      priority
    };
  }
}