/**
 * Conversation Analyzer - Living Laboratory for Transformational Dialogue
 * Real-time analysis and tracking of Maya's conversational effectiveness
 */

import { conversationChecklist, ChecklistResult, ConversationQualityScore } from './ConversationChecklist';

export interface ConversationTurn {
  turn: number;
  timestamp: Date;
  user: string;
  maya: string;
  analysis: ConversationQualityScore;
  spiralState?: any;
  patterns?: any;
  improvements?: string[];
}

export interface ConversationTrends {
  averageScore: number;
  elementalBalance: Record<string, number>;
  improvementAreas: string[];
  strengthAreas: string[];
  transformationalMarkers: number;
  consistencyScore: number;
}

export class ConversationAnalyzer {
  private history: ConversationTurn[] = [];
  private readonly maxHistory = 100;

  /**
   * Analyze a conversation exchange and track it
   */
  analyze(
    userMessage: string,
    mayaResponse: string,
    spiralState?: any,
    patterns?: any
  ): ConversationQualityScore {

    // Get checklist evaluation
    const checklistResults = conversationChecklist.evaluateExchange(userMessage, mayaResponse);
    const qualityScore = conversationChecklist.calculateQualityScore(checklistResults);

    // Create turn record
    const turn: ConversationTurn = {
      turn: this.history.length + 1,
      timestamp: new Date(),
      user: userMessage,
      maya: mayaResponse,
      analysis: qualityScore,
      spiralState,
      patterns,
      improvements: this.generateImprovements(checklistResults, qualityScore)
    };

    // Add to history
    this.history.push(turn);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    // Display real-time analysis
    this.displayRealTimeAnalysis(turn);

    return qualityScore;
  }

  /**
   * Display live analysis results in console
   */
  private displayRealTimeAnalysis(turn: ConversationTurn): void {
    const colors = {
      cyan: '\x1b[36m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      red: '\x1b[31m',
      magenta: '\x1b[35m',
      dim: '\x1b[2m',
      bright: '\x1b[1m',
      reset: '\x1b[0m'
    };

    console.log(`\n${colors.cyan}🌀 LIVE CONVERSATION ANALYSIS - Turn ${turn.turn}${colors.reset}`);
    console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

    // Overall score with visual bar
    const score = turn.analysis.overall;
    const scoreBar = this.createBar(score, 20);
    const scoreColor = score > 0.7 ? colors.green : score > 0.4 ? colors.yellow : colors.red;
    console.log(`${colors.bright}Overall Quality: ${scoreColor}${scoreBar} ${(score * 100).toFixed(0)}%${colors.reset}`);

    // Elemental breakdown
    console.log(`\n${colors.magenta}📊 Elemental Presence:${colors.reset}`);
    const elements = ['fire', 'water', 'earth', 'air', 'aether'] as const;

    elements.forEach(element => {
      const elementScore = turn.analysis.byElement[element];
      const elementBar = this.createBar(elementScore, 10);
      const icon = this.getElementIcon(element);

      console.log(`  ${icon} ${element.toUpperCase()}: ${elementBar} ${(elementScore * 100).toFixed(0)}%`);
    });

    // Hit indicators
    const hits = turn.analysis.cuesHit;
    const total = turn.analysis.totalCues;
    console.log(`\n${colors.green}✅ Transformational Markers: ${hits}/${total}${colors.reset}`);

    // Quick recommendations
    if (turn.improvements && turn.improvements.length > 0) {
      console.log(`\n${colors.yellow}💡 Next Focus:${colors.reset}`);
      turn.improvements.slice(0, 2).forEach(imp => {
        console.log(`  → ${imp}`);
      });
    }

    // Trending (if we have enough history)
    if (this.history.length >= 3) {
      const trend = this.calculateShortTermTrend();
      const trendIcon = trend > 0.05 ? '📈' : trend < -0.05 ? '📉' : '➡️';
      console.log(`\n${colors.dim}${trendIcon} Trend: ${trend > 0 ? '+' : ''}${(trend * 100).toFixed(1)}%${colors.reset}`);
    }

    console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  }

  /**
   * Calculate conversation trends over time
   */
  calculateTrends(windowSize: number = 10): ConversationTrends {
    const recentHistory = this.history.slice(-windowSize);

    if (recentHistory.length === 0) {
      return {
        averageScore: 0,
        elementalBalance: {},
        improvementAreas: [],
        strengthAreas: [],
        transformationalMarkers: 0,
        consistencyScore: 0
      };
    }

    // Average score
    const averageScore = recentHistory.reduce((sum, turn) =>
      sum + turn.analysis.overall, 0) / recentHistory.length;

    // Elemental balance across conversations
    const elementalBalance: Record<string, number> = {};
    const elements = ['fire', 'water', 'earth', 'air', 'aether'];

    elements.forEach(element => {
      const avgElementScore = recentHistory.reduce((sum, turn) =>
        sum + turn.analysis.byElement[element as keyof typeof turn.analysis.byElement], 0) / recentHistory.length;
      elementalBalance[element] = avgElementScore;
    });

    // Identify patterns
    const allRecommendations = recentHistory.flatMap(turn => turn.analysis.recommendations);
    const recommendationFreq = new Map<string, number>();

    allRecommendations.forEach(rec => {
      recommendationFreq.set(rec, (recommendationFreq.get(rec) || 0) + 1);
    });

    const improvementAreas = Array.from(recommendationFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([rec]) => rec);

    // Strength areas (consistently high elements)
    const strengthAreas = elements.filter(element =>
      elementalBalance[element] > 0.7
    );

    // Transformational markers
    const transformationalMarkers = recentHistory.reduce((sum, turn) =>
      sum + turn.analysis.cuesHit, 0);

    // Consistency score (low variance = high consistency)
    const scores = recentHistory.map(turn => turn.analysis.overall);
    const variance = this.calculateVariance(scores);
    const consistencyScore = Math.max(0, 1 - (variance * 2));

    return {
      averageScore,
      elementalBalance,
      improvementAreas,
      strengthAreas,
      transformationalMarkers,
      consistencyScore
    };
  }

  /**
   * Generate session report
   */
  generateSessionReport(): string {
    if (this.history.length === 0) return "No conversation data to report.";

    const trends = this.calculateTrends();
    const sessionLength = this.history.length;

    let report = `# Maya Conversation Session Report\n\n`;
    report += `**Session Length:** ${sessionLength} exchanges\n`;
    report += `**Average Quality:** ${(trends.averageScore * 100).toFixed(1)}%\n`;
    report += `**Consistency:** ${(trends.consistencyScore * 100).toFixed(1)}%\n\n`;

    // Elemental breakdown
    report += `## Elemental Performance\n\n`;
    Object.entries(trends.elementalBalance).forEach(([element, score]) => {
      const performance = score > 0.7 ? 'Strong' : score > 0.4 ? 'Moderate' : 'Needs Work';
      report += `- **${element.toUpperCase()}**: ${(score * 100).toFixed(0)}% (${performance})\n`;
    });

    // Key insights
    report += `\n## Key Insights\n\n`;
    if (trends.strengthAreas.length > 0) {
      report += `**Strengths:** ${trends.strengthAreas.join(', ')}\n`;
    }
    if (trends.improvementAreas.length > 0) {
      report += `**Growth Areas:** ${trends.improvementAreas.slice(0, 3).join(', ')}\n`;
    }
    report += `**Total Transformational Markers:** ${trends.transformationalMarkers}\n`;

    // Recent performance
    if (this.history.length >= 5) {
      const recentTrend = this.calculateShortTermTrend(5);
      const trendText = recentTrend > 0.05 ? 'Improving' :
                       recentTrend < -0.05 ? 'Declining' : 'Stable';
      report += `**Recent Trend:** ${trendText} (${recentTrend > 0 ? '+' : ''}${(recentTrend * 100).toFixed(1)}%)\n`;
    }

    return report;
  }

  /**
   * Export conversation data for research
   */
  exportForResearch(): any {
    return {
      sessionId: Date.now().toString(),
      timestamp: new Date().toISOString(),
      totalTurns: this.history.length,
      trends: this.calculateTrends(),
      conversations: this.history.map(turn => ({
        turn: turn.turn,
        timestamp: turn.timestamp.toISOString(),
        userMessage: turn.user,
        mayaResponse: turn.maya,
        qualityScore: turn.analysis.overall,
        elementalScores: turn.analysis.byElement,
        cuesHit: turn.analysis.cuesHit,
        totalCues: turn.analysis.totalCues,
        spiralState: turn.spiralState,
        patterns: turn.patterns
      }))
    };
  }

  /**
   * Get Maya's self-assessment prompt for next response
   */
  getSelfAssessmentPrompt(): string {
    if (this.history.length === 0) return '';

    const lastTurn = this.history[this.history.length - 1];
    const trends = this.calculateTrends(5);

    // Identify what's working and what needs work
    const strongElements = Object.entries(trends.elementalBalance)
      .filter(([_, score]) => score > 0.6)
      .map(([element]) => element);

    const weakElements = Object.entries(trends.elementalBalance)
      .filter(([_, score]) => score < 0.4)
      .map(([element]) => element);

    let prompt = '\n--- MAYA SELF-ASSESSMENT (Internal) ---\n';

    if (strongElements.length > 0) {
      prompt += `✓ Strong elements: ${strongElements.join(', ')}\n`;
    }

    if (weakElements.length > 0) {
      prompt += `⚠ Focus areas: ${weakElements.join(', ')}\n`;
    }

    if (lastTurn.improvements && lastTurn.improvements.length > 0) {
      prompt += `→ Next response priority: ${lastTurn.improvements[0]}\n`;
    }

    prompt += '--- End Assessment ---\n';

    return prompt;
  }

  // Helper methods
  private generateImprovements(results: ChecklistResult[], score: ConversationQualityScore): string[] {
    const improvements: string[] = [];

    // Check for specific missed opportunities
    const missedCues = results.filter(r => !r.hit);

    missedCues.forEach(cue => {
      const improvement = this.getImprovementForCue(cue.cue, cue.element);
      if (improvement) improvements.push(improvement);
    });

    // Add elemental balance recommendations
    const weakElement = Object.entries(score.byElement)
      .sort(([,a], [,b]) => a - b)[0];

    if (weakElement[1] < 0.4) {
      improvements.push(`Strengthen ${weakElement[0]} element`);
    }

    return improvements.slice(0, 3); // Top 3 priorities
  }

  private getImprovementForCue(cue: string, element: string): string {
    const improvements: Record<string, string> = {
      'Mirroring': 'Echo their key words naturally',
      'Emotional Attunement': 'Acknowledge their emotional tone',
      'Vulnerability Space': 'Create more spaciousness for difficult feelings',
      'Clarifying Questions': 'Ask open-ended "what" or "how" questions',
      'Perspective Shift': 'Offer gentle reframes or new angles',
      'Grounded Summarizing': 'Reflect back what you heard without interpretation',
      'Steady Pacing': 'Keep responses concise and breathable',
      'Meaningful Challenge': 'Connect challenges to their values',
      'Values Alignment': 'Ask what matters most to them',
      'Transformational Space': 'Hold space for their becoming'
    };

    return improvements[cue] || `Enhance ${element} element presence`;
  }

  private createBar(score: number, length: number): string {
    const filled = Math.round(score * length);
    const empty = length - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  private getElementIcon(element: string): string {
    const icons = {
      fire: '🔥',
      water: '💧',
      earth: '🌍',
      air: '🌬️',
      aether: '✨'
    };
    return icons[element as keyof typeof icons] || '○';
  }

  private calculateShortTermTrend(window: number = 3): number {
    if (this.history.length < window) return 0;

    const recent = this.history.slice(-window);
    const older = this.history.slice(-window * 2, -window);

    if (older.length === 0) return 0;

    const recentAvg = recent.reduce((sum, turn) => sum + turn.analysis.overall, 0) / recent.length;
    const olderAvg = older.reduce((sum, turn) => sum + turn.analysis.overall, 0) / older.length;

    return recentAvg - olderAvg;
  }

  private calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;

    const mean = numbers.reduce((a, b) => a + b) / numbers.length;
    const squareDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return Math.sqrt(squareDiffs.reduce((a, b) => a + b) / numbers.length);
  }

  // Public getters for external access
  getHistory(): ConversationTurn[] {
    return [...this.history];
  }

  getLatestTurn(): ConversationTurn | null {
    return this.history[this.history.length - 1] || null;
  }

  getTrends(windowSize?: number): ConversationTrends {
    return this.calculateTrends(windowSize);
  }

  clearHistory(): void {
    this.history = [];
  }

  exportToFile(filename: string): void {
    const fs = require('fs');
    const data = JSON.stringify(this.history, null, 2);

    try {
      fs.writeFileSync(filename, data);
      console.log(`\n📄 Session data exported to ${filename}`);
      console.log(`(${this.history.length} turns, ${data.length} characters)`);
    } catch (error) {
      console.error(`❌ Failed to export to ${filename}:`, error.message);
    }
  }
}

export const conversationAnalyzer = new ConversationAnalyzer();

// Global dev access
if (typeof window !== 'undefined') {
  (window as any).__DEV_ANALYZER__ = conversationAnalyzer;
}