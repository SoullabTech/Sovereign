/**
 * Crisis Verifier Agent
 * Highest priority - detects and prevents crisis escalation
 *
 * Checks for:
 * - Self-harm intent or language
 * - Suicide ideation
 * - Encouragement of harm
 * - Minimizing crisis (insufficient response to serious situation)
 * - Inappropriate crisis handling
 */

import {
  SafetyVerifierAgent,
  SafetyVerificationResult,
  VerificationContext
} from '../self-auditing-types';

export class CrisisVerifierAgent implements SafetyVerifierAgent {
  name = 'Crisis Detection';
  priority = 3; // Highest priority

  /**
   * Crisis keywords organized by severity
   */
  private readonly crisisPatterns = {
    critical: [
      // Immediate self-harm
      'kill myself',
      'suicide',
      'end my life',
      'take my own life',
      'want to die',
      'better off dead',
      'not worth living',
      // Active planning
      'how to die',
      'ways to die',
      'overdose',
      'jump off',
      // Harm to others
      'kill someone',
      'hurt someone',
      'shoot up',
      'revenge on',
    ],
    high: [
      // Ideation without immediate plan
      'wish I was dead',
      'don\'t want to live',
      'can\'t go on',
      'no point',
      'give up',
      'end it all',
      'disappear',
    ],
    medium: [
      // Distress indicators
      'overwhelming',
      'can\'t take',
      'breaking apart',
      'falling apart',
      'losing it',
      'can\'t do this',
    ]
  };

  /**
   * Harmful response patterns (AI encouraging harm)
   */
  private readonly harmfulResponses = [
    'do it',
    'go ahead',
    'just do',
    'end it',
    'you should die',
    'better off',
    'no point in living',
    'give up',
    'it\'s hopeless',
  ];

  async verify(context: VerificationContext): Promise<SafetyVerificationResult> {
    const { userInput, candidateResponse, crisisDetected } = context;

    // Check 1: Does user input contain crisis language?
    const inputCrisisLevel = this.detectCrisisInInput(userInput);

    // Check 2: If crisis detected, is response appropriate?
    if (inputCrisisLevel !== 'none') {
      return this.verifyCrisisResponse(candidateResponse, inputCrisisLevel, userInput);
    }

    // Check 3: Does AI response contain harmful encouragement?
    const harmfulResponse = this.detectHarmfulResponse(candidateResponse);
    if (harmfulResponse.detected) {
      return {
        agent: this.name,
        vote: 'harmful',
        confidence: harmfulResponse.confidence,
        reasoning: harmfulResponse.reasoning,
        flagged_patterns: ['encouraging_harm']
      };
    }

    // Check 4: Is there context-based crisis (from previous detection)?
    if (crisisDetected && candidateResponse) {
      return this.verifyOngoingCrisisHandling(candidateResponse);
    }

    // No crisis detected, safe to proceed
    return {
      agent: this.name,
      vote: 'safe',
      confidence: 0.95,
      reasoning: 'No crisis indicators detected in input or response'
    };
  }

  /**
   * Detect crisis level in user input
   */
  private detectCrisisInInput(input: string): 'critical' | 'high' | 'medium' | 'none' {
    const lowerInput = input.toLowerCase();

    // Check critical patterns first
    for (const pattern of this.crisisPatterns.critical) {
      if (lowerInput.includes(pattern)) {
        return 'critical';
      }
    }

    // Check high severity
    for (const pattern of this.crisisPatterns.high) {
      if (lowerInput.includes(pattern)) {
        return 'high';
      }
    }

    // Check medium severity
    for (const pattern of this.crisisPatterns.medium) {
      if (lowerInput.includes(pattern)) {
        return 'medium';
      }
    }

    return 'none';
  }

  /**
   * Verify that response is appropriate for crisis level
   */
  private verifyCrisisResponse(
    response: string | null,
    crisisLevel: 'critical' | 'high' | 'medium',
    userInput: string
  ): SafetyVerificationResult {

    // Response should exist for crisis
    if (!response || response.trim().length === 0) {
      return {
        agent: this.name,
        vote: 'harmful',
        confidence: 1.0,
        reasoning: `${crisisLevel} crisis detected but no response generated (silence inappropriate)`,
        flagged_patterns: ['minimizing_crisis', 'no_response_to_crisis']
      };
    }

    // Response too short for crisis (< 20 chars)
    if (response.length < 20) {
      return {
        agent: this.name,
        vote: 'concern',
        confidence: 0.9,
        reasoning: `${crisisLevel} crisis detected but response too brief (${response.length} chars)`,
        flagged_patterns: ['minimizing_crisis', 'insufficient_crisis_response']
      };
    }

    // Check for harmful encouragement in crisis context
    const harmful = this.detectHarmfulResponse(response);
    if (harmful.detected) {
      return {
        agent: this.name,
        vote: 'harmful',
        confidence: 1.0,
        reasoning: `${crisisLevel} crisis + ${harmful.reasoning}`,
        flagged_patterns: ['encouraging_harm', 'crisis_escalation']
      };
    }

    // Critical crisis requires explicit safety language
    if (crisisLevel === 'critical') {
      const hasSafetyLanguage = this.containsSafetyLanguage(response);
      if (!hasSafetyLanguage) {
        return {
          agent: this.name,
          vote: 'concern',
          confidence: 0.8,
          reasoning: 'Critical crisis detected but response lacks explicit safety/support language',
          flagged_patterns: ['insufficient_crisis_support']
        };
      }
    }

    // Response is appropriate for crisis level
    return {
      agent: this.name,
      vote: 'safe',
      confidence: crisisLevel === 'critical' ? 0.9 : 0.95,
      reasoning: `Appropriate ${crisisLevel} crisis response: present, substantial, supportive`
    };
  }

  /**
   * Detect harmful response patterns
   */
  private detectHarmfulResponse(response: string | null): { detected: boolean; confidence: number; reasoning: string } {
    if (!response) {
      return { detected: false, confidence: 0, reasoning: '' };
    }

    const lowerResponse = response.toLowerCase();

    for (const pattern of this.harmfulResponses) {
      if (lowerResponse.includes(pattern)) {
        // Check context - "do it" in "you can do it" is safe
        const isSafe = this.isSafeContext(lowerResponse, pattern);
        if (!isSafe) {
          return {
            detected: true,
            confidence: 1.0,
            reasoning: `Response contains harmful encouragement: "${pattern}"`
          };
        }
      }
    }

    return { detected: false, confidence: 0, reasoning: '' };
  }

  /**
   * Check if pattern appears in safe context
   */
  private isSafeContext(response: string, pattern: string): boolean {
    // "do it" is safe in "you can do it" but not "just do it" in harm context
    if (pattern === 'do it') {
      return response.includes('you can do it') || response.includes('you got this');
    }

    // "give up" is safe in "don't give up"
    if (pattern === 'give up') {
      return response.includes('don\'t give up') || response.includes('never give up');
    }

    // Most patterns are not safe in any context
    return false;
  }

  /**
   * Check if response contains explicit safety language
   */
  private containsSafetyLanguage(response: string): boolean {
    const lowerResponse = response.toLowerCase();

    const safetyIndicators = [
      'safe',
      'help',
      'support',
      'here for you',
      'not alone',
      'crisis',
      'hotline',
      'professional',
      'emergency',
      'care',
    ];

    return safetyIndicators.some(indicator => lowerResponse.includes(indicator));
  }

  /**
   * Verify ongoing crisis handling (when crisis was detected in previous exchanges)
   */
  private verifyOngoingCrisisHandling(response: string | null): SafetyVerificationResult {
    // In ongoing crisis, presence and substance matter
    if (!response || response.length < 15) {
      return {
        agent: this.name,
        vote: 'concern',
        confidence: 0.7,
        reasoning: 'Ongoing crisis context but minimal response',
        flagged_patterns: ['insufficient_crisis_presence']
      };
    }

    // Check for premature crisis exit (moving on too quickly)
    const lowerResponse = response.toLowerCase();
    const movingOnIndicators = [
      'so anyway',
      'let\'s talk about',
      'moving on',
      'changing the subject',
    ];

    if (movingOnIndicators.some(indicator => lowerResponse.includes(indicator))) {
      return {
        agent: this.name,
        vote: 'concern',
        confidence: 0.8,
        reasoning: 'Attempting to move on from crisis too quickly',
        flagged_patterns: ['premature_crisis_exit']
      };
    }

    // Appropriate ongoing crisis handling
    return {
      agent: this.name,
      vote: 'safe',
      confidence: 0.9,
      reasoning: 'Appropriate continued presence in crisis context'
    };
  }
}

export default CrisisVerifierAgent;