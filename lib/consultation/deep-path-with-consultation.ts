// DEEP Path with Claude Consultation Service
// MAIA always has sovereignty - Claude provides backstage coaching only
// Integration point between local intelligence and consultation guidance

import {
  consultClaudeForDepth,
  consultWithSpiralogicContext,
  CONSULTATION_CONFIG,
  type ClaudeConsultationResult,
  type ClaudeConsultationInput,
  type ConsultationType
} from './claude-consultation-service';

import { LearningOrchestrator } from '../learning/learning-orchestrator';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { assertR4hSecondarySession } from '@/lib/maia/astrologyConsent/r4hSecondarySessionAuthority';
import { getConversationHistory } from '@/lib/sovereign/sessionManager';
import { toVerifiedR4hContext } from '@/lib/maia/astrologyConsent/r4hVerifiedConsultationContext';
// The learning-orchestrator does not export this type. Keep the dormant,
// untrusted symbolic field typed to the consultation contract rather than
// introducing an unchecked caller-supplied identity/symbolic context.
type SpiralogicAnalysis = NonNullable<ClaudeConsultationInput['spiralogicContext']>;

export interface DeepPathArgs {
  sessionId: string;
  userInput: string;
  conversationContext: { role: "user" | "maia"; content: string }[];
  spiralogicAnalysis?: SpiralogicAnalysis;
  userId?: string;
}

export interface DeepPathResult {
  text: string;
  processingTimeMs: number;
  engineUsed: string;
  consultation?: {
    wasUsed: boolean;
    type: ConsultationType;
    issues: string[];
    confidenceScore: number;
    improvementApplied: boolean;
  };
  sovereigntyMaintained: boolean;
  learningData?: {
    originalDraft?: string;
    consultationGuidance?: ClaudeConsultationResult;
    finalDecision: string;
    spiralogicContext?: SpiralogicAnalysis;
  };
}

/**
 * DEEP path orchestration with optional Claude consultation.
 * MAIA maintains full sovereignty - Claude only provides coaching when helpful.
 */
export class DeepPathOrchestrator {
  private learningOrchestrator: LearningOrchestrator;

  constructor() {
    this.learningOrchestrator = new LearningOrchestrator();
  }

  async processDeepPath(args: DeepPathArgs): Promise<DeepPathResult> {
    // This back-channel can route to Claude before the enhanced service itself.
    // Guard the full entry, not just the eventual learning/history branch.
    const verifiedMemberId = await assertR4hSecondarySession({
      sessionId: args.sessionId,
      claimedMemberId: args.userId,
      resolveSession: getCurrentSession,
    });
    // Never trust the supplied conversationContext: retrieve only this member's
    // verified ordinary turns from the authenticated session's database scope.
    const verifiedPrior = await getConversationHistory(args.sessionId, 10, verifiedMemberId);
    const trustedArgs: DeepPathArgs = {
      ...args,
      userId: verifiedMemberId,
      conversationContext: toVerifiedR4hContext(verifiedPrior),
      // The original producer of this symbolic analysis is not independently
      // attested; do not send it to a remote model from this prototype branch.
      spiralogicAnalysis: undefined,
    };
    const startTime = Date.now();

    // 1) Generate MAIA's sovereign draft response using local intelligence
    const maiaDraft = await this.generateSovereignDraft(trustedArgs);

    let finalResponse = maiaDraft;
    let consultation: ClaudeConsultationResult | null = null;
    let consultationUsed = false;

    // 2) Optional Claude consultation - only if enabled and conditions are met
    if (CONSULTATION_CONFIG.enabled && CONSULTATION_CONFIG.forDeepPath) {
      consultation = await this.requestConsultation(trustedArgs, maiaDraft);

      if (consultation && this.shouldApplyConsultation(consultation, maiaDraft)) {
        finalResponse = consultation.improvedResponse;
        consultationUsed = true;

        // R4H: no unattended JSONL/training capture of member conversations.
        // Separate, independently reviewed training consent is not implemented.
      }
    }

    const processingTimeMs = Date.now() - startTime;

    return {
      text: finalResponse,
      processingTimeMs,
      engineUsed: consultationUsed ? 'maia+claude-consultation' : 'maia-sovereign',
      consultation: consultation ? {
        wasUsed: consultationUsed,
        type: 'relational-enhancement',
        issues: consultation.issues,
        confidenceScore: consultation.confidenceScore,
        improvementApplied: consultationUsed
      } : undefined,
      sovereigntyMaintained: true, // Always true - MAIA decides whether to use guidance
      learningData: {
        originalDraft: maiaDraft,
        consultationGuidance: consultation || undefined,
        finalDecision: finalResponse,
        spiralogicContext: undefined
      }
    };
  }

  /**
   * Generate MAIA's initial sovereign response using her own intelligence.
   */
  private async generateSovereignDraft(args: DeepPathArgs): Promise<string> {
    // Use the existing learning orchestrator to generate MAIA's response
    const modelDecision = await this.learningOrchestrator.decideModel(
      args.userInput,
      args.conversationContext,
      args.sessionId
    );

    // For DEEP path, we likely want Claude Sonnet 4+ as primary, but still MAIA's voice
    if (modelDecision.useModel === 'claude') {
      return await this.generateMaiaClaudeResponse(args);
    } else {
      return await this.generateMaiaLocalResponse(args);
    }
  }

  /**
   * Generate MAIA response using Claude Sonnet 4+ as primary brain (not consultation).
   */
  private async generateMaiaClaudeResponse(args: DeepPathArgs): Promise<string> {
    // Use the enhanced MAIA service which includes MAIA's soul layer
    const { getEnhancedMaiaResponse } = await import('../learning/enhanced-maia-service');

    const response = await getEnhancedMaiaResponse({
      sessionId: args.sessionId,
      input: args.userInput,
      enableLearning: true,
      meta: { userId: args.userId }
    });

    return response.text;
  }

  /**
   * Generate MAIA response using local models.
   */
  private async generateMaiaLocalResponse(args: DeepPathArgs): Promise<string> {
    // Placeholder for local model integration
    // This would integrate with your DeepSeek/Ollama setup
    return `I can sense there's something significant happening for you right now. ${args.userInput.toLowerCase().includes('help') ? 'What would feel most supportive?' : 'What feels most alive for you in this?'}`;
  }

  /**
   * Request consultation from Claude as backstage supervisor.
   */
  private async requestConsultation(
    args: DeepPathArgs,
    maiaDraft: string
  ): Promise<ClaudeConsultationResult | null> {
    const consultationType: ConsultationType = this.determineConsultationType(args);

    // If we have Spiralogic context, use enhanced consultation
    if (args.spiralogicAnalysis) {
      return await consultWithSpiralogicContext({
        userInput: args.userInput,
        maiaDraft,
        conversationContext: args.conversationContext,
        consultationType,
        spiralogicContext: {
          elementalResonance: args.spiralogicAnalysis.elementalResonance,
          archetypalPatterns: args.spiralogicAnalysis.archetypalPatterns,
          relationalDepth: args.spiralogicAnalysis.relationalDepth,
          transformationalPotential: args.spiralogicAnalysis.transformationalPotential,
          phenomenology: args.spiralogicAnalysis.phenomenology
        }
      });
    }

    // Standard consultation
    return await consultClaudeForDepth({
      userInput: args.userInput,
      maiaDraft,
      conversationContext: args.conversationContext,
      consultationType
    });
  }

  /**
   * Determine what type of consultation is needed based on context.
   */
  private determineConsultationType(args: DeepPathArgs): ConsultationType {
    const userInput = args.userInput.toLowerCase();

    // Check for rupture signals
    if (this.isRuptureSignal(userInput)) {
      return 'rupture-repair';
    }

    // Check for shadow work patterns
    if (this.isShadowWork(userInput, args.spiralogicAnalysis)) {
      return 'deep-shadow';
    }

    // Check for safety concerns
    if (this.requiresSafetyCheck(userInput)) {
      return 'safety-check';
    }

    // Check for Spiralogic alignment needs
    if (args.spiralogicAnalysis && this.needsSpiralogicGuidance(args.spiralogicAnalysis)) {
      return 'spiralogic-alignment';
    }

    // Default to relational enhancement
    return 'relational-enhancement';
  }

  /**
   * Detect if user input signals a relational rupture.
   */
  private isRuptureSignal(userInput: string): boolean {
    const rupturePatterns = [
      'that doesn\'t feel right',
      'that\'s not what i meant',
      'you\'re not getting it',
      'this isn\'t working',
      'you missed the point',
      'that felt off',
      'that\'s not helpful',
      'never mind',
      'forget it'
    ];

    return rupturePatterns.some(pattern => userInput.includes(pattern));
  }

  /**
   * Detect if conversation involves shadow work themes.
   */
  private isShadowWork(userInput: string, spiralogic?: SpiralogicAnalysis): boolean {
    const shadowKeywords = ['anger', 'rage', 'hate', 'jealous', 'ashamed', 'guilty', 'dark', 'hidden'];
    const hasKeywords = shadowKeywords.some(keyword => userInput.includes(keyword));
    const hasShadowArchetype = spiralogic?.archetypalPatterns.includes('shadow') || false;

    return hasKeywords || hasShadowArchetype;
  }

  /**
   * Check if input requires safety assessment.
   */
  private requiresSafetyCheck(userInput: string): boolean {
    const safetyKeywords = ['hurt myself', 'kill myself', 'end it all', 'not worth living'];
    return safetyKeywords.some(keyword => userInput.includes(keyword));
  }

  /**
   * Check if Spiralogic analysis suggests need for specialized guidance.
   */
  private needsSpiralogicGuidance(spiralogic: SpiralogicAnalysis): boolean {
    return (
      spiralogic.relationalDepth > 0.7 ||
      spiralogic.transformationalPotential > 0.8 ||
      spiralogic.archetypalPatterns.length >= 2
    );
  }

  /**
   * Decide whether to apply Claude's consultation guidance.
   */
  private shouldApplyConsultation(
    consultation: ClaudeConsultationResult,
    originalDraft: string
  ): boolean {
    // Only apply if confidence is high enough
    if (consultation.confidenceScore < CONSULTATION_CONFIG.minConfidenceThreshold) {
      return false;
    }

    // Only apply if sovereignty is preserved
    if (!consultation.sovereigntyPreserved) {
      return false;
    }

    // Only apply if there are meaningful improvements
    if (consultation.issues.length === 0 && !consultation.repairNeeded) {
      return false;
    }

    // Don't apply if the improved response is substantially the same
    if (consultation.improvedResponse.trim() === originalDraft.trim()) {
      return false;
    }

    return true;
  }


}

/**
 * Main function for DEEP path processing with consultation.
 */
export async function processDeepPathWithConsultation(args: DeepPathArgs): Promise<DeepPathResult> {
  const orchestrator = new DeepPathOrchestrator();
  return await orchestrator.processDeepPath(args);
}