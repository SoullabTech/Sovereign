/**
 * Focal Point Pattern Recognition System
 * Tracks user's recurring patterns across the Four Focal Points
 */

import { logger } from '../utils/logger';
import { storeMemoryItem, getRelevantMemories } from '../services/memoryService';

interface FocalPointPattern {
  userId: string;
  timestamp: number;
  focalPoint: 'ideal' | 'shadow' | 'resources' | 'outcome';
  element: string;
  confidence: number;
  keywords: string[];
  resolution: 'resolved' | 'recurring' | 'evolving' | 'stuck';
  relatedPatterns: string[];
}

interface UserPatternProfile {
  userId: string;
  dominantFocalPoint: string;
  recurringThemes: Map<string, number>;
  evolutionTrajectory: 'expanding' | 'deepening' | 'integrating' | 'cycling';
  stuckPoints: string[];
  breakthroughMoments: string[];
  lastUpdated: number;
}

export class FocalPointPatternRecognition {
  private userPatterns: Map<string, UserPatternProfile> = new Map();
  private patternHistory: Map<string, FocalPointPattern[]> = new Map();

  /**
   * Track a new focal point interaction
   */
  async trackFocalPoint(
    userId: string,
    input: string,
    detectedFocalPoint: string,
    element: string,
    response: string
  ): Promise<void> {
    logger.info('Tracking focal point interaction', {
      userId,
      focalPoint: detectedFocalPoint,
      element
    });

    // Create pattern entry
    const pattern: FocalPointPattern = {
      userId,
      timestamp: Date.now(),
      focalPoint: detectedFocalPoint as any,
      element,
      confidence: this.calculateConfidence(input, detectedFocalPoint),
      keywords: this.extractKeywords(input),
      resolution: 'evolving',
      relatedPatterns: await this.findRelatedPatterns(userId, input)
    };

    // Add to history
    if (!this.patternHistory.has(userId)) {
      this.patternHistory.set(userId, []);
    }
    this.patternHistory.get(userId)!.push(pattern);

    // Update user profile
    await this.updateUserProfile(userId, pattern);

    // Check for pattern insights
    const insights = await this.detectPatternInsights(userId);

    if (insights.length > 0) {
      logger.info('Pattern insights detected', { userId, insights });
      await this.storePatternInsights(userId, insights);
    }

    // Store in memory for persistence
    await storeMemoryItem(userId, 'FOCAL_PATTERN', {
      type: 'focal_point_pattern',
      pattern,
      timestamp: Date.now()
    });
  }

  /**
   * Calculate confidence in focal point detection
   */
  private calculateConfidence(input: string, focalPoint: string): number {
    const markers = {
      ideal: ['want', 'wish', 'hope', 'dream', 'goal', 'aspire'],
      shadow: ['fear', 'avoid', 'stuck', 'can\'t', 'problem', 'struggle'],
      resources: ['have', 'can', 'able', 'strength', 'skill', 'know'],
      outcome: ['if', 'would', 'could', 'result', 'become', 'transform']
    };

    const focalMarkers = markers[focalPoint] || [];
    const inputLower = input.toLowerCase();

    let confidence = 0.5; // Base confidence

    // Increase confidence for each marker found
    for (const marker of focalMarkers) {
      if (inputLower.includes(marker)) {
        confidence += 0.1;
      }
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Extract keywords for pattern matching
   */
  private extractKeywords(input: string): string[] {
    // Remove common words
    const stopWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or',
      'but', 'in', 'with', 'to', 'for', 'of', 'as', 'by', 'that',
      'this', 'it', 'from', 'be', 'are', 'been', 'being', 'have',
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'can', 'shall'
    ]);

    const words = input.toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/)
      .filter(word => !stopWords.has(word) && word.length > 2);

    // Get unique keywords
    return [...new Set(words)];
  }

  /**
   * Find related patterns from history
   */
  private async findRelatedPatterns(
    userId: string,
    input: string
  ): Promise<string[]> {
    const userHistory = this.patternHistory.get(userId) || [];
    const currentKeywords = new Set(this.extractKeywords(input));
    const related: string[] = [];

    // Look for patterns with overlapping keywords
    for (const pattern of userHistory.slice(-20)) { // Last 20 patterns
      const overlap = pattern.keywords.filter(k => currentKeywords.has(k));

      if (overlap.length >= 2) { // At least 2 keywords match
        related.push(`${pattern.focalPoint}:${pattern.element}:${overlap.join(',')}`);
      }
    }

    return related.slice(0, 3); // Return top 3 related patterns
  }

  /**
   * Update user's pattern profile
   */
  private async updateUserProfile(
    userId: string,
    pattern: FocalPointPattern
  ): Promise<void> {
    let profile = this.userPatterns.get(userId);

    if (!profile) {
      profile = {
        userId,
        dominantFocalPoint: pattern.focalPoint,
        recurringThemes: new Map(),
        evolutionTrajectory: 'expanding',
        stuckPoints: [],
        breakthroughMoments: [],
        lastUpdated: Date.now()
      };
      this.userPatterns.set(userId, profile);
    }

    // Update recurring themes
    for (const keyword of pattern.keywords) {
      const count = profile.recurringThemes.get(keyword) || 0;
      profile.recurringThemes.set(keyword, count + 1);
    }

    // Detect dominant focal point (most frequent in last 10)
    const recentPatterns = (this.patternHistory.get(userId) || []).slice(-10);
    const focalCounts = new Map<string, number>();

    for (const p of recentPatterns) {
      const count = focalCounts.get(p.focalPoint) || 0;
      focalCounts.set(p.focalPoint, count + 1);
    }

    // Find most frequent
    let maxCount = 0;
    let dominant = 'ideal';
    for (const [focal, count] of focalCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        dominant = focal;
      }
    }
    profile.dominantFocalPoint = dominant;

    // Detect evolution trajectory
    profile.evolutionTrajectory = this.detectTrajectory(recentPatterns);

    // Detect stuck points (same issue appearing 3+ times)
    const themeFrequency = new Map<string, number>();
    for (const p of recentPatterns) {
      const theme = p.keywords.join(',');
      themeFrequency.set(theme, (themeFrequency.get(theme) || 0) + 1);
    }

    profile.stuckPoints = Array.from(themeFrequency.entries())
      .filter(([, count]) => count >= 3)
      .map(([theme]) => theme);

    profile.lastUpdated = Date.now();
  }

  /**
   * Detect user's evolution trajectory
   */
  private detectTrajectory(patterns: FocalPointPattern[]): UserPatternProfile['evolutionTrajectory'] {
    if (patterns.length < 5) return 'expanding';

    // Check if cycling through same patterns
    const uniqueThemes = new Set(patterns.map(p => p.keywords.join(',')));
    if (uniqueThemes.size < patterns.length * 0.3) {
      return 'cycling';
    }

    // Check if going deeper (same focal point, different aspects)
    const focalPoints = patterns.map(p => p.focalPoint);
    const uniqueFocals = new Set(focalPoints);
    if (uniqueFocals.size === 1) {
      return 'deepening';
    }

    // Check if integrating (moving between all focal points)
    if (uniqueFocals.size >= 3) {
      return 'integrating';
    }

    return 'expanding';
  }

  /**
   * Detect pattern insights
   */
  private async detectPatternInsights(userId: string): Promise<string[]> {
    const profile = this.userPatterns.get(userId);
    if (!profile) return [];

    const insights: string[] = [];
    const patterns = this.patternHistory.get(userId) || [];

    // Insight 1: Stuck pattern detection
    if (profile.stuckPoints.length > 0) {
      insights.push(`Recurring pattern detected: ${profile.stuckPoints[0]}. This might be a growth edge.`);
    }

    // Insight 2: Focal point imbalance
    const focalCounts = new Map<string, number>();
    for (const p of patterns.slice(-20)) {
      focalCounts.set(p.focalPoint, (focalCounts.get(p.focalPoint) || 0) + 1);
    }

    const neglected = ['ideal', 'shadow', 'resources', 'outcome']
      .filter(f => (focalCounts.get(f) || 0) < 2);

    if (neglected.length > 0) {
      insights.push(`Consider exploring your ${neglected[0]}. It hasn't been visited recently.`);
    }

    // Insight 3: Evolution recognition
    if (profile.evolutionTrajectory === 'integrating') {
      insights.push("You're weaving all aspects beautifully. Integration in progress.");
    } else if (profile.evolutionTrajectory === 'cycling') {
      insights.push("Same territory, deeper exploration. What wants to shift?");
    }

    // Insight 4: Resource activation suggestion
    const resourcePatterns = patterns.filter(p => p.focalPoint === 'resources');
    if (resourcePatterns.length < patterns.length * 0.2) {
      insights.push("Your resources might be underrecognized. What strengths are hidden?");
    }

    // Insight 5: Shadow-Ideal connection
    const shadowPatterns = patterns.filter(p => p.focalPoint === 'shadow').slice(-5);
    const idealPatterns = patterns.filter(p => p.focalPoint === 'ideal').slice(-5);

    if (shadowPatterns.length > 0 && idealPatterns.length > 0) {
      const shadowKeywords = new Set(shadowPatterns.flatMap(p => p.keywords));
      const idealKeywords = new Set(idealPatterns.flatMap(p => p.keywords));
      const overlap = [...shadowKeywords].filter(k => idealKeywords.has(k));

      if (overlap.length > 0) {
        insights.push(`Your shadow and ideal both involve "${overlap[0]}". They might be connected.`);
      }
    }

    return insights.slice(0, 2); // Return max 2 insights at a time
  }

  /**
   * Store pattern insights in memory
   */
  private async storePatternInsights(
    userId: string,
    insights: string[]
  ): Promise<void> {
    await storeMemoryItem(userId, 'PATTERN_INSIGHTS', {
      type: 'pattern_insights',
      insights,
      timestamp: Date.now()
    });
  }

  /**
   * Get user's pattern summary
   */
  async getUserPatternSummary(userId: string): Promise<{
    profile: UserPatternProfile | null;
    recentPatterns: FocalPointPattern[];
    insights: string[];
    recommendations: string[];
  }> {
    const profile = this.userPatterns.get(userId);
    const patterns = this.patternHistory.get(userId) || [];
    const recentPatterns = patterns.slice(-10);
    const insights = await this.detectPatternInsights(userId);
    const recommendations = this.generateRecommendations(profile, recentPatterns);

    return {
      profile,
      recentPatterns,
      insights,
      recommendations
    };
  }

  /**
   * Generate recommendations based on patterns
   */
  private generateRecommendations(
    profile: UserPatternProfile | null,
    recentPatterns: FocalPointPattern[]
  ): string[] {
    if (!profile) return ["Begin by exploring what you most want (ideal)."];

    const recommendations: string[] = [];

    // Based on trajectory
    switch (profile.evolutionTrajectory) {
      case 'cycling':
        recommendations.push("Try a different angle on this familiar territory.");
        break;
      case 'deepening':
        recommendations.push("You're going deep. Honor the process.");
        break;
      case 'integrating':
        recommendations.push("Beautiful integration happening. Trust the weaving.");
        break;
      case 'expanding':
        recommendations.push("Exploration mode. Follow your curiosity.");
        break;
    }

    // Based on dominant focal point
    switch (profile.dominantFocalPoint) {
      case 'ideal':
        recommendations.push("Your vision is clear. What resources support it?");
        break;
      case 'shadow':
        recommendations.push("Shadow work is sacred. What's it protecting?");
        break;
      case 'resources':
        recommendations.push("You see your strengths. How do they serve your ideal?");
        break;
      case 'outcome':
        recommendations.push("The destination calls. What's the next step?");
        break;
    }

    // Based on stuck points
    if (profile.stuckPoints.length > 0) {
      recommendations.push("This recurring theme might be ready for a breakthrough.");
    }

    return recommendations.slice(0, 2);
  }

  /**
   * Detect if user needs a different approach
   */
  async suggestApproachShift(userId: string): Promise<string | null> {
    const profile = this.userPatterns.get(userId);
    if (!profile) return null;

    const patterns = this.patternHistory.get(userId) || [];
    const recentPatterns = patterns.slice(-5);

    // If stuck in same focal point
    const sameFocal = recentPatterns.every(p => p.focalPoint === recentPatterns[0].focalPoint);
    if (sameFocal) {
      const shifts = {
        ideal: "Your vision is clear. What shadow might be present?",
        shadow: "Shadow acknowledged. What resources do you have?",
        resources: "Resources identified. What outcome do you want?",
        outcome: "Outcome clear. What's the ideal behind it?"
      };
      return shifts[recentPatterns[0].focalPoint];
    }

    // If low confidence patterns
    const avgConfidence = recentPatterns.reduce((sum, p) => sum + p.confidence, 0) / recentPatterns.length;
    if (avgConfidence < 0.6) {
      return "Let's try a different angle. What's most alive for you right now?";
    }

    return null;
  }
}

// Export singleton
export const focalPointTracker = new FocalPointPatternRecognition();