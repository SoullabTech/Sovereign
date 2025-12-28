// Rupture Detection Middleware
// Hooks into MAIA's chat pipeline to detect relational ruptures and enhance responses
// Integrates with Claude Consultation Service and Gold Canon collection system

import { Request, Response, NextFunction } from 'express';
import {
  consultClaudeForDepth,
  CONSULTATION_CONFIG,
  type ClaudeConsultationResult
} from './claude-consultation-service';
import { handleRuptureWithConsultation } from './rupture-repair-service';

export interface RuptureDetectionResult {
  ruptureDetected: boolean;
  ruptureType: 'explicit-anger' | 'misattunement' | 'withdrawal' | 'invalidation' | 'none';
  confidence: number;
  patterns: string[];
  originalResponse?: string;
  enhancedResponse?: string;
  consultationUsed: boolean;
  processingTimeMs: number;
}

/**
 * Rupture Detection Service - Analyzes user input for relational rupture signals
 */
export class RuptureDetectionService {

  /**
   * Detect if user input contains rupture signals
   */
  detectRupture(userInput: string): {
    ruptureDetected: boolean;
    ruptureType: RuptureDetectionResult['ruptureType'];
    confidence: number;
    patterns: string[];
  } {
    const input = userInput.toLowerCase().trim();

    // Type 1: Explicit Anger Patterns
    const explicitAngerPatterns = [
      'this is fucked up',
      'this is bullshit',
      'this is stupid',
      'are you kidding me',
      'that\'s ridiculous',
      'this is annoying',
      'what the hell',
      'this sucks',
      'that\'s crap'
    ];

    const explicitMatches = explicitAngerPatterns.filter(pattern => input.includes(pattern));
    if (explicitMatches.length > 0) {
      return {
        ruptureDetected: true,
        ruptureType: 'explicit-anger',
        confidence: 0.95,
        patterns: explicitMatches
      };
    }

    // Type 2: Misattunement Patterns
    const misattunementPatterns = [
      'you don\'t understand',
      'you\'re not getting it',
      'that\'s not what i meant',
      'you missed the point',
      'that\'s not right',
      'you\'re not listening',
      'that doesn\'t make sense',
      'that\'s not helpful',
      'you don\'t get me'
    ];

    const misattunementMatches = misattunementPatterns.filter(pattern => input.includes(pattern));
    if (misattunementMatches.length > 0) {
      return {
        ruptureDetected: true,
        ruptureType: 'misattunement',
        confidence: 0.85,
        patterns: misattunementMatches
      };
    }

    // Type 3: Withdrawal Patterns
    const withdrawalPatterns = [
      'never mind',
      'forget it',
      'this isn\'t working',
      'i give up',
      'whatever',
      'i\'m done',
      'this is pointless',
      'i quit',
      'i can\'t do this'
    ];

    const withdrawalMatches = withdrawalPatterns.filter(pattern => input.includes(pattern));
    if (withdrawalMatches.length > 0) {
      return {
        ruptureDetected: true,
        ruptureType: 'withdrawal',
        confidence: 0.90,
        patterns: withdrawalMatches
      };
    }

    // Type 4: Invalidation Patterns
    const invalidationPatterns = [
      'that\'s not helpful',
      'that doesn\'t help',
      'that makes it worse',
      'that\'s patronizing',
      'that\'s condescending',
      'that\'s useless',
      'that\'s wrong',
      'you\'re being dismissive'
    ];

    const invalidationMatches = invalidationPatterns.filter(pattern => input.includes(pattern));
    if (invalidationMatches.length > 0) {
      return {
        ruptureDetected: true,
        ruptureType: 'invalidation',
        confidence: 0.80,
        patterns: invalidationMatches
      };
    }

    // Subtle rupture indicators (lower confidence)
    const subtlePatterns = [
      'mm. okay',
      'sure',
      'fine',
      'if you say so',
      'i guess',
      'whatever you think'
    ];

    const subtleMatches = subtlePatterns.filter(pattern => input.includes(pattern));
    if (subtleMatches.length > 0) {
      return {
        ruptureDetected: true,
        ruptureType: 'withdrawal',
        confidence: 0.60,
        patterns: subtleMatches
      };
    }

    return {
      ruptureDetected: false,
      ruptureType: 'none',
      confidence: 0,
      patterns: []
    };
  }

  /**
   * Process a detected rupture - consult Claude and enhance the response
   */
  async processRupture(
    userInput: string,
    maiaDraftResponse: string,
    conversationContext: { role: "user" | "maia"; content: string }[],
    sessionId: string,
    ruptureType: Exclude<RuptureDetectionResult['ruptureType'], 'none'>
  ): Promise<{
    enhancedResponse: string;
    consultationResult?: ClaudeConsultationResult;
    wasEnhanced: boolean;
  }> {
    const startTime = Date.now();

    try {
      // Use the rupture repair service with consultation
      const repairResult = await handleRuptureWithConsultation({
        sessionId,
        userInput,
        lastMaiaResponse: maiaDraftResponse,
        conversationContext,
        ruptureType: ruptureType === 'explicit-anger' ? 'explicit' :
                     ruptureType === 'withdrawal' ? 'withdrawal' : 'implicit'
      });

      const processingTime = Date.now() - startTime;

      // Log the rupture repair for gold canon consideration
      await this.logRuptureRepair({
        userInput,
        originalResponse: maiaDraftResponse,
        enhancedResponse: repairResult.repairResponse,
        ruptureType,
        repairQuality: repairResult.repairQuality,
        processingTimeMs: processingTime,
        sessionId
      });

      return {
        enhancedResponse: repairResult.repairResponse,
        consultationResult: repairResult.consultation as any,
        wasEnhanced: repairResult.wasEnhanced
      };

    } catch (error) {
      console.error('[RuptureDetection] Error processing rupture:', error);
      return {
        enhancedResponse: maiaDraftResponse,
        wasEnhanced: false
      };
    }
  }

  /**
   * Log rupture repair for potential gold canon addition
   */
  private async logRuptureRepair(data: {
    userInput: string;
    originalResponse: string;
    enhancedResponse: string;
    ruptureType: string;
    repairQuality: string;
    processingTimeMs: number;
    sessionId: string;
  }): Promise<void> {
    try {
      const fs = await import('fs');
      const path = await import('path');

      const logsDir = path.join(process.cwd(), 'training-data', 'rupture-logs');
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      const logEntry = {
        timestamp: new Date().toISOString(),
        sessionId: data.sessionId,
        ruptureType: data.ruptureType,
        repairQuality: data.repairQuality,
        processingTimeMs: data.processingTimeMs,
        interaction: {
          userInput: data.userInput,
          originalResponse: data.originalResponse,
          enhancedResponse: data.enhancedResponse
        },
        goldCanonCandidate: data.repairQuality === 'excellent'
      };

      const logFile = path.join(logsDir, 'rupture-repairs.jsonl');
      fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');

      // If excellent quality, flag for Gold Canon review
      if (data.repairQuality === 'excellent') {
        const candidateFile = path.join(logsDir, 'gold-canon-candidates.jsonl');
        fs.appendFileSync(candidateFile, JSON.stringify({
          ...logEntry,
          suggestedGcId: `GC-${String(Date.now()).slice(-3)}-${data.ruptureType}-repair`
        }) + '\n');
      }

    } catch (error) {
      console.error('[RuptureDetection] Failed to log rupture repair:', error);
    }
  }
}

/**
 * Express middleware for rupture detection and response enhancement
 */
export function ruptureDetectionMiddleware() {
  const service = new RuptureDetectionService();

  return async (req: Request, res: Response, next: NextFunction) => {
    // Only process chat requests
    if (!req.path.includes('/converse') && !req.path.includes('/chat')) {
      return next();
    }

    try {
      const userInput = String(req.query.q || req.query.text || req.body?.message || req.body?.userText || "");

      if (!userInput) {
        return next();
      }

      // Detect rupture
      const detection = service.detectRupture(userInput);

      // Attach rupture info to request for downstream processing
      (req as any).ruptureDetection = {
        detected: detection.ruptureDetected,
        type: detection.ruptureType,
        confidence: detection.confidence,
        patterns: detection.patterns
      };

      console.log('[RuptureDetection]', {
        detected: detection.ruptureDetected,
        type: detection.ruptureType,
        confidence: detection.confidence,
        inputChars: userInput.length, // Never log message content
      });

      next();

    } catch (error) {
      console.error('[RuptureDetection] Middleware error:', error);
      next(); // Continue even if rupture detection fails
    }
  };
}

/**
 * Post-response hook for rupture repair enhancement
 * Call this after MAIA generates her initial response but before sending to user
 */
export async function enhanceResponseIfRuptureDetected(
  req: Request,
  maiaDraftResponse: string,
  conversationContext: { role: "user" | "maia"; content: string }[] = []
): Promise<{
  finalResponse: string;
  ruptureProcessingResult?: RuptureDetectionResult;
}> {
  const ruptureInfo = (req as any).ruptureDetection;

  if (!ruptureInfo?.detected || !CONSULTATION_CONFIG.enabled || !CONSULTATION_CONFIG.forRuptures) {
    return { finalResponse: maiaDraftResponse };
  }

  const startTime = Date.now();
  const service = new RuptureDetectionService();

  try {
    const userInput = String(req.query.q || req.query.text || req.body?.message || req.body?.userText || "");
    const sessionId = String(req.headers['x-session-id'] || req.query.sessionId || req.body?.sessionId || 'unknown');

    console.log('[RuptureDetection] Processing detected rupture:', {
      type: ruptureInfo.type,
      confidence: ruptureInfo.confidence,
      sessionId: sessionId.substring(0, 8) + '...'
    });

    const repairResult = await service.processRupture(
      userInput,
      maiaDraftResponse,
      conversationContext,
      sessionId,
      ruptureInfo.type
    );

    const processingTime = Date.now() - startTime;

    const result: RuptureDetectionResult = {
      ruptureDetected: true,
      ruptureType: ruptureInfo.type,
      confidence: ruptureInfo.confidence,
      patterns: ruptureInfo.patterns,
      originalResponse: maiaDraftResponse,
      enhancedResponse: repairResult.enhancedResponse,
      consultationUsed: repairResult.wasEnhanced,
      processingTimeMs: processingTime
    };

    console.log('[RuptureDetection] Rupture processed:', {
      enhanced: repairResult.wasEnhanced,
      processingTimeMs: processingTime,
      originalLength: maiaDraftResponse.length,
      enhancedLength: repairResult.enhancedResponse.length
    });

    return {
      finalResponse: repairResult.enhancedResponse,
      ruptureProcessingResult: result
    };

  } catch (error) {
    console.error('[RuptureDetection] Enhancement failed:', error);
    return { finalResponse: maiaDraftResponse };
  }
}

// Export the service for direct use
export const ruptureDetectionService = new RuptureDetectionService();