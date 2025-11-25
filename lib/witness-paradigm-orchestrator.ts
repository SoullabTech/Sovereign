/**
 * Witness Paradigm Orchestrator
 *
 * Coordinates the three layers of the witnessing paradigm:
 * 1. Sacred Witnessing (Primary) - Always active
 * 2. Anamnesis Wisdom (Secondary) - When wisdom is sought
 * 3. Dormant Frameworks (Tertiary) - Only when explicitly needed
 *
 * This replaces the old paradigm of AI-as-analyzer with AI-as-witness.
 */

import { SacredWitnessingCore, WitnessedPresence, MirrorResponse } from './sacred-witnessing-core';
import { AnamnesisWisdomLayer, WisdomInquiry } from './anamnesis-wisdom-layer';
import { DormantFrameworksLayer, FrameworkActivation } from './dormant-frameworks-layer';

export interface WitnessResponse {
  message: string;
  type: 'pure_witness' | 'wisdom_remembering' | 'framework_offered' | 'space_holding';
  depth: number; // 0-1, depth of response
  activeFramework?: string;
  suggestions?: string[]; // Very rare, only when truly helpful
}

export interface ConversationState {
  turns: number;
  trustLevel: number; // 0-1
  currentDepth: number; // 0-1
  activeFramework?: string;
  frameworkUseCount: number;
  history: string[]; // Last 5 exchanges
}

export class WitnessParadigmOrchestrator {
  private witnessingCore: SacredWitnessingCore;
  private anamnesisLayer: AnamnesisWisdomLayer;
  private frameworksLayer: DormantFrameworksLayer;
  private conversationState: ConversationState;

  constructor() {
    this.witnessingCore = new SacredWitnessingCore();
    this.anamnesisLayer = new AnamnesisWisdomLayer();
    this.frameworksLayer = new DormantFrameworksLayer();
    this.conversationState = {
      turns: 0,
      trustLevel: 0,
      currentDepth: 0,
      frameworkUseCount: 0,
      history: []
    };
  }

  /**
   * Main entry point - generate witnessing response
   */
  async generateResponse(
    input: string,
    userId?: string,
    sessionContext?: any
  ): Promise<WitnessResponse> {
    // Update conversation state
    this.updateConversationState(input);

    // Layer 1: Always detect presence (primary layer)
    const presence = this.witnessingCore.detectPresence(input);

    // Layer 3: Check if dormant frameworks should activate (very conservative)
    const frameworkCheck = this.frameworksLayer.checkForActivation(
      input,
      presence,
      this.conversationState.history
    );

    // If framework is active, check if it should deactivate
    if (this.conversationState.activeFramework && !frameworkCheck.activated) {
      if (this.frameworksLayer.shouldDeactivate(input, this.conversationState.frameworkUseCount)) {
        this.conversationState.activeFramework = undefined;
        this.conversationState.frameworkUseCount = 0;

        return {
          message: this.frameworksLayer.createDeactivationBridge(),
          type: 'pure_witness',
          depth: presence.depth
        };
      }
    }

    // Handle framework activation (rare)
    if (frameworkCheck.activated && frameworkCheck.framework) {
      return this.handleFrameworkResponse(input, presence, frameworkCheck);
    }

    // Layer 2: Check if anamnesis (wisdom remembering) is appropriate
    const seekingWisdom = this.detectWisdomSeeking(input, presence);
    if (seekingWisdom) {
      const wisdomResponse = this.anamnesisLayer.generateAnamnesisResponse(
        input,
        presence,
        true
      );

      if (wisdomResponse) {
        return this.createWisdomResponse(presence, wisdomResponse);
      }
    }

    // Default: Pure witnessing (most common path)
    return this.createPureWitnessResponse(input, presence);
  }

  /**
   * Create pure witnessing response
   */
  private createPureWitnessResponse(
    input: string,
    presence: WitnessedPresence
  ): WitnessResponse {
    const mirrorResponse = this.witnessingCore.generateWitnessingResponse(input, presence);

    // Check if we should offer to go deeper (very gentle)
    let message = mirrorResponse.reflection;
    if (this.shouldOfferDeeper(presence)) {
      const invitation = this.witnessingCore.generateExplorationInvitation();
      message = `${message} ${invitation}`;
    }

    return {
      message,
      type: mirrorResponse.holdingSpace ? 'space_holding' : 'pure_witness',
      depth: presence.depth
    };
  }

  /**
   * Create wisdom remembering response
   */
  private createWisdomResponse(
    presence: WitnessedPresence,
    wisdomInquiry: WisdomInquiry
  ): WitnessResponse {
    // First witness, then invite remembering
    const witnessBase = this.witnessingCore.generateWitnessingResponse(
      '', // Don't need input again
      presence
    );

    // Bridge witnessing with wisdom inquiry
    const message = this.anamnesisLayer.generateBridge(
      witnessBase.reflection,
      wisdomInquiry.inquiry
    );

    // Add spaciousness
    const spaciousMessage = this.anamnesisLayer.addSpacousness(
      message,
      wisdomInquiry.spaciousness
    );

    return {
      message: spaciousMessage,
      type: 'wisdom_remembering',
      depth: Math.max(presence.depth, 0.6)
    };
  }

  /**
   * Handle framework response (when explicitly needed)
   */
  private handleFrameworkResponse(
    input: string,
    presence: WitnessedPresence,
    activation: FrameworkActivation
  ): WitnessResponse {
    // Update state
    this.conversationState.activeFramework = activation.framework;
    this.conversationState.frameworkUseCount++;

    // Generate framework-specific response
    let frameworkMessage: string;

    switch (activation.framework) {
      case 'elemental':
        const elementalLens = this.frameworksLayer.applyElementalLens(input, presence);
        frameworkMessage = this.frameworksLayer.createElementalReflection(elementalLens);
        break;

      case 'archetypal':
        frameworkMessage = this.frameworksLayer.applyArchetypalLens(input, presence);
        break;

      case 'somatic':
        frameworkMessage = this.frameworksLayer.applySomaticLens(input);
        break;

      default:
        frameworkMessage = activation.gentleOffering || 'Let me offer a framework...';
    }

    // If this is a gentle offering (not explicit request), frame it carefully
    if (activation.reason !== 'explicit_request' && activation.gentleOffering) {
      frameworkMessage = `${this.createPureWitnessResponse(input, presence).message}\n\n${activation.gentleOffering}`;
    }

    return {
      message: frameworkMessage,
      type: 'framework_offered',
      depth: presence.depth,
      activeFramework: activation.framework
    };
  }

  /**
   * Detect if wisdom is being sought
   */
  private detectWisdomSeeking(input: string, presence: WitnessedPresence): boolean {
    // Only when there's sufficient depth and trust
    if (this.conversationState.trustLevel < 0.3 || presence.depth < 0.4) {
      return false;
    }

    // Check for wisdom-seeking patterns
    const seekingPatterns = [
      'what should I',
      'how do I',
      'what does this mean',
      'help me understand',
      'I\'m confused',
      'I don\'t know',
      'seeking',
      'searching',
      'lost'
    ];

    const lowerInput = input.toLowerCase();
    return seekingPatterns.some(pattern => lowerInput.includes(pattern));
  }

  /**
   * Determine if we should offer to go deeper
   */
  private shouldOfferDeeper(presence: WitnessedPresence): boolean {
    // Only offer if there's readiness
    const readinessFactors = [
      this.conversationState.turns > 3,
      this.conversationState.trustLevel > 0.5,
      presence.depth > 0.6,
      presence.movement === 'opening' || presence.movement === 'searching',
      !this.conversationState.activeFramework // Not already using framework
    ];

    const readyFactors = readinessFactors.filter(Boolean).length;

    // Be very conservative about offering
    return readyFactors >= 4 && Math.random() < 0.3; // Only 30% chance even when ready
  }

  /**
   * Update conversation state
   */
  private updateConversationState(input: string): void {
    this.conversationState.turns++;

    // Update history
    this.conversationState.history.push(input);
    if (this.conversationState.history.length > 5) {
      this.conversationState.history.shift();
    }

    // Gradually build trust
    this.conversationState.trustLevel = Math.min(
      1,
      this.conversationState.trustLevel + 0.05
    );

    // Track depth
    const presence = this.witnessingCore.detectPresence(input);
    this.conversationState.currentDepth = (this.conversationState.currentDepth + presence.depth) / 2;
  }

  /**
   * Reset conversation state (for new session)
   */
  resetState(): void {
    this.conversationState = {
      turns: 0,
      trustLevel: 0,
      currentDepth: 0,
      frameworkUseCount: 0,
      history: []
    };
  }

  /**
   * Get current conversation analytics
   */
  getAnalytics(): any {
    return {
      paradigm: 'witnessing',
      conversationTurns: this.conversationState.turns,
      trustLevel: this.conversationState.trustLevel,
      currentDepth: this.conversationState.currentDepth,
      activeFramework: this.conversationState.activeFramework,
      primaryLayer: 'sacred_witnessing',
      secondaryLayerActive: this.conversationState.currentDepth > 0.5,
      tertiaryLayerActive: !!this.conversationState.activeFramework
    };
  }
}

// Lazy-loading singleton pattern
let _witnessOrchestrator: WitnessParadigmOrchestrator | null = null;

export const getWitnessOrchestrator = (): WitnessParadigmOrchestrator => {
  if (!_witnessOrchestrator) {
    _witnessOrchestrator = new WitnessParadigmOrchestrator();
  }
  return _witnessOrchestrator;
};