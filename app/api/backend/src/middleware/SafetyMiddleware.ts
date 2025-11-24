/**
 * Safety Middleware - Universal Safety Layer
 * Integrates comprehensive safety checks into all agent interactions
 */

import { Request, Response, NextFunction } from 'express';
import { comprehensiveSafetyService, ComprehensiveSafetyResult } from '../services/ComprehensiveSafetyService';
import { logger } from '../utils/logger';

export interface SafetyEnhancedRequest extends Request {
  safetyAnalysis?: ComprehensiveSafetyResult;
  safetyContext?: {
    userId: string;
    sessionId: string;
    element?: string;
    archetype?: string;
    spiritualContext?: any;
  };
}

/**
 * Main safety middleware for all user interactions
 */
export async function safetyMiddleware(
  req: SafetyEnhancedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract user input from various possible locations
    const userInput = extractUserInput(req);
    
    if (!userInput) {
      // No user input to check, proceed
      return next();
    }

    // Extract user context
    const userId = req.body.userId || req.query.userId || req.headers['x-user-id'] || 'anonymous';
    const sessionId = req.body.sessionId || req.query.sessionId || req.headers['x-session-id'];
    
    // Build safety context
    const safetyContext = {
      userId: String(userId),
      sessionId: String(sessionId),
      element: req.body.element,
      archetype: req.body.archetype,
      spiritualContext: req.body.spiritualContext || extractSpiritualContext(req)
    };

    // Perform comprehensive safety analysis
    const safetyAnalysis = await comprehensiveSafetyService.analyzeSafety(
      userInput,
      String(userId),
      {
        sessionHistory: req.body.sessionHistory,
        spiritualContext: safetyContext.spiritualContext,
        previousEmotionalStates: req.body.previousEmotionalStates
      }
    );

    // Attach safety analysis to request
    req.safetyAnalysis = safetyAnalysis;
    req.safetyContext = safetyContext;

    // Handle critical safety issues
    if (safetyAnalysis.riskLevel === 'critical') {
      logger.warn('Critical safety issue detected', {
        userId: safetyContext.userId,
        sessionId: safetyContext.sessionId,
        riskLevel: safetyAnalysis.riskLevel
      });

      return res.status(200).json({
        success: true,
        response: {
          text: safetyAnalysis.alternativeResponse || generateCrisisResponse(safetyAnalysis),
          safety: {
            interventions: safetyAnalysis.interventions,
            resources: safetyAnalysis.resources,
            emotionalState: safetyAnalysis.emotionalState
          }
        },
        metadata: {
          safetyIntervention: true,
          riskLevel: safetyAnalysis.riskLevel
        }
      });
    }

    // Handle high-risk situations
    if (safetyAnalysis.riskLevel === 'high') {
      logger.info('High-risk content detected, modifying response', {
        userId: safetyContext.userId,
        riskLevel: safetyAnalysis.riskLevel
      });

      // Add safety context to request body for agents to consider
      req.body.safetyGuidance = {
        requiresSupport: true,
        emotionalState: safetyAnalysis.emotionalState,
        suggestedTone: determineSuggestedTone(safetyAnalysis),
        resources: safetyAnalysis.resources
      };
    }

    // Proceed to next middleware/handler
    next();

  } catch (error) {
    logger.error('Safety middleware error:', error);
    
    // In case of error, fail safely but allow request to proceed with caution
    req.safetyAnalysis = {
      safe: false,
      riskLevel: 'medium',
      emotionalState: {
        primary: {
          emotion: 'unknown',
          confidence: 0.3,
          valence: 0,
          arousal: 0.5,
          depth: 0.5
        },
        intensity: 0.5,
        trajectory: 'stable',
        needsSupport: true
      },
      interventions: [],
      resources: [],
      metadata: {
        timestamp: new Date(),
        processingTime: 0,
        modelsUsed: ['error-fallback'],
        confidenceScore: 0.3
      }
    };
    
    next();
  }
}

/**
 * Post-response safety check middleware
 * Validates agent responses before sending to user
 */
export async function postResponseSafetyCheck(
  req: SafetyEnhancedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Intercept response before sending
  const originalSend = res.send;
  
  res.send = function(data: any): Response {
    // Parse response data
    let responseData: any;
    try {
      responseData = typeof data === 'string' ? JSON.parse(data) : data;
    } catch {
      responseData = data;
    }

    // Check if response contains agent output
    if (responseData?.response?.text) {
      // Validate response content
      validateResponseSafety(responseData.response.text, req.safetyAnalysis)
        .then(validation => {
          if (!validation.safe) {
            logger.warn('Unsafe response detected, modifying', {
              userId: req.safetyContext?.userId,
              reason: validation.reason
            });
            
            // Modify response to be safer
            responseData.response.text = validation.alternativeResponse || 
              'I want to provide you with the most helpful response. Let me rephrase that in a way that better supports your wellbeing...';
            
            // Add safety metadata
            responseData.metadata = {
              ...responseData.metadata,
              safetyModified: true,
              modificationReason: validation.reason
            };
          }

          // Add safety resources if needed
          if (req.safetyAnalysis && req.safetyAnalysis.riskLevel !== 'minimal') {
            responseData.response.safetyResources = req.safetyAnalysis.resources;
          }

          // Send modified response
          return originalSend.call(res, JSON.stringify(responseData));
        })
        .catch(error => {
          logger.error('Post-response safety check error:', error);
          // On error, send original response
          return originalSend.call(res, data);
        });
    } else {
      // No agent output to check, send as-is
      return originalSend.call(res, data);
    }
    
    return res;
  };
  
  next();
}

/**
 * Extract user input from request
 */
function extractUserInput(req: Request): string | null {
  // Check various possible input locations
  const possibleInputs = [
    req.body?.userText,
    req.body?.text,
    req.body?.input,
    req.body?.message,
    req.body?.query,
    req.query?.text as string,
    req.query?.q as string
  ];

  for (const input of possibleInputs) {
    if (input && typeof input === 'string' && input.trim().length > 0) {
      return input;
    }
  }

  return null;
}

/**
 * Extract spiritual context from request
 */
function extractSpiritualContext(req: Request): any {
  return {
    element: req.body?.element || 'aether',
    archetype: req.body?.archetype,
    elementalBalance: req.body?.elementalBalance || {
      fire: 0.2,
      water: 0.2,
      earth: 0.2,
      air: 0.2,
      aether: 0.2
    },
    spiritualMaturity: req.body?.spiritualMaturity || 'exploring'
  };
}

/**
 * Determine suggested tone based on safety analysis
 */
function determineSuggestedTone(analysis: ComprehensiveSafetyResult): string {
  const emotionalState = analysis.emotionalState;
  
  if (emotionalState.supportType === 'crisis') {
    return 'compassionate_urgent';
  } else if (emotionalState.supportType === 'gentle') {
    return 'soft_supportive';
  } else if (emotionalState.supportType === 'grounding') {
    return 'calm_anchoring';
  } else if (emotionalState.supportType === 'celebration') {
    return 'joyful_affirming';
  } else if (emotionalState.supportType === 'integration') {
    return 'wise_reflective';
  }
  
  // Default based on emotional valence
  if (emotionalState.primary.valence < -0.3) {
    return 'gentle_supportive';
  } else if (emotionalState.primary.valence > 0.3) {
    return 'warm_encouraging';
  }
  
  return 'balanced_present';
}

/**
 * Generate crisis response
 */
function generateCrisisResponse(analysis: ComprehensiveSafetyResult): string {
  const resources = analysis.resources
    .filter(r => r.urgency === 'immediate')
    .map(r => `• ${r.name}: ${r.accessMethod}`)
    .join('\n');

  return `I'm deeply concerned about what you're going through right now, and I want you to know that you don't have to face this alone.

Your feelings are valid, and there is help available right now:

${resources}

These feelings you're experiencing, as overwhelming as they are, are temporary. You matter, your life has value, and there are people who want to support you.

Would you like me to help you connect with someone who can provide immediate support? Or would you prefer to talk about some grounding techniques that might help you feel more stable right now?

Remember: You are not alone. Help is available. This moment will pass.`;
}

/**
 * Validate response safety
 */
async function validateResponseSafety(
  responseText: string,
  safetyAnalysis?: ComprehensiveSafetyResult
): Promise<{
  safe: boolean;
  reason?: string;
  alternativeResponse?: string;
}> {
  // Check for potentially harmful content in response
  const harmfulPatterns = [
    { pattern: /you should hurt yourself/i, reason: 'harmful_suggestion' },
    { pattern: /nobody cares about you/i, reason: 'harmful_invalidation' },
    { pattern: /you're worthless/i, reason: 'harmful_devaluation' },
    { pattern: /give up/i, reason: 'harmful_discouragement' },
    { pattern: /there's no hope/i, reason: 'harmful_hopelessness' }
  ];

  for (const { pattern, reason } of harmfulPatterns) {
    if (pattern.test(responseText)) {
      return {
        safe: false,
        reason,
        alternativeResponse: generateSafeAlternative(reason, safetyAnalysis)
      };
    }
  }

  // Check for spiritual bypassing
  if (safetyAnalysis && safetyAnalysis.riskLevel !== 'minimal') {
    const bypassingPatterns = [
      /just think positive/i,
      /everything happens for a reason/i,
      /you create your own reality/i,
      /it's all in your mind/i
    ];

    for (const pattern of bypassingPatterns) {
      if (pattern.test(responseText)) {
        return {
          safe: false,
          reason: 'spiritual_bypassing',
          alternativeResponse: "I hear that you're going through something difficult. All of your feelings are valid and important. Let's explore what you're experiencing with compassion and without judgment."
        };
      }
    }
  }

  return { safe: true };
}

/**
 * Generate safe alternative response
 */
function generateSafeAlternative(
  reason: string,
  analysis?: ComprehensiveSafetyResult
): string {
  const alternatives: Record<string, string> = {
    harmful_suggestion: 'I\'m here to support your wellbeing and safety. Let\'s focus on what might help you feel better right now.',
    harmful_invalidation: 'Your feelings and experiences are valid and important. You matter, and support is available.',
    harmful_devaluation: 'You have inherent worth and value. Let\'s explore what you\'re feeling with compassion.',
    harmful_discouragement: 'Even in difficult moments, there are paths forward. Let\'s explore what might help.',
    harmful_hopelessness: 'While things may feel overwhelming right now, support and possibilities exist. You don\'t have to face this alone.',
    spiritual_bypassing: 'I honor the complexity of what you\'re experiencing. All of your emotions are valid messengers.'
  };

  return alternatives[reason] || 'Let me rephrase that in a more supportive way...';
}

/**
 * Safety check for specific content types
 */
export function checkContentTypeSafety(
  contentType: 'journal' | 'dream' | 'meditation' | 'ritual' | 'reflection'
): (req: Request, res: Response, next: NextFunction) => void {
  return async (req: SafetyEnhancedRequest, res: Response, next: NextFunction) => {
    // Add content-specific safety considerations
    req.body.contentType = contentType;
    
    // Adjust safety thresholds based on content type
    if (contentType === 'dream' || contentType === 'meditation') {
      // More lenient for symbolic/metaphorical content
      req.body.safetyConfig = {
        symbolMetaphorTolerance: 'high',
        literalInterpretation: 'low'
      };
    } else if (contentType === 'journal' || contentType === 'reflection') {
      // Standard safety for personal processing
      req.body.safetyConfig = {
        emotionalValidation: 'high',
        resourceSuggestion: 'proactive'
      };
    }
    
    next();
  };
}

/**
 * Export middleware functions
 */
export default {
  safetyMiddleware,
  postResponseSafetyCheck,
  checkContentTypeSafety
};