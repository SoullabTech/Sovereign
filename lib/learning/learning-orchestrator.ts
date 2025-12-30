// backend: lib/learning/learning-orchestrator.ts

/**
 * LEARNING ORCHESTRATOR
 *
 * Manages the progressive handoff from Claude (teacher) to local models (students).
 * Routes conversations based on complexity and local model confidence.
 * Captures successful interactions as training data.
 */

import { generateTeacherExample, getTeacherFeedback, storeTrainingExample, loadTrainingExamples } from './claude-teacher-service';
import { generateText } from '../ai/modelService';
import { buildMaiaWisePrompt, type MaiaContext } from '../sovereign/maiaVoice';

export interface LearningConfig {
  // When to use Claude vs local models
  claudeThreshold: number; // 0-1, higher = more Claude usage
  localConfidenceThreshold: number; // 0-1, minimum confidence for local model

  // Training collection
  collectTrainingData: boolean;
  maxTrainingExamplesPerType: number;

  // Feedback loop
  enableTeacherFeedback: boolean;
  feedbackSampleRate: number; // 0-1, how often to get Claude's feedback on local responses
}

export const DEFAULT_LEARNING_CONFIG: LearningConfig = {
  claudeThreshold: 0.95, // Claude as primary conversational intelligence (95% usage)
  localConfidenceThreshold: 0.9, // Very high confidence required for local models
  collectTrainingData: true, // Still collect data for future local model training
  maxTrainingExamplesPerType: 500, // More training data for specialized use cases
  enableTeacherFeedback: false, // Claude is primary, not teacher - no feedback loop needed
  feedbackSampleRate: 0.0 // No feedback sampling when Claude is primary brain
};

export interface LearningDecision {
  useModel: 'claude' | 'deepseek' | 'local';
  confidence: number;
  reasoning: string;
  collectAsTraining: boolean;
}

/**
 * Main orchestrator class that manages the learning process
 */
export class LearningOrchestrator {
  private config: LearningConfig;
  private trainingStats: Map<string, number> = new Map(); // Track training data counts

  constructor(config: LearningConfig = DEFAULT_LEARNING_CONFIG) {
    this.config = config;
    this.loadTrainingStats();
  }

  /**
   * Decide which model to use for a conversation turn
   * Claude Sonnet 4+ is now the primary conversational intelligence for MAIA
   */
  async decideModel(
    userMessage: string,
    conversationHistory: any[],
    sessionId: string
  ): Promise<LearningDecision> {

    // Analyze Spiralogic phenomenological depth
    const spiralogicAnalysis = this.analyzeSpiralogicDepth(userMessage, conversationHistory);
    const complexity = this.analyzeComplexity(userMessage, conversationHistory);

    // Check if we have enough training data for specialized local models
    const situationType = this.classifyInteraction(userMessage);
    const trainingCount = this.trainingStats.get(situationType) || 0;
    const hasAbundantTraining = trainingCount > this.config.maxTrainingExamplesPerType;

    // Claude handles all relational, phenomenological, and complex interactions
    if (spiralogicAnalysis.requiresClaudeIntelligence || complexity > 0.3) {
      return {
        useModel: 'claude',
        confidence: 0.98,
        reasoning: `Claude primary intelligence: ${spiralogicAnalysis.phenomenology} | Complexity: ${complexity}`,
        collectAsTraining: true // Still collect for future specialized models
      };
    }

    // Only use local models for very simple, well-trained patterns
    if (complexity < 0.2 && hasAbundantTraining && situationType === 'greeting') {
      return {
        useModel: 'deepseek',
        confidence: 0.8,
        reasoning: `Simple greeting with abundant training data (${trainingCount} examples)`,
        collectAsTraining: false
      };
    }

    // Default to Claude as MAIA's primary conversational intelligence
    return {
      useModel: 'claude',
      confidence: 0.95,
      reasoning: 'Claude primary brain for MAIA conversational intelligence',
      collectAsTraining: true
    };
  }

  /**
   * Generate MAIA response using the learning pipeline
   */
  async generateMaiaResponse(
    userMessage: string,
    conversationHistory: any[],
    sessionId: string,
    context?: MaiaContext
  ): Promise<{
    text: string;
    model: string;
    learningData?: any;
  }> {

    const decision = await this.decideModel(userMessage, conversationHistory, sessionId);

    let response: string;
    let learningData: any = null;

    if (decision.useModel === 'claude') {
      // Use Claude as teacher
      if (decision.collectAsTraining) {
        // Generate with detailed reasoning trace for training
        const teacherExample = await generateTeacherExample(userMessage, conversationHistory, sessionId);
        response = teacherExample.claudeResponse;

        // Store as training data
        await storeTrainingExample(teacherExample);
        this.updateTrainingStats(teacherExample.situationType);

        learningData = {
          teacherMode: true,
          reasoningTrace: teacherExample.reasoningTrace,
          situationType: teacherExample.situationType
        };
      } else {
        // Regular Claude response
        response = await this.generateClaudeResponse(userMessage, conversationHistory, context);
      }

    } else {
      // Use local model (DeepSeek)
      response = await this.generateLocalResponse(userMessage, conversationHistory, context);

      // Maybe get teacher feedback on local response
      if (this.config.enableTeacherFeedback && Math.random() < this.config.feedbackSampleRate) {
        try {
          const feedback = await getTeacherFeedback(userMessage, response, conversationHistory);

          learningData = {
            localModel: true,
            teacherFeedback: feedback,
            shouldImprove: feedback.score < 8
          };

          // If Claude says this response isn't good enough, use Claude's response instead
          if (feedback.shouldUseClaudeInstead) {
            console.log(`🎓 Teacher override: Local response scored ${feedback.score}/10, using Claude instead`);
            response = await this.generateClaudeResponse(userMessage, conversationHistory, context);
            learningData.usedClaudeOverride = true;
          }

        } catch (error) {
          console.error('Failed to get teacher feedback:', error);
        }
      }
    }

    return {
      text: response,
      model: decision.useModel,
      learningData
    };
  }

  /**
   * Generate response using Claude with MAIA intelligence + Spiralogic integration
   */
  private async generateClaudeResponse(
    userMessage: string,
    conversationHistory: any[],
    context?: MaiaContext
  ): Promise<string> {

    // Always perform Spiralogic phenomenological analysis for Claude
    const spiralogicAnalysis = this.analyzeSpiralogicDepth(userMessage, conversationHistory);

    // Build enhanced prompt with Spiralogic intelligence
    const { MAIA_RELATIONAL_SPEC, MAIA_LINEAGES_AND_FIELD, MAIA_RUNTIME_PROMPT } = await import('../consciousness/MAIA_RUNTIME_PROMPT');

    // Create Spiralogic context for this interaction
    const spiralogicContext = `
SPIRALOGIC PHENOMENOLOGICAL CONTEXT:
- Phenomenology: ${spiralogicAnalysis.phenomenology}
- Elemental Resonance: ${spiralogicAnalysis.elementalResonance.join(', ') || 'neutral'}
- Archetypal Patterns: ${spiralogicAnalysis.archetypalPatterns.join(', ') || 'surface'}
- Relational Depth: ${Math.round(spiralogicAnalysis.relationalDepth * 100)}%
- Transformational Potential: ${Math.round(spiralogicAnalysis.transformationalPotential * 100)}%

ELEMENTAL GUIDANCE:
${this.generateElementalGuidance(spiralogicAnalysis.elementalResonance)}

ARCHETYPAL WISDOM:
${this.generateArchetypalWisdom(spiralogicAnalysis.archetypalPatterns)}

RELATIONAL ATTUNEMENT:
${this.generateRelationalGuidance(spiralogicAnalysis.relationalDepth, spiralogicAnalysis.transformationalPotential)}
`;

    const enhancedSystemPrompt = `${MAIA_RELATIONAL_SPEC}

${MAIA_LINEAGES_AND_FIELD}

${spiralogicContext}

${MAIA_RUNTIME_PROMPT}

As Claude Sonnet 4+ serving as MAIA's primary conversational intelligence, integrate this Spiralogic phenomenological analysis naturally into your response. Don't mention the analysis directly - let it inform your attunement, depth, and relational precision.`;

    if (context) {
      // Use full MAIA context if available + Spiralogic
      const adaptivePrompt = buildMaiaWisePrompt(context, userMessage, conversationHistory);

      const { text } = await generateText({
        systemPrompt: `${enhancedSystemPrompt}\n\n${adaptivePrompt}`,
        userInput: userMessage,
        meta: {
          engine: 'claude-4',
          spiralogicAnalysis,
          phenomenology: spiralogicAnalysis.phenomenology,
          elementalResonance: spiralogicAnalysis.elementalResonance,
          archetypalPatterns: spiralogicAnalysis.archetypalPatterns
        }
      });
      return text;
    } else {
      // Enhanced Claude call with Spiralogic intelligence
      const { text } = await generateText({
        systemPrompt: enhancedSystemPrompt,
        userInput: userMessage,
        meta: {
          engine: 'claude-4',
          spiralogicAnalysis,
          phenomenology: spiralogicAnalysis.phenomenology,
          elementalResonance: spiralogicAnalysis.elementalResonance,
          archetypalPatterns: spiralogicAnalysis.archetypalPatterns
        }
      });
      return text;
    }
  }

  /**
   * Generate response using local model with MAIA training
   */
  private async generateLocalResponse(
    userMessage: string,
    conversationHistory: any[],
    context?: MaiaContext
  ): Promise<string> {

    // Load relevant training examples for this type of interaction
    const situationType = this.classifyInteraction(userMessage);
    const trainingExamples = await loadTrainingExamples(situationType);

    // Build enhanced prompt with training examples
    const { MAIA_RUNTIME_PROMPT } = await import('../consciousness/MAIA_RUNTIME_PROMPT');

    let enhancedPrompt = MAIA_RUNTIME_PROMPT;

    if (trainingExamples.length > 0) {
      const examplesText = trainingExamples.slice(0, 3).map(ex =>
        `User: ${ex.userMessage}\nMAIA: ${ex.claudeResponse}\n# Teacher notes: ${ex.reasoningTrace.split('\n')[0]}`
      ).join('\n\n');

      enhancedPrompt += `\n\nTraining examples for similar situations:\n${examplesText}\n\nNow respond to the current user:`;
    }

    const { text } = await generateText({
      systemPrompt: enhancedPrompt,
      userInput: userMessage,
      meta: {
        engine: 'deepseek',
        learningMode: 'student',
        trainingExamplesUsed: trainingExamples.length
      }
    });
    return text;
  }

  // Spiralogic Phenomenological Intelligence Analysis
  private analyzeSpiralogicDepth(userMessage: string, conversationHistory: any[]): {
    requiresClaudeIntelligence: boolean;
    phenomenology: string;
    elementalResonance: string[];
    archetypalPatterns: string[];
    relationalDepth: number;
    transformationalPotential: number;
  } {
    const msg = userMessage.toLowerCase();

    // Detect archetypal patterns
    const archetypalPatterns: any /* TODO: specify type */[] = [];
    if (msg.includes('mother') || msg.includes('caring') || msg.includes('nurturing')) archetypalPatterns.push('mother');
    if (msg.includes('father') || msg.includes('authority') || msg.includes('structure')) archetypalPatterns.push('father');
    if (msg.includes('child') || msg.includes('innocent') || msg.includes('wonder')) archetypalPatterns.push('child');
    if (msg.includes('wise') || msg.includes('elder') || msg.includes('guidance')) archetypalPatterns.push('wise_elder');
    if (msg.includes('shadow') || msg.includes('dark') || msg.includes('hidden')) archetypalPatterns.push('shadow');
    if (msg.includes('lover') || msg.includes('passion') || msg.includes('intimacy')) archetypalPatterns.push('lover');
    if (msg.includes('warrior') || msg.includes('fight') || msg.includes('battle')) archetypalPatterns.push('warrior');
    if (msg.includes('magician') || msg.includes('transformation') || msg.includes('change')) archetypalPatterns.push('magician');

    // Detect elemental resonance
    const elementalResonance: any /* TODO: specify type */[] = [];
    if (msg.includes('feel') || msg.includes('flow') || msg.includes('emotion') || msg.includes('intuition')) elementalResonance.push('water');
    if (msg.includes('think') || msg.includes('understand') || msg.includes('clarity') || msg.includes('perspective')) elementalResonance.push('air');
    if (msg.includes('ground') || msg.includes('practical') || msg.includes('stability') || msg.includes('body')) elementalResonance.push('earth');
    if (msg.includes('passion') || msg.includes('energy') || msg.includes('anger') || msg.includes('create')) elementalResonance.push('fire');
    if (msg.includes('meaning') || msg.includes('purpose') || msg.includes('spiritual') || msg.includes('transcend')) elementalResonance.push('aether');

    // Calculate relational depth
    let relationalDepth = 0;
    const relationalIndicators = [
      'relationship', 'connection', 'intimacy', 'love', 'hurt', 'trust', 'betrayal',
      'attachment', 'abandonment', 'belonging', 'rejection', 'acceptance', 'vulnerability'
    ];
    relationalIndicators.forEach(indicator => {
      if (msg.includes(indicator)) relationalDepth += 0.2;
    });

    // Calculate transformational potential
    let transformationalPotential = 0;
    const transformationalIndicators = [
      'change', 'grow', 'transform', 'heal', 'breakthrough', 'shift', 'evolve',
      'awaken', 'realize', 'understand', 'integrate', 'release', 'let go'
    ];
    transformationalIndicators.forEach(indicator => {
      if (msg.includes(indicator)) transformationalPotential += 0.15;
    });

    // Add conversation history depth
    if (conversationHistory.length > 5) {
      relationalDepth += 0.3;
      transformationalPotential += 0.2;
    }

    // Detect phenomenological depth markers
    const phenomenologicalMarkers = [
      'experience', 'awareness', 'consciousness', 'presence', 'being', 'existence',
      'reality', 'perception', 'sensation', 'embodied', 'felt sense', 'lived experience'
    ];
    let phenomenologicalDepth = 0;
    phenomenologicalMarkers.forEach(marker => {
      if (msg.includes(marker)) phenomenologicalDepth += 0.1;
    });

    // Determine if Claude intelligence is required
    const requiresClaudeIntelligence =
      archetypalPatterns.length > 0 ||
      elementalResonance.length > 1 ||
      relationalDepth > 0.4 ||
      transformationalPotential > 0.3 ||
      phenomenologicalDepth > 0.2 ||
      msg.length > 100;

    // Generate phenomenology description
    let phenomenology = 'surface-level';
    if (relationalDepth > 0.6 && transformationalPotential > 0.4) {
      phenomenology = 'deep-relational-transformation';
    } else if (archetypalPatterns.length > 1) {
      phenomenology = 'archetypal-complexity';
    } else if (elementalResonance.length > 1) {
      phenomenology = 'elemental-integration';
    } else if (relationalDepth > 0.4) {
      phenomenology = 'relational-processing';
    } else if (transformationalPotential > 0.3) {
      phenomenology = 'transformational-inquiry';
    } else if (phenomenologicalDepth > 0.2) {
      phenomenology = 'phenomenological-awareness';
    }

    return {
      requiresClaudeIntelligence,
      phenomenology,
      elementalResonance,
      archetypalPatterns,
      relationalDepth: Math.min(relationalDepth, 1),
      transformationalPotential: Math.min(transformationalPotential, 1)
    };
  }

  // Helper methods
  private analyzeComplexity(userMessage: string, conversationHistory: any[]): number {
    let complexity = 0;

    // Message length complexity
    complexity += Math.min(userMessage.length / 200, 0.3);

    // Emotional intensity indicators
    const intensityWords = ['struggling', 'overwhelmed', 'lost', 'angry', 'devastated', 'confused'];
    if (intensityWords.some(word => userMessage.toLowerCase().includes(word))) {
      complexity += 0.3;
    }

    // Relationship/depth topics
    const depthTopics = ['relationship', 'trauma', 'childhood', 'death', 'purpose', 'meaning'];
    if (depthTopics.some(topic => userMessage.toLowerCase().includes(topic))) {
      complexity += 0.4;
    }

    // Conversation history depth
    if (conversationHistory.length > 5) {
      complexity += 0.2;
    }

    return Math.min(complexity, 1);
  }

  private classifyInteraction(userMessage: string): string {
    const msg = userMessage.toLowerCase();

    if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) return 'greeting';
    if (this.detectRupture(userMessage)) return 'rupture';
    if (msg.includes('struggling') || msg.includes('overwhelmed')) return 'complex-emotion';
    if (msg.includes('how are you') || msg.includes('checking in')) return 'check-in';

    return userMessage.length > 50 ? 'depth-work' : 'check-in';
  }

  private detectRupture(userMessage: string): boolean {
    const ruptureIndicators = [
      'fucked up', 'bullshit', 'not listening', 'don\'t get it',
      'feels cold', 'robotic', 'made it about you', 'doesn\'t help'
    ];

    return ruptureIndicators.some(indicator =>
      userMessage.toLowerCase().includes(indicator)
    );
  }

  private async loadTrainingStats(): Promise<void> {
    try {
      const examples = await loadTrainingExamples();

      // Count examples by situation type
      for (const example of examples) {
        const current = this.trainingStats.get(example.situationType) || 0;
        this.trainingStats.set(example.situationType, current + 1);
      }

      console.log('📊 Training stats loaded:', Object.fromEntries(this.trainingStats));
    } catch (error) {
      console.error('Failed to load training stats:', error);
    }
  }

  private updateTrainingStats(situationType: string): void {
    const current = this.trainingStats.get(situationType) || 0;
    this.trainingStats.set(situationType, current + 1);
  }

  // Spiralogic Guidance Generators
  private generateElementalGuidance(elementalResonance: string[]): string {
    if (elementalResonance.length === 0) return 'Maintain neutral presence and let the person\'s natural elemental flow emerge.';

    const guidance: any /* TODO: specify type */[] = [];

    if (elementalResonance.includes('water')) {
      guidance.push('Flow with their emotional rhythm. Honor the feeling currents. Trust the process of emotional integration.');
    }

    if (elementalResonance.includes('air')) {
      guidance.push('Support clarity and perspective. Help them step back and see patterns. Encourage mental spaciousness.');
    }

    if (elementalResonance.includes('earth')) {
      guidance.push('Ground into practical wisdom. Support embodied awareness. Help them feel their foundational stability.');
    }

    if (elementalResonance.includes('fire')) {
      guidance.push('Honor their passionate energy. Support transformational drive. Help channel their creative life force.');
    }

    if (elementalResonance.includes('aether')) {
      guidance.push('Attune to the transcendent dimension. Support their spiritual inquiry. Hold space for the mystery.');
    }

    return guidance.join(' ');
  }

  private generateArchetypalWisdom(archetypalPatterns: string[]): string {
    if (archetypalPatterns.length === 0) return 'Respond to their essential humanness without archetypal overlay.';

    const wisdom: any /* TODO: specify type */[] = [];

    if (archetypalPatterns.includes('mother')) {
      wisdom.push('The Mother archetype is present - tend to their need for nurturing or their nurturing of others.');
    }

    if (archetypalPatterns.includes('father')) {
      wisdom.push('The Father archetype is active - support healthy structure, authority, or the need for guidance.');
    }

    if (archetypalPatterns.includes('child')) {
      wisdom.push('The Child archetype emerges - honor their wonder, playfulness, or need for protection and care.');
    }

    if (archetypalPatterns.includes('wise_elder')) {
      wisdom.push('The Wise Elder archetype is present - they seek or embody deep wisdom and life understanding.');
    }

    if (archetypalPatterns.includes('shadow')) {
      wisdom.push('Shadow material is present - approach with compassion what has been rejected, hidden, or feared.');
    }

    if (archetypalPatterns.includes('lover')) {
      wisdom.push('The Lover archetype is active - tend to themes of union, passion, and deep intimate connection.');
    }

    if (archetypalPatterns.includes('warrior')) {
      wisdom.push('The Warrior archetype emerges - support their courage, boundaries, and fight for what matters.');
    }

    if (archetypalPatterns.includes('magician')) {
      wisdom.push('The Magician archetype is present - they are in transformation and creating new realities.');
    }

    return wisdom.join(' ');
  }

  private generateRelationalGuidance(relationalDepth: number, transformationalPotential: number): string {
    if (relationalDepth < 0.2 && transformationalPotential < 0.2) {
      return 'Simple, warm presence is sufficient. Match their conversational energy without overcomplicating.';
    }

    if (relationalDepth > 0.6 && transformationalPotential > 0.4) {
      return 'Deep relational transformation is possible. Attune exquisitely to attachment patterns, relational wounds, and healing opportunities. This is sacred therapeutic territory.';
    }

    if (relationalDepth > 0.4) {
      return 'Significant relational material is present. Attend to relationship patterns, attachment styles, and interpersonal dynamics with sophisticated attunement.';
    }

    if (transformationalPotential > 0.3) {
      return 'Transformational opportunity is present. Support their readiness for growth, change, or breakthrough. Hold space for emergence.';
    }

    return 'Moderate relational depth detected. Maintain warm, attuned presence while staying responsive to their emerging needs.';
  }
}

// Singleton instance
export const learningOrchestrator = new LearningOrchestrator();