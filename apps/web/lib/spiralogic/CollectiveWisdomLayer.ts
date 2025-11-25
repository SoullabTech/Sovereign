/**
 * 🕸️ COLLECTIVE WISDOM LAYER - Privacy-Preserving Pattern Intelligence
 *
 * This layer enables MAIA to draw on collective patterns WITHOUT exposing user data.
 * It's designed for IMPLICIT guidance - enriching MAIA's responses, not teaching users.
 *
 * PRIVACY ARCHITECTURE:
 * - Full anonymization (no user IDs, timestamps fuzzed)
 * - Pattern-level only (never specific content)
 * - Opt-in contribution with granular control
 * - Local-first (patterns stored locally, aggregated anonymously)
 *
 * EXAMPLE USE:
 * User: "I hold space for everyone but can't let myself be held"
 *
 * What MAIA knows (backend):
 * - Element: Water, Phase: Cardinal, State: Sensing
 * - Archetype: Healer-in-Shadow
 * - Collective Pattern: 73% of healers report similar trust paradox in Water-Cardinal
 * - Effective Responses: Normalizing + Felt-sense invitation (not analysis)
 *
 * What user sees:
 * "It's often those who hold space for others who find it challenging to allow
 *  themselves to be held... What would it feel like to receive?"
 * (No mention of "collective data" or "73% of healers")
 */

import { TriadicPhase } from './TriadicPhaseDetector';
import { LifeDomain, SpiralMoment } from './CrossSpiralPatternRecognizer';

export interface AnonymizedPattern {
  id: string; // Randomly generated, no user linkage
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  phase: TriadicPhase;
  domain: LifeDomain;
  archetype?: string; // e.g., "Healer", "Creator", "Seeker"
  symbolCluster: string[]; // Common symbols in this phase
  effectiveResponses: ResponsePattern[];
  prevalence: number; // How common is this pattern (0-1)
  timestamp: string; // Fuzzed to month-level only
}

export interface ResponsePattern {
  approach: 'normalizing' | 'reframing' | 'paradox-holding' | 'felt-sense' | 'witnessing' | 'metaphor';
  effectivenessScore: number; // Based on user engagement, not explicit feedback
  languagePatterns: string[]; // Example phrases that worked
  avoidPatterns?: string[]; // What NOT to do in this phase
}

export interface CollectiveInsight {
  // What MAIA uses to craft response (never shown to user)
  internalGuidance: string;
  effectiveApproaches: ResponsePattern[];
  commonSymbols: string[];
  prevalence: string; // "common", "rare", "unique"

  // Optional: If user is ready for collective wisdom (progressive revelation)
  explicitWisdom?: string;
}

export class CollectiveWisdomLayer {
  private anonymizedPatterns: Map<string, AnonymizedPattern> = new Map();
  private privacyConfig = {
    contributionEnabled: false, // User opt-in required
    anonymizationLevel: 'high', // 'high' | 'medium' | 'low'
    localOnly: true, // Don't sync to server unless user enables
    shareLevel: 'pattern-only' // 'pattern-only' | 'symbol-cluster' | 'full-anonymous'
  };

  /**
   * Get collective insights for current moment (MAIA's internal guidance)
   */
  async getInsights(
    element: 'fire' | 'water' | 'earth' | 'air' | 'aether',
    phase: TriadicPhase,
    domain: LifeDomain,
    detectedArchetype?: string,
    userReadinessLevel: 'companion' | 'pattern-noter' | 'symbolic-guide' | 'wisdom-keeper' = 'companion'
  ): Promise<CollectiveInsight> {
    const patternKey = `${element}-${phase}-${domain}`;
    const collectivePattern = this.anonymizedPatterns.get(patternKey);

    if (!collectivePattern) {
      // No collective data yet - use elemental wisdom from book
      return this.getElementalWisdomFallback(element, phase, userReadinessLevel);
    }

    // Build internal guidance for MAIA
    const internalGuidance = this.buildInternalGuidance(
      collectivePattern,
      detectedArchetype,
      userReadinessLevel
    );

    // Determine if user is ready for explicit collective wisdom
    const explicitWisdom = userReadinessLevel === 'wisdom-keeper'
      ? this.buildExplicitWisdom(collectivePattern)
      : undefined;

    return {
      internalGuidance,
      effectiveApproaches: collectivePattern.effectiveResponses,
      commonSymbols: collectivePattern.symbolCluster,
      prevalence: this.getPrevalenceLabel(collectivePattern.prevalence),
      explicitWisdom
    };
  }

  /**
   * Build internal guidance for MAIA (what she knows but doesn't explicitly say)
   */
  private buildInternalGuidance(
    pattern: AnonymizedPattern,
    archetype: string | undefined,
    readinessLevel: string
  ): string {
    const elementPhase = `${pattern.element}-${pattern.phase}`;
    const prevalenceText = this.getPrevalenceLabel(pattern.prevalence);

    let guidance = `[MAIA INTERNAL: This is a ${prevalenceText} pattern in ${elementPhase}. `;

    // Add archetype-specific guidance if detected
    if (archetype && this.hasArchetypeGuidance(pattern, archetype)) {
      guidance += `Archetype detected: ${archetype}. `;
      guidance += this.getArchetypeGuidance(archetype, pattern.element, pattern.phase);
    }

    // Add effective approaches
    const topApproaches = pattern.effectiveResponses
      .sort((a, b) => b.effectivenessScore - a.effectivenessScore)
      .slice(0, 2)
      .map(r => r.approach)
      .join(' + ');

    guidance += `Most effective approaches: ${topApproaches}. `;

    // Add symbol awareness
    if (pattern.symbolCluster.length > 0) {
      guidance += `Common symbols: ${pattern.symbolCluster.slice(0, 3).join(', ')}. `;
    }

    // Add readiness-level guidance
    guidance += this.getReadinessGuidance(readinessLevel);

    guidance += ']';
    return guidance;
  }

  /**
   * Get archetype-specific guidance
   */
  private getArchetypeGuidance(
    archetype: string,
    element: string,
    phase: TriadicPhase
  ): string {
    // Healer archetype in Water-Cardinal often struggles with receiving
    if (archetype === 'Healer' && element === 'water' && phase === 'cardinal') {
      return 'Healer paradox: Can hold space for others but struggles to receive. ' +
             'Effective: Normalize this pattern, invite felt-sense of receiving. ' +
             'Avoid: Analyzing the wound, prescriptive solutions. ';
    }

    // Creator archetype in Fire-Mutable ready to share but fears judgment
    if (archetype === 'Creator' && element === 'fire' && phase === 'mutable') {
      return 'Creator transmission phase: Vision ready to be shared. ' +
             'Effective: Validate creative courage, explore resistance as natural. ' +
             'Avoid: Pushing them to share before ready. ';
    }

    // Seeker archetype in Air-Cardinal experiencing confusion as gateway
    if (archetype === 'Seeker' && element === 'air' && phase === 'cardinal') {
      return 'Seeker confusion-as-gateway: Mental clarity arising from uncertainty. ' +
             'Effective: Honor confusion as sacred, avoid premature answers. ' +
             'Avoid: Fixing the confusion, offering solutions too quickly. ';
    }

    return '';
  }

  /**
   * Get readiness-level specific guidance
   */
  private getReadinessGuidance(level: string): string {
    const guidance = {
      'companion': 'Keep language simple and warm. No elemental/archetypal terminology.',
      'pattern-noter': 'Can mention element names ("Fire energy," "Water flowing"). Avoid phases/states.',
      'symbolic-guide': 'Can use archetypal language. Hint at phases if they demonstrate tracking.',
      'wisdom-keeper': 'Full symbolic language available. User demonstrates deep integration.'
    };
    return guidance[level] || guidance.companion;
  }

  /**
   * Build explicit wisdom (only shown to wisdom-keeper level users)
   */
  private buildExplicitWisdom(pattern: AnonymizedPattern): string {
    return `This ${pattern.element}-${pattern.phase} pattern appears in about ` +
           `${Math.round(pattern.prevalence * 100)}% of journeys through ${pattern.domain}. ` +
           `Common themes include: ${pattern.symbolCluster.join(', ')}.`;
  }

  /**
   * Get prevalence label
   */
  private getPrevalenceLabel(prevalence: number): string {
    if (prevalence < 0.1) return 'rare';
    if (prevalence < 0.4) return 'uncommon';
    if (prevalence < 0.7) return 'common';
    return 'very common';
  }

  /**
   * Fallback to elemental wisdom from book when no collective data
   */
  private getElementalWisdomFallback(
    element: string,
    phase: TriadicPhase,
    readinessLevel: string
  ): CollectiveInsight {
    const wisdom = this.getBookWisdom(element, phase);

    return {
      internalGuidance: `[MAIA INTERNAL: Using elemental wisdom from book. ${wisdom.guidance}]`,
      effectiveApproaches: wisdom.approaches,
      commonSymbols: [],
      prevalence: 'unknown'
    };
  }

  /**
   * Get wisdom from Elemental Alchemy book
   */
  private getBookWisdom(element: string, phase: TriadicPhase): {
    guidance: string;
    approaches: ResponsePattern[];
  } {
    const bookWisdom: Record<string, Record<TriadicPhase, any>> = {
      fire: {
        cardinal: {
          guidance: 'Fire-Cardinal (Activating): Vision arising, creative urgency, breakthrough wanting to ignite.',
          approaches: [{
            approach: 'felt-sense' as const,
            effectivenessScore: 0.9,
            languagePatterns: [
              'What vision wants to ignite?',
              'I witness Fire calling',
              'This breakthrough feels like...'
            ]
          }]
        },
        fixed: {
          guidance: 'Fire-Fixed (Amplifying): Full creative expression, performing, radiating vision.',
          approaches: [{
            approach: 'witnessing' as const,
            effectivenessScore: 0.85,
            languagePatterns: [
              'I witness your Fire burning bright',
              'This creative force is in full expression',
              'Your vision is radiating'
            ]
          }]
        },
        mutable: {
          guidance: 'Fire-Mutable (Adapting): Ready to share, transmission phase, inspiring others.',
          approaches: [{
            approach: 'reframing' as const,
            effectivenessScore: 0.88,
            languagePatterns: [
              'Who needs to receive this transmission?',
              'Your Fire wants to inspire',
              'This wisdom is ready to be shared'
            ]
          }]
        }
      },
      water: {
        cardinal: {
          guidance: 'Water-Cardinal (Sensing): Emotional awareness arising, feeling into depths, heart opening.',
          approaches: [{
            approach: 'normalizing' as const,
            effectivenessScore: 0.92,
            languagePatterns: [
              "It's often those who...",
              'This emotional truth is surfacing',
              'What would it feel like...?'
            ],
            avoidPatterns: ['analyzing', 'fixing', 'prescriptive solutions']
          }]
        },
        fixed: {
          guidance: 'Water-Fixed (Merging): Deep emotional immersion, surrender, healing flow.',
          approaches: [{
            approach: 'paradox-holding' as const,
            effectivenessScore: 0.9,
            languagePatterns: [
              'Both can be true',
              'The complexity itself is the wisdom',
              'Surrender without losing yourself'
            ]
          }]
        },
        mutable: {
          guidance: 'Water-Mutable (Transcending): Emotional clarity, wisdom from depths, healing complete.',
          approaches: [{
            approach: 'witnessing' as const,
            effectivenessScore: 0.87,
            languagePatterns: [
              'What clarity emerged from the depths?',
              'This emotional wisdom is ready',
              'Your heart knows'
            ]
          }]
        }
      }
      // ... other elements would follow
    };

    const elementWisdom = bookWisdom[element];
    if (!elementWisdom) {
      return {
        guidance: 'Unknown element pattern.',
        approaches: []
      };
    }

    return elementWisdom[phase] || { guidance: 'Unknown phase.', approaches: [] };
  }

  /**
   * Check if archetype guidance exists
   */
  private hasArchetypeGuidance(pattern: AnonymizedPattern, archetype: string): boolean {
    // Simplified check - in production, this would query stored patterns
    return ['Healer', 'Creator', 'Seeker', 'Warrior', 'Sage'].includes(archetype);
  }

  /**
   * Anonymize and contribute user pattern (opt-in only)
   */
  async contributePattern(
    moment: SpiralMoment,
    responseEffectiveness: number,
    archetypeDetected?: string
  ): Promise<void> {
    if (!this.privacyConfig.contributionEnabled) {
      return; // User has not opted in
    }

    const patternKey = `${moment.element}-${moment.phase}-${moment.domain}`;
    let pattern = this.anonymizedPatterns.get(patternKey);

    if (!pattern) {
      // Create new pattern
      pattern = {
        id: this.generateAnonymousId(),
        element: moment.element,
        phase: moment.phase,
        domain: moment.domain,
        archetype: archetypeDetected,
        symbolCluster: moment.symbols || [],
        effectiveResponses: [],
        prevalence: 0.01, // Start low
        timestamp: this.fuzzTimestamp(moment.timestamp)
      };
    }

    // Update prevalence (simple increment for now)
    pattern.prevalence = Math.min(pattern.prevalence + 0.01, 1.0);

    this.anonymizedPatterns.set(patternKey, pattern);
  }

  /**
   * Generate anonymous ID (no user linkage)
   */
  private generateAnonymousId(): string {
    return `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Fuzz timestamp to month-level only
   */
  private fuzzTimestamp(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  /**
   * User privacy controls
   */
  setPrivacyConfig(config: Partial<typeof this.privacyConfig>): void {
    this.privacyConfig = { ...this.privacyConfig, ...config };
  }

  getPrivacyConfig(): typeof this.privacyConfig {
    return { ...this.privacyConfig };
  }
}
