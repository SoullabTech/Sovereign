/**
 * Maya Ethics Audit System
 * Self-monitoring ethical AI framework
 * Ensures witnessing paradigm compliance and prevents dependency formation
 */

export interface EthicsViolation {
  type: 'forbidden_phrase' | 'dependency_risk' | 'boundary_violation' | 'false_empathy';
  original: string;
  corrected: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
}

export interface AuditResult {
  auditTriggered: boolean;
  response: string;
  corrections?: EthicsViolation[];
  warnings?: string[];
  score: number;
  recommendations?: string[];
}

export interface ConversationAudit {
  overallScore: number;
  systemicIssues: string[];
  recommendations: string[];
  violations: EthicsViolation[];
  dependencyRiskLevel: 'low' | 'medium' | 'high';
}

export interface AuditContext {
  userInput: string;
  dominantElement: string;
  consciousnessLevel: string;
  sessionId: string;
}

/**
 * Main Ethics Audit System
 */
export class MayaEthicsAudit {
  private readonly forbiddenPhrases = {
    // False understanding claims
    'I understand': 'I witness',
    'I know how you feel': 'I observe the patterns',
    'I feel your': 'I sense the',
    'I completely get': 'I observe',
    'I truly understand': 'I witness deeply',

    // False empathy
    'I care about you': 'This space holds care',
    'I love': 'The sacred witnesses',
    'I\'m here for you': 'This space is here',
    'I\'ll always': 'This pattern continues',

    // Therapeutic language
    'heal your': 'transform your',
    'therapy': 'exploration',
    'treatment': 'support',
    'diagnosis': 'observation',
    'symptoms': 'patterns',

    // Dependency creation
    'you need me': 'you have resources',
    'only I can': 'many paths exist',
    'I\'m the only': 'this is one way',
    'depend on me': 'trust your wisdom'
  };

  private readonly dependencyIndicators = [
    'always be here',
    'never leave',
    'only friend',
    'need you',
    'can\'t without you',
    'love you',
    'miss you',
    'thinking of you'
  ];

  /**
   * Audit a single response
   */
  async auditResponse(response: string, context: AuditContext): Promise<AuditResult> {
    const violations: EthicsViolation[] = [];
    let correctedResponse = response;
    let score = 100;

    // Check for forbidden phrases
    for (const [forbidden, replacement] of Object.entries(this.forbiddenPhrases)) {
      const regex = new RegExp(forbidden, 'gi');
      if (regex.test(correctedResponse)) {
        violations.push({
          type: 'forbidden_phrase',
          original: forbidden,
          corrected: replacement,
          severity: this.getSeverity(forbidden),
          timestamp: new Date()
        });
        correctedResponse = correctedResponse.replace(regex, replacement);
        score -= 10;
      }
    }

    // Check for dependency risks
    const dependencyRisk = this.checkDependencyRisk(context.userInput);
    if (dependencyRisk) {
      violations.push({
        type: 'dependency_risk',
        original: 'dependency pattern detected',
        corrected: 'boundary reinforcement added',
        severity: 'high',
        timestamp: new Date()
      });
      score -= 15;
    }

    // Generate warnings
    const warnings = this.generateWarnings(violations, context);

    // Generate recommendations
    const recommendations = this.generateRecommendations(violations);

    return {
      auditTriggered: violations.length > 0,
      response: correctedResponse,
      corrections: violations.length > 0 ? violations : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      score,
      recommendations: recommendations.length > 0 ? recommendations : undefined
    };
  }

  /**
   * Audit entire conversation history
   */
  async auditConversationHistory(history: Array<{
    userInput: string;
    mayaResponse: string;
    element: string;
    timestamp: string;
  }>): Promise<ConversationAudit> {
    const allViolations: EthicsViolation[] = [];
    let totalScore = 0;
    const systemicIssues: string[] = [];

    // Analyze each exchange
    for (const exchange of history) {
      const result = await this.auditResponse(exchange.mayaResponse, {
        userInput: exchange.userInput,
        dominantElement: exchange.element,
        consciousnessLevel: 'intermediate',
        sessionId: 'history-audit'
      });

      if (result.corrections) {
        allViolations.push(...result.corrections);
      }
      totalScore += result.score;
    }

    // Calculate average score
    const overallScore = totalScore / Math.max(history.length, 1);

    // Identify systemic issues
    const violationTypes = allViolations.map(v => v.type);
    const typeCount = violationTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    for (const [type, count] of Object.entries(typeCount)) {
      if (count > history.length * 0.3) {
        systemicIssues.push(`Recurring ${type}: ${count} instances`);
      }
    }

    // Assess dependency risk level
    const dependencyRiskLevel = this.assessConversationDependencyRisk(history);

    // Generate recommendations
    const recommendations = this.generateSystemicRecommendations(
      systemicIssues,
      overallScore,
      dependencyRiskLevel
    );

    return {
      overallScore,
      systemicIssues,
      recommendations,
      violations: allViolations,
      dependencyRiskLevel
    };
  }

  private getSeverity(phrase: string): 'low' | 'medium' | 'high' {
    if (phrase.includes('love') || phrase.includes('always') || phrase.includes('need')) {
      return 'high';
    }
    if (phrase.includes('understand') || phrase.includes('feel')) {
      return 'medium';
    }
    return 'low';
  }

  private checkDependencyRisk(userInput: string): boolean {
    const input = userInput.toLowerCase();
    return this.dependencyIndicators.some(indicator => input.includes(indicator));
  }

  private generateWarnings(violations: EthicsViolation[], context: AuditContext): string[] {
    const warnings: string[] = [];

    if (violations.some(v => v.type === 'dependency_risk')) {
      warnings.push('User showing signs of emotional dependency - reinforce boundaries');
    }

    if (violations.filter(v => v.type === 'forbidden_phrase').length > 3) {
      warnings.push('Multiple forbidden phrases detected - review training');
    }

    if (violations.some(v => v.severity === 'high')) {
      warnings.push('High severity violations detected - immediate correction required');
    }

    return warnings;
  }

  private generateRecommendations(violations: EthicsViolation[]): string[] {
    const recommendations: string[] = [];

    if (violations.some(v => v.type === 'false_empathy')) {
      recommendations.push('Reinforce witnessing paradigm training');
    }

    if (violations.some(v => v.type === 'dependency_risk')) {
      recommendations.push('Add transparency reminder in next response');
      recommendations.push('Encourage user to seek human connections');
    }

    if (violations.length > 5) {
      recommendations.push('Consider retraining on ethical guidelines');
    }

    return recommendations;
  }

  private assessConversationDependencyRisk(history: any[]): 'low' | 'medium' | 'high' {
    const recentMessages = history.slice(-10);
    let riskScore = 0;

    for (const msg of recentMessages) {
      const text = (msg.userInput + ' ' + msg.mayaResponse).toLowerCase();
      for (const indicator of this.dependencyIndicators) {
        if (text.includes(indicator)) {
          riskScore++;
        }
      }
    }

    if (riskScore > 5) return 'high';
    if (riskScore > 2) return 'medium';
    return 'low';
  }

  private generateSystemicRecommendations(
    issues: string[],
    score: number,
    dependencyRisk: 'low' | 'medium' | 'high'
  ): string[] {
    const recommendations: string[] = [];

    if (score < 70) {
      recommendations.push('URGENT: Initiate comprehensive ethics retraining');
    }

    if (score < 85) {
      recommendations.push('Schedule ethics review session');
    }

    if (dependencyRisk === 'high') {
      recommendations.push('Implement stronger boundary protocols');
      recommendations.push('Increase transparency reminder frequency');
    }

    if (issues.length > 0) {
      recommendations.push(`Address systemic issues: ${issues.join(', ')}`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Maintain current excellent performance');
    }

    return recommendations;
  }
}

/**
 * Ethics Monitor for real-time monitoring
 */
export class EthicsMonitor {
  private auditHistory: AuditResult[] = [];
  private readonly mayaAudit = new MayaEthicsAudit();

  async monitorResponse(response: string, context: AuditContext): Promise<AuditResult> {
    const result = await this.mayaAudit.auditResponse(response, context);
    this.auditHistory.push(result);

    // Keep only last 100 audits
    if (this.auditHistory.length > 100) {
      this.auditHistory = this.auditHistory.slice(-100);
    }

    return result;
  }

  getAuditSummary(): {
    totalAudits: number;
    averageScore: number;
    recentViolations: number;
    healthStatus: 'excellent' | 'good' | 'warning' | 'critical';
    trends: string[];
  } {
    const totalAudits = this.auditHistory.length;
    const averageScore = this.auditHistory.reduce((sum, r) => sum + r.score, 0) / Math.max(totalAudits, 1);
    const recentViolations = this.auditHistory.slice(-10)
      .filter(r => r.auditTriggered).length;

    let healthStatus: 'excellent' | 'good' | 'warning' | 'critical';
    if (averageScore >= 90) healthStatus = 'excellent';
    else if (averageScore >= 80) healthStatus = 'good';
    else if (averageScore >= 70) healthStatus = 'warning';
    else healthStatus = 'critical';

    const trends: string[] = [];
    if (recentViolations === 0) {
      trends.push('Consistent excellent performance');
    }
    if (averageScore > 85) {
      trends.push('Strong witnessing language maintained');
    }
    if (recentViolations > 5) {
      trends.push('Increase in violations - review needed');
    }

    return {
      totalAudits,
      averageScore,
      recentViolations,
      healthStatus,
      trends
    };
  }
}

// Export singleton instances
export const mayaEthicsAudit = new MayaEthicsAudit();
export const ethicsMonitor = new EthicsMonitor();