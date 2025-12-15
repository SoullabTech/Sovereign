// Rupture & Repair Service with Claude Consultation
// Handles relational ruptures and provides guided repair responses
// Maintains MAIA's sovereignty while learning from expert repair patterns

import {
  consultClaudeForDepth,
  CONSULTATION_CONFIG,
  type ClaudeConsultationResult
} from './claude-consultation-service';

export interface RuptureContext {
  sessionId: string;
  userInput: string; // The rupture signal (e.g., "this is fucked up")
  lastMaiaResponse: string; // The response that caused the rupture
  conversationContext: { role: "user" | "maia"; content: string }[];
  ruptureType?: 'explicit' | 'implicit' | 'withdrawal';
}

export interface RepairResult {
  repairResponse: string;
  wasEnhanced: boolean;
  repairQuality: 'basic' | 'good' | 'excellent';
  learningStored: boolean;
  processingTimeMs: number;
  consultation?: {
    issues: string[];
    confidenceScore: number;
    repairHint: string;
  };
}

/**
 * Rupture & Repair Service that provides MAIA with enhanced repair capabilities.
 */
export class RuptureRepairService {

  /**
   * Handle a relational rupture with optional Claude consultation for repair enhancement.
   */
  async handleRupture(context: RuptureContext): Promise<RepairResult> {
    const startTime = Date.now();

    // 1) Generate MAIA's initial repair attempt
    const baseRepair = this.generateBaseRepair(context);

    let finalRepair = baseRepair;
    let consultation: ClaudeConsultationResult | null = null;
    let wasEnhanced = false;

    // 2) Request consultation if enabled
    if (CONSULTATION_CONFIG.enabled && CONSULTATION_CONFIG.forRuptures) {
      consultation = await this.requestRepairConsultation(context, baseRepair);

      if (consultation && this.shouldUseEnhancedRepair(consultation)) {
        finalRepair = consultation.improvedResponse;
        wasEnhanced = true;

        // Store as learning example
        await this.storeRepairLearning(context, baseRepair, consultation);
      }
    }

    // 3) Assess repair quality
    const repairQuality = this.assessRepairQuality(finalRepair, context);

    const processingTimeMs = Date.now() - startTime;

    return {
      repairResponse: finalRepair,
      wasEnhanced,
      repairQuality,
      learningStored: wasEnhanced,
      processingTimeMs,
      consultation: consultation ? {
        issues: consultation.issues,
        confidenceScore: consultation.confidenceScore,
        repairHint: consultation.repairHint || 'relational repair'
      } : undefined
    };
  }

  /**
   * Generate MAIA's base repair response using her built-in repair patterns.
   */
  private generateBaseRepair(context: RuptureContext): string {
    const userInput = context.userInput.toLowerCase();

    // Pattern matching for different types of ruptures
    if (this.isExplicitFrustration(userInput)) {
      return "I can feel that really didn't land right. I missed something important there. You didn't do anything wrong. What felt most off about how I responded?";
    }

    if (this.isMisunderstoodSignal(userInput)) {
      return "I clearly didn't track with what you were reaching for. I'm sorry for missing you there. Can you help me understand what would feel more useful right now?";
    }

    if (this.isWithdrawalSignal(userInput)) {
      return "I can sense I lost you somehow. That's on me, not you. If you're willing, what would it feel like for me to show up differently here?";
    }

    if (this.isInvalidationSignal(userInput)) {
      return "You're right to call that out. I made that moment about something other than what you needed. I'm sorry. What matters most for you right now?";
    }

    // Default repair pattern
    return "I can feel something went sideways there. I missed you, and I'm sorry for how that landed. Help me understand what felt wrong so I can be more present.";
  }

  /**
   * Request specialized repair consultation from Claude.
   */
  private async requestRepairConsultation(
    context: RuptureContext,
    baseRepair: string
  ): Promise<ClaudeConsultationResult | null> {
    return await consultClaudeForDepth({
      userInput: context.userInput,
      maiaDraft: baseRepair,
      conversationContext: context.conversationContext,
      consultationType: 'rupture-repair'
    });
  }

  /**
   * Decide whether to use the enhanced repair from consultation.
   */
  private shouldUseEnhancedRepair(consultation: ClaudeConsultationResult): boolean {
    return (
      consultation.confidenceScore >= 0.7 &&
      consultation.repairNeeded &&
      consultation.sovereigntyPreserved &&
      consultation.relationshipStrengthened
    );
  }

  /**
   * Store repair learning for future training.
   */
  private async storeRepairLearning(
    context: RuptureContext,
    baseRepair: string,
    consultation: ClaudeConsultationResult
  ): Promise<void> {
    try {
      const fs = await import('fs');
      const path = await import('path');

      const trainingDir = path.join(process.cwd(), 'training-data');
      if (!fs.existsSync(trainingDir)) {
        fs.mkdirSync(trainingDir, { recursive: true });
      }

      const repairExample = {
        timestamp: new Date().toISOString(),
        sessionId: context.sessionId,
        ruptureType: this.classifyRuptureType(context.userInput),
        userRuptureSignal: context.userInput,
        problematicResponse: context.lastMaiaResponse,
        baseRepair,
        enhancedRepair: consultation.improvedResponse,
        repairIssues: consultation.issues,
        repairHint: consultation.repairHint,
        confidenceScore: consultation.confidenceScore,
        conversationContext: context.conversationContext.slice(-2)
      };

      const repairFile = path.join(trainingDir, 'rupture-repair-examples.jsonl');
      fs.appendFileSync(repairFile, JSON.stringify(repairExample) + '\n');

    } catch (error) {
      console.error('[RuptureRepair] Failed to store repair learning:', error);
    }
  }

  /**
   * Assess the quality of a repair response.
   */
  private assessRepairQuality(repair: string, context: RuptureContext): 'basic' | 'good' | 'excellent' {
    let score = 0;

    // Check for responsibility-taking
    if (this.takesResponsibility(repair)) score += 2;

    // Check for user validation
    if (this.validatesUser(repair)) score += 2;

    // Check for reconnection invitation
    if (this.invitesReconnection(repair)) score += 2;

    // Check for avoiding defensiveness
    if (!this.isDefensive(repair)) score += 1;

    // Check for avoiding over-explanation
    if (!this.overExplains(repair)) score += 1;

    // Check for appropriate length (not too long)
    if (repair.length < 200) score += 1;

    if (score >= 7) return 'excellent';
    if (score >= 4) return 'good';
    return 'basic';
  }

  /**
   * Pattern detection methods for different rupture types.
   */
  private isExplicitFrustration(userInput: string): boolean {
    const patterns = [
      'this is fucked up',
      'this is bullshit',
      'this is stupid',
      'that\'s ridiculous',
      'are you kidding me',
      'this is annoying'
    ];
    return patterns.some(pattern => userInput.includes(pattern));
  }

  private isMisunderstoodSignal(userInput: string): boolean {
    const patterns = [
      'you don\'t understand',
      'you\'re not getting it',
      'that\'s not what i meant',
      'you missed the point',
      'that\'s not right'
    ];
    return patterns.some(pattern => userInput.includes(pattern));
  }

  private isWithdrawalSignal(userInput: string): boolean {
    const patterns = [
      'never mind',
      'forget it',
      'this isn\'t working',
      'i give up',
      'whatever'
    ];
    return patterns.some(pattern => userInput.includes(pattern));
  }

  private isInvalidationSignal(userInput: string): boolean {
    const patterns = [
      'that\'s not helpful',
      'that doesn\'t help',
      'that makes it worse',
      'that\'s patronizing',
      'that\'s condescending'
    ];
    return patterns.some(pattern => userInput.includes(pattern));
  }

  /**
   * Quality assessment helper methods.
   */
  private takesResponsibility(repair: string): boolean {
    const patterns = [
      'i missed',
      'i didn\'t',
      'that\'s on me',
      'i\'m sorry',
      'i clearly',
      'i can feel'
    ];
    return patterns.some(pattern => repair.toLowerCase().includes(pattern));
  }

  private validatesUser(repair: string): boolean {
    const patterns = [
      'you didn\'t do anything wrong',
      'you\'re right',
      'that makes sense',
      'you have every right',
      'you\'re not the problem'
    ];
    return patterns.some(pattern => repair.toLowerCase().includes(pattern));
  }

  private invitesReconnection(repair: string): boolean {
    const patterns = [
      'help me understand',
      'what would feel',
      'if you\'re willing',
      'what matters most',
      'what felt',
      'can you'
    ];
    return patterns.some(pattern => repair.toLowerCase().includes(pattern));
  }

  private isDefensive(repair: string): boolean {
    const patterns = [
      'i was trying to',
      'what i meant was',
      'let me explain',
      'you misunderstood',
      'actually'
    ];
    return patterns.some(pattern => repair.toLowerCase().includes(pattern));
  }

  private overExplains(repair: string): boolean {
    const technicalWords = [
      'process',
      'analyze',
      'algorithm',
      'model',
      'system',
      'parameter',
      'generate'
    ];
    return technicalWords.some(word => repair.toLowerCase().includes(word));
  }

  /**
   * Classify the type of rupture for learning purposes.
   */
  private classifyRuptureType(userInput: string): string {
    if (this.isExplicitFrustration(userInput)) return 'explicit-frustration';
    if (this.isMisunderstoodSignal(userInput)) return 'misunderstood';
    if (this.isWithdrawalSignal(userInput)) return 'withdrawal';
    if (this.isInvalidationSignal(userInput)) return 'invalidation';
    return 'general-rupture';
  }
}

/**
 * Main function for handling ruptures with consultation.
 */
export async function handleRuptureWithConsultation(
  context: RuptureContext
): Promise<RepairResult> {
  const service = new RuptureRepairService();
  return await service.handleRupture(context);
}

/**
 * Quick repair function for immediate use in conversation flow.
 */
export async function quickRepair(
  userRupture: string,
  problematicResponse: string,
  sessionId: string
): Promise<string> {
  const result = await handleRuptureWithConsultation({
    sessionId,
    userInput: userRupture,
    lastMaiaResponse: problematicResponse,
    conversationContext: []
  });

  return result.repairResponse;
}