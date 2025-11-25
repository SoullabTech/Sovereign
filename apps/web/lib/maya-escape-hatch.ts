/**
 * Maya Escape Hatch - Crisis & Directive Request Handler
 * Maintains witness paradigm while providing safety net
 */

export interface EscapeHatchTrigger {
  userId: string;
  sessionId: string;
  triggerType: 'crisis' | 'explicit_help' | 'frustration' | 'confusion';
  userMessage: string;
  timestamp: Date;
  resolved: boolean;
}

export class MayaEscapeHatch {
  // Crisis keywords that trigger immediate safety response
  private static readonly CRISIS_INDICATORS = [
    'want to die',
    'kill myself', 
    'end it all',
    'not worth living',
    'suicide',
    'self harm',
    'hurt myself'
  ];

  // Explicit help demand patterns
  private static readonly HELP_DEMANDS = [
    'just tell me what to do',
    'give me advice',
    'what should i do',
    'tell me the answer',
    'stop asking questions',
    'be more helpful',
    'you\'re not helping'
  ];

  // Frustration indicators
  private static readonly FRUSTRATION_SIGNALS = [
    'this is stupid',
    'waste of time',
    'you don\'t understand',
    'forget it',
    'never mind',
    'this isn\'t working'
  ];

  /**
   * Detect if escape hatch should activate
   */
  static detectTrigger(message: string): {
    triggered: boolean;
    type?: 'crisis' | 'explicit_help' | 'frustration';
    confidence: number;
  } {
    const lower = message.toLowerCase();

    // Check crisis first (highest priority)
    if (this.CRISIS_INDICATORS.some(indicator => lower.includes(indicator))) {
      return { triggered: true, type: 'crisis', confidence: 1.0 };
    }

    // Check explicit help demands
    if (this.HELP_DEMANDS.some(demand => lower.includes(demand))) {
      return { triggered: true, type: 'explicit_help', confidence: 0.9 };
    }

    // Check frustration signals
    if (this.FRUSTRATION_SIGNALS.some(signal => lower.includes(signal))) {
      return { triggered: true, type: 'frustration', confidence: 0.7 };
    }

    return { triggered: false, confidence: 0 };
  }

  /**
   * Generate appropriate escape hatch response
   */
  static getResponse(triggerType: 'crisis' | 'explicit_help' | 'frustration'): {
    response: string;
    shouldContinueWitnessing: boolean;
    metadata: any;
  } {
    switch (triggerType) {
      case 'crisis':
        return {
          response: `I notice this feels really heavy right now. Your safety matters deeply.

If you're in immediate danger, please reach out to:
- Crisis Text Line: Text HOME to 741741
- National Suicide Prevention Lifeline: 988
- Emergency Services: 911

I'm still here to witness whatever you're experiencing, but these resources can provide immediate support.`,
          shouldContinueWitnessing: true,
          metadata: { 
            crisisResourcesProvided: true,
            continueSession: true 
          }
        };

      case 'explicit_help':
        return {
          response: `I hear you wanting clear direction. I notice the pull for answers.

I can offer more structured reflection if that would help - though I'm designed to witness rather than direct. 

Would you like me to:
- Help you explore what you already know about this
- Reflect back the patterns I'm noticing
- Or simply be here with the uncertainty?

What would serve you right now?`,
          shouldContinueWitnessing: true,
          metadata: {
            paradigmNegotiation: true,
            offeredAlternatives: true
          }
        };

      case 'frustration':
        return {
          response: `I can feel the frustration here. That's completely valid.

Maybe this witnessing approach isn't what you need right now, and that's okay. 

Would it help if I shared what I'm noticing in what you've shared? Or would you prefer to express more of what's not working?`,
          shouldContinueWitnessing: true,
          metadata: {
            frustrationAcknowledged: true,
            relationshipCheck: true
          }
        };
    }
  }

  /**
   * Provide ONE directive response when absolutely needed
   * Then return to witnessing
   */
  static getDirectiveResponse(context: string): string {
    // This would analyze context and provide specific guidance
    // Keeping it simple for the example
    return `Based on what you've shared, one approach might be to start with the smallest, most manageable piece of this situation. 

[Specific directive based on context]

Now that we've addressed the immediate need - what does having this direction reveal to you about what you already knew?`;
  }

  /**
   * Track escape hatch usage for beta insights
   */
  static logTrigger(trigger: EscapeHatchTrigger): void {
    // In production, this would send to analytics
    console.log('🚨 Escape Hatch Triggered:', {
      userId: trigger.userId,
      type: trigger.triggerType,
      timestamp: trigger.timestamp,
      message: trigger.userMessage.substring(0, 50) + '...'
    });
  }
}

/**
 * Integration with PersonalOracleAgent
 * 
 * In PersonalOracleAgent.consult():
 * 
 * const escapeCheck = MayaEscapeHatch.detectTrigger(query.input);
 * if (escapeCheck.triggered) {
 *   const hatchResponse = MayaEscapeHatch.getResponse(escapeCheck.type!);
 *   
 *   MayaEscapeHatch.logTrigger({
 *     userId: query.userId,
 *     sessionId: query.sessionId || '',
 *     triggerType: escapeCheck.type!,
 *     userMessage: query.input,
 *     timestamp: new Date(),
 *     resolved: false
 *   });
 *   
 *   // Modify response accordingly
 *   // Track for beta analysis
 * }
 */