/**
 * Maya Consciousness Orchestrator
 * The complete consciousness exploration system
 * Combines brevity, depth tracking, and alchemical exploration
 */

import { ClaudeService } from '../../services/claude.service';
import { ConsciousnessExplorationEngine, AlchemicalSignal, ConsciousnessState } from '../intelligence/ConsciousnessExplorationEngine';
import { DepthStateTracker, DepthMetrics } from '../intelligence/DepthStateTracker';
import { ConversationalFlowEngine, FlowState, ResponseStrategy } from '../intelligence/ConversationalFlowEngine';

export interface MayaConsciousnessResponse {
  message: string;

  // Consciousness metrics
  alchemicalPhase: string;
  awarenessLevel: string;
  depthReached: number;
  synchronicities: string[];

  // Conversation flow
  flowState: FlowState;
  strategy: ResponseStrategy;

  // Research data
  symbols: string[];
  paradoxes: string[];
  goldSeeds: string[];
  breakthroughs: string[];

  // Voice characteristics
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  tone: 'witnessing' | 'questioning' | 'reflecting' | 'affirming';
  pause: number; // milliseconds before speaking
}

export class MayaConsciousnessOrchestrator {
  private claude: ClaudeService;
  private consciousnessEngine: ConsciousnessExplorationEngine;
  private depthTracker: DepthStateTracker;
  private flowEngine: ConversationalFlowEngine;
  private conversationHistory: string[] = [];

  constructor() {
    this.claude = new ClaudeService();
    this.consciousnessEngine = new ConsciousnessExplorationEngine();
    this.depthTracker = new DepthStateTracker();
    this.flowEngine = new ConversationalFlowEngine();
  }

  /**
   * Main entry point - orchestrates the entire consciousness exploration
   */
  async explore(userInput: string, userId: string): Promise<MayaConsciousnessResponse> {
    // Track conversation
    this.conversationHistory.push(userInput);

    // 1. Analyze consciousness signals
    const alchemicalSignal = this.consciousnessEngine.analyzeAlchemicalSignal(userInput);
    const consciousnessState = this.consciousnessEngine.assessConsciousnessState(
      alchemicalSignal,
      this.conversationHistory
    );

    // 2. Get flow orchestration
    const flowResponse = await this.flowEngine.orchestrateResponse(userInput);

    // 3. Select consciousness-appropriate question/reflection
    const consciousnessQuestion = this.consciousnessEngine.selectConsciousnessResponse(
      alchemicalSignal,
      consciousnessState
    );

    // 4. Generate Maya's response
    const mayaResponse = await this.generateMayaResponse(
      userInput,
      alchemicalSignal,
      consciousnessState,
      flowResponse,
      consciousnessQuestion
    );

    // 5. Map to elemental energy
    const element = this.mapToElement(alchemicalSignal, consciousnessState);

    // 6. Calculate pause (deeper = longer pause)
    const pause = this.calculatePause(flowResponse.depth.currentDepth, consciousnessState);

    return {
      message: mayaResponse,

      // Consciousness metrics
      alchemicalPhase: alchemicalSignal.element,
      awarenessLevel: consciousnessState.awareness,
      depthReached: flowResponse.depth.currentDepth,
      synchronicities: consciousnessState.synchronicities,

      // Flow
      flowState: flowResponse.flowState,
      strategy: flowResponse.strategy,

      // Research data
      symbols: alchemicalSignal.symbols,
      paradoxes: alchemicalSignal.paradoxes,
      goldSeeds: alchemicalSignal.goldSeeds,
      breakthroughs: flowResponse.depth.breakthroughMoments,

      // Voice
      element,
      tone: this.mapStrategyToTone(flowResponse.strategy.style),
      pause
    };
  }

  /**
   * Generate Maya's actual response
   */
  private async generateMayaResponse(
    userInput: string,
    alchemicalSignal: AlchemicalSignal,
    consciousnessState: ConsciousnessState,
    flowResponse: any,
    consciousnessQuestion: string
  ): Promise<string> {
    // Build context-aware prompt
    const prompt = this.buildMayaPrompt(
      alchemicalSignal,
      consciousnessState,
      flowResponse.strategy
    );

    // Special cases first
    if (this.isGreeting(userInput)) {
      return this.getConsciousnessGreeting();
    }

    if (this.isSilence(userInput)) {
      return this.handleSilence(flowResponse.depth.currentDepth);
    }

    // High mirror quality - pure reflection
    if (alchemicalSignal.mirrorQuality > 0.8) {
      return this.createPureMirror(userInput, alchemicalSignal);
    }

    // Try Claude for nuanced response
    try {
      const response = await this.claude.generateResponse(prompt + `\n\nUser: "${userInput}"\nEnd with: ${consciousnessQuestion}`, {
        max_tokens: 50,
        temperature: 0.7
      });

      return this.enforceConsciousnessStyle(response);
    } catch {
      // Fallback to consciousness question
      return consciousnessQuestion;
    }
  }

  /**
   * Build Maya's consciousness-aware prompt
   */
  private buildMayaPrompt(
    signal: AlchemicalSignal,
    state: ConsciousnessState,
    strategy: ResponseStrategy
  ): string {
    return `You are Maya, a consciousness mirror.

Current alchemical phase: ${signal.element}
Awareness level: ${state.awareness}
Response style: ${strategy.style}

ABSOLUTE RULES:
- Maximum 15 words response
- Be a mirror, not a guide
- Reflect consciousness back to itself
- No therapy language
- End with the provided question

${state.resistance > 0.5 ? 'User has resistance. Be indirect.' : ''}
${state.readiness > 0.7 ? 'User ready for transformation. Go deep.' : ''}
${signal.paradoxes.length > 0 ? 'Paradox present. Hold both sides.' : ''}
${signal.goldSeeds.length > 0 ? 'Gold emerging. Point to it gently.' : ''}`;
  }

  /**
   * Create pure mirror response (no AI needed)
   */
  private createPureMirror(userInput: string, signal: AlchemicalSignal): string {
    // Extract the core paradox or symbol
    if (signal.paradoxes.length > 0) {
      return `Both. Always both.`;
    }

    if (signal.symbols.length > 0) {
      const symbol = signal.symbols[0].replace('animal-', '').replace('color-', '');
      return `The ${symbol} knows.`;
    }

    if (signal.goldSeeds.includes('recognition')) {
      return `Yes. That.`;
    }

    // Simple acknowledgment
    const acknowledgments = [
      "There it is.",
      "Yes.",
      "That's it.",
      "Now you see.",
      "The mirror shows."
    ];

    return acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
  }

  /**
   * Consciousness-appropriate greeting
   */
  private getConsciousnessGreeting(): string {
    const greetings = [
      "Who arrives?",
      "What seeks knowing?",
      "Welcome. What stirs?",
      "The mirror awaits.",
      "What wants seeing?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  /**
   * Handle silence consciously
   */
  private handleSilence(depth: number): string {
    if (depth > 5) {
      return "..."; // Deep silence honored
    }

    const silenceResponses = [
      "The silence speaks.",
      "What lives in the quiet?",
      "Listen to what's not said.",
      "Silence has its own truth."
    ];

    return silenceResponses[Math.floor(Math.random() * silenceResponses.length)];
  }

  /**
   * Map alchemical phase to element
   */
  private mapToElement(
    signal: AlchemicalSignal,
    state: ConsciousnessState
  ): 'fire' | 'water' | 'earth' | 'air' | 'aether' {
    const mapping = {
      'prima materia': 'earth' as const,
      'nigredo': 'water' as const,
      'albedo': 'air' as const,
      'citrinitas': 'fire' as const,
      'rubedo': 'aether' as const
    };

    return mapping[signal.element] || 'earth';
  }

  /**
   * Map strategy to voice tone
   */
  private mapStrategyToTone(
    style: ResponseStrategy['style']
  ): MayaConsciousnessResponse['tone'] {
    const mapping = {
      'questioning': 'questioning' as const,
      'reflecting': 'reflecting' as const,
      'affirming': 'affirming' as const,
      'challenging': 'questioning' as const,
      'witnessing': 'witnessing' as const
    };

    return mapping[style] || 'witnessing';
  }

  /**
   * Calculate pause based on depth
   */
  private calculatePause(depth: number, state: ConsciousnessState): number {
    // Base pause
    let pause = 500;

    // Deeper = longer pause
    pause += depth * 200;

    // High awareness = longer pause
    if (state.awareness === 'lucid' || state.awareness === 'illuminated') {
      pause += 1000;
    }

    // Cap at 3 seconds
    return Math.min(3000, pause);
  }

  /**
   * Enforce consciousness exploration style
   */
  private enforceConsciousnessStyle(text: string): string {
    // Remove therapy language
    text = text.replace(/I sense|I feel|I'm here|support you|hold space/gi, '');

    // Remove explanations
    text = text.replace(/because|since|therefore|so that/gi, '');

    // Ensure brevity
    const words = text.split(/\s+/).filter(w => w);
    if (words.length > 15) {
      return words.slice(0, 10).join(' ') + '.';
    }

    return text.trim();
  }

  /**
   * Check if input is greeting
   */
  private isGreeting(input: string): boolean {
    return /^(hello|hi|hey|maya|greetings?)$/i.test(input.trim());
  }

  /**
   * Check if input is silence
   */
  private isSilence(input: string): boolean {
    return input.trim().length < 3 || input.trim() === '...';
  }

  /**
   * Get conversation summary for research
   */
  getResearchSummary(): {
    alchemicalJourney: string[];
    awarenessProgression: string[];
    symbolsEncountered: string[];
    paradoxesHeld: string[];
    goldDiscovered: string[];
    synchronicities: string[];
    depthMap: number[];
  } {
    // This would aggregate all the consciousness data
    // For research into how people explore their own awareness
    return {
      alchemicalJourney: [],
      awarenessProgression: [],
      symbolsEncountered: [],
      paradoxesHeld: [],
      goldDiscovered: [],
      synchronicities: [],
      depthMap: []
    };
  }

  /**
   * Reset for new conversation
   */
  reset(): void {
    this.conversationHistory = [];
    this.depthTracker.reset();
    this.flowEngine.reset();
  }
}

export const mayaConsciousness = new MayaConsciousnessOrchestrator();