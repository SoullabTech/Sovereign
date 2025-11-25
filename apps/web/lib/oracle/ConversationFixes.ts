/**
 * Unified Conversation Intelligence System
 * Combines active listening, memory, contextual selection, and validation
 */

import { ConversationIntelligenceEngine } from './ConversationIntelligenceEngine';
import { QuadrantalResponseGenerator } from './QuadrantalResponseGenerator';

export class ConversationFixes {
  private intelligenceEngine = new ConversationIntelligenceEngine();
  private quadrantalGenerator = new QuadrantalResponseGenerator();
  private debugMode = true;
  private lastResponses: string[] = [];
  private lastResponseReason = '';

  /**
   * Unified Intelligence Response Generation
   * Combines active listening + memory + contextual selection + validation
   */
  generateResponse(userInput: string): { response: string; reason: string } {
    // Generate intelligent response using unified engine
    const intelligentResponse = this.intelligenceEngine.generateResponse(userInput);

    // Track response for fallback system
    this.lastResponses.push(intelligentResponse.response);
    this.lastResponseReason = intelligentResponse.reason;

    // Maintain response history for pattern detection
    if (this.lastResponses.length > 5) {
      this.lastResponses.shift();
    }

    // Check if intelligence engine provided a high-quality response
    if (intelligentResponse.confidence > 0.7 || intelligentResponse.memoryUsed) {
      const finalResponse = this.debugMode && intelligentResponse.contextAdjustments.length > 0 ?
        `[${intelligentResponse.technique}] ${intelligentResponse.response}` :
        intelligentResponse.response;

      return {
        response: finalResponse,
        reason: intelligentResponse.reason
      };
    }

    // Fallback to quadrantal response generation for lower confidence cases
    const quadrantalResponse = this.quadrantalGenerator.generate(userInput, {}, '', 1);

    return {
      response: this.debugMode ? `[quadrantal] ${quadrantalResponse.response}` : quadrantalResponse.response,
      reason: '[quadrantal-fallback]'
    };
  }

  /**
   * Enable/disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  /**
   * Get intelligence engine snapshot for debugging
   */
  debugSnapshot(): void {
    console.log('🤖 CONVERSATION INTELLIGENCE DEBUG');
    this.intelligenceEngine.debugSnapshot();
  }

  /**
   * Get response generation stats
   */
  getStats(): any {
    return {
      totalResponses: this.lastResponses.length,
      lastReason: this.lastResponseReason,
      debugMode: this.debugMode
    };
  }

  /**
   * Reset conversation state
   */
  reset(): void {
    this.lastResponses = [];
    this.lastResponseReason = '';
    // Intelligence engine manages its own reset through memory
  }
}

// Export singleton instance for use in other modules
export const conversationFixes = new ConversationFixes();
