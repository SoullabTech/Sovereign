/**
 * ELEMENTAL BALANCE ENGINE
 *
 * Maps psychological/somatic states to elemental qualities (Fire/Water/Air/Earth/Aether)
 * and prescribes balancing interventions based on elemental imbalances
 *
 * TRADITIONAL WISDOM MEETS MODERN FRAMEWORKS:
 * - Fire: Heat, activation, inflammation, anger, will, transformation (Sympathetic, Fight)
 * - Water: Flow, emotion, grief, tears, receptivity, dissolution (Sadness, Melting)
 * - Air: Movement, thoughts, anxiety, scattered, breath, ideas (Flight, Rumination)
 * - Earth: Grounding, structure, stability, embodiment, manifestation (Freeze, Stuckness)
 * - Aether/Spirit: Connection, transcendence, witness, dissociation (Dorsal, Out-of-body)
 *
 * BALANCING PRINCIPLE:
 * - Excess Fire → Apply Water (cooling, soothing)
 * - Excess Water → Apply Fire (warming, activating) or Earth (container)
 * - Excess Air → Apply Earth (grounding) or Water (flow into body)
 * - Excess/Stuck Earth → Apply Air (movement) or Fire (activation)
 * - Excess Aether → Apply Earth (embodiment, return to ground)
 *
 * CLINICAL VALUE:
 * - Match intervention type to elemental state
 * - Different modalities work better for different elements
 * - Traditional healing wisdom + modern precision
 */

import type { ExtractionResult } from './SymbolExtractionEngine';
import type { TransformationSignature } from './CrossFrameworkSynergyEngine';

// ============================================================================
// INTERFACES
// ============================================================================

export type ElementType = 'fire' | 'water' | 'air' | 'earth' | 'aether';
export type ElementBalance = 'excess' | 'deficient' | 'balanced';

export interface ElementalState {
  element: ElementType;
  balance: ElementBalance;
  intensity: number; // 0-1, how strong the imbalance
  confidence: number; // 0-1, how confident we are
  indicators: string[];
  description: string;
}

export interface ElementalProfile {
  detected: boolean;
  primary: ElementalState;
  secondary?: ElementalState;

  // All elements rated
  fire: { level: number; balance: ElementBalance };
  water: { level: number; balance: ElementBalance };
  air: { level: number; balance: ElementBalance };
  earth: { level: number; balance: ElementBalance };
  aether: { level: number; balance: ElementBalance };

  // Clinical interpretation
  interpretation: string;
  balancingElement: ElementType; // Which element to apply
  balancingPrinciple: string; // Why this element balances
}

export interface ElementalIntervention {
  element: ElementType; // Which element we\'re applying
  category: string; // Type of intervention
  practices: string[];
  frameworks: string[]; // Which therapeutic frameworks align
  rationale: string;
  timeframe: 'immediate' | 'short-term' | 'ongoing';
}

export interface ElementalPrescription {
  profile: ElementalProfile;
  interventions: ElementalIntervention[];
  priorityOrder: string[]; // Order to apply interventions
  cautionNotes: string[];
  expectedOutcome: string;
}

// ============================================================================
// ELEMENTAL BALANCE ENGINE
// ============================================================================

class ElementalBalanceEngineClass {
  /**
   * Analyze extraction and determine elemental profile
   */
  analyzeElementalBalance(
    extraction: ExtractionResult,
    signature?: TransformationSignature
  ): ElementalPrescription {
    // Calculate levels for each element
    const fireLevel = this.calculateFireLevel(extraction);
    const waterLevel = this.calculateWaterLevel(extraction);
    const airLevel = this.calculateAirLevel(extraction);
    const earthLevel = this.calculateEarthLevel(extraction);
    const aetherLevel = this.calculateAetherLevel(extraction);

    // Determine balance state for each
    const fire = { level: fireLevel, balance: this.determineBalance(fireLevel) };
    const water = { level: waterLevel, balance: this.determineBalance(waterLevel) };
    const air = { level: airLevel, balance: this.determineBalance(airLevel) };
    const earth = { level: earthLevel, balance: this.determineBalance(earthLevel) };
    const aether = { level: aetherLevel, balance: this.determineBalance(aetherLevel) };

    // Find primary and secondary imbalances
    const elements = [
      { type: 'fire' as ElementType, ...fire },
      { type: 'water' as ElementType, ...water },
      { type: 'air' as ElementType, ...air },
      { type: 'earth' as ElementType, ...earth },
      { type: 'aether' as ElementType, ...aether }
    ];

    // Sort by how far from balanced (0.5)
    const imbalanced = elements
      .map(e => ({ ...e, imbalance: Math.abs(e.level - 0.5) }))
      .sort((a, b) => b.imbalance - a.imbalance);

    const primaryElement = imbalanced[0];
    const secondaryElement = imbalanced[1].imbalance > 0.2 ? imbalanced[1] : undefined;

    // Create primary state
    const primary: ElementalState = {
      element: primaryElement.type,
      balance: primaryElement.balance,
      intensity: primaryElement.imbalance * 2, // Scale to 0-1
      confidence: 0.85,
      indicators: this.getIndicators(primaryElement.type, extraction),
      description: this.describeElementalState(primaryElement.type, primaryElement.balance, primaryElement.level)
    };

    // Create secondary state if significant
    const secondary: ElementalState | undefined = secondaryElement ? {
      element: secondaryElement.type,
      balance: secondaryElement.balance,
      intensity: secondaryElement.imbalance * 2,
      confidence: 0.7,
      indicators: this.getIndicators(secondaryElement.type, extraction),
      description: this.describeElementalState(secondaryElement.type, secondaryElement.balance, secondaryElement.level)
    } : undefined;

    // Determine balancing approach
    const balancingElement = this.determineBalancingElement(primary.element, primary.balance);

    // Build profile
    const profile: ElementalProfile = {
      detected: true,
      primary,
      secondary,
      fire,
      water,
      air,
      earth,
      aether,
      interpretation: this.generateInterpretation(primary, secondary),
      balancingElement,
      balancingPrinciple: this.explainBalancingPrinciple(primary.element, primary.balance, balancingElement)
    };

    // Generate interventions
    const interventions = this.generateInterventions(profile, extraction, signature);

    // Priority order
    const priorityOrder = this.determinePriorityOrder(profile, signature);

    // Caution notes
    const cautionNotes = this.generateCautionNotes(profile);

    // Expected outcome
    const expectedOutcome = this.describeExpectedOutcome(profile);

    return {
      profile,
      interventions,
      priorityOrder,
      cautionNotes,
      expectedOutcome
    };
  }

  // ==========================================================================
  // ELEMENT LEVEL CALCULATIONS
  // ==========================================================================

  /**
   * Calculate Fire level (0-1)
   * Fire = Heat, activation, anger, inflammation, fight, sympathetic
   */
  private calculateFireLevel(extraction: ExtractionResult): number {
    let level = 0.3; // Baseline

    // Somatic: Fight response
    if (extraction.somaticState?.incompleteResponse.type === 'fight') {
      level += 0.4;
    }

    // Polyvagal: Sympathetic
    if (extraction.polyvagalState?.state === 'sympathetic') {
      level += 0.3;
    }

    // IFS: Firefighters (reactive, impulsive)
    if (extraction.ifsParts?.parts.some(p => p.type === 'firefighter')) {
      level += 0.2;
    }

    // Anger indicators
    if (extraction.ifsParts?.parts.some(p => p.indicator.includes('anger'))) {
      level += 0.2;
    }

    // McGilchrist: Left hemisphere dominance (analytical fire)
    if (extraction.hemisphereBias?.bias === 'left' && extraction.hemisphereBias.confidence > 0.7) {
      level += 0.15;
    }

    return Math.min(level, 1.0);
  }

  /**
   * Calculate Water level (0-1)
   * Water = Emotion, flow, grief, tears, receptivity, sadness
   */
  private calculateWaterLevel(extraction: ExtractionResult): number {
    let level = 0.3; // Baseline

    // IFS: Exiles (wounded, emotional)
    if (extraction.ifsParts?.parts.some(p => p.type === 'exile')) {
      level += 0.3;
    }

    // Grief/sadness indicators
    if (extraction.ifsParts?.parts.some(p => p.indicator.includes('grief') || p.indicator.includes('sad'))) {
      level += 0.25;
    }

    // Constellation: Grief for excluded members
    if (extraction.constellationState?.excludedMembers.detected) {
      level += 0.2;
    }

    // Polyvagal: Ventral vagal (safe connection, emotional flow)
    if (extraction.polyvagalState?.state === 'ventral' && extraction.polyvagalState.safety > 0.7) {
      level += 0.15;
    }

    // McGilchrist: Right hemisphere (feeling, receptivity)
    if (extraction.hemisphereBias?.bias === 'right' && extraction.hemisphereBias.confidence > 0.7) {
      level += 0.2;
    }

    return Math.min(level, 1.0);
  }

  /**
   * Calculate Air level (0-1)
   * Air = Thoughts, anxiety, movement, scattered, breath, rumination
   */
  private calculateAirLevel(extraction: ExtractionResult): number {
    let level = 0.3; // Baseline

    // Somatic: Flight response
    if (extraction.somaticState?.incompleteResponse.type === 'flight') {
      level += 0.35;
    }

    // IFS: Managers (thinking, planning, controlling)
    if (extraction.ifsParts?.parts.some(p => p.type === 'manager')) {
      level += 0.25;
    }

    // Anxiety indicators
    if (extraction.ifsParts?.parts.some(p => p.indicator.includes('anxious') || p.indicator.includes('worry'))) {
      level += 0.2;
    }

    // CBT: Rumination, cognitive distortions
    if (extraction.cbtState?.cognitiveDistortions) {
      const distortionCount = Object.values(extraction.cbtState.cognitiveDistortions).filter(Boolean).length;
      level += Math.min(distortionCount * 0.1, 0.3);
    }

    // ACT: Cognitive fusion (stuck in thoughts)
    if (extraction.actState?.cognitiveFusion.detected) {
      level += 0.2;
    }

    return Math.min(level, 1.0);
  }

  /**
   * Calculate Earth level (0-1)
   * Earth = Grounding, structure, freeze, stuck, heavy, embodiment
   */
  private calculateEarthLevel(extraction: ExtractionResult): number {
    let level = 0.3; // Baseline

    // Somatic: Freeze response
    if (extraction.somaticState?.incompleteResponse.type === 'freeze') {
      level += 0.4;
    }

    // Polyvagal: Dorsal (but not dissociated - that\'s aether)
    if (extraction.polyvagalState?.state === 'dorsal' && extraction.polyvagalState.safety < 0.3) {
      // Check if it\'s grounded freeze vs dissociative freeze
      const hasDissociation = extraction.somaticState?.incompleteResponse.indicators?.some(
        ind => ind.includes('dissociat') || ind.includes('spaced out')
      );
      if (!hasDissociation) {
        level += 0.35;
      }
    }

    // Gestalt: Retroflection (energy turned inward, stuck)
    if (extraction.gestaltState?.contactDisturbances.retroflection.detected) {
      level += 0.25;
    }

    // Constellation: Systemic burden (carrying weight)
    if (extraction.constellationState?.systemicEntanglement.detected) {
      level += 0.2;
    }

    // Low coherence but not dissociated = stuck in darkness
    if (extraction.alchemicalStage) {
      const coherence = extraction.alchemicalStage.coherence;
      if (coherence < 0.3) {
        level += 0.15;
      }
    }

    return Math.min(level, 1.0);
  }

  /**
   * Calculate Aether level (0-1)
   * Aether = Spirit, transcendence, dissociation, witness, out-of-body
   */
  private calculateAetherLevel(extraction: ExtractionResult): number {
    let level = 0.3; // Baseline

    // Somatic: Dissociation
    const hasDissociation = extraction.somaticState?.incompleteResponse.indicators?.some(
      ind => ind.includes('dissociat') || ind.includes('spaced out') || ind.includes('foggy')
    );
    if (hasDissociation) {
      level += 0.4;
    }

    // Polyvagal: Dorsal shutdown with dissociation
    if (extraction.polyvagalState?.state === 'dorsal' && hasDissociation) {
      level += 0.3;
    }

    // Gestalt: Confluence (merged, no boundaries) or extreme deflection
    if (extraction.gestaltState?.contactDisturbances.confluence.detected) {
      level += 0.2;
    }

    // High spiritual language but low embodiment
    if (extraction.alchemicalStage?.coherence && extraction.alchemicalStage.coherence > 0.7) {
      // High coherence + no somatic grounding = spiritual bypass
      if (!extraction.somaticState?.detected) {
        level += 0.15;
      }
    }

    return Math.min(level, 1.0);
  }

  // ==========================================================================
  // BALANCE DETERMINATION
  // ==========================================================================

  /**
   * Determine if element is excessive, deficient, or balanced
   */
  private determineBalance(level: number): ElementBalance {
    if (level > 0.6) return 'excess';
    if (level < 0.4) return 'deficient';
    return 'balanced';
  }

  /**
   * Determine which element to apply to balance
   */
  private determineBalancingElement(element: ElementType, balance: ElementBalance): ElementType {
    if (balance === 'balanced') return element; // No change needed

    // Balancing principles (Traditional Chinese Medicine + Ayurveda)
    const balancingMap: Record<string, ElementType> = {
      'fire-excess': 'water',
      'fire-deficient': 'fire',
      'water-excess': 'earth', // Earth contains water
      'water-deficient': 'water',
      'air-excess': 'earth', // Earth grounds air
      'air-deficient': 'air',
      'earth-excess': 'air', // Air moves earth
      'earth-deficient': 'earth',
      'aether-excess': 'earth', // Earth brings back to body
      'aether-deficient': 'aether'
    };

    const key = `${element}-${balance}`;
    return balancingMap[key] || element;
  }

  // ==========================================================================
  // DESCRIPTION & INTERPRETATION
  // ==========================================================================

  /**
   * Describe elemental state in clinical language
   */
  private describeElementalState(element: ElementType, balance: ElementBalance, level: number): string {
    const intensity = level > 0.8 ? 'severe' : level > 0.6 ? 'moderate' : 'mild';

    const descriptions: Record<string, Record<ElementBalance, string>> = {
      fire: {
        excess: `${intensity} excess fire - high activation, inflammation, anger, or fight response. System running hot.`,
        deficient: `${intensity} deficient fire - low energy, lack of will, unable to activate. Inner flame dimmed.`,
        balanced: 'Fire element balanced - healthy activation and will without inflammation.'
      },
      water: {
        excess: `${intensity} excess water - overwhelming emotion, flooding, drowning in grief or sadness.`,
        deficient: `${intensity} deficient water - emotional dryness, disconnection from feeling, rigid.`,
        balanced: 'Water element balanced - healthy emotional flow and receptivity.'
      },
      air: {
        excess: `${intensity} excess air - racing thoughts, anxiety, scattered, ungrounded, rumination.`,
        deficient: `${intensity} deficient air - mental fog, unable to think clearly, heavy.`,
        balanced: 'Air element balanced - clear thinking without rumination.'
      },
      earth: {
        excess: `${intensity} excess earth - frozen, stuck, heavy, rigid, unable to move. Grounded to paralysis.`,
        deficient: `${intensity} deficient earth - ungrounded, no structure, floating, unstable.`,
        balanced: 'Earth element balanced - grounded and stable with healthy movement.'
      },
      aether: {
        excess: `${intensity} excess aether - dissociated, out of body, spiritual bypass, no grounding.`,
        deficient: `${intensity} deficient aether - no witness perspective, trapped in experience, no transcendence.`,
        balanced: 'Aether element balanced - embodied witness, grounded connection to spirit.'
      }
    };

    return descriptions[element][balance];
  }

  /**
   * Generate overall interpretation
   */
  private generateInterpretation(primary: ElementalState, secondary?: ElementalState): string {
    let interpretation = `Primary imbalance: ${primary.description}`;

    if (secondary) {
      interpretation += ` Secondary: ${secondary.description}`;
    }

    return interpretation;
  }

  /**
   * Explain why this balancing element works
   */
  private explainBalancingPrinciple(
    element: ElementType,
    balance: ElementBalance,
    balancingElement: ElementType
  ): string {
    const principles: Record<string, string> = {
      'fire-water': 'Water cools and soothes excess fire. Calming practices reduce inflammation and activation.',
      'water-earth': 'Earth provides container for excess water. Grounding prevents emotional flooding.',
      'water-fire': 'Fire warms and activates deficient water. Brings energy to frozen emotion.',
      'air-earth': 'Earth grounds excess air. Body-based practices anchor racing thoughts.',
      'earth-air': 'Air creates movement in stuck earth. Breath and motion thaw freeze.',
      'earth-fire': 'Fire melts frozen earth. Activation and warmth restore flow.',
      'aether-earth': 'Earth brings aether back to body. Grounding practices restore embodiment.'
    };

    const key = balance === 'excess' ? `${element}-${balancingElement}` : `${element}-${element}`;
    return principles[key] || `${balancingElement} balances ${element}`;
  }

  // ==========================================================================
  // INDICATOR EXTRACTION
  // ==========================================================================

  /**
   * Get specific indicators for element from extraction
   */
  private getIndicators(element: ElementType, extraction: ExtractionResult): string[] {
    const indicators: string[] = [];

    switch (element) {
      case 'fire':
        if (extraction.somaticState?.incompleteResponse.type === 'fight') indicators.push('fight response');
        if (extraction.polyvagalState?.state === 'sympathetic') indicators.push('sympathetic activation');
        if (extraction.ifsParts?.parts.some(p => p.type === 'firefighter')) indicators.push('firefighter parts active');
        break;

      case 'water':
        if (extraction.ifsParts?.parts.some(p => p.type === 'exile')) indicators.push('exile parts present');
        if (extraction.constellationState?.excludedMembers.detected) indicators.push('grief for excluded members');
        break;

      case 'air':
        if (extraction.somaticState?.incompleteResponse.type === 'flight') indicators.push('flight response');
        if (extraction.ifsParts?.parts.some(p => p.type === 'manager')) indicators.push('manager parts activated');
        if (extraction.actState?.cognitiveFusion.detected) indicators.push('cognitive fusion');
        break;

      case 'earth':
        if (extraction.somaticState?.incompleteResponse.type === 'freeze') indicators.push('freeze response');
        if (extraction.polyvagalState?.state === 'dorsal') indicators.push('dorsal shutdown');
        if (extraction.constellationState?.systemicEntanglement.detected) indicators.push('systemic burden');
        break;

      case 'aether':
        if (extraction.somaticState?.incompleteResponse.indicators?.some(i => i.includes('dissociat'))) {
          indicators.push('dissociation');
        }
        if (extraction.gestaltState?.contactDisturbances.confluence.detected) indicators.push('confluence');
        break;
    }

    return indicators;
  }

  // ==========================================================================
  // INTERVENTION GENERATION
  // ==========================================================================

  /**
   * Generate balancing interventions
   */
  private generateInterventions(
    profile: ElementalProfile,
    extraction: ExtractionResult,
    signature?: TransformationSignature
  ): ElementalIntervention[] {
    const interventions: ElementalIntervention[] = [];

    // Generate primary intervention
    const primary = this.generateElementalIntervention(
      profile.balancingElement,
      profile.primary,
      extraction,
      'immediate'
    );
    interventions.push(primary);

    // Generate secondary intervention if needed
    if (profile.secondary) {
      const secondaryBalancing = this.determineBalancingElement(
        profile.secondary.element,
        profile.secondary.balance
      );
      const secondary = this.generateElementalIntervention(
        secondaryBalancing,
        profile.secondary,
        extraction,
        'short-term'
      );
      interventions.push(secondary);
    }

    // Generate long-term integration
    const integration = this.generateIntegrationIntervention(profile);
    interventions.push(integration);

    return interventions;
  }

  /**
   * Generate intervention for specific element
   */
  private generateElementalIntervention(
    element: ElementType,
    targetState: ElementalState,
    extraction: ExtractionResult,
    timeframe: 'immediate' | 'short-term' | 'ongoing'
  ): ElementalIntervention {
    const interventionMap: Record<ElementType, ElementalIntervention> = {
      fire: {
        element: 'fire',
        category: 'Activation & Will',
        practices: [
          'Somatic: Mobilization practices (punch, kick, push)',
          'Polyvagal: Increase ventral tone through vocal activation',
          'IFS: Work with firefighters to channel energy constructively',
          'Gestalt: Complete the action (finish incomplete gestures)',
          'Body: Dynamic movement, martial arts forms'
        ],
        frameworks: ['Levine', 'Polyvagal', 'IFS', 'Gestalt'],
        rationale: 'Bring healthy fire - activation without inflammation',
        timeframe
      },
      water: {
        element: 'water',
        category: 'Emotional Flow & Soothing',
        practices: [
          'Somatic: Gentle rocking, swaying, fluid movements',
          'Polyvagal: Co-regulation, safe connection',
          'IFS: Witness exiles with compassion',
          'Constellation: Honor grief for excluded members',
          'Body: Water imagery, tears welcomed, bath/swimming'
        ],
        frameworks: ['Levine', 'Polyvagal', 'IFS', 'Family Constellation'],
        rationale: 'Bring healthy water - emotional flow without flooding',
        timeframe
      },
      air: {
        element: 'air',
        category: 'Breath & Movement',
        practices: [
          'Somatic: Breath work, gentle shaking',
          'Polyvagal: Rhythm, pacing, regulated breathing',
          'ACT: Defusion practices (thoughts as clouds)',
          'Gestalt: Awareness of breath and space',
          'Body: Walking, dancing, tai chi'
        ],
        frameworks: ['Levine', 'Polyvagal', 'ACT', 'Gestalt'],
        rationale: 'Bring healthy air - clear thinking and movement',
        timeframe
      },
      earth: {
        element: 'earth',
        category: 'Grounding & Embodiment',
        practices: [
          'Somatic: Orientation (look around room), feel feet on floor',
          'Polyvagal: Grounding through gravity, weighted blanket',
          'Levine: Titration (tiny steps), pendulation',
          'IFS: Bring parts into body awareness',
          'Body: Yoga, tree pose, feel weight of body'
        ],
        frameworks: ['Levine', 'Polyvagal', 'IFS', 'Somatic'],
        rationale: 'Bring healthy earth - grounding without freezing',
        timeframe
      },
      aether: {
        element: 'aether',
        category: 'Witness & Integration',
        practices: [
          'IFS: Cultivate Self energy (witness)',
          'Gestalt: Awareness practice (notice without judgment)',
          'Jung: Active imagination, dreamwork',
          'Alchemy: Hold paradox, integration of opposites',
          'Meditation: Open awareness, spacious presence'
        ],
        frameworks: ['IFS', 'Gestalt', 'Jung', 'Alchemy'],
        rationale: 'Bring healthy aether - witness without dissociation',
        timeframe
      }
    };

    return interventionMap[element];
  }

  /**
   * Generate long-term integration intervention
   */
  private generateIntegrationIntervention(profile: ElementalProfile): ElementalIntervention {
    return {
      element: 'aether',
      category: 'Long-term Integration',
      practices: [
        'Track elemental balance over time',
        'Notice which elements arise in which situations',
        'Develop capacity to shift elements consciously',
        'Integrate all five elements into wholeness',
        'Cultivate elemental wisdom'
      ],
      frameworks: ['Alchemy', 'Spiralogic', 'IFS', 'Gestalt'],
      rationale: 'Long-term: Develop elemental fluidity and integration',
      timeframe: 'ongoing'
    };
  }

  // ==========================================================================
  // PRIORITY & CAUTIONS
  // ==========================================================================

  /**
   * Determine priority order for interventions
   */
  private determinePriorityOrder(
    profile: ElementalProfile,
    signature?: TransformationSignature
  ): string[] {
    const priority: string[] = [];

    // If critical urgency, prioritize safety/grounding
    if (signature?.urgency === 'critical') {
      priority.push('IMMEDIATE: Safety and nervous system regulation');
    }

    // Primary balancing
    priority.push(`PRIMARY: Apply ${profile.balancingElement} to balance ${profile.primary.element}`);

    // Secondary if present
    if (profile.secondary) {
      const secondaryBalancing = this.determineBalancingElement(
        profile.secondary.element,
        profile.secondary.balance
      );
      priority.push(`SECONDARY: Apply ${secondaryBalancing} to balance ${profile.secondary.element}`);
    }

    // Integration
    priority.push('ONGOING: Elemental integration and fluidity');

    return priority;
  }

  /**
   * Generate caution notes
   */
  private generateCautionNotes(profile: ElementalProfile): string[] {
    const cautions: string[] = [];

    // Fire cautions
    if (profile.fire.balance === 'excess' && profile.fire.level > 0.8) {
      cautions.push('⚠️ High fire - avoid activation practices until cooled');
    }

    // Water cautions
    if (profile.water.balance === 'excess' && profile.water.level > 0.8) {
      cautions.push('⚠️ Emotional flooding risk - titrate carefully, provide containment');
    }

    // Air cautions
    if (profile.air.balance === 'excess' && profile.air.level > 0.8) {
      cautions.push('⚠️ High anxiety - grounding essential before any mental work');
    }

    // Earth cautions
    if (profile.earth.balance === 'excess' && profile.earth.level > 0.8) {
      cautions.push('⚠️ Deep freeze - go very slowly, prioritize safety and co-regulation');
    }

    // Aether cautions
    if (profile.aether.balance === 'excess' && profile.aether.level > 0.8) {
      cautions.push('⚠️ Dissociation risk - bring back to body gently, avoid spiritual bypass');
    }

    return cautions;
  }

  /**
   * Describe expected outcome
   */
  private describeExpectedOutcome(profile: ElementalProfile): string {
    const element = profile.primary.element;
    const balance = profile.primary.balance;
    const balancing = profile.balancingElement;

    if (balance === 'excess') {
      return `Applying ${balancing} will reduce excess ${element}, bringing system back to elemental balance. Expect gradual cooling/grounding/calming of the ${element} state.`;
    } else if (balance === 'deficient') {
      return `Applying ${balancing} will replenish deficient ${element}, restoring vitality and function. Expect gradual activation/flow/structure to return.`;
    }

    return 'System already in elemental balance. Focus on maintaining equilibrium.';
  }
}

// Export singleton instance
export const elementalBalanceEngine = new ElementalBalanceEngineClass();
