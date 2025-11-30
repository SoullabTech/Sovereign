/**
 * Conversational Flow Engine
 * Creates fluid, enchanting dialogue with proper pacing and rhythm
 */

import { SacredMirrorIntelligence, ConversationSignal } from './InterviewIntelligence';
import { DepthStateTracker, DepthMetrics } from './DepthStateTracker';

export interface FlowState {
  energy: 'opening' | 'building' | 'peak' | 'integrating' | 'closing';
  pace: 'slow' | 'medium' | 'quick';
  tension: number; // 0-1 scale
  needsGrounding: boolean;
  needsLightness: boolean;
}

export interface ResponseStrategy {
  style: 'questioning' | 'reflecting' | 'affirming' | 'challenging' | 'witnessing';
  length: 'minimal' | 'brief' | 'moderate';
  ending: 'open' | 'closed' | 'pause';
  energyShift?: 'uplift' | 'deepen' | 'steady';
}

export class ConversationalFlowEngine {
  private interviewIntel: SacredMirrorIntelligence;
  private depthTracker: DepthStateTracker;
  private turnCount: number = 0;
  private lastStrategy: ResponseStrategy | null = null;
  private silenceCount: number = 0;

  constructor() {
    this.interviewIntel = new SacredMirrorIntelligence();
    this.depthTracker = new DepthStateTracker();
  }

  /**
   * Main orchestration - creates enchanting flow
   */
  async orchestrateResponse(userInput: string): Promise<{
    response: string;
    strategy: ResponseStrategy;
    flowState: FlowState;
    depth: DepthMetrics;
  }> {
    this.turnCount++;

    // Analyze where we are
    const signal = this.interviewIntel.analyzeSignal(userInput);
    const depth = this.depthTracker.update(userInput, ''); // Will update with response later
    const flowState = this.assessFlowState(signal, depth);
    const strategy = this.selectStrategy(signal, depth, flowState);

    // Generate response with proper technique
    const response = await this.generateFlowResponse(
      userInput,
      signal,
      depth,
      strategy,
      flowState
    );

    // Update depth tracker with actual response
    this.depthTracker.update(userInput, response);

    return {
      response,
      strategy,
      flowState,
      depth
    };
  }

  /**
   * Assess the current flow state
   */
  private assessFlowState(signal: ConversationSignal, depth: DepthMetrics): FlowState {
    // Opening (turns 1-3)
    if (this.turnCount <= 3) {
      return {
        energy: 'opening',
        pace: 'slow',
        tension: 0.2,
        needsGrounding: false,
        needsLightness: signal.intensity === 'high'
      };
    }

    // Building (depth increasing)
    if (depth.currentDepth > 2 && depth.currentDepth <= 5) {
      return {
        energy: 'building',
        pace: signal.openness > 0.6 ? 'medium' : 'slow',
        tension: 0.4 + (signal.intensity === 'high' ? 0.2 : 0),
        needsGrounding: signal.intensity === 'high',
        needsLightness: false
      };
    }

    // Peak (deep engagement)
    if (depth.currentDepth > 5 && depth.currentDepth <= 8) {
      return {
        energy: 'peak',
        pace: 'quick',
        tension: 0.7,
        needsGrounding: true,
        needsLightness: depth.emotionalIntensity > 0.8
      };
    }

    // Integration (insights emerging)
    if (depth.phase === 'insight' || depth.phase === 'integration') {
      return {
        energy: 'integrating',
        pace: 'slow',
        tension: 0.3,
        needsGrounding: false,
        needsLightness: true
      };
    }

    // Default steady state
    return {
      energy: 'building',
      pace: 'medium',
      tension: 0.5,
      needsGrounding: false,
      needsLightness: false
    };
  }

  /**
   * Select conversational strategy based on flow
   */
  private selectStrategy(
    signal: ConversationSignal,
    depth: DepthMetrics,
    flowState: FlowState
  ): ResponseStrategy {
    // Don't repeat same strategy too often
    const avoidRepeat = (strategy: ResponseStrategy): ResponseStrategy => {
      if (this.lastStrategy?.style === strategy.style && Math.random() > 0.7) {
        // Switch it up
        const alternatives: ResponseStrategy['style'][] = [
          'questioning', 'reflecting', 'affirming', 'witnessing'
        ];
        strategy.style = alternatives[Math.floor(Math.random() * alternatives.length)];
      }
      this.lastStrategy = strategy;
      return strategy;
    };

    // Opening strategy
    if (flowState.energy === 'opening') {
      return avoidRepeat({
        style: signal.openness < 0.3 ? 'questioning' : 'reflecting',
        length: 'brief',
        ending: 'open',
        energyShift: 'steady'
      });
    }

    // Building strategy
    if (flowState.energy === 'building') {
      if (signal.metaphors.length > 0) {
        return avoidRepeat({
          style: 'reflecting',
          length: 'minimal',
          ending: 'pause',
          energyShift: 'deepen'
        });
      }
      return avoidRepeat({
        style: 'questioning',
        length: 'brief',
        ending: 'open',
        energyShift: 'uplift'
      });
    }

    // Peak strategy
    if (flowState.energy === 'peak') {
      if (flowState.needsGrounding) {
        return avoidRepeat({
          style: 'witnessing',
          length: 'minimal',
          ending: 'pause',
          energyShift: 'steady'
        });
      }
      return avoidRepeat({
        style: 'challenging',
        length: 'brief',
        ending: 'open',
        energyShift: 'deepen'
      });
    }

    // Integration strategy
    if (flowState.energy === 'integrating') {
      return avoidRepeat({
        style: 'affirming',
        length: 'moderate',
        ending: 'closed',
        energyShift: 'steady'
      });
    }

    // Default
    return avoidRepeat({
      style: 'reflecting',
      length: 'brief',
      ending: 'open',
      energyShift: 'steady'
    });
  }

  /**
   * Generate response with proper flow and pacing
   */
  private async generateFlowResponse(
    userInput: string,
    signal: ConversationSignal,
    depth: DepthMetrics,
    strategy: ResponseStrategy,
    flowState: FlowState
  ): Promise<string> {
    let response = '';

    // Handle silence or very short input
    if (userInput.trim().length < 10 || userInput.trim() === '...') {
      this.silenceCount++;
      if (this.silenceCount > 2) {
        return "Take your time.";
      }
      return "..."; // Mirror the silence
    }
    this.silenceCount = 0;

    // Build response based on strategy
    switch (strategy.style) {
      case 'questioning': {
        const intervention = this.interviewIntel.selectWitnessing(
          signal,
          depth.currentDepth,
          userInput
        );
        response = this.applyMayaBrevity(intervention.template);
        break;
      }

      case 'reflecting': {
        // Simple reflection + optional question
        const core = this.extractCoreMessage(userInput);
        response = core;
        if (strategy.ending === 'open' && Math.random() > 0.5) {
          response += " Tell me more.";
        }
        break;
      }

      case 'affirming': {
        const affirmation = this.interviewIntel.generateAffirmation(signal);
        response = affirmation || "That's real.";
        break;
      }

      case 'challenging': {
        response = this.generateChallenge(signal, userInput);
        break;
      }

      case 'witnessing': {
        response = this.generateWitness(signal, depth);
        break;
      }
    }

    // Apply energy shifts
    if (strategy.energyShift === 'uplift' && flowState.needsLightness) {
      response = this.addLightness(response);
    } else if (strategy.energyShift === 'deepen' && !flowState.needsGrounding) {
      response = this.addDepth(response);
    }

    // Final brevity enforcement
    response = this.applyMayaBrevity(response);

    return response;
  }

  /**
   * Extract core emotional message
   */
  private extractCoreMessage(userInput: string): string {
    const sentences = userInput.split(/[.!?]/).filter(s => s.trim());

    // Find most emotionally charged sentence
    for (const sentence of sentences) {
      if (/feel|felt|am|scared|sad|angry|lost|happy/i.test(sentence)) {
        // Simplify and reflect
        const simplified = sentence
          .replace(/I (feel|felt|am)/i, "You're")
          .replace(/I /gi, "You ")
          .trim();
        return simplified.length < 30 ? simplified + "." : "I hear you.";
      }
    }

    return "Go on.";
  }

  /**
   * Generate gentle challenge
   */
  private generateChallenge(signal: ConversationSignal, userInput: string): string {
    const challenges = [
      "What if that's not true?",
      "Is that the whole story?",
      "What else might be true?",
      "And beneath that?",
      "What are you not saying?"
    ];

    if (signal.intensity === 'high') {
      return "What are you protecting?";
    }

    return challenges[Math.floor(Math.random() * challenges.length)];
  }

  /**
   * Generate witnessing response
   */
  private generateWitness(signal: ConversationSignal, depth: DepthMetrics): string {
    if (depth.phase === 'archetypal' || depth.phase === 'insight') {
      return "There it is.";
    }

    if (signal.intensity === 'high') {
      return "I see you.";
    }

    const witnesses = [
      "Yes.",
      "Mmm.",
      "That's it.",
      "Keep going.",
      "Right there."
    ];

    return witnesses[Math.floor(Math.random() * witnesses.length)];
  }

  /**
   * Add lightness when needed
   */
  private addLightness(response: string): string {
    const lighteners = [
      " No rush.",
      " Breathe.",
      " It's okay.",
      " You're okay."
    ];

    if (response.length < 15) {
      return response + lighteners[Math.floor(Math.random() * lighteners.length)];
    }
    return response;
  }

  /**
   * Add depth when appropriate
   */
  private addDepth(response: string): string {
    if (response.endsWith("?")) {
      return response; // Already inviting depth
    }

    const deepeners = [
      " What else?",
      " Go deeper.",
      " Say more.",
      " And?"
    ];

    if (response.length < 10) {
      return response + deepeners[Math.floor(Math.random() * deepeners.length)];
    }
    return response;
  }

  /**
   * Apply Maya's brevity constraints
   */
  private applyMayaBrevity(text: string): string {
    // Remove filler words
    text = text.replace(/\b(just|really|very|actually|basically)\b/gi, '');

    // Ensure under 25 words
    const words = text.split(/\s+/).filter(w => w.length > 0);
    if (words.length > 25) {
      // Take first complete thought
      const shortened = words.slice(0, 15).join(' ');
      return shortened + '.';
    }

    return text.trim();
  }

  /**
   * Reset for new conversation
   */
  reset(): void {
    this.turnCount = 0;
    this.lastStrategy = null;
    this.silenceCount = 0;
    this.depthTracker.reset();
  }
}

export const flowEngine = new ConversationalFlowEngine();