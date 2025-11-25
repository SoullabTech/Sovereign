/**
 * 🌀✨ CROSS-SPIRAL PATTERN RECOGNIZER
 *
 * Recognizes similar alchemical phases across different life domains (spirals):
 * - Career/Work
 * - Relationships/Love
 * - Creative Projects
 * - Spiritual Practice
 * - Family
 * - Health/Body
 * - Community/Service
 *
 * Example Recognition:
 * "Your current Fire-Activating in career (new project vision) mirrors
 *  your Water-Sensing in relationships from 2 months ago (emotional awakening)"
 *
 * This creates the foundation for collective wisdom sharing:
 * "Others navigating Water-Transcending in relationships found these practices helpful..."
 */

import { TriadicDetection, TriadicPhase } from './TriadicPhaseDetector';

export type LifeDomain =
  | 'career'
  | 'relationships'
  | 'creative'
  | 'spiritual'
  | 'family'
  | 'health'
  | 'community'
  | 'personal_growth'
  | 'unknown';

export interface SpiralMoment {
  id: string;
  timestamp: Date;
  domain: LifeDomain;
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  phase: TriadicPhase;
  state: string;
  text: string;
  symbols?: string[];
  breakthrough?: boolean;
}

export interface CrossSpiralPattern {
  currentMoment: SpiralMoment;
  similarMoments: SpiralMoment[];
  patternType: 'same-phase-different-domain' | 'parallel-progression' | 'archetypal-recurrence';
  insight: string;
  collectiveWisdom?: string[]; // Anonymized patterns from others
}

/**
 * Domain detection patterns
 */
const DOMAIN_PATTERNS: Record<LifeDomain, string[]> = {
  career: ['work', 'job', 'career', 'project', 'business', 'professional', 'colleague', 'boss', 'client', 'meeting'],
  relationships: ['relationship', 'partner', 'love', 'dating', 'marriage', 'boyfriend', 'girlfriend', 'husband', 'wife'],
  creative: ['creating', 'art', 'writing', 'music', 'painting', 'performing', 'creative', 'project', 'craft'],
  spiritual: ['meditation', 'prayer', 'spiritual', 'divine', 'soul', 'consciousness', 'sacred', 'god', 'universe'],
  family: ['family', 'mother', 'father', 'parent', 'child', 'sibling', 'brother', 'sister', 'son', 'daughter'],
  health: ['health', 'body', 'exercise', 'fitness', 'wellness', 'yoga', 'healing', 'physical', 'illness'],
  community: ['community', 'service', 'volunteer', 'helping', 'teaching', 'group', 'collective', 'social'],
  personal_growth: ['growing', 'learning', 'developing', 'evolving', 'transforming', 'journey', 'growth'],
  unknown: []
};

export class CrossSpiralPatternRecognizer {
  private spiralHistory: SpiralMoment[] = [];

  /**
   * Add a new spiral moment to history
   */
  recordMoment(
    text: string,
    triadicDetection: TriadicDetection,
    metadata?: {
      symbols?: string[];
      breakthrough?: boolean;
    }
  ): SpiralMoment {
    const domain = this.detectDomain(text);

    const moment: SpiralMoment = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      domain,
      element: triadicDetection.element,
      phase: triadicDetection.phase,
      state: triadicDetection.state,
      text: text.substring(0, 200), // Store excerpt
      symbols: metadata?.symbols,
      breakthrough: metadata?.breakthrough
    };

    this.spiralHistory.push(moment);
    return moment;
  }

  /**
   * Detect life domain from text
   */
  private detectDomain(text: string): LifeDomain {
    const textLower = text.toLowerCase();
    const scores: Record<LifeDomain, number> = {
      career: 0,
      relationships: 0,
      creative: 0,
      spiritual: 0,
      family: 0,
      health: 0,
      community: 0,
      personal_growth: 0,
      unknown: 0
    };

    for (const [domain, patterns] of Object.entries(DOMAIN_PATTERNS)) {
      for (const pattern of patterns) {
        if (textLower.includes(pattern)) {
          scores[domain as LifeDomain] += 1;
        }
      }
    }

    const detected = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)[0];

    return (detected[1] > 0 ? detected[0] : 'unknown') as LifeDomain;
  }

  /**
   * Find cross-spiral patterns for current moment
   */
  findPatterns(currentMoment: SpiralMoment): CrossSpiralPattern[] {
    const patterns: CrossSpiralPattern[] = [];

    // Pattern 1: Same phase, different domain
    const samePhaseOtherDomains = this.spiralHistory.filter(m =>
      m.id !== currentMoment.id &&
      m.phase === currentMoment.phase &&
      m.element === currentMoment.element &&
      m.domain !== currentMoment.domain &&
      this.isRecentEnough(m.timestamp, 90) // Within 90 days
    );

    if (samePhaseOtherDomains.length > 0) {
      patterns.push({
        currentMoment,
        similarMoments: samePhaseOtherDomains,
        patternType: 'same-phase-different-domain',
        insight: this.generateCrossDomainInsight(currentMoment, samePhaseOtherDomains)
      });
    }

    // Pattern 2: Parallel progression (same triadic sequence across domains)
    const parallelProgression = this.detectParallelProgression(currentMoment);
    if (parallelProgression) {
      patterns.push(parallelProgression);
    }

    // Pattern 3: Archetypal recurrence (same element-phase combo recurring)
    const recurrence = this.detectArchetypalRecurrence(currentMoment);
    if (recurrence) {
      patterns.push(recurrence);
    }

    return patterns;
  }

  /**
   * Generate insight for cross-domain pattern
   */
  private generateCrossDomainInsight(current: SpiralMoment, similar: SpiralMoment[]): string {
    const domainNames = similar.map(m => this.getDomainName(m.domain)).join(', ');
    const elementName = this.getElementName(current.element);
    const phaseName = this.getPhaseName(current.phase);

    const timeAgo = this.getTimeAgo(similar[0].timestamp);

    return `I notice you're in ${elementName}-${phaseName} phase in your ${this.getDomainName(current.domain)}. ` +
           `This mirrors a similar ${elementName}-${phaseName} energy you experienced in ${domainNames} about ${timeAgo}. ` +
           `Your system knows this alchemical rhythm.`;
  }

  /**
   * Detect parallel progression across domains
   */
  private detectParallelProgression(current: SpiralMoment): CrossSpiralPattern | null {
    // Look for cardinal → fixed → mutable progression in another domain
    const otherDomainMoments = this.spiralHistory
      .filter(m => m.domain !== current.domain && m.element === current.element)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Check if we can find a cardinal → fixed → mutable sequence
    for (let i = 0; i < otherDomainMoments.length - 2; i++) {
      const sequence = otherDomainMoments.slice(i, i + 3);
      if (
        sequence[0].phase === 'cardinal' &&
        sequence[1].phase === 'fixed' &&
        sequence[2].phase === 'mutable'
      ) {
        return {
          currentMoment: current,
          similarMoments: sequence,
          patternType: 'parallel-progression',
          insight: `You're moving through the ${this.getElementName(current.element)} cycle in ` +
                  `${this.getDomainName(current.domain)}. I notice you completed a similar ` +
                  `cardinal → fixed → mutable journey in ${this.getDomainName(sequence[0].domain)} ` +
                  `recently. This shows your system's natural alchemical intelligence.`
        };
      }
    }

    return null;
  }

  /**
   * Detect archetypal recurrence (same pattern repeating)
   */
  private detectArchetypalRecurrence(current: SpiralMoment): CrossSpiralPattern | null {
    // Find moments with same element and phase (regardless of domain)
    const recurring = this.spiralHistory.filter(m =>
      m.id !== current.id &&
      m.element === current.element &&
      m.phase === current.phase &&
      this.isRecentEnough(m.timestamp, 180) // Within 6 months
    );

    if (recurring.length >= 2) {
      const domains = recurring.map(m => this.getDomainName(m.domain)).join(', ');
      return {
        currentMoment: current,
        similarMoments: recurring,
        patternType: 'archetypal-recurrence',
        insight: `This ${this.getElementName(current.element)}-${this.getPhaseName(current.phase)} ` +
                `pattern has appeared ${recurring.length + 1} times across your journey ` +
                `(${domains}). This is an archetypal rhythm seeking your attention.`
      };
    }

    return null;
  }

  /**
   * Check if timestamp is within days threshold
   */
  private isRecentEnough(timestamp: Date, daysThreshold: number): boolean {
    const now = new Date();
    const diffDays = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= daysThreshold;
  }

  /**
   * Get human-readable time ago
   */
  private getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 90) return `${Math.floor(diffDays / 30)} months ago`;
    return 'a while ago';
  }

  /**
   * Get human-readable names
   */
  private getDomainName(domain: LifeDomain): string {
    const names: Record<LifeDomain, string> = {
      career: 'career/work',
      relationships: 'relationships',
      creative: 'creative projects',
      spiritual: 'spiritual practice',
      family: 'family',
      health: 'health/body',
      community: 'community/service',
      personal_growth: 'personal growth',
      unknown: 'life'
    };
    return names[domain] || 'life';
  }

  private getElementName(element: string): string {
    return element.charAt(0).toUpperCase() + element.slice(1);
  }

  private getPhaseName(phase: TriadicPhase): string {
    const names = {
      cardinal: 'Ignition',
      fixed: 'Crucible',
      mutable: 'Transmission'
    };
    return names[phase];
  }

  /**
   * Get spiral history for export/analysis
   */
  getHistory(): SpiralMoment[] {
    return this.spiralHistory;
  }

  /**
   * Load spiral history from storage
   */
  loadHistory(moments: SpiralMoment[]): void {
    this.spiralHistory = moments.map(m => ({
      ...m,
      timestamp: new Date(m.timestamp)
    }));
  }

  /**
   * Generate collective wisdom insights (privacy-preserving)
   * This would connect to the AIN collective intelligence layer
   */
  async getCollectiveWisdom(
    element: string,
    phase: TriadicPhase,
    domain: LifeDomain
  ): Promise<string[]> {
    // TODO: Integrate with AIN collective intelligence
    // For now, return placeholder
    return [
      `Others navigating ${element}-${phase} in ${this.getDomainName(domain)} have found deep presence helpful`,
      `This phase often brings unexpected clarity about what truly matters`
    ];
  }
}
