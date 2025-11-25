/**
 * 🌀 SPIRALOGIC INTELLIGENCE LAYER
 *
 * This integrates all Spiralogic intelligence systems to enrich MAIA's responses.
 * IMPORTANT: This is BACKEND INTELLIGENCE - not exposed to users directly.
 *
 * Purpose: Give MAIA sophisticated understanding so she can respond with:
 * - Responsive presence (like the "It does" pivot moment)
 * - Archetypal accuracy (detecting Healer-in-Shadow paradox)
 * - Phase-appropriate guidance (Water-Cardinal = felt-sense invitation)
 * - Cross-spiral pattern recognition (career ignition mirrors relationship sensing)
 * - Collective wisdom (implicit suggestions from anonymized patterns)
 *
 * The user NEVER sees: "You are in Fire-Cardinal phase"
 * The user EXPERIENCES: MAIA understanding them at archetypal depth
 */

import { TriadicPhaseDetector, TriadicDetection } from './TriadicPhaseDetector';
import { CrossSpiralPatternRecognizer, SpiralMoment, CrossSpiralPattern, LifeDomain } from './CrossSpiralPatternRecognizer';
import { CollectiveWisdomLayer, CollectiveInsight } from './CollectiveWisdomLayer';
import { AINSpiralogicBridge, EfferentWisdom } from '../ain/AINSpiralogicBridge';

export interface SpiralogicContext {
  // What MAIA knows (internal guidance)
  internalGuidance: string;

  // Triadic phase detection
  triadicPhase?: TriadicDetection;

  // Cross-spiral patterns
  crossPatterns?: CrossSpiralPattern[];

  // Collective wisdom
  collectiveInsight?: CollectiveInsight;

  // AIN collective field wisdom (efferent flow)
  ainWisdom?: EfferentWisdom;

  // User readiness level (progressive revelation)
  readinessLevel: 'companion' | 'pattern-noter' | 'symbolic-guide' | 'wisdom-keeper';

  // Detected archetype (if any)
  archetype?: string;
}

export class SpiralogicIntelligenceLayer {
  private triadicDetector: TriadicPhaseDetector;
  private crossSpiralRecognizer: CrossSpiralPatternRecognizer;
  private collectiveWisdom: CollectiveWisdomLayer;
  private ainBridge: AINSpiralogicBridge;

  constructor() {
    this.triadicDetector = new TriadicPhaseDetector();
    this.crossSpiralRecognizer = new CrossSpiralPatternRecognizer();
    this.collectiveWisdom = new CollectiveWisdomLayer();
    this.ainBridge = new AINSpiralogicBridge();
  }

  /**
   * Analyze conversation and build Spiralogic context for MAIA
   */
  async analyzeConversation(
    userMessage: string,
    metadata: {
      userId?: string;
      sessionId?: string;
      dominantElement: 'fire' | 'water' | 'earth' | 'air' | 'aether';
      symbols?: string[];
      archetypes?: Array<{ name: string; strength: number }>;
      daysActive?: number;
      conversationHistory?: any[];
      isBreakthrough?: boolean;
      breakthroughType?: string;
      consciousnessLevel?: number;
    }
  ): Promise<SpiralogicContext> {
    // Determine user readiness level based on days active
    const readinessLevel = this.determineReadinessLevel(metadata.daysActive || 0);

    // Detect triadic phase
    const triadicPhase = this.triadicDetector.detectPhase(
      userMessage,
      metadata.dominantElement,
      metadata.conversationHistory
    );

    // Get dominant archetype if detected
    const archetype = metadata.archetypes?.[0]?.name;

    // Record this moment for cross-spiral analysis
    const moment = this.crossSpiralRecognizer.recordMoment(
      userMessage,
      triadicPhase,
      {
        symbols: metadata.symbols,
        breakthrough: metadata.isBreakthrough || metadata.archetypes?.some(a => a.name === 'Hero' && a.strength > 0.7)
      }
    );

    // Find cross-spiral patterns
    const crossPatterns = this.crossSpiralRecognizer.findPatterns(moment);

    // Get collective wisdom insights
    const collectiveInsight = await this.collectiveWisdom.getInsights(
      metadata.dominantElement,
      triadicPhase.phase,
      moment.domain,
      archetype,
      readinessLevel
    );

    // 🕸️ AFFERENT FLOW - Send pattern to AIN collective field (if userId provided)
    if (metadata.userId && metadata.sessionId) {
      await this.ainBridge.sendToField(moment, triadicPhase, {
        userId: metadata.userId,
        sessionId: metadata.sessionId,
        archetype,
        isBreakthrough: metadata.isBreakthrough,
        breakthroughType: metadata.breakthroughType,
        consciousnessLevel: metadata.consciousnessLevel
      });
    }

    // 🌐 EFFERENT FLOW - Receive collective field wisdom (if userId provided)
    let ainWisdom: EfferentWisdom | undefined;
    if (metadata.userId) {
      ainWisdom = await this.ainBridge.receiveFromField(metadata.userId, {
        element: triadicPhase.element,
        phase: triadicPhase.phase,
        state: triadicPhase.state,
        archetype
      });
    }

    // Build internal guidance string for MAIA
    const internalGuidance = this.buildInternalGuidance({
      triadicPhase,
      crossPatterns,
      collectiveInsight,
      ainWisdom,
      archetype,
      readinessLevel
    });

    return {
      internalGuidance,
      triadicPhase,
      crossPatterns,
      collectiveInsight,
      ainWisdom,
      readinessLevel,
      archetype
    };
  }

  /**
   * Determine user readiness level for progressive revelation
   */
  private determineReadinessLevel(daysActive: number): 'companion' | 'pattern-noter' | 'symbolic-guide' | 'wisdom-keeper' {
    if (daysActive < 3) return 'companion';
    if (daysActive < 7) return 'pattern-noter';
    if (daysActive < 30) return 'symbolic-guide';
    return 'wisdom-keeper';
  }

  /**
   * Build internal guidance string that gets added to MAIA's system prompt
   */
  private buildInternalGuidance(context: {
    triadicPhase: TriadicDetection;
    crossPatterns: CrossSpiralPattern[];
    collectiveInsight: CollectiveInsight;
    ainWisdom?: EfferentWisdom;
    archetype?: string;
    readinessLevel: string;
  }): string {
    const parts: string[] = [
      '\n## 🌀 SPIRALOGIC INTELLIGENCE (Internal Guidance - Not for Direct Display)',
      ''
    ];

    // Triadic phase awareness
    parts.push(
      `**Current Phase**: ${context.triadicPhase.element}-${context.triadicPhase.phase} (${context.triadicPhase.state})`,
      `**Confidence**: ${Math.round(context.triadicPhase.confidence * 100)}%`,
      `**Guidance**: ${context.triadicPhase.guidance}`,
      ''
    );

    // Archetype awareness
    if (context.archetype) {
      parts.push(
        `**Archetype Detected**: ${context.archetype}`,
        `**Note**: Apply archetype-specific wisdom from Collective Layer`,
        ''
      );
    }

    // Cross-spiral patterns
    if (context.crossPatterns.length > 0) {
      parts.push('**Cross-Spiral Patterns Detected**:');
      for (const pattern of context.crossPatterns.slice(0, 2)) {
        parts.push(`- ${pattern.patternType}: ${pattern.insight}`);
      }
      parts.push('');
    }

    // Collective wisdom (internal guidance)
    parts.push(
      `**Collective Wisdom**: ${context.collectiveInsight.internalGuidance}`,
      ''
    );

    // 🕸️ AIN COLLECTIVE FIELD WISDOM (Efferent flow)
    if (context.ainWisdom) {
      parts.push(
        '**🌐 AIN Collective Field Intelligence**:',
        `- Field Phase: ${context.ainWisdom.collectiveContext.fieldPhase}`,
        `- Field Coherence: ${Math.round(context.ainWisdom.collectiveContext.collectiveCoherence * 100)}%`,
        `- Dominant Element in Field: ${context.ainWisdom.collectiveContext.dominantElement}`,
        ''
      );

      if (context.ainWisdom.fieldGuidance) {
        parts.push(
          `**Field Timing**: ${context.ainWisdom.fieldGuidance.timingWisdom}`,
          `**Collective Support**: ${context.ainWisdom.fieldGuidance.collectiveSupport}`,
          ''
        );
      }

      if (context.ainWisdom.activePatterns.length > 0) {
        parts.push('**Active Patterns in Field**:');
        for (const pattern of context.ainWisdom.activePatterns.slice(0, 2)) {
          parts.push(`- ${pattern.pattern} (${Math.round(pattern.prevalence * 100)}% experiencing this)`);
        }
        parts.push('');
      }
    }

    // Readiness level reminders
    parts.push(this.getReadinessReminder(context.readinessLevel));

    // Response approach guidance
    if (context.collectiveInsight.effectiveApproaches.length > 0) {
      const topApproach = context.collectiveInsight.effectiveApproaches[0];
      parts.push(
        '',
        `**Recommended Approach**: ${topApproach.approach}`,
        `**Example Language**: ${topApproach.languagePatterns.slice(0, 2).join(' OR ')}`
      );

      if (topApproach.avoidPatterns && topApproach.avoidPatterns.length > 0) {
        parts.push(`**Avoid**: ${topApproach.avoidPatterns.join(', ')}`);
      }
    }

    parts.push(
      '',
      '**Remember**: This intelligence is to inform your UNDERSTANDING, not to be explicitly taught to the user.',
      'Respond with responsive presence, not technical explanation.',
      ''
    );

    return parts.join('\n');
  }

  /**
   * Get readiness-level specific reminders
   */
  private getReadinessReminder(level: string): string {
    const reminders = {
      companion: '**User Readiness**: COMPANION STAGE - Keep language warm and simple. No elemental/archetypal terms. Build trust through presence.',
      'pattern-noter': '**User Readiness**: PATTERN NOTER - Can mention element names naturally ("Fire energy," "Water flowing"). Still avoid phase terminology.',
      'symbolic-guide': '**User Readiness**: SYMBOLIC GUIDE - Can use archetypal language. User demonstrates readiness for deeper symbolic work.',
      'wisdom-keeper': '**User Readiness**: WISDOM KEEPER - Full symbolic language available. User shows deep integration and sophisticated tracking.'
    };
    return reminders[level] || reminders.companion;
  }

  /**
   * Generate enhanced system prompt with Spiralogic intelligence
   */
  generateEnhancedPrompt(
    basePrompt: string,
    spiralogicContext: SpiralogicContext
  ): string {
    return `${basePrompt}\n\n${spiralogicContext.internalGuidance}`;
  }

  /**
   * Load user's spiral history (for returning users)
   */
  loadSpiralHistory(moments: SpiralMoment[]): void {
    this.crossSpiralRecognizer.loadHistory(moments);
  }

  /**
   * Get spiral history for storage/export
   */
  getSpiralHistory(): SpiralMoment[] {
    return this.crossSpiralRecognizer.getHistory();
  }

  /**
   * Update collective wisdom with response effectiveness
   * (Only if user has opted in to contribute)
   */
  async contributeToCollective(
    moment: SpiralMoment,
    responseEffectiveness: number,
    archetypeDetected?: string
  ): Promise<void> {
    await this.collectiveWisdom.contributePattern(
      moment,
      responseEffectiveness,
      archetypeDetected
    );
  }

  /**
   * Configure privacy settings for collective wisdom
   */
  setPrivacyConfig(config: {
    contributionEnabled?: boolean;
    anonymizationLevel?: 'high' | 'medium' | 'low';
    localOnly?: boolean;
  }): void {
    this.collectiveWisdom.setPrivacyConfig(config);
  }
}

/**
 * Example Usage in Oracle API:
 *
 * const spiralogic = new SpiralogicIntelligenceLayer();
 *
 * // Analyze user message
 * const context = await spiralogic.analyzeConversation(userMessage, {
 *   dominantElement: 'water',
 *   archetypes: [{ name: 'Healer', strength: 0.8 }],
 *   daysActive: 5
 * });
 *
 * // Enhance MAIA's system prompt with Spiralogic intelligence
 * const enhancedPrompt = spiralogic.generateEnhancedPrompt(
 *   MAIA_SYSTEM_PROMPT,
 *   context
 * );
 *
 * // MAIA now knows:
 * // - User is in Water-Cardinal (Sensing phase)
 * // - Healer archetype detected
 * // - Most effective approach: "normalizing" + "felt-sense invitation"
 * // - Avoid: analyzing, prescriptive solutions
 * // - User is at "pattern-noter" readiness (can use element names)
 *
 * // But user just sees: Warm, present, accurate MAIA response
 */
