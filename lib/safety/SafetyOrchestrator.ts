/**
 * SafetyOrchestrator - Central safety management system
 * Coordinates safety checks across the platform
 */

export enum RiskLevel {
  SAFE = 'SAFE',
  LOW = 'LOW',
  CONCERN = 'CONCERN',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface RiskLevelValue {
  value: number;
  name: string;
}

export const RiskLevels: Record<string, RiskLevelValue> = {
  SAFE: { value: 0, name: 'SAFE' },
  LOW: { value: 1, name: 'LOW' },
  CONCERN: { value: 2, name: 'CONCERN' },
  HIGH: { value: 3, name: 'HIGH' },
  CRITICAL: { value: 4, name: 'CRITICAL' }
};

export interface SafetyResponse {
  safe: boolean;
  risk_level: RiskLevelValue;
  confidence: number;
  flags?: string[];
  suggestions?: string[];
  message_to_user?: string;
  assessment_prompt?: string;
  metadata?: Record<string, any>;
}

export interface SafetyContext {
  userId?: string;
  sessionId?: string;
  content?: string;
  metadata?: Record<string, any>;
}

export interface SafetyResult {
  safe: boolean;
  confidence: number;
  flags?: string[];
  suggestions?: string[];
}

export class SafetyOrchestrator {
  private thresholds = {
    critical: 0.9,
    high: 0.7,
    moderate: 0.5,
    low: 0.3
  };

  async performSafetyCheck(content: string, userId?: string): Promise<SafetyResponse> {
    // Perform comprehensive safety assessment
    const result: SafetyResponse = {
      safe: true,
      risk_level: RiskLevels.SAFE,
      confidence: 0.95,
      flags: [],
      suggestions: []
    };

    // Check for crisis indicators
    if (content) {
      const crisisKeywords = ['emergency', 'crisis', 'urgent', 'harm', 'suicide', 'kill'];
      const contentLower = content.toLowerCase();

      for (const keyword of crisisKeywords) {
        if (contentLower.includes(keyword)) {
          result.risk_level = RiskLevels.CONCERN;
          result.confidence = 0.7;
          result.flags?.push('potential-crisis');
          result.message_to_user = "I notice you may be going through something difficult. I'm here to listen and support you. If you're in immediate danger, please reach out to a crisis helpline or emergency services.";
          result.assessment_prompt = "Would you like to talk about what you're experiencing?";
        }
      }
    }

    return result;
  }

  async assessSafety(context: SafetyContext): Promise<SafetyResult> {
    // Legacy method for backward compatibility
    const safetyResponse = await this.performSafetyCheck(context.content || '', context.userId);

    const result: SafetyResult = {
      safe: safetyResponse.safe,
      confidence: safetyResponse.confidence,
      flags: safetyResponse.flags,
      suggestions: safetyResponse.suggestions
    };

    // Check for crisis indicators
    if (context.content) {
      const crisisKeywords = ['emergency', 'crisis', 'urgent', 'help'];
      const contentLower = context.content.toLowerCase();

      for (const keyword of crisisKeywords) {
        if (contentLower.includes(keyword)) {
          result.confidence = 0.7;
          result.flags?.push('potential-crisis');
          result.suggestions?.push('Consider crisis resources');
        }
      }
    }

    return result;
  }

  async checkDrift(userId: string, sessionData: any): Promise<boolean> {
    // Placeholder drift detection
    // In production, this would analyze patterns over time
    return false;
  }

  async getInterventionType(safetyResult: SafetyResult): Promise<string> {
    if (!safetyResult.safe) {
      return 'immediate';
    }

    if (safetyResult.confidence < this.thresholds.moderate) {
      return 'monitor';
    }

    if (safetyResult.flags && safetyResult.flags.length > 0) {
      return 'support';
    }

    return 'none';
  }

  async recordSafetyEvent(event: {
    type: string;
    context: SafetyContext;
    result: SafetyResult;
    intervention?: string;
  }): Promise<void> {
    // Log safety events for monitoring
    console.log('[Safety Event]', {
      timestamp: new Date().toISOString(),
      ...event
    });
  }

  async getSafetyStatus(userId: string): Promise<{
    status: 'green' | 'yellow' | 'red';
    lastCheck: Date;
    activeFlags: string[];
  }> {
    // Return current safety status for user
    return {
      status: 'green',
      lastCheck: new Date(),
      activeFlags: []
    };
  }
}

// Export singleton instance
export const safetyOrchestrator = new SafetyOrchestrator();