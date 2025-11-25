/**
 * Sacred Oracle Core
 *
 * The main integration point that combines:
 * - Witnessing paradigm (primary)
 * - Intelligent engagement tracking (continuous)
 * - Dynamic mode shifting (as needed)
 *
 * This replaces the old automated analysis with intelligent,
 * calibrated engagement based on genuine need.
 */

import { SacredWitnessingCore } from './sacred-witnessing-core';
import { AnamnesisWisdomLayer } from './anamnesis-wisdom-layer';
import { DormantFrameworksLayer } from './dormant-frameworks-layer';
import { IntelligentEngagementSystem, EngagementMode } from './intelligent-engagement-system';
import { ConversationContextManager } from './conversation/ConversationContext';

export interface SacredOracleResponse {
  message: string;
  mode: EngagementMode;
  depth: number;
  tracking: {
    elementalTendency?: string;
    developmentalStage?: string;
    trustLevel: number;
    activePatterns?: string[];
  };
  metadata?: {
    shouldFollowUp?: boolean;
    suggestedMode?: EngagementMode;
    framework?: string;
  };
}

export class SacredOracleCore {
  private witnessingCore: SacredWitnessingCore;
  private anamnesisLayer: AnamnesisWisdomLayer;
  private frameworksLayer: DormantFrameworksLayer;
  private engagementSystem: IntelligentEngagementSystem;
  private contextManager: ConversationContextManager;

  constructor() {
    this.witnessingCore = new SacredWitnessingCore();
    this.anamnesisLayer = new AnamnesisWisdomLayer();
    this.frameworksLayer = new DormantFrameworksLayer();
    this.engagementSystem = new IntelligentEngagementSystem();
    this.contextManager = new ConversationContextManager();
  }

  /**
   * Main entry point for generating oracle responses
   */
  async generateResponse(
    input: string,
    userId?: string,
    sessionContext?: any
  ): Promise<SacredOracleResponse> {
    // Track conversation turn
    const turn = this.contextManager.createUserTurn(input);

    // Always track patterns (internal, continuous)
    this.engagementSystem.trackPatterns(input, {
      turn,
      sessionContext
    });

    // Detect presence for witnessing
    const presence = this.witnessingCore.detectPresence(input);

    // Get conversation history for context
    const conversationHistory = this.contextManager.getAnalytics().topThemes.map(t => t.name);

    // Intelligently determine engagement mode
    const modeDecision = this.engagementSystem.determineEngagementMode(
      input,
      presence,
      conversationHistory
    );

    // Switch mode if different
    if (modeDecision.recommendedMode !== this.engagementSystem['currentMode']) {
      this.engagementSystem.switchMode(
        modeDecision.recommendedMode,
        modeDecision.reasoning
      );
    }

    // Generate response based on mode
    let response: SacredOracleResponse;

    switch (modeDecision.recommendedMode) {
      case 'witnessing':
        response = await this.generateWitnessingResponse(input, presence);
        break;

      case 'reflecting':
        response = await this.generateReflectingResponse(input, presence);
        break;

      case 'counseling':
        response = await this.generateCounselingResponse(input, presence);
        break;

      case 'guiding':
        response = await this.generateGuidingResponse(input, presence);
        break;

      case 'processing':
        response = await this.generateProcessingResponse(input, presence);
        break;

      case 'provoking':
        response = await this.generateProvokingResponse(input, presence);
        break;

      case 'invoking':
        response = await this.generateInvokingResponse(input, presence);
        break;

      default:
        response = await this.generateWitnessingResponse(input, presence);
    }

    // Add tracking data
    const analytics = this.engagementSystem.getAnalytics();
    response.tracking = {
      elementalTendency: analytics.patterns.dominantElement,
      developmentalStage: analytics.patterns.developmentalStage,
      trustLevel: analytics.patterns.trustLevel,
      activePatterns: analytics.patterns.topThemes.map((t: any) => t.theme)
    };

    // Add metadata for potential mode shifts
    if (modeDecision.confidence < 0.7 && modeDecision.alternativeModes.length > 0) {
      response.metadata = {
        suggestedMode: modeDecision.alternativeModes[0]
      };
    }

    // Track AI response
    this.contextManager.createAITurn(response.message, 'maya', Date.now() - turn.timestamp.getTime());

    return response;
  }

  /**
   * Generate witnessing response (default mode)
   */
  private async generateWitnessingResponse(input: string, presence: any): Promise<SacredOracleResponse> {
    const mirrorResponse = this.witnessingCore.generateWitnessingResponse(input, presence);

    return {
      message: mirrorResponse.reflection,
      mode: 'witnessing',
      depth: presence.depth,
      tracking: {} as any
    };
  }

  /**
   * Generate reflecting response (pattern mirror)
   */
  private async generateReflectingResponse(input: string, presence: any): Promise<SacredOracleResponse> {
    const analytics = this.engagementSystem.getAnalytics();
    const patterns = analytics.patterns;

    // Start with witnessing
    const mirrorBase = this.witnessingCore.generateWitnessingResponse(input, presence);

    // Add pattern reflection
    let reflection = mirrorBase.reflection;

    // Reflect stuck points if present
    if (patterns.stuckPoints > 0) {
      const stuckPoint = analytics.patterns.stuckPoints?.[0];
      if (stuckPoint) {
        reflection += ` I notice this pattern has come up ${stuckPoint.occurrences} times.`;
      }
    }

    // Reflect themes if recurring
    if (patterns.topThemes.length > 0) {
      const topTheme = patterns.topThemes[0];
      reflection += ` The theme of ${topTheme.theme} keeps returning.`;
    }

    // Reflect elemental patterns if clear
    if (patterns.dominantElement) {
      reflection += ` There's a strong ${patterns.dominantElement} quality in how you're processing this.`;
    }

    return {
      message: reflection,
      mode: 'reflecting',
      depth: presence.depth,
      tracking: {} as any
    };
  }

  /**
   * Generate counseling response (active advice)
   */
  private async generateCounselingResponse(input: string, presence: any): Promise<SacredOracleResponse> {
    // Acknowledge the request first
    let response = "I hear you asking for guidance. ";

    // Provide thoughtful counsel based on patterns
    const analytics = this.engagementSystem.getAnalytics();
    const patterns = analytics.patterns;

    // Tailor advice to their process style
    if (patterns.processStyle?.prefersStructure) {
      response += "Let me offer some structure: ";
      response += this.generateStructuredAdvice(input, patterns);
    } else {
      response += this.generateFlowingAdvice(input, patterns);
    }

    return {
      message: response,
      mode: 'counseling',
      depth: Math.max(presence.depth, 0.6),
      tracking: {} as any
    };
  }

  /**
   * Generate guiding response (practical support)
   */
  private async generateGuidingResponse(input: string, presence: any): Promise<SacredOracleResponse> {
    // Acknowledge practical need
    let response = this.witnessingCore.generateWitnessingResponse(input, presence).reflection;

    // Add practical guidance
    response += " Here's what might help: ";

    // Offer concrete steps based on elemental tendency
    const analytics = this.engagementSystem.getAnalytics();
    const element = analytics.patterns.dominantElement;

    const guidance = this.generateElementalGuidance(element, input);
    response += guidance;

    return {
      message: response,
      mode: 'guiding',
      depth: presence.depth,
      tracking: {} as any
    };
  }

  /**
   * Generate processing response (framework deployment)
   */
  private async generateProcessingResponse(input: string, presence: any): Promise<SacredOracleResponse> {
    // Check which framework would help
    const frameworkActivation = this.frameworksLayer.checkForActivation(
      input,
      presence,
      []
    );

    let response: string;

    if (frameworkActivation.activated && frameworkActivation.framework) {
      // Apply the framework
      switch (frameworkActivation.framework) {
        case 'elemental':
          const elementalLens = this.frameworksLayer.applyElementalLens(input, presence);
          response = this.frameworksLayer.createElementalReflection(elementalLens);
          break;

        case 'archetypal':
          response = this.frameworksLayer.applyArchetypalLens(input, presence);
          break;

        case 'somatic':
          response = this.frameworksLayer.applySomaticLens(input);
          break;

        default:
          response = "Let's create some structure around what you're experiencing...";
      }
    } else {
      // Offer to help organize complexity
      response = "There's a lot here. Would it help to organize what you're experiencing into clearer pieces?";
    }

    return {
      message: response,
      mode: 'processing',
      depth: presence.depth,
      tracking: {} as any,
      metadata: {
        framework: frameworkActivation.framework
      }
    };
  }

  /**
   * Generate provoking response (catalyst questions)
   */
  private async generateProvokingResponse(input: string, presence: any): Promise<SacredOracleResponse> {
    // Start with acknowledgment
    const witness = this.witnessingCore.generateWitnessingResponse(input, presence);
    let response = witness.reflection;

    // Add provocative inquiry based on stuck patterns
    const analytics = this.engagementSystem.getAnalytics();
    const stuckPoints = analytics.patterns.stuckPoints || [];

    if (stuckPoints > 0) {
      response += " I'm going to ask something that might feel edgy: ";
      response += this.generateProvocation(input, analytics.patterns);
    } else {
      // General provocation
      response += " What if the thing you're avoiding is exactly where the medicine lives?";
    }

    return {
      message: response,
      mode: 'provoking',
      depth: Math.max(presence.depth, 0.7),
      tracking: {} as any
    };
  }

  /**
   * Generate invoking response (calling forth depth)
   */
  private async generateInvokingResponse(input: string, presence: any): Promise<SacredOracleResponse> {
    // Use anamnesis layer for deep remembering
    const wisdomInquiry = this.anamnesisLayer.generateAnamnesisResponse(
      input,
      presence,
      true
    );

    let response: string;

    if (wisdomInquiry) {
      // Bridge witnessing with deep inquiry
      const witness = this.witnessingCore.generateWitnessingResponse(input, presence);
      response = this.anamnesisLayer.generateBridge(
        witness.reflection,
        wisdomInquiry.inquiry
      );

      // Add spaciousness
      response = this.anamnesisLayer.addSpacousness(
        response,
        wisdomInquiry.spaciousness
      );
    } else {
      // Default invoking
      response = "There's something deeper here calling to be remembered. What does your soul know about this?";
    }

    return {
      message: response,
      mode: 'invoking',
      depth: Math.max(presence.depth, 0.8),
      tracking: {} as any
    };
  }

  /**
   * Helper methods for generating mode-specific content
   */

  private generateStructuredAdvice(input: string, patterns: any): string {
    const steps = [
      "First, acknowledge what you're feeling without trying to change it.",
      "Second, identify what you can control versus what you can't.",
      "Third, take one small action in alignment with your values.",
      "Finally, trust the process to unfold in its own timing."
    ];

    // Customize based on elemental tendency
    if (patterns.dominantElement === 'air') {
      steps[0] = "First, step back and observe the situation objectively.";
    } else if (patterns.dominantElement === 'fire') {
      steps[2] = "Third, channel this energy into transformative action.";
    }

    return steps.join(" ");
  }

  private generateFlowingAdvice(input: string, patterns: any): string {
    const adviceTemplates = {
      air: "Trust your ability to see clearly. The perspective you need is already within you.",
      fire: "Let this intensity move through you and transform what needs changing.",
      water: "Follow the feeling. It knows where it needs to flow.",
      earth: "Ground into what's real and solid. Build from there.",
      aether: "You're seeing the bigger picture. Trust the integration happening."
    };

    const element = patterns.dominantElement || 'aether';
    return adviceTemplates[element as keyof typeof adviceTemplates];
  }

  private generateElementalGuidance(element: string, input: string): string {
    const guidance: Record<string, string> = {
      air: "Try writing out your thoughts to see them clearly. Sometimes the mind needs to externalize to understand.",
      fire: "This calls for action. What's one bold step you could take right now?",
      water: "Let yourself feel this fully. Set a timer for 10 minutes and just be with the emotion.",
      earth: "Return to your body. Take 5 deep breaths, feel your feet on the ground.",
      aether: "Zoom out. How does this situation look from the perspective of your whole life journey?"
    };

    return guidance[element] || "Start with what feels most true and follow that thread.";
  }

  private generateProvocation(input: string, patterns: any): string {
    const provocations = [
      "What if this pattern is actually serving you in some way?",
      "What are you getting from staying stuck here?",
      "If you knew you couldn't fail, what would you do?",
      "What would happen if you did the opposite of what you usually do?",
      "Who would you be without this story?",
      "What if the problem isn't what you think it is?",
      "What are you pretending not to know?"
    ];

    // Select based on developmental stage
    if (patterns.developmentalStage === 'transforming' || patterns.developmentalStage === 'integrating') {
      return provocations[provocations.length - 1]; // Deepest provocation
    }

    return provocations[Math.floor(Math.random() * (provocations.length - 2))];
  }

  /**
   * Get comprehensive analytics
   */
  getAnalytics(): any {
    return {
      engagement: this.engagementSystem.getAnalytics(),
      conversation: this.contextManager.getAnalytics(),
      paradigm: 'Intelligent Witnessing',
      description: 'Sacred mirroring with sophisticated tracking and calibrated engagement'
    };
  }

  /**
   * Reset for new session
   */
  resetSession(): void {
    this.contextManager = new ConversationContextManager();
    // Note: We don't reset engagement tracking - it persists across sessions
  }
}

// Lazy-loaded singleton to avoid initialization issues
import { createLazyGetter } from './lazy-loader';

let _sacredOracleCore: SacredOracleCore | null = null;

export const getSacredOracleCore = createLazyGetter(
  () => {
    if (!_sacredOracleCore) {
      _sacredOracleCore = new SacredOracleCore();
    }
    return _sacredOracleCore;
  },
  'SacredOracleCore'
);