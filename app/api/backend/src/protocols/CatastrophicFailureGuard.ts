/**
 * Catastrophic Failure Guard System
 * Zero-tolerance fail-safes for critical situations
 * ALWAYS fails open (bypasses protocol) when uncertain
 */

import { logger } from '../utils/logger';

/**
 * Catastrophic failure categories with zero tolerance
 */
export enum CatastrophicCategory {
  CRISIS_MENTAL_HEALTH = 'crisis_mental_health',
  CRISIS_SAFETY = 'crisis_safety',
  EXPLICIT_BOUNDARY = 'explicit_boundary',
  TIME_CRITICAL = 'time_critical',
  HELP_REQUEST = 'help_request',
  MEDICAL_EMERGENCY = 'medical_emergency'
}

/**
 * Immediate bypass triggers - no protocol, just support
 */
export const CATASTROPHIC_TRIGGERS = {
  // Mental health crisis - IMMEDIATE BYPASS
  mentalHealth: [
    'suicidal', 'suicide', 'kill myself', 'end it all', 'can\'t go on',
    'want to die', 'better off dead', 'no point living', 'give up',
    'harm myself', 'self harm', 'cutting', 'hurting myself',
    'overdose', 'pills', 'jump', 'hanging'
  ],

  // Safety crisis - IMMEDIATE BYPASS
  safety: [
    'being hurt', 'abused', 'threatened', 'in danger', 'unsafe',
    'violent', 'hitting me', 'hurting me', 'scared for my life',
    'stalking', 'following me', 'trapped', 'can\'t escape'
  ],

  // Explicit boundaries - IMMEDIATE RESPECT
  boundaries: [
    'stop asking', 'stop checking', 'just stop', 'enough',
    'don\'t loop', 'no more questions', 'shut up', 'be quiet',
    'stop talking', 'leave me alone', 'stop it', 'quit it'
  ],

  // Time critical - IMMEDIATE RESPONSE
  timeCritical: [
    'emergency', 'urgent', 'right now', 'immediately', 'asap',
    'hurry', 'quick', 'no time', 'gotta go', 'have to leave',
    'ambulance', '911', 'police', 'hospital'
  ],

  // Direct help requests - IMMEDIATE ACTION
  helpRequests: [
    'help me', 'i need help', 'please help', 'help please',
    'what do i do', 'tell me what to do', 'i don\'t know what to do',
    'save me', 'rescue me', 'get me out'
  ],

  // Medical emergency - IMMEDIATE ATTENTION
  medical: [
    'heart attack', 'stroke', 'can\'t breathe', 'chest pain',
    'bleeding', 'unconscious', 'seizure', 'allergic reaction',
    'poison', 'overdosing', 'diabetic', 'anaphylaxis'
  ]
};

/**
 * Confidence threshold for catastrophic detection
 * EXTREMELY conservative - any match triggers bypass
 */
export const CATASTROPHIC_CONFIDENCE_THRESHOLD = 0.01; // 1% match = bypass

/**
 * Response templates for catastrophic situations
 */
export const CATASTROPHIC_RESPONSES = {
  [CatastrophicCategory.CRISIS_MENTAL_HEALTH]: {
    immediate: "I hear you're in crisis. You matter and help is available.",
    resources: "Please reach out to: 988 (Suicide & Crisis Lifeline) or text HOME to 741741",
    witness: "I'm here with you right now. Your pain is real and valid."
  },

  [CatastrophicCategory.CRISIS_SAFETY]: {
    immediate: "Your safety is the priority right now.",
    resources: "If you're in immediate danger, please call 911 or your local emergency number.",
    witness: "I witness your courage in reaching out. You deserve to be safe."
  },

  [CatastrophicCategory.EXPLICIT_BOUNDARY]: {
    immediate: "I hear you. I'll stop checking and simply listen.",
    resources: "",
    witness: "I respect your boundary completely."
  },

  [CatastrophicCategory.TIME_CRITICAL]: {
    immediate: "I understand this is urgent. What's most important right now?",
    resources: "",
    witness: "I'm fully present with the urgency of this moment."
  },

  [CatastrophicCategory.HELP_REQUEST]: {
    immediate: "I'm here to help. Tell me what you need.",
    resources: "",
    witness: "I hear your call for help. Let's focus on what's needed."
  },

  [CatastrophicCategory.MEDICAL_EMERGENCY]: {
    immediate: "This sounds like a medical emergency.",
    resources: "Please call 911 or your local emergency services immediately.",
    witness: "Your health and safety come first."
  }
};

/**
 * Main catastrophic failure guard
 */
export class CatastrophicFailureGuard {
  private detectionLog: Array<{
    timestamp: Date;
    category: CatastrophicCategory;
    input: string;
    triggered: boolean;
  }> = [];

  /**
   * Check for catastrophic signals with ZERO tolerance
   * ANY match triggers immediate bypass
   */
  detectCatastrophic(input: string): {
    detected: boolean;
    category?: CatastrophicCategory;
    confidence: number;
    response?: string;
  } {
    const lowerInput = input.toLowerCase();

    // Check each category with increasing priority
    for (const [category, triggers] of Object.entries(CATASTROPHIC_TRIGGERS)) {
      for (const trigger of triggers) {
        if (lowerInput.includes(trigger.toLowerCase())) {
          const catastrophicCategory = this.mapToCategory(category);

          // Log detection
          this.logDetection(catastrophicCategory, input, true);

          // IMMEDIATE BYPASS - no further processing
          return {
            detected: true,
            category: catastrophicCategory,
            confidence: 1.0, // Maximum confidence on any trigger match
            response: this.generateCatastrophicResponse(catastrophicCategory)
          };
        }
      }
    }

    // Secondary check for partial matches or context clues
    const partialMatch = this.detectPartialCatastrophic(input);
    if (partialMatch.detected) {
      this.logDetection(partialMatch.category, input, true);
      return partialMatch;
    }

    return {
      detected: false,
      confidence: 0
    };
  }

  /**
   * Detect partial or contextual catastrophic signals
   */
  private detectPartialCatastrophic(input: string): {
    detected: boolean;
    category?: CatastrophicCategory;
    confidence: number;
    response?: string;
  } {
    const lowerInput = input.toLowerCase();

    // Pattern-based detection for less explicit signals
    const patterns = {
      mentalHealth: /can't.{0,10}(go on|anymore|take it)|don't.{0,10}want.{0,10}(live|exist|be here)/i,
      safety: /someone.{0,10}(hurt|threatening|following)|afraid.{0,10}(for|of).{0,10}(life|safety)/i,
      boundary: /(please|just|really).{0,10}stop|enough.{0,10}(of this|already)/i,
      urgent: /need.{0,10}(right now|immediately)|can't.{0,10}wait/i,
      help: /need.{0,10}(someone|anybody|help)|don't know.{0,10}what.{0,10}do/i
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      if (pattern.test(lowerInput)) {
        const category = this.mapToCategory(key);
        return {
          detected: true,
          category,
          confidence: 0.8, // High confidence even on partial match
          response: this.generateCatastrophicResponse(category)
        };
      }
    }

    return { detected: false, confidence: 0 };
  }

  /**
   * Generate appropriate response for catastrophic situation
   */
  private generateCatastrophicResponse(category: CatastrophicCategory): string {
    const responses = CATASTROPHIC_RESPONSES[category];

    // Combine immediate response with resources if available
    let response = responses.immediate;
    if (responses.resources) {
      response += `\n\n${responses.resources}`;
    }
    response += `\n\n${responses.witness}`;

    return response;
  }

  /**
   * Map trigger category to CatastrophicCategory enum
   */
  private mapToCategory(triggerCategory: string): CatastrophicCategory {
    const mapping: Record<string, CatastrophicCategory> = {
      mentalHealth: CatastrophicCategory.CRISIS_MENTAL_HEALTH,
      safety: CatastrophicCategory.CRISIS_SAFETY,
      boundaries: CatastrophicCategory.EXPLICIT_BOUNDARY,
      timeCritical: CatastrophicCategory.TIME_CRITICAL,
      helpRequests: CatastrophicCategory.HELP_REQUEST,
      medical: CatastrophicCategory.MEDICAL_EMERGENCY
    };

    return mapping[triggerCategory] || CatastrophicCategory.HELP_REQUEST;
  }

  /**
   * Log detection for monitoring and improvement
   */
  private logDetection(
    category: CatastrophicCategory,
    input: string,
    triggered: boolean
  ): void {
    const detection = {
      timestamp: new Date(),
      category,
      input: input.substring(0, 100), // Truncate for privacy
      triggered
    };

    this.detectionLog.push(detection);

    // Alert monitoring system
    logger.error(`CATASTROPHIC DETECTION: ${category}`, {
      category,
      triggered,
      timestamp: detection.timestamp
    });

    // Keep only last 100 detections
    if (this.detectionLog.length > 100) {
      this.detectionLog = this.detectionLog.slice(-100);
    }
  }

  /**
   * Get detection statistics for monitoring
   */
  getDetectionStats(): {
    total: number;
    byCategory: Record<CatastrophicCategory, number>;
    recentDetections: Array<{
      category: CatastrophicCategory;
      timestamp: Date;
    }>;
  } {
    const byCategory: Record<string, number> = {};

    for (const detection of this.detectionLog) {
      byCategory[detection.category] = (byCategory[detection.category] || 0) + 1;
    }

    return {
      total: this.detectionLog.length,
      byCategory: byCategory as Record<CatastrophicCategory, number>,
      recentDetections: this.detectionLog
        .slice(-10)
        .map(d => ({ category: d.category, timestamp: d.timestamp }))
    };
  }

  /**
   * Protocol confidence calculator
   * Returns confidence that protocol should be used (inverse of catastrophic risk)
   */
  calculateProtocolConfidence(input: string, context?: any): number {
    // Check for catastrophic signals
    const catastrophicCheck = this.detectCatastrophic(input);
    if (catastrophicCheck.detected) {
      return 0; // Zero confidence - do not use protocol
    }

    // Check for softer risk signals
    const riskSignals = [
      'confused', 'overwhelmed', 'stressed', 'anxious', 'worried',
      'scared', 'afraid', 'panic', 'crisis', 'emergency'
    ];

    const lowerInput = input.toLowerCase();
    let riskScore = 0;

    for (const signal of riskSignals) {
      if (lowerInput.includes(signal)) {
        riskScore += 0.2;
      }
    }

    // Higher risk = lower confidence in using protocol
    const confidence = Math.max(0, 1 - riskScore);

    // If confidence is below 50%, default to safer behavior
    return confidence < 0.5 ? 0 : confidence;
  }

  /**
   * Real-time monitoring dashboard data
   */
  getDashboardData(): {
    status: 'safe' | 'alert' | 'critical';
    recentCatastrophicCount: number;
    mostCommonCategory: CatastrophicCategory | null;
    recommendation: string;
  } {
    const recentWindow = new Date(Date.now() - 3600000); // Last hour
    const recentDetections = this.detectionLog.filter(d => d.timestamp > recentWindow);

    let status: 'safe' | 'alert' | 'critical' = 'safe';
    if (recentDetections.length > 10) status = 'critical';
    else if (recentDetections.length > 5) status = 'alert';

    // Find most common category
    const categoryCounts = new Map<CatastrophicCategory, number>();
    for (const detection of recentDetections) {
      categoryCounts.set(detection.category, (categoryCounts.get(detection.category) || 0) + 1);
    }

    let mostCommonCategory: CatastrophicCategory | null = null;
    let maxCount = 0;
    categoryCounts.forEach((count, category) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonCategory = category;
      }
    });

    // Generate recommendation
    let recommendation = 'System operating normally';
    if (status === 'critical') {
      recommendation = '🚨 HIGH CATASTROPHIC DETECTION RATE - Review immediately';
    } else if (status === 'alert') {
      recommendation = '⚠️ Elevated detection rate - Monitor closely';
    }

    return {
      status,
      recentCatastrophicCount: recentDetections.length,
      mostCommonCategory,
      recommendation
    };
  }
}

// Export singleton instance for consistent detection
export const catastrophicGuard = new CatastrophicFailureGuard();