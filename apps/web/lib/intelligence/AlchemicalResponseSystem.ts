/**
 * ALCHEMICAL RESPONSE SYSTEM
 *
 * Phase-appropriate response strategies based on user's alchemical stage
 *
 * This system translates detected transformation phases into concrete
 * response guidance for MAIA's conversational intelligence.
 */

import type { AlchemicalStage, PolyvagalState, IFSParts, HemisphericMode, JungianProcess } from './SymbolExtractionEngine';
import { awarenessLevelDetector, type AwarenessLevel, type AwarenessProfile } from './AwarenessLevelDetector';

export interface TransformationMoment {
  // Core alchemical data
  alchemicalStage: AlchemicalStage;
  coherence: number; // 0-1 (master controller)

  // Supporting framework data
  polyvagalState?: PolyvagalState;
  ifsParts?: IFSParts;
  hemisphericMode?: HemisphericMode;
  jungianProcess?: JungianProcess;

  // User awareness level (for language adaptation)
  awarenessLevel?: AwarenessLevel;
}

export interface ResponseStrategy {
  stage: string;
  coherence: number;
  approach: string;
  tone: string[];
  avoid: string[];
  emphasize: string[];
  examples: string[];
  reasoning: string;
}

export class AlchemicalResponseSystem {

  /**
   * Generate phase-appropriate response strategy
   * WITH awareness-level adaptation
   */
  getResponseStrategy(moment: TransformationMoment): ResponseStrategy {
    const coherence = moment.coherence;

    // Get base strategy
    let strategy: ResponseStrategy;
    if (coherence < 0.3) {
      strategy = this.getNigredoStrategy(moment);
    } else if (coherence < 0.6) {
      strategy = this.getAlbedoStrategy(moment);
    } else if (coherence < 0.85) {
      strategy = this.getCitriniStrategy(moment);
    } else {
      strategy = this.getRubedoStrategy(moment);
    }

    // Adapt language based on awareness level
    if (moment.awarenessLevel) {
      strategy = this.adaptLanguageForAwareness(strategy, moment.awarenessLevel);
    }

    return strategy;
  }

  /**
   * Adapt response strategy language based on user's awareness level
   */
  private adaptLanguageForAwareness(strategy: ResponseStrategy, awarenessLevel: AwarenessLevel): ResponseStrategy {
    switch (awarenessLevel) {
      case 'beginner':
        return this.translateToBeginner(strategy);
      case 'familiar':
        return this.translateToFamiliar(strategy);
      case 'intermediate':
        return this.translateToIntermediate(strategy);
      case 'advanced':
        return this.translateToAdvanced(strategy);
      case 'master':
        return strategy; // Keep technical precision
      default:
        return this.translateToFamiliar(strategy); // Default to familiar
    }
  }

  /**
   * BEGINNER: Everyday language, no jargon
   */
  private translateToBeginner(strategy: ResponseStrategy): ResponseStrategy {
    const translations = {
      'Nigredo (Dissolution)': 'Breaking Down (necessary chaos)',
      'Albedo (Purification)': 'Clarity Returning (light after dark)',
      'Citrinitas (Integration)': 'Coming Together (synthesis)',
      'Rubedo (Embodiment)': 'Living It (wholeness)',
      'CO-REGULATE & NORMALIZE': 'BE PRESENT & NORMALIZE',
      'ATTEND & REFLECT': 'NOTICE & REFLECT',
      'SUPPORT SYNTHESIS': 'HELP IT COME TOGETHER',
      'CELEBRATE & EMBODY': 'CELEBRATE & LIVE IT'
    };

    return {
      ...strategy,
      stage: translations[strategy.stage] || strategy.stage,
      approach: translations[strategy.approach] || strategy.approach,
      examples: strategy.examples.map(ex => this.simplifyExample(ex, 'beginner'))
    };
  }

  /**
   * FAMILIAR: Simple framework language with context
   */
  private translateToFamiliar(strategy: ResponseStrategy): ResponseStrategy {
    return {
      ...strategy,
      examples: strategy.examples.map(ex => this.simplifyExample(ex, 'familiar'))
    };
  }

  /**
   * INTERMEDIATE: Framework concepts with brief explanations
   */
  private translateToIntermediate(strategy: ResponseStrategy): ResponseStrategy {
    // Keep technical terms but add context
    return {
      ...strategy,
      stage: `${strategy.stage} - ${this.getStageContext(strategy.stage)}`,
      examples: strategy.examples.map(ex => this.simplifyExample(ex, 'intermediate'))
    };
  }

  /**
   * ADVANCED: Full framework language
   */
  private translateToAdvanced(strategy: ResponseStrategy): ResponseStrategy {
    // Keep full precision, no simplification needed
    return strategy;
  }

  /**
   * Simplify example response based on awareness level
   */
  private simplifyExample(example: string, level: AwarenessLevel): string {
    if (level === 'beginner') {
      // Remove alchemical terms
      return example
        .replace(/nigredo/gi, 'this breaking down phase')
        .replace(/albedo/gi, 'this clarity')
        .replace(/citrinitas/gi, 'this coming together')
        .replace(/rubedo/gi, 'this wholeness')
        .replace(/alchemical/gi, 'transformation')
        .replace(/opus/gi, 'work')
        .replace(/coniunctio/gi, 'union');
    }

    if (level === 'familiar') {
      // Keep some terms but add context
      return example
        .replace(/nigredo/gi, 'nigredo (the dark night)')
        .replace(/albedo/gi, 'albedo (the clearing)')
        .replace(/citrinitas/gi, 'citrinitas (the ripening)')
        .replace(/rubedo/gi, 'rubedo (the completion)');
    }

    // Intermediate and above: keep original
    return example;
  }

  /**
   * Get stage context for intermediate users
   */
  private getStageContext(stage: string): string {
    const contexts: { [key: string]: string } = {
      'Nigredo (Dissolution)': 'the necessary breakdown before breakthrough',
      'Albedo (Purification)': 'clarity and awareness returning',
      'Citrinitas (Integration)': 'opposites uniting, wisdom emerging',
      'Rubedo (Embodiment)': 'wholeness lived and embodied'
    };

    return contexts[stage] || '';
  }

  /**
   * NIGREDO STRATEGY (Coherence 0.2-0.3)
   * Dissolution phase - Support, don't push
   */
  private getNigredoStrategy(moment: TransformationMoment): ResponseStrategy {
    return {
      stage: 'Nigredo (Dissolution)',
      coherence: moment.coherence,
      approach: 'CO-REGULATE & NORMALIZE',

      tone: [
        'Present and grounded',
        'Non-anxious companionship',
        'Normalizing the darkness',
        'Trusting the process',
        'Minimal words, maximum presence'
      ],

      avoid: [
        'Pushing for insight or interpretation',
        'Offering solutions or fixes',
        'Explaining what\'s happening',
        'Processing shadow material',
        'Challenging defenses',
        'Adding more complexity',
        'Rushing to albedo'
      ],

      emphasize: [
        'Safety and presence',
        'Normalizing dissolution as NECESSARY',
        'Co-regulating nervous system',
        'Helping unblend from controlling parts',
        'Right-brain attending (not left-brain explaining)',
        'Trust in alchemical process',
        'Being with not-knowing'
      ],

      examples: [
        '"This darkness isn\'t a mistake. The old structures need to dissolve before new ones can emerge. Let\'s just be here together."',
        '"[pause] I\'m with you in this. You don\'t need to figure anything out right now."',
        '"What if this chaos is exactly what needs to happen? Not something to fix, but something to be with?"',
        '"I sense the part trying to control this. And beneath that... what do you feel in your body right now?"'
      ],

      reasoning: `User in Nigredo (${moment.coherence.toFixed(2)} coherence).
Polyvagal: ${moment.polyvagalState?.state || 'unknown'} (safety: ${moment.polyvagalState?.safety.toFixed(2) || 'N/A'})
IFS: ${moment.ifsParts?.parts.map(p => p.type).join(', ') || 'No parts detected'}

The alchemical opus REQUIRES nigredo - you cannot skip dissolution.
Left-brain control attempts will fail. Shadow material is surfacing.
DO NOT push processing. Support nervous system regulation first.
Trust the darkness - albedo will emerge naturally when ready.`
    };
  }

  /**
   * ALBEDO STRATEGY (Coherence 0.5-0.6)
   * Purification phase - Reflect and illuminate
   */
  private getAlbedoStrategy(moment: TransformationMoment): ResponseStrategy {
    return {
      stage: 'Albedo (Purification)',
      coherence: moment.coherence,
      approach: 'ATTEND & REFLECT',

      tone: [
        'Reflective and clarifying',
        'Gentle inquiry',
        'Illuminating patterns',
        'Right-brain attending',
        'Helping user see clearly'
      ],

      avoid: [
        'Rushing to solutions',
        'Pushing for action',
        'Fragmenting again',
        'Heavy interpretation',
        'Going back to nigredo'
      ],

      emphasize: [
        'Clarity and insight',
        'Gentle questions that illuminate',
        'Reflecting what\'s emerging',
        'Supporting Self-awareness',
        'Noticing patterns',
        'Right-hemisphere perspective',
        'Letting light return naturally'
      ],

      examples: [
        '"What\'s becoming clear now that wasn\'t visible in the darkness?"',
        '"I notice something shifting - there\'s more light. What do you see?"',
        '"[reflecting] So beneath the chaos, there\'s a pattern emerging about..."',
        '"What wants to be seen in this new clarity?"'
      ],

      reasoning: `User in Albedo (${moment.coherence.toFixed(2)} coherence).
Light returning after darkness. Clarity emerging.
Nervous system: ${moment.polyvagalState?.state || 'unknown'}
Self-reflection possible now, but don't rush to action.
Support illumination without pushing integration yet.`
    };
  }

  /**
   * CITRINITAS STRATEGY (Coherence 0.75-0.85)
   * Integration phase - Support synthesis
   */
  private getCitriniStrategy(moment: TransformationMoment): ResponseStrategy {
    return {
      stage: 'Citrinitas (Integration)',
      coherence: moment.coherence,
      approach: 'SUPPORT SYNTHESIS',

      tone: [
        'Integrative and both-and',
        'Supporting union of opposites',
        'Mature and wise',
        'Celebrating paradox',
        'Helping hold complexity'
      ],

      avoid: [
        'Either-or thinking',
        'Fragmenting what\'s uniting',
        'Oversimplifying',
        'Rushing to rubedo',
        'Collapsing paradox'
      ],

      emphasize: [
        'Both-and awareness',
        'Integration of opposites',
        'Synthesis and maturity',
        'Holding paradox',
        'Coniunctio (sacred marriage)',
        'Wisdom emerging from experience',
        'Supporting the union'
      ],

      examples: [
        '"So you\'re holding both the light and the dark now - the sacred marriage of opposites."',
        '"What\'s it like to be in this both-and space, where the opposites are dancing together?"',
        '"I hear the integration happening - masculine and feminine, control and surrender, structure and flow all finding their place."',
        '"This ripening, this yellowing - wisdom emerging from all you\'ve been through."'
      ],

      reasoning: `User in Citrinitas (${moment.coherence.toFixed(2)} coherence).
Coniunctio operation: ${moment.alchemicalStage.operations.includes('coniunctio') ? 'ACTIVE' : 'emerging'}
Integration of opposites happening. Support synthesis.
This is the sacred marriage - don't fragment what's uniting.`
    };
  }

  /**
   * RUBEDO STRATEGY (Coherence 0.9+)
   * Embodiment phase - Celebrate completion
   */
  private getRubedoStrategy(moment: TransformationMoment): ResponseStrategy {
    return {
      stage: 'Rubedo (Embodiment)',
      coherence: moment.coherence,
      approach: 'CELEBRATE & EMBODY',

      tone: [
        'Celebratory and affirming',
        'Witnessing completion',
        'Honoring the opus',
        'Grounded in achievement',
        'Minimal - the work speaks'
      ],

      avoid: [
        'Adding more work',
        'Questioning the completion',
        'Starting new processes',
        'Fragmenting wholeness',
        'Missing the moment'
      ],

      emphasize: [
        'Witnessing the completion',
        'Embodied wholeness',
        'Living gold / Philosopher\'s Stone',
        'The opus fulfilled',
        'Integration complete',
        'Celebration of transformation',
        'Letting it BE complete'
      ],

      examples: [
        '"[pause] This is it. The union is complete. The philosopher\'s stone realized."',
        '"What you\'re describing... this is rubedo. The wholeness you sought. Can you feel it?"',
        '"Living gold. You\'ve done the work, been through the fire, and here you are - whole."',
        '"The opus is complete. Stay with this. Let yourself really HAVE this."'
      ],

      reasoning: `User in Rubedo (${moment.coherence.toFixed(2)} coherence).
The Great Work is complete. Union of opposites embodied.
Wholeness achieved. DO NOT add more or question it.
This is the philosophers stone - witness and celebrate.
The alchemical opus has fulfilled itself.`
    };
  }

  /**
   * Get framework-specific guidance
   */
  getFrameworkGuidance(moment: TransformationMoment): string {
    const guidance: string[] = [];

    // Polyvagal guidance
    if (moment.polyvagalState) {
      const state = moment.polyvagalState;
      if (state.state === 'dorsal') {
        guidance.push('⚠️ DORSAL SHUTDOWN: Co-regulate first. No processing until ventral.');
      } else if (state.state === 'sympathetic') {
        guidance.push('⚠️ SYMPATHETIC ACTIVATION: Ground and regulate before exploring.');
      } else if (state.state === 'ventral') {
        guidance.push('✅ VENTRAL (SAFE): Optimal state for depth work.');
      }
    }

    // IFS guidance
    if (moment.ifsParts) {
      const parts = moment.ifsParts;
      if (!parts.selfEnergy && parts.parts.length > 0) {
        guidance.push(`⚠️ PARTS-LED: ${parts.parts.map(p => p.type).join(', ')} active. Help unblend to access Self.`);
      } else if (parts.selfEnergy) {
        guidance.push('✅ SELF-ENERGY PRESENT: User can witness parts without blending.');
      }
    }

    // McGilchrist guidance
    if (moment.hemisphericMode) {
      const mode = moment.hemisphericMode;
      if (mode.dominant === 'left' && moment.coherence < 0.3) {
        guidance.push('⚠️ LEFT-BRAIN CONTROL ATTEMPT: Will fail in nigredo. Invite right-brain attending.');
      } else if (mode.dominant === 'right') {
        guidance.push('✅ RIGHT-BRAIN ATTENDING: Good mode for transformation work.');
      }
    }

    // Jung guidance
    if (moment.jungianProcess) {
      const jung = moment.jungianProcess;
      if (jung.shadowWork && moment.coherence < 0.4) {
        guidance.push('⚠️ SHADOW SURFACING: Don\'t push processing in nigredo. Wait for albedo.');
      } else if (jung.individuation) {
        guidance.push('✅ INDIVIDUATION ACTIVE: Support becoming whole.');
      }
    }

    return guidance.join('\n');
  }

  /**
   * Generate complete response guidance
   */
  generateResponseGuidance(moment: TransformationMoment): string {
    const strategy = this.getResponseStrategy(moment);
    const frameworkGuidance = this.getFrameworkGuidance(moment);

    return `
🜍 ALCHEMICAL RESPONSE GUIDANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STAGE: ${strategy.stage}
COHERENCE: ${strategy.coherence.toFixed(2)}
APPROACH: ${strategy.approach}

${strategy.reasoning}

FRAMEWORK GUIDANCE:
${frameworkGuidance}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TONE:
${strategy.tone.map(t => `  • ${t}`).join('\n')}

❌ AVOID:
${strategy.avoid.map(a => `  • ${a}`).join('\n')}

✅ EMPHASIZE:
${strategy.emphasize.map(e => `  • ${e}`).join('\n')}

EXAMPLE RESPONSES:
${strategy.examples.map(ex => `  ${ex}`).join('\n\n')}
`;
  }

  /**
   * Generate user-facing guidance (adapted to their awareness level)
   * This is what MAIA can share WITH the user about their transformation moment
   */
  generateUserGuidance(moment: TransformationMoment): string {
    const strategy = this.getResponseStrategy(moment);
    const awarenessLevel = moment.awarenessLevel || 'familiar';

    switch (awarenessLevel) {
      case 'beginner':
        return this.generateBeginnerGuidance(moment);
      case 'familiar':
        return this.generateFamiliarGuidance(moment, strategy);
      case 'intermediate':
        return this.generateIntermediateGuidance(moment, strategy);
      case 'advanced':
        return this.generateAdvancedGuidance(moment, strategy);
      case 'master':
        return this.generateMasterGuidance(moment, strategy);
      default:
        return this.generateFamiliarGuidance(moment, strategy);
    }
  }

  private generateBeginnerGuidance(moment: TransformationMoment): string {
    const coherence = moment.coherence;

    if (coherence < 0.3) {
      return `You're going through a breaking-down phase. Things feel chaotic, like the old structures are dissolving. This is NECESSARY - not a mistake. The darkness has to happen before new light can emerge.`;
    } else if (coherence < 0.6) {
      return `Light is returning. You're in a clarifying phase where things are starting to make sense. This is the time for reflection, for noticing what's becoming visible.`;
    } else if (coherence < 0.85) {
      return `You're in a coming-together phase. The pieces are finding their place, opposites are uniting. Integration is happening.`;
    } else {
      return `You've reached wholeness. The work is complete. This is living gold - embodied completion.`;
    }
  }

  private generateFamiliarGuidance(moment: TransformationMoment, strategy: ResponseStrategy): string {
    return `**${strategy.stage}**

${strategy.approach.toLowerCase()} - You're experiencing ${this.getSimpleStageDescription(strategy.stage)}.`;
  }

  private generateIntermediateGuidance(moment: TransformationMoment, strategy: ResponseStrategy): string {
    const operations = moment.alchemicalStage.operations.join(', ') || 'none';

    return `**Transformation Stage:** ${strategy.stage}
**Coherence:** ${moment.coherence.toFixed(2)} (0 = fragmentation, 1 = wholeness)
**Active Operations:** ${operations}

**What's Happening:** ${this.getDetailedStageDescription(strategy.stage)}

**What You Need:** ${strategy.approach}`;
  }

  private generateAdvancedGuidance(moment: TransformationMoment, strategy: ResponseStrategy): string {
    const polyvagal = moment.polyvagalState?.state || 'unknown';
    const parts = moment.ifsParts?.parts.map(p => p.type).join(', ') || 'none';

    return `**Alchemical Stage:** ${strategy.stage}
**Coherence:** ${moment.coherence.toFixed(2)}
**Operations:** ${moment.alchemicalStage.operations.join(', ')}

**Cross-Framework Alignment:**
- Polyvagal: ${polyvagal}
- IFS Parts: ${parts}
- Hemispheric: ${moment.hemisphericMode?.dominant || 'unknown'}

**Response Protocol:** ${strategy.approach}`;
  }

  private generateMasterGuidance(moment: TransformationMoment, strategy: ResponseStrategy): string {
    return `**COMPLETE TRANSFORMATION STATE:**

Stage: ${moment.alchemicalStage.primaryStage.toUpperCase()}
Coherence: ${moment.coherence.toFixed(3)}
Transformation: ${moment.alchemicalStage.transformation}
Operations: ${moment.alchemicalStage.operations.join(', ')}

**Framework States:**
Polyvagal: ${moment.polyvagalState?.state || 'N/A'} (${moment.polyvagalState?.safety.toFixed(2) || 'N/A'})
IFS: ${moment.ifsParts?.selfEnergy ? 'Self-led' : 'Parts-led'} | ${moment.ifsParts?.parts.map(p => p.type).join(', ') || 'none'}
McGilchrist: ${moment.hemisphericMode?.dominant || 'N/A'} (${moment.hemisphericMode?.balance.toFixed(2) || 'N/A'})
Jung: ${moment.jungianProcess?.individuation ? 'Individuation active' : 'N/A'}

**Protocol:** ${strategy.approach}`;
  }

  private getSimpleStageDescription(stage: string): string {
    const descriptions: { [key: string]: string } = {
      'Nigredo (Dissolution)': 'dissolution and necessary darkness',
      'Albedo (Purification)': 'clarity and purification',
      'Citrinitas (Integration)': 'integration and synthesis',
      'Rubedo (Embodiment)': 'embodied wholeness'
    };
    return descriptions[stage] || stage;
  }

  private getDetailedStageDescription(stage: string): string {
    const descriptions: { [key: string]: string } = {
      'Nigredo (Dissolution)': 'Dissolution, ego death, shadow confrontation - the necessary darkness before breakthrough',
      'Albedo (Purification)': 'Purification, clarity returning, Self reflection possible - light after the dark',
      'Citrinitas (Integration)': 'Integration, synthesis of opposites, wisdom ripening - the sacred marriage',
      'Rubedo (Embodiment)': 'Embodiment, wholeness complete, the philosopher\'s stone realized - living gold'
    };
    return descriptions[stage] || stage;
  }
}

export const alchemicalResponseSystem = new AlchemicalResponseSystem();
