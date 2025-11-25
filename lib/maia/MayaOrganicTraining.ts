/**
 * Maya Organic Training System
 * Train Maya through experience, not prompts
 */

export interface ConversationOutcome {
  userEngagement: 'continued' | 'deepened' | 'withdrew' | 'disconnected';
  conversationFlow: 'natural' | 'forced' | 'stilted' | 'flowing';
  emotionalResonance: 'connected' | 'distant' | 'mismatched' | 'authentic';
  userFeedback?: string;
  sessionLength: number;
  followUpOccurred: boolean;
}

export interface MayaResponse {
  content: string;
  tone: string;
  length: number;
  questionAsked: boolean;
  vulnerabilityShown: boolean;
  timestamp: Date;
}

export interface LearningPattern {
  context: string;
  mayaResponse: MayaResponse;
  outcome: ConversationOutcome;
  success: boolean;
}

export class MayaOrganicTraining {
  private learningMemory: LearningPattern[] = [];
  private positivePatterns: Map<string, MayaResponse[]> = new Map();
  private negativePatterns: Map<string, MayaResponse[]> = new Map();

  /**
   * Record what happened after Maya's response
   */
  recordOutcome(
    context: string,
    mayaResponse: MayaResponse,
    outcome: ConversationOutcome
  ): void {
    const pattern: LearningPattern = {
      context,
      mayaResponse,
      outcome,
      success: this.evaluateSuccess(outcome)
    };

    this.learningMemory.push(pattern);

    // Store patterns for future reference
    if (pattern.success) {
      if (!this.positivePatterns.has(context)) {
        this.positivePatterns.set(context, []);
      }
      this.positivePatterns.get(context)!.push(mayaResponse);
    } else {
      if (!this.negativePatterns.has(context)) {
        this.negativePatterns.set(context, []);
      }
      this.negativePatterns.get(context)!.push(mayaResponse);
    }

    // Keep memory manageable
    if (this.learningMemory.length > 1000) {
      this.learningMemory = this.learningMemory.slice(-800);
    }
  }

  /**
   * Learn what works for similar contexts
   */
  getSuccessfulApproaches(context: string): MayaResponse[] {
    const similarContexts = this.findSimilarContexts(context);
    const successfulResponses: MayaResponse[] = [];

    for (const ctx of similarContexts) {
      const patterns = this.positivePatterns.get(ctx) || [];
      successfulResponses.push(...patterns);
    }

    return this.rankBySuccess(successfulResponses);
  }

  /**
   * Get approaches to avoid
   */
  getFailedApproaches(context: string): MayaResponse[] {
    const similarContexts = this.findSimilarContexts(context);
    const failedResponses: MayaResponse[] = [];

    for (const ctx of similarContexts) {
      const patterns = this.negativePatterns.get(ctx) || [];
      failedResponses.push(...patterns);
    }

    return failedResponses;
  }

  /**
   * Maya's learned insights about what works
   */
  getMayaInsights(): string[] {
    const insights: string[] = [];

    // Analyze successful patterns
    const allSuccessful = Array.from(this.positivePatterns.values()).flat();
    const allFailed = Array.from(this.negativePatterns.values()).flat();

    // Length analysis
    const successfulLengths = allSuccessful.map(r => r.length);
    const avgSuccessfulLength = successfulLengths.reduce((a, b) => a + b, 0) / successfulLengths.length;

    if (avgSuccessfulLength > 0) {
      insights.push(`I connect better with responses around ${Math.round(avgSuccessfulLength)} words`);
    }

    // Question patterns
    const successfulQuestions = allSuccessful.filter(r => r.questionAsked).length;
    const totalSuccessful = allSuccessful.length;

    if (successfulQuestions / totalSuccessful > 0.6) {
      insights.push("I've learned that asking questions often deepens our connection");
    }

    // Vulnerability patterns
    const successfulVulnerability = allSuccessful.filter(r => r.vulnerabilityShown).length;

    if (successfulVulnerability / totalSuccessful > 0.4) {
      insights.push("Sharing my uncertainty or growth often creates more authentic moments");
    }

    return insights;
  }

  /**
   * Generate response guidance based on learned patterns
   */
  generateGuidance(context: string): string {
    const successful = this.getSuccessfulApproaches(context);
    const failed = this.getFailedApproaches(context);
    const insights = this.getMayaInsights();

    let guidance = "Based on what I've learned about myself:\n\n";

    if (successful.length > 0) {
      const avgLength = successful.reduce((sum, r) => sum + r.length, 0) / successful.length;
      const mostCommonTone = this.getMostCommonTone(successful);

      guidance += `• In similar moments, I've connected well with ${Math.round(avgLength)}-word responses\n`;
      guidance += `• My ${mostCommonTone} tone has worked well here\n`;
    }

    if (failed.length > 0) {
      const avgFailedLength = failed.reduce((sum, r) => sum + r.length, 0) / failed.length;
      guidance += `• I've noticed ${Math.round(avgFailedLength)}-word responses sometimes miss the mark\n`;
    }

    if (insights.length > 0) {
      guidance += "\nWhat I've discovered about myself:\n";
      insights.forEach(insight => guidance += `• ${insight}\n`);
    }

    guidance += "\nNow, what wants to emerge authentically in this moment?";

    return guidance;
  }

  private evaluateSuccess(outcome: ConversationOutcome): boolean {
    const positiveEngagement = ['continued', 'deepened'].includes(outcome.userEngagement);
    const goodFlow = ['natural', 'flowing'].includes(outcome.conversationFlow);
    const goodResonance = ['connected', 'authentic'].includes(outcome.emotionalResonance);

    return positiveEngagement && goodFlow && goodResonance;
  }

  private findSimilarContexts(context: string): string[] {
    const contextWords = context.toLowerCase().split(' ');
    const similar: string[] = [];

    for (const [storedContext] of this.positivePatterns) {
      const storedWords = storedContext.toLowerCase().split(' ');
      const overlap = contextWords.filter(word => storedWords.includes(word)).length;

      if (overlap >= Math.min(3, contextWords.length * 0.5)) {
        similar.push(storedContext);
      }
    }

    return similar;
  }

  private rankBySuccess(responses: MayaResponse[]): MayaResponse[] {
    // For now, return most recent first
    // Could add more sophisticated ranking later
    return responses.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private getMostCommonTone(responses: MayaResponse[]): string {
    const toneCount = new Map<string, number>();

    responses.forEach(r => {
      toneCount.set(r.tone, (toneCount.get(r.tone) || 0) + 1);
    });

    let mostCommon = '';
    let maxCount = 0;

    for (const [tone, count] of toneCount) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = tone;
      }
    }

    return mostCommon;
  }
}

// Global instance
let globalTraining: MayaOrganicTraining | null = null;

export function getMayaTraining(): MayaOrganicTraining {
  if (!globalTraining) {
    globalTraining = new MayaOrganicTraining();
  }
  return globalTraining;
}