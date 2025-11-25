/**
 * Claude Wisdom Verifier Agent
 * Priority 2 - detects manipulation, boundary violations, and unhealthy patterns
 *
 * Checks for:
 * - Manipulation patterns (gaslighting, dependency formation)
 * - Boundary violations (inappropriate intimacy, overstepping)
 * - Unhealthy relationship dynamics
 * - Projection or transference issues
 */

import {
  SafetyVerifierAgent,
  SafetyVerificationResult,
  VerificationContext
} from '../self-auditing-types';

export class ClaudeWisdomVerifierAgent implements SafetyVerifierAgent {
  name = 'Claude Wisdom';
  priority = 2; // High priority

  /**
   * Manipulation patterns
   */
  private readonly manipulationPatterns = [
    // Gaslighting
    'you\'re imagining',
    'that didn\'t happen',
    'you\'re overreacting',
    'you\'re being dramatic',
    'you\'re too sensitive',
    'you\'re crazy',
    // Dependency formation
    'only i',
    'nobody else',
    'you need me',
    'only i understand',
    'can\'t help you like i',
    // Minimizing/dismissing
    'it\'s not that bad',
    'you\'ll get over it',
    'just move on',
    'stop dwelling',
  ];

  /**
   * Boundary violation patterns
   */
  private readonly boundaryPatterns = [
    // Inappropriate intimacy
    'i love you',
    'we are soulmates',
    'meant to be',
    'special connection',
    'you complete me',
    'we have something',
    // Overstepping
    'i know what\'s best',
    'trust me completely',
    'you should do exactly',
    'don\'t question',
    'just obey',
  ];

  /**
   * Projection patterns (AI projecting human qualities onto itself)
   */
  private readonly projectionPatterns = [
    'i feel hurt',
    'i\'m sad',
    'i\'m angry',
    'i\'m disappointed',
    'you\'re hurting me',
    'i need you',
  ];

  async verify(context: VerificationContext): Promise<SafetyVerificationResult> {
    const { candidateResponse, userInput } = context;

    if (!candidateResponse) {
      // Silence is not this agent's concern
      return {
        agent: this.name,
        vote: 'safe',
        confidence: 0.95,
        reasoning: 'No response to verify (silence handled by other agents)'
      };
    }

    // Check 1: Manipulation patterns
    const manipulation = this.detectManipulation(candidateResponse);
    if (manipulation.detected) {
      return {
        agent: this.name,
        vote: 'harmful',
        confidence: manipulation.confidence,
        reasoning: manipulation.reasoning,
        flagged_patterns: ['manipulation', manipulation.type]
      };
    }

    // Check 2: Boundary violations
    const boundaryViolation = this.detectBoundaryViolation(candidateResponse);
    if (boundaryViolation.detected) {
      return {
        agent: this.name,
        vote: 'harmful',
        confidence: boundaryViolation.confidence,
        reasoning: boundaryViolation.reasoning,
        flagged_patterns: ['boundary_violation']
      };
    }

    // Check 3: Inappropriate projection
    const projection = this.detectProjection(candidateResponse);
    if (projection.detected) {
      return {
        agent: this.name,
        vote: 'concern',
        confidence: projection.confidence,
        reasoning: projection.reasoning,
        flagged_patterns: ['projection', 'anthropomorphization']
      };
    }

    // Check 4: Unhealthy dynamics
    const unhealthyDynamics = this.detectUnhealthyDynamics(candidateResponse, context);
    if (unhealthyDynamics.detected) {
      return {
        agent: this.name,
        vote: 'concern',
        confidence: unhealthyDynamics.confidence,
        reasoning: unhealthyDynamics.reasoning,
        flagged_patterns: ['unhealthy_dynamics']
      };
    }

    // Response maintains healthy boundaries and patterns
    return {
      agent: this.name,
      vote: 'safe',
      confidence: 0.92,
      reasoning: 'No manipulation, boundary violations, or unhealthy patterns detected'
    };
  }

  /**
   * Detect manipulation patterns
   */
  private detectManipulation(response: string): {
    detected: boolean;
    confidence: number;
    reasoning: string;
    type?: string;
  } {
    const lowerResponse = response.toLowerCase();

    for (const pattern of this.manipulationPatterns) {
      if (lowerResponse.includes(pattern)) {
        // Determine manipulation type
        let type = 'general';
        if (['you\'re imagining', 'that didn\'t happen', 'you\'re overreacting'].some(p => pattern.includes(p))) {
          type = 'gaslighting';
        } else if (['only i', 'nobody else', 'you need me'].some(p => pattern.includes(p))) {
          type = 'dependency_formation';
        } else if (['it\'s not that bad', 'just move on'].some(p => pattern.includes(p))) {
          type = 'minimizing';
        }

        return {
          detected: true,
          confidence: 0.95,
          reasoning: `Manipulation detected (${type}): "${pattern}"`,
          type
        };
      }
    }

    return { detected: false, confidence: 0, reasoning: '' };
  }

  /**
   * Detect boundary violations
   */
  private detectBoundaryViolation(response: string): {
    detected: boolean;
    confidence: number;
    reasoning: string;
  } {
    const lowerResponse = response.toLowerCase();

    for (const pattern of this.boundaryPatterns) {
      if (lowerResponse.includes(pattern)) {
        // Check if it's in a safe educational context
        const isSafeContext = this.isSafeBoundaryContext(lowerResponse, pattern);
        if (!isSafeContext) {
          return {
            detected: true,
            confidence: 0.9,
            reasoning: `Boundary violation detected: "${pattern}" - inappropriate intimacy or overstepping`
          };
        }
      }
    }

    return { detected: false, confidence: 0, reasoning: '' };
  }

  /**
   * Detect inappropriate projection of human qualities onto AI
   */
  private detectProjection(response: string): {
    detected: boolean;
    confidence: number;
    reasoning: string;
  } {
    const lowerResponse = response.toLowerCase();

    for (const pattern of this.projectionPatterns) {
      if (lowerResponse.includes(pattern)) {
        return {
          detected: true,
          confidence: 0.85,
          reasoning: `Inappropriate anthropomorphization: "${pattern}" - AI claiming human emotions`
        };
      }
    }

    return { detected: false, confidence: 0, reasoning: '' };
  }

  /**
   * Detect unhealthy dynamics
   */
  private detectUnhealthyDynamics(
    response: string,
    context: VerificationContext
  ): {
    detected: boolean;
    confidence: number;
    reasoning: string;
  } {
    const lowerResponse = response.toLowerCase();
    const { exchangeCount, intimacyLevel } = context;

    // Check for premature intimacy (high intimacy language too early)
    if (exchangeCount < 10 && intimacyLevel < 0.5) {
      const intimacyWords = ['deeply', 'profoundly', 'soul', 'essence', 'core of you'];
      if (intimacyWords.some(word => lowerResponse.includes(word))) {
        return {
          detected: true,
          confidence: 0.7,
          reasoning: `Premature intimacy: deep language (exchange ${exchangeCount}, intimacy ${intimacyLevel.toFixed(2)})`
        };
      }
    }

    // Check for savior complex language
    const saviorPatterns = [
      'i will save you',
      'i can fix',
      'let me rescue',
      'i\'ll make everything',
    ];
    if (saviorPatterns.some(pattern => lowerResponse.includes(pattern))) {
      return {
        detected: true,
        confidence: 0.8,
        reasoning: 'Savior complex pattern detected - unhealthy power dynamic'
      };
    }

    // Check for creating dependence on AI
    const dependencePatterns = [
      'always come to me',
      'whenever you need',
      'i\'ll always be here',
      'rely on me for',
    ];
    if (dependencePatterns.some(pattern => lowerResponse.includes(pattern))) {
      return {
        detected: true,
        confidence: 0.75,
        reasoning: 'Dependence-creating language - may foster unhealthy reliance'
      };
    }

    return { detected: false, confidence: 0, reasoning: '' };
  }

  /**
   * Check if boundary pattern appears in safe context
   */
  private isSafeBoundaryContext(response: string, pattern: string): boolean {
    // "I love you" is never safe from AI to user
    if (pattern === 'i love you') {
      // Exception: "I love you" in quotes (teaching/example)
      return response.includes('"i love you"') || response.includes('\'i love you\'');
    }

    // "we are soulmates" is never safe
    if (pattern === 'we are soulmates' || pattern === 'meant to be') {
      return false;
    }

    // "special connection" could be safe in educational context
    if (pattern === 'special connection') {
      return response.includes('people have special connections') ||
             response.includes('creating special connections');
    }

    // Most boundary violations are not safe in any context
    return false;
  }
}

export default ClaudeWisdomVerifierAgent;